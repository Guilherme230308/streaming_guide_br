import axios from 'axios';

import { trackMetric } from "./metricsTracker";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// ============ In-Memory TTL Cache ============
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const MAX_CACHE_SIZE = 500; // Max entries to prevent memory leaks

// TTL durations in milliseconds
const TTL = {
  TRENDING: 6 * 60 * 60 * 1000,    // 6 hours - trending changes slowly
  POPULAR: 6 * 60 * 60 * 1000,     // 6 hours
  DETAILS: 24 * 60 * 60 * 1000,    // 24 hours - movie details rarely change
  PROVIDERS: 4 * 60 * 60 * 1000,   // 4 hours - providers can change
  SIMILAR: 24 * 60 * 60 * 1000,    // 24 hours
  GENRES: 7 * 24 * 60 * 60 * 1000, // 7 days - genres almost never change
  DISCOVER: 3 * 60 * 60 * 1000,    // 3 hours
  UPCOMING: 6 * 60 * 60 * 1000,    // 6 hours
  SEARCH: 30 * 60 * 1000,          // 30 minutes - search results can vary
};

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  trackMetric("tmdb_cache_hit");
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  // Evict oldest entries if cache is too large
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

// Stats for monitoring
export function getCacheStats() {
  let active = 0;
  let expired = 0;
  const now = Date.now();
  cache.forEach((entry) => {
    if (now > entry.expiresAt) expired++;
    else active++;
  });
  return { total: cache.size, active, expired };
}
// ============ End Cache ============

// Get API key from environment
const getApiKey = () => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured');
  }
  return apiKey;
};

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: getApiKey(),
  },
});

// Track every actual API call made to TMDB
tmdbApi.interceptors.response.use(
  (response) => {
    trackMetric("tmdb_api_call");
    return response;
  },
  (error) => {
    trackMetric("tmdb_api_call");
    return Promise.reject(error);
  }
);

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface TMDBProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TMDBWatchProviders {
  link: string;
  flatrate?: TMDBProvider[];
  rent?: TMDBProvider[];
  buy?: TMDBProvider[];
}

