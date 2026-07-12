---
title: Розширення
aliases: [/docs/instrumentation/java/extensions]
description:
  Розширення додають можливості агенту без необхідності створювати окремий
  дистрибутив.
weight: 300
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: Customizer Dotel myextension
---

## Вступ {#introduction}

Розширення додають нові функції та можливості агенту OpenTelemetry Java без необхідності створювати окремий дистрибутив (власну версію всього агента). Думайте про розширення як про втулки, які налаштовують поведінку агента.

Розширення дозволяють:

- Додавати нові інструментальні засоби для бібліотек, які наразі не підтримуються
- Налаштовувати поведінку наявних інструментувань
- Реалізовувати власні компоненти SDK (вибірники, експортери, поширювачі)
- Налаштовувати конфігурацію програмно, для випадків, які не охоплені змінними середовища або декларативною конфігурацією
- Модифікувати збір та обробку телеметричних даних

## Швидкий старт {#quick-start}

Ось мінімальне розширення, яке додає користувацький обробник відрізків, щоб почати роботу:

Створіть проєкт Gradle (build.gradle.kts):

<!-- prettier-ignore-start -->
<?code-excerpt "build.gradle.kts"?>

```kotlin
plugins {
    id("java")
    id("com.gradleup.shadow")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(8))
    }
}

dependencies {
    // Використовуйте BOM для керування версіями залежностей OpenTelemetry
    compileOnly(platform("io.opentelemetry:opentelemetry-bom:1.61.0"))

    // OpenTelemetry SDK autoconfiguration SPI (надається агентом)
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")

    // OpenTelemetry SDK (потрібно для SpanProcessor та класів трасування)
    compileOnly("io.opentelemetry:opentelemetry-sdk")

    // Процесор анотацій для автоматичної реєстрації SPI
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")

    // Додайте будь-які зовнішні залежності з областю 'implementation'
    // implementation("org.apache.commons:commons-lang3:3.19.0")
}

tasks.assemble {
    dependsOn(tasks.shadowJar)
}
```
<!-- prettier-ignore-end -->

Створіть реалізацію `SpanProcessor`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MySpanProcessor.java" from="public"?>

```java
public class MySpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // Додайте власні атрибути, коли span починається
    span.setAttribute("custom.processor", "active");
  }

  @Override
  public boolean isStartRequired() {
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Обробіть span, коли він закінчується (необов'язково)
  }

  @Override
  public boolean isEndRequired() {
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

Створіть клас розширення, який використовує SPI `AutoConfigurationCustomizerProvider`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MyExtensionProvider.java" from="@AutoService"?>

```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtensionProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer config) {
    config.addTracerProviderCustomizer(this::configureTracer);
  }

  private SdkTracerProviderBuilder configureTracer(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {
    return tracerProvider
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new MySpanProcessor());
  }
}
```
<!-- prettier-ignore-end -->

Збірка розширення:

```bash
./gradlew shadowJar
```

Використання розширення:

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=build/libs/my-extension-all.jar \
     -jar myapp.jar
```

## Використання розширень {#using-extensions}

Існує два способи використання розширень з Java агентом:

- **Завантаження як окремий JAR файл** - Гнучко для розробки та тестування
- **Вбудування в агент** - Один JAR для розгортання для робочого середовища

| Підхід              | Переваги                                                    | Недоліки                                      | Найкраще для                      |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| **Runtime loading** | Легко змінювати розширення, не потрібно перебудовувати      | Потрібен додатковий параметр командного рядка | Розробка, тестування              |
| **Embedding**       | Один JAR, простіше розгортання, не можна забути завантажити | Потрібна перебудова для зміни розширень       | Робоче середовище, розповсюдження |

### Завантаження розширень під час виконання {#loading-extensions-at-runtime}

Розширення можна завантажувати під час виконання, використовуючи системну властивість `otel.javaagent.extensions` або змінну середовища `OTEL_JAVAAGENT_EXTENSIONS`. Ця опція конфігурації приймає шляхи до JAR-файлів розширень або теки, що містять JAR-файли розширень, розділені комами.

#### Одне розширення {#single-extension}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/my-extension.jar \
     -jar myapp.jar
