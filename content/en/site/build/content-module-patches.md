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
`README.md` files to `_index.md`, and then runs [`adjust-pages.pl`][script] over
every Markdown file. Hugo mounts `tmp/` into the site tree so the processed
pages appear under `/docs/specs/`.

## What the script does

Spec Markdown files are written for GitHub rendering: they have no Hugo front
matter, their links point to GitHub URLs, and image paths assume the repository
layout. The [`adjust-pages.pl`][script] script bridges this gap by applying the
following transformations to each file:

| Transformation             | Description                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Front matter injection** | Extracts the first `# Heading` as `title`, generates `linkTitle`, and emits Hugo front matter. Supports front matter embedded in `<!--- Hugo ... --->` comment blocks. |
| **Version stamping**       | Appends spec version numbers (e.g., `1.54.0`) to titles and linkTitles for OTel spec, OTLP, and semconv landing pages.                                                 |
| **URL rewriting**          | Converts absolute GitHub URLs for spec repositories into local `/docs/specs/...` paths so cross-spec links work on the site.                                           |
| **Image path adjustment**  | Rewrites relative image paths so they resolve correctly from the Hugo page location.                                                                                   |
| **Content stripping**      | Removes `<details>` blocks and `<!-- toc -->` sections that are not needed on the site.                                                                                |
| **Temporary patches**      | Applies regex-based patches for spec issues that have not yet been fixed in a release (see below).                                                                     |

Spec versions are declared at the top of the script in the `%versionsRaw` hash
and are updated automatically by the version-update workflow.

## Patching specs between releases {#patching-specs}

Fixing a broken link or incorrect content in a spec requires a PR to the
upstream repository, a new release, and a submodule bump in this repository.
That process can take weeks or months. In the meantime, the broken content
causes CI failures — most commonly in the automated `otelbot/refcache-refresh`
PRs that check every external link on the site.

To unblock CI without waiting for an upstream release, you can add a temporary
patch to [`adjust-pages.pl`][script]. Patches are regex-based rewrites that run
at build time and include built-in version tracking: once the spec advances past
the target version, `cp:spec` prints a warning that the patch is obsolete and
can be removed.

### 1. Add a patch entry

Patches are defined in the `@patches` array near the top of the script. Each
entry is a hash with metadata and an `apply` subroutine. Append a new entry to
the array:

```perl
my @patches = (
  # ... existing patches ...
  {
    # For the problematic links, see:
    # https://github.com/open-telemetry/semantic-conventions/issues/3103
    #
    # Replace older Docker API versions with the latest:
    # https://github.com/open-telemetry/semantic-conventions/pull/3093
    id      => '2025-11-21-docker-api-versions',
    module  => 'semconv',
    minVers => '1.39.0-dev',
    maxVers => undef,
    file    => qr|^tmp/semconv/docs/|,
    apply   => sub {
      s{
        (https://docs.docker.com/reference/api/engine/version)/v1.(43|51)/(\#tag/)
      }{$1/v1.52/$3}gx;
    },
  },
);
```

The fields for each patch entry are:

| Field       | Description                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **id**      | A unique ID (date + short description) printed in log messages.                                                                                                                            |
| **module**  | One of `spec`, `otlp`, or `semconv`.                                                                                                                                                       |
| **minVers** | The spec version the patch applies to. The patch runs while the submodule is at this version and becomes obsolete once the spec advances past it.                                          |
| **maxVers** | Optional upper bound version. Set to `undef` if not needed. When set, the patch won't apply if the submodule version exceeds this value.                                                   |
| **file**    | A compiled regex matching the file paths the patch should apply to, for example `qr\|^tmp/semconv/docs/\|`.                                                                                |
| **context** | Optional. Set to `'frontmatter'` for patches that modify front matter. Defaults to `'body'` (patches that modify page content).                                                            |
| **apply**   | An anonymous subroutine containing the regex substitution. For body patches, it operates on `$_`. For front-matter patches, it operates on `$frontMatterFromFile` (via `$_` aliasing).     |

No separate registration step is needed — the `applyPatches` dispatcher
automatically iterates over all entries in `@patches` during the build.

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
`otelbot/refcache-refresh` branch), commit the changes to `adjust-pages.pl`
together with the updated `refcache.json`, then force-push with lease:

```sh
git add scripts/content-modules/adjust-pages.pl static/refcache.json
git commit -m "Patch adjust-pages.pl and refresh refcache"
git push --force-with-lease
```

### 4. Remove obsolete patches

Once a new release of the spec includes the fix, `cp:spec` prints a warning:

```text
INFO: adjust-pages.pl: patch '<id>' is probably obsolete now that
spec '<name>' is at version '<new>' >= '<target>'; if so, remove the patch
```

When you see this message, delete the patch entry from the `@patches` array. If
it is the last remaining patch, you may comment it out instead of deleting, to
preserve it as a reference for future patches.

[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules
[cp-pages]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/cp-pages.sh
[script]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/adjust-pages.pl
