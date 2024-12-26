---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
weight: 40
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: Packagist
---

{{% docs/languages/libraries-intro "php" %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не включає підтримку OpenTelemetry, ви можете використовувати [бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library) для генерації телеметричних даних для бібліотеки або фреймворку.

Розширення OpenTelemetry PHP включає бібліотеки інструментування для багатьох поширених PHP фреймворків. Наприклад, [інструментування Laravel](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/src/Instrumentation/Laravel) автоматично створює [відрізки](/docs/concepts/signals/traces/#spans) на основі активності застосунку.

## Налаштування {#setup}

Кожна бібліотека інструментування є пакунком Composer. Щоб встановити її, виконайте наступну команду:

```sh
php composer.phar install {name-of-instrumentation}:{version-number}
```

Де `{name-of-instrumentation}` є посиланням на Packagist для конкретного інструментування, яке ви хочете використовувати.

Ви можете вимкнути будь-яке інструментування, додавши його ідентифікатор до змінної середовища `OTEL_PHP_DISABLED_INSTRUMENTATIONS`.

## Доступні бібліотеки інструментування

Для списку доступних інструментувань дивіться [бібліотеки інструментування OpenTelemetry](https://packagist.org/search/?query=open-telemetry&tags=instrumentation) на Packagist.

## Наступні кроки {#next-steps}

Після налаштування бібліотек інструментування, ви можете додати [додаткове інструментування](/docs/languages/php/instrumentation) для збору власних даних телеметрії.

Ви також можете налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/php/exporters) до одного або більше бекендів телеметрії.
