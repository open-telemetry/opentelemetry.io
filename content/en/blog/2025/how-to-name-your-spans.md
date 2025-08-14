---
title: How to Name Your Spans
linkTitle: How to Name Your Spans
date: 2025-08-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-spans
cSpell:ignore: aggregability Aggregable jpkrohling OllyGarden SemConv
---

One of the most fundamental yet often overlooked aspects of good instrumentation
is naming. This post is the first in a series dedicated to the art and science
of naming things in OpenTelemetry. We'll start with spans, the building blocks
of a distributed trace, and give you the most important takeaway right at the
beginning: how to name the spans that describe your unique business logic.

## Naming your business spans

While OpenTelemetry's automatic instrumentation is fantastic for covering
standard operations (like incoming HTTP requests or database calls), the most
valuable insights often come from the custom spans you add to your own business
logic. These are the operations unique to your application's domain.

For these custom spans, we recommend a pattern that borrows from basic grammar.
Simple, clear sentences often follow a subject -> verb -> direct object
structure. The "subject" (the service performing the work) is already part of
the trace's context. We can use the rest of that structure for our span name:

## {verb} {object}

This pattern is descriptive, easy to understand, and helps maintain low
[cardinality](/docs/concepts/glossary/#cardinality)—a crucial concept we'll
touch on later.

- **{verb}**: A verb describing the work being done (for example: process, send,
  calculate, render).
- **{object}**: A noun describing what is being acted upon (for example:
  payment, invoice, shopping_cart, ad).

Let's look at some examples:

| Bad Name                           | Good Span Name      | Why It's Better                                                                    |
| :--------------------------------- | :------------------ | :--------------------------------------------------------------------------------- |
| process_payment_for_user_jane_doe  | process payment     | The verb and object are clear. The user ID belongs in an attribute.                |
| send*invoice*#98765                | send invoice        | Aggregable. You can easily find the P95 latency for sending all invoices.          |
| render_ad_for_campaign_summer_sale | render ad           | The specific campaign is a detail, not the core operation. Put it in an attribute. |
| calculate_shipping_for_zip_90210   | calculate shipping  | The operation is consistent. The zip code is a parameter, not part of the name.    |
| validation_failed                  | validate user_input | Focus on the operation, not the outcome. The result belongs in the span's status.  |

By adhering to the `{verb} {object}` format, you create a clear, consistent
vocabulary for your business operations. This makes your traces incredibly
powerful. A product manager could ask, "How long does it take to process
payments?" and an engineer can immediately filter for those spans and get an
answer.

## Why this pattern works

So why is `process payment` good and `process*invoice*#98765` bad? The reason is
**cardinality**.

Cardinality refers to the number of unique values a piece of data can have. A
span name should have **low cardinality**. If you include unique identifiers
like a user ID or an invoice number in the span name, you will create a unique
name for every single operation. This floods your observability backend, makes
it impossible to group and analyze similar operations, and can significantly
increase costs.

The `{verb} {object}` pattern naturally produces low-cardinality names. The
unique, high-cardinality details (`invoice\_#98765, user_jane_doe`) belong in
**span attributes**, which we will cover in a future blog post.

## Learning from Semantic Conventions

This `{verb} {object}` approach isn't arbitrary. It's a best practice that
reflects the principles behind the official **OpenTelemetry Semantic Conventions
(SemConv)**. SemConv provides a standardized set of names for common operations,
ensuring that a span for an HTTP request is named consistently, regardless of
the language or framework.

When you look closely, you'll see this same pattern of describing an operation
on a resource echoed throughout the conventions. By following it for your custom
spans, you are aligning with the established philosophy of the entire
OpenTelemetry ecosystem.

Let's look at a few examples from SemConv.

### HTTP spans

For server-side HTTP spans, the convention is `{method} {route}`.

- **Example:** `GET /api/users/:ID`
- **Analysis:** This is a verb (`GET`) acting on an object (`/api/users/:id`).
  The use of a route template instead of the actual path (`/api/users/123`) is a
  perfect example of maintaining low cardinality.

### Database spans

Database spans are often named `{db.operation} {db.name}.{db.sql.table}`.

- **Example:** `INSERT my_database.users`
- **Analysis:** This is a verb (`INSERT`) acting on an object
  (`my_database`.users). The specific values being inserted are high-cardinality
  and are rightly excluded from the name.

### RPC spans

For Remote Procedure Calls, the convention is `{rpc.service}/{rpc.method}`.

- **Example:** `com.example.UserService/GetUser`
- **Analysis:** While the format is different, the principle is the same. It
  describes a method (`GetUser`), which is a verb, within a service
  (`com.example.UserService`), which is the object or resource.

The key takeaway is that by using `{verb} {object}`, you are speaking the same
language as the rest of your instrumentation.

## Cultivating a healthy system

Naming spans is not a trivial task. It's a foundational practice for building a
robust and effective observability strategy. By adopting a clear, consistent
pattern like `{verb} {object}` for your business-specific spans, you can
transform your telemetry data from a tangled mess into a well-tended garden.

A well-named span is a gift to your future self and your team. It provides
clarity during stressful outages, enables powerful performance analysis, and
ultimately helps you build better, more reliable software.

In our next post in this series, we will dig into the next layer of detail:
**span attributes**. We'll explore how to add the rich, high-cardinality context
to your spans that is necessary for deep debugging, without compromising the
aggregability of your span names.
