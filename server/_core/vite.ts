import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

/**
 * Strip default OG/Twitter/title/description meta tags from HTML
 * so that dynamic SEO tags injected for bot requests are the only ones present.
 * This prevents WhatsApp/Facebook/Twitter from picking up the default og-default.png
 * instead of the movie/TV show poster.
 */
function stripDefaultMetaTags(html: string): string {
  // Remove HTML comment blocks wrapping default OG/Twitter sections
  html = html.replace(/<!--\s*Open Graph defaults[\s\S]*?-->\s*/g, '');
  html = html.replace(/<!--\s*Twitter Card defaults[\s\S]*?-->\s*/g, '');
  // Remove all OG meta tags (handles any attribute order and multi-line)
  html = html.replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>\s*/gi, '');
  // Remove all Twitter meta tags
  html = html.replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>\s*/gi, '');
  // Remove default title tag (will be replaced by dynamic one)
  html = html.replace(/<title>[^<]*<\/title>\s*/gi, '');
  // Remove default description meta tag
  html = html.replace(/<meta[^>]*name=["']description["'][^>]*>\s*/gi, '');
  return html;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      // Inject SEO meta tags for bot requests - replace defaults instead of appending
      const seoMetaTags = (req as any).__seoMetaTags;
      if (seoMetaTags) {
        template = stripDefaultMetaTags(template);
        template = template.replace('</head>', `${seoMetaTags}\n  </head>`);
      }
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (but not for API routes)
  // Use a more specific pattern that excludes /api/ routes
  app.get(/^(?!\/api\/).*/, (req, res) => {
    const seoMetaTags = (req as any).__seoMetaTags;
    if (seoMetaTags) {
      // For bot requests, replace default meta tags with dynamic ones
      const indexPath = path.resolve(distPath, "index.html");
      let html = fs.readFileSync(indexPath, "utf-8");
      html = stripDefaultMetaTags(html);
      html = html.replace('</head>', `${seoMetaTags}\n  </head>`);
      res.set("Content-Type", "text/html").send(html);
    } else {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
