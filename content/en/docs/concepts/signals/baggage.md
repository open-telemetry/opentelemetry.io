---
title: Baggage
description: >-
  Baggage refers to contextual information that’s passed between spans.
weight: 4
---

In OpenTelemetry, Baggage is contextual information that’s passed between spans.
It's a key-value store that resides alongside span context in a trace, making
values available to any span created within that trace.

For example, imagine you want to have a `CustomerId` attribute on every span in
your trace, which involves multiple services; however, `CustomerId` is only
available in one specific service. To accomplish your goal, you can use
OpenTelemetry Baggage to propagate this value across your system.

OpenTelemetry uses
[Context Propagation](/docs/concepts/signals/traces/#context-propagation) to
pass Baggage around, and each of the different library implementations has
propagators that parse and make that Baggage available without you needing to
explicitly implement it.

![OTel Baggage](/img/otel_baggage.png)

## Why does OTel Baggage exist?

Baggage provides a uniform way to store and propagate information across a trace
and other signals. For example, you may want to attach information from your
application to a span and retrieve that information much later and use it later
on with another span. However, spans in opentelemetry are immutable once
created, and can be exported before you need information on them later on.
Baggage allows you to work around this problem by providing a place to store and
retrieve information.

## What should OTel Baggage be used for?

OTel Baggage should be used for non-sensitive data that you're okay with
potentially exposing to third parties. This is because it's stored in HTTP
headers alongside the current context.

Common use cases include information that’s only accessible further up a stack.
This can include things like Account Identification, User Ids, Product Ids, and
origin IPs, for example. Passing these down your stack allows you to then add
them to your Spans in downstream services to make it easier to filter when
you’re searching in your Observability back-end.

There are no built-in integrity checks to ensure that the Baggage items are
yours, so exercise caution when retrieving them.

![OTel Baggage](/img/otel_baggage-2.png)

## Baggage is not the same as Span attributes

One important thing to note about Baggage is that it is not a subset of the
[Span Attributes](/docs/concepts/signals/traces/#attributes). When you add
something as Baggage, it does not automatically end up on the Attributes of the
child system’s spans. You must explicitly take something out of Baggage and
append it as Attributes.

For example, in .NET you might do this:

```csharp
var accountId = Baggage.GetBaggage("AccountId");
Activity.Current?.SetTag("AccountId", accountId);
```

> For more information, see the [baggage specification][].

[baggage specification]: /docs/reference/specification/overview/#baggage-signal
