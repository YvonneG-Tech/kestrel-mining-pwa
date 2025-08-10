const CACHE_NAME = 'kestrel-mining-v1.0.0';
const STATIC_CACHE_NAME = 'kestrel-static-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/workers',
  '/documents',
  '/scanner',
  '/manifest.json',
  // Add other static assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https?.*\/api\/workers/,
  /^https?.*\/api\/documents/,
  /^https?.*\/api\/scanner/,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Static files - cache first, then network
    if (isStaticFile(request.url)) {
      event.respondWith(cacheFirst(request));
    }
    // API calls - network first, then cache
    else if (isApiCall(request.url)) {
      event.respondWith(networkFirst(request));
    }
    // Other resources - network first
    else {
      event.respondWith(networkFirst(request));
    }
  }
  // POST/PUT/DELETE - network only with offline handling
  else {
    event.respondWith(handleMutatingRequest(request));
  }
});

// Cache first strategy - for static files
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy - for API calls
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add offline indicator header
      const response = cachedResponse.clone();
      response.headers.set('X-Served-By', 'sw-cache');
      return response;
    }
    
    // Return offline fallback
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This data is not available offline',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Served-By': 'sw-offline'
        }
      }
    );
  }
}

// Handle mutating requests (POST, PUT, DELETE)
async function handleMutatingRequest(request) {
  try {
    // Try network first
    return await fetch(request);
  } catch (error) {
    console.log('[SW] Mutating request failed - storing for sync:', error);
    
    // Store failed requests for background sync
    await storeFailedRequest(request);
    
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Request queued for when you\'re back online',
        queued: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 202, // Accepted
        headers: {
          'Content-Type': 'application/json',
          'X-Queued': 'true'
        }
      }
    );
  }
}

// Store failed requests for background sync
async function storeFailedRequest(request) {
  const data = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: await request.text(),
    timestamp: new Date().toISOString()
  };
  
  // Store in IndexedDB or localStorage for background sync
  try {
    const cache = await caches.open('failed-requests');
    await cache.put(`failed-${Date.now()}`, new Response(JSON.stringify(data)));
    console.log('[SW] Failed request stored for sync');
  } catch (error) {
    console.error('[SW] Failed to store request:', error);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-failed-requests') {
    event.waitUntil(syncFailedRequests());
  }
});

// Sync failed requests when back online
async function syncFailedRequests() {
  try {
    const cache = await caches.open('failed-requests');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const data = await response.json();
        
        // Recreate and retry the request
        const retryRequest = new Request(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body || undefined
        });
        
        const retryResponse = await fetch(retryRequest);
        
        if (retryResponse.ok) {
          await cache.delete(request);
          console.log('[SW] Successfully synced failed request');
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Kestrel Mining',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close', 
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Kestrel Mining', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Helper functions
function isStaticFile(url) {
  return STATIC_FILES.some(file => url.includes(file)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.svg') ||
         url.includes('.woff');
}

function isApiCall(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url)) ||
         url.includes('/api/');
}

// Periodic sync for data updates
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-documents') {
    event.waitUntil(updateDocumentsCache());
  }
});

async function updateDocumentsCache() {
  try {
    const response = await fetch('/api/documents');
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/api/documents', response);
      console.log('[SW] Documents cache updated');
    }
  } catch (error) {
    console.error('[SW] Failed to update documents cache:', error);
  }
}