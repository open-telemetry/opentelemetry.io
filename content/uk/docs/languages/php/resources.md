---
title: Ресурси
weight: 70
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

{{% docs/languages/resources-intro %}}

## Виявлення ресурсів {#resource-detection}

PHP SDK виявляє ресурси з різних джерел і стандартно використовує всі доступні детектори ресурсів:

- середовище (`OTEL_RESOURCE_ATTRIBUTES`, `OTEL_SERVICE_NAME`)
- інформація про хост
- операційна система хосту
- поточний процес
- середовище виконання

## Вимкнення виявлення ресурсів {#disabling-resource-detection}

Стандартно використовуються всі детектори ресурсів SDK, але ви можете використовувати змінну середовища `OTEL_PHP_DETECTORS`, щоб увімкнути лише певні детектори або повністю вимкнути їх:

- `env`
- `host`
- `os`
- `process`
- `process_runtime`
- `sdk`
- `sdk_provided`
- `all` - увімкнути всі детектори ресурсів
- `none` - вимкнути виявлення ресурсів

Наприклад, щоб увімкнути лише детектори `env`, `host` та `sdk`:

```shell
env OTEL_PHP_DETECTORS=env,host,sdk \
php example.php
```

## Власні детектори ресурсів {#custom-resource-detectors}

Детектори ресурсів для загальних платформ або специфічних для постачальників середовищ можуть бути встановлені як пакунки composer.

Наприклад, щоб встановити та увімкнути детектор ресурсів `container`:

```shell
composer require open-telemetry/detector-container
env OTEL_PHP_RESOURCE_DETECTORS=container \
php example.php
```

Зверніть увагу, що встановлені детектори автоматично включаються до стандартного списку детекторів ресурсів `all`.

## Додавання ресурсів за допомогою змінних середовища {#adding-resources-with-environment-variables}

Якщо для потрібного вам ресурсу немає детектора SDK, ви можете додати довільні ресурси через змінну середовища `OTEL_RESOURCE_ATTRIBUTES`, яка інтерпретується детектором `env`. Ця змінна приймає список пар ключ=значення, розділених комами, наприклад:

```shell
env OTEL_RESOURCE_ATTRIBUTES="service.name=my_service,service.namespace=demo,service.version=1.0,deployment.environment=development" \
php example.php
```

## Додавання ресурсів у коді {#adding-resources-in-code}

Власні ресурси також можуть бути налаштовані у вашому коді. Тут стандартні ресурси (виявлені, як описано вище) обʼєднуються з власними ресурсами. Ресурси потім передаються провайдеру трасувальника, де вони будуть асоціюватися з усіма створеними відрізками.

```php
$resource = ResourceInfoFactory::defaultResource()->merge(ResourceInfo::create(Attributes::create([
    ResourceAttributes::SERVICE_NAMESPACE => 'foo',
    ResourceAttributes::SERVICE_NAME => 'bar',
    ResourceAttributes::SERVICE_INSTANCE_ID => 1,
    ResourceAttributes::SERVICE_VERSION => '0.1',
    ResourceAttributes::DEPLOYMENT_ENVIRONMENT_NAME => 'development',
])));

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        (new ConsoleSpanExporterFactory())->create()
    ),
    null,
    $resource
);
```
