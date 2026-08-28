// Committed supply-chain audit: proves, from the committed manifests, lock,
// .npmrc, and netlify.toml alone, that the install-hardening invariants
// still hold, so integrity claims regenerate from this test instead of ad
// hoc audit runs. The audited controls:
// https://opentelemetry.io/site/design/supply-chain-security/
// Out of scope: the Docsy theme-deps install (themes/docsy runs under its
// own project config and audits itself upstream), and the build-side
// scripts past the install boundary (see the pin-boundary comment below).

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseToml } from 'smol-toml';

import { UNSAFE_HUGO_ENV } from './rebuild-hugo-extended.mjs';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const readJSON = (relPath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'));
const readText = (relPath) =>
  fs.readFileSync(path.join(repoRoot, relPath), 'utf8');

const lock = readJSON('package-lock.json');
const manifest = readJSON('package.json');

// Dependencies allowed to bypass the npm registry in the lock check;
// currently none. A reviewed exception populates this and must also
// change the manifest registry-resolution check below.
const gitDependencyRepos = {};

// Known-poisoned package@version pairs from the 2026-08 npm-worm campaign
// (Datadog Security Labs). A denylist only ever samples: the structural
// checks (registry + integrity, allowlists) are the load-bearing part.
// Refresh this list when intentionally updating dependencies.
const packageIocs = new Set([
  'keyv@6.0.0',
  '@cacheable/net@2.1.1',
  '@cacheable/node-cache@3.1.2',
  'cacheable@2.5.1',
  'flat-cache@6.1.24',
  'cacheable-request@13.0.20',
  '@cacheable/memory@2.2.1',
  'file-entry-cache@11.1.6',
  '@cacheable/utils@2.5.1',
  'cache-manager@7.2.10',
  'ecto@5.0.1',
]);

// A workspace member appears in the lock as a directory entry plus a
// node_modules/ symlink, neither a registry artifact. Excluded from the
// per-package checks: the directory entries of declared members, and
// symlinks resolving to them (an undeclared directory entry, e.g. a
// file: dependency, still fails the registry check). The workspaces
// test below pins the member list.
const workspaceDirs = manifest.workspaces ?? [];
const lockEntries = Object.entries(lock.packages).filter(
  ([key, pkg]) =>
    key !== '' &&
    !workspaceDirs.includes(key) &&
    !(pkg.link && workspaceDirs.includes(pkg.resolved)),
);

// The runtime helper exports the unsafe-installer-control names; its
// unit test pins the content literally.
const unsafeHugoEnv = new Set(UNSAFE_HUGO_ENV);
const envLeavesInstallConfigUntouched = (key) => {
  const normalized = key.toUpperCase();
  return (
    !normalized.startsWith('NPM_CONFIG_') &&
    normalized !== 'HUGO' &&
    normalized !== 'NODE_OPTIONS' &&
    !unsafeHugoEnv.has(normalized)
  );
};

test('lock: every package is registry+integrity or an allowlisted git pin', () => {
  let registryPackages = 0;
  for (const [key, pkg] of lockEntries) {
    if (key in gitDependencyRepos) {
      assert.match(
        pkg.resolved ?? '',
        new RegExp(
          `^git\\+ssh://git@github\\.com/${gitDependencyRepos[key]}\\.git#[0-9a-f]{40}$`,
        ),
        `${key} is commit-pinned to its reviewed repo`,
      );
    } else {
      const keyName = key.slice(
        key.lastIndexOf('node_modules/') + 'node_modules/'.length,
      );
      // npm trusts only the identity baked into the registry URL
      // (@npmcli/arborist script-allowed.js), so bind key, name field, and
      // URL to one identity; aliases are not in use, and adding one is a
      // deliberate review event.
      assert.ok(
        pkg.name === undefined || pkg.name === keyName,
        `${key} is not an alias`,
      );
      assert.equal(
        pkg.resolved,
        `https://registry.npmjs.org/${keyName}/-/${keyName.split('/').pop()}-${pkg.version}.tgz`,
        `${key} resolves to its own name and version on the npm registry`,
      );
      assert.match(
        pkg.integrity ?? '',
        /^sha512-[A-Za-z0-9+/]{86}==$/,
        `${key} carries a full sha512 integrity hash`,
      );
      registryPackages += 1;
    }
  }
  assert.ok(registryPackages > 0, 'registry packages were audited');
});

test('lock: every package version is absent from the campaign IOC list', () => {
  assert.ok(packageIocs.size > 0, 'the IOC denylist has entries');
  let checked = 0;
  for (const [key, pkg] of lockEntries) {
    // Fail closed: a version-less entry could carry an IOC-listed tarball
    // past the denylist under a name the key still spells out.
    assert.ok(pkg.version, `${key} carries a version for the IOC check`);
    // Both identities: the lock key names what's installed, pkg.name (npm
    // aliases) what it really is; a spoofed name field must not clear the
    // key-derived one.
    const keyName = key.slice(
      key.lastIndexOf('node_modules/') + 'node_modules/'.length,
    );
    for (const name of new Set([keyName, pkg.name ?? keyName])) {
      checked += 1;
      assert.ok(
        !packageIocs.has(`${name}@${pkg.version}`),
        `${name}@${pkg.version} is absent from the IOC list`,
      );
    }
  }
  assert.ok(checked > 0, 'locked package versions were audited');
});

test('lock and manifest: install scripts stay inventoried in allowScripts', () => {
  const { allowScripts } = manifest;
  const covered = new Set();
  let withInstallScript = 0;
  for (const [key, pkg] of lockEntries) {
    if (!pkg.hasInstallScript) continue;
    withInstallScript += 1;
    const name = key.slice(
      key.lastIndexOf('node_modules/') + 'node_modules/'.length,
    );
    // Coverage takes one of the two reviewed forms: a name-level denial
    // (false, version-independent) or an exact-version approval that must
    // track the locked version -- a stale pin fails npm ci under
    // strict-allow-scripts, and this assertion names the fix in the bump
    // PR itself.
    if (allowScripts[name] === false) {
      covered.add(name);
      continue;
    }
    assert.equal(
      allowScripts[`${name}@${pkg.version}`],
      true,
      `allowScripts covers ${name} at its locked version ${pkg.version}`,
    );
    covered.add(`${name}@${pkg.version}`);
  }
  assert.ok(withInstallScript > 0, 'install-script packages were audited');
  // The reverse direction: no stale or speculative allowScripts entries
  // beyond what the lock needs.
  assert.deepEqual(
    Object.keys(allowScripts).sort(),
    [...covered].sort(),
    'allowScripts lists exactly the locked install-script packages',
  );
});

function npmrcSettings(path) {
  return readText(path)
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) => line !== '' && !line.startsWith('#') && !line.startsWith(';'),
    )
    .sort();
}

