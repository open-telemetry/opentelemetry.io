---
title: Створення конектора
linkTitle: Конектори
aliases:
  - /docs/collector/build-connector
  - /docs/collector/building/connector
weight: 200
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: configgo debugexporter Errorf exampleconnector gomod gord Jaglowski mapstructure otlpreceiver pdata pmetric ptrace servicegraph spanmetrics struct uber
---

## Конектори в OpenTelemetry {#connectors-in-opentelemetry}

Цей матеріал найбільш корисний, якщо у вас вже є інструментований застосунок, який генерує деякі дані трасування, і ви вже маєте уявлення про [OpenTelemetry Collector](/docs/collector).

## Що таке Конектор? {#what-is-a-connector}

Конектор діє як засіб передачі даних телеметрії між різними конвеєрами колектора, зʼєднуючи їх. Конектор діє як експортер для одного конвеєра і як приймач для іншого. Кожен конвеєр в OpenTelemetry Collector обробляє один тип даних телеметрії. Може виникнути потреба перетворити один вид даних телеметрії в інший, але необхідно направити дані до відповідного конвеєра колектора.

## Чому треба використовувати Конектор? {#why-use-a-connector}

Конектор корисний для обʼєднання, маршрутизації та реплікації потоків даних. Разом з послідовним конвеєрним зʼєднанням, яке полягає в зʼєднанні конвеєрів разом, компонент конектора здатний забезпечити умовний потік даних та генерувати потоки даних. Умовний потік даних виконує надсилання даних до конвеєра з найвищим пріоритетом і має функцію виявлення помилок для перенаправлення до альтернативного конвеєра, якщо це необхідно. Генерація потоків даних означає, що компонент генерує і передає власні дані на основі отриманих даних. Цей посібник підкреслює здатність конектора зʼєднувати конвеєри.

Існують процесори в OpenTelemetry, які перетворюють дані телеметрії одного типу в інший. Деякі приклади — це процесор spanmetrics, а також процесор servicegraph. Процесор spanmetrics генерує агреговані запити, помилки та метрики тривалості з даних відрізків. Процесор servicegraph аналізує дані трасування і генерує метрики, які описують взаємозвʼязок між сервісами. Обидва ці процесори використовують дані трасування і перетворюють їх у метрики. Оскільки конвеєри в OpenTelemetry Collector призначені лише для одного типу даних, необхідно перетворити дані трасування з процесора в конвеєрі трасування і відправити їх у конвеєр метрик. Історично склалося так, що деякі процесори передавали дані, використовуючи обхідний шлях, що є поганою практикою, коли процесор безпосередньо експортує дані після обробки. Компонент конектора усуває потребу в цьому обхідному шляху, а процесори, які використовували обхідний шлях, були визнані застарілими. До того ж, згадані вище процесори також визнані застарілими в останніх випусках і замінені конекторами.

