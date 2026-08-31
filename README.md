# redfireforge.com

Marketing / download site for [RedfireForge](https://github.com/redfireforge/redfire-forge).

## Phase 3 scope

- `/download` — OS-aware desktop download page (GitHub Releases API)
- `/` → redirects to `/download` until the Phase 4 landing page ships

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173/download

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

1. Create a Vercel project from this repo (`redfireforge/redfireforge.com`)
2. Add custom domain `redfireforge.com`
3. Update DNS at the registrar to Vercel’s records
4. Confirm: `curl -I https://redfireforge.com/download`

`vercel.json` already redirects `/` → `/download` and SPA-rewrites to `index.html`.

## Notes

- Only **official stable** Standard releases are shown (never alpha/beta/rc or Learning Hub)
- Checksums load from `SHA256SUMS.txt` on the release when present
- Requires a **published** (non-draft) GitHub release with assets to show download buttons
