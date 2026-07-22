---
title: Load Generator
aliases: [loadgenerator]
cSpell:ignore: Chromium goroutines k6 loadgenerator OFREP vus xk6
---

The load generator creates simulated traffic to the demo using
[k6](https://k6.io/). By default it drives the frontend through the frontend
proxy, exercising the same routes a real user would.

[Load generator source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

The load test is defined in `script.js`; see the
[k6 documentation](https://grafana.com/docs/k6/latest/) for more on writing k6
scripts.

## Traffic mix

The HTTP scenario runs a pool of virtual users. On each iteration a virtual user
picks one task at random, weighted so that browsing dominates over checkout:

| Task                 | Weight |
| -------------------- | -----: |
| `index`              |      1 |
| `browseProduct`      |     10 |
| `getRecommendations` |      3 |
| `getAds`             |      3 |
| `viewCart`           |      3 |
| `addToCart`          |      2 |
| `checkout`           |      1 |
| `checkoutMulti`      |      1 |
| `floodHome`          |      5 |

Between iterations each virtual user sleeps for a random 1–10 seconds, mirroring
realistic user think time.

## Instrumentation

Because k6 has no built-in OpenTelemetry trace support, tracing and log
correlation are provided by a custom k6 extension,
[`xk6-otel`](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/load-generator/xk6-otel).
The Docker image is a custom k6 binary built with this extension. The script
imports it as `k6/x/otel` and uses its `Tracer` to create spans:

```javascript
import { Tracer } from 'k6/x/otel';

const tracer = new Tracer();

function browseProduct() {
  const product = randomChoice(products);
  const span = tracer.startSpan('user_browse_product', {
    'product.id': product,
  });
  http.get(`${BASE_URL}/api/products/${product}`, {
    headers: otelHeaders(span.traceParent()),
  });
  span.end();
}
```

`span.traceParent()` yields a `traceparent` header that is injected into each
outgoing HTTP request, so the synthetic traffic is linked to the traces produced
by the services it calls. The exporter endpoint, protocol, resource attributes,
and service name are configured through the standard
[OpenTelemetry environment variables](/docs/specs/otel/configuration/sdk-environment-variables/).

### Metrics

The `xk6-otel` extension also emits Go runtime metrics (memory, garbage
collection, goroutines) for the load generator process. Separately, k6's own
built-in test metrics (request rates, durations, and so on) are exported through
k6's native OpenTelemetry output, enabled with `--out opentelemetry` and
configured through the `K6_OTEL_*` environment variables.

## Baggage

The load generator marks its traffic as synthetic using OpenTelemetry Baggage.
Every request sets a `baggage` header containing `synthetic_request=true` (along
with the per-session `session.id`), so downstream spans can be distinguished
from organic traffic:

```javascript
function otelHeaders(traceParent, extra) {
  return Object.assign(
    {
      baggage: `synthetic_request=true,session.id=${sessionId}`,
      traceparent: traceParent,
    },
    extra,
  );
}
```

## Controlling traffic with feature flags

The load generator responds to several feature flags, evaluated through flagd's
[OFREP](https://openfeature.dev/specification/appendix-c/) endpoint (each
evaluation is recorded as its own span):

- **`loadGeneratorTraffic`**: pauses all synthetic traffic when turned off,
  checked every iteration with no restart required.
- **`loadGeneratorVUs`**: sets the number of concurrent virtual users for the
  HTTP scenario. Because k6 cannot resize a running virtual-user pool,
  `entrypoint.sh` polls flagd and restarts k6 with the new count only when the
  value changes. The count is passed to the script as `LOAD_GENERATOR_VUS`, not
  k6's reserved `K6_VUS` (which would make k6 discard the script's scenario
  configuration).
- **`loadGeneratorFloodHomepage`**: when greater than zero, the `floodHome` task
  sends that many rapid requests to the homepage.

## Browser traffic

An optional browser scenario drives a single headless Chromium session (currency
changes and add-to-cart flows) alongside the HTTP traffic. It is opt-in via
`K6_BROWSER_ENABLED` (off by default), since headless Chromium needs a relaxed
security context that many Kubernetes clusters do not grant. When enabled,
Chromium's executable path and launch arguments come from the
`K6_BROWSER_EXECUTABLE_PATH` and `K6_BROWSER_ARGS` environment variables.
