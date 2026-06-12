import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import apiClient from '../../api/client';

interface Coupon {
    code: string;
    title: string;
    description: string;
    discount: string;
    min_order_value?: number;
    valid_till?: string;
}

interface CouponDrawerProps {
    visible: boolean;
    onClose: () => void;
    onSelectCoupon: (code: string) => void;
    appliedCoupon?: string | null;
}

const { height } = Dimensions.get('window');

export const CouponDrawer: React.FC<CouponDrawerProps> = ({
    visible,
    onClose,
    onSelectCoupon,
    appliedCoupon,
}) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            fetchCoupons();
        }
    }, [visible]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/coupons');
            const couponData = response.data || [];
            setCoupons(couponData);
        } catch (err) {
            console.error('Error fetching coupons:', err);
            setError('Failed to load coupons');
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    const renderCoupon = ({ item }: { item: Coupon }) => {
        const isApplied = appliedCoupon === item.code;

        return (
            <View style={[styles.couponCard, isApplied && styles.couponCardApplied]}>
                <View style={styles.couponLeft}>
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discount}</Text>
                    </View>
                </View>
                <View style={styles.couponCenter}>
                    <Text style={styles.couponTitle}>{item.title}</Text>
                    <Text style={styles.couponDescription}>{item.description}</Text>
                    <View style={styles.couponMeta}>
                        {item.min_order_value && (
                            <Text style={styles.couponMetaText}>
                                Min. order: ₹{item.min_order_value}
                            </Text>
                        )}
                        {item.valid_till && (
                            <Text style={styles.couponMetaText}>
                                Valid till: {item.valid_till}
                            </Text>
                        )}
                    </View>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>Code: </Text>
                        <Text style={styles.codeValue}>{item.code}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.applyButton, isApplied && styles.appliedButton]}
                    onPress={() => !isApplied && onSelectCoupon(item.code)}
                    disabled={isApplied}
                >
                    <Text style={[styles.applyButtonText, isApplied && styles.appliedButtonText]}>
                        {isApplied ? 'Applied' : 'Apply'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>
                {error || 'No coupons available at the moment'}
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />
                <View style={styles.drawer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Available Coupons</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Coupon List */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Loading coupons...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={coupons}
                            keyExtractor={(item) => item.code}
                            renderItem={renderCoupon}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            ListEmptyComponent={renderEmpty}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    drawer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius.xl * 2,
        borderTopRightRadius: borderRadius.xl * 2,
        maxHeight: height * 0.7,
        paddingBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        padding: spacing.xl * 2,
        alignItems: 'center',
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    listContent: {
        padding: spacing.lg,
    },
    separator: {
        height: spacing.md,
    },
    emptyContainer: {
        padding: spacing.xl * 2,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    couponCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    couponCardApplied: {
        borderColor: colors.success,
        backgroundColor: colors.success + '10',
    },
    couponLeft: {
        marginRight: spacing.md,
    },
    discountBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    discountText: {
        ...typography.bodySmall,
        fontWeight: '700',
        color: colors.textOnPrimary,
    },
    couponCenter: {
        flex: 1,
    },
    couponTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    couponDescription: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    couponMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    couponMetaText: {
        ...typography.caption,
        color: colors.textLight,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    codeLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    codeValue: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.primary,
    },
    applyButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    appliedButton: {
        borderColor: colors.success,
        backgroundColor: colors.success,
    },
    applyButtonText: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.primary,
    },
    appliedButtonText: {
        color: colors.textOnPrimary,
    },
});

export default CouponDrawer;
