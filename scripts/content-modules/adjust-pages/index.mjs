// @ts-check
//
// Core transformations of the spec-page importer: front-matter synthesis, TOC
// stripping, link/image rewriting, and data-driven patches. Pure functions
// only — file I/O and version resolution live in cli.mjs.
//
// Rule order matters, and any change here alters the generated /docs/specs
// pages: verify with a before/after diff of the cp:spec output under tmp/.
// Docs: content/en/site/build/content-module-patches.md.
//
// cSpell:ignore oteps

export const otelSpecRepoUrl =
  'https://github.com/open-telemetry/opentelemetry-specification';
export const otlpSpecRepoUrl =
  'https://github.com/open-telemetry/opentelemetry-proto';
export const opAmpSpecRepoUrl = 'https://github.com/open-telemetry/opamp-spec';
export const semconvSpecRepoUrl =
  'https://github.com/open-telemetry/semantic-conventions';
export const specBasePath = '/docs/specs';

// Default `file` regex per module, used when a patch entry omits `file`.
/** @type {Record<string, RegExp | undefined>} */
const moduleFileDefaults = {
  spec: /^tmp\/otel\/specification\//,
  otlp: /^tmp\/otlp\/docs\//,
  semconv: /^tmp\/semconv\/docs\//,
};

/**
 * Parse a version string into comparable parts.
 * Handles: X.Y.Z, X.Y.Z-pre-release, X.Y.Z-N-gHASH (git describe).
 * @param {string} v
 * @returns {number[]} [major, minor, patch, kind, distance] where kind is
 *   -1 for pre-release, 0 for a clean release, 1 for git-describe output.
 */
export function parseSemver(v) {
  v = v.replace(/^v/, '');
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (m) {
    const [maj, min, pat] = [+m[1], +m[2], +m[3]];
    const suffix = m[4];
    if (suffix === undefined) return [maj, min, pat, 0, 0]; // clean release
    let s;
    if ((s = suffix.match(/^(\d+)-g[0-9a-f]+$/)))
      return [maj, min, pat, 1, +s[1]];
    if ((s = suffix.match(/^(\d+)$/))) return [maj, min, pat, 1, +s[1]];
    return [maj, min, pat, -1, 0]; // pre-release (e.g., -dev, -rc1)
  }
  console.error(`WARNING: cannot parse version '${v}'`);
  return [0, 0, 0, 0, 0];
}

/**
 * Compare two version strings numerically. Returns -1, 0, or 1.
 * For the same X.Y.Z: pre-release < release < git-describe.
 * @param {string} a
 * @param {string} b
 */
export function semverCmp(a, b) {
  const ap = parseSemver(a);
  const bp = parseSemver(b);
  for (let i = 0; i < 5; i++) {
    if (ap[i] !== bp[i]) return ap[i] < bp[i] ? -1 : 1;
  }
  return 0;
}

/**
 * The release that a submodule pin is based on: strips a leading `v` and any
 * git-describe suffix, e.g. 'v1.42.0-55-g0abcdef' -> '1.42.0'.
 * @param {string} vers
 */
export function baseVersion(vers) {
  return vers.replace(/^v/, '').replace(/^(\d+\.\d+\.\d+).*$/, '$1');
}

/**
 * Extract `<name>-pin = <version>` entries from .gitmodules content, mapping
 * name to version with any leading `v` stripped.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseGitmodules(text) {
  /** @type {Record<string, string>} */
  const pins = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(\w+)-pin\s*=\s*(.+)/);
    if (m) pins[m[1]] = m[2].replace(/\r$/, '').replace(/^v/, '');
  }
  return pins;
}

/**
 * `minVers` with its patch (last) number incremented — a patch's default,
 * exclusive maxVers — e.g. '1.39.0' -> '1.39.1'.
 * @param {string} minVers
 * @returns {string | undefined}
 */
export function defaultMaxVers(minVers) {
  const m = minVers.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (m) return `${m[1]}.${m[2]}.${+m[3] + 1}`;
  console.error(`WARNING: cannot derive default maxVers from '${minVers}'`);
  return undefined;
}

