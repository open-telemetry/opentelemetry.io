---
title: >-
  OTel-Native by Design - Building Products That Export to Any Observability
  Stack
linkTitle: OTel-Native by Design
date: 2026-08-11
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Nityananda Gohain](https://github.com/nityanandagohain) (SigNoz), [Dhruv
  Ahuja](https://github.com/dhruv-ahuja) (SigNoz)
draft: true # TODO: remove this line once your post is ready to be published
body_class: otel-with-contributions-from
issue: 10300
sig: SIG End User
cSpell:ignore: Ahuja Dhruv Gohain Nityananda
---

With contributions from [Daniel Gomez Blanco](https://github.com/danielgblanco)
(New Relic).

If you're building self-hosted software or a SaaS product, your users will
eventually ask to send **logs, traces, and metrics** to their own observability
stack, whether to satisfy compliance, manage costs, or centralize all their
observability data in one place.

Locking them into your built-in dashboards or limiting exports to certain
vendors creates unnecessary friction. Instead, supporting export to any
OpenTelemetry (OTel)-compatible backend is a vendor-neutral, future-proof
practice that gives users the freedom to choose their observability stack.

This post outlines how you can design your product so users can export **full
telemetry** (logs, traces, and metrics) to an OTel backend when they want to.

![Enabling telemetry export via the OTLP standard allows users to own and
analyze their data on the platforms of their
choosing.](cover.webp)

## The three observability signals

OpenTelemetry defines three main signal types, all carried over the same
[OTLP protocol](/docs/specs/otlp/):

- **[Logs](/docs/concepts/signals/logs/):** Event records, request/access logs,
  and application logs with timestamps and metadata.
- **[Traces](/docs/concepts/signals/traces/):** Distributed traces and spans so
  users can see request flows across services and correlate them with logs.
- **[Metrics](/docs/concepts/signals/metrics/):** Counters, gauges, and
  histograms (e.g. request rates, latency, error rates).

The same export story applies to all three: let users configure an OTLP endpoint
and **push** telemetry to it. You can support one, two, or all three signals
depending on what your product generates.

Many platforms that support OTel export support at least traces and logs, and an
increasing number now ship with metrics support. Designing for all three from
the start avoids having to retrofit later.

## What a "good" telemetry system looks like

A solid export story has a few clear properties for every signal you support:

- **Vendor-neutral:** Users can point at any OTel-compatible endpoint — a
  [Collector instance](/docs/collector/), or one of the many
  [backends that support OTLP directly](/ecosystem/vendors/) — without building
  custom integrations for each.
- **No deep custom development:** External platforms (or your users' tooling)
  can integrate using standard [OTel SDKs](/docs/languages/) and the OTLP
  protocol instead of proprietary APIs.
- **Rich context preserved:** Exported data should include metadata, timestamps,
  and trace/span correlation where available (e.g. log records linked to trace
  IDs), so users can debug and analyze data in their own backend without losing
  context.

If your design aligns with these principles for the signals you emit, you're in
step with how modern platforms think about observability export.

## Two contexts: where does your product run?

The way you add OTel export depends on **who owns the system** that produces the
telemetry. Getting this straight helps you choose the right approach.

### Self-hosted software

Your product is an application or system (e.g., an identity server, a service
mesh, a database) that customers install and run in _their_ environment (their
data center, their cloud, their Kubernetes cluster).

Here, you **instrument your product** with OpenTelemetry. When the customer
configures an endpoint (e.g. via a startup flag or config file), your
application exports telemetry from the process they're running.

The export happens in the customer's environment; they control the binary and
the destination. _Examples: Keycloak, Kuma._

### Cloud platforms

Your product is a platform where customers deploy their _own_ apps or use your
managed services (e.g. PaaS, serverless, API gateway). The workload runs on
_your_ infrastructure.

Here, you add a **platform feature,** such as "Telemetry Drains" or
"Observability Destinations" that lets customers configure _where_ to send
telemetry. Your platform collects telemetry from their workload (and from your
own services, like routers) and forwards it to the customer's OTLP endpoint.

The export is done by your infrastructure, not by an application binary the
customer runs. _Examples: Heroku, Cloudflare._

In short, **user-deployed software** → focus on **built-in instrumentation** and
an endpoint config. A **platform you operate** → focus on **configurable export
destinations** that your infrastructure uses to forward data.

## How others do it

This post focuses on four companies — Kuma, Keycloak, Cloudflare, and Heroku —
as representative examples across the two contexts above, but they're far from
the only ones already exporting telemetry natively via OTLP. The
[OpenTelemetry Integrations](/ecosystem/integrations/) page features libraries
and services that provide native instrumentation or first-class plugins.

Below is how these four handle **all three signals** (or a subset) and what you
can learn from them.

| Platform           | Logs | Traces | Metrics | Deployment Mode       | Notes                                   |
| ------------------ | ---- | ------ | ------- | --------------------- | --------------------------------------- |
| Kuma               | Yes  | Yes    | Yes     | Software users deploy | Separate policies per signal, all OTel  |
| Keycloak           | Yes† | Yes    | Yes     | Software users deploy | †Logs in preview; same endpoint for all |
| Cloudflare Workers | Yes  | Yes    | No\*    | Platform              | \*Metrics export not yet supported      |
| Heroku             | Yes  | Yes    | Yes     | Platform              | User chooses signals via `--signals`    |

### The self-hosted approach: Kuma & Keycloak

If your users deploy your software into their own environments, the best
practice is to ship the application pre-instrumented with OpenTelemetry and
expose configuration flags for their OTLP endpoints.

#### Kuma

Whether customers run Kuma's control and data planes on their own Kubernetes
clusters or VMs, it comes pre-configured to emit logs, traces, and metrics to an
OTel backend.

Users configure the export, which runs from their Kuma deployments, through the
mesh policies:

- **MeshAccessLog:** Routes access logs to an OTel Collector (endpoint +
  attributes such as mesh name, start time).
- **MeshTrace:** Handles distributed traces with configurable sampling and
  tagging.
- **MeshMetric:** Exposes control and data plane metrics. Integrates with
  OpenTelemetry and Prometheus.

For example, sending traces to an OTel backend looks like this:

```yaml
# MeshTrace policy
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
```

Sending access logs follows the exact same pattern with a different policy:

```yaml
# MeshAccessLog policy
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
body:
  kvlistValue:
    values:
      - key: mesh
        value:
          stringValue: '%KUMA_MESH%'
attributes:
  - key: start_time
    value:
      stringValue: '%START_TIME%'
```

Further reading:

- [Kuma MeshAccessLog – OpenTelemetry](https://kuma.io/docs/2.13.x/policies/meshaccesslog/#opentelemetry)
- [Kuma MeshTrace](https://kuma.io/docs/latest/policies/meshtrace/)
  (OpenTelemetry backend)
- [Kuma observability](https://kuma.io/docs/2.13.x/explore/observability/)

#### Keycloak

Keycloak is another example of self-hosted software providing great telemetry
export functionality.

Instead of requiring a separate sidecar or platform feature, users just pass a
startup flag pointing to their Collector endpoint, and the Keycloak process
itself handles the export.

It uses a single telemetry endpoint but provides granular flags to toggle
specific signals:

- **Traces:** `tracing-enabled=true` (covers HTTP requests, DB, LDAP, outbound
  HTTP/IdP).
- **Metrics:** Detailed metrics exposed via the same OTel integration.
- **Logs:** Currently in preview and disabled by default
  (`--features=opentelemetry-logs --telemetry-logs-enabled=true`, with
  `--telemetry-logs-level` for level filtering).

Defining the endpoint, optional headers, and preferred protocol (gRPC or HTTP)
looks like:

```bash
bin/kc.sh start --telemetry-endpoint=http://my-otel-endpoint:4317 --telemetry-protocol=grpc
```

Further reading:

- [Keycloak Observability / Telemetry](https://www.keycloak.org/observability/telemetry)

> [!NOTE] A Common Design Pattern
>
> Both deployment modes have a common, recurring theme.
>
> **Push-based export using OTel/OTLP is the preferred and practical pattern.**
> Some products expose one endpoint for all three signals (Keycloak, for
> example, uses a single shared endpoint), whereas others let users pick which
> signals to send (Heroku's `--signals`).
>
> Natively supporting all telemetry signals gives your users more flexibility to
> build a complete picture in their backend of choice.

### The platform approach: Cloudflare and Heroku

When you control the infrastructure, a straightforward user experience is to
handle the export at the platform level, pulling data from the user's workload
and pushing it to their destination.

#### Cloudflare Workers

Because users run their code directly on Cloudflare's infrastructure, it handles
the export through the **Observability Destinations** platform feature. It
offers users a streamlined design where they can configure an OTLP endpoint in
their dashboard. From there, Cloudflare automatically pushes traces and logs
from Workers to that destination.

While metrics aren't supported yet, the trace data provides deep, end-to-end
visibility as it records handler calls, bindings, outbound fetch calls, and
more. Users can also configure the sampling rate in their `wrangler.toml`.

Further reading:

- [Exporting OpenTelemetry data from Workers](https://developers.cloudflare.com/workers/observability/exporting-opentelemetry-data/)
- [Cloudflare Workers and Traces](https://developers.cloudflare.com/workers/observability/traces/)

#### Heroku

Heroku takes a slightly different, highly configurable approach with **Telemetry
Drains**. Users add a destination by specifying the endpoint, transport protocol
and headers, and then explicitly choose _which signals to export_.

Heroku's platform then gathers data from both the user's application (via the
OTel SDK) and first-party services (like their Router) and pushes it to the
destination.

```bash
heroku telemetry:add <endpoint> --app <app-name> --signals traces,metrics,logs --transport http --headers '{"Authorization": "ingestion key"}'
```

Giving users granular control over which signals to export is a pragmatic design
pattern, especially for teams looking to manage data volume and ingestion costs.

Further reading:

- [Heroku Telemetry](https://devcenter.heroku.com/articles/heroku-telemetry)
- [Heroku OpenTelemetry signals and attributes](https://devcenter.heroku.com/articles/heroku-opentelemetry-signals-and-attributes-reference)
- [Working with Heroku Telemetry Drains](https://devcenter.heroku.com/articles/working-with-heroku-telemetry-drains)

## Designing your export model

Across all three telemetry signals, the fundamental architectural question
remains the same: will your platform enable the user to **pull** the data via an
API that the user polls at an interval, or **push** it to a user-configured
endpoint.

### The pull model (custom receivers)

Pull is the traditional way platforms have exposed telemetry: you expose an API
for it, and the user's observability stack (or a custom receiver they build) has
to continuously poll that API, handle pagination, and ingest the results into
their own backend.

It's a reasonable starting point if you already have a mature, well-tested API
for logs or metrics, since extending it is often easier than building a new push
path. But it comes with real costs.

The problem with this model is that you are shifting a significant operational
responsibility onto your users. They must now build scalable polling systems
that can manage polling intervals, paginate API responses, retry on failures,
and backfill missing data.

Worse, achieving near real-time delivery is significantly harder, which is often
a critical requirement for latency-sensitive signals like traces and metrics.

For logs, a pull-based receiver often looks like this (e.g.
[CloudWatch Logs–style](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/8bee89f9928b4b1f81700f9ab0e5886d428bfae6/receiver/awscloudwatchreceiver/logs.go#L293)):

```text
state: last_end_time
every poll_interval:
  start_time = last_end_time
  end_time   = now()
  next_token = null
  do:
    response = FilterLogEvents(log_groups, start_time, end_time, next_token)
    emit(response.events)
    next_token = response.nextToken
  while next_token != null
```

You'd need similar state-tracking logic for metrics or trace APIs.

Because it forces users to write custom code just to convert your API responses
into standard formats, the pull model is workable when you have a mature,
well-established API for a given signal. For new designs, however, it should not
be the default.

### The push model (OTLP)

For developer-focused, real-time telemetry, OTLP push has become the dominant
pattern.

Instead of waiting to be asked, your service (or an OpenTelemetry Collector you
run) actively exports logs, traces, and metrics directly to the user's
configured endpoint using OTLP (over HTTP or gRPC).

It uses one vendor-neutral, industry-standard protocol for all three signals.
OTLP provides first-class support for structured data and metadata, meaning
crucial context, such as linking specific logs to their parent trace IDs, is
preserved automatically.

From the user's perspective, it is practically plug-and-play. Any
OTel-compatible backend can ingest the data in near real-time without requiring
custom polling logic.

### Building the export experience

When implementing the export model in your product, seek to maximize flexibility
with minimal configuration.

#### Let users configure an OTLP endpoint

Start by letting users provide their own OTLP endpoint and any necessary
authentication headers (like an ingestion key).

_But don't stop there!_

To allow users to control export volume, simplify data management, and reduce
costs, let users explicitly toggle which signals they want to export — following
Heroku's example.

#### Standardize the architecture

Under the hood, you have two main options: use the OpenTelemetry SDK directly
within your services to emit data, or run an internal OTel Collector that
gathers your system's telemetry and re-exports it to the user's endpoint.

Sticking to standard OpenTelemetry environment variables (like
[`OTEL_EXPORTER_OTLP_ENDPOINT`](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_endpoint))
makes the underlying plumbing reliable and easy to document and reason about.

#### Keep semantics consistent

Beyond just OTel-based environment variables, make sure you maintain consistent
semantics across all your signals. Document your attribute names and schemas —
[Semantic Conventions](/docs/specs/semconv/) is a good reference for naming
these consistently — and exactly how logs and metrics relate back to trace and
span IDs.

When a user ingests your telemetry into their observability backend, everything
should connect end-to-end to tell the complete story.

One benefit of this approach is that you avoid the need to build different
vendor integrations. By exporting telemetry via OTLP, you enable users to
transform and ingest it in their desired formats.

For example, a user might wish to forward logs to their backend and to an object
store like S3 to meet compliance requirements.

### Routing telemetry to the user

As you design the configuration UI for your users, you'll need to decide how
granular your telemetry routing should be. You generally have two paths, each
catering to a different type of user.

#### Single endpoint

For the vast majority of users, a single endpoint configuration is ideal. Here,
the user inputs one base URL, and your exporter appends the standard OTLP paths
(`v1/traces`, `v1/metrics`, and `v1/logs`) internally.

#### Per-signal endpoints

Large-scale customers, or those managing complex observability setups, may wish
to send telemetry signals to different platforms.

OTLP natively supports this with signal-specific variables defined by the
`OTEL_EXPORTER_OTLP_<SIGNAL>_ENDPOINT` pattern, along with corresponding
[header configurations](/docs/languages/sdk-configuration/otlp-exporter/#header-configuration).
For example, to configure a specific endpoint for logs, you would use the
[`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_logs_endpoint).

Exposing this per-signal routing in your application is technically optional,
but it is a major value-add for advanced users.

### Running Collectors to manage multi-tenancy

Once you're pushing OTLP (for any combination of logs, traces, metrics), you
still need to decide how to run Collectors to manage multiple tenants.

Your Collector architecture needs to [scale](/docs/collector/scaling/) along two
dimensions of growth: onboarding more users, and the volume of new telemetry
generated as you ship new features.

#### One Collector per tenant

If your architecture already isolates tenants at the infrastructure level, you
can deploy a dedicated Collector instance for each customer. In this case, every
instance has a dedicated configuration pointing directly to that specific
customer's export endpoint.

This provides strong logical isolation guarantees. Slowdowns or
misconfigurations in one customer's pipeline do not affect other customers.

Although you can [build a custom Collector binary](/docs/collector/extend/ocb/)
that only ships vital components, deploying hundreds or thousands of Collector
instances will become resource-intensive.

Because of this tradeoff, this architecture is usually the best fit for
enterprise SaaS products where strong multi-tenant isolation is a strict
requirement and customers might have complex endpoint configurations.

![The Collector-per-tenant architecture provides strong isolation guarantees at
the cost of increased resource usage.](collector-per-tenant.webp)

#### Shared Collector with static pipelines per tenant

Here, "static" means each tenant's pipeline and routing rules are defined
up-front in the Collector's configuration file, rather than provisioned
dynamically at runtime.

This is close in spirit to the
[gateway deployment pattern](/docs/collector/deploy/gateway/): all your
platform's telemetry funnels into a single, centralized Collector. Inside, you
define separate pipelines per tenant — the
[routing connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.158.0/connector/routingconnector#readme)
is a natural fit here, directing data to the right pipeline (and therefore the
right external endpoint) based on resource attributes like a tenant ID.

This pattern works well for teams at early or moderate scale, where operating a
single deployment is simpler than managing per-tenant instances. You only have
to monitor and scale one deployment, and all routing is configured in one place.

However, you must be comfortable managing a growing dynamic configuration file
as your customer base grows.

![The shared Collector pattern is easier to monitor and maintain as all exports
route through one Collector instance.](shared-collector.webp)

### Push vs pull: the verdict

For many modern, developer-focused telemetry systems, OpenTelemetry's push model
should be the default because it preserves rich context and delivers data in
near real-time.

Plus, it has been proven to work well at scale across cloud and self-hosted
deployments by Cloudflare, Heroku, Kuma, and Keycloak.

OpenTelemetry's independence from a particular vendor means users have the
freedom to switch between observability vendors based on their business needs,
without requiring a complete overhaul of their telemetry pipelines.

In the push export model, your platform team carries the implementation burden:
your engineers need to learn and adopt OpenTelemetry, and you need clear
documentation on how users can configure their endpoints.

Use the pull model primarily when you already have a dominant API for a given
signal and cannot add a push path.

## Putting it all together

To conclude, you don't need to build bespoke integrations to let your users
export telemetry to their own backends.

If you're ready to implement OTel-native export in your application, here's a
summary of the key architectural and design steps to follow:

- Decide which telemetry signals to support out of logs, traces, and metrics.
  You should ideally support all three, but start with what your product
  generates.
- Use OTLP to export those signals via the OTel SDK or a Collector. The same
  push-based architecture works for all three signals.
- Let users configure a destination endpoint and optional auth headers. Consider
  per-signal endpoints for teams with more complex setups.
- Allow users to enable or disable individual signals to control data volume and
  costs.
- Document your endpoint format (gRPC/HTTP), required headers, and
  attribute/schema semantics per signal so users can confidently rely on the
  data in their backends.
- Choose a Collector topology: one Collector per tenant for strong isolation, or
  a shared Collector with per-tenant pipelines for lesser operational overhead.
- Provide an example config or env var snippet so users can get started quickly.

The points above also encapsulate the golden rules that Cloudflare (except for
metrics), Heroku, Kuma, and Keycloak follow: **default to push, stay
vendor-neutral, and document the contract**.

Designing for all three signals using open standards from the start removes
friction, reduces your engineering overhead, and empowers customers to make the
best use of their data on their own terms.

If you've already implemented OTel-native export in your product, consider
[adding it to OpenTelemetry Integrations](/ecosystem/integrations/#how-to-add).
It's a great way to surface your work to the broader community.

> [!NOTE]
>
> **If you're reading this as an end user, not a builder:** you don't have to
> wait for your SaaS vendor to come around on this.
>
> Ask them for OTLP export directly; it's a reasonable, increasingly common
> request, and now you have this post to point them to!
