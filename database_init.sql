
-- Insert default categories if they don't exist
INSERT INTO categories (name, name_bengali, description, is_active, sort_order, created_at)
VALUES 
  ('gifts', 'গিফট', 'Special gift items', true, 1, NOW()),
  ('lifestyle', 'লাইফস্টাইল', 'Lifestyle products', true, 2, NOW()),
  ('accessories', 'অ্যাক্সেসরিজ', 'Fashion accessories', true, 3, NOW()),
  ('custom', 'কাস্টম', 'Custom products', true, 4, NOW()),
  ('electronics', 'ইলেক্ট্রনিক্স', 'Electronic gadgets', true, 5, NOW()),
  ('fashion', 'ফ্যাশন', 'Fashion items', true, 6, NOW()),
  ('home-decor', 'হোম ডেকোর', 'Home decoration items', true, 7, NOW()),
  ('books', 'বই', 'Books and stationery', true, 8, NOW()),
  ('sports', 'খেলাধুলা', 'Sports and fitness', true, 9, NOW()),
  ('health', 'স্বাস্থ্য', 'Health and wellness', true, 10, NOW()),
  ('beauty', 'সৌন্দর্য', 'Beauty products', true, 11, NOW()),
  ('kids', 'শিশুদের', 'Kids products', true, 12, NOW()),
  ('pets', 'পোষা প্রাণী', 'Pet products', true, 13, NOW()),
  ('automotive', 'অটোমোটিভ', 'Automotive accessories', true, 14, NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert some sample products if none exist
INSERT INTO products (name, price, category, stock, description, image_url, is_featured, is_latest, is_best_selling, created_at)
VALUES 
  ('কাস্টম মগ', '350', 'gifts', 50, 'পার্সোনালাইজড ফটো সহ মগ', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', true, false, true, NOW()),
  ('কাস্টম টি-শার্ট', '500', 'custom', 30, 'আপনার পছন্দের ডিজাইন সহ টি-শার্ট', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, true, false, NOW()),
  ('ফটো ফ্রেম', '250', 'gifts', 25, 'কাস্টম ফটো ফ্রেম', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', true, true, false, NOW()),
  ('কিহোল্ডার', '120', 'accessories', 100, 'পার্সোনালাইজড কিহোল্ডার', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, false, true, NOW()),
  ('ওয়াল ক্লক', '800', 'home-decor', 15, 'কাস্টম ওয়াল ক্লক', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', true, false, false, NOW())
ON CONFLICT DO NOTHING;
