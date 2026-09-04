import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const GITHUB_DL = 'https://github.com/redfireforge/redfireforge-public/releases/download'

/** Mirror Vercel `/dl/:tag/:file` so local `vite` / preview keep installer names. */
function namedDownloadRedirect(): Plugin {
  return {
    name: 'named-download-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/dl\/(v\d+\.\d+\.\d+(?:-lh)?)\/([A-Za-z0-9][A-Za-z0-9._-]*)/)
        if (!match) {
          next()
          return
        }
        res.statusCode = 302
        res.setHeader('Location', `${GITHUB_DL}/${match[1]}/${match[2]}`)
        res.end()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/dl\/(v\d+\.\d+\.\d+(?:-lh)?)\/([A-Za-z0-9][A-Za-z0-9._-]*)/)
        if (!match) {
          next()
          return
        }
        res.statusCode = 302
        res.setHeader('Location', `${GITHUB_DL}/${match[1]}/${match[2]}`)
        res.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), namedDownloadRedirect()],
})
