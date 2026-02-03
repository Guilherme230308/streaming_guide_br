/**
 * Deep linking utility for streaming services
 * Provides direct links to specific movies/series on streaming platforms
 */

export interface DeepLinkConfig {
  providerId: number;
  providerName: string;
  appScheme?: string; // Mobile app deep link scheme
  webUrlTemplate?: string; // Web URL template with placeholders
  searchUrlTemplate?: string; // Search URL template as fallback
}

// Deep link configurations for popular Brazilian streaming services
// Using {tmdbId}, {contentType}, and {title} as placeholders
const DEEP_LINK_CONFIG: Record<number, DeepLinkConfig> = {
  8: { // Netflix
    providerId: 8,
    providerName: "Netflix",
    appScheme: "nflx://www.netflix.com/title/{netflixId}",
    // Netflix uses its own IDs, so we search by title
    searchUrlTemplate: "https://www.netflix.com/search?q={title}",
  },
  119: { // Amazon Prime Video
    providerId: 119,
    providerName: "Amazon Prime Video",
    appScheme: "aiv://aiv/watch?gti={amazonId}",
    // Amazon Prime Video search
    searchUrlTemplate: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={title}",
  },
  1899: { // HBO Max (now Max)
    providerId: 1899,
    providerName: "HBO Max",
    appScheme: "hbomax://",
    // Max search URL
    searchUrlTemplate: "https://www.max.com/br/pt/search?q={title}",
  },
  337: { // Disney Plus
    providerId: 337,
    providerName: "Disney Plus",
    appScheme: "disneyplus://",
    // Disney+ search
    searchUrlTemplate: "https://www.disneyplus.com/pt-br/search?q={title}",
  },
  619: { // Star Plus (merged with Disney+)
    providerId: 619,
    providerName: "Star Plus",
    appScheme: "starplus://",
    searchUrlTemplate: "https://www.disneyplus.com/pt-br/search?q={title}",
  },
  531: { // Paramount Plus
    providerId: 531,
    providerName: "Paramount Plus",
    appScheme: "paramountplus://",
    searchUrlTemplate: "https://www.paramountplus.com/br/search/?q={title}",
  },
  2: { // Apple TV
    providerId: 2,
    providerName: "Apple TV",
    // Apple TV uses its own IDs, search by title
    searchUrlTemplate: "https://tv.apple.com/br/search?term={title}",
  },
  350: { // Apple TV Plus
    providerId: 350,
    providerName: "Apple TV Plus",
    searchUrlTemplate: "https://tv.apple.com/br/search?term={title}",
  },
  3: { // Google Play Movies
    providerId: 3,
    providerName: "Google Play Movies",
    searchUrlTemplate: "https://play.google.com/store/search?q={title}&c=movies",
  },
  10: { // Amazon Video (Buy/Rent)
    providerId: 10,
    providerName: "Amazon Video",
    searchUrlTemplate: "https://www.amazon.com.br/s?k={title}&i=instant-video",
  },
  307: { // Globoplay
    providerId: 307,
    providerName: "Globoplay",
    searchUrlTemplate: "https://globoplay.globo.com/busca/?q={title}",
  },
  384: { // Claro video
    providerId: 384,
    providerName: "Claro video",
    searchUrlTemplate: "https://www.clarovideo.com/brasil/buscar?q={title}",
  },
  283: { // Crunchyroll
    providerId: 283,
    providerName: "Crunchyroll",
    searchUrlTemplate: "https://www.crunchyroll.com/pt-br/search?q={title}",
  },
  1796: { // Netflix basic with Ads
    providerId: 1796,
    providerName: "Netflix",
    searchUrlTemplate: "https://www.netflix.com/search?q={title}",
  },
  1853: { // Claro tv+
    providerId: 1853,
    providerName: "Claro tv+",
    searchUrlTemplate: "https://www.clarotvmais.com.br/busca?q={title}",
  },
};

/**
 * Get deep link URL for a streaming provider with specific content
 * @param providerId - TMDB provider ID
 * @param contentType - Type of content (movie or tv)
 * @param tmdbId - TMDB content ID
 * @param title - Content title for search-based URLs
 * @returns Deep link URL or search URL
 */
export function getProviderDeepLink(
  providerId: number,
  contentType: 'movie' | 'tv',
  tmdbId: number,
  title?: string
): string {
  const config = DEEP_LINK_CONFIG[providerId];
  const encodedTitle = encodeURIComponent(title || '');
  
  if (!config) {
    // Fallback to Google search with title if provider not configured
    if (title) {
      return `https://www.google.com/search?q=${encodedTitle}+assistir+online`;
    }
    return `https://www.google.com/search?q=${contentType}+${tmdbId}+streaming+brasil`;
  }

  // For mobile devices, try app scheme first
  if (isMobileDevice() && config.appScheme) {
    // Replace placeholders in app scheme
    return config.appScheme
      .replace('{tmdbId}', String(tmdbId))
      .replace('{contentType}', contentType)
      .replace('{title}', encodedTitle);
  }

  // Use search URL template with title
  if (config.searchUrlTemplate && title) {
    return config.searchUrlTemplate.replace('{title}', encodedTitle);
  }

  // Fallback to Google search
  return `https://www.google.com/search?q=${encodedTitle}+${config.providerName}`;
}

/**
 * Check if the current device is mobile
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Track affiliate click
 * @param providerId - TMDB provider ID
 * @param contentType - Type of content
 * @param tmdbId - TMDB content ID
 */
export async function trackAffiliateClick(
  providerId: number,
  contentType: 'movie' | 'tv',
  tmdbId: number
): Promise<void> {
  try {
    // Send tracking request to backend
    await fetch('/api/trpc/affiliate.trackClick', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId,
        contentType,
        tmdbId,
      }),
    });
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}

/**
 * Handle provider click with tracking and deep linking
 * @param providerId - TMDB provider ID
 * @param providerName - Provider display name
 * @param contentType - Type of content (movie or tv)
 * @param tmdbId - TMDB content ID
 * @param title - Content title for search-based URLs
 */
export async function handleProviderClick(
  providerId: number,
  providerName: string,
  contentType: 'movie' | 'tv',
  tmdbId: number,
  title?: string
): Promise<void> {
  // Track the click for affiliate purposes
  await trackAffiliateClick(providerId, contentType, tmdbId);

  // Get the appropriate deep link with title for search
  const url = getProviderDeepLink(providerId, contentType, tmdbId, title);

  // Open the link
  window.open(url, '_blank');
}
