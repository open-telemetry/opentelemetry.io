---
title: Designing instrumentation to detect missing telemetry
linkTitle: Detecting missing telemetry
description:
  Instrument application workflows to distinguish expected quiet periods from
  missing work or telemetry.
weight: 30
---

When telemetry you expected doesn't show up, there are a few possible
explanations:

- No work happened, so there was nothing to record.
- Work started but stopped before it reached an instrumented step.
- The work ran and was recorded, but the telemetry never reached your backend.

From a dashboard, all three look the same. To tell them apart, you need to know
what activity you expected, and you need instrumentation at the points in the
workflow where you can confirm progress.

This page uses a file processing service as a running example. A caller uploads
a file, the service queues it, and a worker processes it.

## Define expected activity

Before you can say something is missing, you need to know what normal looks
like. A scheduled job is the easy case, because it should run at a known time
and finish within a known window. A request-driven service is harder, because a
quiet period overnight might be completely normal. Deployments and planned
maintenance also cause gaps that aren't failures, so take those into account
before you treat an empty query as a problem.

Be precise about what "done" means. For the file service, the job isn't done
when the upload succeeds, or even when a worker finishes computing the result.
It's done when the caller can read the result from its destination. Then write
down two delays separately, because they can go wrong independently: how long
processing normally takes, from acceptance to completion, and how long telemetry
about that work takes to become queryable in your backend.

OpenTelemetry records and exports signals, but it doesn't know what you expect.
Missing-data alerts and their evaluation windows are set up in your monitoring
system, using the expectations above.

## Count workflow milestones

The most direct way to notice missing work is to count items as they move
through the workflow. With [code-based instrumentation](../code-based/), record
a counter when an item is accepted and another when it reaches a final outcome.
Also track how many items are still in progress, including anything queued or
waiting for a retry. If your application already holds that number in memory, an
[observable gauge](/docs/concepts/signals/metrics/#metric-instruments) can
report it directly without a separate counter.

Decide up front which items count. In the file service, a file rejected at
upload never entered the workflow, so it isn't counted. A file that was accepted
and then failed validation did enter, so it counts as accepted with an
unsuccessful outcome. If the workflow supports cancellation or expiry, count
those as unsuccessful outcomes too. Each item is counted once when it's accepted
and once when it finishes.

Over any interval, the counts for a workflow should balance:

```text
in progress at start + accepted during interval
  = completed during interval + ended unsuccessfully during interval
    + in progress at end
```

For example, suppose 10 files are in progress at the start and 100 are accepted
during the interval. If 92 complete and 3 end unsuccessfully, 15 should still be
in progress at the end.

A few situations can throw the counts off if you don't plan for them:

- **Retries.** A retry is another attempt at the same item, not a new item.
  Don't count it as accepted again, and don't record a final outcome until the
  last attempt.
- **Duplicate deliveries.** If your queue can deliver the same message twice,
  deduplicate before counting it as new work.
- **Fan-out.** If one input produces several outputs, give the outputs their own
  counters instead of comparing them with the input count.

To check the balance, use how much each counter changed over the interval and
the in-progress value at the start and end. Small differences are normal and
usually resolve on their own:

- Process restarts reset counters to zero, so use your backend's rate or
  increase functions, which handle resets, instead of subtracting raw values.
- Collection delays mean the most recent values might not have arrived yet.
- Items change state while you're measuring.

Compare the same workflow over the same time window. If a mismatch is still
there after the delay you wrote down, investigate it.

These counts help you spot problems, but they aren't an exact ledger. If a
process fails between updating application state and incrementing a counter, the
two will disagree. When you need an exact answer, check the application's own
records.

Keep metric attributes to a small, fixed set of values, such as workflow type or
outcome. File identifiers and trace IDs don't belong in metric attributes. See
[metric cardinality limits](/docs/concepts/signals/metrics/#cardinality-limits)
for what happens to queries when there are too many attribute combinations.

## Use traces and logs to investigate gaps

Counters tell you that something is off. Traces and logs help you find out
where. Create spans around each processing step, such as upload, queueing,
processing, and writing the result. Use
[context propagation](/docs/concepts/context-propagation/) to connect work
across services. When a queue worker starts a new trace, use
[span links](/docs/concepts/signals/traces/#span-links) to connect it back to
the request that caused it.

Include trace context in logs so you can see every recorded step for an affected
item. If you can, also log the application's own ID for the item, such as a file
ID, so you can match logs against application state. Follow your data handling
policy when recording identifiers or payload details.

A missing span doesn't mean the step didn't run.
[Sampling](/docs/concepts/sampling/) or filtering might have dropped it. That's
why you record workflow counters for every item, whether or not the trace was
sampled. Application state fills in what sampling left out.

## Test the workflow end to end

One way to confirm the whole path works is to send a test file through the
service and check that the result arrives at the destination in time. Use test
data, and an isolated destination if the test could affect real users. Then
check separately that the test's telemetry reached your backend.

Synthetic tests have limits:

- Make sure sampling and filtering won't drop test telemetry. Otherwise its
  absence looks like a failure when it isn't.
- A test only covers the route it takes. Passing doesn't show that all
  application work is being observed.
- Sending test data straight to a Collector checks the pipeline from the
  Collector onward, but not whether your application emits telemetry when real
  work runs.
- Seeing data in a local debug exporter tells you the SDK produced it, not that
  your production backend received it.

For more on debugging the Collector side, see the
[pipeline troubleshooting checklist](/docs/collector/troubleshooting/#checklist-for-debugging-complex-pipelines).

## Monitor the telemetry pipeline

The telemetry pipeline can fail on its own, so monitor it separately from the
application. Things worth watching:

- Collector [data flow](/docs/collector/internal-telemetry/#data-flow), along
  with its queue and export failure metrics.
- Whether those metrics themselves keep arriving. If the monitoring goes quiet,
  it looks the same as everything being fine. If possible, send these metrics
  through a path that doesn't depend on the application's telemetry pipeline, so
  they still report when it breaks.
- Whether data can actually be queried in the backend, if that's part of what
  "done" means for you. A healthy Collector and a successful export don't
  guarantee that the record was stored.

For code examples of these patterns, see
[When Missing Telemetry Is the Signal](/blog/2026/when-missing-telemetry-is-the-signal/).
