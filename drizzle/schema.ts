import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, unique, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User subscriptions - tracks which streaming services the user has access to
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  providerId: int("providerId").notNull(), // TMDB provider ID
  providerName: varchar("providerName", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userProviderUnique: unique().on(table.userId, table.providerId),
  userIdIdx: index("userIdIdx").on(table.userId),
}));

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Watchlist - user's saved movies and TV shows
 */
export const watchlist = mysqlTable("watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tmdbId: int("tmdbId").notNull(), // TMDB content ID
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  posterPath: varchar("posterPath", { length: 255 }),
  releaseDate: varchar("releaseDate", { length: 50 }),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => ({
  userContentUnique: unique().on(table.userId, table.tmdbId, table.mediaType),
  userIdIdx: index("userIdIdx").on(table.userId),
  tmdbIdIdx: index("tmdbIdIdx").on(table.tmdbId),
}));

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = typeof watchlist.$inferInsert;

/**
 * Alerts - user notifications for content availability
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tmdbId: int("tmdbId").notNull(),
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  providerId: int("providerId"), // Specific provider to watch for, null = any provider
  providerName: varchar("providerName", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  notified: boolean("notified").default(false).notNull(),
  notifiedAt: timestamp("notifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userIdIdx").on(table.userId),
  activeIdx: index("activeIdx").on(table.isActive, table.notified),
}));

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Affiliate clicks - tracks affiliate link clicks for monetization
 */
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Optional, may be null for non-logged-in users
  tmdbId: int("tmdbId").notNull(),
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  providerId: int("providerId").notNull(),
  providerName: varchar("providerName", { length: 255 }).notNull(),
  clickType: mysqlEnum("clickType", ["rent", "buy", "stream"]).notNull(),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
}, (table) => ({
  tmdbIdIdx: index("tmdbIdIdx").on(table.tmdbId),
  clickedAtIdx: index("clickedAtIdx").on(table.clickedAt),
}));

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;

/**
 * Cached provider data - reduces TMDB API calls
 */
export const cachedProviders = mysqlTable("cached_providers", {
  id: int("id").autoincrement().primaryKey(),
  tmdbId: int("tmdbId").notNull(),
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  countryCode: varchar("countryCode", { length: 2 }).notNull().default("BR"),
  providersData: text("providersData").notNull(), // JSON string of provider data
  cachedAt: timestamp("cachedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Cache expiry (e.g., 24 hours)
}, (table) => ({
  contentUnique: unique().on(table.tmdbId, table.mediaType, table.countryCode),
  expiresAtIdx: index("expiresAtIdx").on(table.expiresAt),
}));

export type CachedProvider = typeof cachedProviders.$inferSelect;
export type InsertCachedProvider = typeof cachedProviders.$inferInsert;
/**
 * User ratings - tracks user ratings for movies and TV shows
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tmdbId: int("tmdbId").notNull(),
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userContentUnique: unique().on(table.userId, table.tmdbId, table.mediaType),
  userIdIdx: index("userIdIdx").on(table.userId),
  tmdbIdIdx: index("tmdbIdIdx").on(table.tmdbId),
}));

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * User reviews - user-written reviews for movies and TV shows
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tmdbId: int("tmdbId").notNull(),
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userContentUnique: unique().on(table.userId, table.tmdbId, table.mediaType),
  userIdIdx: index("userIdIdx").on(table.userId),
  tmdbIdIdx: index("tmdbIdIdx").on(table.tmdbId),
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;


/**
 * Viewing history - tracks what users have watched
 */
export const viewingHistory = mysqlTable("viewing_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tmdbId: int("tmdbId").notNull(), // TMDB content ID
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  posterPath: varchar("posterPath", { length: 255 }),
  watchedAt: timestamp("watchedAt").defaultNow().notNull(),
  genreIds: text("genreIds"), // JSON array of genre IDs for recommendations
}, (table) => ({
  userIdIdx: index("userIdIdx").on(table.userId),
  watchedAtIdx: index("watchedAtIdx").on(table.watchedAt),
  userTmdbUnique: unique().on(table.userId, table.tmdbId, table.mediaType),
}));

export type ViewingHistory = typeof viewingHistory.$inferSelect;
export type InsertViewingHistory = typeof viewingHistory.$inferInsert;


/**
 * Custom lists - user-created lists for organizing content
 */
export const customLists = mysqlTable("custom_lists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("coverImage", { length: 500 }),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userIdIdx").on(table.userId),
}));

export type CustomList = typeof customLists.$inferSelect;
export type InsertCustomList = typeof customLists.$inferInsert;

/**
 * Custom list items - content in custom lists
 */
export const customListItems = mysqlTable("custom_list_items", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  tmdbId: int("tmdbId").notNull(), // TMDB content ID
  mediaType: mysqlEnum("mediaType", ["movie", "tv"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  posterPath: varchar("posterPath", { length: 255 }),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => ({
  listIdIdx: index("listIdIdx").on(table.listId),
  listTmdbUnique: unique().on(table.listId, table.tmdbId, table.mediaType),
}));

export type CustomListItem = typeof customListItems.$inferSelect;
export type InsertCustomListItem = typeof customListItems.$inferInsert;


/**
 * Push subscriptions - stores Web Push subscription data for notifications
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(), // Public key
  auth: varchar("auth", { length: 255 }).notNull(), // Auth secret
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userIdIdx").on(table.userId),
}));

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
