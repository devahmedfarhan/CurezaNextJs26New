import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { ordersApi, Order } from '../../api';
import { OrdersStackParamList } from '../../navigation/types';

type OrdersListNavigationProp = NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>;

const STATUS_COLORS: Record<string, string> = {
    pending: colors.warning,
    processing: colors.info,
    shipped: colors.secondary,
    delivered: colors.success,
    cancelled: colors.error,
    refunded: colors.textSecondary,
};

export const OrdersListScreen: React.FC = () => {
    const navigation = useNavigation<OrdersListNavigationProp>();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchOrders = async (pageNum = 1, isRefresh = false) => {
        try {
            const response = await ordersApi.getOrders(pageNum);

            if (isRefresh || pageNum === 1) {
                setOrders(response.data || response);
            } else {
                setOrders((prev) => [...prev, ...(response.data || response)]);
            }

            setHasMore(response.current_page < response.last_page);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refetch orders when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchOrders(1, true);
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        await fetchOrders(1, true);
    }, []);

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchOrders(nextPage);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderOrder = ({ item }: { item: any }) => {
        const orderNumber = item.order_number || item.id;
        const status = item.status || 'pending';
        const total = item.total || item.final_amount || 0;
        const itemCount = item.items?.length || 0;
        const date = item.created_at;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderNumber}>{'Order #' + orderNumber}</Text>
                        <Text style={styles.orderDate}>{formatDate(date)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[status] || colors.textSecondary) + '20' }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLORS[status] || colors.textSecondary }]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderItems}>
                    <Text style={styles.itemCount}>{itemCount + ' items'}</Text>
                    <Text style={styles.orderTotal}>{'₹' + Number(total).toFixed(0)}</Text>
                </View>

                <View style={styles.orderFooter}>
                    <TouchableOpacity style={styles.trackButton}>
                        <Ionicons name="location-outline" size={16} color={colors.primary} />
                        <Text style={styles.trackText}>Track Order</Text>
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
                Your order history will appear here once you make a purchase
            </Text>
        </View>
    );

    if (loading && orders.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrder}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && orders.length > 0 ? (
                        <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
                    ) : null
                }
            />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    listContent: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    orderCard: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    orderNumber: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    orderDate: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '600',
    },
    orderItems: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.divider,
    },
    itemCount: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    orderTotal: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    trackText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '500',
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
    },
    footerLoader: {
        marginVertical: spacing.lg,
    },
});

export default OrdersListScreen;
