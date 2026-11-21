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
covers detecting loss of visibility._

A queue starts growing. Requests take longer. Workers use more CPU. The
reliability team sees a capacity problem. The security team may see a service
being overwhelmed by unwanted work.

Both teams need to explain the same behavior. The queue length alone cannot tell
them whether demand is legitimate, a deployment increased processing cost, or
someone is deliberately sending expensive requests.

OpenTelemetry can give these investigations a common starting point. Metrics
show the change in behavior. Traces show paths through the system. Logs can
record local decisions. The useful overlap is in the evidence, even when teams
ask different questions of it.

## Separate the observation from the explanation

Consider a service that accepts requests to generate reports. It authorizes the
request, adds work to a queue, and returns an acknowledgement. A worker produces
the report for later retrieval.

Suppose requests increase while report completion slows. Several explanations
fit that observation. A legitimate customer may have started a large export. A
worker release may have made processing slower. A client may be retrying too
often. An attacker may be exploiting an expensive operation.

Calling this a capacity incident does not establish the cause. Calling it an
attack does not establish intent. First record what changed and where it
changed. Then test possible explanations against additional evidence.

| Shared observation                         | Reliability investigation                     | Security investigation                          |
| ------------------------------------------ | --------------------------------------------- | ----------------------------------------------- |
| More requests reach an expensive operation | Demand growth or retry behavior               | Abuse of a costly operation                     |
| Authorization denials increase             | Broken client configuration or policy rollout | Attempts to use unavailable privileges          |
| Workers contact a new dependency           | Release or routing change                     | Unexpected destination or unauthorized behavior |
| Completion counts fall behind admission    | Backlog, failure, or lost work                | Disruption or interference with processing      |

These are investigation paths. None of the observations proves an attack.

## Use metrics to establish the shape of the change

Start with request rate, duration, resource use, and work completion. Compare
the same operation and environment before and after the change. A rise in total
traffic can hide a sharper rise in one expensive operation.

For the report service, useful application measurements include accepted jobs,
completed jobs, authorization outcomes, queue age, and processing duration.
Record these with the
[OpenTelemetry metrics API](/docs/concepts/signals/metrics/). Use existing
semantic conventions where they apply. Application workflow measurements need
their own documented definitions.

An authorization outcome count should come from the component that makes the
authorization decision. A denied request is a meaningful outcome even when the
service handled it correctly. An HTTP error count alone does not describe the
policy decision or its reason.

Keep metric dimensions bounded. A small operation category or decision outcome
can support useful comparisons. User IDs, request IDs, raw URLs, and arbitrary
reason strings can create too many combinations. Keep individual investigation
details in suitably protected logs or traces when there is a justified need.

## Use traces to locate expensive work

A representative trace might show that admission remains fast while a worker
spends most of its time in a database query. Another might show several retries
before processing starts. These observations narrow the investigation.

[Distributed traces](/docs/concepts/signals/traces/) connect instrumented
operations through context propagation. They can show whether slow work shares a
dependency, operation, or deployment version. They cannot explain the caller's
intent on their own.

The trace view is also selective. [Sampling](/docs/concepts/sampling/) may omit
the request you want to inspect. A trace that was never retained cannot later be
recovered by changing a query. Use direct application metrics to count outcomes
rather than counting sampled spans as if they represented every request.

## Add the decision that the trace cannot infer

A trace may show a call to an authorization component without showing why it
allowed or denied an action. A structured application log can supply that
decision. It can record the action category, outcome, bounded reason category,
and policy version when those details are needed and safe to retain.

When emitted with active trace context and a suitable logging integration, the
record can contain the trace ID and span ID. That allows an investigator to move
from a decision to the related processing path. Check that correlation works in
the actual SDK, logging bridge, and backend you use.

Record the decision as observed by the responsible service. An incoming header
that says a request is trusted does not establish that it is trusted. A trace ID
helps correlate activity. It is not an authenticated identity.

Some investigations need a subject reference. Decide that separately from the
shared operational metrics. Store only the necessary reference in an approved
location with appropriate access. Avoid credentials, tokens, and request bodies.
Hashing an identifier does not necessarily make it anonymous.

## Walk through the same evidence twice

For the hypothetical report service, begin with three observations. Accepted
work increased. Queue age increased. Sampled worker traces show longer database
calls.

The reliability investigation can compare worker versions, database latency,
capacity, and retry behavior. If the slowdown began with a release, a query
change becomes a useful hypothesis to test.

The security investigation can examine whether the operation mix changed,
whether authoritative access decisions changed, and whether permitted clients
are using the service in an unexpected way. Authorized activity can still be
abusive. A low denial rate does not rule that out.

Both investigations benefit from the same operation names, deployment context,
and time boundaries. Each may require additional evidence. Security analysis may
need identity provider records or a protected audit trail. Reliability analysis
may need a deployment history or a database execution plan.

## Keep the limits visible

Shared OpenTelemetry data can reduce the work of reconstructing an incident. It
does not make application telemetry a complete security record. A compromised
application may emit false data. Collectors can drop records. Retention can
expire before an investigation starts.

The first post in this series,
[When Missing Telemetry Is the Signal](/blog/2026/when-missing-telemetry-is-the-signal/),
examines loss of visibility. A healthy application does not guarantee a healthy
observation path. Check telemetry delivery before treating a quiet dashboard as
evidence that an event did not occur.

Start with one workflow and one behavior that matters to both teams. Agree on
what the measurements mean. Connect aggregate changes to representative traces
and authoritative decisions. The result is a common body of evidence with clear
limits on what it can establish.
