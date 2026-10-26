---
title: Функції сайту
description: >-
  Короткі описи помітних функцій сайту з посиланнями на їх основні
  джерела.
weight: 20
default_lang_commit: a6baba3949511d954f735b7268549b05f7f78339
cSpell:ignore: otelwebtelemetry
---

## Подача контенту, зручна для агентів {#agent-friendly-content-delivery}

Спростити агентам пошук та використання контенту сайту. У рамках поточної роботи додається вивід у форматі Markdown для сторінок контенту та HTTP-переговори для `Accept: text/markdown`.

- Статус: у процесі
- Дизайн: [Підтримка агентів](../design/agent-support/)
- Реалізація: у файлі `netlify/edge-functions/markdown-negotiation.ts` з текою для логіки та тестів.
- Посилання: [opentelemetry.io#9449](https://github.com/open-telemetry/opentelemetry.io/issues/9449), [docsy#2596](https://github.com/docsy/docsy/issues/2596)

## Телеметрія вебсайту {#website-telemetry}

> [!NOTE]
>
> Телеметрію вебсайту призупинено, доки не буде готовий новий збирач проєкту ([#9559][]). Цей запис описує функцію, як її спроєктовано.

Сайт інструментує завантаження сторінок, взаємодії користувача та виклики `fetch`/XHR за допомогою OpenTelemetry JS SDK. Відрізки експортуються через OTLP до `otelwebtelemetry.com` і виводяться в консолі вебоглядача.

Код телеметрії (трасувальника) увімкнено для збірок Netlify: виробничих, deploy preview та розгортання гілок; власний сайт Netlify форку не трасується.

- Статус: активний
- Дизайн: [Телеметрія вебсайту](/site/design/telemetry/)
- Реалізація: [`assets/js/tracing.js`][], завантажується через `layouts/_partials/hooks/body-end.html`
- Локальна збірка: [Збірка та запуск](../build/npm-scripts/#build-and-serve)

<!-- prettier-ignore-start -->
[#9559]: https://github.com/open-telemetry/opentelemetry.io/issues/9559
[`assets/js/tracing.js`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/assets/js/tracing.js
<!-- prettier-ignore-end -->
