---
title: Початок роботи на прикладі
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
weight: 10
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/getting-started"?>

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у Java.

Ви дізнаєтесь, як можна автоматично інструментувати простий Java-застосунок, так, щоб [трейси][], [метрики][], і [логи][] виводилися в консоль.

## Попередні вимоги {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- Java JDK 17+, через використання Spring Boot 3; [Java 8+ в іншому випадку][java-vers]
- [Gradle](https://gradle.org/)

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Spring Boot]. Ви можете використовувати
інший веб-фреймворк, такий як Apache Wicket або Play. Для повного списку бібліотек та підтримуваних фреймворків, зверніться до [реєстру](/ecosystem/registry/?component=instrumentation&language=java).

Для складніших прикладів дивіться [приклади](../examples/).

### Залежності {#dependencies}

Для початку, налаштуйте середовище в новій теці з назвою `java-simple`. У цій теці створіть файл з назвою `build.gradle.kts` з наступним вмістом:

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.0.6"
  id("io.spring.dependency-management") version "1.1.0"
}

sourceSets {
  main {
    java.setSrcDirs(setOf("."))
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
}
```

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

У цій же теці створіть файл з назвою `DiceApplication.java` і додайте наступний код у файл:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/DiceApplication.java"?>
```java
package otel;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }
}
```
<!-- prettier-ignore-end -->

Створіть ще один файл з назвою `RollController.java` і додайте наступний код у файл:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/RollController.java"?>
```java
package otel;

import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RollController {
  private static final Logger logger = LoggerFactory.getLogger(RollController.class);

  @GetMapping("/rolldice")
  public String index(@RequestParam("player") Optional<String> player) {
    int result = this.getRandomNumber(1, 6);
    if (player.isPresent()) {
      logger.info("{} кидає кубик: {}", player.get(), result);
    } else {
      logger.info("Анонімний гравець кидає кубик: {}", result);
    }
    return Integer.toString(result);
  }

  public int getRandomNumber(int min, int max) {
    return ThreadLocalRandom.current().nextInt(min, max + 1);
  }
}
```
<!-- prettier-ignore-end -->

Зберіть і запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```sh
gradle assemble
java -jar ./build/libs/java-simple.jar
```

## Інструментування {#instrumentation}

Далі ви будете використовувати [Java агент](/docs/zero-code/java/agent/) для автоматичного інструментування застосунку під час запуску. Хоча ви можете [налаштувати Java агент][] різними способами, нижче наведені кроки використовують змінні середовища.

1. Завантажте [opentelemetry-javaagent.jar][] з [Releases][] репозиторію `opentelemetry-java-instrumentation`. JAR файл містить агент і всі пакунки автоматичного інструментування:

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

   > [!IMPORTANT] <i class="fas fa-edit"></i> Зверніть увагу на шлях до JAR файлу.

2. Встановіть і експортуйте змінні, які вказують на JAR файл Java агента та [консольний експортер][], використовуючи нотацію, що підходить для вашого середовища shell/терміналу &mdash; ми ілюструємо нотацію для bash-подібних shell:

   ```sh
   export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
     OTEL_TRACES_EXPORTER=logging \
     OTEL_METRICS_EXPORTER=logging \
     OTEL_LOGS_EXPORTER=logging \
     OTEL_METRIC_EXPORT_INTERVAL=15000
   ```

   <!-- markdownlint-disable no-blanks-blockquote -->

   > [!NOTE]
   >
   > Замініть `PATH/TO` вище на ваш шлях до JAR файлу.

   > [!WARNING]
   >
   > Встановіть `OTEL_METRIC_EXPORT_INTERVAL` у значення значно нижче за стандартне, як ми ілюструємо вище, **тільки під час тестування**, щоб допомогти вам швидше переконатися, що метрики правильно генеруються.

3. Запустіть ваш **застосунок** ще раз:

   ```console
   $ java -jar ./build/libs/java-simple.jar
   ...
   ```

   Зверніть увагу на вивід від `otel.javaagent`.

4. З _іншого_ терміналу, надішліть запит за допомогою `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

5. Зупиніть процес сервера.

На кроці 4 ви повинні були побачити вивід трейсу та логів від сервера та клієнта, який виглядає приблизно так (вивід трейсу розбитий на рядки для зручності):

