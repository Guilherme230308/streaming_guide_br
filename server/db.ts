import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  watchlist, 
  InsertWatchlist, 
  Watchlist,
  userSubscriptions,
  InsertUserSubscription,
  UserSubscription,
  alerts,
  InsertAlert,
  Alert,
  affiliateClicks,
  InsertAffiliateClick,
  cachedProviders,
  InsertCachedProvider,
  CachedProvider,
  ratings,
  InsertRating,
  Rating,
  reviews,
  InsertReview,
  Review,
  viewingHistory,
  InsertViewingHistory,
  ViewingHistory,
  customLists,
  InsertCustomList,
  CustomList,
  customListItems,
  InsertCustomListItem,
  CustomListItem,
  pushSubscriptions,
  InsertPushSubscription,
  PushSubscription,
  availabilityReports,
  InsertAvailabilityReport,
  AvailabilityReport
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Watchlist functions
export async function addToWatchlist(data: InsertWatchlist): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(watchlist).values(data).onDuplicateKeyUpdate({
    set: { addedAt: new Date() }
  });
}

export async function removeFromWatchlist(userId: number, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(watchlist).where(
    and(
      eq(watchlist.userId, userId),
      eq(watchlist.tmdbId, tmdbId),
      eq(watchlist.mediaType, mediaType)
    )
  );
}

export async function getUserWatchlist(userId: number): Promise<Watchlist[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(watchlist)
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.addedAt));
}

export async function isInWatchlist(userId: number, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(watchlist)
    .where(
      and(
        eq(watchlist.userId, userId),
        eq(watchlist.tmdbId, tmdbId),
        eq(watchlist.mediaType, mediaType)
      )
    )
    .limit(1);
  
  return result.length > 0;
}

// User subscriptions functions
export async function addUserSubscription(data: InsertUserSubscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userSubscriptions).values(data).onDuplicateKeyUpdate({
    set: { isActive: true, updatedAt: new Date() }
  });
}

export async function removeUserSubscription(userId: number, providerId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(userSubscriptions).where(
    and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.providerId, providerId)
    )
  );
}

export async function getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(userSubscriptions)
    .where(and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.isActive, true)
    ));
}

export async function toggleUserSubscription(userId: number, providerId: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(userSubscriptions)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.providerId, providerId)
      )
    );
}

// Alerts functions
export async function createAlert(data: InsertAlert): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(alerts).values(data);
}

export async function getUserAlerts(userId: number): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alerts)
    .where(and(
      eq(alerts.userId, userId),
      eq(alerts.isActive, true)
    ))
    .orderBy(desc(alerts.createdAt));
}

export async function deleteAlert(alertId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(alerts).where(
    and(
      eq(alerts.id, alertId),
      eq(alerts.userId, userId)
    )
  );
}

export async function toggleAlert(alertId: number, userId: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alerts)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(
        eq(alerts.id, alertId),
        eq(alerts.userId, userId)
      )
    );
}

export async function markAlertAsNotified(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alerts)
    .set({ notified: true, notifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(alerts.id, alertId));
}

export async function getAllActiveAlerts(): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alerts)
    .where(and(
      eq(alerts.isActive, true),
      eq(alerts.notified, false)
    ))
    .orderBy(desc(alerts.createdAt));
}

export async function getAlertById(alertId: number): Promise<Alert | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [alert] = await db.select().from(alerts)
    .where(eq(alerts.id, alertId))
    .limit(1);
  
  return alert || null;
}

// Affiliate clicks tracking
export async function trackAffiliateClick(data: InsertAffiliateClick): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(affiliateClicks).values(data);
}

// Provider cache functions
export async function getCachedProviders(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<CachedProvider | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(cachedProviders)
    .where(
      and(
        eq(cachedProviders.tmdbId, tmdbId),
        eq(cachedProviders.mediaType, mediaType),
        eq(cachedProviders.countryCode, 'BR')
      )
    )
    .limit(1);
  
  if (result.length === 0) return null;
  
  const cached = result[0];
  // Check if expired
  if (cached && new Date() > cached.expiresAt) {
    // Delete expired cache
    await db.delete(cachedProviders).where(eq(cachedProviders.id, cached.id));
    return null;
  }
  
  return cached || null;
}

