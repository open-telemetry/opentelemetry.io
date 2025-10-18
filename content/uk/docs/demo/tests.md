---
title: Тести
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: Tracetest
---

Наразі репозиторій включає E2E тести для фронтенд та бекенд сервісів. Для фронтенду ми використовуємо [Cypress](https://www.cypress.io/), щоб виконувати різні потоки у вебмагазині. У той час як бекенд сервіси використовують [AVA](https://avajs.dev) як основний фреймворк для інтеграційних тестів та [Tracetest](https://tracetest.io/) для тестів на основі трасування.

Щоб запустити всі тести, виконайте `make run-tests` з кореневої теки.

Інакше, якщо ви хочете запустити конкретний набір тестів, ви можете виконати конкретні команди для кожного типу тестів[^1]:

- **Фронтенд тести**: `docker compose run frontendTests`
- **Бекенд тести**:
  - Інтеграційні: `docker compose run integrationTests`
  - На основі трасування: `docker compose run traceBasedTests`

Щоб дізнатися більше про ці тести, дивіться [Тестування сервісів](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test).

[^1]: {{% param notes.docker-compose-v2 %}}
