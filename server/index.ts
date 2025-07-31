import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, setupHealthCheck } from "./routes";
import { setupVite, serveStatic } from "./vite";
import cors from "cors";

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static("dist"));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

(async () => {
  try {
    // Setup health check first
    setupHealthCheck(app);

    const server = registerRoutes(app);

    // Simple error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({ message: "Internal Server Error" });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();