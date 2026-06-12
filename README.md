# Cureza Application - Setup & Running Guide

## Current Status ✓

### Frontend (Running)
- **Status:** ✅ Next.js dev server running
- **URL:** http://localhost:3000
- **Port:** 3000
- **Framework:** Next.js 16.0.4 with Turbopack

### Backend (Requires Setup)
- **Status:** ⚠️ Requires PHP installation
- **Required:** PHP 8.2+, Composer
- **Port:** 8000
- **Framework:** Laravel 12

---

## To Run the Full Application

### Option 1: Install PHP Locally (Recommended for Development)

#### Step 1: Install PHP 8.2
Download from https://www.php.net/downloads.php or use:
- **Windows**: Download Windows builds from https://windows.php.net/
- **Or use**: Laragon (https://laragon.org/) - includes PHP, MySQL, Composer all in one

#### Step 2: Install Composer
Download from https://getcomposer.org/

#### Step 3: Setup Backend

```powershell
cd cureza-web-app/backend
composer install
php artisan migrate
php artisan serve
```

The backend API will be available at: http://localhost:8000/api

### Option 2: Use Laravel Sail (Docker-based)

If you have Docker Desktop installed:

```powershell
cd cureza-web-app/backend
composer install
./vendor/bin/sail up
```

### Option 3: Use WSL2 or Virtual Machine

Run Laravel on Windows Subsystem for Linux or a dedicated Linux VM.

---

## Frontend Configuration

The frontend automatically points to the backend API. The endpoint is configured in:
- **File:** `frontend/src/lib/api.ts`
- **Default Base URL:** `http://localhost:8000/api`
- **Environment Variable:** `NEXT_PUBLIC_BACKEND_URL`

You can override by creating a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
```

---

## Access Points After Full Setup

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:3000 | Customer UI |
| **Backend API** | http://localhost:8000/api | REST API endpoints |
| **Admin Panel** | http://localhost:3000/superadmin | Admin dashboard |
| **Seller Panel** | http://localhost:3000/seller | Vendor dashboard |
| **Doctor Panel** | http://localhost:3000/doctor | Doctor dashboard |

---

## Recommended Next Steps

1. **Install Laragon** (includes everything needed):
   - Download: https://laragon.org/
   - Drag & drop the backend folder into Laragon
   - Click "Start" to run PHP & MySQL automatically

2. **Or Use WSL2 + Linux**:
   - Install WSL2 from Microsoft Store
   - Install PHP & Composer via apt
   - Run `php artisan serve` inside WSL

3. **Once Backend is Running**:
   - Frontend (port 3000) will automatically connect to backend (port 8000)
   - Database will be initialized via migrations
   - You can start creating users and testing features

---

## Current Running Service

✅ **Next.js Frontend:** http://localhost:3000 (Ready for development)

Once you set up PHP and run the backend, the full application will be functional.

---

## Quick Test

To verify frontend is working, visit: **http://localhost:3000**

You should see the Cureza homepage. API calls will fail until the backend is running, but the UI will load.
