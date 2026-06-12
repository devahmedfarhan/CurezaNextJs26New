import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button, TextInput } from '../../components';
import { CouponDrawer } from '../../components/cart/CouponDrawer';
import { useCartStore } from '../../store';
import { CartItem } from '../../api';
import { formatPrice } from '../../utils/format';

export const CartScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        items,
        summary,
        isLoading,
        fetchCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
    } = useCartStore();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [showCouponDrawer, setShowCouponDrawer] = useState(false);

    useEffect(() => {
        fetchCart();
    }, []);

    const handleApplyCoupon = async (code?: string) => {
        const codeToApply = code || couponCode.trim();
        if (!codeToApply) return;

        const result = await applyCoupon(codeToApply);
        if (!result.success) {
            setCouponError(result.message);
        } else {
            setCouponError('');
            setCouponCode(codeToApply);
            setShowCouponDrawer(false);
        }
    };

    const handleRemoveCoupon = async () => {
        await removeCoupon();
        setCouponCode('');
        setCouponError('');
    };

    const handleSelectCouponFromDrawer = (code: string) => {
        setCouponCode(code);
        handleApplyCoupon(code);
    };

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            Alert.alert('Remove Item', 'Remove this item from cart?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => removeItem(itemId), style: 'destructive' },
            ]);
            return;
        }
        await updateQuantity(itemId, newQuantity);
    };

    const handleCheckout = () => {
        (navigation as any).navigate('Cart', { screen: 'Checkout' });
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemPrice}>₹{formatPrice(item.price)}</Text>

                <View style={styles.quantityRow}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                            <Ionicons name="remove" size={16} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                            <Ionicons name="add" size={16} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmptyCart = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>
                Looks like you haven't added anything to your cart yet
            </Text>
            <Button
                title="Start Shopping"
                onPress={() => (navigation as any).navigate('HomeTab')}
                style={styles.shopButton}
            />
        </View>
    );

    const renderSummary = () => (
        <View style={styles.summaryContainer}>
            {/* Coupon Section */}
            <View style={styles.couponSection}>
                {summary?.coupon_applied ? (
                    <View style={styles.appliedCoupon}>
                        <View style={styles.couponBadge}>
                            <Ionicons name="pricetag" size={16} color={colors.success} />
                            <Text style={styles.couponAppliedText}>{summary.coupon_applied}</Text>
                        </View>
                        <TouchableOpacity onPress={handleRemoveCoupon}>
                            <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.couponInput}>
                            <TextInput
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChangeText={setCouponCode}
                                error={couponError}
                                leftIcon="pricetag-outline"
                                containerStyle={styles.couponInputField}
                            />
                            <Button
                                title="Apply"
                                variant="outline"
                                size="small"
                                onPress={() => handleApplyCoupon()}
                                disabled={!couponCode.trim()}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllCoupons}
                            onPress={() => setShowCouponDrawer(true)}
                        >
                            <Ionicons name="gift-outline" size={18} color={colors.primary} />
                            <Text style={styles.viewAllCouponsText}>View All Coupons</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Subtotal</Text>
                    <Text style={styles.priceValue}>{'₹' + formatPrice(summary?.subtotal)}</Text>
                </View>

                {(summary?.discount ?? 0) > 0 && (
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Discount</Text>
                        <Text style={[styles.priceValue, styles.discountValue]}>
                            {'-₹' + formatPrice(summary?.discount)}
                        </Text>
                    </View>
                )}

                {(summary?.total_tax ?? 0) > 0 && (
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>GST</Text>
                        <Text style={styles.priceValue}>{'₹' + formatPrice(summary?.total_tax)}</Text>
                    </View>
                )}

                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Shipping</Text>
                    <Text style={styles.priceValue}>
                        {(summary?.shipping_cost ?? 0) > 0 ? '₹' + formatPrice(summary?.shipping_cost) : 'FREE'}
                    </Text>
                </View>

                <View style={[styles.priceRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{'₹' + formatPrice(summary?.final_total)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Shopping Cart</Text>
                <Text style={styles.itemCount}>{items.length} items</Text>
            </View>

            {items.length === 0 ? (
                renderEmptyCart()
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCartItem}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListFooterComponent={renderSummary}
                    />

                    {/* Checkout Button */}
                    <View style={styles.checkoutBar}>
                        <View style={styles.checkoutInfo}>
                            <Text style={styles.checkoutTotal}>₹{formatPrice(summary?.final_total)}</Text>
                            <Text style={styles.checkoutLabel}>Total Amount</Text>
                        </View>
                        <Button
                            title="Proceed to Checkout"
                            onPress={handleCheckout}
                            loading={isLoading}
                            style={styles.checkoutButton}
                        />
                    </View>
                </>
            )}

            {/* Coupon Selection Drawer */}
            <CouponDrawer
                visible={showCouponDrawer}
                onClose={() => setShowCouponDrawer(false)}
                onSelectCoupon={handleSelectCouponFromDrawer}
                appliedCoupon={summary?.coupon_applied}
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    itemCount: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    listContent: {
        padding: spacing.lg,
    },
    cartItem: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundSecondary,
    },
    itemInfo: {
        flex: 1,
    },
    itemBrand: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    itemTitle: {
        ...typography.bodySmall,
        fontWeight: '500',
        color: colors.textPrimary,
        marginVertical: 4,
    },
    itemPrice: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        minWidth: 24,
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: spacing.md,
    },
    summaryContainer: {
        marginTop: spacing.lg,
    },
    couponSection: {
        marginBottom: spacing.lg,
    },
    couponInput: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    couponInputField: {
        flex: 1,
        marginBottom: 0,
    },
    appliedCoupon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.success + '10',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.success,
    },
    couponBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    couponAppliedText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.success,
    },
    viewAllCoupons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        marginTop: spacing.sm,
        backgroundColor: colors.primary + '10',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary + '30',
        borderStyle: 'dashed',
    },
    viewAllCouponsText: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.primary,
    },
    priceBreakdown: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    priceLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    priceValue: {
        ...typography.body,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    discountValue: {
        color: colors.success,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: spacing.sm,
        paddingTop: spacing.md,
    },
    totalLabel: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    totalValue: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },
    shopButton: {
        marginTop: spacing.md,
    },
    checkoutBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
        gap: spacing.md,
    },
    checkoutInfo: {
        alignItems: 'flex-start',
    },
    checkoutTotal: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    checkoutLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    checkoutButton: {
        flex: 1,
    },
});

export default CartScreen;
