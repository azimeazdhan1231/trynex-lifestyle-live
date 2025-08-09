import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { products, categories, offers, orders, users, userOrders, admins, siteSettings, blogs, pages, promoCodes, analytics, sessions, userCarts, customOrders } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema: { products, categories, offers, orders, users, userOrders, admins, siteSettings, blogs, pages, promoCodes, analytics, sessions, userCarts, customOrders } });