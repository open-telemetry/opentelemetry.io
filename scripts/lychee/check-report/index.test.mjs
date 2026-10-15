import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ROOT_MARKDOWN_GLOB,
  cacheUpdatedNotice,
  deadLinksReport,
  failedUrlsOf,
  missingPagesOf,
  missingPagesReport,
  partitionFailures,
} from './index.mjs';

suite('failedUrlsOf', () => {
  const lycheeOutput = `Issues found in 1 input. Find details below.

[/tmp/dead-links.html]:
[410] https://httpbin.org/status/410 (at 4:10) | Rejected status code: 410 Gone
[404] https://opentelemetry.io/no-such-page/ (at 3:10) | Rejected status code: 404 Not Found

🔍 2 Total (in 398ms) 🔗 2 Unique ✅ 0 OK 🚫 2 Errors
`;

  test('extracts status and URL of each failure', () => {
    assert.deepEqual(failedUrlsOf(lycheeOutput), [
      { status: '410', url: 'https://httpbin.org/status/410' },
      { status: '404', url: 'https://opentelemetry.io/no-such-page/' },
    ]);
  });

  test('reports each URL once, even when it fails in several inputs', () => {
    const twice = lycheeOutput + lycheeOutput;
    assert.equal(failedUrlsOf(twice).length, 2);
  });

  test('is empty for a clean run', () => {
    const clean = '🔍 9 Total (in 3s) 🔗 5 Unique ✅ 9 OK 🚫 0 Errors\n';
    assert.deepEqual(failedUrlsOf(clean), []);
  });

  test('includes TIMEOUT and ERROR failures alongside status codes', () => {
    const out =
      '[TIMEOUT] https://slow.test/ (at 1:1) | Timeout\n' +
      '[ERROR] https://cannot.test/ (at 2:1) | Network error\n' +
      '[404] https://gone.test/ (at 3:1) | Rejected status code: 404 Not Found\n';
    assert.deepEqual(failedUrlsOf(out), [
      { status: 'TIMEOUT', url: 'https://slow.test/' },
      { status: 'ERROR', url: 'https://cannot.test/' },
      { status: '404', url: 'https://gone.test/' },
    ]);
  });
});

