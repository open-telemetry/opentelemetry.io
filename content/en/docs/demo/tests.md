---
title: Tests
cSpell:ignore: Tracetest
---

Currently, the repository includes E2E tests for both the frontend and backend
services. For the Frontend we are using [Cypress](https://www.cypress.io/)
execute the different flows in the web store. While the backend services use
[AVA](https://avajs.dev) as the main testing framework for integration tests and
[Tracetest](https://tracetest.io/) for trace-based tests.

To run all the tests, execute `make run-tests` from the root directory.

Otherwise, if you want to run a specific suite of tests you can execute specific
commands for each type of test[^1]:

- **Frontend tests**: `docker compose run frontendTests`
- **Backend tests**:
  - Integration: `docker compose run integrationTests`
  - Trace-based: `docker compose run traceBasedTests`

To learn more these tests, see 
[Service Testing](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test).

[^1]: {{% _param notes.docker-compose-v2 %}}
