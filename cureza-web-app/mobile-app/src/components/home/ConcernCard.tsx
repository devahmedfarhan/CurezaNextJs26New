import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Category } from '../../api';

interface ConcernCardProps {
    concern: Category;
    onPress: () => void;
    index?: number;
}

// Icon mapping for health concerns
const CONCERN_ICONS: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'stress': 'cloud-outline',
    'anxiety': 'thunderstorm-outline',
    'sleep': 'moon-outline',
    'pain': 'bandage-outline',
    'inflammation': 'flame-outline',
    'digestion': 'restaurant-outline',
    'immunity': 'shield-checkmark-outline',
    'energy': 'flash-outline',
    'skin': 'sparkles-outline',
    'hair': 'cut-outline',
    'weight': 'scale-outline',
    'diabetes': 'analytics-outline',
    'heart': 'heart-outline',
    'joint': 'body-outline',
    'respiratory': 'cloud-circle-outline',
    'women': 'woman-outline',
    'men': 'man-outline',
    'default': 'medical-outline',
};

// Soft gradient backgrounds for concerns
const CONCERN_COLORS = [
    '#E0F2FE', // Light blue
    '#FCE7F3', // Light pink
    '#D1FAE5', // Light green
    '#FEF3C7', // Light amber
    '#EDE9FE', // Light purple
    '#CFFAFE', // Light cyan
    '#FEE2E2', // Light red
    '#F3E8FF', // Light violet
];

const getConcernIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
    const normalizedSlug = slug.toLowerCase();
    for (const [key, icon] of Object.entries(CONCERN_ICONS)) {
        if (normalizedSlug.includes(key)) {
            return icon;
        }
    }
    return CONCERN_ICONS.default;
};

export const ConcernCard: React.FC<ConcernCardProps> = ({
    concern,
    onPress,
    index = 0,
}) => {
    const bgColor = CONCERN_COLORS[index % CONCERN_COLORS.length];
    const icon = getConcernIcon(concern.slug);

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: bgColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.name} numberOfLines={2}>
                {concern.name}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 110,
        height: 120,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        padding: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    name: {
        ...typography.caption,
        color: colors.textPrimary,
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default ConcernCard;
