---
title: Build an authenticator extension
linkTitle: Authenticator
weight: 100
aliases:
  - /docs/collector/custom-auth
  - /docs/collector/building/authenticator-extension
cSpell:ignore: configauth oidc
---

The OpenTelemetry Collector allows you to connect receivers and exporters to
authenticators so you can authenticate incoming connections at the receiver side
and add authentication data to outgoing requests at the exporter side.

Authenticators are implemented through [extensions][]. This document guides you
on implementing your own authenticators. If you want to learn how to use an
existing authenticator, see the documentation for that specific authenticator.
You can find a list of existing authenticators in the
[registry](/ecosystem/registry/) on this website.

Use this guide for general directions on how to build a custom authenticator and
see the
[API Reference Guide](https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth)
for the semantics of each type and function.

If you need help, join the
[#opentelemetry-collector-dev](https://cloud-native.slack.com/archives/C07CCCMRXBK)
channel at the [CNCF Slack workspace](https://slack.cncf.io).

## Architecture

[Authenticators][] in OpenTelemetry are just like any other extension, but they
also have to implement one or more specific interfaces that define how
authentication is performed (for example, authenticating HTTP or gRPC requests).
Use [server authenticators][sa] with receivers to intercept HTTP and gRPC
requests. Use client authenticators with exporters to add authentication data to
HTTP and gRPC requests. Authenticators can also implement both interfaces at the
same time, allowing a single instance of the extension to handle both incoming
and outgoing requests.

Once an authenticator extension is available in a Collector distribution, you
can reference it in the configuration file the same as other extensions.
However, an authenticator is effective only when it's referenced by a consuming
component. The following configuration shows a receiver named `otlp/auth` using
the `oidc` authenticator extension:

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

If you need multiple instances of an authenticator, give them different names:

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

A [server authenticator][sa] is an extension with an `Authenticate` method. This
function is called whenever a request comes in, and it checks the request’s
headers to authenticate the request. If the authenticator decides the request is
valid, it returns a `nil` error. If the request isn’t valid, it returns an error
explaining why.

Because it’s an extension, the authenticator should set up the resources it
needs (like keys, clients, or caches) at
[`Start`](https://pkg.go.dev/go.opentelemetry.io/collector/component#Component)
and should clean everything up at `Shutdown`.

The `Authenticate` function runs for every incoming request, and the pipeline
can’t move forward until this function finishes. Because of that, your
authenticator must avoid slow or unnecessary blocking work. If the `context`
sets a deadline, make sure your code follows it so the pipeline isn't delayed or
left hanging.

You should also add good observability to your authenticator, especially metrics
and traces. This helps users set up alerts if errors start increasing and makes
it easier for them to troubleshoot authentication problems.

### Client authenticators

[Client authenticators][] are extensions with extra functions that implement one
or more of the defined interfaces. Each authenticator receives an object that
allows it to inject authentication data. For instance, the HTTP client
authenticator provides an
[`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper), while the gRPC
client authenticator can produce a
[`credentials.PerRPCCredentials`](https://pkg.go.dev/google.golang.org/grpc/credentials#PerRPCCredentials).

## Add your custom authenticator to a distribution

Custom authenticators must be part of the same binary as the Collector itself.
When building your own authenticator, you have two options:

- You can build a custom Collector distribution using the [OpenTelemetry
  Collector Builder][builder]
- You can provide a way, such as publishing a Go module, for users to add your
  extension to their own distributions.

[authenticators]:
  https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth
[builder]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[client authenticators]:
  https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#client-authenticators
[extensions]: /docs/collector/configuration/#extensions
[sa]:
  https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#server-authenticators
