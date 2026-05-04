---
title: Update i18n drift status
description: >-
  How to update the drifted_from_default front matter field across localized
  content and optionally open a PR with the results.
---

Follow these steps to update the `drifted_from_default` front matter field for
localized content by running `npm run fix:i18n:status` per locale, committing
per locale, and optionally opening a PR.

## Arguments {#arguments}

The skill accepts optional arguments:

- **`--locale locale,...`** (optional): a comma-separated list of locale IDs to
  process, e.g. `--locale pt,es,fr`. When omitted, all non-English locales are
  processed.
- **`--create-pr`** (optional flag): create the PR automatically after
  processing. When omitted, ask the user with `AskUserQuestion` whether to
  create the PR.

## Preparation {#preparation}

These steps assume you have a local clone of the repository with the `upstream`
remote configured to point to the main repository. Run these steps locally from
the repository root.

1. Ensure your working tree is clean (no uncommitted changes).
2. Switch to `main` and pull the latest changes:

   ```sh
   git checkout main
   git pull upstream main
   ```

3. Create the working branch:

   ```sh
   git checkout -b i18n_update-drift-status
   ```

## Discover locales {#discover-locales}

If `--locale` was not passed, discover all non-English locales from the content
directory:

```sh
find content -maxdepth 1 -mindepth 1 -type d ! -name 'en' -exec basename {} \;
```

This returns one locale ID per line (e.g. `bn`, `es`, `fr`, …).

If `--locale` was passed, use that list instead.

> [!NOTE] Never include `en`
>
> English is the default content and cannot drift, so it should never be
> included in the locale list or processed by this skill. If `en` is included in
> the `--locale` argument, ignore it or report an error.

## Update drift status per locale {#update-per-locale}

For each `{LANG_ID}` in the resolved locale list:

1. Run the drift-status update command:

   ```sh
   npm run fix:i18n:status -- content/{LANG_ID}
   ```

2. Collect stats for the PR description table:

   ```sh
   # Drifted files
   grep -rl "drifted_from_default: true" content/{LANG_ID} | wc -l
   # Total translatable files
   grep -rl "default_lang_commit" content/{LANG_ID} | wc -l
   ```

3. If the command produced changes, stage and commit:

   ```sh
   git add content/{LANG_ID}
   git commit -m "chore({LANG_ID}): update drift status"
   ```

   If there are no changes for a locale, skip the commit but still record the
   stats.

## Create the PR {#create-the-pr}

After processing all locales:

- If `--create-pr` was **not** passed, use `AskUserQuestion` to ask the user
  whether to create the PR before proceeding.
- If the user declines (or if `--create-pr` was not passed and they say no),
  stop here and report the stats.

To create the PR, push the branch:

```sh
git push -u origin i18n_update-drift-status
```

Then run `gh pr create` with:

- **Title**: `[i18n] Update drift status for localized content`
- **Description**: fill in the table below with the stats collected above,
  including only the locales that were processed.

```md
Updates the drift status for localized content.

Status per locale after this PR:

| Locale | Drifted files | Total files |
| ------ | ------------- | ----------- |
| {ID}   | {drifted}     | {total}     |
```
