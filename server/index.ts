import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

process.on("uncaughtException", (err) => {
  console.error("[CRASH] Uncaught exception:", err.message, err.stack);
});
process.on("unhandledRejection", (reason: any) => {
  console.error("[CRASH] Unhandled rejection:", reason?.message || reason, reason?.stack || "");
});
process.on("SIGTERM", () => {
  console.error("[CRASH] Process received SIGTERM - shutting down");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.error("[CRASH] Process received SIGINT - shutting down");
  process.exit(0);
});

const app = express();

// CORS: allow known-safe origins only. The API uses Bearer-token auth (no cookies),
// so Access-Control-Allow-Credentials is not required.
// Tauri Android WebView origin is https://tauri.localhost; desktop is tauri://localhost.
const CORS_ALLOWED_EXACT = new Set([
  "https://stormsoftware.co.za",
]);
const CORS_ALLOWED_PATTERNS = [
  /^tauri:\/\//,                  // Tauri desktop (tauri://localhost)
  /^https:\/\/tauri\.localhost/,  // Tauri Android WebView
  /^asset:\/\//,                  // Tauri alternative scheme
  /^https?:\/\/localhost(:\d+)?$/, // local dev server
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed =
    origin &&
    (CORS_ALLOWED_EXACT.has(origin) ||
      CORS_ALLOWED_PATTERNS.some((p) => p.test(origin)));
  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("[ERROR] Express error handler:", err.message);
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Heartbeat - logs every 30 seconds so we can see exactly when the crash happens
  setInterval(() => {
    const mem = process.memoryUsage();
    console.log(`[HEARTBEAT] alive - heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB`);
  }, 30000);
})();
