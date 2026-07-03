import { type Express, type Request, type Response } from "express";
import * as tmdb from "./tmdb";

// Always use the canonical domain for SEO URLs to prevent duplicate content issues
// across multiple domains (streamguide.click, streamradar.com.br, manus.space)
function getSiteUrl(_req?: import("express").Request): string {
  return "https://streamradar.com.br";
}
const SITE_URL = "https://streamradar.com.br"; // fallback for sitemap

// Static pages for sitemap
const PROVIDER_SLUGS = [
  "netflix", "amazon-prime-video", "disney-plus", "hbo-max",
  "paramount-plus", "crunchyroll", "globoplay", "apple-tv-plus",
];

const STATIC_PAGES = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/streaming-prices", changefreq: "weekly", priority: 0.8 },
  { url: "/genres", changefreq: "weekly", priority: 0.7 },
  { url: "/melhores", changefreq: "weekly", priority: 0.8 },
  ...PROVIDER_SLUGS.map(slug => ({ url: `/melhores/${slug}`, changefreq: "weekly" as const, priority: 0.7 })),
  { url: "/about", changefreq: "monthly", priority: 0.3 },
];

// Generate XML sitemap with comprehensive content coverage
async function generateSitemap(): Promise<string> {
  const urls: string[] = [];
  const addedIds = { movies: new Set<number>(), tv: new Set<number>() };

  function addMovieUrl(id: number, priority: number, changefreq: string) {
    if (addedIds.movies.has(id)) return;
    addedIds.movies.add(id);
    urls.push(`
    <url>
      <loc>${SITE_URL}/movie/${id}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`);
  }

  function addTVUrl(id: number, priority: number, changefreq: string) {
    if (addedIds.tv.has(id)) return;
    addedIds.tv.add(id);
    urls.push(`
    <url>
      <loc>${SITE_URL}/tv/${id}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`);
  }

  // Add static pages
  for (const page of STATIC_PAGES) {
    urls.push(`
    <url>
      <loc>${SITE_URL}${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
  }

  // Add trending movies (high priority - these are what people search for)
  try {
    const trendingMovies = await tmdb.getTrendingMovies("week");
    for (const movie of trendingMovies.results) {
      addMovieUrl(movie.id, 0.9, "daily");
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch trending movies for sitemap:", e);
  }

  // Add trending TV shows
  try {
    const trendingTV = await tmdb.getTrendingTVShows("week");
    for (const show of trendingTV.results) {
      addTVUrl(show.id, 0.9, "daily");
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch trending TV shows for sitemap:", e);
  }

  // Add popular movies (multiple pages for broader coverage)
  for (let page = 1; page <= 5; page++) {
    try {
      const popularMovies = await tmdb.getPopularMovies(page);
      for (const movie of popularMovies.results) {
        addMovieUrl(movie.id, 0.7, "weekly");
      }
    } catch (e) {
      console.error(`[SEO] Failed to fetch popular movies page ${page}:`, e);
      break;
    }
  }

  // Add popular TV shows (multiple pages)
  for (let page = 1; page <= 5; page++) {
    try {
      const popularTV = await tmdb.getPopularTVShows(page);
      for (const show of popularTV.results) {
        addTVUrl(show.id, 0.7, "weekly");
      }
    } catch (e) {
      console.error(`[SEO] Failed to fetch popular TV shows page ${page}:`, e);
      break;
    }
  }

  // Add upcoming movies
  try {
    const upcoming = await tmdb.getUpcomingMovies(1);
    for (const movie of upcoming.results) {
      addMovieUrl(movie.id, 0.6, "daily");
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch upcoming movies for sitemap:", e);
  }

  // Add movies by genre (top genres for Brazilian audience)
  const topGenreIds = [28, 12, 35, 18, 27, 878, 53, 10749, 16, 80]; // Action, Adventure, Comedy, Drama, Horror, Sci-Fi, Thriller, Romance, Animation, Crime
  for (const genreId of topGenreIds) {
    try {
      const genreMovies = await tmdb.discoverMoviesByGenre(genreId, 1);
      for (const movie of genreMovies.results.slice(0, 10)) {
        addMovieUrl(movie.id, 0.5, "weekly");
      }
    } catch (e) {
      // Silently skip failed genre fetches
    }
  }

  // Add TV shows by genre
  const topTVGenreIds = [10759, 35, 18, 80, 10765, 10768, 16, 10766]; // Action/Adventure, Comedy, Drama, Crime, Sci-Fi/Fantasy, War, Animation, Soap
  for (const genreId of topTVGenreIds) {
    try {
      const genreShows = await tmdb.discoverTVShowsByGenre(genreId, 1);
      for (const show of genreShows.results.slice(0, 10)) {
        addTVUrl(show.id, 0.5, "weekly");
      }
    } catch (e) {
      // Silently skip failed genre fetches
    }
  }

  // Add content by streaming provider (Netflix, Prime, Disney+, etc.)
  const providerIds = [8, 119, 337, 384, 531, 2, 307]; // Netflix, Prime, Disney+, HBO Max, Paramount+, Apple TV+, Globoplay
  for (const providerId of providerIds) {
    try {
      const providerMovies = await tmdb.discoverMoviesByProvider(providerId, 1);
      for (const movie of providerMovies.results.slice(0, 10)) {
        addMovieUrl(movie.id, 0.5, "weekly");
      }
    } catch (e) {
      // Silently skip
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;
}

// Cache sitemap for 1 hour
let sitemapCache: { xml: string; timestamp: number } | null = null;
const SITEMAP_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getCachedSitemap(): Promise<string> {
  const now = Date.now();
  if (sitemapCache && now - sitemapCache.timestamp < SITEMAP_CACHE_TTL) {
    return sitemapCache.xml;
  }
  const xml = await generateSitemap();
  sitemapCache = { xml, timestamp: now };
  return xml;
}

// Server-side meta tag injection for social media crawlers
// This intercepts requests from bots and injects OG meta tags into the HTML
function isBot(userAgent: string): boolean {
  const botPatterns = [
    "facebookexternalhit",
    "Facebot",
    "Twitterbot",
    "WhatsApp",
    "LinkedInBot",
    "Slackbot",
    "TelegramBot",
    "Discordbot",
    "Googlebot",
    "bingbot",
    "Baiduspider",
    "YandexBot",
    "DuckDuckBot",
    "Applebot",
    "PinterestBot",
  ];
  return botPatterns.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

async function getMovieMetaTags(movieId: number, req?: import("express").Request): Promise<string> {
  try {
    const siteUrl = getSiteUrl(req);
    const movie = await tmdb.getMovieDetails(movieId);
    const title = `${movie.title} - Onde Assistir | Stream Radar`;
    const description = movie.overview
      ? `${movie.overview.substring(0, 155)}...`
      : `Descubra onde assistir ${movie.title} no Brasil.`;
    const image = movie.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : `${siteUrl}/og-default.png`;
    const imageWidth = movie.poster_path ? "780" : "1200";
    const imageHeight = movie.poster_path ? "1170" : "630";
    const url = `${siteUrl}/movie/${movieId}`;

    return buildMetaTags({ title, description, image, url, type: "video.movie", imageWidth, imageHeight });
  } catch (e) {
    return "";
  }
}

async function getTVShowMetaTags(tvId: number, req?: import("express").Request): Promise<string> {
  try {
    const siteUrl = getSiteUrl(req);
    const show = await tmdb.getTVShowDetails(tvId);
    const title = `${show.name} - Onde Assistir | Stream Radar`;
    const description = show.overview
      ? `${show.overview.substring(0, 155)}...`
      : `Descubra onde assistir ${show.name} no Brasil.`;
    const image = show.poster_path
      ? `https://image.tmdb.org/t/p/w780${show.poster_path}`
      : `${siteUrl}/og-default.png`;
    const imageWidth = show.poster_path ? "780" : "1200";
    const imageHeight = show.poster_path ? "1170" : "630";
    const url = `${siteUrl}/tv/${tvId}`;

    return buildMetaTags({ title, description, image, url, type: "video.tv_show", imageWidth, imageHeight });
  } catch (e) {
    return "";
  }
}

// Provider metadata for /melhores pages
const PROVIDER_META: Record<string, { name: string; description: string; color: string; ogImage: string }> = {
  "netflix": { name: "Netflix", description: "Descubra os melhores filmes e séries disponíveis na Netflix no Brasil. Veja o catálogo atualizado com os títulos mais populares e bem avaliados.", color: "#E50914", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-netflix-eX46pVreo7Go9fQm6Zggsb.png" },
  "amazon-prime-video": { name: "Amazon Prime Video", description: "Explore os melhores filmes e séries do Amazon Prime Video no Brasil. Catálogo atualizado com títulos populares e originais Amazon.", color: "#00A8E1", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-amazon-prime-video-ZKiV6Twu3tPMpeCrojwHMu.png" },
  "disney-plus": { name: "Disney+", description: "Veja os melhores filmes e séries da Disney+ no Brasil. Disney, Pixar, Marvel, Star Wars e National Geographic em um só lugar.", color: "#113CCF", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-disney-plus-LaadhVAqe3VcGFKKWaETR9.png" },
  "hbo-max": { name: "Max", description: "Confira os melhores filmes e séries do HBO Max no Brasil. Séries HBO, filmes Warner Bros e conteúdo exclusivo atualizado.", color: "#B535F6", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-hbo-max-85FisE3m97VL3gULqF7k9Z.png" },
  "paramount-plus": { name: "Paramount+", description: "Descubra os melhores filmes e séries do Paramount+ no Brasil. Filmes Paramount, séries CBS e produções originais.", color: "#0064FF", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-paramount-plus-Jx8wz7Fc4ApPrajRvGsLTZ.png" },
  "crunchyroll": { name: "Crunchyroll", description: "Explore os melhores animes disponíveis no Crunchyroll no Brasil. O maior catálogo de anime do mundo atualizado.", color: "#F47521", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-crunchyroll-VNd2jg8WZUa6KXMRsBnR5w.png" },
  "globoplay": { name: "Globoplay", description: "Veja os melhores filmes, séries e novelas do Globoplay. Conteúdo nacional da Globo e produções originais.", color: "#F72B2B", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-globoplay-G7ptPJxAmdeJzdkJXJZGme.png" },
  "apple-tv-plus": { name: "Apple TV+", description: "Confira os melhores filmes e séries do Apple TV+ no Brasil. Produções originais Apple premiadas e aclamadas pela crítica.", color: "#000000", ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029229201/Cvg8278ofufQzThj4s4h83/og-apple-tv-plus-A9GUXBBFH7NN6Ab7xCgYKY.png" },

};

function getMelhoresIndexMetaTags(req?: import("express").Request): string {
  const siteUrl = getSiteUrl(req);
  const date = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonth = `${months[date.getMonth()]} ${date.getFullYear()}`;
  return buildMetaTags({
    title: `Melhores Filmes e Séries por Streaming - ${currentMonth} | Stream Radar`,
    description: `Descubra os melhores filmes e séries em cada plataforma de streaming no Brasil em ${currentMonth}. Compare catálogos de Netflix, Prime Video, Disney+, HBO Max e mais.`,
    image: `${siteUrl}/og-default.png`,
    url: `${siteUrl}/melhores`,
    type: "website",
  });
}

function getProviderMetaTags(slug: string, req?: import("express").Request): string {
  const siteUrl = getSiteUrl(req);
  const provider = PROVIDER_META[slug];
  if (!provider) return "";
  const date = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonth = `${months[date.getMonth()]} ${date.getFullYear()}`;
  return buildMetaTags({
    title: `Melhores Filmes e Séries na ${provider.name} - ${currentMonth} | Stream Radar`,
    description: provider.description,
    image: provider.ogImage,
    url: `${siteUrl}/melhores/${slug}`,
    type: "website",
  });
}

function buildMetaTags(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  imageWidth?: string;
  imageHeight?: string;
}): string {
  const imgWidth = opts.imageWidth || "1200";
  const imgHeight = opts.imageHeight || "630";
  return `
    <meta property="og:title" content="${escapeHtml(opts.title)}" />
    <meta property="og:description" content="${escapeHtml(opts.description)}" />
    <meta property="og:image" content="${escapeHtml(opts.image)}" />
    <meta property="og:image:width" content="${imgWidth}" />
    <meta property="og:image:height" content="${imgHeight}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:url" content="${escapeHtml(opts.url)}" />
    <meta property="og:type" content="${opts.type}" />
    <meta property="og:site_name" content="Stream Radar" />
    <meta property="og:locale" content="pt_BR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(opts.title)}" />
    <meta name="twitter:description" content="${escapeHtml(opts.description)}" />
    <meta name="twitter:image" content="${escapeHtml(opts.image)}" />
    <title>${escapeHtml(opts.title)}</title>
    <meta name="description" content="${escapeHtml(opts.description)}" />`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Build a minimal but complete HTML page for bot crawlers.
 * This page contains the correct OG meta tags and a noscript redirect.
 * Bots don't execute JS, so they only see the meta tags.
 * Real users with JS will be redirected to the SPA.
 */
function buildBotHtml(metaTags: string, canonicalUrl: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${metaTags}
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="theme-color" content="#0d1117" />
</head>
<body>
  <p>Redirecionando...</p>
  <script>window.location.replace(window.location.href);</script>
  <noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" /></noscript>
</body>
</html>`;
}

// Register SEO routes on the Express app
export function registerSEORoutes(app: Express) {
  // Sitemap endpoint
  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      const xml = await getCachedSitemap();
      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (e) {
      console.error("[SEO] Sitemap generation failed:", e);
      res.status(500).send("Internal Server Error");
    }
  });

  // Dedicated bot routes that return complete HTML with OG tags
  // These routes are registered BEFORE static serving, so they intercept bot requests
  // in both development and production (including CDN/pre-renderer environments)

  app.get("/movie/:id", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const movieId = parseInt(req.params.id);
      if (isNaN(movieId)) return next();
      const metaTags = await getMovieMetaTags(movieId, req);
      if (!metaTags) return next();
      const siteUrl = getSiteUrl(req);
      const html = buildBotHtml(metaTags, `${siteUrl}/movie/${movieId}`);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot movie route failed:", e);
      next();
    }
  });

  app.get("/tv/:id", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const tvId = parseInt(req.params.id);
      if (isNaN(tvId)) return next();
      const metaTags = await getTVShowMetaTags(tvId, req);
      if (!metaTags) return next();
      const siteUrl = getSiteUrl(req);
      const html = buildBotHtml(metaTags, `${siteUrl}/tv/${tvId}`);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot TV route failed:", e);
      next();
    }
  });

  app.get("/melhores", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const metaTags = getMelhoresIndexMetaTags(req);
      if (!metaTags) return next();
      const siteUrl = getSiteUrl(req);
      const html = buildBotHtml(metaTags, `${siteUrl}/melhores`);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot melhores route failed:", e);
      next();
    }
  });

  app.get("/melhores/:slug", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const slug = req.params.slug;
      const metaTags = getProviderMetaTags(slug, req);
      if (!metaTags) return next();
      const siteUrl = getSiteUrl(req);
      const html = buildBotHtml(metaTags, `${siteUrl}/melhores/${slug}`);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot melhores provider route failed:", e);
      next();
    }
  });
}

// Middleware to inject meta tags for bot requests
export function botMetaInjectionMiddleware() {
  return async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";

    if (!isBot(userAgent)) {
      return next();
    }

    // Handle movie, TV show, and /melhores pages
    const movieMatch = req.path.match(/^\/movie\/(\d+)$/);
    const tvMatch = req.path.match(/^\/tv\/(\d+)$/);
    const melhoresIndexMatch = req.path === "/melhores";
    const melhoresProviderMatch = req.path.match(/^\/melhores\/([a-z-]+)$/);

    if (!movieMatch && !tvMatch && !melhoresIndexMatch && !melhoresProviderMatch) {
      return next();
    }

    try {
      let metaTags = "";
      if (movieMatch) {
        metaTags = await getMovieMetaTags(parseInt(movieMatch[1]), req);
      } else if (tvMatch) {
        metaTags = await getTVShowMetaTags(parseInt(tvMatch[1]), req);
      } else if (melhoresIndexMatch) {
        metaTags = getMelhoresIndexMetaTags(req);
      } else if (melhoresProviderMatch) {
        metaTags = getProviderMetaTags(melhoresProviderMatch[1], req);
      }

      if (!metaTags) {
        return next();
      }

      // Store meta tags for injection by the HTML serving middleware
      (req as any).__seoMetaTags = metaTags;
      next();
    } catch (e) {
      console.error("[SEO] Bot meta injection failed:", e);
      next();
    }
  };
}
