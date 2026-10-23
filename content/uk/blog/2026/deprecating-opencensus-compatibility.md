---
title: Припинення підтримки вимог сумісності з OpenCensus
linkTitle: Припинення підтримки сумісності з OpenCensus
date: 2026-06-23
author: '[Krishna Chaitanya Balusu](https://github.com/Krishnachaitanyakc)'
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/5138
sig: Specification
default_lang_commit: 36a02944fe801017121e38aa3773a6476ab493f6
cSpell:ignore: Balusu Chaitanya Krishna
---

12 червня 2026 року проєкт OpenTelemetry Specification виконав злиття [PR #5138](https://github.com/open-telemetry/opentelemetry-specification/pull/5138), який позначає як застарілі вимоги щодо сумісності з OpenCensus у специфікації.

Ця зміна оновлює специфікацію відповідно до того стану, у якому екосистема вже перебуває: [OpenCensus перебуває в архіві з 31 липня 2023 року](/blog/2023/sunsetting-opencensus/), а прошарки сумісності (shims) OpenTelemetry для OpenCensus уже понад три роки слугують стабільним мостом для міграції.

Ідеться про визнання застарілими вимог специфікації, а не про негайне вилучення матеріалів щодо сумісності та не про вимогу одразу прибирати наявні артефакти прошарків.

## Що змінюється? {#what-is-changing}

- Вимоги щодо сумісності з OpenCensus у специфікації позначено як застарілі.
- Реалізація нової сумісності з OpenCensus більше не є обовʼязковою для нових SDK чи реалізацій.
- Наявні прошарки сумісності OpenCensus МОЖУТЬ і надалі підтримуватися для зворотної сумісності протягом періоду визнання застарілими.
- Нова робота має орієнтуватися на нативні API, SDK OpenTelemetry та робочі процеси на основі OTLP, а не на запровадження нових залежностей від OpenCensus.

## Чому саме зараз? {#why-now}

OpenCensus було заархівовано в липні 2023 року, і впровадження в екосистемі зійшлося на нативних API OpenTelemetry та робочих процесах на основі OTLP. У проєкту також є прецедент такого поетапного підходу з попередньої роботи щодо визнання застарілим, зокрема [закриття репозиторіїв OpenCensus у 2023 році](/blog/2023/sunsetting-opencensus/), [визнання застарілим експортера Zipkin](/blog/2025/deprecating-zipkin-exporters/) ([PR у специфікації #4715](https://github.com/open-telemetry/opentelemetry-specification/pull/4715)) та [визнання застарілою сумісності з OpenTracing](/blog/2026/deprecating-opentracing-compatibility/) ([PR у специфікації #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938)).

## Графік і політика {#timeline-and-policy}

- **Визнання застарілим у специфікації**: набирає чинності з **червня 2026 року**.
- **Найраніше вилучення зі специфікації**: **не раніше червня 2027 року**, як зазначено в тексті злитої специфікації.
- **Підтримка прошарків сумісності**: наявні прошарки сумісності OpenCensus продовжуватимуть отримувати супровід щонайменше один рік, відповідно до [гарантій стабільності SDK OpenTelemetry](/docs/specs/otel/versioning-and-stability/#sdk-support).

## Що робити користувачам? {#what-should-users-do}

Якщо ви досі залежите від прошарку сумісності OpenCensus, зараз слушний час спланувати міграцію на нативні API та SDK OpenTelemetry.

Почніть з ознайомлення з:

- [Як мігрувати на OpenTelemetry](/blog/2023/sunsetting-opencensus/#how-to-migrate-to-opentelemetry) з оголошення про закриття 2023 року.
- [Специфікація сумісності з OpenCensus — шлях міграції](/docs/specs/otel/compatibility/opencensus/#migration-path).
- Прошарки сумісності для конкретних мов: [Go](https://github.com/open-telemetry/opentelemetry-go/tree/928d4f3726bf08e5be046752ebae169ad9f9376a/bridge/opencensus), [Java](https://github.com/open-telemetry/opentelemetry-java/tree/a5cd87f127cd8d4e5845bc1e29360f815a6f01c8/opencensus-shim), [JavaScript](https://github.com/open-telemetry/opentelemetry-js/tree/13a035bc695996cf4aec885fef7b9866f48bc555/experimental/packages/shim-opencensus) та [Python](https://github.com/open-telemetry/opentelemetry-python/tree/51c1d1888c4045b8296e088fa307738685321bf3/shim/opentelemetry-opencensus-shim).

## Підсумок {#closing}

Визнання застарілим тут не означає негайного вилучення матеріалів щодо сумісності з OpenCensus. Ідеться про закріплення того, що нові SDK та інструменталізації мають орієнтуватися на нативні API OpenTelemetry та OTLP, а також про приведення специфікації у відповідність до того стану, у якому екосистема вже перебуває.

Будь ласка, діліться відгуками або перешкодами для міграції в [PR у специфікації #5138](https://github.com/open-telemetry/opentelemetry-specification/pull/5138) або у [вихідному issue #5109](https://github.com/open-telemetry/opentelemetry-specification/issues/5109).
