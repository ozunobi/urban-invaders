import React from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { useAppData, type AppNotification } from '../components/AppDataContext';

export default function Notifications() {
  const router = useRouter();
  const { notifications, dataError } = useAppData();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme === 'dark');

  return (
    <View style={styles.container}>
      <FlatList<AppNotification>
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.message}>{dataError || 'No notifications yet.'}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <SymbolView
                name={item.kind === 'comment' ? { android: 'comment', web: 'comment' } : item.kind === 'report' ? { android: 'location_on', web: 'location_on' } : item.kind === 'achievement' ? { android: 'emoji_events', web: 'emoji_events' } : { android: 'notifications', web: 'notifications' }}
                size={24}
                tintColor={item.kind === 'achievement' ? '#FFD700' : '#EC6425'}
              />
              <Text numberOfLines={1} style={styles.title}>
                {item.title}
              </Text>
              <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.message}>{item.message}</Text>

            <View style={styles.cardFooter}>
              <Pressable
                accessibilityLabel={`Open notification: ${item.title}`}
                accessibilityRole="button"
                onPress={() => router.navigate(item.kind === 'report' ? '/heatmap' : item.kind === 'achievement' ? '/achievements' : '/home')}
                style={({ pressed }) => [
                  styles.openButton,
                  pressed && styles.openButtonPressed,
                ]}
              >
                <Text style={styles.openButtonText}>Open</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(theme: typeof Colors.light, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContent: {
      padding: 16,
      paddingBottom: 24,
      gap: 14,
    },
    card: {
      minHeight: 176,
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#b7b7b7',
      backgroundColor: isDark ? '#242424' : '#fff',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      color: '#006A63'
    },
    title: {
      flex: 1,
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 16,
    },
    timestamp: {
      fontFamily: 'PPMoriBold',
      color: isDark ? '#C3C3C3' : '#006A63',
      fontSize: 12,
      backgroundColor: '#E8F7F4',
      padding: 7,
      borderRadius: 16,
    },
    message: {
      marginTop: 16,
      marginBottom: 16,
      color: theme.text,
      fontSize: 15,
      lineHeight: 21,
    },
    cardFooter: {
      minHeight: 42,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    openButton: {
      width: 80,
      height: 35,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: 15,
      backgroundColor: '#006A63',
    },
    openButtonPressed: {
      opacity: 0.8,
    },
    openButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
  });
}
