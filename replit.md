# Trynex Lifestyle eCommerce Store

## Overview

This is a full-stack eCommerce application built for a Bengali lifestyle and custom gift store. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL as the database with Drizzle ORM for type-safe database operations. The application is designed to be deployed on Replit with external database hosting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Bengali font integration (Hind Siliguri)
- **State Management**: TanStack Query for API state, local storage for cart management
- **Internationalization**: Bengali language support throughout the interface
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Route Organization**: Centralized route registration in `/server/routes.ts`
- **Error Handling**: Centralized error handling middleware
- **Development Tools**: Hot reloading with Vite integration in development

### Database Schema
The application uses four main entities:
- **Products**: Core product catalog with categories, pricing, and stock management
- **Orders**: Customer orders with tracking, status updates, and Bengali address fields
- **Offers**: Promotional offers with expiry dates and activation status
- **Admins**: Simple admin authentication system

### Core Features
- **Product Catalog**: Category-based product browsing with search and filtering
- **Shopping Cart**: Persistent cart using localStorage with quantity management
- **Order Management**: Complete order lifecycle with tracking system
- **Admin Panel**: Order management and status updates
- **Multi-language Support**: Bengali interface with English fallbacks
- **WhatsApp Integration**: Direct customer communication via WhatsApp API

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Processing**: Express server handles requests and validates data using Zod schemas
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: Structured JSON responses with error handling
5. **State Updates**: TanStack Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing solution
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety across the entire stack
- **drizzle-kit**: Database migration and schema management
- **tsx**: TypeScript execution for server development

### External Services
- **PostgreSQL Database**: Hosted externally (Supabase referenced in setup docs)
- **WhatsApp Business API**: Customer communication integration
- **Cloudflare**: Deployment and hosting infrastructure (referenced in setup guide)

## Deployment Strategy

The application is designed for Replit deployment with the following approach:

1. **Development**: Uses Vite dev server with Express integration
2. **Production Build**: 
   - Frontend: Vite builds static assets to `dist/public`
   - Backend: esbuild bundles server code to `dist/index.js`
3. **Database**: External PostgreSQL hosting with connection string configuration
4. **Environment Variables**: Database URL and other configuration via environment variables
5. **Static Serving**: Express serves built frontend assets in production

### Build Process
- `npm run dev`: Development mode with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

The application is optimized for Replit's environment with specific plugins and configuration for seamless development and deployment experience.