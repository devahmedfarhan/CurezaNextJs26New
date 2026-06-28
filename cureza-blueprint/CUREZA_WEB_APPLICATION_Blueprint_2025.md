# CUREZA WEB APPLICATION – Complete Product & Engineering Blueprint (2025 Edition)

**Project:** Cureza - Multi-Vendor Wellness Marketplace  
**Version:** 1.0  
**Date:** November 2025  
**Target Platform:** Web Application (Desktop & Mobile Web)

---

## 1. Introduction & Context

### 1.1 Project Summary

Cureza is a premier multi-vendor wellness marketplace dedicated to Ayurvedic, herbal, CBD, and doctor-verified wellness products. The platform aims to bridge the gap between authentic wellness sellers, certified doctors, and health-conscious consumers.

The core ecosystem consists of:

- **Multi-Vendor Marketplace:** A robust platform for verified sellers to list and sell wellness products.
- **Doctor Consultation Module:** Integrated telemedicine features for prescription-based purchases and general wellness advice.
- **Cureza Circle:** A community-driven loyalty and rewards system to engage users.
- **Affiliate System:** A performance-based marketing network.
- **Admin Super Panel:** Centralized control for operations, compliance, and analytics.

### 1.2 Scope of Document

This blueprint covers the **Web Application** only. It provides a comprehensive guide for the product development, engineering architecture, UI/UX design, and go-to-market strategy for the web platform. Mobile application specifications are excluded from this document.

---

## 2. Section A: Complete Website Functionality Overview

### 2.1 E-Commerce System

The core of Cureza is a high-performance e-commerce engine designed for wellness products.

- **Catalog Management:** Support for simple, variable (size, weight), and bundle products.
- **Advanced Search & Filtering:** ElasticSearch/Algolia integration for instant search with filters for Category, Brand, Price, Health Concern (e.g., 'Digestion', 'Sleep'), and Ingredients.
- **Smart Cart & Checkout:** Persistent cart, guest checkout, and one-page optimized checkout flow.
- **Wishlist & Save for Later:** Users can save products and get notified of price drops.

### 2.2 Multi-Vendor System

A decentralized marketplace model allowing verified sellers to manage their own stores.

- **Seller Onboarding & KYC:** Automated workflow for GST, PAN, and FSSAI/Ayush license verification.
- **Vendor Dashboard:** Dedicated panel for inventory management, order processing, and sales analytics.
- **Commission Engine:** Automated split payments (Marketplace fee + Seller payout) handled via payment gateway or payout API.
- **Shipping Integration:** Integration with aggregators like Shiprocket for automated label generation and pickup scheduling.

### 2.3 Doctor Prescription & Consultation Module

A specialized module for regulated wellness products and professional advice.

- **Prescription Upload:** Users can upload existing prescriptions for verification before purchasing restricted medicines.
- **Tele-Consultation:** Integrated video/chat interface for real-time consultations with Ayurvedic doctors.
- **Digital Prescriptions:** Doctors can generate valid digital prescriptions directly within the platform, linked to the user's cart.
- **Doctor Verification:** Strict onboarding for practitioners with registration number validation.

### 2.4 Affiliate & Referral System

Growth engines to leverage community and influencers.

- **Affiliate Dashboard:** Unique tracking links, marketing assets, and real-time earnings tracking for influencers.
- **Referral Program:** 'Give X, Get Y' system for customer-to-customer referrals with wallet credit rewards.
- **Tiered Commission:** Configurable commission rates based on affiliate performance tiers.

### 2.5 User Generated Content (UGC) & Reviews

Building trust through social proof.

- **Verified Purchase Reviews:** Only verified buyers can leave product ratings.
- **Photo/Video Reviews:** Users can upload media with their reviews for extra loyalty points.
- **Q&A Section:** Public question and answer section on product pages, answerable by Sellers or Doctors.

### 2.6 Cureza Circle (Community XP & Loyalty)

Gamification to drive retention and engagement.

- **XP System:** Users earn Experience Points (XP) for actions (Login, Purchase, Review, Share).
- **Loyalty Tiers:** Bronze, Silver, Gold tiers unlocking exclusive discounts and free shipping.
- **Reward Store:** Redeem points for coupons or exclusive merchandise.

### 2.7 CMS & SEO Management

Tools for content marketing and organic visibility.

