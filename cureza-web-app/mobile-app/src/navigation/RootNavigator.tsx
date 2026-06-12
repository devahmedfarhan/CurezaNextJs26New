import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store';
import { config } from '../constants';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainTabs from './MainTabs';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderSuccessScreen from '../screens/cart/OrderSuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { isAuthenticated, isInitialized, initialize } = useAuthStore();
    const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

    useEffect(() => {
        // Check if onboarding has been completed
        const checkOnboarding = async () => {
            const completed = await SecureStore.getItemAsync(config.STORAGE_KEYS.ONBOARDING_COMPLETE);
            setShowOnboarding(completed !== 'true');
        };

        checkOnboarding();
        initialize();
    }, []);

    // Show splash while initializing
    if (!isInitialized || showOnboarding === null) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                {showOnboarding && !isAuthenticated ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : !isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Group screenOptions={{ presentation: 'modal' }}>
                            <Stack.Screen name="Cart" component={CheckoutNavigator} />
                        </Stack.Group>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// Checkout flow as modal stack
const CheckoutStack = createNativeStackNavigator();

const CheckoutNavigator = () => (
    <CheckoutStack.Navigator screenOptions={{ headerShown: false }}>
        <CheckoutStack.Screen name="Checkout" component={CheckoutScreen} />
        <CheckoutStack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </CheckoutStack.Navigator>
);

export default RootNavigator;