test('.npmrc carries exactly the reviewed npm settings', () => {
  // npm takes a key's last assignment, so spot-checks can be reversed by
  // a later line, and any unpinned addition (node-options=--require ...,
  // ignore-scripts=false) changes install behavior: pin the full
  // assignment set (order-insensitively; duplicates surface as extra
  // lines). Each setting's rationale is documented at
  // https://opentelemetry.io/site/build/dependencies/#controls
  assert.deepEqual(
    npmrcSettings('.npmrc'),
    ['engine-strict=true', 'min-release-age=7', 'strict-allow-scripts=true'],
    'the npm settings match the reviewed set',
  );
});

test('workspaces: the reviewed member set, no shadow config or scripts', () => {
  // npm resolves config and the lock at the workspace root, so a member
  // carrying its own .npmrc or lock would be dead weight that reads as a
  // control; and a new member widens the audited install surface, so the
  // list itself is pinned.
  assert.deepEqual(
    manifest.workspaces,
    ['scripts/generate-community-data'],
    'the workspace list matches the reviewed set',
  );
  for (const dir of manifest.workspaces) {
    for (const shadow of ['.npmrc', 'package-lock.json']) {
      assert.ok(
        !fs.existsSync(path.join(repoRoot, dir, shadow)),
        `${dir} defers ${shadow} to the workspace root`,
      );
    }
    // npm runs a member's install-lifecycle scripts as project code, not
    // as dependency scripts, so allowScripts and strict-allow-scripts
    // never gate them. Nothing invokes member scripts (installs run root
    // scripts; the workflow calls node directly), so pin the whole
    // surface empty rather than screening lifecycle names.
    assert.deepEqual(
      JSON.parse(readText(`${dir}/package.json`)).scripts ?? {},
      {},
      `${dir} carries no scripts`,
    );
  }
});

