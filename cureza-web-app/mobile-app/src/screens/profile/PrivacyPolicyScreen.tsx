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

export const PrivacyPolicyScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        Welcome to Cureza. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our application and tell you about your privacy rights and how the law protects you.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        We collect information that you provide directly to us, including:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Name, email address, and phone number</Text>
                        <Text style={styles.bulletItem}>• Delivery address and billing information</Text>
                        <Text style={styles.bulletItem}>• Payment information (processed securely through our payment partners)</Text>
                        <Text style={styles.bulletItem}>• Order history and preferences</Text>
                        <Text style={styles.bulletItem}>• Health information you voluntarily provide for doctor consultations</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use the information we collect to:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Process and deliver your orders</Text>
                        <Text style={styles.bulletItem}>• Communicate with you about orders, products, and services</Text>
                        <Text style={styles.bulletItem}>• Provide customer support</Text>
                        <Text style={styles.bulletItem}>• Personalize your experience</Text>
                        <Text style={styles.bulletItem}>• Improve our services and develop new features</Text>
                        <Text style={styles.bulletItem}>• Comply with legal obligations</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing and against accidental loss, destruction, or damage. This includes encryption of sensitive data and secure payment processing through certified payment gateways.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Data Sharing</Text>
                    <Text style={styles.paragraph}>
                        We do not sell your personal data. We may share your information with:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Service providers who assist in order fulfillment and delivery</Text>
                        <Text style={styles.bulletItem}>• Payment processors for secure transactions</Text>
                        <Text style={styles.bulletItem}>• Healthcare professionals for consultation services</Text>
                        <Text style={styles.bulletItem}>• Law enforcement when required by law</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Your Rights</Text>
                    <Text style={styles.paragraph}>
                        You have the right to:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Access your personal data</Text>
                        <Text style={styles.bulletItem}>• Correct inaccurate data</Text>
                        <Text style={styles.bulletItem}>• Request deletion of your data</Text>
                        <Text style={styles.bulletItem}>• Object to processing of your data</Text>
                        <Text style={styles.bulletItem}>• Withdraw consent at any time</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
                    <Text style={styles.paragraph}>
                        Our application may use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage your preferences through your device settings.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
                    <Text style={styles.paragraph}>
                        Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you are a parent and believe your child has provided us with personal information, please contact us.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
                    <Text style={styles.paragraph}>
                        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about this privacy policy or our data practices, please contact us at:
                    </Text>
                    <View style={styles.contactBox}>
                        <Text style={styles.contactItem}>Email: privacy@cureza.in</Text>
                        <Text style={styles.contactItem}>Phone: +91 9782425733</Text>
                        <Text style={styles.contactItem}>Address: Jaipur, Rajasthan, India</Text>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    placeholder: { width: 40 },
    content: { flex: 1, padding: spacing.lg },

    lastUpdated: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },

    section: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
    paragraph: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },

    bulletList: { marginTop: spacing.sm, marginLeft: spacing.sm },
    bulletItem: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },

    contactBox: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.sm },
    contactItem: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.xs },

    bottomPadding: { height: spacing.xl },
});

export default PrivacyPolicyScreen;
