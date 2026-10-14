import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const DIST_DIRECTORY = 'dist'
const PUBLIC_AUDIO_DIRECTORY = 'public/audio'
const PUBLIC_SPRITES_DIRECTORY = 'public/sprites'
const ASSETS_DIRECTORY = join(DIST_DIRECTORY, 'assets')
const SERVICE_WORKER_PATH = join(DIST_DIRECTORY, 'sw.js')
const CACHE_VERSION = 'v3'
const CACHE_NAME = `mario-runner-${CACHE_VERSION}`
const OFFLINE_NAVIGATION_URL = '/index.html'
const STATIC_RESOURCE_PREFIXES = ['/assets/', '/audio/', '/sprites/']

const getAssetUrls = async () => {
  const assetFiles = await readdir(ASSETS_DIRECTORY)

  return assetFiles
    .filter((file) => file.endsWith('.js') || file.endsWith('.css'))
    .map((file) => `/assets/${file}`)
}

const getPublicResourceUrls = async (directory, urlPrefix) => {
  const files = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  })

  return files
    .filter((file) => file.isFile())
    .map((file) => {
      const relativePath = relative(directory, join(file.parentPath, file.name))

      return `${urlPrefix}/${relativePath.split(sep).join('/')}`
    })
}

const generateServiceWorker = async () => {
  const assetUrls = await getAssetUrls()
  const audioUrls = await getPublicResourceUrls(
    PUBLIC_AUDIO_DIRECTORY,
    '/audio',
  )
  const spriteUrls = await getPublicResourceUrls(
    PUBLIC_SPRITES_DIRECTORY,
    '/sprites',
  )

  const urls = ['/index.html', ...assetUrls, ...audioUrls, ...spriteUrls]

  const precacheUrls = urls.map((url) => `  '${url}'`).join(',\n')

  const serviceWorker = `const CACHE_NAME = '${CACHE_NAME}'
const OFFLINE_NAVIGATION_URL = '${OFFLINE_NAVIGATION_URL}'
const STATIC_RESOURCE_PREFIXES = ${JSON.stringify(STATIC_RESOURCE_PREFIXES)}
const PRECACHE_URLS = [
${precacheUrls},
]

const createOfflineResponse = () =>
  new Response('Recurso indisponível offline.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })

const getOfflineNavigationResponse = async () => {
  const cachedResponse = await caches.match(OFFLINE_NAVIGATION_URL)

  return cachedResponse ?? createOfflineResponse()
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => getOfflineNavigationResponse()),
    )

    return
  }

  const requestUrl = new URL(event.request.url)

  if (
    requestUrl.origin !== self.location.origin ||
    !STATIC_RESOURCE_PREFIXES.some((prefix) =>
      requestUrl.pathname.startsWith(prefix),
    )
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request, { ignoreVary: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).catch(() => createOfflineResponse())
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith('mario-runner-') &&
                cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})
`

  await writeFile(SERVICE_WORKER_PATH, serviceWorker, 'utf8')
}

const indexHtml = await readFile(join(DIST_DIRECTORY, 'index.html'), 'utf8')

if (!indexHtml.includes('/assets/')) {
  throw new Error('The generated index.html does not reference Vite assets.')
}

await generateServiceWorker()