- **Blog Engine:** Full-featured blog for wellness articles, linked to related products.
- **Dynamic Landing Pages:** Drag-and-drop builder for campaign pages (e.g., 'Winter Wellness Sale').
- **SEO Control:** Granular control over Meta Tags, Schema Markup, and URL slugs for all pages.

### 2.8 Payment & Shipping

- **Payment Gateway:** Integration with Razorpay/PhonePe for UPI, Cards, Netbanking, and Wallets.
- **COD Management:** OTP verification for Cash on Delivery orders to reduce RTO.
- **Real-time Tracking:** End-to-end order tracking updates via WhatsApp and SMS.

---

## 3. Section B: FULL Website Screen List

### 3.1 CUSTOMER WEBSITE (Front-End)

#### **1. Core Navigation & Discovery**

| Screen ID | Screen Name                    | Description                                                                                                                    |
| :-------- | :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **C-01**  | **Homepage**                   | Hero slider, Featured Categories, 'Shop by Concern', Top Sellers, New Arrivals, Doctor Consultation CTA, Testimonials, Footer. |
| **C-02**  | **Mega Menu**                  | Hover-triggered menu showing Categories, Brands, Concerns, and 'Consult a Doctor' quick links.                                 |
| **C-03**  | **Search Results (Empty)**     | 'No results found' state with popular search suggestions and trending products.                                                |
| **C-04**  | **Search Results (Populated)** | Grid view of products matching query with sidebar filters (Price, Brand, Rating).                                              |
| **C-05**  | **Shop All / Category Page**   | Main listing page with sorting (Newest, Price Low-High), pagination/infinite scroll, and active filters.                       |
| **C-06**  | **Brand Listing Page**         | A-Z index of all brands and 'Featured Brands' carousel.                                                                        |
| **C-07**  | **Single Brand Store**         | Dedicated page for a specific brand (e.g., 'Dabur') with their banner, about info, and product list.                           |

#### **2. Product Experience**

| Screen ID | Screen Name                             | Description                                                                                  |
| :-------- | :-------------------------------------- | :------------------------------------------------------------------------------------------- |
| **C-08**  | **Product Details Page (Standard)**     | Images, Price, Description, Ingredients, How to Use, Reviews, 'Add to Cart', Seller Info.    |
| **C-09**  | **Product Details (Prescription Item)** | Similar to Standard, but 'Add to Cart' triggers a 'Prescription Required' modal/warning.     |
| **C-10**  | **Product Quick View**                  | Modal popup on listing pages showing key details and 'Add to Cart' without leaving the page. |
| **C-11**  | **Compare Products**                    | Side-by-side comparison of up to 4 products (Price, Ingredients, Benefits).                  |
| **C-12**  | **Write a Review**                      | Form to rate product (1-5 stars), write text, and upload photos/videos.                      |

#### **3. Cart & Checkout Flow**

| Screen ID | Screen Name                       | Description                                                                              |
| :-------- | :-------------------------------- | :--------------------------------------------------------------------------------------- |
| **C-13**  | **Shopping Cart (Slide-out)**     | Mini-cart drawer showing items, subtotal, and 'Checkout' button.                         |
| **C-14**  | **Shopping Cart (Full Page)**     | Detailed view, quantity adjustment, coupon code input, shipping estimator.               |
| **C-15**  | **Checkout: Login/Guest**         | Step 1: Prompt to login, signup, or continue as guest.                                   |
| **C-16**  | **Checkout: Address**             | Step 2: Add/Select delivery address.                                                     |
| **C-17**  | **Checkout: Prescription Upload** | Step 3 (Conditional): Upload prescription file if cart contains Rx items.                |
| **C-18**  | **Checkout: Payment**             | Step 4: Select payment method (UPI, Card, COD), apply wallet balance.                    |
| **C-19**  | **Order Success / Thank You**     | Confirmation message, Order ID, estimated delivery date, and 'Continue Shopping' button. |
| **C-20**  | **Order Failed**                  | Error message with retry payment option.                                                 |

#### **4. User Account & Profile**

