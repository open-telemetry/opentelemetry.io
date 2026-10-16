---
title: Tests
cSpell:ignore: pytest
---

The demo repository includes two end-to-end test suites, both run through `make`
from the root directory.

## Frontend tests

The frontend tests use [Cypress](https://www.cypress.io/) to drive the main web
store flows: browsing the home page, opening a product page, and completing a
checkout. They run against a demo that is already up:

```shell
make run-frontend-tests
```

## Telemetry tests

The telemetry tests are a containerized [pytest](https://docs.pytest.org/) suite
that checks each service actually delivers the signals it is supposed to. Rather
than inspecting the services directly, the suite queries the backends the demo
ships with: Jaeger for traces, Prometheus for metrics, and OpenSearch for logs.
Which signals each service is expected to emit is declared in
[`test/telemetry/services.py`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/services.py).

Each of these targets starts the demo, runs the suite, and stops the demo again,
so run them with the demo stopped:

```shell
make run-telemetry-tests           # all services
make run-telemetry-tests-minimal   # minimal mode only
make run-telemetry-tests-agentic   # agent, mcp, and chatbot
```

To learn more, see
[Telemetry Sanity Tests](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test/telemetry).