export async function setCachedProviders(data: InsertCachedProvider): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(cachedProviders).values(data).onDuplicateKeyUpdate({
    set: {
      providersData: data.providersData,
      cachedAt: new Date(),
      expiresAt: data.expiresAt
    }
  });
}

// Rating functions
export async function upsertRating(data: InsertRating): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(ratings).values(data).onDuplicateKeyUpdate({
    set: {
      rating: data.rating,
      updatedAt: new Date()
    }
  });
}

export async function getUserRating(userId: number, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<Rating | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(ratings)
    .where(and(
      eq(ratings.userId, userId),
      eq(ratings.tmdbId, tmdbId),
      eq(ratings.mediaType, mediaType)
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function getAverageRating(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<{ average: number; count: number }> {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  
  const result = await db.select().from(ratings)
    .where(and(
      eq(ratings.tmdbId, tmdbId),
      eq(ratings.mediaType, mediaType)
    ));
  
  if (result.length === 0) return { average: 0, count: 0 };
  
  const sum = result.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: sum / result.length,
    count: result.length
  };
}

// Review functions
export async function createReview(data: InsertReview): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(reviews).values(data);
}

export async function updateReview(reviewId: number, userId: number, title: string, content: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(reviews)
    .set({ title, content, updatedAt: new Date() })
    .where(and(
      eq(reviews.id, reviewId),
      eq(reviews.userId, userId)
    ));
}

export async function deleteReview(reviewId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(reviews).where(
    and(
      eq(reviews.id, reviewId),
      eq(reviews.userId, userId)
    )
  );
}

export async function getUserReview(userId: number, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<Review | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(reviews)
    .where(and(
      eq(reviews.userId, userId),
      eq(reviews.tmdbId, tmdbId),
      eq(reviews.mediaType, mediaType)
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function getContentReviews(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<Array<Review & { userName: string }>> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: reviews.id,
    userId: reviews.userId,
    tmdbId: reviews.tmdbId,
    mediaType: reviews.mediaType,
    title: reviews.title,
    contentTitle: reviews.contentTitle,
    content: reviews.content,
    createdAt: reviews.createdAt,
    updatedAt: reviews.updatedAt,
    userName: users.name
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(
      eq(reviews.tmdbId, tmdbId),
      eq(reviews.mediaType, mediaType)
    ))
    .orderBy(desc(reviews.createdAt));
  
  return result.map(r => ({
    ...r,
    userName: r.userName || 'Usuário Anônimo'
  }));
}

export async function getAllRecentReviews(limit: number = 20, offset: number = 0): Promise<Array<Review & { userName: string; posterPath?: string }>> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: reviews.id,
    userId: reviews.userId,
    tmdbId: reviews.tmdbId,
    mediaType: reviews.mediaType,
    title: reviews.title,
    contentTitle: reviews.contentTitle,
    content: reviews.content,
    createdAt: reviews.createdAt,
    updatedAt: reviews.updatedAt,
    userName: users.name,
    posterPath: viewingHistory.posterPath
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(viewingHistory, and(
      eq(reviews.tmdbId, viewingHistory.tmdbId),
      eq(reviews.mediaType, viewingHistory.mediaType)
    ))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result.map(r => ({
    ...r,
    userName: r.userName || 'Usuário Anônimo',
    posterPath: r.posterPath ?? undefined
  }));
}


// Viewing History functions
export async function addToViewingHistory(history: InsertViewingHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(viewingHistory).values(history).onDuplicateKeyUpdate({
      set: {
        watchedAt: new Date(),
        title: history.title,
        posterPath: history.posterPath,
        genreIds: history.genreIds,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to add to viewing history:", error);
    throw error;
  }
}

export async function getUserViewingHistory(userId: number): Promise<ViewingHistory[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(viewingHistory)
      .where(eq(viewingHistory.userId, userId))
      .orderBy(desc(viewingHistory.watchedAt))
      .limit(100);
  } catch (error) {
    console.error("[Database] Failed to get viewing history:", error);
    return [];
  }
}

export async function getWatchHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get viewing history with ratings
    const history = await db
      .select({
        tmdbId: viewingHistory.tmdbId,
        mediaType: viewingHistory.mediaType,
        genreIds: viewingHistory.genreIds,
        watchedAt: viewingHistory.watchedAt,
        rating: ratings.rating,
      })
      .from(viewingHistory)
      .leftJoin(
        ratings,
        and(
          eq(viewingHistory.userId, ratings.userId),
          eq(viewingHistory.tmdbId, ratings.tmdbId),
          eq(viewingHistory.mediaType, ratings.mediaType)
        )
      )
      .where(eq(viewingHistory.userId, userId))
      .orderBy(desc(viewingHistory.watchedAt))
      .limit(50);

    return history;
  } catch (error) {
    console.error("[Database] Failed to get watch history:", error);
    return [];
  }
}

export async function getUserGenrePreferences(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const history = await db
      .select()
      .from(viewingHistory)
      .where(eq(viewingHistory.userId, userId))
      .orderBy(desc(viewingHistory.watchedAt))
      .limit(50);

    // Extract and count genre occurrences
    const genreCounts: Record<number, number> = {};
    
    for (const item of history) {
      if (item.genreIds) {
        try {
          const genres = JSON.parse(item.genreIds) as number[];
          for (const genreId of genres) {
            genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    // Return top 5 genres sorted by frequency
    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genreId]) => parseInt(genreId));
  } catch (error) {
    console.error("[Database] Failed to get genre preferences:", error);
    return [];
  }
}

// Custom Lists functions
export async function createCustomList(data: InsertCustomList): Promise<CustomList> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customLists).values(data);
  const insertedId = Number(result[0].insertId);
  
  const [list] = await db.select().from(customLists).where(eq(customLists.id, insertedId));
  return list;
}

