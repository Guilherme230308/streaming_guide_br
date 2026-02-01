import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

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
  const response = await tmdbApi.get('/search/movie', {
    params: {
      query,
      page,
      language: 'pt-BR',
      region: 'BR',
    },
  });
  return response.data;
}

/**
 * Search for TV shows
 */
export async function searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResult> {
  const response = await tmdbApi.get('/search/tv', {
    params: {
      query,
      page,
      language: 'pt-BR',
    },
  });
  return response.data;
}

/**
 * Search for both movies and TV shows
 */
export async function searchMulti(query: string, page: number = 1): Promise<TMDBSearchResult> {
  const response = await tmdbApi.get('/search/multi', {
    params: {
      query,
      page,
      language: 'pt-BR',
    },
  });
  return response.data;
}

/**
 * Get movie details
 */
export async function getMovieDetails(movieId: number) {
  const response = await tmdbApi.get(`/movie/${movieId}`, {
    params: {
      language: 'pt-BR',
    },
  });
  return response.data;
}

/**
 * Get TV show details
 */
export async function getTVShowDetails(tvId: number) {
  const response = await tmdbApi.get(`/tv/${tvId}`, {
    params: {
      language: 'pt-BR',
    },
  });
  return response.data;
}

/**
 * Get watch providers for a movie in Brazil
 */
export async function getMovieWatchProviders(movieId: number): Promise<TMDBWatchProviders | null> {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    return response.data.results?.BR || null;
  } catch (error) {
    console.error('Error fetching movie watch providers:', error);
    return null;
  }
}

/**
 * Get watch providers for a TV show in Brazil
 */
export async function getTVShowWatchProviders(tvId: number): Promise<TMDBWatchProviders | null> {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/watch/providers`);
    return response.data.results?.BR || null;
  } catch (error) {
    console.error('Error fetching TV show watch providers:', error);
    return null;
  }
}

/**
 * Get trending movies
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
  const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, {
    params: {
      language: 'pt-BR',
    },
  });
  return response.data;
}

/**
 * Get trending TV shows
 */
export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'week') {
  const response = await tmdbApi.get(`/trending/tv/${timeWindow}`, {
    params: {
      language: 'pt-BR',
    },
  });
  return response.data;
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page: number = 1) {
  const response = await tmdbApi.get('/movie/popular', {
    params: {
      page,
      language: 'pt-BR',
      region: 'BR',
    },
  });
  return response.data;
}

/**
 * Get popular TV shows
 */
export async function getPopularTVShows(page: number = 1) {
  const response = await tmdbApi.get('/tv/popular', {
    params: {
      page,
      language: 'pt-BR',
    },
  });
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
