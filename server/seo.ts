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

// Genre data for SEO landing pages
const GENRE_SEO_DATA: Record<string, { id: number; tvId?: number; name: string }> = {
  "acao": { id: 28, tvId: 10759, name: "Ação" },
  "aventura": { id: 12, tvId: 10759, name: "Aventura" },
  "animacao": { id: 16, name: "Animação" },
  "comedia": { id: 35, name: "Comédia" },
  "crime": { id: 80, name: "Crime" },
  "documentario": { id: 99, name: "Documentário" },
  "drama": { id: 18, name: "Drama" },
  "familia": { id: 10751, name: "Família" },
  "fantasia": { id: 14, tvId: 10765, name: "Fantasia" },
  "terror": { id: 27, name: "Terror" },
  "romance": { id: 10749, name: "Romance" },
  "ficcao-cientifica": { id: 878, tvId: 10765, name: "Ficção Científica" },
  "suspense": { id: 53, name: "Suspense" },
  "guerra": { id: 10752, tvId: 10768, name: "Guerra" },
  "faroeste": { id: 37, name: "Faroeste" },
  "musical": { id: 10402, name: "Musical" },
  "misterio": { id: 9648, name: "Mistério" },
  "historia": { id: 36, name: "História" },
};

// Provider data for SEO landing pages
const PROVIDER_SEO_DATA: Record<string, { id: number; name: string }> = {
  "netflix": { id: 8, name: "Netflix" },
  "amazon-prime-video": { id: 119, name: "Amazon Prime Video" },
  "disney-plus": { id: 337, name: "Disney+" },
  "hbo-max": { id: 1899, name: "Max (HBO)" },
  "paramount-plus": { id: 531, name: "Paramount+" },
  "crunchyroll": { id: 283, name: "Crunchyroll" },
  "globoplay": { id: 307, name: "Globoplay" },
  "apple-tv-plus": { id: 350, name: "Apple TV+" },
};

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

  // Add SEO landing pages (genre-based and provider-based)
  const genreSlugs = Object.keys(GENRE_SEO_DATA);
  for (const slug of genreSlugs) {
    urls.push(`
    <url>
      <loc>${SITE_URL}/onde-assistir/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
  }
  for (const slug of PROVIDER_SLUGS) {
    urls.push(`
    <url>
      <loc>${SITE_URL}/melhores-filmes/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
    urls.push(`
    <url>
      <loc>${SITE_URL}/melhores-series/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
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
function buildBotHtml(metaTags: string, canonicalUrl: string, jsonLd?: Record<string, unknown> | Record<string, unknown>[]): string {
  const jsonLdScript = jsonLd
    ? `\n  <script type="application/ld+json">${JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}</script>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${metaTags}
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="theme-color" content="#0d1117" />${jsonLdScript}
</head>
<body>
  <header><h1><a href="${escapeHtml(canonicalUrl)}">Stream Radar</a></h1><nav><a href="https://streamradar.com.br/">Início</a> | <a href="https://streamradar.com.br/search">Buscar</a> | <a href="https://streamradar.com.br/genres">Gêneros</a> | <a href="https://streamradar.com.br/melhores">Plataformas</a> | <a href="https://streamradar.com.br/streaming-prices">Preços</a> | <a href="https://streamradar.com.br/novidades">Novidades</a></nav></header>
  <main id="content"></main>
  <footer><p>© 2026 Stream Radar. Encontre onde assistir filmes e séries no Brasil.</p><a href="https://streamradar.com.br/politica-de-privacidade">Política de Privacidade</a></footer>
  <script>window.location.replace(window.location.href);</script>
  <noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" /></noscript>
</body>
</html>`;
}

// Enhanced version that includes actual content body for better indexing (fixes "Crawled - not indexed")
function buildBotHtmlWithContent(metaTags: string, canonicalUrl: string, bodyContent: string, jsonLd?: Record<string, unknown> | Record<string, unknown>[]): string {
  const jsonLdScript = jsonLd
    ? `\n  <script type="application/ld+json">${JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}</script>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${metaTags}
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="theme-color" content="#0d1117" />${jsonLdScript}
</head>
<body>
  <header><h1><a href="https://streamradar.com.br">Stream Radar</a></h1><nav><a href="https://streamradar.com.br/">Início</a> | <a href="https://streamradar.com.br/search">Buscar</a> | <a href="https://streamradar.com.br/genres">Gêneros</a> | <a href="https://streamradar.com.br/melhores">Plataformas</a> | <a href="https://streamradar.com.br/streaming-prices">Preços</a></nav></header>
  <main>${bodyContent}</main>
  <footer><p>© 2026 Stream Radar. Encontre onde assistir filmes e séries no Brasil.</p><a href="https://streamradar.com.br/politica-de-privacidade">Política de Privacidade</a></footer>
  <script>window.location.replace(window.location.href);</script>
  <noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" /></noscript>
</body>
</html>`;
}

// Server-side JSON-LD builders (mirror client-side but run on server for bots)
function buildMovieJsonLdServer(movie: any, siteUrl: string): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview || "",
    url: `${siteUrl}/movie/${movie.id}`,
    datePublished: movie.release_date,
    inLanguage: "pt-BR",
  };
  if (movie.poster_path) {
    jsonLd.image = [
      `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
    ];
  }
  if (movie.vote_average > 0 && movie.vote_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average.toFixed(1),
      bestRating: "10",
      worstRating: "1",
      ratingCount: movie.vote_count,
    };
  }
  if (movie.genres?.length > 0) {
    jsonLd.genre = movie.genres.map((g: any) => g.name);
  }
  if (movie.runtime) {
    const hours = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;
    jsonLd.duration = `PT${hours}H${mins}M`;
  }
  if (movie.credits?.crew) {
    const director = movie.credits.crew.find((c: any) => c.job === "Director");
    if (director) {
      jsonLd.director = { "@type": "Person", name: director.name };
    }
  }
  if (movie.credits?.cast?.length > 0) {
    jsonLd.actor = movie.credits.cast.slice(0, 5).map((a: any) => ({
      "@type": "Person",
      name: a.name,
    }));
  }
  return jsonLd;
}

