import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';

const FAQs = [
    {
        question: 'How can I track my order?',
        answer: 'You can track your order by going to Orders section in the app. Click on any order to see detailed tracking information including current status and expected delivery date.',
    },
    {
        question: 'What payment methods are accepted?',
        answer: 'We accept Cash on Delivery (COD), Credit/Debit Cards, UPI, and Net Banking. All payments are 100% secure.',
    },
    {
        question: 'How do I return a product?',
        answer: 'To return a product, go to your order details and click on "Return Item". Follow the instructions to schedule a pickup. Returns are accepted within 7 days of delivery.',
    },
    {
        question: 'How can I cancel my order?',
        answer: 'You can cancel your order from the order details page before it is shipped. Once shipped, you\'ll need to wait for delivery and then initiate a return.',
    },
    {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption and secure payment gateways. Your payment information is never stored on our servers.',
    },
];

export const HelpSupportScreen: React.FC = () => {
    const navigation = useNavigation();
    const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

    const handleCall = () => {
        Linking.openURL('tel:+919782425733');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@cureza.com');
    };

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/919782425733');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Contact Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <View style={styles.contactCards}>
                        <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                            <View style={[styles.contactIcon, { backgroundColor: colors.success + '20' }]}>
                                <Ionicons name="call" size={24} color={colors.success} />
                            </View>
                            <Text style={styles.contactTitle}>Call Us</Text>
                            <Text style={styles.contactSubtitle}>24/7 Support</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                            <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="mail" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.contactTitle}>Email</Text>
                            <Text style={styles.contactSubtitle}>Get response in 24hrs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
                            <View style={[styles.contactIcon, { backgroundColor: '#25D36620' }]}>
                                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                            </View>
                            <Text style={styles.contactTitle}>WhatsApp</Text>
                            <Text style={styles.contactSubtitle}>Quick chat</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Doctor Consultation Card */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.doctorCard} onPress={() => (navigation as any).navigate('DoctorConsult')}>
                        <View style={styles.doctorIcon}>
                            <Ionicons name="medkit" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorTitle}>Talk to a Doctor</Text>
                            <Text style={styles.doctorSubtitle}>Get professional health advice from certified doctors</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* FAQs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {FAQs.map((faq, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqQuestion}>{faq.question}</Text>
                                <Ionicons
                                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            {expandedFaq === index ? (
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Links</Text>
                    <View style={styles.quickLinks}>
                        <TouchableOpacity style={styles.quickLink} onPress={() => (navigation as any).navigate('PrivacyPolicy')}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                            <Text style={styles.quickLinkText}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickLink} onPress={() => (navigation as any).navigate('TermsOfService')}>
                            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                            <Text style={styles.quickLinkText}>Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickLink} onPress={() => (navigation as any).navigate('RefundPolicy')}>
                            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                            <Text style={styles.quickLinkText}>Refund Policy</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                        </TouchableOpacity>
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
    content: { flex: 1 },

    section: { padding: spacing.lg },
    sectionTitle: { ...typography.body, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },

    contactCards: { flexDirection: 'row', gap: spacing.md },
    contactCard: { flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
    contactIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    contactTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
    contactSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

    doctorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.primary + '30' },
    doctorIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
    doctorInfo: { flex: 1 },
    doctorTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    doctorSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

    faqItem: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { ...typography.body, fontWeight: '500', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
    faqAnswer: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },

    quickLinks: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, overflow: 'hidden' },
    quickLink: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
    quickLinkText: { ...typography.body, color: colors.textPrimary, flex: 1 },

    bottomPadding: { height: spacing.xl },
});

export default HelpSupportScreen;
