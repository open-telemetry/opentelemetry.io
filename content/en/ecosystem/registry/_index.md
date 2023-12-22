---
title: Registry
description: >-
  Find libraries, plugins, integrations, and other useful tools for extending
  OpenTelemetry.
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
body_class: registry
weight: 20
---

{{% blocks/lead color="white" %}}

<!-- markdownlint-disable single-h1 -->

# {{% param title %}}

{{% param description %}}

{{% /blocks/lead %}}

{{% blocks/section color="dark" %}}

## What do you need?

The OpenTelemetry Registry allows you to search for instrumentation libraries,
tracer implementations, utilities, and other useful projects in the
OpenTelemetry ecosystem.

- Not able to find an exporter for your language? Remember, the
  [OpenTelemetry Collector](/docs/collector) supports exporting to a variety of
  systems and works with all OpenTelemetry Core Components!
- Are you a project maintainer? See,
  [Adding a project to the OpenTelemetry Registry](adding).
- Check back regularly, the community and registry are growing!

{{% /blocks/section %}}

{{< blocks/section color="white" type="container-lg" >}}

<li class="card my-3 registry-entry" data-registrytype="{{ .registryType }}" data-registrylanguage="{{ .language }}">
  <div class="card-body container-fluid">
    <h5 class="card-title">
      <a href="#asdf" target="_blank" rel="noopener">
        asdf
      </a>
    </h5>
    <div class="d-flex flex-row mb-3">
      <span class="me-auto p-0">
        Exports OTel Events (SpanEvent in Tracing added by AddEvent API)
  collector exporter
      </span>
      <div class="ms-auto px-2">
          <span class="badge badge-php">php</span>
          <span class="badge badge-exporter me-1">exporter</span>
      </div>
    </div>
  </div>
</li>

{{<registry-search-form>}}



{{< /blocks/section >}}
