---
title: Comparing Trace Sampling Strategies in OpenTelemetry
linkTitle: Comparing Sampling Strategies
date: 2026-11-11
author: '[Mike Goldsmith](https://github.com/MikeGoldsmith) (Honeycomb)'
issue: 12070
sig: SIG Sampling
cSpell:ignore: loadbalancing ottl reweighting spanmetrics usetracestate
---

<!-- cSpell:ignore tailsamplingprocessor -->

Every team running OpenTelemetry at scale reaches the same question. You are
producing more trace data than you want to store, and something has to decide
what to keep. OpenTelemetry gives you three sampling strategies to make that
decision, and they are not interchangeable. Each one trades cost against how
much it knows at the moment it decides.

In this post, we'll go over probabilistic sampling, tail sampling, and adaptive
tail sampling, including where each one runs, what it costs you, and the cases
it suits best.

## Probabilistic sampling

Probabilistic sampling keeps a fixed fraction of traces, selected on randomness
derived from the trace ID. The decision needs nothing but the trace ID, so it
can run almost anywhere. The same strategy shows up in three places.

**In the SDK**, where it is usually called head sampling, the decision happens
as the trace starts. Unsampled spans are not recorded or exported, so you save
the cost of producing, exporting, and storing them. This is the only place
sampling reduces load inside the instrumented application rather than downstream
of it.

**As a Collector processor**, using [`probabilistic_sampler`][] (beta for
traces, alpha for logs). It is stateless and buffers nothing, so it scales
without any special deployment topology, and it handles logs as well as traces.
Moving the decision here means you can change sampling centrally without
redeploying applications, which matters when your SDK configuration is
inconsistent across a fleet.

**As a rule inside the tail-based processors.** Both `tail_sampling` and
`adaptive_tail_sampling` can apply a fixed percentage to traces that have
already matched a condition. The adaptive processor's README describes its
`probabilistic` sampler as the inline equivalent of the standalone processor.
This is how you keep a portion of a group of traces rather than a portion of
everything, for example keeping all errors but only 10% of successful checkout
requests.

The limitation is the same wherever it runs. The decision is blind to what the
request did. A sampler choosing at the head cannot know the request will return
a 500 or take 30 seconds, so errors and slow requests survive at the same rate
as health checks. If a payment failure happens once in every 1,000 requests and
you sample at 1%, you keep one failure trace per 100,000 requests. A service
handling 50,000 requests a day hits that failure around 50 times a day and keeps
evidence of it once every two days.