```

#### Кілька розширень {#multiple-extensions}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/path/to/extension2.jar \
     -jar myapp.jar
```

#### Тека розширень {#extension-directory}

Ви можете вказати теку, що містить кілька JAR-файлів розширень, і всі JAR-файли в цій теці будуть завантажені:

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extensions-directory \
     -jar myapp.jar
```

#### Змішані шляхи {#mixed-paths}

Ви можете комбінувати окремі JAR-файли та теки:

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/opt/extensions,/tmp/custom.jar \
     -jar myapp.jar
```

#### Як працює завантаження розширень {#how-extension-loading-works}

Коли ви завантажуєте розширення під час виконання, агент:

1. Робить OpenTelemetry API доступними для вашого розширення без необхідності пакувати їх у ваш JAR-файл розширення
2. Виявляє компоненти вашого розширення за допомогою механізму [ServiceLoader](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ServiceLoader.html) Java (наприклад, через анотації `@AutoService` у вашому коді)

### Вбудовування розширень в агент {#embedding-extensions-in-the-agent}

Інший варіант розгортання — створити один JAR-файл, який містить як OpenTelemetry Java агент, так і ваші розширення. Цей підхід спрощує розгортання (тільки один JAR-файл для керування) і усуває необхідність у параметрі командного рядка `-Dotel.javaagent.extensions`, що зменшує ймовірність випадково забути завантажити ваше розширення.

#### Як це працює {#how-it-works}

Агент автоматично шукає розширення в спеціальній теці `extensions/` всередині JAR-файлу агента, тому ми можемо використовувати завдання Gradle для:

1. Завантаження JAR-файлу OpenTelemetry Java агента
2. Розпакування його вмісту
3. Додавання вашого JAR-файлу(ів) розширень у теку `extensions/`
4. Перепакування всього в один JAR-файл

#### Завдання Gradle `extendedAgent` {#the-extendedagent-gradle-task}

Додайте наступне до файлу `build.gradle.kts` вашого проекту розширення:

```kotlin
plugins {
    id("java")

    // Shadow plugin: обʼєднує весь код розширення та його залежності в один JAR-файл
    // Це необхідно, оскільки розширення мають бути упаковані у вигляді одного JAR-файлу
    id("com.gradleup.shadow") version "9.2.2"
}

group = "com.example"
version = "1.0"

configurations {
    // Створюємо тимчасову конфігурацію для завантаження JAR-файлу агента
    // Подумайте про це як про "слот для завантаження", який відокремлений від залежностей вашого розширення
    create("otel")
}

dependencies {
    // Завантажуємо офіційний JAR-файл OpenTelemetry Java агента в конфігурацію 'otel'
    "otel"("io.opentelemetry.javaagent:opentelemetry-javaagent:{{% param vers.instrumentation %}}")

    /*
      Інтерфейси та SPI, які ми реалізуємо. Ми використовуємо залежність `compileOnly`, оскільки під час
      виконання всі необхідні класи надаються самим javaagent.
     */
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}")

    // Необхідно для власної інструментації
    compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
    compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:{{% param vers.instrumentation %}}-alpha")
    compileOnly("net.bytebuddy:byte-buddy:1.15.10")

    // Надає анотацію @AutoService, яка значно спрощує реєстрацію наших реалізацій SPI
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")
}

// Завдання: Створити розширений JAR-файл агента (агент + ваше розширення)
val extendedAgent by tasks.registering(Jar::class) {
    dependsOn(configurations["otel"])
    archiveFileName.set("opentelemetry-javaagent.jar")

    // Крок 1: Розпакувати JAR-файл офіційного агента
    from(zipTree(configurations["otel"].singleFile))

    // Крок 2: Додати JAR-файл вашого розширення до теки "extensions/"
    from(tasks.shadowJar.get().archiveFile) {
        into("extensions")
    }

    // Крок 3: Зберегти конфігурацію запуску агента (MANIFEST.MF)
    doFirst {
        manifest.from(
            zipTree(configurations["otel"].singleFile).matching {
                include("META-INF/MANIFEST.MF")
            }.singleFile
        )
    }
}

tasks {
    // Переконайтеся, що shadow JAR будується під час звичайного процесу збірки
    assemble {
        dependsOn(shadowJar)
    }
}
```

