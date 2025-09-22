---
title: Testes
cSpell:ignore: Tracetest
---

Atualmente, o repositório inclui testes E2E para os serviços de frontend e
backend. Para o Frontend, usamos o [Cypress](https://www.cypress.io/) para
executar os diferentes fluxos na loja web. Já os serviços de backend usam
[AVA](https://avajs.dev) como framework principal para testes de integração e
[Tracetest](https://tracetest.io/) para testes baseados em rastros.

Para executar todos os testes, rode `make run-tests` a partir do diretório raiz.

Caso queira executar uma suíte específica de testes, você pode usar os comandos
abaixo para cada tipo de teste[^1]:

- **Testes de Frontend**: `docker compose run frontendTests`
- **Testes de Backend**:
  - Integração: `docker compose run integrationTests`
  - Baseado em rastros: `docker compose run traceBasedTests`

Para saber mais sobre esses testes, veja
[Service Testing](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test).

[^1]: {{% param notes.docker-compose-v2 %}}
