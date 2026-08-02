---
title: Review registry PR
description: >-
  How to review PRs that change registry entries or ecosystem lists.
cSpell:ignore: BUSL SSPL
---

Follow these steps to review PRs that change [registry][] entries
(`data/registry/*.yml`) or the ecosystem lists (`data/ecosystem/*.yaml`). This
procedure covers the registry and ecosystem review layer only; for CI-check
decoding, CLA and label mechanics, and general content quality, use the
[review-pull-request][] skill. The [adding guide][adding], the [registry
schema][], and the [entry template][template] are the authoritative sources.
When this page drifts from them, trust them.

This procedure is read-only: never approve, label, or merge.

## Target PRs

Review the single PR when given a number or URL. With no argument, sweep:

1. List the open PRs labeled `registry`
   (`gh pr list --label registry --state open --json number,title,author,isDraft`).
2. Add open PRs that touch `data/ecosystem/`. Such PRs get no auto-applied
   label, so find them through their changed files (for example,
   `gh pr list --state open --json number,files` filtered locally).
3. Route before reviewing:
   - otelbot PRs on `otelbot/auto-update-registry-*` branches belong to the
     [approve-registry-update][] skill.
   - PRs that touch neither `data/registry/` nor `data/ecosystem/` belong to the
     [review-pull-request][] skill.
4. Report the sweep assessment before processing any PR: one line per PR with
   number, title, and whether you will process it (and the reason when skipped).

## Review a PR

1. Gather the PR metadata, diff, and checks (`gh pr view`, `gh pr diff`,
   `gh pr checks`). Classify each changed file: registry entry added, modified,
   or deleted; ecosystem list; other.
2. Confirm [placement](#placement). A misfiled submission is a blocking finding:
   point the contributor to the right list and its how-to-add guide.
3. Apply every applicable rule section below to every changed file.
4. Check the [common merge blockers](#common-merge-blockers).
5. Report with these headings: **CI status summary**, **Required changes
   (blocking)**, **Suggested improvements (non-blocking)**, and **Positive
   feedback**. The review is complete only when you have applied every rule
   section to every changed file and reported each as pass, fail, or not
   applicable.

## Placement

| Submission                                                                | Belongs in                                                                                                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Library, service, or app with native OTel support or a first-party plugin | `data/registry/*.yml`; the [Integrations](/ecosystem/integrations/) page is generated from registry data                                      |
| Organization offering observability that consumes OTLP                    | [`data/ecosystem/vendors.yaml`][vendors]                                                                                                      |
| End-user organization providing no OTel services                          | [`data/ecosystem/adopters.yaml`][adopters]                                                                                                    |
| Customized non-collector OTel components                                  | [`data/ecosystem/distributions.yaml`][distributions]; Collector distributions go to [Collector distributions](/docs/collector/distributions/) |

## Registry entries: what CI does not catch

Schema validation (`npm run check:registry`) enforces less than the docs
require. Check by hand:

- `registryType` and `language` are optional to the schema. Verify both are
  present and use values from the schema enums. The [adding guide][adding]
  documents only 11 of the 19 `registryType` values; flag entries using an
  undocumented type for a maintainer call.
- The validator only globs `*.yml`: a `.yaml` file silently bypasses validation.
  Require the `.yml` extension.
- The license gate only rejects the literal string `Commercial`. `proprietary`,
  `BUSL-1.1`, `SSPL`, or lowercase `commercial` pass CI, but only
  `application integration` entries may be non-OSS; non-OSI licenses may be
  rejected per the [template][].
- Nothing resolves `package.name`. Verify the package exists on the named
  package registry (npm, PyPI, pkg.go.dev).
- URL liveness is not gated at submission time. Spot-check new `repo` and
  `website` URLs.
- No check enforces filenames. The naming rule is codified in
  `scripts/registry-scanner/index.mjs`: `<registryType>-<language>-<name>.yml`,
  inverted for collector components (`collector-<registryType>-<name>.yml`).
  Also search `data/registry/` for an existing entry: a component may already be
  listed under a different filename.

## Registry entries: type and flag rules

- `core` is for OpenTelemetry project components only. `exporter` and `receiver`
  are not for third-party components that merely export or receive OTel data.
  See [registry types][adding-types].
- `application integration` entries and `isNative: true` instrumentation entries
  land on the Integrations page, where the Hugo build hard-requires
  `urls.website` and `urls.docs`; a missing one fails the `BUILD` job, not the
  registry check.
- Each author needs an email or an `https://` URL, and the name cannot contain
  "OpenTelemetry" (except the exact `OpenTelemetry Authors`). Names and
  descriptions must follow the [marketing guidelines][] and the Linux Foundation
  trademark usage guidelines.
- Deprecations need `deprecated.reason`, and the reason should name the
  replacement. Entry removal follows the [updating policy][updating].

## Ecosystem lists

`data/ecosystem/` has no schema, no auto-label, and no component owner. This
review is the only gate. The Hugo templates fail silently, so check field sets
against current entries:

- Adopters: `name`, `url`, `components`, `reference`, `referenceTitle`,
  `contact`. A `reference` without a `referenceTitle` renders an empty link
  label. Keep the list alphabetical.
- Distributions: `name`, `url`, `docsUrl`, `components`. A missing `docsUrl`
  renders an empty link. Sorted at render time.
- Vendors: `name`, `nativeOTLP`, `url`, `contact`, `oss`, `commercial`. An
  omitted boolean silently renders as "No". Sorted at render time.
- Reject fields copied from old entries that no template reads: `distribution`
  and `documentation`.
- Vendor entries must link docs proving native OTLP consumption and, when
  claiming open source, link proof; an open source distribution does not qualify
  ([how to add a vendor][vendors]). Adopters are CNCF end-user organizations
  with a reference link ([how to add an adopter][adopters]).
- `vendors.yaml` is excluded from spell checking; `adopters.yaml` and
  `distributions.yaml` need `# cSpell:ignore` header updates for unusual names.

## Links and spelling

- For link-cache mechanics, see [PR checks][pr-checks] and the
  [review-pull-request][] skill. Never hand-edit `.lycheecache`. Append
  `?link-check=no` only for URLs that block automated checkers.
- For words unknown to the spell checker in registry YAML, add a
  `# cSpell:ignore <word>` comment line above `title:` per the [style guide][].

## Common merge blockers

The most common reasons registry PRs stall; check them early:

- A fork branch named `main` fails the `BRANCH NAME` check, and the contributor
  must open a new PR from a different branch.
- When maintainer edits are disabled or the fork is org-owned, `/fix:*` commands
  cannot push; ask the contributor to run the fix locally (for example,
  `npm run fix:link-cache`) and push.
- The CLA check covers every commit author, including co-authors introduced by
  applying suggestions.
- The PR may duplicate an existing open PR or an existing entry.

[adding]: /ecosystem/registry/adding/
[adding-types]: /ecosystem/registry/adding/#registry-types
[adopters]: /ecosystem/adopters/#how-to-add
[approve-registry-update]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/approve-registry-update/SKILL.md
[distributions]: /ecosystem/distributions/#how-to-add
[marketing guidelines]: /community/marketing-guidelines/
[pr-checks]: /docs/contributing/pr-checks/
[registry]: /ecosystem/registry/
[registry schema]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/data/registry-schema.json
[review-pull-request]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/review-pull-request/SKILL.md
[style guide]: /docs/contributing/style-guide/
[template]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/templates/registry-entry.yml
[updating]: /ecosystem/registry/updating/
[vendors]: /ecosystem/vendors/#how-to-add
