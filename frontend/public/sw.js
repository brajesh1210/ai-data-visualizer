self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).catch(async () => {
      const cachedResponse = await caches.match(e.request);
      if (cachedResponse) return cachedResponse;
      
      // Fallback response to prevent the TypeError crash
      return new Response('Network error or CORS block.', { 
        status: 503, 
        statusText: 'Service Unavailable' 
      });
    })
  );
});