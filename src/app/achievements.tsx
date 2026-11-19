import React from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View, } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { useAppData } from '../components/AppDataContext';
import { getAchievements } from '../constants/AchieveList';

export default function Achievements() {
  const { profile, userId, posts, reports, games, dataError } = useAppData();
  const achievements = getAchievements(reports.filter((report) => report.user_id === userId).length, posts.filter((post) => post.userId === userId).length, Object.values(games).filter((game) => game.completed).length);
  const earned = achievements.filter((achievement) => achievement.earned);
  const upcoming = achievements.filter((achievement) => !achievement.earned);
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(theme, isDark);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Image
              source={require('./assets/icons/favicon-3.png')}
              contentFit="contain"
              style={styles.summaryImage}
            />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.username}>{profile.username}</Text>
            <Text style={styles.summaryTitle}>{earned.length} of {achievements.length} unlocked</Text>
          </View>
        </View>
        <View
          accessibilityLabel={`${earned.length} of ${achievements.length} achievements unlocked`}
          style={styles.summaryTrack}
        >
          <View style={[styles.summaryFill, { width: `${earned.length / achievements.length * 100}%` }]} />
        </View>
        <Text style={styles.summaryCaption}>
          Every sighting helps your community.
        </Text>
      </View>
      {!!dataError && <Text style={styles.summaryCaption}>{dataError}</Text>}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>EARNED</Text>
      </View>

      <View style={styles.earnedGrid}>
        {earned.map((achievement) => (
          <View key={achievement.title} style={styles.earnedItem}>
            <View style={styles.earnedIcon}>
              <SymbolView name={achievement.icon} size={40} tintColor="#006A63" />
              <View style={styles.checkBadge}>
                <SymbolView
                  name={{ android: 'check', web: 'check' }}
                  size={15}
                  tintColor="#fff"
                />
              </View>
            </View>
            <Text style={styles.earnedTitle}>{achievement.title}</Text>
            <Text style={styles.earnedDetail}>{achievement.progressLabel}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.sectionHeading, styles.upNextHeading]}>
        <Text style={styles.sectionTitle}>UP NEXT</Text>
      </View>

      <View style={styles.upcomingList}>
        {upcoming.map((achievement) => (
          <View key={achievement.title} style={styles.upcomingCard}>
            <View style={styles.lockedIcon}>
              <SymbolView name={achievement.icon} size={32} tintColor={isDark ? '#B9B2AD' : '#766F69'} />
              <View style={styles.lockBadge}>
                <SymbolView
                  name={{ android: 'lock', web: 'lock' }}
                  size={13}
                  tintColor="#fff"
                />
              </View>
            </View>
            <View style={styles.upcomingCopy}>
              <Text style={styles.upcomingTitle}>{achievement.title}</Text>
              <Text style={styles.upcomingDescription}>
                {achievement.description}
              </Text>
              <View
                accessibilityLabel={`${achievement.title}: ${achievement.progressLabel}`}
                style={styles.progressTrack}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: `${achievement.progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {achievement.progressLabel}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Link href="/games" asChild>
        <Pressable accessibilityRole="link" style={styles.gamesBanner}>
          <Image
            source={require('./assets/images/bg.png')}
            contentFit="cover"
            style={styles.gamesIcon}
          />
          <View style={styles.gamesCopy}>
            <Text style={styles.gamesTitle}>Keep your discoveries going</Text>
            <Text style={styles.gamesSubtitle}>
              Play this week’s wildlife games
            </Text>
          </View>
          <SymbolView
            name={{ android: 'chevron_right', web: 'chevron_right' }}
            size={22}
            tintColor="#006A63"
          />
        </Pressable>
      </Link>
    </ScrollView>
  );
}

function createStyles(theme: typeof Colors.light, isDark: boolean) {
  const secondaryText = isDark ? '#B9B2AD' : '#766F69';
  const surface = isDark ? '#242424' : '#FFFFFF';

return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 28,
    },
    summaryCard: {
      padding: 18,
      borderRadius: 18,
      backgroundColor: '#201C18',
    },
    summaryRow: {
      minHeight: 82,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    summaryIcon: {
      width: 76,
      height: 76,
      overflow: 'hidden',
      borderRadius: 38,
      backgroundColor: '#514B46',
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryImage: {
      width: 44,
      height: 44,
    },
    summaryCopy: {
      flex: 1,
      gap: 5,
    },
    username: {
      color: '#D5CCC5',
      fontSize: 16,
    },
    summaryTitle: {
      color: '#FFF7F0',
      fontFamily: 'PPMoriBold',
      fontSize: 24,
    },
    summaryTrack: {
      height: 9,
      marginTop: 14,
      overflow: 'visible',
      borderRadius: 5,
      backgroundColor: '#514B46',
    },
    summaryFill: {
      width: '50%',
      height: '100%',
      borderRadius: 5,
      backgroundColor: '#EC6425',
    },
    summaryCaption: {
      marginTop: 12,
      color: '#FFF7F0',
      fontSize: 16,
    },
    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 14,
    },
    sectionTitle: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 20,
    },
    earnedGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    earnedItem: {
      flex: 1,
      alignItems: 'center',
      minWidth: 0,
    },
    earnedIcon: {
      width: 88,
      height: 88,
      overflow: 'visible',
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#203936' : '#DFEFEB',
    },
    checkBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.background,
      backgroundColor: '#006A63',
    },
    earnedTitle: {
      marginTop: 10,
      color: theme.text,
      fontFamily: 'PPMoriBold',
      fontSize: 15,
      textAlign: 'center',
    },
    earnedDetail: {
      marginTop: 3,
      color: secondaryText,
      fontSize: 13,
      textAlign: 'center',
    },
    upNextHeading: {
      marginTop: 26,
    },
    upcomingList: {
      gap: 12,
    },
    upcomingCard: {
      minHeight: 136,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor: surface,
    },
    lockedIcon: {
      width: 72,
      height: 72,
      overflow: 'visible',
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#504A46' : '#E8E1DB',
    },
    lockBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 26,
      height: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      borderWidth: 2,
      borderColor: surface,
      backgroundColor: secondaryText,
    },
    upcomingCopy: {
      flex: 1,
      gap: 5,
    },
    upcomingTitle: {
      color: theme.text,
      fontFamily: 'PPMoriBold',
      fontSize: 20,
    },
    upcomingDescription: {
      color: secondaryText,
      fontSize: 15,
    },
    progressTrack: {
      height: 8,
      marginTop: 3,
      overflow: 'hidden',
      borderRadius: 4,
      backgroundColor: isDark ? '#504A46' : '#E8E1DB',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: '#006A63',
    },
    progressLabel: {
      color: '#006A63',
      fontSize: 14,
    },
    gamesBanner: {
      minHeight: 96,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginTop: 22,
      paddingHorizontal: 18,
      borderRadius: 20,
      backgroundColor: isDark ? '#203936' : '#DFEFEB',
    },
    gamesCopy: {
      flex: 1,
      gap: 4,
    },
    gamesIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    gamesTitle: {
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 17,
    },
    gamesSubtitle: {
      color: '#006A63',
      fontSize: 14,
    },
  });
}
