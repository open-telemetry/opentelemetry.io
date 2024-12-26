---
title: Інструментування
weight: 20
aliases: [manual]
description: Ручне інструментування для OpenTelemetry PHP
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: guzzlehttp ініціюючими
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro %}}

## Підготовка демонстраційного застосунку {#example-app}

Ці інструкції використовують модифіковану версію демонстраційного застосунку з [Початку роботи](/docs/languages/php/getting-started/), щоб допомогти вам навчитися інструментувати ваш PHP код.

Якщо ви хочете інструментувати свій власний застосунок або бібліотеку, дотримуйтесь інструкцій, щоб
адаптувати процес до свого коду.

### Залежності {#example-app-dependencies}

У порожній теці ініціалізуйте мінімальний файл `composer.json` з наступним вмістом:

```shell
composer init \
  --no-interaction \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1" \
  --require monolog/monolog:"^3"
composer update
```

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

Щоб підкреслити різницю між інструментуванням бібліотеки та самостійним застосунком, розділіть кидання кубиків на файл бібліотеки, який потім буде імпортований як залежність файлу застосунку.

Створіть файл бібліотеки з назвою `dice.php` і додайте до нього наступний код:

```php
<?php
class Dice {

    private $tracer;

    function __construct() {
    }

    public function roll($rolls) {
        $result = [];
        for ($i = 0; $i < $rolls; $i++) {
            $result[] = $this->rollOnce();
        }
        return $result;
    }

    private function rollOnce() {
      $result = random_int(1, 6);
      return $result;
    }
}
```

Створіть файл застосунку з назвою `index.php` і додайте до нього наступний код:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Level;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');

$logger = new Logger('dice-server');
$logger->pushHandler(new StreamHandler('php://stdout', Level::INFO));

$app = AppFactory::create();

$dice = new Dice();

$app->get('/rolldice', function (Request $request, Response $response) use ($logger, $dice) {
    $params = $request->getQueryParams();
    if(isset($params['rolls'])) {
        $result = $dice->roll($params['rolls']);
        if (isset($params['player'])) {
          $logger->info("Гравець кидає кубики.", ['player' => $params['player'], 'result' => $result]);
        } else {
          $logger->info("Анонімний гравець кидає кубики.", ['result' => $result]);
        }
        $response->getBody()->write(json_encode($result));
    } else {
        $response->withStatus(400)->getBody()->write("Будь ласка, введіть кількість кидків");
    }
    return $response;
});

$app->run();
```

Щоб переконатися, що все працює, запустіть застосунок за допомогою наступної команди та відкрийте <http://localhost:8080/rolldice?rolls=12> у вашому вебоглядачі.

```shell
php -S localhost:8080
```

## Налаштування інструментування {#instrumentation-setup}

### Залежності {#dependencies}

Встановіть пакунки OpenTelemetry API:

```shell
composer require open-telemetry/api open-telemetry/sem-conv
```

### Ініціалізація SDK {#initialize-the-sdk}

> [!NB] Якщо ви інструментуєте бібліотеку, **пропустіть цей крок**.

Щоб використовувати OpenTelemetry SDK для PHP, вам потрібні пакунки, які задовольняють залежності для `psr/http-client-implementation` та `psr/http-factory-implementation`. Тут ми будемо використовувати Guzzle, який забезпечує обидва:

```sh
composer require guzzlehttp/guzzle
```

Тепер ви можете встановити OpenTelemetry SDK та OTLP експортер:

```sh
composer require \
  open-telemetry/sdk \
  open-telemetry/exporter-otlp
```

Якщо ви розробник застосунків, вам потрібно налаштувати екземпляр `OpenTelemetry SDK` якомога раніше у вашому застосунку. Тут ми будемо використовувати метод `Sdk::builder()`, і ми глобально зареєструємо провайдерів.

Ви можете створити провайдерів, використовуючи методи `TracerProvider::builder()`, `LoggerProvider::builder()`, та `MeterProvider::builder()`.

У випадку [демонстраційного застосунку](#example-app), створіть файл з назвою `instrumentation.php` з наступним вмістом:

```php
<?php

