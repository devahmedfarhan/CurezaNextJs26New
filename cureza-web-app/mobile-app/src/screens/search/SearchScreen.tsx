import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput as RNTextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { ProductCard } from '../../components';
import { productsApi, Product, Category, categoriesApi } from '../../api';
import { useCartStore } from '../../store';
import debounce from 'lodash/debounce';

export const SearchScreen: React.FC = () => {
    const navigation = useNavigation();
    const { addToCart } = useCartStore();

    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await categoriesApi.getCategories();
            setCategories(cats.slice(0, 12));
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const searchProducts = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setProducts([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            console.log('Searching for:', searchQuery);
            const result = await productsApi.searchProducts(searchQuery);
            console.log('Search result:', result);
            // Handle both array and object with data property
            const productsList = Array.isArray(result) ? result : (result?.data || []);
            console.log('Products found:', productsList.length);
            setProducts(productsList);
        } catch (error) {
            console.error('Search error:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((q: string) => searchProducts(q), 500),
        []
    );

    const handleQueryChange = (text: string) => {
        setQuery(text);
        debouncedSearch(text);
    };

    const handleProductPress = (product: Product) => {
        (navigation as any).navigate('HomeTab', {
            screen: 'ProductDetail',
            params: { slug: product.slug },
        });
    };

    const handleAddToCart = async (product: Product) => {
        try {
            await addToCart({ product_id: product.id, quantity: 1 });
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const renderEmptyState = () => {
        if (loading) return null;

        if (searched && products.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color={colors.textLight} />
                    <Text style={styles.emptyTitle}>No Results Found</Text>
                    <Text style={styles.emptySubtitle}>
                        We couldn't find any products matching "{query}"
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Popular Categories</Text>
                <View style={styles.categoriesGrid}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.categoryChip}
                            onPress={() => {
                                setQuery(category.name);
                                searchProducts(category.name);
                            }}
                        >
                            <Text style={styles.categoryChipText}>{category.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.suggestionsTitle, { marginTop: spacing.xl }]}>
                    Popular Searches
                </Text>
                {['Vitamins', 'Pain Relief', 'Immunity Booster', 'Skin Care'].map((term) => (
                    <TouchableOpacity
                        key={term}
                        style={styles.searchSuggestion}
                        onPress={() => {
                            setQuery(term);
                            searchProducts(term);
                        }}
                    >
                        <Ionicons name="trending-up-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.suggestionText}>{term}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Search Header */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <RNTextInput
                        style={styles.searchInput}
                        placeholder="Search medicines, health products..."
                        placeholderTextColor={colors.textSecondary}
                        value={query}
                        onChangeText={handleQueryChange}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => searchProducts(query)}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => handleQueryChange('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Loading Indicator */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {/* Results or Suggestions */}
            {!loading && products.length > 0 ? (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.resultsContainer}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={() => handleProductPress(item)}
                            onAddToCart={() => handleAddToCart(item)}
                        />
                    )}
                    ListHeaderComponent={
                        <Text style={styles.resultsCount}>
                            {products.length} products found
                        </Text>
                    }
                />
            ) : (
                renderEmptyState()
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
        padding: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        color: colors.textPrimary,
        paddingVertical: spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsContainer: {
        padding: spacing.lg,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    resultsCount: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    suggestionsContainer: {
        padding: spacing.lg,
    },
    suggestionsTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipText: {
        ...typography.bodySmall,
        color: colors.textPrimary,
    },
    searchSuggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    suggestionText: {
        ...typography.body,
        color: colors.textPrimary,
    },
});

export default SearchScreen;
