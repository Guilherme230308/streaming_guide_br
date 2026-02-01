import { eq, and, desc } from "drizzle-orm";
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
  CachedProvider
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

export async function markAlertAsNotified(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alerts)
    .set({ notified: true, notifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(alerts.id, alertId));
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
