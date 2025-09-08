---
title: OpenTelemetry Sampling update
linkTitle: OpenTelemetry Sampling update
date: 2025-09-08
author: >-
  [Joshua MacDonald](https://github.com/jmacd) (Microsoft)
sig: SIG Sampling
# prettier-ignore
cSpell:ignore:
---

## Intro

The OpenTelemetry sampling project promotes features and
specifications for probability sampling in OpenTelemetry SDKs and
collectors. Users look to OpenTelemetry to provide a consistent
experience across programming langauges, kinds of signal, and modes of
collection, and we aim to provide the this foundation for distributed
trace collection and anywhere events are sampled, including log records
and metric exemplars.

Sampling SIG has completed work on several inter-related OpenTelemetry
specifications that bring us this foundation and let us resolve [a
very old "TODO" in the tracing specification](
https://github.com/open-telemetry/opentelemetry-specification/issues/1413).

To begin with, we specify two ways to derive randomness from an
OpenTelemetry trace context, layered upon [W3C Trace Context Level
2](https://www.w3.org/TR/trace-context-2/). OpenTelemetry defines its
own `tracestate` header field value, under the key "ot". Here is an
example of an OpenTelemetry tracestate indicating 100% probability
sampling:

```
tracestate: ot=th:0
```

The above assumes the context was created with the W3C Trace Context
Level 2 [Random Trace ID
flag](https://www.w3.org/TR/trace-context-2/#random-trace-id-flag)
set, which specifies how to set at least 56 random bits in the 128-bit
Trace Context. When a Trace ID does not meet these requirements (and
for other reasons), they can supply an **explicit randomness value**,
using the OpenTelemetry TraceState to express the 56 bits instead:

```
tracestate: ot=rv:03d09c0d05f5c9
```

The threshold and randomness values shown above can be combined,
however we have optimized for the common case of an unsampled (Level
2) context without explicit randomness, in which case the `tracestate`
header is not used.

## Sampling is for counting

The important thing about probability sampling in OpenTelemetry, to
us, is that it preserves the elements of a statistical science.  When
users configure sampling (many ways) and collect records of
OpenTelemetry data (many ways), they want to know "how much" sampling
was applied. The act of sampling is fundamentally about counting and
estimation, and we find this "how much" term is easiest to reason
about when it represents a count. We use the term **adjusted count**
to describe how much sampling was applied, it is a representivity
score. Adjusted count is the mathematical reciprocal of selection
probability. Here are a few examples of the term in use:

- _25% probability sampling is communicated by `ot=th:c`, corresponding with an adjusted count of 4 per item._
- _An adjusted count of N means we would expect to see N-1 similar items had we collected all of the data._

Our goal is that OpenTelemetry users can lower telemetry data
collection costs through sampling, while preserving adjusted count
information, everywhere that sampling is applied in OpenTelemetry.

There is an important requirement to ensure what we call "consistency"
that deserves to be mentioned. Consistent sampling ensures that when
multiple actors sample a trace independently, that they arrive at the
same decision when configured at the same or larger probability.

With our new OpenTelemetry sampling specifications:

- The SDKs will upgrade to W3C Trace Context Level 2 for Trace ID generation
- The built-in samplers AlwaysOn, AlwaysOff, ParentBased will be upgraded to use the OpenTelemetry tracestate
- The TraceIdRatioBased sampler will be deprecated, replaced with a new Probability sampler
- SDKs will implement new Composite, AnyOf, RateLimiting, and RuleBased composable samplers, along with composable forms of AlwaysOn, AlwaysOff, and ParentBased that participate in calculating sampling thresholds
- SDKs will communicate sampling thresholds via TraceState as part of the context
- SDKs will record the tracestate field as part of the OTLP span record
- Collectors and backends will be able to count using adjusted counts, enabling acculate metrics calculated from sampled data.

We have supplemental guidelines for OpenTelemetry collectors in case
they re-sample traces and logs data on the collection path, in order
to preserve sampling information. As a demonstration, we have upgraded
the [OpenTelemetry `probabilisticsampler`
processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/probabilisticsamplerprocessor/README.md)
Collector-Contrib component, this makes a good example because it
applies to both trace and logs data and it makes use of the explicit
trace randomness feature described above. To explain this requires a
bit more detail.

## Example upgrade for a custom sampler

We are going to explain how the `probabilisticsampler` processor was
upgraded to record the correct sampling threshold without changing its
algorithm. Like our new specification, this component makes a
consistent decision. This works, essentially, because all consistent
sampling decisions are alike.

The original logic uses 14 bits of the 32-bit
[fnv32](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function)
hash function over the data for its decision. To configure itself, the
component computes the desired probability (e.g., 1%) as a ratio, then
multiplies by 2^14 (i.e., 16384) yielding a threshold.  In this case
the value is 164 (i.e., 0.01 * 16384), meaning it decides to sample if
the hash value is less than 164 out of 16384. Note, as well, that the
selection probability can be derived from the value 164 here, and note
that the use of 14 bits introduces a slight error. The exact selection
probability is approximately .01001, the exactadjusted count
approximately 99.9 in this case.

Now, we can see the correspondence between this component's decision
and the new OpenTelemetry sampling specification:

- The 14-bit hash function is this component's random variable, based on `fnv32`
- The number 164 is a sampling threshold for acceptance
- Threshold 0 corresponds with 0% sampling
- Threshold 16384 corresponds with 100% sampling.

The decision to select values less than an threshold for acceptance is
arbitrary, we can also formulate a consistent sampling decision based
on a threshold for rejection, which is how the OpenTelemetry
specification works. The OpenTelemetry sampling threshold `th:0` that
we saw above indicates 100% sampling, and now we understand that it
encodes the number of rejected values (out of 2^56) after removing
removed trailing zeros.  For the example `th:c`, representing 25%
sampling in OpenTelemetry:

- The 56-bit random value is a random variable derived from W3C Trace Context Level 2 Trace ID or OpenTelemetry tracestate explicit randomness value
- The number `c` is a sampling threshold for rejection, which after
  extending with 0s corresponds with `0xc0000000000000` out of
  `0x100000000000000` or 75% of random values being rejected
- Threshold `0` corresponds with 100% sampling
- Threshold `0xffffffffffffff` corresponds with rejecting all except 1 of 2^56.

Since the component was written before the specification, we expect
there to be no OpenTelemetry tracestate field present in the data.
Therefore, to emit its own sampling threshold, `probabilisticsampler`
will re-encode its threshold for acceptance as a threshold for
rejection, extending it from 14 bits to 56 bits in the process, in the
form of an OpenTelemetry tracestate. Then, to establish consistency,
it encodes the original 14 bits and 42 pseudo-random bits derived from
the 32-bit fnv32 hash. For the example using a 1%
`probabilisticsampler` configuration, we may expect to see spans with
OpenTelemetry tracestate values like this:

```
tracestate: ot=th:fd71;rv:fd7eaf7d5261ed
```

Here, `fd71` is a 16-bit representation of the sampling threshold that
rejects values less than `0xfd710000000000`, corresponding with
1.00002% sampling probability.

## Coordinated sampling with OpenTelemetry

When the user is ready to adopt OpenTelemetry consistent probability
sampling in their SDKs, it becomes possible to coordinate sampling
strategies across the SDK and collector components. 

The `probabilisticsampler` component supports two new modes that are
suited for additional down-sampling on the collection path:

- `equalizing`: the component respects the arriving OpenTelemetry
  sampling threshold and reduces sampling probability item-by-item to
  the configured sampling probability level.
- `proportional`: the component respects the arriving OpenTelemetry
  sampling threshold and reduces the volume of data without
  considering how much sampling was already applied, reducing the
  probability of all items that pass through, limited to the minimum
  supported sampling probability.

For more details on the OpenTelemetry sampling specifications
described above, please see the update [Trace SDK Sampling
specification](https://opentelemetry.io/docs/specs/otel/trace/sdk/#sampling),
the [implementation
guidelines](https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/),
and the [OpenTelemetry
tracestate](https://opentelemetry.io/docs/specs/otel/trace/tracestate-handling/)
documentation.

## OpenTelemetry Sampling Roadmap

We recognize that there is more to do for this to be widely applicable
for OpenTelemetry users. Here are some of the objectives on our
roadmap for sampling in coming years.  With these specifications, we
will soon have a foundation for probability sampling across
OpenTelemetry that includes:

- W3C Trace Context Level 2 identifiers
- OpenTelemetry tracestate sampling threshold and 56-bit randomness
- New SDK ProbabilitySampler, RuleBased, and updated built-in samplers.

OpenTelemetry users can expect more powerful options for sampling from
SDKs and Collectors in the near future. Here are a few of the items we
are planning:

### Configurable OpenTelemetry sampling

The OpenTelemetry Configuration SIG has developed a schema-based model
for configuring SDKs across the ecosystem. We are planning to
introduce a Sampling configuration model for OpenTelelemtry tracer
configuration. This would allow, for example, a block of JSON or YAML
to control the behavior of the SDK sampler based on the primitive
samplers including composable AlwaysOn, AlwaysOff, AnyOf, RuleBased,
ParentBased and the basic Probability sampler.

This work will enable a new generation of coordinated and adaptive
sampling strategies for OpenTelemetry users. As we look ahead in this
direction, we take inspiration from a two precursors.

The [Jaeger Remote
Sampling](https://www.jaegertracing.io/docs/2.10/architecture/sampling/#remote-sampling)
system is directly relevent, with an rule-based head sampler
configuration for SDKs distributed through a remote endpoint. We
believe that OpenTelemetry users want similar capabilities from their
SDKs, however we also expect Samplers to preserve and propagate
correct sampling thresholds, so that we can count the things we
sample.

The [OpenTelemetry Collector's `tailsampling`
processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md)
is another example system with a rule-based configurable sampler that
we reference in our design. We see this as an important user-validated
approach to configurable sampling policies for OpenTelemetry users,
and we aim to cover this component's features in our model.

We are also looking at retrofitting OpenTelemetry sampling threshold
logic onto both of these samplers, following the approach taken with
`probabilisticsampler`. It will not be necessary for OpenTelemetry
users to change their sampler configuration just to take advantage of
metrics calculated accurately from span data, since we can introduce
this support to those components without otherwise changing their
approach to sampling. However, in some cases, especially with
rate-limited sampling, architectural changes will be required.

### OpenTelemetry sampling systems with feedback

Guided by the Jaeger system, and taking inspiration from adaptive
sampling systems used in several vendor-specific telemetry agents, we
are looking forward to new and improved feedback-oriented sampling
systems for OpenTelemetry users.  When OpenTelemetry SDKs can be
remotely configured through an endpoint, users will seek to build
adaptive sampling pipelines using OpenTelemetry components.

For users, this will bring the ability to automatically quiet a noisy
span or log event, without losing the ability to count approximately
how many of those events are happening. At this milestone, we think
users will be at last well served with a complete and
OpenTelemetry-based approach to distributed trace sampling.
