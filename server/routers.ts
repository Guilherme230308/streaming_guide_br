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
