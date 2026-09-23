// @ts-check
//
// Tests for the spec-page importer core (index.mjs). The transform
// expectations are characterization tests: they pin the established generated
// output, cross-checked against real cp:spec output. Change them only
// together with a reviewed before/after diff of the regenerated tmp/ pages.
//
// cSpell:ignore oteps

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  baseVersion,
  compilePatches,
  defaultMaxVers,
  parseGitmodules,
  parseSemver,
  semverCmp,
  transform,
  versionErrors,
} from './index.mjs';

const versions = {
  spec: '1.58.0',
  otlp: '1.10.0',
  semconv: '1.42.0',
  opamp: '0.17.0',
};

/** A Log that captures messages instead of printing them. */
function logSpy() {
  /** @type {string[]} */
  const infos = [];
  /** @type {string[]} */
  const warns = [];
  return {
    infos,
    warns,
    /** @param {string} msg */
    info(msg) {
      infos.push(msg);
    },
    /** @param {string} msg */
    warn(msg) {
      warns.push(msg);
    },
  };
}

/**
 * Transform `text` at `path`, asserting that no warnings were emitted.
 * @param {string} path
 * @param {string} text
 */
function adjust(path, text) {
  const log = logSpy();
  const out = transform({ path, text, versions, log });
  assert.deepEqual(log.warns, [], 'transform emits no warnings');
  return out;
}

describe('version helpers', () => {
  it('parseSemver handles releases, pre-releases, and git describe', () => {
    assert.deepEqual(parseSemver('1.2.3'), [1, 2, 3, 0, 0]);
    assert.deepEqual(parseSemver('v1.2.3'), [1, 2, 3, 0, 0]);
    assert.deepEqual(parseSemver('1.2.3-rc.1'), [1, 2, 3, -1, 0]);
    assert.deepEqual(parseSemver('1.2.3-55-g0abc12f'), [1, 2, 3, 1, 55]);
    assert.deepEqual(parseSemver('1.2.3-55'), [1, 2, 3, 1, 55]);
  });

  it('semverCmp orders pre-release < release < git describe', () => {
    assert.equal(semverCmp('1.2.3', '1.2.3'), 0);
    assert.equal(semverCmp('1.2.3', '1.2.4'), -1);
    assert.equal(semverCmp('1.10.0', '1.9.9'), 1);
    assert.equal(semverCmp('1.2.3-dev', '1.2.3'), -1);
    assert.equal(semverCmp('1.2.3', '1.2.3-55-g0abc12f'), -1);
    assert.equal(semverCmp('1.2.3-55-g0abc12f', '1.2.4'), -1);
  });

  it('baseVersion strips v prefix and git-describe suffix', () => {
    assert.equal(baseVersion('v1.42.0'), '1.42.0');
    assert.equal(baseVersion('1.42.0'), '1.42.0');
    assert.equal(baseVersion('v1.42.0-55-g0abc12f'), '1.42.0');
    assert.equal(baseVersion('v0.17.0'), '0.17.0');
  });

  it('defaultMaxVers increments the patch number', () => {
    assert.equal(defaultMaxVers('1.39.0'), '1.39.1');
    assert.equal(defaultMaxVers('v1.55.2'), '1.55.3');
  });

  it('versionErrors: declared versions must match the .gitmodules pin base', () => {
    const versions = { spec: '1.58.0', semconv: '1.43.0' };
    // Exact pin, and a git-describe pin with the same base, are consistent:
    assert.deepEqual(
      versionErrors(
        versions,
        { spec: '1.58.0', semconv: '1.43.0-55-g0abc12f' },
        ['spec', 'semconv'],
      ),
      [],
    );
    // Mismatched pin, missing pin, and missing version are each reported:
    const errors = versionErrors(versions, { spec: '1.59.0', otlp: '1.10.0' }, [
      'spec',
      'semconv',
      'otlp',
    ]);
    assert.equal(errors.length, 3);
    assert.match(errors[0], /version mismatch for 'spec'/);
    assert.match(errors[1], /no 'semconv-pin' entry/);
    assert.match(errors[2], /no 'otlp' version entry/);
  });

  it('parseGitmodules extracts *-pin entries, stripping any v prefix', () => {
    const pins = parseGitmodules(
      `[submodule "content-modules/opentelemetry-specification"]
\tpath = content-modules/opentelemetry-specification
\tspec-pin = v1.58.0
[submodule "content-modules/community"]
\tcommunity-pin = e9411ee
[submodule "content-modules/opamp-spec"]
\topamp-pin = v0.17.0
`,
    );
    assert.deepEqual(pins, {
      spec: '1.58.0',
      community: 'e9411ee',
      opamp: '0.17.0',
    });
  });
});

