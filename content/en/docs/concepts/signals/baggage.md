---
title: Baggage
weight: 4
description: Contextual information that is passed between signals.
---

In OpenTelemetry, Baggage is contextual information that resides next to
context. Baggage is a key-value store, which means it lets you
[propagate](../../context-propagation/#propagation) any data you like alongside
[context](../../context-propagation/#context).

Baggage means you can pass data across services and processes, making it
available to add to [traces](../traces/), [metrics](../metrics/), or
[logs](../logs/) in those services.

## Example

Baggage is often used in tracing to propagate additional data across services.

For example, imagine you have a `clientId` at the start of a request, but you'd
like for that ID to be available on all spans in a trace, some metrics in
another service, and some logs along the way. Because the trace may span
multiple services, you need some way to propagate that data without copying the
`clientId` across many places in your codebase.

By using [Context Propagation](../traces/#context-propagation) to pass baggage
across these services, the `clientId` is available to add to any additional
spans, metrics, or logs. Additionally, instrumentations automatically propagate
baggage for you.

![OTel Baggage](../otel-baggage.svg)

## What should OTel Baggage be used for?

Baggage is best used to include information typically available only at the
start of a request further downstream. This can include things like Account
Identification, User IDs, Product IDs, and origin IPs, for example.

Propagating this information using baggage allows for deeper analysis of
telemetry in a backend. For example, if you include information like a User ID
on a span that tracks a database call, you can much more easily answer questions
like "which users are experiencing the slowest database calls?" You can also log
information about a downstream operation and include that same User ID in the
log data.

![OTel Baggage](../otel-baggage-2.svg)

## Baggage security considerations

Sensitive Baggage items can be shared with unintended resources, like
third-party APIs. This is because automatic instrumentation includes Baggage in
most of your service’s network requests. Specifically, Baggage and other parts
of trace context are sent in HTTP headers, making it visible to anyone
inspecting your network traffic. If traffic is restricted within your network,
then this risk may not apply, but keep in mind that downstream services could
propagate Baggage outside your network.

Also, there are no built-in integrity checks to ensure that Baggage items are
yours, so exercise caution when reading them.

## Baggage is not the same as attributes

An important thing to note about baggage is that it is a separate key-value
store and is unassociated with attributes on spans, metrics, or logs without
explicitly adding them.

To add baggage entries to attributes, you need to explicitly read the data from
baggage and add it as attributes to your spans, metrics, or logs.

Because a common use cases for Baggage is to add data to
[Span Attributes](../traces/#attributes) across a whole trace, several languages
have Baggage Span Processors that add data from baggage as attributes on span
creation.

> For more information, see the [baggage specification].

[baggage specification]: /docs/specs/otel/overview/#baggage-signal
