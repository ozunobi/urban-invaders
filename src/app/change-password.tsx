import { useUser } from '@clerk/expo';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, } from 'react-native';
import { Colors } from '../constants/Colors';

export default function ChangePassword() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const theme = useColorScheme() === 'dark' ? Colors.dark : Colors.light;

  const submit = async () => {
    if (!user || isSubmitting) return;
    setError('');
    setMessage('');
    if (newPassword !== confirmation) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setMessage('Password updated. Your other sessions have been signed out.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!isLoaded ? (
          <ActivityIndicator color="#006A63" />
        ) : !isSignedIn ? (
          <Text style={{ color: theme.text }}>Sign in to change your password.</Text>
        ) : !user.passwordEnabled ? (
          <Text style={{ color: theme.text }}>
            This account does not have a password. Continue signing in with your connected provider.
          </Text>
        ) : (
          <>
            <Text style={[styles.label, { color: theme.text }]}>Current password</Text>
            <TextInput
              accessibilityLabel="Current password"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              editable={!isSubmitting}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.input}
              value={currentPassword}
            />
            <Text style={[styles.label, { color: theme.text }]}>New password</Text>
            <TextInput
              accessibilityLabel="New password"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!isSubmitting}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              value={newPassword}
            />
            <Text style={[styles.label, { color: theme.text }]}>Confirm new password</Text>
            <TextInput
              accessibilityLabel="Confirm new password"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!isSubmitting}
              onChangeText={setConfirmation}
              secureTextEntry
              style={styles.input}
              value={confirmation}
            />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={!currentPassword || !newPassword || !confirmation || isSubmitting}
              onPress={submit}
              style={[
                styles.button,
                (!currentPassword || !newPassword || !confirmation || isSubmitting) && styles.disabled,
              ]}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>UPDATE PASSWORD</Text>}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 10, width: '100%', maxWidth: 480, alignSelf: 'center' },
  label: { fontFamily: 'PPMoriBold', fontSize: 15 },
  input: { minHeight: 48, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cfc8c2', borderRadius: 8, backgroundColor: 'white', color: '#201C18', fontSize: 16 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 10, borderRadius: 10, backgroundColor: '#006A63' },
  buttonText: { color: 'white', fontFamily: 'PPMoriBold', fontSize: 15 },
  disabled: { opacity: 0.5 },
  error: { color: '#c83e25', fontSize: 14 },
  success: { color: '#006A63', fontSize: 14 },
});
