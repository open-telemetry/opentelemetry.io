---
title: "Baggage"
description: >-
 Baggage refers to contextual information that’s passed between spans
weight: 4
---

Imagine you want to have a `CustomerId` attribute on every span in your trace,
which involves multiple services; however, `CustomerId` is only available in one
specific service. To accomplish your goal, you can use OpenTelemetry Baggage to
propagate this value across your system.

In OpenTelemetry, "Baggage" refers to contextual information that’s passed
between spans. It's a key-value store that resides within a trace context,
making values available to any span created within that trace.

OpenTelemetry uses [Context Propagation](/docs/concepts/signals/traces/#context-propagation) to pass Baggage
around, and each of the different library implementations has propagators that
will parse and make that Baggage available without you needing to explicitly
implement it.

![OTel Baggage](/img/otel_baggage.png)

## Why does OTel Baggage exist?

OpenTelemetry is cross-platform and cross-framework. Baggage makes it such that
the context values live in the same place, have the same format, and follow the
same pattern. That means that all your applications, no matter what the
language, will be able to read them, parse them, and use them. This is important
when you’re building a large-scale distributed system, and you want to provide
autonomy to teams to work in whatever language or framework they want.

While it is completely possible to use something else for this (e.g.,
standardizing on headers and whatnot, in your organization), it puts the burden
on development teams to build helpers in every framework and language, which can
unintentionally get neglected when other higher-priority items come up.

## What should OTel Baggage be used for?

OTel Baggage should be used for non-sensitive data that you're okay with
potentially exposing to third parties.

Common use cases include information that’s only accessible further up a stack.
This can include things like Account Identification, User Ids, Product Ids, and
origin IPs, for example. Passing these down your stack allows you to then add
them to your Spans in downstream services to make it easier to filter when
you’re searching in your Observability back-end.

There are no built-in integrity checks to ensure that the Baggage items are
yours, so exercise caution when working with Baggage.

![OTel Baggage](/img/otel_baggage-2.png)

## Baggage != Span attributes

One important thing to note about Baggage is that it is not a subset of the
[Span Attributes](/docs/concepts/signals/traces/#attributes). When you add something as Baggage, it does not
automatically end up on the Attributes of the child system’s spans. You must
explicitly take something out of Baggage and append it as Attributes.

```csharp
var accountId = Baggage.GetBaggage("AccountId");
Activity.Current?.SetTag("AccountId", accountId);
```

> For more information, see the [baggage specification][].

[baggage specification]: /docs/reference/specification/overview/#baggage-signal