describe('transform: front matter', () => {
  it('turns a Hugo front-matter comment into real front matter', () => {
    const out = adjust(
      'tmp/otel/specification/trace/api.md',
      `<!--- Hugo front matter used to generate the website version of this page:
linkTitle: API
--->

# Tracing API

Body text.
`,
    );
    assert.equal(
      out,
      `---
title: Tracing API
linkTitle: API
---

Body text.
`,
    );
  });

  it('synthesizes title and linkTitle when absent, dropping pre-H1 lines', () => {
    const out = adjust(
      'tmp/otel/specification/x.md',
      `Some preamble.

# OpenTelemetry Protocol Exporter

Text.
`,
    );
    assert.equal(
      out,
      `---
title: OpenTelemetry Protocol Exporter
linkTitle: Exporter
---

Text.
`,
    );
  });

  it('quotes a synthesized title containing a colon', () => {
    const out = adjust('tmp/otel/specification/x.md', '# A: B\n');
    assert.equal(out, '---\ntitle: "A: B"\n---\n');
  });

  it('drops a leading single-line markdownlint directive', () => {
    const out = adjust(
      'tmp/otel/specification/x.md',
      '<!-- markdownlint-disable MD033 -->\n# T\nBody.\n',
    );
    assert.equal(out, '---\ntitle: T\n---\nBody.\n');
  });

  it('emits an empty page and a warning when there is no H1', () => {
    const log = logSpy();
    const out = transform({
      path: 'tmp/otel/specification/x.md',
      text: 'No heading here.\n',
      versions,
      log,
    });
    assert.equal(out, '');
    assert.equal(log.warns.length, 1);
    assert.match(log.warns[0], /no level 1 heading found/);
  });

  it('stamps version and weight on the OTel spec landing page', () => {
    // Condensed from specification/_index.md.
    const out = adjust(
      'tmp/otel/specification/_index.md',
      `<!--- Hugo front matter used to generate the website version of this page:
linkTitle: OTel spec
no_list: true
--->

# OpenTelemetry Specification

Text.
`,
    );
    assert.equal(
      out,
      `---
title: OpenTelemetry Specification 1.58.0
linkTitle: OTel 1.58.0
no_list: true
weight: 10
---

Text.
`,
    );
  });

  it('stamps version and weight on the OTLP spec page', () => {
    // Condensed from otlp docs/specification.md: the explicit front-matter
    // title and linkTitle are both suffixed.
    const out = adjust(
      'tmp/otlp/docs/specification.md',
      `<!-- markdownlint-disable-next-line first-line-heading -->
<!--- Hugo front matter used to generate the website version of this page:
title: OTLP Specification
linkTitle: OTLP
--->

# OpenTelemetry Protocol Specification

Text.
`,
    );
    assert.equal(
      out,
      `---
title: OTLP Specification 1.10.0
linkTitle: OTLP 1.10.0
weight: 20
---

Text.
`,
    );
  });

  it('stamps the version on the semconv landing page (top-level docs only)', () => {
    // Condensed from semconv docs/README.md.
    const out = adjust(
      'tmp/semconv/docs/README.md',
      `<!--- Hugo front matter used to generate the website version of this page:
auto_gen: below
linkTitle: Semantic conventions
--->

# OpenTelemetry semantic conventions

Text.
`,
    );
    assert.equal(
      out,
      `---
title: OpenTelemetry semantic conventions 1.42.0
auto_gen: below
linkTitle: Semantic conventions 1.42.0
---

Text.
`,
    );
    // Nested pages are not version-stamped:
    const nested = adjust(
      'tmp/semconv/docs/general/attributes.md',
      '# General attributes\n',
    );
    assert.equal(nested, '---\ntitle: General attributes\n---\n');
  });

  it("overrides linkTitle for the OpAMP wire protocol's Design Goals page", () => {
    const out = adjust(
      'tmp/otlp/docs/design-goals.md',
      '# Design Goals for OpenTelemetry Wire Protocol\n',
    );
    assert.equal(
      out,
      '---\ntitle: Design Goals for OpenTelemetry Wire Protocol\nlinkTitle: Design Goals\n---\n',
    );
  });
});

