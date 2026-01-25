---
title: Tests
cSpell:ignore: Tracetest
default_lang_commit: b588b7136fb0f6fb7cf569e65479238e3e2eefc8
---

Actualmente, el repositorio incluye tests E2E tanto para los servicios de
frontend como de backend. Para el Frontend estamos usando
[Cypress](https://www.cypress.io/) para ejecutar los diferentes flujos en la
tienda web. Mientras que los servicios de backend usan
[AVA](https://avajs.dev) como el framework principal de testing para tests de
integración y [Tracetest](https://tracetest.io/) para tests basados en trazas.

Para ejecutar todos los tests, ejecuta `make run-tests` desde el directorio
raíz.

De lo contrario, si quieres ejecutar un conjunto específico de tests puedes
ejecutar comandos específicos para cada tipo de test[^1]:

- **Tests de Frontend**: `docker compose run frontendTests`
- **Tests de Backend**:
  - Integración: `docker compose run integrationTests`
  - Basados en trazas: `docker compose run traceBasedTests`

Para aprender más sobre estos tests, consulta
[Service Testing](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test).

[^1]: {{% param notes.docker-compose-v2 %}}
