---
title: Бібліотеки клієнтів Prometheus чи OpenTelemetry
linkTitle: Бібліотеки клієнтів Prometheus
weight: 5
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
# prettier-ignore
cSpell:ignore: AggregationBase2ExponentialHistogram base2ExponentialBucketHistogram bedroomTemperatureCelsius buildAndStart buildWithCallback classicUpperBounds connectedDeviceCount CounterValue defaultAggregation deviceCommandDuration devicesConnected errcheck gaugeBuilder GaugeFunc GaugeValue GaugeWithCallback hvac hvacOnTime initLabelValues InstrumentKindHistogram InstrumentSelector InstrumentType labelValues livingRoomTemperatureCelsius LongUpDownCounter MustNewConstMetric NativeHistogramBucketFactor nativeOnly nolint OtelHistogramAsSummary otlpmetrichttp PrometheusHistogramNative PrometheusRegistry PrometheusSummary promhttp sdkmetric setDefaultAggregationSelector setExplicitBucketBoundariesAdvice thermostatSetpoint totalEnergyJoules upDownCounterBuilder декрементування інкрементування
---

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>

> [!NOTE]
>
> Ця сторінка охоплює Java та Go. Приклади для інших мов плануються.

Цей посібник призначений для розробників, знайомих з [бібліотеками клієнтів Prometheus](https://prometheus.io/docs/instrumenting/clientlibs/), які хочуть зрозуміти еквівалентні шаблони в API та SDK метрик OpenTelemetry. Він охоплює найпоширеніші шаблони, але не є вичерпним.

## Концептуальні відмінності {#conceptual-differences}

Перед тим як розглядати код, корисно зрозуміти кілька структурних відмінностей між двома системами. Специфікація [Сумісність Prometheus та OpenMetrics](/docs/specs/otel/compatibility/prometheus_and_openmetrics/) документує повні правила трансляції між двома системами. Цей розділ охоплює відмінності, які найбільш актуальні для написання нового коду інструментування.

### Реєстр (MeterProvider) {#registry-meterprovider}

В Prometheus, метрики реєструються в реєстрі — зазвичай глобально. Ви можете оголосити метрику будь-де у вашому коді, і вона стане доступною для збору після реєстрації. Експортер (HTTP сервер або OTLP push) підключається до реєстру як окремий, незалежний крок.

В OpenTelemetry, `MeterProvider` та `Meter` є частиною API метрик. Ви отримуєте `Meter`, обмежений вашою бібліотекою або компонентом, від `MeterProvider` і створюєте інструменти з цього `Meter`. Як ці вимірювання обробляються, які експортери їх отримують, як вони агрегуються, за яким графіком, визначається SDK, привʼязаний до `MeterProvider` та його конфігурацією, яка відокремлена від коду інструментування (див. [API та SDK](#otel-api-and-sdk)).

Як і Prometheus, OpenTelemetry підтримує як глобальний `MeterProvider` (не вимагаючи явного підключення з коду інструментування), так і явні екземпляри `MeterProvider`, які можна передавати бібліотекам, що їх підтримують.

### Назви міток (атрибути) {#label-names-attributes}

Prometheus вимагає, щоб назви міток були оголошені під час створення метрики. Значення міток привʼязуються під час запису за допомогою `labelValues(...)`.

OpenTelemetry не вимагає попереднього оголошення міток. Ключі та значення атрибутів надаються разом під час вимірювання за допомогою `Attributes`.

### Домовленості щодо найменування {#naming-conventions}

Prometheus використовує імена метрик у форматі `snake_case`. Імена лічильників закінчуються на `_total`. За домовленістю, імена метрик Prometheus мають префікс з назви застосунку або бібліотеки, щоб уникнути конфліктів (наприклад, `smart_home_hvac_on_seconds_total`), оскільки всі метрики використовують плаский глобальний простір імен.

OpenTelemetry зазвичай використовує [імена з крапками](/docs/specs/semconv/general/naming/). Власність та простір імен фіксуються в області інструментування (імʼя `Meter`, наприклад `smart.home`), тому самі імена метрик не потребують префікса (наприклад, `hvac.on`). При експорті в Prometheus експортер перетворює імена: крапки стають підкресленнями, скорочення одиниць розширюються до повних слів (наприклад, `s` → `seconds`), а лічильники отримують суфікс `_total`. Лічильник OpenTelemetry з іменем `hvac.on` та одиницею `s` експортується як `hvac_on_seconds_total`. Див. [специфікацію сумісності](/docs/specs/otel/compatibility/prometheus_and_openmetrics/) для повного набору правил перетворення імен. Стратегію перетворення можна налаштувати — наприклад, для збереження символів UTF-8 або придушення суфіксів одиниць та типів. Див. [експортер Prometheus](/docs/specs/otel/metrics/sdk_exporters/prometheus/) для деталей конфігурації.

### Інструменти з станом та зворотним викликом {#stateful-and-callback-instruments}

Обидві системи підтримують два режими запису:

- **Prometheus** розрізняє інструменти зі збереженням _стану_ (`Counter`, `Gauge`), які підтримують власне накопичене значення, та інструменти на основі функцій, які виконують зворотний виклик під час збору, щоб повернути поточне значення. Найменування варіюється залежно від бібліотеки клієнта (`GaugeFunc`/`CounterFunc` у Go; `GaugeWithCallback`/`CounterWithCallback` у Java).
- **OpenTelemetry** називає їх _синхронними_ (лічильник, гістограма тощо) та _асинхронними_ (спостережувані через зареєстрований зворотний виклик). Семантика та сама.

Зауважте, що Prometheus `Gauge` охоплює два різні типи інструментів OTel: `Gauge` для неадитивних значень (наприклад, температура) та `UpDownCounter` для адитивних значень, які можуть збільшуватися або зменшуватися (наприклад, активні зʼєднання). Див. [Gauge](#gauge) для деталей.

### OTel: API та SDK {#otel-api-and-sdk}

OpenTelemetry відділяє інструментування від конфігурації за допомогою двошарового дизайну: пакунок **API** та пакунок **SDK**. API визначає інтерфейси, які використовуються для запису метрик. SDK забезпечує реалізацію — конкретного провайдера, експортери та обробку конвеєра.

Код інструментування повинен залежати лише від API. SDK налаштовується один раз під час запуску застосунку і підключається до посилання на API, яке передається решті коду. Це дозволяє коду бібліотеки інструментування бути відокремленим від будь-якої конкретної версії SDK і спрощує заміну на реалізацію без операцій для тестування.

### OTel: Сфера застосування інструментування {#otel-instrumentation-scope}

Метрики Prometheus мають глобальний характер: усі метрики в одному процесі використовують єдиний плоский простір імен, який ідентифікується лише за назвою та мітками.

OpenTelemetry обмежує кожну групу інструментів до `Meter`, який ідентифікується за назвою та необовʼязковою версією (наприклад, `smart.home`). Під час експорту до Prometheus, назва та версія області додаються як мітки `otel_scope_name` та `otel_scope_version` до кожної точки метрики. Будь-які додаткові атрибути області також додаються як мітки, названі `otel_scope_[attr name]`. Ці мітки зʼявляються автоматично і можуть бути незнайомими користувачам, які переходять з Prometheus. Їх можна вимкнути за допомогою опції `without_scope_info` експортера, див. [Prometheus exporter](/docs/specs/otel/metrics/sdk_exporters/prometheus/) для деталей конфігурації. Зверніть увагу, що вимкнення інформації про область безпечне лише тоді, коли кожна назва метрики створюється однією областю. Якщо дві області генерують метрику з однаковою назвою, мітки області є єдиним способом їх розрізнити; без цих міток ви отримаєте дублікати часових рядів без можливості визначити їхнє походження, що призводить до некоректного виводу в Prometheus.

### OTel: Часові характеристики агрегації {#otel-aggregation-temporality}

Метрики Prometheus завжди є накопичувальними. OpenTelemetry підтримує як накопичувальний, так і дельта-тип обчислення, але експортер Prometheus застосовує накопичувальний тип для всіх інструментів. Для розробників, які переходять з Prometheus, цей процес є прозорим — звична для вас поведінка залишається незмінною.

### OTel: Атрибути ресурсу {#otel-resource-attributes}

Prometheus визначає обʼєкти збору даних за допомогою міток `job` та `instance`, які додаються сервером Prometheus під час збору даних.

OpenTelemetry має `Resource` — структуровані метадані, прикріплені до всієї телеметрії з процесу, з атрибутами, такими як `service.name` та `service.instance.id`. Під час експорту до Prometheus експортер переносить атрибути ресурсу на мітки `job` та `instance`, а будь-які залишкові атрибути присутні в метриці `target_info` (`target_info` є конвенцією OpenMetrics 1.0, якщо ви наразі вручну емулюєте її з Prometheus, еквівалент OTel — встановити атрибути ресурсу). Див. [специфікацію сумісності](/docs/specs/otel/compatibility/prometheus_and_openmetrics/) для точних правил зіставлення. Метрику `target_info` можна вимкнути за допомогою `without_target_info`, а конкретні атрибути ресурсу можна підняти до міток на рівні метрики за допомогою `with_resource_constant_labels`. Див. [експортер Prometheus](/docs/specs/otel/metrics/sdk_exporters/prometheus/) для деталей конфігурації.

## Ініціалізація {#initialization}

Приклади нижче охоплюють два основні сценарії розгортання: експонування точки доступу збору Prometheus та надсилання до точки доступу OTLP.

### Експонування точки доступу збору Prometheus {#expose-a-prometheus-scrape-endpoint}

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt "src/main/java/otel/PrometheusScrapeInit.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.httpserver.HTTPServer;
import java.io.IOException;

public class PrometheusScrapeInit {
  public static void main(String[] args) throws IOException, InterruptedException {
    // Створіть лічильник і зареєструйте його в стандартному PrometheusRegistry.
    Counter doorOpens =
        Counter.builder()
            .name("door_opens_total")
            .help("Total number of times a door has been opened")
            .labelNames("door")
            .register();

    // Запустіть HTTP-сервер; Prometheus збирає дані з http://localhost:9464/metrics.
    HTTPServer server = HTTPServer.builder().port(9464).buildAndStart();
    Runtime.getRuntime().addShutdownHook(new Thread(server::close));

    doorOpens.labelValues("front").inc();

    Thread.currentThread().join(); // очікувати нескінченно
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelScrapeInit.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;

public class OtelScrapeInit {
  // Попередньо виділіть ключі атрибутів і, коли значення статичні, цілі об'єкти Attributes.
  private static final AttributeKey<String> DOOR = AttributeKey.stringKey("door");
  private static final Attributes FRONT_DOOR = Attributes.of(DOOR, "front");

  public static void main(String[] args) throws InterruptedException {
    // Налаштуйте SDK: зареєструйте Prometheus reader, який обслуговує /metrics.
    OpenTelemetrySdk sdk =
        OpenTelemetrySdk.builder()
            .setMeterProvider(
                SdkMeterProvider.builder()
                    .registerMetricReader(PrometheusHttpServer.builder().setPort(9464).build())
                    .build())
            .build();
    Runtime.getRuntime().addShutdownHook(new Thread(sdk::close));

    // Код інструментування використовує тип API OpenTelemetry, а не тип SDK безпосередньо.
    OpenTelemetry openTelemetry = sdk;

    // Метрики обслуговуються за адресою http://localhost:9464/metrics.
    Meter meter = openTelemetry.getMeter("smart.home");
    LongCounter doorOpens =
        meter
            .counterBuilder("door.opens")
            .setDescription("Total number of times a door has been opened")
            .build();

    doorOpens.add(1, FRONT_DOOR);

    Thread.currentThread().join(); // очікувати нескінченно
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_scrape_init.go"?>

```go
package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Створіть лічильник і зареєструйте його у власному реєстрі.
	reg := prometheus.NewRegistry()
	doorOpens := prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "door_opens_total",
		Help: "Total number of times a door has been opened",
	}, []string{"door"})
	reg.MustRegister(doorOpens)

	// Prometheus зчитує дані з http://localhost:9464/metrics.
	http.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
	go http.ListenAndServe(":9464", nil) //nolint:errcheck

	doorOpens.WithLabelValues("front").Inc()

	select {} // очікувати нескінченно
}
```

OpenTelemetry

<?code-excerpt "otel_scrape_init.go"?>

```go
package main

import (
	"context"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

func main() {
	ctx := context.Background()
	// Налаштуйте SDK: зареєструйте Prometheus reader, який обслуговує /metrics.
	exporter, err := prometheus.New()
	if err != nil {
		panic(err)
	}
	provider := sdkmetric.NewMeterProvider(sdkmetric.WithReader(exporter))
	defer provider.Shutdown(ctx) //nolint:errcheck

	// Метрики обслуговуються за адресою http://localhost:9464/metrics.
	http.Handle("/metrics", promhttp.Handler())
	go http.ListenAndServe(":9464", nil) //nolint:errcheck

	// Код інструментування використовує тип API OpenTelemetry, а не тип SDK безпосередньо.
	meter := provider.Meter("smart.home")
	doorOpens, err := meter.Int64Counter("door.opens",
		metric.WithDescription("Total number of times a door has been opened"))
	if err != nil {
		panic(err)
	}

	doorOpens.Add(ctx, 1, metric.WithAttributes(attribute.String("door", "front")))

	select {} // очікувати нескінченно
}
```

{{% /tab %}} {{< /tabpane >}}

### надсилання метрик до точки доступу OTLP {#push-metrics-to-an-otlp-endpoint}

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusOtlpInit.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.opentelemetry.OpenTelemetryExporter;

public class PrometheusOtlpInit {
  public static void main(String[] args) throws Exception {
    // Створіть лічильник і зареєструйте його у стандартному реєстрі Prometheus.
    Counter doorOpens =
        Counter.builder()
            .name("door_opens_total")
            .help("Total number of times a door has been opened")
            .labelNames("door")
            .register();

    // Запустіть експортер OTLP. Він читає дані з стандартного реєстру Prometheus і
    // надсилає метрики на налаштовану точку доступу з фіксованим інтервалом.
    OpenTelemetryExporter exporter =
        OpenTelemetryExporter.builder()
            .protocol("http/protobuf")
            .endpoint("http://localhost:4318")
            .intervalSeconds(60)
            .buildAndStart();
    Runtime.getRuntime().addShutdownHook(new Thread(exporter::close));

    doorOpens.labelValues("front").inc();

    Thread.currentThread().join(); // очікувати нескінченно
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelOtlpInit.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import java.time.Duration;

public class OtelOtlpInit {
  public static void main(String[] args) throws InterruptedException {
    // Налаштуйте SDK: експортуйте метрики через OTLP/HTTP з фіксованим інтервалом.
    OpenTelemetrySdk sdk =
        OpenTelemetrySdk.builder()
            .setMeterProvider(
                SdkMeterProvider.builder()
                    .registerMetricReader(
                        PeriodicMetricReader.builder(
                                OtlpHttpMetricExporter.builder()
                                    .setEndpoint("http://localhost:4318")
                                    .build())
                            .setInterval(Duration.ofSeconds(60))
                            .build())
                    .build())
            .build();
    Runtime.getRuntime().addShutdownHook(new Thread(sdk::close));

    // Код інструментування використовує тип API OpenTelemetry, а не тип SDK безпосередньо.
    OpenTelemetry openTelemetry = sdk;

    Meter meter = openTelemetry.getMeter("smart.home");
    LongCounter doorOpens =
        meter
            .counterBuilder("door.opens")
            .setDescription("Total number of times a door has been opened")
            .build();

    doorOpens.add(1);

    Thread.currentThread().join(); // очікувати нескінченно
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

Клієнтська бібліотека Prometheus для Go не включає експортер OTLP push.

OpenTelemetry

<?code-excerpt "otel_otlp_init.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

func main() {
	ctx := context.Background()
	// Налаштуйте SDK: експортуйте метрики через OTLP/HTTP з фіксованим інтервалом.
	// Точка доступу зазвичай localhost:4318 і може бути налаштована через
	// змінну середовища OTEL_EXPORTER_OTLP_ENDPOINT.
	exporter, err := otlpmetrichttp.New(ctx)
	if err != nil {
		panic(err)
	}
	provider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)),
	)
	defer provider.Shutdown(ctx) //nolint:errcheck

	meter := provider.Meter("smart.home")
	doorOpens, err := meter.Int64Counter("door.opens",
		metric.WithDescription("Total number of times a door has been opened"))
	if err != nil {
		panic(err)
	}

	doorOpens.Add(ctx, 1, metric.WithAttributes(attribute.String("door", "front")))

	select {} // очікувати нескінченно
}
```

{{% /tab %}} {{< /tabpane >}}

## Лічильник {#counter}

Лічильник записує монотонно збільшувані значення. Prometheus `Counter` відповідає інструменту OpenTelemetry `Counter`.

- **Кодування одиниць**: Prometheus кодує одиницю в назві метрики (`hvac_on_seconds_total`). OpenTelemetry розділяє назву (`hvac.on`) та одиницю (`s`), а експортер Prometheus автоматично додає суфікс одиниці.

### Лічильник {#counter-1}

Prometheus `Counter` включає дві функції управління серіями, які не мають еквівалента в OpenTelemetry:

- **Попередня ініціалізація серій**: клієнти Prometheus можуть попередньо ініціалізувати комбінації значень міток, щоб вони зʼявлялися у виводі scrape зі значенням 0 до того, як відбудеться будь-який запис. OpenTelemetry не має еквівалента; точки даних зʼявляються вперше при першому виклику `add()`.
- **Попередньо привʼязані серії**: клієнти Prometheus дозволяють кешувати результат `labelValues()`, щоб попередньо привʼязати до конкретної комбінації значень міток. Наступні виклики йдуть безпосередньо до точки даних, пропускаючи внутрішній пошук серії. OpenTelemetry не має еквівалента, хоча це [обговорюється](https://github.com/open-telemetry/opentelemetry-specification/issues/4126).

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusCounter.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;

public class PrometheusCounter {
  public static void counterUsage() {
    Counter hvacOnTime =
        Counter.builder()
            .name("hvac_on_seconds_total")
            .help("Total time the HVAC system has been running, in seconds")
            .labelNames("zone")
            .register();

    // Попередньо привʼязати до наборів значень міток: наступні виклики йдуть безпосередньо до точки даних,
    // пропускаючи внутрішній пошук серії.
    var upstairs = hvacOnTime.labelValues("upstairs");
    var downstairs = hvacOnTime.labelValues("downstairs");

    upstairs.inc(127.5);
    downstairs.inc(3600.0);

    // Попередньо ініціалізувати зони, щоб вони зʼявлялися у /metrics зі значенням 0 при запуску.
    hvacOnTime.initLabelValues("basement");
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelCounter.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleCounter;
import io.opentelemetry.api.metrics.Meter;

public class OtelCounter {
  // Попередньо виділити ключі атрибутів і, коли значення статичні, цілі обʼєкти Attributes.
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void counterUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // Час роботи системи опалення, вентиляції та кондиціонування (HVAC) виражається у дробовій формі — використовується функція `useOfDoubles()` для отримання лічильника типу `DoubleCounter`.
    // Відсутність попереднього оголошення міток: атрибути задаються під час запису.
    DoubleCounter hvacOnTime =
        meter
            .counterBuilder("hvac.on")
            .setDescription("Total time the HVAC system has been running")
            .setUnit("s")
            .ofDoubles()
            .build();

    hvacOnTime.add(127.5, UPSTAIRS);
    hvacOnTime.add(3600.0, DOWNSTAIRS);
  }
}
```

Ключові відмінності:

- `inc(value)` → `add(value)`. На відміну від Prometheus, OpenTelemetry вимагає явного значення — немає скорочення `inc()`.
- OpenTelemetry розрізняє `LongCounter` (цілі числа, зазвичай) і `DoubleCounter` (через `.ofDoubles()`, для дробових значень). Prometheus використовує один тип `Counter`.
- Попередньо виділяйте екземпляри `AttributeKey` (завжди) і обʼєкти `Attributes` (коли значення статичні), щоб уникнути виділення пам'яті при кожному виклику на гарячому шляху.

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_counter.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var hvacOnTime = prometheus.NewCounterVec(prometheus.CounterOpts{
	Name: "hvac_on_seconds_total",
	Help: "Total time the HVAC system has been running, in seconds",
}, []string{"zone"})

func prometheusCounterUsage(reg *prometheus.Registry) {
	reg.MustRegister(hvacOnTime)

	// Попередньо привʼязати до наборів значень міток: наступні виклики йдуть безпосередньо до точки даних,
	// пропускаючи внутрішній пошук серії.
	upstairs := hvacOnTime.WithLabelValues("upstairs")
	downstairs := hvacOnTime.WithLabelValues("downstairs")

	upstairs.Add(127.5)
	downstairs.Add(3600.0)

	// Попередньо ініціалізувати серію, щоб вона зʼявлялася у /metrics зі значенням 0.
	hvacOnTime.WithLabelValues("basement")
}
```

OpenTelemetry

<?code-excerpt "otel_counter.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Попередньо виділяйте опції атрибутів, коли значення статичні, щоб уникнути виділення пам'яті при кожному виклику.
var (
	zoneUpstairsOpts   = []metric.AddOption{metric.WithAttributes(attribute.String("zone", "upstairs"))}
	zoneDownstairsOpts = []metric.AddOption{metric.WithAttributes(attribute.String("zone", "downstairs"))}
)

func otelCounterUsage(ctx context.Context, meter metric.Meter) {
	// Відсутність попереднього оголошення міток: атрибути задаються під час запису.
	hvacOnTime, err := meter.Float64Counter("hvac.on",
		metric.WithDescription("Total time the HVAC system has been running"),
		metric.WithUnit("s"))
	if err != nil {
		panic(err)
	}

	hvacOnTime.Add(ctx, 127.5, zoneUpstairsOpts...)
	hvacOnTime.Add(ctx, 3600.0, zoneDownstairsOpts...)
}
```

Ключові відмінності:

- `Add(value)` → `Add(ctx, value, metric.WithAttributes(...))`. Усі виклики інструментів вимагають `context.Context` як першого аргументу.
- У Go `meter.Float64Counter` і `meter.Int64Counter` є окремими методами. Prometheus використовує один тип `Counter`.
- Створення інструменту повертає `(Instrument, error)` і помилку потрібно обробляти.

{{% /tab %}} {{< /tabpane >}}

### Лічильник із зворотним викликом (асинхронний) {#callback-async-counter}

Використовуйте лічильник із зворотним викликом (асинхронний лічильник у OpenTelemetry), коли загальне значення підтримується зовнішнім джерелом, наприклад, пристроєм або середовищем виконання, і ви хочете відстежувати його під час збору даних, а не збільшувати самостійно.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusCounterCallback.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.CounterWithCallback;

public class PrometheusCounterCallback {
  public static void counterCallbackUsage() {
    // Кожна зона має власний розумний лічильник енергії, який відстежує накопичені джоулі.
    // Використовуйте лічильник із зворотним викликом, щоб повідомляти ці значення під час збору даних,
    // не підтримуючи окремі лічильники в коді програми.
    CounterWithCallback.builder()
        .name("energy_consumed_joules_total")
        .help("Total energy consumed in joules")
        .labelNames("zone")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.totalEnergyJoules("upstairs"), "upstairs");
              callback.call(SmartHomeDevices.totalEnergyJoules("downstairs"), "downstairs");
            })
        .register();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelCounterCallback.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelCounterCallback {
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void counterCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // Кожна зона має власний розумний лічильник енергії, який відстежує накопичені джоулі.
    // Використовуйте асинхронний лічильник, щоб повідомляти ці значення під час збору даних,
    // не підтримуючи окремі лічильники в коді програми.
    meter
        .counterBuilder("energy.consumed")
        .setDescription("Total energy consumed")
        .setUnit("J")
        .ofDoubles()
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.totalEnergyJoules("upstairs"), UPSTAIRS);
              measurement.record(SmartHomeDevices.totalEnergyJoules("downstairs"), DOWNSTAIRS);
            });
  }
}
```

Ключові відмінності:

- OpenTelemetry розрізняє цілочисельні та числові лічильники з рухомою комою; `.ofDoubles()` вибирає числовий варіант з рухомою комою. Prometheus `CounterWithCallback` завжди використовує значення з рухомою комою.

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_counter_callback.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

type energyCollector struct{ desc *prometheus.Desc }

func newEnergyCollector() *energyCollector {
	return &energyCollector{desc: prometheus.NewDesc(
		"energy_consumed_joules_total",
		"Total energy consumed in joules",
		[]string{"zone"}, nil,
	)}
}

func (c *energyCollector) Describe(ch chan<- *prometheus.Desc) { ch <- c.desc }
func (c *energyCollector) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.CounterValue, totalEnergyJoules("upstairs"), "upstairs")
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.CounterValue, totalEnergyJoules("downstairs"), "downstairs")
}

func prometheusCounterCallbackUsage(reg *prometheus.Registry) {
	// Кожна зона має власний розумний лічильник енергії, який відстежує накопичені джоулі.
	// Реалізуйте prometheus.Collector, щоб повідомляти ці значення під час збору даних.
	reg.MustRegister(newEnergyCollector())
}
```

OpenTelemetry

<?code-excerpt "otel_counter_callback.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	zoneUpstairs   = attribute.String("zone", "upstairs")
	zoneDownstairs = attribute.String("zone", "downstairs")
)

func otelCounterCallbackUsage(meter metric.Meter) {
	// Кожна зона має власний розумний лічильник енергії, який відстежує накопичені джоулі.
	// Використовуйте спостережуваний лічильник, щоб повідомляти ці значення під час збору даних.
	_, err := meter.Float64ObservableCounter("energy.consumed",
		metric.WithDescription("Total energy consumed"),
		metric.WithUnit("J"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(totalEnergyJoules("upstairs"), metric.WithAttributes(zoneUpstairs))
			o.Observe(totalEnergyJoules("downstairs"), metric.WithAttributes(zoneDownstairs))
			return nil
		}))
	if err != nil {
		panic(err)
	}
}
```

Ключові відмінності:

- Приклад Prometheus реалізує `prometheus.Collector` з методами `Describe` та `Collect` для повідомлення значень лічильників з мітками.
- OpenTelemetry розрізняє `Float64ObservableCounter` та `Int64ObservableCounter`.

{{% /tab %}} {{< /tabpane >}}

## Gauge {#gauge}

Записи Gauge фіксують миттєве значення, яке може збільшуватися або зменшуватися. Prometheus використовує один тип `Gauge` для всіх таких значень, але OpenTelemetry розрізняє **адитивні** та **неадитивні** значення при виборі відповідного інструменту:

- **Неадитивні** значення не можна змістовно сумувати між екземплярами — наприклад, температура: додавання показників трьох датчиків кімнати не дає корисного числа. Вони відповідають OTel `Gauge` та `ObservableGauge`.
- **Адитивні** значення можна змістовно сумувати між екземплярами — наприклад, кількість підключених пристроїв, сумована між екземплярами сервісу, дає корисну загальну кількість. Вони відповідають OTel `UpDownCounter` та `ObservableUpDownCounter`.

Ця відмінність застосовується до всіх шаблонів gauge: abs, inc і dec, а також варіантів зворотного виклику. Див. [керівництво з вибору інструментів](/docs/specs/otel/metrics/supplementary-guidelines/#instrument-selection) для детальнішого пояснення.

### Gauge — abs

Використовуйте цей шаблон для значень, що записуються як абсолютне значення — наприклад, конфігураційне значення або встановлена точка пристрою. Prometheus `Gauge` відповідає інструменту OpenTelemetry `Gauge`.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusGauge.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Gauge;

public class PrometheusGauge {
  public static void gaugeUsage() {
    Gauge thermostatSetpoint =
        Gauge.builder()
            .name("thermostat_setpoint_celsius")
            .help("Target temperature set on the thermostat")
            .labelNames("zone")
            .register();

    thermostatSetpoint.labelValues("upstairs").set(22.5);
    thermostatSetpoint.labelValues("downstairs").set(20.0);
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelGauge.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleGauge;
import io.opentelemetry.api.metrics.Meter;

public class OtelGauge {
  // Попередньо виділіть ключі атрибутів і, коли значення статичні, цілі об'єкти Attributes.
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void gaugeUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    DoubleGauge thermostatSetpoint =
        meter
            .gaugeBuilder("thermostat.setpoint")
            .setDescription("Target temperature set on the thermostat")
            .setUnit("Cel")
            .build();

    thermostatSetpoint.set(22.5, UPSTAIRS);
    thermostatSetpoint.set(20.0, DOWNSTAIRS);
  }
}
```

Ключові відмінності:

- `set(value)` → `set(value, attributes)`. Назва методу залишається тією ж.
- OpenTelemetry розрізняє `LongGauge` (цілі числа, через `.ofLongs()`) та `DoubleGauge` (зазвичай). Prometheus використовує один тип `Gauge`.
- Попередньо виділіть екземпляри `AttributeKey` (завжди) та обʼєкти `Attributes` (коли значення статичні), щоб уникнути виділення памʼяті при кожному виклику на гарячому шляху.

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_gauge.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var thermostatSetpoint = prometheus.NewGaugeVec(prometheus.GaugeOpts{
	Name: "thermostat_setpoint_celsius",
	Help: "Target temperature set on the thermostat",
}, []string{"zone"})

func prometheusGaugeUsage(reg *prometheus.Registry) {
	reg.MustRegister(thermostatSetpoint)

	thermostatSetpoint.WithLabelValues("upstairs").Set(22.5)
	thermostatSetpoint.WithLabelValues("downstairs").Set(20.0)
}
```

OpenTelemetry

<?code-excerpt "otel_gauge.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Попередньо виділіть параметри атрибутів, коли значення статичні, щоб уникнути виділення пам'яті при кожному виклику.
var (
	zoneUpstairsGaugeOpts   = []metric.RecordOption{metric.WithAttributes(attribute.String("zone", "upstairs"))}
	zoneDownstairsGaugeOpts = []metric.RecordOption{metric.WithAttributes(attribute.String("zone", "downstairs"))}
)

func otelGaugeUsage(ctx context.Context, meter metric.Meter) {
	thermostatSetpoint, err := meter.Float64Gauge("thermostat.setpoint",
		metric.WithDescription("Target temperature set on the thermostat"),
		metric.WithUnit("Cel"))
	if err != nil {
		panic(err)
	}

	thermostatSetpoint.Record(ctx, 22.5, zoneUpstairsGaugeOpts...)
	thermostatSetpoint.Record(ctx, 20.0, zoneDownstairsGaugeOpts...)
}
```

Ключові відмінності:

- `Set(value)` → `Record(ctx, value, metric.WithAttributes(...))`.
- В Go, `meter.Float64Gauge` та `meter.Int64Gauge` є окремими методами. Prometheus використовує один тип `Gauge`.

{{% /tab %}} {{< /tabpane >}}

### Gauge зі зворотним викликом — abs {#callback-gauge--abs}

Використовуйте gauge зі зворотним викликом (асинхронний gauge в OpenTelemetry), коли значення не є адитивним і підтримується зовнішньо, наприклад, показання датчика, і ви хочете спостерігати його під час збору, а не відстежувати самостійно.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusGaugeCallback.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.GaugeWithCallback;

public class PrometheusGaugeCallback {
  public static void gaugeCallbackUsage() {
    // Датчики температури підтримують власні показання у прошивці.
    // Використовуйте gauge зі зворотним викликом, щоб повідомляти ці значення під час збору, не підтримуючи окремий gauge у коді програми.
    GaugeWithCallback.builder()
        .name("room_temperature_celsius")
        .help("Current temperature in the room")
        .labelNames("room")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.livingRoomTemperatureCelsius(), "living_room");
              callback.call(SmartHomeDevices.bedroomTemperatureCelsius(), "bedroom");
            })
        .register();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelGaugeCallback.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelGaugeCallback {
  private static final AttributeKey<String> ROOM = AttributeKey.stringKey("room");
  private static final Attributes LIVING_ROOM = Attributes.of(ROOM, "living_room");
  private static final Attributes BEDROOM = Attributes.of(ROOM, "bedroom");

  public static void gaugeCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // Датчики температури підтримують власні показання у прошивці.
    // Використовуйте асинхронний gauge, щоб повідомляти ці значення під час збору метрик,
    // не підтримуючи окремі gauge у коді програми.
    meter
        .gaugeBuilder("room.temperature")
        .setDescription("Current temperature in the room")
        .setUnit("Cel")
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.livingRoomTemperatureCelsius(), LIVING_ROOM);
              measurement.record(SmartHomeDevices.bedroomTemperatureCelsius(), BEDROOM);
            });
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_gauge_callback.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

