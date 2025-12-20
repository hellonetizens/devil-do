import React from 'react';
import { View, TextInput, Text } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoFocus = false,
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-text-secondary text-sm mb-2 font-medium">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#606070"
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        className={`
          bg-surfaceLight rounded-xl px-4 py-3
          text-text-primary text-base
          ${multiline ? 'min-h-[100px] text-top' : ''}
          ${error ? 'border border-danger' : 'border border-transparent'}
        `}
      />
      {error && (
        <Text className="text-danger text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
