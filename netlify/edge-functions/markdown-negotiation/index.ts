/**
 * Feature docs:
 * https://opentelemetry.io/site/features/#agent-friendly-content-delivery
 *
 * Serve Hugo's Markdown alternate output (`.../index.md`) when the client
 * explicitly accepts `text/markdown` and does not prefer HTML more strongly.
 *
 * Strategy: treat slash and extensionless paths as pages; only `.../index.html`
 * maps to sibling `index.md`. Other `.html` paths skip negotiation so Netlify
 * redirects (e.g. `/docs.html` → `/docs/`) still run.
 *
 * We fetch the prebuilt Markdown artifact directly instead of rewriting
 * blindly. That lets us fall back to the normal HTML route when a page has no
 * Markdown output.
 *
 * GA4 `asset_fetch` events are issued as described in
 * projects/2026/asset-fetch-analytics.plan.md.
 */

import {
  type AssetFetchEventParams,
  enqueueAssetFetchEvent,
  normalizeContentType,
} from '../lib/ga4-asset-fetch.ts';

const HTML_TYPES = new Set(['text/html', 'application/xhtml+xml']);

export default async function markdownNegotiation(
  request: Request,
  context: {
    next: () => Promise<Response>;
    waitUntil?: (promise: Promise<unknown>) => void;
    requestId?: string;
  },
) {
  const url = new URL(request.url);

  if (!shouldConsiderRequest(request.method, url.pathname)) {
    return context.next();
  }

  const acceptHeader = request.headers.get('accept');
  if (!acceptHeader || !prefersMarkdownOverHtml(acceptHeader)) {
    return context.next();
  }

  const markdownResponse = await fetchMarkdownVariant(
    resolveMarkdownUrl(url),
    request.method,
  );

  if (!isSuccessfulMarkdownResponse(markdownResponse)) {
    return withVaryAccept(await context.next());
  }

  const headers = new Headers(markdownResponse.headers);
  headers.set('content-type', 'text/markdown; charset=utf-8');
  setVaryAccept(headers);

  // GA4 asset_fetch: only for GET 2xx. Non-2xx falls back to HTML, tracked by
  // client-side page_view. content_type is read from the response headers above.
  if (request.method === 'GET') {
    const assetPath = resolveMarkdownPath(url.pathname);
    const eventParams: AssetFetchEventParams = {
      asset_group: 'markdown',
      asset_path: assetPath,
      asset_ext: 'md',
      content_type: normalizeContentType(headers.get('content-type') ?? ''),
      status_code: String(markdownResponse.status),
      ...(url.pathname !== assetPath ? { original_path: url.pathname } : {}),
    };
    enqueueAssetFetchEvent(request, context, eventParams);
  }

  if (request.method === 'HEAD') {
    if (markdownResponse.body) {
      void markdownResponse.body.cancel();
    }

    return new Response(null, {
      headers,
      status: markdownResponse.status,
      statusText: markdownResponse.statusText,
    });
  }

  return new Response(markdownResponse.body, {
    headers,
    status: markdownResponse.status,
    statusText: markdownResponse.statusText,
  });
}

export function shouldConsiderRequest(
  method: string,
  pathname: string,
): boolean {
  if (method !== 'GET' && method !== 'HEAD') {
    return false;
  }

  if (pathname.endsWith('.md') || pathname.startsWith('/.')) {
    return false;
  }

  if (pathname.endsWith('/')) {
    return true;
  }

  const extension = getPathExtension(pathname);
  if (!extension) {
    return true;
  }

  return isIndexHtmlPath(pathname);
}

export function resolveMarkdownPath(pathname: string): string {
  if (isIndexHtmlPath(pathname)) {
    return pathname.replace(/index\.html$/, 'index.md');
  }

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/') {
    return '/index.md';
  }

  return `${normalizedPath}/index.md`;
}

function getPathExtension(pathname: string): string {
  const lastSegment = pathname.split('/').pop() ?? '';
  const match = /\.([^.]+)$/.exec(lastSegment);

  return match ? `.${match[1].toLowerCase()}` : '';
}

function isIndexHtmlPath(pathname: string): boolean {
  return pathname.endsWith('/index.html');
}

function resolveMarkdownUrl(url: URL): URL {
  return new URL(resolveMarkdownPath(url.pathname), url);
}

async function fetchMarkdownVariant(
  markdownUrl: URL,
  originalMethod: string,
): Promise<Response> {
  const requestInit = {
    headers: { accept: 'text/markdown' },
  };

  if (originalMethod === 'HEAD') {
    let response = await fetch(
      new Request(markdownUrl.toString(), { ...requestInit, method: 'HEAD' }),
    );

    if (response.status === 405 || response.status === 501) {
      // Defensive fallback: some responders support GET but not HEAD.
      response = await fetch(
        new Request(markdownUrl.toString(), { ...requestInit, method: 'GET' }),
      );
    }

    return response;
  }

  return fetch(
    new Request(markdownUrl.toString(), { ...requestInit, method: 'GET' }),
  );
}

function isSuccessfulMarkdownResponse(response: Response): boolean {
  return response.status >= 200 && response.status < 300;
}

export function prefersMarkdownOverHtml(acceptHeader: string): boolean {
  let markdownQuality = 0;
  let htmlQuality = 0;

  for (const { mediaType, q } of parseAccept(acceptHeader)) {
    // Note: wildcards are ignored by design.
    if (mediaType === 'text/markdown') {
      markdownQuality = Math.max(markdownQuality, q);
    } else if (HTML_TYPES.has(mediaType)) {
      htmlQuality = Math.max(htmlQuality, q);
    }
  }

  if (markdownQuality <= 0) {
    return false;
  }

  return markdownQuality >= htmlQuality;
}

function parseAccept(acceptHeader: string): { mediaType: string; q: number }[] {
  const mediaRanges: { mediaType: string; q: number }[] = [];

  for (const part of acceptHeader.split(',')) {
    const segments = part
      .trim()
      .split(';')
      .map((segment) => segment.trim());
    const rawMediaType = segments[0];

    if (!rawMediaType) {
      continue;
    }

    let q = 1;
    for (let i = 1; i < segments.length; i++) {
      const [key, ...valueParts] = segments[i].split('=').map((s) => s.trim());
      if (key !== 'q') {
        continue;
      }

      const parsed = Number.parseFloat(valueParts.join('='));
      if (!Number.isNaN(parsed)) {
        q = Math.min(1, Math.max(0, parsed));
      }
    }

    mediaRanges.push({ mediaType: rawMediaType.toLowerCase(), q });
  }

  return mediaRanges;
}

/**
 * Fallback HTML responses also need `Vary: Accept`:
 *
 * - clone the fallback response headers
 * - ensure `Accept` is present in `Vary`
 * - return the response unchanged otherwise
 */
function withVaryAccept(response: Response): Response {
  const headers = new Headers(response.headers);
  setVaryAccept(headers);

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function setVaryAccept(headers: Headers): void {
  const existing = headers.get('vary');
  if (!existing) {
    headers.set('vary', 'Accept');
    return;
  }

  const values = existing.split(',').map((value) => value.trim().toLowerCase());
  if (!values.includes('accept')) {
    headers.set('vary', `${existing}, Accept`);
  }
}