Для повного прикладу, зверніться до файлу gradle з [прикладу розширення](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/build.gradle.kts).

#### Створення та використання розширеного агента {#building-and-using-the-extended-agent}

Після того як ви додали завдання `extendedAgent` до вашого `build.gradle.kts`:

```bash
# 1. Збірка вашого розширення та створення розширеного агента
./gradlew extendedAgent

# 2. Знайдіть вихідний файл у build/libs/
ls build/libs/opentelemetry-javaagent.jar

# 3. Використовуйте його з вашим додатком (немає потреби у -Dotel.javaagent.extensions)
java -javaagent:build/libs/opentelemetry-javaagent.jar -jar myapp.jar
```

#### Вбудовування кількох розширень {#embedding-multiple-extensions}

Щоб вбудувати кілька розширень, змініть завдання `extendedAgent`, щоб включити кілька JAR-файлів розширень:

```kotlin
val extendedAgent by tasks.registering(Jar::class) {
  dependsOn(configurations["otel"])
  archiveFileName.set("opentelemetry-javaagent.jar")

  from(zipTree(configurations["otel"].singleFile))

  // Додати кілька розширень
  from(tasks.shadowJar.get().archiveFile) {
    into("extensions")
  }
  from(file("../other-extension/build/libs/other-extension-all.jar")) {
    into("extensions")
  }

  doFirst {
    manifest.from(
      zipTree(configurations["otel"].singleFile).matching {
        include("META-INF/MANIFEST.MF")
      }.singleFile
    )
  }
}
```

## Створення розширень {#writing-extensions}

