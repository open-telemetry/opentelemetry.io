/**
 * Old registry component (per-entry) URLs: probe the path; on 4xx, emit a GA4
 * `page_view` (Measurement Protocol) for the missed URL, then redirect to the
 * registry index.
 *
 * Note: MP `page_view` here is intentionally minimal vs browser `gtag` (see
 * `enqueueGa4PageViewEvent` JSDoc in `lib/ga4-asset-fetch.ts`).
 *
 * cSpell:ignore subresponse
 */

import {
  type AssetFetchContext,
  enqueueGa4PageViewEvent,
} from '../lib/ga4-asset-fetch.ts';

export const REGISTRY_COMP_PROBE_HEADER = 'x-otel-registry-component-probe';
export const REGISTRY_COMP_PROBE_VALUE = '1';

const REGISTRY_PREFIX = '/ecosystem/registry';

/** True when pathname is `/ecosystem/registry/<non-empty-suffix>`. */
export function shouldHandleRegistryCompPath(pathname: string): boolean {
  if (!pathname.startsWith(`${REGISTRY_PREFIX}/`)) {
    return false;
  }
  const suffix = pathname.slice(REGISTRY_PREFIX.length + 1);
  return suffix.length > 0;
}

function buildRegistryIndexRedirectUrl(requestUrl: URL): string {
  const dest = new URL(`${REGISTRY_PREFIX}/`, requestUrl);
  dest.search = requestUrl.search;
  return dest.href;
}

function buildProbeRequest(request: Request): Request {
  const probe = new Request(request.url, {
    method: request.method,
    headers: new Headers(request.headers),
    redirect: 'manual',
  });
  probe.headers.set(REGISTRY_COMP_PROBE_HEADER, REGISTRY_COMP_PROBE_VALUE);
  return probe;
}

function isPassthroughStatus(status: number): boolean {
  return (status >= 200 && status < 400) || (status >= 500 && status <= 599);
}

export default async function registryCompRedirect(
  request: Request,
  context: AssetFetchContext & { next: () => Promise<Response> },
): Promise<Response> {
  if (
    request.headers.get(REGISTRY_COMP_PROBE_HEADER) ===
    REGISTRY_COMP_PROBE_VALUE
  ) {
    return context.next();
  }

  const url = new URL(request.url);
  if (!shouldHandleRegistryCompPath(url.pathname)) {
    return context.next();
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return context.next();
  }

  const sub = await fetch(buildProbeRequest(request));

  if (isPassthroughStatus(sub.status)) {
    return sub;
  }

  if (sub.status >= 400 && sub.status < 500) {
    enqueueGa4PageViewEvent(request, context, {
      page_location: new URL(request.url).href,
    });
    return Response.redirect(buildRegistryIndexRedirectUrl(url), 301);
  }

  return sub;
}
