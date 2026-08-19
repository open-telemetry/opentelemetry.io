---
title: Feature Flags
aliases:
  - feature_flags
  - scenarios
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: OLJCESPC7Z
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

| Feature Flag                 | Service(s)                | Description                                                                                                                                 |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `adFailure`                  | Ad                        | Generate an error for `GetAds` 1/10th of the time                                                                                           |
| `adHighCpu`                  | Ad                        | Trigger high cpu load in the ad service. If you want to demo cpu throttling, set cpu resource limits                                        |
| `adManualGc`                 | Ad                        | Trigger full manual garbage collections in the ad service                                                                                   |
| `cartFailure`                | Cart                      | Send the selected percentage of `EmptyCart` calls to a failing cart store                                                                   |
| `emailMemoryLeak`            | Email                     | Simulate a memory leak in the `email` service. The variant sets how much each confirmation email body is padded.                            |
| `failedReadinessProbe`       | Cart                      | Force the readiness probe to fail with unhealthy status, simulating a pod "NotReady" condition. Applicable for Kubernetes deployments only. |
| `imageSlowLoad`              | Frontend                  | Utilizes envoy fault injection, produces a delay in loading of product images in the frontend. The variant sets the delay.                  |
| `intlShippingSlowdown`       | Shipping                  | Delay non-US shipping requests by the selected number of seconds, simulating overseas shipping latency. US addresses are unaffected.        |
| `kafkaQueueProblems`         | Checkout, Fraud Detection | Overloads Kafka queue while simultaneously introducing a consumer side delay leading to a lag spike.                                        |
| `loadGeneratorTraffic`       | Load Generator            | Enable synthetic traffic from the load generator. Turn it off to pause all load generator scenarios.                                        |
| `loadGeneratorVUs`           | Load Generator            | Number of concurrent virtual users driving the load generator's HTTP scenario. Changing it restarts k6 on the next poll.                    |
| `paymentFailure`             | Payment                   | Generate an error for the selected percentage of `charge` calls.                                                                            |
| `paymentUnreachable`         | Checkout                  | Use a bad address when calling the Payment service to make it seem like the Payment service is unavailable.                                 |
| `productCatalogFailure`      | Product Catalog           | Generate an error for `GetProduct` requests with product ID: `OLJCESPC7Z`                                                                   |
| `recommendationCacheFailure` | Recommendation            | Create a memory leak due to an exponentially growing cache. Roughly half of requests trigger growth.                                        |

## Guided Debugging Scenario

The `recommendationCacheFailure` scenario has a
[dedicated walkthrough document](recommendation-cache/) to help understand how
you can debug memory leaks with OpenTelemetry.

## Feature Flag Architecture

Please see the [flagd documentation](https://flagd.dev) for more information on
how flagd works, and the [OpenFeature](https://openfeature.dev) website for more
information on how OpenFeature works, along with documentation for the
OpenFeature API.
