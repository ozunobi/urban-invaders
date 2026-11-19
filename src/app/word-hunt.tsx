import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { useAppData } from '../components/AppDataContext';

const TARGET_WORD = 'SNAIL';
const MAX_GUESSES = 6;

type TileStatus = 'correct' | 'present' | 'absent';
type GuessRow = {
  word: string;
  results: TileStatus[];
};

function scoreGuess(guess: string): TileStatus[] {
  const results: TileStatus[] = Array(TARGET_WORD.length).fill('absent');
  const remainingLetters: Record<string, number> = {};

  for (let index = 0; index < TARGET_WORD.length; index += 1) {
    if (guess[index] === TARGET_WORD[index]) {
      results[index] = 'correct';
    } else {
      const letter = TARGET_WORD[index];
      remainingLetters[letter] = (remainingLetters[letter] ?? 0) + 1;
    }
  }

  for (let index = 0; index < TARGET_WORD.length; index += 1) {
    if (results[index] === 'correct') continue;

    const letter = guess[index];
    if ((remainingLetters[letter] ?? 0) > 0) {
      results[index] = 'present';
      remainingLetters[letter] -= 1;
    }
  }

  return results;
}

export default function WordHunt() {
  const { games, saveGame, dataReady, dataError, userId } = useAppData();
  const loadedUser = useRef<string | null>(null);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const styles = createStyles();

  useEffect(() => {
    if (!dataReady || !userId || loadedUser.current === userId) return;
    loadedUser.current = userId;
    const savedWords = games['word-hunt']?.state.words;
    const words = Array.isArray(savedWords) ? savedWords.filter((word): word is string => typeof word === 'string' && word.length === TARGET_WORD.length).slice(0, MAX_GUESSES) : [];
    const won = words.includes(TARGET_WORD);
    setGuesses(words.map((word) => ({ word, results: scoreGuess(word) })));
    setIsWon(won);
    setIsComplete(won || words.length === MAX_GUESSES);
    setGuess('');
    setFeedback('');
  }, [dataReady, games, userId]);

  const submitGuess = async () => {
    if (!dataReady || isSaving) return;
    if (isComplete) {
      setIsSaving(true);
      try {
        await saveGame('word-hunt', { words: [] }, false);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Unable to save progress.');
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
      setGuesses([]);
      setGuess('');
      setFeedback('');
      setIsComplete(false);
      setIsWon(false);
      return;
    }

    const word = guess.trim().toUpperCase();
    if (word.length !== TARGET_WORD.length) {
      setFeedback('Enter a 5-letter word to make a guess.');
      return;
    }

    Keyboard.dismiss();
    const nextGuesses = [...guesses, { word, results: scoreGuess(word) }];
    const won = word === TARGET_WORD;
    const finished = won || nextGuesses.length === MAX_GUESSES;

    setIsSaving(true);
    try {
      await saveGame('word-hunt', { words: nextGuesses.map((item) => item.word) }, finished);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save progress.');
      setIsSaving(false);
      return;
    }
    setIsSaving(false);

    setGuesses(nextGuesses);
    setGuess('');
    setIsWon(won);
    setIsComplete(finished);
    setFeedback(
      won
        ? 'You found the hidden word!'
        : finished
          ? `The hidden word was ${TARGET_WORD}.`
          : '',
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Guess the hidden 5-letter word in six tries.
      </Text>
      <View style={styles.hintCard}>
        <Text style={styles.hintLabel}>THIS WEEK'S SPECIES</Text>
        <Text style={styles.hintText}>
          Green tiles are in the right place. Gold tiles belong elsewhere.
        </Text>
      </View>

      <View style={styles.board}>
        {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
          const submitted = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length && !isComplete;
          const currentWord = isCurrentRow ? guess : '';

          return (
            <View key={rowIndex} style={styles.tileRow}>
              {Array.from({ length: TARGET_WORD.length }, (_, letterIndex) => {
                const letter =
                  submitted?.word[letterIndex] ?? currentWord[letterIndex] ?? '';
                const status = submitted?.results[letterIndex];

                return (
                  <View
                    key={letterIndex}
                    style={[
                      styles.tile,
                      status === 'correct' && styles.correctTile,
                      status === 'present' && styles.presentTile,
                      status === 'absent' && styles.absentTile,
                      letter.length > 0 && !status && styles.activeTile,
                    ]}
                  >
                    <Text style={styles.tileLetter}>{letter}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.attemptLabel}>
          {isComplete
            ? isWon
              ? `Solved in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}`
              : 'No guesses remaining'
            : `GUESS ${guesses.length + 1} OF ${MAX_GUESSES}`}
        </Text>
        <TextInput
          accessibilityLabel="Enter a five-letter guess"
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isComplete}
          maxLength={TARGET_WORD.length}
          onChangeText={(text) => {
            setGuess(text.replace(/[^a-z]/gi, '').toUpperCase());
            setFeedback('');
          }}
          onSubmitEditing={submitGuess}
          placeholder="Type a 5-letter word"
          placeholderTextColor="#82776F"
          returnKeyType="go"
          style={styles.input}
          value={guess}
        />
        {!!(feedback || dataError) && (
          <Text style={styles.feedback} accessibilityLiveRegion="polite">
            {feedback || dataError}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={!dataReady || isSaving}
          onPress={submitGuess}
          style={styles.submitButton}
        >
          <Text style={styles.submitLabel}>
            {isComplete ? 'Play again' : 'Submit guess'}
          </Text>
        </Pressable>
      </View>
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
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 32,
    },
    intro: {
      alignSelf: 'stretch',
      color: '#514B46',
      fontFamily: 'PPMori',
      fontSize: 14,
      textAlign: 'center',
    },
    hintCard: {
      alignSelf: 'stretch',
      marginTop: 16,
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#FCE1D2',
    },
    hintLabel: {
      color: '#B94417',
      fontFamily: 'PPMoriBold',
      fontSize: 10,
      letterSpacing: 0.8,
    },
    hintText: {
      marginTop: 4,
      color: '#514B46',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
    board: {
      gap: 7,
      marginTop: 24,
    },
    tileRow: {
      flexDirection: 'row',
      gap: 6,
    },
    tile: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#D9D0C8',
      borderRadius: 6,
      backgroundColor: '#fff',
    },
    activeTile: {
      borderColor: '#82776F',
    },
    correctTile: {
      borderColor: '#006A63',
      backgroundColor: '#006A63',
    },
    presentTile: {
      borderColor: '#D49A2A',
      backgroundColor: '#D49A2A',
    },
    absentTile: {
      borderColor: '#514B46',
      backgroundColor: '#514B46',
    },
    tileLetter: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 22,
    },
    inputSection: {
      alignSelf: 'stretch',
      marginTop: 24,
    },
    attemptLabel: {
      marginBottom: 8,
      color: '#766F69',
      fontFamily: 'PPMoriBold',
      fontSize: 10,
      letterSpacing: 0.8,
      textAlign: 'center',
    },
    input: {
      height: 48,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: '#D9D0C8',
      borderRadius: 10,
      backgroundColor: '#fff',
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 16,
      letterSpacing: 2,
      textAlign: 'center',
    },
    feedback: {
      marginTop: 9,
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
      textAlign: 'center',
    },
    submitButton: {
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      borderRadius: 23,
      backgroundColor: '#006A63',
    },
    submitLabel: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
  });
}
