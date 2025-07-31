-- Insert all the categories mentioned by the user
INSERT INTO categories (name, name_bengali, description, is_active, sort_order) VALUES
('Gift for Him', 'পুরুষদের জন্য গিফট', 'Special gifts designed for men', true, 1),
('Gift for Her', 'মহিলাদের জন্য গিফট', 'Special gifts designed for women', true, 2),
('Baby Gifts', 'শিশুদের গিফট', 'Cute and safe gifts for babies', true, 3),
('Men Gifts', 'পুরুষদের গিফট', 'Gifts for men of all ages', true, 4),
('Women Gifts', 'মহিলাদের গিফট', 'Gifts for women of all ages', true, 5),
('Kids Gifts', 'বাচ্চাদের গিফট', 'Fun and educational gifts for children', true, 6),
('Mugs', 'মগ', 'Custom printed mugs and cups', true, 7),
('T-Shirts', 'টি-শার্ট', 'Custom printed t-shirts and apparel', true, 8),
('Keychains', 'কিচেইন', 'Personalized keychains and key accessories', true, 9),
('Water Bottles', 'পানির বোতল', 'Custom water bottles and tumblers', true, 10),
('Personalized Gifts', 'ব্যক্তিগত গিফট', 'Customized gifts with personal touch', true, 11),
('Corporate Gifts', 'কর্পোরেট গিফট', 'Professional gifts for business', true, 12),
('Anniversary Gifts', 'বার্ষিকী গিফট', 'Special gifts for anniversaries', true, 13),
('Birthday Gifts', 'জন্মদিনের গিফট', 'Perfect gifts for birthday celebrations', true, 14),
('Holiday Gifts', 'ছুটির দিনের গিফট', 'Seasonal and holiday themed gifts', true, 15),
('Custom Prints', 'কাস্টম প্রিন্ট', 'Custom printed items and artwork', true, 16),
('Gift Packages', 'গিফট প্যাকেজ', 'Complete gift sets and packages', true, 17),
('Home Decor Gifts', 'ঘর সাজানোর গিফট', 'Decorative items for home', true, 18),
('Fashion Accessories', 'ফ্যাশন এক্সেসরিজ', 'Stylish accessories and fashion items', true, 19),
('Seasonal Specials', 'সিজনাল স্পেশাল', 'Special seasonal collections', true, 20)
ON CONFLICT (name) DO UPDATE SET
  name_bengali = EXCLUDED.name_bengali,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;