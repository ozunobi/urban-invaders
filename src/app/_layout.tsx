import React from "react";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { useFonts } from "expo-font";
import { Colors } from "../constants/Colors";
import AppFooter from "../components/AppFooter";
import HeaderMenu from "../components/HeaderMenu";
import { AppDataProvider } from "../components/AppDataContext";
import { LanguageProvider } from "../components/LanguageContext";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    InformaPro: require("./assets/fonts/InformaPro-Normal.otf"),
    InformaProBold: require("./assets/fonts/InformaPro-Bold.otf"),
    OwnersNarrow: require("./assets/fonts/OwnersTRIALNarrow-XBlack-BF64361ef5efd11.otf"),
    OwnersNarrowItalic: require("./assets/fonts/OwnersTRIALNarrow-XBlackItalic-BF64361ef60a7ac.otf"),
    PPMori: require("./assets/fonts/ppmori-regular.otf"),
    PPMoriBold: require("./assets/fonts/ppmori-semibold.otf"),
  });

  if (fontError) {
    console.error('Font loading error:', fontError);
    throw fontError;
  }
  if (!fontsLoaded) return null;

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
    return (
      <View style={styles.container}>
        <Text style={{ color: '#000', fontSize: 16, padding: 20 }}>
          Error: Missing Clerk Publishable Key. Check your .env file.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <LanguageProvider>
        <AppDataProvider>
          <View style={styles.container}>
            <Stack screenOptions={{
              headerStyle: {
                backgroundColor: Colors.light.headerBackground,
              },
              headerTitleAlign: 'center',
              headerTintColor: '#fff',
              headerRight: () => <HeaderMenu />,
              headerTitleStyle: {
                fontFamily: 'PPMoriBold'
              },
            }}>
              <Stack.Screen name="index" options={{ headerShown: false, title: 'Log In'}} />
              <Stack.Screen name="signup" options={{ headerShown: false, title: 'Sign Up'}} />
              <Stack.Screen name="intro-video" options={{ headerShown: false, title: 'Introduction' }} />
              <Stack.Screen name="home" options={{ headerShown: true, title: 'HOME'}} />
              <Stack.Screen name="notification" options={{ headerShown: true, title: 'NOTIFICATIONS' }} />
              <Stack.Screen name="achievements" options={{ headerShown: true, title: 'ACHIEVEMENTS' }} />
              <Stack.Screen name="settings" options={{ headerShown: true, title: 'SETTINGS'}} />
              <Stack.Screen name="language-settings" options={{ headerShown: true, title: 'LANGUAGE SETTINGS'}} />
              <Stack.Screen name="privacy-settings" options={{ headerShown: true, title: 'PRIVACY SETTINGS'}} />
              <Stack.Screen name="change-password" options={{ headerShown: true, title: 'CHANGE PASSWORD' }} />
              <Stack.Screen name="form" options={{ headerShown: true, title: 'SUBMIT A SIGHTING' }} />
              <Stack.Screen name="profile" options={{ headerShown: true, title: 'PROFILE' }} />
              <Stack.Screen name="heatmap" options={{ headerShown: false, title: 'HEAT MAP' }} />
              <Stack.Screen name="games" options={{ headerShown: true, title: 'WEEKLY GAMES' }} />
              <Stack.Screen name="word-hunt" options={{ headerShown: true, title: 'HIDDEN INVADERS' }} />
              <Stack.Screen name="species-quiz" options={{ headerShown: true, title: 'SPECIES QUIZ' }} />
            </Stack>
            <AppFooter />
          </View>
        </AppDataProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

