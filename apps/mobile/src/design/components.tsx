import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors, spacing, radius, typography, shadows } from './tokens';

let MotiView: any = View;
let MotiPressable: any = Pressable;
if (Platform.OS !== 'web') {
  const moti = require('moti');
  MotiView = moti.MotiView;
  MotiPressable = moti.MotiPressable;
}

// =============================================================================
// BUTTON
// =============================================================================

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.pop.DEFAULT,
          bgPressed: colors.pop.dark,
          text: colors.white,
        };
      case 'secondary':
        return {
          bg: colors.gray[800],
          bgPressed: colors.gray[700],
          text: colors.white,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          bgPressed: colors.gray[900],
          text: colors.gray[300],
        };
      case 'danger':
        return {
          bg: colors.pop.muted,
          bgPressed: colors.pop.DEFAULT,
          text: colors.pop.DEFAULT,
        };
      default:
        return {
          bg: colors.pop.DEFAULT,
          bgPressed: colors.pop.dark,
          text: colors.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <MotiPressable
      onPress={onPress}
      disabled={disabled}
      animate={({ pressed }) => {
        'worklet';
        return {
          scale: pressed ? 0.97 : 1,
          opacity: disabled ? 0.5 : 1,
        };
      }}
      transition={{ type: 'timing', duration: 100 }}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.bg,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
        },
        variant === 'primary' && shadows.pop,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon && <View style={styles.buttonIcon}>{icon}</View>}
        <Text
          style={[
            styles.buttonText,
            {
              color: variantStyles.text,
              fontSize: sizeStyles.fontSize,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    </MotiPressable>
  );
}

// =============================================================================
// CARD
// =============================================================================

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.gray[900],
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.gray[800],
        };
      default:
        return {
          backgroundColor: colors.gray[950],
        };
    }
  };

  const content = (
    <View
      style={[
        styles.card,
        getVariantStyles(),
        { padding: spacing[padding] },
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <MotiPressable
        onPress={onPress}
        animate={({ pressed }) => {
          'worklet';
          return { scale: pressed ? 0.98 : 1 };
        }}
        transition={{ type: 'timing', duration: 100 }}
      >
        {content}
      </MotiPressable>
    );
  }

  return content;
}

// =============================================================================
// INPUT
// =============================================================================

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  secureTextEntry = false,
}: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <MotiView
        animate={{
          borderColor: error
            ? colors.pop.DEFAULT
            : focused
            ? colors.gray[600]
            : colors.gray[800],
        }}
        transition={{ type: 'timing', duration: 150 }}
        style={styles.inputWrapper}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[600]}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            multiline && { height: 100, textAlignVertical: 'top' },
          ]}
        />
      </MotiView>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// =============================================================================
// BADGE
// =============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pop' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pop':
        return { bg: colors.pop.muted, text: colors.pop.DEFAULT };
      case 'success':
        return { bg: 'rgba(52, 199, 89, 0.15)', text: colors.success };
      case 'warning':
        return { bg: 'rgba(255, 149, 0, 0.15)', text: colors.warning };
      default:
        return { bg: colors.gray[800], text: colors.gray[300] };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.bg,
          paddingVertical: size === 'sm' ? 4 : 6,
          paddingHorizontal: size === 'sm' ? 8 : 12,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: variantStyles.text,
            fontSize: size === 'sm' ? 11 : 13,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'pop';
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  variant = 'default',
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View>
      <View
        style={[
          styles.progressTrack,
          { height, backgroundColor: colors.gray[800] },
        ]}
      >
        <MotiView
          animate={{ width: `${clampedProgress}%` }}
          transition={{ type: 'spring', damping: 20 }}
          style={[
            styles.progressFill,
            {
              height,
              backgroundColor:
                variant === 'pop' ? colors.pop.DEFAULT : colors.white,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.progressLabel}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

// =============================================================================
// DIVIDER
// =============================================================================

export function Divider({ spacing: s = 'md' }: { spacing?: keyof typeof spacing }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.gray[800],
        marginVertical: spacing[s],
      }}
    />
  );
}

// =============================================================================
// TYPOGRAPHY
// =============================================================================

interface TypographyProps {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}

export function H1({ children, color = colors.white, style }: TypographyProps) {
  return (
    <Text style={[styles.h1, { color }, style]}>{children}</Text>
  );
}

export function H2({ children, color = colors.white, style }: TypographyProps) {
  return (
    <Text style={[styles.h2, { color }, style]}>{children}</Text>
  );
}

export function H3({ children, color = colors.white, style }: TypographyProps) {
  return (
    <Text style={[styles.h3, { color }, style]}>{children}</Text>
  );
}

export function Body({ children, color = colors.gray[300], style }: TypographyProps) {
  return (
    <Text style={[styles.body, { color }, style]}>{children}</Text>
  );
}

export function Caption({ children, color = colors.gray[500], style }: TypographyProps) {
  return (
    <Text style={[styles.caption, { color }, style]}>{children}</Text>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Button
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    borderRadius: radius.lg,
  },

  // Input
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.gray[400],
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.gray[950],
  },
  input: {
    color: colors.white,
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inputError: {
    color: colors.pop.DEFAULT,
    fontSize: 12,
    marginTop: 6,
  },

  // Badge
  badge: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Progress
  progressTrack: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
  },
  progressLabel: {
    color: colors.gray[500],
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },

  // Typography
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});
