import express, { type Request, Response, NextFunction } from "express";
import 'dotenv/config';
import path from "path";
import fs from "fs";
import { registerRoutes } from "../server/routes";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

// Initialize routes once
let initialized = false;

async function initialize() {
  if (initialized) return;
  initialized = true;

  // Create a dummy HTTP server for registerRoutes
  const { createServer } = await import("http");
  const httpServer = createServer(app);

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

// Static file serving for React app
app.use(express.static(path.join(__dirname, "../dist/public"), {
  maxAge: "1d",
  etag: false
}));

// Vercel serverless handler
export default async (req: any, res: any) => {
  await initialize();

  // Handle API routes through Express
  if (req.url.startsWith("/api")) {
    return app(req, res);
  }

  // Serve static assets
  const filePath = path.join(__dirname, "../dist/public", req.url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  // Serve index.html for all other routes (SPA)
  const indexPath = path.join(__dirname, "../dist/public/index.html");
  if (fs.existsSync(indexPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(indexPath);
  }

  // Fallback for API handling through Express
  return app(req, res);
};


