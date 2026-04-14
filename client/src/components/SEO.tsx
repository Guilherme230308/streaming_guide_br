import { Helmet } from "react-helmet-async";

const SITE_NAME = "Stream Radar";
const SITE_URL = "https://streamguide.click";
const DEFAULT_DESCRIPTION = "Descubra onde assistir seus filmes e séries favoritos no Brasil. Compare preços de streaming, aluguel e compra em Netflix, Prime Video, Disney+ e HBO Max.";
const DEFAULT_KEYWORDS = "onde assistir, streaming brasil, filmes online, séries online, netflix, prime video, disney plus, hbo max, globoplay, comparar streaming, preços streaming";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "video.movie" | "video.tv_show";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  children?: React.ReactNode;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  noindex = false,
  jsonLd,
  children,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Filmes e Séries nos Streamings do Brasil`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {children}
    </Helmet>
  );
}

// Helper to build Movie JSON-LD
export function buildMovieJsonLd(movie: {
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres?: { id: number; name: string }[];
  runtime?: number;
  id: number;
}) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    url: `${SITE_URL}/movie/${movie.id}`,
    datePublished: movie.release_date,
  };

  if (movie.poster_path) {
    jsonLd.image = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }

  if (movie.vote_average > 0 && movie.vote_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average.toFixed(1),
      bestRating: "10",
      ratingCount: movie.vote_count,
    };
  }

  if (movie.genres && movie.genres.length > 0) {
    jsonLd.genre = movie.genres.map((g) => g.name);
  }

  if (movie.runtime) {
    const hours = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;
    jsonLd.duration = `PT${hours}H${mins}M`;
  }

  return jsonLd;
}

// Helper to build TV Show JSON-LD
export function buildTVShowJsonLd(show: {
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  id: number;
}) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    description: show.overview,
    url: `${SITE_URL}/tv/${show.id}`,
    datePublished: show.first_air_date,
  };

  if (show.poster_path) {
    jsonLd.image = `https://image.tmdb.org/t/p/w500${show.poster_path}`;
  }

  if (show.vote_average > 0 && show.vote_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: show.vote_average.toFixed(1),
      bestRating: "10",
      ratingCount: show.vote_count,
    };
  }

  if (show.genres && show.genres.length > 0) {
    jsonLd.genre = show.genres.map((g) => g.name);
  }

  if (show.number_of_seasons) {
    jsonLd.numberOfSeasons = show.number_of_seasons;
  }

  if (show.number_of_episodes) {
    jsonLd.numberOfEpisodes = show.number_of_episodes;
  }

  return jsonLd;
}

// Helper to build WebSite JSON-LD (for homepage)
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Helper to build BreadcrumbList JSON-LD
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
