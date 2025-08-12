# Trynex Lifestyle - Enhanced eCommerce Platform

## Overview
Trynex Lifestyle is a comprehensive, Bengali-friendly eCommerce platform designed to be Bangladesh's leading gift eCommerce platform. It offers a seamless shopping experience with advanced administrative capabilities, leveraging AI for personalized user experiences and optimizing performance for sub-second loading times. Key capabilities include a personalized user dashboard, real-time analytics, a robust order tracking system, and a comprehensive admin panel for full store management.

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

### UI/UX Decisions
- Modern hero section with trust indicators, dynamic content, and animations.
- Step-by-step checkout wizard with comprehensive validation.
- Advanced tabbed order details modal with comprehensive information and image management.
- Modular component system for reusability.
- Responsive design for all devices, including specific mobile optimizations.
- Professional UI with proper error handling and loading states.
- Responsive modal system for desktop and mobile.
- Updated authentication UI with Bengali elements.

### Technical Implementations
- Full CRUD operations for products, categories, offers, promo codes, and orders in the admin panel.
- Real-time order status updates.
- Dual image upload system for products.
- Integration of custom instructions and images for orders.
- Comprehensive site settings panel with live updates.
- Robust error handling and logging.
- AI-powered product filtering and custom AI assistant with Bengali language support.
- Aggressive caching, image optimization (WebP/AVIF, srcset, lazy loading), infinite scroll, critical CSS inlining, and Web Vitals tracking for sub-second loading times.
- Phone number + password authentication with JWT tokens.
- Dynamic delivery pricing based on location.
- Multi-modal product views with full-screen image overlay.
- Policy pages for Terms & Conditions, Refund & Replacement, and Payment Policy.

## External Dependencies
- **Database**: PostgreSQL (Supabase)
- **Analytics**: Google Analytics 4, Facebook Pixel
- **Deployment**: Cloudflare Pages
- **Payment Gateways**: bKash, Nagad
- **Communication**: WhatsApp API