```sh
[otel.javaagent 2023-04-24 17:33:54:567 +0200] [http-nio-8080-exec-1] INFO
io.opentelemetry.exporter.logging.LoggingSpanExporter - 'RollController.index' :
 70c2f04ec863a956e9af975ba0d983ee 7fd145f5cda13625 INTERNAL [tracer:
 io.opentelemetry.spring-webmvc-6.0:1.25.0-alpha] AttributesMap{data=
 {thread.id=39, thread.name=http-nio-8080-exec-1}, capacity=128,
 totalAddedValues=2}
[otel.javaagent 2023-04-24 17:33:54:568 +0200] [http-nio-8080-exec-1] INFO
io.opentelemetry.exporter.logging.LoggingSpanExporter - 'GET /rolldice' :
70c2f04ec863a956e9af975ba0d983ee 647ad186ad53eccf SERVER [tracer:
io.opentelemetry.tomcat-10.0:1.25.0-alpha] AttributesMap{
  data={user_agent.original=curl/7.87.0, net.host.name=localhost,
  net.transport=ip_tcp, http.target=/rolldice, net.sock.peer.addr=127.0.0.1,
  thread.name=http-nio-8080-exec-1, net.sock.peer.port=53422,
  http.route=/rolldice, net.sock.host.addr=127.0.0.1, thread.id=39,
  net.protocol.name=http, http.status_code=200, http.scheme=http,
  net.protocol.version=1.1, http.response_content_length=1,
  net.host.port=8080, http.method=GET}, capacity=128, totalAddedValues=17}
```

На кроці 5, при зупинці сервера, ви повинні побачити вивід всіх зібраних метрик (вивід метрик розбитий на рядки та скорочений для зручності):

```sh
[otel.javaagent 2023-04-24 17:34:25:347 +0200] [PeriodicMetricReader-1] INFO
io.opentelemetry.exporter.logging.LoggingMetricExporter - Received a collection
 of 19 metrics for export.
[otel.javaagent 2023-04-24 17:34:25:347 +0200] [PeriodicMetricReader-1] INFO
io.opentelemetry.exporter.logging.LoggingMetricExporter - metric:
ImmutableMetricData{resource=Resource{schemaUrl=
https://opentelemetry.io/schemas/1.19.0, attributes={host.arch="aarch64",
host.name="OPENTELEMETRY", os.description="Mac OS X 13.3.1", os.type="darwin",
process.command_args=[/bin/java, -jar, java-simple.jar],
process.executable.path="/bin/java", process.pid=64497,
process.runtime.description="Homebrew OpenJDK 64-Bit Server VM 20",
process.runtime.name="OpenJDK Runtime Environment",
process.runtime.version="20", service.name="java-simple",
telemetry.auto.version="1.25.0", telemetry.sdk.language="java",
telemetry.sdk.name="opentelemetry", telemetry.sdk.version="1.25.0"}},
instrumentationScopeInfo=InstrumentationScopeInfo{name=io.opentelemetry.runtime-metrics,
version=1.25.0, schemaUrl=null, attributes={}},
name=process.runtime.jvm.buffer.limit, description=Total capacity of the buffers
in this pool, unit=By, type=LONG_SUM, data=ImmutableSumData{points=
[ImmutableLongPointData{startEpochNanos=1682350405319221000,
epochNanos=1682350465326752000, attributes=
{pool="mapped - 'non-volatile memory'"}, value=0, exemplars=[]},
ImmutableLongPointData{startEpochNanos=1682350405319221000,
epochNanos=1682350465326752000, attributes={pool="mapped"},
value=0, exemplars=[]},
ImmutableLongPointData{startEpochNanos=1682350405319221000,
epochNanos=1682350465326752000, attributes={pool="direct"},
value=8192, exemplars=[]}], monotonic=false, aggregationTemporality=CUMULATIVE}}
...
```

## Що далі? {#whats-next}

Щоб отримати більше:

- Запустіть цей приклад з іншим [експортером][експортер] для телеметричних даних.
- Спробуйте [інструментування без коду](/docs/zero-code/java/agent/) на одному з ваших власних застосунків.
- Для легкого налаштування телеметрії спробуйте [анотації][].
- Дізнайтеся про [ручне інструментування][] і спробуйте більше [прикладів](../examples/).
- Подивіться на [OpenTelemetry Demo](/docs/demo/), який включає оснований на Java [Ad Service](/docs/demo/services/ad/) та оснований на Kotlin [Fraud Detection Service](/docs/demo/services/fraud-detection/)

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
[логи]: /docs/concepts/signals/logs/
[анотації]: /docs/zero-code/java/agent/annotations/
[налаштувати Java агент]: /docs/zero-code/java/agent/configuration/
[консольний експортер]: /docs/languages/java/configuration/#properties-exporters
[експортер]: /docs/languages/java/configuration/#properties-exporters
[java-vers]: https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility
[ручне інструментування]: ../instrumentation
[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[Spring Boot]: https://spring.io/guides/gs/spring-boot/
