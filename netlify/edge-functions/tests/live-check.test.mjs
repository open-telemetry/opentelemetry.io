import test from 'node:test';

const GROUPED_LIVE_CHECK_ENV = 'SITE_LIVE_CHECK_GROUPED';

process.env.EDGE_FUNCTION_LIVE_CHECK_GROUPED = '1';

const { registerLiveChecks: registerMarkdownNegotiationLiveChecks } =
  await import('../markdown-negotiation/live-check.test.mjs');
const { registerLiveChecks: registerAssetTrackingLiveChecks } =
  await import('../asset-tracking/live-check.test.mjs');
const { registerLiveChecks: registerSchemaAnalyticsLiveChecks } =
  await import('../schema-analytics/live-check.test.mjs');
const { registerLiveChecks: registerRegistryCompRedirectLiveChecks } =
  await import('../registry-component-redirect/live-check.test.mjs');

export function registerLiveChecks(registerTest = test) {
  registerTest('markdown-negotiation', async (t) => {
    registerMarkdownNegotiationLiveChecks(t.test.bind(t));
  });

  registerTest('asset-tracking', async (t) => {
    registerAssetTrackingLiveChecks(t.test.bind(t));
  });

  registerTest('schema-analytics', async (t) => {
    registerSchemaAnalyticsLiveChecks(t.test.bind(t));
  });

  registerTest('registry-component-redirect', async (t) => {
    registerRegistryCompRedirectLiveChecks(t.test.bind(t));
  });
}

if (process.env[GROUPED_LIVE_CHECK_ENV] !== '1') {
  registerLiveChecks();
}
