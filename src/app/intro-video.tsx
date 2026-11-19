import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

export default function IntroVideo() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const player = useVideoPlayer(require('./assets/videos/draft.mp4'), (player) => {
    player.loop = false;
    console.log('[IntroVideo] Player initialized');
  });

  useEffect(() => {
    console.log('[IntroVideo] Auth state:', { isSignedIn, userLoaded: isLoaded, hasUser: !!user, watchedIntro: user?.unsafeMetadata?.watchedIntro });
  }, [isSignedIn, isLoaded, user]);

  useEffect(() => {
    if (!isLoaded) {
      console.log('[IntroVideo] Waiting for auth to load...');
      return;
    }

    console.log('[IntroVideo] Auth loaded. isSignedIn:', isSignedIn);

    if (!isSignedIn) {
      console.log('[IntroVideo] Not signed in, redirecting to login');
      router.replace('/');
      return;
    }

    if (user?.unsafeMetadata?.watchedIntro) {
      console.log('[IntroVideo] Already watched intro, redirecting to home');
      router.replace('/home');
      return;
    }

    console.log('[IntroVideo] Showing intro video for first time');
    setPageLoaded(true);
  }, [isLoaded, isSignedIn, user]);

  const handleVideoComplete = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }

      console.log('[IntroVideo] Updating metadata with watchedIntro flag');
      await user.updateMetadata({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          watchedIntro: true,
          introWatchedAt: new Date().toISOString(),
        },
      });

      console.log('[IntroVideo] Metadata updated, navigating to home');
      router.replace('/home');
    } catch (error) {
      console.error('[IntroVideo] Error updating metadata:', error);
      router.replace('/home');
    } finally {
      setIsLoading(false);
    }
  };

  if (!pageLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading introduction video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <VideoView
          style={styles.video}
          player={player}
          onFirstFrameRender={() => {
            console.log('[IntroVideo] Video first frame rendered');
            setPlayerReady(true);
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleVideoComplete}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.button,
            (pressed || isLoading) && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue to App</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#201C18',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontFamily: 'PPMori',
    fontSize: 16,
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  button: {
    backgroundColor: '#006A63',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'PPMoriBold',
    fontSize: 18,
  },
});
