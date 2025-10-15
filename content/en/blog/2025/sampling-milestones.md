---
title: OpenTelemetry Sampling update
linkTitle: OpenTelemetry Sampling update
date: 2025-10-15
author: >-
  [Joshua MacDonald](https://github.com/jmacd) (Microsoft), [Kent
  Quirk](https://github.com/kentquirk) (Honeycomb), [Otmar
  Ertl](https://github.com/oertl) (Dynatrace), [Peter
  Findeisen](https://github.com/PeterF778) (Cisco), [Yuanyuan
  Zhao](https://github.com/yuanyuanzhao3) (DataDog)
sig: SIG Sampling
cSpell:ignore: Ertl Findeisen probabilisticsampler Yuanyuan Zhao
---

## Introduction

OpenTelemetry published version 1.0 of its Tracing specification over four years
ago, and the same year [W3C TraceContext Level 1][TRACECONTEXT1] was published
with W3C Recommendation status. We as a community and we the observability
industry had two new standards for distributed tracing. Of course, we weren't
finished.

[TRACECONTEXT1]: https://www.w3.org/TR/trace-context-1
[JAEGERREMOTE]: https://www.jaegertracing.io/docs/1.22/architecture/sampling/

Sampling is a major topic of the Tracing SDK specification, and the original
specification included a set of built-in Samplers, `AlwaysOn`, `AlwaysOff`,
`ParentBased`, and `TraceIdRatioBased`, along with an interface allowing new
samplers to be implemented, primarily [Jaeger Remote][JAEGERREMOTE].

However, there was a
[conspicuous "TODO" involving probability sampling](https://github.com/open-telemetry/opentelemetry-specification/issues/1413)
left in the 1.0 Tracing specification affecting the `TraceIdRatioBased` sampler.
The TODO warned specification users of "inconsistent" results, that
`TraceIdRatioBased` samplers were only safe to configure for root spans.

This meant OpenTelemetry users could not safely configure independent
probability sampling policies in a distributed system, as the specification did
not cover how to achieve consistency. This feature, the ability to configure
unequal-probability sampling policies within a trace and still expect complete
traces, is something users expect; it lets service owners configure independent
limits on the volume of tracing data collected in a system.

## Consistency by example

To see why consistency is important, consider a system with a Frontend and two
backend services, Cache and Storage. The Frontend handles high-value user
requests, therefore frontend requests are sampled at 100%. The root span is
significant because errors are visible to the end user, so it forms the basis of
an SLO measurement in this example and the system operator is willing to collect
every span.

The Cache service receives a relatively high volume of requests, so to save on
observability costs, this service is configured to sample 1-in-1000 traces.
Because of the high rate of requests, this 0.1% policy ensures the Cache service
produces enough traces for many observability scenarios.

The Storage service receives a relatively low volume of requests, compared with
the Cache server, but still a lot of requests compared with the Frontend
service; Storage is configured to sample 1-in-10 traces.

When we ask for consistency in distributed tracing, the goal is to ensure that
when the smallest probability sampler (here 0.1%) chooses to sample, that higher
probability samplers make the same decision. Here are the properties we can rely
on in this configuration:

- 100% of Frontend spans will be collected
- 1-in-10 traces will consist of Frontend and Storage spans
- 1-in-1000 traces will be complete.

## Problems with TraceIdRatioBased

OpenTelemetry's `TraceIdRatioBased` probability sampler was intended to be
consistent from the start, however the working group had a hard time agreeing
over specific details. The TODO about sampling consistency was mitigated by the
fact that root-only sampling was the norm for contemporary open source tracing
systems and the model embraced by Jaeger.

The "ratio-based" part of the name hints at the form of solution to the
consistent sampling problem:

1. Consider the TraceID value as an N-bit random value
2. Compute the Nth power of two
3. Multiply the power-of-two by the ratio, yielding a "threshold" value
4. Compare the TraceID with the threshold value, yielding a consistent decision.

We had trouble agreeing on this form of solution because of a larger question.
_Which bits of the TraceID can we trust to be random?_ Without foundational
requirements about randomness, OpenTelemetry could not specify a consistent
sampling decision.

When lacking firm randomness requirements, a common approach is to use a hash
function instead. Using `Hash(TraceID)` to produce N-bits randomness works
reasonably well if the hash function is good, but this approach is not suitable
in a cross-language SDK specification.

The details here are tricky. How many bits of the TraceID would be enough? Could
every language SDK efficiently implement the required logic?

## Introducing W3C TraceContext Level 2

OpenTelemetry turned to the W3C Trace Context working group with this larger
problem in mind. Could we, including OpenTelemetry and non-OpenTelemetry tracing
systems, agree on how many bits of the TraceID were random?

The [W3C TraceContext Level 2][TRACECONTEXT2] specification, currently a
[Candidate Recommendation Draft](https://www.w3.org/standards/types/#x4-2-1-candidate-recommendation-draft),
answers this question with a new
[`Random` Trace Flag value](https://www.w3.org/TR/trace-context-2/#random-trace-id-flag).
With this flag, the new W3C specification requires the least-significant 56 bits
of the TraceID to be "sufficiently" random. This means, for example, when we
[represent the TraceID as 32 hexadecimal digits](/docs/specs/otel/trace/api/#retrieving-the-traceid-and-spanid),
the last, rightmost 14 digits are random. Represented as 16 bytes, the last,
rightmost 7 bytes are random.

[TRACECONTEXT2]: https://www.w3.org/TR/trace-context-2

OpenTelemetry is adopting the W3C TraceContext Level 2 draft recommendation as
the foundation for consistent sampling. All SDKs will set the `Random` flag and
ensure that TraceIDs they generate have the required 56 bits of randomness by
default.

## Consistent sampling threshold for rejection

Turning back to consistent "ratio-based" logic, now we're able to obtain 56 bits
of randomness from a TraceID, and the decision process described in outline
above calls for a threshold to compare with.

There was one more thing we as a group wanted for the probability sampling
specification: a way for SDKs to communicate their sampling decisions, both to
one another in the TraceContext, as well as on the collection path after spans
are finished.

The new specification lets OpenTelemetry components communicate about "how much
sampling" has been applied to a span. This supports many advanced sampling
architectures:

- Reliable estimates of span count
- Consistent rate-limited sampling
- Adaptive sampling
- Consistent multi-stage sampling.

The key points of our design are summarized next, but curious readers may want
to see the
[full specification](/docs/specs/otel/trace/tracestate-probability-sampling/).

Given the number of bits, there is not much left to specify. However, we wanted
an approach that:

- Supports both lexicographical and numerical comparison
- Minimizes TraceContext overhead
- Is legible for advanced OpenTelemetry users.

Our approach is based on what we call the _sampling threshold for rejection_.
Given randomness value `R` and threshold for rejection `T`, we make a positive
sampling decision when `T <= R`. Equivalently, we make a negative sampling
decision when `T > R`.

By design, the threshold value `0` corresponds with 100% sampling, so users can
easily recognize this configuration. Abstractly, both `R` and `T` have a range
of 56 bits, which can be represented as unsigned integers, 7-byte slices, or
14-hex-digit strings.

## OpenTelemetry TraceState

The W3C TraceContext specification defines two HTTP headers for use in
distributed tracing systems, the `tracecontext` header, which contains version,
TraceID, SpanID, and flags, and `tracestate` which supports "vendor-specific"
additions to the context. OpenTelemetry Tracing SDKs will soon begin adding an
entry under the key "ot" in the `tracestate` header. Here's an example:

```http
tracestate: ot=th:0
```

In a 100% sampling configuration, OpenTelemetry Tracing SDKs will insert
`ot=th:0` in the TraceState. TraceState values, once entered in the context, are
both propagated and recorded in OpenTelemetry span data. By design, the new
OpenTelemetry TraceState value is only encoded and transmitted for positive
sampling decisions; no `tracestate` header will appear as a result of negative
sampling decisions.

In this representation, sampling thresholds logically represent 14 hexadecimal
digits or 56 bits of information.

However, to communicate the sampling threshold efficiently, we drop trailing
zeros (except for `0` itself). This lets us limit threshold precision to fewer
than 56 bits, which lowers the number of bytes per context. Here is an example
tracestate indicating 1% sampling, limited to 12-bits of precision:

```http
tracestate: ot=th:fd7
```

We gave a lot of consideration to backwards compatibility, but we also wanted to
be sure we could always use the stated sampling threshold for extrapolation, in
a reliable, statistical sense. With this in mind, there is one more
OpenTelemetry TraceState value in our specification: a way to provide explicit
randomness in the `tracestate` header.

To enable consistent sampling and continue using non-random TraceIDs, for
example, users can opt for explicit randomness:

```http
tracestate: ot=rv:abcdef01234567
```

Explicit randomness values have several other uses, for example:

- Achieve consistent sampling across multiple traces, by applying the same
  explicit randomness value to independent trace roots
- Translate external consistent sampling decisions (for example, hash
  function-based) into OpenTelemetry consistent sampling decisions.

As a demonstration, we upgraded the OpenTelemetry Collector-Contrib
[`probabilisticsampler` processor][PROBABILISTICSAMPLERPROCESSOR] to keep its
original consistent sampling decision and still encode sampling probability in
the OpenTelemetry TraceState. It does this by synthesizing an explicit
randomness value from the hash function that it uses.

[PROBABILISTICSAMPLERPROCESSOR]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/probabilisticsamplerprocessor/README.md

## Looking forward

This post covers an essential upgrade to OpenTelemetry Tracing specification,
enabling a new generation of samplers for OpenTelemetry SDKs and Collector
components.

Here are some useful references including the four OpenTelemetry enhancement
proposals that plotted our course:

- [0168 Sampling Propagation](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/trace/0168-sampling-propagation.md)
- [0170 Sampling Probability](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/trace/0170-sampling-probability.md)
- [0235 Sampling Threshold in TraceState](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/trace/0235-sampling-threshold-in-trace-state.md)
- [0250 Composite Samplers](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/trace/0250-Composite_Samplers.md)

The following are our primary specification documents:

- [Trace Probability Sampling](/docs/specs/otel/trace/tracestate-probability-sampling/)
- [Trace SDK Samplers](/docs/specs/otel/trace/sdk/#sampler)
- [TraceID Randomness](/docs/specs/otel/trace/sdk/#traceid-randomness).