Створення розширення передбачає реалізацію одного або кількох класів інтерфейсу постачальника послуг (Service Provider Interface, SPI), пакування їх у JAR-файл та вказівку агенту на цей JAR-файл під час запуску вашого застосунку (див. [Використання розширень](#using-extensions)).

> [!TIP]
>
> Повний працездатний приклад, що охоплює всі описані нижче SPI, дивіться у [проєкті-прикладі розширення](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension) у репозиторії Java інструментування.

### Налаштування проєкту та залежності {#project-setup-and-dependencies}

Розширення повинні ретельно керувати своїми залежностями, щоб уникнути конфліктів з агентом та застосунком. Щоб дізнатися, як агент ізолює розширення між завантажувачами класів, див.
[Структуру Java агента](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/contributing/javaagent-structure.md).

#### Залежності, що надаються агентом (використовуйте `compileOnly`) {#dependencies-provided-by-agent-use-compileonly}

Ці API доступні під час виконання з агента:

```kotlin
compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator")
compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api")
```

#### Залежності з classpath застосунку (використовуйте `compileOnly`) {#dependencies-from-application-classpath-use-compileonly}

Під час створення інструментування вам потрібно посилатися на класи з цільового застосунку. Вони також мають бути `compileOnly`:

```kotlin
// Доступні лише в класах Advice під час інструментування
compileOnly("javax.servlet:javax.servlet-api:3.0.1")
```

#### Зовнішні залежності часу виконання (використовуйте `implementation`) {#external-runtime-dependencies-use-implementation}

Будь-які зовнішні бібліотеки, необхідні вашому розширенню під час виконання, повинні використовувати область видимості `implementation` і будуть запаковані в shadow JAR:

```kotlin
implementation("org.apache.commons:commons-lang3:3.19.0")
implementation("com.google.guava:guava:33.0.0-jre")
```

> [!IMPORTANT]
>
> Розширення не можуть завантажувати залежності з окремих JAR-файлів. Усі залежності повинні бути обʼєднані в єдиний shadow JAR.

### Огляд точок розширення {#extension-points-overview}

OpenTelemetry Java агента надає кілька точок розширення через інтерфейси SPI. Нижче наведено найбільш вживані з них:

> [!NOTE]
>
> Наведені нижче SPI, повʼязані з конфігурацією (такі як `AutoConfigurationCustomizerProvider`), застосовуються, коли SDK налаштовується за допомогою змінних середовища або системних властивостей. Вони поводяться інакше або не застосовуються, коли використовується [декларативна конфігурація](../declarative-configuration). Деталі див. в описі кожної точки розширення нижче.

| Точка розширення                      | Пакунок                                                       | Призначення                              |
| ------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| `AutoConfigurationCustomizerProvider` | `io.opentelemetry.sdk.autoconfigure.spi`                      | Головна точка входу для налаштування SDK |
| `ConfigurablePropagatorProvider`      | `io.opentelemetry.sdk.autoconfigure.spi`                      | Реєстрація власних поширювачів           |
| `ConfigurableSamplerProvider`         | `io.opentelemetry.sdk.autoconfigure.spi.traces`               | Реєстрація власних вибірників            |
| `ResourceProvider`                    | `io.opentelemetry.sdk.autoconfigure.spi`                      | Додавання власних атрибутів ресурсу      |
| `InstrumenterCustomizerProvider`      | `io.opentelemetry.instrumentation.api.incubator.instrumenter` | Налаштування наявних інструментувань     |
| `InstrumentationModule`               | `io.opentelemetry.javaagent.extension.instrumentation`        | Створення нових інструментувань          |

Повну довідку щодо SPI автоконфігурації, включаючи вбудовані та спільнотні реалізації, див. [SPI (інтерфейс постачальника послуг)](/docs/languages/java/configuration/#spi-service-provider-interface).

### Конфігурація в розширеннях {#configuration-in-extensions}

Розширення можуть зчитувати та надавати конфігурацію для налаштування своєї поведінки.

#### Доступ до конфігурації в розширеннях {#accessing-configuration-in-extensions}

Багато методів SPI отримують параметр `ConfigProperties`, який дозволяє зчитувати конфігурацію:

```java
@Override
public Sampler createSampler(ConfigProperties config) {
  // Читання конфігурації з використанням стандартних значень
  String endpoint = config.getString("otel.exporter.otlp.endpoint", "http://localhost:4317");
  int threshold = config.getInt("otel.instrumentation.myext.threshold", 100);
  boolean enabled = config.getBoolean("otel.instrumentation.myext.enabled", true);
  return new MySampler(endpoint, threshold, enabled);
}
```

#### Надання стандартної конфігурації {#providing-default-configuration}

Розширення можуть надавати значення стандартної конфігурації, які будуть використані, якщо вони не перевизначені:

```java
@Override
public void customize(AutoConfigurationCustomizer config) {
  config.addPropertiesSupplier(() -> {
    Map<String, String> props = new HashMap<>();
    props.put("otel.exporter.otlp.endpoint", "http://my-backend:8080");
    props.put("otel.service.name", "my-service");
    props.put("otel.instrumentation.myext.enabled", "true");
    return props;
  });
}
```

#### Узгодження імен конфігураційних параметрів {#configuration-naming-conventions}

Дотримуйтесь цих правил для назв параметрів конфігурації:

Стандартні властивості OpenTelemetry використовують префікс `otel.*`.

- `otel.service.name`
- `otel.traces.sampler`
- `otel.exporter.otlp.endpoint`

Властивості, специфічні для інструментування, використовують `otel.instrumentation.<name>.*`.

- `otel.instrumentation.cassandra.enabled`
- `otel.instrumentation.jdbc.statement-sanitizer.enabled`

Властивості розширень дотримуються того ж шаблону.

- `otel.instrumentation.myextension.enabled`
- `otel.instrumentation.myextension.threshold`
- `otel.instrumentation.myextension.custom-value`

### Використання @AutoService {#using-autoservice}

Анотація `@AutoService` автоматично генерує необхідні файли `META-INF/services/` для реєстрації SPI. Для її використання:

Додайте залежність:

```kotlin
compileOnly("com.google.auto.service:auto-service:1.1.1")
annotationProcessor("com.google.auto.service:auto-service:1.1.1")
```

А потім анотуйте ваші реалізації SPI наступним чином:

```java
import com.google.auto.service.AutoService;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {
  // Implementation
}
```

Це еквівалентно ручному створенню `META-INF/services/io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider` з назвою вашого класу.

## Довідник точок розширення {#extension-point-reference}

### AutoConfigurationCustomizerProvider {#autoconfigurationcustomizerprovider}

> [!NOTE]
>
> Це не працюватиме для випадків, коли використовується [декларативна конфігурація](../declarative-configuration).

Це головна точка входу для налаштування конфігурації SDK. Вона дозволяє:

- Налаштовувати постачальник трейсерів
- Додавати обробники відрізків та експортери
- Надавати стандартні значення властивостей конфігурації
- Налаштовувати інші компоненти SDK

**Приклад:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoAutoConfigurationCustomizerProvider.java" from="@AutoService"?>

```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class DemoAutoConfigurationCustomizerProvider
    implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer autoConfiguration) {
    autoConfiguration
        .addTracerProviderCustomizer(this::configureSdkTracerProvider)
        .addPropertiesSupplier(this::getDefaultProperties);
  }

  private SdkTracerProviderBuilder configureSdkTracerProvider(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {

    return tracerProvider
        .setIdGenerator(new DemoIdGenerator())
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new DemoSpanProcessor())
        .addSpanProcessor(SimpleSpanProcessor.create(new DemoSpanExporter()));
  }

  private Map<String, String> getDefaultProperties() {
    Map<String, String> properties = new HashMap<>();
    properties.put("otel.exporter.otlp.endpoint", "http://backend:8080");
    properties.put("otel.exporter.otlp.insecure", "true");
    properties.put("otel.config.max.attrs", "16");
    properties.put("otel.traces.sampler", "demo");
    return properties;
  }
}
```
<!-- prettier-ignore-end -->

### InstrumenterCustomizerProvider {#instrumentercustomizerprovider}

Налаштовуйте наявні інструментування без зміни їхнього коду. Це рекомендований спосіб додавати атрибути, метрики або змінювати поведінку вбудованих інструментувань.

**Приклад:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoInstrumenterCustomizerProvider.java" from="/**"?>

```java
/**
 * Цей приклад демонструє, як використовувати SPI InstrumenterCustomizerProvider для налаштування
 * поведінки інструментування без зміни основного коду інструментування.
 *
 * <p>Цей кастомізатор додає:
 *
 * <ul>
 *   <li>Користувацькі атрибути до HTTP серверних відрізків (на основі назви інструментування)
 *   <li>Користувацькі атрибути до HTTP клієнтських відрізків (на основі типу інструментування)
 *   <li>Користувацькі метрики для HTTP операцій
 *   <li>Ідентифікатори кореляції запитів через налаштування контексту
 *   <li>Користувацьке перетворення імен відрізків
 * </ul>
 *
 * <p>Кастомізатор буде автоматично застосований до інструментувань, які відповідають зазначеній
 * назві або типу інструментування.
 *
 * @see InstrumenterCustomizerProvider
 * @see InstrumenterCustomizer
 */
@AutoService(InstrumenterCustomizerProvider.class)
public class DemoInstrumenterCustomizerProvider implements InstrumenterCustomizerProvider {

  @Override
  public void customize(InstrumenterCustomizer customizer) {
    String instrumentationName = customizer.getInstrumentationName();
    if (isHttpServerInstrumentation(instrumentationName)) {
      customizeHttpServer(customizer);
    }

    if (customizer.hasType(InstrumenterCustomizer.InstrumentationType.HTTP_CLIENT)) {
      customizeHttpClient(customizer);
    }
  }

  private boolean isHttpServerInstrumentation(String instrumentationName) {
    return instrumentationName.contains("servlet")
        || instrumentationName.contains("jetty")
        || instrumentationName.contains("tomcat")
        || instrumentationName.contains("undertow")
        || instrumentationName.contains("spring-webmvc");
  }

  private void customizeHttpServer(InstrumenterCustomizer customizer) {
    customizer.addAttributesExtractor(new DemoAttributesExtractor());
    customizer.addOperationMetrics(new DemoMetrics());
    customizer.addContextCustomizer(new DemoContextCustomizer());
    customizer.setSpanNameExtractorCustomizer(
        unused -> (SpanNameExtractor<Object>) object -> "CustomHTTP/" + object.toString());
  }

  private void customizeHttpClient(InstrumenterCustomizer customizer) {
    // Просте налаштування для інструментувань HTTP клієнтів
    customizer.addAttributesExtractor(new DemoHttpClientAttributesExtractor());
  }

  /** Екстрактор користувацьких атрибутів для інструментувань HTTP клієнтів. */
  private static class DemoHttpClientAttributesExtractor
      implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CLIENT_ATTR =
        AttributeKey.stringKey("demo.client.type");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CLIENT_ATTR, "demo-http-client");
    }

    @Override
    public void onEnd(
        AttributesBuilder attributes,
        Context context,
        Object request,
        Object response,
        Throwable error) {}
  }

  /** Екстрактор користувацьких атрибутів, який додає специфічні для демо атрибути. */
  private static class DemoAttributesExtractor implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CUSTOM_ATTR = AttributeKey.stringKey("demo.custom");
    private static final AttributeKey<String> ERROR_ATTR = AttributeKey.stringKey("demo.error");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CUSTOM_ATTR, "demo-extension");
    }

    @Override
    public void onEnd(
        AttributesBuilder attributes,
        Context context,
        Object request,
        Object response,
        Throwable error) {
      if (error != null) {
        attributes.put(ERROR_ATTR, error.getClass().getSimpleName());
      }
    }
  }

  /** Користувацькі метрики, які відстежують кількість запитів. */
  private static class DemoMetrics implements OperationMetrics {
    @Override
    public OperationListener create(Meter meter) {
      LongCounter requestCounter =
          meter
              .counterBuilder("demo.requests")
              .setDescription("Number of requests")
              .setUnit("requests")
              .build();

      return new OperationListener() {
        @Override
        public Context onStart(Context context, Attributes attributes, long startNanos) {
          requestCounter.add(1, attributes);
          return context;
        }

        @Override
        public void onEnd(Context context, Attributes attributes, long endNanos) {
          // Можна додати метрики тривалості тут, якщо потрібно
        }
      };
    }
  }

  /** Кастомізатор контексту, який додає ідентифікатори кореляції запитів та користувацькі дані контексту. */
  private static class DemoContextCustomizer implements ContextCustomizer<Object> {
    private static final AtomicLong requestIdCounter = new AtomicLong(1);
    private static final ContextKey<String> REQUEST_ID_KEY = ContextKey.named("demo.request.id");

    @Override
    public Context onStart(Context context, Object request, Attributes startAttributes) {
      // Генеруємо унікальний ідентифікатор запиту для кореляції
      String requestId = "req-" + requestIdCounter.getAndIncrement();

      // Додаємо користувацькі дані контексту, які можна використовувати протягом всього життєвого циклу запиту
      context = context.with(REQUEST_ID_KEY, requestId);
      return context;
    }
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurablePropagatorProvider {#configurablepropagatorprovider}

Реєструйте власні поширювачі, на які можна посилатися за назвою в конфігурації `otel.propagators`.

**Приклад:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoPropagatorProvider.java" from="@AutoService"?>

```java
@AutoService(ConfigurablePropagatorProvider.class)
public class DemoPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    return new DemoPropagator();
  }

  @Override
  public String getName() {
    return "demo";
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurableSamplerProvider {#configurablesamplerprovider}

Реєструйте власні вибірники, на які можна посилатися в конфігурації `otel.traces.sampler`.

**Приклад (`otel.traces.sampler=demo`):**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoConfigurableSamplerProvider.java" from="@AutoService"?>

```java
@AutoService(ConfigurableSamplerProvider.class)
public class DemoConfigurableSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    return new DemoSampler();
  }

  @Override
  public String getName() {
    return "demo";
  }
}
```
<!-- prettier-ignore-end -->

### ResourceProvider {#resourceprovider}

Додавайте власні атрибути ресурсу, які будуть автоматично обʼєднані з іншими постачальниками ресурсів.

**Приклад:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoResourceProvider.java" from="@AutoService"?>

```java
@AutoService(ResourceProvider.class)
public class DemoResourceProvider implements ResourceProvider {
  @Override
  public Resource createResource(ConfigProperties config) {
    Attributes attributes = Attributes.builder().put("custom.resource", "demo").build();
    return Resource.create(attributes);
  }
}
```
<!-- prettier-ignore-end -->

## Приклади розширень {#extension-examples}

Для отримання додаткових прикладів розширень дивіться [проект розширень](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension) у репозиторії Java інструментування.
