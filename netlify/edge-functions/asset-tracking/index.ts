import {
  isInternalAssetFetchRequest,
  type AssetFetchContext,
  enqueueAssetFetchEvent,
  normalizeContentType,
} from '../lib/ga4-asset-fetch.ts';

const TRACKED_EXTENSIONS = new Set(['.md']);

export default async function assetTracking(
  request: Request,
  context: AssetFetchContext & { next: () => Promise<Response> },
) {
  const response = await context.next();

  if (!shouldTrackAssetFetch(request, response)) {
    return response;
  }

  const requestUrl = new URL(request.url);
  const assetPath = requestUrl.pathname;
  const assetExt = getPathExtension(assetPath);

  enqueueAssetFetchEvent(request, context, {
    asset_group: classifyAssetGroup(assetExt),
    asset_path: assetPath,
    asset_ext: assetExt.slice(1),
    content_type: normalizeContentType(response.headers.get('content-type')),
    status_code: String(response.status),
  });

  return response;
}

export function shouldTrackAssetFetch(
  request: Request,
  response: Response,
): boolean {
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

  if (response.status < 200 || response.status >= 300) {
    return false;
  }

  const contentType = normalizeContentType(
    response.headers.get('content-type'),
  );

  if (extension === '.md') {
    return contentType === 'text/markdown';
  }

  return false;
}

function classifyAssetGroup(extension: string): 'markdown' | 'other' {
  if (extension === '.md') {
    return 'markdown';
  }

  return 'other';
}

function getPathExtension(pathname: string): string {
  const lastSegment = pathname.split('/').pop() ?? '';
  const match = /\.([^.]+)$/.exec(lastSegment);

  return match ? `.${match[1].toLowerCase()}` : '';
}
