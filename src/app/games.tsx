import React from 'react';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useAppData } from '../components/AppDataContext';

const WORD_HUNT_PREVIEW = [
  { word: '?????', correct: true },
  { word: 'GUESS', correct: false },
];

export default function WeeklyGames() {
  const { games, dataError } = useAppData();
  const completed = Object.values(games).filter((game) => game.completed).length;
  const styles = createStyles();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      <View style={styles.weekRow}>
        <Text style={styles.weekDate}>YOUR GAMES</Text>
      </View>
      <Text style={styles.intro}>
        Know your wildlife. Take on this week's games.
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeading}>
          <Text style={styles.progressLabel}>{completed} of 2 games completed</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completed / 2 * 100}%` }]} />
        </View>
      </View>
      {!!dataError && <Text style={styles.intro}>{dataError}</Text>}

      <Link href="/word-hunt" asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Continue Hidden Invaders word hunt"
          style={styles.wordCard}
        >
          <View style={styles.wordCardTop}>
            <Text style={styles.eyebrow}>WORD HUNT</Text>
            <Text style={styles.inProgress}>{games['word-hunt']?.completed ? 'Completed' : games['word-hunt'] ? 'In progress' : 'Not started'}</Text>
          </View>
          <Text style={styles.wordTitle}>Hidden invaders</Text>
          <Text style={styles.wordDescription}>
            Find the species hiding in the letters.
          </Text>

          <View style={styles.wordPreviewRow}>
            <View style={styles.previewWords}>
              {WORD_HUNT_PREVIEW.map(({ word, correct }) => (
                <View key={word} style={styles.previewWord}>
                  {word.split('').map((letter, index) => (
                    <View
                      key={`${word}-${index}`}
                      style={[
                        styles.previewTile,
                        correct ? styles.previewCorrect : styles.previewUnused,
                      ]}
                    >
                      <Text style={styles.previewLetter}>{letter}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.wordsFound}>
              <Text style={styles.wordsFoundNumber}>{Array.isArray(games['word-hunt']?.state.words) ? games['word-hunt'].state.words.length : 0} / 6</Text>
              <Text style={styles.wordsFoundLabel}>guesses used</Text>
            </View>
          </View>

          <View style={styles.continueButton}>
            <Text style={styles.continueLabel}>Continue game</Text>
            <SymbolView
              name={{ android: 'arrow_forward', web: 'arrow_forward' }}
              size={18}
              tintColor="#fff"
            />
          </View>
        </Pressable>
      </Link>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>THIS WEEK'S GAMES</Text>
        <Text style={styles.sectionMeta}>Species quiz</Text>
      </View>

      <Link href="/species-quiz" asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Play Who's that invader species quiz"
          style={styles.quizCard}
        >
          <Image
            source={require('./assets/images/finlaysons-squirrel.jpg')}
            contentFit="cover"
            contentPosition="center"
            style={styles.quizImage}
          />
          <View style={styles.quizCopy}>
            <Text style={styles.quizEyebrow}>SPECIES QUIZ - 5 QUESTIONS</Text>
            <Text style={styles.quizTitle}>Who's that invader?</Text>
            <Text style={styles.quizDescription}>Match wildlife to its name.</Text>
            <View style={styles.playQuiz}>
              <Text style={styles.playQuizLabel}>Play quiz</Text>
              <SymbolView
                name={{ android: 'arrow_forward', web: 'arrow_forward' }}
                size={15}
                tintColor="#006A63"
              />
            </View>
          </View>
        </Pressable>
      </Link>

      <Link href="/achievements" asChild>
        <Pressable
          accessibilityRole="link"
          style={styles.achievementsBanner}
        >
          <View style={styles.achievementMark}>
            <SymbolView
              name={{ android: 'workspace_premium', web: 'workspace_premium' }}
              size={21}
              tintColor="#006A63"
            />
          </View>
          <View style={styles.achievementCopy}>
            <Text style={styles.achievementTitle}>Your achievements</Text>
            <Text style={styles.achievementSubtitle}>
              Small discoveries. Big milestones.
            </Text>
          </View>
          <SymbolView
            name={{ android: 'chevron_right', web: 'chevron_right' }}
            size={20}
            tintColor="#006A63"
          />
        </Pressable>
      </Link>
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
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },
    weekRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    weekDate: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 15,
    },
    resetText: {
      color: '#006A63',
      fontFamily: 'PPMori',
      fontSize: 13,
    },
    intro: {
      marginTop: 6,
      marginBottom: 18,
      color: '#514B46',
      fontFamily: 'PPMori',
      fontSize: 15,
    },
    progressCard: {
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: '#FCE1D2',
    },
    progressHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 9,
    },
    progressLabel: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    progressPercent: {
      color: '#766F69',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
    progressTrack: {
      height: 6,
      overflow: 'hidden',
      borderRadius: 3,
      backgroundColor: '#F7C8B0',
    },
    progressFill: {
      width: '33%',
      height: '100%',
      borderRadius: 3,
      backgroundColor: '#006A63',
    },
    wordCard: {
      padding: 18,
      borderRadius: 18,
      backgroundColor: '#201C18',
    },
    wordCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    eyebrow: {
      color: '#D5CCC5',
      fontFamily: 'PPMoriBold',
      fontSize: 11,
    },
    inProgress: {
      color: '#B9B2AD',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
    wordTitle: {
      marginTop: 9,
      color: '#FFF7F0',
      fontFamily: 'PPMoriBold',
      fontSize: 22,
    },
    wordDescription: {
      marginTop: 4,
      color: '#D5CCC5',
      fontFamily: 'PPMori',
      fontSize: 14,
    },
    wordPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
      marginBottom: 14,
    },
    previewWords: {
      gap: 7,
    },
    previewWord: {
      flexDirection: 'row',
      gap: 5,
    },
    previewTile: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
    },
    previewCorrect: {
      backgroundColor: '#006A63',
    },
    previewUnused: {
      backgroundColor: '#514B46',
    },
    previewLetter: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
    wordsFound: {
      alignItems: 'center',
    },
    wordsFoundNumber: {
      color: '#FFF7F0',
      fontFamily: 'PPMoriBold',
      fontSize: 24,
    },
    wordsFoundLabel: {
      color: '#B9B2AD',
      fontFamily: 'PPMori',
      fontSize: 11,
    },
    continueButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderRadius: 24,
      backgroundColor: '#006A63',
    },
    continueLabel: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 15,
    },
    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
      marginBottom: 14,
    },
    sectionTitle: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 15,
    },
    sectionMeta: {
      color: '#82776F',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
    quizCard: {
      minHeight: 132,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 12,
      borderRadius: 16,
      backgroundColor: '#fff',
    },
    quizImage: {
      width: 90,
      height: 106,
      borderRadius: 11,
      backgroundColor: '#DFEFEB',
    },
    quizCopy: {
      flex: 1,
      gap: 3,
    },
    quizEyebrow: {
      color: '#82776F',
      fontFamily: 'PPMori',
      fontSize: 10,
    },
    quizTitle: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 17,
    },
    quizDescription: {
      color: '#766F69',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
    playQuiz: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    playQuizLabel: {
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    achievementsBanner: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 16,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: '#DFEFEB',
    },
    achievementMark: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
      backgroundColor: '#CDE5DF',
    },
    achievementCopy: {
      flex: 1,
      gap: 2,
    },
    achievementTitle: {
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
    achievementSubtitle: {
      color: '#006A63',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
  });
}