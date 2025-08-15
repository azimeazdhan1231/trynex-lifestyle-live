import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { products, categories, offers, orders, users, userOrders, admins, siteSettings, promoCodes, analytics, sessions, userCarts, customOrders } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Enhanced database configuration with better error handling
if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not set. Using fallback configuration.");
  // You can set a fallback URL here for development
  process.env.DATABASE_URL = "postgresql://localhost:5432/trynex_lifestyle";
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', (client) => {
  console.log('✅ Database client connected');
});

pool.on('error', (err, client) => {
  console.error('❌ Database client error:', err);
});

pool.on('remove', () => {
  console.log('🔌 Database client removed from pool');
});

export const db = drizzle({ 
  client: pool, 
  schema: { 
    products, 
    categories, 
    offers, 
    orders, 
    users, 
    userOrders, 
    admins, 
    siteSettings, 
    promoCodes, 
    analytics, 
    sessions, 
    userCarts, 
    customOrders 
  } 
});

// Health check function
export async function checkDatabaseHealth() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database health check passed:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database connections...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down database connections...');
  await pool.end();
  process.exit(0);
});