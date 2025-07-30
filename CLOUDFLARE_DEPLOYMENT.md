# Trynex Lifestyle - Cloudflare Pages Deployment Guide

## Complete Setup Guide for Cloudflare Pages with Supabase Backend

This guide will help you deploy your Bengali eCommerce store using Cloudflare Pages for the frontend and Supabase for the database backend.

## Prerequisites

1. **GitHub Account** - Your code repository
2. **Cloudflare Account** - For hosting the frontend
3. **Supabase Account** - For PostgreSQL database hosting
4. **Custom Domain** (optional) - For professional appearance

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Trynex Lifestyle eCommerce"

# Add GitHub remote and push
git remote add origin https://github.com/yourusername/trynex-lifestyle.git
git branch -M main
git push -u origin main
```

### 1.2 Update Package.json for Cloudflare
Ensure your `package.json` has the correct build scripts:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:pg-native",
    "start": "node dist/index.js",
    "preview": "vite preview"
  }
}
```

## Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and project name: `trynex-lifestyle`
4. Set a strong database password
5. Select region closest to your users
6. Click "Create new project"

### 2.2 Get Database Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** format connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. Save this connection string for later use

### 2.3 Set Up Database Schema
1. Go to **SQL Editor** in Supabase
2. Run the following SQL to create your tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    district TEXT NOT NULL,
    thana TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    items JSONB NOT NULL,
    total TEXT NOT NULL,
    payment_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create offers table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_percentage INTEGER NOT NULL,
    min_order_amount INTEGER,
    max_discount_amount INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, price, image_url, category, stock) VALUES
('কাস্টম মগ - বাংলা টেক্সট', '250', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'gifts', 15),
('ব্যক্তিগত ফটো ফ্রেম', '350', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'gifts', 20),
('কাস্টম টি-শার্ট', '450', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'lifestyle', 25),
('হ্যান্ডমেইড নোটবুক', '180', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'lifestyle', 30),
('কাস্টম কিচেইন', '120', 'https://images.unsplash.com/photo-1565704401915-b1e6d61723d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'accessories', 50),
('বাংলা ক্যালিগ্রাফি পোস্টার', '300', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'gifts', 12),
('হ্যান্ডমেইড ব্যাগ', '650', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'accessories', 8),
('কাস্টম ওয়াল ক্লক', '550', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'lifestyle', 10);

-- Insert sample offers
INSERT INTO offers (title, description, discount_percentage, min_order_amount, is_active) VALUES
('প্রথম অর্ডারে ১০% ছাড়', 'নতুন কাস্টমারদের জন্য বিশেষ অফার', 10, 500, true),
('বাল্ক অর্ডারে ১৫% ছাড়', '৩টি বা তার বেশি পণ্য অর্ডারে', 15, 1000, true);

-- Insert admin user
INSERT INTO admins (email, password, name) VALUES 
('admin@trynex.com', 'admin123', 'Admin User');
```

## Step 3: Deploy to Cloudflare Pages

### 3.1 Connect GitHub Repository
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** in the sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Choose **GitHub** and authorize Cloudflare
6. Select your `trynex-lifestyle` repository
7. Click **Begin setup**

### 3.2 Configure Build Settings
Set up the build configuration:

**Framework preset**: `None` (Custom)
**Build command**: `npm run build`
**Build output directory**: `dist/public`
**Root directory**: `/` (leave empty)

### 3.3 Environment Variables
In the **Environment variables** section, add:

| Variable Name | Value |
|---------------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `NODE_VERSION` | `20` |

### 3.4 Deploy
1. Click **Save and Deploy**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be available at `https://your-project-name.pages.dev`

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Cloudflare Pages, go to your project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `trynex.com`)
5. Follow DNS configuration instructions

### 4.2 SSL Certificate
Cloudflare automatically provides SSL certificates for your domain.

## Step 5: Configure Cloudflare Functions (Backend)

### 5.1 Create Functions Directory
Create `functions` directory in your project root:
```bash
mkdir functions
mkdir functions/api
```

### 5.2 Move API Routes to Functions
Create `functions/api/[[path]].js`:
```javascript
// This file handles all API routes for Cloudflare Pages Functions
import { routes } from '../../dist/index.js';

export async function onRequest(context) {
  return await routes(context);
}
```

### 5.3 Update Build for Functions
Update your build script to handle Cloudflare Functions:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:functions",
    "build:client": "vite build",
    "build:functions": "esbuild server/index.ts --bundle --platform=node --outfile=functions/api/[[path]].js --format=esm --external:pg-native"
  }
}
```

## Step 6: Testing and Monitoring

### 6.1 Test All Features
1. **Frontend**: Visit your deployed site
2. **Product Catalog**: Check product loading
3. **Cart System**: Add/remove products
4. **Order Placement**: Complete a test order
5. **Admin Panel**: Login and manage orders
6. **Order Tracking**: Test with tracking ID
7. **Real-time Updates**: Verify admin status changes reflect in tracking

### 6.2 Monitor Performance
1. Use Cloudflare Analytics for traffic insights
2. Monitor Supabase database usage
3. Set up alerts for errors

## Step 7: Production Checklist

### 7.1 Security
- [ ] Change default admin credentials
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Set up proper CORS policies
- [ ] Enable HTTPS redirect

### 7.2 Performance
- [ ] Enable Cloudflare caching rules
- [ ] Optimize images for web
- [ ] Set up CDN for static assets
- [ ] Enable compression

### 7.3 SEO & Marketing
- [ ] Add Google Analytics
- [ ] Set up meta tags and Open Graph
- [ ] Submit sitemap to search engines
- [ ] Set up WhatsApp Business API

## Step 8: Ongoing Maintenance

### 8.1 Regular Tasks
- Monitor database usage and upgrade plan if needed
- Update dependencies monthly
- Backup database regularly
- Monitor error logs

### 8.2 Feature Updates
- Deploy new features via GitHub push
- Test in staging environment first
- Monitor deployment success

## Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

**Database Connection Issues**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure connection string includes password

**API Routes Not Working**
- Verify Functions are properly configured
- Check environment variables are set
- Monitor Cloudflare Functions logs

### Support Resources
- Cloudflare Pages Documentation
- Supabase Documentation
- GitHub Issues for this project

## Success Metrics

After deployment, you should have:
- ✅ Fully functional Bengali eCommerce store
- ✅ Real-time order tracking
- ✅ Admin panel with full CRUD operations
- ✅ Payment integration with bKash/Nagad
- ✅ WhatsApp ordering system
- ✅ Scalable cloud infrastructure
- ✅ SSL-secured custom domain

Your Trynex Lifestyle store is now ready to serve customers with a professional, scalable infrastructure!