// API Client
export { default as apiClient, getApiErrorMessage } from './client';

// Auth API
export { authApi } from './auth';
export type {
    User,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    OtpRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
} from './auth';

// Products API
export { productsApi, categoriesApi, brandsApi } from './products';
export type { Product, Category, ProductsResponse, ProductFilters } from './products';

// Cart API
export { cartApi } from './cart';
export type { CartItem, CartSummary, CartResponse, AddToCartRequest } from './cart';

// Orders API
export { ordersApi, checkoutApi, addressApi } from './orders';
export type {
    Order,
    OrderItem,
    OrdersResponse,
    Address,
    CheckoutData,
    CheckoutCalculation,
} from './orders';

// User API
export { userApi, notificationsApi, wishlistApi } from './user';
export type {
    WalletData,
    Notification,
    UserProfile,
    UserDashboard,
} from './user';
