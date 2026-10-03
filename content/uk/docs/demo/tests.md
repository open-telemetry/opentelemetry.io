---
title: Тести
default_lang_commit: df7ca870f2ec59453948ced42ca0d76bfd5e53d5
cSpell:ignore: pytest
---

Репозиторій демо включає два набори end-to-end тестів, обидва запускаються через `make` з кореневої теки.

## Фронтенд тести {#frontend-tests}

Фронтенд тести використовують [Cypress](https://www.cypress.io/), щоб виконувати основні потоки вебмагазину: перегляд головної сторінки, відкриття сторінки товару та завершення оформлення замовлення. Вони запускаються для вже запущеного демо:

```shell
make run-frontend-tests
```

## Тести телеметрії {#telemetry-tests}

Тести телеметрії — це контейнеризований набір [pytest](https://docs.pytest.org/), який перевіряє, що кожен сервіс дійсно доставляє сигнали, які він має доставляти. Замість безпосередньої перевірки сервісів, набір запитує бекенди, з якими постачається демо: Jaeger для трасувань, Prometheus для метрик та OpenSearch для логів. Які сигнали має випромінювати кожен сервіс, оголошено у [`test/telemetry/services.py`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/services.py).

Кожна з цих цілей запускає демо, виконує набір тестів і знову зупиняє демо, тому запускайте їх, коли демо зупинено:

```shell
make run-telemetry-tests           # усі сервіси
make run-telemetry-tests-minimal   # лише мінімальний режим
make run-telemetry-tests-agentic   # агент, mcp та чатбот
```

Щоб дізнатися більше, дивіться [Тести перевірки телеметрії](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test/telemetry).
