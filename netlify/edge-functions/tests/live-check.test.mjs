import test from 'node:test';

process.env.EDGE_FUNCTION_LIVE_CHECK_GROUPED = '1';

const { registerLiveChecks: registerMarkdownNegotiationLiveChecks } =
  await import('../markdown-negotiation/live-check.test.mjs');
const { registerLiveChecks: registerAssetTrackingLiveChecks } =
  await import('../asset-tracking/live-check.test.mjs');
const { registerLiveChecks: registerSchemaAnalyticsLiveChecks } =
  await import('../schema-analytics/live-check.test.mjs');

test('markdown-negotiation', async (t) => {
  registerMarkdownNegotiationLiveChecks(t.test.bind(t));
});

test('asset-tracking', async (t) => {
  registerAssetTrackingLiveChecks(t.test.bind(t));
});

test('schema-analytics', async (t) => {
  registerSchemaAnalyticsLiveChecks(t.test.bind(t));
});
