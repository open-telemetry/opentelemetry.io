---
title: Distributions
description:
  List of open source OpenTelemetry distributions maintained by third parties.
---

OpenTelemetry [distributions](/docs/concepts/distributions/) are a way of
customizing OpenTelemetry components so that they're easier to deploy and use
with specific observability backends.

Any third-party can customize OpenTelemetry components with backend, vendor, or
end-user specific changes. You don't have to use a distributions in order to use
OpenTelemetry components, though distributions might facilitate usage under
certain circumstances, such as specific vendor requirements.

The following list contains a sample of OpenTelemetry distributions and the
component they customize.

{{% alert title="Note" color="warning" %}} OpenTelemetry **does not validate or
endorse** the third-party distributions listed in the following table. The list
is provided as a convenience for the community. {{% /alert %}}

{{% ecosystem/distributions-table %}}

## Adding your distribution {#how-to-add}

To have your distribution listed, [submit a PR] with an entry added to the
[distributions list]. The entry should include the following:

- Link to the main page of your distribution
- Link to the documentation that explains how to use the distribution
- List the components your distribution contains
- GitHub handle or email address as a point of contact so that we can reach out
  in case we have questions

{{% alert title="Notes" color="info" %}}

- If you provide external integration of OpenTelemetry for any kind of library,
  service, or app, then consider
  [adding it to the registry](/ecosystem/registry/adding).
- If you adopt OpenTelemetry for observability as an end user and do not provide
  any kind of services around OpenTelemetry, see
  [Adopters](/ecosystem/adopters).
- If you provide a solution that consumes OpenTelemetry to offer observability
  to end users, see [Vendors](/ecosystem/vendors).

{{% /alert %}}

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md distribution %}}

[distributions list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