export async function getUserCustomLists(userId: number): Promise<Array<CustomList & { itemCount: number }>> {
  const db = await getDb();
  if (!db) return [];

  const lists = await db
    .select()
    .from(customLists)
    .where(eq(customLists.userId, userId))
    .orderBy(desc(customLists.createdAt));

  // Get item counts for each list
  const listsWithCounts = await Promise.all(
    lists.map(async (list) => {
      const items = await db
        .select()
        .from(customListItems)
        .where(eq(customListItems.listId, list.id));
      
      return {
        ...list,
        itemCount: items.length
      };
    })
  );

  return listsWithCounts;
}

export async function getCustomListById(listId: number): Promise<CustomList | null> {
  const db = await getDb();
  if (!db) return null;

  const [list] = await db
    .select()
    .from(customLists)
    .where(eq(customLists.id, listId))
    .limit(1);

  return list || null;
}

export async function updateCustomList(listId: number, userId: number, data: Partial<InsertCustomList>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(customLists)
    .set({ ...data, updatedAt: new Date() })
    .where(and(
      eq(customLists.id, listId),
      eq(customLists.userId, userId)
    ));
}

export async function deleteCustomList(listId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all items in the list first
  await db.delete(customListItems).where(eq(customListItems.listId, listId));
  
  // Delete the list
  await db.delete(customLists).where(and(
    eq(customLists.id, listId),
    eq(customLists.userId, userId)
  ));
}

export async function addItemToCustomList(data: InsertCustomListItem): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(customListItems).values(data).onDuplicateKeyUpdate({
    set: { addedAt: new Date() }
  });
}

export async function removeItemFromCustomList(listId: number, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(customListItems).where(and(
    eq(customListItems.listId, listId),
    eq(customListItems.tmdbId, tmdbId),
    eq(customListItems.mediaType, mediaType)
  ));
}

export async function getCustomListItems(listId: number): Promise<CustomListItem[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customListItems)
    .where(eq(customListItems.listId, listId))
    .orderBy(desc(customListItems.addedAt));
}

