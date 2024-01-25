---
title: Distributions
description:
  Libraries, services, and apps with first-party support for OpenTelemetry.
aliases: [/distributions]
---

OpenTelemetry [distributions](/docs/concepts/distributions/) are a way of
customizing OpenTelemetry components so that they're easier to deploy and use
with specific observability back ends.

Any third-party can customize OpenTelemetry components with back-end, vendor, or
end-user specific changes. You don't have to use a distributions in order to use
OpenTelemetry components, though distributions might facilitate usage under
certain circumstances, such as specific vendor requirements.

The following list contains a sample of OpenTelemetry distributions and the
component they customize.

{{% ecosystem/distributions-table %}}

## How to add your distribution {#how-to-add}

To have your library, service, or app listed, submit a PR with an entry added to
the
[distributions list](https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml).
The entry must include the following:

- Link to the main page of your distribution
- Link to the documentation that explains how to use the distribution
- List the components your distribution contains
- GitHub handle or email address as a point of contact so that we can reach out
  in case we have questions

{{% alert title="Note" color="info" %}}

If you provide external integration of OpenTelemetry for any kind of library,
service, or app, then
[consider adding it to the registry](/ecosystem/registry/adding).

If you adopt OpenTelemetry for Observability as an end user and do not provide
any kind of services around OpenTelemetry, see [Adopters](/ecosystem/adopters).

If you provide a solution that consumes OpenTelemetry to offer observability to
end users, see [Vendors](/ecosystem/vendors).

{{% /alert %}}
