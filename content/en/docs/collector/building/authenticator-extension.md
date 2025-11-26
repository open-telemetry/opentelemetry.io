---
title: Building an authenticator extension
weight: 40
aliases: [/docs/collector/custom-auth/]
cSpell:ignore: configauth oidc
---

The OpenTelemetry Collector allows receivers and exporters to be connected to
authenticators, providing a way to authenticate incoming connections at the
receiver side, and add authentication data to outgoing requests at
the exporter side.

This mechanism is implemented through [extensions]. This document will guide
you on implementing your own authenticators. If you are looking for
documentation on how to use an existing authenticator, refer to the Getting
Started page and the documentation for that specific authenticator. You can find a list of
existing authenticators in the registry on this website.

Use this guide for general directions on how to build a custom authenticator and
refer to the up-to-date
[API Reference Guide](https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth)
for the actual semantics of each type and function.

If at anytime you need assistance, join the
[#opentelemetry-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W)
room at the [CNCF Slack workspace](https://slack.cncf.io).

## Architecture

[Authenticators] are regular extensions that also satisfy one or more interfaces
related to the authentication mechanism. [Server authenticators][sa] are used
with receivers and can intercept HTTP and gRPC requests, while client
authenticators are used with exporters and can add authentication data to HTTP
and gRPC requests. It is possible for authenticators to implement both
interfaces at the same time, allowing a single instance of the extension to handle
both incoming and outgoing requests.  
**Note:** Users may prefer having different authenticators for the incoming and
outgoing requests, so don't make your authenticator required to be used for both
incoming and outgoing requests.

Once an authenticator extension is available in the collector distribution, it
can be referenced in the configuration file as a regular extension:

```yaml
extensions:
  oidc:

receivers:
processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers: []
      processors: []
      exporters: []
```

However, an authenticator will need to be referenced by a consuming component to
be effective. The following example shows the same extension above, now being
used by a receiver named `otlp/auth`:

```yaml
extensions:
  oidc:

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

When multiple instances of a given authenticator are needed, they can have
different names:

```yaml
extensions:
  oidc/some-provider:
  oidc/another-provider:

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc/some-provider

processors:
exporters:

service:
  extensions:
    - oidc/some-provider
    - oidc/another-provider
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

### Server authenticators

A [server authenticator][sa] is essentially an extension with an `Authenticate`
function, receiving the payload headers as a parameter. If the authenticator can
authenticate the incoming connection, it should return a `nil` error, or
the concrete error if it can't. As an extension, the authenticator should ensure to initialize all the resources it needs during the
[`Start`](https://pkg.go.dev/go.opentelemetry.io/collector/component#Component)
phase, and it is expected to clean them up upon `Shutdown`.

The `Authenticate` call is part of the hot path for incoming requests and will
block the pipeline. Therefore, make sure to handle any blocking operations you
need to make properly. Specifically, respect the deadline set by the context, if one
is provided. Also, make sure to add enough observability to your extension,
especially in the form of metrics and traces. This will enable users to set up a
notification system that alerts them in case error rates exceed a certain level, as well as to debug specific failures.

### Client authenticators

A _client authenticator_ implements one or more of the interfaces
defined in [Client authenticators].

Similar to server authenticators, client authenticators are essentially extensions with extra
functions. Each authenticator receives an object that allows it
to inject the authentication data. For instance, the HTTP client
authenticator provides an
[`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper), while the gRPC client authenticator can produce a
[`credentials.PerRPCCredentials`](https://pkg.go.dev/google.golang.org/grpc/credentials#PerRPCCredentials).

## Adding your custom authenticator to a distribution

Custom authenticators must be part of the same binary as the main collector.
When building your own authenticator, you will likely have to build a custom
distribution or provide a way for your users to use your extension
as part of their own distributions. Fortunately, you can build a custom distribution
using the [OpenTelemetry Collector Builder][builder] utility.

[authenticators]:
  https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth
[builder]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[client authenticators]:
  https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#client-authenticators
[extensions]: ../../configuration/#extensions
[sa]:
  https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#server-authenticators
