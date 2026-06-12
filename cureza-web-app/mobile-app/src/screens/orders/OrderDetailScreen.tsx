import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { ordersApi } from '../../api';
import { OrdersStackParamList } from '../../navigation/types';

type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>;

const TRACKING_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: 'checkmark-circle' },
    { key: 'processing', label: 'Processing', icon: 'cube' },
    { key: 'shipped', label: 'Shipped', icon: 'airplane' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export const OrderDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<OrderDetailRouteProp>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const data = await ordersApi.getOrder(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Error loading order:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (value: number | undefined | null): string => {
        return ((value ?? 0)).toFixed(2);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }) + ' ' + date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIndex = (status: string) => {
        const idx = STATUS_ORDER.indexOf(status?.toLowerCase() || 'pending');
        return idx >= 0 ? idx : 0;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return colors.success;
            case 'cancelled': return colors.error;
            case 'shipped': return colors.info;
            case 'processing': return colors.warning;
            default: return colors.primary;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
                    <Text style={styles.errorText}>Order not found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.retryText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const shippingAddress = order.shipping_address || order.shipping_address_json || {};
    const billingAddress = order.billing_address || order.billing_address_json || {};
    const currentStatusIndex = getStatusIndex(order.status);
    const statusColor = getStatusColor(order.status);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <Text style={styles.headerSubtitle}>View and track your order</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Order Number</Text>
                            <Text style={styles.infoValue}>{order.order_number || order.id}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Order Date</Text>
                            <Text style={styles.infoValue}>{formatDate(order.created_at)}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Payment Method</Text>
                            <Text style={styles.infoValue}>{(order.payment_method || 'COD').toUpperCase()}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Order Status</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                                    {(order.status || 'Pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {(order.items || []).map((item: any, index: number) => {
                        const brandName = item.seller?.name || item.seller?.brand_name || item.product?.seller?.name || item.product?.brand?.name || '';
                        return (
                            <View key={item.id || index} style={styles.orderItem}>
                                <Image
                                    source={{ uri: item.image || item.product?.image || 'https://via.placeholder.com/80' }}
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemTitle} numberOfLines={2}>
                                        {item.title || item.product_name || item.product?.title || 'Product'}
                                    </Text>
                                    {brandName ? <Text style={styles.itemBrand}>{brandName}</Text> : null}
                                    {item.description || item.product?.short_description ? (
                                        <Text style={styles.itemDesc} numberOfLines={1}>
                                            {item.description || item.product?.short_description}
                                        </Text>
                                    ) : null}
                                    <View style={styles.itemPriceRow}>
                                        <Text style={styles.itemQty}>{'Qty: ' + (item.quantity || 1)}</Text>
                                        <Text style={styles.itemPrice}>{'₹' + formatPrice(item.price || item.unit_price)}</Text>
                                        <Text style={styles.itemTotal}>{'₹' + formatPrice(item.subtotal || item.total)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Details</Text>
                    <View style={styles.priceCard}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>{'₹' + formatPrice(order.subtotal || order.total_amount)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>{'Shipping (' + (order.shipping_method || 'Standard') + ')'}</Text>
                            <Text style={styles.priceValue}>
                                {(order.shipping_cost || order.shipping_amount || 0) > 0
                                    ? '₹' + formatPrice(order.shipping_cost || order.shipping_amount)
                                    : 'FREE'}
                            </Text>
                        </View>
                        {(order.cgst || order.cgst_amount) ? (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>{'CGST (' + (order.cgst_rate || 2.5) + '%)'}</Text>
                                <Text style={styles.priceValue}>{'₹' + formatPrice(order.cgst || order.cgst_amount)}</Text>
                            </View>
                        ) : null}
                        {(order.sgst || order.sgst_amount) ? (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>{'SGST (' + (order.sgst_rate || 2.5) + '%)'}</Text>
                                <Text style={styles.priceValue}>{'₹' + formatPrice(order.sgst || order.sgst_amount)}</Text>
                            </View>
                        ) : null}
                        {(order.igst || order.igst_amount) ? (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>{'IGST (' + (order.igst_rate || 5) + '%)'}</Text>
                                <Text style={styles.priceValue}>{'₹' + formatPrice(order.igst || order.igst_amount)}</Text>
                            </View>
                        ) : null}
                        {(order.tax || order.tax_amount) && !order.cgst && !order.igst ? (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Tax</Text>
                                <Text style={styles.priceValue}>{'₹' + formatPrice(order.tax || order.tax_amount)}</Text>
                            </View>
                        ) : null}
                        {(order.discount || order.discount_amount || 0) > 0 ? (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Discount</Text>
                                <Text style={[styles.priceValue, { color: colors.success }]}>
                                    {'-₹' + formatPrice(order.discount || order.discount_amount)}
                                </Text>
                            </View>
                        ) : null}
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>{'₹' + formatPrice(order.total || order.final_amount)}</Text>
                        </View>
                        <Text style={styles.taxNote}>(Inclusive of all taxes)</Text>
                    </View>
                </View>

                {/* Tracking Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tracking Status</Text>
                    <View style={styles.timeline}>
                        {TRACKING_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;
                            return (
                                <View key={step.key} style={styles.timelineStep}>
                                    <View style={styles.timelineLeft}>
                                        <View style={[
                                            styles.timelineDot,
                                            isCompleted && styles.timelineDotCompleted,
                                            isCurrent && styles.timelineDotCurrent,
                                        ]}>
                                            <Ionicons
                                                name={step.icon as any}
                                                size={16}
                                                color={isCompleted ? colors.textOnPrimary : colors.textLight}
                                            />
                                        </View>
                                        {index < TRACKING_STEPS.length - 1 && (
                                            <View style={[
                                                styles.timelineLine,
                                                isCompleted && styles.timelineLineCompleted,
                                            ]} />
                                        )}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={[
                                            styles.timelineLabel,
                                            isCompleted && styles.timelineLabelCompleted,
                                        ]}>
                                            {step.label}
                                        </Text>
                                        <Text style={styles.timelineSubtext}>
                                            {isCompleted && index === 0
                                                ? formatDateTime(order.created_at)
                                                : isCompleted
                                                    ? 'Completed'
                                                    : 'Pending...'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Addresses */}
                <View style={styles.section}>
                    <View style={styles.addressRow}>
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <Ionicons name="location" size={18} color={colors.primary} />
                                <Text style={styles.addressTitle}>Shipping Address</Text>
                            </View>
                            <Text style={styles.addressName}>{shippingAddress.name || 'N/A'}</Text>
                            <Text style={styles.addressText}>{shippingAddress.address_line_1 || ''}</Text>
                            <Text style={styles.addressText}>
                                {(shippingAddress.city || '') + ' - ' + (shippingAddress.pincode || '')}
                            </Text>
                            <Text style={styles.addressPhone}>{shippingAddress.phone || ''}</Text>
                        </View>
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <Ionicons name="document-text" size={18} color={colors.primary} />
                                <Text style={styles.addressTitle}>Billing Address</Text>
                            </View>
                            <Text style={styles.addressName}>{billingAddress.name || 'N/A'}</Text>
                            <Text style={styles.addressText}>{billingAddress.address_line_1 || ''}</Text>
                            <Text style={styles.addressText}>
                                {(billingAddress.city || '') + ' - ' + (billingAddress.pincode || '')}
                            </Text>
                            <Text style={styles.addressPhone}>{billingAddress.phone || ''}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSecondary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    errorText: { ...typography.h3, color: colors.textSecondary, marginTop: spacing.md },
    retryButton: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.lg },
    retryText: { ...typography.button, color: colors.textOnPrimary },

    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    headerSubtitle: { ...typography.caption, color: colors.textSecondary },
    placeholder: { width: 40 },

    infoCard: { backgroundColor: colors.background, margin: spacing.md, padding: spacing.lg, borderRadius: borderRadius.lg },
    infoRow: { flexDirection: 'row', marginBottom: spacing.md },
    infoItem: { flex: 1 },
    infoLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
    infoValue: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm, alignSelf: 'flex-start' },
    statusBadgeText: { ...typography.caption, fontWeight: '600' },

    section: { backgroundColor: colors.background, margin: spacing.md, marginTop: 0, padding: spacing.lg, borderRadius: borderRadius.lg },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },

    orderItem: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
    itemImage: { width: 80, height: 80, borderRadius: borderRadius.md, backgroundColor: colors.backgroundSecondary },
    itemDetails: { flex: 1 },
    itemTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    itemBrand: { ...typography.caption, color: colors.primary, marginTop: 2 },
    itemDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    itemPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.md },
    itemQty: { ...typography.caption, color: colors.textSecondary },
    itemPrice: { ...typography.caption, color: colors.textSecondary },
    itemTotal: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginLeft: 'auto' },

    priceCard: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
    priceLabel: { ...typography.body, color: colors.textSecondary },
    priceValue: { ...typography.body, color: colors.textPrimary },
    totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.md },
    totalLabel: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
    totalValue: { ...typography.h3, color: colors.primary, fontWeight: '700' },
    taxNote: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },

    timeline: { marginTop: spacing.sm },
    timelineStep: { flexDirection: 'row', minHeight: 60 },
    timelineLeft: { alignItems: 'center', width: 40 },
    timelineDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    timelineDotCompleted: { backgroundColor: colors.success },
    timelineDotCurrent: { backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.primary + '40' },
    timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
    timelineLineCompleted: { backgroundColor: colors.success },
    timelineContent: { flex: 1, paddingLeft: spacing.md, paddingBottom: spacing.md },
    timelineLabel: { ...typography.body, color: colors.textSecondary },
    timelineLabelCompleted: { color: colors.textPrimary, fontWeight: '600' },
    timelineSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

    addressRow: { flexDirection: 'row', gap: spacing.md },
    addressCard: { flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md },
    addressHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    addressTitle: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    addressName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    addressText: { ...typography.caption, color: colors.textSecondary },
    addressPhone: { ...typography.caption, color: colors.textPrimary, marginTop: spacing.xs },

    bottomPadding: { height: spacing.xl },
});

export default OrderDetailScreen;