Додаткові деталі про повні можливості конектора можна знайти за наступними посиланнями: [Що таке Конектори в OpenTelemetry?](https://observiq.com/blog/what-are-connectors-in-opentelemetry/), [Конфігурації Конектора OpenTelemetry](/docs/collector/configuration/#connectors)

### Стара архітектура: {#the-old-architecture}

![До зображення, як процесори безпосередньо передавали дані до експортера іншого конвеєра](./otel-collector-before-connector.svg)

### Нова архітектура з використанням Конектора: {#new-architecture-using-a-connector}

![Як конвеєр повинен працювати, використовуючи компонент конектора](./otel-collector-after-connector.svg)

## Створення демонстраційного Конектора {#building-example-connector}

У цьому посібнику ми створимо демонстраційний конектор, який бере трейси та перетворює їх у метрики як базовий приклад того, як функціонує компонент конектора в OpenTelemetry. Функціональність базового конектора полягає в простому підрахунку кількості відрізків у трейсах, які містять певне імʼя атрибута. Кількість цих випадків зберігається в конекторі.

## Конфігурації {#configuration}

### Налаштування конфігурації Колектора: {#setting-up-collector-config}

Налаштуйте конфігурацію, яку ви будете використовувати для OpenTelemetry Collector у файлі `config.yaml`. Цей файл визначає, як ваші дані будуть маршрутизовані, оброблені та експортовані. Конфігурації, визначені у файлі, деталізують, як ви хочете, щоб ваш конвеєр даних працював. Ви можете визначити компоненти і як дані переміщуються через ваш визначений конвеєр від початку до кінця. Додаткові деталі про те, як налаштувати колектор, можна знайти на сторінці [Конфігурації Колектора](/docs/collector/configuration).

Використовуйте наступний код для демонстраційного конектора, який ми будемо створювати. Код є прикладом базового дійсного файлу конфігурації OpenTelemetry Collector.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:

connectors:
  example:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [example]
    metrics:
      receivers: [example]
      exporters: [debug]
```

У розділі connectors в наведеному вище коді вам потрібно оголосити імена використовуваних конекторів для вашого конвеєра. Тут `example` — це імʼя конектора, який ми створимо в цьому посібнику.

## Реалізація {#implementation}

1.  Створіть теку для вашого демонстраційного конектора. У цьому посібнику ми створимо теку з назвою `exampleconnector`.
2.  Перейдіть до теки та виконайте

    ```sh
    go mod init github.com/gord02/exampleconnector
    ```

3.  Запустіть `go mod tidy`

    Це створить файли `go.mod` і `go.sum`.

4.  Створіть наступні файли в теці
    - `config.go` — файл для визначення налаштувань конектора
    - `factory.go` — файл для створення екземплярів конектора

### Створіть налаштування вашого конектора в config.go {#create-your-connector-settings-in-configgo}

Щоб бути створеним та брати участь у конвеєрах, колектор повинен ідентифікувати ваш конектор і правильно завантажити його налаштування з конфігураційного файлу.

Щоб надати вашому конектору доступ до його налаштувань, створіть структуру `Config`. Структура повинна мати експортоване поле для кожного з налаштувань конектора. Поля параметрів, додані до структури, будуть доступні з файлу config.yaml. Їх імʼя у конфігураційному файлі встановлюється через теґ структури. Створіть структуру і додайте параметри. Ви можете додатково додати функцію валідатора, щоб перевірити, чи є задані стандартні значення дійсними для екземпляра вашого конектора.

Ось як має виглядати файл `config.go`:

> exampleconnector/config.go

```go
package exampleconnector

import "fmt"

// Config представляє налаштування конфігурації коннектора у файлі config.yaml колектора
type Config struct {
    AttributeName string `mapstructure:"attribute_name"`
}

func (c *Config) Validate() error {
    if c.AttributeName == "" {
        return fmt.Errorf("attribute_name must not be empty")
    }
    return nil
}
```

Додаткові деталі про mapstructure можна знайти на сторінці [Go mapstructure](https://pkg.go.dev/github.com/mitchellh/mapstructure).

## Реалізація фабрики {#implement-the-factory}

Щоб створити обʼєкт, вам потрібно використовувати функцію `NewFactory`, повʼязану з кожним з компонентів. Ми будемо використовувати функцію `connector.NewFactory`. Функція `connector.NewFactory` створює та повертає `connector.Factory` і вимагає наступних параметрів:

- `component.Type`: унікальний текстовий ідентифікатор для вашого конектора серед усіх компонентів колектора того ж типу. Цей рядок також діє як імʼя для посилання на конектор.
- `component.CreateDefaultConfigFunc`: посилання на функцію, яка повертає стандартний екземпляр `component.Config` для вашого конектора.
- `...FactoryOption`: масив `connector.FactoryOptions`, який визначає, який тип сигналу ваш конектор здатний обробляти.

1.  Створіть файл factory.go і визначте унікальний рядок для ідентифікації вашого конектора як глобальну константу.

    ```go
    const defaultVal string = "request.n"

    // Type — назва типу компонента для цього конектора
    var Type = component.MustNewType("example")
    ```

2.  Створіть функцію стандартної конфігурації. Це спосіб ініціалізації вашого обʼєкта конектора стандартними значеннями.

    ```go
    func createDefaultConfig() component.Config {
        return &Config{
            AttributeName: defaultVal,
        }
    }
    ```

3.  Визначте тип конектора, з яким ви будете працювати. Це буде передано як опція фабрики. Конектор може зʼєднувати конвеєри різних або подібних типів. Ми повинні визначити тип експортованого кінця конектора і приймального кінця конектора. Конектор, який експортує трейси і приймає метрики, є лише однією окремою конфігурацією компонента конектора, і порядок визначення має значення. Конектор, який експортує трейси і приймає метрики, не є тим самим, що і конектор, який може експортувати метрики і приймати трейси.

    ```go
    // createTracesToMetricsConnector визначає тип споживача конектора
    // Ми хочемо отримувати трейси і експортувати метрики, тому визначаємо nextConsumer як метрики, оскільки споживач є наступним компонентом у конвеєрі
    func createTracesToMetricsConnector(ctx context.Context, params connector.Settings, cfg component.Config, nextConsumer consumer.Metrics) (connector.Traces, error) {
        return newConnector(params.Logger, cfg, nextConsumer)
    }
    ```

    `createTracesToMetricsConnector` — це функція, яка додатково ініціалізує компонент конектора, визначаючи його компонент споживача, або наступний компонент, який буде споживати дані після передачі їх конектором. Слід зазначити, що конектор не обмежується однією впорядкованою комбінацією типів, як у нас тут. Наприклад, конектор count визначає кілька таких функцій для передачі трасування до метрик, логів до метрик і метрик до метрик.

    Параметри для `createTracesToMetricsConnector`:
    - `context.Context`: посилання на `context.Context` колектора, щоб ваш приймач трейсів міг правильно керувати своїм контекстом виконання.
    - `connector.CreateSettings`: посилання на деякі налаштування колектора, під якими створюється ваш приймач.
    - `component.Config`: посилання на налаштування конфігурації приймача, передані колектором до фабрики, щоб вона могла правильно читати свої налаштування з конфігурації колектора.
    - `consumer.Metrics`: посилання на наступний тип споживача в конвеєрі, куди підуть отримані трасування. Це може бути процесор, експортер або інший конектор.

4.  Створіть функцію `NewFactory`, яка створює вашу власну фабрику для вашого конектора (компонента).

    ```go
    // NewFactory створює фабрику для демонстраційного конектора.
    func NewFactory() connector.Factory {
        // Фабрика конекторів OpenTelemetry для створення фабрики для конекторів
        return connector.NewFactory(
            Type,
            createDefaultConfig,
            connector.WithTracesToMetrics(createTracesToMetricsConnector, component.StabilityLevelAlpha))
    }
    ```

    Слід зазначити, що конектори можуть підтримувати кілька впорядкованих комбінацій типів даних.

Після завершення, ось `factory.go`:

```go
package exampleconnector

import (
	"context"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/connector"
	"go.opentelemetry.io/collector/consumer"
)

const defaultVal string = "request.n"

// Type — назва типу компонента для цього конектора
var Type = component.MustNewType("example")

// NewFactory створює фабрику для зразка конектора.
func NewFactory() connector.Factory {
	// Фабрика конекторів OpenTelemetry для створення фабрики для конекторів
	return connector.NewFactory(
		Type,
		createDefaultConfig,
		connector.WithTracesToMetrics(createTracesToMetricsConnector, component.StabilityLevelAlpha))
}

func createDefaultConfig() component.Config {
	return &Config{
		AttributeName: defaultVal,
	}
}

// createTracesToMetricsConnector визначає тип споживача коннектора
// Ми хочемо споживати трейси та експортувати метрики, тому визначаємо nextConsumer як метрики, оскільки споживач є наступним компонентом в конвеєрі
func createTracesToMetricsConnector(ctx context.Context, params connector.Settings, cfg component.Config, nextConsumer consumer.Metrics) (connector.Traces, error) {
	return newConnector(params.Logger, cfg, nextConsumer)
}
```

## Реалізація конектора трейсів {#implement-the-trace-connector}

Реалізуйте методи з інтерфейсу компонента, специфічного для типу компонента, у файлі `connector.go`. У цьому посібнику ми реалізуємо конектор трейсів, тому повинні реалізувати інтерфейси: `baseConsumer`, `Traces` і `component.Component`.

1.  Визначте структуру конектора з бажаними параметрами для вашого конектора

    ```go
    // схема для конектора
    type connectorImp struct {
        config          Config
        metricsConsumer consumer.Metrics
        logger          *zap.Logger
        // Включіть ці параметри, якщо не потрібна спеціальна реалізація для функцій запуску та завершення роботи
        component.StartFunc
        component.ShutdownFunc
    }
    ```

2.  Визначте функцію `newConnector` для створення конектора

    ```go
    // newConnector - це функція для створення нового конектора
    func newConnector(logger *zap.Logger, config component.Config, nextConsumer consumer.Metrics) (*connectorImp, error) {
        logger.Info("Building exampleconnector connector")
        cfg := config.(*Config)

        return &connectorImp{
            config:          *cfg,
            logger:          logger,
            metricsConsumer: nextConsumer,
        }, nil
    }
    ```

    Функція `newConnector` є функцією фабрики для створення екземпляра конектора.

3.  Реалізуйте метод `Capabilities`, щоб правильно реалізувати інтерфейс

    ```go
    // Capabilities реалізує інтерфейс споживача.
    func (c *connectorImp) Capabilities() consumer.Capabilities {
        return consumer.Capabilities{MutatesData: false}
    }
    ```

    Реалізуйте метод `Capabilities`, щоб переконатися, що ваш конектор є типом споживача. Цей метод визначає можливості компонента, чи може компонент змінювати дані, чи ні. Якщо `MutatesData` встановлено в true, це означає, що конектор змінює структури даних, які йому передаються.

4.  Реалізуйте метод `Consumer` для споживання даних телеметрії

    ```go
    // Метод ConsumeTraces викликається для кожного екземпляра трасування, переданого конектору
    func (c *connectorImp) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
        // перебір рівнів спанів одного спожитого трасування
        for i := 0; i < td.ResourceSpans().Len(); i++ {
            resourceSpan := td.ResourceSpans().At(i)

            for j := 0; j < resourceSpan.ScopeSpans().Len(); j++ {
                scopeSpan := resourceSpan.ScopeSpans().At(j)

                for k := 0; k < scopeSpan.Spans().Len(); k++ {
                    span := scopeSpan.Spans().At(k)
                    attrs := span.Attributes()
                    if _, ok := attrs.Get(c.config.AttributeName); ok {
                        // створювати метрику тільки якщо відрізок трейса має певний атрибут
                        metrics := pmetric.NewMetrics()
                        return c.metricsConsumer.ConsumeMetrics(ctx, metrics)
                    }
                }
            }
        }
        return nil
    }
    ```

5.  Необовʼязково: Реалізуйте методи `Start` і `Shutdown`, щоб правильно реалізувати інтерфейс, тільки якщо потрібна конкретна реалізація. В іншому випадку достатньо включити `component.StartFunc` і `component.ShutdownFunc` як частину визначеної структури конектора.

Повний файл конектора має виглядати наступним чином:

```go
package exampleconnector

