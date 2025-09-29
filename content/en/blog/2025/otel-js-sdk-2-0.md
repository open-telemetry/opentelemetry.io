---
title: Announcing the OpenTelemetry JavaScript SDK 2.0
linkTitle: OTel JS SDK 2.0
date: 2025-03-26
author: >
  [Jamie Danielson](https://github.com/JamieDanielson) (Honeycomb)
sig: OpenTelemetry JS
cSpell:ignore: Danielson
---

Exciting news: [OpenTelemetry JavaScript](/docs/languages/js/) has released [SDK
2.0][v2.0.0]!

[v2.0.0]: https://github.com/open-telemetry/opentelemetry-js/releases/tag/v2.0.0

{{% alert title="Migration guide" %}}

For a detailed description of breaking changes, see the **migration guide**:
[Upgrade to OpenTelemetry JS SDK 2.x][migration guide].

[migration guide]:
  https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md

{{% /alert %}}

## What is JS SDK 2.x?

JS SDK 2.x encompasses new releases of the `@opentelemetry/*` JavaScript
packages published from the
[`opentelemetry-js` repository](https://github.com/open-telemetry/opentelemetry-js),
except the API and semantic-conventions packages. The package versions for this
new major will be `>=2.0.0` for the stable and `>=0.200.0` for the unstable
packages. Details on the full list of packages can be found in the [migration
guide][].

## What has changed?

In summary:

- The **minimum supported Node.js has been raised to `^18.19.0 || >=20.6.0`**.
  This means that support for Node.js 14 and 16 has been dropped.
- The **minimum supported TypeScript version has been raised to 5.0.4**.
- The **compilation target for transpiled TypeScript has been raised to ES2022**
  (from ES2017).
- The **public interface has changed**.
  - For notes on migrating to 2.x / 0.200.x, see
    [the upgrade guide](https://github.com/open-telemetry/opentelemetry-js/tree/main/doc/upgrade-to-2.x.md).

Details:

- [Node.js supported versions](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-nodejs-supported-versions)
- [TypeScript supported versions](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-typescript-supported-versions)
- [ES2022 compilation target](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-es2022-compilation-target)
- [Drop `window.OTEL_*` support in browsers](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-drop-windowotel_-support-in-browsers)
- [`@opentelemetry/resources` API changes](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-opentelemetryresources-api-changes)
- [`@opentelemetry/core` API changes](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-opentelemetrycore-api-changes)
- [Tracing SDK API changes](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-tracing-sdk-api-changes)
- [`@opentelemetry/sdk-metrics` API changes](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-opentelemetrysdk-metrics-api-changes)
- [`@opentelemetry/resources` changes for _implementors_ of Resource Detectors](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-opentelemetryresources-changes-for-implementors-of-resource-detectors)
- [Other changes](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md#-other-changes)

## Why was this done?

We knew we would gain the greatest benefit by allowing breaking changes to
improve things related to:

- Optimization: removing classes and namespaces to allow better minification and
  tree-shaking.
- Better tooling and support: dropping old runtimes and tool versions to take
  advantage of enhanced ESM support and simplify documentation.
- Velocity: reducing code complexity and removing deprecated fields for faster
  feature and maintenance work.

This also begins our goal of releasing a new SDK major release every year.

For a more detailed explanation of why 2.0, see issue [#4083].

[#4083]: https://github.com/open-telemetry/opentelemetry-js/issues/4083

## How can I get involved?

[v0.200.0]:
  https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.200.0

- Try out the [v2.0.0] and [v0.200.0] releases and provide feedback.
- Review our
  [contributing guide](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md)
  for details on contributing.
- Attend our
  [SIG meetings](https://groups.google.com/a/opentelemetry.io/g/calendar-js).
- Collaborate on [Slack](https://cloud-native.slack.com/archives/C01NL1GRPQR).
