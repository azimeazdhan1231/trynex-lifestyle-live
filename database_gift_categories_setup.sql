-- Gift-focused categories setup script
-- Remove all existing categories and create new gift-focused ones

-- Delete existing categories
DELETE FROM categories;

-- Insert new gift-focused categories
INSERT INTO categories (id, name, name_bengali, description, image_url, is_active, sort_order) VALUES
(gen_random_uuid(), 'gift-for-him', 'তার জন্য উপহার', 'Perfect gifts for men - watches, accessories, gadgets and more', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true, 1),
(gen_random_uuid(), 'gift-for-her', 'তাঁর জন্য উপহার', 'Beautiful gifts for women - jewelry, cosmetics, fashion accessories', 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=400', true, 2),
(gen_random_uuid(), 'gift-for-couple', 'কাপলদের জন্য উপহার', 'Romantic gifts for couples - matching items, couple accessories', 'https://images.unsplash.com/photo-1518043831945-b35dd45b0e66?w=400', true, 3),
(gen_random_uuid(), 'for-mother', 'মায়ের জন্য', 'Special gifts for mothers - traditional and modern items', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true, 4),
(gen_random_uuid(), 'for-father', 'বাবার জন্য', 'Thoughtful gifts for fathers - practical and sentimental items', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, 5),
(gen_random_uuid(), 'birthday-gifts', 'জন্মদিনের উপহার', 'Perfect birthday gifts for all ages and preferences', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true, 6),
(gen_random_uuid(), 'anniversary-gifts', 'বার্ষিকীর উপহার', 'Memorable anniversary gifts to celebrate love and togetherness', 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=400', true, 7),
(gen_random_uuid(), 'wedding-gifts', 'বিয়ের উপহার', 'Beautiful wedding gifts for the special couple', 'https://images.unsplash.com/photo-1518043831945-b35dd45b0e66?w=400', true, 8),
(gen_random_uuid(), 'festival-gifts', 'উৎসবের উপহার', 'Festive gifts for Eid, Durga Puja, and other celebrations', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true, 9),
(gen_random_uuid(), 'corporate-gifts', 'কর্পোরেট উপহার', 'Professional gifts for business relationships and events', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, 10),
(gen_random_uuid(), 'kids-gifts', 'শিশুদের উপহার', 'Fun and educational gifts for children of all ages', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true, 11),
(gen_random_uuid(), 'luxury-gifts', 'বিলাসবহুল উপহার', 'Premium and luxury gift items for special occasions', 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=400', true, 12);

-- Update existing products to match new categories (examples)
-- You can run these queries to categorize existing products
UPDATE products SET category = 'gift-for-him' WHERE category IN ('men', 'male', 'watch', 'gadget') OR name ILIKE '%men%' OR name ILIKE '%male%' OR name ILIKE '%watch%';
UPDATE products SET category = 'gift-for-her' WHERE category IN ('women', 'female', 'jewelry', 'cosmetic') OR name ILIKE '%women%' OR name ILIKE '%female%' OR name ILIKE '%jewelry%';
UPDATE products SET category = 'birthday-gifts' WHERE name ILIKE '%birthday%' OR name ILIKE '%জন্মদিন%';
UPDATE products SET category = 'anniversary-gifts' WHERE name ILIKE '%anniversary%' OR name ILIKE '%বার্ষিকী%';
UPDATE products SET category = 'wedding-gifts' WHERE name ILIKE '%wedding%' OR name ILIKE '%বিয়ে%';
UPDATE products SET category = 'for-mother' WHERE name ILIKE '%mother%' OR name ILIKE '%mom%' OR name ILIKE '%মা%';
UPDATE products SET category = 'for-father' WHERE name ILIKE '%father%' OR name ILIKE '%dad%' OR name ILIKE '%বাবা%';
UPDATE products SET category = 'kids-gifts' WHERE name ILIKE '%kid%' OR name ILIKE '%child%' OR name ILIKE '%শিশু%' OR name ILIKE '%বাচ্চা%';

-- Set default category for uncategorized products
UPDATE products SET category = 'birthday-gifts' WHERE category IS NULL OR category = '' OR category NOT IN (
  'gift-for-him', 'gift-for-her', 'gift-for-couple', 'for-mother', 'for-father', 
  'birthday-gifts', 'anniversary-gifts', 'wedding-gifts', 'festival-gifts', 
  'corporate-gifts', 'kids-gifts', 'luxury-gifts'
);