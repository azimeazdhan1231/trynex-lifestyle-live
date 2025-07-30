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
  payment_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo admin account
INSERT INTO admins (email, password) VALUES ('admin@trynex.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, category, stock, image_url) VALUES 
('কোর এক্সারসাইজ', 100, 'lifestyle', 50, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'),
('বাংলাদেশি ক্লাসিক বই', 350, 'gifts', 30, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'),
('কাস্টম টি-শার্ট', 450, 'custom', 25, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'),
('ব্যাকপ্যাক বহুক', 1100, 'accessories', 20, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600');

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Popup Offers table
CREATE TABLE IF NOT EXISTS popup_offers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  discount_percentage INTEGER,
  min_order_amount REAL,
  max_discount REAL,
  valid_until TEXT,
  action_text TEXT,
  action_url TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  button_color TEXT DEFAULT '#059669',
  button_text_color TEXT DEFAULT '#ffffff',
  fine_print TEXT,
  delay_seconds INTEGER DEFAULT 3,
  auto_close_seconds INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT OR IGNORE INTO admins (id, email, password) 
VALUES ('admin-1', 'admin@trynex.com', 'admin123');

-- Insert sample popup offer
INSERT OR IGNORE INTO popup_offers (
  id, title, subtitle, description, discount_percentage, min_order_amount,
  action_text, action_url, delay_seconds, is_active
) VALUES (
  'sample-popup-1', 
  '🎉 বিশেষ ছাড় অফার!', 
  'শুধুমাত্র আজকের জন্য',
  'আপনার প্রিয় পণ্যে পান ২০% পর্যন্ত ছাড়! এই সুযোগ হাতছাড়া করবেন না।',
  20,
  500,
  'এখনই কিনুন',
  '/products',
  5,
  1
);