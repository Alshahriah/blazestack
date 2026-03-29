import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import type { ButtonProps } from "../types";

const variantStyles = {
  primary: { bg: "#2563eb", text: "#ffffff" },
  secondary: { bg: "#f3f4f6", text: "#111827" },
  ghost: { bg: "transparent", text: "#374151" },
  destructive: { bg: "#dc2626", text: "#ffffff" },
} as const;

const sizeStyles = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 13 },
  md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
  lg: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
} as const;

interface NativeButtonProps extends ButtonProps {
  onPress?: () => void;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  onPress,
}: NativeButtonProps) {
  const colors = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: colors.bg,
          paddingVertical: sizes.paddingVertical,
          paddingHorizontal: sizes.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: colors.text, fontSize: sizes.fontSize }]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
  },
});
