---
title: HTTP semantic conventions declared stable
linkTitle: HTTP semconv are stable
date: 2023-11-03
author: '[Trask Stalnaker](https://github.com/trask) (Microsoft)'
cSpell:ignore: Liudmila Molkova
---

Early this year, we launched an effort to stabilize HTTP semantic
conventions. Today, we proudly announce that the HTTP
semantic conventions are the _first_ OpenTelemetry semantic conventions to be
declared **[stable](/docs/specs/otel/document-status/)**! This inaugural stable release marks a substantial advancement from earlier versions, featuring:

- Enhancements resulting from
  [convergence with the Elastic Common Schema](/blog/2023/ecs-otel-semconv-convergence/), such as:
  - The `url.*` namespace, which can be reused in the future by non-HTTP
    semantic conventions
  - The `client.*` and `server.*` namespaces, which are easier to reason about
    and work better on logs (where there is no span kind)
  - More consistency around using the `http.request.*` and `http.response.*`
    namespaces
- Further alignment with Prometheus by adopting seconds as the standard unit for
  metrics
- Streamlined attribute capture by omitting less useful attributes, reducing telemetry capture, processing, and storage costs.
- Clarified the definition of default values, eliminating ambiguities when attributes are absent.
- Metric cardinality problems have been addressed

## Transition plan

Due to the significant number of modifications and the extensive user base affected by them, we require instrumentations to create a transition plan that will assist users in upgrading to the stable HTTP semantic conventions. We plan to use a similar transition plan when stabilizing other semantic conventions.

A warning like this appears at the top of stable HTTP semantic convention pages:

> **Warning** When adopting the stable HTTP semantic conventions, existing HTTP
> instrumentations
>
> - SHOULD introduce an environment variable `OTEL_SEMCONV_STABILITY_OPT_IN` in
>   their existing major version, which accepts:
>   - `http` - emit the new, stable HTTP and networking conventions, and stop
>     emitting the old HTTP and networking conventions that the instrumentation
>     emitted previously.
>   - `http/dup` - emit both the old and the stable HTTP and networking
>     conventions, allowing for a seamless transition.
>   - The default behavior (in the absence of one of these values) is to
>     continue emitting whatever version of the old HTTP and networking
>     conventions the instrumentation was emitting previously.
> - SHOULD maintain (security patching at a minimum) the existing major version
>   for at least six months after it starts emitting both sets of conventions.
> - SHOULD drop the environment variable in the next major version and emit only
>   the stable HTTP and networking conventions.

## Summary of changes

