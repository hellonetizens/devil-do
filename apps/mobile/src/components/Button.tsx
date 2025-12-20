import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-accent active:bg-accent/80',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-surfaceLight active:bg-surfaceLight/80',
    text: 'text-text-primary',
  },
  danger: {
    container: 'bg-danger active:bg-danger/80',
    text: 'text-white',
  },
  ghost: {
    container: 'bg-transparent active:bg-surfaceLight/50',
    text: 'text-text-secondary',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-4 rounded-2xl',
    text: 'text-lg',
  },
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        flex-row items-center justify-center
        ${variantStyle.container}
        ${sizeStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-semibold ${variantStyle.text} ${sizeStyle.text}`}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