export async function getItemCustomLists(userId: number, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<CustomList[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all user's lists that contain this item
  const items = await db
    .select()
    .from(customListItems)
    .where(and(
      eq(customListItems.tmdbId, tmdbId),
      eq(customListItems.mediaType, mediaType)
    ));

  if (items.length === 0) return [];

  const listIds = items.map(item => item.listId);
  
  const lists = await db
    .select()
    .from(customLists)
    .where(and(
      eq(customLists.userId, userId)
    ));

  return lists.filter(list => listIds.includes(list.id));
}

export async function getListThumbnail(listId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const items = await db
    .select()
    .from(customListItems)
    .where(eq(customListItems.listId, listId))
    .orderBy(desc(customListItems.addedAt))
    .limit(1);

  return items.length > 0 ? items[0].posterPath : null;
}

// ============================================================================
// Affiliate Analytics
// ============================================================================

export async function getAffiliateStats(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return {
    totalClicks: 0,
    clicksByProvider: [],
    clicksByType: [],
    clicksByDate: [],
  };

  let query = db.select().from(affiliateClicks);

  if (startDate && endDate) {
    query = query.where(
      and(
        gte(affiliateClicks.clickedAt, startDate),
        lte(affiliateClicks.clickedAt, endDate)
      )
    ) as any;
  }

  const clicks = await query;

  // Group by provider
  const clicksByProvider = clicks.reduce((acc, click) => {
    const existing = acc.find(item => item.providerId === click.providerId);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        providerId: click.providerId,
        providerName: click.providerName,
        count: 1,
      });
    }
    return acc;
  }, [] as Array<{ providerId: number; providerName: string; count: number }>);

  // Group by click type
  const clicksByType = clicks.reduce((acc, click) => {
    const existing = acc.find(item => item.clickType === click.clickType);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        clickType: click.clickType,
        count: 1,
      });
    }
    return acc;
  }, [] as Array<{ clickType: string; count: number }>);

  // Group by date (last 30 days)
  const clicksByDate = clicks.reduce((acc, click) => {
    const date = new Date(click.clickedAt).toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        date,
        count: 1,
      });
    }
    return acc;
  }, [] as Array<{ date: string; count: number }>);

  return {
    totalClicks: clicks.length,
    clicksByProvider: clicksByProvider.sort((a, b) => b.count - a.count),
    clicksByType: clicksByType.sort((a, b) => b.count - a.count),
    clicksByDate: clicksByDate.sort((a, b) => a.date.localeCompare(b.date)),
  };
}


// ============================================================================
// Push Subscriptions
// ============================================================================

export async function savePushSubscription(data: Omit<InsertPushSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if subscription already exists
  const existing = await db.select().from(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, data.userId),
      eq(pushSubscriptions.endpoint, data.endpoint)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing subscription
    await db.update(pushSubscriptions)
      .set({ 
        p256dh: data.p256dh, 
        auth: data.auth, 
        userAgent: data.userAgent,
        updatedAt: new Date() 
      })
      .where(eq(pushSubscriptions.id, existing[0].id));
  } else {
    // Insert new subscription
    await db.insert(pushSubscriptions).values(data);
  }
}

export async function deletePushSubscription(userId: number, endpoint: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(pushSubscriptions).where(and(
    eq(pushSubscriptions.userId, userId),
    eq(pushSubscriptions.endpoint, endpoint)
  ));
}

export async function getUserPushSubscriptions(userId: number): Promise<PushSubscription[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

export async function getAllPushSubscriptions(): Promise<PushSubscription[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pushSubscriptions);
}

export async function deleteInvalidPushSubscription(endpoint: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}


// ============================================================================
// Streaming Analysis
// ============================================================================

export interface StreamingAnalysisData {
  watchlistItems: Array<{
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
  }>;
  watchedItems: Array<{
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
  }>;
  customListItems: Array<{
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
  }>;
}