| Screen ID | Screen Name                   | Description                                                                               |
| :-------- | :---------------------------- | :---------------------------------------------------------------------------------------- |
| **C-21**  | **Login / Signup Modal**      | Phone number/Email entry, OTP verification, Social Login (Google/Facebook).               |
| **C-22**  | **Forgot Password**           | Email/SMS recovery flow.                                                                  |
| **C-23**  | **User Dashboard (Overview)** | Summary of recent orders, wallet balance, loyalty tier, and quick links.                  |
| **C-24**  | **My Orders (List)**          | History of all current and past orders with status (Processing, Shipped, Delivered).      |
| **C-25**  | **Order Details**             | Deep dive into a specific order: Invoice download, Track Shipment, Cancel/Return options. |
| **C-26**  | **Track Order**               | Visual timeline of shipment status (Integrated with shipping partner API).                |
| **C-27**  | **My Prescriptions**          | Repository of uploaded and doctor-generated digital prescriptions.                        |
| **C-28**  | **Address Book**              | Manage saved delivery addresses (Add, Edit, Delete, Set Default).                         |
| **C-29**  | **Wishlist**                  | Grid of saved items with 'Move to Cart' option.                                           |
| **C-30**  | **Account Settings**          | Edit Profile (Name, Email, Phone), Change Password, Notification Preferences.             |

#### **5. Doctor Consultation & Wellness**

| Screen ID | Screen Name                     | Description                                                                        |
| :-------- | :------------------------------ | :--------------------------------------------------------------------------------- |
| **C-31**  | **Doctor Landing Page**         | Explanation of services, 'Find a Doctor' search, and specialty categories.         |
| **C-32**  | **Doctor Listing / Search**     | List of available doctors with filters for Specialty, Experience, Language, Price. |
| **C-33**  | **Doctor Profile**              | Bio, Qualifications, Reviews, Available Slots, Consultation Fee.                   |
| **C-34**  | **Book Consultation**           | Select Date/Time slot, describe symptoms, attach reports.                          |
| **C-35**  | **Consultation Checkout**       | Payment for the consultation session.                                              |
| **C-36**  | **Consultation Room (Waiting)** | 'Doctor will join shortly' screen with countdown.                                  |
| **C-37**  | **Video/Chat Interface**        | Active consultation screen with video window and chat box.                         |

#### **6. Community & Loyalty (Cureza Circle)**

| Screen ID | Screen Name           | Description                                                              |
| :-------- | :-------------------- | :----------------------------------------------------------------------- |
| **C-38**  | **Loyalty Dashboard** | Current XP, Tier Status (Bronze/Silver/Gold), Progress bar to next tier. |
| **C-39**  | **Rewards Catalog**   | List of coupons/products redeemable with points.                         |
| **C-40**  | **Referral Page**     | Unique referral link, social share buttons, 'My Referrals' stats.        |

#### **7. Support & Static Pages**

| Screen ID | Screen Name                     | Description                                                                 |
| :-------- | :------------------------------ | :-------------------------------------------------------------------------- |
| **C-41**  | **Help Center / FAQ**           | Searchable knowledge base categorized by topic (Orders, Returns, Payments). |
| **C-42**  | **Contact Us**                  | Inquiry form, Customer Care number, Email, Office Address.                  |
| **C-43**  | **About Us**                    | Brand story, Mission, Vision.                                               |
| **C-44**  | **Privacy Policy**              | Legal text regarding data privacy.                                          |
| **C-45**  | **Terms & Conditions**          | Usage terms for the platform.                                               |
| **C-46**  | **Return & Refund Policy**      | Detailed policy on returns and refunds.                                     |
| **C-47**  | **Seller Registration Landing** | 'Sell on Cureza' page with benefits and 'Register Now' CTA.                 |
| **C-48**  | **Doctor Registration Landing** | 'Join as Doctor' page with benefits and registration form.                  |

### 3.2 SELLER PANEL (Vendor Dashboard)

#### **1. Onboarding & Profile**

| Screen ID | Screen Name                               | Description                                        |
| :-------- | :---------------------------------------- | :------------------------------------------------- |
| **S-01**  | **Seller Login**                          | Email/Phone login for existing sellers.            |
| **S-02**  | **Registration Step 1: Basic Info**       | Store Name, Email, Phone, Password.                |
| **S-03**  | **Registration Step 2: Business Details** | GSTIN, PAN, Address, Pickup Pincode.               |
| **S-04**  | **Registration Step 3: KYC Upload**       | Upload Cancelled Cheque, FSSAI/Ayush License.      |
| **S-05**  | **Verification Pending**                  | Status screen showing 'Under Review' message.      |
| **S-06**  | **Store Profile Settings**                | Upload Logo, Banner, Description, Support Contact. |

