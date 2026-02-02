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
  CustomListItem
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
