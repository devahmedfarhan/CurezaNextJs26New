import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    TextInput,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button } from '../../components';
import { useCartStore, useAuthStore } from '../../store';
import { addressApi, Address } from '../../api';
import { formatPrice } from '../../utils/format';
import apiClient from '../../api/client';

const { width } = Dimensions.get('window');

type PaymentMethod = 'cod' | 'online';
type ModalState = 'hidden' | 'loading' | 'success' | 'error';

export const CheckoutScreen: React.FC = () => {
    const navigation = useNavigation();
    const { items, summary, fetchCart, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Modal state
    const [modalState, setModalState] = useState<ModalState>('hidden');
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const scaleAnim = useState(new Animated.Value(0.8))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];

    const [formName, setFormName] = useState(user?.name || '');
    const [formPhone, setFormPhone] = useState('');
    const [formAddress1, setFormAddress1] = useState('');
    const [formAddress2, setFormAddress2] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formState, setFormState] = useState('');
    const [formPincode, setFormPincode] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const animateModal = (show: boolean) => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: show ? 1 : 0.8,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacityAnim, {
                toValue: show ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const showModal = (state: ModalState) => {
        setModalState(state);
        animateModal(true);
    };

    const hideModal = () => {
        animateModal(false);
        setTimeout(() => setModalState('hidden'), 200);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            await fetchCart();
            if (isAuthenticated) {
                const addrs = await addressApi.getAddresses();
                setAddresses(addrs);
                const defaultAddr = addrs.find(a => a.is_default) || addrs[0];
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr);
                }
            }
        } catch (error) {
            console.error('Error loading checkout data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Address Required', 'Please select or add a delivery address.');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Cart Empty', 'Your cart is empty. Add items to continue.');
            return;
        }

        setPlacingOrder(true);
        showModal('loading');

        try {
            const addressData = {
                name: selectedAddress.name,
                phone: selectedAddress.phone,
                address_line_1: selectedAddress.address_line_1,
                address_line_2: selectedAddress.address_line_2 || '',
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
                country: selectedAddress.country || 'India',
            };

            const orderItems = items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
            }));

            const response = await apiClient.post('/orders', {
                billing_address: addressData,
                shipping_address: addressData,
                payment_method: paymentMethod,
                items: orderItems,
                coupon_code: summary?.coupon_applied || null,
            });

            await clearCart();
            setOrderNumber(response.data?.order_number || response.data?.id || '');
            showModal('success');
        } catch (error: any) {
            console.error('Order placement error:', error);
            setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to place order. Please try again.');
            showModal('error');
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleAddAddress = async () => {
        if (!formName || !formPhone || !formAddress1 || !formCity || !formState || !formPincode) {
            Alert.alert('Missing Fields', 'Please fill all required address fields.');
            return;
        }

        try {
            const created = await addressApi.createAddress({
                name: formName,
                phone: formPhone,
                address_line_1: formAddress1,
                address_line_2: formAddress2,
                city: formCity,
                state: formState,
                pincode: formPincode,
                country: 'India',
                is_default: addresses.length === 0,
            });
            setAddresses([...addresses, created]);
            setSelectedAddress(created);
            setShowAddressForm(false);
            setFormName(user?.name || '');
            setFormPhone('');
            setFormAddress1('');
            setFormAddress2('');
            setFormCity('');
            setFormState('');
            setFormPincode('');
        } catch (error) {
            console.error('Error creating address:', error);
            Alert.alert('Error', 'Failed to add address. Please try again.');
        }
    };

    const navigateToOrders = () => {
        hideModal();
        setTimeout(() => {
            (navigation as any).reset({
                index: 0,
                routes: [{ name: 'OrdersTab' }],
            });
        }, 300);
    };

    const navigateToHome = () => {
        hideModal();
        setTimeout(() => {
            (navigation as any).reset({
                index: 0,
                routes: [{ name: 'HomeTab' }],
            });
        }, 300);
    };

    const getSubtotalText = () => '₹' + formatPrice(summary?.subtotal);
    const getDiscountText = () => '-₹' + formatPrice(summary?.discount);
    const getTaxText = () => '₹' + formatPrice(summary?.total_tax);
    const getShippingText = () => (summary?.shipping_cost ?? 0) > 0 ? '₹' + formatPrice(summary?.shipping_cost) : 'FREE';
    const getTotalText = () => '₹' + formatPrice(summary?.final_total);
    const getItemsCountText = () => 'Items (' + items.length + ')';

    const renderOrderModal = () => {
        if (modalState === 'hidden') return null;

        return (
            <Modal transparent visible={modalState !== 'hidden'} animationType="none">
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: opacityAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        {modalState === 'loading' && (
                            <View style={styles.modalBody}>
                                <View style={styles.loadingCircle}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                                <Text style={styles.modalTitle}>Placing Your Order</Text>
                                <Text style={styles.modalSubtitle}>Please wait while we process your order...</Text>
                                <View style={styles.loadingDots}>
                                    <View style={[styles.dot, styles.dotActive]} />
                                    <View style={[styles.dot, styles.dotActive]} />
                                    <View style={[styles.dot, styles.dotActive]} />
                                </View>
                            </View>
                        )}

                        {modalState === 'success' && (
                            <View style={styles.modalBody}>
                                <View style={styles.successCircle}>
                                    <Ionicons name="checkmark" size={50} color={colors.textOnPrimary} />
                                </View>
                                <Text style={styles.modalTitle}>Order Placed!</Text>
                                <Text style={styles.modalSubtitle}>Your order has been successfully placed</Text>
                                {orderNumber ? (
                                    <View style={styles.orderNumberBadge}>
                                        <Text style={styles.orderNumberLabel}>Order Number</Text>
                                        <Text style={styles.orderNumberText}>{'#' + orderNumber}</Text>
                                    </View>
                                ) : null}
                                <View style={styles.successInfo}>
                                    <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                                    <Text style={styles.successInfoText}>You will receive a confirmation email shortly</Text>
                                </View>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.modalButtonSecondary} onPress={navigateToHome}>
                                        <Text style={styles.modalButtonSecondaryText}>Continue Shopping</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButtonPrimary} onPress={navigateToOrders}>
                                        <Text style={styles.modalButtonPrimaryText}>View Orders</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {modalState === 'error' && (
                            <View style={styles.modalBody}>
                                <View style={styles.errorCircle}>
                                    <Ionicons name="close" size={50} color={colors.textOnPrimary} />
                                </View>
                                <Text style={styles.modalTitle}>Order Failed</Text>
                                <Text style={styles.modalSubtitle}>{errorMessage}</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.modalButtonSecondary} onPress={hideModal}>
                                        <Text style={styles.modalButtonSecondaryText}>Try Again</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButtonPrimary} onPress={navigateToHome}>
                                        <Text style={styles.modalButtonPrimaryText}>Go Home</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading checkout...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        {!showAddressForm && (
                            <TouchableOpacity onPress={() => setShowAddressForm(true)}>
                                <Text style={styles.addNewText}>+ Add New</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {showAddressForm ? (
                        <View style={styles.addressForm}>
                            <Text style={styles.formTitle}>Add New Address</Text>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput style={styles.textInput} value={formName} onChangeText={setFormName} placeholder="Enter name" placeholderTextColor={colors.textLight} />
                            <Text style={styles.inputLabel}>Phone Number *</Text>
                            <TextInput style={styles.textInput} value={formPhone} onChangeText={setFormPhone} placeholder="Enter phone" keyboardType="phone-pad" placeholderTextColor={colors.textLight} />
                            <Text style={styles.inputLabel}>Address Line 1 *</Text>
                            <TextInput style={styles.textInput} value={formAddress1} onChangeText={setFormAddress1} placeholder="House/Flat No., Building, Street" placeholderTextColor={colors.textLight} />
                            <Text style={styles.inputLabel}>Address Line 2</Text>
                            <TextInput style={styles.textInput} value={formAddress2} onChangeText={setFormAddress2} placeholder="Landmark (optional)" placeholderTextColor={colors.textLight} />
                            <Text style={styles.inputLabel}>City *</Text>
                            <TextInput style={styles.textInput} value={formCity} onChangeText={setFormCity} placeholder="Enter city" placeholderTextColor={colors.textLight} />
                            <View style={styles.inputRow}>
                                <View style={styles.inputHalf}>
                                    <Text style={styles.inputLabel}>State *</Text>
                                    <TextInput style={styles.textInput} value={formState} onChangeText={setFormState} placeholder="Enter state" placeholderTextColor={colors.textLight} />
                                </View>
                                <View style={styles.inputHalf}>
                                    <Text style={styles.inputLabel}>Pincode *</Text>
                                    <TextInput style={styles.textInput} value={formPincode} onChangeText={setFormPincode} placeholder="Enter pincode" keyboardType="numeric" placeholderTextColor={colors.textLight} />
                                </View>
                            </View>
                            <View style={styles.formButtons}>
                                <Button title="Cancel" variant="outline" onPress={() => setShowAddressForm(false)} style={styles.formButton} />
                                <Button title="Save Address" onPress={handleAddAddress} style={styles.formButton} />
                            </View>
                        </View>
                    ) : addresses.length > 0 ? (
                        <View>
                            {addresses.map((address) => {
                                const isSelected = selectedAddress?.id === address.id;
                                const addressLine = (address.address_line_1 || '') + (address.address_line_2 ? ', ' + address.address_line_2 : '');
                                const cityLine = (address.city || '') + ', ' + (address.state || '') + ' - ' + (address.pincode || '');
                                return (
                                    <TouchableOpacity
                                        key={address.id}
                                        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                                        onPress={() => setSelectedAddress(address)}
                                    >
                                        <View style={styles.addressHeader}>
                                            <View style={styles.radioButton}>
                                                {isSelected ? <View style={styles.radioButtonSelected} /> : null}
                                            </View>
                                            <Text style={styles.addressName}>{address.name || ''}</Text>
                                            {address.is_default ? (
                                                <View style={styles.defaultBadge}>
                                                    <Text style={styles.defaultBadgeText}>Default</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <Text style={styles.addressText}>{addressLine}</Text>
                                        <Text style={styles.addressText}>{cityLine}</Text>
                                        <Text style={styles.addressPhone}>{address.phone || ''}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addAddressCard} onPress={() => setShowAddressForm(true)}>
                            <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                            <Text style={styles.addAddressText}>Add New Address</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <View style={styles.radioButton}>
                            {paymentMethod === 'cod' ? <View style={styles.radioButtonSelected} /> : null}
                        </View>
                        <Ionicons name="cash-outline" size={24} color={colors.textPrimary} />
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                            <Text style={styles.paymentDesc}>Pay when you receive your order</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('online')}
                    >
                        <View style={styles.radioButton}>
                            {paymentMethod === 'online' ? <View style={styles.radioButtonSelected} /> : null}
                        </View>
                        <Ionicons name="card-outline" size={24} color={colors.textPrimary} />
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentTitle}>Online Payment</Text>
                            <Text style={styles.paymentDesc}>Credit/Debit Card, UPI, NetBanking</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{getItemsCountText()}</Text>
                            <Text style={styles.summaryValue}>{getSubtotalText()}</Text>
                        </View>
                        {(summary?.discount ?? 0) > 0 ? (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Discount</Text>
                                <Text style={[styles.summaryValue, styles.discountText]}>{getDiscountText()}</Text>
                            </View>
                        ) : null}
                        {(summary?.total_tax ?? 0) > 0 ? (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>GST</Text>
                                <Text style={styles.summaryValue}>{getTaxText()}</Text>
                            </View>
                        ) : null}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>{getShippingText()}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{getTotalText()}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerTotal}>{getTotalText()}</Text>
                    <Text style={styles.footerLabel}>Total Amount</Text>
                </View>
                <Button
                    title="Place Order"
                    onPress={handlePlaceOrder}
                    loading={placingOrder}
                    disabled={!selectedAddress || items.length === 0}
                    style={styles.placeOrderButton}
                />
            </View>

            {renderOrderModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    placeholder: { width: 40 },
    content: { flex: 1 },
    section: { padding: spacing.lg, borderBottomWidth: 8, borderBottomColor: colors.backgroundSecondary },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
    addNewText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
    addressCard: { padding: spacing.md, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: 'transparent', marginBottom: spacing.sm },
    addressCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
    radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
    radioButtonSelected: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
    addressName: { ...typography.body, fontWeight: '600', color: colors.textPrimary, flex: 1 },
    defaultBadge: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    defaultBadgeText: { ...typography.caption, color: colors.textOnPrimary, fontWeight: '600' },
    addressText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 28 },
    addressPhone: { ...typography.bodySmall, color: colors.textPrimary, marginLeft: 28, marginTop: spacing.xs },
    addAddressCard: { padding: spacing.xl, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    addAddressText: { ...typography.body, color: colors.primary, marginTop: spacing.sm },
    addressForm: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md },
    formTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    inputLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
    textInput: { backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...typography.body, color: colors.textPrimary },
    inputRow: { flexDirection: 'row', gap: spacing.md },
    inputHalf: { flex: 1 },
    formButtons: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md },
    formButton: { flex: 1 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: 'transparent', marginBottom: spacing.sm, gap: spacing.md },
    paymentOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    paymentInfo: { flex: 1 },
    paymentTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    paymentDesc: { ...typography.caption, color: colors.textSecondary },
    summaryCard: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
    summaryLabel: { ...typography.body, color: colors.textSecondary },
    summaryValue: { ...typography.body, fontWeight: '500', color: colors.textPrimary },
    discountText: { color: colors.success },
    totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.md },
    totalLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    totalValue: { ...typography.h3, color: colors.textPrimary },
    bottomPadding: { height: 100 },
    footer: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background, gap: spacing.md },
    footerInfo: { alignItems: 'flex-start' },
    footerTotal: { ...typography.h3, color: colors.textPrimary },
    footerLabel: { ...typography.caption, color: colors.textSecondary },
    placeOrderButton: { flex: 1 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    modalContent: { backgroundColor: colors.background, borderRadius: borderRadius.xl, width: width - 48, maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
    modalBody: { padding: spacing.xl, alignItems: 'center' },
    loadingCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    errorCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    modalTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
    modalSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
    loadingDots: { flexDirection: 'row', gap: spacing.sm },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary },
    orderNumberBadge: { backgroundColor: colors.primary + '10', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.md },
    orderNumberLabel: { ...typography.caption, color: colors.textSecondary },
    orderNumberText: { ...typography.h3, color: colors.primary, fontWeight: '700' },
    successInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    successInfoText: { ...typography.caption, color: colors.textSecondary },
    modalButtons: { flexDirection: 'row', gap: spacing.md, width: '100%' },
    modalButtonPrimary: { flex: 1, backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
    modalButtonPrimaryText: { ...typography.button, color: colors.textOnPrimary },
    modalButtonSecondary: { flex: 1, backgroundColor: colors.backgroundSecondary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    modalButtonSecondaryText: { ...typography.button, color: colors.textPrimary },
});

export default CheckoutScreen;
