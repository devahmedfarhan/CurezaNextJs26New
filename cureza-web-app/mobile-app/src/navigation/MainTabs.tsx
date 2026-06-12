import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, HomeStackParamList, OrdersStackParamList, ProfileStackParamList } from './types';
import { colors, typography } from '../constants';
import { useCartStore } from '../store';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import AllCategoriesScreen from '../screens/home/AllCategoriesScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CategoryProductsScreen from '../screens/product/CategoryProductsScreen';
import AllProductsScreen from '../screens/product/AllProductsScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import CurezaCircleScreen from '../screens/cureza-circle/CurezaCircleScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
const HomeStackNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <HomeStack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
        <HomeStack.Screen name="AllCategories" component={AllCategoriesScreen} />
        <HomeStack.Screen name="AllProducts" component={AllProductsScreen} />
    </HomeStack.Navigator>
);

// Orders Stack Navigator
const OrdersStackNavigator = () => (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
        <OrdersStack.Screen name="OrdersList" component={OrdersListScreen} />
        <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </OrdersStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="Profile" component={ProfileScreen} />
        <ProfileStack.Screen name="Addresses" component={AddressesScreen} />
        <ProfileStack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <ProfileStack.Screen name="CurezaCircle" component={CurezaCircleScreen} />
        <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
        <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
);

// Custom Tab Bar Badge
const CartBadge = () => {
    const totalItems = useCartStore((state) => state.totalItems());

    if (totalItems === 0) return null;

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
        </View>
    );
};

export const MainTabs: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'HomeTab':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'SearchTab':
                            iconName = focused ? 'search' : 'search-outline';
                            break;
                        case 'CartTab':
                            iconName = focused ? 'cart' : 'cart-outline';
                            break;
                        case 'OrdersTab':
                            iconName = focused ? 'document-text' : 'document-text-outline';
                            break;
                        case 'ProfileTab':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }

                    return (
                        <View>
                            <Ionicons name={iconName} size={24} color={color} />
                            {route.name === 'CartTab' && <CartBadge />}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{ tabBarLabel: 'Search' }}
            />
            <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{ tabBarLabel: 'Cart' }}
            />
            <Tab.Screen
                name="OrdersTab"
                component={OrdersStackNavigator}
                options={{ tabBarLabel: 'Orders' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 65,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabBarLabel: {
        ...typography.caption,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        right: -10,
        top: -4,
        backgroundColor: colors.error,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.textOnPrimary,
        fontSize: 10,
        fontWeight: '700',
    },
});

export default MainTabs;
