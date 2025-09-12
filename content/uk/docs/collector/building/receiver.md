---
title: Створення приймача
weight: 20
aliases: [/docs/collector/trace-receiver/]
default_lang_commit: 4f2df45798ecb448e9029f155e8eaa64d23555ff
# prettier-ignore
cSpell:ignore: backendsystem crand debugexporter loggingexporter mapstructure pcommon pdata protogen ptrace rcvr receiverfactory struct tailtracer telemetrygen uber бутстрап викликача викликачем викликаючого задіяних тікером
---

<!-- markdownlint-disable heading-increment no-duplicate-heading -->

Якщо ви читаєте цей підручник, ви, ймовірно, вже маєте уявлення про концепції OpenTelemetry, повʼязані з [розподіленим трасуванням](/docs/concepts/signals/traces/).

Ось визначення цих концепцій згідно з OpenTelemetry:

> Трейси відстежують прогрес одного запиту, який називається трейсом, коли він обробляється службами, що складають застосунок. Запит може бути ініційований користувачем або застосунком. Розподілене трасування — це форма трасування, яка перетинає межі процесу, мережі та безпеки.

Хоча визначення здається дуже орієнтованим на застосунки, ви можете використовувати модель трасування OpenTelemetry як спосіб представлення запиту та швидкого розуміння його тривалості та деталей кожного кроку, залученого до його виконання.

Припускаючи, що у вас вже є система, яка генерує якийсь вид телеметрії трасування, [OpenTelemetry Collector](/docs/collector/) є дверима, які допоможуть вам зробити її доступною у світі OTel.

У межах Collector приймач трейсів має роль отримувати та конвертувати вашу телеметрію запитів з її оригінального формату в модель трейсів OTel, щоб інформація могла бути належним чином оброблена через конвеєри Collector.

Для реалізації приймача трейсів вам знадобляться наступні компоненти:

- Реалізація `Config`, щоб дозволити приймачу трейсів збирати та перевіряти свої конфігурації в межах config.yaml Collector.

- Реалізація `receiver.Factory`, щоб Collector міг належним чином створити компонент приймача трейсів.

- Реалізація `TracesReceiver`, яка відповідає за збір телеметрії, її конвертацію у внутрішнє представлення трейсів і передачу інформації наступному споживачу в конвеєрі.

У цьому підручнику ми створимо зразок приймача трейсів з назвою `tailtracer`, який симулює операцію витягування та генерує трейси як результат цієї операції. Наступні розділи проведуть вас через процес реалізації вищезазначених кроків для створення приймача, тож почнемо.

## Налаштування середовища розробки та тестування приймача {#setting-up-receiver-development-and-testing-environment}

