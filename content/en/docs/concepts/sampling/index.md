---
title: Sampling
description: Learn about sampling, and the different sampling options available in OpenTelemetry.
weight: 
---

With distributed tracing, you observe requests as they move from one service to
another in a distributed system. It’s superbly practical for a number of
reasons, such as understanding your service connections and diagnosing latency
issues, among many other benefits.

However, if the majority of all your requests are successful 200s and finish
without unacceptable latency or errors, do you really need all that data? Here’s the
thing—you don’t always need a ton of data to find the right insights. _You just
need the right sampling of data._

![Illustration shows that not all data needs to be traced, and that a sample of data is sufficient.](traces_venn_diagram.png)

The idea behind sampling is to control the spans you send to your observability
backend, resulting in lower ingest costs. Different organizations will have
their own reasons for not just _why_ they want to sample, but also _what_ they
want to sample. You might want to customize your sampling strategy to:

- **Manage costs**: You risk incurring heavy charges from the relevant cloud
  provider or vendor if you’re exporting and storing all your spans.
- **Focus on interesting traces**: For example, your frontend team may only want
  to see traces with specific user attributes.
- **Filter out noise**: For example, you may want to filter out health checks.

## What is tail-based sampling?

Tail-based sampling is where the decision to sample a trace happens _after_ all
the spans in a request have been completed. This is in contrast to head-based
sampling, where the decision is made at the _beginning_ of a request when the
root span begins processing. Tail-based sampling gives you the option to filter
your traces based on specific criteria, which isn’t an option with head-based
sampling.

![Illustration shows how spans originate from a root span. After the spans are complete, the tail sampling processor makes a sampling decision.](tail_sampling_process.png)

Tail sampling lets you see only the traces that are of interest to you. You also
lower data ingest and storage costs because you’re only exporting a
predetermined subset of your traces. For instance, as an app developer, I may
only be interested in traces with errors or latency for debugging.
