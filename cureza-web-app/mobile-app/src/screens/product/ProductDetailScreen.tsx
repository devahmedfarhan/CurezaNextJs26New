import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button } from '../../components';
import { productsApi, Product } from '../../api';
import { useCartStore } from '../../store';
import { HomeStackParamList } from '../../navigation/types';
import { formatPrice, formatNumber } from '../../utils/format';

type ProductDetailRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ProductDetail'>;

const { width, height } = Dimensions.get('window');

const FEATURES = [
    { icon: 'leaf-outline', title: '100% Natural' },
    { icon: 'shield-checkmark-outline', title: 'Certified' },
    { icon: 'cube-outline', title: 'Free Shipping' },
    { icon: 'refresh-outline', title: 'Easy Returns' },
];

export const ProductDetailScreen: React.FC = () => {
    const navigation = useNavigation<ProductDetailNavigationProp>();
    const route = useRoute<ProductDetailRouteProp>();
    const { slug } = route.params;
    const { addToCart, isLoading: cartLoading } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadProduct();
    }, [slug]);

    const loadProduct = async () => {
        try {
            const data = await productsApi.getProduct(slug);
            setProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            await addToCart({ product_id: product.id, quantity });
            Alert.alert('Added to Cart!', 'Continue shopping or checkout now.', [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'Go to Cart', onPress: () => (navigation as any).navigate('CartTab') },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add to cart');
        }
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    const increaseQuantity = () => setQuantity((q) => q + 1);
    const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading product...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
                <Text style={styles.errorText}>Product not found</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
            </View>
        );
    }

    const hasDiscount = product.sale_price && product.price && product.sale_price < product.price;
    const displayPrice = Number(product.sale_price ?? product.price ?? 0);
    const discountPercent = hasDiscount ? Math.round((1 - product.sale_price! / product.price) * 100) : 0;
    const images = product.images?.length > 0 ? product.images : [product.image];

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Animated Header */}
            <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.animatedHeaderContent}>
                        <TouchableOpacity style={styles.headerButtonSmall} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.animatedHeaderTitle} numberOfLines={1}>{product.title}</Text>
                        <TouchableOpacity style={styles.headerButtonSmall} onPress={handleWishlist}>
                            <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={20} color={isWishlisted ? colors.error : colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* Fixed Header Buttons */}
            <SafeAreaView style={styles.fixedHeader} edges={['top']}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="share-social-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleWishlist}>
                            <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={24} color={isWishlisted ? colors.error : colors.textPrimary} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
            >
                {/* Image Gallery */}
                <View style={styles.imageSection}>
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setSelectedImageIndex(index);
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.imageSlide}>
                                <Image source={{ uri: item }} style={styles.mainImage} resizeMode="contain" />
                            </View>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />

                    {/* Image Indicators */}
                    <View style={styles.imageIndicators}>
                        {images.map((_, index) => (
                            <View key={index} style={[styles.indicator, selectedImageIndex === index && styles.indicatorActive]} />
                        ))}
                    </View>

                    {/* Discount Badge */}
                    {hasDiscount ? (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discountPercent + '% OFF'}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Product Info Card */}
                <View style={styles.infoCard}>
                    {/* Brand */}
                    <TouchableOpacity style={styles.brandRow}>
                        <View style={styles.brandBadge}>
                            <Text style={styles.brandText}>{product.brand?.name || 'Cureza'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title}>{product.title}</Text>

                    {/* Rating Row */}
                    <View style={styles.ratingRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#FFF" />
                            <Text style={styles.ratingText}>{formatNumber(product.rating)}</Text>
                        </View>
                        <Text style={styles.reviewsText}>{(product.reviews_count || 0) + ' Reviews'}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.soldText}>{(product.sales_count || 100) + '+ Sold'}</Text>
                    </View>

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <View style={styles.priceRow}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
                            {hasDiscount ? (
                                <Text style={styles.originalPrice}>{'₹' + formatPrice(product.price)}</Text>
                            ) : null}
                        </View>
                        {hasDiscount ? (
                            <View style={styles.saveBadge}>
                                <Ionicons name="pricetag" size={12} color={colors.success} />
                                <Text style={styles.saveText}>{'Save ₹' + formatPrice(product.price - displayPrice)}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Stock & Delivery */}
                    <View style={styles.deliverySection}>
                        <View style={styles.deliveryItem}>
                            {product.stock > 0 ? (
                                <>
                                    <View style={[styles.stockDot, { backgroundColor: colors.success }]} />
                                    <Text style={[styles.stockText, { color: colors.success }]}>In Stock</Text>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.stockDot, { backgroundColor: colors.error }]} />
                                    <Text style={[styles.stockText, { color: colors.error }]}>Out of Stock</Text>
                                </>
                            )}
                        </View>
                        <View style={styles.deliveryItem}>
                            <Ionicons name="flash" size={16} color={colors.warning} />
                            <Text style={styles.deliveryText}>Usually delivered in 3-5 days</Text>
                        </View>
                    </View>
                </View>

                {/* Features Strip */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresContainer}>
                    {FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.featureText}>{feature.title}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Quantity Selector */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Select Quantity</Text>
                    <View style={styles.quantityRow}>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]} onPress={decreaseQuantity} disabled={quantity <= 1}>
                                <Ionicons name="remove" size={20} color={quantity > 1 ? colors.textPrimary : colors.textLight} />
                            </TouchableOpacity>
                            <View style={styles.quantityValueContainer}>
                                <Text style={styles.quantityValue}>{quantity}</Text>
                            </View>
                            <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                                <Ionicons name="add" size={20} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.totalPrice}>{'Total: ₹' + formatPrice(displayPrice * quantity)}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Product Description</Text>
                    <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 4}>
                        {product.description || 'No description available.'}
                    </Text>
                    {product.description && product.description.length > 200 ? (
                        <TouchableOpacity style={styles.readMoreButton} onPress={() => setShowFullDescription(!showFullDescription)}>
                            <Text style={styles.readMoreText}>{showFullDescription ? 'Show Less' : 'Read More'}</Text>
                            <Ionicons name={showFullDescription ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Product Details */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Product Details</Text>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>SKU</Text>
                            <Text style={styles.detailValue}>{product.sku || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>{product.category?.name || 'General'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Weight</Text>
                            <Text style={styles.detailValue}>{product.weight ? product.weight + 'g' : 'N/A'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Brand</Text>
                            <Text style={styles.detailValue}>{product.brand?.name || 'Cureza'}</Text>
                        </View>
                    </View>
                </View>

                {/* Why Choose This */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Why Choose This Product?</Text>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={styles.benefitText}>Premium quality ingredients</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={styles.benefitText}>Clinically tested and approved</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={styles.benefitText}>No harmful chemicals or additives</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={styles.benefitText}>Suitable for all skin types</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </Animated.ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <LinearGradient colors={['transparent', colors.background]} style={styles.bottomGradient} />
                <View style={styles.bottomBarContent}>
                    <View style={styles.bottomPriceInfo}>
                        <Text style={styles.bottomLabel}>Total Price</Text>
                        <Text style={styles.bottomPrice}>{'₹' + formatPrice(displayPrice * quantity)}</Text>
                    </View>
                    <Button
                        title="Add to Cart"
                        onPress={handleAddToCart}
                        loading={cartLoading}
                        disabled={product.stock <= 0}
                        style={styles.addToCartButton}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSecondary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    errorText: { ...typography.h3, color: colors.textSecondary, marginTop: spacing.md },

    animatedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
    animatedHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    animatedHeaderTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary, flex: 1, marginHorizontal: spacing.md, textAlign: 'center' },
    headerButtonSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },

    fixedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 99, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    headerRight: { flexDirection: 'row', gap: spacing.sm },

    imageSection: { backgroundColor: colors.background, paddingTop: 100 },
    imageSlide: { width, height: width * 0.9, justifyContent: 'center', alignItems: 'center' },
    mainImage: { width: '90%', height: '90%' },
    imageIndicators: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.xs },
    indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    indicatorActive: { width: 24, backgroundColor: colors.primary },
    discountBadge: { position: 'absolute', top: 110, left: spacing.lg, backgroundColor: colors.error, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.lg },
    discountText: { ...typography.caption, fontWeight: '700', color: '#FFF' },

    infoCard: { backgroundColor: colors.background, marginHorizontal: spacing.md, marginTop: -spacing.lg, borderRadius: borderRadius.xl, padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 8 },
    brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    brandBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.lg },
    brandText: { ...typography.caption, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md, lineHeight: 32 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm, gap: 4 },
    ratingText: { ...typography.caption, fontWeight: '700', color: '#FFF' },
    reviewsText: { ...typography.bodySmall, color: colors.primary, marginLeft: spacing.sm, textDecorationLine: 'underline' },
    divider: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: spacing.md },
    soldText: { ...typography.bodySmall, color: colors.textSecondary },

    priceSection: { marginBottom: spacing.md },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
    currencySymbol: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
    price: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, lineHeight: 42 },
    originalPrice: { ...typography.body, color: colors.textLight, textDecorationLine: 'line-through', marginLeft: spacing.sm, marginBottom: 6 },
    saveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '15', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.lg, alignSelf: 'flex-start', gap: spacing.xs, marginTop: spacing.sm },
    saveText: { ...typography.caption, fontWeight: '600', color: colors.success },

    deliverySection: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.md, gap: spacing.sm },
    deliveryItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    stockDot: { width: 8, height: 8, borderRadius: 4 },
    stockText: { ...typography.bodySmall, fontWeight: '600' },
    deliveryText: { ...typography.bodySmall, color: colors.textSecondary },

    featuresContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.md },
    featureItem: { alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.lg, marginRight: spacing.sm },
    featureIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
    featureText: { ...typography.caption, color: colors.textPrimary, fontWeight: '500' },

    sectionCard: { backgroundColor: colors.background, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: borderRadius.lg, padding: spacing.lg },
    sectionTitle: { ...typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },

    quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.xs },
    quantityButton: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
    quantityButtonDisabled: { opacity: 0.4 },
    quantityValueContainer: { minWidth: 48, alignItems: 'center' },
    quantityValue: { ...typography.h3, color: colors.textPrimary },
    totalPrice: { ...typography.body, fontWeight: '600', color: colors.primary },

    description: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
    readMoreButton: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
    readMoreText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    detailItem: { width: '50%', marginBottom: spacing.md },
    detailLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
    detailValue: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },

    benefitsList: { gap: spacing.sm },
    benefitItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    benefitText: { ...typography.body, color: colors.textSecondary },

    bottomPadding: { height: 120 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    bottomGradient: { height: 20, marginBottom: -1 },
    bottomBarContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.lg },
    bottomPriceInfo: {},
    bottomLabel: { ...typography.caption, color: colors.textSecondary },
    bottomPrice: { ...typography.h2, color: colors.textPrimary },
    addToCartButton: { flex: 1 },
});

export default ProductDetailScreen;
