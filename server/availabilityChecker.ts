import * as db from "./db";
import * as tmdb from "./tmdb";
import { notifyOwner } from "./_core/notification";
import webpush from "web-push";

// Configure VAPID keys for push notifications
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@ondeassistir.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send push notification to a user
 */
async function sendPushNotification(userId: number, payload: {
  title: string;
  body: string;
  icon?: string;
  data?: { url?: string; tmdbId?: number; mediaType?: string };
}): Promise<boolean> {
  try {
    const subscriptions = await db.getUserPushSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      console.log(`[PushNotification] No subscriptions found for user ${userId}`);
      return false;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: payload.data || {},
    });

    let sent = false;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notificationPayload
        );
        sent = true;
        console.log(`[PushNotification] Sent to user ${userId}`);
      } catch (error: any) {
        console.error(`[PushNotification] Error sending to user ${userId}:`, error.message);
        // Remove invalid subscriptions (410 = subscription expired)
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.deleteInvalidPushSubscription(sub.endpoint);
          console.log(`[PushNotification] Removed invalid subscription for user ${userId}`);
        }
      }
    }

    return sent;
  } catch (error) {
    console.error(`[PushNotification] Error:`, error);
    return false;
  }
}

/**
 * Background job to check for content availability changes
 * This should be called periodically (e.g., every 6-12 hours)
 */
export async function checkAvailabilityChanges(): Promise<{
  checked: number;
  notified: number;
  pushSent: number;
  errors: number;
}> {
  console.log("[AvailabilityChecker] Starting availability check...");
  
  let checked = 0;
  let notified = 0;
  let pushSent = 0;
  let errors = 0;

  try {
    // Get all active, non-notified alerts
    const alerts = await db.getAllActiveAlerts();
    console.log(`[AvailabilityChecker] Found ${alerts.length} active alerts to check`);

    for (const alert of alerts) {
      checked++;
      
      try {
        // Get current providers for this content
        const providersResponse = alert.mediaType === 'movie'
          ? await tmdb.getMovieWatchProviders(alert.tmdbId)
          : await tmdb.getTVShowWatchProviders(alert.tmdbId);
        
        if (!providersResponse) {
          continue; // No providers available yet
        }
        
        const providers = providersResponse;

        const availableProviders = [
          ...(providers.flatrate || []),
          ...(providers.rent || []),
          ...(providers.buy || [])
        ];

        // Check if content is now available
        let isAvailable = false;
        let matchedProvider = null;

        if (alert.providerId) {
          // Check for specific provider
          matchedProvider = availableProviders.find(p => p.provider_id === alert.providerId);
          isAvailable = !!matchedProvider;
        } else {
          // Check if available on any provider
          isAvailable = availableProviders.length > 0;
          matchedProvider = availableProviders[0];
        }

        if (isAvailable && matchedProvider) {
          // Get user's subscriptions to check if it's on their services
          const userSubscriptions = await db.getUserSubscriptions(alert.userId);
          const userProviderIds = userSubscriptions.map(s => s.providerId);
          
          const isOnUserService = userProviderIds.includes(matchedProvider.provider_id);
          
          // Notify user
          const message = isOnUserService
            ? `"${alert.title}" agora está disponível no ${matchedProvider.provider_name} (um dos seus streamings)!`
            : `"${alert.title}" agora está disponível no ${matchedProvider.provider_name}!`;

          // Mark alert as notified
          await db.markAlertAsNotified(alert.id);
          
          // Send push notification to user
          const pushResult = await sendPushNotification(alert.userId, {
            title: "🎬 Novo conteúdo disponível!",
            body: message,
            data: {
              url: `/${alert.mediaType === 'movie' ? 'movie' : 'tv'}/${alert.tmdbId}`,
              tmdbId: alert.tmdbId,
              mediaType: alert.mediaType,
            },
          });
          
          if (pushResult) {
            pushSent++;
          }
          
          // Also send notification to project owner (as backup)
          await notifyOwner({
            title: "Novo conteúdo disponível!",
            content: message
          });

          notified++;
          console.log(`[AvailabilityChecker] Notified user ${alert.userId}: ${message}`);
        }
      } catch (error) {
        errors++;
        console.error(`[AvailabilityChecker] Error checking alert ${alert.id}:`, error);
      }
    }

    console.log(`[AvailabilityChecker] Check complete. Checked: ${checked}, Notified: ${notified}, Push sent: ${pushSent}, Errors: ${errors}`);
    
    return { checked, notified, pushSent, errors };
  } catch (error) {
    console.error("[AvailabilityChecker] Fatal error:", error);
    throw error;
  }
}

/**
 * Check availability for a specific alert
 */
export async function checkSingleAlert(alertId: number): Promise<boolean> {
  const alert = await db.getAlertById(alertId);
  
  if (!alert || !alert.isActive || alert.notified) {
    return false;
  }

  try {
    const providersResponse = alert.mediaType === 'movie'
      ? await tmdb.getMovieWatchProviders(alert.tmdbId)
      : await tmdb.getTVShowWatchProviders(alert.tmdbId);
    
    if (!providersResponse) {
      return false;
    }

    const availableProviders = [
      ...(providersResponse.flatrate || []),
      ...(providersResponse.rent || []),
      ...(providersResponse.buy || [])
    ];

    let isAvailable = false;

    if (alert.providerId) {
      isAvailable = availableProviders.some(p => p.provider_id === alert.providerId);
    } else {
      isAvailable = availableProviders.length > 0;
    }

    return isAvailable;
  } catch (error) {
    console.error(`[AvailabilityChecker] Error checking single alert ${alertId}:`, error);
    return false;
  }
}
