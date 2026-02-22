---
title: Початок роботи
description: Почніть працювати з OpenTelemetry для PHP.
aliases: [getting_started]
weight: 10
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: darwin pecl rolldice strval автозавантажений
---

OpenTelemetry для PHP можна використовувати для генерації та експорту [трасувань][трасування], [метрик][метрики] та [логів][логи].

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у PHP. Ми створимо простий застосунок "кидання кубика", потім застосуємо як інструментування без коду, так і інструментування з кодом для генерації [трасувань][трасування] та експорту їх до консолі. Потім ми згенеруємо деякі [логи][], які також будуть відправлені до консолі.

## Передумови {#prerequisites}

OpenTelemetry вимагає PHP 8.0+ для інструментування без коду, однак ручне інструментування працюватиме з PHP 7.4

Переконайтеся, що у вас встановлено наступне:

- [PHP 8.0+](https://www.php.net/)
- [PECL](https://pecl.php.net/)
- [composer](https://getcomposer.org/)

Перед тим, як почати, переконайтеся, що у вашій оболонці доступні обидва:

```sh
php -v
composer -v
```

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Slim Framework](https://www.slimframework.com/). Якщо ви не використовуєте Slim, це не проблема, ви можете використовувати OpenTelemetry PHP з іншими веб-фреймворками, такими як WordPress, Symfony та Laravel. Для повного списку бібліотек для підтримуваних фреймворків дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=php).

### Залежності {#dependencies}

У порожній теці ініціалізуйте мінімальний файл `composer.json`:

```sh
composer init \
  --no-interaction \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1"
composer update
```

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

У тій же теці створіть файл з назвою `index.php` з наступним вмістом:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create();

$app->get('/rolldice', function (Request $request, Response $response) {
    $result = random_int(1,6);
    $response->getBody()->write(strval($result));
    return $response;
});

$app->run();
```

Запустіть застосунок за допомогою вбудованого вебсервера PHP:

```shell
php -S localhost:8080
```

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

## Додати інструментування без коду {#add-zero-code-instrumentation}

Далі ви будете використовувати розширення OpenTelemetry PHP для [автоматичного інструментування](/docs/zero-code/php/) застосунку.

1. Оскільки розширення збирається з вихідного коду, вам потрібно встановити деякі інструменти для збірки

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Зберіть розширення за допомогою `PECL`:

   ```sh
   pecl install opentelemetry
   ```

   > [!NOTE]
   >
   > Альтернативні методи встановлення розширення детально описані в розділі [інструментування без коду](/docs/zero-code/php/#install-the-opentelemetry-extension).

3. Додайте розширення до вашого файлу `php.ini`:

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. Перевірте, що розширення встановлено та увімкнено:

   ```sh
   php --ri opentelemetry
   ```

5. Додайте додаткові залежності до вашого застосунку, які потрібні для автоматичного інструментування вашого коду:

   ```sh
   composer config allow-plugins.php-http/discovery false
   composer require \
     open-telemetry/sdk \
     open-telemetry/opentelemetry-auto-slim
   ```

З налаштованим розширенням OpenTelemetry PHP та встановленою бібліотекою інструментування, ви можете запустити ваш застосунок та згенерувати деякі трасування:

```sh
env OTEL_PHP_AUTOLOAD_ENABLED=true \
    OTEL_TRACES_EXPORTER=console \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=none \
    php -S localhost:8080
```

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі та перезавантажте сторінку кілька разів. Через деякий час ви повинні побачити відрізки, надруковані у вашій консолі:

<details>
<summary>Переглянути приклад виводу</summary>

```json
[
  {
    "name": "GET /rolldice",
    "context": {
      "trace_id": "16d7c6da7c021c574205736527816eb7",
      "span_id": "268e52331de62e33",
      "trace_state": ""
    },
    "resource": {
      "service.name": "__root__",
      "service.version": "1.0.0+no-version-set",
      "telemetry.sdk.name": "opentelemetry",
      "telemetry.sdk.language": "php",
      "telemetry.sdk.version": "1.0.0beta10",
      "telemetry.auto.version": "1.0.0beta5",
      "process.runtime.name": "cli-server",
      "process.runtime.version": "8.2.6",
      "process.pid": 24435,
      "process.executable.path": "/bin/php",
      "process.owner": "php",
      "os.type": "darwin",
      "os.description": "22.4.0",
      "os.name": "Darwin",
      "os.version": "Darwin Kernel Version 22.4.0: Mon Mar  6 20:59:28 PST 2023; root:xnu-8796.101.5~3/RELEASE_ARM64_T6000",
      "host.name": "OPENTELEMETRY-PHP",
      "host.arch": "arm64"
    },
    "parent_span_id": "",
    "kind": "KIND_SERVER",
    "start": 1684749478068582482,
    "end": 1684749478072715774,
    "attributes": {
      "code.function": "handle",
      "code.namespace": "Slim\\App",
      "code.filepath": "/vendor/slim/slim/Slim/App.php",
      "code.lineno": 197,
      "http.url": "http://localhost:8080/rolldice",
      "http.method": "GET",
      "http.request_content_length": "",
      "http.scheme": "http",
      "http.status_code": 200,
      "http.flavor": "1.1",
      "http.response_content_length": ""
    },
    "status": {
      "code": "Unset",
      "description": ""
    },
    "events": [],
    "links": []
  }
]
```

</details>

## Додати ручне інструментування {#add-manual-instrumentation}

### Трасування {#tracing}

Ручне трасування вимагає `TracerProvider`. Існує кілька способів його налаштування. У цьому прикладі ми будемо використовувати автозавантажений TracerProvider, який доступний глобально.

Замініть `index.php` наступним кодом:

```php
<?php

use OpenTelemetry\API\Globals;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$tracer = Globals::tracerProvider()->getTracer('demo');

$app = AppFactory::create();

$app->get('/rolldice', function (Request $request, Response $response) use ($tracer) {
    $span = $tracer
        ->spanBuilder('manual-span')
        ->startSpan();
    $result = random_int(1,6);
    $response->getBody()->write(strval($result));
    $span
        ->addEvent('rolled dice', ['result' => $result])
        ->end();
    return $response;
});

$app->run();
```

Знову запустіть вбудований вебсервер і перейдіть до <http://localhost:8080/rolldice>. Ви повинні побачити подібний вивід, але з додаванням нового відрізка з назвою `manual-span`.

Зверніть увагу, що `parent_span_id` ручного відрізка містить те саме значення, що і `context.span_id` відрізка "{closure}". Ручне та автоматичне інструментування добре працюють разом, оскільки під капотом вони використовують ті самі API.

### Логування {#logging}

Тепер додамо деяке логування. Ми будемо використовувати популярну бібліотеку логування `monolog` для цього, через обробник, який буде генерувати логи у форматі OpenTelemetry.

Спочатку встановимо деякі додаткові залежності:

```shell
composer require \
  monolog/monolog \
  open-telemetry/opentelemetry-logger-monolog
```

Замініть файл `index.php` наступним кодом:

```php
<?php

use Monolog\Logger;
use OpenTelemetry\API\Globals;
use OpenTelemetry\Contrib\Logs\Monolog\Handler;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$loggerProvider = Globals::loggerProvider();
$handler = new Handler(
    $loggerProvider,
    LogLevel::INFO
);
$monolog = new Logger('otel-php-monolog', [$handler]);

$app = AppFactory::create();

$app->get('/rolldice', function (Request $request, Response $response) use ($monolog) {
    $result = random_int(1,6);
    $response->getBody()->write(strval($result));
    $monolog->info('dice rolled', ['result' => $result]);
    return $response;
});

$app->run();
```

Запустіть вбудований вебсервер з наступною командою (зверніть увагу на зміну `OTEL_LOGS_EXPORTER`):

```shell
env OTEL_PHP_AUTOLOAD_ENABLED=true \
    OTEL_TRACES_EXPORTER=console \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=console \
    php -S localhost:8080
```

Цього разу при переході до <http://localhost:8080/rolldice> ви повинні побачити автоматичні трасування, як і раніше, а також запис логу, який був згенерований обробником monolog.

Зверніть увагу, що `trace_id` та `span_id` були додані до виводу журналу, і що значення відповідають активному відрізку на момент генерації повідомлення журналу.

<details>
<summary>Переглянути приклад виводу</summary>

```json
[
    {
        "name": "{closure}",
        "context": {
            "trace_id": "8b046fc5d43864058b6a5a18e0dfce3f",
            "span_id": "9cf24c78c6868bfe",
            "trace_state": ""
        },
        "resource": {
            "service.name": "__root__",
            "service.version": "1.0.0+no-version-set",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.language": "php",
            "telemetry.sdk.version": "1.0.0beta11",
            "telemetry.auto.version": "1.0.0beta6",
            "process.runtime.name": "cli-server",
            "process.runtime.version": "8.0.27",
            "process.pid": 2672,
            "process.executable.path": "\/usr\/local\/bin\/php",
            "process.owner": "root",
            "os.type": "linux",
            "os.description": "5.15.0-75-generic",
            "os.name": "Linux",
            "os.version": "#82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023",
            "host.name": "f2c0afe83ea9",
            "host.arch": "x86_64"
        },
        "parent_span_id": "df2199a615085705",
        "kind": "KIND_INTERNAL",
        "start": 1687323704059486500,
        "end": 1687323704060820769,
        "attributes": {
            "code.function": "__invoke",
            "code.namespace": "Slim\\Handlers\\Strategies\\RequestResponse",
            "code.filepath": "\/usr\/src\/myapp\/vendor\/slim\/slim\/Slim\/Handlers\/Strategies\/RequestResponse.php",
            "code.lineno": 28
        },
        "status": {
            "code": "Unset",
            "description": ""
        },
        "events": [],
        "links": []
    }
]
[
    {
        "name": "GET \/rolldice",
        "context": {
            "trace_id": "8b046fc5d43864058b6a5a18e0dfce3f",
            "span_id": "df2199a615085705",
            "trace_state": ""
        },
        "resource": {
            "service.name": "__root__",
            "service.version": "1.0.0+no-version-set",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.language": "php",
            "telemetry.sdk.version": "1.0.0beta11",
            "telemetry.auto.version": "1.0.0beta6",
            "process.runtime.name": "cli-server",
            "process.runtime.version": "8.0.27",
            "process.pid": 2672,
            "process.executable.path": "\/usr\/local\/bin\/php",
            "process.owner": "root",
            "os.type": "linux",
            "os.description": "5.15.0-75-generic",
            "os.name": "Linux",
            "os.version": "#82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023",
            "host.name": "f2c0afe83ea9",
            "host.arch": "x86_64"
        },
        "parent_span_id": "",
        "kind": "KIND_SERVER",
        "start": 1687323704058191192,
        "end": 1687323704060981779,
        "attributes": {
            "code.function": "handle",
            "code.namespace": "Slim\\App",
            "code.filepath": "\/usr\/src\/myapp\/vendor\/slim\/slim\/Slim\/App.php",
            "code.lineno": 197,
            "http.url": "http:\/\/localhost:8080\/rolldice",
            "http.method": "GET",
            "http.request_content_length": "",
            "http.scheme": "http",
            "http.status_code": 200,
            "http.flavor": "1.1",
            "http.response_content_length": ""
        },
        "status": {
            "code": "Unset",
            "description": ""
        },
        "events": [],
        "links": []
    }
]
{
    "resource": {
        "attributes": {
            "service.name": "__root__",
            "service.version": "1.0.0+no-version-set",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.language": "php",
            "telemetry.sdk.version": "1.0.0beta11",
            "telemetry.auto.version": "1.0.0beta6",
            "process.runtime.name": "cli-server",
            "process.runtime.version": "8.0.27",
            "process.pid": 2672,
            "process.executable.path": "\/usr\/local\/bin\/php",
            "process.owner": "root",
            "os.type": "linux",
            "os.description": "5.15.0-75-generic",
            "os.name": "Linux",
            "os.version": "#82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023",
            "host.name": "f2c0afe83ea9",
            "host.arch": "x86_64"
        },
        "dropped_attributes_count": 0
    },
    "scope": {
        "name": "monolog",
        "version": null,
        "attributes": [],
        "dropped_attributes_count": 0,
        "schema_url": null,
        "logs": [
            {
                "timestamp": 1687323704059648000,
                "observed_timestamp": 1687323704060784128,
                "severity_number": 9,
                "severity_text": "INFO",
                "body": "dice rolled",
                "trace_id": "8b046fc5d43864058b6a5a18e0dfce3f",
                "span_id": "9cf24c78c6868bfe",
                "trace_flags": 1,
                "attributes": {
                    "channel": "otel-php-monolog",
                    "context": {
                        "result": 4
                    }
                },
                "dropped_attributes_count": 0
            }
        ]
    }
}
```

</details>

## Що далі? {#whats-next}

Для більшого:

- Запустіть цей приклад з іншим [експортером][експортер] для даних телеметрії.
- Спробуйте [інструментування без коду](/docs/zero-code/php/) на одному з ваших власних застосунків.
- Дізнайтеся більше про [ручне інструментування][] та спробуйте деякі [приклади](/docs/languages/php/examples/).
- Погляньте на [OpenTelemetry Demo](/docs/demo/), який включає оснований на PHP [Quote Service](/docs/demo/services/quote/).

[трасування]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
[логи]: /docs/concepts/signals/logs/
[експортер]: ../exporters/
[ручне інструментування]: ../instrumentation/
