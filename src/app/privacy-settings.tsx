import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, useColorScheme, View, Switch } from 'react-native';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { useLanguage } from '../components/LanguageContext';

export default function PrivacySettings() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme);
  const { t } = useLanguage();
  const [locationPermissionEnabled, setLocationPermissionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermissionEnabled(status === Location.PermissionStatus.GRANTED);
    } catch (error) {
      console.error('Error checking location permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const handleLocationPermissionToggle = async (value: boolean) => {
    setIsLoading(true);
    try {
      if (value) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionEnabled(status === Location.PermissionStatus.GRANTED);
      } else {
        setLocationPermissionEnabled(false);
      }
    } catch (error) {
      console.error('Error handling location permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('settings.location_permission_title')}</Text>
        <Text style={styles.subtitle}>{t('settings.location_description')}</Text>

        <View style={styles.permissionContainer}>
          <View style={styles.permissionHeader}>
            <SymbolView
              name={{ android: 'location_on', web: 'location_on' }}
              size={24}
              tintColor={locationPermissionEnabled ? '#EC6425' : '#ccc'}
              style={styles.permissionIcon}
            />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>{t('settings.location_permission')}</Text>
              <Text style={styles.permissionStatus}>
                {locationPermissionEnabled
                  ? t('settings.location_enabled')
                  : t('settings.location_disabled')}
              </Text>
            </View>
          </View>

          <Switch
            value={locationPermissionEnabled}
            onValueChange={handleLocationPermissionToggle}
            disabled={isLoading}
            trackColor={{ false: '#e0e0e0', true: 'rgba(236, 100, 37, 0.3)' }}
            thumbColor={locationPermissionEnabled ? '#EC6425' : '#f4f3f4'}
          />
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
      color: '#EC6425',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: '#999',
      marginBottom: 24,
    },
    permissionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'white',
      backgroundColor: theme.background,
      marginBottom: 24,
    },
    permissionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
      color: '#EC6425',
    },
    permissionIcon: {
      width: 24,
      height: 24,
    },
    permissionTextContainer: {
      flex: 1,
    },
    permissionTitle: {
      fontSize: 18,
      color: theme.text,
      fontFamily: 'PPMori',
      marginBottom: 4,
    },
    permissionStatus: {
      fontSize: 14,
      color: '#999',
      fontFamily: 'PPMori',
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
  });
}
