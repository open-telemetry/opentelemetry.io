/**
 * Shared GA4 Measurement Protocol helpers for `asset_fetch` events.
 * Event shape matches projects/2026/asset-fetch-analytics.plan.md.
 */

const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect';
const FALLBACK_CLIENT_ID = 'asset_fetch.anonymous';
const MEASUREMENT_ID_ENV_NAME = 'HUGO_SERVICES_GOOGLEANALYTICS_ID';
const API_SECRET_ENV_NAMES = ['GA4_API_SECRET'];

function netlifyEnvGet(name: string): string | undefined {
  const g = globalThis as unknown as {
    Netlify?: { env: { get: (name: string) => string | undefined } };
  };

  return g.Netlify?.env.get(name);
}

export function getEnvValue(names: string[]): string | null {
  for (const name of names) {
    const value = netlifyEnvGet(name)?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export function normalizeContentType(contentTypeHeader: string | null): string {
  if (!contentTypeHeader) {
    return 'none';
  }

  return contentTypeHeader.split(';', 1)[0].trim().toLowerCase();
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
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

export function resolveClientId(request: Request): string {
  const gaCookie = getCookieValue(request.headers.get('cookie'), '_ga');

  if (!gaCookie) {
    return FALLBACK_CLIENT_ID;
  }

  const match = /^GA\d+\.\d+\.(.+)$/.exec(gaCookie);

  return match?.[1] || gaCookie;
}

export type AssetFetchContext = {
  waitUntil?: (promise: Promise<unknown>) => void;
  requestId?: string;
};

/**
 * Queues a GA4 `asset_fetch` event. No-ops when credentials or `waitUntil` are
 * missing (e.g. local tests without Netlify globals).
 */
export function enqueueAssetFetchEvent(
  request: Request,
  context: AssetFetchContext,
  eventParams: Record<string, string | undefined>,
): void {
  const measurementId = netlifyEnvGet(MEASUREMENT_ID_ENV_NAME)?.trim();
  const apiSecret = getEnvValue(API_SECRET_ENV_NAMES);

  if (!measurementId || !apiSecret || !context.waitUntil) {
    return;
  }

  const params = Object.fromEntries(
    Object.entries(eventParams).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;

  const payload = {
    client_id: resolveClientId(request),
    events: [
      {
        name: 'asset_fetch',
        params,
      },
    ],
  };

  context.waitUntil(
    sendGa4AssetFetchPayload({
      apiSecret,
      measurementId,
      payload,
      requestId: context.requestId,
    }),
  );
}

async function sendGa4AssetFetchPayload({
  apiSecret,
  measurementId,
  payload,
  requestId,
}: {
  apiSecret: string;
  measurementId: string;
  payload: Record<string, unknown>;
  requestId?: string;
}): Promise<void> {
  const endpoint = new URL(GA4_COLLECT_URL);
  endpoint.searchParams.set('api_secret', apiSecret);
  endpoint.searchParams.set('measurement_id', measurementId);

  try {
    // GA4 /mp/collect returns 2xx when the HTTP request is received, even if
    // the payload is malformed or the event is not processed. Use the GA4
    // validation server (/debug/mp/collect) during bring-up if payload
    // validation is needed:
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events
    const response = await fetch(endpoint, {
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      console.warn(
        `ga4-asset-fetch: GA4 event send failed with ${response.status}` +
          (requestId ? ` for request ${requestId}` : ''),
      );
    }
  } catch (error) {
    console.warn(
      `ga4-asset-fetch: GA4 event send threw` +
        (requestId ? ` for request ${requestId}` : ''),
      error,
    );
  }
}
