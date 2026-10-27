---
title:
  'Preserving telemetry when rewriting the recommendation service in Spring Boot
  4'
linkTitle: Preserving telemetry in a service rewrite
date: 2026-10-23
author: '[Aditya Reddy](https://github.com/adityareddy-dev)'
issue: 12100
sig: SIG Demo
cSpell:ignore: Aditya
---

The OpenTelemetry Demo's recommendation service now has a Java implementation
built on Spring Boot 4. The rewrite replaced Python, though the frontend still
calls the same gRPC API and the service still asks the product catalog for
products. A customer looking at a product should get the same recommendations
that they would before the change.

Preserving those recommendations exposed a detail the protobuf contract alone
would not tell you. The frontend was sending product IDs as one repeated element
per character. The old service joined those characters and split the result on
commas. A rewrite that accepted only complete IDs could serve a valid gRPC
response and still recommend the product already on the screen, which the old
service never did.

I kept that behavior in the
[merged rewrite](https://github.com/open-telemetry/opentelemetry-demo/pull/3966).
The same question applied to telemetry: what does the surrounding demo already
depend on, and how do we check that it survives a new implementation?

## Choosing the instrumentation path

The
[recommendation service README](https://github.com/open-telemetry/opentelemetry-demo/blob/c7b195f4f0a866bd89ceeff3d662df43e2fe69b9/src/recommendation/README.md)
says the Java agent remains the default choice for Spring Boot applications. The
recommendation service uses the Spring Boot starter so the demo can show another
way to instrument Java. It does not need a Java agent attached to its process.

That choice leaves some wiring in the application. In this implementation, the
starter supplies the OpenTelemetry instance and the gRPC instrumentation library
supplies client and server interceptors. Spring gRPC's global interceptor
annotations register them with the client and server. Adding the starter
dependency alone would leave out this explicit gRPC setup.

The
[configuration](https://github.com/open-telemetry/opentelemetry-demo/blob/c7b195f4f0a866bd89ceeff3d662df43e2fe69b9/src/recommendation/src/main/java/oteldemo/recommendation/GrpcTelemetryConfiguration.java)
creates one `GrpcTelemetry` from the injected `OpenTelemetry`, then exposes the
server and client interceptors as beans. Keeping the configuration together
makes it possible to inspect both sides of the RPC boundary without searching
through the recommendation logic.

This distinction matters when moving between instrumentation approaches. A
working SDK and exporter do not establish that every protocol used by the
application has instrumentation attached.

## Keeping the application telemetry

The service creates a `get_product_list` span around the work of fetching and
selecting products. It makes that span current while the work runs, records
runtime exceptions and ends the span in a `finally` block. The catalog call
happens inside that scope.

The
[implementation](https://github.com/open-telemetry/opentelemetry-demo/blob/c7b195f4f0a866bd89ceeff3d662df43e2fe69b9/src/recommendation/src/main/java/oteldemo/recommendation/RecommendationService.java)
also retains the demo attributes for product counts, the filtered list and the
cache flag. These describe the work inside the request, beyond the RPC duration.

There is a small naming trap in the metric. `demo.recommendation.requests` is a
counter, but the code adds the number of products recommended, with
`recommendation.type` set to `catalog`. A request returning five recommendations
adds five. Preserving the name while changing the increment to one would change
what the metric means.

A migration review needs to look at those operations as well as the emitted
names. Otherwise a dashboard can continue receiving data while its
interpretation changes.

## Preserving the awkward behavior

The product-ID conversion accepts both the character elements sent by the
frontend and complete IDs sent by other clients. The
[service tests](https://github.com/open-telemetry/opentelemetry-demo/blob/c7b195f4f0a866bd89ceeff3d662df43e2fe69b9/src/recommendation/src/test/java/oteldemo/recommendation/RecommendationServiceTests.java)
exercise the frontend representation. That keeps a compatibility detail from
becoming an assumption buried in a comment.

The cache has a different reason to stay awkward. The
`recommendationCacheFailure` flag deliberately enables a growing cache. On a
miss, it appends catalog IDs and then copies a quarter of the accumulated cache
back into itself. The service deduplicates the IDs when selecting
recommendations, so the response can still look reasonable while the stored list
grows.

Cleaning up that cache during the rewrite would remove a failure scenario the
demo is meant to expose. The implementation keeps the cache attributes on the
application span, including whether the cache was hit and the product count. The
tests turn the flag on and inspect the corresponding telemetry.

This is one place where a demo migration differs from ordinary cleanup. The
broken behavior is part of the example people are trying to observe.

## Testing the response and the telemetry together

The service tests use an in-memory span exporter and metric reader, along with a
fake product catalog. That lets them check the recommendation response and the
emitted telemetry within the same test setup.

The checks include the server span, the internal product-list span and the
catalog client span. They inspect trace relationships and application
attributes, and compare the counter before and after a request. A test that only
asserted a successful response would miss those regressions.

There is also a timing detail: the server span can finish after the client
receives its response. The test waits for the expected span with a bounded
timeout. Reading the exporter immediately after the RPC would make the assertion
depend on when the server finished exporting.

These tests cover the service boundary with a fake dependency. For a full demo
migration, the frontend and catalog trace and the exported signals in the
running stack need their own inspection, cause a local exporter cannot establish
that deployment configuration is correct.

## Reviewing the migration as a whole

The
[documentation change](https://github.com/open-telemetry/opentelemetry.io/pull/11667)
accompanies the implementation. That is where a reader learns which
instrumentation path the service uses. Leaving the documentation on the previous
language or implying that every Java service uses the agent would make the
example harder to follow.

For another service rewrite, I would start by listing the existing client
behavior and the meaning of each application signal. Those surprising parts
belong in compatibility and telemetry assertions: the representation the real
client sends, the counter's actual increment, and any failure behavior people
rely on the system to demonstrate. Those details are easy to lose while
translating the main request handler.