/**
 * Consistency errors between the declared spec versions (data/) and the
 * .gitmodules submodule pins, for the given modules. A pin may carry a
 * git-describe suffix (integration branches); only its base release must
 * match the declared version.
 * @param {Record<string, string>} versions - Declared version per module.
 * @param {Record<string, string>} pins - Raw pins from .gitmodules.
 * @param {string[]} modules
 * @returns {string[]} One message per problem; empty when consistent.
 */
export function versionErrors(versions, pins, modules) {
  const errors = [];
  for (const module of modules) {
    const vers = versions[module];
    const pin = pins[module];
    if (!vers) {
      errors.push(`no '${module}' version entry found`);
    } else if (!pin) {
      errors.push(`no '${module}-pin' entry found in .gitmodules`);
    } else if (baseVersion(pin) !== vers) {
      errors.push(
        `version mismatch for '${module}': '${vers}' is declared, but the ` +
          `.gitmodules pin is '${pin}' — update them together`,
      );
    }
  }
  return errors;
}

/**
 * A declarative spec patch, as loaded from patches.yml. For the patching
 * workflow, see content/en/site/build/content-module-patches.md.
 * @typedef {Object} Patch
 * @property {string} id - Unique patch identifier (date + short description).
 * @property {string} module - One of 'spec', 'otlp', 'semconv'.
 * @property {string} minVers - Inclusive lower version bound.
 * @property {string} [maxVers] - Exclusive upper bound; defaults to minVers
 *   with its patch number incremented.
 * @property {string} [file] - Regex matching file paths the patch applies to;
 *   defaults to the module's docs tree.
 * @property {string} [context] - 'body' (default) or 'front-matter'.
 * @property {string} search - RegExp source for the text to replace.
 * @property {string} replace - Replacement string (JS replacement syntax).
 * @property {string} [flags] - RegExp flags, e.g. 'g'.
 * @property {string} [notes] - Free text, e.g. upstream issue/PR links.
 */

/**
 * @typedef {Object} Log
 * @property {(msg: string) => void} info - Progress messages (stdout).
 * @property {(msg: string) => void} warn - Warnings (stderr).
 */

/** @type {Log} */
export const consoleLog = { info: console.log, warn: console.error };

/**
 * @callback ApplyPatches
 * @param {string} context - 'body' or 'front-matter'.
 * @param {string} filePath - Path of the file being processed.
 * @param {string} text - A body line, or the whole front-matter block.
 * @returns {string}
 */

/** @type {ApplyPatches} */
const noPatches = (context, filePath, text) => text;

/**
 * Compile declarative patches into an ApplyPatches function with version
 * gating and once-per-run INFO/obsolete messages: `pins` (raw, possibly
 * git-describe-suffixed) gates whether a patch applies; `versions` (base
 * releases) drives the "probably obsolete" hints.
 *
 * @param {Patch[]} patches
 * @param {Object} opts
 * @param {Record<string, string>} opts.pins - Raw versions from .gitmodules.
 * @param {Record<string, string>} opts.versions - Base release per module.
 * @param {string} [opts.scriptId] - Name reported in messages.
 * @param {Log} [opts.log]
 * @returns {ApplyPatches}
 */
