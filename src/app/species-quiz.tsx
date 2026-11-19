import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { useAppData } from '../components/AppDataContext';

const QUESTIONS = [
  'Cane toad',
  'Finlaysons squirrel',
  'Golden apple snail',
  'Water hyacinth',
  'Nile tilapia',
];

const QUESTION_IMAGES = [
  require('./assets/images/cane-toad.jpg'),
  require('./assets/images/finlaysons-squirrel.jpg'),
  require('./assets/images/golden-apple-snail.jpg'),
  require('./assets/images/water-hyacinth.jpg'),
  require('./assets/images/nile-tilapia.jpg'),
];

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function SpeciesQuiz() {
  const { games, saveGame, dataReady, dataError, userId } = useAppData();
  const loadedUser = useRef<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const styles = createStyles();

  useEffect(() => {
    if (!dataReady || !userId || loadedUser.current === userId) return;
    loadedUser.current = userId;
    const saved = games['species-quiz']?.state;
    setQuestionIndex(typeof saved?.questionIndex === 'number' ? Math.max(0, Math.min(QUESTIONS.length - 1, saved.questionIndex)) : 0);
    setScore(typeof saved?.score === 'number' ? saved.score : 0);
    setIsAnswered(saved?.isAnswered === true);
    setIsComplete(saved?.isComplete === true);
    setAnswer('');
    setFeedback('');
  }, [dataReady, games, userId]);

  const persist = async (next: { questionIndex: number; score: number; isAnswered: boolean; isComplete: boolean }) => {
    setIsSaving(true);
    try {
      await saveGame('species-quiz', next, next.isComplete);
      return true;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save progress.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const submitAnswer = async () => {
    if (!dataReady || isSaving) return;
    if (isComplete) {
      if (!await persist({ questionIndex: 0, score: 0, isAnswered: false, isComplete: false })) return;
      setQuestionIndex(0);
      setAnswer('');
      setScore(0);
      setFeedback('');
      setIsAnswered(false);
      setIsComplete(false);
      return;
    }

    if (isAnswered) {
      if (questionIndex === QUESTIONS.length - 1) {
        if (!await persist({ questionIndex, score, isAnswered: true, isComplete: true })) return;
        setIsComplete(true);
      } else {
        if (!await persist({ questionIndex: questionIndex + 1, score, isAnswered: false, isComplete: false })) return;
        setQuestionIndex((index) => index + 1);
        setAnswer('');
        setFeedback('');
        setIsAnswered(false);
      }
      return;
    }

    if (!answer.trim()) {
      setFeedback('Enter a species name first.');
      return;
    }

    if (normalizeAnswer(answer) === normalizeAnswer(QUESTIONS[questionIndex])) {
      if (!await persist({ questionIndex, score: score + 1, isAnswered: true, isComplete: false })) return;
      setScore((value) => value + 1);
      setFeedback('Correct! Nice spotting.');
      setIsAnswered(true);
    } else {
      setFeedback('Not quite. Try another name.');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.progressRow}>
        <Text style={styles.quizEyebrow}>SPECIES QUIZ</Text>
        <Text style={styles.questionCount}>
          {isComplete ? 'COMPLETE' : `QUESTION ${questionIndex + 1} OF ${QUESTIONS.length}`}
        </Text>
      </View>

      <Text style={styles.prompt}>What invasive species is this?</Text>

      {isComplete ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Quiz complete!</Text>
          <Text style={styles.resultScore}>
            You got {score} of {QUESTIONS.length} correct.
          </Text>
        </View>
      ) : (
        <Image
          accessibilityLabel={`Image of ${QUESTIONS[questionIndex]}`}
          source={QUESTION_IMAGES[questionIndex]}
          contentFit="cover"
          style={styles.questionImage}
        />
      )}

      {!isComplete && (
        <View style={styles.answerSection}>
          <TextInput
            accessibilityLabel="Enter the invasive species name"
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isAnswered}
            onChangeText={(text) => {
              setAnswer(text);
              setFeedback('');
            }}
            onSubmitEditing={submitAnswer}
            placeholder="Type your answer"
            placeholderTextColor="#82776F"
            returnKeyType="done"
            style={styles.answerInput}
            value={answer}
          />
          {!!(feedback || dataError) && (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.feedback,
                feedback.startsWith('Correct') && styles.correctFeedback,
              ]}
            >
              {feedback || dataError}
            </Text>
          )}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={!dataReady || isSaving}
        onPress={submitAnswer}
        style={styles.submitButton}
      >
        <Text style={styles.submitLabel}>
          {isComplete
            ? 'Play again'
            : isAnswered
              ? questionIndex === QUESTIONS.length - 1
                ? 'See results'
                : 'Next question'
              : 'Submit answer'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#FFF7F0',
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 30,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    quizEyebrow: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 11,
      letterSpacing: 0.8,
    },
    questionCount: {
      color: '#766F69',
      fontFamily: 'PPMoriBold',
      fontSize: 10,
    },
    prompt: {
      marginTop: 18,
      marginBottom: 16,
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 22,
      textAlign: 'center',
    },
    questionImage: {
      width: '100%',
      height: 320,
      borderRadius: 18,
      backgroundColor: '#DFEFEB',
    },
    answerSection: {
      marginTop: 18,
    },
    answerInput: {
      height: 50,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: '#D9D0C8',
      borderRadius: 10,
      backgroundColor: '#fff',
      color: '#201C18',
      fontFamily: 'PPMori',
      fontSize: 15,
    },
    feedback: {
      marginTop: 9,
      color: '#B94417',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    correctFeedback: {
      color: '#006A63',
    },
    submitButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 14,
      borderRadius: 24,
      backgroundColor: '#006A63',
    },
    submitLabel: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
    resultCard: {
      height: 320,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
      backgroundColor: '#DFEFEB',
    },
    resultTitle: {
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 24,
    },
    resultScore: {
      marginTop: 8,
      color: '#514B46',
      fontFamily: 'PPMori',
      fontSize: 15,
    },
  });
}
