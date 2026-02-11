import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createAvailabilityReport: vi.fn().mockResolvedValue(undefined),
    getReportCountForContent: vi.fn().mockResolvedValue(1),
    getAvailabilityReports: vi.fn().mockResolvedValue([]),
  };
});

// Mock providerCache
vi.mock("./providerCache", () => ({
  getProvidersWithCache: vi.fn().mockResolvedValue(null),
  invalidateProviderCache: vi.fn().mockResolvedValue(undefined),
  getBatchProvidersWithCache: vi.fn().mockResolvedValue(new Map()),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock tmdb
vi.mock("./tmdb", () => ({
  searchMulti: vi.fn().mockResolvedValue({ results: [], total_pages: 0, total_results: 0 }),
  getMovieDetails: vi.fn().mockResolvedValue({ id: 1, title: "Test" }),
  getTVShowDetails: vi.fn().mockResolvedValue({ id: 1, name: "Test" }),
  getMovieWatchProviders: vi.fn().mockResolvedValue(null),
  getTVShowWatchProviders: vi.fn().mockResolvedValue(null),
  getTrendingMovies: vi.fn().mockResolvedValue({ results: [] }),
  getTrendingTVShows: vi.fn().mockResolvedValue({ results: [] }),
  getPopularMovies: vi.fn().mockResolvedValue({ results: [] }),
  getPopularTVShows: vi.fn().mockResolvedValue({ results: [] }),
  getSimilarMovies: vi.fn().mockResolvedValue({ results: [] }),
  getSimilarTVShows: vi.fn().mockResolvedValue({ results: [] }),
  getMovieRecommendations: vi.fn().mockResolvedValue({ results: [] }),
  getTVShowRecommendations: vi.fn().mockResolvedValue({ results: [] }),
  getUpcomingMovies: vi.fn().mockResolvedValue({ results: [] }),
  getUpcomingTVShows: vi.fn().mockResolvedValue({ results: [] }),
  getMovieGenres: vi.fn().mockResolvedValue({ genres: [] }),
  getTVGenres: vi.fn().mockResolvedValue({ genres: [] }),
  discoverMoviesByGenre: vi.fn().mockResolvedValue({ results: [] }),
  discoverTVShowsByGenre: vi.fn().mockResolvedValue({ results: [] }),
  getImageUrl: vi.fn(),
  getPosterUrl: vi.fn(),
  getBackdropUrl: vi.fn(),
  getProviderLogoUrl: vi.fn(),
}));

// Mock backgroundJobs
vi.mock("./backgroundJobs", () => ({
  runAvailabilityCheckJob: vi.fn(),
  runAllJobs: vi.fn(),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import * as db from "./db";
import { invalidateProviderCache } from "./providerCache";
import { notifyOwner } from "./_core/notification";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("reports.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits a report successfully as anonymous user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.submit({
      tmdbId: 157336,
      mediaType: "movie",
      title: "Interestelar",
      reportType: "wrong_provider",
      providerName: "Netflix",
      comment: "Não está mais disponível na Netflix",
    });

    expect(result).toEqual({ success: true });
    expect(db.createAvailabilityReport).toHaveBeenCalledWith({
      userId: null,
      tmdbId: 157336,
      mediaType: "movie",
      title: "Interestelar",
      reportType: "wrong_provider",
      providerName: "Netflix",
      comment: "Não está mais disponível na Netflix",
    });
  });

  it("submits a report with userId when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.submit({
      tmdbId: 66732,
      mediaType: "tv",
      title: "Stranger Things",
      reportType: "broken_link",
    });

    expect(result).toEqual({ success: true });
    expect(db.createAvailabilityReport).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        tmdbId: 66732,
        mediaType: "tv",
        reportType: "broken_link",
      })
    );
  });

  it("invalidates cache after report submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.reports.submit({
      tmdbId: 157336,
      mediaType: "movie",
      title: "Interestelar",
      reportType: "wrong_provider",
    });

    expect(invalidateProviderCache).toHaveBeenCalledWith(157336, "movie");
  });

  it("notifies owner when 3+ reports accumulate", async () => {
    vi.mocked(db.getReportCountForContent).mockResolvedValue(3);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.reports.submit({
      tmdbId: 157336,
      mediaType: "movie",
      title: "Interestelar",
      reportType: "wrong_provider",
    });

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Interestelar"),
      })
    );
  });

  it("does not notify owner for fewer than 3 reports", async () => {
    vi.mocked(db.getReportCountForContent).mockResolvedValue(2);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.reports.submit({
      tmdbId: 157336,
      mediaType: "movie",
      title: "Interestelar",
      reportType: "wrong_provider",
    });

    expect(notifyOwner).not.toHaveBeenCalled();
  });
});
