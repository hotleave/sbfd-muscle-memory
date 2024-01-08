"use strict"

const LOCAL_URLS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/font/fontello.eot',
  '/font/fontello.svg',
  '/font/fontello.ttf',
  '/font/fontello.woff',
  '/font/fontello.woff2',
  '/scripts/main.js',
  '/scripts/sm.js',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/favicon.ico'
]
const REMOTE_URLS = [
]
const VERSION = "1.0.0"

self.addEventListener("install", (event) => {
  console.log('Installing...')
  event.waitUntil(new Promise(async (resolve) => {
    let cache = await caches.open(VERSION)
    let requests = LOCAL_URLS.map(url => new Request(url, { cache: "no-cache" }))
    await cache.addAll(requests)

    for (let url of REMOTE_URLS) {
      let request = new Request(url, { mode: "no-cors" })
      let response = await fetch(request)
      await cache.put(request, response)
    }

    resolve()
  }))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(new Promise(async (resolve) => {
    let keys = await caches.keys()

    for (let key of keys) {
      if (key !== VERSION) {
        // Delete old cached version of the app
        await caches.delete(key)
      }
    }

    resolve()
  }))
})

self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith(`${location.origin}/`)) {
    event.respondWith(
      caches.match(`${location.origin}`).then((response) => {
        return response || fetch(`${location.origin}`)
      })
    )
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
      })
    )
  }
})
