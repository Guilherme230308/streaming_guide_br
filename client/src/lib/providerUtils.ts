/**
 * Utility functions for handling streaming providers
 */

// Map of provider IDs that should be grouped together (variants of the same service)
// Key is the "main" provider ID, values are variant IDs that should be removed
const PROVIDER_VARIANTS: Record<number, number[]> = {
  // Amazon Prime Video (119) - remove "with Ads" variants
  119: [1899, 2100, 2101, 2102, 9, 10],
  // Netflix (8) - remove "with Ads" variants
  8: [1796, 1825],
  // Disney+ (337) - remove variants
  337: [619, 1899],
  // HBO Max / Max (384) - remove variants
  384: [1899],
  // Paramount+ (531) - remove variants  
  531: [1853, 582],
  // Globoplay (307) - remove variants
  307: [1722],
};

// All variant IDs that should be excluded
const VARIANT_IDS = new Set(
  Object.values(PROVIDER_VARIANTS).flat()
);

// Provider IDs that are considered "main" providers
const MAIN_PROVIDER_IDS = new Set(Object.keys(PROVIDER_VARIANTS).map(Number));

/**
 * Removes duplicate/variant streaming providers, keeping only the main version
 * For example, removes "Amazon Prime Video with Ads" when "Amazon Prime Video" is present
 */
export function deduplicateProviders<T extends { provider_id: number; provider_name: string }>(
  providers: T[] | undefined | null
): T[] {
  if (!providers || providers.length === 0) return [];

  // First pass: identify which main providers are present
  const mainProvidersPresent = new Set<number>();
  for (const provider of providers) {
    if (MAIN_PROVIDER_IDS.has(provider.provider_id)) {
      mainProvidersPresent.add(provider.provider_id);
    }
  }

  // Second pass: filter out variants if their main provider is present
  // Also filter out known variant IDs
  const seen = new Set<number>();
  const result: T[] = [];

  for (const provider of providers) {
    // Skip if we've already seen this provider
    if (seen.has(provider.provider_id)) continue;

    // Check if this provider is a variant that should be excluded
    let shouldExclude = false;

    // Check if this is a known variant ID
    if (VARIANT_IDS.has(provider.provider_id)) {
      // Check if the main provider for this variant is present
      for (const [mainId, variantIds] of Object.entries(PROVIDER_VARIANTS)) {
        if (variantIds.includes(provider.provider_id) && mainProvidersPresent.has(Number(mainId))) {
          shouldExclude = true;
          break;
        }
      }
    }

    // Also check by name pattern for providers not in our mapping
    if (!shouldExclude) {
      const lowerName = provider.provider_name.toLowerCase();
      
      // Exclude "with Ads" variants if main version exists
      if (lowerName.includes('with ads') || lowerName.includes('com anúncios')) {
        // Try to find the main provider by checking if a similar named provider exists
        const baseName = provider.provider_name
          .replace(/\s*with ads\s*/i, '')
          .replace(/\s*com anúncios\s*/i, '')
          .trim();
        
        const hasMainProvider = providers.some(p => 
          p.provider_id !== provider.provider_id &&
          p.provider_name.toLowerCase().includes(baseName.toLowerCase()) &&
          !p.provider_name.toLowerCase().includes('with ads') &&
          !p.provider_name.toLowerCase().includes('com anúncios')
        );
        
        if (hasMainProvider) {
          shouldExclude = true;
        }
      }
    }

    if (!shouldExclude) {
      seen.add(provider.provider_id);
      result.push(provider);
    }
  }

  return result;
}

/**
 * Checks if a provider is a "main" provider (not a variant)
 */
export function isMainProvider(providerId: number): boolean {
  return !VARIANT_IDS.has(providerId);
}