type temperatureCollector struct{ desc *prometheus.Desc }

func newTemperatureCollector() *temperatureCollector {
	return &temperatureCollector{desc: prometheus.NewDesc(
		"room_temperature_celsius",
		"Current temperature in the room",
		[]string{"room"}, nil,
	)}
}

func (c *temperatureCollector) Describe(ch chan<- *prometheus.Desc) { ch <- c.desc }
func (c *temperatureCollector) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, livingRoomTemperatureCelsius(), "living_room")
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, bedroomTemperatureCelsius(), "bedroom")
}

func prometheusGaugeCallbackUsage(reg *prometheus.Registry) {
	// Датчики температури підтримують власні показання у прошивці.
	// Реалізуйте prometheus.Collector, щоб повідомляти ці значення під час збору.
	reg.MustRegister(newTemperatureCollector())
}
```

OpenTelemetry

<?code-excerpt "otel_gauge_callback.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	roomLivingRoom = attribute.String("room", "living_room")
	roomBedroom    = attribute.String("room", "bedroom")
)

func otelGaugeCallbackUsage(meter metric.Meter) {
	// Датчики температури підтримують власні показання у прошивці.
	// Використовуйте асинхронний gauge, щоб повідомляти ці значення під час збору метрик,
	// не підтримуючи окремі gauge у коді програми.
	_, err := meter.Float64ObservableGauge("room.temperature",
		metric.WithDescription("Current temperature in the room"),
		metric.WithUnit("Cel"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(livingRoomTemperatureCelsius(), metric.WithAttributes(roomLivingRoom))
			o.Observe(bedroomTemperatureCelsius(), metric.WithAttributes(roomBedroom))
			return nil
		}))
	if err != nil {
		panic(err)
	}
}
```

