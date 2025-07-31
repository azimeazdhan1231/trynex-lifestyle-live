import express from "express";
import { storage } from "./storage";

export async function setupAuth(app: express.Express) {
  // Middleware to extract user info from Replit headers
  app.use(async (req: any, res, next) => {
    try {
      const userId = req.headers['x-replit-user-id'];
      const userName = req.headers['x-replit-user-name'];
      const userEmail = req.headers['x-replit-user-email'];

      if (userId && userName) {
        // User is authenticated, store/update user info
        try {
          await storage.createOrUpdateUser({
            id: userId,
            name: userName,
            email: userEmail || `${userName}@replit.local`,
            avatar_url: `https://replit.com/@${userName}`,
          });

          req.user = {
            claims: {
              sub: userId,
              name: userName,
              email: userEmail || `${userName}@replit.local`,
            }
          };
        } catch (error) {
          console.error("Error creating/updating user:", error);
        }
      }
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      next();
    }
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.user?.claims?.sub) {
    next();
  } else {
    res.status(401).json({ 
      message: "Authentication required",
      loginUrl: process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : "/"
    });
  }
}

export function optionalAuth(req: any, res: any, next: any) {
  // This middleware doesn't require authentication but will set user if available
  next();
}