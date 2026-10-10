---
title: Процесор Kubernetes attributes досяг віхи v1.0.0
linkTitle: Kubernetes Processor v1
date: 2026-09-16
author: >-
  [Christos Markou](https://github.com/ChrsMark)(Elastic), [Pablo
  Baeyens](https://github.com/mx-psi/)(Datadog)
default_lang_commit: 3181d36545ad680a029c72f915fdc33bad79f5b7
cSpell:ignore: Baeyens Markou
---

[Процесор Kubernetes attributes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#kubernetes-attributes-processor), який збагачує вашу телеметрію метаданими Kubernetes, офіційно перейшов до версії v1.0.0! Ви можете спробувати його у власному дистрибутиві, а також він доступний у найновіших релізах opentelemetry-collector-contrib та дистрибутива opentelemetry-collector-k8s.

Перехід до v1.0.0 означає, що компонент підтверджено відповідає [критеріям стабільності 'stable'](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable), включаючи вимоги щодо тестування, бенчмаркінгу, документації та стабільності телеметрії. Це також гарантує, що ви можете поширювати його як бібліотеку Go або як частину своїх бінарних файлів без порушення API.

Щоб зрозуміти, які зміни це передбачає і як керувати перехідним періодом, ознайомтеся з [посібником з міграції](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#semantic-conventions-compatibility).

## Як ми до цього дійшли і що буде далі {#how-we-got-here-and-what-comes-next}

З кінця 2025 року SIG OpenTelemetry Collector працює над [стабільністю кількох компонентів](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130) у межах зусиль проєкту OpenTelemetry [«Stable by Default»](/blog/2025/stability-proposal-announcement/). Ці зусилля продовжують і доповнюють [наявні напрацювання](https://github.com/open-telemetry/opentelemetry-collector/issues/9375) зі забезпечення стабільності бібліотечного фреймворку Collector та створення дистрибутива Collector v1.

Завдяки відгукам кінцевих користувачів в [опитуваннях Collector](/blog/2026/otel-collector-follow-up-survey-analysis/) ми знаємо найбільш використовувані компоненти, а також те, що стабільність і надійність є одними з головних пріоритетів наших користувачів. Це прояснило, на яких компонентах зосередитися, а також план до стабільності, який базується на [суворому наборі критеріїв](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable), що має відповідати їхнім очікуванням.

Виконання цих критеріїв — неабияка робота: стабілізація компонента також передбачає стабілізацію відповідних семантичних домовленостей (Semantic Conventions) та частин специфікації, на які він спирається, тому SIG Collector тісно співпрацює з іншими SIG, як-от SIG K8s Semantic Conventions, SIG System Semantic Conventions та SIG Prometheus Interoperability.

SIG K8s Semantic Conventions [помітив цю залежність заздалегідь](/blog/2026/k8s-semconv-rc/) і в листопаді 2025 року K8s розпочав [цілеспрямовану роботу зі стабілізації](https://github.com/open-telemetry/semantic-conventions/issues/3120) відповідних семантичних конвенцій K8s. У березні 2026 року ці семантичні конвенції досягли статусу Release Candidate, а в червні 2026 року [вони вийшли як стабільні в Semantic Conventions v1.42.0](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.42.0).

Це дозволило процесору Kubernetes attributes збагачувати телеметрію стабільними атрибутами K8s, гарантуючи, що телеметрія компонента залишатиметься стабільною надалі. Разом із [тривалою роботою](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44483) над приведенням компонента у відповідність до вимог стабільності компонент [пройшов процес випуску (graduation)](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/49274). Після кількох тижнів комунікації та підтримки від кінцевих користувачів, які вже використовують цей компонент у виробництві, і вендорів, які його поширюють, компонент було прийнято для v1.0.0.

Фінальний PR, який вносить необхідні зміни для переходу на нові назви семантичних конвенцій, а також кілька інших змін, повʼязаних із просуванням компонента, [пройшов рецензування одразу після цього](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/49152). Як згадувалося на початку, це означає певні зміни, що порушують сумісність, для наявних користувачів процесора, для яких ми написали [підсумок змін і посібник з міграції](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#semantic-conventions-compatibility), щоб допомогти з оновленнями.

Цей етап відкриває шлях для інших компонентів, і додаткова допомога спільноти буде дуже цінною. Якщо ви хочете допомогти OpenTelemetry Collector рухатися до стабільнішого майбутнього, [попереду ще багато роботи](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130). Долучайтеся зі своїми відгуками та думками або запитайте в супроводжувачів, як ви можете допомогти більш безпосередньо.
