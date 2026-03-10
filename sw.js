// ============================================================
// sw.js — Service Worker. Стратегия: Cache First → Network
// ============================================================

const CACHE_NAME = 'mova-v9';
const AUDIO_CACHE = 'mova-audio-v1';

// Файлы для кэширования при установке (статика)
const STATIC_ASSETS = [
    '/mova/',
    '/mova/index.html',
    '/mova/css/style.css',
    '/mova/js/app.js',
    '/mova/js/pages.js',
    '/mova/js/progress.js',
    '/mova/js/audio.js',
    '/mova/js/exercises.js',
    '/mova/js/dictionary.js',
    '/mova/js/repetition.js',
    '/mova/js/notifications.js',
    '/mova/manifest.json',
    '/mova/favicon.svg',
    '/mova/data/alphabet.json',
    '/mova/data/phrasebook.json',
];

// ---------- Install: кэшируем статику ----------

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ---------- Activate: удаляем старые кэши ----------

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== AUDIO_CACHE)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// ---------- Fetch ----------

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);

    // --- Аудио файлы: Lazy Cache (кэшируем при первом воспроизведении) ---
    if (url.pathname.includes('/audio/')) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(AUDIO_CACHE).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 404 }));
            })
        );
        return;
    }

    // --- Уроки (JSON): Network First — берём свежее, при ошибке — кэш ---
    if (url.pathname.match(/\/data\/lesson-\d+\.json$/)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // --- Остальное: Cache First ---
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;

                return fetch(event.request)
                    .then(response => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => {
                        if (event.request.destination === 'document') {
                            return caches.match('/mova/index.html');
                        }
                        return new Response('', { status: 503 });
                    });
            })
    );
});
