import { type Express, type Request, type Response } from "express";
import * as tmdb from "./tmdb";

const SITE_URL = "https://streamguide.click";

// Static pages for sitemap
const PROVIDER_SLUGS = [
  "netflix", "amazon-prime-video", "disney-plus", "hbo-max",
  "paramount-plus", "crunchyroll", "globoplay", "apple-tv-plus", "star-plus",
];

const STATIC_PAGES = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/streaming-prices", changefreq: "weekly", priority: 0.8 },
  { url: "/genres", changefreq: "weekly", priority: 0.7 },
  { url: "/melhores", changefreq: "weekly", priority: 0.8 },
  ...PROVIDER_SLUGS.map(slug => ({ url: `/melhores/${slug}`, changefreq: "weekly" as const, priority: 0.7 })),
  { url: "/about", changefreq: "monthly", priority: 0.3 },
];

// Generate XML sitemap
async function generateSitemap(): Promise<string> {
  const urls: string[] = [];

  // Add static pages
  for (const page of STATIC_PAGES) {
    urls.push(`
    <url>
      <loc>${SITE_URL}${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
  }

  // Add trending movies
  try {
    const trendingMovies = await tmdb.getTrendingMovies("week");
    for (const movie of trendingMovies.results.slice(0, 20)) {
      urls.push(`
    <url>
      <loc>${SITE_URL}/movie/${movie.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch trending movies for sitemap:", e);
  }

  // Add trending TV shows
  try {
    const trendingTV = await tmdb.getTrendingTVShows("week");
    for (const show of trendingTV.results.slice(0, 20)) {
      urls.push(`
    <url>
      <loc>${SITE_URL}/tv/${show.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch trending TV shows for sitemap:", e);
  }

  // Add popular movies
  try {
    const popularMovies = await tmdb.getPopularMovies(1);
    for (const movie of popularMovies.results.slice(0, 20)) {
      urls.push(`
    <url>
      <loc>${SITE_URL}/movie/${movie.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch popular movies for sitemap:", e);
  }

  // Add popular TV shows
  try {
    const popularTV = await tmdb.getPopularTVShows(1);
    for (const show of popularTV.results.slice(0, 20)) {
      urls.push(`
    <url>
      <loc>${SITE_URL}/tv/${show.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
    }
  } catch (e) {
    console.error("[SEO] Failed to fetch popular TV shows for sitemap:", e);
  }

  // Deduplicate URLs
  const uniqueUrls = Array.from(new Set(urls));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.join("")}
</urlset>`;
}

// Cache sitemap for 1 hour
let sitemapCache: { xml: string; timestamp: number } | null = null;
const SITEMAP_CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

async function getMovieMetaTags(movieId: number): Promise<string> {
  try {
    const movie = await tmdb.getMovieDetails(movieId);
    const title = `${movie.title} - Onde Assistir | Onde Assistir`;
    const description = movie.overview
      ? `${movie.overview.substring(0, 155)}...`
      : `Descubra onde assistir ${movie.title} no Brasil.`;
    const image = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : `${SITE_URL}/og-default.png`;
    const url = `${SITE_URL}/movie/${movieId}`;

    return buildMetaTags({ title, description, image, url, type: "video.movie" });
  } catch (e) {
    return "";
  }
}

async function getTVShowMetaTags(tvId: number): Promise<string> {
  try {
    const show = await tmdb.getTVShowDetails(tvId);
    const title = `${show.name} - Onde Assistir | Onde Assistir`;
    const description = show.overview
      ? `${show.overview.substring(0, 155)}...`
      : `Descubra onde assistir ${show.name} no Brasil.`;
    const image = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : `${SITE_URL}/og-default.png`;
    const url = `${SITE_URL}/tv/${tvId}`;

    return buildMetaTags({ title, description, image, url, type: "video.tv_show" });
  } catch (e) {
    return "";
  }
}

// Provider metadata for /melhores pages
const PROVIDER_META: Record<string, { name: string; description: string; color: string }> = {
  "netflix": { name: "Netflix", description: "Descubra os melhores filmes e séries disponíveis na Netflix no Brasil. Veja o catálogo atualizado com os títulos mais populares e bem avaliados.", color: "#E50914" },
  "amazon-prime-video": { name: "Amazon Prime Video", description: "Explore os melhores filmes e séries do Amazon Prime Video no Brasil. Catálogo atualizado com títulos populares e originais Amazon.", color: "#00A8E1" },
  "disney-plus": { name: "Disney+", description: "Veja os melhores filmes e séries da Disney+ no Brasil. Disney, Pixar, Marvel, Star Wars e National Geographic em um só lugar.", color: "#113CCF" },
  "hbo-max": { name: "HBO Max", description: "Confira os melhores filmes e séries do HBO Max no Brasil. Séries HBO, filmes Warner Bros e conteúdo exclusivo atualizado.", color: "#B535F6" },
  "paramount-plus": { name: "Paramount+", description: "Descubra os melhores filmes e séries do Paramount+ no Brasil. Filmes Paramount, séries CBS e produções originais.", color: "#0064FF" },
  "crunchyroll": { name: "Crunchyroll", description: "Explore os melhores animes disponíveis no Crunchyroll no Brasil. O maior catálogo de anime do mundo atualizado.", color: "#F47521" },
  "globoplay": { name: "Globoplay", description: "Veja os melhores filmes, séries e novelas do Globoplay. Conteúdo nacional da Globo e produções originais.", color: "#F72B2B" },
  "apple-tv-plus": { name: "Apple TV+", description: "Confira os melhores filmes e séries do Apple TV+ no Brasil. Produções originais Apple premiadas e aclamadas pela crítica.", color: "#000000" },
  "star-plus": { name: "Star+", description: "Descubra os melhores filmes, séries e esportes do Star+ no Brasil. ESPN, séries e filmes para adultos.", color: "#02C8C8" },
};

function getMelhoresIndexMetaTags(): string {
  const date = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonth = `${months[date.getMonth()]} ${date.getFullYear()}`;
  return buildMetaTags({
    title: `Melhores Filmes e Séries por Streaming - ${currentMonth} | Onde Assistir`,
    description: `Descubra os melhores filmes e séries em cada plataforma de streaming no Brasil em ${currentMonth}. Compare catálogos de Netflix, Prime Video, Disney+, HBO Max e mais.`,
    image: `${SITE_URL}/og-default.png`,
    url: `${SITE_URL}/melhores`,
    type: "website",
  });
}

function getProviderMetaTags(slug: string): string {
  const provider = PROVIDER_META[slug];
  if (!provider) return "";
  const date = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonth = `${months[date.getMonth()]} ${date.getFullYear()}`;
  return buildMetaTags({
    title: `Melhores Filmes e Séries na ${provider.name} - ${currentMonth} | Onde Assistir`,
    description: provider.description,
    image: `${SITE_URL}/og-default.png`,
    url: `${SITE_URL}/melhores/${slug}`,
    type: "website",
  });
}

function buildMetaTags(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
}): string {
  return `
    <meta property="og:title" content="${escapeHtml(opts.title)}" />
    <meta property="og:description" content="${escapeHtml(opts.description)}" />
    <meta property="og:image" content="${escapeHtml(opts.image)}" />
    <meta property="og:url" content="${escapeHtml(opts.url)}" />
    <meta property="og:type" content="${opts.type}" />
    <meta property="og:site_name" content="Onde Assistir" />
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
        metaTags = await getMovieMetaTags(parseInt(movieMatch[1]));
      } else if (tvMatch) {
        metaTags = await getTVShowMetaTags(parseInt(tvMatch[1]));
      } else if (melhoresIndexMatch) {
        metaTags = getMelhoresIndexMetaTags();
      } else if (melhoresProviderMatch) {
        metaTags = getProviderMetaTags(melhoresProviderMatch[1]);
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
