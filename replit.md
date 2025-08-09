# Trynex Lifestyle - Enhanced eCommerce Platform

## Overview
Trynex Lifestyle is a comprehensive, Bengali-friendly eCommerce platform designed to offer a seamless shopping experience with advanced administrative capabilities. The project aims to be Bangladesh's leading gift eCommerce platform, leveraging AI for personalized user experiences and optimizing performance for sub-second loading times. Key capabilities include a personalized user dashboard, real-time analytics, a robust order tracking system, and a comprehensive admin panel for full store management.

## Recent Changes (August 09, 2025)
- ✅ **CRITICAL FIX**: Connected application to Supabase database with all 32 products (was showing only 6 from local dev DB)
- ✅ Fixed database connection to use correct Supabase URL instead of local/development database
- ✅ Verified all 32 Bengali products now loading properly with real inventory data
- ✅ Enhanced search functionality to work with real product database
- ✅ **MAJOR MODAL FIXES**: Completely redesigned modal system for desktop and mobile responsiveness
- ✅ Fixed customize modal with professional layout, custom close button, and proper content spacing
- ✅ Updated base dialog component to use responsive widths (95vw mobile → 70vw desktop, max 1200px)
- ✅ Resolved duplicate close button issues and modal overflow problems
- ✅ Added proper DialogDescription to fix accessibility warnings
- ✅ Enhanced product preview with larger images and better pricing display

## Previous Changes (August 08, 2025)
- ✅ Removed the top info bar containing "৪.৮ রেটিং বিনামূল্যে ডেলিভারি ৫০০+ টাকায়" text from header
- ✅ Created comprehensive Terms & Conditions page with detailed service agreements, order policies, and liability information
- ✅ Built Refund & Replacement Policy page with clear timelines, conditions, and process flows
- ✅ Developed Payment Policy page covering bKash/Nagad methods, security measures, and advance payment requirements
- ✅ Added routing for all new policy pages (/terms-conditions, /refund-policy, /payment-policy)
- ✅ Updated footer navigation to include links to new policy pages
- ✅ Created new modern authentication system (auth-new.tsx) with improved Bengali UI and phone-based login
- ✅ Product image modal functionality confirmed working with full-screen overlay capability
- ✅ FIXED: Product card hover button visibility issues (white on white) with proper colored icons and borders
- ✅ IMPLEMENTED: Complete user registration and login system with phone-based authentication
- ✅ CREATED: Mobile-responsive order details modal for admin panel with comprehensive functionality
- ✅ ENHANCED: Comprehensive mobile optimization with smooth animations and responsive design
- ✅ ADDED: User management in admin panel with proper TypeScript types and error handling

## User Preferences
- **Language**: Bengali (বাংলা) for all customer-facing content
- **Design**: Modern, clean interface with orange/green accent colors
- **Payment**: bKash/Nagad integration with manual confirmation
- **Communication**: WhatsApp for customer support and order management

## System Architecture

### Frontend
- **Framework**: React with TypeScript and Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Typography**: Bengali typography support

### Backend
- **Server**: Express.js
- **ORM**: Drizzle ORM for type-safe database operations
- **API**: RESTful API routes for products, orders, categories, promo codes, and analytics
- **Validation**: Zod schemas for request validation

### Database Schema
- **Core Entities**: `products`, `orders`, `categories`, `promo_codes`, `analytics`, `site_settings`, `offers`, `admins`, `users`, `user_carts`, `user_orders`, `sessions`.
- **Relationships**: Orders linked to users, persistent cart for logged-in users.

### Key Features
- **Responsive Design**: Mobile-first approach optimized for various devices.
- **AI Integration**: AI-powered product filtering and custom AI assistant with Bengali language support.
- **Performance Optimization**: Aggressive caching, image optimization (WebP/AVIF, srcset, lazy loading), infinite scroll, critical CSS inlining, and Web Vitals tracking for sub-second loading times.
- **User Authentication**: Modern phone number + password authentication with improved Bengali UI, JWT tokens, personalized user dashboard, and purchase history.
- **Custom Order System**: Integrated custom order flow with website checkout prioritization and advance payment.
- **Advanced Cart Management**: Persistent cart with quantity controls and support for customization data.
- **Dynamic Delivery Pricing**: Location-based fee calculation (Dhaka vs. outside Dhaka).
- **Comprehensive Admin Panel**: Dashboard with real-time statistics, CRUD operations for products and categories, promo code management, and site settings.
- **Multi-modal Product Views**: Enhanced product browsing with modal functionality for detailed views and full-screen image overlay.
- **Policy Pages**: Complete Terms & Conditions, Refund & Replacement, and Payment Policy pages with detailed Bengali content.

## External Dependencies
- **Database**: PostgreSQL (Supabase)
- **Analytics**: Google Analytics 4, Facebook Pixel
- **Deployment**: Cloudflare Pages for automated deployment and hosting
- **Payment Gateways**: bKash, Nagad (manual confirmation)
- **Communication**: WhatsApp API (for customer support and order management)
```