describe('transform: content stripping', () => {
  it('strips <details> blocks', () => {
    const out = adjust(
      'tmp/otel/specification/x.md',
      `# T

<details>
<summary>TOC</summary>
- [a](a.md)
</details>

After.
`,
    );
    assert.equal(out, '---\ntitle: T\n---\n\n\nAfter.\n');
  });

  it('strips <!-- toc -->…<!-- tocstop --> regions', () => {
    const out = adjust(
      'tmp/otel/specification/x.md',
      `# T

<!-- toc -->

- [a](a.md)
  - [b](b.md)

<!-- tocstop -->

After.
`,
    );
    assert.equal(out, '---\ntitle: T\n---\n\n\nAfter.\n');
  });

  it('aborts the toc scan, with a warning, on a non-list line', () => {
    const log = logSpy();
    const out = transform({
      path: 'tmp/otel/specification/x.md',
      text: `# T

<!-- toc -->
Not a list item.
`,
      versions,
      log,
    });
    assert.equal(out, '---\ntitle: T\n---\n\nNot a list item.\n');
    assert.equal(log.warns.length, 1);
    assert.match(log.warns[0], /missing '<!-- tocstop -->' directive/);
  });
});

describe('transform: link rewriting', () => {
  /**
   * The body (sans front matter) of transforming `# T\n` + line.
   * @param {string} path
   * @param {string} line
   */
  function body(path, line) {
    const out = adjust(path, `# T\n${line}`);
    return out.replace('---\ntitle: T\n---\n', '');
  }

  it('localizes semconv /docs/ links and /model/ paths', () => {
    assert.equal(
      body('tmp/semconv/docs/general/a.md', '[x](/docs/attributes.md)\n'),
      '[x](/docs/specs/semconv/attributes.md)\n',
    );
    assert.equal(
      body('tmp/semconv/docs/general/a.md', '[x]: /docs/attributes.md\n'),
      '[x]: /docs/specs/semconv/attributes.md\n',
    );
    // The double slash after the version is long-standing generated output:
    assert.equal(
      body('tmp/semconv/docs/general/a.md', '[m](/model/trace/http.yaml)\n'),
      '[m](https://github.com/open-telemetry/semantic-conventions/tree/v1.42.0//model/trace/http.yaml)\n',
    );
  });

  it('localizes GitHub links to OTel spec pages (main and pinned tag)', () => {
    assert.equal(
      body(
        'tmp/otel/specification/x.md',
        '[a](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md)\n',
      ),
      '[a](/docs/specs/otel/trace/api.md)\n',
    );
    assert.equal(
      body(
        'tmp/otel/specification/x.md',
        '[a]: https://github.com/open-telemetry/opentelemetry-specification/blob/v1.58.0/specification/trace/api.md\n',
      ),
      '[a]: /docs/specs/otel/trace/api.md\n',
    );
  });

  it('localizes links to the OTLP spec', () => {
    assert.equal(
      body(
        'tmp/otel/specification/x.md',
        '[OTLP](https://github.com/open-telemetry/opentelemetry-proto/blob/main/docs/specification.md)\n',
      ),
      '[OTLP](/docs/specs/otlp/)\n',
    );
    assert.equal(
      body(
        'tmp/otel/specification/x.md',
        'See github.com/open-telemetry/opentelemetry-proto/docs/specification.md.\n',
      ),
      'See OTLP.\n',
    );
  });

  it('localizes GitHub links to semconv docs', () => {
    assert.equal(
      body(
        'tmp/otel/specification/x.md',
        '[s](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/attributes.md)\n',
      ),
      '[s](/docs/specs/semconv/general/attributes.md)\n',
    );
  });

  it('adjusts image paths', () => {
    assert.equal(
      body('tmp/otel/specification/x.md', '![i](../internal/img/a-b.png)\n'),
      '![i](/img/a-b.png)\n',
    );
    assert.equal(
      body('tmp/otel/specification/x.md', '![i](img/a.png)\n'),
      '![i](../img/a.png)\n',
    );
    // …but not on logs/schemas _index pages nor under otlp/docs:
    assert.equal(
      body('tmp/otel/specification/logs/_index.md', '![i](img/a.png)\n'),
      '![i](img/a.png)\n',
    );
    assert.equal(
      body(
        'tmp/semconv/docs/general/attributes.md',
        '![i](some/dir/pic.png)\n',
      ),
      '![i](../some/dir/pic.png)\n',
    );
  });

  it('rewrites paths outside the spec folders as external links', () => {
    assert.equal(
      body('tmp/otel/specification/_index.md', '[r](../README.md)\n'),
      '[r](https://github.com/open-telemetry/opentelemetry-specification/)\n',
    );
    assert.equal(
      body(
        'tmp/otel/specification/library-guidelines.md',
        '[r](../README.md)\n',
      ),
      '[r](/docs/specs/otel/)\n',
    );
    assert.equal(
      body('tmp/otel/specification/x.md', '[o](../../oteps/0001-spec.md)\n'),
      '[o](https://github.com/open-telemetry/opentelemetry-specification/tree/v1.58.0/oteps/0001-spec.md)\n',
    );
    assert.equal(
      body('tmp/otlp/docs/x.md', '[r](../examples/README.md)\n'),
      '[r](https://github.com/open-telemetry/opentelemetry-proto/tree/v1.10.0/examples/README.md)\n',
    );
  });

  it('makes opentelemetry.io links site-local', () => {
    assert.equal(
      body(
        'tmp/semconv/docs/general/a.md',
        '[d](https://opentelemetry.io/docs/)\n',
      ),
      '[d](/docs/)\n',
    );
  });

  it('links OTLP proto files and the OpAMP proto into their repos', () => {
    assert.equal(
      body('tmp/otlp/docs/x.md', '[p](../opentelemetry/proto/trace.proto)\n'),
      '[p](https://github.com/open-telemetry/opentelemetry-proto/tree/v1.10.0/opentelemetry/proto/trace.proto)\n',
    );
    assert.equal(
      body('tmp/opamp/index.md', '[p](proto/opamp.proto)\n'),
      '[p](https://github.com/open-telemetry/opamp-spec/blob/v0.17.0/proto/opamp.proto)\n',
    );
  });
});

