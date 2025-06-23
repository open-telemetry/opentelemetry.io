---
title: Integrations
description:
  Libraries, services, and apps with first-party support for OpenTelemetry.
aliases: [/integrations]
---

The mission of OpenTelemetry is
[to enable effective observability by making high-quality, portable telemetry ubiquitous](/community/mission/).
In other words, observability should be built in into the software you develop.

While external instrumentation through
[zero code instrumentation solutions](/docs/concepts/instrumentation/zero-code)
and
[instrumentation libraries](/docs/specs/otel/overview/#instrumentation-libraries)
provide a convenient way to make your application observable, we believe that
ultimately all applications should either integrate the OpenTelemetry APIs and
SDKs directly for native telemetry, or provide a first-party plugin that fits
into the ecosystem of the given software.

This page contains a sample of libraries, services, and apps providing native
instrumentation or first class plugins.

## Libraries

Native library instrumentation with OpenTelemetry provides better observability
and developer experience for users, removing the need for libraries to expose
and document hooks. Below you will find a list of libraries that use the
OpenTelemetry API to provide out of the box observability.

{{% ecosystem/integrations-table "native libraries" %}}

## Applications and Services

The following list contains a sample of libraries, services, and apps that have
either integrated OpenTelemetry APIs and SDKs directly for native telemetry or
provide a first-party plugin that fits into their own extensibility ecosystem.

Open source projects (OSS) are at the beginning of the list, and commercial
projects follow. Projects which are part of the [CNCF](https://www.cncf.io/)
have a CNCF logo beside their name.

{{% ecosystem/integrations-table "application integrations" %}}

## Adding your integration {#how-to-add}

To have your library, service, or app listed, [submit a PR] with an entry added
to the [registry](/ecosystem/registry/adding). The entry should include the
following:

- Link to the main page of your library, service, or app
- Link to the documentation that explains how enable observability using
  OpenTelemetry

{{% alert title="Note" %}}

If you provide external integration of OpenTelemetry for any kind of library,
service, or app, then
[consider adding it to the registry](/ecosystem/registry/adding).

If you adopt OpenTelemetry for Observability as an end user and do not provide
any kind of services around OpenTelemetry, see [Adopters](/ecosystem/adopters).

If you provide a solution that consumes OpenTelemetry to offer observability to
end users, see [Vendors](/ecosystem/vendors).

{{% /alert %}}

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md integration %}}
