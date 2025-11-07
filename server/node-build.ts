import path from "path";
import { createServer } from "./index";
import * as express from "express";
import { fileURLToPath } from "url";

const app = createServer();
const port = process.env.PORT || 3000;

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // Don't exit, let the server continue running
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit, let the server continue running
});

// In production, serve the built SPA files
const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../spa");

console.log(`📁 Serving static files from: ${distPath}`);
console.log(`🌍 Server starting on port: ${port}`);
console.log(`🔑 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔑 OPENAI_API_KEY configured: ${!!process.env.OPENAI_API_KEY}`);

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Don't serve index.html for API routes - return 404 if not already handled
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  // Skip if it's a static file request (already handled by express.static)
  if (req.path.includes(".") && !req.path.endsWith(".html")) {
    return next();
  }

  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error serving index.html:`, err);
      res.status(500).json({ error: "Failed to serve application" });
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`✅ Server is ready to accept connections`);
}).on("error", (error: any) => {
  console.error(`❌ Server failed to start:`, error);
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