#### **2. Product & Inventory**

| Screen ID | Screen Name                              | Description                                                             |
| :-------- | :--------------------------------------- | :---------------------------------------------------------------------- |
| **S-07**  | **Product List**                         | Table view of all products with status (Active, Pending, Out of Stock). |
| **S-08**  | **Add New Product: Basic**               | Title, Description, Category, Brand.                                    |
| **S-09**  | **Add New Product: Pricing & Inventory** | MRP, Selling Price, SKU, Stock Quantity.                                |
| **S-10**  | **Add New Product: Images & Media**      | Image uploader with crop functionality.                                 |
| **S-11**  | **Add New Product: Attributes**          | Weight, Dimensions, Ingredients, Health Concerns tags.                  |
| **S-12**  | **Bulk Upload**                          | CSV import tool for adding multiple products.                           |
| **S-13**  | **Inventory Management**                 | Quick stock update view.                                                |

#### **3. Order Management**

| Screen ID | Screen Name                    | Description                                          |
| :-------- | :----------------------------- | :--------------------------------------------------- |
| **S-14**  | **Order List (New)**           | Incoming orders requiring confirmation.              |
| **S-15**  | **Order Details & Processing** | View order items, generate invoice, schedule pickup. |
| **S-16**  | **Manifest Generation**        | Create shipping manifest for courier handover.       |
| **S-17**  | **Returns & Refunds**          | Manage return requests and approve/reject refunds.   |

#### **4. Finance & Analytics**

| Screen ID | Screen Name                | Description                                               |
| :-------- | :------------------------- | :-------------------------------------------------------- |
| **S-18**  | **Dashboard Overview**     | Sales graph, Total Orders, Revenue, Top Selling Products. |
| **S-19**  | **Payments / Settlements** | History of payouts from platform to seller bank account.  |
| **S-20**  | **Commission Reports**     | Breakdown of platform fees and taxes per order.           |
| **S-21**  | **Coupons Manager**        | Create store-specific discount codes.                     |

---

### 3.3 DOCTOR PANEL

#### **1. Onboarding & Verification**

| Screen ID | Screen Name                         | Description                                                      |
| :-------- | :---------------------------------- | :--------------------------------------------------------------- |
| **D-01**  | **Doctor Login**                    | Secure login.                                                    |
| **D-02**  | **Registration: Professional Info** | Medical Registration Number, Degree, Specialization, Experience. |
| **D-03**  | **KYC & Document Upload**           | Upload Degree Certificate, ID Proof.                             |
| **D-04**  | **Availability Settings**           | Set consultation hours and slot duration (e.g., 15 mins).        |

#### **2. Consultation Management**

| Screen ID | Screen Name                      | Description                                                       |
| :-------- | :------------------------------- | :---------------------------------------------------------------- |
| **D-05**  | **Doctor Dashboard**             | Upcoming appointments, Today's earnings, Pending reports.         |
| **D-06**  | **Appointments List**            | Calendar/List view of scheduled consultations.                    |
| **D-07**  | **Patient Details**              | View patient history, symptoms, and uploaded reports before call. |
| **D-08**  | **Video Consultation Interface** | Video call screen with side panel for taking notes.               |
| **D-09**  | **Chat Consultation Interface**  | Secure chat window for text-based advice.                         |

#### **3. Prescription & Earnings**

| Screen ID | Screen Name                     | Description                                                         |
| :-------- | :------------------------------ | :------------------------------------------------------------------ |
| **D-10**  | **Prescription Builder**        | Tool to select medicines from Cureza catalog and create digital Rx. |
| **D-11**  | **Prescription Preview & Send** | Review final prescription and send to patient.                      |
| **D-12**  | **Earnings & Payouts**          | Track consultation fees and withdrawal history.                     |

---

### 3.4 ADMIN SUPER PANEL

#### **1. User & Vendor Management**

