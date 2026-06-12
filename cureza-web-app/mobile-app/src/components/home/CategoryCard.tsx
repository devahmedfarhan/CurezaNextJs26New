import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Category } from '../../api';

interface CategoryCardProps {
    category: Category;
    onPress: () => void;
    index?: number;
}

// Premium gradient colors for categories
const GRADIENT_COLORS = [
    ['#10B981', '#059669'], // Emerald
    ['#6366F1', '#4F46E5'], // Indigo
    ['#F59E0B', '#D97706'], // Amber
    ['#EC4899', '#DB2777'], // Pink
    ['#8B5CF6', '#7C3AED'], // Purple
    ['#14B8A6', '#0D9488'], // Teal
    ['#F97316', '#EA580C'], // Orange
    ['#3B82F6', '#2563EB'], // Blue
];

// Icon mapping for categories
const CATEGORY_ICONS: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'supplements': 'fitness-outline',
    'skincare': 'sparkles-outline',
    'haircare': 'cut-outline',
    'wellness': 'heart-outline',
    'nutrition': 'nutrition-outline',
    'ayurveda': 'leaf-outline',
    'cbd': 'flower-outline',
    'oils': 'water-outline',
    'default': 'grid-outline',
};

const getCategoryIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
    const normalizedSlug = slug.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
        if (normalizedSlug.includes(key)) {
            return icon;
        }
    }
    return CATEGORY_ICONS.default;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onPress,
    index = 0,
}) => {
    const gradientColors = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
    const icon = getCategoryIcon(category.slug);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, { backgroundColor: gradientColors[0] }]}>
                <Ionicons name={icon} size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.name} numberOfLines={2}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 80,
        marginRight: spacing.md,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    name: {
        ...typography.caption,
        color: colors.textPrimary,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 16,
    },
});

export default CategoryCard;
