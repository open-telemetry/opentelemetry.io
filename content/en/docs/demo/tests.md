---
title: Tests
---

Currently, the repository includes E2E tests for both the frontend and backend
services. For the Frontend we are using [Cypress](https://www.cypress.io/)
execute the different flows in the web store. While the backend services use
[AVA](https://avajs.dev) as the main testing framework for integration tests and
[Tracetest](https://tracetest.io/) for trace-based tests.

To run all the tests you can simply run `make run-tests` at the root directory.

Otherwise, if you want to run a specific suite of tests you can execute specific commands for each type of test:

- **Frontend tests**: `docker compose run frontendTests`[^1]
- **Backend tests (integration)**: `docker compose run integrationTests`[^1]
- **Backend tests (trace-based tests)**: `docker compose run traceBasedTests`[^1]

To know more details about these tests you can see them on the official repository, [here](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test).

[^1]: {{% _param notes.docker-compose-v2 %}}