In this section we summarize the changes made to the HTTP semantic conventions
from
[v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md)
to [v1.23.0
(stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/).

### Common attributes across HTTP client and HTTP server spans

[`v1.20.0`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#common-attributes)
->
[`v1.23.0` (stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#common-attributes)

- `http.method` -> `http.request.method`
  - Now captures only 9 common HTTP methods by default (configurable) plus
    `_OTHER`
- `http.status_code` -> `http.response.status_code`
- `http.request.header.<key>`
  - Dash (`"-"`) to underscore (`"_"`) normalization in `<key>` has been removed
  - HTTP Server spans: now must be provided to sampler
- `http.response.header.<key>`
  - Dash (`"-"`) to underscore (`"_"`) normalization in `<key>` has been removed
- `http.request_content_length` -> `http.request.body.size`
  - Recommended -> Opt-In
  - _Not marked stable yet_
- `http.response_content_length` -> `http.response.body.size`
  - Recommended -> Opt-In
  - _Not marked stable yet_
- `user_agent.original`
  - HTTP Client spans: Recommended -> Opt-In
  - HTTP Server spans: now must be provided to sampler
  - (see below if updating from version `v1.18.0` or earlier)
- `net.protocol.name` -> `network.protocol.name`
  - Recommended -> Conditionally required if not `http` and
    `network.protocol.version` is set
- `net.protocol.version` -> `network.protocol.version`
  - Examples fixed: `2.0` -> `2` and `3.0` -> `3`
  - (see below if updating from version `v1.19.0` or earlier)
- `net.sock.family` -> Removed
- `net.sock.peer.addr` -> `network.peer.address`
  - HTTP server spans: if `http.client_ip` was unknown (i.e. no
    [`X-Forwarded-For`][X-Forwarded-For], [`Forwarded#for`][Forwarded#for]
    headers), then _also_ `net.sock.peer.addr` -> `client.address` (and note
    `client.address` must be provided to sampler)
- `net.sock.peer.port` -> `network.peer.port`
  - Now captured even if same as `server.port`
- `net.sock.peer.name` -> Removed
- New: `http.request.method_original` (only captured when `http.request.method`
  is `_OTHER`)
- New: `error.type`

### HTTP client span attributes

[`v1.20.0`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#http-client)
->
[`v1.23.0` (stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#http-client)

- `http.url` -> `url.full`
- `http.resend_count` -> `http.request.resend_count`
- `net.peer.name` -> `server.address`
- `net.peer.port` -> `server.port`
  - Now captured even when same as default port for scheme

### HTTP server span attributes

[`v1.20.0`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#http-server)
->
[`v1.23.0` (stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#http-server)

- `http.route` (No change)
- `http.target` -> split into `url.path` and `url.query`
- `http.scheme` -> `url.scheme`
  - Now factors in [`X-Forwarded-Proto`][X-Forwarded-Proto],
    [`Forwarded#proto`][Forwarded#proto] headers
- `http.client_ip` -> `client.address`
  - If `http.client_ip` was unknown (i.e. no
    [`X-Forwarded-For`][X-Forwarded-For], [`Forwarded#for`][Forwarded#for]
    headers), then `net.sock.peer.addr` -> `client.address`
  - Now must be provided to sampler
- `net.host.name` -> `server.address`
  - Now based only on [`Host`][Host header], [:authority][HTTP/2 authority],
    [`X-Forwarded-Host`][X-Forwarded-Host], [`Forwarded#host`][Forwarded#host]
    headers)
- `net.host.port` -> `server.port`
  - Now based only on [`Host`][Host header], [:authority][HTTP/2 authority],
    [`X-Forwarded-Host`][X-Forwarded-Host], [`Forwarded#host`][Forwarded#host]
    headers)

### HTTP client and server span names

[`v1.20.0`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#name)
->
[`v1.23.0` (stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#name)

The `{http.method}` portion of span names is replace by `HTTP` when
`{http.method}` is `_OTHER`.

Note: see below if updating from version `v1.17.0` or earlier.

### HTTP client duration metric

[`v1.20.0`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/metrics/semantic_conventions/http-metrics.md#metric-httpclientduration)
->
[`v1.23.0` (stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.22.0/docs/http/http-metrics.md#metric-httpclientrequestduration)

- Name: `http.client.duration` -> `http.client.request.duration`
- Unit: `ms` -> `s`
- Description: `Measures the duration of inbound HTTP requests.` ->
  `Duration of HTTP server requests.`
- Histogram buckets: boundaries updated to reflect change from milliseconds to
  seconds, and zero bucket boundary removed
- Attribute changes:
  - `http.method` -> `http.request.method`
    - Now captures only 9 common HTTP methods by default plus `_OTHER`
  - `http.status_code` -> `http.response.status_code`
  - `net.peer.name` -> `server.address`
  - `net.peer.port` -> `server.port`
    - Now captured even when same as default port for scheme
  - `net.sock.peer.addr` -> Removed
  - `net.protocol.name` -> `network.protocol.name`
    - Recommended -> Conditionally required if not `http` and
      `network.protocol.version` is set
  - `net.protocol.version` -> `network.protocol.version`
    - Examples fixed: `2.0` -> `2` and `3.0` -> `3`
    - Note: see below if updating from version `v1.19.0` or earlier
  - New: `error.type`

### HTTP server duration metric

[`v1.20.0`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/metrics/semantic_conventions/http-metrics.md#metric-httpserverduration)
->
[`v1.23.0` (stable)](https://github.com/open-telemetry/semantic-conventions/blob/v1.22.0/docs/http/http-metrics.md#metric-httpserverrequestduration)

- Name `http.server.duration` -> `http.server.request.duration`
- Unit: `ms` -> `s`
- Description: `Measures the duration of inbound HTTP requests.` ->
  `Duration of HTTP server requests.`
- Histogram buckets: boundaries updated to reflect change from milliseconds to
  seconds, and zero bucket boundary removed
- Attribute changes:
  - `http.route` (No change)
  - `http.method` -> `http.request.method`
    - Now captures only 9 common HTTP methods by default plus `_OTHER`
  - `http.status_code` -> `http.response.status_code`
  - `http.scheme` -> `url.scheme`
    - Now factors in [`X-Forwarded-Proto`][X-Forwarded-Proto],
      [`Forwarded#proto`][Forwarded#proto] headers
  - `net.protocol.name` -> `network.protocol.name`
    - Recommended -> Conditionally required if not `http` and
      `network.protocol.version` is set
  - `net.protocol.version` -> `network.protocol.version`
    - Examples fixed: `2.0` -> `2` and `3.0` -> `3`
    - Note: see below if updating from version `v1.19.0` or earlier
  - `net.host.name` -> `server.address`
    - Recommended -> Opt-In (due to high-cardinality vulnerability since based
      on HTTP headers)
    - Now based only on [`Host`][Host header], [:authority][HTTP/2 authority],
      [`X-Forwarded-Host`][X-Forwarded-Host], [`Forwarded#host`][Forwarded#host]
      headers)
  - `net.host.port` -> `server.port`
    - Recommended -> Opt-In (due to high-cardinality vulnerability since based
      on HTTP headers)
    - Now based only on [`Host`][Host header], [:authority][HTTP/2 authority],
      [`X-Forwarded-Host`][X-Forwarded-Host], [`Forwarded#host`][Forwarded#host]
      headers)
  - New: `error.type`

## Migrating from a version earlier than v1.20.0?

### Migrating from `<= v1.19.0`

- `http.flavor` -> `network.protocol.version`
  - Examples fixed: `2.0` -> `2` and `3.0` -> `3`

### Migrating from `<= v1.18.0`

- `http.user_agent` -> `user_agent.original`

### Migrating from `<= v1.17.0`

#### HTTP server span name

- when `http.route` is available
  - `{http.route}` -> `{summary} {http.route}`
- when `http.route` is not available
  - `HTTP {http.method}` -> `{summary}`

where `{summary}` is `{http.method}`, unless `{http.method}` is `_OTHER`, in
which case `{summary}` is `HTTP`.

#### HTTP client span name

- `HTTP {http.method}` -> `{summary}`

where `{summary}` is `{http.method}`, unless `{http.method}` is `_OTHER`, in
which case `{summary}` is `HTTP`.

[Host header]: https://tools.ietf.org/html/rfc7230#section-5.4
[HTTP/2 authority]: https://tools.ietf.org/html/rfc9113#section-8.3.1
[Forwarded#for]:
  https://developer.mozilla.org/docs/Web/HTTP/Headers/Forwarded#for
[Forwarded#proto]:
  https://developer.mozilla.org/docs/Web/HTTP/Headers/Forwarded#proto
[Forwarded#host]:
  https://developer.mozilla.org/docs/Web/HTTP/Headers/Forwarded#host
[X-Forwarded-For]:
  https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Forwarded-For
[X-Forwarded-Proto]:
  https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Forwarded-Proto
[X-Forwarded-Host]:
  https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Forwarded-Host

## Community Kudos

This was a massive community effort: thanks to all who got involved! A special thanks to
[Liudmila Molkova](https://github.com/lmolkova) for sharing her HTTP domain expertise, which helped drive this effort every step of the way.
