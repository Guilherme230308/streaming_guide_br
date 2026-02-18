/**
 * Affiliate configuration for streaming services
 * Supports environment-variable-based affiliate tags for easy configuration
 */

export interface AffiliateConfig {
  providerId: number;
  providerName: string;
  affiliateBaseUrl?: string;
  affiliateParams?: Record<string, string>;
  hasAffiliateProgram: boolean;
  /** Revenue model: CPA (cost per action/signup), CPS (cost per sale), CPC (cost per click) */
  revenueModel?: 'CPA' | 'CPS' | 'CPC';
  /** Estimated commission rate as a description */
  commissionInfo?: string;
}

/**
 * Get Amazon affiliate tag from environment variable or use default
 */
function getAmazonTag(): string {
  return process.env.AMAZON_AFFILIATE_TAG || "guilherme2303-20";
}

/**
 * Get Apple affiliate token from environment variable or use default
 */
function getAppleToken(): string {
  return process.env.APPLE_AFFILIATE_TOKEN || "";
}

/**
 * Affiliate configuration for Brazilian streaming services
 * 
 * Amazon Associates (Brazil): 
 *   - Sign up at https://associados.amazon.com.br/
 *   - Commission: 1-10% depending on category
 *   - Cookie duration: 24 hours
 *   - Covers ALL Amazon purchases (not just Prime Video)
 * 
 * Apple Services Performance Partners:
 *   - Sign up at https://performance-partners.apple.com/
 *   - Commission: 7% on subscriptions
 */
export function getAffiliateConfig(): Record<number, AffiliateConfig> {
  const amazonTag = getAmazonTag();
  const appleToken = getAppleToken();

  return {
    // Netflix (8) - No public affiliate program
    8: {
      providerId: 8,
      providerName: "Netflix",
      hasAffiliateProgram: false,
    },

    // Netflix basic with Ads (1796) - No public affiliate program
    1796: {
      providerId: 1796,
      providerName: "Netflix",
      hasAffiliateProgram: false,
    },

    // Amazon Prime Video (119) - Amazon Associates program
    119: {
      providerId: 119,
      providerName: "Amazon Prime Video",
      hasAffiliateProgram: true,
      revenueModel: 'CPA',
      commissionInfo: 'R$5-15 per Prime Video signup + 1-10% on purchases',
      affiliateParams: {
        tag: amazonTag,
      },
    },

    // Amazon Video Buy/Rent (10) - Amazon Associates program
    10: {
      providerId: 10,
      providerName: "Amazon Video",
      hasAffiliateProgram: true,
      revenueModel: 'CPS',
      commissionInfo: '1-10% on digital video purchases/rentals',
      affiliateParams: {
        tag: amazonTag,
      },
    },

    // Disney Plus (337)
    337: {
      providerId: 337,
      providerName: "Disney Plus",
      hasAffiliateProgram: false,
    },

    // HBO Max / Max (1899)
    1899: {
      providerId: 1899,
      providerName: "HBO Max",
      hasAffiliateProgram: false,
    },

    // Apple TV (2) - Apple Services Performance Partners
    2: {
      providerId: 2,
      providerName: "Apple TV",
      hasAffiliateProgram: !!appleToken,
      revenueModel: 'CPA',
      commissionInfo: '7% on subscriptions via Apple Services Performance Partners',
      ...(appleToken ? {
        affiliateParams: {
          at: appleToken,
        },
      } : {}),
    },

    // Apple TV Plus (350) - Apple Services Performance Partners
    350: {
      providerId: 350,
      providerName: "Apple TV Plus",
      hasAffiliateProgram: !!appleToken,
      revenueModel: 'CPA',
      commissionInfo: '7% on subscriptions',
      ...(appleToken ? {
        affiliateParams: {
          at: appleToken,
        },
      } : {}),
    },

    // Google Play Movies (3)
    3: {
      providerId: 3,
      providerName: "Google Play Movies",
      hasAffiliateProgram: false,
    },

    // Paramount Plus (531)
    531: {
      providerId: 531,
      providerName: "Paramount Plus",
      hasAffiliateProgram: false,
    },

    // Star Plus (619) - merged with Disney+
    619: {
      providerId: 619,
      providerName: "Star Plus",
      hasAffiliateProgram: false,
    },

    // Globoplay (307)
    307: {
      providerId: 307,
      providerName: "Globoplay",
      hasAffiliateProgram: false,
    },

    // Crunchyroll (283)
    283: {
      providerId: 283,
      providerName: "Crunchyroll",
      hasAffiliateProgram: false,
    },

    // Claro video (384)
    384: {
      providerId: 384,
      providerName: "Claro video",
      hasAffiliateProgram: false,
    },

    // Claro tv+ (1853)
    1853: {
      providerId: 1853,
      providerName: "Claro tv+",
      hasAffiliateProgram: false,
    },
  };
}

// Cached config instance (refreshed on each call to support env changes)
let _cachedConfig: Record<number, AffiliateConfig> | null = null;

/**
 * Get the affiliate config (cached for performance)
 */
export function getConfig(): Record<number, AffiliateConfig> {
  if (!_cachedConfig) {
    _cachedConfig = getAffiliateConfig();
  }
  return _cachedConfig;
}

/**
 * Build affiliate link with tracking parameters
 * Injects affiliate tags into URLs for providers that have affiliate programs
 */
export function buildAffiliateLink(
  originalUrl: string,
  providerId: number
): string {
  const config = getConfig()[providerId];

  if (!config || !config.hasAffiliateProgram || !config.affiliateParams) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);

    // Add affiliate parameters
    Object.entries(config.affiliateParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch (error) {
    // If URL parsing fails, return original
    console.error("Failed to build affiliate link:", error);
    return originalUrl;
  }
}

/**
 * Check if provider has affiliate program
 */
export function hasAffiliateProgram(providerId: number): boolean {
  return getConfig()[providerId]?.hasAffiliateProgram ?? false;
}

/**
 * Get affiliate info for a provider (for admin dashboard)
 */
export function getAffiliateInfo(providerId: number): AffiliateConfig | null {
  return getConfig()[providerId] || null;
}

/**
 * Get all providers with active affiliate programs
 */
export function getActiveAffiliateProviders(): AffiliateConfig[] {
  return Object.values(getConfig()).filter(c => c.hasAffiliateProgram);
}
