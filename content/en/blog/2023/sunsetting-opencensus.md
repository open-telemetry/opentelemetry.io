---
title: Sunsetting OpenCensus
linkTitle: Sunsetting OpenCensus
date: 2023-05-01
author: '[Aaron Abbott](https://github.com/aabmass) (Google)'
---

In 2019, we announced that OpenTracing and OpenCensus would be merging to form
the OpenTelemetry project. From the start, we considered OpenTelemetry
[to be the next major version of both OpenTracing and OpenCensus](https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/).

We are excited to announce that OpenTelemetry has reached feature parity with
OpenCensus in C++, C#, Go, Java, JavaScript, PHP and Python.
[Stable releases](/docs/instrumentation/#status-and-releases) of both the
Tracing and Metrics SDKs are available in most of these languages with Go and
PHP soon to follow. This means that OpenTelemetry can collect and export
telemetry data with the same level of functionality as OpenCensus. Beyond that,
OpenTelemetry offers a [richer ecosystem](/ecosystem) of instrumentation
libraries and exporters, and an
[active open source community](https://www.cncf.io/blog/2023/01/11/a-look-at-the-2022-velocity-of-cncf-linux-foundation-and-top-30-open-source-projects/).

As a result, we will be archiving all OpenCensus Github repositories (with the
exception of [census-instrumentation/opencensus-python][]) on July 31st, 2023.
We are excited to see the
[long term plan for OpenTelemetry](https://medium.com/opentracing/a-roadmap-to-convergence-b074e5815289)
coming to fruition and encourage all users of OpenCensus to migrate to
OpenTelemetry.

## How to Migrate to OpenTelemetry

One of the
[key goals](https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0)
of the OpenTelemetry project is to provide backward compatibility with
OpenCensus and a migration story for existing users.

To help ease the migration path, we have provided backward compatibility bridges
in [Go][go shim], [Java][java shim], [Python][python shim][^shim-next-release],
and [JavaScript][js shim][^shim-next-release]. Installing these bridges allows
OpenCensus and OpenTelemetry instrumentation to smoothly interoperate, with all
of your telemetry flowing out of OpenTelemetry exporters. This lets OpenCensus
users incrementally transition all of their instrumentation from OpenCensus to
OpenTelemetry, and finally remove OpenCensus libraries from their applications.

While OpenTelemetry was never intended to be a strict superset of OpenCensus,
most of the APIs and data models are compatible. Migration should be considered
a "major version bump" and you may notice some changes in your telemetry.

More details on what to expect and some suggested workflows for migration are
outlined in the
[OpenCensus Compatibility specification](/docs/reference/specification/compatibility/opencensus#migration-path)[^spec-next-release].

## What to Expect After July 31st, 2023

After July 31st, 2023, the OpenCensus project will no longer be maintained. This
means that there will be no new features added to the project, and any security
vulnerabilities that are found will not be patched.

However, the OpenCensus repositories will remain archived on GitHub. This means
users will still be able to download the OpenCensus code and use it in their
projects. Existing releases of OpenCensus will remain available in public
package repositories like NPM and PyPI. **We encourage all OpenCensus users to
migrate to OpenTelemetry as soon as possible.**

One exception to this is the [census-instrumentation/opencensus-python], which
will continue to be maintained until
TBD<!-- TODO: add date before publishing-->.

[go shim]:
  https://github.com/open-telemetry/opentelemetry-go/tree/main/bridge/opencensus
[java shim]:
  https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim
[python shim]:
  https://github.com/open-telemetry/opentelemetry-python/tree/main/shim/opentelemetry-opencensus-shim
[js shim]:
  https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-shim-opencensus
[census-instrumentation/opencensus-python]:
  https://github.com/census-instrumentation/opencensus-python

[^shim-next-release]:
    Python and JavaScript shim packages are currently unreleased but will be
    available in the next OpenTelemetry release.

[^spec-next-release]:
    The OpenCensus Compatability specification is marked stable for the next
    specification release.
