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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants';
import { ProductCard } from '../../components';
import { productsApi, Product } from '../../api';
import { HomeStackParamList } from '../../navigation/types';

type CategoryProductsRouteProp = RouteProp<HomeStackParamList, 'CategoryProducts'>;
type CategoryProductsNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CategoryProducts'>;

export const CategoryProductsScreen: React.FC = () => {
    const route = useRoute<CategoryProductsRouteProp>();
    const navigation = useNavigation<CategoryProductsNavigationProp>();
    const { categoryId, categoryName, categorySlug } = route.params;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, [categoryId, categorySlug]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            console.log('Loading products for category:', categorySlug || categoryId);
            const response = await productsApi.getProducts({
                category: categorySlug || categoryId.toString(),
                per_page: 50
            });
            console.log('Category products response:', response?.data?.length || 0);
            // Handle different response structures
            const productsList = response.data || response || [];
            setProducts(Array.isArray(productsList) ? productsList : []);
        } catch (error) {
            console.error('Error loading category products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductPress = (slug: string) => {
        navigation.navigate('ProductDetail', { slug });
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
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : !products || products.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cube-outline" size={64} color={colors.textLight} />
                    <Text style={styles.emptyText}>No products found in this category</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={() => handleProductPress(item.slug)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
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
        borderRadius: 12,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    listContent: {
        padding: spacing.lg,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
});

export default CategoryProductsScreen;