| Screen ID | Screen Name               | Description                                                  |
| :-------- | :------------------------ | :----------------------------------------------------------- |
| **A-01**  | **Admin Login**           | Secure access for platform administrators.                   |
| **A-02**  | **Dashboard**             | Global stats: GMV, Total Users, Active Sellers, Live Orders. |
| **A-03**  | **User Management**       | List of all customers, block/unblock users.                  |
| **A-04**  | **Seller Management**     | List of sellers, verification status, commission rates.      |
| **A-05**  | **Seller Approval Queue** | Review pending seller documents (KYC).                       |
| **A-06**  | **Doctor Management**     | List of doctors, verification status.                        |
| **A-07**  | **Doctor Approval Queue** | Review pending doctor credentials.                           |

#### **2. Catalog & Content**

| Screen ID | Screen Name               | Description                                     |
| :-------- | :------------------------ | :---------------------------------------------- |
| **A-08**  | **Master Catalog**        | View all products across all sellers.           |
| **A-09**  | **Category Management**   | Add/Edit product categories and sub-categories. |
| **A-10**  | **Brand Management**      | Manage approved brands list.                    |
| **A-11**  | **Review Moderation**     | Approve/Reject user reviews.                    |
| **A-12**  | **Banner/Slider Manager** | Update homepage banners and promotional slots.  |
| **A-13**  | **Blog Manager**          | Create and publish blog posts.                  |

#### **3. Operations & Finance**

| Screen ID | Screen Name                   | Description                                 |
| :-------- | :---------------------------- | :------------------------------------------ |
| **A-14**  | **Order Management (Global)** | View all orders, override status if needed. |
| **A-15**  | **Refund Management**         | Process refund requests.                    |
| **A-16**  | **Payouts Processing**        | Trigger payments to Sellers and Doctors.    |
| **A-17**  | **Affiliate Manager**         | View affiliate performance and payouts.     |
| **A-18**  | **Reports Center**            | Generate Sales, Tax, and Traffic reports.   |

#### **4. Settings**

| Screen ID | Screen Name         | Description                                                   |
| :-------- | :------------------ | :------------------------------------------------------------ |
| **A-19**  | **Global Settings** | Site title, SEO defaults, Social links.                       |
| **A-20**  | **Role Management** | Create sub-admin roles (e.g., Support Staff, Content Editor). |
| **A-21**  | **System Health**   | Server status, Error logs.                                    |

---

## 4. Section C: UI/UX & Design System Plan

### 4.1 Design Philosophy & Tone

- **Tone:** Calm, Trustworthy, Premium, Organic.
- **Aesthetic:** 'Modern Wellness' – clean lines, ample whitespace, nature-inspired elements, and soft transitions.
- **User Feeling:** The user should feel a sense of relief and professional care immediately upon landing.

### 4.2 Color Palette

A harmonious blend of earthy tones and medical trust colors.

| Color Name       | Hex Code | Usage                                                                      |
| :--------------- | :------- | :------------------------------------------------------------------------- |
| **Cureza Green** | #052326  | Primary Brand Color (Buttons, Links, Logos). Represents nature and health. |
| **Sage Green**   | #A5D6A7  | Secondary/Background accents. Soft and calming.                            |
| **Trust Blue**   | #1976D2  | Medical/Doctor module accents. Represents professionalism.                 |
| **Warm Sand**    | #F5F5F5  | Main Background. Softer than pure white to reduce eye strain.              |
| **Charcoal**     | #212121  | Primary Text. High contrast for readability.                               |
| **Alert Red**    | #D32F2F  | Errors, 'Out of Stock', 'Prescription Required' warnings.                  |

### 4.3 Typography

- **Primary Font (Headings):** **'Outfit'** or **'Plus Jakarta Sans'**. Modern, geometric sans-serif that feels approachable yet professional.
- **Secondary Font (Body):** **'Inter'** or **'Lato'**. Highly readable for long product descriptions and blog content.
- **Scale:**
  - H1: 32px (Desktop) / 24px (Mobile)
  - H2: 24px (Desktop) / 20px (Mobile)
  - Body: 16px (Standard) / 14px (Secondary info)

### 4.4 Component Library (Atomic Design)

- **Buttons:**
  - _Primary:_ Solid Cureza Green, rounded corners (8px).
  - _Secondary:_ Outlined Green.
  - _CTA:_ Floating Action Button (FAB) for 'Chat with Doctor' on mobile.
- **Cards:**
  - _Product Card:_ Clean white card with subtle shadow on hover, large product image, clear price, and 'Add' button.
  - _Doctor Card:_ Profile picture, verification badge, specialty tags, and 'Book' button.
