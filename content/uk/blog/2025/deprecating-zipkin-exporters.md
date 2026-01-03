---
title: Припинення підтримки Zipkin Exporter
linkTitle: Припинення підтримки Zipkin Exporter
date: 2025-12-01
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs)
sig: Specification
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/4715
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: Liudmila Molkova
---

Проєкт OpenTelemetry припиняє підтримку специфікації експортера Zipkin на користь [підтримки імпорту OTLP від Zipkin](https://github.com/openzipkin-contrib/zipkin-otel).

Дякуємо всім учасникам Zipkin за допомогу OpenTelemetry у досягненні цього важливого етапу!

Проаналізувавши моделі використання в різних мовних екосистемах, ми помітили, що спільнота значно тяжіє до OTLP, а експортери Zipkin використовуються обмежено — у декількох мовах навіть менше, ніж вже застарілий експортер Jaeger. З огляду на мінімальну зацікавленість користувачів у повʼязаних питаннях та наявність альтернатив, ми вважаємо, що зараз саме час припинити використання експортерів Zipkin в SDK OTel.

## Графік та шлях міграції {#timeline-and-migration-path}

- **Виведення специфікації з обігу**: Набирає чинності з грудня 2025 року.
- **Підтримка SDK**: Наявні стабільні експортери Zipkin продовжуватимуть отримувати виправлення безпеки та виправлення критичних помилок щонайменше до **грудня 2026 року**, відповідно до [гарантій стабільності SDK](/docs/specs/otel/versioning-and-stability/#sdk-support).
- **Нові SDK**: для нових мовних SDK не потрібно впроваджувати експортер Zipkin.

## Що повинні робити користувачі? {#what-should-users-do}

Якщо ви зараз використовуєте експортер Zipkin, у вас є два шляхи міграції:

- **Перейти на OTLP** (рекомендовано): налаштуйте свій застосунок для надсилання трасування за допомогою OTLP і увімкніть [підтримку OTLP у Zipkin](https://github.com/openzipkin-contrib/zipkin-otel).
- **Використовуйте колектор**: направляйте свої дані OTLP через колектор OpenTelemetry за допомогою його [експортера Zipkin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/zipkinexporter).

## Питання? {#questions}

Зверніться до каналу [#otel-specification](https://cloud-native.slack.com/archives/C01N7PP1THC) у CNCF Slack або створіть запит у репозиторії [opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification).
