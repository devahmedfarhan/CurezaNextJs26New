import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants';
import { Button } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';

export const OrderSuccessScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as { orderId: number };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                </View>
                <Text style={styles.title}>Order Placed!</Text>
                <Text style={styles.subtitle}>
                    Your order #{orderId} has been placed successfully
                </Text>
                <Button
                    title="View Order"
                    onPress={() => (navigation as any).navigate('OrdersTab', {
                        screen: 'OrderDetail',
                        params: { orderId },
                    })}
                    style={styles.button}
                />
                <Button
                    title="Continue Shopping"
                    variant="outline"
                    onPress={() => (navigation as any).navigate('Main', { screen: 'HomeTab' })}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    button: {
        marginBottom: spacing.md,
        width: '100%',
    },
});

export default OrderSuccessScreen;
