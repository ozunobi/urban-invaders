import React, { useEffect, useState } from 'react';
import { useAuth, useSignUp } from '@clerk/expo';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';

export default function Signup() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [formError, setFormError] = useState('');
  const isLoading = fetchStatus === 'fetching';
  const usernameEnabled =
    signUp.requiredFields.includes('username') ||
    signUp.optionalFields.includes('username');
  const usernameRequired = signUp.requiredFields.includes('username');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn]);

  // Check if signup session is still valid when on verification screen
  useEffect(() => {
    if (verificationSent && (!signUp || signUp.status === 'abandoned')) {
      setFormError('Your sign-up session has expired. Please start over.');
      setVerificationSent(false);
      setVerificationCode('');
      setEmailAddress('');
      setPassword('');
      setUsername('');
    }
  }, [signUp, verificationSent]);

  const handleSignUp = async () => {
    setFormError('');

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
        ...(usernameEnabled && username ? { username } : {}),
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      const verification = await signUp.verifications.sendEmailCode();
      if (verification.error) {
        setFormError(verification.error.message);
        return;
      }

      setVerificationSent(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to create your account. Please try again.',
      );
    }
  };

  const handleVerify = async () => {
    setFormError('');

    // Check if signup attempt still exists
    if (!signUp || signUp.status === 'abandoned') {
      setFormError('Your sign-up session has expired. Please start over.');
      setVerificationSent(false);
      setVerificationCode('');
      setEmailAddress('');
      setPassword('');
      setUsername('');
      return;
    }

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });
      if (error) {
        // Handle "No sign up attempt was found" error
        if (error.message.includes('No sign up attempt') || error.code === 'resource_not_found') {
          setFormError('Your sign-up session has expired. Please start over.');
          setVerificationSent(false);
          setVerificationCode('');
          setEmailAddress('');
          setPassword('');
          setUsername('');
          return;
        }
        setFormError(error.message);
        return;
      }

      if (signUp.status !== 'complete') {
        setFormError('Your sign-up is not complete yet. Check your account requirements and try again.');
        return;
      }

      const result = await signUp.finalize();
      if (result.error) {
        setFormError(result.error.message);
        return;
      }

      // Give the session time to establish before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      router.replace('/intro-video');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to verify your email. Please try again.',
      );
    }
  };

  const handleResendCode = async () => {
    setFormError('');

    // Check if signup attempt still exists
    if (!signUp || signUp.status === 'abandoned') {
      setFormError('Your sign-up session has expired. Please start over.');
      setVerificationSent(false);
      setVerificationCode('');
      setEmailAddress('');
      setPassword('');
      setUsername('');
      return;
    }

    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        // Handle "No sign up attempt was found" error
        if (error.message.includes('No sign up attempt') || error.code === 'resource_not_found') {
          setFormError('Your sign-up session has expired. Please start over.');
          setVerificationSent(false);
          setVerificationCode('');
          setEmailAddress('');
          setPassword('');
          setUsername('');
          return;
        }
        setFormError(error.message);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to send a new code. Please try again.',
      );
    }
  };

  if (!isLoaded || isSignedIn) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Image
        source={require('./assets/images/bg.png')}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('./assets/icons/logo-2.png')}
          contentFit="contain"
          style={styles.logo}
        />
        <View style={styles.form}>
          <Text style={styles.heading}>
            {verificationSent ? 'Verify your email' : 'Create your account'}
          </Text>

          {verificationSent ? (
            <>
              <Text style={styles.label}>
                Enter the verification code sent to {emailAddress}
              </Text>
              <TextInput
                accessibilityLabel="Email verification code"
                autoComplete="one-time-code"
                autoCapitalize="none"
                keyboardType="number-pad"
                onChangeText={setVerificationCode}
                style={styles.input}
                value={verificationCode}
              />
              {errors.fields.code && (
                <Text style={styles.error}>{errors.fields.code.message}</Text>
              )}
              <Pressable
                accessibilityRole="button"
                disabled={!verificationCode || isLoading}
                onPress={handleVerify}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || isLoading) && styles.buttonPressed,
                  (!verificationCode || isLoading) && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify Email</Text>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isLoading}
                onPress={handleResendCode}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Resend code</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmailAddress}
                style={styles.input}
                value={emailAddress}
              />
              {errors.fields.emailAddress && (
                <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
              )}

              {usernameEnabled && (
                <>
                  <Text style={styles.label}>
                    Username{usernameRequired ? '' : ' (optional)'}
                  </Text>
                  <TextInput
                    accessibilityLabel="Username"
                    autoCapitalize="none"
                    autoComplete="username"
                    onChangeText={setUsername}
                    style={styles.input}
                    value={username}
                  />
                  {errors.fields.username && (
                    <Text style={styles.error}>{errors.fields.username.message}</Text>
                  )}
                </>
              )}

              <Text style={styles.label}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                autoComplete="new-password"
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                value={password}
              />
              {errors.fields.password && (
                <Text style={styles.error}>{errors.fields.password.message}</Text>
              )}

              <Pressable
                accessibilityRole="button"
                disabled={
                  !emailAddress ||
                  !password ||
                  (usernameRequired && !username) ||
                  isLoading
                }
                onPress={handleSignUp}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || isLoading) && styles.buttonPressed,
                  (
                    !emailAddress ||
                    !password ||
                    (usernameRequired && !username) ||
                    isLoading
                  ) && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </Pressable>
            </>
          )}

          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <View nativeID="clerk-captcha" />

          <View style={styles.loginLink}>
            <Text style={styles.label}>Already have an account? </Text>
            <Link href="/">
              <Text style={styles.link}>Log In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#201C18',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 150,
    paddingBottom: 36,
  },
  logo: {
    width: 140,
    height: 110,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    maxWidth: 360,
    gap: 10,
  },
  heading: {
    marginBottom: 14,
    color: '#fff',
    fontFamily: 'PPMoriBold',
    fontSize: 24,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontFamily: 'PPMori',
    fontSize: 17,
  },
  input: {
    height: 46,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#201C18',
    fontSize: 16,
  },
  button: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: '#006A63',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'PPMoriBold',
    fontSize: 18,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontFamily: 'PPMori',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  error: {
    color: '#ffd0ca',
    fontFamily: 'PPMori',
    fontSize: 14,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  link: {
    color: '#fff',
    fontFamily: 'PPMoriBold',
    fontSize: 17,
    textDecorationLine: 'underline',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#201C18',
  },
});
