import React from 'react';
import { View, Pressable } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, onPress, className = '', variant = 'default' }: CardProps) {
  const baseStyles = 'rounded-2xl p-4';

  const variantStyles = {
    default: 'bg-surface',
    elevated: 'bg-surface shadow-lg',
    outlined: 'bg-transparent border border-surfaceLight',
  };

  const content = (
    <View className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
}
