---
title: Setting up a new localization
linkTitle: Localization setup
description: >-
  Step-by-step maintainer guide for onboarding a new language localization to
  the OpenTelemetry website.
weight: 50
---

This guide walks OTel website maintainers through every change required to
onboard a new language localization. It covers both repository-level changes and
GitHub organization-level setup.

For the contributor-facing side — translation guidance, drift tracking, and
ongoing maintenance — see [Site localization][].

The canonical registry of active localization teams and their resources is in
[`projects/localization.md`][].

## Prerequisites

Before starting, confirm the following with the locale team:

- A [kickoff issue][] has been filed following the steps in [New
  localizations][].
- The [ISO 639-1][] language code (`LANG_ID`) has been agreed upon.
- GitHub handles for the mentor and initial contributors are known.

In the rest of this guide, replace every occurrence of `LANG_ID` with the actual
[ISO 639-1][] code (for example, `pl` for Polish).

## Step 1 — Hugo language configs {#hugo-config}

### Step 1a. Language config entry

Add an entry for the new language in `config/_default/hugo.yaml` under the
`languages:` key:

```yaml
LANG_ID:
  languageName: NativeName (English name)
  languageCode: LANG_ID-REGION
  params:
    description: <site description translated into the new language>
```

For example, the Polish entry looks like:

```yaml
pl:
  languageName: Polski (Polish)
  languageCode: pl-PL
  params:
    description: Strona projektu OpenTelemetry
```

### Step 1b. Translation File

Within the `i18n` directory, create a new file named `LANG_ID.yaml` (for example, `pl.yaml`). This file will contain
some translated strings for the new language. These strings are used for UI elements and other site components that
may not necessarily be part of the main content, or are used in multiple pages.


## Step 2 — Hugo content mounts {#hugo-mounts}

Hugo uses content mounts to route locale-specific content and to fall back to
English pages for sections that have not yet been translated. Add a block for
`LANG_ID` in [`config/_default/module-template.yaml`][] under the top-level
`mounts:` section (this template is rendered into `module.yaml`).

### Base setup

Every locale requires at least the following mounts — the locale's own content
plus fallbacks for the core English sections:

```yaml
## LANG_ID
- source: content/LANG_ID # locale-specific pages
  target: content
  sites: &LANG_ID-matrix
    matrix: { languages: [LANG_ID] }
# fallback pages (serve English content where no translation exists yet)
- source: content/en/_includes
  target: content/_includes
  sites: *LANG_ID-matrix
- source: content/en/announcements
  target: content/announcements
  sites: *LANG_ID-matrix
- source: content/en/docs
  target: content/docs
  files: ['! specs/**'] # exclude spec fragments (too large to fall back)
  sites: *LANG_ID-matrix
```

Additional sections (such as `ecosystem`) can be added as the localization
matures. For example, the `pt` block includes an `ecosystem` fallback:

```yaml
## pt
- source: content/pt
  target: content
  sites: &pt-matrix
    matrix: { languages: [pt] }
# fallback pages
- source: content/en/_includes
  target: content/_includes
  sites: *pt-matrix
- source: content/en/announcements
  target: content/announcements
  sites: *pt-matrix
- source: content/en/docs
  target: content/docs
  files: ['! specs/**']
  sites: *pt-matrix
- source: content/en/ecosystem
  target: content/ecosystem
  sites: *pt-matrix
```

Insert the new block alongside the existing locale blocks in
`config/_default/module-template.yaml`, following the current ordering
convention used in that file.

## Step 3 — Spell checking {#cspell}

### 3a. Check for a cspell dictionary

Search npm for an existing cspell dictionary for the language:

```sh
npm search @cspell/dict
```

