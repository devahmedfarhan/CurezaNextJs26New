// App configuration constants
export const config = {
    // API Configuration
    // IMPORTANT: Choose the correct URL based on your testing environment:
    // - Android Emulator: 'http://10.0.2.2:8000/api'
    // - iOS Simulator: 'http://localhost:8000/api'
    // - Physical Device (same WiFi): 'http://192.168.1.5:8000/api'
    // - Production: 'https://api.cureza.in/api'

    API_BASE_URL: __DEV__
        ? 'http://192.168.1.5:8000/api' // Physical device via Expo Go
        : 'https://api.cureza.in/api',


    // App Info
    APP_NAME: 'Cureza',
    APP_VERSION: '1.0.0',

    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_DATA: 'user_data',
        SESSION_ID: 'session_id',
        ONBOARDING_COMPLETE: 'onboarding_complete',
    },

    // Timeouts
    API_TIMEOUT: 30000, // 30 seconds

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
};

export default config;
