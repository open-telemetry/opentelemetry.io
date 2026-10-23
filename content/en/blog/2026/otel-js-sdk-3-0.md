---
title: Announcing the OpenTelemetry JavaScript SDK 3.0
linkTitle: OTel JS SDK 3.0
date: 2026-10-22
author: >
  [Trent Mick](https://github.com/trentm) (Elastic), [Marylia
  Gutierrez](https://github.com/maryliag) (Grafana Labs)
sig: OpenTelemetry JS
---

[OpenTelemetry JavaScript](/docs/languages/js/) has released SDK 3.0 ([stable
v3.0.0 packages][sdk-v3.0.0] and [experimental v0.300.0 packages][sdk-v0.300.0])
and API [1.10.0][api-v1.10.0].

[sdk-v3.0.0]:
  https://github.com/open-telemetry/opentelemetry-js/releases/tag/v3.0.0
[sdk-v0.300.0]:
  https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.300.0
[api-v1.10.0]:
  https://github.com/open-telemetry/opentelemetry-js/releases/tag/api%2Fv1.10.0

> [!NOTE] Migration guide
>
> For a detailed description of breaking changes, see the **migration guide**:
> [OpenTelemetry JS SDK 3.x migration guide][migration guide].

[migration guide]:
  https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md

## What is JS SDK 3.x?

JS SDK 3.x encompasses new releases of the `@opentelemetry/*` JavaScript
packages published from the
[`opentelemetry-js` repository](https://github.com/open-telemetry/opentelemetry-js),
except the API and semantic-conventions packages. The package versions for this
new major will be `>=3.0.0` for the stable and `>=0.300.0` for the unstable
packages. Details on the full list of packages can be found in the [migration
guide][].

In addition,
[all the packages from the `opentelemetry-js-contrib` repository](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/3c07d44fc3d9d890fc659e653acde418ee081c51/packages)
have been upgraded to JS SDK 3.x and released.

Per
[OpenTelemetry guidelines](/docs/specs/otel/versioning-and-stability/#sdk-support),
the 2.x versions of stable SDK packages will be supported for one year from the
3.0.0 release.

## What has changed?

- The **minimum supported Node.js has been raised to `>=22.15.0`**. This means
  that support for Node.js 18 and 20 has been dropped.
- All packages now ship
  [**proper ES Module (ESM) and CommonJS exports**](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md#-dual-cjsesm-exports).
  The result should be much more friendly to ESM and bundler users.
- Support for **complex attributes**, per OTEP 4485, has been added to some
  parts of the API (e.g. span attributes, log record attributes). Some parts of
  the API only support simple attributes (e.g. resource attributes, metric
  attributes). See
  [the explainer in the migration guide](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md#-support-for-complex-attribute-values).
- The `@opentelemetry/api-logs` package has been folded into
  `@opentelemetry/api`, as the **Logs signal has been stabilized!** There will
  be a separate blog post on this stabilization.
- [Multiple Tracing SDK packages have been consolidated](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md#-opentelemetrysdk-trace-base-package-removed)
  into the `@opentelemetry/sdk-trace` package, eliminating some confusing APIs
  and bringing consistency with the SDKs for the other signals.
- Many deprecated packages have been removed.
- The **public interface has changed**.

The _API_ package (`@opentelemetry/api`) does not have breaking changes. As
well, users of the `@opentelemetry/auto-instrumentations-node` package for
[zero-code instrumentation](/docs/zero-code/js/) likely do not need to change.

For more details and notes on migrating to 3.x / 0.300.x, see the [migration
guide][].

## Why was this done?

Starting with the [SDK 2.0 release](/blog/2025/otel-js-sdk-2-0/) in March 2025,
the OTel JS SIG has had a goal of a new SDK major release roughly every year.
This cadence allows us to stay current with
[new major Node.js releases](https://github.com/nodejs/release#release-schedule)
and more recent JavaScript ecosystem and tooling improvements.

## How can I get involved?

- Try out the [v3.0.0][sdk-v3.0.0] and [v0.300.0][sdk-v0.300.0] releases and
  provide feedback.
- Review our
  [contributing guide](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/CONTRIBUTING.md)
  for details on contributing.
- Attend our
  [SIG meetings](https://github.com/open-telemetry/community/blob/2c7afdc7fef121bcded259c1234489b834a770e8/sigs.md#javascript-sdk).
- Collaborate on [Slack](https://cloud-native.slack.com/archives/C01NL1GRPQR).
