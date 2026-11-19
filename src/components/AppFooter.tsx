import React from 'react';
import { Link, usePathname } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { useLanguage } from './LanguageContext';

const FOOTER_ROUTES = new Set([ '/games', '/home','/heatmap', '/achievements', '/notification', '/profile']);

export default function AppFooter() {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { t } = useLanguage();

  if (!FOOTER_ROUTES.has(pathname)) {
    return null;
  }

  const styles = createStyles(theme);
  const activeColor = '#EC6425';

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.bar}>

        <Link href="/home" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Home"
          style={styles.navItem}
        >
          <SymbolView
            name={{ android: 'home', web: 'home' }}
            size={22}
            tintColor={'#ffffff'}
          />
          <Text style={styles.label}>{t('footer.home')}</Text>
        </Pressable>
        </Link>
        
        <Link href="/settings" asChild>
          <Pressable style={styles.navItem}>
            <SymbolView
              name={{ android: 'settings', web: 'settings' }}
              size={22}
              tintColor = {'#ffffff' }
            />
            <Text style={styles.label}>{t('footer.settings')}</Text>
          </Pressable>

        </Link>

        <Link href="/form" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report a sighting"
            style={styles.navItem}
          >
            <View style={styles.reportButton}>
              <Image
                source={require('../app/assets/icons/report-button.png')}
                contentFit="contain"
                style={styles.reportIcon}
              />
            </View>
            <Text style={styles.label}>{t('footer.report')}</Text>
          </Pressable>
        </Link>

        <Link href="/heatmap" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Map"
            style={styles.navItem}
          >
            <SymbolView
              name={{ android: 'map', web: 'map' }}
              size={22}
              tintColor={'#ffffff'}
            />
            <Text style={styles.label}>{t('footer.map')}</Text>
          </Pressable>
        </Link>

        <Link href="/notification" asChild>
          <Pressable accessibilityRole="button" style={styles.navItem}>
            <SymbolView
              name={{ android: 'notifications', web: 'notifications' }}
              size={22}
              tintColor={'#ffffff'}
            />
            <Text style={styles.label}>{t('footer.notifications')}</Text>
          </Pressable>
        </Link>

      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: '#201C18',
    },
    bar: {
      height: 90,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 4,
      overflow: 'visible',
      backgroundColor: '#201C18',
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    label: {
      color: '#fff',
      fontSize: 10,
      textAlign: 'center',
    },
    activeLabel: {
      color: '#EC6425',
    },
    reportButton: {
      width: 58,
      height: 58,
      marginTop: -35,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EC6425',
      borderWidth: 3,
    },
    reportIcon: {
      width: 30,
      height: 30,
    },
  });
}
