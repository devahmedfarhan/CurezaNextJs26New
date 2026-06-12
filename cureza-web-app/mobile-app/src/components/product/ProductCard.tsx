import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Product } from '../../api';
import { formatPrice, formatNumber } from '../../utils/format';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    onAddToCart?: () => void;
    onWishlistToggle?: () => void;
    isInWishlist?: boolean;
    horizontal?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onPress,
    onAddToCart,
    onWishlistToggle,
    isInWishlist = false,
    horizontal = false,
}) => {
    const hasDiscount = product.sale_price && product.price && product.sale_price < product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.sale_price! / product.price) * 100)
        : 0;

    // Safely handle null/undefined prices with fallback and explicit number conversion
    const displayPrice = Number(product.sale_price ?? product.price ?? 0);

    if (horizontal) {
        return (
            <TouchableOpacity
                style={styles.horizontalContainer}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: product.image }}
                    style={styles.horizontalImage}
                    resizeMode="cover"
                />

                <View style={styles.horizontalContent}>
                    <Text style={styles.brand} numberOfLines={1}>
                        {product.brand?.name || 'Cureza'}
                    </Text>
                    <Text style={styles.title} numberOfLines={2}>
                        {product.title}
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{formatPrice(displayPrice)}</Text>
                        {hasDiscount && (
                            <>
                                <Text style={styles.originalPrice}>₹{formatPrice(product.price)}</Text>
                                <Text style={styles.discount}>{discountPercent}% OFF</Text>
                            </>
                        )}
                    </View>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color={colors.warning} />
                        <Text style={styles.rating}>{formatNumber(product.rating)}</Text>
                        <Text style={styles.reviews}>({product.reviews_count || 0})</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discountPercent}%</Text>
                    </View>
                )}

                {onWishlistToggle && (
                    <TouchableOpacity
                        style={styles.wishlistButton}
                        onPress={onWishlistToggle}
                    >
                        <Ionicons
                            name={isInWishlist ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isInWishlist ? colors.error : colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.brand} numberOfLines={1}>
                    {product.brand?.name || 'Cureza'}
                </Text>
                <Text style={styles.title} numberOfLines={2}>
                    {product.title}
                </Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{formatPrice(displayPrice)}</Text>
                    {hasDiscount && (
                        <Text style={styles.originalPrice}>₹{formatPrice(product.price)}</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color={colors.warning} />
                        <Text style={styles.ratingSmall}>{formatNumber(product.rating)}</Text>
                    </View>

                    {onAddToCart && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={onAddToCart}
                        >
                            <Ionicons name="add" size={18} color={colors.textOnPrimary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.backgroundSecondary,
    },
    discountBadge: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        backgroundColor: colors.error,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    discountText: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.textOnPrimary,
    },
    wishlistButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.background,
        padding: spacing.xs,
        borderRadius: borderRadius.full,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        padding: spacing.sm,
    },
    brand: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    title: {
        ...typography.bodySmall,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
        height: 36,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    price: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    originalPrice: {
        ...typography.caption,
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    discount: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.success,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingSmall: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 28,
        height: 28,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Horizontal variant
    horizontalContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    horizontalImage: {
        width: 120,
        height: 120,
        backgroundColor: colors.backgroundSecondary,
    },
    horizontalContent: {
        flex: 1,
        padding: spacing.md,
        justifyContent: 'center',
    },
    rating: {
        ...typography.bodySmall,
        color: colors.textPrimary,
        marginLeft: 4,
    },
    reviews: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});

export default ProductCard;