Look for a package matching `@cspell/dict-LANG_ID` or the closest regional
variant (for example, `@cspell/dict-pl_pl` for Polish). You can also browse the
full list of available dictionaries at the
[cspell-dicts repository](https://github.com/streetsidesoftware/cspell-dicts#natural-language-dictionaries).

### 3b. Install the dictionary (if available)

```sh
npm install --save-dev @cspell/dict-LANG_ID
```

This adds the package to `package.json`. Commit the updated `package.json` and
`package-lock.json`.

### 3c. Create the custom word list

Create an empty file for site-local technical terms:

```sh
touch .cspell/LANG_ID-words.txt
```

Commit the empty file. Contributors will add locale-specific technical terms
here over time.

### 3d. Update `.cspell.yml`

Add three entries to [`.cspell.yml`][] to enable spell checking for the new
language:

1. Under `import:` — import the cspell dictionary for your locale:

   ```yaml
   - '@cspell/dict-CSPELL_DICT_ID/cspell-ext.json'
   ```

2. Under `dictionaryDefinitions:` — register the custom word list:

   ```yaml
   - name: LANG_ID-words
     path: .cspell/LANG_ID-words.txt
   ```

3. Under `dictionaries:` — activate both the imported dictionary and the custom
   word list:

   ```yaml
   - CSPELL_DICT_ID # the @cspell/dict-CSPELL_DICT_ID package
   - LANG_ID-words # the .cspell/LANG_ID-words.txt list
   ```

Keep entries in each section in alphabetical order by language code.

> [!NOTE]
>
> If no cspell dictionary package exists for the language, skip steps 3b and the
> `import` and `dictionaries` entries. Only create the custom word list (step
> 3c) and register it under `dictionaryDefinitions`.
>
> Also add the locale path to the `ignorePaths` list in [`.cspell.yml`][] so
> that cspell does not attempt to spell-check content it cannot validate:
>
> ```yaml
> ignorePaths:
>   - content/LANG_ID
> ```

## Step 4 — Prettier (conditional) {#prettier}

If Prettier does not handle the language well — for example, scripts that are
right-to-left or use non-Latin characters — add an ignore entry to
[`.prettierignore`][]:

```sh
content/LANG_ID/**
```

Check existing ignore entries in [`.prettierignore`][] to see whether other
locales with similar scripts have already been excluded, and follow the same
pattern. This step is optional and should only be done when Prettier is known to
produce incorrect formatting for the language.

## Step 5 — GitHub repository automation {#gh-repo}

### Component label map

In [`.github/component-label-map.yml`][], add an entry that triggers the
`lang:LANG_ID` label on any PR touching `content/LANG_ID/`:

```yaml
lang:LANG_ID:
  - changed-files:
      - any-glob-to-any-file:
          - content/LANG_ID/**
```

### Component owners

In [`.github/component-owners.yml`][], add an entry that requires review from
the locale's approvers team and the docs maintainers:

```yaml
content/LANG_ID:
  - open-telemetry/docs-maintainers
  - open-telemetry/docs-LANG_ID-approvers
```

Both files maintain alphabetical ordering by language code within their
respective locale sections.

## Step 6 — GitHub org-level setup {#gh-org}

These steps happen outside the repository and require maintainer-level access to
the `open-telemetry` GitHub organization.

Team creation is done by opening a pull request against the
[`open-telemetry/admin`][] repository (private). See
[this PR](https://github.com/open-telemetry/admin/pull/588?link-check=no) for an
example of the expected format.

> [!NOTE]
>
> [Team members should be added manually](https://github.com/open-telemetry/admin/issues/58?link-check=no),
> since they aren't currently being managed by this repository.

## Step 7 — Slack channel {#slack}

Create a channel for the locale in the [CNCF Slack workspace][], using the
naming convention `#otel-localization-LANG_ID` (for example,
`#otel-localization-pl` for Polish). After creating the channel, add the
[OpenTelemetry Admin](https://cloud-native.slack.com/team/U07DR07KAEQ) as a
channel manager.

## Step 8 — Project tracking {#projects}

Update [`projects/localization.md`][] with the new locale's information:

1. Add the language to the supported languages list at the top, in alphabetical
   order by language code:

   ```markdown
   - [NativeName - EnglishName (LANG_ID)][LANG_ID]

   [LANG_ID]: https://opentelemetry.io/LANG_ID/
   ```

2. Add a team entry under **Current language teams** following the same
   structure as existing entries:

   ```markdown
   **EnglishName**:

   - Website: <https://opentelemetry.io/LANG_ID/>
   - Slack channel:
     [`#otel-localization-LANG_ID`](https://cloud-native.slack.com/archives/XXXXXXXXXXX)
   - Maintainers: `@open-telemetry/docs-LANG_ID-maintainers`
   - Approvers: `@open-telemetry/docs-LANG_ID-approvers`
   ```

3. Add the `lang:LANG_ID` label to the **Labels** section:

   ```markdown
   - [`lang:LANG_ID`][issues-lang-LANG_ID] - EnglishName localization
   ```

   With the corresponding link definition:

   ```markdown
   [issues-lang-LANG_ID]:
     https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3ALANG_ID
   ```

4. Add the Slack channel link definition:

   ```markdown
   [otel-localization-LANG_ID]:
     https://cloud-native.slack.com/archives/CHANNEL_ID
   ```

## Verification {#verification}

### Setup checklist

Use this checklist to confirm that every setup step is complete before
requesting a review:

- [ ] **Step 1** — Language entry added to `config/_default/hugo.yaml`
- [ ] **Step 2** — Content mounts added to
      `config/_default/module-template.yaml`
- [ ] **Step 3** — cSpell configured: dictionary installed (or locale added to
      `ignorePaths`), custom word list created at `.cspell/LANG_ID-words.txt`,
      and `.cspell.yml` updated
- [ ] **Step 4** — `.prettierignore` updated (if applicable for the script)
- [ ] **Step 5** — `.github/component-label-map.yml` and
      `.github/component-owners.yml` updated with the `lang:LANG_ID` entries
- [ ] **Step 6** — Team PR opened against `open-telemetry/admin`; team members
      added manually
- [ ] **Step 7** — Slack channel `#otel-localization-LANG_ID` created;
      OpenTelemetry Admin added as channel manager
- [ ] **Step 8** — `projects/localization.md` updated with the language entry,
      team entry, label, and Slack channel link

### Automated checks

After all PRs are merged, run the following to confirm the configuration is
correct:

- **`npm run build`** — confirms Hugo recognizes the new language without
  errors.
- **`npm run check:spelling`** — confirms the cspell configuration is valid and
  that no errors are introduced by the new dictionary entries.
- **GitHub label automation** — open a test PR that touches a file under
  `content/LANG_ID/` and confirm the `lang:LANG_ID` label is applied
  automatically.

[`.cspell.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml
[`.prettierignore`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.prettierignore
[`.github/component-label-map.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml
[`.github/component-owners.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`projects/localization.md`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/projects/localization.md
[`config/_default/module-template.yaml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/config/_default/module-template.yaml
[`open-telemetry/admin`]: https://github.com/open-telemetry/admin?link-check=no
[kickoff issue]: /docs/contributing/localization/#kickoff
[New localizations]: /docs/contributing/localization/#new-localizations
[Site localization]: /docs/contributing/localization/
[ISO 639-1]: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
[CNCF Slack workspace]: https://cloud-native.slack.com
