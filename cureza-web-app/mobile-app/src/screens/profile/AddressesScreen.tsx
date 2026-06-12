import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { addressApi, Address } from '../../api';
import { Button } from '../../components';

export const AddressesScreen: React.FC = () => {
    const navigation = useNavigation();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formAddress1, setFormAddress1] = useState('');
    const [formAddress2, setFormAddress2] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formState, setFormState] = useState('');
    const [formPincode, setFormPincode] = useState('');
    const [formDefault, setFormDefault] = useState(false);
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [])
    );

    const loadAddresses = async () => {
        try {
            const data = await addressApi.getAddresses();
            setAddresses(data || []);
        } catch (error) {
            console.error('Error loading addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormPhone('');
        setFormAddress1('');
        setFormAddress2('');
        setFormCity('');
        setFormState('');
        setFormPincode('');
        setFormDefault(false);
        setEditingAddress(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (address: Address) => {
        setEditingAddress(address);
        setFormName(address.name || '');
        setFormPhone(address.phone || '');
        setFormAddress1(address.address_line_1 || '');
        setFormAddress2(address.address_line_2 || '');
        setFormCity(address.city || '');
        setFormState(address.state || '');
        setFormPincode(address.pincode || '');
        setFormDefault(address.is_default || false);
        setShowAddModal(true);
    };

    const handleSaveAddress = async () => {
        if (!formName || !formPhone || !formAddress1 || !formCity || !formState || !formPincode) {
            Alert.alert('Missing Fields', 'Please fill all required fields.');
            return;
        }

        setSaving(true);
        try {
            const addressData = {
                name: formName,
                phone: formPhone,
                address_line_1: formAddress1,
                address_line_2: formAddress2,
                city: formCity,
                state: formState,
                pincode: formPincode,
                country: 'India',
                is_default: formDefault || addresses.length === 0,
            };

            if (editingAddress) {
                await addressApi.updateAddress(editingAddress.id, addressData);
            } else {
                await addressApi.createAddress(addressData);
            }

            setShowAddModal(false);
            resetForm();
            loadAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            Alert.alert('Error', 'Failed to save address. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = (addressId: number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressApi.deleteAddress(addressId);
                            loadAddresses();
                        } catch (error) {
                            console.error('Error deleting address:', error);
                            Alert.alert('Error', 'Failed to delete address.');
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (addressId: number) => {
        try {
            await addressApi.updateAddress(addressId, { is_default: true });
            loadAddresses();
        } catch (error) {
            console.error('Error setting default:', error);
            Alert.alert('Error', 'Failed to set default address.');
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Addresses</Text>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={60} color={colors.textLight} />
                        <Text style={styles.emptyTitle}>No Addresses Saved</Text>
                        <Text style={styles.emptyText}>Add your delivery addresses for faster checkout</Text>
                        <Button title="Add Address" onPress={openAddModal} style={styles.addFirstButton} />
                    </View>
                ) : (
                    addresses.map((address) => (
                        <View key={address.id} style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <View style={styles.addressIcon}>
                                    <Ionicons name="location" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.addressInfo}>
                                    <View style={styles.addressNameRow}>
                                        <Text style={styles.addressName}>{address.name || 'Address'}</Text>
                                        {address.is_default ? (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>Default</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <Text style={styles.addressPhone}>{address.phone || ''}</Text>
                                </View>
                            </View>
                            <Text style={styles.addressText}>{address.address_line_1 || ''}</Text>
                            {address.address_line_2 ? <Text style={styles.addressText}>{address.address_line_2}</Text> : null}
                            <Text style={styles.addressText}>
                                {(address.city || '') + ', ' + (address.state || '') + ' - ' + (address.pincode || '')}
                            </Text>

                            <View style={styles.addressActions}>
                                {!address.is_default ? (
                                    <TouchableOpacity style={styles.actionButton} onPress={() => handleSetDefault(address.id)}>
                                        <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                                        <Text style={styles.actionText}>Set Default</Text>
                                    </TouchableOpacity>
                                ) : null}
                                <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(address)}>
                                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                                    <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteAddress(address.id)}>
                                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                                    <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>
                            <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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

                            <TouchableOpacity style={styles.checkboxRow} onPress={() => setFormDefault(!formDefault)}>
                                <View style={[styles.checkbox, formDefault && styles.checkboxChecked]}>
                                    {formDefault ? <Ionicons name="checkmark" size={14} color={colors.textOnPrimary} /> : null}
                                </View>
                                <Text style={styles.checkboxLabel}>Set as default address</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button title="Cancel" variant="outline" onPress={() => { setShowAddModal(false); resetForm(); }} style={styles.modalButton} />
                            <Button title={editingAddress ? 'Update' : 'Save'} onPress={handleSaveAddress} loading={saving} style={styles.modalButton} />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    addButton: { width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, padding: spacing.lg },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl * 3 },
    emptyTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg },
    emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
    addFirstButton: { marginTop: spacing.lg },

    addressCard: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
    addressHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
    addressIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    addressInfo: { flex: 1 },
    addressNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    addressName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    addressPhone: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    defaultBadge: { backgroundColor: colors.success, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    defaultBadgeText: { ...typography.caption, color: colors.textOnPrimary, fontWeight: '600', fontSize: 10 },
    addressText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 48 },
    addressActions: { flexDirection: 'row', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider, gap: spacing.lg },
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    actionText: { ...typography.caption, color: colors.primary, fontWeight: '500' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { ...typography.h3, color: colors.textPrimary },
    modalBody: { padding: spacing.lg },
    modalFooter: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
    modalButton: { flex: 1 },

    inputLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
    textInput: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...typography.body, color: colors.textPrimary },
    inputRow: { flexDirection: 'row', gap: spacing.md },
    inputHalf: { flex: 1 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm },
    checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkboxLabel: { ...typography.body, color: colors.textPrimary },
});

export default AddressesScreen;
