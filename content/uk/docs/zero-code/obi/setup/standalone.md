---
title: Запуск OBI як самостійного процесу
linkTitle: Самостійний процес
description: Дізнайтеся, як налаштувати та запустити OBI як самостійний процес Linux.
weight: 4
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
---

OBI може працювати як самостійний процес ОС Linux з підвищеними привілеями, який може перевіряти інші процеси, що виконуються.

## Завантаження та встановлення {#download-and-install}

Ви можете завантажити виконуваний файл OBI зі сторінки [випусків OBI](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases).

## Налаштування OBI {#set-up-obi}

1. Створіть файл конфігурації відповідно до документації [параметрів конфігурації](../../configure/options/).

2. Запустіть OBI як привілейований процес:

```bash
sudo ./obi --config=<path to config file>
```

## Приклад конфігурації {#example-configuration}

Ось приклад файлу конфігурації (`obi-config.yml`):

```yaml
# Базова конфігурація
discovery:
  services:
    - name: my-service
      open_ports: [8080, 8090]
      exe_path: /usr/local/bin/my-service

# Конфігурація трейсів
traces:
  # Увімкнути трасування
  enabled: true

  # Точка доступу OpenTelemetry
  otlp_endpoint: http://localhost:4318

  # Формат трасування
  format: otlp

# Конфігурація метрик
metrics:
  # Увімкнути метрики
  enabled: true

  # Точка доступу OpenTelemetry
  otlp_endpoint: http://localhost:4318

  # Формат метрик
  format: otlp

# Налаштування журналювання
log_level: info
```

## Запуск OBI {#run-obi}

Запустіть OBI з файлом конфігурації:

```bash
sudo ./obi --config=obi-config.yml
```

## Параметри конфігурації {#configuration-options}

Для отримання повного списку параметрів конфігурації дивіться [документацію конфігурації](../../configure/options/).

## Дозволи {#permissions}

OBI вимагає підвищених привілеїв для належного функціонування. Для отримання додаткової інформації про конкретні можливості, які потрібні, дивіться [документацію безпеки](../../security/).

## Приклад: Інструментація Docker {#example-docker-instrumentation}

Щоб інструментувати контейнер Docker, ви можете запустити OBI на хості:

```bash
sudo ./obi --config=obi-config.yml
```

З конфігурацією, яка націлена на контейнер:

```yaml
discovery:
  services:
    - name: my-container-service
      open_ports: [8080]
      exe_path: /proc/*/root/app/my-app
```

## Приклад: Інструментація системи {#example-system-wide-instrumentation}

Щоб інструментувати всі сервіси в системі:

```yaml
discovery:
  services:
    - name: all-services
      open_ports: [80, 443, 8080, 8443]

log_level: info
```

Ця конфігурація буде інструментувати всі процеси, які слухають на вказаних портах.
