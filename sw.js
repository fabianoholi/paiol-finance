const CACHE_NAME = 'paiol-finance-v3'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/prop-types@15/prop-types.min.js',
  'https://unpkg.com/recharts@2.12.7/umd/Recharts.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  // Google Apps Script: network-first (sync precisa de dados frescos)
  if (url.hostname.includes('script.google.com')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(JSON.stringify({ ok: false }), {
        headers: { 'Content-Type': 'application/json' }
      }))
    )
    return
  }
  // Tudo mais: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(response => {
        if (response.ok && e.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone))
        }
        return response
      })
    }).catch(() => caches.match('/index.html'))
  )
})