- **Forms:**
  - Floating labels for modern look.
  - Inline validation (Green check for valid, Red text for error).
- **Icons:**
  - Use **Phosphor Icons** or **Heroicons** (Outline style) for a consistent, premium look.

### 4.5 Layout Guidelines

- **Grid System:** 12-column grid for Desktop, 4-column for Mobile.
- **Spacing:** 8pt grid system (8px, 16px, 24px, 32px) for consistent padding and margins.
- **Responsiveness:** Mobile-first approach. All touch targets must be at least 44x44px.

### 4.6 Accessibility (WCAG 2.1 AA)

- **Contrast:** Ensure 4.5:1 contrast ratio for text.
- **Keyboard Nav:** Full keyboard support for menus and forms.
- **Alt Text:** Mandatory alt text field for all image uploads in CMS.
- **Screen Readers:** ARIA labels for all interactive elements (e.g., 'Add to Cart', 'Close Modal').

### 4.7 Figma Structure Proposal

- **Page 1: Design System** (Colors, Typography, Grid, Icons).
- **Page 2: Components** (Buttons, Inputs, Cards, Headers, Footers).
- **Page 3: Customer Flow** (All C-xx screens).
- **Page 4: Seller Flow** (All S-xx screens).
- **Page 5: Doctor Flow** (All D-xx screens).
- **Page 6: Admin Flow** (All A-xx screens).

---

## 5. Section D: Technology & Architecture (Website Only)

### 5.1 Frontend Architecture

- **Framework:** **Next.js 14+ (App Router)**. Chosen for its superior SEO capabilities, Server-Side Rendering (SSR), and Incremental Static Regeneration (ISR).
- **Language:** **TypeScript**. Ensures type safety and reduces runtime errors.
- **State Management:** **Redux Toolkit**. For managing complex global state like Cart, User Session, and Filters.
- **Styling:** **Tailwind CSS**. Utility-first framework for rapid, responsive UI development.
- **Data Fetching:** **React Query (TanStack Query)**. For efficient server state management, caching, and background updates.
- **Performance:**
  _ Image Optimization via
  ext/image.
  _ Code splitting and lazy loading for heavy components. \* Core Web Vitals optimization (LCP, CLS, FID).

### 5.2 Backend Architecture

- **Framework:** **Laravel 11 (PHP)**. API-first approach. Chosen for its robust ecosystem, security, and speed of development.
- **Architecture Pattern:** **Modular Monolith**. Separating core modules (Product, Order, User) within a single codebase for maintainability without the complexity of microservices initially.
- **Queue System:** **Redis Queue**. For handling background jobs like sending emails, processing image uploads, and updating search indexes.
- **Notification Engine:** Centralized service for sending SMS (Twilio/Msg91), WhatsApp (Interakt), and Emails (SendGrid/SES).

### 5.3 Database Strategy

- **Primary Database:** **MySQL 8.0**. Relational database for structured data: Users, Orders, Products, Transactions.
- **Analytics/Logs:** **MongoDB**. NoSQL database for storing unstructured data: User activity logs, audit trails, chat history.
- **Caching:** **Redis**. In-memory data store for caching session data, API responses, and frequent database queries to reduce load.

### 5.4 Infrastructure & DevOps

- **Hosting:** **Hostinger VPS (KVM 4 or higher)**. Cost-effective and scalable for initial launch.
- **OS:** **Ubuntu 22.04 LTS**.
- **Web Server:** **Nginx**. Configured as a reverse proxy for Next.js and PHP-FPM for Laravel.
- **Process Management:** **PM2** for Node.js (Next.js) and **Supervisor** for Laravel Queues.
- **CI/CD:** **GitHub Actions**. Automated testing and deployment pipelines.
- **Security:**
  - **SSL:** Let's Encrypt Wildcard SSL.
  - **Firewall:** UFW configured to allow only necessary ports (80, 443, 22).
  - **DDoS Protection:** Cloudflare integration.
- **Directory Structure:**
  `/var/www/cureza/
 frontend/ (Next.js application)
 backend/ (Laravel API)
 storage/ (Shared media uploads)`

### 5.5 API Architecture (RESTful)

All communication between Frontend and Backend happens via secure JSON APIs.

