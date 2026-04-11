import {
  type AssetFetchContext,
  enqueueAssetFetchEvent,
  normalizeContentType,
} from '../lib/ga4-asset-fetch.ts';

export default async function schemaAnalytics(
  request: Request,
  context: AssetFetchContext & { next: () => Promise<Response> },
) {
  const response = await context.next();
  const normalizedResponse = ensureSchemaContentType(request, response);

  if (!shouldTrackSchemaFetch(request, normalizedResponse)) {
    return normalizedResponse;
  }

  const requestUrl = new URL(request.url);
  const contentType = normalizeContentType(
    normalizedResponse.headers.get('content-type'),
  );

  enqueueAssetFetchEvent(request, context, {
    asset_path: requestUrl.pathname,
    content_type: contentType,
    status_code: String(normalizedResponse.status),
    event_emitter: 'schema',
  });

  return normalizedResponse;
}

// Netlify custom headers from netlify.toml do not reliably apply once an Edge
// Function handles the route, so preserve the schema YAML content type here.
export function ensureSchemaContentType(request: Request, response: Response) {
  const requestUrl = new URL(request.url);

  if (!requestUrl.pathname.startsWith('/schemas/')) {
    return response;
  }

  if (response.status < 200 || response.status >= 300) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('content-type', 'application/yaml');

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function isSchemaContentType(contentTypeHeader: string | null) {
  const contentType = normalizeContentType(contentTypeHeader);

  return (
    contentType === 'application/yaml' ||
    contentType === 'application/x-yaml' ||
    contentType === 'text/yaml' ||
    contentType === 'text/x-yaml'
  );
}

export function shouldTrackSchemaFetch(request: Request, response: Response) {
  if (request.method !== 'GET') {
    return false;
  }

  const requestUrl = new URL(request.url);

  if (!requestUrl.pathname.startsWith('/schemas/')) {
    return false;
  }

  if (response.status < 200 || response.status >= 400) {
    return false;
  }

  if (response.status >= 300) {
    return true;
  }

  const contentType = response.headers.get('content-type');

  return !contentType || isSchemaContentType(contentType);
}
