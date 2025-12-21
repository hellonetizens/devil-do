import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const handleSignup = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError('All fields are required, mortal.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords don't match. The devil demands precision.");
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters. Make it harder to escape.');
      return;
    }

    try {
      await signUp(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8">
          {/* Devil Logo/Header */}
          <View className="items-center mb-10">
            <Text className="text-6xl mb-4">😈</Text>
            <Text className="text-fire-500 text-3xl font-bold">Join the Damned</Text>
            <Text className="text-fire-700 text-base mt-2 text-center">
              Create an account to sync your sins across devices
            </Text>
          </View>

          {/* Error Message */}
          {displayError && (
            <Pressable onPress={() => { clearError(); setLocalError(null); }}>
              <View className="bg-fire-900/50 border border-fire-600 rounded-lg p-4 mb-6">
                <Text className="text-fire-400 text-center">{displayError}</Text>
              </View>
            </Pressable>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-fire-400 text-sm mb-2 font-medium">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your.soul@hell.com"
              placeholderTextColor="#662222"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-fire-950 border border-fire-800 rounded-lg px-4 py-4 text-white text-base"
            />
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-fire-400 text-sm mb-2 font-medium">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#662222"
              secureTextEntry
              autoComplete="new-password"
              className="bg-fire-950 border border-fire-800 rounded-lg px-4 py-4 text-white text-base"
            />
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-fire-400 text-sm mb-2 font-medium">Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#662222"
              secureTextEntry
              autoComplete="new-password"
              className="bg-fire-950 border border-fire-800 rounded-lg px-4 py-4 text-white text-base"
            />
          </View>

          {/* Signup Button */}
          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            className={`rounded-lg py-4 items-center ${
              isLoading ? 'bg-fire-900' : 'bg-fire-600 active:bg-fire-700'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Damn My Soul
              </Text>
            )}
          </Pressable>

          {/* Terms */}
          <Text className="text-fire-800 text-xs text-center mt-4 px-4">
            By signing up, you agree to let the devil shame you into productivity forever.
          </Text>

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-fire-700">Already damned? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-fire-400 font-semibold">
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="mt-6 py-3"
          >
            <Text className="text-fire-800 text-center text-sm">
              ← Back to login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
