import test from 'node:test';

process.env.SITE_LIVE_CHECK_GROUPED = '1';

const { registerLiveChecks: registerEdgeFunctionLiveChecks } =
  await import('../netlify/edge-functions/tests/live-check.test.mjs');
const { registerLiveChecks: registerRedirectLiveChecks } =
  await import('./redirects/live-check.test.mjs');

test('edge-functions', async (t) => {
  registerEdgeFunctionLiveChecks(t.test.bind(t));
});

test('redirects', async (t) => {
  registerRedirectLiveChecks(t.test.bind(t));
});
