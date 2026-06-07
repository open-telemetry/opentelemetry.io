---
title: Registry
description: >-
  Find libraries, plugins, integrations, and other useful tools for using and
  extending OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20

# =============================================================================
# IMPORTANT:
# IMPORTANT: Non-English locales: DO NOT include the front matter entries below
# IMPORTANT:
# =============================================================================

aliases: [/registry/*]
outputs: [HTML, markdown, JSON]

# TODO(chalin): move the following comment into the site docs, then add a link
# to it here. Old /ecosystem/registry/<component> URLs are handled by the
# `registry-component-redirect` Netlify Edge Function (replaces the Hugo
# catch-all redirect; see https://github.com/open-telemetry/opentelemetry.io/issues/9633).
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{% blocks/section color="white pb-0" type="container-lg" %}}

> [!NOTE]
>
> The OpenTelemetry Registry allows you to search for instrumentation libraries,
> collector components, utilities, and other useful projects in the
> OpenTelemetry ecosystem. If you are a project maintainer, you can
> [add your project to the OpenTelemetry Registry](adding/).

{{% /blocks/lead %}}

{{< blocks/section color="white pt-0" type="container-lg" >}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
