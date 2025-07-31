import { ReplitAuth } from '@replit/auth';
import type { Express } from 'express';
import { storage } from './storage';

const auth = new ReplitAuth();

export async function setupAuth(app: Express) {
  await auth.authenticate(app);

  // Middleware to automatically register users
  app.use(async (req: any, res, next) => {
    if (req.user && req.user.claims) {
      try {
        const userId = req.user.claims.sub;
        const email = req.user.claims.email;
        const name = req.user.claims.name || '';
        const profileImage = req.user.claims.picture || '';

        // Check if user exists in database
        let user = await storage.getUser(userId);

        if (!user) {
          // Create new user
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          user = await storage.createUser({
            id: userId,
            email: email,
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: profileImage,
          });

          console.log('✅ New user registered:', email);
        } else {
          // Update user info if changed
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          if (user.firstName !== firstName || 
              user.lastName !== lastName || 
              user.profileImageUrl !== profileImage) {
            await storage.updateUser(userId, {
              firstName: firstName,
              lastName: lastName,
              profileImageUrl: profileImage,
            });
            console.log('✅ User info updated:', email);
          }
        }

        req.user.dbUser = user;
      } catch (error) {
        console.error('Error handling user registration:', error);
      }
    }
    next();
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.claims) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

export const optionalAuth = (req: any, res: any, next: any) => {
  // This middleware allows both authenticated and non-authenticated users
  next();
};