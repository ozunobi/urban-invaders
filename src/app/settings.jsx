import { useState } from 'react';
import { useClerk } from '@clerk/expo';
import { FlatList, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { SETTINGS_ITEMS } from '../constants/SettingsList';
import { useLanguage } from '../components/LanguageContext';

export default function Settings() {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme === 'dark');
  const { t } = useLanguage();
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setSignOutError('');
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const renderSection = ({ item: section }) => (
    <View>
      <Text style={styles.text}>{section.title.toUpperCase()}</Text>
      {section.items.map((item) => {
        const rowContent = (
          <>
            <SymbolView
              name={item.icon}
              size={22}
              tintColor={theme.icon}
              style={styles.itemIcon}
            />
            <Text style={styles.title}>{item.title}</Text>
          </>
        );

        return item.href ? (
          <Pressable
            accessibilityRole="link"
            key={item.id}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            <SymbolView
              name={item.icon}
              size={22}
              tintColor={theme.icon}
              style={styles.itemIcon}
            />
            <Text style={styles.title}>{item.title}</Text>
          </Pressable>
        ) : (
          <View key={item.id} style={styles.item}>
            {rowContent}
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.listContainer}
        data={SETTINGS_ITEMS}
        keyExtractor={(section) => section.title}
        renderItem={renderSection}
        ListFooterComponent={
          <View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSigningOut }}
              disabled={isSigningOut}
              onPress={handleSignOut}
              style={styles.linkButton}
            >
              <Text style={styles.link}>{isSigningOut ? t('settings.logging_out') : t('settings.log_out')}</Text>
            </Pressable>
            {!!signOutError && <Text accessibilityRole="alert" style={styles.error}>{signOutError}</Text>}
          </View>
        }
      />
    </SafeAreaView>
  );
}

function createStyles(theme, isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 13,
    },
    itemPressed: {
      opacity: 0.75,
    },
    itemIcon: {
      marginRight: 12,
    },
    title: {
      color: theme.text,
      fontSize: 20,
    },

    text: {
      fontFamily: 'PPMoriBold',
      color: '#EC6425',
      fontSize: 25,
      textAlign: 'left',
      alignSelf: 'flex-start',
      paddingHorizontal: 18,
      paddingVertical: 10,
    },

    link: {
      color: '#EC6425',
      fontSize: 25,
      textDecorationLine: 'underline',
    },
    linkButton: {
      alignSelf: 'center',
      paddingVertical: 18,
      paddingBottom: 30,
    },
    error: {
      color: '#E74C3C',
      textAlign: 'center',
      paddingHorizontal: 18,
      marginBottom: 10,
    },
  });
}
