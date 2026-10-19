---
title: 'When Missing Telemetry Is the Signal'
linkTitle: 'Missing telemetry'
date: 2026-10-19
author: '[anarwal](https://github.com/anarwal)'
cSpell:ignore: anarwal
issue: https://github.com/open-telemetry/opentelemetry.io/issues/12179#issuecomment-6259197734
sig: 'Collector SIG'
---

An empty dashboard can mean that nothing happened. It can also mean that the
system stopped reporting what happened. On a dashboard they look the same. One
needs no action. The other means you are working blind.

Take a workflow where events enter a service, pass through a processing stage,
and reach storage. An operator then uses the stored result. Every service can
remain available while one data transfer silently drops events. Error rates stay
low, yet the operator is working with an incomplete view.

This is a telemetry completeness problem. The application may be healthy while
its telemetry path is not. OpenTelemetry can catch this, but only if you plan
for it when you instrument.

## Define what should be present

A missing signal is useful only when there is a clear expectation that the
signal should exist. Start with a small set of expectations for each important
workflow:

- A scheduled job should report a result within a known time window.
- A stage that accepts work should later report completed or rejected work.
- A continuously active service should keep producing some telemetry.

These checks must allow for planned quiet periods. A service with no requests
should not produce request spans. A nightly job does not need to report every
minute.

## Reconcile counts across stages

For a workflow with clear boundaries, record counters at those boundaries. For
example, count events accepted by the first stage and events completed by the
last stage. Compare the counts over a time window that allows for normal
processing delay.

The counts do not always need to match. A pipeline may filter duplicates, reject
invalid input, retry work, or process it in batches. Those expected changes
should be measured too. The useful rule is:

accepted \= completed \+ rejected \+ still processing

If the numbers cannot be reconciled, the gap is a signal. OpenTelemetry metrics
fit this check because they can track totals without storing an identifier for
every event. Keep attributes small and stable, such as the workflow stage and
outcome. Avoid using a unique event or user identifier as a metric attribute.

## Use traces to locate the gap

[Traces](/docs/concepts/signals/traces/) show how selected requests move through
a system. A trace can reveal that work reached one stage but did not reach the
next. Logs correlated with that trace can add the local reason.

Traces should not be the only completeness check.
[Sampling](/docs/concepts/sampling/) means that a missing trace may be an
expected collection decision. Use metrics to detect a count or rate gap, then
use available traces and logs to find where the gap begins.

For asynchronous work, preserve trace context when possible. If one item of work
starts another without a direct parent-child relationship, span links can record
that relationship. This makes the workflow easier to follow without forcing it
into a single synchronous trace.

## Send known activity through the full path

Real traffic can stop for valid reasons. A small synthetic event, sent at a
known interval, provides an independent check. Send it through the same
important stages as normal work and verify the result at the end.

Make the synthetic event easy to identify and safe to process. Keep personal or
sensitive data out of it. Give it a success window that allows for normal
queueing or batching.

It tells you whether the workflow can still carry a known event from start to
finish.

## Monitor the telemetry path

The OpenTelemetry Collector produces
[internal telemetry](/docs/collector/internal-telemetry/) about its own work.
Useful signals include:

- records accepted or refused by receivers;
- records sent or failed by exporters;
- exporter queue size and capacity.

A growing queue or a sustained export failure can explain why application
telemetry stopped arriving. Accepted and sent counts can also show where the
telemetry flow changed. Account for configured filtering, sampling, routing, and
processing before treating a difference as data loss.

A running Collector can still fail to send data, so alert on telemetry flow
rather than process uptime. Where practical, observe this path independently so
that a failure does not also hide its own health signals.

## Check the workflow from more than one point

No single check proves completeness. Combine a few narrow checks that fail in
different ways:

| Check               | What it tells you                                    |
| :------------------ | :--------------------------------------------------- |
| Expected signal     | Activity should have appeared by now                 |
| Cross-stage counts  | Work entered but did not leave as expected           |
| Synthetic event     | The full path can carry known activity               |
| Collector telemetry | The telemetry pipeline is accepting and sending data |

When normal traffic is absent but the synthetic event succeeds, the system may
simply be quiet. When expected traffic is absent and the synthetic event also
disappears, the observation path is likely broken. When application counts are
healthy but Collector failures rise, the problem is probably in the telemetry
pipeline rather than the application.

## Put the checks together

Start with one important workflow. Define when activity is expected, reconcile
counts at its boundaries, add one end-to-end synthetic check, and watch the
Collector's data flow.