- **Auth APIs:** Login, Register, OTP Verify, Refresh Token.
- **Product APIs:** List Products, Get Details, Search, Filter.
- **Seller APIs:** Upload Product, Update Inventory, Get Orders.
- **Doctor APIs:** Set Availability, Get Appointments, Submit Prescription.
- **Order APIs:** Create Order, Verify Payment, Track Status.
- **Community APIs:** Get XP, Redeem Reward, Post Review.
- **Affiliate APIs:** Generate Link, Get Earnings.
- **Admin APIs:** User Management, Reports, CMS Control.

---

## 6. Section E: Development Roadmap (6–9 Months)

### Phase 1: Foundation & Design (Month 1-2)

- **Month 1:**
  - Requirement Gathering & Finalizing SRS.
  - Database Schema Design (MySQL).
  - UI/UX Design: Wireframing & High-Fidelity Prototypes (Figma) for Customer & Seller Panels.
  - Setup Dev Environment (Laravel + Next.js).
- **Month 2:**
  - Frontend: Component Library development (Buttons, Inputs, Layouts).
  - Backend: Auth Module (Login/Signup/OTP) & Role Management.
  - Design: Finalizing Doctor & Admin Panel UI.

### Phase 2: Core Commerce & Seller Onboarding (Month 3-4)

- **Month 3:**
  - **Seller Module:** Registration, KYC Upload, Basic Dashboard.
  - **Product Module:** Product CRUD, Category Management, Image Upload.
  - **Customer Module:** Homepage, Search, Product Listing, Product Details.
- **Month 4:**
  - **Cart & Checkout:** Cart logic, Address Management, Payment Gateway Integration (Razorpay).
  - **Order Module:** Order placement, Invoice Generation, Basic Email Notifications.

### Phase 3: Specialized Modules (Month 5-6)

- **Month 5:**
  - **Doctor Module:** Doctor Registration, Slot Management, Consultation Booking Flow.
  - **Prescription System:** Upload logic, Doctor Prescription Builder tool.
  - **Video Integration:** Basic video call setup (e.g., via Agora or Twilio).
- **Month 6:**
  - **Community (Cureza Circle):** XP Logic, Loyalty Dashboard, Review System.
  - **Affiliate System:** Tracking links, Affiliate Dashboard.

### Phase 4: Admin, Analytics & Polish (Month 7-8)

- **Month 7:**
  - **Admin Super Panel:** User/Seller/Doctor management, Approvals, Payouts.
  - **CMS:** Blog Engine, Banner Manager, SEO Settings.
  - **Analytics:** Dashboard charts, Sales Reports.
- **Month 8:**
  - **QA Testing:** Functional testing, Load testing, Security audit.
  - **Bug Fixing:** Resolving issues found during QA.
  - **Performance Tuning:** Caching setup, Image optimization.

### Phase 5: Launch & Post-Launch (Month 9)

- **Month 9:**
  - **Soft Launch:** Invite-only access for selected Sellers and Doctors.
  - **Production Deployment:** Server setup, Domain mapping, SSL.
  - **Public Launch:** Marketing kick-off.
  - **Post-Launch Support:** Monitoring and immediate hotfixes.

---

## 7. Section F: Cost Estimation (Indian Market Rates)

**Note:** These estimates are for the **Web Application MVP** (Minimum Viable Product) development over a 6-month period.

| Component                   | Description                                                            | Estimated Cost (INR)        |
| :-------------------------- | :--------------------------------------------------------------------- | :-------------------------- |
| **UI/UX Design**            | Full Figma design for 150+ screens, Design System, Prototyping.        | ₹2,50,000 - ₹4,00,000       |
| **Frontend Development**    | Next.js implementation, Responsive UI, API Integration.                | ₹5,00,000 - ₹8,00,000       |
| **Backend Development**     | Laravel API, Database design, Queue system, 3rd party integrations.    | ₹6,00,000 - ₹9,00,000       |
| **DevOps & Infrastructure** | Server setup, CI/CD pipelines, Security configuration, 1-year hosting. | ₹1,00,000 - ₹1,50,000       |
| **QA & Testing**            | Manual & Automated testing, Bug reporting, Security audit.             | ₹1,50,000 - ₹2,50,000       |
| **Project Management**      | Agile management, Sprint planning, Documentation.                      | ₹2,00,000 - ₹3,00,000       |
| **3rd Party API Costs**     | SMS, WhatsApp, Email, Maps (Estimated for 1st year).                   | ₹50,000 - ₹1,00,000         |
| **Total Estimated Cost**    | **Complete Web Application (MVP)**                                     | **₹18,50,000 - ₹29,00,000** |

