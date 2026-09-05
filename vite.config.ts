import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  contentDispositionAttachment,
  githubReleaseAssetUrl,
  parseNamedDownloadPath,
} from './src/utils/namedDownload.ts'

/** Mirror Vercel `/api/dl` so local `vite` / preview keep installer names. */
function namedDownloadProxy(): Plugin {
  async function handle(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    const parsed = parseNamedDownloadPath(req.url ?? '')
    if (!parsed) {
      next()
      return
    }
    try {
      const upstream = await fetch(githubReleaseAssetUrl(parsed.tag, parsed.file), {
        redirect: 'follow',
        headers: {
          Accept: 'application/octet-stream',
          'User-Agent': 'RedfireForge-website',
        },
      })
      res.statusCode = upstream.status
      res.setHeader('Content-Disposition', contentDispositionAttachment(parsed.file))
      const type = upstream.headers.get('content-type')
      if (type) res.setHeader('Content-Type', type)
      const length = upstream.headers.get('content-length')
      if (length) res.setHeader('Content-Length', length)
      if (!upstream.body) {
        res.end()
        return
      }
      Readable.fromWeb(upstream.body as import('node:stream/web').ReadableStream).pipe(res)
    } catch {
      res.statusCode = 502
      res.end('Download proxy failed')
    }
  }

  return {
    name: 'named-download-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), namedDownloadProxy()],
})
