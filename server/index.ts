import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes-optimized";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import { createServer } from "http";
import { performDatabaseHealthCheck, setupDatabaseTables, seedSampleData } from "./database-health";

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting for AI endpoints
const aiRequestMap = new Map();
app.use('/api/ai', (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  if (!aiRequestMap.has(clientIp)) {
    aiRequestMap.set(clientIp, []);
  }

  const requests = aiRequestMap.get(clientIp);
  const recentRequests = requests.filter((time: number) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({ error: 'অনেক বেশি অনুরোধ। একটু পর আবার চেষ্টা করুন।' });
  }

  recentRequests.push(now);
  aiRequestMap.set(clientIp, recentRequests);
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Database health check endpoint
app.get('/api/health/database', async (req, res) => {
  try {
    const healthStatus = await performDatabaseHealthCheck();
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await performDatabaseHealthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

(async () => {
  try {
    // Initialize database on startup
    console.log('🚀 Starting TryneX Lifestyle Server...');
    
    // Check database health
    console.log('🔍 Checking database health...');
    const dbHealth = await performDatabaseHealthCheck();
    
    if (dbHealth.status === 'healthy') {
      console.log('✅ Database is healthy');
    } else if (dbHealth.status === 'degraded') {
      console.log('⚠️ Database is degraded, some issues detected');
      console.log('Warnings:', dbHealth.details.warnings);
    } else {
      console.log('❌ Database is unhealthy, attempting to setup...');
      
      // Try to setup database tables
      const setupSuccess = await setupDatabaseTables();
      if (setupSuccess) {
        console.log('✅ Database tables setup completed');
        
        // Try to seed sample data
        const seedSuccess = await seedSampleData();
        if (seedSuccess) {
          console.log('✅ Sample data seeded successfully');
        }
      }
    }
    
    // Register all routes
    console.log('🔗 Registering API routes...');
    registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('❌ Server error:', err);
      
      res.status(status).json({ 
        message,
        timestamp: new Date().toISOString(),
        path: _req.path,
        method: _req.method
      });
    });

    // Create HTTP server for Vite integration
    const server = createServer(app);

    // Setup Vite in development
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      console.log('🔧 Setting up Vite for development...');
      await setupVite(app, server);
    } else {
      console.log('📦 Serving static files for production...');
      serveStatic(app);
    }

    // Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 TryneX Lifestyle Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${port}/api/health`);
      console.log(`📊 Database health: http://localhost:${port}/api/health/database`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});