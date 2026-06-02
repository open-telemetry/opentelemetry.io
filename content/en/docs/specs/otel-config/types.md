---
title: Configuration Types Reference
linkTitle: Configuration Types
description: >-
  Searchable reference for all types defined in the OpenTelemetry declarative
  configuration schema, including their properties and constraints.
weight: 10
# This file lives in the opentelemetry.io repo but is mounted into the
# docs/specs/otel/ hierarchy, which cascades github_repo/github_subdir from
# the opentelemetry-specification submodule. Override those params so the
# Docsy "View page source" link points to the correct repo.
github_repo: https://github.com/open-telemetry/opentelemetry.io
github_subdir: ''
path_base_for_github_subdir: ''
---

The OpenTelemetry
[declarative configuration](/docs/specs/otel/configuration/data-model/) schema
defines configuration types that describe the structure of SDK components
configurable via a configuration file. Types prefixed with `Experimental` are
subject to breaking changes without notice.

For the full data model and schema, see
[Data Model](/docs/specs/otel/configuration/data-model/). For SDK-specific
usage, see [Configuration SDK](/docs/specs/otel/configuration/sdk/).

{{< config-types-accordion >}}
