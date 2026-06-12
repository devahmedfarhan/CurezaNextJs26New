# Cureza Mobile App 📱

A premium, feature-rich React Native e-commerce application built with Expo and TypeScript. This app serves as the customer-facing mobile platform for the Cureza multi-vendor marketplace.

## 🌟 Key Features

### 🛍️ Shopping Experience
*   **Home & Discovery**: Dynamic home screen with categories, concerns, and recent products.
*   **Product Details**: Premium UI with animated headers, image galleries, reviews, and detailed specifications.
*   **Smart Search**: Search by product name, category, or concern.
*   **Cart Management**: Real-time cart updates, coupon application, and upsell suggestions.

### 💳 Checkout & Payments
*   **Smooth Checkout**: Address selection/creation, payment method choice (COD/Online).
*   **Order Summary**: Detailed breakdown of items, discounts, shipping, GST (CGST/SGST/IGST).
*   **Order Placed Modal**: Beautiful animated confirmation with "View Orders" and "Continue Shopping" options.

### 📦 Order Tracking
*   **Detailed Order History**: List of all past and active orders with status badges.
*   **Comprehensive Order Details**: 
    *   Visual tracking timeline (Placed → Processing → Shipped → Delivered).
    *   Full price breakdown including taxes.
    *   Shipping and Billing address views.
    *   Seller/Brand information for each item.

### 👤 User Profile & Settings
*   **Address Management**: Add, edit, delete, and set default delivery addresses.
*   **Settings**: Manage notifications, change password (placeholder), and app preferences.
*   **Help & Support**: Access FAQs, contact support via Call/Email/WhatsApp, and doctor consultation.
*   **Legal**: Privacy Policy, Terms of Service, and Refund Policy pages.

## 🛠️ Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Navigation**: [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Networking**: [Axios](https://axios-http.com/)
*   **Icons**: [Ionicons](https://ionic.io/ionicons)
*   **Styling**: StyleSheet API with a centralized design system (`src/constants`)

## 🚀 Getting Started

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or yarn
*   Expo Go app on your physical device (Android/iOS) or an Emulator

### Installation

1.  **Navigate to the mobile app directory:**
    ```bash
    cd mobile-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server:**
    ```bash
    npx expo start
    ```

4.  **Run on Device:**
    *   Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
    *   Press `a` to run on Android Emulator.
    *   Press `i` to run on iOS Simulator (macOS only).

## 📂 Project Structure

```
mobile-app/
├── src/
│   ├── api/            # API client and endpoints (auth, cart, orders, etc.)
│   ├── components/     # Reusable UI components (Button, TextInput, etc.)
│   ├── constants/      # Design system (colors, typography, spacing)
│   ├── navigation/     # Stack and Tab navigators
│   ├── screens/        # Application screens
│   │   ├── auth/       # Login, Signup
│   │   ├── cart/       # Cart, Checkout
│   │   ├── home/       # Home, Product Lists
│   │   ├── orders/     # Order History, Details
│   │   ├── product/    # Product Details
│   │   ├── profile/    # Profile, Settings, Addresses, Support
│   │   └── ...
│   ├── store/          # Zustand state stores (Auth, Cart)
│   └── utils/          # Helper functions (formatting, validation)
├── App.tsx             # Entry point
└── ...
```

## 🔧 Configuration

The bulk of the API configuration can be found in `src/api/client.ts`. Ensure your backend base URL is correctly set in `src/constants/config.ts` (if available) or directly in the client file for local development (e.g., `http://10.0.2.2:8000/api` for Android Emulator accessing localhost).

## 📱 Screenshots

*(Add screenshots of Home, Product Detail, Cart, Checkout, and Order Details here)*

---
Built with ❤️ for Cureza
