---
title: CI workflows
linkTitle: CI workflows
description: >-
  GitHub Actions workflows that automate PR checks, label management, and other
  CI/CD processes.
weight: 10
---

All workflow files live under
[`.github/workflows/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/.github/workflows).

## Other workflows {#other-workflows}

The repository includes several other workflows:

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
