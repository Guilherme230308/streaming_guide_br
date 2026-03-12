import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBatchProvidersWithCache } from './providerCache';

// Mock the db module
vi.mock('./db', () => ({
  getCachedProviders: vi.fn(),
  setCachedProviders: vi.fn(),
}));

// Mock the tmdb module
vi.mock('./tmdb', () => ({
  getMovieWatchProviders: vi.fn(),
  getTVShowWatchProviders: vi.fn(),
}));

import * as db from './db';
import * as tmdb from './tmdb';

describe('Batch Provider Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBatchProvidersWithCache', () => {
    it('should return results for multiple items', async () => {
      const mockProviders = {
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' },
        ],
        rent: [],
        buy: [],
      };

      // Mock cache miss for all items
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders).mockResolvedValue(mockProviders as any);
      vi.mocked(tmdb.getTVShowWatchProviders).mockResolvedValue(mockProviders as any);
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined as any);

      const items = [
        { id: 123, mediaType: 'movie' as const },
        { id: 456, mediaType: 'tv' as const },
      ];

      const results = await getBatchProvidersWithCache(items);

      expect(results.size).toBe(2);
      expect(results.get('movie:123')).toBeTruthy();
      expect(results.get('tv:456')).toBeTruthy();
    });

    it('should use cached data when available', async () => {
      const cachedData = {
        tmdbId: 123,
        mediaType: 'movie',
        countryCode: 'BR',
        providersData: JSON.stringify({
          flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' }],
          rent: [],
          buy: [],
        }),
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      };

      vi.mocked(db.getCachedProviders).mockResolvedValue(cachedData as any);

      const items = [{ id: 123, mediaType: 'movie' as const }];
      const results = await getBatchProvidersWithCache(items);

      expect(results.size).toBe(1);
      expect(results.get('movie:123')).toBeTruthy();
      // Should not call TMDB API since data was cached
      expect(tmdb.getMovieWatchProviders).not.toHaveBeenCalled();
    });

    it('should handle empty items array', async () => {
      const results = await getBatchProvidersWithCache([]);
      expect(results.size).toBe(0);
    });

    it('should handle errors gracefully for individual items', async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' }],
          rent: [],
          buy: [],
        } as any);
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined as any);

      const items = [
        { id: 111, mediaType: 'movie' as const },
        { id: 222, mediaType: 'movie' as const },
      ];

      const results = await getBatchProvidersWithCache(items);

      expect(results.size).toBe(2);
      // First item failed, should be null
      expect(results.get('movie:111')).toBeNull();
      // Second item succeeded
      expect(results.get('movie:222')).toBeTruthy();
    });

    it('should respect timeout for slow requests', async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      // Simulate a very slow API call
      vi.mocked(tmdb.getMovieWatchProviders).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          flatrate: [],
          rent: [],
          buy: [],
        } as any), 5000))
      );

      const items = [{ id: 999, mediaType: 'movie' as const }];
      // Use a very short timeout
      const results = await getBatchProvidersWithCache(items, 50);

      expect(results.size).toBe(1);
      // Should be null due to timeout
      expect(results.get('movie:999')).toBeNull();
    });
  });
});
