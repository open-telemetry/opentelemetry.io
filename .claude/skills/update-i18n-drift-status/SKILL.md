---
name: update-i18n-drift-status
description: >-
  Update the drifted_from_default front matter field for localized content.
  Accepts an optional comma-separated locale list (e.g. pt,es,fr) to limit which
  locales are processed, and an optional --create-pr flag to open a PR
  automatically. Locales are discovered from the content directory structure.
argument-hint: '[--locale locale,...] [--create-pr]'
disable-model-invocation: true
---

# Update i18n drift status

## Arguments

Usage: `/update-i18n-drift-status [--locale locale,...] [--create-pr]`

- `--locale locale,...` — comma-separated locale IDs to process (e.g.
  `--locale pt,es,fr`); defaults to all non-English locales
- `--create-pr` — create the PR automatically; omit to be asked first

## Usage

Read and follow
[update-i18n-drift-status.md](../../../content/en/site/skills/update-i18n-drift-status.md).