test("the lock root carries the manifest's engines", () => {
  // The lock captures engines at generation time; a floor raised in the
  // manifest without the reconcile run leaves the lock stale.
  assert.deepEqual(
    lock.packages[''].engines,
    manifest.engines,
    'the lock root engines match the manifest',
  );
});

test('manifest: engines floor stays at or above the reviewed minimums', () => {
  // The npm floor is the oldest version trusted to enforce the controls
  // (strict allowScripts; min-release-age-exclude support); the floor
  // only rises:
  // https://opentelemetry.io/site/build/dependencies/#npm-version-floor
  const { engines } = manifest;
  const npmFloor = engines.npm.match(/^>=(\d+)\.(\d+)\.(\d+)$/);
  assert.ok(npmFloor, 'engines.npm is a >=x.y.z floor');
  const [major, minor] = npmFloor.slice(1).map(Number);
  assert.ok(
    major > 11 || (major === 11 && minor >= 18),
    'engines.npm floor is at least 11.18 (allowScripts enforcement, min-release-age-exclude)',
  );
  assert.match(engines.node, /^>=\d+$/, 'engines.node is a major floor');
  // npm skips the root engines check entirely when devEngines is present
  // (@npmcli/arborist build-ideal-tree.js), so its absence is part of the
  // floor.
  assert.equal(
    manifest.devEngines,
    undefined,
    'devEngines stays absent, so the engines floor binds',
  );
});

// npm applies overrides only while re-resolving and trusts an in-sync
// lock as-is, so the adm-zip override (GHSA-xcpc-8h2w-3j85, via
// hugo-extended) is pinned from the committed manifests: the lock must
// carry the fixed version, and the override must stay justified by
// hugo-extended's own declared range. Revisit on a hugo-extended bump;
// drop the override (and this test) only once that range includes the
// 0.6.0 fix (jakejarvis/hugo-extended#256).
test('lock and manifest: the adm-zip override is applied and still needed', () => {
  assert.deepEqual(
    manifest.overrides,
    { 'adm-zip': '0.6.0' },
    'overrides carries exactly the reviewed entries',
  );
  assert.match(
    lock.packages['node_modules/adm-zip'].version,
    /^0\.6\./,
    'the locked adm-zip carries the GHSA-xcpc-8h2w-3j85 fix',
  );
  assert.equal(
    lock.packages['node_modules/hugo-extended'].dependencies['adm-zip'],
    '^0.5.17',
    'hugo-extended declares the adm-zip range that justifies the override',
  );
});

test('manifest: every dependency resolves through the npm registry', () => {
  const {
    dependencies = {},
    devDependencies = {},
    optionalDependencies = {},
  } = manifest;
  for (const [name, spec] of [
    ...Object.entries(dependencies),
    ...Object.entries(devDependencies),
    ...Object.entries(optionalDependencies),
  ]) {
    assert.doesNotMatch(
      spec,
      /^(github:|git\+|git:)/,
      `${name} resolves through the npm registry`,
    );
  }
});

