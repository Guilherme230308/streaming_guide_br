import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as tmdb from "./tmdb";
import * as db from "./db";
import { runAvailabilityCheckJob, runAllJobs } from "./backgroundJobs";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  content: router({
    search: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        page: z.number().default(1),
      }))
      .query(async ({ input }) => {
        const results = await tmdb.searchMulti(input.query, input.page);
        return results;
      }),

    searchWithFilters: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        page: z.number().default(1),
        genres: z.array(z.string()).optional(),
        yearMin: z.number().optional(),
        yearMax: z.number().optional(),
        ratingMin: z.number().optional(),
        providers: z.array(z.string()).optional(),
      }))
      .query(async ({ input }) => {
        const results = await tmdb.searchMulti(input.query, input.page);
        
        // Apply filters
        let filteredResults = results.results;

        // Filter by genres
        if (input.genres && input.genres.length > 0) {
          filteredResults = filteredResults.filter((item: any) => {
            const genreIds = item.genre_ids || [];
            return input.genres!.some(genreId => genreIds.includes(parseInt(genreId)));
          });
        }

        // Filter by year
        if (input.yearMin || input.yearMax) {
          filteredResults = filteredResults.filter((item: any) => {
            const releaseDate = item.release_date || item.first_air_date;
            if (!releaseDate) return false;
            const year = new Date(releaseDate).getFullYear();
            if (input.yearMin && year < input.yearMin) return false;
            if (input.yearMax && year > input.yearMax) return false;
            return true;
          });
        }

        // Filter by rating
        if (input.ratingMin !== undefined && input.ratingMin > 0) {
          filteredResults = filteredResults.filter((item: any) => {
            return (item.vote_average || 0) >= input.ratingMin!;
          });
        }

        // Filter by streaming providers (requires checking watch providers)
        if (input.providers && input.providers.length > 0) {
          const providerFilteredResults = [];
          for (const item of filteredResults) {
            const mediaType = (item as any).media_type;
            if (mediaType !== 'movie' && mediaType !== 'tv') continue;
            
            const cached = await db.getCachedProviders(item.id, mediaType);
            let providers = null;
            
            if (cached) {
              providers = JSON.parse(cached.providersData);
            } else {
              const watchProviders = mediaType === 'movie'
                ? await tmdb.getMovieWatchProviders(item.id)
                : await tmdb.getTVShowWatchProviders(item.id);
              providers = watchProviders;
              
              if (providers) {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                await db.setCachedProviders({
                  tmdbId: item.id,
                  mediaType: mediaType,
                  countryCode: 'BR',
                  providersData: JSON.stringify(providers),
                  cachedAt: new Date(),
                  expiresAt
                });
              }
            }

            if (providers) {
              const allProviders = [
                ...(providers.flatrate || []),
                ...(providers.rent || []),
                ...(providers.buy || [])
              ];
              const hasMatch = allProviders.some((p: any) => 
                input.providers!.includes(p.provider_id.toString())
              );
              if (hasMatch) {
                providerFilteredResults.push(item);
              }
            }
          }
          filteredResults = providerFilteredResults;
        }

        return {
          ...results,
          results: filteredResults,
          total_results: filteredResults.length,
        };
      }),

    searchFiltered: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        page: z.number().default(1),
      }))
      .query(async ({ input, ctx }) => {
        const results = await tmdb.searchMulti(input.query, input.page);
        const userSubscriptions = await db.getUserSubscriptions(ctx.user.id);
        const activeProviderIds = userSubscriptions
          .filter(sub => sub.isActive)
          .map(sub => sub.providerId);

        if (activeProviderIds.length === 0) {
          return results;
        }

        // Filter results to only show content available on user's subscriptions
        const filteredResults = [];
        for (const item of results.results) {
          const mediaType = (item as any).media_type;
          if (mediaType !== 'movie' && mediaType !== 'tv') continue;
          
          const cached = await db.getCachedProviders(item.id, mediaType);
          let providers = null;
          
          if (cached) {
            providers = JSON.parse(cached.providersData);
          } else {
            const watchProviders = mediaType === 'movie'
              ? await tmdb.getMovieWatchProviders(item.id)
              : await tmdb.getTVShowWatchProviders(item.id);
            providers = watchProviders;
            
            if (providers) {
              const expiresAt = new Date();
              expiresAt.setHours(expiresAt.getHours() + 24);
              await db.setCachedProviders({
                tmdbId: item.id,
                mediaType: mediaType,
                countryCode: 'BR',
                providersData: JSON.stringify(providers),
                cachedAt: new Date(),
                expiresAt
              });
            }
          }

          // Check if content is available on any of user's subscriptions
          if (providers) {
            const allProviders = [
              ...(providers.flatrate || []),
              ...(providers.rent || []),
              ...(providers.buy || [])
            ];
            const hasMatch = allProviders.some((p: any) => 
              activeProviderIds.includes(p.provider_id)
            );
            if (hasMatch) {
              filteredResults.push(item);
            }
          }
        }

        return {
          ...results,
          results: filteredResults
        };
      }),

    getMovieDetails: publicProcedure
      .input(z.object({ movieId: z.number() }))
      .query(async ({ input }) => {
        const cached = await db.getCachedProviders(input.movieId, 'movie');
        let providers = null;
        
        if (cached) {
          providers = JSON.parse(cached.providersData);
        } else {
          const watchProviders = await tmdb.getMovieWatchProviders(input.movieId);
          providers = watchProviders;
          
          if (providers) {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await db.setCachedProviders({
              tmdbId: input.movieId,
              mediaType: 'movie',
              countryCode: 'BR',
              providersData: JSON.stringify(providers),
              expiresAt,
            });
          }
        }
        
        const details = await tmdb.getMovieDetails(input.movieId);
        return { ...details, watchProviders: providers };
      }),

    getTVShowDetails: publicProcedure
      .input(z.object({ tvId: z.number() }))
      .query(async ({ input }) => {
        const cached = await db.getCachedProviders(input.tvId, 'tv');
        let providers = null;
        
        if (cached) {
          providers = JSON.parse(cached.providersData);
        } else {
          const watchProviders = await tmdb.getTVShowWatchProviders(input.tvId);
          providers = watchProviders;
          
          if (providers) {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await db.setCachedProviders({
              tmdbId: input.tvId,
              mediaType: 'tv',
              countryCode: 'BR',
              providersData: JSON.stringify(providers),
              expiresAt,
            });
          }
        }
        
        const details = await tmdb.getTVShowDetails(input.tvId);
        return { ...details, watchProviders: providers };
      }),

    getTrending: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        timeWindow: z.enum(['day', 'week']).default('week'),
      }))
      .query(async ({ input }) => {
        const results = input.mediaType === 'movie' 
          ? await tmdb.getTrendingMovies(input.timeWindow)
          : await tmdb.getTrendingTVShows(input.timeWindow);
        
        // Fetch providers for each item with timeout
        const resultsWithProviders = await Promise.all(
          results.results.map(async (item: any) => {
            try {
              // Add timeout to prevent hanging
              const providerPromise = input.mediaType === 'movie'
                ? tmdb.getMovieWatchProviders(item.id)
                : tmdb.getTVShowWatchProviders(item.id);
              
              const timeoutPromise = new Promise<null>((resolve) => 
                setTimeout(() => resolve(null), 2000)
              );
              
              const providers = await Promise.race([providerPromise, timeoutPromise]);
              
              // Combine all provider types (flatrate, rent, buy)
              const allProviders = [
                ...(providers?.flatrate || []),
                ...(providers?.rent || []),
                ...(providers?.buy || []),
              ];
              
              // Remove duplicates based on provider_id
              const uniqueProviders = Array.from(
                new Map(allProviders.map(p => [p.provider_id, p])).values()
              );
              
              return {
                ...item,
                providers: uniqueProviders,
              };
            } catch (error) {
              // If provider fetch fails, return item without providers
              console.error(`Failed to fetch providers for ${item.id}:`, error);
              return {
                ...item,
                providers: [],
              };
            }
          })
        );
        
        return {
          ...results,
          results: resultsWithProviders,
        };
      }),

    getPopular: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        page: z.number().default(1),
      }))
      .query(async ({ input }) => {
        if (input.mediaType === 'movie') {
          return await tmdb.getPopularMovies(input.page);
        } else {
          return await tmdb.getPopularTVShows(input.page);
        }
      }),

    getSimilar: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        id: z.number(),
        page: z.number().default(1),
      }))
      .query(async ({ input }) => {
        if (input.mediaType === 'movie') {
          return await tmdb.getSimilarMovies(input.id, input.page);
        } else {
          return await tmdb.getSimilarTVShows(input.id, input.page);
        }
      }),

    getPersonalizedRecommendations: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
      }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user!.id;
        
        // Get user's watch history with ratings
        const watchHistory = await db.getWatchHistory(userId);
        
        // If no history, return trending content
        if (watchHistory.length === 0) {
          const trendingMovies = await tmdb.getTrendingMovies('week');
          const trendingTV = await tmdb.getTrendingTVShows('week');
          return {
            results: [...trendingMovies.results.slice(0, 10), ...trendingTV.results.slice(0, 10)],
            reason: 'trending',
          };
        }

        // Calculate genre preferences based on watch history and ratings
        const genreScores: Record<number, { score: number; count: number }> = {};
        
        for (const item of watchHistory) {
          const weight = item.rating ? item.rating / 5 : 1; // Normalize rating to 0-2 scale
          const genreIds = item.genreIds ? JSON.parse(item.genreIds) : [];
          
          for (const genreId of genreIds) {
            if (!genreScores[genreId]) {
              genreScores[genreId] = { score: 0, count: 0 };
            }
            genreScores[genreId].score += weight;
            genreScores[genreId].count += 1;
          }
        }

        // Get top 3 preferred genres
        const topGenres = Object.entries(genreScores)
          .sort(([, a], [, b]) => b.score - a.score)
          .slice(0, 3)
          .map(([genreId]) => parseInt(genreId));

        if (topGenres.length === 0) {
          const trendingMovies = await tmdb.getTrendingMovies('week');
          return {
            results: trendingMovies.results.slice(0, input.limit),
            reason: 'trending',
          };
        }

        // Get content from preferred genres
        const recommendations: any[] = [];
        const seenIds = new Set(watchHistory.map(h => `${h.mediaType}-${h.tmdbId}`));

        for (const genreId of topGenres) {
          const movieResults = await tmdb.discoverMoviesByGenre(genreId, 1);
          const tvResults = await tmdb.discoverTVShowsByGenre(genreId, 1);
          
          // Add movies
          for (const movie of movieResults.results) {
            const key = `movie-${movie.id}`;
            if (!seenIds.has(key) && recommendations.length < input.limit) {
              recommendations.push({ ...movie, media_type: 'movie' });
              seenIds.add(key);
            }
          }
          
          // Add TV shows
          for (const tv of tvResults.results) {
            const key = `tv-${tv.id}`;
            if (!seenIds.has(key) && recommendations.length < input.limit) {
              recommendations.push({ ...tv, media_type: 'tv' });
              seenIds.add(key);
            }
          }
          
          if (recommendations.length >= input.limit) break;
        }

        // Sort by vote_average to show best content first
        recommendations.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

        return {
          results: recommendations.slice(0, input.limit),
          reason: 'personalized',
          topGenres,
        };
      }),

    getUpcoming: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        page: z.number().default(1),
      }))
      .query(async ({ input }) => {
        if (input.mediaType === 'movie') {
          return await tmdb.getUpcomingMovies(input.page);
        } else {
          return await tmdb.getUpcomingTVShows(input.page);
        }
      }),

    getRecommendations: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        id: z.number(),
        page: z.number().default(1),
      }))
      .query(async ({ input }) => {
        if (input.mediaType === 'movie') {
          return await tmdb.getMovieRecommendations(input.id, input.page);
        } else {
          return await tmdb.getTVShowRecommendations(input.id, input.page);
        }
      }),

    getGenres: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input }) => {
        if (input.mediaType === 'movie') {
          return await tmdb.getMovieGenres();
        } else {
          return await tmdb.getTVGenres();
        }
      }),

    discoverByGenre: publicProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        genreId: z.number(),
        page: z.number().default(1),
      }))
      .query(async ({ input }) => {
        if (input.mediaType === 'movie') {
          return await tmdb.discoverMoviesByGenre(input.genreId, input.page);
        } else {
          return await tmdb.discoverTVShowsByGenre(input.genreId, input.page);
        }
      }),
  }),

  watchlist: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserWatchlist(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        title: z.string(),
        posterPath: z.string().nullable(),
        releaseDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addToWatchlist({
          userId: ctx.user.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          title: input.title,
          posterPath: input.posterPath,
          releaseDate: input.releaseDate,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.removeFromWatchlist(ctx.user.id, input.tmdbId, input.mediaType);
        return { success: true };
      }),

    isInWatchlist: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input, ctx }) => {
        return await db.isInWatchlist(ctx.user.id, input.tmdbId, input.mediaType);
      }),
  }),

  subscriptions: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSubscriptions(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        providerId: z.number(),
        providerName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addUserSubscription({
          userId: ctx.user.id,
          providerId: input.providerId,
          providerName: input.providerName,
          isActive: true,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ providerId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.removeUserSubscription(ctx.user.id, input.providerId);
        return { success: true };
      }),

    toggle: protectedProcedure
      .input(z.object({
        providerId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.toggleUserSubscription(ctx.user.id, input.providerId, input.isActive);
        return { success: true };
      }),
  }),

  alerts: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAlerts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        title: z.string(),
        providerId: z.number().optional(),
        providerName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createAlert({
          userId: ctx.user.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          title: input.title,
          providerId: input.providerId,
          providerName: input.providerName,
          isActive: true,
          notified: false,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteAlert(input.alertId, ctx.user.id);
        return { success: true };
      }),

    toggle: protectedProcedure
      .input(z.object({
        alertId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.toggleAlert(input.alertId, ctx.user.id, input.isActive);
        return { success: true };
      }),
  }),

  ratings: router({
    upsert: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        rating: z.number().min(1).max(5),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertRating({
          userId: ctx.user.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          rating: input.rating,
        });
        return { success: true };
      }),

    getUserRating: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getUserRating(ctx.user.id, input.tmdbId, input.mediaType);
      }),

    getAverage: publicProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input }) => {
        return await db.getAverageRating(input.tmdbId, input.mediaType);
      }),
  }),

  reviews: router({
    create: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        title: z.string().min(1).max(255),
        content: z.string().min(10),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReview({
          userId: ctx.user.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          title: input.title,
          content: input.content,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        title: z.string().min(1).max(255),
        content: z.string().min(10),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateReview(input.reviewId, ctx.user.id, input.title, input.content);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteReview(input.reviewId, ctx.user.id);
        return { success: true };
      }),

    getUserReview: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getUserReview(ctx.user.id, input.tmdbId, input.mediaType);
      }),

    getContentReviews: publicProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input }) => {
        return await db.getContentReviews(input.tmdbId, input.mediaType);
      }),

    getAllRecentReviews: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getAllRecentReviews(input.limit, input.offset);
      }),
  }),

  viewingHistory: router({
    add: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        title: z.string(),
        posterPath: z.string().nullable(),
        genreIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addToViewingHistory({
          userId: ctx.user.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          title: input.title,
          posterPath: input.posterPath,
          genreIds: input.genreIds ? JSON.stringify(input.genreIds) : undefined,
        });
        return { success: true };
      }),

    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserViewingHistory(ctx.user.id);
    }),

    isWatched: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input, ctx }) => {
        const history = await db.getUserViewingHistory(ctx.user.id);
        return history.some(
          item => item.tmdbId === input.tmdbId && item.mediaType === input.mediaType
        );
      }),

    getRecommendations: protectedProcedure
      .input(z.object({
        mediaType: z.enum(['movie', 'tv']),
        page: z.number().default(1),
      }))
      .query(async ({ input, ctx }) => {
        // Get user's genre preferences from viewing history
        const preferredGenres = await db.getUserGenrePreferences(ctx.user.id);
        
        if (preferredGenres.length === 0) {
          // If no history, return popular content
          if (input.mediaType === 'movie') {
            return await tmdb.getPopularMovies(input.page);
          } else {
            return await tmdb.getPopularTVShows(input.page);
          }
        }

        // Get content based on preferred genres
        const genreId = preferredGenres[0]; // Use top genre
        if (input.mediaType === 'movie') {
          return await tmdb.discoverMoviesByGenre(genreId, input.page);
        } else {
          return await tmdb.discoverTVShowsByGenre(genreId, input.page);
        }
      }),
  }),

  customLists: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const list = await db.createCustomList({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
        });
        return list;
      }),

    getUserLists: protectedProcedure
      .query(async ({ ctx }) => {
        const lists = await db.getUserCustomLists(ctx.user.id);
        // Add thumbnail for each list
        const listsWithThumbnails = await Promise.all(
          lists.map(async (list) => ({
            ...list,
            thumbnail: await db.getListThumbnail(list.id),
          }))
        );
        return listsWithThumbnails;
      }),

    getListById: publicProcedure
      .input(z.object({ listId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomListById(input.listId);
      }),

    getListItems: publicProcedure
      .input(z.object({ listId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomListItems(input.listId);
      }),

    getItemLists: protectedProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getItemCustomLists(ctx.user.id, input.tmdbId, input.mediaType);
      }),

    addItem: protectedProcedure
      .input(z.object({
        listId: z.number(),
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        title: z.string(),
        posterPath: z.string().nullable(),
        releaseDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addItemToCustomList({
          listId: input.listId,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          title: input.title,
          posterPath: input.posterPath,
        });
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({
        listId: z.number(),
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
      }))
      .mutation(async ({ input }) => {
        await db.removeItemFromCustomList(input.listId, input.tmdbId, input.mediaType);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        listId: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { listId, ...data } = input;
        await db.updateCustomList(listId, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ listId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteCustomList(input.listId, ctx.user.id);
        return { success: true };
      }),
  }),

  affiliate: router({
    trackClick: publicProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        providerId: z.number(),
        providerName: z.string(),
        clickType: z.enum(['rent', 'buy', 'stream']),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.trackAffiliateClick({
          userId: ctx.user?.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          providerId: input.providerId,
          providerName: input.providerName,
          clickType: input.clickType,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers['user-agent'],
        });
        return { success: true };
      }),

    getStats: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        // Only allow admin users to view affiliate stats
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        const startDate = input?.startDate ? new Date(input.startDate) : undefined;
        const endDate = input?.endDate ? new Date(input.endDate) : undefined;

        return await db.getAffiliateStats(startDate, endDate);
      }),
  }),

  backgroundJobs: router({
    runAvailabilityCheck: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Only allow admin users to trigger background jobs manually
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        
        const result = await runAvailabilityCheckJob();
        return result;
      }),

    runAllJobs: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Only allow admin users to trigger background jobs manually
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        
        const results = await runAllJobs();
        return results;
      }),
  }),

  ai: router({
    identifyContent: publicProcedure
      .input(z.object({
        description: z.string().min(3).max(1000),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `Você é um assistente especializado em identificar filmes e séries de TV baseado em descrições dos usuários. 

Quando o usuário descrever um filme ou série (pode ser uma cena, personagem, enredo, ator, etc.), você deve:
1. Tentar identificar o conteúdo descrito
2. Retornar uma lista de possíveis correspondências com o título original e em português (se houver)
3. Incluir o ano de lançamento quando souber
4. Se não tiver certeza, faça perguntas para esclarecer

Sempre responda em português brasileiro.
Seja conciso mas informativo.
Se identificar múltiplas possibilidades, liste as mais prováveis primeiro.

Formato da resposta quando identificar conteúdo:
- Liste os títulos encontrados
- Inclua uma breve descrição de por que cada um pode ser o que o usuário procura
- Se tiver alta confiança em um resultado específico, destaque-o

Se precisar de mais informações, faça perguntas específicas como:
- "Em que década você acha que foi lançado?"
- "Lembra de algum ator ou atriz?"
- "Era um filme de Hollywood ou de outro país?"
- "Lembra de mais alguma cena ou detalhe?"` ;

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt },
        ];

        // Add conversation history if provided
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          for (const msg of input.conversationHistory) {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }
        }

        // Add current user message
        messages.push({ role: 'user', content: input.description });

        try {
          const response = await invokeLLM({ messages });
          const assistantMessage = response.choices[0]?.message?.content;
          
          if (typeof assistantMessage === 'string') {
            return {
              success: true,
              response: assistantMessage,
            };
          }
          
          // Handle array content
          if (Array.isArray(assistantMessage)) {
            const textContent = assistantMessage
              .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
              .map(part => part.text)
              .join('\n');
            return {
              success: true,
              response: textContent || 'Não consegui processar a resposta.',
            };
          }

          return {
            success: false,
            response: 'Não consegui processar a resposta.',
          };
        } catch (error) {
          console.error('AI identification error:', error);
          return {
            success: false,
            response: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
