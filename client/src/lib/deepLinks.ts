/**
 * Deep linking utility for streaming services
 * Provides direct links to specific movies/series on streaming platforms
 * PWA-aware: handles standalone mode where window.open() may not work
 */

export interface DeepLinkConfig {
  providerId: number;
  providerName: string;
  appScheme?: string; // Mobile app deep link scheme
  webUrlTemplate?: string; // Web URL template with placeholders
  searchUrlTemplate?: string; // Search URL template as fallback
  usesLocalTitle?: boolean; // Whether this provider works better with localized titles
}

// Providers that work well with Portuguese/localized titles
const PROVIDERS_USING_LOCAL_TITLE = new Set([
  8,    // Netflix
  1796, // Netflix basic with Ads
  119,  // Amazon Prime Video
  10,   // Amazon Video (Buy/Rent)
  307,  // Globoplay
  384,  // Claro video
  1853, // Claro tv+
  283,  // Crunchyroll
  1899, // HBO Max / Max
  337,  // Disney Plus
  619,  // Star Plus
  531,  // Paramount Plus
]);

// Deep link configurations for popular Brazilian streaming services
// Using {tmdbId}, {contentType}, and {title} as placeholders
const DEEP_LINK_CONFIG: Record<number, DeepLinkConfig> = {
  8: { // Netflix
    providerId: 8,
    providerName: "Netflix",
    appScheme: "nflx://www.netflix.com/title/{netflixId}",
    searchUrlTemplate: "https://www.netflix.com/search?q={title}",
    usesLocalTitle: true,
  },
  119: { // Amazon Prime Video
    providerId: 119,
    providerName: "Amazon Prime Video",
    appScheme: "aiv://aiv/watch?gti={amazonId}",
    searchUrlTemplate: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={title}",
    usesLocalTitle: true,
  },
  1899: { // HBO Max (now Max)
    providerId: 1899,
    providerName: "HBO Max",
    appScheme: "hbomax://",
    searchUrlTemplate: "https://www.max.com/br/pt/search?q={title}",
    usesLocalTitle: true,
  },
  337: { // Disney Plus
    providerId: 337,
    providerName: "Disney Plus",
    appScheme: "disneyplus://",
    searchUrlTemplate: "https://www.disneyplus.com/pt-br/search?q={title}",
    usesLocalTitle: true,
  },
  619: { // Star Plus (merged with Disney+)
    providerId: 619,
    providerName: "Star Plus",
    appScheme: "starplus://",
    searchUrlTemplate: "https://www.disneyplus.com/pt-br/search?q={title}",
    usesLocalTitle: true,
  },
  531: { // Paramount Plus
    providerId: 531,
    providerName: "Paramount Plus",
    appScheme: "paramountplus://",
    searchUrlTemplate: "https://www.paramountplus.com/br/search/?q={title}",
    usesLocalTitle: true,
  },
  2: { // Apple TV
    providerId: 2,
    providerName: "Apple TV",
    searchUrlTemplate: "https://tv.apple.com/br/search?term={title}",
    usesLocalTitle: false, // Apple TV works better with original (English) titles
  },
  350: { // Apple TV Plus
    providerId: 350,
    providerName: "Apple TV Plus",
    searchUrlTemplate: "https://tv.apple.com/br/search?term={title}",
    usesLocalTitle: false,
  },
  3: { // Google Play Movies
    providerId: 3,
    providerName: "Google Play Movies",
    searchUrlTemplate: "https://play.google.com/store/search?q={title}&c=movies",
    usesLocalTitle: false, // Google Play works better with original titles
  },
  10: { // Amazon Video (Buy/Rent)
    providerId: 10,
    providerName: "Amazon Video",
    searchUrlTemplate: "https://www.amazon.com.br/s?k={title}&i=instant-video",
    usesLocalTitle: true,
  },
  307: { // Globoplay
    providerId: 307,
    providerName: "Globoplay",
    searchUrlTemplate: "https://globoplay.globo.com/busca/?q={title}",
    usesLocalTitle: true,
  },
  384: { // Claro video
    providerId: 384,
    providerName: "Claro video",
    searchUrlTemplate: "https://www.clarovideo.com/brasil/buscar?q={title}",
    usesLocalTitle: true,
  },
  283: { // Crunchyroll
    providerId: 283,
    providerName: "Crunchyroll",
    searchUrlTemplate: "https://www.crunchyroll.com/pt-br/search?q={title}",
    usesLocalTitle: true,
  },
  1796: { // Netflix basic with Ads
    providerId: 1796,
    providerName: "Netflix",
    searchUrlTemplate: "https://www.netflix.com/search?q={title}",
    usesLocalTitle: true,
  },
  1853: { // Claro tv+
    providerId: 1853,
    providerName: "Claro tv+",
    searchUrlTemplate: "https://www.clarotvmais.com.br/busca?q={title}",
    usesLocalTitle: true,
  },
};

/**
 * Check if running as installed PWA (standalone mode)
 */
