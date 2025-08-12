import type { Express } from "express";
import { storage } from "./simple-storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "trynex_secret_key_2025";

export function setupAuthRoutes(app: Express) {
  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { phone, password, firstName, lastName, address } = req.body;

      if (!phone || !password || !firstName || !address) {
        return res.status(400).json({ message: 'সব তথ্য দিন' });
      }

      // Validate phone number format
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        return res.status(400).json({ message: 'সঠিক বাংলাদেশি ফোন নম্বর দিন' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        return res.status(409).json({ 
          message: 'এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে।',
          error: 'PHONE_ALREADY_REGISTERED'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        phone,
        password: hashedPassword,
        firstName,
        lastName: lastName || '',
        address,
        email: null
      });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'অ্যাকাউন্ট তৈরি হয়েছে',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'রেজিস্ট্রেশন ব্যর্থ' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ message: 'ফোন নম্বর এবং পাসওয়ার্ড দিন' });
      }

      // Find user
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(400).json({ message: 'ভুল ফোন নম্বর বা পাসওয়ার্ড' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'ভুল ফোন নম্বর বা পাসওয়ার্ড' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'সফলভাবে লগইন হয়েছে',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'লগইন ব্যর্থ' });
    }
  });

  // Admin login endpoint
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password, username } = req.body;
      
      // Support both email and username fields
      const loginField = email || username;

      if (!loginField || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'ইমেইল এবং পাসওয়ার্ড দিন' 
        });
      }

      // Check admin credentials - hardcoded for now
      const ADMIN_EMAIL = "admin@trynex.com";
      const ADMIN_USERNAME = "admin";
      const ADMIN_PASSWORD = "admin123";

      if ((loginField !== ADMIN_EMAIL && loginField !== ADMIN_USERNAME) || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ 
          success: false, 
          message: 'ভুল ইমেইল বা পাসওয়ার্ড' 
        });
      }

      // Generate admin JWT token
      const token = jwt.sign(
        { 
          id: 'admin', 
          username: 'admin',
          email: ADMIN_EMAIL, 
          role: 'admin' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'এডমিন লগইন সফল',
        token,
        admin: {
          id: 'admin',
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'সার্ভার এরর' 
      });
    }
  });

  // Admin token verification endpoint
  app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not an admin' });
      }

      res.json({
        success: true,
        admin: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      });
    });
  });

  // Verify token middleware
  app.get('/api/auth/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      try {
        const user = await storage.getUser(decoded.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address
          }
        });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
    });
  });
}