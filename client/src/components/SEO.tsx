import { Helmet } from "react-helmet-async";

const SITE_NAME = "Stream Radar";
const SITE_URL = "https://streamradar.com.br";
const DEFAULT_DESCRIPTION = "Descubra onde assistir seus filmes e séries favoritos no Brasil. Compare preços de streaming, aluguel e compra em Netflix, Prime Video, Disney+ e HBO Max.";
const DEFAULT_KEYWORDS = "onde assistir, streaming brasil, filmes online, séries online, netflix, prime video, disney plus, hbo max, globoplay, comparar streaming, preços streaming";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;
const SITE_LOGO = `${SITE_URL}/icon-512.png`;

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
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: Onde Assistir Filmes e Séries no Brasil`;
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
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}

      {children}
    </Helmet>
  );
}

// Helper to build Organization JSON-LD
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description: "Guia de streaming brasileiro que ajuda você a encontrar onde assistir filmes e séries nas principais plataformas do Brasil.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/about`,
      availableLanguage: "Portuguese",
    },
  };
}

// Helper to build WebSite JSON-LD (for homepage) with SearchAction for Sitelinks Search Box
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Stream Radar Brasil",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "pt-BR",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
      },
    },
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

// Helper to build SiteNavigationElement for sitelinks
export function buildSiteNavigationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: [
      "Buscar Filmes e Séries",
      "Preços de Streaming",
      "Melhores por Plataforma",
      "Listas",
      "Alertas",
    ],
    url: [
      `${SITE_URL}/search`,
      `${SITE_URL}/streaming-prices`,
      `${SITE_URL}/melhores`,
      `${SITE_URL}/lists`,
      `${SITE_URL}/alerts`,
    ],
  };
}

// Helper to build Movie JSON-LD with enhanced fields
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
  credits?: {
    cast?: { name: string; character?: string }[];
    crew?: { name: string; job: string }[];
  };
}) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    url: `${SITE_URL}/movie/${movie.id}`,
    datePublished: movie.release_date,
    inLanguage: "pt-BR",
  };

  if (movie.poster_path) {
    jsonLd.image = [
      `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
    ];
  }

  if (movie.backdrop_path) {
    jsonLd.thumbnailUrl = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
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

  if (movie.genres && movie.genres.length > 0) {
    jsonLd.genre = movie.genres.map((g) => g.name);
  }

  if (movie.runtime) {
    const hours = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;
    jsonLd.duration = `PT${hours}H${mins}M`;
  }

  // Add director if available
  if (movie.credits?.crew) {
    const director = movie.credits.crew.find((c) => c.job === "Director");
    if (director) {
      jsonLd.director = {
        "@type": "Person",
        name: director.name,
      };
    }
  }

  // Add actors if available
  if (movie.credits?.cast && movie.credits.cast.length > 0) {
    jsonLd.actor = movie.credits.cast.slice(0, 5).map((a) => ({
      "@type": "Person",
      name: a.name,
    }));
  }

  return jsonLd;
}

// Helper to build TV Show JSON-LD with enhanced fields
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
  created_by?: { name: string }[];
  credits?: {
    cast?: { name: string; character?: string }[];
  };
}) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    description: show.overview,
    url: `${SITE_URL}/tv/${show.id}`,
    datePublished: show.first_air_date,
    inLanguage: "pt-BR",
  };

  if (show.poster_path) {
    jsonLd.image = [
      `https://image.tmdb.org/t/p/w500${show.poster_path}`,
      `https://image.tmdb.org/t/p/w780${show.poster_path}`,
    ];
  }

  if (show.backdrop_path) {
    jsonLd.thumbnailUrl = `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`;
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

  if (show.genres && show.genres.length > 0) {
    jsonLd.genre = show.genres.map((g) => g.name);
  }

  if (show.number_of_seasons) {
    jsonLd.numberOfSeasons = show.number_of_seasons;
  }

  if (show.number_of_episodes) {
    jsonLd.numberOfEpisodes = show.number_of_episodes;
  }

  // Add creator if available
  if (show.created_by && show.created_by.length > 0) {
    jsonLd.creator = show.created_by.map((c) => ({
      "@type": "Person",
      name: c.name,
    }));
  }

  // Add actors if available
  if (show.credits?.cast && show.credits.cast.length > 0) {
    jsonLd.actor = show.credits.cast.slice(0, 5).map((a) => ({
      "@type": "Person",
      name: a.name,
    }));
  }

  return jsonLd;
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

// Helper to build ItemList JSON-LD for trending/popular content
export function buildItemListJsonLd(
  name: string,
  description: string,
  items: { id: number; title: string; type: "movie" | "tv" }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${item.type}/${item.id}`,
      name: item.title,
    })),
  };
}

// Helper to build FAQ JSON-LD for FAQ-style pages
export function buildFAQJsonLd(
  questions: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// Helper to build CollectionPage JSON-LD for provider index
export function buildCollectionPageJsonLd(
  name: string,
  description: string,
  url: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${url}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${item.url}`,
        name: item.name,
      })),
    },
  };
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
