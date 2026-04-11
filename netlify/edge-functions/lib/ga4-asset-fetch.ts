/**
 * GA4 Measurement Protocol helpers for `asset_fetch` events.
 * Event shape matches projects/2026/asset-fetch-analytics.plan.md.
 *
 * cSpell:ignore GOOGLEANALYTICS
 */

const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect';
const FALLBACK_CLIENT_ID = 'asset_fetch.anonymous';
const MEASUREMENT_ID_ENV_NAME = 'HUGO_SERVICES_GOOGLEANALYTICS_ID';
const API_SECRET_ENV_NAMES = ['GA4_API_SECRET'];
export const ASSET_FETCH_GA_INFO_HEADER = 'x-asset-fetch-ga-info';
export const INTERNAL_ASSET_FETCH_GA_INFO_VALUE = 'pending';

let warnedNoNetlify = false;

function netlifyEnvGet(name: string): string | undefined {
  const g = globalThis as unknown as {
    Netlify?: { env: { get: (name: string) => string | undefined } };
  };

  if (!g.Netlify) {
    if (!warnedNoNetlify) {
      warnedNoNetlify = true;
      console.warn(
        'ga4-asset-fetch: Netlify runtime not available; GA4 events will not be sent',
      );
    }
    return undefined;
  }

  return g.Netlify.env.get(name);
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

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
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

export function isInternalAssetFetchRequest(request: Request): boolean {
  return request.headers.has(ASSET_FETCH_GA_INFO_HEADER);
}

/** `asset_group` values from the analytics plan. */
export type AssetFetchEventGroup = 'schema' | 'markdown' | 'other';

/**
 * GA4 `asset_fetch` event parameters (custom dimensions). Required fields match
 * the plan; optional fields are omitted from the payload when unset.
 */
export type AssetFetchEventParams = {
  asset_group: AssetFetchEventGroup;
  asset_path: string;
  asset_ext: string;
  content_type: string;
  status_code: string;
  original_path?: string;
  referrer_host?: string;
  ua_category?: string;
};

function compactStringParams(
  eventParams: AssetFetchEventParams,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(eventParams).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
}

/**
 * Queues a GA4 `asset_fetch` event. No-ops when credentials or `waitUntil` are
 * missing (e.g. local tests without Netlify globals).
 */
export function enqueueAssetFetchEvent(
  request: Request,
  context: AssetFetchContext,
  eventParams: AssetFetchEventParams,
): void {
  const measurementId = netlifyEnvGet(MEASUREMENT_ID_ENV_NAME)?.trim();
  const apiSecret = getEnvValue(API_SECRET_ENV_NAMES);

  if (!measurementId || !apiSecret || !context.waitUntil) {
    return;
  }

  const params = compactStringParams(eventParams);

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
