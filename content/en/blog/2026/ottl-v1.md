---
title: OpenTelemetry Transformation Language reaches v1
linkTitle: OTTL v1
date: 2026-10-27
author: '[Tyler Helmuth](https://github.com/TylerHelmuth) (Grafana Labs)'
draft: true # TODO: remove once the Collector release ships
issue: 12163
sig: Collector SIG
cSpell:ignore: Genesys Helmuth ottl SigNoz xottl xprofile
---

The
[OpenTelemetry Transformation Language (OTTL)](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl)
is now v1. Starting with opentelemetry-collector-contrib v0.164.0, OTTL is
stable for traces, metrics, and logs.

v1 means OTTL meets the Collector's
['stable' stability criteria](https://github.com/open-telemetry/opentelemetry-collector/blob/ebfdf90d82abe991c69554b31f2efc4a96622803/docs/component-stability.md#stable)
for testing, benchmarking, documentation, and telemetry. It also comes with a
compatibility promise for all of 1.x. If you write OTTL statements, the syntax
and the standard functions stay backward compatible. If you build your own
components on top of OTTL, the Go API does too.

## What the v1 guarantee covers

Before promoting OTTL we
[reviewed every token, type, and feature in the grammar](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/50217).
Everything documented in the
[language reference](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/LANGUAGE.md)
is now frozen for 1.x. That covers paths, literals, operators, function calls,
and `where` clauses. We can add new syntax in a minor release, but we won't
remove or change the meaning of existing syntax.

For the life of 1.x, we won't remove any function from the
[standard function set](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/ottlfuncs/README.md#function-stability)
or change an existing signature in a backward-incompatible way. A statement that
parses against one 1.x release will parse and behave the same against every
later 1.x release.

That promise has a cost. Every function we add to the standard set becomes
permanent, so we can't keep adding functions the way we did before v1. New
functions now start out as experimental. They live in the
[`xottl` module](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/xottl/ottlfuncs/README.md),
and statements that use them only parse when you enable the
[`pkg.ottl.functions.enableExperimental`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/documentation.md#feature-gates)
feature gate. `xottl` is versioned at 0.x, so an experimental function can
change or disappear in any release.

A function moves into the standard set once it meets the
[promotion criteria](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/ottlfuncs/README.md#promotion-to-standard).
It needs at least two minor releases as an experimental function, complete tests
and documentation, no open proposals to change it, and real demand from users.
Promotion freezes the signature, so the experimental period is the time to tell
us if a function's arguments or behavior are wrong.

A few things sit outside the guarantee on purpose:

- The
  [lambda-powered functions](/blog/2026/lambda-powered-function-land-in-ottl/)
  (`Filter`, `MapEach`, `MapKeys`, `Any`, `All`, `Find`, `Reduce`, and `When`)
  are experimental and still require the `ottl.functions.enableLambda` feature
  gate.
- Profiles support is in development and has moved to the
  [`xprofile` module](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/contexts/xprofile/README.md),
  which is versioned separately at 0.x.
- Experimental Go APIs, such as `SliceGetter`, live in `xottl`.

The transform processor, filter processor, and other components that ship with
contrib register the experimental functions, but they're off by default. To try
them, enable the matching feature gate, for example
`--feature-gates=pkg.ottl.functions.enableExperimental`. You don't need a custom
build.

## What changes when you upgrade

In the releases leading up to v1 we cleaned out things we didn't want to carry
for all of 1.x. We removed long-deprecated functions such as `Base64Decode` and
the old profile functions, and removed feature gates that had already reached
stable, including `ottl.PanicDuplicateName` and
`ottl.contexts.enableOTelColContext`. v0.164.0 removes the `ottl.set.allowNil`
gate. If you still pass any of these gates to the Collector, remove them before
you upgrade.

If you're jumping several releases at once, read the
[contrib changelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/CHANGELOG.md)
entries for `pkg/ottl` between your version and v0.164.0.

## How we got here

OTTL started in 2022 as the configuration language for the transform processor.
Today, 14 components in opentelemetry-collector-contrib accept OTTL in their
configuration:

- Processors: transform, filter, tail sampling, adaptive tail sampling, log
  deduplication, lookup, partitioning, and span pruning
- Connectors: routing, count, sum, and signal to metrics
- Exporters: Honeycomb marker and NATS

In the
[2026 Collector survey](/blog/2026/otel-collector-follow-up-survey-analysis/),
both the transform processor and the routing connector showed significant usage
increases over 2025.

Stabilizing OTTL is part of the Collector SIG's
["Stable by Default"](/blog/2025/stability-proposal-announcement/) work and the
broader effort to
[stabilize the most-used Collector components](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130).
We opened the
[OTTL stability tracking issue](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/47305)
in April 2026 and worked through the testing, documentation, and observability
requirements over the summer. The harder question was what "frozen" should mean
for the function set. We answered it in
[#50927](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/50927),
which is where the experimental function process came from.

The
[graduation request](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/51068)
collected production endorsements from New Relic, Grafana Labs, SigNoz, and
Genesys. New Relic drops host metrics its customers don't use, which cuts their
ingest cost. Grafana Labs copies cluster and namespace attributes onto every
signal in its own Grafana Cloud pipelines. SigNoz documents filter processor
conditions as the way for customers to control ingest volume. Genesys uses OTTL
to map Prometheus metrics to OpenTelemetry and to process CloudWatch metrics.
New Relic and SigNoz both ship OTTL-based components in their own Collector
distributions. With those endorsements in place,
[#51236](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/51236)
promoted traces, metrics, and logs to stable.

## What comes next

With OTTL at v1, the transform processor is next. We're
[actively working on promoting it to stable](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/47306),
and its testing, documentation, configuration, and observability reviews are
already done.

We're also working to promote the lambda functions and their Go API into the v1
guarantee. Lambdas are the biggest feature we've added to OTTL since the cache
and they completely change how you write functions, unblocking transformation
scenarios OTTL previously could not handle. If you use lambdas, tell us what's
awkward. Once the profiles signal stabilizes, we'll look at bringing `xprofile`
under the v1 guarantee too.

If you want to help, the experimental functions are the easiest place to start.
Try them and open an issue when one doesn't fit your use case. You can also
answer questions, review pull requests, or pick up an issue labeled
[`pkg/ottl`](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues?q=is%3Aopen+is%3Aissue+label%3Apkg%2Fottl).
If you're new to OTTL, start with
[Transforming telemetry](/docs/collector/transforming-telemetry/) and come find
us in the `#otel-collector` channel on CNCF Slack.
