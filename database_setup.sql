
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_latest BOOLEAN DEFAULT FALSE,
  is_best_selling BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  thana TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  expiry TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  name_bengali TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create popup_offers table
CREATE TABLE IF NOT EXISTS popup_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  discount_percentage INTEGER,
  min_order_amount NUMERIC,
  max_discount NUMERIC,
  valid_until TIMESTAMP,
  action_text TEXT,
  action_url TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  button_color TEXT DEFAULT '#059669',
  button_text_color TEXT DEFAULT '#ffffff',
  fine_print TEXT,
  delay_seconds INTEGER DEFAULT 3,
  auto_close_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,
  expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (PostgreSQL syntax)
INSERT INTO admins (id, email, password) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin@trynex.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, name_bengali, description, is_active, sort_order) VALUES 
('lifestyle', 'লাইফস্টাইল', 'লাইফস্টাইল পণ্য', true, 1),
('gifts', 'উপহার', 'উপহার সামগ্রী', true, 2),
('custom', 'কাস্টম', 'কাস্টমাইজড পণ্য', true, 3),
('accessories', 'এক্সেসরিজ', 'ফ্যাশন এক্সেসরিজ', true, 4)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, category, stock, image_url, is_featured, is_latest, is_best_selling) VALUES 
('কোর এক্সারসাইজ', 100, 'lifestyle', 50, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', true, false, false),
('বাংলাদেশি ক্লাসিক বই', 350, 'gifts', 30, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, true, false),
('কাস্টম টি-শার্ট', 450, 'custom', 25, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, false, true),
('ব্যাকপ্যাক বহুক', 1100, 'accessories', 20, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', true, true, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample popup offer
INSERT INTO popup_offers (
  id, title, subtitle, description, discount_percentage, min_order_amount,
  action_text, action_url, delay_seconds, is_active, expiry
) VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  '🎉 বিশেষ ছাড় অফার!', 
  'শুধুমাত্র আজকের জন্য',
  'আপনার প্রিয় পণ্যে পান ২০% পর্যন্ত ছাড়! এই সুযোগ হাতছাড়া করবেন না।',
  20,
  500,
  'এখনই কিনুন',
  '/products',
  5,
  true,
  NOW() + INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;
