---
title: Collector Component Automation
linkTitle: Collector Component Automation
description: >-
  Explanation of the automation process for OpenTelemetry Collector components.
weight: 50
---

The tables within the OpenTelemetry Collector components pages are automatically
synchronized with data from the
[OpenTelemetry Ecosystem Explorer registry](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/tree/main/ecosystem-registry/collector).
The code that manages this process is located in [`scripts/collector-sync`][].

The synchronization process is managed by a GitHub Action that runs on a
schedule ([`collector-sync.yml`][]).

Every night the GitHub Action performs the following steps:

1. Fetches the latest data from the OpenTelemetry Ecosystem Explorer registry.
2. Based on the registry data, it will update the associated component data
   files in [`data/collector/`][].
3. If there are any changes to the component data files, it will generate a PR
   with the updates.

All component pages reference shortcodes that pull in the relevant data from the
[`data/collector/`][] directory, so when the data files are updated, the tables
on the component pages will automatically reflect the latest information.

Related files and directories:

- [`data/collector/`][]: The directory where the component data files are
  stored, which are used to populate the tables on the component pages.
- [`scripts/collector-sync`][]: The directory containing the code for fetching
  registry data and updating component data files.
- [`.github/workflows/collector-sync.yml`][`collector-sync.yml`]: The GitHub
  Action workflow that schedules and runs the synchronization process.
- [`layouts/_shortcodes/collector-component-rows.html`][]: Renders complete HTML
  table from data files.
- [`layouts/_shortcodes/component-link.html`][]: Renders a link to the component
  source code repository, used in the component tables.
- [`i18n/<language>.yml`][]: Contains the translations for the component table
  pages (prefixed with `collector_component_`, which are referenced in the
  shortcodes.

## Translations

In order to create a new translation for the Collector components pages, you can
follow these steps:

- Copy the existing English content from `content/en/docs/collector/components`
  to the corresponding directory for the new language (e.g.,
  `content/es/docs/collector/components` for Spanish).
- Translate the static content (titles, descriptions, etc.) in the new language.
- Ensure that the associated [`i18n/<language>.yml`][] file exists, and has
  entries for the `collector_components_` prefixed keys that are used in the
  component tables. You can copy the English entries and translate the values.

[`scripts/collector-sync`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/collector-sync.sh
[`collector-sync.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/collector-sync.yml
[`data/collector/`]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/collector
[`layouts/_shortcodes/collector-component-rows.html`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_shortcodes/collector-component-rows.html
[`layouts/_shortcodes/component-link.html`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_shortcodes/component-link.html
[`i18n/<language>.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/i18n