export function compilePatches(patches, { pins, versions, scriptId, log }) {
  const _log = log ?? consoleLog;
  const id = scriptId ?? 'adjust-pages';
  /** @type {Map<string, number | 'apply'>} */
  const msgCount = new Map();
  const warned = new Set();
  const compiled = patches.map((patch) => ({
    ...patch,
    searchRe: new RegExp(patch.search, patch.flags ?? ''),
    fileRe: patch.file
      ? new RegExp(patch.file)
      : moduleFileDefaults[patch.module],
  }));

  /**
   * Whether the patch applies given the module's version; otherwise log
   * (once) the reason why not. minVers is inclusive, maxVers exclusive.
   * @param {Patch} patch
   */
  function applyPatchOrPrintMsgIf(patch) {
    const { id: patchID, module: specName, minVers } = patch;
    const maxVers = patch.maxVers ?? defaultMaxVers(minVers);
    const vers = versions[specName];
    const submoduleVers = pins[specName];
    const key = specName + patchID;
    const count = msgCount.get(key);

    if (count && count !== 'apply') return false;

    // maxVers is exclusive: skip once the submodule has reached it.
    if (maxVers && submoduleVers && semverCmp(submoduleVers, maxVers) >= 0) {
      if (!count) {
        _log.info(
          `INFO: ${id}: skipping patch '${patchID}' since spec '${specName}' ` +
            `submodule is at version '${submoduleVers}' >= '${maxVers}' (patch max version, exclusive); ` +
            `the fix is likely in upstream now`,
        );
      }
      msgCount.set(key, 1);
      return false;
    }

    if (submoduleVers && semverCmp(submoduleVers, minVers) >= 0) {
      if (!count) {
        _log.info(
          `INFO: ${id}: applying patch '${patchID}' since spec '${specName}' ` +
            `submodule is at version '${submoduleVers}' >= '${minVers}' (patch min version, inclusive)` +
            (maxVers
              ? ` and < '${maxVers}' (patch max version, exclusive)`
              : ''),
        );
      }
      msgCount.set(key, 'apply');
      return true;
    } else if (maxVers && semverCmp(vers, maxVers) >= 0) {
      _log.info(
        `INFO: ${id}: patch '${patchID}' is probably obsolete now that ` +
          `spec '${specName}' is at version '${vers}' >= '${maxVers}' (patch max version, exclusive); ` +
          `if so, remove the patch`,
      );
    } else if (semverCmp(vers, minVers) >= 0) {
      _log.info(
        `INFO: ${id}: patch '${patchID}' is probably obsolete now that ` +
          `spec '${specName}' is at version '${vers}' >= '${minVers}' (patch min version, inclusive); ` +
          `if so, remove the patch`,
      );
    } else {
      const submoduleInfo = submoduleVers
        ? `and submodule version '${submoduleVers}' < '${minVers}' (patch min version, inclusive)`
        : `and submodule version is unknown`;
      _log.info(
        `INFO: ${id}: skipping patch '${patchID}' since spec '${specName}' ` +
          `submodule is at version '${vers}' < '${minVers}' (patch min version, inclusive); ` +
          `${submoduleInfo}`,
      );
    }
    msgCount.set(key, 1);
    return false;
  }

  return function applyPatches(context, filePath, text) {
    for (const patch of compiled) {
      if ((patch.context ?? 'body') !== context) continue;
      if (!patch.fileRe) {
        if (!warned.has(patch.id)) {
          warned.add(patch.id);
          _log.warn(
            `WARNING: patch '${patch.id}' has unknown module '${patch.module}' and no file regex; skipping`,
          );
        }
        continue;
      }
      if (!patch.fileRe.test(filePath)) continue;
      if (!applyPatchOrPrintMsgIf(patch)) continue;
      text = text.replace(patch.searchRe, patch.replace);
    }
    return text;
  };
}

/**
 * A rewrite step of the body pipeline.
 * @typedef {Object} BodyRule
 * @property {RegExp | ((path: string) => boolean)} [when] - Restricts the
 *   rule to matching file paths.
 * @property {RegExp} search - The text to rewrite.
 * @property {string} replace - Replacement string (JS replacement syntax).
 */

/**
 * A body-pipeline step: a rewrite rule, or the marker for where the
 * data-driven body patches apply.
 * @typedef {BodyRule | {patches: 'body'}} BodyStep
 */

/**
 * The body-rule pipeline; steps run in the listed order, and order matters.
 * Each step rewrites one line; `when` (on the file path) gates conditional
 * steps; the `patches` marker step is where data-driven body patches run.
 *
 * @param {Record<string, string>} v - Base release version per module.
 * @returns {BodyStep[]}
 */
