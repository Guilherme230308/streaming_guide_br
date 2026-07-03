import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerSEORoutes, botMetaInjectionMiddleware } from "../seo";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 301 redirect non-canonical domains to streamradar.com.br
  // This fixes "Duplicate without user-selected canonical" in Google Search Console
  const CANONICAL_DOMAIN = "streamradar.com.br";
  app.use((req, res, next) => {
    const host = (req.get("x-forwarded-host") || req.get("host") || "").split(":")[0].toLowerCase();
    // Skip in development, health checks, and when host is already canonical
    if (
      process.env.NODE_ENV === "development" ||
      !host ||
      host.includes("localhost") ||
      host === CANONICAL_DOMAIN
    ) {
      return next();
    }
    // Only redirect known non-canonical domains to avoid loops
    const NON_CANONICAL_DOMAINS = [
      `www.${CANONICAL_DOMAIN}`,
      "streamguide.click",
      "www.streamguide.click",
    ];
    // Also match manus.space subdomains
    if (NON_CANONICAL_DOMAINS.includes(host) || host.endsWith(".manus.space")) {
      return res.redirect(301, `https://${CANONICAL_DOMAIN}${req.originalUrl}`);
    }
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Track page views (only HTML page requests, not API/assets)
  app.use(async (req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api/") &&
      !req.path.startsWith("/assets/") &&
      !req.path.includes(".") &&
      req.path !== "/favicon.ico"
    ) {
      try {
        const { trackMetric } = await import("../metricsTracker");
        trackMetric("page_view");
      } catch {}
    }
    next();
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // SEO: sitemap.xml endpoint
  registerSEORoutes(app);
  // SEO: inject meta tags for social media crawlers
  app.use(botMetaInjectionMiddleware());
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
