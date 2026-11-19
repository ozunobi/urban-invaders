import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { useLanguage } from '../components/LanguageContext';
import type { Language } from '../constants/Translations';

export default function LanguageSettings() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme);
  const { language, setLanguage, t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  const handleLanguageChange = async (newLanguage: Language) => {
    setIsSaving(true);
    try {
      await setLanguage(newLanguage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('language.select')}</Text>
        <Text style={styles.subtitle}>{t('language.current')}</Text>

        <View style={styles.optionsContainer}>
          <Pressable
            disabled={isSaving}
            onPress={() => handleLanguageChange('en')}
            style={({ pressed }) => [
              styles.languageOption,
              language === 'en' && styles.languageOptionActive,
              pressed && styles.languageOptionPressed,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.radio}>
                {language === 'en' && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.languageText,
                  language === 'en' && styles.languageTextActive,
                ]}
              >
                {t('language.english')}
              </Text>
            </View>
            <SymbolView
              name={{ android: 'check_circle', web: 'check_circle' }}
              size={24}
              tintColor={language === 'en' ? '#EC6425' : '#ccc'}
            />
          </Pressable>

          <Pressable
            disabled={isSaving}
            onPress={() => handleLanguageChange('fil')}
            style={({ pressed }) => [
              styles.languageOption,
              language === 'fil' && styles.languageOptionActive,
              pressed && styles.languageOptionPressed,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.radio}>
                {language === 'fil' && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.languageText,
                  language === 'fil' && styles.languageTextActive,
                ]}
              >
                {t('language.filipino')}
              </Text>
            </View>
            <SymbolView
              name={{ android: 'check_circle', web: 'check_circle' }}
              size={24}
              tintColor={language === 'fil' ? '#EC6425' : '#ccc'}
            />
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <SymbolView
            name={{ android: 'info', web: 'info' }}
            size={20}
            tintColor="#666"
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            {language === 'en'
              ? 'The app language will change immediately. Your selection is automatically saved.'
              : 'Ang wika ng app ay magbabago kaagad. Ang iyong pagpipilian ay awtomatikong nase-save.'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    title: {
      fontFamily: 'PPMoriBold',
      fontSize: 28,
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: '#999',
      marginBottom: 24,
    },
    optionsContainer: {
      gap: 12,
      marginBottom: 24,
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'white',
      backgroundColor: theme.background,
    },
    languageOptionActive: {
      borderColor: '#EC6425',
      backgroundColor: 'rgba(236, 100, 37, 0.1)',
    },
    languageOptionPressed: {
      opacity: 0.7,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#EC6425',
    },
    languageText: {
      fontSize: 18,
      color: theme.text,
      fontFamily: 'PPMori',
    },
    languageTextActive: {
      fontFamily: 'PPMoriBold',
      color: '#EC6425',
    },
    infoBox: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(100, 100, 100, 0.1)',
      gap: 12,
    },
    infoIcon: {
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    backButtonPressed: {
      opacity: 0.7,
    },
    backButtonText: {
      fontSize: 16,
      color: '#EC6425',
      fontFamily: 'PPMori',
    },
  });
}
