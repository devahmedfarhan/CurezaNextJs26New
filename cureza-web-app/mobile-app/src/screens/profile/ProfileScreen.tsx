import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { useAuthStore } from '../../store';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showBadge?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, showBadge }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
            <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.menuRight}>
            {showBadge && <View style={styles.badge} />}
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
    </TouchableOpacity>
);

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => (navigation as any).navigate('EditProfile')}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                        <Text style={styles.quickActionText}>Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => (navigation as any).navigate('CurezaCircle')}
                    >
                        <Ionicons name="star-outline" size={24} color={colors.primary} />
                        <Text style={styles.quickActionText}>Rewards</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="heart-outline" size={24} color={colors.primary} />
                        <Text style={styles.quickActionText}>Wishlist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="gift-outline" size={24} color={colors.primary} />
                        <Text style={styles.quickActionText}>Referrals</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Account</Text>
                    <View style={styles.menuContainer}>
                        <MenuItem
                            icon="location-outline"
                            title="Saved Addresses"
                            subtitle="Manage your delivery addresses"
                            onPress={() => (navigation as any).navigate('Addresses')}
                        />
                        <MenuItem
                            icon="card-outline"
                            title="Payment Methods"
                            subtitle="Manage payment options"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="notifications-outline"
                            title="Notifications"
                            subtitle="Order updates & offers"
                            onPress={() => (navigation as any).navigate('Notifications')}
                            showBadge
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services</Text>
                    <View style={styles.menuContainer}>
                        <MenuItem
                            icon="medkit-outline"
                            title="Doctor Consultation"
                            subtitle="Chat with certified doctors"
                            onPress={() => (navigation as any).navigate('DoctorConsult')}
                        />
                        <MenuItem
                            icon="document-text-outline"
                            title="Prescriptions"
                            subtitle="Upload & manage prescriptions"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & Settings</Text>
                    <View style={styles.menuContainer}>
                        <MenuItem
                            icon="help-circle-outline"
                            title="Help & Support"
                            subtitle="FAQs, Contact us"
                            onPress={() => (navigation as any).navigate('HelpSupport')}
                        />
                        <MenuItem
                            icon="settings-outline"
                            title="Settings"
                            subtitle="App preferences"
                            onPress={() => (navigation as any).navigate('Settings')}
                        />
                        <MenuItem
                            icon="shield-checkmark-outline"
                            title="Privacy Policy"
                            onPress={() => (navigation as any).navigate('PrivacyPolicy')}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.version}>Version 1.0.0</Text>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...typography.h1,
        color: colors.textOnPrimary,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    userEmail: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 2,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        marginHorizontal: spacing.lg,
    },
    quickAction: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    quickActionText: {
        ...typography.caption,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    section: {
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    menuContainer: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        ...typography.body,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    menuSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.error + '10',
    },
    logoutText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.error,
    },
    version: {
        ...typography.caption,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default ProfileScreen;
