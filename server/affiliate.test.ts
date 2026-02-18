import { describe, it, expect, beforeAll } from "vitest";
import { buildAffiliateLink, hasAffiliateProgram, getActiveAffiliateProviders, getAffiliateInfo } from "./affiliateConfig";

describe("Affiliate Configuration", () => {
  describe("Amazon Affiliate Tag", () => {
    it("should read AMAZON_AFFILIATE_TAG from environment", () => {
      const tag = process.env.AMAZON_AFFILIATE_TAG;
      expect(tag).toBeTruthy();
      expect(tag).toBe("guilherme2303-20");
    });

    it("should inject Amazon tag into Prime Video search URL", () => {
      const originalUrl = "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=Interstellar";
      const result = buildAffiliateLink(originalUrl, 119); // Prime Video
      expect(result).toContain("tag=guilherme2303-20");
      expect(result).toContain("phrase=Interstellar");
    });

    it("should inject Amazon tag into Amazon Video buy/rent URL", () => {
      const originalUrl = "https://www.amazon.com.br/s?k=Interstellar&i=instant-video";
      const result = buildAffiliateLink(originalUrl, 10); // Amazon Video
      expect(result).toContain("tag=guilherme2303-20");
      expect(result).toContain("k=Interstellar");
    });

    it("should not modify Netflix URLs (no affiliate program)", () => {
      const originalUrl = "https://www.netflix.com/search?q=Stranger+Things";
      const result = buildAffiliateLink(originalUrl, 8); // Netflix
      expect(result).toBe(originalUrl);
      expect(result).not.toContain("tag=");
    });

    it("should not modify Disney+ URLs (no affiliate program)", () => {
      const originalUrl = "https://www.disneyplus.com/pt-br/search?q=Frozen";
      const result = buildAffiliateLink(originalUrl, 337); // Disney+
      expect(result).toBe(originalUrl);
    });

    it("should not modify Google Play URLs (no affiliate program)", () => {
      const originalUrl = "https://play.google.com/store/search?q=Interstellar&c=movies";
      const result = buildAffiliateLink(originalUrl, 3); // Google Play
      expect(result).toBe(originalUrl);
    });

    it("should handle malformed URLs gracefully", () => {
      const badUrl = "not-a-valid-url";
      const result = buildAffiliateLink(badUrl, 119);
      expect(result).toBe(badUrl); // Should return original on error
    });
  });

  describe("hasAffiliateProgram", () => {
    it("should return true for Amazon Prime Video (119)", () => {
      expect(hasAffiliateProgram(119)).toBe(true);
    });

    it("should return true for Amazon Video Buy/Rent (10)", () => {
      expect(hasAffiliateProgram(10)).toBe(true);
    });

    it("should return false for Netflix (8)", () => {
      expect(hasAffiliateProgram(8)).toBe(false);
    });

    it("should return false for Disney+ (337)", () => {
      expect(hasAffiliateProgram(337)).toBe(false);
    });

    it("should return false for unknown providers", () => {
      expect(hasAffiliateProgram(99999)).toBe(false);
    });
  });

  describe("getActiveAffiliateProviders", () => {
    it("should return at least Amazon Prime Video and Amazon Video", () => {
      const active = getActiveAffiliateProviders();
      const providerIds = active.map(p => p.providerId);
      expect(providerIds).toContain(119); // Prime Video
      expect(providerIds).toContain(10);  // Amazon Video
    });

    it("should not include Netflix in active affiliates", () => {
      const active = getActiveAffiliateProviders();
      const providerIds = active.map(p => p.providerId);
      expect(providerIds).not.toContain(8);
    });
  });

  describe("getAffiliateInfo", () => {
    it("should return info for Amazon Prime Video with commission details", () => {
      const info = getAffiliateInfo(119);
      expect(info).not.toBeNull();
      expect(info?.providerName).toBe("Amazon Prime Video");
      expect(info?.revenueModel).toBe("CPA");
      expect(info?.commissionInfo).toBeTruthy();
    });

    it("should return null for unknown provider", () => {
      const info = getAffiliateInfo(99999);
      expect(info).toBeNull();
    });
  });
});
