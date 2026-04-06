---
title: CI workflows
linkTitle: CI workflows
description: >-
  GitHub Actions workflows that automate PR checks, label management, and other
  CI/CD processes.
weight: 10
---

The repository uses GitHub Actions workflows to automate PR checks, label
management, content validation, and maintenance tasks. All workflow files live
under
[`.github/workflows/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/.github/workflows).

The pages below cover the more complex workflows in detail:

- [Label gate](label-gate/) — approval labels, component labeling, and
  publish-date gating
- [Blog publish labels](blog-publish-labels/) — daily scheduled labeling with
  Slack notifications
- [PR fix directives](pr-fix-directives/) — comment-driven fix scripts via a
  two-stage patch pipeline

## Other workflows {#other-workflows}

The following workflows handle additional CI tasks and are not covered in
dedicated pages:

| Workflow                   | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `check-links.yml`          | Sharded link checking using htmltest          |
| `check-text.yml`           | Textlint terminology checks                   |
| `check-i18n.yml`           | Localization front matter validation          |
| `check-spelling.yml`       | Spell checking                                |
| `auto-update-registry.yml` | Auto-update registry package versions         |
| `auto-update-versions.yml` | Auto-update OTel component versions           |
| `build-dev.yml`            | Development build and preview                 |
| `lint-scripts.yml`         | ShellCheck linting for `.github/scripts/`     |
| `component-owners.yml`     | Assign reviewers based on component ownership |
