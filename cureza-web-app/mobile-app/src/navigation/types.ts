import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    OTPVerification: { email?: string; phone?: string; mode: 'verify' | 'reset' };
};

// Main Tab Navigator
export type MainTabParamList = {
    HomeTab: NavigatorScreenParams<HomeStackParamList>;
    SearchTab: undefined;
    CartTab: undefined;
    OrdersTab: NavigatorScreenParams<OrdersStackParamList>;
    ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack
export type HomeStackParamList = {
    Home: undefined;
    ProductDetail: { slug: string };
    CategoryProducts: { categoryId: number; categoryName: string; categorySlug: string };
    ConcernProducts: { concernId: number; concernName: string };
    BrandProducts: { brandSlug: string; brandName: string };
    AllProducts: { title?: string; filter?: string };
    AllCategories: undefined;
};

// Orders Stack
export type OrdersStackParamList = {
    OrdersList: undefined;
    OrderDetail: { orderId: number };
    OrderTracking: { orderId: number };
};

// Profile Stack
export type ProfileStackParamList = {
    Profile: undefined;
    EditProfile: undefined;
    Addresses: undefined;
    AddAddress: { address?: any };
    CurezaCircle: undefined;
    Notifications: undefined;
    Settings: undefined;
    DoctorConsult: undefined;
    Wishlist: undefined;
    MyReviews: undefined;
    HelpSupport: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
    RefundPolicy: undefined;
    PaymentMethods: undefined;
};

// Cart Stack
export type CartStackParamList = {
    Cart: undefined;
    Checkout: undefined;
    OrderSuccess: { orderId: number };
};

// Root Navigator
export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    Cart: NavigatorScreenParams<CartStackParamList>;
};

// Screen props type helper
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