- _Excludes: GST (18%), Marketing budget, and ongoing maintenance after launch._

---

## 8. Section G: SEO + Performance Strategy

### 8.1 Performance Optimization (Core Web Vitals)

- **Target:** Google PageSpeed Score > 90 (Mobile & Desktop).
- **CDN:** Use **Cloudflare** for caching static assets (images, CSS, JS) at edge locations globally.
- **Image Optimization:** Serve images in **WebP** or **AVIF** formats. Implement lazy loading for off-screen images.
- **Code Splitting:** Next.js automatically splits code per page, ensuring users only download what they need.
- **Server-Side Rendering (SSR):** Critical pages (Home, Product Details) are rendered on the server for instant First Contentful Paint (FCP).

### 8.2 On-Page SEO

- **Meta Tags:** Dynamic generation of Title, Description, and Keywords based on product content.
- **Semantic HTML:** Proper use of H1, H2, H3 tags for content hierarchy.
- **URL Structure:** Clean, human-readable URLs (e.g., cureza.in/shop/ayurveda/dabur-chyawanprash).
- **Internal Linking:** Smart cross-linking between Blog posts, Categories, and Products to distribute 'link juice'.

### 8.3 Schema Markup (Structured Data)

Implement JSON-LD schema to help search engines understand content:

- **Product Schema:** Price, Availability, Rating, Reviews.
- **Organization Schema:** Logo, Social Profiles, Contact Info.
- **Breadcrumb Schema:** Navigation path.
- **FAQ Schema:** For Q&A sections on product pages.
- **MedicalWebPage Schema:** For Doctor and Health Concern pages.

### 8.4 Content & Blog Strategy

- **Keyword Strategy:** Target long-tail keywords (e.g., 'best ayurvedic medicine for digestion', 'buy cbd oil india').
- **Pillar Content:** Create comprehensive guides on wellness topics that link to multiple products.
- **Doctor-Verified Badge:** Highlight content reviewed by doctors to improve E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).

---

## 9. Section H: Launch & Marketing Plan (Website Only)

### 9.1 Pre-Launch Phase (30 Days Before Launch)

- **Coming Soon Page:** Capture emails for early access with a 'Join Waitlist' incentive (e.g., ₹500 off first order).
- **Social Media Teasers:** Educational content about Ayurveda and Wellness on Instagram/LinkedIn to build a following.
- **Seller Recruitment:** Direct outreach to premium Ayurvedic brands and local wellness artisans.

### 9.2 Launch Strategy (First 90 Days)

- **Influencer Collaborations:** Partner with 20+ micro-influencers (Yoga instructors, Nutritionists) for unboxing and review videos.
- **Launch Offer:** 'Grand Opening Sale' with flat 20% off site-wide.
- **Referral Contest:** 'Refer 5 friends, get a free Wellness Kit'.

### 9.3 Digital Marketing Channels

- **Google Ads:** Shopping ads for high-intent keywords (e.g., 'buy ashwagandha online').
- **Meta Ads (FB/Insta):** Retargeting ads for users who visited the site but didn't purchase.
- **Email Marketing:** Automated flows for Abandoned Cart recovery (3-email sequence) and Welcome series.
- **Content Marketing:** Weekly blog posts on health concerns (Stress, Immunity, Skin Care) shared on social media.

---

## 10. Section I: Future Roadmap (Website 2.0)

### 10.1 AI & Personalization

- **AI Health Assistant:** A chatbot that recommends products based on user symptoms and Dosha type (Vata, Pitta, Kapha).
- **Personalized Feed:** Homepage dynamically adjusts to show products relevant to the user's past browsing.

### 10.2 Enhanced Experience

- **AR Product Viewer:** View 3D models of packaging or size comparison.
- **Voice Search:** Voice-enabled search for accessibility (Hindi/English support).
- **Subscription Model:** 'Subscribe & Save' for recurring monthly supplements.

### 10.3 Expansion

- **International Shipping:** Global store version with multi-currency support (USD, GBP, EUR).
- **B2B Wholesale:** Dedicated portal for clinics and retailers to buy in bulk.
