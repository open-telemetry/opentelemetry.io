---
title: Instrumentation
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - manual
  - manual_instrumentation
weight: 20
description: Manual instrumentation for OpenTelemetry Java
# prettier-ignore
cSpell:ignore: Autowired customizer logback loggable multivalued rolldice springframework
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/instrumentation-intro %}}

{{% alert title="Note" color="info" %}}

On this page you will learn how you can add traces, metrics and logs to your
code _manually_. But, you are not limited to only use one kind of
instrumentation: use [zero-code instrumentation](/docs/zero-code/java/agent/) to
get started and then enrich your code with manual instrumentation as needed.

Note, that especially if you cannot modify the source code of your app, you can
skip manual instrumentation and only use automatic instrumentation.

Also, for libraries your code depends on, you don't have to write
instrumentation code yourself, since they might come with OpenTelemetry built-in
_natively_ or you can make use of
[instrumentation libraries](/docs/languages/java/libraries/).

{{% /alert %}}

## Example app preparation {#example-app}

This page uses a modified version of the example app from
[Getting Started](/docs/languages/java/getting-started/) to help you learn about
manual instrumentation.

You don't have to use the example app: if you want to instrument your own app or
library, follow the instructions here to adapt the process to your own code.

### Prerequisites

For running the example app, ensure that you have the following installed
locally:

- Java JDK 17+, due to the use of Spring Boot 3. OpenTelemetry Java itself only
  [requires Java 8+][java-vers].
- [Gradle](https://gradle.org/).

### Dependencies {#example-app-dependencies}

To begin, set up an environment in a new directory called `java-simple`. Within
that directory, create a file called `build.gradle.kts` with the following
content:

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

### Create and launch an HTTP Server

To highlight the difference between instrumenting a _library_ and a standalone
_app_, split out the dice rolling into a _library_ class, which then will be
imported as a dependency by the app.

Create the _library file_ name `Dice.java` and add the following code to it:

```java
package otel;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Dice {

  private int min;
  private int max;

  public Dice(int min, int max) {
    this.min = min;
    this.max = max;
  }

  public List<Integer> rollTheDice(int rolls) {
    List<Integer> results = new ArrayList<Integer>();
    for (int i = 0; i < rolls; i++) {
      results.add(this.rollOnce());
    }
    return results;
  }

  private int rollOnce() {
    return ThreadLocalRandom.current().nextInt(this.min, this.max + 1);
  }
}
```

Create the app files `DiceApplication.java` and `RollController.java` and add
the following code to them:

```java
// DiceApplication.java
package otel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.Banner;
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

```java
// RollController.java
package otel;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import otel.Dice;

@RestController
public class RollController {
  private static final Logger logger = LoggerFactory.getLogger(RollController.class);

  @GetMapping("/rolldice")
  public List<Integer> index(@RequestParam("player") Optional<String> player,
      @RequestParam("rolls") Optional<Integer> rolls) {

    if (!rolls.isPresent()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing rolls parameter", null);
    }

    List<Integer> result = new Dice(1, 6).rollTheDice(rolls.get());

    if (player.isPresent()) {
      logger.info("{} is rolling the dice: {}", player.get(), result);
    } else {
      logger.info("Anonymous player is rolling the dice: {}", result);
    }
    return result;
  }
}
```

To ensure that it is working, run the application with the following command and
open <http://localhost:8080/rolldice?rolls=12> in your web browser:

```shell
gradle assemble
java -jar ./build/libs/java-simple.jar
```

You should get a list of 12 numbers in your browser window, for example:

```text
[5,6,5,3,6,1,2,5,4,4,2,4]
```

## Manual instrumentation setup

For both library and app instrumentation, the first step is to install the
dependencies for the OpenTelemetry API.

Throughout this documentation you will add dependencies. For a full list of
artifact coordinates, see [releases]. For semantic convention releases, see
[semantic-conventions-java].

[releases]: https://github.com/open-telemetry/opentelemetry-java#releases
[semantic-conventions-java]:
  https://github.com/open-telemetry/semantic-conventions-java/releases

### Dependency management

A Bill of Material
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
ensures that versions of dependencies (including transitive ones) are aligned.
Importing the `opentelemetry-bom` BOM is important to ensure version alignment
across all OpenTelemetry dependencies.

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin { hl_lines=["1-5",9] }
dependencyManagement {
  imports {
    mavenBom("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}")
  }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web");
    implementation("io.opentelemetry:opentelemetry-api");
}
```

If you are not using Spring and its `io.spring.dependency-management` dependency
management plugin, install the OpenTelemetry BOM and API using Gradle
dependencies only.

```kotlin
dependencies {
    implementation(platform("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}"));
    implementation("io.opentelemetry:opentelemetry-api");
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.opentelemetry</groupId>
                <artifactId>opentelemetry-bom</artifactId>
                <version>{{% param vers.otel %}}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-api</artifactId>
        </dependency>
    </dependencies>
</project>
```

{{% /tab %}} {{% /tabpane %}}

### Initialize the SDK

{{% alert title="Note" color="info" %}} If you’re instrumenting a library,
**skip this step**. {{% /alert %}}

The OpenTelemetry API provides a set of interfaces for collecting telemetry, but
the data is dropped without an implementation. The OpenTelemetry SDK is the
implementation of the OpenTelemetry API provided by OpenTelemetry. To use it if
you instrument a Java app, begin by installing dependencies:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin { hl_lines="4-6" }
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web");
    implementation("io.opentelemetry:opentelemetry-api");
    implementation("io.opentelemetry:opentelemetry-sdk");
    implementation("io.opentelemetry:opentelemetry-exporter-logging");
    implementation("io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha");
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-sdk</artifactId>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-logging</artifactId>
        </dependency>
        <dependency>
            <!-- Not managed by opentelemetry-bom -->
            <groupId>io.opentelemetry.semconv</groupId>
            <artifactId>opentelemetry-semconv</artifactId>
            <version>{{% param vers.semconv %}}-alpha</version>
        </dependency>
    </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane>}}

If you are an application developer, you need to configure an instance of the
`OpenTelemetrySdk` as early as possible in your application. This can either be
done manually by using the `OpenTelemetrySdk.builder()` or by using the SDK
autoconfiguration extension through the
`opentelemetry-sdk-extension-autoconfigure` module. It is recommended to use
autoconfiguration, as it is easier to use and comes with various additional
capabilities.

#### Automatic Configuration

To use autoconfiguration add the following dependency to your application:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin { hl_lines="7" }
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web");
    implementation("io.opentelemetry:opentelemetry-api");
    implementation("io.opentelemetry:opentelemetry-sdk");
    implementation("io.opentelemetry:opentelemetry-exporter-logging");
    implementation("io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha");
    implementation("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure");
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencies>
        <dependency>
          <groupId>io.opentelemetry</groupId>
          <artifactId>opentelemetry-sdk-extension-autoconfigure</artifactId>
        </dependency>
        <dependency>
          <groupId>io.opentelemetry</groupId>
          <artifactId>opentelemetry-sdk-extension-autoconfigure-spi</artifactId>
        </dependency>
    </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane>}}

