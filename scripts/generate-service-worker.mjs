import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const DIST_DIRECTORY = 'dist'
const PUBLIC_AUDIO_DIRECTORY = 'public/audio'
const ASSETS_DIRECTORY = join(DIST_DIRECTORY, 'assets')
const SERVICE_WORKER_PATH = join(DIST_DIRECTORY, 'sw.js')
const CACHE_NAME = 'mario-runner-v1'

const getAssetUrls = async () => {
  const assetFiles = await readdir(ASSETS_DIRECTORY)

  return assetFiles
    .filter((file) => file.endsWith('.js') || file.endsWith('.css'))
    .map((file) => `/assets/${file}`)
}

const getAudioUrls = async () => {
  const audioFiles = await readdir(PUBLIC_AUDIO_DIRECTORY, {
    recursive: true,
    withFileTypes: true,
  })

  return audioFiles
    .filter((file) => file.isFile())
    .map((file) => {
      const relativePath = relative(
        PUBLIC_AUDIO_DIRECTORY,
        join(file.parentPath, file.name),
      )

      return `/audio/${relativePath.split(sep).join('/')}`
    })
}

const generateServiceWorker = async () => {
  const assetUrls = await getAssetUrls()
  const audioUrls = await getAudioUrls()
  const urls = ['/index.html', ...assetUrls, ...audioUrls]

  const precacheUrls = urls.map((url) => `  '${url}'`).join(',\n')

  const serviceWorker = `const CACHE_NAME = '${CACHE_NAME}'
const PRECACHE_URLS = [
${precacheUrls},
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
})

self.addEventListener('activate', () => {
  // A limpeza de caches será implementada na Task 12.5.
})
`

  await writeFile(SERVICE_WORKER_PATH, serviceWorker, 'utf8')
}

const indexHtml = await readFile(join(DIST_DIRECTORY, 'index.html'), 'utf8')

if (!indexHtml.includes('/assets/')) {
  throw new Error('The generated index.html does not reference Vite assets.')
}

await generateServiceWorker()