Ключові відмінності:

- Приклад Prometheus реалізує `prometheus.Collector` з методами `Describe` та `Collect` для повідомлення значень gauge з мітками.

{{% /tab %}} {{< /tabpane >}}

### Gauge — inc та dec {#gauge--inc-and-dec}

Prometheus `Gauge` підтримує інкрементування та декрементування для значень, які змінюються поступово — таких як кількість підключених пристроїв або активних сесій. OpenTelemetry `Gauge` записує лише абсолютні значення; цей шаблон відповідає інструменту OpenTelemetry `UpDownCounter`.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusUpDownCounter.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Gauge;

public class PrometheusUpDownCounter {
  public static void upDownCounterUsage() {
    // Prometheus використовує Gauge для значень, які можуть збільшуватися або зменшуватися.
    Gauge devicesConnected =
        Gauge.builder()
            .name("devices_connected")
            .help("Number of smart home devices currently connected")
            .labelNames("device_type")
            .register();

    // Інкрементуйте, коли пристрій підключається, декрементуйте, коли він відключається.
    devicesConnected.labelValues("thermostat").inc();
    devicesConnected.labelValues("thermostat").inc();
    devicesConnected.labelValues("lock").inc();
    devicesConnected.labelValues("lock").dec();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelUpDownCounter.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongUpDownCounter;
import io.opentelemetry.api.metrics.Meter;

public class OtelUpDownCounter {
  // Попередньо виділіть ключі атрибутів і, коли значення статичні, цілі об'єкти Attributes.
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void upDownCounterUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    LongUpDownCounter devicesConnected =
        meter
            .upDownCounterBuilder("devices.connected")
            .setDescription("Number of smart home devices currently connected")
            .build();

    // add() приймає як додатні, так і від'ємні значення.
    devicesConnected.add(1, THERMOSTAT);
    devicesConnected.add(1, THERMOSTAT);
    devicesConnected.add(1, LOCK);
    devicesConnected.add(-1, LOCK);
  }
}
```

Ключові відмінності:

- `inc()` / `dec()` → `add(1)` / `add(-1)`. `add()` приймає як додатні, так і від'ємні значення.
- Тип Prometheus — `Gauge`; тип OpenTelemetry — `LongUpDownCounter` (або `DoubleUpDownCounter` через `.ofDoubles()`).

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_up_down_counter.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

// Prometheus використовує Gauge для значень, які можуть збільшуватися або зменшуватися.
var devicesConnected = prometheus.NewGaugeVec(prometheus.GaugeOpts{
	Name: "devices_connected",
	Help: "Number of smart home devices currently connected",
}, []string{"device_type"})

func prometheusUpDownCounterUsage(reg *prometheus.Registry) {
	reg.MustRegister(devicesConnected)

	// Інкрементуйте, коли пристрій підключається, декрементуйте, коли він відключається.
	devicesConnected.WithLabelValues("thermostat").Inc()
	devicesConnected.WithLabelValues("thermostat").Inc()
	devicesConnected.WithLabelValues("lock").Inc()
	devicesConnected.WithLabelValues("lock").Dec()
}
```

OpenTelemetry

<?code-excerpt "otel_up_down_counter.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Попередньо виділіть ключі атрибутів і, коли значення статичні, цілі об'єкти Attributes.
var (
	deviceThermostatAddOpts = []metric.AddOption{metric.WithAttributes(attribute.String("device_type", "thermostat"))}
	deviceLockAddOpts       = []metric.AddOption{metric.WithAttributes(attribute.String("device_type", "lock"))}
)

func otelUpDownCounterUsage(ctx context.Context, meter metric.Meter) {
	devicesConnected, err := meter.Int64UpDownCounter("devices.connected",
		metric.WithDescription("Number of smart home devices currently connected"))
	if err != nil {
		panic(err)
	}

	// Add() приймає як додатні, так і від'ємні значення.
	devicesConnected.Add(ctx, 1, deviceThermostatAddOpts...)
	devicesConnected.Add(ctx, 1, deviceThermostatAddOpts...)
	devicesConnected.Add(ctx, 1, deviceLockAddOpts...)
	devicesConnected.Add(ctx, -1, deviceLockAddOpts...)
}
```

Ключові відмінності:

- `Inc()` / `Dec()` → `Add(ctx, 1, ...)` / `Add(ctx, -1, ...)`. `Add()` приймає як додатні, так і від'ємні значення.
- Тип Prometheus — `Gauge`; тип OpenTelemetry — `Int64UpDownCounter` (або `Float64UpDownCounter` через `meter.Float64UpDownCounter`).

{{% /tab %}} {{< /tabpane >}}

### Gauge зі зворотним викликом — inc та dec {#callback-gauge--inc-and-dec}

Використовуйте gauge зі зворотним викликом (асинхронний лічильник з можливістю збільшення та зменшення в OpenTelemetry), коли додатний лічильник, який зазвичай відстежується за допомогою `inc()`/`dec()`, підтримується зовнішньо, наприклад, менеджером пристроїв або пулом зʼєднань, і ви хочете спостерігати його під час збору метрик.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusUpDownCounterCallback.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.GaugeWithCallback;

public class PrometheusUpDownCounterCallback {
  public static void upDownCounterCallbackUsage() {
    // Менеджер пристроїв підтримує кількість підключених пристроїв.
    // Використовуйте gauge зі зворотним викликом, щоб повідомляти це значення під час збору метрик.
    GaugeWithCallback.builder()
        .name("devices_connected")
        .help("Number of smart home devices currently connected")
        .labelNames("device_type")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.connectedDeviceCount("thermostat"), "thermostat");
              callback.call(SmartHomeDevices.connectedDeviceCount("lock"), "lock");
            })
        .register();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelUpDownCounterCallback.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelUpDownCounterCallback {
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void upDownCounterCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // Менеджер пристроїв підтримує кількість підключених пристроїв.
    // Використовуйте асинхронний лічильник з можливістю збільшення та зменшення, щоб повідомляти це значення під час збору метрик.
    meter
        .upDownCounterBuilder("devices.connected")
        .setDescription("Number of smart home devices currently connected")
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.connectedDeviceCount("thermostat"), THERMOSTAT);
              measurement.record(SmartHomeDevices.connectedDeviceCount("lock"), LOCK);
            });
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_up_down_counter_callback.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

type deviceCountCollector struct{ desc *prometheus.Desc }

func newDeviceCountCollector() *deviceCountCollector {
	return &deviceCountCollector{desc: prometheus.NewDesc(
		"devices_connected",
		"Number of smart home devices currently connected",
		[]string{"device_type"}, nil,
	)}
}

func (c *deviceCountCollector) Describe(ch chan<- *prometheus.Desc) { ch <- c.desc }
func (c *deviceCountCollector) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, float64(connectedDeviceCount("thermostat")), "thermostat")
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, float64(connectedDeviceCount("lock")), "lock")
}

func prometheusUpDownCounterCallbackUsage(reg *prometheus.Registry) {
	// Менеджер пристроїв підтримує кількість підключених пристроїв.
	// Реалізуйте prometheus.Collector, щоб повідомляти ці значення під час збору метрик.
	reg.MustRegister(newDeviceCountCollector())
}
```

OpenTelemetry

<?code-excerpt "otel_up_down_counter_callback.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	deviceThermostat = attribute.String("device_type", "thermostat")
	deviceLock       = attribute.String("device_type", "lock")
)