export interface TMDBSearchResult {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

/**
 * Test TMDB API connection
 */
export async function testTMDBConnection(): Promise<boolean> {
  try {
    const response = await tmdbApi.get('/configuration');
    return response.status === 200;
  } catch (error) {
    console.error('TMDB API connection test failed:', error);
    return false;
  }
}

/**
 * Search for movies
 */
export async function searchMovies(query: string, page: number = 1): Promise<TMDBSearchResult> {
  const cacheKey = `search:movie:${query}:${page}`;
  const cached = getCached<TMDBSearchResult>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/search/movie', {
    params: {
      query,
      page,
      language: 'pt-BR',
      region: 'BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SEARCH);
  return response.data;
}

/**
 * Search for TV shows
 */
export async function searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResult> {
  const cacheKey = `search:tv:${query}:${page}`;
  const cached = getCached<TMDBSearchResult>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/search/tv', {
    params: {
      query,
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SEARCH);
  return response.data;
}

/**
 * Search for both movies and TV shows
 */
export async function searchMulti(query: string, page: number = 1): Promise<TMDBSearchResult> {
  const cacheKey = `search:multi:${query}:${page}`;
  const cached = getCached<TMDBSearchResult>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/search/multi', {
    params: {
      query,
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SEARCH);
  return response.data;
}

/**
 * Get movie details
 */
export async function getMovieDetails(movieId: number) {
  const cacheKey = `details:movie:${movieId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/movie/${movieId}`, {
    params: {
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.DETAILS);
  return response.data;
}

/**
 * Get TV show details
 */
export async function getTVShowDetails(tvId: number) {
  const cacheKey = `details:tv:${tvId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/tv/${tvId}`, {
    params: {
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.DETAILS);
  return response.data;
}

/**
 * Get watch providers for a movie in Brazil
 */
export async function getMovieWatchProviders(movieId: number): Promise<TMDBWatchProviders | null> {
  const cacheKey = `providers:movie:${movieId}`;
  const cached = getCached<TMDBWatchProviders | null>(cacheKey);
  if (cached !== null) return cached;
  // Check if we have a "null" cached (content not available)
  if (cache.has(cacheKey)) return null;
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    const result = response.data.results?.BR || null;
    setCache(cacheKey, result, TTL.PROVIDERS);
    return result;
  } catch (error) {
    console.error('Error fetching movie watch providers:', error);
    return null;
  }
}

/**
 * Get watch providers for a TV show in Brazil
 */
export async function getTVShowWatchProviders(tvId: number): Promise<TMDBWatchProviders | null> {
  const cacheKey = `providers:tv:${tvId}`;
  const cached = getCached<TMDBWatchProviders | null>(cacheKey);
  if (cached !== null) return cached;
  if (cache.has(cacheKey)) return null;
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/watch/providers`);
    const result = response.data.results?.BR || null;
    setCache(cacheKey, result, TTL.PROVIDERS);
    return result;
  } catch (error) {
    console.error('Error fetching TV show watch providers:', error);
    return null;
  }
}

/**
 * Get trending movies
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
  const cacheKey = `trending:movie:${timeWindow}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, {
    params: {
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.TRENDING);
  return response.data;
}

/**
 * Get trending TV shows
 */
export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'week') {
  const cacheKey = `trending:tv:${timeWindow}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/trending/tv/${timeWindow}`, {
    params: {
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.TRENDING);
  return response.data;
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page: number = 1) {
  const cacheKey = `popular:movie:${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/movie/popular', {
    params: {
      page,
      language: 'pt-BR',
      region: 'BR',
    },
  });
  setCache(cacheKey, response.data, TTL.POPULAR);
  return response.data;
}

/**
 * Get popular TV shows
 */
export async function getPopularTVShows(page: number = 1) {
  const cacheKey = `popular:tv:${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/tv/popular', {
    params: {
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.POPULAR);
  return response.data;
}

/**
 * Helper function to construct image URLs
 */
export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Helper function to get poster URL
 */
export function getPosterUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  return getImageUrl(path, size);
}

/**
 * Helper function to get backdrop URL
 */
export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  return getImageUrl(path, size as any);
}

/**
 * Helper function to get provider logo URL
 */
export function getProviderLogoUrl(path: string | null, size: 'w45' | 'w92' | 'w154' | 'w185' | 'original' = 'w92'): string | null {
  return getImageUrl(path, size as any);
}

/**
 * Get similar movies
 */
export async function getSimilarMovies(movieId: number, page: number = 1) {
  const cacheKey = `similar:movie:${movieId}:${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/movie/${movieId}/similar`, {
    params: {
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SIMILAR);
  return response.data;
}

/**
 * Get similar TV shows
 */
export async function getSimilarTVShows(tvId: number, page: number = 1) {
  const cacheKey = `similar:tv:${tvId}:${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/tv/${tvId}/similar`, {
    params: {
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SIMILAR);
  return response.data;
}

/**
 * Get movie recommendations
 */
export async function getMovieRecommendations(movieId: number, page: number = 1) {
  const cacheKey = `recommendations:movie:${movieId}:${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
    params: {
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SIMILAR);
  return response.data;
}

/**
 * Get TV show recommendations
 */
export async function getTVShowRecommendations(tvId: number, page: number = 1) {
  const cacheKey = `recommendations:tv:${tvId}:${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get(`/tv/${tvId}/recommendations`, {
    params: {
      page,
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.SIMILAR);
  return response.data;
}

// Get upcoming movies
export async function getUpcomingMovies(page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number; total_results: number }> {
  const cacheKey = `upcoming:movie:${page}`;
  const cached = getCached<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(cacheKey);
  if (cached) return cached;
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: {
        language: 'pt-BR',
        region: 'BR',
        page,
      },
    });
    setCache(cacheKey, response.data, TTL.UPCOMING);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
}

// Get upcoming TV shows (airing soon)
export async function getUpcomingTVShows(page: number = 1): Promise<{ results: TMDBTVShow[]; total_pages: number; total_results: number }> {
  const cacheKey = `upcoming:tv:${page}`;
  const cached = getCached<{ results: TMDBTVShow[]; total_pages: number; total_results: number }>(cacheKey);
  if (cached) return cached;
  try {
    const response = await tmdbApi.get('/tv/on_the_air', {
      params: {
        language: 'pt-BR',
        page,
      },
    });
    setCache(cacheKey, response.data, TTL.UPCOMING);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming TV shows:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
}


export interface TMDBGenre {
  id: number;
  name: string;
}

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  const cacheKey = `genres:movie`;
  const cached = getCached<{ genres: TMDBGenre[] }>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/genre/movie/list', {
    params: {
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.GENRES);
  return response.data;
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  const cacheKey = `genres:tv`;
  const cached = getCached<{ genres: TMDBGenre[] }>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/genre/tv/list', {
    params: {
      language: 'pt-BR',
    },
  });
  setCache(cacheKey, response.data, TTL.GENRES);
  return response.data;
}

export async function discoverMoviesByGenre(genreId: number, page: number = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number; total_results: number }> {
  const cacheKey = `discover:movie:genre:${genreId}:${page}`;
  const cached = getCached<{ results: TMDBMovie[]; page: number; total_pages: number; total_results: number }>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/discover/movie', {
    params: {
      with_genres: genreId,
      page,
      language: 'pt-BR',
      region: 'BR',
      sort_by: 'popularity.desc',
    },
  });
  setCache(cacheKey, response.data, TTL.DISCOVER);
  return response.data;
}

export async function discoverTVShowsByGenre(genreId: number, page: number = 1): Promise<{ results: TMDBTVShow[]; page: number; total_pages: number; total_results: number }> {
  const cacheKey = `discover:tv:genre:${genreId}:${page}`;
  const cached = getCached<{ results: TMDBTVShow[]; page: number; total_pages: number; total_results: number }>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/discover/tv', {
    params: {
      with_genres: genreId,
      page,
      language: 'pt-BR',
      sort_by: 'popularity.desc',
    },
  });
  setCache(cacheKey, response.data, TTL.DISCOVER);
  return response.data;
}