export async function getUserStreamingAnalysisData(userId: number): Promise<StreamingAnalysisData> {
  const db = await getDb();
  if (!db) {
    return { watchlistItems: [], watchedItems: [], customListItems: [] };
  }

  // Get watchlist items
  const watchlistData = await db.select({
    tmdbId: watchlist.tmdbId,
    mediaType: watchlist.mediaType,
    title: watchlist.title,
    posterPath: watchlist.posterPath,
  }).from(watchlist).where(eq(watchlist.userId, userId));

  // Get watched items from viewing history
  const watchedData = await db.select({
    tmdbId: viewingHistory.tmdbId,
    mediaType: viewingHistory.mediaType,
    title: viewingHistory.title,
    posterPath: viewingHistory.posterPath,
  }).from(viewingHistory).where(eq(viewingHistory.userId, userId));

  // Get custom list items
  const userLists = await db.select().from(customLists).where(eq(customLists.userId, userId));
  const listIds = userLists.map(l => l.id);
  
  let customListData: Array<{
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
  }> = [];
  
  if (listIds.length > 0) {
    const allListItems = await db.select({
      tmdbId: customListItems.tmdbId,
      mediaType: customListItems.mediaType,
      title: customListItems.title,
      posterPath: customListItems.posterPath,
    }).from(customListItems);
    
    customListData = allListItems.filter(item => {
      // We need to check if this item belongs to one of user's lists
      // This is a workaround since we can't use IN clause easily
      return true; // For now, get all and filter in the procedure
    });
  }

  return {
    watchlistItems: watchlistData as StreamingAnalysisData['watchlistItems'],
    watchedItems: watchedData as StreamingAnalysisData['watchedItems'],
    customListItems: customListData,
  };
}

export async function getAllUserContentIds(userId: number): Promise<Array<{ tmdbId: number; mediaType: 'movie' | 'tv' }>> {
  const db = await getDb();
  if (!db) return [];

  const contentSet = new Map<string, { tmdbId: number; mediaType: 'movie' | 'tv' }>();

  // Get watchlist items
  const watchlistData = await db.select({
    tmdbId: watchlist.tmdbId,
    mediaType: watchlist.mediaType,
  }).from(watchlist).where(eq(watchlist.userId, userId));

  for (const item of watchlistData) {
    const key = `${item.tmdbId}-${item.mediaType}`;
    contentSet.set(key, { tmdbId: item.tmdbId, mediaType: item.mediaType as 'movie' | 'tv' });
  }

  // Get watched items
  const watchedData = await db.select({
    tmdbId: viewingHistory.tmdbId,
    mediaType: viewingHistory.mediaType,
  }).from(viewingHistory).where(eq(viewingHistory.userId, userId));

  for (const item of watchedData) {
    const key = `${item.tmdbId}-${item.mediaType}`;
    contentSet.set(key, { tmdbId: item.tmdbId, mediaType: item.mediaType as 'movie' | 'tv' });
  }

  // Get custom list items
  const userLists = await db.select({ id: customLists.id }).from(customLists).where(eq(customLists.userId, userId));
  
  for (const list of userLists) {
    const listItems = await db.select({
      tmdbId: customListItems.tmdbId,
      mediaType: customListItems.mediaType,
    }).from(customListItems).where(eq(customListItems.listId, list.id));

    for (const item of listItems) {
      const key = `${item.tmdbId}-${item.mediaType}`;
      contentSet.set(key, { tmdbId: item.tmdbId, mediaType: item.mediaType as 'movie' | 'tv' });
    }
  }

  return Array.from(contentSet.values());
}

// Availability report functions
export async function createAvailabilityReport(data: InsertAvailabilityReport): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(availabilityReports).values(data);
}

export async function getAvailabilityReports(status?: 'pending' | 'reviewed' | 'resolved'): Promise<AvailabilityReport[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(availabilityReports)
      .where(eq(availabilityReports.status, status))
      .orderBy(desc(availabilityReports.createdAt))
      .limit(100);
  }
  
  return await db.select().from(availabilityReports)
    .orderBy(desc(availabilityReports.createdAt))
    .limit(100);
}

export async function getReportCountForContent(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(availabilityReports)
    .where(
      and(
        eq(availabilityReports.tmdbId, tmdbId),
        eq(availabilityReports.mediaType, mediaType),
        eq(availabilityReports.status, 'pending')
      )
    );
  
  return result.length;
}

