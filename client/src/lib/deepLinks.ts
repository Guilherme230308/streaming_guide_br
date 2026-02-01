/**
 * Deep linking utility for streaming services
 * Provides direct links to streaming apps when available,
 * falls back to web URLs when deep links are not supported
 */

export interface DeepLinkConfig {
  providerId: number;
  providerName: string;
  appScheme?: string; // Mobile app deep link scheme
  webUrl?: string; // Web URL template
}

// Deep link configurations for popular Brazilian streaming services
const DEEP_LINK_CONFIG: Record<number, DeepLinkConfig> = {
  8: { // Netflix
    providerId: 8,
    providerName: "Netflix",
    appScheme: "nflx://",
    webUrl: "https://www.netflix.com/",
  },
  119: { // Amazon Prime Video
    providerId: 119,
    providerName: "Amazon Prime Video",
    appScheme: "aiv://",
    webUrl: "https://www.primevideo.com/",
  },
  1899: { // HBO Max
    providerId: 1899,
    providerName: "HBO Max",
    appScheme: "hbomax://",
    webUrl: "https://www.max.com/",
  },
  337: { // Disney Plus
    providerId: 337,
    providerName: "Disney Plus",
    appScheme: "disneyplus://",
    webUrl: "https://www.disneyplus.com/",
  },
  619: { // Star Plus
    providerId: 619,
    providerName: "Star Plus",
    appScheme: "starplus://",
    webUrl: "https://www.starplus.com/",
  },
  531: { // Paramount Plus
    providerId: 531,
    providerName: "Paramount Plus",
    appScheme: "paramountplus://",
    webUrl: "https://www.paramountplus.com/",
  },
  2: { // Apple TV
    providerId: 2,
    providerName: "Apple TV",
    webUrl: "https://tv.apple.com/",
  },
  3: { // Google Play Movies
    providerId: 3,
    providerName: "Google Play Movies",
    webUrl: "https://play.google.com/store/movies",
  },
  10: { // Amazon Video (Buy/Rent)
    providerId: 10,
    providerName: "Amazon Video",
    webUrl: "https://www.amazon.com.br/gp/video/storefront",
  },
  307: { // Globoplay
    providerId: 307,
    providerName: "Globoplay",
    webUrl: "https://globoplay.globo.com/",
  },
};

/**
 * Get deep link URL for a streaming provider
 * @param providerId - TMDB provider ID
 * @param contentType - Type of content (movie or tv)
 * @param tmdbId - TMDB content ID
 * @returns Deep link URL or web URL
 */
export function getProviderDeepLink(
  providerId: number,
  contentType: 'movie' | 'tv',
  tmdbId: number
): string {
  const config = DEEP_LINK_CONFIG[providerId];
  
  if (!config) {
    // Fallback to generic search if provider not configured
    return `https://www.google.com/search?q=${contentType}+${tmdbId}+streaming`;
  }

  // For mobile devices, try app scheme first
  if (isMobileDevice() && config.appScheme) {
    return config.appScheme;
  }

  // Fall back to web URL
  return config.webUrl || `https://www.google.com/search?q=${config.providerName}`;
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
 */
export async function handleProviderClick(
  providerId: number,
  providerName: string,
  contentType: 'movie' | 'tv',
  tmdbId: number
): Promise<void> {
  // Track the click for affiliate purposes
  await trackAffiliateClick(providerId, contentType, tmdbId);

  // Get the appropriate deep link
  const url = getProviderDeepLink(providerId, contentType, tmdbId);

  // Open the link
  window.open(url, '_blank');
}
