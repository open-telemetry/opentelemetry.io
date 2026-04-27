---
title: Інструментування PHP без коду
linkTitle: PHP
weight: 30
aliases: [/docs/languages/php/automatic]
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: centos democlass epel pecl phar phpini remi
---

## Вимоги {#requirements}

Автоматичне інструментування з PHP вимагає:

- PHP 8.0 або вище
- [Розширення OpenTelemetry PHP](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
- [Автозавантаження Composer](https://getcomposer.org/doc/01-basic-usage.md#autoloading)
- [OpenTelemetry SDK](https://packagist.org/packages/open-telemetry/sdk)
- Одна або більше [бібліотек інструментування](/ecosystem/registry/?component=instrumentation&language=php)
- [Конфігурація](#configuration)

## Встановлення розширення OpenTelemetry {#install-the-opentelemetry-extension}

> [!IMPORTANT]
>
> Встановлення розширення OpenTelemetry само по собі не генерує трасування.

Розширення можна встановити через pecl, [pickle](https://github.com/FriendsOfPHP/pickle), [PIE](https://github.com/php/pie) або [php-extension-installer](https://github.com/mlocati/docker-php-extension-installer) (специфічно для docker). Також є пакетовані версії розширення, доступні для деяких менеджерів пакетів Linux.

### Пакунки Linux {#linux-packages}

Пакунки RPM та APK надаються наступними джерелами:

- [Репозиторій Remi](https://blog.remirepo.net/pages/PECL-extensions-RPM-status) - RPM
- [Alpine Linux](https://pkgs.alpinelinux.org/packages?name=*pecl-opentelemetry) - APK (наразі в [_testing_ гілці](https://wiki.alpinelinux.org/wiki/Repositories#Testing))

{{< tabpane text=true >}} {{% tab "RPM" %}}

```sh
#цей приклад для CentOS 7. Версію PHP можна змінити
#включивши remi-<version>, наприклад "yum config-manager --enable remi-php83"
yum update -y
yum install -y epel-release yum-utils
yum install -y http://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi-php81
yum install -y php php-pecl-opentelemetry

php --ri opentelemetry
```

{{% /tab %}} {{% tab "APK" %}}

```sh
#На момент написання, PHP 8.1 була стандартною версією PHP. Можливо, вам доведеться
#змінити "php81", якщо стандарт зміниться. Ви також можете вибрати версію PHP
#з "apk add php<version>", наприклад "apk add php83".
echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
apk add php php81-pecl-opentelemetry@testing
php --ri opentelemetry
```

{{% /tab %}} {{< /tabpane >}}

### PECL

1. Налаштуйте середовище розробки. Встановлення з вихідного коду вимагає належного середовища розробки та деяких залежностей:

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Збірка/встановлення розширення. Після налаштування середовища ви можете встановити розширення:

   {{< tabpane text=true >}} {{% tab pecl %}}

   ```sh
   pecl install opentelemetry
   ```

   {{% /tab %}} {{% tab pickle %}}

   ```sh
   php pickle.phar install opentelemetry
   ```

   {{% /tab %}} {{% tab "php-extension-installer (docker)" %}}

   ```sh
   install-php-extensions opentelemetry
   ```

   {{% /tab %}} {{< /tabpane >}}

3. Додайте розширення до вашого файлу `php.ini`:

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. Перевірте, що розширення встановлено та увімкнено:

   ```sh
   php -m | grep opentelemetry
   ```

## Встановлення SDK та бібліотек інструментування {#install-sdk-and-instrumentation-libraries}

Після встановлення розширення, встановіть OpenTelemetry SDK та одну або більше бібліотек інструментування.

Автоматичне інструментування доступне для багатьох популярних бібліотек PHP. Для повного списку дивіться [бібліотеки інструментування на packagist](https://packagist.org/search/?query=open-telemetry&tags=instrumentation).

Припустимо, що ваш застосунок використовує Slim Framework і HTTP-клієнт PSR-18, і що ми будемо експортувати трейси за допомогою протоколу OTLP.

Після цього вам потрібно буде встановити SDK, експортер та пакунки для автоматичного інструментування для Slim Framework і PSR-18:

```shell
composer require \
    open-telemetry/sdk \
    open-telemetry/exporter-otlp \
    open-telemetry/opentelemetry-auto-slim \
    open-telemetry/opentelemetry-auto-psr18
```

## Конфігурація {#configuration}

При використанні разом з OpenTelemetry SDK, ви можете використовувати змінні середовища або файл `php.ini` для налаштування автоінструментування.

### Конфігурація середовища {#environment-configuration}

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

### Конфігурація php.ini {#phpini-configuration}

Додайте наступне до `php.ini`, або іншого `ini` файлу, який буде оброблений PHP:

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_SERVICE_NAME=your-service-name
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318
OTEL_PROPAGATORS=baggage,tracecontext
```

## Запуск вашого застосунку {#running-your-application}

Після того, як все вищезазначене встановлено та налаштовано, запустіть ваш застосунок як зазвичай.

Трасування, яке ви побачите, експортоване до OpenTelemetry Collector, залежить від бібліотек інструментування, які ви встановили, та шляху коду, який був виконаний всередині застосунку. У попередньому прикладі, використовуючи Slim Framework та PSR-18 бібліотеки інструментування, ви повинні очікувати побачити такі відрізки, як:

- Кореневий відрізок, що представляє HTTP транзакцію
- Відрізок для дії, яка була виконана
- Відрізок для кожної HTTP транзакції, яку відправив PSR-18 клієнт

Зверніть увагу, що інструментування PSR-18 клієнта додає [заголовки розподіленого трасування](/docs/concepts/context-propagation/#propagation) до вихідних HTTP запитів.

## Як це працює {#how-it-works}

> [!NOTE] Опціонально" %}}
>
> Ви можете пропустити цей розділ, якщо ви просто хочете швидко запустити, і є відповідні бібліотеки інструментування для вашого застосунку.

Розширення дозволяє реєструвати функції спостерігачів як PHP код для класів та методів, і виконувати ці функції до та після виконання спостережуваного методу.

Якщо немає бібліотеки інструментування для вашого фреймворку або застосунку, ви можете написати свою власну. Наступний приклад надає деякий код для інструментування, а потім ілюструє, як використовувати розширення OpenTelemetry для трасування виконання цього коду.

```php
<?php

use OpenTelemetry\API\Instrumentation\CachedInstrumentation;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\Context\Context;

require 'vendor/autoload.php';

/* Клас для інструментування */
class DemoClass
{
    public function run(): void
    {
        echo 'Hello, world';
    }
}

/* Код автоінструментування */
OpenTelemetry\Instrumentation\hook(
    class: DemoClass::class,
    function: 'run',
    pre: static function (DemoClass $demo, array $params, string $class, string $function, ?string $filename, ?int $lineno) {
        static $instrumentation;
        $instrumentation ??= new CachedInstrumentation('example');
        $span = $instrumentation->tracer()->spanBuilder('democlass-run')->startSpan();
        Context::storage()->attach($span->storeInContext(Context::getCurrent()));
    },
    post: static function (DemoClass $demo, array $params, $returnValue, ?Throwable $exception) {
        $scope = Context::storage()->scope();
        $scope->detach();
        $span = Span::fromContext($scope->context());
        if ($exception) {
            $span->recordException($exception);
            $span->setStatus(StatusCode::STATUS_ERROR);
        }
        $span->end();
    }
);

/* Запуск інструментованого коду, який буде генерувати трасування */
$demo = new DemoClass();
$demo->run();
```

Попередній приклад визначає `DemoClass`, а потім реєструє `pre` та `post` функції хуків на його методі `run`. Функції хуків виконуються до та після кожного виконання методу `DemoClass::run()`. Функція `pre` починає та активує відрізок, тоді як функція `post` завершує його.

Якщо `DemoClass::run()` викидає виключення, функція `post` записує його без впливу на поширення виключення.

## Наступні кроки {#next-steps}

Після того, як ви налаштували автоматичне інструментування для вашого застосунку або сервісу, ви можете додати [ручне інструментування](/docs/languages/php/instrumentation) для збору користувацьких телеметричних даних.

Для більшої кількості прикладів дивіться [opentelemetry-php-contrib/examples](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/examples).