suite('deadLinksReport', () => {
  test('names the count and lists each URL with its status', () => {
    const report = deadLinksReport([
      { status: '404', url: 'https://gone.test/' },
      { status: '410', url: 'https://also-gone.test/' },
    ]);
    assert.match(report, /2 links? are genuinely unreachable/);
    assert.match(report, /nothing cache-side to fix/);
    assert.match(report, /can be transient/);
    assert.match(report, /\[404\] https:\/\/gone\.test\//);
    assert.match(report, /\[410\] https:\/\/also-gone\.test\//);
    assert.match(report, /link-check=no/);
  });

  test('uses singular phrasing for one failure', () => {
    const report = deadLinksReport([
      { status: '404', url: 'https://gone.test/' },
    ]);
    assert.match(report, /1 link is genuinely unreachable/);
  });

  test('offline, drops the advice that only applies to external links', () => {
    const report = deadLinksReport(
      [{ status: 'ERROR', url: 'file:///s/public/docs/a#gone' }],
      { offline: true },
    );
    assert.match(report, /1 link is genuinely unreachable/);
    assert.match(report, /Fix or remove these links\./);
    assert.doesNotMatch(report, /transient|link-check=no/);
  });

  test('is empty when there are no failures', () => {
    assert.equal(deadLinksReport([]), '');
  });
});

suite('cacheUpdatedNotice', () => {
  test('says the cache was updated and how to commit it', () => {
    const notice = cacheUpdatedNotice();
    assert.match(notice, /link-cache\.jsonc/);
    assert.match(notice, /commit/i);
  });
});

suite('wiring drift guard', () => {
  test('the production script opts into the missing-pages report', () => {
    const pkg = JSON.parse(
      fs.readFileSync(new URL('../../../package.json', import.meta.url)),
    );
    assert.match(
      pkg.scripts['check:links:production-internal'],
      /check-report\/cli\.mjs --offline --production$/,
    );
  });

  test('_check:links still is the bin that cli.mjs invokes directly, with the same extra input', () => {
    // cli.mjs spawns the bin directly and appends the root-Markdown glob; see
    // its bin comment.
    const pkg = JSON.parse(
      fs.readFileSync(new URL('../../../package.json', import.meta.url)),
    );
    assert.equal(
      pkg.scripts['_check:links'],
      `lychee-norm-cache ${ROOT_MARKDOWN_GLOB}`,
    );
  });

  test('the job that cacheUpdatedNotice() cites exists in check-links.yml', () => {
    // Workflow YAML and terminal strings never enter the built site.
    const jobName = 'CACHE updates committed?';
    assert.ok(
      cacheUpdatedNotice().includes(jobName),
      `notice cites the '${jobName}' job`,
    );
    const workflow = fs.readFileSync(
      new URL('../../../.github/workflows/check-links.yml', import.meta.url),
      'utf8',
    );
    assert.ok(
      workflow.includes(`name: ${jobName}`),
      `check-links.yml defines a job named '${jobName}'`,
    );
  });

  test('pr-checks anchors cited outside built HTML exist in pr-checks.md', () => {
    const workflow = fs.readFileSync(
      new URL('../../../.github/workflows/check-links.yml', import.meta.url),
      'utf8',
    );
    const reports =
      deadLinksReport([{ status: '404', url: 'https://x.test/' }]) +
      missingPagesReport([{ source: '/a/', targets: ['/b/'] }]);
    const anchors = [
      ...(workflow + reports).matchAll(/pr-checks\/#([a-z0-9-]+)/g),
    ].map((m) => m[1]);
    assert.ok(anchors.length > 0, 'at least one pr-checks anchor is cited');
    const doc = fs.readFileSync(
      new URL(
        '../../../content/en/docs/contributing/pr-checks.md',
        import.meta.url,
      ),
      'utf8',
    );
    for (const anchor of anchors) {
      assert.ok(
        doc.includes(`{#${anchor}`),
        `pr-checks.md declares the {#${anchor}} anchor`,
      );
    }
  });
});

suite('missingPagesOf', () => {
  const root = '/home/runner/work/opentelemetry.io/opentelemetry.io';
  const offlineOutput = `Issues found in 2 inputs. Find details below.

[${root}/public/es/docs/zero-code/obi/network/quickstart/index.html]:
[ERROR] file://${root}/public/es/docs/zero-code/obi/setup/kubernetes-helm (at 14:10) | File not found. Check if file exists and path is correct

[${root}/public/docs/collector/index.html]:
[ERROR] file://${root}/public/docs/collector/deploy/choose (at 3:7) | Cannot find index file within directory: An index file (index.html) is required
[ERROR] file://${root}/public/docs/collector/deploy/choose (at 9:7) | Cannot find index file within directory: An index file (index.html) is required

🔍 275770 Total (in 8s 800ms) 🔗 74449 Unique ✅ 183749 OK 🚫 3 Errors 👻 92020 Excluded
`;

  test('groups missing targets under their source pages, as paths under public/', () => {
    assert.deepEqual(missingPagesOf(offlineOutput), [
      {
        source: '/es/docs/zero-code/obi/network/quickstart/index.html',
        targets: ['/es/docs/zero-code/obi/setup/kubernetes-helm'],
      },
      {
        source: '/docs/collector/index.html',
        targets: ['/docs/collector/deploy/choose'],
      },
    ]);
  });

  test('ignores non-file failures and is empty for a clean run', () => {
    const http = `[${root}/public/docs/index.html]:\n[404] https://gone.test/ (at 1:1) | Rejected status code: 404 Not Found\n`;
    assert.deepEqual(missingPagesOf(http), []);
    assert.deepEqual(missingPagesOf('🔍 9 Total 🚫 0 Errors\n'), []);
  });

  test('leaves missing fragments to the generic report', () => {
    const out = `[${root}/public/docs/a/index.html]:
[ERROR] file://${root}/public/docs/b#nope (at 1:22) | Cannot find fragment
[ERROR] file://${root}/public/docs/x.pdf (at 1:55) | File not found. Check if file exists and path is correct
[ERROR] file://${root}/public/docs/missing (at 1:85) | File not found. Check if file exists and path is correct
`;
    assert.deepEqual(missingPagesOf(out), [
      {
        source: '/docs/a/index.html',
        targets: ['/docs/x.pdf', '/docs/missing'],
      },
    ]);
  });

  test('reports a page once whatever fragment or query the link carries; decodes the path', () => {
    const out = `[${root}/public/docs/a/index.html]:
[ERROR] file://${root}/public/docs/draft#sec (at 1:1) | File not found. Check if file exists and path is correct
[ERROR] file://${root}/public/docs/draft?q=1 (at 1:2) | File not found. Check if file exists and path is correct
[ERROR] file://${root}/public/docs/caf%C3%A9 (at 1:5) | File not found. Check if file exists and path is correct
`;
    assert.deepEqual(missingPagesOf(out), [
      { source: '/docs/a/index.html', targets: ['/docs/draft', '/docs/café'] },
    ]);
  });

  test('cuts at the first public/ directory; later ones belong to the site path', () => {
    const out = `[/repo/public/docs/public/a/index.html]:
[ERROR] file:///repo/public/docs/publication (at 1:1) | File not found. Check if file exists and path is correct
[ERROR] file:///elsewhere/docs/b (at 1:2) | File not found. Check if file exists and path is correct
`;
    assert.deepEqual(missingPagesOf(out), [
      { source: '/docs/public/a/index.html', targets: ['/docs/publication'] },
    ]);
  });
});

suite('partitionFailures', () => {
  test('splits missing pages from every other failure, so both get reported', () => {
    const root = '/site';
    const out = `[${root}/public/docs/a/index.html]:
[ERROR] file://${root}/public/docs/draft (at 1:1) | File not found. Check if file exists and path is correct
[404] https://gone.test/ (at 1:20) | Rejected status code: 404 Not Found
[ERROR] file://${root}/public/docs/b#nope (at 1:40) | Cannot find fragment
`;
    const { missingPages, other } = partitionFailures(out, {
      production: true,
    });
    assert.deepEqual(missingPages, [
      { source: '/docs/a/index.html', targets: ['/docs/draft'] },
    ]);
    assert.deepEqual(other, [
      { status: '404', url: 'https://gone.test/' },
      { status: 'ERROR', url: `file://${root}/public/docs/b#nope` },
    ]);
  });

  test('keeps a missing fragment on a page whose other link is a missing page', () => {
    const out = `[/s/public/a/index.html]:
[ERROR] file:///s/public/docs/p (at 1:1) | File not found. Check if file exists and path is correct
[ERROR] file:///s/public/docs/p#bad (at 1:2) | Cannot find fragment
`;
    const { missingPages, other } = partitionFailures(out, {
      production: true,
    });
    assert.deepEqual(missingPages, [
      { source: '/a/index.html', targets: ['/docs/p'] },
    ]);
    assert.deepEqual(other, [
      { status: 'ERROR', url: 'file:///s/public/docs/p#bad' },
    ]);
  });

  test('leaves a malformed file: URL to the generic report', () => {
    const out = `[/s/public/a/index.html]:
[ERROR] file:///s/public/docs/caf%E9 (at 1:1) | File not found. Check if file exists and path is correct
`;
    const { missingPages, other } = partitionFailures(out, {
      production: true,
    });
    assert.deepEqual(missingPages, []);
    assert.deepEqual(other, [
      { status: 'ERROR', url: 'file:///s/public/docs/caf%E9' },
    ]);
  });

  test('classifies nothing outside a production run: that build has the drafts', () => {
    const out = `[/site/public/docs/a/index.html]:
[ERROR] file:///site/public/docs/colector (at 1:1) | File not found. Check if file exists and path is correct
`;
    const { missingPages, other } = partitionFailures(out);
    assert.deepEqual(missingPages, []);
    assert.equal(other.length, 1);
  });
});

suite('missingPagesReport', () => {
  test('counts the listed links, lists each source with its targets, links the docs', () => {
    const helm = '/es/docs/zero-code/obi/setup/kubernetes-helm';
    const report = missingPagesReport([
      {
        source: '/es/docs/zero-code/obi/network/quickstart/index.html',
        targets: [helm],
      },
      { source: '/es/docs/zero-code/obi/index.html', targets: [helm] },
    ]);
    assert.match(
      report,
      /2 link\(s\) to page\(s\) missing from the production build:/,
    );
    assert.doesNotMatch(report, /draft/);
    assert.match(report, /\/es\/docs\/zero-code\/obi\/network\/quickstart\//);
    assert.match(
      report,
      /→ \/es\/docs\/zero-code\/obi\/setup\/kubernetes-helm/,
    );
    assert.match(
      report,
      /For how to fix this, see https:\/\/[^ ]*pr-checks\/#check-links-production-internal/,
    );
  });

  test('is empty when there are no missing pages', () => {
    assert.equal(missingPagesReport([]), '');
  });
});
