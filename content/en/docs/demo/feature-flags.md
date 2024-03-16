---
title: Feature Flags
aliases:
  - feature_flags
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: flagd OLJCESPC7Z
---

The demo provides several feature flags that you can use to simulate different
scenarios. These flags are managed by [`flagd`](https://flagd.dev), a simple
feature flag service that supports [OpenFeature](https://openfeature.dev). Flag
values are stored in the `demo.flagd.json` file. To enable a flag, change the
`defaultVariant` value in the config file for a given flag to "on".

| Feature Flag                | Service(s)       | Description                                                                                               |
| --------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`          | Ad Service       | Generate an error for `GetAds` 1/10th of the time                                                         |
| `cartServiceFailure`        | Cart Service     | Generate an error for `EmptyCart` 1/10th of the time                                                      |
| `productCatalogFailure`     | Product Catalog  | Generate an error for `GetProduct` requests with product id: `OLJCESPC7Z`                                 |
| `recommendationCache`       | Recommendation   | Create a memory leak due to an exponentially growing cache. 1.4x growth, 50% of requests trigger growth.  |
| `paymentServiceFailure`     | Payment Service  | Generate an error when calling the `charge` method                                                        |
| `paymentServiceUnreachable` | Checkout Service | Use a bad address when calling the PaymentService to make it seem like the PaymentService is unavailable. |

## Feature Flag Architecture

Please see the [flagd documentation](https://flagd.dev) for more information on
how flagd works, and the [OpenFeature](https://openfeature.dev) website for more
information on how OpenFeature works, along with documentation for the
OpenFeature API.