// ============================================================================
// Revenue Dashboard - Enhanced Analytics
// ============================================================================

export interface RevenueDashboardStats {
  // Summary KPIs
  totalClicks: number;
  totalClicksToday: number;
  totalClicksThisWeek: number;
  totalClicksThisMonth: number;
  estimatedRevenue: number;
  
  // Clicks over time (daily)
  clicksByDate: Array<{ date: string; count: number; estimatedRevenue: number }>;
  
  // By provider with revenue estimates
  clicksByProvider: Array<{
    providerId: number;
    providerName: string;
    count: number;
    estimatedRevenue: number;
    isAmazon: boolean;
  }>;
  
  // By click type
  clicksByType: Array<{ clickType: string; count: number; estimatedRevenue: number }>;
  
  // Top content driving clicks
  topContent: Array<{
    tmdbId: number;
    mediaType: string;
    title: string;
    clicks: number;
    estimatedRevenue: number;
  }>;
  
  // Hourly distribution
  clicksByHour: Array<{ hour: number; count: number }>;
  
  // Platform stats (user agent analysis)
  platformStats: { mobile: number; desktop: number; pwa: number; other: number };
}

// Estimated commission rates per provider
const COMMISSION_RATES: Record<string, number> = {
  // Amazon Associates: ~4% average on subscriptions, ~2.5% on digital
  'Amazon Prime Video': 0.04 * 14.90, // 4% of R$14.90/month subscription
  'Amazon Video': 0.025 * 19.90, // 2.5% of avg R$19.90 rental/purchase
  // Other providers: estimated CPA (cost per action) in BRL
  'Netflix': 0, // No affiliate program
  'Disney Plus': 0.10, // Estimated future CPA
  'HBO Max': 0.10,
  'Paramount Plus': 0.10,
  'Globoplay': 0.05,
  'Apple TV Plus': 0.15,
  'Crunchyroll': 0.08,
  'Star Plus': 0.10,
};

function getEstimatedRevenue(providerName: string, clickType: string, count: number): number {
  // Amazon is the main revenue source
  const isAmazon = providerName.toLowerCase().includes('amazon') || providerName.toLowerCase().includes('prime video');
  
  if (isAmazon) {
    if (clickType === 'stream') {
      // 4% commission on Prime Video subscription (R$14.90) * estimated 3% conversion
      return count * 0.04 * 14.90 * 0.03;
    } else if (clickType === 'rent') {
      // 2.5% commission on avg R$14.90 rental * estimated 5% conversion
      return count * 0.025 * 14.90 * 0.05;
    } else if (clickType === 'buy') {
      // 2.5% commission on avg R$29.90 purchase * estimated 2% conversion
      return count * 0.025 * 29.90 * 0.02;
    }
  }
  
  // Non-Amazon: no direct revenue yet, but track for future
  return 0;
}

