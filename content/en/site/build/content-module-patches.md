---
title: Content module patches
description: >-
  Creating and managing temporary patches for content modules between releases.
weight: 15
---

Spec pages published on this site (OTel specification, OTLP, semantic
conventions, OpAMP) come from upstream repositories managed as git submodules
under [`content-modules/`][content-modules]. Because the website pins a specific
release of each submodule, the raw Markdown is a snapshot that can only be
updated by bumping to a newer release.

When you run [`npm run cp:spec`](../npm-scripts/#submodules-and-content),
[`cp-pages.sh`][cp-pages] copies submodule content into `tmp/`, renames
`README.md` files to `_index.md`, and then runs the [`adjust-pages`][script]
script over every Markdown file. Hugo mounts `tmp/` into the site tree so the
processed pages appear under `/docs/specs/`.

## What the script does

Spec Markdown files are written for GitHub rendering: they have no Hugo front
matter, their links point to GitHub URLs, and image paths assume the repository
layout. The [`adjust-pages`][script] script bridges this gap by applying the
following transformations to each file:

- **Front matter injection** — Extracts the first `# Heading` as `title`,
  generates `linkTitle`, and emits Hugo front matter. Supports front matter
  embedded in `<!--- Hugo ... --->` comment blocks.
- **Version stamping** — Appends spec version numbers (e.g., `1.54.0`) to titles
  and linkTitles for OTel spec, OTLP, and semconv landing pages.
- **URL rewriting** — Converts absolute GitHub URLs for spec repositories into
  local `/docs/specs/...` paths so cross-spec links work on the site.
- **Image path adjustment** — Rewrites relative image paths so they resolve
  correctly from the Hugo page location.
- **Content stripping** — Removes `<details>` blocks and `<!-- toc -->` sections
  that are not needed on the site.
- **Temporary patches** — Applies regex-based patches for spec issues that have
  not yet been fixed in a release (see below).

The transformations run as an ordered rule pipeline in the script's
[`index.mjs`][script], and order matters. When changing them, regenerate the
spec pages and review a before/after diff of `tmp/`, updating the script's
characterization tests (`index.test.mjs`) to match.

Spec versions are declared in [`data/spec-versions.yml`][spec-versions] — a Hugo
data file, so templates can access them too — and are updated automatically by
the version-update workflows. At `cp:spec` time, the script verifies that each
version matches the base release of the corresponding `*-pin` entry of
[`.gitmodules`][gitmodules], and fails if they diverge. (A pin can be a
`git describe` identifier rather than an exact release — for example, on
draft-spec integration branches.)

## Patching specs between releases {#patching-specs}

Fixing a broken link or incorrect content in a spec requires a PR to the
upstream repository, a new release, and a submodule bump in this repository.
That process can take weeks or months. In the meantime, the broken content
causes CI failures — most commonly in the automated `otelbot/refcache-refresh`
PRs that check every external link on the site.

To unblock CI without waiting for an upstream release, you can add a temporary
patch to [`patches.yml`][patches] — no code changes needed. Patches are
regex-based rewrites that run at build time and include built-in version
tracking: once the spec advances past the patch's version range, `cp:spec`
prints a warning that the patch is obsolete and can be removed.

### 1. Add a patch entry

Patches are declared in [`patches.yml`][patches], as entries of a YAML list.
Append a new entry (replacing the `[]` marker if the list is empty):

```yaml
- id: 2025-11-21-docker-api-versions
  module: semconv
  minVers: 1.39.0-dev
  file: ^tmp/semconv/docs/
  search: '(https://docs\.docker\.com/reference/api/engine/version)/v1\.(43|51)/(#tag/)'
  replace: '$1/v1.52/$3'
  flags: g
  notes: >-
    Replace older Docker API versions with the latest. See
    open-telemetry/semantic-conventions#3103; upstreamed fix:
    open-telemetry/semantic-conventions#3093
```

The fields for each patch entry are:

- **`id`** — A unique ID (date + short description) printed in log messages.
- **`module`** — One of `spec`, `otlp`, or `semconv`.
- **`minVers`** — Inclusive lower bound. The patch applies while the submodule
  version is at or above this version, and becomes obsolete once the spec
  advances past the patch's version range.
- **`maxVers`** — Optional exclusive upper bound. If omitted, it defaults to
  `minVers` with its patch number incremented (for example, `1.55.0` implies
  `maxVers = 1.55.1`), which matches the original prefix-match behavior. When
  set explicitly, the patch is skipped once the submodule version reaches
  `maxVers` (that is, it applies only while the version is `< maxVers`).
- **`file`** — Optional regular expression matching the file paths the patch
  should apply to, for example `^tmp/semconv/docs/`. If omitted, defaults to the
  module's spec/docs tree: `^tmp/otel/specification/` for `spec`,
  `^tmp/otlp/docs/` for `otlp`, and `^tmp/semconv/docs/` for `semconv`.
- **`context`** — Optional: `body|front-matter` (default: `body`). Body patches
  are applied line by line; `front-matter` patches are applied to the whole
  front-matter block.
- **`search`** — The JavaScript `RegExp` source for the text to replace. Prefer
  single-quoted YAML so that backslashes stay literal.
- **`replace`** — The replacement, using JavaScript replacement syntax (`$1`,
  `$<name>`, `$&`). Use named capture groups when a digit follows a group
  reference: `$108` is ambiguous.
- **`flags`** — Optional `RegExp` flags, typically `g` to replace all
  occurrences.
- **`notes`** — Optional free text: what the patch does, plus upstream issue/PR
  links.

No separate registration step is needed — the script applies every entry in
[`patches.yml`][patches] during the build.

### 2. Test the patch

Run the spec copy step and verify the patch was applied:

```sh
npm run cp:spec
```

A successful run shows no errors. You can then search the `tmp/` output for the
problematic content to confirm it was rewritten. For link-related patches, also
run:

```sh
npm run fix:refcache  # Prunes stale refcache entries, then checks links
npm test              # Full test run including link checking
```

### 3. Commit and push

If your patch was created while fixing a refcache PR (e.g., the
`otelbot/refcache-refresh` branch), commit the changes to `patches.yml` together
with the updated `refcache.json`, then force-push with lease:

```sh
git add scripts/content-modules/adjust-pages/patches.yml static/refcache.json
git commit -m "Patch content modules and refresh refcache"
git push --force-with-lease
```

### 4. Remove obsolete patches

Once a new release of the spec includes the fix, `cp:spec` prints a warning:

```text
INFO: scripts/content-modules/adjust-pages/cli.mjs: patch '<id>' is probably
obsolete now that spec '<name>' is at version '<new>' >= '<target>'; if so,
remove the patch
```

When you see this message, delete the patch entry from [`patches.yml`][patches].
If it is the last remaining patch, you may comment it out instead of deleting,
to preserve it as a reference for future patches.

[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules
[cp-pages]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/cp-pages.sh
[gitmodules]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.gitmodules
[patches]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/adjust-pages/patches.yml
[script]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/content-modules/adjust-pages
[spec-versions]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/data/spec-versions.yml
