import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { userApi } from '../../api';

export const CurezaCircleScreen: React.FC = () => {
    const navigation = useNavigation();
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await userApi.getWallet();
            setWallet(data);
        } catch (error) {
            console.error('Error loading wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cureza Circle</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Points Card */}
                <View style={styles.pointsCard}>
                    <View style={styles.pointsIcon}>
                        <Ionicons name="star" size={32} color={colors.warning} />
                    </View>
                    <Text style={styles.pointsValue}>{wallet?.balance || 0}</Text>
                    <Text style={styles.pointsLabel}>Reward Points</Text>
                    <Text style={styles.pointsWorth}>Worth ₹{((wallet?.balance || 0) / 10).toFixed(0)}</Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="gift-outline" size={24} color={colors.primary} />
                        <Text style={styles.statValue}>Silver</Text>
                        <Text style={styles.statLabel}>Membership</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="trending-up-outline" size={24} color={colors.success} />
                        <Text style={styles.statValue}>+{wallet?.transactions?.length || 0}</Text>
                        <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="calendar-outline" size={24} color={colors.secondary} />
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Months Active</Text>
                    </View>
                </View>

                {/* How to Earn */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How to Earn Points</Text>
                    <View style={styles.earnCard}>
                        <View style={styles.earnItem}>
                            <View style={styles.earnIcon}>
                                <Ionicons name="cart-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.earnContent}>
                                <Text style={styles.earnTitle}>Shop & Earn</Text>
                                <Text style={styles.earnDesc}>Earn 1 point for every ₹10 spent</Text>
                            </View>
                        </View>
                        <View style={styles.earnItem}>
                            <View style={styles.earnIcon}>
                                <Ionicons name="people-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.earnContent}>
                                <Text style={styles.earnTitle}>Refer Friends</Text>
                                <Text style={styles.earnDesc}>Get 100 points per referral</Text>
                            </View>
                        </View>
                        <View style={styles.earnItem}>
                            <View style={styles.earnIcon}>
                                <Ionicons name="star-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.earnContent}>
                                <Text style={styles.earnTitle}>Write Reviews</Text>
                                <Text style={styles.earnDesc}>Earn 10 points per review</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {wallet?.transactions?.length > 0 ? (
                        wallet.transactions.slice(0, 5).map((tx: any) => (
                            <View key={tx.id} style={styles.transactionItem}>
                                <View style={[
                                    styles.transactionIcon,
                                    { backgroundColor: tx.type === 'credit' ? colors.success + '20' : colors.error + '20' }
                                ]}>
                                    <Ionicons
                                        name={tx.type === 'credit' ? 'add' : 'remove'}
                                        size={16}
                                        color={tx.type === 'credit' ? colors.success : colors.error}
                                    />
                                </View>
                                <View style={styles.transactionContent}>
                                    <Text style={styles.transactionTitle}>{tx.description}</Text>
                                    <Text style={styles.transactionDate}>
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    { color: tx.type === 'credit' ? colors.success : colors.error }
                                ]}>
                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noTransactions}>No transactions yet</Text>
                    )}
                </View>

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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
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
    pointsCard: {
        alignItems: 'center',
        padding: spacing.xl,
        margin: spacing.lg,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.xl,
    },
    pointsIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    pointsValue: {
        ...typography.h1,
        fontSize: 48,
        color: colors.textOnPrimary,
    },
    pointsLabel: {
        ...typography.body,
        color: colors.textOnPrimary,
        opacity: 0.9,
    },
    pointsWorth: {
        ...typography.bodySmall,
        color: colors.textOnPrimary,
        opacity: 0.7,
        marginTop: spacing.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        padding: spacing.lg,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    statValue: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    section: {
        padding: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    earnCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    earnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        gap: spacing.md,
    },
    earnIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    earnContent: {
        flex: 1,
    },
    earnTitle: {
        ...typography.body,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    earnDesc: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    transactionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionContent: {
        flex: 1,
    },
    transactionTitle: {
        ...typography.bodySmall,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    transactionDate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    transactionAmount: {
        ...typography.body,
        fontWeight: '600',
    },
    noTransactions: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        padding: spacing.xl,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default CurezaCircleScreen;
