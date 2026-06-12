import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    style,
    ...props
}) => {
    const isDisabled = disabled || loading;

    const containerStyles: ViewStyle[] = [
        styles.container,
        styles[`container_${variant}`],
        styles[`container_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            style={containerStyles}
            disabled={isDisabled}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.textOnPrimary : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {leftIcon}
                    <Text style={textStyles}>{title}</Text>
                    {rightIcon}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },

    // Variants
    container_primary: {
        backgroundColor: colors.primary,
    },
    container_secondary: {
        backgroundColor: colors.secondary,
    },
    container_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    container_ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    container_small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    container_medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    container_large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },

    // Text
    text: {
        ...typography.button,
    },
    text_primary: {
        color: colors.textOnPrimary,
    },
    text_secondary: {
        color: colors.textOnPrimary,
    },
    text_outline: {
        color: colors.primary,
    },
    text_ghost: {
        color: colors.primary,
    },
    text_small: {
        fontSize: 14,
    },
    text_medium: {
        fontSize: 16,
    },
    text_large: {
        fontSize: 18,
    },
});

export default Button;
