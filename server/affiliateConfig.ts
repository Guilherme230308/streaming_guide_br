/**
 * Affiliate configuration for streaming services
 * Add your affiliate IDs and tracking parameters here
 */

export interface AffiliateConfig {
  providerId: number;
  providerName: string;
  affiliateBaseUrl?: string;
  affiliateParams?: Record<string, string>;
  hasAffiliateProgram: boolean;
}

/**
 * Affiliate configuration for Brazilian streaming services
 * Note: Most streaming services don't have public affiliate programs
 * This is a template - update with actual affiliate IDs when available
 */
export const AFFILIATE_CONFIG: Record<number, AffiliateConfig> = {
  // Netflix (8) - No public affiliate program
  8: {
    providerId: 8,
    providerName: "Netflix",
    hasAffiliateProgram: false,
  },
  
  // Amazon Prime Video (119) - Amazon Associates program
  119: {
    providerId: 119,
    providerName: "Amazon Prime Video",
    hasAffiliateProgram: true,
    affiliateParams: {
      tag: "ondeassistir-20", // Replace with your Amazon Associates ID
    },
  },
  
  // Disney Plus (337)
  337: {
    providerId: 337,
    providerName: "Disney Plus",
    hasAffiliateProgram: false,
  },
  
  // HBO Max (384)
  384: {
    providerId: 384,
    providerName: "HBO Max",
    hasAffiliateProgram: false,
  },
  
  // Apple TV (2)
  2: {
    providerId: 2,
    providerName: "Apple TV",
    hasAffiliateProgram: true,
    affiliateParams: {
      at: "1000l3L", // Replace with your Apple affiliate token
    },
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
  
  // Star Plus (619)
  619: {
    providerId: 619,
    providerName: "Star Plus",
    hasAffiliateProgram: false,
  },
};

/**
 * Build affiliate link with tracking parameters
 */
export function buildAffiliateLink(
  originalUrl: string,
  providerId: number
): string {
  const config = AFFILIATE_CONFIG[providerId];
  
  if (!config || !config.hasAffiliateProgram || !config.affiliateParams) {
    return originalUrl;
  }
  
  try {
    const url = new URL(originalUrl);
    
    // Add affiliate parameters
    Object.entries(config.affiliateParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
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
  return AFFILIATE_CONFIG[providerId]?.hasAffiliateProgram ?? false;
}
