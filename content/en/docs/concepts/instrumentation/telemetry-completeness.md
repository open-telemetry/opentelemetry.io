---
title: Designing instrumentation to detect missing telemetry
linkTitle: Detecting missing telemetry
description:
  Instrument application workflows to distinguish expected quiet periods from
  missing work or telemetry.
weight: 30
---

Missing telemetry can mean that no work occurred, that work stopped before an
instrumented step, or that telemetry did not arrive. To distinguish these cases,
define what activity you expect and record evidence at meaningful points in the
workflow.

For example, a file processing service might accept a file and queue it for a
worker. Processing ends when the result becomes available to the caller. A
successful upload alone does not establish that this result is available.

## Define expected activity

Specify when work should occur and how long it normally takes to finish. A
scheduled job has an expected run time. A service that handles incoming requests
might have legitimate periods with no traffic. Account for deployment changes
and planned pauses before interpreting an empty query result as a failure.

Choose a completion condition that reflects what the caller needs. For the file
processing service, this might mean that the result can be read from its
destination, rather than that a worker has finished computing it. Record the
maximum expected delay between acceptance and completion separately from the
delay before telemetry becomes queryable.

OpenTelemetry records and exports signals. Configure missing data alerts and
their evaluation windows in your monitoring system using these expectations.

## Count workflow milestones

Use [code-based instrumentation](../code-based/) to record counters when logical
items enter the workflow and reach a terminal outcome. Observe the number of
items still in progress, including queued items and items waiting for a retry.
Choose an observable gauge when reading this value from application state.

Define which items belong to the workflow. Count each logical item once at
acceptance and once at its terminal outcome. For example, a file rejected before
acceptance is outside this accounting boundary. A file accepted and later
rejected by validation is an accepted item with an unsuccessful outcome.

For the same workflow over one interval, the accounting relationship is

```text
in progress at start + accepted during interval
  = completed during interval + ended unsuccessfully during interval
    + in progress at end
```

For example, suppose 10 files are in progress at the start and 100 are accepted
during the interval. If 92 complete and 3 end unsuccessfully, 15 should remain
in progress at the end. Each terminal outcome must be counted once. Include
cancelled or expired work among unsuccessful outcomes if the workflow supports
them.

Record retries separately from logical item acceptance. A retry does not create
another accepted item or a terminal outcome while further attempts remain.
Deduplicate repeated deliveries before counting them as new work. If one input
creates several output items, define separate accounting for those items rather
than comparing their count directly with the input count.

Use counter changes over the chosen interval and in progress measurements from
both interval boundaries. Account for process restarts and counter resets when
combining measurements across instances. Align the workflow scope and time
boundaries before comparing totals. Collection delays and concurrent state
changes can cause temporary differences, so allow for the expected observation
delay before investigating a sustained mismatch.

Keep metric attributes bounded, for example by workflow type or outcome. Avoid
file identifiers and trace IDs as metric attributes. See
[metric cardinality limits](/docs/concepts/signals/metrics/#cardinality-limits)
for how attribute overflow affects queries that filter or group measurements.

These measurements can reveal discrepancies, but they are not a transactional
record of every item. Instrumentation can fail between a state change and a
counter update. For exact accounting, verify the corresponding application state
or durable records.

## Use traces and logs to investigate gaps

Create spans around meaningful processing steps. Use
[context propagation](/docs/concepts/context-propagation/) to connect work
across services. For asynchronous work that starts a separate trace, use
[span links](/docs/concepts/signals/traces/#span-links) to record the causal
relationship.

Include trace context in logs so that you can inspect the recorded steps for
affected work. Where appropriate, keep an application identifier in logs to
support comparison with application state. Follow your data handling policy when
recording identifiers or payload details.

A missing span does not prove that the step did not run.
[Sampling](/docs/concepts/sampling/) or filtering might remove it. Record
workflow counters independently of trace sampling decisions, rather than only
when a span is sampled. Use retained traces to investigate discrepancies in the
counts, with application state as a separate checkpoint.

## Check the path with known activity

Send a bounded test item through the application and verify its expected result
at the destination within a defined arrival window. Use test data and an
isolated destination where needed to avoid real customer effects. Check for the
expected telemetry in the backend as a separate step.

Define how sampling and filtering should treat test telemetry before deciding
whether its absence indicates a problem. A test that exercises one route only
checks that route. It does not establish that all application work is being
observed.

Sending test telemetry directly to a Collector checks the downstream telemetry
path. It does not test whether application instrumentation emits telemetry when
work runs. A local debug exporter is one checkpoint, not confirmation that the
production backend received the data. See the Collector
[pipeline troubleshooting checklist](/docs/collector/troubleshooting/#checklist-for-debugging-complex-pipelines).

## Monitor the observation path

Check the health of the telemetry pipeline separately from application
completion. Monitor Collector
[data flow](/docs/collector/internal-telemetry/#data-flow) and its queue and
failure metrics. Where practical, observe these measurements through a path that
can still report when the application telemetry path fails. Check that the
monitoring measurements themselves continue to arrive.

Verify query visibility at the backend when that is part of the expected
outcome. A healthy Collector or a successful export alone does not establish
that a record is stored and queryable. Comparing backend results with
application state can help distinguish missing work from missing evidence.

For the application examples behind this guidance, see
[When Missing Telemetry Is the Signal](/blog/2026/when-missing-telemetry-is-the-signal/).
