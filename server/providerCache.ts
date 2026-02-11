import * as tmdb from './tmdb';
import * as db from './db';

/**
 * Smart cache TTL based on content age:
 * - Content released in the last 30 days: 6 hours (catalogs change frequently for new releases)
 * - Content released in the last 6 months: 24 hours
 * - Older content: 48 hours (stable catalog, rarely changes)
 */
function getSmartTTL(releaseDate?: string): number {
  if (!releaseDate) return 24; // Default 24h if no date

  const release = new Date(releaseDate);
  const now = new Date();
  const daysSinceRelease = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceRelease <= 30) return 6;       // New release: 6h
  if (daysSinceRelease <= 180) return 24;      // Recent: 24h
  return 48;                                    // Older content: 48h
}

/**
 * Get streaming providers with smart caching.
 * Checks cache first, falls back to TMDB API, then caches the result.
 * 
 * @param tmdbId - The TMDB content ID
 * @param mediaType - 'movie' or 'tv'
 * @param releaseDate - Release date string for smart TTL calculation
 * @returns Provider data or null
 */
export async function getProvidersWithCache(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  releaseDate?: string
): Promise<tmdb.TMDBWatchProviders | null> {
  // 1. Check cache
  const cached = await db.getCachedProviders(tmdbId, mediaType);
  if (cached) {
    return JSON.parse(cached.providersData);
  }

  // 2. Fetch from TMDB
  const providers = mediaType === 'movie'
    ? await tmdb.getMovieWatchProviders(tmdbId)
    : await tmdb.getTVShowWatchProviders(tmdbId);

  // 3. Cache the result (even null results to avoid repeated API calls)
  const ttlHours = getSmartTTL(releaseDate);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  const dataToCache = providers || { flatrate: [], rent: [], buy: [] };

  try {
    await db.setCachedProviders({
      tmdbId,
      mediaType,
      countryCode: 'BR',
      providersData: JSON.stringify(dataToCache),
      cachedAt: new Date(),
      expiresAt,
    });
  } catch (err) {
    // Cache write failure is non-critical
    console.warn('[ProviderCache] Failed to write cache:', err);
  }

  return providers;
}

/**
 * Batch get providers with cache for multiple items.
 * Used in search results and trending pages.
 */
export async function getBatchProvidersWithCache(
  items: Array<{ id: number; mediaType: 'movie' | 'tv'; releaseDate?: string }>,
  timeoutMs: number = 2000
): Promise<Map<string, tmdb.TMDBWatchProviders | null>> {
  const results = new Map<string, tmdb.TMDBWatchProviders | null>();

  for (const item of items) {
    const key = `${item.mediaType}:${item.id}`;
    try {
      const providerPromise = getProvidersWithCache(item.id, item.mediaType, item.releaseDate);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), timeoutMs)
      );
      const providers = await Promise.race([providerPromise, timeoutPromise]);
      results.set(key, providers);
    } catch {
      results.set(key, null);
    }
  }

  return results;
}

/**
 * Invalidate cache for a specific content item.
 * Called when a user reports an error in availability data.
 */
export async function invalidateProviderCache(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
  try {
    const { getDb } = await import('./db');
    const dbInstance = await getDb();
    if (!dbInstance) return;

    const { cachedProviders } = await import('../drizzle/schema');
    const { eq, and } = await import('drizzle-orm');

    await dbInstance.delete(cachedProviders).where(
      and(
        eq(cachedProviders.tmdbId, tmdbId),
        eq(cachedProviders.mediaType, mediaType),
        eq(cachedProviders.countryCode, 'BR')
      )
    );
  } catch (err) {
    console.warn('[ProviderCache] Failed to invalidate cache:', err);
  }
}
