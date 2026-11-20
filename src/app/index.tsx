import React, { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useAuth, useSignIn } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const isLoading = fetchStatus === 'fetching';
  const isBusy = isLoading || isGoogleLoading;

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn]);

  const handleLogin = async () => {
    setFormError('');

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      if (signIn.status === 'complete') {
        const result = await signIn.finalize();
        if (result.error) {
          setFormError(result.error.message);
          return;
        }
        router.replace('/home');
        return;
      }

      if (
        signIn.status === 'needs_client_trust' ||
        signIn.status === 'needs_second_factor'
      ) {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code',
        );
        if (!emailCodeFactor) {
          setFormError(
            'This account requires a verification method that is not supported on this screen.',
          );
          return;
        }

        const verification = await signIn.mfa.sendEmailCode();
        if (verification.error) {
          setFormError(verification.error.message);
          return;
        }

        setVerificationSent(true);
        return;
      }

      setFormError('Sign-in needs additional steps. Check your account settings and try again.');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.',
      );
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    setIsGoogleLoading(true);

    try {
      const redirectUrl =
        Platform.OS === 'web'
          ? undefined
          : AuthSession.makeRedirectUri({
              scheme: 'urbaninvaders',
              path: 'sso-callback',
            });
      const {
        authSessionResult,
        createdSessionId,
        signUp: pendingSignUp,
      } = await startSSOFlow({
        strategy: 'oauth_google',
        ...(redirectUrl ? { redirectUrl } : {}),
      });

      if (
        authSessionResult?.type === 'cancel' ||
        authSessionResult?.type === 'dismiss'
      ) {
        return;
      }

      if (!createdSessionId) {
        setFormError(
          pendingSignUp?.status === 'missing_requirements'
            ? 'Your Google account needs more information before sign-in can finish.'
            : 'Google sign-in did not create an active session. Check your Clerk Google connection.',
        );
        return;
      }

      router.replace('/home');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to sign in with Google.',
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleVerify = async () => {
    setFormError('');

    try {
      const { error } = await signIn.mfa.verifyEmailCode({
        code: verificationCode,
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      if (signIn.status !== 'complete') {
        setFormError('The verification is incomplete. Check your code and try again.');
        return;
      }

      const result = await signIn.finalize();
      if (result.error) {
        setFormError(result.error.message);
        return;
      }

      router.replace('/home');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to verify your sign-in. Please try again.',
      );
    }
  };

  const handleResendCode = async () => {
    setFormError('');

    try {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) setFormError(error.message);
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

          {verificationSent ? (
            <>
              <Text style={styles.label}>
                Enter the verification code sent to your email.
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
                  <Text style={styles.buttonText}>Verify</Text>
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
              {errors.fields.identifier && (
                <Text style={styles.error}>{errors.fields.identifier.message}</Text>
              )}

              <Text style={styles.label}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                autoComplete="password"
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
                disabled={!emailAddress || !password || isBusy}
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || isLoading) && styles.buttonPressed,
                  (!emailAddress || !password || isBusy) && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </Pressable>
            </>
          )}

          {!verificationSent && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={handleGoogleLogin}
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.buttonPressed,
                  isBusy && styles.buttonDisabled,
                ]}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#4285F4" />
                ) : (
                  <>
                    <Text style={styles.googleMark}>G</Text>
                    <Text style={styles.googleButtonText}>Log In with Google</Text>
                  </>
                )}
              </Pressable>
            </>
          )}

          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <View nativeID="clerk-captcha" />

          <View style={styles.signupLink}>
            <Text style={styles.label}>Don't have an account? </Text>
            <Link href="/signup">
              <Text style={styles.link}>Sign Up</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
  },
  dividerText: {
    color: '#fff',
    fontFamily: 'PPMoriBold',
    fontSize: 13,
  },
  googleButton: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  googleMark: {
    color: '#4285F4',
    fontFamily: 'PPMoriBold',
    fontSize: 22,
  },
  googleButtonText: {
    color: '#201C18',
    fontFamily: 'PPMoriBold',
    fontSize: 16,
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
    color: '#9a372a',
    fontFamily: 'PPMori',
    fontSize: 14,
  },
  signupLink: {
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