import (
	"context"

	"go.uber.org/zap"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/pdata/pmetric"
	"go.opentelemetry.io/collector/pdata/ptrace"
)


// схема для конектора
type connectorImp struct {
	config          Config
	metricsConsumer consumer.Metrics
	logger          *zap.Logger
	// Включіть ці параметри, якщо не потрібна конкретна реалізація функцій Start і Shutdown
	component.StartFunc
	component.ShutdownFunc
}

// newConnector - це функція для створення нового конектора
func newConnector(logger *zap.Logger, config component.Config, nextConsumer consumer.Metrics) (*connectorImp, error) {
	logger.Info("Building exampleconnector connector")
	cfg := config.(*Config)

	return &connectorImp{
		config:          *cfg,
		logger:          logger,
		metricsConsumer: nextConsumer,
	}, nil
}


// Capabilities реалізує інтерфейс споживача.
func (c *connectorImp) Capabilities() consumer.Capabilities {
	return consumer.Capabilities{MutatesData: false}
}

// Метод ConsumeTraces викликається для кожного екземпляра трасування, переданого конектору
func (c *connectorImp) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
	// перебір рівнів спанів одного спожитого трасування
	for i := 0; i < td.ResourceSpans().Len(); i++ {
		resourceSpan := td.ResourceSpans().At(i)

		for j := 0; j < resourceSpan.ScopeSpans().Len(); j++ {
			scopeSpan := resourceSpan.ScopeSpans().At(j)

			for k := 0; k < scopeSpan.Spans().Len(); k++ {
				span := scopeSpan.Spans().At(k)
				attrs := span.Attributes()
				if _, ok := attrs.Get(c.config.AttributeName); ok {
					// створювати метрику тільки якщо відрізок трейсу має певний атрибут
					metrics := pmetric.NewMetrics()
					return c.metricsConsumer.ConsumeMetrics(ctx, metrics)
				}
			}
		}
	}
	return nil
}
```

## Використання компонента {#using-the-component}

### Підсумки використання OpenTelemetry Collector Builder: {#summary-of-using-opentelemetry-collector-builder}

Ви можете використовувати [OpenTelemetry Collector Builder](/docs/collector/extend/ocb/), щоб зібрати ваш код і запустити його. Збирач — це інструмент, який дозволяє створювати власний двійковий файл OpenTelemetry Collector. Ви можете додавати або видаляти компоненти (приймачі, процесори, конектори та експортери) відповідно до ваших потреб.

1.  Дотримуйтесь інструкцій з встановлення [OpenTelemetry Collector Builder](/docs/collector/extend/ocb/).

2.  Створіть конфігураційний файл:

    Після встановлення наступним кроком є створення конфігураційного файлу `builder-config.yaml`. Цей файл визначає компоненти колектора, які ви хочете включити у ваш власний двійковий файл.

    Ось приклад конфігураційного файлу, який ви можете використовувати з вашим новим компонентом конектора:

    ```yaml
    dist:
      name: otelcol-dev-bin
      description: Basic OpenTelemetry collector distribution for Developers
      output_path: ./otelcol-dev

    exporters:
      - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.129.0

    receivers:
      - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.129.0

    # Не використовується в цьому прикладі, але може бути доданий, якщо це необхідно для вашого випадку використання
    # processors:

    connectors:
      - gomod: github.com/gord02/exampleconnector v0.129.0

    replaces:
      # список директив "replaces", які будуть частиною результуючого go.mod

      # Цей оператор заміни необхідний, оскільки щойно доданий компонент ще не знайдено/опубліковано на GitHub. Замініть посилання на шлях до GitHub на локальний шлях
      - github.com/gord02/exampleconnector =>
        [PATH-TO-COMPONENT-CODE]/exampleconnector
    ```

    Необхідно додати оператор replace. Розділ replace потрібен, оскільки ваш новостворений компонент ще не опублікований на GitHub. Посилання на шлях GitHub для вашого компонента потрібно замінити на локальний шлях до вашого коду.

    Додаткові деталі про заміну в go можна знайти на сторінці [Go mod file Replace](https://go.dev/ref/mod#go-mod-file-replace).

3.  Зберіть ваш двійковий файл колектора:

    Запустіть збирач, передаючи конфігураційний файл збирача, який деталізує включений компонент конектора, що потім збере власний двійковий файл колектора:

    ```sh
    ./ocb --config [PATH-TO-CONFIG]/builder-config.yaml
    ```

    Це створить двійковий файл колектора в зазначеній теці виводу, яка була у вашому конфігураційному файлі.

    Коли збірка буде успішною, ви повинні побачити вихідні дані, подібні до:

    ```sh
    ./ocb --config builder-config.yaml
    2025-07-15T22:10:10.351+0900    INFO    internal/command.go:99  OpenTelemetry Collector Builder {"version": "0.129.0"}
    2025-07-15T22:10:10.352+0900    INFO    internal/command.go:104 Using config file       {"path": "builder-config.yaml"}
    2025-07-15T22:10:10.353+0900    INFO    builder/config.go:160   Using go        {"go-executable": "/opt/homebrew/Cellar/go@1.23/1.23.6/bin/go"}
    2025-07-15T22:10:10.354+0900    INFO    builder/main.go:99      Sources created {"path": "./otelcol-dev"}
    2025-07-15T22:10:10.516+0900    INFO    builder/main.go:201     Getting go modules
    2025-07-15T22:10:10.554+0900    INFO    builder/main.go:110     Compiling
    2025-07-15T22:10:13.369+0900    INFO    builder/main.go:140     Compiled        {"binary": "./otelcol-dev/otelcol-dev-bin"}
    ```

4.  Запустіть ваш двійковий файл колектора:

    Тепер ви можете запустити ваш власний двійковий файл колектора, використовуючи шлях до двійкового файлу з виводу на кроці 3 (наприклад, `{"binary": "./otelcol-dev/otelcol-dev-bin"}`):

    ```sh
    ./otelcol-dev/otelcol-dev-bin --config [PATH-TO-CONFIG]/config.yaml
    ```

    Імʼя вихідного шляху та імʼя dist детально описані у `build-config.yaml`.

## Тестування вашого конектора {#testing-your-connector}

Тепер, коли ви створили свій приклад конектора, давайте перевіримо його функціональність за допомогою модульних тестів. Модульні тести Go забезпечують краще покриття і їх легше підтримувати.

### Модульні тести {#writing-unit-tests}

Створіть файл тесту `connector_test.go` у теці вашого конектора:

> exampleconnector/connector_test.go

```go
package exampleconnector

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/vibeus/opentelemetry-collector/confmap/xconfmap"
	"go.opentelemetry.io/collector/consumer/consumertest"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.uber.org/zap"
)

