import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getCachedProviders: vi.fn(),
  setCachedProviders: vi.fn(),
  getDb: vi.fn(),
}));

// Mock the tmdb module
vi.mock("./tmdb", () => ({
  getMovieWatchProviders: vi.fn(),
  getTVShowWatchProviders: vi.fn(),
}));

import * as db from "./db";
import * as tmdb from "./tmdb";

// We need to import after mocking
const { getProvidersWithCache, invalidateProviderCache } = await import("./providerCache");

describe("Smart Provider Cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProvidersWithCache", () => {
    it("returns cached data when available", async () => {
      const cachedData = {
        id: 1,
        tmdbId: 157336,
        mediaType: "movie" as const,
        countryCode: "BR",
        providersData: JSON.stringify({ flatrate: [{ provider_id: 8, provider_name: "Netflix" }] }),
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      };

      vi.mocked(db.getCachedProviders).mockResolvedValue(cachedData);

      const result = await getProvidersWithCache(157336, "movie", "2014-11-07");

      expect(result).toEqual({ flatrate: [{ provider_id: 8, provider_name: "Netflix" }] });
      expect(db.getCachedProviders).toHaveBeenCalledWith(157336, "movie");
      expect(tmdb.getMovieWatchProviders).not.toHaveBeenCalled();
    });

    it("fetches from TMDB when cache is empty", async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders).mockResolvedValue({
        link: "https://example.com",
        flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/logo.png", display_priority: 1 }],
      });
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined);

      const result = await getProvidersWithCache(157336, "movie", "2014-11-07");

      expect(result).toEqual({
        link: "https://example.com",
        flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/logo.png", display_priority: 1 }],
      });
      expect(tmdb.getMovieWatchProviders).toHaveBeenCalledWith(157336);
      expect(db.setCachedProviders).toHaveBeenCalled();
    });

    it("fetches TV show providers for tv mediaType", async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getTVShowWatchProviders).mockResolvedValue({
        link: "https://example.com",
        flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/logo.png", display_priority: 1 }],
      });
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined);

      await getProvidersWithCache(66732, "tv", "2016-07-15");

      expect(tmdb.getTVShowWatchProviders).toHaveBeenCalledWith(66732);
      expect(tmdb.getMovieWatchProviders).not.toHaveBeenCalled();
    });

    it("uses 48h TTL for old content (released > 6 months ago)", async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders).mockResolvedValue({
        link: "https://example.com",
        flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/logo.png", display_priority: 1 }],
      });
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined);

      await getProvidersWithCache(157336, "movie", "2014-11-07");

      const call = vi.mocked(db.setCachedProviders).mock.calls[0][0];
      const expiresAt = call.expiresAt;
      const cachedAt = call.cachedAt || new Date();
      const diffHours = (expiresAt.getTime() - (cachedAt as Date).getTime()) / (1000 * 60 * 60);

      // Should be approximately 48 hours for old content
      expect(diffHours).toBeGreaterThanOrEqual(47);
      expect(diffHours).toBeLessThanOrEqual(49);
    });

    it("uses 6h TTL for new releases (< 30 days)", async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders).mockResolvedValue({
        link: "https://example.com",
        flatrate: [],
      });
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined);

      await getProvidersWithCache(999, "movie", recentDate.toISOString().split("T")[0]);

      const call = vi.mocked(db.setCachedProviders).mock.calls[0][0];
      const expiresAt = call.expiresAt;
      const cachedAt = call.cachedAt || new Date();
      const diffHours = (expiresAt.getTime() - (cachedAt as Date).getTime()) / (1000 * 60 * 60);

      // Should be approximately 6 hours for new releases
      expect(diffHours).toBeGreaterThanOrEqual(5);
      expect(diffHours).toBeLessThanOrEqual(7);
    });

    it("caches even when TMDB returns null (empty providers)", async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders).mockResolvedValue(null);
      vi.mocked(db.setCachedProviders).mockResolvedValue(undefined);

      const result = await getProvidersWithCache(999, "movie");

      expect(result).toBeNull();
      expect(db.setCachedProviders).toHaveBeenCalled();
    });

    it("handles cache write failure gracefully", async () => {
      vi.mocked(db.getCachedProviders).mockResolvedValue(null);
      vi.mocked(tmdb.getMovieWatchProviders).mockResolvedValue({
        link: "https://example.com",
        flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/logo.png", display_priority: 1 }],
      });
      vi.mocked(db.setCachedProviders).mockRejectedValue(new Error("DB write failed"));

      // Should not throw
      const result = await getProvidersWithCache(157336, "movie");
      expect(result).toBeTruthy();
    });
  });
});
