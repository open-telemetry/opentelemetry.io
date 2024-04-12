---
title: Feature Flags
aliases:
  - feature_flags
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: flagd loadgenerator OLJCESPC7Z
---

The demo provides several feature flags that you can use to simulate different
scenarios. These flags are managed by [`flagd`](https://flagd.dev), a simple
feature flag service that supports [OpenFeature](https://openfeature.dev). Flag
values are stored in the `demo.flagd.json` file. To enable a flag, change the
`defaultVariant` value in the config file for a given flag to "on".

| Feature Flag                        | Service(s)       | Description                                                                                               |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`                  | Ad Service       | Generate an error for `GetAds` 1/10th of the time                                                         |
| `adServiceManualGc`                 | Ad Service       | Trigger full manual garbage collections in the ad service                                                 |
| `adServiceHighCpu`                  | Ad Service       | Trigger high cpu load in the ad service. If you want to demo cpu throttling, set cpu resource limits      |
| `cartServiceFailure`                | Cart Service     | Generate an error for `EmptyCart` 1/10th of the time                                                      |
| `productCatalogFailure`             | Product Catalog  | Generate an error for `GetProduct` requests with product id: `OLJCESPC7Z`                                 |
| `recommendationServiceCacheFailure` | Recommendation   | Create a memory leak due to an exponentially growing cache. 1.4x growth, 50% of requests trigger growth.  |
| `paymentServiceFailure`             | Payment Service  | Generate an error when calling the `charge` method.                                                       |
| `paymentServiceUnreachable`         | Checkout Service | Use a bad address when calling the PaymentService to make it seem like the PaymentService is unavailable. |
| `loadgeneratorFloodHomepage`        | Loadgenerator    | Start flooding the homepage with a huge amount of requests, configurable by changing flagd JSON on state. |

## Feature Flag Architecture

Please see the [flagd documentation](https://flagd.dev) for more information on
how flagd works, and the [OpenFeature](https://openfeature.dev) website for more
information on how OpenFeature works, along with documentation for the
OpenFeature API.
