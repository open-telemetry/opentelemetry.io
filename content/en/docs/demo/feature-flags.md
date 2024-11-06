---
title: Feature Flags
aliases:
  - feature_flags
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: loadgenerator OLJCESPC7Z
---

The demo provides several feature flags that you can use to simulate different
scenarios. These flags are managed by [`flagd`](https://flagd.dev), a simple
feature flag service that supports [OpenFeature](https://openfeature.dev).

Flag values can be changed through the user interface provided at
<http://localhost:8080/feature> when running the demo. Changing the values
through this user interface will be reflected in the flagd service.

There are two options when it comes to changing the feature flags through the
user interface:

- **Basic View**: A user friendly view in which default variants (the same
  options that need to be changed when configuring through the raw file) can be
  selected and saved for each feature flag. Currently, the basic view does not
  support fractional targeting.

- **Advanced View**: A view in which the raw configuration JSON file is loaded
  and can be edited within the browser. The view provides the flexibility that
  comes with editing a raw JSON file, however it also provides schema checking
  to ensure that the JSON is valid and that the provided configuration values
  are correct.

## Implemented feature flags

| Feature Flag                        | Service(s)       | Description                                                                                               |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`                  | Ad Service       | Generate an error for `GetAds` 1/10th of the time                                                         |
| `adServiceManualGc`                 | Ad Service       | Trigger full manual garbage collections in the ad service                                                 |
| `adServiceHighCpu`                  | Ad Service       | Trigger high cpu load in the ad service. If you want to demo cpu throttling, set cpu resource limits      |
| `cartServiceFailure`                | Cart Service     | Generate an error whenever `EmptyCart` is called                                                          |
| `productCatalogFailure`             | Product Catalog  | Generate an error for `GetProduct` requests with product ID: `OLJCESPC7Z`                                 |
| `recommendationServiceCacheFailure` | Recommendation   | Create a memory leak due to an exponentially growing cache. 1.4x growth, 50% of requests trigger growth.  |
| `paymentServiceFailure`             | Payment Service  | Generate an error when calling the `charge` method.                                                       |
| `paymentServiceUnreachable`         | Checkout Service | Use a bad address when calling the PaymentService to make it seem like the PaymentService is unavailable. |
| `loadgeneratorFloodHomepage`        | Loadgenerator    | Start flooding the homepage with a huge amount of requests, configurable by changing flagd JSON on state. |
| `kafkaQueueProblems`                | Kafka            | Overloads Kafka queue while simultaneously introducing a consumer side delay leading to a lag spike.      |
| `imageSlowLoad`                     | Frontend         | Utilizes envoy fault injection, produces a delay in loading of product images in the frontend.            |

## Feature Flag Architecture

Please see the [flagd documentation](https://flagd.dev) for more information on
how flagd works, and the [OpenFeature](https://openfeature.dev) website for more
information on how OpenFeature works, along with documentation for the
OpenFeature API.