func otelUpDownCounterCallbackUsage(meter metric.Meter) {
	// Менеджер пристроїв підтримує кількість підключених пристроїв.
	// Використовуйте асинхронний лічильник з можливістю збільшення та зменшення, щоб повідомляти це значення під час збору метрик.
	_, err := meter.Int64ObservableUpDownCounter("devices.connected",
		metric.WithDescription("Number of smart home devices currently connected"),
		metric.WithInt64Callback(func(_ context.Context, o metric.Int64Observer) error {
			o.Observe(int64(connectedDeviceCount("thermostat")), metric.WithAttributes(deviceThermostat))
			o.Observe(int64(connectedDeviceCount("lock")), metric.WithAttributes(deviceLock))
			return nil
		}))
	if err != nil {
		panic(err)
	}
}
```

Ключові відмінності:

- Приклад Prometheus реалізує `prometheus.Collector` з методами `Describe` та `Collect` для повідомлення значень gauge з мітками.
- `Int64ObservableUpDownCounter` використовує `metric.WithInt64Callback`.

{{% /tab %}} {{< /tabpane >}}

## Гістограма {#histogram}

Гістограма записує розподіл набору вимірювань, відстежуючи кількість спостережень, їх суму та кількість, що потрапляє в налаштовувані межі кошиків.

Як Prometheus так й OpenTelemetry підтримують класичні (explicit-bucket) гістограми та нативні (base2 exponential) гістограми. Prometheus також має тип `Summary`, який не має прямого еквівалента в OTel — див. [Summary](#summary) нижче.

Prometheus `Histogram` відповідає інструменту OpenTelemetry `Histogram`.

### Класична (explicit) гістограма {#classic-explicit-histogram}

Обидві системи підтримують класичні гістограми, де фіксовані межі кошиків розділяють спостереження на дискретні діапазони.

- **Налаштування кошиків**: Prometheus оголошує межі кошиків на самому інструменті під час створення. В OpenTelemetry межі кошиків встановлюються на інструменті як підказка, яку можна перевизначити або замінити видами, налаштованими на рівні SDK. Це розділення дозволяє коду інструментування залишатися незалежним від конфігурації збору. Якщо межі не вказані і вид не налаштований, SDK використовує стандартний набір, призначений для затримки в мілісекундах (`[0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000]`), що, ймовірно, невірно для вимірювань у секундах. Завжди надавайте межі або налаштовуйте вид при міграції наявних гістограм.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusHistogram.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Histogram;

public class PrometheusHistogram {
  public static void histogramUsage() {
    Histogram deviceCommandDuration =
        Histogram.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .classicUpperBounds(0.1, 0.25, 0.5, 1.0, 2.5, 5.0)
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelHistogram.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.Meter;
import java.util.List;

public class OtelHistogram {
  // Попередньо виділяйте ключі атрибутів і, коли значення статичні, цілі об'єкти Attributes.
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void histogramUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // setExplicitBucketBoundariesAdvice() встановлює стандартні межі як підказку для SDK.
    // Види, налаштовані на рівні SDK, мають пріоритет над цією підказкою.
    DoubleHistogram deviceCommandDuration =
        meter
            .histogramBuilder("device.command.duration")
            .setDescription("Time to receive acknowledgment from a smart home device")
            .setUnit("s")
            .setExplicitBucketBoundariesAdvice(List.of(0.1, 0.25, 0.5, 1.0, 2.5, 5.0))
            .build();

    deviceCommandDuration.record(0.35, THERMOSTAT);
    deviceCommandDuration.record(0.85, LOCK);
  }
}
```

