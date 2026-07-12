---
title: Налаштування OpenTelemetry PHP Distro
description: >-
  Дізнайтеся, як встановити та налаштувати OpenTelemetry PHP Distro для початку надсилання телеметрії з вашого PHP-застосунку.
weight: 1
cSpell:ignore: apk dpkg fpm RoadRunner Swoole
default_lang_commit: be35d47dc1ad8f2c4d3607927a14e9c4cb2d2102
---

Дізнайтеся, як інструментувати ваш PHP-застосунок за допомогою OpenTelemetry PHP Distro і надсилати телеметрію на сумісний з OTLP бекенд.

## Передумови {#prerequisites}

- Майте місце призначення для даних телеметрії (точку доступу OTLP).
- Використовуйте підтримуваний дистрибутив Linux та версію PHP.
- Не запускайте інший PHP APM або агент OpenTelemetry в тому самому процесі.

Інформацію про підтримувані операційні системи та версії PHP див. у розділі [Підтримувані технології](/docs/zero-code/php/distro/reference/supported-technologies/).

## Обмеження {#limitations}

Відомі обмеження середовища виконання та сумісності описані в [Обмеженнях](/docs/zero-code/php/distro/getting-started/limitations/).

## Завантаження та встановлення пакунків {#download-and-install-packages}

Завантажте пакунок для вашої платформи зі сторінки [GitHub Releases](https://github.com/open-telemetry/opentelemetry-php-distro/releases) і встановіть його.

### RPM (RHEL/CentOS/Fedora)

```sh
sudo rpm -ivh <package-file>.rpm
```

### DEB (Debian/Ubuntu)

```sh
sudo dpkg -i <package-file>.deb
```

### APK (Alpine)

```sh
sudo apk add --allow-untrusted <package-file>.apk
```

## Налаштування експортера {#configure-exporter}

Як мінімум, встановіть:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

Приклад:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-otlp-endpoint:443/"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>"
```

## Перезапуск PHP-процесів {#restart-php-processes}

Після встановлення та налаштування перезапустіть PHP-процеси (наприклад `php-fpm`, Apache workers або PHP-сервери, що працюють без перерви), щоб розширення завантажилося.

## Підтвердження телеметрії {#confirm-telemetry}

1. Відкрийте ваш бекенд спостережуваності.
2. Знайдіть ваш сервіс у трейсах.
3. Згенеруйте трафік, якщо трейси ще не видимі.

## Усунення несправностей {#troubleshooting}

- Перевірте опції конфігурації в [Конфігурація](/docs/zero-code/php/distro/reference/configuration/).
- Перевірте відомі обмеження в [Обмеження](/docs/zero-code/php/distro/getting-started/limitations/).
- Якщо використовуєте Laravel Octane (Swoole або RoadRunner), див. [PHP-сервери, що працюють без перерви](/docs/zero-code/php/distro/reference/long-running-server/).
