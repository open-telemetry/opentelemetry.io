import {
  buildAssetFetchGaInfoHeaderValue,
  hasAssetFetchConfig,
  isInternalAssetFetchRequest,
  type AssetFetchContext,
  enqueueAssetFetchEvent,
  normalizeContentType,
  withAssetFetchGaInfoHeader,
} from '../lib/ga4-mp.ts';

const TRACKED_EXTENSIONS = new Set(['.md', '.txt']);

export default async function assetTracking(
  request: Request,
  context: AssetFetchContext & { next: () => Promise<Response> },
) {
  const response = await context.next();
  const requestUrl = new URL(request.url);
  const trackable = shouldTrackAssetFetch(request, response);
  const responseWithGaInfo = withAssetFetchGaInfoHeader(
    response,
    buildAssetFetchGaInfoHeaderValue({
      assetPath: trackable ? requestUrl.pathname : undefined,
      configPresent: hasAssetFetchConfig(),
      noneReason: trackable
        ? undefined
        : getAssetTrackingGaInfoNoneReason(request),
      gaEventCandidate: trackable,
    }),
  );

  if (!trackable) {
    return responseWithGaInfo;
  }

  enqueueAssetFetchEvent(request, context, {
    asset_path: requestUrl.pathname,
    content_type: normalizeContentType(
      responseWithGaInfo.headers.get('content-type'),
    ),
    status_code: String(responseWithGaInfo.status),
    event_emitter: 'tracking',
  });

  return responseWithGaInfo;
}

export function shouldTrackAssetFetch(
  request: Request,
  response: Response,
): boolean {
  void response;

  if (request.method !== 'GET') {
    return false;
  }

  if (isInternalAssetFetchRequest(request)) {
    return false;
  }

  const requestUrl = new URL(request.url);
  const extension = getPathExtension(requestUrl.pathname);

  if (!TRACKED_EXTENSIONS.has(extension)) {
    return false;
  }

  return true;
}

function getAssetTrackingGaInfoNoneReason(
  request: Request,
): string | undefined {
  if (request.method !== 'GET') {
    return `request method ${request.method} is not currently tracked`;
  }

  if (isInternalAssetFetchRequest(request)) {
    return 'internal subrequest';
  }

  const requestUrl = new URL(request.url);
  const extension = getPathExtension(requestUrl.pathname);

  if (!TRACKED_EXTENSIONS.has(extension)) {
    return 'request path does not match a tracked route';
  }

  return undefined;
}

function getPathExtension(pathname: string): string {
  const lastSegment = pathname.split('/').pop() ?? '';
  const match = /\.([^.]+)$/.exec(lastSegment);

  return match ? `.${match[1].toLowerCase()}` : '';
}
