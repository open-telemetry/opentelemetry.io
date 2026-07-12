---
title: Обмеження
description: Відомі обмеження та вимоги OpenTelemetry PHP Distro.
weight: 2
# prettier-ignore
cSpell:ignore: basedir ComponentProvider opentelemetry-php-contrib passenv xdebug
default_lang_commit: be35d47dc1ad8f2c4d3607927a14e9c4cb2d2102
---

Ця сторінка описує відомі обмеження та вимоги OpenTelemetry PHP Distro.

## Запуск з іншим PHP агентом телеметрії{#running-with-another-php-telemetry-agent}

Не запускайте OpenTelemetry PHP Distro разом з іншим PHP APM або OpenTelemetry агентом в тому самому процесі. Запуск обох може спричинити конфлікти, дублювання інструментування та нестабільну поведінку.

## `open_basedir`

Якщо `open_basedir` увімкнено в `php.ini`, шлях встановлення distro має бути включений до дозволених шляхів, інакше агент може не завантажитися.

## `xdebug`

Запуск з `xdebug` не рекомендується в робочому середовищі і може спричинити проблеми стабільності або памʼяті в інструментованих процесах.

## Конфігурація на основі файлів (`OTEL_CONFIG_FILE`){#file-based-configuration-otel_config_file}

При використанні (декларативної) конфігурації на основі файлів:

- Віддалене налаштування (OpAMP) недоступне — налаштування на основі файлів та віддалене налаштування є взаємовиключними.
- Ресурс-детектори, зареєстровані через `Registry::registerResourceDetector()` (наприклад, хмарні провайдери детекторів з `opentelemetry-php-contrib`) не активуються автоматично. Вони мають надавати `ComponentProvider` і бути явно перелічені у секції YAML `resource.detection/development.detectors`.
- Distro поставляє вбудований `distro` детектор для атрибутів `telemetry.distro.name` та `telemetry.distro.version`. Див. [Конфігурація](/docs/zero-code/php/distro/reference/configuration/#distro-resource-detector) для використання.
- Підставлення змінних середовища (`${VAR_NAME}`) у YAML файлах покладається на `$_SERVER` для читання значень. У контекстах веб-сервера (Apache, nginx+FPM), змінні середовища процесу автоматично не доступні в `$_SERVER`. Щоб використовувати підставлення `${VAR_NAME}` у вашій YAML конфігурації, переконайтеся, що змінні доступні PHP:
  - **Apache (mod_php)**: Використовуйте `PassEnv VAR_NAME` або `SetEnv VAR_NAME value` у конфігурації віртуального хосту.
  - **PHP-FPM**: Встановіть `env[VAR_NAME] = value` у конфігурації FPM пулу, або встановіть `clear_env = no` для передачі всіх змінних середовища процесу.
  - Альтернативно, жорстко закодувати значення безпосередньо у YAML файлі замість використання підстановки `${VAR_NAME}`.
