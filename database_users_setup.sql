
-- Users table setup for Trynex Lifestyle store
-- This file creates the users table for storing authenticated user information

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,  -- Replit user ID
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert sample admin user (optional)
INSERT INTO users (id, email, first_name, last_name, created_at) 
VALUES ('admin-user-1', 'admin@trynex.com', 'Admin', 'User', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Users table setup completed successfully!' as status;
