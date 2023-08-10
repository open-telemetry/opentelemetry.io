---
title: Tests
---

Currently, the repository includes E2E tests for both the frontend and backend
services. For the Frontend we are using [Cypress](https://www.cypress.io/)
execute the different flows in the web store. While the backend services use
[AVA](https://avajs.dev) as the main testing framework for black-box tests and
[Tracetest](https://tracetest.io/) for trace-based tests.

To run the test you can simply run `make run-tests` at the root directory.

In case you need to run a specific suite of tests you can execute
`docker compose run frontendTests`[^1] for the frontend tests or
`docker compose run integrationTests`[^1]
and `docker compose run traceBasedTests`[^1] for the backend tests
(integration and trace-based tests).

[^1]: {{% _param notes.docker-compose-v2 %}}
