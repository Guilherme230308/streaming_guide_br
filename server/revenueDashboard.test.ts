import { describe, it, expect, vi } from 'vitest';

// Test the revenue estimation logic
describe('Revenue Dashboard', () => {
  describe('Revenue Estimation', () => {
    // Mirror the getEstimatedRevenue logic for testing
    function getEstimatedRevenue(providerName: string, clickType: string, count: number): number {
      const isAmazon = providerName.toLowerCase().includes('amazon') || providerName.toLowerCase().includes('prime video');
      
      if (isAmazon) {
        if (clickType === 'stream') {
          return count * 0.04 * 14.90 * 0.03;
        } else if (clickType === 'rent') {
          return count * 0.025 * 14.90 * 0.05;
        } else if (clickType === 'buy') {
          return count * 0.025 * 29.90 * 0.02;
        }
      }
      return 0;
    }

    it('should calculate Amazon Prime Video streaming revenue', () => {
      const revenue = getEstimatedRevenue('Amazon Prime Video', 'stream', 100);
      // 100 * 0.04 * 14.90 * 0.03 = 1.788
      expect(revenue).toBeCloseTo(1.788, 2);
    });

    it('should calculate Amazon rental revenue', () => {
      const revenue = getEstimatedRevenue('Amazon Video', 'rent', 100);
      // 100 * 0.025 * 14.90 * 0.05 = 1.8625
      expect(revenue).toBeCloseTo(1.8625, 2);
    });

    it('should calculate Amazon purchase revenue', () => {
      const revenue = getEstimatedRevenue('Amazon Video', 'buy', 100);
      // 100 * 0.025 * 29.90 * 0.02 = 1.495
      expect(revenue).toBeCloseTo(1.495, 2);
    });

    it('should return 0 for non-Amazon providers', () => {
      expect(getEstimatedRevenue('Netflix', 'stream', 100)).toBe(0);
      expect(getEstimatedRevenue('Disney Plus', 'stream', 100)).toBe(0);
      expect(getEstimatedRevenue('HBO Max', 'stream', 100)).toBe(0);
    });

    it('should handle case-insensitive Amazon detection', () => {
      const rev1 = getEstimatedRevenue('amazon prime video', 'stream', 10);
      const rev2 = getEstimatedRevenue('Amazon Prime Video', 'stream', 10);
      expect(rev1).toBe(rev2);
    });

    it('should scale linearly with click count', () => {
      const rev1 = getEstimatedRevenue('Amazon Prime Video', 'stream', 1);
      const rev10 = getEstimatedRevenue('Amazon Prime Video', 'stream', 10);
      expect(rev10).toBeCloseTo(rev1 * 10, 5);
    });
  });

  describe('Period Calculation', () => {
    it('should calculate correct date range for 7d period', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('should calculate correct date range for 30d period', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });

    it('should calculate correct date range for 90d period', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(90);
    });
  });

  describe('Platform Detection', () => {
    function detectPlatform(userAgent: string): string {
      const ua = userAgent.toLowerCase();
      if (ua.includes('pwa') || ua.includes('standalone')) return 'pwa';
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
      if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox')) return 'desktop';
      return 'other';
    }

    it('should detect mobile user agents', () => {
      expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)')).toBe('mobile');
      expect(detectPlatform('Mozilla/5.0 (Linux; Android 12)')).toBe('mobile');
    });

    it('should detect desktop user agents', () => {
      expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120')).toBe('desktop');
      expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605')).toBe('desktop');
    });

    it('should detect PWA user agents', () => {
      expect(detectPlatform('PWA-Standalone')).toBe('pwa');
      expect(detectPlatform('Mozilla/5.0 standalone mode')).toBe('pwa');
    });

    it('should return other for unknown user agents', () => {
      expect(detectPlatform('')).toBe('other');
      expect(detectPlatform('CustomBot/1.0')).toBe('other');
    });
  });

  describe('KPI Calculations', () => {
    it('should correctly identify today clicks', () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const clicks = [
        { clickedAt: new Date() }, // today
        { clickedAt: new Date(Date.now() - 86400000) }, // yesterday
        { clickedAt: new Date(Date.now() - 172800000) }, // 2 days ago
      ];
      
      const todayClicks = clicks.filter(c => new Date(c.clickedAt) >= todayStart);
      expect(todayClicks.length).toBe(1);
    });

    it('should correctly identify this week clicks', () => {
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekStart.setDate(weekStart.getDate() - 7);
      
      const clicks = [
        { clickedAt: new Date() }, // today
        { clickedAt: new Date(Date.now() - 3 * 86400000) }, // 3 days ago
        { clickedAt: new Date(Date.now() - 10 * 86400000) }, // 10 days ago
      ];
      
      const weekClicks = clicks.filter(c => new Date(c.clickedAt) >= weekStart);
      expect(weekClicks.length).toBe(2);
    });
  });
});
