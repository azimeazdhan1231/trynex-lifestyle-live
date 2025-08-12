-- Complete database setup for TryneX Lifestyle
-- Run this SQL in your Supabase SQL editor to set up all tables

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_latest BOOLEAN DEFAULT false,
  is_best_selling BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  district TEXT NOT NULL,
  thana TEXT NOT NULL,
  address TEXT,
  phone TEXT NOT NULL,
  payment_info JSONB,
  status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  total TEXT NOT NULL,
  custom_instructions TEXT,
  custom_images JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_percentage INTEGER DEFAULT 0,
  min_order_amount TEXT DEFAULT '0',
  button_text TEXT DEFAULT 'অর্ডার করুন',
  button_link TEXT DEFAULT '/products',
  is_popup BOOLEAN DEFAULT false,
  popup_delay INTEGER DEFAULT 3000,
  expiry TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  name_bengali TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  page_url TEXT,
  product_id UUID,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial settings
INSERT INTO site_settings (key, value, description) VALUES 
  ('site_title', 'TryneX Lifestyle', 'Website title'),
  ('site_description', 'আপনার পছন্দের গিফট শপ', 'Website description'),
  ('facebook_page', 'https://facebook.com/trynex', 'Facebook page URL'),
  ('whatsapp_number', '+8801747292277', 'WhatsApp contact number')
ON CONFLICT (key) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, description, category, image_url, stock, is_featured, is_best_selling) VALUES
  ('কাস্টমাইজড মগ', '350', 'আপনার পছন্দের ছবি এবং টেক্সট সহ বিশেষ মগ', 'mugs', '/images/mug.jpg', 50, true, true),
  ('ফটো ফ্রেম', '500', 'সুন্দর কাঠের ফ্রেম আপনার প্রিয় ছবির জন্য', 'frames', '/images/frame.jpg', 30, false, true),
  ('কাস্টম টি-শার্ট', '650', 'আপনার ডিজাইনে প্রিমিয়াম কোয়ালিটি টি-শার্ট', 't-shirts', '/images/tshirt.jpg', 25, true, false),
  ('কী-চেইন', '150', 'পার্সোনালাইজড কী-চেইন বিভিন্ন ডিজাইনে', 'keychains', '/images/keychain.jpg', 100, false, true)
ON CONFLICT DO NOTHING;

-- Insert sample categories  
INSERT INTO categories (name, name_bengali, description, is_active, sort_order) VALUES
  ('mugs', 'মগ', 'কাস্টমাইজড মগের কালেকশন', true, 1),
  ('frames', 'ফটো ফ্রেম', 'সুন্দর ফটো ফ্রেমের সংগ্রহ', true, 2),
  ('t-shirts', 'টি-শার্ট', 'কাস্টম টি-শার্ট কালেকশন', true, 3),
  ('keychains', 'কী-চেইন', 'পার্সোনালাইজড কী-চেইন', true, 4)
ON CONFLICT (name) DO NOTHING;

-- Create default admin user (password: admin123)
INSERT INTO admins (email, password) VALUES 
  ('admin@trynex.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/BrKUQJRU/7VvCp8O6')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);