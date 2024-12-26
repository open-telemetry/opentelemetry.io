---
title: Функції сайту
description: >-
  Короткі описи помітних функцій сайту з посиланнями на їх основні
  джерела.
weight: 20
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
---

## Подача контенту, зручна для агентів {#agent-friendly-content-delivery}

Спростити агентам пошук та використання контенту сайту. У рамках поточної роботи додається вивід у форматі Markdown для сторінок контенту та HTTP-переговори для
`Accept: text/markdown`.

- Статус: у процесі
- Дизайн: [Підтримка агентів](../design/agent-support/)
- Реалізація: у файлі `netlify/edge-functions/markdown-negotiation.ts` з текою для логіки та тестів.
- Посилання: [opentelemetry.io#9449](https://github.com/open-telemetry/opentelemetry.io/issues/9449), [docsy#2596](https://github.com/google/docsy/issues/2596)