export function isPWAStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true // iOS Safari
  );
}

/**
 * Check if the current device is iOS
 */
function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
 * Get deep link URL for a streaming provider with specific content
 * @param providerId - TMDB provider ID
 * @param contentType - Type of content (movie or tv)
 * @param tmdbId - TMDB content ID
 * @param title - Content title (localized) for search-based URLs
 * @param originalTitle - Original title (usually English) for providers that need it
 * @returns Deep link URL or search URL
 */
export function getProviderDeepLink(
  providerId: number,
  contentType: 'movie' | 'tv',
  tmdbId: number,
  title?: string,
  originalTitle?: string
): string {
  const config = DEEP_LINK_CONFIG[providerId];
  
  // Choose the best title for this provider
  // Use original title for providers that don't work well with Portuguese titles
  const useOriginal = config && !config.usesLocalTitle && originalTitle;
  const bestTitle = useOriginal ? originalTitle : (title || originalTitle || '');
  const encodedTitle = encodeURIComponent(bestTitle);
  
  if (!config) {
    // Fallback to Google search with title if provider not configured
    if (bestTitle) {
      return `https://www.google.com/search?q=${encodedTitle}+assistir+online`;
    }
    return `https://www.google.com/search?q=${contentType}+${tmdbId}+streaming+brasil`;
  }

  // For mobile devices (NOT in PWA mode), try app scheme first
  // In PWA mode, app schemes can cause issues, so use web URLs
  if (isMobileDevice() && !isPWAStandalone() && config.appScheme) {
    return config.appScheme
      .replace('{tmdbId}', String(tmdbId))
      .replace('{contentType}', contentType)
      .replace('{title}', encodedTitle);
  }

  // Use search URL template with title
  if (config.searchUrlTemplate && bestTitle) {
    return config.searchUrlTemplate.replace('{title}', encodedTitle);
  }

  // Fallback to Google search
  return `https://www.google.com/search?q=${encodedTitle}+${config.providerName}`;
}

/**
 * Track affiliate click (fire-and-forget, non-blocking)
 * @param providerId - TMDB provider ID
 * @param contentType - Type of content
 * @param tmdbId - TMDB content ID
 */
export function trackAffiliateClick(
  providerId: number,
  contentType: 'movie' | 'tv',
  tmdbId: number
): void {
  try {
    // Use navigator.sendBeacon for fire-and-forget tracking that doesn't block navigation
    const data = JSON.stringify({ providerId, contentType, tmdbId });
    const blob = new Blob([data], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/trpc/affiliate.trackClick', blob);
    } else {
      // Fallback: fire-and-forget fetch (no await)
      fetch('/api/trpc/affiliate.trackClick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      }).catch(() => {
        // Silently ignore tracking errors
      });
    }
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}

/**
 * Open a URL that works correctly in both browser and PWA standalone mode.
 * 
 * In PWA standalone mode:
 * - iOS: Uses x-safari- scheme (iOS 17+) to open in Safari, falls back to window.open
 * - Android: Uses window.open with _blank which opens in Chrome
 * - Desktop: Uses window.open normally
 * 
 * In regular browser mode:
 * - Uses window.open with _blank
 */
function openExternalUrl(url: string): void {
  if (isPWAStandalone()) {
    if (isIOSDevice()) {
      // iOS PWA: Use x-safari- scheme to force opening in Safari (iOS 17+)
      // This is the most reliable way to open external links from iOS PWA
      try {
        const safariUrl = `x-safari-${url}`;
        window.location.href = safariUrl;
        return;
      } catch {
        // Fall through to window.open
      }
    }
    
    // Android PWA or fallback: Create a temporary <a> tag and click it
    // This is more reliable than window.open() in PWA standalone mode
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    // Some Android browsers need the link to be in the DOM
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    return;
  }

  // Regular browser: window.open works fine
  window.open(url, '_blank');
}

/**
 * Handle provider click with tracking and deep linking.
 * Works in both regular browser and PWA standalone mode.
 * 
 * In PWA mode, uses platform-specific methods to open external URLs.
 * Tracking is always fire-and-forget and does not block navigation.
 * 
 * @param providerId - TMDB provider ID
 * @param providerName - Provider display name
 * @param contentType - Type of content (movie or tv)
 * @param tmdbId - TMDB content ID
 * @param title - Content title (localized) for search-based URLs
 * @param originalTitle - Original title (usually English) for providers that need it
 */
export function handleProviderClick(
  providerId: number,
  providerName: string,
  contentType: 'movie' | 'tv',
  tmdbId: number,
  title?: string,
  originalTitle?: string
): void {
  // Get the appropriate deep link URL FIRST (synchronous, within user gesture)
  const url = getProviderDeepLink(providerId, contentType, tmdbId, title, originalTitle);

  // Open the link using PWA-aware method
  openExternalUrl(url);

  // Track the click AFTER opening (fire-and-forget, non-blocking)
  trackAffiliateClick(providerId, contentType, tmdbId);
}