use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\API\Trace\Propagation\TraceContextPropagator;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\Contrib\Otlp\MetricExporter;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogRecordProcessor;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;
use OpenTelemetry\SDK\Sdk;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Trace\Sampler\ParentBased;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;
use OpenTelemetry\SemConv\Attributes\ServiceAttributes;
use OpenTelemetry\SemConv\Incubating\Attributes\DeploymentIncubatingAttributes;
use OpenTelemetry\SemConv\Incubating\Attributes\ServiceIncubatingAttributes;

require 'vendor/autoload.php';

$resource = ResourceInfoFactory::emptyResource()->merge(ResourceInfo::create(Attributes::create([
    ServiceIncubatingAttributes::SERVICE_NAMESPACE => 'demo',
    ServiceAttributes::SERVICE_NAME => 'test-application',
    ServiceAttributes::SERVICE_VERSION => '0.1',
    DeploymentIncubatingAttributes::DEPLOYMENT_ENVIRONMENT_NAME => 'development',
])));
$spanExporter = new SpanExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$logExporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$reader = new ExportingReader(
    new MetricExporter(
        (new StreamTransportFactory())->create('php://stdout', 'application/json')
    )
);

$meterProvider = MeterProvider::builder()
    ->setResource($resource)
    ->addReader($reader)
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        new SimpleSpanProcessor($spanExporter)
    )
    ->setResource($resource)
    ->setSampler(new ParentBased(new AlwaysOnSampler()))
    ->build();