function buildTVShowJsonLdServer(show: any, siteUrl: string): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    description: show.overview || "",
    url: `${siteUrl}/tv/${show.id}`,
    datePublished: show.first_air_date,
    inLanguage: "pt-BR",
  };
  if (show.poster_path) {
    jsonLd.image = [
      `https://image.tmdb.org/t/p/w500${show.poster_path}`,
      `https://image.tmdb.org/t/p/w780${show.poster_path}`,
    ];
  }
  if (show.vote_average > 0 && show.vote_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: show.vote_average.toFixed(1),
      bestRating: "10",
      worstRating: "1",
      ratingCount: show.vote_count,
    };
  }
  if (show.genres?.length > 0) {
    jsonLd.genre = show.genres.map((g: any) => g.name);
  }
  if (show.number_of_seasons) {
    jsonLd.numberOfSeasons = show.number_of_seasons;
  }
  if (show.number_of_episodes) {
    jsonLd.numberOfEpisodes = show.number_of_episodes;
  }
  if (show.created_by?.length > 0) {
    jsonLd.creator = show.created_by.map((c: any) => ({
      "@type": "Person",
      name: c.name,
    }));
  }
  if (show.credits?.cast?.length > 0) {
    jsonLd.actor = show.credits.cast.slice(0, 5).map((a: any) => ({
      "@type": "Person",
      name: a.name,
    }));
  }
  return jsonLd;
}


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

  // Homepage bot route with WebSite + Organization JSON-LD
  app.get("/", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const siteUrl = getSiteUrl(req);
      const metaTags = buildMetaTags({
        title: "Stream Radar: Onde Assistir Filmes e S\u00e9ries no Brasil",
        description: "Encontre onde assistir qualquer filme ou s\u00e9rie no Brasil. Compare Netflix, Prime Video, Disney+, HBO Max e Globoplay em um s\u00f3 lugar. Busque agora!",
        image: `${siteUrl}/og-default.png`,
        url: siteUrl,
        type: "website",
      });
      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Stream Radar",
          alternateName: "Stream Radar Brasil",
          url: siteUrl,
          description: "Encontre onde assistir qualquer filme ou s\u00e9rie no Brasil. Compare Netflix, Prime Video, Disney+, HBO Max e Globoplay em um s\u00f3 lugar.",
          inLanguage: "pt-BR",
          publisher: {
            "@type": "Organization",
            name: "Stream Radar",
            logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png` },
          },
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Stream Radar",
          url: siteUrl,
          logo: `${siteUrl}/icon-512.png`,
          description: "Guia de streaming brasileiro que ajuda voc\u00ea a encontrar onde assistir filmes e s\u00e9ries nas principais plataformas do Brasil.",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: `${siteUrl}/about`,
            availableLanguage: "Portuguese",
          },
        },
      ];
      const html = buildBotHtml(metaTags, siteUrl, jsonLd);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot homepage route failed:", e);
      next();
    }
  });

  app.get("/movie/:id", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const movieId = parseInt(req.params.id);
      if (isNaN(movieId)) return next();
      const metaTags = await getMovieMetaTags(movieId, req);
      if (!metaTags) {
        // Return proper 404 for invalid movie IDs (fixes Soft 404)
        res.status(404).set("Content-Type", "text/html; charset=utf-8");
        res.send(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Filme não encontrado | Stream Radar</title><meta name="robots" content="noindex"/></head><body><h1>Filme não encontrado</h1><p>Este filme não está disponível.</p><a href="https://streamradar.com.br/">Voltar ao início</a></body></html>`);
        return;
      }
      const siteUrl = getSiteUrl(req);
      // Build JSON-LD for the movie
      const movie = await tmdb.getMovieDetails(movieId);
      const jsonLd = buildMovieJsonLdServer(movie, siteUrl);
      const breadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "In\u00edcio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Filmes", item: `${siteUrl}/search?type=movie` },
          { "@type": "ListItem", position: 3, name: movie.title, item: `${siteUrl}/movie/${movieId}` },
        ],
      };
      // Build rich body content for better indexing
      const year = movie.release_date ? ` (${movie.release_date.substring(0, 4)})` : "";
      const genres = movie.genres?.map((g: any) => g.name).join(", ") || "";
      const cast = movie.credits?.cast?.slice(0, 5).map((a: any) => a.name).join(", ") || "";
      const director = movie.credits?.crew?.find((c: any) => c.job === "Director")?.name || "";
      const providers = movie.watchProviders?.flatrate?.map((p: any) => p.provider_name).join(", ") || "";
      const bodyContent = `
    <article>
      <h1>${escapeHtml(movie.title)}${year} - Onde Assistir Online</h1>
      ${movie.overview ? `<p>${escapeHtml(movie.overview)}</p>` : ""}
      ${genres ? `<p><strong>Gêneros:</strong> ${escapeHtml(genres)}</p>` : ""}
      ${cast ? `<p><strong>Elenco:</strong> ${escapeHtml(cast)}</p>` : ""}
      ${director ? `<p><strong>Diretor:</strong> ${escapeHtml(director)}</p>` : ""}
      ${providers ? `<p><strong>Disponível em:</strong> ${escapeHtml(providers)}</p>` : `<p>Verifique a disponibilidade nas plataformas de streaming do Brasil.</p>`}
      ${movie.vote_average > 0 ? `<p><strong>Nota:</strong> ${movie.vote_average.toFixed(1)}/10</p>` : ""}
      ${movie.runtime ? `<p><strong>Duração:</strong> ${movie.runtime} min</p>` : ""}
      <p>Descubra onde assistir ${escapeHtml(movie.title)} no Brasil. Compare opções de streaming, aluguel e compra digital.</p>
    </article>`;
      const html = buildBotHtmlWithContent(metaTags, `${siteUrl}/movie/${movieId}`, bodyContent, [jsonLd, breadcrumbs]);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      // If TMDB returns 404, return proper 404 status (fixes Soft 404)
      const err = e as any;
      if (err?.response?.status === 404 || err?.message?.includes("404")) {
        res.status(404).set("Content-Type", "text/html; charset=utf-8");
        res.send(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Filme não encontrado | Stream Radar</title><meta name="robots" content="noindex"/></head><body><h1>Filme não encontrado</h1><p>Este filme não está disponível.</p><a href="https://streamradar.com.br/">Voltar ao início</a></body></html>`);
      } else {
        console.error("[SEO] Bot movie route failed:", e);
        next();
      }
    }
  });

  app.get("/tv/:id", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const tvId = parseInt(req.params.id);
      if (isNaN(tvId)) return next();
      const metaTags = await getTVShowMetaTags(tvId, req);
      if (!metaTags) {
        res.status(404).set("Content-Type", "text/html; charset=utf-8");
        res.send(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Série não encontrada | Stream Radar</title><meta name="robots" content="noindex"/></head><body><h1>Série não encontrada</h1><p>Esta série não está disponível.</p><a href="https://streamradar.com.br/">Voltar ao início</a></body></html>`);
        return;
      }
      const siteUrl = getSiteUrl(req);
      // Build JSON-LD for the TV show
      const show = await tmdb.getTVShowDetails(tvId);
      const jsonLd = buildTVShowJsonLdServer(show, siteUrl);
      const breadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "In\u00edcio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "S\u00e9ries", item: `${siteUrl}/search?type=tv` },
          { "@type": "ListItem", position: 3, name: show.name, item: `${siteUrl}/tv/${tvId}` },
        ],
      };
      // Build rich body content for better indexing
      const year = show.first_air_date ? ` (${show.first_air_date.substring(0, 4)})` : "";
      const genres = show.genres?.map((g: any) => g.name).join(", ") || "";
      const cast = show.credits?.cast?.slice(0, 5).map((a: any) => a.name).join(", ") || "";
      const providers = show.watchProviders?.flatrate?.map((p: any) => p.provider_name).join(", ") || "";
      const seasons = show.number_of_seasons ? `${show.number_of_seasons} temporada${show.number_of_seasons > 1 ? "s" : ""}` : "";
      const bodyContent = `
    <article>
      <h1>${escapeHtml(show.name)}${year} - Onde Assistir Online</h1>
      ${show.overview ? `<p>${escapeHtml(show.overview)}</p>` : ""}
      ${genres ? `<p><strong>Gêneros:</strong> ${escapeHtml(genres)}</p>` : ""}
      ${seasons ? `<p><strong>Temporadas:</strong> ${escapeHtml(seasons)}</p>` : ""}
      ${cast ? `<p><strong>Elenco:</strong> ${escapeHtml(cast)}</p>` : ""}
      ${providers ? `<p><strong>Disponível em:</strong> ${escapeHtml(providers)}</p>` : `<p>Verifique a disponibilidade nas plataformas de streaming do Brasil.</p>`}
      ${show.vote_average > 0 ? `<p><strong>Nota:</strong> ${show.vote_average.toFixed(1)}/10</p>` : ""}
      <p>Descubra onde assistir ${escapeHtml(show.name)} no Brasil. Compare opções de streaming, aluguel e compra digital.</p>
    </article>`;
      const html = buildBotHtmlWithContent(metaTags, `${siteUrl}/tv/${tvId}`, bodyContent, [jsonLd, breadcrumbs]);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      const err = e as any;
      if (err?.response?.status === 404 || err?.message?.includes("404")) {
        res.status(404).set("Content-Type", "text/html; charset=utf-8");
        res.send(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Série não encontrada | Stream Radar</title><meta name="robots" content="noindex"/></head><body><h1>Série não encontrada</h1><p>Esta série não está disponível.</p><a href="https://streamradar.com.br/">Voltar ao início</a></body></html>`);
      } else {
        console.error("[SEO] Bot TV route failed:", e);
        next();
      }
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

  // Genres page bot route
  app.get("/genres", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const siteUrl = getSiteUrl(req);
      const metaTags = buildMetaTags({
        title: "Gêneros de Filmes e Séries - Explore por Categoria | Stream Radar",
        description: "Explore filmes e séries por gênero: Ação, Comédia, Drama, Terror, Ficção Científica, Romance e mais. Encontre o que assistir no streaming por categoria.",
        image: `${siteUrl}/og-default.png`,
        url: `${siteUrl}/genres`,
        type: "website",
      });
      const genres = await tmdb.getMovieGenres();
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Gêneros de Filmes e Séries",
        description: "Explore filmes e séries por gênero nas plataformas de streaming do Brasil.",
        url: `${siteUrl}/genres`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: genres.genres.slice(0, 15).map((g: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            name: g.name,
            url: `${siteUrl}/genres`,
          })),
        },
      };
      const html = buildBotHtml(metaTags, `${siteUrl}/genres`, jsonLd);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot genres route failed:", e);
      next();
    }
  });

  // Search page bot route - renders actual search results for bots
  app.get("/search", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const siteUrl = getSiteUrl(req);
      const query = (req.query.q as string) || "";
      if (!query) {
        const metaTags = buildMetaTags({
          title: "Buscar Filmes e Séries - Onde Assistir | Stream Radar",
          description: "Busque qualquer filme ou série e descubra em qual streaming está disponível no Brasil. Netflix, Prime Video, Disney+, HBO Max e mais.",
          image: `${siteUrl}/og-default.png`,
          url: `${siteUrl}/search`,
          type: "website",
        });
        const html = buildBotHtml(metaTags, `${siteUrl}/search`);
        res.set("Content-Type", "text/html; charset=utf-8");
        res.send(html);
        return;
      }
      // Fetch actual search results for the query
      const results = await tmdb.searchMulti(query, 1);
      const topResults = results.results.slice(0, 10);
      const resultNames = topResults.map((r: any) => r.title || r.name).filter(Boolean).join(", ");
      const metaTags = buildMetaTags({
        title: `"${query}" - Onde Assistir no Streaming | Stream Radar`,
        description: `Resultados para "${query}": ${resultNames.substring(0, 120)}. Descubra onde assistir no Brasil.`,
        image: topResults[0]?.poster_path ? `https://image.tmdb.org/t/p/w780${topResults[0].poster_path}` : `${siteUrl}/og-default.png`,
        url: `${siteUrl}/search?q=${encodeURIComponent(query)}`,
        type: "website",
      });
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        name: `Resultados para "${query}" - Stream Radar`,
        url: `${siteUrl}/search?q=${encodeURIComponent(query)}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: results.total_results,
          itemListElement: topResults.map((r: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            name: r.title || r.name,
            url: `${siteUrl}/${r.media_type === "tv" ? "tv" : "movie"}/${r.id}`,
            ...(r.poster_path ? { image: `https://image.tmdb.org/t/p/w342${r.poster_path}` } : {}),
          })),
        },
      };
      const html = buildBotHtml(metaTags, `${siteUrl}/search?q=${encodeURIComponent(query)}`, jsonLd);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot search route failed:", e);
      next();
    }
  });

  // Streaming Prices page bot route
  app.get("/streaming-prices", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    if (!isBot(userAgent)) return next();
    try {
      const siteUrl = getSiteUrl(req);
      const metaTags = buildMetaTags({
        title: "Preços dos Streamings no Brasil 2026 - Compare Planos | Stream Radar",
        description: "Compare preços de todos os streamings no Brasil: Netflix a partir de R$20,90, Prime Video R$19,90, Disney+ R$33,90, HBO Max R$34,90. Veja todos os planos.",
        image: `${siteUrl}/og-default.png`,
        url: `${siteUrl}/streaming-prices`,
        type: "website",
      });
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Qual o streaming mais barato no Brasil em 2026?",
            acceptedAnswer: { "@type": "Answer", text: "O Amazon Prime Video é o streaming mais acessível, custando R$19,90/mês com acesso a filmes, séries e frete grátis na Amazon." },
          },
          {
            "@type": "Question",
            name: "Quanto custa a Netflix no Brasil?",
            acceptedAnswer: { "@type": "Answer", text: "A Netflix oferece planos a partir de R$20,90/mês (Padrão com anúncios), R$44,90/mês (Padrão) e R$59,90/mês (Premium com 4K)." },
          },
          {
            "@type": "Question",
            name: "Qual streaming tem o melhor catálogo de filmes?",
            acceptedAnswer: { "@type": "Answer", text: "Depende do gênero. Netflix e Prime Video têm os maiores catálogos. Disney+ é forte em família e super-heróis. HBO Max tem os melhores filmes recentes de cinema." },
          },
          {
            "@type": "Question",
            name: "Vale a pena assinar Disney+ no Brasil?",
            acceptedAnswer: { "@type": "Answer", text: "Disney+ custa R$33,90/mês e inclui conteúdo Disney, Pixar, Marvel, Star Wars e National Geographic. É ideal para famílias e fãs de super-heróis." },
          },
        ],
      };
      const html = buildBotHtml(metaTags, `${siteUrl}/streaming-prices`, jsonLd);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(html);
    } catch (e) {
      console.error("[SEO] Bot streaming-prices route failed:", e);
      next();
    }
  });

  // ============================================================
  // SEO LANDING PAGES - Thematic content pages for organic search
  // These pages target high-volume search queries in Brazil
  // ============================================================

  // Genre-based SEO pages: /onde-assistir/:genre
  app.get("/onde-assistir/:genre", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    const siteUrl = getSiteUrl(req);
    const genreSlug = req.params.genre;
    const genreInfo = GENRE_SEO_DATA[genreSlug];
    if (!genreInfo) return next();

    try {
      const movies = await tmdb.discoverMoviesByGenre(genreInfo.id, 1);
      const tvShows = await tmdb.discoverTVShowsByGenre(genreInfo.tvId || genreInfo.id, 1);
      const topMovies = movies.results.slice(0, 10);
      const topShows = tvShows.results.slice(0, 5);
      const movieNames = topMovies.slice(0, 5).map((m: any) => m.title).join(", ");

      const metaTags = buildMetaTags({
        title: `Filmes de ${genreInfo.name} para Assistir no Streaming - ${new Date().getFullYear()} | Stream Radar`,
        description: `Os melhores filmes e séries de ${genreInfo.name.toLowerCase()} disponíveis no streaming no Brasil: ${movieNames}. Veja onde assistir agora.`,
        image: topMovies[0]?.poster_path ? `https://image.tmdb.org/t/p/w780${topMovies[0].poster_path}` : `${siteUrl}/og-default.png`,
        url: `${siteUrl}/onde-assistir/${genreSlug}`,
        type: "website",
      });

      if (isBot(userAgent)) {
        const jsonLd = [
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Filmes de ${genreInfo.name} para Assistir no Streaming`,
            description: `Lista atualizada dos melhores filmes e séries de ${genreInfo.name.toLowerCase()} disponíveis nas plataformas de streaming no Brasil.`,
            url: `${siteUrl}/onde-assistir/${genreSlug}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Melhores Filmes de ${genreInfo.name}`,
            numberOfItems: topMovies.length + topShows.length,
            itemListElement: [
              ...topMovies.map((m: any, i: number) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Movie",
                  name: m.title,
                  url: `${siteUrl}/movie/${m.id}`,
                  datePublished: m.release_date,
                  ...(m.poster_path ? { image: `https://image.tmdb.org/t/p/w342${m.poster_path}` } : {}),
                },
              })),
              ...topShows.map((s: any, i: number) => ({
                "@type": "ListItem",
                position: topMovies.length + i + 1,
                item: {
                  "@type": "TVSeries",
                  name: s.name,
                  url: `${siteUrl}/tv/${s.id}`,
                  datePublished: s.first_air_date,
                  ...(s.poster_path ? { image: `https://image.tmdb.org/t/p/w342${s.poster_path}` } : {}),
                },
              })),
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
              { "@type": "ListItem", position: 2, name: "Gêneros", item: `${siteUrl}/genres` },
              { "@type": "ListItem", position: 3, name: genreInfo.name, item: `${siteUrl}/onde-assistir/${genreSlug}` },
            ],
          },
        ];
        const html = buildBotHtml(metaTags, `${siteUrl}/onde-assistir/${genreSlug}`, jsonLd);
        res.set("Content-Type", "text/html; charset=utf-8");
        res.set("Cache-Control", "public, max-age=86400");
        res.send(html);
      } else {
        // For real users, serve the SPA which will render the SEO page component
        next();
      }
    } catch (e) {
      console.error("[SEO] Bot genre landing page failed:", e);
      next();
    }
  });

  // Provider-based SEO pages: /melhores-filmes/:provider and /melhores-series/:provider
  app.get("/melhores-filmes/:provider", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    const siteUrl = getSiteUrl(req);
    const providerSlug = req.params.provider;
    const providerInfo = PROVIDER_SEO_DATA[providerSlug];
    if (!providerInfo) return next();

    try {
      const movies = await tmdb.discoverMoviesByProvider(providerInfo.id, 1);
      const topMovies = movies.results.slice(0, 15);
      const movieNames = topMovies.slice(0, 5).map((m: any) => m.title).join(", ");
      const year = new Date().getFullYear();

      const metaTags = buildMetaTags({
        title: `Melhores Filmes ${providerInfo.name} ${year} - Top Filmes para Assistir | Stream Radar`,
        description: `Os melhores filmes da ${providerInfo.name} em ${year}: ${movieNames}. Lista atualizada com os títulos mais populares e bem avaliados.`,
        image: topMovies[0]?.poster_path ? `https://image.tmdb.org/t/p/w780${topMovies[0].poster_path}` : `${siteUrl}/og-default.png`,
        url: `${siteUrl}/melhores-filmes/${providerSlug}`,
        type: "website",
      });

      if (isBot(userAgent)) {
        const jsonLd = [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Melhores Filmes ${providerInfo.name} ${year}`,
            description: `Lista dos melhores filmes disponíveis na ${providerInfo.name} no Brasil em ${year}.`,
            numberOfItems: topMovies.length,
            itemListElement: topMovies.map((m: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Movie",
                name: m.title,
                url: `${siteUrl}/movie/${m.id}`,
                datePublished: m.release_date,
                ...(m.vote_average ? { aggregateRating: { "@type": "AggregateRating", ratingValue: m.vote_average.toFixed(1), bestRating: "10" } } : {}),
                ...(m.poster_path ? { image: `https://image.tmdb.org/t/p/w342${m.poster_path}` } : {}),
              },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
              { "@type": "ListItem", position: 2, name: providerInfo.name, item: `${siteUrl}/melhores/${providerSlug}` },
              { "@type": "ListItem", position: 3, name: `Melhores Filmes`, item: `${siteUrl}/melhores-filmes/${providerSlug}` },
            ],
          },
        ];
        const html = buildBotHtml(metaTags, `${siteUrl}/melhores-filmes/${providerSlug}`, jsonLd);
        res.set("Content-Type", "text/html; charset=utf-8");
        res.set("Cache-Control", "public, max-age=86400");
        res.send(html);
      } else {
        next();
      }
    } catch (e) {
      console.error("[SEO] Bot melhores-filmes route failed:", e);
      next();
    }
  });

  app.get("/melhores-series/:provider", async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers["user-agent"] || "";
    const siteUrl = getSiteUrl(req);
    const providerSlug = req.params.provider;
    const providerInfo = PROVIDER_SEO_DATA[providerSlug];
    if (!providerInfo) return next();

    try {
      const shows = await tmdb.discoverTVShowsByProvider(providerInfo.id, 1);
      const topShows = shows.results.slice(0, 15);
      const showNames = topShows.slice(0, 5).map((s: any) => s.name).join(", ");
      const year = new Date().getFullYear();

      const metaTags = buildMetaTags({
        title: `Melhores Séries ${providerInfo.name} ${year} - Top Séries para Assistir | Stream Radar`,
        description: `As melhores séries da ${providerInfo.name} em ${year}: ${showNames}. Lista atualizada com os títulos mais populares e bem avaliados.`,
        image: topShows[0]?.poster_path ? `https://image.tmdb.org/t/p/w780${topShows[0].poster_path}` : `${siteUrl}/og-default.png`,
        url: `${siteUrl}/melhores-series/${providerSlug}`,
        type: "website",
      });

      if (isBot(userAgent)) {
        const jsonLd = [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Melhores Séries ${providerInfo.name} ${year}`,
            description: `Lista das melhores séries disponíveis na ${providerInfo.name} no Brasil em ${year}.`,
            numberOfItems: topShows.length,
            itemListElement: topShows.map((s: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "TVSeries",
                name: s.name,
                url: `${siteUrl}/tv/${s.id}`,
                datePublished: s.first_air_date,
                ...(s.vote_average ? { aggregateRating: { "@type": "AggregateRating", ratingValue: s.vote_average.toFixed(1), bestRating: "10" } } : {}),
                ...(s.poster_path ? { image: `https://image.tmdb.org/t/p/w342${s.poster_path}` } : {}),
              },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
              { "@type": "ListItem", position: 2, name: providerInfo.name, item: `${siteUrl}/melhores/${providerSlug}` },
              { "@type": "ListItem", position: 3, name: `Melhores Séries`, item: `${siteUrl}/melhores-series/${providerSlug}` },
            ],
          },
        ];
        const html = buildBotHtml(metaTags, `${siteUrl}/melhores-series/${providerSlug}`, jsonLd);
        res.set("Content-Type", "text/html; charset=utf-8");
        res.set("Cache-Control", "public, max-age=86400");
        res.send(html);
      } else {
        next();
      }
    } catch (e) {
      console.error("[SEO] Bot melhores-series route failed:", e);
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