It allows you to autoconfigure the OpenTelemetry SDK based on a standard set of
supported environment variables and system properties. Each environment variable
has a corresponding system property named the same way but as lower case and
using the `.` (dot) character instead of the `_` (underscore) as separator.
Reference the [configuration](/docs/languages/java/configuration/) page for
details on all available options.

The logical service name can be specified via the `OTEL_SERVICE_NAME`
environment variable (or `otel.service.name` system property).

The traces, metrics or logs exporters can be set via the `OTEL_TRACES_EXPORTER`,
`OTEL_METRICS_EXPORTER` and `OTEL_LOGS_EXPORTER` environment variables. For
example `OTEL_TRACES_EXPORTER=logging` configures your application to use an
exporter that writes all traces to the console. The corresponding exporter
library has to be provided in the classpath of the application as well.

For debugging and local development purposes, use the `logging` exporter. After
you have finished setting up manual instrumentation, provide an appropriate
exporter library in the classpath of the application to
[export the app's telemetry data](/docs/languages/java/exporters/) to one or
more telemetry backends.

The SDK autoconfiguration has to be initialized as early as possible in the
application lifecycle in order to allow the module to go through the provided
environment variables (or system properties) and set up the `OpenTelemetry`
instance by using the builders internally.

```java
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

OpenTelemetrySdk sdk = AutoConfiguredOpenTelemetrySdk.initialize()
    .getOpenTelemetrySdk();
```

In the case of the [example app](#example-app) the `DiceApplication` class gets
updated as follows:

```java { hl_lines=["6-9","19-22"] }
package otel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.Banner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }

  @Bean
  public OpenTelemetry openTelemetry() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```

To verify your code, build and run the app:

```sh
gradle assemble
env \
OTEL_SERVICE_NAME=dice-server \
OTEL_TRACES_EXPORTER=logging \
OTEL_METRICS_EXPORTER=logging \
OTEL_LOGS_EXPORTER=logging \
OTEL_METRIC_EXPORT_INTERVAL=15000 \
java -jar ./build/libs/java-simple.jar
```

This basic setup has no effect on your app yet. You need to add code for
[traces](#traces), [metrics](#metrics), and/or [logs](#logs).

Note that `OTEL_METRIC_EXPORT_INTERVAL=15000` (milliseconds) is a temporary
setting to test that your metrics are properly generated. Remember to remove the
setting once you are done testing. The default is 60000 milliseconds.

#### Manual Configuration

`OpenTelemetrySdk.builder()` returns an instance of `OpenTelemetrySdkBuilder`,
which gets the providers related to the signals, tracing and metrics, in order
to build the `OpenTelemetry` instance.

You can build the providers by using the `SdkTracerProvider.builder()` and
`SdkMeterProvider.builder()` methods.

In the case of the [example app](#example-app) the the `DiceApplication` class
gets updated as follows:

```java { hl_lines=["6-24","34-62"] }
package otel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.Banner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.exporter.logging.LoggingMetricExporter;
import io.opentelemetry.exporter.logging.LoggingSpanExporter;
import io.opentelemetry.exporter.logging.SystemOutLogRecordExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import io.opentelemetry.semconv.ResourceAttributes;

@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }

  @Bean
  public OpenTelemetry openTelemetry() {
    Resource resource = Resource.getDefault().toBuilder().put(ResourceAttributes.SERVICE_NAME, "dice-server").put(ResourceAttributes.SERVICE_VERSION, "0.1.0").build();

    SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(SimpleSpanProcessor.create(LoggingSpanExporter.create()))
        .setResource(resource)
        .build();

    SdkMeterProvider sdkMeterProvider = SdkMeterProvider.builder()
        .registerMetricReader(PeriodicMetricReader.builder(LoggingMetricExporter.create()).build())
        .setResource(resource)
        .build();

    SdkLoggerProvider sdkLoggerProvider = SdkLoggerProvider.builder()
        .addLogRecordProcessor(BatchLogRecordProcessor.builder(SystemOutLogRecordExporter.create()).build())
        .setResource(resource)
        .build();

    OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
        .setTracerProvider(sdkTracerProvider)
        .setMeterProvider(sdkMeterProvider)
        .setLoggerProvider(sdkLoggerProvider)
        .setPropagators(ContextPropagators.create(TextMapPropagator.composite(W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance())))
        .buildAndRegisterGlobal();

    return openTelemetry;
  }
}
```

For debugging and local development purposes, the example exports telemetry to
the console. After you have finished setting up manual instrumentation, you need
to configure an appropriate exporter to
[export the app's telemetry data](/docs/languages/java/exporters/) to one or
more telemetry backends.

The example also sets up the mandatory SDK default attribute `service.name`,
which holds the logical name of the service, and the optional (but highly
encouraged!) attribute `service.version`, which holds the version of the service
API or implementation.

Alternative methods exist for setting up resource attributes. For more
information, see [Resources](/docs/languages/java/resources/).

To verify your code, build and run the app:

```sh
gradle assemble
java -jar ./build/libs/java-simple.jar
```

This basic setup has no effect on your app yet. You need to add code for
[traces](#traces), [metrics](#metrics), and/or [logs](#logs).

## Traces

### Initialize Tracing

{{% alert title="Note" color="info" %}} If you’re instrumenting a library,
**skip this step**. {{% /alert %}}

To enable [tracing](/docs/concepts/signals/traces/) in your app, you'll need to
have an initialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) that will let
you create a [`Tracer`](/docs/concepts/signals/traces/#tracer):

```java
import io.opentelemetry.sdk.trace.SdkTracerProvider;

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(spanProcessor)
  .setResource(resource)
  .build();
```

If a `TracerProvider` is not created, the OpenTelemetry APIs for tracing will
use a no-op implementation and fail to generate data.

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `TracerProvider` setup for you already. You can continue with
[acquiring a tracer](#acquiring-a-tracer).

### Acquiring a Tracer

To do [Tracing](/docs/concepts/signals/traces/) you'll need to acquire a
[`Tracer`](/docs/concepts/signals/traces/#tracer).

**Note:** Methods of the OpenTelemetry SDK should never be called.

First, a `Tracer` must be acquired, which is responsible for creating spans and
interacting with the [Context](#context-propagation). A tracer is acquired by
using the OpenTelemetry API specifying the name and version of the [library
instrumenting][instrumentation library] the [instrumented library] or application
to be monitored. More information is available in the specification chapter [Obtaining
a
Tracer].

Anywhere in your application where you write manual tracing code should call
`getTracer` to acquire a tracer. For example:

```java
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = openTelemetry.getTracer("instrumentation-scope-name", "instrumentation-scope-version");
```

The values of `instrumentation-scope-name` and `instrumentation-scope-version`
should uniquely identify the
[Instrumentation Scope](/docs/concepts/instrumentation-scope/), such as the
package, module or class name. This will help later help determining what the
source of telemetry is. While the name is required, the version is still
recommended despite being optional. Note, that all `Tracer`s that are created by
a single `OpenTelemetry` instance will interoperate, regardless of name.

It's generally recommended to call `getTracer` in your app when you need it
rather than exporting the `tracer` instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

In the case of the [example app](#example-app), there are two places where a
tracer may be acquired with an appropriate Instrumentation Scope:

First, in the `index` method of the `RollController` as follows:

```java { hl_lines=["4-6",11,"13-16"] }
package otel;

// ...
import org.springframework.beans.factory.annotation.Autowired;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

@RestController
public class RollController {
  private static final Logger logger = LoggerFactory.getLogger(RollController.class);
  private final Tracer tracer;

  @Autowired
  RollController(OpenTelemetry openTelemetry) {
    tracer = openTelemetry.getTracer(RollController.class.getName(), "0.1.0");
  }
  // ...
}
```

And second, in the _library file_ `Dice.java`:

```java { hl_lines=["2-3","9-19"]}
// ...
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

public class Dice {

  private int min;
  private int max;
  private Tracer tracer;

  public Dice(int min, int max, OpenTelemetry openTelemetry) {
    this.min = min;
    this.max = max;
    this.tracer = openTelemetry.getTracer(Dice.class.getName(), "0.1.0");
  }

  public Dice(int min, int max) {
    this(min, max, OpenTelemetry.noop());
  }

  // ...
}
```

As an aside, if you are writing library instrumentation, it is strongly
recommended that you provide your users the ability to inject an instance of
`OpenTelemetry` into your instrumentation code. If this is not possible for some
reason, you can fall back to using an instance from the `GlobalOpenTelemetry`
class:

```java
import io.opentelemetry.api.GlobalOpenTelemetry;

Tracer tracer = GlobalOpenTelemetry.getTracer("instrumentation-scope-name", "instrumentation-scope-version");
```

Note that you can't force end users to configure the global, so this is the most
brittle option for library instrumentation.

### Acquiring a Tracer in Java Agent

If you are writing a Java Agent, you can acquire a `Tracer` from the global OpenTelemetry instance:

```java
import io.opentelemetry.api.GlobalOpenTelemetry;

Tracer tracer = GlobalOpenTelemetry.getTracer("instrumentation-scope-name");
```

### Acquiring a Tracer in Spring Boot starter

If you are writing a Spring Boot starter, you can acquire a `Tracer` from the autowired OpenTelemetry instance:

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

public class MyController {
  private final Tracer tracer;

  public MyController(OpenTelemetry openTelemetry) {
    this.tracer = openTelemetry.getTracer("instrumentation-scope-name");
  }
}
```

### Create Spans

Now that you have [tracers](/docs/concepts/signals/traces/#tracer) initialized,
you can create [spans](/docs/concepts/signals/traces/#spans).

To create [Spans](/docs/concepts/signals/traces/#spans), you only need to
specify the name of the span. The start and end time of the span is
automatically set by the OpenTelemetry SDK.

The code below illustrates how to create a span:

```java { hl_lines=["1-2","8-11","25-30"] }
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Scope;

// ...
  @GetMapping("/rolldice")
  public List<Integer> index(@RequestParam("player") Optional<String> player,
      @RequestParam("rolls") Optional<Integer> rolls) {
    Span span = tracer.spanBuilder("rollTheDice").startSpan();

    // Make the span the current span
    try (Scope scope = span.makeCurrent()) {

      if (!rolls.isPresent()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing rolls parameter", null);
      }

      List<Integer> result = new Dice(1, 6).rollTheDice(rolls.get());

      if (player.isPresent()) {
        logger.info("{} is rolling the dice: {}", player.get(), result);
      } else {
        logger.info("Anonymous player is rolling the dice: {}", result);
      }
      return result;
    } catch(Throwable t) {
      span.recordException(t);
      throw t;
    } finally {
      span.end();
    }
  }
```

It's required to call `end()` to end the span when you want it to end.

If you followed the instructions using the [example app](#example-app) up to
this point, you can copy the code above into the `index` method of the
`RollController`. You should now be able to see spans emitted from your app.

Start your app as follows, and then send it requests by visiting
<http://localhost:8080/rolldice> with your browser or `curl`:

```shell
gradle assemble
env \
OTEL_SERVICE_NAME=dice-server \
OTEL_TRACES_EXPORTER=logging \
OTEL_METRICS_EXPORTER=logging \
OTEL_LOGS_EXPORTER=logging \
java -jar ./build/libs/java-simple.jar
```

After a while, you should see the spans printed in the console by the
`LoggingSpanExporter`, something like this:

```log
2023-08-02T17:22:22.658+02:00  INFO 2313 --- [nio-8080-exec-1] i.o.e.logging.LoggingSpanExporter        : 'rollTheDice' : 565232b11b9933fa6be8d6c4a1307fe2 6e1e011e2e8c020b INTERNAL [tracer: otel.RollController:0.1.0] {}
```

### Create nested Spans

Most of the time, we want to correlate
[spans](/docs/concepts/signals/traces/#spans) for nested operations.
OpenTelemetry supports tracing within processes and across remote processes. For
more details how to share context between remote processes, see
[Context Propagation](#context-propagation).

For example in the `Dice` class method `rollTheDice` calling method `rollOnce`,
the spans could be manually linked in the following way:

```java { hl_lines=["1-2","5","7","9","12-14","17-21","23-25"]}
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Context;
// ...
  public List<Integer> rollTheDice(int rolls) {
    Span parentSpan = tracer.spanBuilder("parent").startSpan();
    List<Integer> results = new ArrayList<Integer>();
    try {
      for (int i = 0; i < rolls; i++) {
        results.add(this.rollOnce(parentSpan));
      }
      return results;
    } finally {
      parentSpan.end();
    }
  }

  private int rollOnce(Span parentSpan) {
    Span childSpan = tracer.spanBuilder("child")
        .setParent(Context.current().with(parentSpan))
        .startSpan();
    try {
      return ThreadLocalRandom.current().nextInt(this.min, this.max + 1);
    } finally {
      childSpan.end();
    }
  }
```

The OpenTelemetry API offers also an automated way to propagate the parent span
on the current thread:

```java { hl_lines=["1-2","5-6","12-14","18-22","24-26"]}
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Scope;
// ...
  public List<Integer> rollTheDice(int rolls) {
    Span parentSpan = tracer.spanBuilder("parent").startSpan();
    try (Scope scope = parentSpan.makeCurrent()) {
      List<Integer> results = new ArrayList<Integer>();
      for (int i = 0; i < rolls; i++) {
        results.add(this.rollOnce());
      }
      return results;
    } finally {
      parentSpan.end();
    }
  }

  private int rollOnce() {
    Span childSpan = tracer.spanBuilder("child")
    // NOTE: setParent(...) is not required;
    // `Span.current()` is automatically added as the parent
    .startSpan();
    try(Scope scope = childSpan.makeCurrent()) {
      return ThreadLocalRandom.current().nextInt(this.min, this.max + 1);
    } finally {
      childSpan.end();
    }
  }
}
```

To link spans from remote processes, it is sufficient to set the
[Remote Context](#context-propagation) as parent.

```java
Span childRemoteParent = tracer.spanBuilder("Child").setParent(remoteContext).startSpan();
```

### Get the current span

Sometimes it's helpful to do something with the current/active
[span](/docs/concepts/signals/traces/#spans) at a particular point in program
execution.

```java
Span span = Span.current()
```

And if you want the current span for a particular `Context` object:

```java
Span span = Span.fromContext(context)
```

### Span Attributes

In OpenTelemetry [spans](/docs/concepts/signals/traces/#spans) can be created
freely and it's up to the implementor to annotate them with attributes specific
to the represented operation.
[Attributes](/docs/concepts/signals/traces/#attributes) provide additional
context on a span about the specific operation it tracks, such as results or
operation properties.

```java
Span span = tracer.spanBuilder("/resource/path").setSpanKind(SpanKind.CLIENT).startSpan();
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

### Semantic Attributes

There are semantic conventions for spans representing operations in well-known
protocols like HTTP or database calls. Semantic conventions for these spans are
defined in the specification at
[Trace Semantic Conventions](/docs/specs/semconv/general/trace/).

First add the semantic conventions as a dependency to your application:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha")
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<dependency>
    <groupId>io.opentelemetry.semconv</groupId>
    <artifactId>opentelemetry-semconv</artifactId>
    <version>{{% param vers.semconv %}}-alpha</version>
</dependency>
```

{{% /tab %}} {{< /tabpane>}}

Finally, you can update your file to include semantic attributes:

```java
Span span = tracer.spanBuilder("/resource/path").setSpanKind(SpanKind.CLIENT).startSpan();
span.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
span.setAttribute(SemanticAttributes.HTTP_URL, url.toString());
```

### Create Spans with events

[Spans](/docs/concepts/signals/traces/#spans) can be annotated with named events
(called [Span Events](/docs/concepts/signals/traces/#span-events)) that can
carry zero or more [Span Attributes](#span-attributes), each of which itself is
a key:value map paired automatically with a timestamp.

```java
span.addEvent("Init");
...
span.addEvent("End");
```

```java
Attributes eventAttributes = Attributes.of(
    AttributeKey.stringKey("key"), "value",
    AttributeKey.longKey("result"), 0L);

span.addEvent("End Computation", eventAttributes);
```

### Create Spans with links

A [Span](/docs/concepts/signals/traces/#spans) may be linked to zero or more
other Spans that are causally related via a
[Span Link](/docs/concepts/signals/traces/#span-links). Links can be used to
represent batched operations where a Span was initiated by multiple initiating
Spans, each representing a single incoming item being processed in the batch.

```java
Span child = tracer.spanBuilder("childWithLink")
        .addLink(parentSpan1.getSpanContext())
        .addLink(parentSpan2.getSpanContext())
        .addLink(parentSpan3.getSpanContext())
        .addLink(remoteSpanContext)
    .startSpan();
```

For more details how to read context from remote processes, see
[Context Propagation](#context-propagation).

### Set span status

A [status](/docs/concepts/signals/traces/#span-status) can be set on a
[span](/docs/concepts/signals/traces/#spans), typically used to specify that a
span has not completed successfully - `SpanStatus.Error`. In rare scenarios, you
could override the `Error` status with `OK`, but don't set `OK` on
successfully-completed spans.

The status can be set at any time before the span is finished:

```java
Span span = tracer.spanBuilder("my span").startSpan();
// put the span into the current Context
try (Scope scope = span.makeCurrent()) {
	// do something
} catch (Throwable t) {
  span.setStatus(StatusCode.ERROR, "Something bad happened!");
  throw t;
} finally {
  span.end(); // Cannot set a span after this call
}
```

### Record exceptions in spans

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with setting [span status](#set-span-status).

```java
Span span = tracer.spanBuilder("my span").startSpan();
// put the span into the current Context
try (Scope scope = span.makeCurrent()) {
	// do something
} catch (Throwable throwable) {
  span.setStatus(StatusCode.ERROR, "Something bad happened!");
  span.recordException(throwable);
} finally {
  span.end(); // Cannot set a span after this call
}
```

This will capture things like the current stack trace in the span.

### Context Propagation

OpenTelemetry provides a text-based approach to propagate context to remote
services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
HTTP headers.

### Context propagation between threads

The following example demonstrates how to propagate the context between threads:

```java
io.opentelemetry.context.Context context = io.opentelemetry.context.Context.current();
Thread thread = new Thread(context.wrap(new Runnable() {
  @Override
  public void run() {
    // Code for which you want to propagate the context
  }
}));
thread.start();
```

### Context propagation between HTTP requests

The following presents an example of an outgoing HTTP request using
`HttpURLConnection`.

```java
// Tell OpenTelemetry to inject the context in the HTTP headers
TextMapSetter<HttpURLConnection> setter =
  new TextMapSetter<HttpURLConnection>() {
    @Override
    public void set(HttpURLConnection carrier, String key, String value) {
        // Insert the context as Header
        carrier.setRequestProperty(key, value);
    }
};

URL url = new URL("http://127.0.0.1:8080/resource");
Span outGoing = tracer.spanBuilder("/resource").setSpanKind(SpanKind.CLIENT).startSpan();
try (Scope scope = outGoing.makeCurrent()) {
  // Use the Semantic Conventions.
  // (Note that to set these, Span does not *need* to be the current instance in Context or Scope.)
  outGoing.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
  outGoing.setAttribute(SemanticAttributes.HTTP_URL, url.toString());
  HttpURLConnection transportLayer = (HttpURLConnection) url.openConnection();
  // Inject the request with the *current*  Context, which contains our current Span.
  openTelemetry.getPropagators().getTextMapPropagator().inject(Context.current(), transportLayer, setter);
  // Make outgoing call
} finally {
  outGoing.end();
}
...
```

Similarly, the text-based approach can be used to read the W3C Trace Context
from incoming requests. The following presents an example of processing an
incoming HTTP request using [HttpExchange][].

```java
TextMapGetter<HttpExchange> getter =
  new TextMapGetter<>() {
    @Override
    public String get(HttpExchange carrier, String key) {
      if (carrier.getRequestHeaders().containsKey(key)) {
        return carrier.getRequestHeaders().get(key).get(0);
      }
      return null;
    }

   @Override
   public Iterable<String> keys(HttpExchange carrier) {
     return carrier.getRequestHeaders().keySet();
   }
};
...
public void handle(HttpExchange httpExchange) {
  // Extract the SpanContext and other elements from the request.
  Context extractedContext = openTelemetry.getPropagators().getTextMapPropagator()
        .extract(Context.current(), httpExchange, getter);
  try (Scope scope = extractedContext.makeCurrent()) {
    // Automatically use the extracted SpanContext as parent.
    Span serverSpan = tracer.spanBuilder("GET /resource")
        .setSpanKind(SpanKind.SERVER)
        .startSpan();
    try {
      // Add the attributes defined in the Semantic Conventions
      serverSpan.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
      serverSpan.setAttribute(SemanticAttributes.HTTP_SCHEME, "http");
      serverSpan.setAttribute(SemanticAttributes.HTTP_HOST, "localhost:8080");
      serverSpan.setAttribute(SemanticAttributes.HTTP_TARGET, "/resource");
      // Serve the request
      ...
    } finally {
      serverSpan.end();
    }
  }
}
```

The following code presents an example to read the W3C Trace Context from
incoming request, add spans, and further propagate the context. The example
utilizes
[HttpHeaders](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpHeaders.html)
to fetch the traceparent header for context propagation.

```java
TextMapGetter<HttpHeaders> getter =
  new TextMapGetter<HttpHeaders>() {
    @Override
    public String get(HttpHeaders headers, String s) {
      assert headers != null;
      return headers.getHeaderString(s);
    }

    @Override
    public Iterable<String> keys(HttpHeaders headers) {
      List<String> keys = new ArrayList<>();
      MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();
      requestHeaders.forEach((k, v) ->{
        keys.add(k);
      });
    }
};

TextMapSetter<HttpURLConnection> setter =
  new TextMapSetter<HttpURLConnection>() {
    @Override
    public void set(HttpURLConnection carrier, String key, String value) {
        // Insert the context as Header
        carrier.setRequestProperty(key, value);
    }
};

//...
public void handle(<Library Specific Annotation> HttpHeaders headers){
        Context extractedContext = opentelemetry.getPropagators().getTextMapPropagator()
                .extract(Context.current(), headers, getter);
        try (Scope scope = extractedContext.makeCurrent()) {
            // Automatically use the extracted SpanContext as parent.
            Span serverSpan = tracer.spanBuilder("GET /resource")
                .setSpanKind(SpanKind.SERVER)
                .startSpan();

            try(Scope ignored = serverSpan.makeCurrent()) {
                // Add the attributes defined in the Semantic Conventions
                serverSpan.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
                serverSpan.setAttribute(SemanticAttributes.HTTP_SCHEME, "http");
                serverSpan.setAttribute(SemanticAttributes.HTTP_HOST, "localhost:8080");
                serverSpan.setAttribute(SemanticAttributes.HTTP_TARGET, "/resource");

                HttpURLConnection transportLayer = (HttpURLConnection) url.openConnection();
                // Inject the request with the *current*  Context, which contains our current Span.
                openTelemetry.getPropagators().getTextMapPropagator().inject(Context.current(), transportLayer, setter);
                // Make outgoing call
            }finally {
                serverSpan.end();
            }
      }
}
```

## Metrics

[Spans](/docs/concepts/signals/traces/#spans) provide detailed information about
your application, but produce data that is proportional to the load on the
system. In contrast, [metrics](/docs/concepts/signals/metrics) combine
individual measurements into aggregations, and produce data which is constant as
a function of system load. The aggregations lack details required to diagnose
low level issues, but complement spans by helping to identify trends and
providing application runtime telemetry.

The metrics API defines a variety of instruments. Instruments record
measurements, which are aggregated by the metrics SDK and eventually exported
out of process. Instruments come in synchronous and asynchronous varieties.
Synchronous instruments record measurements as they happen. Asynchronous
instruments register a callback, which is invoked once per collection, and which
records measurements at that point in time.

### Initialize Metrics

{{% alert color="info" %}} If you’re instrumenting a library, skip this step.
{{% /alert %}}

To enable [metrics](/docs/concepts/signals/metrics/) in your app, you need to
have an initialized
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider) that lets you
create a [`Meter`](/docs/concepts/signals/metrics/#meter). If a `MeterProvider`
is not created, the OpenTelemetry APIs for metrics use a no-op implementation
and fail to generate data.

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `MeterProvider` setup for you already. You can continue with
[acquiring a meter](#acquiring-a-meter).

When creating a `MeterProvider` you can specify a [MetricReader](#metric-reader)
and [MetricExporter](/docs/languages/java/exporters/). The
`LoggingMetricExporter` is included in the `opentelemetry-exporter-logging`
artifact that was added in the [Initialize the SDK](#initialize-the-sdk) step.

```java
SdkMeterProvider sdkMeterProvider = SdkMeterProvider.builder()
    .registerMetricReader(
        PeriodicMetricReader
            .builder(LoggingMetricExporter.create())
            // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
            .setInterval(Duration.ofSeconds(10)).build())
    .build();

// Register MeterProvider with OpenTelemetry instance
OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
    .setMeterProvider(sdkMeterProvider)
    .build();
```

### Acquiring a Meter

Anywhere in your application where you have manually instrumented code you can
call `opentelemetry.meterBuilder(instrumentationScopeName)` to get or create a
new meter instance using the builder pattern, or
`opentelemetry.getMeter(instrumentationScopeName)` to get or create a meter
based on just the instrument scope name.

```java
// Get or create a named meter instance with instrumentation version using builder
Meter meter = openTelemetry.meterBuilder("dice-server")
    .setInstrumentationVersion("0.1.0")
    .build();

// Get or create a named meter instance by name only
Meter meter = openTelemetry.getMeter("dice-server");
```

Now that you have [meters](/docs/concepts/signals/metrics/#meter) initialized.
you can create
[metric instruments](/docs/concepts/signals/metrics/#metric-instruments).

### Acquiring a Meter in Java Agent

If you are writing a Java Agent, you can acquire a `Meter` from the global OpenTelemetry instance:

```java
import io.opentelemetry.api.GlobalOpenTelemetry;

Meter meter = GlobalOpenTelemetry.getMeter("instrumentation-scope-name");
```

### Acquiring a Meter in Spring Boot starter

If you are writing a Spring Boot starter, you can acquire a `Meter` from the autowired OpenTelemetry instance:

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

public class MyController {
  private final Meter meter;

  public MyController(OpenTelemetry openTelemetry) {
    this.meter = openTelemetry.getMeter("instrumentation-scope-name");
  }
}
```
a
### Using Counters

Counters can be used to measure non-negative, increasing values.

```java
LongCounter counter = meter.counterBuilder("dice-lib.rolls.counter")
    .setDescription("How many times the dice have been rolled.")
    .setUnit("rolls")
    .build();

counter.add(1, attributes);
```

### Using Observable (Async) Counters

Observable counters can be used to measure an additive, non-negative,
monotonically increasing value. These counters specifically focus on the total
accumulated amount, which is gathered from external sources. Unlike synchronous
counters where each increment is recorded as it happens, observable counters
allow you to asynchronously monitor the overall sum of multiple increments.

```java
ObservableLongCounter counter = meter.counterBuilder("dice-lib.uptime")
    .buildWithCallback(measurement -> measurement.record(getUpTime()));
```

### Using UpDown Counters

UpDown counters can increment and decrement, allowing you to observe a value
that goes up or down.

```java
LongUpDownCounter counter = meter.upDownCounterBuilder("dice-lib.score")
    .setDescription("Score from dice rolls.")
    .setUnit("points")
    .build();

//...

counter.add(10, attributes);

//...

counter.add(-20, attributes);
```

### Using Observable (Async) UpDown Counters

Observable UpDown counters can increment and decrement, allowing you to measure
an additive, non-negative, non-monotonically increasing cumulative value. These
UpDown counters specifically focus on the total accumulated amount, which is
gathered from external sources. Unlike synchronous UpDown counters where each
increment is recorded as it happens, observable counters allow you to
asynchronously monitor the overall sum of multiple increments.

```java
ObservableDoubleUpDownCounter upDownCounter = meter.upDownCounterBuilder("dice-lib.score")
    .buildWithCallback(measurement -> measurement.record(calculateScore()));
```

### Using Histograms

Histograms are used to measure a distribution of values over time.

```java
LongHistogram histogram = meter.histogramBuilder("dice-lib.rolls")
    .ofLongs() // Required to get a LongHistogram, default is DoubleHistogram
    .setDescription("A distribution of the value of the rolls.")
    .setExplicitBucketBoundariesAdvice(Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L, 7L))
    .setUnit("points")
    .build();

histogram.record(7, attributes);
```

### Using Observable (Async) Gauges

Observable Gauges should be used to measure non-additive values.

```java
ObservableDoubleGauge gauge = meter.gaugeBuilder("jvm.memory.used")
    .buildWithCallback(measurement -> measurement.record(getMemoryUsed()));
```

### Adding Attributes

When you generate metrics, adding attributes creates unique metric series based
on each distinct set of attributes that receive measurements. This leads to the
concept of 'cardinality', which is the total number of unique series.
Cardinality directly affects the size of the metric payloads that are exported.
Therefore, it's important to carefully select the dimensions included in these
attributes to prevent a surge in cardinality, often referred to as 'cardinality
explosion'.

```java
Attributes attrs = Attributes.of(
    stringKey("hostname"), "i-98c3d4938",
    stringKey("region"), "us-east-1");

histogram.record(7, attrs);
```

### Metric Views

Views provide a mechanism for controlling how measurements are aggregated into
metrics. They consist of an `InstrumentSelector` and a `View`. The instrument
selector consists of a series of options for selecting which instruments the
view applies to. Instruments can be selected by a combination of name, type,
meter name, meter version, and meter schema URL. The view describes how
measurement should be aggregated. The view can change the name, description, the
aggregation, and define the set of attribute keys that should be retained.

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
    .registerView(
        InstrumentSelector.builder()
            .setName("my-counter") // Select instrument(s) called "my-counter"
            .build(),
        View.builder()
            .setName("new-counter-name") // Change the name to "new-counter-name"
            .build())
    .registerMetricReader(...)
    .build();
```

Every instrument has a default view, which retains the original name,
description, and attributes, and has a default aggregation that is based on the
type of instrument. When a registered view matches an instrument, the default
view is replaced by the registered view. Additional registered views that match
the instrument are additive, and result in multiple exported metrics for the
instrument.

#### Selectors

To instantiate a view, one must first select a target instrument. The following
are valid selectors for metrics:

- instrumentType
- instrumentName
- meterName
- meterVersion
- meterSchemaUrl

Selecting by `instrumentName` (of type string) has support for wildcards, so you
can select all instruments using `*` or select all instruments whose name starts
with `http` by using `http*`.

#### Examples

Filter attributes on all metric types:

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
    .registerView(
        // apply the view to all instruments
        InstrumentSelector.builder().setName("*").build(),
        // only export the attribute 'environment'
        View.builder().setAttributeFilter(Set.of("environment")).build())
    .build();
```

Drop all instruments with the meter name "pubsub":

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
    .registerView(
        InstrumentSelector.builder().setMeterName("pubsub").build(),
        View.builder().setAggregation(Aggregation.drop()).build())
    .build();
```

Define explicit bucket sizes for the Histogram named
`http.server.request.duration`:

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
    .registerView(
        InstrumentSelector.builder().setName("http.server.request.duration").build(),
        View.builder()
            .setAggregation(
                Aggregation.explicitBucketHistogram(
                    List.of(0.0, 1.0, 5.0, 10.0, 20.0, 25.0, 30.0)
                )
            ).build()
    ).build();
```

## Logs

Logs are distinct from metrics and traces in that **there is no user-facing
OpenTelemetry logs API**. Instead, there is tooling to bridge logs from existing
popular log frameworks (e.g. SLF4j, JUL, Logback, Log4j) into the OpenTelemetry
ecosystem. For rationale behind this design decision, see
[Logging specification](/docs/specs/otel/logs/).

The two typical workflows discussed below each cater to different application
requirements.

### Direct to collector

In the direct to collector workflow, logs are emitted directly from an
application to a collector using a network protocol (e.g. OTLP). This workflow
is simple to set up as it doesn't require any additional log forwarding
components, and allows an application to easily emit structured logs that
conform to the [log data model][log data model]. However, the overhead required
for applications to queue and export logs to a network location may not be
suitable for all applications.

To use this workflow:

- Install appropriate [Log Appender](#log-appenders).
- Configure the OpenTelemetry [Log SDK](#logs-sdk) to export log records to
  desired target destination (the [collector][opentelemetry collector] or
  other).

#### Log appenders

A log appender bridges logs from a log framework into the OpenTelemetry
[Log SDK](#logs-sdk) using the [Logs Bridge API][logs bridge API]. Log appenders
are available for various popular Java log frameworks:

- [Log4j2 Appender][log4j2 appender]
- [Logback Appender][logback appender]

The links above contain full usage and installation documentation, but
installation is generally as follows:

- Add required dependency via gradle or maven.
- Extend the application's log configuration (i.e. `logback.xml`, `log4j.xml`,
  etc) to include a reference to the OpenTelemetry log appender.
  - Optionally configure the log framework to determine which logs (i.e. filter
    by severity or logger name) are passed to the appender.
  - Optionally configure the appender to indicate how logs are mapped to
    OpenTelemetry Log Records (i.e. capture thread information, context data,
    markers, etc).

Log appenders automatically include the trace context in log records, enabling
log correlation with traces.

The [Log Appender example][log appender example] demonstrates setup for a
variety of scenarios.

### Via file or stdout

In the file or stdout workflow, logs are written to files or standout output.
Another component (e.g. FluentBit) is responsible for reading / tailing the
logs, parsing them to more structured format, and forwarding them a target, such
as the collector. This workflow may be preferable in situations where
application requirements do not permit additional overhead from
[direct to collector](#direct-to-collector). However, it requires that all log
fields required down stream are encoded into the logs, and that the component
reading the logs parse the data into the [log data model][log data model]. The
installation and configuration of log forwarding components is outside the scope
of this document.

Log correlation with traces is available by installing
[log context instrumentation](#log-context-instrumentation).

#### Log context instrumentation

OpenTelemetry provides components which enrich log context with trace context
for various popular Java log frameworks:

- [Log4j context data instrumentation][log4j context instrumentation]
- [Logback MDC instrumentation][logback context instrumentation]

This links above contain full usage and installation documentation, but
installation is generally as follows:

- Add required dependency via gradle or maven.
- Extend the application's log configuration (i.e. `logback.xml` or `log4j.xml`,
  etc) to reference the trace context fields in the log pattern.

## SDK Configuration

The configuration examples reported in this document only apply to the SDK
provided by `opentelemetry-sdk`. Other implementation of the API might provide
different configuration mechanisms.

### Tracing SDK

The application has to install a span processor with an exporter and may
customize the behavior of the OpenTelemetry SDK.

For example, a basic configuration instantiates the SDK tracer provider and sets
to export the traces to a logging stream.

```java
SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(BatchSpanProcessor.builder(LoggingSpanExporter.create()).build())
  .build();
```

#### Sampler

It is not always feasible to trace and export every user request in an
application. In order to strike a balance between observability and expenses,
traces can be sampled.

The OpenTelemetry SDK offers four samplers out of the box:

- [AlwaysOnSampler] which samples every trace regardless of upstream sampling
  decisions.
- [AlwaysOffSampler] which doesn't sample any trace, regardless of upstream
  sampling decisions.
- [ParentBased] which uses the parent span to make sampling decisions, if
  present.
- [TraceIdRatioBased] which samples a configurable percentage of traces, and
  additionally samples any trace that was sampled upstream.

Additional samplers can be provided by implementing the
`io.opentelemetry.sdk.trace.Sampler` interface.

```java
SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .setSampler(Sampler.alwaysOn())
  //or
  .setSampler(Sampler.alwaysOff())
  //or
  .setSampler(Sampler.traceIdRatioBased(0.5))
  .build();
```

#### Span Processor

Different Span processors are offered by OpenTelemetry. The
`SimpleSpanProcessor` immediately forwards ended spans to the exporter, while
the `BatchSpanProcessor` batches them and sends them in bulk. Multiple Span
processors can be configured to be active at the same time using the
`MultiSpanProcessor`.

```java
SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(SimpleSpanProcessor.create(LoggingSpanExporter.create()))
  .addSpanProcessor(BatchSpanProcessor.builder(LoggingSpanExporter.create()).build())
  .build();
```

#### Exporter

Span processors are initialized with an exporter which is responsible for
sending the telemetry data a particular backend. OpenTelemetry offers five
exporters out of the box:

- `InMemorySpanExporter`: keeps the data in memory, useful for testing and
  debugging.
- Jaeger Exporter: prepares and sends the collected telemetry data to a Jaeger
  backend via gRPC. Varieties include `JaegerGrpcSpanExporter` and
  `JaegerThriftSpanExporter`.
- `ZipkinSpanExporter`: prepares and sends the collected telemetry data to a
  Zipkin backend via the Zipkin APIs.
- Logging Exporter: saves the telemetry data into log streams. Varieties include
  `LoggingSpanExporter` and `OtlpJsonLoggingSpanExporter`.
- OpenTelemetry Protocol Exporter: sends the data in OTLP to the [OpenTelemetry
  Collector] or other OTLP receivers. Varieties include `OtlpGrpcSpanExporter` and
  `OtlpHttpSpanExporter`.

Other exporters can be found in the [OpenTelemetry Registry].

```java
ManagedChannel jaegerChannel = ManagedChannelBuilder.forAddress("localhost", 3336)
  .usePlaintext()
  .build();

JaegerGrpcSpanExporter jaegerExporter = JaegerGrpcSpanExporter.builder()
  .setEndpoint("localhost:3336")
  .setTimeout(30, TimeUnit.SECONDS)
  .build();

SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(BatchSpanProcessor.builder(jaegerExporter).build())
  .build();
```

### Metrics SDK

The application has to install a metric reader with an exporter, and may further
customize the behavior of the OpenTelemetry SDK.

For example, a basic configuration instantiates the SDK meter provider and sets
to export the metrics to a logging stream.

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
  .registerMetricReader(PeriodicMetricReader.builder(LoggingMetricExporter.create()).build())
  .build();
```

#### Metric Reader

Metric readers read aggregated metrics.

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
  .registerMetricReader(...)
  .build();
```

OpenTelemetry provides a variety of metric readers out of the box:

- `PeriodicMetricReader`: reads metrics on a configurable interval and pushes to
  a `MetricExporter`.
- `InMemoryMetricReader`: reads metrics into memory, useful for debugging and
  testing.
- `PrometheusHttpServer` (alpha): an HTTP server that reads metrics and
  serializes to Prometheus text format.

Custom metric reader implementations are not currently supported.

#### Exporter

The `PeriodicMetricReader` is paired with a metric exporter, which is
responsible for sending the telemetry data to a particular backend.
OpenTelemetry provides the following exporters out of the box:

- `InMemoryMetricExporter`: keeps the data in memory, useful for testing and
  debugging.
- Logging Exporter: saves the telemetry data into log streams. Varieties include
  `LoggingMetricExporter` and `OtlpJsonLoggingMetricExporter`.
- OpenTelemetry Protocol Exporter: sends the data in OTLP to the [OpenTelemetry
  Collector] or other OTLP receivers. Varieties include `OtlpGrpcMetricExporter`
  and `OtlpHttpMetricExporter`.

Other exporters can be found in the [OpenTelemetry Registry].

### Logs SDK

The logs SDK dictates how logs are processed when using the
[direct to collector](#direct-to-collector) workflow. No log SDK is needed when
using the [log forwarding](#via-file-or-stdout) workflow.

The typical log SDK configuration installs a log record processor and exporter.
For example, the following installs the
[BatchLogRecordProcessor](#logrecord-processor), which periodically exports to a
network location via the [OtlpGrpcLogRecordExporter](#logrecord-exporter):

```java
SdkLoggerProvider loggerProvider = SdkLoggerProvider.builder()
  .addLogRecordProcessor(
    BatchLogRecordProcessor.builder(
      OtlpGrpcLogRecordExporter.builder()
          .setEndpoint("http://localhost:4317")
          .build())
      .build())
  .build();
```

#### LogRecord Processor

LogRecord processors process LogRecords emitted by
[log appenders](#log-appenders).

OpenTelemetry provides the following LogRecord processors out of the box:

- `BatchLogRecordProcessor`: periodically sends batches of LogRecords to a
  [LogRecordExporter](#logrecord-exporter).
- `SimpleLogRecordProcessor`: immediately sends each LogRecord to a
  [LogRecordExporter](#logrecord-exporter).

Custom LogRecord processors are supported by implementing the
`LogRecordProcessor` interface. Common use cases include enriching the
LogRecords with contextual data like baggage, or filtering / obfuscating
sensitive data.

#### LogRecord Exporter

`BatchLogRecordProcessor` and `SimpleLogRecordProcessor` are paired with
`LogRecordExporter`, which is responsible for sending telemetry data to a
particular backend. OpenTelemetry provides the following exporters out of the
box:

- OpenTelemetry Protocol Exporter: sends the data in OTLP to the [OpenTelemetry
  Collector] or other OTLP receivers. Varieties include `OtlpGrpcLogRecordExporter`
  and `OtlpHttpLogRecordExporter`.
- `InMemoryLogRecordExporter`: keeps the data in memory, useful for testing and
  debugging.
- Logging Exporter: saves the telemetry data into log streams. Varieties include
  `SystemOutLogRecordExporter` and `OtlpJsonLoggingLogRecordExporter`. Note:
  `OtlpJsonLoggingLogRecordExporter` logs to JUL, and may cause infinite loops
  (i.e. JUL -> SLF4J -> Logback -> OpenTelemetry Appender -> OpenTelemetry Log
  SDK -> JUL) if not carefully configured.

Custom exporters are supported by implementing the `LogRecordExporter`
interface.

### Autoconfiguration

Instead of manually creating the `OpenTelemetry` instance by using the SDK
builders directly from your code, it is also possible to use the SDK
autoconfiguration extension through the
`opentelemetry-sdk-extension-autoconfigure` module.

This module is made available by adding the following dependency to your
application.

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk-extension-autoconfigure</artifactId>
</dependency>
```

It allows you to autoconfigure the OpenTelemetry SDK based on a standard set of
supported environment variables and system properties. Each environment variable
has a corresponding system property named the same way but as lower case and
using the `.` (dot) character instead of the `_` (underscore) as separator.

The logical service name can be specified via the `OTEL_SERVICE_NAME`
environment variable (or `otel.service.name` system property).

The traces, metrics or logs exporters can be set via the `OTEL_TRACES_EXPORTER`,
`OTEL_METRICS_EXPORTER` and `OTEL_LOGS_EXPORTER` environment variables. For
example `OTEL_TRACES_EXPORTER=jaeger` configures your application to use the
Jaeger exporter. The corresponding Jaeger exporter library has to be provided in
the classpath of the application as well.

If you use the `console` or `logging` exporter for metrics, consider temporarily
setting `OTEL_METRIC_EXPORT_INTERVAL` to a small value like `15000`
(milliseconds) while testing that your metrics are properly recorded. Remember
to remove the setting once you are done testing.

It's also possible to set up the propagators via the `OTEL_PROPAGATORS`
environment variable, like for example using the `tracecontext` value to use
[W3C Trace Context](https://www.w3.org/TR/trace-context/).

For more details, see all the supported configuration options in the module's
[README](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure).

The SDK autoconfiguration has to be initialized from your code in order to allow
the module to go through the provided environment variables (or system
properties) and set up the `OpenTelemetry` instance by using the builders
internally.

```java
OpenTelemetrySdk sdk = AutoConfiguredOpenTelemetrySdk.initialize()
    .getOpenTelemetrySdk();
```

When environment variables or system properties are not sufficient, you can use
some extension points provided through the autoconfigure
[SPI](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure-spi)
and several methods in the `AutoConfiguredOpenTelemetrySdk` class.

Following an example with a code snippet for adding an additional custom span
processor.

```java
AutoConfiguredOpenTelemetrySdk.builder()
        .addTracerProviderCustomizer(
            (sdkTracerProviderBuilder, configProperties) ->
                sdkTracerProviderBuilder.addSpanProcessor(
                    new SpanProcessor() { /* implementation omitted for brevity */ }))
        .build();
```

## SDK Logging and Error Handling

OpenTelemetry uses
[java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html)
to log information about OpenTelemetry, including errors and warnings about
misconfigurations or failures exporting data.

By default, log messages are handled by the root handler in your application. If
you have not installed a custom root handler for your application, logs of level
`INFO` or higher are sent to the console by default.

You may want to change the behavior of the logger for OpenTelemetry. For
example, you can reduce the logging level to output additional information when
debugging, increase the level for a particular class to ignore errors coming
from that class, or install a custom handler or filter to run custom code
whenever OpenTelemetry logs a particular message.

### Examples

```properties
## Turn off all OpenTelemetry logging
io.opentelemetry.level = OFF
```

```properties
## Turn off logging for just the BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor.level = OFF
```

```properties
## Log "FINE" messages for help in debugging
io.opentelemetry.level = FINE

## Sets the default ConsoleHandler's logger's level
## Note this impacts the logging outside of OpenTelemetry as well
java.util.logging.ConsoleHandler.level = FINE
```

For more fine-grained control and special case handling, custom handlers and
filters can be specified with code.

```java
// Custom filter which does not log errors that come from the export
public class IgnoreExportErrorsFilter implements Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```properties
## Registering the custom filter on the BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

[alwaysoffsampler]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/AlwaysOffSampler.java
[alwaysonsampler]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/AlwaysOnSampler.java
[httpexchange]:
  https://docs.oracle.com/javase/8/docs/jre/api/net/httpserver/spec/com/sun/net/httpserver/HttpExchange.html
[java-vers]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility
[instrumentation library]: /docs/specs/otel/glossary/#instrumentation-library
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[logs bridge API]: /docs/specs/otel/logs/bridge-api
[log data model]: /docs/specs/otel/logs/data-model
[log4j2 appender]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library
[logback appender]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library
[log appender example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender
[log4j context instrumentation]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure
[logback context instrumentation]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library
[obtaining a tracer]: /docs/specs/otel/trace/api/#get-a-tracer
[opentelemetry collector]:
  https://github.com/open-telemetry/opentelemetry-collector
[opentelemetry registry]: /ecosystem/registry/?component=exporter&language=java
[parentbased]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/ParentBasedSampler.java
[traceidratiobased]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/TraceIdRatioBasedSampler.java
