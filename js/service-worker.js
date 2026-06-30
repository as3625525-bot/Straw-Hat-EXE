/**
 * Service Worker - Fixed for GitHub Pages
 * Works whether the site is at root (username.github.io)
 * or a subdirectory (username.github.io/repo-name/)
 */

const CACHE_NAME = 'progress-pro-v4';

// FIX: Use self.location to build absolute URLs that work in any subdirectory
const BASE = self.location.pathname.replace(/\/service-worker\.js$/, '');

const FILES_TO_CACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/category.html',
  BASE + '/css/base.css',
  BASE + '/css/components.css',
  BASE + '/css/animations.css',
  BASE + '/css/pages.css',
  BASE + '/js/store.js',
  BASE + '/js/utils.js',
  BASE + '/js/toast.js',
  BASE + '/js/animations.js',
  BASE + '/js/home.js',
  BASE + '/js/category.js',
  BASE + '/manifest.json'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('SW install cache error:', err))
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch - cache first, network fallback
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(networkResponse => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback to index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + '/index.html');
        }
      })
  );
});