export function buildBodyPipeline(v) {
  return [
    // Semconv
    {
      when: /^tmp\/semconv/,
      search: /(\]\()\/docs\//g,
      replace: `$1${specBasePath}/semconv/`,
    },
    {
      when: /^tmp\/semconv/,
      search: /(\]:\s*)\/docs\//,
      replace: `$1${specBasePath}/semconv/`,
    },
    {
      when: /^tmp\/semconv/,
      search: /\((\/model\/.*?)\)/g,
      replace: `(${semconvSpecRepoUrl}/tree/v${v.semconv}/$1)`,
    },

    // SPECIFICATION custom processing
    {
      search:
        /\(https:\/\/github.com\/open-telemetry\/opentelemetry-specification\)/,
      replace: `(${specBasePath}/otel/)`,
    },
    {
      search: /(\]\()\/specification\//,
      replace: `$1${specBasePath}/otel/)`,
    },
    {
      when: /otel\/specification/,
      search: /\.\.\/specification\/(.*?\))/g,
      replace: '../otel/$1',
    },

    // Match markdown inline links or link definitions to OTel spec pages:
    // "[...](URL)" or "[...]: URL"
    {
      search: new RegExp(
        `(\\]:\\s+|\\()https://github.com/open-telemetry/opentelemetry-specification/\\w+/(main|v${v.spec})/specification(.*?\\)?)`,
      ),
      replace: `$1${specBasePath}/otel$3`,
    },

    // Match links to OTLP
    {
      search:
        /(\]:\s+|\()?https:\/\/github.com\/open-telemetry\/opentelemetry-proto\/(\w+\/.*?\/)?docs\/specification.md(\)?)/g,
      replace: `$1${specBasePath}/otlp/$3`,
    },
    {
      search:
        /github.com\/open-telemetry\/opentelemetry-proto\/docs\/specification.md/g,
      replace: 'OTLP',
    },

    // Localize links to semconv
    {
      search: new RegExp(
        `(\\]:\\s+|\\()https://github.com/open-telemetry/semantic-conventions/\\w+/(main|v${v.semconv})/docs(.*?\\)?)`,
        'g',
      ),
      replace: `$1${specBasePath}/semconv$3`,
    },

    // Images
    {
      search: /(\.\.\/)?internal(\/img\/[-\w]+\.png)/g,
      replace: '$2',
    },
    {
      when: (path) =>
        !/(logs|schemas)._index/.test(path) && !/otlp\/docs/.test(path),
      search: /(\]\()(img\/.*?\))/g,
      replace: '$1../$2',
    },
    {
      when: /\btmp\/semconv\/docs\/general\/attributes/,
      search: /(\]\()([^)]+\.png\))/g,
      replace: '$1../$2',
    },
    {
      when: /\btmp\/semconv\/docs\/http\/http-spans/,
      search: /(\]\()([^)]+\.png\))/g,
      replace: '$1../$2',
    },

    // Rewrite paths that are outside of the spec folders as external links:
    {
      when: /specification._index/,
      search: /\.\.\/README.md/g,
      replace: `${otelSpecRepoUrl}/`,
    },
    {
      when: /specification\/library-guidelines.md/,
      search: /\.\.\/README.md/,
      replace: '/docs/specs/otel/',
    },
    {
      search: /(\.\.\/)+((?:oteps|supplementary-guidelines)\/[^)]+)/g,
      replace: `${otelSpecRepoUrl}/tree/v${v.spec}/$2`,
    },
    {
      when: /^tmp\/otlp/,
      search: /\.\.\/((?:examples\/)?README\.md)/g,
      replace: `${otlpSpecRepoUrl}/tree/v${v.otlp}/$1`,
    },

    { patches: 'body' },

    // Make website-local page references local:
    {
      search: /https:\/\/opentelemetry.io\//g,
      replace: '/',
    },

    // OTLP proto files: link into the repo:
    {
      when: /\btmp\/otlp/,
      search: /\.\.\/(opentelemetry\/proto\/?.*)/g,
      replace: `${otlpSpecRepoUrl}/tree/v${v.otlp}/$1`,
    },

    // OpAMP
    {
      search: /\]\((proto\/opamp.proto)\)/,
      replace: `](${opAmpSpecRepoUrl}/blob/v${v.opamp}/$1)`,
    },
  ];
}

/**
 * Transform the Markdown of one copied spec page into its website form.
 *
 * @param {Object} args
 * @param {string} args.path - File path relative to the repo root; must start
 *   with `tmp/` for the module-specific rules to match.
 * @param {string} args.text - File content.
 * @param {Record<string, string>} args.versions - Base release per module
 *   ('spec', 'otlp', 'semconv', 'opamp').
 * @param {ApplyPatches} [args.applyPatches]
 * @param {Log} [args.log]
 * @returns {string} The transformed content.
 */