// Discover movies by streaming provider (watch_region=BR)
export async function discoverMoviesByProvider(providerId: number, page: number = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number; total_results: number }> {
  const cacheKey = `discover:movie:provider:${providerId}:${page}`;
  const cached = getCached<{ results: TMDBMovie[]; page: number; total_pages: number; total_results: number }>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/discover/movie', {
    params: {
      with_watch_providers: providerId,
      watch_region: 'BR',
      page,
      language: 'pt-BR',
      sort_by: 'popularity.desc',
    },
  });
  setCache(cacheKey, response.data, TTL.DISCOVER);
  return response.data;
}

// Discover TV shows by streaming provider (watch_region=BR)
export async function discoverTVShowsByProvider(providerId: number, page: number = 1): Promise<{ results: TMDBTVShow[]; page: number; total_pages: number; total_results: number }> {
  const cacheKey = `discover:tv:provider:${providerId}:${page}`;
  const cached = getCached<{ results: TMDBTVShow[]; page: number; total_pages: number; total_results: number }>(cacheKey);
  if (cached) return cached;
  const response = await tmdbApi.get('/discover/tv', {
    params: {
      with_watch_providers: providerId,
      watch_region: 'BR',
      page,
      language: 'pt-BR',
      sort_by: 'popularity.desc',
    },
  });
  setCache(cacheKey, response.data, TTL.DISCOVER);
  return response.data;
}
