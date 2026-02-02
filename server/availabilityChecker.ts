import * as db from "./db";
import * as tmdb from "./tmdb";
import { notifyOwner } from "./_core/notification";

/**
 * Background job to check for content availability changes
 * This should be called periodically (e.g., every 6-12 hours)
 */
export async function checkAvailabilityChanges(): Promise<{
  checked: number;
  notified: number;
  errors: number;
}> {
  console.log("[AvailabilityChecker] Starting availability check...");
  
  let checked = 0;
  let notified = 0;
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
          
          // Send notification to project owner (user will see in Manus notifications)
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

    console.log(`[AvailabilityChecker] Check complete. Checked: ${checked}, Notified: ${notified}, Errors: ${errors}`);
    
    return { checked, notified, errors };
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
