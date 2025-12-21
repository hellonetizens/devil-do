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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;

    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      // Error is handled by the store
    }
  };

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
          <View className="items-center mb-12">
            <Text className="text-6xl mb-4">😈</Text>
            <Text className="text-fire-500 text-3xl font-bold">Devil Do</Text>
            <Text className="text-fire-700 text-base mt-2">
              Sell your soul to productivity
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <Pressable onPress={clearError}>
              <View className="bg-fire-900/50 border border-fire-600 rounded-lg p-4 mb-6">
                <Text className="text-fire-400 text-center">{error}</Text>
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
          <View className="mb-6">
            <Text className="text-fire-400 text-sm mb-2 font-medium">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#662222"
              secureTextEntry
              autoComplete="password"
              className="bg-fire-950 border border-fire-800 rounded-lg px-4 py-4 text-white text-base"
            />
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading || !email.trim() || !password.trim()}
            className={`rounded-lg py-4 items-center ${
              isLoading || !email.trim() || !password.trim()
                ? 'bg-fire-900'
                : 'bg-fire-600 active:bg-fire-700'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Sign Your Soul Away
              </Text>
            )}
          </Pressable>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-fire-700">New victim? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="text-fire-400 font-semibold">
                  Create account
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Skip Auth (Dev/Guest Mode) */}
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            className="mt-8 py-3"
          >
            <Text className="text-fire-800 text-center text-sm">
              Continue without account (local only)
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