Спочатку скористайтесь підручником [Створення власного Collectorʼа](/docs/collector/custom-collector), щоб створити екземпляр Collector з назвою `otelcol-dev`; все, що вам потрібно, це скопіювати `builder-config.yaml`, описаний у [Кроці 2](/docs/collector/custom-collector#step-2---create-a-builder-manifest-file), і запустити збирач. У результаті у вас повинна зʼявитися структура тек, як показано нижче:

```text
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

Для належного тестування вашого приймача трейсів вам може знадобитися бекенд розподіленого трасування, щоб Collector міг надсилати телеметрію до нього. Ми будемо використовувати [Jaeger](https://www.jaegertracing.io/docs/latest/getting-started/), якщо у вас немає запущеного екземпляра `Jaeger`, ви можете легко запустити його за допомогою Docker з наступною командою:

```sh
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 14317:4317 \
  -p 14318:4318 \
  jaegertracing/all-in-one:1.41
```

Після запуску контейнера ви можете отримати доступ до інтерфейсу Jaeger за адресою: <http://localhost:16686/>

Тепер створіть файл конфігурації Collector з назвою `config.yaml`, щоб налаштувати компоненти та конвеєри Collector.

```sh
touch config.yaml
```

Поки що вам потрібен лише базовий конвеєр трейсів з приймачем `otlp`, експортерами `otlp` та `debug`[^1], і, за бажанням, процесором `batch`. Ось як повинен виглядати ваш файл `config.yaml`:

> config.yaml

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:

exporters:
  # ЗАУВАЖЕННЯ: До версії v0.86.0 використовуйте `logging` замість `debug`.
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
```

> Примітка: тут ми використовуємо прапорець `insecure` у конфігурації експортера `otlp` для простоти; ви повинні використовувати сертифікати TLS для захищеного звʼязку або mTLS для взаємної автентифікації при запуску Collector у промисловій експлуатації, дотримуючись цього [керівництва](/docs/collector/configuration/#setting-up-certificates).

Щоб перевірити, чи правильно налаштований Collector, виконайте цю команду:

```sh
./otelcol-dev/otelcol-dev --config config.yaml
```

Вихід може виглядати так:

```log
2023-11-08T18:38:37.183+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-08T18:38:37.185+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-08T18:38:37.185+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-08T18:38:37.186+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-08T18:38:37.186+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-08T18:38:37.186+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}

<OMITTED>

2023-11-08T18:38:37.189+0800	info	service@v0.88.0/service.go:169	Everything is ready. Begin running and processing data.
2023-11-08T18:38:37.189+0800	info	zapgrpc/zapgrpc.go:178	[core] [Server #3 ListenSocket #4] ListenSocket created	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1 SubChannel #2] Subchannel Connectivity change to READY	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [pick-first-lb 0x140005efdd0] Received SubConn state update: 0x140005eff80, {ConnectivityState:READY ConnectionError:<nil>}	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
```

Якщо все пройшло добре, екземпляр Collector повинен бути запущений і працювати.

Ви можете використовувати [telemetrygen](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen), щоб додатково перевірити налаштування. Наприклад, відкрийте іншу консоль і виконайте наступні команди:

```sh
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest

telemetrygen traces --otlp-insecure --traces 1
```

Ви повинні побачити детальні журнали в консолі та трейси в інтерфейсі Jaeger за URL: <http://localhost:16686/>.

Натисніть <kbd>Ctrl + C</kbd>, щоб зупинити екземпляр Collector у консолі Collector.

## Налаштування модуля Go {#setting-up-go-module}

Кожен компонент Collector повинен бути створений як модуль Go, створімо теку `tailtracer`, щоб розмістити наш проєкт приймача, і ініціалізуємо його як модуль Go.

```sh
mkdir tailtracer
cd tailtracer
go mod init github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer
```

> Примітка:
>
> 1. Шлях модуля вище є макетом, який може бути вашим бажаним приватним або публічним шляхом.
> 2. Ознайомтесь з [кодом trace-receiver](https://github.com/rquedas/otel4devs/tree/main/collector/receiver/trace-receiver).

Рекомендується увімкнути [Workspaces](https://go.dev/doc/tutorial/workspaces) у Go, оскільки ми будемо керувати кількома модулями Go: `otelcol-dev` і `tailtracer`, а можливо, і більше компонентів з часом.

```sh
cd ..
go work init
go work use otelcol-dev
go work use tailtracer
```

## Проєктування та перевірка налаштувань приймача {#designing-and-validating-receiver-settings}

Приймач може мати деякі налаштовувані параметри, які можна встановити через файл конфігурації Collector.

Приймач `tailtracer` матиме наступні налаштування:

- `interval`: рядок, що представляє інтервал часу (у хвилинах) між операціями витягування телеметрії
- `number_of_traces`: кількість згенерованих трейсів для кожного інтервалу

Ось як виглядатимуть налаштування приймача `tailtracer`:

```yaml
receivers:
  tailtracer: # цей рядок представляє ідентифікатор вашого приймача
    interval: 1m
    number_of_traces: 1
```

Створіть файл під назвою `config.go` у теці `tailtracer`, де ви напишете весь код для підтримки налаштувань вашого приймача.

```sh
touch tailtracer/config.go
```

Щоб реалізувати аспекти конфігурації приймача, вам потрібно створити структуру `Config`. Додайте наступний код до вашого файлу `config.go`:

```go
package tailtracer

type Config struct{

}
```

Щоб надати вашому приймачу доступ до його налаштувань, структура `Config` повинна мати поле для кожного з налаштувань приймача.

Ось як виглядатиме файл `config.go` після реалізації вищезазначених вимог.

> tailtracer/config.go

```go
package tailtracer

// Config представляє налаштування конфігурації приймача в межах config.yaml Collector
type Config struct {
   Interval    string `mapstructure:"interval"`
   NumberOfTraces int `mapstructure:"number_of_traces"`
}
```

{{% alert title="Перевірте свою роботу" %}}

- Додано поля `Interval` та `NumberOfTraces`, щоб мати доступ до їх значень з config.yaml.

{{% /alert %}}

Тепер, коли у вас є доступ до налаштувань, ви можете надати будь-який вид перевірки для цих значень, реалізувавши метод `Validate` відповідно до необовʼязкового інтерфейсу [ConfigValidator](https://github.com/open-telemetry/opentelemetry-collector/blob/677b87e3ab5c615bc3f93b8f99bb1fa5be951751/component/config.go#L28).

У цьому випадку значення `interval` буде необовʼязковим (ми розглянемо стандартну генерацію значень пізніше), але коли воно визначено, повинно бути не менше 1 хвилини (1m), а значення `number_of_traces` буде обовʼязковим. Ось як виглядає файл config.go після реалізації методу `Validate`.

> tailtracer/config.go

```go
package tailtracer

import (
	"fmt"
	"time"
)

// Config представляє налаштування конфігурації приймача в межах config.yaml Collector
type Config struct {
	Interval       string `mapstructure:"interval"`
	NumberOfTraces int    `mapstructure:"number_of_traces"`
}

// Validate перевіряє, чи є конфігурація приймача дійсною
func (cfg *Config) Validate() error {
	interval, _ := time.ParseDuration(cfg.Interval)
	if interval.Minutes() < 1 {
		return fmt.Errorf("коли визначено, інтервал повинен бути встановлений на принаймні 1 хвилину (1m)")
	}

	if cfg.NumberOfTraces < 1 {
		return fmt.Errorf("number_of_traces повинен бути більше або дорівнювати 1")
	}
	return nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпортовано пакет `fmt`, щоб належним чином форматувати повідомлення про помилки.
- Додано метод `Validate` до структури Config, щоб перевірити, чи значення налаштування `interval` становить принаймні 1 хвилину (1m) і чи значення налаштування `number_of_traces` більше або дорівнює 1. Якщо це не так, Collector згенерує помилку під час свого запуску та відобразить повідомлення відповідно.

{{% /alert %}}

Якщо ви хочете детальніше ознайомитися зі структурами та інтерфейсами, що беруть участь у конфігураційних аспектах компонента, перегляньте файл [component/config.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/component/config.go>)всередині проєкту Collector на GitHub.

## Реалізація інтерфейсу receiver.Factory {#implementing-the-receiverfactory-interface}

Приймач `tailtracer` повинен надати реалізацію `receiver.Factory`, і хоча ви знайдете інтерфейс `receiver.Factory` (ви можете знайти його визначення у файлі [receiver/receiver.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/receiver/receiver.go#L58>) всередині проєкту Collector), правильний спосіб надати реалізацію — це використання функцій, доступних у пакеті `go.opentelemetry.io/collector/receiver`.

Створіть файл з назвою `factory.go`:

```sh
touch tailtracer/factory.go
```

Тепер дотримуймося домовленості та додамо функцію з назвою `NewFactory()`, яка буде відповідати за створення фабрики `tailtracer`. Додайте наступний код до вашого файлу `factory.go`:

```go
package tailtracer

import (
	"go.opentelemetry.io/collector/receiver"
)

// NewFactory створює фабрику для приймача tailtracer.
func NewFactory() receiver.Factory {
	return nil
}
```

Щоб створити фабрику приймача `tailtracer`, ви будете використовувати наступну функцію з пакета `receiver`:

```go
func NewFactory(cfgType component.Type, createDefaultConfig component.CreateDefaultConfigFunc, options ...FactoryOption) Factory
```

Метод `receiver.NewFactory()` створює та повертає `receiver.Factory` і вимагає наступних параметрів:

- `component.Type`: унікальний рядковий ідентифікатор вашого приймача для всіх компонентів колектора.

- `component.CreateDefaultConfigFunc`: посилання на функцію, яка повертає екземпляр component.Config для вашого приймача.

- `...FactoryOption`: фрагмент `receiver.FactoryOption`, який визначатиме, який тип сигналу здатен обробляти ваш приймач.

Тепер реалізуємо код для підтримки всіх параметрів, які вимагає `receiver.NewFactory()`.

## Визначення та провадження стандартних налаштувань {#identifying-and-providing-default-settings}

Раніше ми згадували, що параметр `interval` для приймача `tailtracer` буде необовʼязковим, у такому випадку вам потрібно буде вказати для нього стандартне значення, щоб його можна було використовувати як частину стандартних налаштувань.

Додайте наступний код до вашого файлу `factory.go`:

```go
var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)
```

Що стосується стандартних налаштувань, вам просто потрібно додати функцію, яка повертає `component.Config` з стандартними конфігураціями для приймача `tailtracer`.

Щоб зробити це, додайте наступний код до вашого файлу `factory.go`:

```go
func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}
```

Після цих двох змін ви помітите, що деякі імпортовані дані відсутні, тому ось як має виглядати ваш файл `factory.go` з правильним імпортом:

> tailtracer/factory.go

```go
package tailtracer

import (
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

// NewFactory створює фабрику для приймача tailtracer.
func NewFactory() receiver.Factory {
	return nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпорт пакету `time` для підтримки типу time.Duration для defaultInterval.
- Імпорт пакету `go.opentelemetry.io/collector/component`, у якому оголошено `component.Config`.
- Імпорт пакета `go.opentelemetry.io/collector/receiver`, у якому оголошено `receiver.Factory`.
- Додано константу `time.Duration` з назвою `defaultInterval`, яка представлятиме стандартне значення для параметра `Interval` нашого приймача. Ми встановимо стандартне значення на 1 хвилину, отже, присвоїмо `1 * time.Minute` як її значення.
- Додано функцію `createDefaultConfig`, яка відповідає за повернення реалізації component.Config, яка у цьому випадку буде екземпляром нашої структури `tailtracer.Config`.
- Поле `tailtracer.Config.Interval` було ініціалізовано константою `defaultInterval`.

{{% /alert %}}

## Визначення можливостей приймача {#specifying-the-receivers-capabilities}

Компонент приймача може обробляти трейси, метрики та логи. Фабрика приймача відповідає за визначення можливостей, які буде надавати приймач.

Оскільки темою цього підручника є трасування, ми увімкнемо приймач `tailtracer` для роботи лише з трасуванням. Пакет `receiver` надає наступні функції та типи, які допомагають фабриці описати можливості обробки трасування:

```go
func WithTraces(createTracesReceiver CreateTracesFunc, sl component.StabilityLevel) FactoryOption
```

Метод `receiver.WithTraces()` створює та повертає `receiver.FactoryOption` і вимагає наступних параметрів:

- `createTracesReceiver`: Посилання на функцію, яка відповідає типу `receiver.CreateTracesFunc`. Тип `receiver.CreateTracesFunc` є вказівником на функцію, яка відповідає за створення та повернення екземпляру `receiver.Traces` і вимагає наступних параметрів:
- `context.Context`: посилання на `context.Context` колектора, щоб ваш приймач трейсів міг належним чином керувати контекстом виконання.
- `receiver.Settings`: посилання на деякі з налаштувань колектора, згідно з якими створено ваш приймач.
- `component.Config`: посилання на налаштування конфігурації приймача, передані збирачем на фабриці, щоб він міг коректно зчитувати свої налаштування з конфігурації збирача.
- `consumer.Traces`: посилання на наступний `consumer.Traces` у конвеєрі, до якого будуть надходити отримані траси. Це або процесор, або експортер.

Почніть з додавання коду завантажувача, щоб правильно реалізувати вказівник функції `receiver.CreateTracesFunc`. Додайте наступний код до вашого файлу `factory.go`:

```go
func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}
```

Тепер у вас є всі необхідні компоненти для успішного створення фабрики приймачів за допомогою функції `receiver.NewFactory`. Оновіть функцію `NewFactory()` у вашому файлі `factory.go` наступним чином:

```go
// NewFactory створює фабрику для приймача tailtracer.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

Після цих змін ви помітите, що деякі імпортовані дані відсутні, тому ось як має виглядати ваш файл `factory.go` з правильним імпортом:

> tailtracer/factory.go

```go
package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}

// NewFactory створює фабрику для приймача tailtracer.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпорт пакету `context` для підтримки типу `context.Context`, на який посилається функція `createTracesReceiver`.
- Імпорт пакету `go.opentelemetry.io/collector/consumer` для підтримки типу `consumer.Traces`, на який посилається функція `createTracesReceiver`.
- Оновлено функцію `NewFactory()` таким чином, щоб вона повертала `receiver.Factory`, згенерований викликом `receiver.NewFactory()`, з необхідними параметрами. Згенерована фабрика приймачів буде здатна обробляти трейси через виклик `receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha)`.

{{% /alert %}}

## Реалізація компонента receiver {#implementing-the-receiver-component}

Наразі всі API приймача оголошено у файлі [receiver/receiver.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/receiver/receiver.go>) у проєкті колектора, відкрийте цей файл і витратьте хвилину на перегляд усіх інтерфейсів.

Зверніть увагу, що `receiver.Traces` (і його родичі `receiver.Metrics` і `receiver.Logs`) на даний момент не описує жодних специфічних методів, окрім тих, які він "успадкував" від `component.Component`.

Це може здатися дивним, але памʼятайте, що API колектора було розроблено так, щоб його можна було розширювати, а компоненти та їхні сигнали можуть розвиватися різними шляхами, тому ці інтерфейси існують для того, щоб допомогти підтримати це.

Отже, щоб створити `receiver.Traces`, вам просто потрібно реалізувати наступні методи, описані в інтерфейсі `component.Component`:

```go
Start(ctx context.Context, host Host) error
Shutdown(ctx context.Context) error
```

Обидва методи фактично діють як обробники подій, що використовуються збирачем для звʼязку зі своїми компонентами в рамках їх життєвого циклу.

Метод `Start()` представляє собою сигнал збирача, який вказує компоненту розпочати його обробку. У рамках цієї події Колектор передасть наступну інформацію:

- `context.Context`: Здебільшого приймач буде обробляти довготривалу операцію, тому рекомендується ігнорувати цей контекст і фактично створювати новий з context.Background().
- `Host`: Хост призначений для забезпечення звʼязку приймача з хостом колектора після його запуску.

Функція `Shutdown()` є сигналом колектора, який повідомляє компоненту, що сервіс завершує роботу, і тому компонент повинен зупинити його обробку та виконати всі необхідні роботи з очищення:

- `context.Context`: контекст, переданий колектором як частина операції завершення роботи.

Реалізацію буде розпочато зі створення нового файлу з назвою `trace-receiver.go` у теці `tailtracer`:

```sh
touch tailtracer/trace-receiver.go
```

А потім додайте оголошення до типу з назвою `tailtracerReceiver`, як показано нижче:

```go
type tailtracerReceiver struct{

}
```

Тепер, коли у вас є тип `tailtracerReceiver`, ви можете реалізувати методи `Start()` та `Shutdown()`, щоб тип приймача був сумісним з інтерфейсом `receiver.Traces`.

> tailtracer/trace-receiver.go

```go
package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	return nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпорт пакунку `context`, у якому оголошено тип та функції `Context`.
- Імпорт пакунка `go.opentelemetry.io/collector/component`, у якому оголошено тип `Host`.
- Додано bootstrap-реалізацію методу `Start(ctx context.Context, host component.Host)` для узгодження з інтерфейсом `receiver.Traces`.
- Додано бутстрап-реалізацію методу `Shutdown(ctx context.Context)` для відповідності інтерфейсу `receiver.Traces`.

{{% /alert %}}

Метод `Start()` передає 2 посилання (`context.Context` та `component.Host`), які вашому приймачу може знадобитися зберегти, щоб їх можна було використати як частину операцій обробки.

Посилання `context.Context` слід використовувати для створення нового контексту для підтримки операцій обробки вашого приймача, і у цьому випадку вам потрібно буде вирішити, як найкраще обробляти скасування контексту, щоб ви могли завершити його належним чином як частину завершення роботи компонента у методі `Shutdown()`.

Параметр `component.Host` може бути корисним протягом усього життєвого циклу приймача, тому вам слід зберігати це посилання у вашому типі `tailtracerReceiver`.

Ось як виглядатиме оголошення типу `tailtracerReceiver` після того, як ви додасте поля для зберігання посилань, запропонованих вище:

```go
type tailtracerReceiver struct {
	host   component.Host
	cancel context.CancelFunc
}
```

Тепер вам потрібно оновити методи `Start()`, щоб одержувач міг правильно ініціалізувати власний контекст обробки і щоб функція скасування зберігалася у полі `cancel`, а також ініціалізувати значення поля `host`. Ви також оновите метод `Stop()`, щоб завершити обробку контексту викликом функції `cancel`.

Ось як виглядає файл `trace-receiver.go` після внесених змін:

> tailtracer/trace-receiver.go

```go
package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
	host   component.Host
	cancel context.CancelFunc
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	if tailtracerRcvr.cancel != nil {
		tailtracerRcvr.cancel()
	}
	return nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Оновлено метод `Start()`, додаванням до поля `host` ініціалізації переданим колектором посиланням `component.Host` та до поля функції `cancel` скасування на основі нового контексту, створеного за допомогою `context.Background()` (відповідно до рекомендацій документації API колектора).
- Оновлено метод `Shutdown()` шляхом додавання виклику функції скасування контексту `cancel()`.

{{% /alert %}}

## Зберігання інформації, переданої фабрикою приймача {#keeping-information-passed-by-the-receivers-factory}

Тепер, коли ви реалізували методи інтерфейсу `receiver.Traces`, ваш компонент приймача `tailtracer` готовий до використання та повернення даних його фабрикою.

Відкрийте файл `tailtracer/factory.go` і перейдіть до функції `createTracesReceiver()`. Зверніть увагу, що фабрика передасть у параметрах функції `createTracesReceiver()` посилання на те, що насправді потрібно вашому приймачу для коректної роботи, наприклад, його конфігураційні параметри (`component.Config`), наступний `Consumer` у конвеєрі, який споживатиме згенеровані траси (`consumer.Traces`), а також лог-файл колектора, щоб приймач `tailtracer` міг додавати до нього значущі події (`receiver.Settings`).

Враховуючи, що вся ця інформація буде доступна приймачу лише в момент його створення фабрикою, тип `tailtracerReceiver` потребуватиме полів для зберігання цієї інформації та використання її на інших етапах життєвого циклу.

Ось як виглядає файл `trace-receiver.go` з оновленим оголошенням типу `tailtracerReceiver`:

> tailtracer/trace-receiver.go

```go
package tailtracer

import (
	"context"
	"time"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.uber.org/zap"
)

type tailtracerReceiver struct {
	host         component.Host
	cancel       context.CancelFunc
	logger       *zap.Logger
	nextConsumer consumer.Traces
	config       *Config
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	if tailtracerRcvr.cancel != nil {
		tailtracerRcvr.cancel()
	}
	return nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпорт пакета `go.opentelemetry.io/collector/consumer`, в якому оголошуються типи та інтерфейси споживачів конвеєра.
- Імпорт пакунка `go.uber.org/zap`, який використовується колектором для налагодження.
- Додано поле `zap.Logger` з іменем `logger`, щоб мати доступ до посилання на логер збирача з приймача.
- Додано поле `consumer.Traces` з іменем `nextConsumer`, щоб ми могли передавати трейси, згенеровані приймачем `tailtracer`, наступному споживачеві, оголошеному у конвеєрі колектора.
- Додано поле `Config` з іменем `config`, щоб мати доступ до параметрів конфігурації приймача, визначених у конфігурації колектора.
- Додано змінну з іменем `interval`, яку буде ініціалізовано як `time.Duration` на основі значення параметра `interval` приймача `tailtracer`, визначеного у конфігурації колектора.
- Додано функцію `go()` для реалізації механізму `ticker`, щоб наш приймач міг генерувати трейси щоразу, коли `ticker` досягає часу, визначеного змінною `interval`, а також використано поле `tailtracerRcvr.logger` для генерування інформаційного повідомлення щоразу, коли приймач має генерувати трейси.

{{% /alert %}}

Тип `tailtracerReceiver` тепер готовий до створення екземплярів і зберігатиме всю значущу інформацію, передану його фабрикою.

Відкрийте файл `tailtracer/factory.go` і перейдіть до функції `createTracesReceiver()`.

Приймач створюється лише тоді, коли він оголошений як компонент у конвеєрі, і фабрика відповідає за те, щоб переконатися, що наступний споживач (процесор або експортер) у конвеєрі є дійсним, інакше вона повинна згенерувати помилку.

Функція `createTracesReceiver()` потребуватиме захисного виразу для такої перевірки.

Вам також знадобляться змінні для правильної ініціалізації полів `config` та `logger` екземпляра `tailtracerReceiver`.

Ось як виглядає файл `factory.go` з оновленою функцією `createTracesReceiver()`:

> tailtracer/factory.go

```go
package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {

	logger := params.Logger
	tailtracerCfg := baseCfg.(*Config)

	traceRcvr := &tailtracerReceiver{
		logger:       logger,
		nextConsumer: consumer,
		config:       tailtracerCfg,
	}

	return traceRcvr, nil
}

// NewFactory створює фабрику для приймача tailtracer.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

{{% alert title="Перевірте свою роботу" %}}

- Додано змінну з назвою `logger` та ініціалізовано її логером колектора, який доступний у вигляді поля з назвою `Logger` у посиланні `receiver.Settings`.
- Додано змінну `tailtracerCfg` та ініціалізовано її приведенням посилання `component.Config` до приймача `tailtracer` `Config`.
- Додано змінну `traceRcvr` та ініціалізовано її екземпляром `tailtracerReceiver` з використанням інформації фабрики, що зберігається у змінних.
- Оновлено інструкцію повернення, щоб вона включала екземпляр `traceRcvr`.

{{% /alert %}}

До цього моменту кістяк приймача був повністю реалізований.

## Оновлення процесу ініціалізації колектора приймачем {#updating-the-collectors-initialization-process-with-the-receiver}

Для того, щоб приймач міг брати участь у конвеєрі колектора, нам потрібно внести деякі зміни до згенерованого файлу `otelcol-dev/components.go`, де реєструються та створюються всі компоненти колектора.

Екземпляр фабрики приймача `tailtracer` потрібно додати до map `factories`, щоб колектор міг завантажити його належним чином під час ініціалізації.

Ось як виглядає файл `components.go` після внесення відповідних змін:

> otelcol-dev/components.go

```go
// Код, згенерований "go.opentelemetry.io/collector/cmd/builder". НЕ РЕДАГУВАТИ.

package main

import (
	"go.opentelemetry.io/collector/exporter"
	"go.opentelemetry.io/collector/extension"
	"go.opentelemetry.io/collector/otelcol"
	"go.opentelemetry.io/collector/processor"
	"go.opentelemetry.io/collector/receiver"
	debugexporter "go.opentelemetry.io/collector/exporter/debugexporter"
	otlpexporter "go.opentelemetry.io/collector/exporter/otlpexporter"
	batchprocessor "go.opentelemetry.io/collector/processor/batchprocessor"
	otlpreceiver "go.opentelemetry.io/collector/receiver/otlpreceiver"
	tailtracer "github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer" // новий доданий рядок
)

func components() (otelcol.Factories, error) {
	var err error
	factories := otelcol.Factories{}

	factories.Extensions, err = otelcol.MakeFactoryMap[extension.Factory](
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Receivers, err = otelcol.MakeFactoryMap[receiver.Factory](
		otlpreceiver.NewFactory(),
		tailtracer.NewFactory(), // новий доданий рядок
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Exporters, err = otelcol.MakeFactoryMap[exporter.Factory](
		debugexporter.NewFactory(),
		otlpexporter.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Processors, err = otelcol.MakeFactoryMap[processor.Factory](
		batchprocessor.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	return factories, nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпорт модуля приймача `github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer`, в якому знаходяться типи приймачів та їх функції.
- Додано виклик `tailtracer.NewFactory()` як параметр виклику `otelcol.MakeFactoryMap()`, щоб ваша фабрика приймача `tailtracer` була належним чином додана до map `factories`.

{{% /alert %}}

## Запуск та налагодження приймача {#running-and-debugging-the-receiver}

Переконайтеся, що файл `config.yaml` колектора було оновлено належним чином, а приймач `tailtracer` сконфігуровано як один з приймачів, який використовується у конвеєрі (конвеєрах).

> config.yaml

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
  tailtracer: # цей рядок є ідентифікатором вашого приймача
    interval: 1m
    number_of_traces: 1

processors:
  batch:

exporters:
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp, tailtracer]
      processors: [batch]
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
```

Давайте використаємо команду `go run`, а не згенерований раніше бінарний файл `./otelcol-dev/otelcol-dev`, щоб запустити оновлений Колектор, оскільки в `otelcol-dev/components.go` були внесені зміни до коду.

```sh
go run ./otelcol-dev --config config.yaml
```

Вивід повинен мати такий вигляд:

```log
2023-11-08T21:38:36.621+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-08T21:38:36.621+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-08T21:38:36.621+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-08T21:38:36.621+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-08T21:38:36.621+0800	debug	processor@v0.88.0/processor.go:287	Stable component.	{"kind": "processor", "name": "batch", "pipeline": "traces"}
2023-11-08T21:38:36.621+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-08T21:38:36.621+0800	debug	receiver@v0.88.0/receiver.go:294	Alpha component. May change in the future.	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-08T21:38:36.622+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-08T21:38:36.622+0800	info	extensions/extensions.go:33	Starting extensions...

<OMITTED>

2023-11-08T21:38:36.636+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
2023-11-08T21:39:36.626+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-08T21:40:36.626+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
...
```

Як ви можете бачити з логів, `tailtracer` було успішно ініціалізовано, і щохвилини зʼявлятиметься одне повідомлення `I should start processing traces now!`, яке викликається фіктивним тікером у файлі `tailtracer/trace-receiver.go`.

> Примітка: ви завжди можете зупинити процес, натиснувши <kbd>Ctrl + C</kbd> у терміналі колектора.

Звичайно, ви можете використовувати вашу улюблену IDE для налагодження приймача так само, як ви зазвичай налагоджуєте проєкти на Go. Ось простий файл `launch.json для [Visual Studio Code](https://code.visualstudio.com/) для ознайомлення:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch otelcol-dev",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}/otelcol-dev",
      "args": ["--config", "${workspaceFolder}/config.yaml"]
    }
  ]
}
```

В якості важливого етапу, давайте подивимося, як виглядає структура тек на даний момент:

```console
.
├── builder-config.yaml
├── config.yaml
├── go.work
├── go.work.sum
├── ocb
├── otelcol-dev
│   ├── components.go
│   ├── components_test.go
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── main_others.go
│   ├── main_windows.go
│   └── otelcol-dev
└── tailtracer
    ├── config.go
    ├── factory.go
    ├── go.mod
    └── trace-receiver.go
```

У наступному розділі ви дізнаєтеся більше про модель даних OpenTelemetry Trace, щоб приймач `tailtracer` нарешті зміг генерувати повноцінні трейси!

## Модель даних трасування колектора {#the-collectors-trace-data-model}

Ви можете ознайомитись з трасуванням OpenTelemetry, використовуючи SDK та інструментарій програми, щоб бачити та оцінювати ваші трейси в розподіленому бекенді трасування, такому як Jaeger.

Ось як виглядає трейс в Jaeger:

![Трасування в Jaeger](/img/docs/tutorials/Jaeger.jpeg)

Хоча це і трейс Jaeger, але він був згенерований конвеєром трейсів у Колекторі, тому ви можете використати його, щоб дізнатися деякі речі про модель даних трейсів OTel:

- Трейс складається з одного або декількох відрізків, структурованих в рамках ієрархії для представлення залежностей.
- Відрізки можуть представляти операції в межах сервісу та/або між сервісами.

Створення трейсів в приймачі трейсів буде дещо відрізнятися від того, як ви робите це за допомогою SDK, тому давайте почнемо розглядати концепції високого рівня.

### Робота з Resource {#working-with-resources}

У світі OTel вся телеметрія генерується `Resource`, ось визначення відповідно до [OTel spec](/docs/specs/otel/resource/sdk):

> `Resource` — це незмінне представлення сутності, що генерує телеметрію, у вигляді атрибутів. Наприклад, процес, що генерує телеметрію, який працює у контейнері в Kubernetes, має імʼя Podʼа, він знаходиться у просторі імен і, можливо, є частиною Deploymentʼа, який також має імʼя. Всі ці три атрибути можуть бути включені в `Resource`.

Трейси найчастіше використовуються для представлення запиту сервісу (сутність Services, описана в моделі Jaeger), які зазвичай реалізуються як процеси, що виконуються в обчислювальному блоці, але підхід API OTel до опису `Resource` через атрибути досить гнучкий, щоб представити будь-яку сутність, яка вам може знадобитися, наприклад, банкомати, датчики IoT, та що завгодно.

Тому можна з упевненістю сказати, що для того, щоб трейс існував, `Resource` повинен його запустити.

У цьому посібнику ми змоделюємо систему, яка має телеметричні дані, що демонструють банкомати, розташовані в 2 різних штатах (наприклад: Іллінойс і Каліфорнія), які отримують доступ до внутрішньої системи бухгалтерського обліку для виконання операцій з балансом, поповнення і зняття коштів, тому нам потрібно буде реалізувати код для створення типів `Resource`, що представляють банкомат і внутрішню систему.

Створіть файл з іменем `model.go` у теці `tailtracer`.

```sh
touch tailtracer/model.go
```

Тепер у файлі `model.go` додайте визначення для типів `Atm` та `BackendSystem` наступним чином:

> tailtracer/model.go

```go
type Atm struct{
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}
```

Ці типи призначено для представлення сутностей, якими вони є у системі, за якою ведеться спостереження, і вони містять інформацію, яку доцільно додати до трейсу як частину визначення `Resource`. Ви додасте деякі допоміжні функції для створення екземплярів цих типів.

Ось як виглядатиме файл `model.go` з допоміжними функціями:

> tailtracer/model.go

```go
package tailtracer

import (
	"math/rand"
	"time"
)

type Atm struct{
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm{
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
		case 1:
			newAtm = Atm{
				ID: 111,
				Name: "ATM-111-IL",
				SerialNumber: "atmxph-2022-111",
				Version: "v1.0",
				ISPNetwork: "comcast-chicago",
				StateID: "IL",

			}

		case 2:
			newAtm = Atm{
				ID: 222,
				Name: "ATM-222-CA",
				SerialNumber: "atmxph-2022-222",
				Version: "v1.0",
				ISPNetwork: "comcast-sanfrancisco",
				StateID: "CA",
			}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem{
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName: "accounts",
		Version: "v2.5",
		OSType: "lnx",
		OSVersion: "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion: "us-east-2",
	}

	switch i {
		case 1:
		 	newBackend.Endpoint = "api/v2.5/balance"
		case 2:
		  	newBackend.Endpoint = "api/v2.5/deposit"
		case 3:
			newBackend.Endpoint = "api/v2.5/withdrawn"

	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max - min + 1) + min)
	return i
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпортовано пакунки `math/rand` та `time` для підтримки реалізації функції `generateRandomNumber`.
- Додано функцію `generateAtm`, яка створює екземпляр типу `Atm` і випадковим чином призначає Іллінойс або Каліфорнію як значення для `StateID` та еквівалентне значення для `ISPNetwork`.
- Додано функцію `generateBackendSystem`, яка створює екземпляр типу `BackendSystem` і випадковим чином призначає значення кінцевої точки служби для поля `Endpoint`.
- Додано функцію `generateRandomNumber`, яка допомагає генерувати випадкові числа в потрібному діапазоні.

{{% /alert %}}

Тепер, коли у вас є функції для створення екземплярів обʼєктів, що представляють сутності, які генерують телеметрію, ви готові представляти ці сутності у світі колектора OTel.

API колектора надає пакет з назвою `ptrace` (вкладений у пакет `pdata`) з усіма типами, інтерфейсами та допоміжними функціями, необхідними для роботи з трасуванням у компонентах конвеєра колектора.

Відкрийте файл `tailtracer/model.go` і додайте `go.opentelemetry.io/collector/pdata/ptrace` до пункту `import`, щоб отримати доступ до можливостей пакунка `ptrace`.

Перш ніж визначати `Resource`, вам потрібно створити `ptrace.Traces`, який відповідатиме за поширення трейсів у конвеєрі Колектора, і ви можете скористатися допоміжною функцією `ptrace.NewTraces()` для його створення. Вам також потрібно створити екземпляри типів `Atm` і `BackendSystem`, щоб мати дані для представлення джерел телеметрії, задіяних у вашому трейсі.

Відкрийте файл `tailtracer/model.go` і додайте до нього наступну функцію:

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()
	}

	return traces
}
```

На даний момент ви вже достатньо почули і прочитали про те, як трейси складаються з відрізків (Spans). Можливо, ви також написали деякий інструментальний код, використовуючи функції та типи SDK для їх створення, але ви, мабуть, не знали, що у API колектора існують інші типи “span", які беруть участь у створенні трейсів.

Ви почнете з типу з назвою `ptrace.ResourceSpans`, який представляє ресурс і всі операції, які він створив або отримав під час участі у трасуванні. Його визначення можна знайти у [/pdata/internal/data/protogen/trace/v1/trace.pb.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/pdata/internal/data/protogen/trace/v1/trace.pb.go>).

Клас `ptrace.Traces` має метод `ResourceSpans()`, який повертає екземпляр допоміжного типу `ptrace.ResourceSpansSlice`. Тип `ptrace.ResourceSpansSlice` має методи для обробки масиву `ptrace.ResourceSpans`, який міститиме стільки елементів, скільки сутностей `Resource` беруть участь у запиті, представленому трейсом.

У `ptrace.ResourceSpansSlice` є метод `AppendEmpty()`, який додає новий `ptrace.ResourceSpan` до масиву і повертає його посилання.

Після того, як у вас є екземпляр `ptrace.ResourceSpan`, ви використовуєте метод `Resource()`, який повертає екземпляр `pcommon.Resource`, повʼязаний з `ResourceSpan`.

Оновіть функцію `generateTrace()` наступними змінами:

- додано змінну з іменем `resourceSpan` для представлення діапазону ресурсів `ResourceSpan
- додайте змінну з іменем `atmResource` для представлення `pcommon.Resource`, повʼязаного з `ResourceSpan`.
- Для ініціалізації обох змінних використовуйте методи, згадані вище.

Ось як має виглядати функція після внесення цих змін:

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
	}

	return traces
}
```

{{% alert title="Перевірте свою роботу" %}}

- Додано змінну `resourceSpan` та ініціалізовано її посиланням `ResourceSpan`, яке повертається викликом `traces.ResourceSpans().AppendEmpty()`.
- Додано змінну `atmResource` та ініціалізовано її посиланням `pcommon.Resource`, що повертається викликом `resourceSpan.Resource()`.

{{% /alert %}}

### Опис Resources через атрибути {#describing-resources-through-attributes}

API колектора надає пакет з назвою `pcommon` (вкладений у пакет `pdata`) з усіма типами та допоміжними функціями, необхідними для опису `Resource`.

У світі колектора `Resource` описується атрибутами у форматі пари ключ/значення, представленими типом `pcommon.Map`.

Ви можете ознайомитися з визначенням типу `pcommon.Map` та відповідними допоміжними функціями для створення значень атрибутів у підтримуваних форматах у файлі [/pdata/pcommon/map.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/pdata/pcommon/map.go>) у GitHub-проєкті Колекціонера.

Пари ключ/значення надають велику гнучкість для моделювання даних `Resource`, тому специфікація OTel містить деякі рекомендації, які допомагають організувати та мінімізувати конфлікти між усіма різними типами обʼєктів генерації телеметрії, які можуть знадобитися для представлення.

Ці настанови відомі як [Семантичні домовленості щодо Resources](/docs/specs/semconv/resource/) і задокументовані у специфікації OTel.

При створенні власних атрибутів для представлення власних обʼєктів генерації телеметрії, ви повинні слідувати рекомендаціям, наданим у специфікації:

> Атрибути групуються логічно за типом концепції, яку вони описують. Атрибути в одній групі мають спільний префікс, який закінчується крапкою. Наприклад, всі атрибути, які описують властивості Kubernetes, починаються з `k8s.`.

Давайте почнемо з відкриття `tailtracer/model.go` і додамо `go.opentelemetry.io/collector/pdata/pcommon` до пункту `import`, щоб ви могли отримати доступ до можливостей пакунка `pcommon`.

Тепер додайте функцію для зчитування значень полів з екземпляра `Atm` і запису їх у вигляді атрибутів (згрупованих за префіксом "atm.") до екземпляра `pcommon.Resource`. Ось як виглядає функція:

```go
func fillResourceWithAtm(resource *pcommon.Resource, atm Atm){
   atmAttrs := resource.Attributes()
   atmAttrs.PutInt("atm.id", atm.ID)
   atmAttrs.PutStr("atm.stateid", atm.StateID)
   atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
   atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
}
```

{{% alert title="Перевірте свою роботу" %}}

- Оголошено змінну з іменем `atmAttrs` та ініціалізовано її посиланням на `pcommon.Map`, що повертається викликом `resource.Attributes()`.
- Використано методи `PutInt()` та `PutStr()` з `pcommon.Map` для додавання атрибутів типу int та string на основі еквівалентних типів полів `Atm`. Зверніть увагу, що оскільки ці атрибути є дуже специфічними і представляють лише сутність `Atm`, їх згруповано у префікс "atm.".

{{% /alert %}}

Семантичні домовленості про ресурси також мають обовʼязкові назви атрибутів і добре відомі значення для представлення сутностей генерації телеметрії, які є спільними і застосовними у різних доменах, таких як [обчислювальна одиниця](/docs/specs/semconv/resource/#compute-unit), [середовище](/docs/specs/semconv/resource/#environment) та інші.

Отже, коли ви подивитеся на сутність `BackendSystem`, вона має поля, що представляють інформацію, повʼязану з [Операційною системою](/docs/specs/semconv/resource/os/) та [Хмарою](/docs/specs/semconv/resource/cloud/), і ми будемо використовувати імена та значення атрибутів, визначені семантичною угодою про ресурси, для представлення цієї інформації на її `Resource`.

Усі імена атрибутів семантичної конвенції ресурсів та добре відомі значення зберігаються у файлі [/semconv/v1.9.0/generated_resource.go](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.128.0/semconv/v1.9.0/generated_resource.go) у GitHub-проекті Collector'а.

Створимо функцію для зчитування значень полів з екземпляра `BackendSystem` і запису їх як атрибутів в екземпляр `pcommon.Resource`. Відкрийте файл `tailtracer/model.go` і додайте наступну функцію:

```go
func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem){
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
		case backend.CloudProvider == "amzn":
			cloudProvider = conventions.AttributeCloudProviderAWS
		case backend.OSType == "mcrsft":
			cloudProvider = conventions.AttributeCloudProviderAzure
		case backend.OSType == "gogl":
			cloudProvider = conventions.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(conventions.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(conventions.AttributeCloudRegion, backend.CloudRegion)

	switch {
		case backend.OSType == "lnx":
			osType = conventions.AttributeOSTypeLinux
		case backend.OSType == "wndws":
			osType = conventions.AttributeOSTypeWindows
		case backend.OSType == "slrs":
			osType = conventions.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(conventions.AttributeOSType, osType)
	backendAttrs.PutStr(conventions.AttributeOSVersion, backend.OSVersion)
 }
```

Зверніть увагу, що ми не додали атрибут "atm.name" або "backendsystem.name" до `pcommon.Resource`, що представляє імена сутностей `Atm` та `BackendSystem`, тому що більшість (не кажучи вже про всі) розподілених систем бекенда трасування, сумісних зі специфікацією трасування OTel, інтерпретують `pcommon.Resource`, описаний у трейсі, як `Service`, тому вони очікують, що `pcommon.Resource` буде містити обовʼязковий атрибут з іменем `service.name`, як це передбачено семантичною угодою про ресурси.

Ми також використаємо необовʼязковий атрибут із назвою `service.version` для представлення інформації про версію як для сутностей `Atm`, так і для `BackendSystem`.

Ось як виглядає файл `tailtracer/model.go` після додавання коду для правильного призначення атрибутів групи "service.":

> tailtracer/model.go

```go
package tailtracer

import (
	"math/rand"
	"time"

	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	conventions "go.opentelemetry.io/collector/semconv/v1.9.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(conventions.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(conventions.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = conventions.AttributeCloudProviderAWS
	case backend.OSType == "mcrsft":
		cloudProvider = conventions.AttributeCloudProviderAzure
	case backend.OSType == "gogl":
		cloudProvider = conventions.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(conventions.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(conventions.AttributeCloudRegion, backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = conventions.AttributeOSTypeLinux
	case backend.OSType == "wndws":
		osType = conventions.AttributeOSTypeWindows
	case backend.OSType == "slrs":
		osType = conventions.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(conventions.AttributeOSType, osType)
	backendAttrs.PutStr(conventions.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(conventions.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(conventions.AttributeServiceVersion, backend.Version)
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпортовано пакет `go.opentelemetry.io/collector/semconv/v1.9.0` як `conventions`, щоб мати доступ до всіх імен та значень атрибутів семантичних домовленостей ресурсів.
- Оновлено функцію `fillResourceWithAtm()`, додаванням рядків для правильного присвоєння атрибутів "service.name” та "service.version" до `pcommon.Resource`, що представляє сутність `Atm`.
- Оновлено функцію `fillResourceWithBackendSystem()`, додано рядки для коректного присвоєння атрибутів "service.name" та "service.version" ресурсу `pcommon.Resource`, що представляє сутність `BackendSystem`.
- Оновлено функцію `generateTraces` шляхом додавання рядків для коректного створення екземпляру `pcommon.Resource` та заповнення атрибутивної інформації для сутностей `Atm` та `BackendSystem` за допомогою функцій `fillResourceWithAtm()` та `fillResourceWithBackendSystem()`

{{% /alert %}}

### Представлення операцій з відрізками {#representing-operations-with-spans}

Тепер у вас є екземпляр `ResourceSpan` з відповідним `Resource`, належним чином заповненим атрибутами для представлення сутностей `Atm` і `BackendSystem`, і ви готові представити операції, які виконує кожен `Resource`, як частину трасування в межах `ResourceSpan`.

У світі OTel для того, щоб система могла генерувати телеметричні дані, її потрібно інструментувати вручну або автоматично за допомогою бібліотеки інструментів.

Бібліотеки інструментальних засобів відповідають за встановлення області (також відомої як область інструментальних засобів), у якій відбуваються операції, що беруть участь у трасуванні, а потім описують ці операції як діапазони у контексті трейсу.

Бібліотека `pdata.ResourceSpans` має метод `ScopeSpans()`, який повертає екземпляр допоміжного типу `ptrace.ScopeSpansSlice`. У методі тип `ptrace.ScopeSpansSlice` має методи для обробки масиву `ptrace.ScopeSpans`, який міститиме стільки елементів, скільки існує `ptrace.ScopeSpan`, що представляють різні діапазони вимірювальних приладів та діапазони, згенеровані ними у контексті трасування.

У `ptrace.ScopeSpansSlice` є метод `AppendEmpty()`, який додає новий `ptrace.ScopeSpans` до масиву і повертає його посилання.

Давайте створимо функцію для створення екземпляра `ptrace.ScopeSpans`, що представляє діапазон вимірювання системи АТМ та його відрізки. Відкрийте файл `tailtracer/model.go` і додайте наступну функцію:

```go
func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()

	return scopeSpans
}
```

У `ptrace.ScopeSpans` є метод з назвою `Scope()`, який повертає посилання на екземпляр `pcommon.InstrumentationScope`, що представляє діапазон інструментарію, який згенерував проміжки.

pcommon.InstrumentationScope` має наступні методи для опису діапазону інструментування:

- `SetName(v рядок)` встановлює імʼя для бібліотеки інструментарію

- `SetVersion(v string)` встановлює версію для бібліотеки інструментарію

- `Name() string` повертає імʼя, повʼязане з бібліотекою інструментарію

- `Version() string` повертає версію, повʼязану з бібліотекою інструментів

Давайте оновимо функцію `appendAtmSystemInstrScopeSpans`, щоб ми могли встановити назву та версію діапазону інструментів для нового `ptrace.ScopeSpans`. Ось як виглядає `appendAtmSystemInstrScopeSpans` після оновлення:

```go
func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}
```

Тепер ви можете оновити функцію `generateTraces` і додати змінні для представлення області застосування інструментарію, що використовується сутностями `Atm` і `BackendSystem`, ініціалізувавши їх за допомогою `appendAtmSystemInstrScopeSpans()`. Ось як виглядає `generateTraces()` після оновлення:

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)
	}

	return traces
}
```

На цьому етапі у вас є все необхідне для представлення обʼєктів генерації телеметрії у вашій системі та області інструментування, яка відповідає за ідентифікацію операцій і генерацію трейсів для системи. Наступним кроком буде остаточне створення відрізків, що представляють операції, які дана область інструменталізації згенерувала як частину трейса.

Клас `ptrace.ScopeSpans` має метод `Spans()`, який повертає екземпляр допоміжного типу `ptrace.SpanSlice`. Тип `ptrace.SpanSlice` має методи для обробки масиву `ptrace.Span`, який міститиме стільки елементів, скільки операцій було ідентифіковано та описано як частину трейса.

Тип `ptrace.SpanSlice` має метод `AppendEmpty()`, який додає новий `ptrace.Span` до масиву і повертає його посилання.

Для опису операції `ptrace.Span` має наступні методи:

- `SetTraceID(v pcommon.TraceID)` встановлює `pcommon.TraceID`, що однозначно ідентифікує трасу, з якою асоційовано цей відрізок

- `SetSpanID(v pcommon.SpanID)` встановлює `pcommon.SpanID`, що унікально ідентифікує цей відрізок у контексті трейса, з яким він асоційований

- `SetParentSpanID(v pcommon.SpanID)` встановлює `pcommon.SpanID` для батьківського відрізка/операції у випадку, якщо операція, представлена цим відрізком, виконується як частина батьківського (вкладеного) відрізка

- `SetName(v string)` встановлює імʼя операції для відрізка

- `SetKind(v ptrace.SpanKind)` встановлює `ptrace.SpanKind`, що визначає тип операції, яку представляє відрізок.

- `SetStartTimestamp(v pcommon.Timestamp)` встановлює `pcommon.Timestamp`, що представляє дату та час початку операції, яку представляє відрізок

- `SetEndTimestamp(v pcommon.Timestamp)` встановлює `pcommon.Timestamp`, що представляє дату та час завершення операції, яку представляє відрізок

Як ви можете бачити з наведених вище методів, `ptrace.Span` унікально ідентифікується за 2 необхідними ідентифікаторами: власним унікальним ідентифікатором, представленим типом `pcommon.SpanID`, та ідентифікатором трейсу, з яким він повʼязаний, представленим типом `pcommon.TraceID`.

Тип `pcommon.TraceID` має містити глобальний унікальний ідентифікатор, представлений масивом з 16 байт, і має відповідати [W3C Trace Context specification](https://www.w3.org/TR/trace-context/#trace-id), тоді як тип `pcommon.SpanID` є унікальним ідентифікатором у контексті трейса, з яким він повʼязаний, і представлений масивом з 8 байт.

Пакет `pcommon` надає наступні типи для генерування ідентифікаторів проміжків:

- `type TraceID [16]byte

- `type SpanID [8]byte

У цьому підручнику ви створюватимете ідентифікатори за допомогою функцій з пакунка `github.com/google/uuid` для `pcommon.TraceID` та функцій з пакунка `crypto/rand` для випадкової генерації `pcommon.SpanID`. Відкрийте файл `tailtracer/model.go` і додайте обидва пакунки до оператора `import`; після цього додайте наступні функції для генерації обох ідентифікаторів:

```go
import (
	crand "crypto/rand"
	"math/rand"
  	...
)

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}
```

{{% alert title="Перевірте свою роботу" %}}

- Імпортовано `crypto/rand` як `crand` (щоб уникнути конфліктів з `math/rand`).
- Додано нові функції `NewTraceID()` та `NewSpanID()` для генерування ідентифікатора трейсу та ідентифікатора відрізка відповідно.

{{% /alert %}}

Тепер, коли ви знаєте, як правильно ідентифікувати відрізки, ви можете почати створювати їх для представлення операцій всередині та між сутностями у вашій системі.

У функції `generateBackendSystem()` ми випадковим чином призначили операції, які сутність `BackEndSystem` може надавати як сервіси системі. Тепер ми відкриємо файл `tailtracer/model.go` та функцію `appendTraceSpans()`, яка відповідатиме за створення трасування та додавання відрізків, що представляють операції `BackendSystem`. Ось як виглядає початкова реалізація функції `appendTraceSpans()`:

```go
func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
```

{{% alert title="Перевірте свою роботу" %}}

- Додано змінні `traceId` та `backendSpanId` для представлення відповідно ідентифікатора трейсу та ідентифікатора відрізка та ініціалізовано їх за допомогою допоміжних функцій, створених раніше.
- Додано змінні `backendSpanStartTime` та `backendSpanFinishTime` для представлення часу початку та закінчення операції. У підручнику будь-яка операція `BackendSystem` триватиме 1 секунду.
- Додано змінну з назвою `backendSpan`, яка зберігатиме екземпляр `ptrace.Span`, що представляє цю операцію.
- Встановлення `Name` відрізка значенням поля `Endpoint` з екземпляра `BackendSystem`.
- Встановлення `Kind` відрізка як `ptrace.SpanKindServer`. Погляньте на [SpanKind section](/docs/specs/otel/trace/api/#spankind) у специфікації трасування, щоб зрозуміти, як правильно визначити SpanKind.
- Використано всі згадані вище методи для заповнення `ptrace.Span` відповідними значеннями для представлення операції `BackendSystem`.

{{% /alert %}}

Ви, напевно, помітили, що у функції `appendTraceSpans()` є 2 посилання на `ptrace.ScopeSpans` в якості параметрів, але ми використали лише одне з них. Не хвилюйтеся про це, ми повернемося до цього пізніше.

Зараз ви оновите функцію `generateTraces()` так, щоб вона дійсно могла генерувати трейси за допомогою виклику функції `appendTraceSpans()`. Ось як виглядає оновлена функція `generateTraces()`:

```go
func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}
```

Тепер у вас є сутність `BackendSystem` та її операції, представлені у відрізках у відповідному контексті трасування! Все, що вам потрібно зробити, це проштовхнути згенерований трейс по конвеєру, щоб наступний споживач (або процесор, або експортер) зміг його отримати і обробити.

Ось так виглядає `tailtracer/model.go`:

> tailtracer/model.go

```go
package tailtracer

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	conventions "go.opentelemetry.io/collector/semconv/v1.9.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(conventions.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(conventions.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = conventions.AttributeCloudProviderAWS
	case backend.OSType == "mcrsft":
		cloudProvider = conventions.AttributeCloudProviderAzure
	case backend.OSType == "gogl":
		cloudProvider = conventions.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(conventions.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(conventions.AttributeCloudRegion, backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = conventions.AttributeOSTypeLinux
	case backend.OSType == "wndws":
		osType = conventions.AttributeOSTypeWindows
	case backend.OSType == "slrs":
		osType = conventions.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(conventions.AttributeOSType, osType)
	backendAttrs.PutStr(conventions.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(conventions.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(conventions.AttributeServiceVersion, backend.Version)
}

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
```

У `consumer.Traces` є метод `ConsumeTraces()`, який відповідає за передачу згенерованих трейсів наступному споживачу у конвеєрі. Все, що вам потрібно зробити, це оновити метод `Start()` у типі `tailtracerReceiver` і додати код для його використання.

Відкрийте файл `tailtracer/trace-receiver.go` та оновіть метод `Start()` наступним чином:

```go
func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
					tailtracerRcvr.nextConsumer.ConsumeTraces(ctx, generateTraces(tailtracerRcvr.config.NumberOfTraces)) // new line added
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}
```

{{% alert title="Перевірте свою роботу" %}}

- Додано рядок під умовою `case <=ticker.C`, що викликає метод `tailtracerRcvr.nextConsumer.ConsumeTraces()` з передачею нового контексту, створеного у методі `Start()` (`ctx`) та виклик функції `generateTraces`, щоб згенеровані трейси можна було передати наступному споживачу у конвеєрі.

{{% /alert %}}

Тепер запустимо `otelcol-dev` ще раз:

```sh
go run ./otelcol-dev --config config.yaml
```

Через кілька хвилин ви побачите ось такий результат:

```log
2023-11-09T11:38:19.890+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-09T11:38:19.890+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-09T11:38:19.890+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-09T11:38:19.890+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-09T11:38:19.890+0800	debug	processor@v0.88.0/processor.go:287	Stable component.	{"kind": "processor", "name": "batch", "pipeline": "traces"}
2023-11-09T11:38:19.891+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-09T11:38:19.891+0800	debug	receiver@v0.88.0/receiver.go:294	Alpha component. May change in the future.	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-09T11:38:19.891+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-09T11:38:19.891+0800	info	extensions/extensions.go:33	Starting extensions...

<OMITTED>

2023-11-09T11:38:19.903+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
2023-11-09T11:39:19.894+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-09T11:39:19.913+0800	info	TracesExporter	{"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 4, "spans": 2}
2023-11-09T11:39:19.913+0800	info	ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> atm.id: Int(222)
     -> atm.stateid: Str(CA)
     -> atm.ispnetwork: Str(comcast-sanfrancisco)
     -> atm.serialnumber: Str(atmxph-2022-222)
     -> service.name: Str(ATM-222-CA)
     -> service.version: Str(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
ResourceSpans #1
Resource SchemaURL:
Resource attributes:
     -> cloud.provider: Str(aws)
     -> cloud.region: Str(us-east-2)
     -> os.type: Str(linux)
     -> os.version: Str(4.16.10-300.fc28.x86_64)
     -> service.name: Str(accounts)
     -> service.version: Str(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : bbcb00aead044a138cf96c0bf4a4ba83
    Parent ID      :
    ID             : 5056fe4e9adf621c
    Name           : api/v2.5/withdrawn
    Kind           : Server
    Start time     : 2023-11-09 03:39:19.894881 +0000 UTC
    End time       : 2023-11-09 03:39:20.894881 +0000 UTC
    Status code    : Unset
    Status message :
ResourceSpans #2
Resource SchemaURL:
Resource attributes:
     -> atm.id: Int(111)
     -> atm.stateid: Str(IL)
     -> atm.ispnetwork: Str(comcast-chicago)
     -> atm.serialnumber: Str(atmxph-2022-111)
     -> service.name: Str(ATM-111-IL)
     -> service.version: Str(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
ResourceSpans #3
Resource SchemaURL:
Resource attributes:
     -> cloud.provider: Str(aws)
     -> cloud.region: Str(us-east-2)
     -> os.type: Str(linux)
     -> os.version: Str(4.16.10-300.fc28.x86_64)
     -> service.name: Str(accounts)
     -> service.version: Str(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : ba013b8223ec4d29806ae493ecd1a5e4
    Parent ID      :
    ID             : 4feb47b55c9c4129
    Name           : api/v2.5/withdrawn
    Kind           : Server
    Start time     : 2023-11-09 03:39:19.894953 +0000 UTC
    End time       : 2023-11-09 03:39:20.894953 +0000 UTC
    Status code    : Unset
    Status message :
	{"kind": "exporter", "data_type": "traces", "name": "debug"}
...
```

Ось як виглядає згенерований трейс в Jaeger: ![Jaeger trace](/img/docs/tutorials/Jaeger-BackendSystem-Trace.png)

Те, що ви зараз бачите в Jaeger, є представленням сервісу, який отримує запит від зовнішньої сутності, яка не є інструментом OTel SDK, тому її не можна ідентифікувати як джерело/початок трейсу. Для того, щоб зрозуміти, що `ptrace.Span` представляє операцію, яка була виконана в результаті іншої операції, що виникла всередині або ззовні (вкладеної/дочірньої) від `Resource` в тому ж контексті трасування, вам необхідно встановити той самий контекст трасування, в якому вона була створена:

- Встановити той самий контекст трасування, що й в операції, яка робить виклик, викликавши метод `SetTraceID()` і передавши `pcommon.TraceID` батьківського/викликаючого `ptrace.Span` як параметр.
- Визначте, хто є операцією-викликачем у контексті трасування, викликавши метод `SetParentId()` і передавши `pcommon.SpanID` батька/викликача `ptrace.Span` як параметр.

Тепер ви створите `ptrace.Span`, що представляє операції сутності `Atm`, і зробите його батьківським для діапазону `BackendSystem`. Відкрийте файл `tailtracer/model.go` та оновіть функцію `appendTraceSpans()` наступним чином:

```go
func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
		case strings.Contains(backend.Endpoint, "balance"):
			atmOperationName = "Check Balance"
		case strings.Contains(backend.Endpoint, "deposit"):
			atmOperationName = "Make Deposit"
		case strings.Contains(backend.Endpoint, "withdraw"):
			atmOperationName = "Fast Cash"
		}

	atmSpanId := NewSpanID()
	atmSpanStartTime := time.Now()
	atmDuration, _ := time.ParseDuration("4s")
	atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)

	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))

	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
	backendSpanStartTime := atmSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())
}
```

Так виглядає фінальний `tailtracer/model.go`:

> tailtracer/model.go

```go
package tailtracer

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/rand"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	conventions "go.opentelemetry.io/collector/semconv/v1.9.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(conventions.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(conventions.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = conventions.AttributeCloudProviderAWS
	case backend.OSType == "mcrsft":
		cloudProvider = conventions.AttributeCloudProviderAzure
	case backend.OSType == "gogl":
		cloudProvider = conventions.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(conventions.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(conventions.AttributeCloudRegion, backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = conventions.AttributeOSTypeLinux
	case backend.OSType == "wndws":
		osType = conventions.AttributeOSTypeWindows
	case backend.OSType == "slrs":
		osType = conventions.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(conventions.AttributeOSType, osType)
	backendAttrs.PutStr(conventions.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(conventions.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(conventions.AttributeServiceVersion, backend.Version)
}

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
	case strings.Contains(backend.Endpoint, "balance"):
		atmOperationName = "Check Balance"
	case strings.Contains(backend.Endpoint, "deposit"):
		atmOperationName = "Make Deposit"
	case strings.Contains(backend.Endpoint, "withdraw"):
		atmOperationName = "Fast Cash"
	}

	atmSpanId := NewSpanID()
	atmSpanStartTime := time.Now()
	atmDuration, _ := time.ParseDuration("4s")
	atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)

	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))

	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
	backendSpanStartTime := atmSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())
}
```

Запустіть `otelcol-dev` ще раз:

```sh
go run ./otelcol-dev --config config.yaml
```

І приблизно через 2 хвилини ви почнете бачити в Jaeger трейси, подібні до наведених нижче: ![Трасування у Jaeger](/img/docs/tutorials/Jaeger-FullSystem-Traces-List.png)

Тепер ми маємо сервіси, що представляють як сутності генерації телеметрії `Atm`, так і сутності генерації телеметрії `BackendSystem` у нашій системі, і можемо повністю зрозуміти, як використовуються обидві сутності і як вони сприяють виконанню операції, що виконується користувачем.

Ось детальний вигляд одного з таких трейсів у Jaeger: ![Jaeger trace](/img/docs/tutorials/Jaeger-FullSystem-Trace-Details.png)

Це все! Ви дійшли до кінця цього підручника і успішно реалізували приймач трасування, вітаємо!

[^1]: До версії v0.86.0 використовуйте `loggingexporter` замість `debugexporter`.
