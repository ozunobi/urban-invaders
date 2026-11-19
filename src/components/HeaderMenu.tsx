import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { MENU_ITEMS } from '../constants/MenuList';
import { useAppData } from './AppDataContext';
import { useLanguage } from './LanguageContext';

// Global state for modal - this is a workaround for modal issues in headers
let globalMenuState: { isOpen: boolean; setIsOpen: (val: boolean) => void } | null = null;

export function setGlobalMenuOpen(value: boolean) {
  if (globalMenuState) {
    globalMenuState.setIsOpen(value);
  }
}

export default function HeaderMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  // Store state globally so it can be accessed from outside
  React.useEffect(() => {
    globalMenuState = { isOpen, setIsOpen };
    return () => {
      globalMenuState = null;
    };
  }, [isOpen]);

  let profile = null;
  
  try {
    const appData = useAppData();
    profile = appData.profile;
  } catch (e) {
    // AppDataContext not available yet (e.g., on login/signup screens)
    profile = { username: 'Guest', avatarUri: null, emailAddress: '', about: '' };
  }

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme);

  const handleMenuItemPress = (href: string) => {
    console.log('Navigating to:', href);
    setIsOpen(false);
    router.push(href as any);
  };

  return (
    <>
      <Pressable
        accessibilityLabel="Open navigation menu"
        accessibilityRole="button"
        hitSlop={15}
        onPress={() => {
          console.log('Menu button pressed, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        style={({ pressed }) => [
          styles.headerButton,
          pressed && { opacity: 0.6 }
        ]}
      >
        <SymbolView
          name={{ android: 'menu', web: 'menu' }}
          size={25}
          tintColor="#fff"
        />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          console.log('Modal close requested');
          setIsOpen(false);
        }}
        transparent
        visible={isOpen}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
      >
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityLabel="Close navigation menu"
            accessibilityRole="button"
            onPress={() => {
              console.log('Overlay pressed');
              setIsOpen(false);
            }}
            style={styles.overlay}
          />
          <SafeAreaView edges={['top', 'bottom']} style={styles.drawer}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                console.log('Profile pressed');
                setIsOpen(false);
                router.push('/profile');
              }}
              style={styles.greeting}
            >
              <View style={styles.profileIcon}>
                {profile?.avatarUri ? (
                  <Image
                    source={{ uri: profile.avatarUri }}
                    contentFit="cover"
                    style={styles.profileImage}
                  />
                ) : (
                  <SymbolView
                    name={{ android: 'person', web: 'person' }}
                    size={24}
                    tintColor="#fff"
                  />
                )}
              </View>
              <Text style={styles.greetingText} numberOfLines={1} adjustsFontSizeToFit>{t('menu.hello')}, {profile?.username || 'Guest'}</Text>
            </Pressable>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{t('menu.menu')}</Text>
            </View>

            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                onPress={() => handleMenuItemPress(item.href as string)}
                style={styles.menuItem}
              >
                <Image
                  source={item.image}
                  contentFit="cover"
                  contentPosition="bottom"
                  style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                />
                <View pointerEvents="none" style={[styles.imageOverlay, { borderRadius: 10 }]} />
                <View pointerEvents="none" style={styles.menuItemContent}>
                  <Text style={styles.menuLabel}>{item.title}</Text>
                </View>
              </Pressable>
            ))}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

function createStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    headerButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      marginRight: 8,
      zIndex: 1000,
    },
    modalContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      zIndex: 999,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
      width: '75%',
      maxWidth: 360,
      backgroundColor: '#EC6425',
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 6,
    },
    greeting: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    profileIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    greetingText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 16,
      padding: 8,
      flex: 1,
      flexWrap: 'wrap',
    },
    drawerHeader: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    drawerTitle: {
      color: 'white',
      fontFamily: 'PPMoriBold',
      fontSize: 25,
    },
    menuItem: {
      width: '100%',
      height: 100,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: 10,
      marginBottom: 10,
      overflow: 'hidden',
    },
    imageOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuItemContent: {
      flex: 1,
      flexDirection: 'row',
      borderRadius: 10,
      gap: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    menuLabel: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 18,
    },
  });
}
