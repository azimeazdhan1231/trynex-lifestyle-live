# Trynex Lifestyle - Enhanced eCommerce Platform

## Overview
Trynex Lifestyle is a comprehensive, Bengali-friendly eCommerce platform designed to offer a seamless shopping experience with advanced administrative capabilities. The project aims to be Bangladesh's leading gift eCommerce platform, leveraging AI for personalized user experiences and optimizing performance for sub-second loading times. Key capabilities include a personalized user dashboard, real-time analytics, a robust order tracking system, and a comprehensive admin panel for full store management.

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
- **User Authentication**: Complete phone number + password authentication with JWT tokens, personalized user dashboard, and purchase history.
- **Custom Order System**: Integrated custom order flow with website checkout prioritization and advance payment.
- **Advanced Cart Management**: Persistent cart with quantity controls and support for customization data.
- **Dynamic Delivery Pricing**: Location-based fee calculation (Dhaka vs. outside Dhaka).
- **Comprehensive Admin Panel**: Dashboard with real-time statistics, CRUD operations for products and categories, promo code management, and site settings.
- **Multi-modal Product Views**: Enhanced product browsing with modal functionality for detailed views.

## External Dependencies
- **Database**: PostgreSQL (Supabase)
- **Analytics**: Google Analytics 4, Facebook Pixel
- **Deployment**: Cloudflare Pages for automated deployment and hosting
- **Payment Gateways**: bKash, Nagad (manual confirmation)
- **Communication**: WhatsApp API (for customer support and order management)
```