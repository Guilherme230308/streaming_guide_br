import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as tmdb from "./tmdb";
import * as db from "./db";

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
        if (input.mediaType === 'movie') {
          return await tmdb.getTrendingMovies(input.timeWindow);
        } else {
          return await tmdb.getTrendingTVShows(input.timeWindow);
        }
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
        return await db.getUserCustomLists(ctx.user.id);
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
    track: publicProcedure
      .input(z.object({
        tmdbId: z.number(),
        mediaType: z.enum(['movie', 'tv']),
        providerId: z.number(),
        providerName: z.string(),
        clickType: z.enum(['rent', 'buy', 'stream']),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.trackAffiliateClick({
          userId: ctx.user?.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
          providerId: input.providerId,
          providerName: input.providerName,
          clickType: input.clickType,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