func TestConsumeTraces(t *testing.T) {
	// Створення тестового споживача, який фіксує метрики
	metricsConsumer := &consumertest.MetricsSink{}

	// Створення конектора з тестовою конфігурацією
	cfg := &Config{
		AttributeName: "request.n",
	}

	connector, err := newConnector(zap.NewNop(), cfg, metricsConsumer)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("span with target attribute generates metric", func(t *testing.T) {
		// Перезавантаження споживача
		metricsConsumer.Reset()

		// Створення даних трасування з атрибутом target
		traces := ptrace.NewTraces()
		resourceSpan := traces.ResourceSpans().AppendEmpty()
		scopeSpan := resourceSpan.ScopeSpans().AppendEmpty()
		span := scopeSpan.Spans().AppendEmpty()

		// Додавання атрибуту target
		span.Attributes().PutStr("request.n", "test-value")
		span.Attributes().PutStr("http.method", "GET")

		// Споживання трейсів
		err := connector.ConsumeTraces(ctx, traces)
		require.NoError(t, err)

		// Переконайтеся, що метрика була згенерована
		assert.Equal(t, 1, len(metricsConsumer.AllMetrics()))
	})

	t.Run("span without target attribute does not generate metric", func(t *testing.T) {
		// Перезавантаження споживача
		metricsConsumer.Reset()

		// Створення даних трасування без атрибута target
		traces := ptrace.NewTraces()
		resourceSpan := traces.ResourceSpans().AppendEmpty()
		scopeSpan := resourceSpan.ScopeSpans().AppendEmpty()
		span := scopeSpan.Spans().AppendEmpty()

		// Додавання інших атрибутів, крім target
		span.Attributes().PutStr("http.method", "POST")
		span.Attributes().PutStr("user.id", "12345")

		// Споживання трейсів
		err := connector.ConsumeTraces(ctx, traces)
		require.NoError(t, err)

		// Переконайтеся, що метрика не була згенерована
		assert.Equal(t, 0, len(metricsConsumer.AllMetrics()))
	})

	t.Run("multiple spans with mixed attributes", func(t *testing.T) {
		// Перезавантаження споживача
		metricsConsumer.Reset()

		// Створення даних трасування з кількома відрізками
		traces := ptrace.NewTraces()
		resourceSpan := traces.ResourceSpans().AppendEmpty()
		scopeSpan := resourceSpan.ScopeSpans().AppendEmpty()

		// Перший відрізок з атрибутом target
		span1 := scopeSpan.Spans().AppendEmpty()
		span1.Attributes().PutStr("request.n", "value1")

		// Другий відрізок без атрибута target
		span2 := scopeSpan.Spans().AppendEmpty()
		span2.Attributes().PutStr("other.attr", "value2")

		// Споживання трейсів
		err := connector.ConsumeTraces(ctx, traces)
		require.NoError(t, err)

		// Має згенерувати рівно одну метрику (тільки з першого відрізка)
		assert.Equal(t, 1, len(metricsConsumer.AllMetrics()))
	})
}