describe('patches', () => {
  const pins = {
    spec: '1.58.0',
    otlp: '1.10.0',
    semconv: '1.42.0',
    opamp: '0.17.0',
  };

  /** @param {Partial<import('./index.mjs').Patch>} patch */
  function compileOne(patch, { pins: p = pins } = {}) {
    const log = logSpy();
    const applyPatches = compilePatches(
      [
        /** @type {import('./index.mjs').Patch} */ ({
          id: 'test-patch',
          module: 'semconv',
          minVers: '1.42.0',
          search: 'old',
          replace: 'new',
          ...patch,
        }),
      ],
      { pins: p, versions, scriptId: 'adjust-pages', log },
    );
    return { applyPatches, log };
  }

  it('applies an in-range body patch, logging INFO once per run', () => {
    const { applyPatches, log } = compileOne({ flags: 'g' });
    assert.equal(
      applyPatches('body', 'tmp/semconv/docs/a.md', 'old old'),
      'new new',
    );
    assert.equal(
      applyPatches('body', 'tmp/semconv/docs/b.md', 'more old'),
      'more new',
    );
    assert.equal(log.infos.length, 1);
    assert.match(log.infos[0], /applying patch 'test-patch'/);
  });

  it('gates on the file regex, defaulting to the module docs tree', () => {
    const { applyPatches } = compileOne({});
    assert.equal(
      applyPatches('body', 'tmp/otel/specification/a.md', 'old'),
      'old',
    );
    const { applyPatches: scoped } = compileOne({
      file: '^tmp/semconv/docs/http/',
    });
    assert.equal(scoped('body', 'tmp/semconv/docs/a.md', 'old'), 'old');
    assert.equal(scoped('body', 'tmp/semconv/docs/http/a.md', 'old'), 'new');
  });

  it('only applies patches matching the given context', () => {
    const { applyPatches } = compileOne({ context: 'front-matter' });
    assert.equal(applyPatches('body', 'tmp/semconv/docs/a.md', 'old'), 'old');
    assert.equal(
      applyPatches('front-matter', 'tmp/semconv/docs/a.md', 'old'),
      'new',
    );
  });

  it('applies front-matter patches during transform', () => {
    const { applyPatches } = compileOne({
      context: 'front-matter',
      search: 'linkTitle: Old',
      replace: 'linkTitle: New',
    });
    const out = transform({
      path: 'tmp/semconv/docs/general/a.md',
      text: `<!--- Hugo front matter used to generate the website version of this page:
linkTitle: Old
--->

# T
`,
      versions,
      applyPatches,
    });
    assert.equal(out, '---\ntitle: T\nlinkTitle: New\n---\n');
  });

  it('skips a patch once the submodule reaches maxVers (exclusive)', () => {
    const { applyPatches, log } = compileOne({
      minVers: '1.41.0',
      maxVers: '1.42.0',
    });
    assert.equal(applyPatches('body', 'tmp/semconv/docs/a.md', 'old'), 'old');
    assert.equal(log.infos.length, 1);
    assert.match(log.infos[0], /skipping patch .* fix is likely in upstream/);
  });

  it('defaults maxVers to minVers with its patch number incremented', () => {
    // 1.41.0 → default maxVers 1.41.1 ≤ pinned 1.42.0, so the patch is off.
    const { applyPatches, log } = compileOne({ minVers: '1.41.0' });
    assert.equal(applyPatches('body', 'tmp/semconv/docs/a.md', 'old'), 'old');
    assert.match(log.infos[0], /skipping patch/);
    // …while a git-describe pin of the same base release keeps it on:
    const { applyPatches: on } = compileOne(
      { minVers: '1.42.0' },
      { pins: { ...pins, semconv: '1.42.0-55-g0abc12f' } },
    );
    assert.equal(on('body', 'tmp/semconv/docs/a.md', 'old'), 'new');
  });

  it('warns once about a patch with an unknown module and no file regex', () => {
    const { applyPatches, log } = compileOne({ module: 'community' });
    assert.equal(
      applyPatches('body', 'tmp/community/roadmap.md', 'old'),
      'old',
    );
    assert.equal(
      applyPatches('body', 'tmp/community/roadmap.md', 'old'),
      'old',
    );
    assert.equal(log.warns.length, 1);
    assert.match(log.warns[0], /unknown module 'community'/);
  });
});