The specification deprecates `TraceIdRatioBased` in favor of
`ProbabilitySampler`, or `ComposableProbability` when used with
`CompositeSampler`. Both use the 56-bit randomness from
[W3C Trace Context Level 2](https://www.w3.org/TR/trace-context-2/) and follow
the
[consistent probability sampling specification](/docs/specs/otel/trace/tracestate-probability-sampling/).
Both are still in Development status in the specification, so check that your
SDK implements them. SDKs keep `TraceIdRatioBased` working through its
deprecation period, so there is no rush, but new configuration is better pointed
at the new samplers. For the background on why, see
[OpenTelemetry Sampling update](/blog/2025/sampling-milestones/). On the
Collector side, `probabilistic_sampler` defaults to `hash_seed` mode, which uses
14 bits of precision. The `proportional` and `equalizing` modes use the 56-bit
mechanism from the specification, and `equalizing` accounts for sampling an
upstream stage already applied. Neither is the default, so set `mode` explicitly
if you want the spec-aligned behavior.

**Use probabilistic sampling when** you want a predictable reduction as cheaply
as possible, your traffic is reasonably uniform, or you need to thin a group of
traces you have already selected some other way. Accept that rare events are
lost in proportion to everything else.

## Tail sampling

The [`tail_sampling`][] processor (beta) buffers the spans of a trace in memory
and decides once the trace looks complete. Having the whole trace is the point:
it can keep traces with errors, traces over a latency threshold, traces matching
an OTTL condition, and so on. The processor ships a broad set of policies,
including `latency`, `status_code`, `span_count`, `rate_limiting`, and
`ottl_condition`, plus `and`, `drop`, and `composite` for combining them.

Policies compose as an OR, so several policies can apply to the same trace and
the trace is kept if any of them votes to keep it. That model is flexible for
expressing "keep anything that looks like this," and it is also the source of
the processor's main accounting problem. A policy that declines a trace returns
no decision rather than a drop, so the trace falls through to the next policy,
and any later policy can still keep it. No single policy owns the outcome.

Historically that meant kept traces carried no record of the probability
applied, which makes counts computed from sampled data unreliable. That is
improving. The `processor.tailsamplingprocessor.usetracestate` feature gate
(alpha, off by default) makes the `probabilistic`, `rate_limiting`, and
`bytes_limiting` policies report the threshold they applied, so adjusted counts
stay correct. The gate should not be combined with `sample_on_first_match`,
since correct accounting depends on evaluating every policy that could sample a
trace.

The operational costs are real either way. Buffering means memory proportional
to your span rate and buffer window, and every span of a trace has to reach the
same Collector instance, which means a two-tier deployment with a
`loadbalancing` exporter in front.

**Use tail sampling when** the traces you care about are defined by what
happened during the request, your policies are mostly keep-or-drop rules rather
than budgets you need to hold, and you can afford the memory and the extra tier.

## Adaptive tail sampling

The [`adaptive_tail_sampling`][] processor reached alpha in Collector Contrib
v0.163.0 and ships in the contrib distribution. I'm one of its code owners, so
weigh the framing accordingly.

It buffers traces the same way `tail_sampling` does, and differs in how it
decides. Rules evaluate first match rather than as an OR, so exactly one rule
owns each trace, and each rule carries OTTL conditions plus a sampler. Every
sampler produces a sample rate, which the processor converts to a threshold and
writes to `tracestate` as `ot=th`. Counts stay accurate after sampling, and
tools that read the field, such as the `spanmetrics` connector with
`enable_metrics_sampling_method: true`, can weight their output correctly.

The budgets are what make it adaptive. `adaptive_percentage` targets a
percentage of traffic and `adaptive_throughput` targets a volume budget in spans
per second. Both group traffic by `fingerprint_attributes`, such as service and
route, and compute a rate per fingerprint. Rare traffic is kept at a high rate
while chatty traffic is sampled hard, without anyone hand-tuning rates as the
traffic mix shifts. `always_sample` and `probabilistic` cover the rules that
don't need to adapt.

It carries the same buffering and two-tier topology as `tail_sampling`, plus two
costs of its own. Rates are learned per instance, so each Collector adapts only
to the slice of traffic it sees, and by default a throughput goal is enforced
per instance rather than across the fleet. An experimental `fleet_tracker`
setting can divide the goal by a live fleet size, but no distribution ships a
tracker extension yet. The processor is also alpha, so expect some configuration
change.

**Use adaptive tail sampling when** you need counts to stay accurate after
sampling, your traffic mix shifts enough that fixed rates go stale, or you are
holding a volume budget and don't want to lose rare traffic to it.

## Comparing the three

|                               | Probabilistic                               | Tail                      | Adaptive tail             |
| ----------------------------- | ------------------------------------------- | ------------------------- | ------------------------- |
| Decides                       | Without seeing the trace                    | After buffering the trace | After buffering the trace |
| Knows trace outcome           | No                                          | Yes                       | Yes                       |
| Buffering                     | None                                        | Full trace                | Full trace                |
| Runs at                       | SDK, Collector, or as a rule                | Collector                 | Collector                 |
| Decision model                | Fixed fraction                              | Policies, OR-composed     | Rules, first match        |
| Rate recorded for reweighting | Yes                                         | Behind a feature gate     | Yes, always               |
| Adapts to traffic             | No                                          | No                        | Yes, per fingerprint      |
| Deployment                    | Anywhere                                    | Two tiers                 | Two tiers                 |
| Stability                     | SDK samplers in development, processor beta | Beta                      | Alpha                     |

## How to choose

Start from what you need to be true of the data you keep.

If the answer is "a predictable fraction of everything, as cheaply as possible,"
sample probabilistically and sample early. Put it in the SDK if you want the
overhead savings too, or in the Collector if you would rather control it
centrally.

If it is "every error and every slow request, whatever that costs," tail
sampling buys you that knowledge in exchange for memory and a routing tier. Its
OR-composed policies are a good fit when you can express what you want as a set
of independent keep rules.

If it is "keep the interesting traffic, hold to a budget, and let me still trust
my counts," the adaptive processor targets that case, at the cost of running an
alpha component.

These also compose, and the composition is the point of the consistent
probability sampling specification. A head sampler, a Collector-side
probabilistic stage, and a tail stage can all run in one pipeline, each raising
the threshold on the data passing through. As long as every stage records what
it did in `tracestate`, the surviving spans still describe the original
population, and anything that understands the specification can reconstruct the
real counts. A stage that drops data without recording a probability is the one
that breaks the chain.

If you work on sampling in OpenTelemetry, or you hit a case these three don't
cover, the specification and Collector repositories are the place to raise it.

[`probabilistic_sampler`]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.165.1/processor/probabilisticsamplerprocessor/README.md
[`tail_sampling`]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.165.1/processor/tailsamplingprocessor/README.md
[`adaptive_tail_sampling`]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.165.1/processor/adaptivetailsamplingprocessor/README.md
