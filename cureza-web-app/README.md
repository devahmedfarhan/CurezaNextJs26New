# 🌿 Cureza Web Application

<div align="center">

![Cureza Logo](https://img.shields.io/badge/Cureza-Multi--Vendor_Wellness_Marketplace-2E7D32?style=for-the-badge&logo=leaf&logoColor=white)

**A Premier Multi-Vendor Wellness Marketplace for Ayurvedic, Herbal, CBD, and Doctor-Verified Wellness Products**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)

</div>

---

## 📑 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Project Structure](#️-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [🔗 Access Points](#-access-points)
- [📂 Application Modules](#-application-modules)
- [🔌 API Endpoints](#-api-endpoints)
- [🎨 Design System](#-design-system)
- [📝 Environment Variables](#-environment-variables)
- [🧪 Testing](#-testing)
- [📁 Directory Structure](#-directory-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ⚡ Daily Quick Start (Copy-Paste Commands)

> **For daily development**, just run these commands in two separate terminals:

### Terminal 1: Start Backend (Laravel API)

```powershell
cd c:\Users\Dr Farhan Ahmed Khan\.gemini\antigravity\scratch\cureza-web-app\backend
php artisan serve
```

✅ Backend will run at: **http://localhost:8000**

---

### Terminal 2: Start Frontend (Next.js)

```powershell
cd c:\Users\Dr Farhan Ahmed Khan\.gemini\antigravity\scratch\cureza-web-app\frontend
npm run dev
```

✅ Frontend will run at: **http://localhost:3000**

---

### 🎯 One-Liner Commands (PowerShell)

**Start Backend:**

```powershell
cd c:\Users\Dr Farhan Ahmed Khan\.gemini\antigravity\scratch\cureza-web-app\backend; php artisan serve
```

**Start Frontend:**

```powershell
cd c:\Users\Dr Farhan Ahmed Khan\.gemini\antigravity\scratch\cureza-web-app\frontend; npm run dev
```

---

### 📋 Quick Reference Card

| Action             | Command                                          |
| ------------------ | ------------------------------------------------ |
| **Start Backend**  | `cd cureza-web-app/backend && php artisan serve` |
| **Start Frontend** | `cd cureza-web-app/frontend && npm run dev`      |
| **Stop Server**    | Press `Ctrl + C` in terminal                     |
| **Open Website**   | http://localhost:3000                            |
| **Open API**       | http://localhost:8000/api                        |
| **Admin Panel**    | http://localhost:3000/superadmin                 |
| **Seller Panel**   | http://localhost:3000/seller                     |
| **Doctor Panel**   | http://localhost:3000/doctor                     |

---

## 🌟 Overview

**Cureza** is a comprehensive multi-vendor wellness marketplace designed to bridge the gap between authentic wellness sellers, certified doctors, and health-conscious consumers. The platform offers:

- 🛒 **Multi-Vendor Marketplace** - Verified sellers list and sell wellness products
- 👨‍⚕️ **Doctor Consultation Module** - Telemedicine features for prescription-based purchases
- 🏆 **Cureza Circle** - Community-driven loyalty and rewards system
- 🔗 **Affiliate System** - Performance-based marketing network
- ⚙️ **Admin Super Panel** - Centralized control for operations and analytics

---

## ✨ Features

### 🛍️ E-Commerce System

- Advanced product catalog with simple, variable, and bundle products
- Smart search & filtering with category, brand, price, and health concerns
- Persistent cart with guest checkout support
- Wishlist & Save for Later functionality

### 👥 Multi-Vendor System

- Seller onboarding with KYC verification (GST, PAN, FSSAI/Ayush)
- Dedicated vendor dashboard for inventory and order management
- Automated commission engine with split payments
- Shipping integration for automated label generation

### 💊 Prescription & Consultation

- Prescription upload for restricted medicines
- Integrated video/chat consultations with Ayurvedic doctors
- Digital prescription generation
- Doctor verification with registration validation

### 🎯 Affiliate & Referral

- Unique tracking links with marketing assets
- "Give X, Get Y" referral program
- Tiered commission system

### ⭐ Reviews & UGC

- Verified purchase reviews only
- Photo/video reviews with loyalty points
- Public Q&A sections

### 🏅 Cureza Circle (Loyalty)

- XP system for user actions
- Bronze, Silver, Gold loyalty tiers
- Reward store for point redemption

### 📝 CMS & SEO

- Full-featured blog engine
- Dynamic landing page builder
- Granular SEO control

---

## 🏗️ Project Structure

```
cureza-web-app/
├── 📁 frontend/          # Next.js 16 Application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities & API
│   ├── public/           # Static assets
│   └── package.json
│
├── 📁 backend/           # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── composer.json
│
└── 📄 SETUP_GUIDE.md     # Quick setup reference
```

---

## 🛠️ Tech Stack

### Frontend

| Technology        | Version | Purpose                      |
| ----------------- | ------- | ---------------------------- |
| **Next.js**       | 16.0.4  | React framework with SSR/ISR |
| **TypeScript**    | 5.x     | Type-safe JavaScript         |
| **Tailwind CSS**  | 4.x     | Utility-first CSS            |
| **Framer Motion** | 12.x    | Animations                   |
| **Radix UI**      | Latest  | Accessible UI components     |
| **TipTap**        | 3.x     | Rich text editor             |
| **Axios**         | 1.x     | HTTP client                  |
| **SWR**           | 2.x     | Data fetching                |

### Backend

| Technology          | Version | Purpose              |
| ------------------- | ------- | -------------------- |
| **Laravel**         | 12.x    | PHP framework        |
| **PHP**             | 8.2+    | Server-side language |
| **MySQL**           | 8.0     | Primary database     |
| **Laravel Sanctum** | 4.x     | API authentication   |
| **DomPDF**          | 3.x     | PDF generation       |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PHP** 8.2 or higher
- **Composer** 2.x
- **MySQL** 8.0
- **npm** or **yarn**

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd cureza-web-app/backend
   ```

2. **Install PHP dependencies:**

   ```bash
   composer install
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Update `.env` with your database credentials:**

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cureza
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run database migrations:**

   ```bash
   php artisan migrate
   ```

6. **Seed the database (optional):**

   ```bash
   php artisan db:seed
   ```

7. **Start the backend server:**

   ```bash
   php artisan serve
   ```

   The API will be available at: **http://localhost:8000/api**

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd cureza-web-app/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api" > .env.local
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at: **http://localhost:3000**

### 🐳 Alternative: Using Laravel Sail (Docker)

```bash
cd cureza-web-app/backend
composer install
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
```

---

## 🔗 Access Points

| Panel                     | URL                              | Description                  |
| ------------------------- | -------------------------------- | ---------------------------- |
| 🏠 **Customer Frontend**  | http://localhost:3000            | Main customer-facing website |
| 🔌 **Backend API**        | http://localhost:8000/api        | RESTful API endpoints        |
| 👤 **Customer Dashboard** | http://localhost:3000/dashboard  | User account & orders        |
| 🛒 **Seller Dashboard**   | http://localhost:3000/seller     | Vendor management panel      |
| 👨‍⚕️ **Doctor Dashboard**   | http://localhost:3000/doctor     | Doctor consultation panel    |
| ⚙️ **Super Admin Panel**  | http://localhost:3000/superadmin | Full platform control        |

---

## 📂 Application Modules

### Customer Routes

| Route              | Description                     |
| ------------------ | ------------------------------- |
| `/`                | Homepage with featured products |
| `/shop`            | Product listing with filters    |
| `/shop/[category]` | Category-specific products      |
| `/product/[slug]`  | Product detail page             |
| `/cart`            | Shopping cart                   |
| `/checkout`        | Checkout process                |
| `/login`           | User login                      |
| `/register`        | User registration               |
| `/dashboard`       | Customer dashboard              |
| `/wishlist`        | Saved products                  |
| `/blog`            | Wellness articles               |
| `/doctor`          | Doctor consultation booking     |
| `/community`       | Cureza Circle loyalty program   |

### Seller Routes (`/seller/*`)

| Route               | Description                |
| ------------------- | -------------------------- |
| `/seller/dashboard` | Sales overview & analytics |
| `/seller/products`  | Product management         |
| `/seller/orders`    | Order processing           |
| `/seller/inventory` | Stock management           |
| `/seller/payments`  | Revenue & payouts          |

### Doctor Routes (`/doctor/*`)

| Route                   | Description                  |
| ----------------------- | ---------------------------- |
| `/doctor/dashboard`     | Appointments overview        |
| `/doctor/appointments`  | Schedule management          |
| `/doctor/prescriptions` | Digital prescription builder |
| `/doctor/earnings`      | Consultation earnings        |

### Super Admin Routes (`/superadmin/*`)

| Route                    | Description                      |
| ------------------------ | -------------------------------- |
| `/superadmin/dashboard`  | Platform analytics               |
| `/superadmin/users`      | User management                  |
| `/superadmin/sellers`    | Seller verification & management |
| `/superadmin/doctors`    | Doctor verification              |
| `/superadmin/products`   | Master catalog                   |
| `/superadmin/orders`     | Global order management          |
| `/superadmin/categories` | Category management              |
| `/superadmin/brands`     | Brand management                 |
| `/superadmin/blog`       | Content management               |
| `/superadmin/settings`   | Global settings                  |
| `/superadmin/reports`    | Analytics & reports              |

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/register          # User registration
POST   /api/login             # User login
POST   /api/logout            # User logout
POST   /api/forgot-password   # Password reset
GET    /api/user              # Current user
```

### Products

```
GET    /api/products              # List all products
GET    /api/products/{id}         # Product details
GET    /api/products/slug/{slug}  # Product by slug
GET    /api/categories            # Product categories
GET    /api/brands                # Product brands
```

### Cart & Orders

```
GET    /api/cart                  # Get cart
POST   /api/cart                  # Add to cart
PUT    /api/cart/{id}             # Update cart item
DELETE /api/cart/{id}             # Remove from cart
POST   /api/orders                # Create order
GET    /api/orders                # Order history
GET    /api/orders/{id}           # Order details
```

### Doctor Consultations

```
GET    /api/doctors               # List doctors
GET    /api/doctors/{id}          # Doctor profile
POST   /api/consultations         # Book consultation
GET    /api/consultations         # User consultations
```

### Seller APIs

```
POST   /api/seller/register       # Seller registration
GET    /api/seller/products       # Seller products
POST   /api/seller/products       # Add product
PUT    /api/seller/products/{id}  # Update product
GET    /api/seller/orders         # Seller orders
```

---

## 🎨 Design System

### Color Palette

| Color            | Hex       | Usage               |
| ---------------- | --------- | ------------------- |
| **Cureza Green** | `#052326` | Primary brand color |
| **Sage Green**   | `#A5D6A7` | Secondary accents   |
| **Trust Blue**   | `#1976D2` | Medical module      |
| **Warm Sand**    | `#F5F5F5` | Background          |
| **Charcoal**     | `#212121` | Primary text        |
| **Alert Red**    | `#D32F2F` | Errors & warnings   |

### Typography

- **Headings:** Outfit / Plus Jakarta Sans
- **Body:** Inter / Lato

### Icons

- **Lucide React** - Consistent, modern icon set

---

## 📝 Environment Variables

### Backend (`.env`)

```env
APP_NAME=Cureza
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cureza
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
```

---

## 🧪 Testing

### Backend Tests

```bash
cd cureza-web-app/backend
php artisan test
```

### Frontend Lint

```bash
cd cureza-web-app/frontend
npm run lint
```

### Build Check

```bash
cd cureza-web-app/frontend
npm run build
```

---

## 📁 Directory Structure

### Frontend (`/frontend/src`)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── dashboard/         # Customer dashboard
│   ├── seller/            # Seller panel
│   ├── doctor/            # Doctor panel
│   ├── superadmin/        # Admin panel
│   ├── shop/              # Product pages
│   ├── blog/              # Blog pages
│   └── ...
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── ...
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & API client
└── types/                 # TypeScript types
```

### Backend (`/backend`)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/   # API Controllers
│   │   └── Middleware/    # Request middleware
│   ├── Models/            # Eloquent models
│   └── Services/          # Business logic
├── database/
│   ├── migrations/        # Database schema
│   └── seeders/           # Sample data
├── routes/
│   ├── api.php            # API routes
│   └── web.php            # Web routes
└── config/                # Configuration files
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">

**Built with ❤️ by the Cureza Team**

[🌐 Website](http://localhost:3000) • [📧 Contact](mailto:support@cureza.com) • [📚 Documentation](./SETUP_GUIDE.md)

</div>