func TestConnectorCapabilities(t *testing.T) {
	connector := &connectorImp{}
	capabilities := connector.Capabilities()
	assert.False(t, capabilities.MutatesData)
}

func TestCreateDefaultConfig(t *testing.T) {
	cfg := createDefaultConfig()
	assert.NotNil(t, cfg)

	exampleConfig := cfg.(*Config)
	assert.Equal(t, "request.n", exampleConfig.AttributeName)
}

func TestConfigValidation(t *testing.T) {
	t.Run("valid config", func(t *testing.T) {
		cfg := &Config{
			AttributeName: "test.attribute",
		}
		err := xconfmap.Validate(cfg)
		assert.NoError(t, err)
	})

	t.Run("invalid config - empty attribute name", func(t *testing.T) {
		cfg := &Config{
			AttributeName: "",
		}
		err := xconfmap.Validate(cfg)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "attribute_name must not be empty")
	})
}
```

### Запуск тестів {#running-the-tests}

1. **Додайте тестові залежності до вашого `go.mod`:**

   ```sh
   go mod tidy
   ```

2. **Запустіть тести:**

   ```sh
   go test -cover -v ./...
   ```

### Очікувані результати тестування {#expected-test-output}

Після успішного запуску тестів ви побачите вивід, подібний до цього:

```sh
go test -cover -v ./...
=== RUN   TestConsumeTraces
=== RUN   TestConsumeTraces/span_with_target_attribute_generates_metric
=== RUN   TestConsumeTraces/span_without_target_attribute_does_not_generate_metric
=== RUN   TestConsumeTraces/multiple_spans_with_mixed_attributes
--- PASS: TestConsumeTraces (0.00s)
    --- PASS: TestConsumeTraces/span_with_target_attribute_generates_metric (0.00s)
    --- PASS: TestConsumeTraces/span_without_target_attribute_does_not_generate_metric (0.00s)
    --- PASS: TestConsumeTraces/multiple_spans_with_mixed_attributes (0.00s)
