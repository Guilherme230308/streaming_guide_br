// Service Worker for Push Notifications
// This file handles push events and displays notifications

self.addEventListener('push', function(event) {
  console.log('[SW Push] Push event received');
  
  let data = {
    title: 'Onde Assistir',
    body: 'Você tem uma nova notificação!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {}
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error('[SW Push] Error parsing push data:', e);
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW Push] Notification clicked');
  
  event.notification.close();
  
  const data = event.notification.data || {};
  let url = '/';
  
  // Navigate to specific content if provided
  if (data.tmdbId && data.mediaType) {
    url = `/${data.mediaType}/${data.tmdbId}`;
  } else if (data.url) {
    url = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[SW Push] Notification closed');
});
