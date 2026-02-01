import { describe, expect, it } from "vitest";
import { testTMDBConnection, searchMovies } from "./tmdb";

describe("TMDB API Integration", () => {
  it("should successfully connect to TMDB API", async () => {
    const isConnected = await testTMDBConnection();
    expect(isConnected).toBe(true);
  }, 10000); // 10 second timeout for API call

  it("should search for movies successfully", async () => {
    const results = await searchMovies("Matrix");
    expect(results).toBeDefined();
    expect(results.results).toBeInstanceOf(Array);
    expect(results.results.length).toBeGreaterThan(0);
  }, 10000);
});