test('manifest and lock: unscoped markdownlint-rule-link-pattern stays absent', () => {
  // npm-security-held after GHSA-q3xp-j858-q9xf; the project's package is
  // @pchalin/markdownlint-rule-link-pattern.
  const unscoped = 'markdownlint-rule-link-pattern';
  for (const [section, bag] of [
    ['dependencies', manifest.dependencies],
    ['devDependencies', manifest.devDependencies],
    ['optionalDependencies', manifest.optionalDependencies],
  ]) {
    assert.ok(
      !(bag && unscoped in bag),
      `${unscoped} is absent from ${section}`,
    );
  }
  assert.ok(
    !(`node_modules/${unscoped}` in lock.packages),
    `${unscoped} is absent from the lock`,
  );
});

// Exact pins: prefix/flag matching would accept an appended `&& npm
// install ...` rider on a script other checks trust by name. The pinned
// set is the install closure: every script reachable by fixed name from
// the Netlify commands and the install contract, up to (not including)
// the build:* half, whose scripts execute the site build's repo code
// wholesale and change under normal development.
test('manifest: the install path keeps its locked, script-free form', () => {
  const { scripts } = manifest;
  const pins = {
    'install:safe': 'npm ci --ignore-scripts && npm run ci:prepare',
    'ci:min': 'npm ci --ignore-scripts',
    'ci:prepare': 'node scripts/rebuild-hugo-extended.mjs && npm run prepare',
    '_netlify:prepare':
      'npm run -s is:clean && npm run install:safe && npm run -s is:clean',
    'netlify-build:preview':
      'npm run seq -- _netlify:prepare build:preview diff:check',
    'netlify-build:production':
      'npm run seq -- _netlify:prepare build:production diff:check',
    seq: 'bash -c \'for cmd in "$@"; do npm run $cmd || exit 1; done\' - ',
    'is:clean':
      'bash -c \'o=$(git status --porcelain -uall) && { echo "$o"; [ -z "$o" ]; }\'',
    'diff:check':
      "npm run _diff:check || (echo; echo 'WARNING: the files above have not been committed'; echo)",
    '_diff:check': 'git diff --name-only --exit-code',
    prepare: 'npm run seq -- get:submodule _prepare:docsy',
    'get:submodule':
      'bash -c \'npm run "_get:${GET:-submodule}" -- "$@" && npm run -s _postget:submodule\' -',
    '_get:submodule':
      'set -x && git submodule update --init ${DEPTH:- --depth 999}',
    '_get:no': 'echo SKIPPING get operation',
    '_postget:submodule':
      'npm run -s _git:submodule-status && echo && scripts/update-semconv-mounts.pl',
    '_git:submodule-status': 'git submodule',
    '_prepare:docsy': 'cd themes/docsy && npm run install:theme-deps',
    postinstall:
      "git diff --quiet -- package-lock.json || echo '⚠️ package-lock.json differs after this install. If you changed dependencies, commit the lock together with package.json; otherwise restore the lock and investigate before committing.'",
  };
  for (const [name, pin] of Object.entries(pins)) {
    assert.equal(scripts[name], pin, `${name} keeps its reviewed form`);
  }
  // Root lifecycle hooks run on local `npm install`, a documented install
  // path: postinstall is pinned above; the rest stay absent.
  assert.equal(scripts.preinstall, undefined, 'preinstall stays absent');
  assert.equal(scripts.install, undefined, 'install stays absent');
  // npm wraps every script in implicit pre<name>/post<name> hooks; a hook
  // pair outside the reviewed set is unreviewed code on a trusted name's
  // execution path. Exact-set equality covers both directions: a scan that
  // finds nothing fails against the non-empty reviewed set, and a hook
  // removed from scripts must leave the reviewed set with it.
  const reviewedHooks = [
    'precheck:collector-sync',
    'precheck:collector-sync:lint',
    'precheck:collector-sync:types',
    'prefix:collector-sync:lint',
  ];
  const names = new Set(Object.keys(scripts));
  const foundHooks = [];
  for (const name of names) {
    for (const hook of [`pre${name}`, `post${name}`]) {
      if (names.has(hook)) foundHooks.push(hook);
    }
  }
  assert.deepEqual(
    foundHooks.sort(),
    reviewedHooks.sort(),
    'the implicit hook pairs are exactly the reviewed set',
  );
});