Ключові відмінності:

- `observe(value)` → `record(value, attributes)`.
- OpenTelemetry розрізняє `LongHistogram` (цілі числа, через `.ofLongs()`) та `DoubleHistogram` (за замовчуванням). Prometheus використовує один тип `Histogram`.
- Попередньо виділяйте екземпляри `AttributeKey` (завжди) та обʼєкти `Attributes` (коли значення статичні), щоб уникнути виділення памʼяті при кожному виклику на гарячому шляху.
- Види SDK можуть перевизначати межі, встановлені за допомогою `setExplicitBucketBoundariesAdvice()`, а також можуть налаштовувати інші аспекти збору гістограм, такі як фільтрація атрибутів, мінімальне/максимальне записування та перейменування інструментів.

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_histogram.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var deviceCommandDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
	Name:    "device_command_duration_seconds",
	Help:    "Time to receive acknowledgment from a smart home device",
	Buckets: []float64{0.1, 0.25, 0.5, 1.0, 2.5, 5.0},
}, []string{"device_type"})

func prometheusHistogramUsage(reg *prometheus.Registry) {
	reg.MustRegister(deviceCommandDuration)

	deviceCommandDuration.WithLabelValues("thermostat").Observe(0.35)
	deviceCommandDuration.WithLabelValues("lock").Observe(0.85)
}
```

OpenTelemetry

<?code-excerpt "otel_histogram.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Попередньо виділяйте опції атрибутів, коли значення статичні, щоб уникнути виділення пам'яті при кожному виклику.
var (
	deviceThermostatOpts = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "thermostat"))}
	deviceLockOpts       = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "lock"))}
)

func otelHistogramUsage(ctx context.Context, meter metric.Meter) {
	// WithExplicitBucketBoundaries встановлює стандартні межі як підказку для SDK.
	// Види, налаштовані на рівні SDK, мають пріоритет над цією підказкою.
	deviceCommandDuration, err := meter.Float64Histogram("device.command.duration",
		metric.WithDescription("Time to receive acknowledgment from a smart home device"),
		metric.WithUnit("s"),
		metric.WithExplicitBucketBoundaries(0.1, 0.25, 0.5, 1.0, 2.5, 5.0))
	if err != nil {
		panic(err)
	}

	deviceCommandDuration.Record(ctx, 0.35, deviceThermostatOpts...)
	deviceCommandDuration.Record(ctx, 0.85, deviceLockOpts...)
}
```

