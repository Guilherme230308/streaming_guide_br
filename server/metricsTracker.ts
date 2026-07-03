import { getDb } from "./db";
import { usageMetrics } from "../drizzle/schema";
import { sql } from "drizzle-orm";

type MetricType = "tmdb_api_call" | "tmdb_cache_hit" | "ai_usage" | "page_view" | "search_request";

// In-memory buffer to batch DB writes (reduces DB load)
const metricsBuffer: Map<string, number> = new Map();
let flushTimer: NodeJS.Timeout | null = null;

function getDateHour(): { date: string; hour: number } {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const hour = now.getUTCHours();
  return { date, hour };
}

function getBufferKey(date: string, hour: number, metricType: MetricType): string {
  return `${date}:${hour}:${metricType}`;
}

/**
 * Track a metric event. Buffers in memory and flushes to DB periodically.
 */
export function trackMetric(metricType: MetricType, count: number = 1) {
  const { date, hour } = getDateHour();
  const key = getBufferKey(date, hour, metricType);
  metricsBuffer.set(key, (metricsBuffer.get(key) || 0) + count);

  // Schedule flush if not already scheduled
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushMetrics();
      flushTimer = null;
    }, 30000); // Flush every 30 seconds
  }
}

/**
 * Flush buffered metrics to the database
 */
async function flushMetrics() {
  if (metricsBuffer.size === 0) return;

  const entries = Array.from(metricsBuffer.entries());
  metricsBuffer.clear();

  for (const [key, count] of entries) {
    const [date, hourStr, metricType] = key.split(":");
    const hour = parseInt(hourStr);

    try {
      // Use INSERT ... ON DUPLICATE KEY UPDATE to upsert
      const db = await getDb();
      if (!db) return;
      await db.execute(
        sql`INSERT INTO usage_metrics (\`date\`, hour, metricType, count)
            VALUES (${date}, ${hour}, ${metricType}, ${count})
            ON DUPLICATE KEY UPDATE count = count + ${count}, updatedAt = NOW()`
      );
    } catch (e) {
      // Re-buffer on failure
      const reKey = getBufferKey(date, hour, metricType as MetricType);
      metricsBuffer.set(reKey, (metricsBuffer.get(reKey) || 0) + count);
    }
  }
}

/**
 * Get metrics for a date range
 */
export async function getMetrics(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select()
    .from(usageMetrics)
    .where(
      sql`${usageMetrics.date} >= ${startDate} AND ${usageMetrics.date} <= ${endDate}`
    );
  return results;
}

/**
 * Get aggregated daily metrics for a date range
 */
export async function getDailyMetrics(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.execute(
    sql`SELECT date, metricType, SUM(count) as totalCount
        FROM usage_metrics
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY date, metricType
        ORDER BY date ASC`
  );
  return results;
}

/**
 * Get summary metrics for today
 */
export async function getTodayMetrics() {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().split("T")[0];
  const results = await db.execute(
    sql`SELECT metricType, SUM(count) as totalCount
        FROM usage_metrics
        WHERE date = ${today}
        GROUP BY metricType`
  );
  return results;
}

/**
 * Get cache hit rate for a date range
 */
export async function getCacheHitRate(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.execute(
    sql`SELECT 
          SUM(CASE WHEN metricType = 'tmdb_cache_hit' THEN count ELSE 0 END) as cacheHits,
          SUM(CASE WHEN metricType = 'tmdb_api_call' THEN count ELSE 0 END) as apiCalls
        FROM usage_metrics
        WHERE date >= ${startDate} AND date <= ${endDate}`
  );
  return results;
}

// Flush on process exit
process.on("beforeExit", flushMetrics);
process.on("SIGTERM", flushMetrics);
