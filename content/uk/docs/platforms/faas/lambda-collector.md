---
title: Конфігурація Lambda Collector
linkTitle: Конфігурація Lambda Collector
weight: 11
description: Додайте та налаштуйте Collector Lambda layer до вашої Lambda
default_lang_commit: edc67aafea1ead97b94ed4054d2c3248a34b0389
cSpell:ignore: ADOT awsxray configmap confmap
---

Спільнота OpenTelemetry пропонує Collector в окремому Lambda шарі від інструментальних шарів, щоб надати користувачам максимальну гнучкість. Це відрізняється від поточної реалізації AWS Distribution of OpenTelemetry (ADOT), яка обʼєднує інструментування та Collector разом.

## Додайте ARN OTel Collector Lambda layer {#add-the-arn-of-the-otel-collector-lambda-layer}

Після того, як ви інструментували свій застосунок, вам слід додати Collector Lambda layer для збору та надсилання ваших даних до обраного вами бекенду.

Знайдіть [найновіший реліз Collector layer](https://github.com/open-telemetry/opentelemetry-lambda/releases) та використовуйте його ARN, змінивши теґ `<region>` на регіон, в якому знаходиться ваша Lambda.

Примітка: Lambda layers є регіоналізованим ресурсом, тобто вони можуть бути використані лише в регіоні, в якому вони опубліковані. Переконайтеся, що використовуєте layer в тому ж регіоні, що й ваші функції Lambda. Спільнота публікує layers у всіх доступних регіонах.

## Налаштуйте OTel Collector {#configure-the-otel-collector}

Конфігурація OTel Collector Lambda layer відповідає стандарту OpenTelemetry.

Стандартно, OTel Collector Lambda layer використовує config.yaml.

### Встановіть змінну середовища для вашого обраного бекенду {#set-the-environment-variable-for-your-preferred-backend}

У налаштуваннях змінних середовища Lambda створіть нову змінну, яка містить ваш токен авторизації.

### Оновіть стандартного експортера {#update-the-default-exporter}

У вашому файлі `config.yaml` додайте вашого обраного експортера(ів), якщо вони ще не присутні. Налаштуйте вашого експортера(ів) за допомогою змінних середовища, які ви встановили для ваших токенів доступу на попередньому кроці.

**Без встановленої змінної середовища для ваших експортерів стандартна конфігурація підтримує лише виведення даних за допомогою debug експортера.** Ось стандартна конфігурація:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'

exporters:
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

## Опублікуйте вашу Lambda {#publish-your-lambda}

Опублікуйте нову версію вашої Lambda, щоб застосувати внесені зміни.

## Розширена конфігурація OTel Collector {#advanced-otel-collector-configuration}

Будь ласка, знайдіть список доступних компонентів, які підтримуються для власної конфігурації тут. Щоб увімкнути налагодження, ви можете використовувати конфігураційний файл для встановлення рівня виводу журналу на debug. Дивіться приклад нижче.

### Виберіть вашого постачальника Confmap {#choose-your-preferred-confmap-provider}

OTel Lambda Layers підтримує наступні типи постачальників confmap: `file`, `env`, `yaml`, `http`, `https`, та `s3`. Щоб налаштувати конфігурацію OTel collector за допомогою різних постачальників Confmap, будь ласка, зверніться до [документації постачальників Confmap Amazon Distribution of OpenTelemetry](https://aws-otel.github.io/docs/components/confmap-providers#confmap-providers-supported-by-the-adot-collector)
для отримання додаткової інформації.

### Створіть власний конфігураційний файл {#create-a-custom-configuration-file}

Ось приклад конфігураційного файлу `collector.yaml` у кореневій теці:

```yaml
#collector.yaml у кореневій теці
#Встановіть змінну середовища 'OPENTELEMETRY_COLLECTOR_CONFIG_OPENTELEMETRY_COLLECTOR_CONFIG_URI' на '/var/task/collector.yaml'

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
  debug:
  awsxray:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [awsxray]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

### Зіставте ваш конфігураційний файл за допомогою змінних середовища {#map-your-custom-configuration-file-using-environment-variables}

Після того, як ваша конфігурація collector встановлена через постачальника confmap, створіть змінну середовища у вашій функції Lambda `OPENTELEMETRY_COLLECTOR_CONFIG_URI` та встановіть шлях до конфігурації відносно постачальника confmap як її значення. Наприклад, якщо ви використовуєте постачальника file configmap, встановіть його значення на `/var/task/<path>/<to>/<filename>`. Це повідомить розширенню, де знайти конфігурацію collector.

#### Власна конфігурація Collector за допомогою CLI {#custom-collector-configuration-using-the-cli}

Ви можете встановити це через консоль Lambda або за допомогою AWS CLI.

```bash
aws lambda update-function-configuration --function-name Function --environment Variables={OPENTELEMETRY_COLLECTOR_CONFIG_URI=/var/task/collector.yaml}
```

#### Встановіть змінні середовища конфігурації за допомогою CloudFormation {#set-configuration-environment-variables-from-cloudformation}

Ви також можете налаштувати змінні середовища за допомогою шаблону **CloudFormation**:

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: /var/task/collector.yaml
```

#### Завантажте конфігурацію з обʼєкта S3 {#load-configuration-from-an-s3-object}

Завантаження конфігурації з S3 вимагатиме, щоб роль IAM, прикріплена до вашої функції, включала доступ на читання до відповідного кошика.

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: s3://<bucket_name>.s3.<region>.amazonaws.com/collector_config.yaml
```