Ключові відмінності:

- `Observe(value)` → `Record(ctx, value, metric.WithAttributes(...))`.
- У Go функція metric.WithExplicitBucketBoundaries(...) є варіантною (а не зрізом). Prometheus використовує поле Buckets у класі HistogramOpts.
- Види SDK можуть перевизначати межі, встановлені за допомогою `WithExplicitBucketBoundaries()`, а також можуть налаштовувати інші аспекти збору гістограм, такі як фільтрація атрибутів, мінімальне/максимальне записування та перейменування інструментів.

{{% /tab %}} {{< /tabpane >}}

### Нативна (base2 exponential) гістограма {#native-base2-exponential-histogram}

Обидві системи підтримують нативні (base2 exponential) гістограми, які автоматично налаштовують межі кошиків, щоб охопити спостережуваний діапазон без необхідності ручного налаштування.

- **Вибір формату**: Інструменти Prometheus можуть видавати лише класичний формат, лише нативний формат або обидва одночасно, що дозволяє поступову міграцію без змін у інструментуванні. У OpenTelemetry вибір формату налаштовується поза кодом інструментування, на експортері або через вид, тому код інструментування не потребує змін у будь-якому випадку.
- **Код інструментування**: Код інструментування OpenTelemetry ідентичний для класичних та нативних гістограм. Ті самі виклики `record()` генерують будь-який формат залежно від того, як налаштовано SDK.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

