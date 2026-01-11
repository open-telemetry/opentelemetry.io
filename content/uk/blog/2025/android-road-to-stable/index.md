---
title: 'OpenTelemetry Android: шлях до стабільності'
author: >-
  [Jason Plumb](https://github.com/breedx-splk) (Splunk)
linkTitle: 'OTel Android: шлях до стабільності'
issue: https://github.com/open-telemetry/opentelemetry.io/issues/7902
sig: Android
date: 2025-10-02
default_lang_commit: 29e6c1de74d36870b67d89c0b38ff278d10b1655
cSpell:ignore: httpurlconnection Jetpack байткод
---

**TL;DR — Ми хочемо отримати ваші [відгуки](https://github.com/open-telemetry/opentelemetry-android/issues/1257) щодо API агента OpenTelemetry для Android перед його стабілізацією.**

Чудова новина! SIG OpenTelemetry Android активно працює над стабілізацією головних API ініціалізації та конфігурації, готуючись до випуску 1.0.0 стабільної версії. Що це означає для розробника мобільного RUM? Чи хочете ви долучитися до тестування та надати відгуки? Читайте далі, щоб дізнатися більше.

## Звідки ми починали {#where-we-came-from}

Два роки тому OpenTelemetry Android тільки зʼявився, спільнота тепло сприйняла [внесок](https://github.com/open-telemetry/community/issues/1400) від Splunk. Він складався з одного [репозиторію GitHub](https://github.com/open-telemetry/opentelemetry-android) з одним монолітним модулем, який публікував один артефакт. Проєкт базувався на [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java) API та SDK і переважно був написаний на Java. Це був міцний старт, що викликав швидкий початковий інтерес. Навіть тоді його вже використовували у промислових розгортаннях.

Спільнота згуртувалася, і ми зібрали групу підтримки та рецензентів (від 4 різних вендорів), щоб супроводжувати код і сприяти поступовому покращенню проєкту.

## Чого ми досягли {#what-we-have-accomplished}

Ми швидко виявили напрямки для покращення і досягли значного прогресу — понад 1250 pull request від більш ніж 40 учасників! Якщо ви серед цих 40 — ми щиро дякуємо та цінуємо вашу допомогу. ❤️

Ось короткий огляд основних покращень за останні два роки.

### Модульність {#modularization}

Монолітна структура проєкту виявилася обтяжливою: вона збільшувала розмір бінарного файлу та прагнула включати всі функції для всіх користувачів. Пласка структура пакунків ускладнювала розуміння, які частини є API, а які є внутрішніми. Тому ми провели модернізацію, розділивши проєкт на граф модулів, кожен з яких має власну відповідальність, кожен з яких публікує власний артефакт. Цей чіткіший розподіл обовʼязків — велика перемога!

Окрім публікації окремих модулів, ми також [публікуємо bill-of-materials (bom)](https://central.sonatype.com/artifact/io.opentelemetry.android/opentelemetry-android-bom), який дозволяє розробникам синхронізувати версії цих модулів.

### Нова інструментація {#new-instrumentation}

Завдяки участі спільноти проєкт OpenTelemetry Android отримав низку корисних бібліотек інструменталізації. Серед них:

- [android-log](https://github.com/open-telemetry/opentelemetry-android/tree/main/instrumentation/android-log) — можливість генерувати OTel лог-записи з ідіоматичних викликів Android `Log.x(...)`.
- [httpurlconnection](https://github.com/open-telemetry/opentelemetry-android/tree/main/instrumentation/httpurlconnection) — трасування для цього клієнта HTTP, що постачається середовищем виконання.
- [view-click](https://github.com/open-telemetry/opentelemetry-android/tree/main/instrumentation/view-click) — генерує події натискань для Android Views.
- [compose-click](https://github.com/open-telemetry/opentelemetry-android/tree/main/instrumentation/compose/click) — генерує події натискань у компонентах Jetpack Compose.
- [sessions](https://github.com/open-telemetry/opentelemetry-android/tree/main/instrumentation/sessions) — генерує події при зміні життєвого циклу сесії.

### Автоінструментування {#auto-instrumentation}

На відміну від [OpenTelemetry Java agent](https://github.com/open-telemetry/opentelemetry-java-instrumentation), Android-агент не може виконувати байткод-інʼєкцію в під час виконання коду через обмеження платформи. Однак автоінструментування дуже зручне, і користувачі часто віддають перевагу автоматичним змінам без правки коду.

Деяку інструментацію можна застосувати втулком Gradle під час збірки, без ручних змін у коді або явного використання обгорток OpenTelemetry. На момент написання це включає інструментацію Android log та HTTP-клієнта, і ми очікуємо більше автоінструментування в майбутньому.

### Документація {#documentation}

Ми нещодавно завершили ініціативу зі створення [документації для кожного модуля інструментації](https://github.com/open-telemetry/opentelemetry-android/issues/742). Це дає змогу користувачам швидко визначити, яку телеметрію генерує кожен модуль, а також інструкції для тих, хто хоче використовувати інструментацію окремо від агента.

### Події/семантичні домовленості {#events-semconv}

У мобільному світі події користувача скрізь. Real User Monitoring (RUM) часто відображає поведінку користувача як серію подій у сесії. Коли OpenTelemetry Android тільки починався, сигнал подій OpenTelemetry ([events signal](/docs/specs/semconv/general/events/)) був ще в зародку, і всі події моделювалися як відрізки нульової тривалості. Також було мало семантичних домовленостей у цій області, і назви відрізків та атрибути не завжди відповідали загальним домовленостям OpenTelemetry (наприклад, крапки та простори імен).

Невелика група брала участь у визначенні семантичних домовленостей для Android, мобільних та клієнтських сценаріїв. Вони були прийняті проєктом Android, і відрізки нульової тривалості тепер правильно моделюються як події.

### Міграція на Kotlin {#migration-to-kotlin}

Kotlin — основна мова сучасних Android-розробників. Хоча Kotlin добре взаємодіє з Java, користувачі очікують підхід "Kotlin перш за все". На початку більшість коду була на Java з невеликим обсягом Kotlin. Наприклад, у квітні 2024 року (перший знімок [Wayback Machine](https://web.archive.org/web/20250000000000*/https://github.com/open-telemetry/opentelemetry-android)):

![kotlin usage before](kotlin1.png)

Хоча робота ще триває, ми досягли значного прогресу. Дивіться що у нас є сьогодні, вересень 2025:

![kotlin usage now](kotlin2.png)

### Демонстраційний застосунок {#demo-app}

Щоб показати, як інтегрувати OpenTelemetry Android у мобільні застосунки, ми створили новий демонстраційний застосунок. Цей демо застосунок зроблено за зразком [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) — Astronomy Shop, і він [міститься в репозиторії Android](https://github.com/open-telemetry/opentelemetry-android/tree/main/demo-app). Окрім демонстрації налаштування агента та встановлення інструментації, демо має функції для генерації готових логів та трейсингу.

![demo app screen1](demo-app1.png) ![demo app screen2](demo-app2.png)
![demo app screen3](demo-app3.png)

Щоб показати мобільні проблеми реальніше, у застосунку також є функції, які навмисно створюють проблеми, наприклад, повільний рендеринг або аварійне закриття.

## Дивимося вперед {#looking-ahead}

[Ми хочемо, щоб ви надали ваші відгуки про API агента!](https://github.com/open-telemetry/opentelemetry-android/issues/1257)

Ми досягли моменту, коли час думати про наступну фазу OpenTelemetry Android: стабільність. Після багатьох PR, обговорень, переробок і поступового вдосконалення ми вважаємо, що наближаємося до API ініціалізації, який можемо підтримувати як «стабільний» для лінійки 1.x.

Випуск у жовтні 2025 буде нашим першим release candidate: `1.0.0-rc1`.

Починаючи з цієї версії, усі артефакти, окрім android-agent, будуть публікуватися з суфіксом `-alpha`. Цей суфікс чітко показує, які модулі ще в альфа-стані і можуть зазнати змін в API. Уся інструментація залишатиметься «alpha», а згенерована телеметрія — в статусі «development», поки відповідні семантичні домовленості не стабілізуються.

Ми вважаємо, що `android-agent` — основний спосіб, яким більшість Android-розробників буде взаємодіяти з цією інструментацією OTel. Тому ми вважаємо, що досягли стану, коли:

- API зручні у використанні
- API покривають 90% типових сценаріїв
- Нестандартні випадки та експертні налаштування все ще можливі

І тут потрібні ви! Будь ласка, спробуйте android-agent і [надайте відгук](https://github.com/open-telemetry/opentelemetry-android/issues/1257) про API `OpenTelemetryRumInitializer`. Ми щиро вдячні за всі відгуки і використаємо їх під час остаточного доопрацювання цього API та перед прийняттям остаточного рішення про його «стабільність». Дякуємо за увагу і чекаємо на ваші відгуки.