export function transform({ path, text, versions, applyPatches, log }) {
  const _log = log ?? consoleLog;
  const _applyPatches = applyPatches ?? noPatches;
  const lines = text.split(/(?<=\n)/);
  const pipeline = buildBodyPipeline(versions).filter((step) => {
    const when = 'when' in step ? step.when : undefined;
    if (!when) return true;
    return when instanceof RegExp ? when.test(path) : when(path);
  });

  /** @type {string[]} */
  const out = [];
  let frontMatterFromFile = '';
  let title = '';
  let linkTitle = '';
  let idx = 0;
  /** @type {() => string | undefined} */
  const read = () => lines[idx++];

  function printFrontMatter() {
    out.push('---\n');
    if (title === 'OpenTelemetry Specification') {
      title += ` ${versions.spec}`;
      frontMatterFromFile = frontMatterFromFile.replace(
        /(linkTitle:) .*/,
        `$1 OTel ${versions.spec}`,
      );
      // TODO: add to spec landing page
      if (!/^\s*weight/.test(frontMatterFromFile))
        frontMatterFromFile += 'weight: 10\n';
    } else if (title === 'OpenTelemetry Protocol Specification') {
      frontMatterFromFile = frontMatterFromFile.replace(
        /(title|linkTitle): .*/g,
        `$& ${versions.otlp}`,
      );
      // TODO: add to spec landing page
      if (!/^\s*weight/.test(frontMatterFromFile))
        frontMatterFromFile += 'weight: 20\n';
    } else if (/^tmp\/semconv\/docs\/\w+.md$/.test(path)) {
      // only docs/README.md
      title += ` ${versions.semconv}`;
      frontMatterFromFile = frontMatterFromFile.replace(
        /linkTitle: .*/,
        `$& ${versions.semconv}`,
      );
    }

    frontMatterFromFile = _applyPatches(
      'front-matter',
      path,
      frontMatterFromFile,
    );

    const titleMaybeQuoted = title.includes(':') ? `"${title}"` : title;
    if (!/title: /.test(frontMatterFromFile))
      out.push(`title: ${titleMaybeQuoted}\n`);
    const m = title.match(/^OpenTelemetry (Protocol )?(.*)/);
    if (m) linkTitle = m[2];
    // TODO: add to front matter of OTel spec file and drop next line:
    if (title === 'Design Goals for OpenTelemetry Wire Protocol')
      linkTitle = 'Design Goals';

    if (linkTitle && !/linkTitle: /.test(frontMatterFromFile))
      out.push(`linkTitle: ${linkTitle}\n`);
    if (frontMatterFromFile) out.push(frontMatterFromFile);
    out.push('---\n');
  }

  let cur = read();

  // Skip a single-line markdownlint directive at the top of the file. Added
  // to handle https://github.com/open-telemetry/opentelemetry.io/issues/7750
  if (cur !== undefined && /^<!--\s*markdownlint.*-->\s*$/.test(cur)) {
    cur = read();
  }

  // Extract Hugo front matter encoded as a comment:
  if (cur !== undefined && /^(<!)?--- (# )?Hugo/.test(cur)) {
    while ((cur = read()) !== undefined) {
      if (/^--->?/.test(cur)) break;
      frontMatterFromFile += cur;
    }
    cur = cur === undefined ? undefined : read();
  }

  while (cur !== undefined) {
    if (!title) {
      const m = cur.match(/^#\s+(.*)/);
      if (m) {
        title = m[1];
        linkTitle = '';
        printFrontMatter();
      }
      cur = read();
      continue;
    }

    if (/<details>/.test(cur)) {
      while ((cur = read()) !== undefined) {
        if (/<\/details>/.test(cur)) break;
      }
      cur = cur === undefined ? undefined : read();
      continue;
    }

    if (/<!-- toc -->/.test(cur)) {
      const tocstop = '<!-- tocstop -->';
      while ((cur = read()) !== undefined) {
        if (cur.includes(tocstop)) break;
        if (/^\s*([-\+\*]\s|$)/.test(cur)) continue;
        _log.warn(
          `WARN ${path}:${idx}: missing '${tocstop}' directive? Aborting toc scan at line:\n  ${idx}: ${cur}`,
        );
        out.push(cur);
        break;
      }
      cur = cur === undefined ? undefined : read();
      continue;
    }

    for (const rule of pipeline) {
      if ('patches' in rule) {
        cur = _applyPatches('body', path, cur);
      } else {
        cur = cur.replace(rule.search, rule.replace);
      }
    }

    out.push(cur);
    cur = read();
  }

  if (!title) {
    _log.warn(
      `WARN: ${path}: no level 1 heading found, so no page will be generated`,
    );
  }

  return out.join('');
}