В Prometheus, формат гістограми контролюється під час створення інструменту. Приклад нижче використовує `.nativeOnly()`, щоб обмежити формат лише нативним; якщо його опустити, будуть одночасно генеруватись як класичний, так і нативний формати:

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusHistogramNative.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Histogram;

public class PrometheusHistogramNative {
  public static void nativeHistogramUsage() {
    Histogram deviceCommandDuration =
        Histogram.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .nativeOnly()
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

В Prometheus, встановлення `NativeHistogramBucketFactor` дозволяє використовувати нативні гістограми разом із класичною конфігурацією кошиків — обидва формати звітуються одночасно:

<?code-excerpt "prometheus_histogram_native.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var nativeDeviceCommandDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
	Name:                        "device_command_duration_seconds",
	Help:                        "Time to receive acknowledgment from a smart home device",
	NativeHistogramBucketFactor: 1.1,
}, []string{"device_type"})

func nativeHistogramUsage(reg *prometheus.Registry) {
	reg.MustRegister(nativeDeviceCommandDuration)

	nativeDeviceCommandDuration.WithLabelValues("thermostat").Observe(0.35)
	nativeDeviceCommandDuration.WithLabelValues("lock").Observe(0.85)
}
```

Ключові відмінності:

- `NativeHistogramBucketFactor` має бути встановлено на значення більше 1.0, щоб увімкнути нативні гістограми в Go — це не є опціональним. Встановлення його на 0 (нульове значення) повністю вимикає нативні гістограми. Значення контролює максимальне співвідношення між послідовними межами кошиків; менші значення дають більш точне розділення за рахунок більшої кількості кошиків. Щоб наблизити ту ж щільність кошиків, що й зазвичай використовуване значення `1.1`, встановіть `MaxScale: 3` на `AggregationBase2ExponentialHistogram`.

{{% /tab %}} {{< /tabpane >}}

В OpenTelemetry, код інструментування ідентичний до випадку з класичною гістограмою. Формат base2 exponential налаштовується окремо, поза шаром інструментування.

Бажаний підхід — налаштувати його на експортері метрик. Це застосовується до всіх гістограм, експортованих через цей експортер, без зміни коду інструментування:

{{< tabpane text=true >}} {{% tab Java %}}

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/OtelHistogramExponentialExporter.java"?>

```java
package otel;

