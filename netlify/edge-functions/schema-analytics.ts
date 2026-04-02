const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect';
const FALLBACK_CLIENT_ID = 'asset_fetch.anonymous';
const MEASUREMENT_ID_ENV_NAME = 'HUGO_SERVICES_GOOGLEANALYTICS_ID';
const API_SECRET_ENV_NAMES = ['GA4_API_SECRET'];

export default async function schemaAnalytics(request: Request, context: any) {
  const response = await context.next();
  const normalizedResponse = ensureSchemaContentType(request, response);

  if (!shouldTrackSchemaFetch(request, normalizedResponse, context)) {
    return normalizedResponse;
  }

  const measurementId = Netlify.env.get(MEASUREMENT_ID_ENV_NAME)?.trim();
  const apiSecret = getEnvValue(API_SECRET_ENV_NAMES);

  if (!measurementId || !apiSecret) {
    return normalizedResponse;
  }

  const payload = buildPayload(request, normalizedResponse);
  context.waitUntil(
    sendGa4Event({
      apiSecret,
      measurementId,
      payload,
      requestId: context.requestId,
    }),
  );

  return normalizedResponse;
}

function buildPayload(request: Request, response: Response) {
  const requestUrl = new URL(request.url);
  const contentType = normalizeContentType(
    response.headers.get('content-type') ?? 'application/yaml',
  );

  return {
    client_id: resolveClientId(request),
    events: [
      {
        name: 'asset_fetch',
        params: {
          asset_ext: 'yaml',
          asset_group: 'schema',
          asset_path: requestUrl.pathname,
          content_type: contentType,
          status_code: String(response.status),
        },
      },
    ],
  };
}

// Netlify custom headers from netlify.toml do not reliably apply once an Edge
// Function handles the route, so preserve the schema YAML content type here.
function ensureSchemaContentType(request: Request, response: Response) {
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

function getEnvValue(names: string[]) {
  for (const name of names) {
    const value = Netlify.env.get(name)?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

function getProductionHost(context: any) {
  const siteUrl = context?.site?.url;

  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).hostname;
  } catch {
    return null;
  }
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

function normalizeContentType(contentTypeHeader: string | null) {
  if (!contentTypeHeader) {
    return 'none';
  }

  return contentTypeHeader.split(';', 1)[0].trim().toLowerCase();
}

function resolveClientId(request: Request) {
  const gaCookie = getCookieValue(request.headers.get('cookie'), '_ga');

  if (!gaCookie) {
    // Use a fixed fallback to avoid inflating GA user counts for non-browser
    // schema fetches while still allowing event ingestion.
    return FALLBACK_CLIENT_ID;
  }

  const match = /^GA\d+\.\d+\.(.+)$/.exec(gaCookie);

  return match?.[1] || gaCookie;
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const [cookieName, ...cookieValueParts] = part.trim().split('=');

    if (cookieName === name) {
      return cookieValueParts.join('=');
    }
  }

  return null;
}

async function sendGa4Event({
  apiSecret,
  measurementId,
  payload,
  requestId,
}: {
  apiSecret: string;
  measurementId: string;
  payload: Record<string, unknown>;
  requestId?: string;
}) {
  const endpoint = new URL(GA4_COLLECT_URL);
  endpoint.searchParams.set('api_secret', apiSecret);
  endpoint.searchParams.set('measurement_id', measurementId);

  try {
    const response = await fetch(endpoint, {
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      console.warn(
        `schema-analytics: GA4 event send failed with ${response.status}` +
          (requestId ? ` for request ${requestId}` : ''),
      );
    }
  } catch (error) {
    console.warn(
      `schema-analytics: GA4 event send threw` +
        (requestId ? ` for request ${requestId}` : ''),
      error,
    );
  }
}

function shouldTrackSchemaFetch(
  request: Request,
  response: Response,
  context: any,
) {
  if (request.method !== 'GET') {
    return false;
  }

  const requestUrl = new URL(request.url);

  if (!requestUrl.pathname.startsWith('/schemas/')) {
    return false;
  }

  const productionHost = getProductionHost(context);
  if (!productionHost || requestUrl.hostname !== productionHost) {
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
