---
title: JavaScript
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/JS_SDK.svg"
  alt="JavaScript"> A language-specific implementation of OpenTelemetry in
  JavaScript (for Node.js & the browser).
aliases: [/js, /js/metrics, /js/tracing]
cSpell:ignore: Roadmap
weight: 20
---

{{% docs/instrumentation/index-intro js /%}}

{{% alert title="Warning" color="warning" %}}
{{% _param notes.browser-instrumentation %}} {{% /alert %}}

## Version Support

OpenTelemetry JavaScript supports all active or maintenance LTS versions of
Node.js. Previous versions of Node.js may work, but are not tested by
OpenTelemetry.

OpenTelemetry JavaScript has no official supported list of browsers. It is aimed
to work on currently supported versions of major browsers.

For more details on runtime support see
[ths overview](https://github.com/open-telemetry/opentelemetry-js#supported-runtimes).

## Repositories

OpenTelemetry JavaScript consists of the following repositories:

- [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js), core
  repository containing the core distribution API and SDK.
- [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib),
  contributions that are not part of the core distribution of the API and SDK.

## Help or Feedback

If you have questions about OpenTelemetry JavaScript, please reach out via
[GitHub Discussions](https://github.com/open-telemetry/opentelemetry-js/discussions)
or the [#otel-js] channel on [CNCF Slack](https://slack.cncf.io/).

If you want to contribute to OpenTelemetry JavaScript, see the
[contributing instructions](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md)
