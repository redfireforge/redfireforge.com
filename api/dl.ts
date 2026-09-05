import {
  contentDispositionAttachment,
  githubReleaseAssetUrl,
  SAFE_ASSET_NAME,
  SAFE_RELEASE_TAG,
} from '../src/utils/namedDownload';

export const config = { runtime: 'edge' };

/**
 * Proxy GitHub release assets so the browser keeps `/dl/vX.Y.Z/RealName.dmg`
 * instead of Chrome saving GitHub's `release-assets.githubusercontent.com/<uuid>`.
 */
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const tag = url.searchParams.get('tag') ?? '';
  const file = url.searchParams.get('file') ?? '';

  if (!SAFE_RELEASE_TAG.test(tag) || !SAFE_ASSET_NAME.test(file)) {
    return new Response('Invalid download path', { status: 400 });
  }

  const upstream = await fetch(githubReleaseAssetUrl(tag, file), {
    redirect: 'follow',
    headers: {
      Accept: 'application/octet-stream',
      'User-Agent': 'RedfireForge-website',
    },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Installer not found', { status: upstream.status === 404 ? 404 : 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') ?? 'application/octet-stream');
  const length = upstream.headers.get('Content-Length');
  if (length) headers.set('Content-Length', length);
  headers.set('Content-Disposition', contentDispositionAttachment(file));
  headers.set('Cache-Control', 'public, max-age=300');

  return new Response(upstream.body, { status: 200, headers });
}
