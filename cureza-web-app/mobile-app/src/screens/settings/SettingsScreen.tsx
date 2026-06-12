import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { useAuthStore } from '../../store';

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { logout } = useAuthStore();

    const [pushNotifications, setPushNotifications] = React.useState(true);
    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [orderUpdates, setOrderUpdates] = React.useState(true);
    const [promotions, setPromotions] = React.useState(false);

    const handleChangePassword = () => {
        Alert.prompt(
            'Change Password',
            'Enter your new password',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Update', onPress: (pwd) => console.log('Password:', pwd) },
            ],
            'secure-text'
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
                            <Ionicons name="lock-closed-outline" size={22} color={colors.textSecondary} />
                            <Text style={styles.menuText}>Change Password</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.sectionContent}>
                        <View style={styles.toggleItem}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleLabel}>Push Notifications</Text>
                                <Text style={styles.toggleDesc}>Receive push notifications</Text>
                            </View>
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={pushNotifications ? colors.primary : colors.textLight}
                            />
                        </View>

                        <View style={styles.toggleItem}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleLabel}>Email Notifications</Text>
                                <Text style={styles.toggleDesc}>Receive email updates</Text>
                            </View>
                            <Switch
                                value={emailNotifications}
                                onValueChange={setEmailNotifications}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={emailNotifications ? colors.primary : colors.textLight}
                            />
                        </View>

                        <View style={styles.toggleItem}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleLabel}>Order Updates</Text>
                                <Text style={styles.toggleDesc}>Get notified about order status</Text>
                            </View>
                            <Switch
                                value={orderUpdates}
                                onValueChange={setOrderUpdates}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={orderUpdates ? colors.primary : colors.textLight}
                            />
                        </View>

                        <View style={styles.toggleItem}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleLabel}>Promotions & Offers</Text>
                                <Text style={styles.toggleDesc}>Receive deals and discounts</Text>
                            </View>
                            <Switch
                                value={promotions}
                                onValueChange={setPromotions}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={promotions ? colors.primary : colors.textLight}
                            />
                        </View>
                    </View>
                </View>

                {/* App Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="language-outline" size={22} color={colors.textSecondary} />
                            <Text style={styles.menuText}>Language</Text>
                            <Text style={styles.menuValue}>English</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="moon-outline" size={22} color={colors.textSecondary} />
                            <Text style={styles.menuText}>Theme</Text>
                            <Text style={styles.menuValue}>Light</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
                            <Text style={styles.menuText}>Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="shield-outline" size={22} color={colors.textSecondary} />
                            <Text style={styles.menuText}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
                            <Ionicons name="trash-outline" size={22} color={colors.error} />
                            <Text style={styles.dangerText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>Cureza</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
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
    sectionContent: {
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
    menuText: {
        ...typography.body,
        color: colors.textPrimary,
        flex: 1,
    },
    menuValue: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    toggleInfo: {
        flex: 1,
    },
    toggleLabel: {
        ...typography.body,
        color: colors.textPrimary,
    },
    toggleDesc: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    dangerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    dangerText: {
        ...typography.body,
        color: colors.error,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    appName: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    appVersion: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default SettingsScreen;
