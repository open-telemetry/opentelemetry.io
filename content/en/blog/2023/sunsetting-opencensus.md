---
title: Sunsetting OpenCensus
linkTitle: Sunsetting OpenCensus
date: 2023-05-01
author: '[Aaron Abbott](https://github.com/aabmass) (Google)'
spelling: cSpell:ignore sunsetting
---

In 2019, we announced that OpenTracing and OpenCensus would be merging to form
the OpenTelemetry project. From the start, we considered OpenTelemetry
[to be the next major version of both OpenTracing and OpenCensus](https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/).

We are excited to announce that OpenTelemetry has reached feature parity with
OpenCensus in C++, .NET, Go, Java, JavaScript, PHP and Python.
[Stable releases](/docs/instrumentation/#status-and-releases) of both the
Tracing and Metrics SDKs are available in most of these languages with Go and
PHP soon to follow. This means that OpenTelemetry can collect and export
telemetry data with the same level of functionality as OpenCensus. Beyond that,
OpenTelemetry offers a [richer ecosystem](/ecosystem/) of instrumentation
libraries and exporters, and an
[active open source community](https://www.cncf.io/blog/2023/01/11/a-look-at-the-2022-velocity-of-cncf-linux-foundation-and-top-30-open-source-projects/).

As a result, we will be archiving all OpenCensus GitHub repositories (with the
exception of [census-instrumentation/opencensus-python][][^python-timeline]) on
July 31st, 2023. We are excited to see the
[long term plan for OpenTelemetry](https://medium.com/opentracing/a-roadmap-to-convergence-b074e5815289)
coming to fruition, and encourage all users of OpenCensus to migrate to
OpenTelemetry.

## How to Migrate to OpenTelemetry

One of the
[key goals](https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0)
of the OpenTelemetry project is to provide backward compatibility with
OpenCensus and a migration story for existing users.

To help ease the migration path, we provide backward compatibility bridges for
the following languages[^shim-next-release]:

- [Go][go shim]
- [Java][java shim]
- [JavaScript][js shim]
- [Python][python shim]

Installing these bridges allows OpenCensus and OpenTelemetry instrumentation to
smoothly interoperate, with all of your telemetry flowing out of OpenTelemetry
exporters. This lets OpenCensus users incrementally transition all of their
instrumentation from OpenCensus to OpenTelemetry, and finally remove OpenCensus
libraries from their applications[^shim-support].

While OpenTelemetry was never intended to be a strict superset of OpenCensus,
most of the APIs and data models are compatible. Migration should be considered
a "major version bump" and you may notice some changes in your telemetry.

More details on what to expect and some suggested workflows for migration are
outlined in the
[OpenCensus Compatibility specification](/docs/specs/otel/compatibility/opencensus#migration-path).

## What to Expect After July 31, 2023

After July 31st, 2023, the OpenCensus project will no longer be maintained. This
means that there will be no new features added to the project, and any security
vulnerabilities that are found will not be patched.

However, the OpenCensus repositories will remain archived on GitHub. This means
users will still be able to download the OpenCensus code and use it in their
projects. Existing releases of OpenCensus will remain available in public
package repositories like NPM and PyPI. **We encourage all OpenCensus users to
begin planning their project's migration to OpenTelemetry now.**

One exception to this is the [census-instrumentation/opencensus-python][]
repository[^python-timeline].

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

[^python-timeline]:
    A number of projects within the `opencensus-python` repository are still
    being used as recommended production solutions. These projects will continue
    to be maintained. For details regarding maintenance timeline, next steps for
    migration, and general support questions, reach out to repository maintainers.

[^shim-next-release]: Python and JavaScript shim packages will be released soon.
[^shim-support]:
    These shims implement the stable
    [OpenCensus Compatibility specification](/docs/specs/otel/compatibility/opencensus#migration-path)
    and will be supported for at least one year following
    [OpenTelemetry's long term support](/docs/specs/otel/versioning-and-stability/#long-term-support)
    guidelines.