$loggerProvider = LoggerProvider::builder()
    ->setResource($resource)
    ->addLogRecordProcessor(
        new SimpleLogRecordProcessor($logExporter)
    )
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setMeterProvider($meterProvider)
    ->setLoggerProvider($loggerProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();
```

Включіть цей код на початку вашого файлу застосунку `index.php`:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');
require('instrumentation.php');

// ...
```

Для налагодження та локальної розробки, приклад експортує телеметрію в консоль. Після завершення налаштування ручного інструментування, вам потрібно налаштувати відповідний експортер для [експорту телеметричних даних застосунку](/docs/languages/php/exporters/) до одного або більше бекендів телеметрії.

Приклад також налаштовує обовʼязковий стандартний атрибут SDK `service.name`, який містить логічну назву сервісу, та необовʼязковий, але дуже рекомендований атрибут `service.version`, який містить версію API або реалізації сервісу.

Існують альтернативні методи налаштування атрибутів ресурсу. Для більш детальної інформації дивіться [Ресурси](/docs/languages/php/resources/).

#### Глобальні провайдери {#global-providers}

Протягом наступних прикладів ми зазвичай будемо отримувати глобально зареєстрованих провайдерів через `OpenTelemetry\API\Globals`:

```php
$tracerProvider = \OpenTelemetry\API\Globals::tracerProvider();
$meterProvider = \OpenTelemetry\API\Globals::meterProvider();
$loggerProvider = \OpenTelemetry\API\Globals::loggerProvider();
```

#### Завершення роботи {#shutdown}

Важливо, щоб метод `shutdown()` кожного провайдера виконувався при завершенні процесу PHP, щоб забезпечити скидання будь-якої черги телеметрії. У наведеному вище прикладі це було враховано за допомогою `setAutoShutdown(true)`.

Ви також можете використовувати `ShutdownHandler`, щоб зареєструвати функцію завершення роботи кожного провайдера як частину процесу завершення роботи PHP:

```php
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$tracerProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$meterProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$loggerProvider, 'shutdown']);
```

## Трейси {#traces}

### Ініціалізація трасування {#initialize-tracing}

> [!NB] Якщо ви інструментуєте бібліотеку, **пропустіть цей крок**.

Щоб увімкнути [трасування](/docs/concepts/signals/traces/) у вашому застосунку, вам потрібно
мати ініціалізований [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider), який дозволить вам створювати [`Tracer`](/docs/concepts/signals/traces/#tracer).

Якщо `TracerProvider` не створено, API OpenTelemetry для трасування будуть використовувати реалізацію no-op і не генеруватимуть дані.

Якщо ви дотримувалися інструкцій щодо [ініціалізації SDK](#initialize-the-sdk) вище, у вас вже налаштований `TracerProvider`. Ви можете продовжити з [отриманням трейсера](#acquiring-a-tracer).

### Отримання трейсера {#acquiring-a-tracer}

Будь-де у вашому застосунку, де ви пишете код ручного трасування, слід викликати `getTracer`, щоб отримати трейсер. Наприклад:

```php
$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'instrumentation-scope-name', //назва (обовʼязково)
  'instrumentation-scope-version', //версія
  'http://example.com/my-schema', //URL схеми
  ['foo' => 'bar'] //атрибути
);
```

Значення `instrumentation-scope-name` та `instrumentation-scope-version` повинні унікально ідентифікувати [Область інструментування](/docs/concepts/instrumentation-scope/), таку як пакунок, модуль або назва класу. Хоча назва є обовʼязковою, версія все ще рекомендована, попри те, що є необовʼязковою.

Зазвичай рекомендується викликати `getTracer` у вашому застосунку, коли це потрібно, а не експортувати екземпляр `tracer` до решти вашого застосунку. Це допомагає уникнути складніших проблем із завантаженням застосунку, коли залучені інші необхідні залежності.

У випадку [демонстраційного застосунку](#example-app), є два місця, де можна отримати трейсер з відповідною Областю Інструментування:

По-перше, у _файлі застосунку_ `index.php`:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use OpenTelemetry\API\Globals;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');
require('instrumentation.php');

$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'dice-server',
  '0.1.0',
  'https://opentelemetry.io/schemas/1.24.0'
);

$logger = new Logger('dice-server');
$logger->pushHandler(new StreamHandler('php://stdout', Logger::INFO));

$app = AppFactory::create();

$dice = new Dice();

$app->get('/rolldice', function (Request $request, Response $response) use ($logger, $dice, $tracer) {
// ...
}
```

І по-друге, у _файлі бібліотеки_ `dice.php`:

```php
<?php
use OpenTelemetry\API\Globals;
use OpenTelemetry\SemConv\TraceAttributes;

class Dice {

    private $tracer;

    function __construct() {
        $tracerProvider = Globals::tracerProvider();
        $this->tracer = $tracerProvider->getTracer(
          'dice-lib',
          '0.1.0',
          'https://opentelemetry.io/schemas/1.24.0'
        );
    }

    public function roll($rolls) {
        $result = [];
        for ($i = 0; $i < $rolls; $i++) {
            $result[] = $this->rollOnce();
        }
        return $result;
    }

    private function rollOnce() {
      $result = random_int(1, 6);
      return $result;
    }
}
```

### Створення відрізків {#create-spans}

Тепер, коли у вас є ініціалізовані [трейсери](/docs/concepts/signals/traces/#tracer), ви можете створювати [відрізки](/docs/concepts/signals/traces/#spans).

Код нижче ілюструє, як створити відрізок.

```php
<?php
public function roll($rolls) {
    $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
    $result = [];
    for ($i = 0; $i < $rolls; $i++) {
        $result[] = $this->rollOnce();
    }
    $span->end();
    return $result;
}
```

Зверніть увагу, що потрібно викликати `end()` для відрізка, інакше він не буде експортований.

Якщо ви дотримувалися інструкцій, використовуючи [прикладний застосунок](#example-app) до цього моменту, ви можете скопіювати код вище у ваш файл бібліотеки `dice.php`. Ви тепер повинні бачити відрізки, що генеруються вашим застосунком.

Запустіть ваш застосунок наступним чином, а потім надсилайте йому запити, відвідуючи <http://localhost:8080/rolldice?rolls=12> за допомогою вашого оглядача або `curl`.

```sh
php -S 8080 localhost
```

Через деякий час ви повинні побачити відрізки, надруковані в консолі `SpanExporter`, щось на кшталт цього:

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.namespace",
            "value": {
              "stringValue": "demo"
            }
          },
          {
            "key": "service.name",
            "value": {
              "stringValue": "test-application"
            }
          },
          {
            "key": "service.version",
            "value": {
              "stringValue": "0.1"
            }
          },
          {
            "key": "deployment.environment",
            "value": {
              "stringValue": "development"
            }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "dice-lib",
            "version": "0.1.0"
          },
          "spans": [
            {
              "traceId": "007a1e7a89f21f98b600d288b7d65390",
              "spanId": "c32797fc72c252d2",
              "flags": 1,
              "name": "rollTheDice",
              "kind": 1,
              "startTimeUnixNano": "1706111239077485365",
              "endTimeUnixNano": "1706111239077735657",
              "status": {}
            }
          ],
          "schemaUrl": "https://opentelemetry.io/schemas/1.24.0"
        }
      ]
    }
  ]
}
```

### Створення вкладених відрізків {#create-nested-spans}

Вкладені [відрізки](/docs/concepts/signals/traces/#spans) дозволяють відстежувати роботу, яка має вкладену природу. Наприклад, функція `rollOnce()` нижче представляє вкладену операцію. Наступний приклад створює вкладений відрізок, який відстежує `rollOnce()`:

```php
private function rollOnce() {
    $parent = OpenTelemetry\API\Trace\Span::getCurrent();
    $scope = $parent->activate();
    try {
        $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
        $result = random_int(1, 6);
        $span->end();
    } finally {
        $scope->detach();
    }
    return $result;
}
```

Ви _повинні_ зробити `detach` для активної області, якщо ви її активували.

### Отримання поточного відрізка {#get-the-current-span}

У наведеному вище прикладі ми отримали поточний відрізок, використовуючи наступний метод:

```php
$span = OpenTelemetry\API\Trace\Span::getCurrent();
```

### Отримання відрізка з контексту {#get-a-span-from-context}

Також може бути корисно отримати [відрізок](/docs/concepts/signals/traces/#spans) з даного контексту, який не обовʼязково є активним відрізком.

```php
$span = OpenTelemetry\API\Trace\Span::fromContext($context);
```

### Атрибути відрізка {#span-attributes}

[Атрибути](/docs/concepts/signals/traces/#attributes) дозволяють вам прикріплювати пари ключ/значення до [`Span`](/docs/concepts/signals/traces/#spans), щоб він містив більше інформації про поточну операцію, яку він відстежує.

```php
private function rollOnce() {
    $parent = OpenTelemetry\API\Trace\Span::getCurrent();
    $scope = $parent->activate();
    try {
        $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
        $result = random_int(1, 6);
        $span->setAttribute('dicelib.rolled', $result);
        $span->end();
    } finally {
        $scope->detach();
    }
    return $result;
}
```

#### Семантичні атрибути {#semantic-attributes}

Існують семантичні домовленості для відрізків, що представляють операції у відомих протоколах, таких як HTTP або виклики бази даних. Семантичні домовленості для цих відрізків визначені у специфікації на [Семантичні домовленості трасування](/docs/specs/semconv/general/trace/). У простому прикладі цього посібника можна використовувати атрибути вихідного коду.

Спочатку додайте семантичні домовленості як залежність до вашого застосунку:

```shell
composer require open-telemetry/sem-conv
```

Додайте наступне на початку вашого файлу:

```php
use OpenTelemetry\SemConv\Attributes\CodeAttributes;
```

Нарешті, ви можете оновити ваш файл, щоб включити семантичні атрибути:

```php
$span->setAttribute(CodeAttributes::CODE_FUNCTION_NAME, 'rollOnce');
$span->setAttribute(CodeAttributes::CODE_FILE_PATH, __FILE__);
```

### Створення відрізків з подіями {#create-spans-with-events}

[Відрізки](/docs/concepts/signals/traces/#spans) можуть бути анотовані з іменованими подіями (називаються [Події відрізка](/docs/concepts/signals/traces/#span-events)), які можуть містити нуль або більше [Атрибути відрізка](#span-attributes), кожен з яких сам по собі є парою ключ:значення, автоматично поєднаною з часовою міткою.

```php
$span->addEvent("Init");
...
$span->addEvent("End");
```

```php
$eventAttributes = Attributes::create([
    "operation" => "calculate-pi",
    "result" => 3.14159,
]);
$span->addEvent("End Computation", $eventAttributes);
```

### Створення відрізків з посиланнями {#create-spans-with-links}

[Відрізок](/docs/concepts/signals/traces/#spans) може бути повʼязаний з нуль або більше іншими відрізками, які є повʼязаними через [Посилання відрізка](/docs/concepts/signals/traces/#span-links). Посилання можуть бути використані для представлення пакетних операцій, де Відрізок був ініційований кількома ініціюючими Відрізками, кожен з яких представляє один вхідний елемент, що обробляється в пакеті.

```php
$span = $tracer->spanBuilder("span-with-links")
    ->addLink($parentSpan1->getContext())
    ->addLink($parentSpan2->getContext())
    ->addLink($parentSpan3->getContext())
    ->addLink($remoteSpanContext)
    ->startSpan();
```

Для більш детальної інформації про те, як читати контекст з віддалених процесів, дивіться [Поширення контексту](../propagation/).

### Встановлення статусу відрізка та запис помилок {#set-span-status-and-record-exceptions}

{{% include "span-status-preamble" %}}

Може бути гарною ідеєю записувати помилки, коли вони трапляються. Рекомендується робити це разом з [встановленням статусу відрізка](/docs/specs/otel/trace/api/#set-status).

Статус можна встановити в будь-який час до завершення відрізка:

```php
$span = $tracer->spanBuilder("my-span")->startSpan();
try {
  // зробити щось, що може зазнати невдачі
  throw new \Exception('uh-oh');
} catch (\Throwable $t) {
  $span->setStatus(\OpenTelemetry\API\Trace\StatusCode::STATUS_ERROR, "Щось пішло не так!");
  // Це захопить такі речі, як поточний стек викликів у спані.
  $span->recordException($t, ['exception.escaped' => true]);
  throw $t;
} finally {
  $span->end();
}
```

### Процесор відрізків {#span-processors}

OpenTelemetry пропонує різні процесори відрізків. `SimpleSpanProcessor` негайно пересилає завершені відрізки до експортера, тоді як `BatchSpanProcessor` групує їх і надсилає періодично.

```php
$tracerProvider = TracerProvider::builder()
  ->addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporterFactory()->create()))
  ->build();
```

### Транспорти {#transports}

Усі експортери вимагають `Transport`, який відповідає за надсилання телеметричних даних:

- `PsrTransport` — використовує клієнт PSR-18 для надсилання даних через HTTP
- `StreamTransport` — використовує потік для надсилання даних (наприклад, до файлу або `stdout`)
- `GrpcTransport` — використовує gRPC для надсилання даних, закодованих у protobuf

### Експортер {#exporter}

Дивіться [Експортери](/docs/languages/php/exporters)

## Метрики {#metrics}

OpenTelemetry можна використовувати для вимірювання та запису різних типів метрик з застосунку, які потім можуть бути [відправлені](/docs/specs/otel/metrics/sdk/#push-metric-exporter) до сервісу метрик, такого як OpenTelemetry Collector:

- counter
- async counter
- histogram
- async gauge
- up/down counter
- async up/down counter

Типи вимірювачів та їх використання пояснюються у [концепції метрик](/docs/concepts/signals/metrics/) документації.

### Налаштування {#setup}

Спочатку створіть `MeterProvider`:

```php
<?php

use OpenTelemetry\SDK\Metrics\MetricExporter\ConsoleMetricExporterFactory;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;

require 'vendor/autoload.php';

$reader = new ExportingReader((new ConsoleMetricExporterFactory())->create());

$meterProvider = MeterProvider::builder()
    ->addReader($reader)
    ->build();
```

### Синхронні вимірювачі {#synchronous-meters}

Синхронний вимірювач повинен бути вручну налаштований при зміні даних:

```php
$up_down = $meterProvider
    ->getMeter('demo_meter')
    ->createUpDownCounter('queued', 'jobs', 'Кількість завдань у черзі');
// завдання надходять
$up_down->add(5);
// завдання завершено
$up_down->add(-1);
// надходять ще завдання
$up_down->add(2);

$meterProvider->forceFlush();
```

Синхронні метрики експортуються, коли викликаються `forceFlush()` або `shutdown()` на провайдері вимірювачів.

<details>
<summary>Переглянути вивід</summary>

```json
{
  "resourceMetrics": [
    {
      "resource": {},
      "scopeMetrics": [
        {
          "scope": { "name": "demo_meter" },
          "metrics": [
            {
              "name": "queued",
              "description": "Кількість завдань у черзі",
              "unit": "jobs",
              "sum": {
                "dataPoints": [
                  {
                    "startTimeUnixNano": "1687332126443709851",
                    "timeUnixNano": "1687332126445544432",
                    "asInt": "6"
                  }
                ],
                "aggregationTemporality": "AGGREGATION_TEMPORALITY_DELTA"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

### Асинхронні вимірювачі {#asynchronous-meters}

Асинхронні вимірювачі є `observable`, наприклад, `ObservableGauge`. При реєстрації асинхронного вимірювача, ви надаєте одну або більше функцій зворотного виклику. Функції зворотного виклику будуть викликатися [читачем метрик](/docs/specs/otel/metrics/sdk/#periodic-exporting-metricreader) коли його метод `collect()` викликається, наприклад, на основі таймера циклу подій. Функції зворотного виклику відповідають за повернення поточних даних для вимірювача.

У цьому прикладі функції зворотного виклику виконуються кожного разу, коли виконується `$reader->collect()`:

```php
$queue = [
    'job1',
    'job2',
    'job3',
];
$reader = $meterProvider
    ->getMeter('demo_meter')
    ->createObservableGauge('queued', 'jobs', 'Кількість завдань у черзі')
    ->observe(static function (ObserverInterface $observer) use (&$queue): void {
        $observer->observe(count($queue));
    });
$reader->collect();
array_pop($queue);
$reader->collect();
```

<details>
<summary>Переглянути вивід</summary>

```json
{"resourceMetrics":[{"resource":{},"scopeMetrics":[{"scope":{"name":"demo_meter"},"metrics":[{"name":"queued","description":"Кількість завдань у черзі","unit":"jobs","gauge":{"dataPoints":[{"startTimeUnixNano":"1687331630161510994","timeUnixNano":"1687331630162989144","asInt":"3"}]}}]}]}]}
{"resourceMetrics":[{"resource":{},"scopeMetrics":[{"scope":{"name":"demo_meter"},"metrics":[{"name":"queued","description":"Кількість завдань у черзі","unit":"jobs","gauge":{"dataPoints":[{"startTimeUnixNano":"1687331630161510994","timeUnixNano":"1687331631164759171","asInt":"2"}]}}]}]}]}
```

</details>

## Логи {#logs}

Оскільки логування є зрілою та добре встановленою функцією, підхід [OpenTelemetry](/docs/concepts/signals/logs/) трохи відрізняється для цього сигналу.

Логер OpenTelemetry не призначений для використання безпосередньо, а скоріше для інтеграції в наявні бібліотеки логування. Таким чином, ви можете вибрати, щоб деякі або всі ваші логи застосунку надсилалися до сервісу, сумісного з OpenTelemetry, такого як [колектор](/docs/collector/).

### Налаштування {#setup-1}

Спочатку ми створюємо `LoggerProvider`:

```php
<?php

use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogRecordProcessor;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;

require 'vendor/autoload.php';

$exporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(new SimpleLogRecordProcessor($exporter))
    ->setResource(ResourceInfoFactory::emptyResource())
    ->build();
```

### Логування подій {#logging-events}

`EventLogger` може використовувати `Logger` для генерування лог подій:

```php
$logger = $loggerProvider->getLogger('demo', '1.0', 'http://schema.url', [/*attributes*/]);
$eventLogger = new EventLogger($logger, 'my-domain');
$record = (new LogRecord('hello world'))
    ->setSeverityText('INFO')
    ->setAttributes([/*attributes*/]);

$eventLogger->logEvent('foo', $record);
```

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
  "resourceLogs": [
    {
      "resource": {},
      "scopeLogs": [
        {
          "scope": {
            "name": "demo",
            "version": "1.0"
          },
          "logRecords": [
            {
              "observedTimeUnixNano": "1687496730010009088",
              "severityText": "INFO",
              "body": {
                "stringValue": "hello world"
              },
              "attributes": [
                {
                  "key": "event.name",
                  "value": {
                    "stringValue": "foo"
                  }
                },
                {
                  "key": "event.domain",
                  "value": {
                    "stringValue": "my-domain"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

### Інтеграції для сторонніх бібліотек логування {#integrations-for-third-party-logging-libraries}

#### Monolog

Ви можете використовувати [обробник monolog](https://packagist.org/packages/open-telemetry/opentelemetry-logger-monolog) для надсилання логів monolog до приймача, сумісного з OpenTelemetry. Спочатку встановіть бібліотеку monolog та обробник:

```shell
composer require \
  monolog/monolog \
  open-telemetry/opentelemetry-logger-monolog
```

Продовжуючи приклад логування вище:

```php
$handler = new \OpenTelemetry\Contrib\Logs\Monolog\Handler(
    $loggerProvider,
    \Psr\Log\LogLevel::ERROR,
);
$monolog = new \Monolog\Logger('example', [$handler]);

$monolog->info('hello, world');
$monolog->error('oh no', [
    'foo' => 'bar',
    'exception' => new \Exception('something went wrong'),
]);
```

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
  "resourceLogs": [
    {
      "resource": {},
      "scopeLogs": [
        {
          "scope": {
            "name": "monolog"
          },
          "logRecords": [
            {
              "timeUnixNano": "1687496945597429000",
              "observedTimeUnixNano": "1687496945598242048",
              "severityNumber": "SEVERITY_NUMBER_ERROR",
              "severityText": "ERROR",
              "body": {
                "stringValue": "oh no"
              },
              "attributes": [
                {
                  "key": "channel",
                  "value": {
                    "stringValue": "example"
                  }
                },
                {
                  "key": "context",
                  "value": {
                    "arrayValue": {
                      "values": [
                        {
                          "stringValue": "bar"
                        },
                        {
                          "arrayValue": {
                            "values": [
                              {
                                "stringValue": "Exception"
                              },
                              {
                                "stringValue": "something went wrong"
                              },
                              {
                                "intValue": "0"
                              },
                              {
                                "stringValue": "/usr/src/myapp/logging.php:31"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

## Обробка помилок {#error-handling}

Стандартно, OpenTelemetry буде логувати помилки та попередження через функцію PHP [`error_log`](https://www.php.net/manual/en/function.error-log.php). Докладність можна контролювати або вимикати за допомогою налаштування `OTEL_LOG_LEVEL`.

Змінна `OTEL_PHP_LOG_DESTINATION` може бути використана для контролю місця призначення логів або повного вимкнення логування помилок. Дійсні значення: `default`, `error_log`, `stderr`, `stdout`, `psr3`, або `none`. `default` (або якщо змінна не встановлена), буде використовувати `error_log`, якщо не налаштований логер PSR-3:

```php
$logger = new \Example\Psr3Logger(LogLevel::INFO);
\OpenTelemetry\API\LoggerHolder::set($logger);
```

Для більш тонкого контролю та спеціального оброблення, можна застосовувати власні обробники та фільтри до логера PSR-3 (якщо логер пропонує таку можливість).

## Наступні кроки {#next-steps}

Вам також потрібно налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/php/exporters) до одного або більше бекендів телеметрії.
