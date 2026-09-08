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
// currently none. A reviewed exception populates this.
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
// each member's one canonical node_modules/NAME link (any other link --
// an alias key, a file: dependency -- still fails the registry check).
// The workspaces test below pins the member list and binds each
// directory to its package name.
const workspaceDirs = manifest.workspaces ?? [];
const workspaceNameByDir = Object.fromEntries(
  workspaceDirs.map((dir) => [
    dir,
    JSON.parse(readText(`${dir}/package.json`)).name,
  ]),
);
const lockEntries = Object.entries(lock.packages).filter(
  ([key, pkg]) =>
    key !== '' &&
    !workspaceDirs.includes(key) &&
    !(
      pkg.link &&
      workspaceDirs.includes(pkg.resolved) &&
      key === `node_modules/${workspaceNameByDir[pkg.resolved]}`
    ),
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
  // npm resolves config and the lock at the workspace root for
  // root-invoked installs (an install run inside the member directory
  // answers to neither), so a member carrying its own .npmrc or lock
  // would be dead weight that reads as a control; and a new member
  // widens the audited install surface, so the list itself is pinned. Names are org-scoped: an unscoped name in a
  // public manifest is claimable on the registry by anyone (private:true
  // only stops publishing from here), while @opentelemetry publishes
  // only for the org.
  const reviewedWorkspaces = {
    'scripts/generate-community-data': '@opentelemetry/generate-community-data',
  };
  assert.deepEqual(
    manifest.workspaces,
    Object.keys(reviewedWorkspaces),
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
    // as dependency scripts, and links a member's bin entries onto the
    // PATH every npm-run script uses, so allowScripts and
    // strict-allow-scripts never gate either surface. Nothing invokes
    // member scripts or bins (installs run root scripts; the workflow
    // calls node directly), so pin the whole manifest key set rather
    // than screening lifecycle names or bin spellings.
    const member = JSON.parse(readText(`${dir}/package.json`));
    assert.deepEqual(
      Object.keys(member).sort(),
      ['dependencies', 'name', 'private', 'type'],
      `${dir} carries exactly the reviewed manifest keys`,
    );
    // Bind directory, package name, and the canonical lock link to one
    // identity: the scheduled workflow selects the member by this name,
    // and the lock filter above trusts only this link key.
    assert.equal(
      member.name,
      reviewedWorkspaces[dir],
      `${dir} keeps the reviewed package name its workflow selector uses`,
    );
    assert.deepEqual(
      lock.packages[dir]?.name ?? member.name,
      member.name,
      `the lock's ${dir} entry carries the member name`,
    );
    assert.deepEqual(
      lock.packages[`node_modules/${member.name}`],
      { resolved: dir, link: true },
      `the lock links node_modules/${member.name} to ${dir} and nothing else`,
    );
    // The member has no synthesized install step either.
    assert.ok(
      !fs.existsSync(path.join(repoRoot, dir, 'binding.gyp')),
      `${dir} has no binding.gyp (would synthesize node-gyp rebuild)`,
    );
  }
});

test('lock: no package provides a bin that shadows a trusted command', () => {
  // npm links every package's bin entries into node_modules/.bin from
  // lock metadata alone -- --ignore-scripts does not suppress linking --
  // and npm-run scripts put that directory first on PATH. A bin named
  // after a command the install and build chain trusts (node, npm, git,
  // a shell) would hijack every later script step, so reserve those
  // names outright. npm normalizes bin on lock write (object form,
  // basenamed keys) and its linker basenames whatever it finds, so a
  // non-canonical spelling -- a string or array bin, a key carrying a
  // path separator -- is a hand-edited entry hiding the linked name
  // from this check: reject the spelling itself.
  const reservedBins = new Set([
    'node',
    'npm',
    'npx',
    'corepack',
    'yarn',
    'pnpm',
    'git',
    'bash',
    'sh',
    'perl',
  ]);
  let binNames = 0;
  for (const [key, pkg] of Object.entries(lock.packages)) {
    if (key === '' || pkg.bin === undefined) continue;
    assert.ok(
      typeof pkg.bin === 'object' && !Array.isArray(pkg.bin),
      `${key} spells bin in npm's canonical object form`,
    );
    for (const name of Object.keys(pkg.bin)) {
      binNames += 1;
      assert.doesNotMatch(
        name,
        /[/\\:]/,
        `${key} bin ${name} is a basenamed key, linked as spelled`,
      );
      assert.ok(
        !reservedBins.has(name),
        `${key} bin ${name} leaves trusted command names unshadowed`,
      );
    }
  }
  assert.ok(binNames > 0, 'lock bin entries were audited');
});

test('manifest: the engines floor keeps its binding shape', () => {
  // The floor's minimums are review-adjudicated policy; what the audit
  // guards is the shape that keeps engine-strict binding at runtime:
  // https://opentelemetry.io/site/build/dependencies/#npm-version-floor
  const { engines } = manifest;
  assert.match(engines.npm, /^>=\d+\.\d+\.\d+$/, 'engines.npm is a floor');
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
  // Root lifecycle entries run on local `npm install`, a documented
  // install path, and strict-allow-scripts gates dependency scripts
  // only, never the root project's. Enumerate npm's full install-time
  // root surface explicitly -- including the standalone entries that no
  // pre/post pairing reveals (prepublish runs on install; `dependencies`
  // runs after node_modules changes) -- and sanction only prepare and
  // postinstall, both pinned above.
  for (const lifecycle of [
    'preinstall',
    'install',
    'prepublish',
    'preprepare',
    'postprepare',
    'dependencies',
  ]) {
    assert.equal(scripts[lifecycle], undefined, `${lifecycle} stays absent`);
  }
  // With no explicit install script, a root binding.gyp makes npm
  // synthesize `node-gyp rebuild` as the install script.
  assert.ok(
    !fs.existsSync(path.join(repoRoot, 'binding.gyp')),
    'no root binding.gyp (would synthesize node-gyp rebuild)',
  );
  // npm prefers a root npm-shrinkwrap.json over package-lock.json, so a
  // committed one would swap the audited lock out from under this whole
  // suite.
  assert.ok(
    !fs.existsSync(path.join(repoRoot, 'npm-shrinkwrap.json')),
    'no npm-shrinkwrap.json (package-lock.json is the audited lock)',
  );
  // npm wraps every script in implicit pre<name>/post<name> hooks; a
  // hook on an install-closure name is unreviewed code riding a trusted
  // name's execution path -- and a new key the body pins above can't
  // catch. Scope: the pinned closure only; hooks elsewhere are the build
  // half's business, adjudicated in review.
  const names = new Set(Object.keys(scripts));
  const foundHooks = [];
  for (const name of Object.keys(pins)) {
    for (const hook of [`pre${name}`, `post${name}`]) {
      if (names.has(hook)) foundHooks.push(hook);
    }
  }
  assert.deepEqual(
    foundHooks,
    [],
    'no install-closure script has an implicit hook pair',
  );
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
  // NPM_VERSION's sufficiency against the engines floor is enforced at
  // build time by engine-strict (an undersized npm fails the install),
  // so the pin's value is adjudicated in review, not re-compared here.
  assert.match(
    build.environment.NPM_VERSION,
    /^\d+\.\d+\.\d+$/,
    'NPM_VERSION is an exact npm version pin',
  );
});