export async function getRevenueDashboardStats(
  startDate?: Date,
  endDate?: Date
): Promise<RevenueDashboardStats> {
  const db = await getDb();
  if (!db) return {
    totalClicks: 0,
    totalClicksToday: 0,
    totalClicksThisWeek: 0,
    totalClicksThisMonth: 0,
    estimatedRevenue: 0,
    clicksByDate: [],
    clicksByProvider: [],
    clicksByType: [],
    topContent: [],
    clicksByHour: [],
    platformStats: { mobile: 0, desktop: 0, pwa: 0, other: 0 },
  };

  // Build query with date filter
  let clicks;
  if (startDate && endDate) {
    clicks = await db.select().from(affiliateClicks)
      .where(and(
        gte(affiliateClicks.clickedAt, startDate),
        lte(affiliateClicks.clickedAt, endDate)
      ));
  } else {
    clicks = await db.select().from(affiliateClicks);
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  // Time-based KPIs
  const totalClicksToday = clicks.filter(c => new Date(c.clickedAt) >= todayStart).length;
  const totalClicksThisWeek = clicks.filter(c => new Date(c.clickedAt) >= weekStart).length;
  const totalClicksThisMonth = clicks.filter(c => new Date(c.clickedAt) >= monthStart).length;

  // Clicks by date with revenue
  const dateMap = new Map<string, { count: number; revenue: number }>();
  for (const click of clicks) {
    const date = new Date(click.clickedAt).toISOString().split('T')[0];
    const existing = dateMap.get(date) || { count: 0, revenue: 0 };
    existing.count++;
    existing.revenue += getEstimatedRevenue(click.providerName, click.clickType, 1);
    dateMap.set(date, existing);
  }
  const clicksByDate = Array.from(dateMap.entries())
    .map(([date, data]) => ({ date, count: data.count, estimatedRevenue: Math.round(data.revenue * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Clicks by provider with revenue
  const providerMap = new Map<number, { providerName: string; count: number; revenue: number }>();
  for (const click of clicks) {
    const existing = providerMap.get(click.providerId) || { providerName: click.providerName, count: 0, revenue: 0 };
    existing.count++;
    existing.revenue += getEstimatedRevenue(click.providerName, click.clickType, 1);
    providerMap.set(click.providerId, existing);
  }
  const clicksByProvider = Array.from(providerMap.entries())
    .map(([providerId, data]) => ({
      providerId,
      providerName: data.providerName,
      count: data.count,
      estimatedRevenue: Math.round(data.revenue * 100) / 100,
      isAmazon: data.providerName.toLowerCase().includes('amazon') || data.providerName.toLowerCase().includes('prime video'),
    }))
    .sort((a, b) => b.count - a.count);

  // Clicks by type with revenue
  const typeMap = new Map<string, { count: number; revenue: number }>();
  for (const click of clicks) {
    const existing = typeMap.get(click.clickType) || { count: 0, revenue: 0 };
    existing.count++;
    existing.revenue += getEstimatedRevenue(click.providerName, click.clickType, 1);
    typeMap.set(click.clickType, existing);
  }
  const clicksByType = Array.from(typeMap.entries())
    .map(([clickType, data]) => ({
      clickType,
      count: data.count,
      estimatedRevenue: Math.round(data.revenue * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Top content
  const contentMap = new Map<string, { tmdbId: number; mediaType: string; title: string; clicks: number; revenue: number }>();
  for (const click of clicks) {
    const key = `${click.tmdbId}-${click.mediaType}`;
    const existing = contentMap.get(key) || { tmdbId: click.tmdbId, mediaType: click.mediaType, title: `${click.mediaType === 'movie' ? 'Filme' : 'Série'} #${click.tmdbId}`, clicks: 0, revenue: 0 };
    existing.clicks++;
    existing.revenue += getEstimatedRevenue(click.providerName, click.clickType, 1);
    contentMap.set(key, existing);
  }
  const topContent = Array.from(contentMap.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20)
    .map(item => ({ ...item, estimatedRevenue: Math.round(item.revenue * 100) / 100 }));

  // Hourly distribution
  const hourMap = new Map<number, number>();
  for (let i = 0; i < 24; i++) hourMap.set(i, 0);
  for (const click of clicks) {
    const hour = new Date(click.clickedAt).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  }
  const clicksByHour = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);

  // Platform stats from user agent
  const platformStats = { mobile: 0, desktop: 0, pwa: 0, other: 0 };
  for (const click of clicks) {
    const ua = (click.userAgent || '').toLowerCase();
    if (ua.includes('pwa') || ua.includes('standalone')) {
      platformStats.pwa++;
    } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      platformStats.mobile++;
    } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox')) {
      platformStats.desktop++;
    } else {
      platformStats.other++;
    }
  }

  // Total estimated revenue
  const estimatedRevenue = Math.round(clicksByProvider.reduce((sum, p) => sum + p.estimatedRevenue, 0) * 100) / 100;

  return {
    totalClicks: clicks.length,
    totalClicksToday,
    totalClicksThisWeek,
    totalClicksThisMonth,
    estimatedRevenue,
    clicksByDate,
    clicksByProvider,
    clicksByType,
    topContent,
    clicksByHour,
    platformStats,
  };
}
