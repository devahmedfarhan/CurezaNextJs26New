import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    FlatList,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { ProductCard, SectionHeader, CategoryCard, ConcernCard, BannerSlider } from '../../components';
import { productsApi, categoriesApi, Product, Category } from '../../api';
import { useAuthStore, useCartStore } from '../../store';
import { HomeStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuthStore();
    const { addToCart } = useCartStore();

    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [concerns, setConcerns] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [latestProducts, setLatestProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            console.log('Fetching home data...');

            const [allCategories, products, latest] = await Promise.all([
                categoriesApi.getCategories(),
                productsApi.getProducts({ per_page: 20 }),
                productsApi.getLatestProducts(12),
            ]);

            console.log('Categories:', allCategories?.length || 0);
            console.log('Products:', Array.isArray(products) ? products.length : (products?.data?.length || 0));
            console.log('Latest:', latest?.length || 0);

            // Separate categories and concerns
            const cats = (allCategories || []).filter((c: any) => !c.type || c.type === 'category');
            const conc = (allCategories || []).filter((c: any) => c.type === 'concern');

            setCategories(cats.slice(0, 10));
            setConcerns(conc.slice(0, 8));

            // Products data - handle both array and paginated response
            const productsList = products?.data || products || [];
            setFeaturedProducts(productsList.slice(0, 8));
            setLatestProducts(latest || productsList.slice(0, 6));
            setAllProducts(productsList);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const handleProductPress = (product: Product) => {
        navigation.navigate('ProductDetail', { slug: product.slug });
    };

    const handleAddToCart = async (product: Product) => {
        try {
            await addToCart({ product_id: product.id, quantity: 1 });
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleCategoryPress = (category: Category) => {
        navigation.navigate('CategoryProducts', {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
        });
    };

    const handleConcernPress = (concern: Category) => {
        navigation.navigate('CategoryProducts', {
            categoryId: concern.id,
            categoryName: concern.name,
            categorySlug: concern.slug,
        });
    };

    // Header Component
    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Text style={styles.greeting}>
                    Hello, {user?.name?.split(' ')[0] || 'there'}! 👋
                </Text>
                <Text style={styles.subtitle}>Discover wellness products</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                <View style={styles.notificationBadge} />
            </TouchableOpacity>
        </View>
    );

    // Search Bar Component
    const renderSearchBar = () => (
        <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate('SearchTab')}
            activeOpacity={0.8}
        >
            <View style={styles.searchIconContainer}>
                <Ionicons name="search" size={20} color={colors.primary} />
            </View>
            <Text style={styles.searchPlaceholder}>Search wellness products...</Text>
            <View style={styles.filterButton}>
                <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    // Categories Section (TOP PRIORITY)
    const renderCategories = () => (
        <View style={styles.section}>
            <SectionHeader
                title="Shop by Category"
                onSeeAll={() => navigation.navigate('AllCategories')}
            />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
            >
                {categories.map((category, index) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onPress={() => handleCategoryPress(category)}
                        index={index}
                    />
                ))}
            </ScrollView>
        </View>
    );

    // Banner Slider Section
    const renderBanner = () => (
        <BannerSlider
            onShopNow={() => navigation.navigate('AllProducts', { title: 'All Products' })}
        />
    );

    // Featured Products Section
    const renderFeaturedProducts = () => (
        <View style={styles.section}>
            <SectionHeader
                title="Featured Products"
                onSeeAll={() => navigation.navigate('AllProducts', { title: 'Featured', filter: 'featured' })}
            />
            <FlatList
                data={featuredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productCardWrapper}>
                        <ProductCard
                            product={item}
                            onPress={() => handleProductPress(item)}
                            onAddToCart={() => handleAddToCart(item)}
                        />
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No featured products</Text>
                    </View>
                }
            />
        </View>
    );

    // Shop by Concern Section
    const renderConcerns = () => {
        // Use concerns if available, otherwise use categories as health concerns
        const concernsList = concerns.length > 0 ? concerns : categories.slice(0, 6);

        if (concernsList.length === 0) return null;

        return (
            <View style={styles.section}>
                <SectionHeader
                    title="Shop by Concern"
                    onSeeAll={() => navigation.navigate('AllCategories')}
                />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {concernsList.map((concern, index) => (
                        <ConcernCard
                            key={concern.id}
                            concern={concern}
                            onPress={() => handleConcernPress(concern)}
                            index={index}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    };

    // Recently Viewed Section (using featured products as data since we don't have view tracking)
    const renderRecentlyViewed = () => {
        // Show products (using featured/all products as we don't track recently viewed yet)
        const recentProducts = featuredProducts.length > 0 ? featuredProducts : allProducts;

        if (recentProducts.length === 0) return null;

        return (
            <View style={styles.section}>
                <SectionHeader
                    title="Recently Viewed"
                    onSeeAll={() => navigation.navigate('AllProducts', { title: 'All Products' })}
                />
                <View style={styles.productsGrid}>
                    {recentProducts.slice(0, 4).map((item) => (
                        <ProductCard
                            key={item.id}
                            product={item}
                            onPress={() => handleProductPress(item)}
                            onAddToCart={() => handleAddToCart(item)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    // All Products CTA Section
    const renderViewAllProducts = () => (
        <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('AllProducts', { title: 'All Products' })}
            activeOpacity={0.8}
        >
            <Text style={styles.viewAllText}>View All Products</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textOnPrimary} />
        </TouchableOpacity>
    );

    // Loading State
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={['top']}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {renderHeader()}
                {renderSearchBar()}
                {renderCategories()}
                {renderBanner()}
                {renderFeaturedProducts()}
                {renderConcerns()}
                {renderRecentlyViewed()}
                {renderViewAllProducts()}
                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 2,
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.error,
        borderWidth: 2,
        borderColor: colors.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
    },
    searchIconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchPlaceholder: {
        flex: 1,
        ...typography.body,
        color: colors.textSecondary,
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: spacing.xl,
    },
    horizontalScroll: {
        paddingHorizontal: spacing.lg,
    },
    productCardWrapper: {
        marginRight: spacing.md,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        justifyContent: 'space-between',
    },
    emptyContainer: {
        width: width - spacing.lg * 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    viewAllText: {
        ...typography.button,
        color: colors.textOnPrimary,
        fontWeight: '700',
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default HomeScreen;
