---
title: Registry
description: >-
  Find libraries, plugins, integrations, and other useful tools for using and
  extending OpenTelemetry.
# The redirects and aliases implement catch-all rules for old registry entries;
# we don't publish individual entry pages anymore.
#
# We can't use the catch-all `/ecosystem/registry/*`, because that creates a
# self-loop with `/ecosystem/registry/index.html`. So we use the following
# redirect rule to avoid the loop, as suggested by Netlify support
# (email support ID 159489):
redirects: [{ from: /ecosystem/registry*, to: '/ecosystem/registry?' }]
aliases: [/registry/*]
type: default
layout: registry
outputs: [html, json]
body_class: registry td-content
weight: 20
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

# {{% param title %}}

{{% param description %}}

{{% /blocks/lead %}}

{{< blocks/section color="white" type="container-lg" >}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