=== RUN   TestConnectorCapabilities
--- PASS: TestConnectorCapabilities (0.00s)
=== RUN   TestCreateDefaultConfig
--- PASS: TestCreateDefaultConfig (0.00s)
=== RUN   TestConfigValidation
=== RUN   TestConfigValidation/valid_config
=== RUN   TestConfigValidation/invalid_config_-_empty_attribute_name
--- PASS: TestConfigValidation (0.00s)
    --- PASS: TestConfigValidation/valid_config (0.00s)
    --- PASS: TestConfigValidation/invalid_config_-_empty_attribute_name (0.00s)
PASS
coverage: 90.5% of statements
ok      github.com/gord02/exampleconnector      0.501s  coverage: 90.5% of statements
```

Ці модульні тести забезпечують повне покриття функціональності вашого конектора і є рекомендованим підходом для перевірки поведінки компонентів в екосистемі OpenTelemetry Collector.

Додаткові ресурси про OpenTelemetry Collector Builder:

- [Створення власного Колектора](/docs/collector/extend/ocb/)
- [OpenTelemetry Collector Builder README](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
- [Connected Observability Pipelines in the OpenTelemetry Collector by Dan Jaglowski](https://www.youtube.com/watch?v=uPpZ23iu6kI)
- [Connector README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)
