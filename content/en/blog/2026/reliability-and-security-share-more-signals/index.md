---
title: 'Reliability and Security Share More Signals Than We Think'
linkTitle: 'Shared signals'
date: 2026-12-15
author: '[anarwal](https://github.com/anarwal)'
issue: https://github.com/open-telemetry/opentelemetry.io/issues/12670
sig: 'Collector SIG'
cSpell:ignore: anarwal
---

_This is the second post in a series on observing the same system with
OpenTelemetry. The first post,
[When Missing Telemetry Is the Signal](/blog/2026/when-missing-telemetry-is-the-signal/),
covers how to tell when you've lost visibility._

A queue starts growing, requests take longer, and workers use more CPU. The
reliability team sees a capacity problem. The security team might see a service
being flooded with unwanted work.

Both teams are looking at the same behavior, and the queue length alone can't
settle it. Demand might be legitimate, a deployment might have made processing
more expensive, or someone might be sending expensive requests on purpose.

OpenTelemetry gives both investigations the same place to start. Metrics show
that behavior changed, traces show which paths through the system it affected,
and logs record the decisions individual services made. The teams ask different
questions, but they can work from the same data.

## Separate the observation from the explanation

Consider a service that generates reports. It authorizes each request, adds the
work to a queue, and returns an acknowledgement. A worker later produces the
report, and the caller retrieves it.

Suppose requests increase while report completion slows. Several explanations
fit:

- A legitimate customer started a large export.
- A worker release made processing slower.
- A client is retrying too often.
- An attacker is exploiting an expensive operation.

Calling this a capacity incident doesn't tell you the cause, and calling it an
attack doesn't tell you the intent. Start by recording what changed and where,
then check each explanation against more data.

| Shared observation                         | Reliability investigation                     | Security investigation                          |
| ------------------------------------------ | --------------------------------------------- | ----------------------------------------------- |
| More requests reach an expensive operation | Demand growth or retry behavior               | Abuse of a costly operation                     |
| Authorization denials increase             | Broken client configuration or policy rollout | Attempts to use unavailable privileges          |
| Workers contact a new dependency           | Release or routing change                     | Unexpected destination or unauthorized behavior |
| Completed work falls behind accepted work  | Backlog, failure, or lost work                | Disruption or interference with processing      |

Each row is a lead to follow. None of them proves an attack on its own.

## Use metrics to establish the shape of the change

Start with request rate, duration, resource use, and work completion, and
compare the same operation and environment before and after the change. Look at
individual operations, not just totals, because a modest rise in total traffic
can hide a sharp rise in one expensive operation.

For the report service, the application measurements worth recording are
accepted jobs, completed jobs, authorization outcomes, queue age, and processing
duration. Record these with the
[OpenTelemetry metrics API](/docs/concepts/signals/metrics/), and use existing
[semantic conventions](/docs/concepts/semantic-conventions/) where they apply.
Measurements like accepted and completed jobs are specific to your application,
so write down what each one means.

Count authorization outcomes in the component that makes the authorization
decision. A denied request is worth counting even when the service handled it
correctly, because a rise in denials can point to a broken client configuration
or to someone trying privileges they don't have. An HTTP error count can't tell
you which policy denied the request or why.

Keep metric attributes to a small, fixed set of values. An operation category or
a decision outcome is enough to compare before and after. User IDs, request IDs,
raw URLs, and free-form reason strings create
[too many combinations](/docs/concepts/signals/metrics/#cardinality-limits). If
an investigation needs those details, keep them in logs or traces with access
controls, and only when you have a reason to record them.

## Use traces to locate expensive work

A representative trace might show that accepting a request stays fast while the
worker spends most of its time in a database query. Another might show several
retries before processing starts. Either one narrows down where to look.

[Distributed traces](/docs/concepts/signals/traces/) connect instrumented
operations through context propagation, so they can show whether slow requests
share a dependency, an operation, or a deployment version. They can't tell you
why the caller sent the request.

Traces are also a sample. [Sampling](/docs/concepts/sampling/) might drop the
request you want to inspect, and a trace that wasn't kept can't be recovered
later by changing a query. Count outcomes with application metrics instead of
counting sampled spans as if they represented every request.

## Add the decision that the trace cannot infer

A trace might show a call to an authorization component without showing why it
allowed or denied the action. A structured application log can record that
decision: the action category, the outcome, a reason category from a fixed list,
and the policy version, as long as those details are safe to keep.

When the log is emitted with an active trace context through a logging
integration that supports it, the record includes the trace ID and span ID. An
investigator can then go from the decision to the request that triggered it.
Correlation depends on your SDK, logging bridge, and backend, so confirm that it
actually works in yours.

Record the decision as the responsible service made it. An incoming header that
says a request is trusted doesn't make it trusted. A trace ID helps you
correlate activity, but it isn't an authenticated identity.

Some investigations need to know who made a request. Decide that separately from
the shared operational metrics. Store only the reference you need, in a location
your organization has approved, with access limited to the people who need it.
Don't log credentials, tokens, or request bodies, and keep in mind that hashing
an identifier doesn't necessarily make it anonymous.

## Walk through the same evidence twice

Take the report service again. Three things have changed: accepted work went up,
queue age went up, and sampled worker traces show longer database calls.

The reliability team can compare worker versions, database latency, capacity,
and retry behavior. If the slowdown started with a release, a changed query is
the first thing to check.

The security team can look at whether the mix of operations changed, whether the
authorization service's decisions changed, and whether permitted clients are
using the service in an unexpected way. Authorized activity can still be
abusive, and a low denial rate doesn't rule that out.

Both teams need the same operation names, deployment context, and time window,
and each will probably need data the other doesn't. Security might need identity
provider records or a protected audit trail. Reliability might need a deployment
history or a database execution plan.

## Keep the limits visible

Shared OpenTelemetry data saves both teams from rebuilding the incident from
scratch, but application telemetry isn't a complete security record. A
compromised application can emit false data, Collectors can drop records, and
retention can expire before anyone starts looking.

Telemetry can also go missing without anyone noticing, which is what the
[first post in this series](/blog/2026/when-missing-telemetry-is-the-signal/)
covers. A healthy application doesn't mean its telemetry is reaching you, so
check delivery before you treat a quiet dashboard as proof that nothing
happened.

Start with one workflow and one behavior that matters to both teams, and agree
on what each measurement means. Then connect the changes you see in metrics to
representative traces and to the decisions your services logged.