import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.export.DefaultAggregationSelector;

public class OtelHistogramExponentialExporter {
  static OtlpHttpMetricExporter createExporter() {
    // Налаштуйте експортер для використання експоненціальних гістограм для всіх інструментів гістограм.
    // Це бажаний підхід — він застосовується глобально без зміни коду інструментування.
    return OtlpHttpMetricExporter.builder()
        .setEndpoint("http://localhost:4318")
        .setDefaultAggregationSelector(
            DefaultAggregationSelector.getDefault()
                .with(InstrumentType.HISTOGRAM, Aggregation.base2ExponentialBucketHistogram()))
        .build();
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>
<?code-excerpt "otel_histogram_exponential_exporter.go" region="createExponentialExporter"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

func createExponentialExporter(ctx context.Context) (*otlpmetrichttp.Exporter, error) {
	// Налаштуйте експортер для використання експоненціальних гістограм для всіх інструментів гістограм.
	// Це бажаний підхід — він застосовується глобально без зміни коду інструментування.
	return otlpmetrichttp.New(ctx,
		otlpmetrichttp.WithAggregationSelector(func(ik sdkmetric.InstrumentKind) sdkmetric.Aggregation {
			if ik == sdkmetric.InstrumentKindHistogram {
				return sdkmetric.AggregationBase2ExponentialHistogram{}
			}
			return sdkmetric.DefaultAggregationSelector(ik)
		}),
	)
}
```

{{% /tab %}} {{< /tabpane >}}

Для більш детального керування — наприклад, щоб використовувати експоненціальні гістограми base2 для конкретних інструментів, залишаючи явні кошики для інших — налаштуйте view:

{{< tabpane text=true >}} {{% tab Java %}}

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/OtelHistogramExponentialView.java"?>

```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.View;

public class OtelHistogramExponentialView {
  static SdkMeterProvider createMeterProvider() {
    // Використовуйте view для керування на рівні інструменту — виберіть конкретний інструмент за назвою
    // щоб використовувати експоненціальні гістограми, залишаючи явні кошики для інших.
    return SdkMeterProvider.builder()
        .registerView(
            InstrumentSelector.builder().setName("device.command.duration").build(),
            View.builder().setAggregation(Aggregation.base2ExponentialBucketHistogram()).build())
        .build();
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>
<?code-excerpt "otel_histogram_exponential.go" region="createExponentialView"?>

```go
func createExponentialView() sdkmetric.View {
	// Використовуйте view для керування на рівні інструменту — виберіть конкретний інструмент за назвою
	// щоб використовувати експоненціальні гістограми, залишаючи явні кошики для інших.
	return sdkmetric.NewView(
		sdkmetric.Instrument{Name: "device.command.duration"},
		sdkmetric.Stream{Aggregation: sdkmetric.AggregationBase2ExponentialHistogram{}!},
	)
}
```

{{% /tab %}} {{< /tabpane >}}

### Summary {#summary}

Prometheus `Summary` рахує квантилі на стороні клієнта під час збору даних і експортує їх як часові серії з мітками (наприклад, `{quantile="0.95"}`). OpenTelemetry не має прямого еквівалента.

Для оцінки квантилів рекомендується використовувати **гістограму з експоненціальними кошиками base2**: вона автоматично налаштовує межі кошиків для покриття спостережуваного діапазону, а `histogram_quantile()` у PromQL може обчислювати квантилі з обмеженою похибкою під час запиту. На відміну від `Summary`, результати можна агрегувати між екземплярами. Див. [Native (base2 exponential) histogram](#native-base2-exponential-histogram).

Якщо вам потрібні лише кількість і сума, а не квантилі, гістограма без явних меж кошиків фіксує ці статистики з мінімальними витратами. Нижче наведено приклади цього простішого підходу.

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusSummary.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Summary;

public class PrometheusSummary {
  public static void summaryUsage() {
    Summary deviceCommandDuration =
        Summary.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .quantile(0.5, 0.05)
            .quantile(0.95, 0.01)
            .quantile(0.99, 0.001)
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelHistogramAsSummary.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.Meter;
import java.util.List;

public class OtelHistogramAsSummary {
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void summaryReplacement(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // Немає явних меж кошиків: фіксує лише кількість і суму, хороший замінник для більшості
    // випадків використання Summary. Для оцінки квантилів додайте межі, що охоплюють ваші пороги.
    DoubleHistogram deviceCommandDuration =
        meter
            .histogramBuilder("device.command.duration")
            .setDescription("Time to receive acknowledgment from a smart home device")
            .setUnit("s")
            .setExplicitBucketBoundariesAdvice(List.of())
            .build();

    deviceCommandDuration.record(0.35, THERMOSTAT);
    deviceCommandDuration.record(0.85, LOCK);
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_summary.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var summaryDeviceCommandDuration = prometheus.NewSummaryVec(prometheus.SummaryOpts{
	Name:       "device_command_duration_seconds",
	Help:       "Time to receive acknowledgment from a smart home device",
	Objectives: map[float64]float64{0.5: 0.05, 0.95: 0.01, 0.99: 0.001},
}, []string{"device_type"})

func summaryUsage(reg *prometheus.Registry) {
	reg.MustRegister(summaryDeviceCommandDuration)

	summaryDeviceCommandDuration.WithLabelValues("thermostat").Observe(0.35)
	summaryDeviceCommandDuration.WithLabelValues("lock").Observe(0.85)
}
```

OpenTelemetry

<?code-excerpt "otel_histogram_as_summary.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// Попередньо виділіть параметри атрибутів, коли значення статичні, щоб уникнути виділення пам'яті при кожному виклику.
var (
	summaryThermostatOpts = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "thermostat"))}
	summaryLockOpts       = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "lock"))}
)

func summaryReplacement(ctx context.Context, meter metric.Meter) {
	// Немає явних меж кошиків: фіксує лише кількість і суму, хороший замінник для більшості
	// випадків використання Summary. Для оцінки квантилів додайте межі, що охоплюють ваші пороги.
	deviceCommandDuration, err := meter.Float64Histogram("device.command.duration",
		metric.WithDescription("Time to receive acknowledgment from a smart home device"),
		metric.WithUnit("s"),
		metric.WithExplicitBucketBoundaries()) // немає меж кошиків
	if err != nil {
		panic(err)
	}

	deviceCommandDuration.Record(ctx, 0.35, summaryThermostatOpts...)
	deviceCommandDuration.Record(ctx, 0.85, summaryLockOpts...)
}
```

{{% /tab %}} {{< /tabpane >}}
