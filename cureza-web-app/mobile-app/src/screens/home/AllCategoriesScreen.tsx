import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { categoriesApi, Category } from '../../api';
import { HomeStackParamList } from '../../navigation/types';

type AllCategoriesNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

// Gradient colors for categories
const GRADIENT_COLORS = [
    '#10B981', '#6366F1', '#F59E0B', '#EC4899',
    '#8B5CF6', '#14B8A6', '#F97316', '#3B82F6',
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

export const AllCategoriesScreen: React.FC = () => {
    const navigation = useNavigation<AllCategoriesNavigationProp>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const allCategories = await categoriesApi.getCategories();
            // Filter to show only categories (not concerns)
            const cats = allCategories.filter((c: any) => !c.type || c.type === 'category');
            setCategories(cats);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category: Category) => {
        navigation.navigate('CategoryProducts', {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
        });
    };

    const renderCategory = ({ item, index }: { item: Category; index: number }) => {
        const bgColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
        const icon = getCategoryIcon(item.slug);

        return (
            <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: bgColor }]}
                onPress={() => handleCategoryPress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.productCount}>
                    {item.products_count || 0} products
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Categories</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={renderCategory}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.lg,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    categoryCard: {
        width: '48%',
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    categoryName: {
        ...typography.body,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 4,
    },
    productCount: {
        ...typography.caption,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});

export default AllCategoriesScreen;
