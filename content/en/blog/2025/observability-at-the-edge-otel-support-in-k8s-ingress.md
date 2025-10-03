---
title:
  'Observability at the Edge: OpenTelemetry Support in Kubernetes Ingress
  Controllers'
linkTitle: 'OTel Support in K8s Ingress Controllers'
date: 2025-10-01
author: >-
  [Kasper Borg Nissen](https://github.com/kaspernissen) (Dash0)
canonical_url: 'https://www.dash0.com/blog/observability-at-the-edge-opentelemetry-support-in-kubernetes-ingress-controllers'
cSpell:ignore: Contour Emissary Heptio xDS
---

Kubernetes has transformed the way applications are deployed and scaled, but one
component remains especially critical: the ingress controller. Ingress sits at
the edge of the cluster, where it terminates TLS, applies routing rules,
enforces policies, and directs requests to the correct backend.

In many ways, ingress controllers are like the Gates of Mordor: nothing gets in
without passing through them. They are the first and most important line of
defense. If the gates falter under pressure, the entire realm is at risk. In
Kubernetes terms, that means users can’t reach your services, or performance
across the platform grinds to a halt.

That central position makes ingress both a liability and an opportunity. As the
chokepoint through which all traffic flows, it’s where small issues quickly
become big ones. But it’s also the single best vantage point for observing what
your users actually experience. If there’s one place to monitor closely, it’s
ingress. With the right signals in place, it becomes not just the gatekeeper but
also the lens that reveals how the entire platform behaves.

This article compares the state of OpenTelemetry observability across four of
the most prominent ingress controllers -
[Ingress-NGINX](https://github.com/kubernetes/ingress-nginx),
[Contour](https://github.com/projectcontour/contour),
[Emissary Ingress](https://github.com/emissary-ingress/emissary), and
[Traefik](https://github.com/traefik/traefik) - before diving into what makes
ingress observability so important.

## Why ingress observability matters

Every request into a Kubernetes cluster must pass through ingress, which makes
it the most critical - and most fragile - point of the system. When ingress
slows down, every downstream service looks slower. When it fails, the entire
platform becomes unavailable.

Because it’s the chokepoint, ingress is also where many issues surface first. A
sudden spike in retries, timeouts cascading across services, or TLS handshakes
failing under load - all of these show up at ingress before they spread further
into the platform. Without observability here, you’re left guessing at the
cause.

Ingress is also the natural starting point of distributed traces. If you only
instrument the services behind it, you miss the first step of the journey:
routing, middleware, or protocol handling. And in microservice architectures
where a single request may hop across a dozen components, capturing that very
first span is essential. Metrics tell you that something is wrong, traces show
where it happens, and logs explain why. Starting that story at ingress makes
debugging faster and far less painful.

## OpenTelemetry at the edge

This is where OpenTelemetry comes in. As the standard for collecting traces,
metrics, and logs across cloud native systems, OpenTelemetry gives you a way to
make ingress observable in the same language as the rest of your platform. With
ingress emitting OTel signals, you gain traces that tie directly into downstream
spans, metrics that describe traffic and latency in a standard format, and logs
that can be correlated with both.

Not every controller is there yet. Some have embraced OpenTelemetry natively,
others expose only Prometheus metrics or raw access logs, and most require some
help from the OpenTelemetry Collector to align signals. The Collector acts as
the translator and glue: scraping metrics, parsing logs, enriching everything
with Kubernetes metadata, and producing one coherent stream of telemetry.

To understand how this plays out in practice, we’ll take a closer look at four
of the most widely used ingress controllers. Each has made different choices
about observability. Some lean heavily on Envoy, others on NGINX, and one has
embraced OpenTelemetry natively.

### Ingress-NGINX

Ingress-NGINX is the veteran among ingress controllers. Maintained under
Kubernetes SIG Networking, it quickly became the default in many distributions
because it leveraged the popularity and performance of the NGINX proxy. Its long
history means that many teams trust it for production workloads.

In terms of observability, tracing is the strongest signal. Ingress-NGINX
includes an OpenTelemetry module that can emit spans directly using the OpenTelemetry
Protocol (OTLP). These spans represent each incoming request. If a trace context
arrives with the request, ingress continues it. If no headers are present,
ingress starts a new root span. This flexibility means that ingress can be
either the first hop of a trace or a continuation of one started upstream at a
load balancer or API gateway. Tracing can be enabled cluster-wide through Helm
values or selectively through annotations on specific Ingress resources.

Metrics and logs are less advanced. Metrics are still exposed in Prometheus
format, available on port `10254`, and need to be scraped by the Collector. Logs
are classic NGINX access logs, one line per request. To make them useful in
OpenTelemetry pipelines, the log format must be extended to include trace and
span IDs. Once that is done, the Collector can parse the logs and enrich them
with correlation data. In practice, this means Ingress-NGINX delivers good
tracing support but relies heavily on the Collector for metrics and logs.

_Read the full deep dive on
[observing Ingress-NGINX with OpenTelemetry](https://www.dash0.com/blog/observing-ingress-nginx-with-opentelemetry-and-dash0).
The examples use Dash0, but the same configuration works with any backend that
supports OTLP._

{% alert title="Note on the future of Ingress-NGINX" %}

While not officially deprecated, the
Ingress-NGINX project is effectively in maintenance mode. Maintainers have
indicated that only critical bug fixes and security updates will be accepted
going forward, with no new features planned.

{% /alert %}

### Contour

Contour, originally developed by Heptio and now a CNCF project, takes a
different approach. Built on Envoy, it inherits Envoy’s powerful observability
stack. Tracing can be enabled via Contour’s CRDs, which configure Envoy’s
built-in OpenTelemetry driver. Once configured, Envoy emits spans for every
request, either joining an incoming trace or starting a new one. This tight
integration with Envoy means that tracing is mature and consistent.

Metrics are abundant but come in two layers. Envoy itself exposes hundreds of
Prometheus metrics, covering every dimension of data plane behavior: request
rates, retries, connection pools, upstream health, and more. On top of that,
Contour adds its own smaller set of control-plane metrics that expose the state
of the xDS configuration. Together they create a firehose of data. While
powerful, Envoy’s metrics firehose requires care. Scraping them at scale can
quickly become resource-intensive and, depending on your backend, expensive as
well. Teams often mitigate this by sampling or selectively scraping only the
metrics that matter most.

Logs follow the Envoy convention of structured access logs. By default, they are
JSON objects with details of each request. With a simple configuration change,
Envoy can include the traceparent header in each log line. The Collector then
parses the JSON, extracts trace and span IDs, and correlates them with spans.
The combination of structured logs, rich metrics, and mature tracing makes
Contour observability strong, but the volume of data means you need the
Collector to normalize and manage it.

_Read the full deep dive on
[observing Contour with OpenTelemetry](https://www.dash0.com/blog/observing-contour-with-opentelemetry-and-dash0).
The walkthrough uses Dash0, but applies equally to any OTLP-compatible backend._

### Emissary Ingress

Emissary Ingress, formerly known as Ambassador, extends Envoy into a full API
gateway. It adds features like authentication, rate limiting, and traffic
shaping, making it popular in multi-team or microservice-heavy environments.
That complexity makes observability even more important, and Emissary leans on
Envoy to deliver it.

Tracing is configured through a TracingService resource. Once set, Envoy uses
its OpenTelemetry driver to generate spans. Like Contour, these spans join
existing traces or start new ones. Metrics come from both Envoy and
Emissary-specific `ambassador_*` series, exposed in Prometheus format on
port 8877. Logs again follow the Envoy convention, with the ability to include
traceparent fields. Once parsed by the Collector, these logs are tied to the
corresponding traces.

The overall picture is similar to Contour but heavier. Emissary generates even
more metrics because of its API gateway features. It offers strong tracing and
detailed logs, but the Collector is essential to tame the volume and unify the
signals into something actionable.

_Read the full deep dive on
[observing Emissary Ingress with OpenTelemetry](https://www.dash0.com/blog/observing-emissary-ingress-with-opentelemetry-and-dash0).
The examples are backend-agnostic and apply to any system that accepts OTLP._

### Traefik

Traefik represents a newer generation of ingress controllers. Written in Go and
designed for cloud native environments, it emphasizes dynamic discovery and
simple configuration. That philosophy carries through to observability, where
Traefik has taken the most OpenTelemetry-native approach of the group.

Tracing is built-in. Traefik can export spans directly as OTLP without sidecars
or external plugins. Metrics are treated as first-class citizens and follow
OpenTelemetry semantic conventions. You can export them directly via OTLP,
bypassing Prometheus entirely, or fall back to Prometheus if needed. Logs can
also be exported over OTLP, although that feature is still experimental. When
enabled, log records include trace and span IDs by default, making correlation
seamless.

Traefik therefore comes closest to being OpenTelemetry-native. All three signals
can flow natively via OTLP, reducing the need for translation. The Collector
still plays an important role in enriching and routing signals, but the data
arrives in a more standard, convention-aligned form than with other controllers.

From version 3.5.0, Traefik automatically injects Kubernetes resource attributes
like `k8s.pod.uid` and `k8s.pod.name` into every span and log it emits. That small
detail has a big payoff: it guarantees reliable correlation, even in
service-mesh environments where the IP-based heuristics of the Collector’s
k8sattributes processor can break down.

_Read the full deep dive on
[observing Traefik with OpenTelemetry](https://www.dash0.com/blog/observing-traefik-with-opentelemetry-and-dash0).
While the post uses Dash0 in the examples, the same setup works with any
OTLP-based backend._


## OpenTelemetry signal support at a glance

| **Ingress Controller** | **Tracing** | **Metrics** | **Logs** |
|---|---|---|---|
| **Ingress-NGINX** | Native OTLP spans via module or annotations | Prometheus only; needs Collector scrape | Classic NGINX logs; add trace/span IDs; Collector parses |
| **Contour** | Envoy OTel driver; enabled via CRDs | Envoy + Contour metrics in Prometheus; Collector needed | Envoy access logs with traceparent; Collector parses |
| **Emissary** | Envoy OTel driver; TracingService config | Envoy + `ambassador_*` series in Prometheus; Collector needed | Envoy logs with traceparent; Collector parses |
| **Traefik** | Native OTLP spans; configurable verbosity | Native OTLP metrics (semantic conventions) or Prometheus | Experimental OTLP logs; JSON fallback tailed by Collector |

## Comparing the controllers

Comparing the four controllers shows the arc of OpenTelemetry adoption. Tracing
has become table stakes: every major ingress controller now emits spans and
propagates context, which makes ingress the true entry point of distributed
traces. Metrics are plentiful but inconsistent. Envoy-based controllers produce
a torrent of Prometheus series, Ingress-NGINX exposes a smaller set of
NGINX-specific metrics, and Traefik embraces OTLP natively. Logs remain the
hardest signal. They require customization in Ingress-NGINX, parsing in Envoy,
and in Traefik they are still maturing as an OTLP feature.

But observability isn’t only about what signals a controller produces - it’s
also about how you enrich and correlate them. Raw metrics or traces by
themselves often lack the context needed to be useful. This is where Kubernetes
resource attributes make the difference. Traefik, for example, has since v3.5.0
automatically injected `k8s.pod.uid` and `k8s.pod.name` into every span and log it
emits. That small detail has a big payoff: it guarantees reliable correlation,
even in service-mesh environments where the IP-based heuristics of the
Collector’s k8sattributes processor can break down.

Other controllers, like Ingress-NGINX or Envoy-based implementations, still
depend on the k8sattributes processor in the Collector to add this metadata
after the fact. That works well in many setups but can be less reliable in
clusters with sidecars or overlays. The difference illustrates how being
OpenTelemetry-native - emitting the right resource attributes directly at the
source - simplifies correlation and makes telemetry more robust.

Of course, knowing which ingress pod handled a request is only part of the
story. To connect ingress telemetry with the workloads it routes traffic to, you
also need trace context propagation and downstream instrumentation. When backend
services are instrumented with OpenTelemetry, spans from ingress link directly
to spans deeper in the call chain. That linkage is what allows metrics from
ingress, traces across microservices, and logs from specific pods to line up
into one coherent story. Without downstream coverage, ingress observability
remains a powerful but isolated lens.

For a deeper dive on how to apply attributes consistently, check out the
[OpenTelemetry semantic conventions](/docs/specs/semconv/) and the
[Kubernetes attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor).
Together, they explain how to make sure telemetry isn’t just captured but also
labeled in a way that makes it easy to navigate across services, clusters, and
environments.

All four controllers act as the gatekeepers at the cluster edge, but they don’t
all equip you with the same level of observability. Some give you a narrow
peephole, while others give you a panoramic view - but in every case, adding the
right attributes and instrumenting downstream systems is what turns raw signals
into actionable insight.


## Patterns and maturity

The state of ingress observability mirrors the wider OpenTelemetry journey.
Tracing was the first signal to reach maturity and is now expected. Metrics are
transitioning, with Prometheus still dominant but OTLP increasingly present.
Logs remain the final frontier, as each controller takes a different path to
correlation.

The OpenTelemetry Collector is the constant in all these setups. It scrapes
Prometheus metrics, tails logs, receives spans, and enriches them with
Kubernetes metadata. Without the Collector, you end up with silos of telemetry.
With it, you have a coherent stream of data where metrics, logs, and traces line
up to form a reliable picture.

## Correlation in practice

Consider a common scenario: latency spikes are reported by users. Metrics from
ingress show an increase in p95 latency. Traces reveal that the ingress spans
themselves are fast but downstream requests are retried several times. Logs,
once correlated, show that the retries are all directed at a specific backend
pod that was returning 502s. Together, the signals explain the incident: ingress
was healthy, but a single backend instance was failing and the retries created
cascading latency. Without correlation, each signal alone tells only part of the
story. With OpenTelemetry, you get the full picture.

## Other players

The four controllers we focused on are the most common, but they are not the
only choices. HAProxy Ingress builds on the HAProxy proxy and offers strong
performance and efficient resource usage, though its observability story is less
focused on OpenTelemetry. Kong Ingress Controller combines ingress with API
management features, using plugins to integrate with OpenTelemetry. Istio’s
ingress gateway, built on Envoy, has strong tracing and metrics support but adds
the overhead of a full service mesh. Cilium Ingress, leveraging eBPF for
networking and security, is newer and still maturing in observability, but its
deep integration with Cilium’s datapath makes it promising.

Including these alternatives gives you a sense of the diversity in the
ecosystem. The choice often depends on whether you already run a service mesh,
need API gateway features, or want to adopt eBPF-based networking.

## Final thoughts

Ingress controllers are too important to remain blind spots. The good news is
that tracing is solved: all major controllers emit spans, making the edge
visible in distributed traces. Metrics are plentiful but inconsistent. Logs are
improving, but still the hardest signal to standardize.

The differences come down to maturity and philosophy. Ingress-NGINX is a
reliable default but heavily dependent on the Collector. Contour and Emissary
are Envoy-powered, with rich but heavy observability surfaces. Traefik is the
most OpenTelemetry-native, pointing toward a future where all signals flow as
OTLP and correlation is built in rather than bolted on.

It’s worth noting that Ingress-NGINX is moving toward maintenance-only mode.
While not officially deprecated, the maintainers have signaled that no major new
features are planned and only critical fixes will be merged. If you rely on it
today, keep this in mind when planning the future of your ingress strategy and
consider evaluating the Gateway API or other controllers.

Across all of them, the OpenTelemetry Collector is indispensable. It ensures
that whatever your ingress emits, you can normalize, enrich, and correlate
signals into a coherent picture. With any OTLP-compatible backend or open source
observability project, you can correlate traces, metrics, and logs into one
coherent view.

The theme that runs through this comparison is correlation. Metrics show you
that something is wrong. Traces show you where it is happening. Logs tell you
why. With OpenTelemetry, the ingress layer no longer has to be a blind spot. It
can be just as observable - and just as reliable - as the services it protects.
