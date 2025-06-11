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
outputs: [html, json]

# The redirects and aliases implement catch-all rules for old registry entries;
# we don't publish individual entry pages anymore.
#
# We can't use the catch-all `/ecosystem/registry/*`, because that creates a
# self-loop with `/ecosystem/registry/index.html`. So we use the following
# redirect rule to avoid the loop, as suggested by Netlify support
# (email support ID 159489):
redirects: [{ from: /ecosystem/registry*, to: '/ecosystem/registry?' }]
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{< blocks/section color="white" type="container-lg" >}}

{{% alert %}}

The OpenTelemetry Registry allows you to search for instrumentation libraries,
collector components, utilities, and other useful projects in the OpenTelemetry
ecosystem. If you are a project maintainer, you can
[add your project to the OpenTelemetry Registry](adding/).

{{% /alert %}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
