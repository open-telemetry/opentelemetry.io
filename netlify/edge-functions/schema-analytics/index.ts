import {
  buildAssetFetchGaInfoHeaderValue,
  hasAssetFetchConfig,
  type AssetFetchContext,
  enqueueAssetFetchEvent,
  normalizeContentType,
  withAssetFetchGaInfoHeader,
} from '../lib/ga4-mp.ts';

export default async function schemaAnalytics(
  request: Request,
  context: AssetFetchContext & { next: () => Promise<Response> },
) {
  const response = await context.next();
  const normalizedResponse = ensureSchemaContentType(request, response);
  const requestUrl = new URL(request.url);
  const trackable = shouldTrackSchemaFetch(request, normalizedResponse);
  const gaInfoValue = buildAssetFetchGaInfoHeaderValue({
    assetPath: trackable ? requestUrl.pathname : undefined,
    configPresent: hasAssetFetchConfig(),
    noneReason: trackable
      ? undefined
      : getSchemaGaInfoNoneReason(request, normalizedResponse),
    gaEventCandidate: trackable,
  });
  const responseWithGaInfo = withAssetFetchGaInfoHeader(
    normalizedResponse,
    gaInfoValue,
  );

  if (!trackable) {
    return responseWithGaInfo;
  }

  const contentType = normalizeContentType(
    responseWithGaInfo.headers.get('content-type'),
  );

  enqueueAssetFetchEvent(request, context, {
    asset_path: requestUrl.pathname,
    content_type: contentType,
    status_code: String(responseWithGaInfo.status),
    event_emitter: 'schema',
  });

  return responseWithGaInfo;
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

function getSchemaGaInfoNoneReason(
  request: Request,
  response: Response,
): string | undefined {
  if (request.method !== 'GET') {
    return `request method ${request.method} is not currently tracked`;
  }

  const requestUrl = new URL(request.url);
  if (!requestUrl.pathname.startsWith('/schemas/')) {
    return 'request path does not match a tracked route';
  }

  if (!shouldTrackSchemaFetch(request, response)) {
    return 'response does not meet route-specific gating';
  }

  return undefined;
}