// Limited anchor: these pins hold only when this suite runs, so they
// catch same-PR partial edits, not a CI wiring drop.
test('manifest: the runner that carries this audit stays wired', () => {
  assert.equal(
    manifest.scripts['test:local-tools'],
    'node --test "scripts/**/*.test.mjs"',
    'test:local-tools is the reviewed runner and glob',
  );
  for (const file of [
    'scripts/supply-chain-audit.test.mjs',
    'scripts/rebuild-hugo-extended.test.mjs',
  ]) {
    assert.ok(fs.existsSync(path.join(repoRoot, file)), `${file} exists`);
  }
});

test('netlify.toml: auto-install stays inert and build commands stay pinned', () => {
  // Parsed, not line-scanned: TOML admits too many valid spellings
  // (quoted, dotted, and inline-table keys, context tables) for a line
  // regex to screen, so pin the whole build surface as an allowlist.
  // NPM_FLAGS is what constrains the auto-install to resolution only:
  // https://opentelemetry.io/site/build/dependencies/#inert-netlify-auto-install
  const config = parseToml(readText('netlify.toml'));
  assert.deepEqual(
    Object.keys(config).sort(),
    ['build', 'context', 'edge_functions', 'headers', 'redirects'],
    'netlify.toml carries exactly the reviewed top-level tables',
  );
  // The build table is the execution surface: command and any ignore
  // command run in the build container, and [build.environment] feeds
  // every build process (NPM_CONFIG_* outranks .npmrc, NODE_OPTIONS
  // injects code, HUGO_* steers the installer). Pinning the exact key
  // sets forbids ignore, plugins, and any env addition wholesale.
  const { build, context } = config;
  assert.deepEqual(
    Object.keys(build).sort(),
    ['command', 'environment', 'publish'],
    'the build table carries exactly the reviewed keys',
  );
  assert.equal(build.publish, 'public', 'the publish dir is the reviewed one');
  assert.equal(
    build.command,
    'npm run netlify-build:preview',
    'the default build command is the reviewed chain',
  );
  assert.deepEqual(
    context,
    { production: { command: 'npm run netlify-build:production' } },
    'context tables hold exactly the reviewed production command',
  );
  assert.deepEqual(
    Object.keys(build.environment).sort(),
    ['NPM_FLAGS', 'NPM_VERSION'],
    'the build environment carries exactly the reviewed keys',
  );
  for (const key of Object.keys(build.environment)) {
    assert.ok(
      envLeavesInstallConfigUntouched(key),
      `Netlify env ${key} leaves npm, Node, and Hugo config untouched`,
    );
  }
  assert.equal(
    build.environment.NPM_FLAGS,
    '--dry-run --ignore-scripts',
    'NPM_FLAGS constrains the Netlify auto-install to resolution only',
  );
  // NPM_VERSION is what satisfies the engines floor on Netlify; keep the
  // two in sync without repinning on routine bumps.
  const [pinnedMajor, pinnedMinor] =
    build.environment.NPM_VERSION.split('.').map(Number);
  const [floorMajor, floorMinor] = manifest.engines.npm
    .match(/^>=(\d+)\.(\d+)\.(\d+)$/)
    .slice(1)
    .map(Number);
  assert.ok(
    pinnedMajor > floorMajor ||
      (pinnedMajor === floorMajor && pinnedMinor >= floorMinor),
    'NPM_VERSION satisfies the engines.npm floor',
  );
});
