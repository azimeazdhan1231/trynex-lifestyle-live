-- Create default admin user for testing
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admins (email, password) VALUES (
  'admin@trynex.com', 
  '$2a$10$E3bIzR.W7N8.G9GvZ8.GVu7/VqQ8xBnR4Z2K5QXV4QX8O4N6G8N9q'
) ON CONFLICT (email) DO NOTHING;