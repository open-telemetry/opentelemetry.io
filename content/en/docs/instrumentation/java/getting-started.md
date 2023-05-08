---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
spelling: cSpell:ignore helloworld javaagent springframework autoreconfigure
spelling: cSpell:ignore rolldice aarch Nanos darwin autoconfigure webmvc kotlin
weight: 1
---

This page will show you how to get started with OpenTelemetry in Java.

You will learn how you can instrument a simple java application automatically,
in such a way that [traces][], [metrics][] and [logs][] are emitted to the
console.

## Prerequisites

Ensure that you have the following installed locally:

- Java JDK
- [Gradle](https://gradle.org/)

## Example Application

The following example uses a basic
[Spring Boot](https://spring.io/guides/gs/spring-boot/) application. If you are
not using Spring Boot, that's ok — you can use OpenTelemetry Java with other web
frameworks as well, such as Apache Wicket and Play. For a complete list of
libraries for supported frameworks, see the
[regsitry](/ecosystem/registry/?component=instrumentation&language=java).

For more elaborate examples, see
[examples](/docs/instrumentation/java/examples/).

### Dependencies

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

In that same folder, create a file called `DiceApplication.java` and add the
following code to the file:

```java
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

Create another file called `RollController.java` and add the following code to
the file:

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
      logger.info("{} is rolling the dice: {}", player.get(), result);
    } else {
      logger.info("Anonymous player is rolling the dice: {}", result);
    }
    return Integer.toString(result);
  }

  public int getRandomNumber(int min, int max) {
    return ThreadLocalRandom.current().nextInt(min, max + 1);
  }
}
```

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
gradle assemble
java -jar ./build/libs/java-simple.jar
```

## Instrumentation

Next, you'll use a [Java agent to automatically instrument](../automatic) the
application at launch time. While you can [configure the Java agent][] in a
number of ways, the steps below use environment variables.

1. Download [opentelemetry-javaagent.jar][] from [Releases][] of the
   `opentelemetry-java-instrumentation` repo. The JAR file contains the agent
   and all automatic instrumentation packages:

   ```console
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

   {{% alert color="info" %}}<i class="fas fa-edit"></i> Take note of the path
   to the JAR file.{{% /alert %}}

2. Set and export variables that specify the Java agent JAR and a [console
   exporter][], using a notation suitable for your shell/terminal environment
   &mdash; we illustrate a notation for bash-like shells:

   ```console
   $ export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
     OTEL_TRACES_EXPORTER=logging \
     OTEL_METRICS_EXPORTER=logging \
     OTEL_LOGS_EXPORTER=logging
   ```

   {{% alert title="Important" color="warning" %}}Replace `PATH/TO` above, with
   your path to the JAR.{{% /alert %}}

3. Run your **application** once again:

   ```console
   $ java -jar ./build/libs/java-simple.jar
   ...
   ```

   Note the output from the `otel.javaagent`.

4. From _another_ terminal, send a request using `curl`:

   ```console
   $ curl localhost:8080/rolldice
   ```

5. Stop the server process.

At step 4, you should have seen trace & log output from the server and client
that looks something like this (trace output is line-wrapped for convenience):

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

At step 5, when stopping the server, you should see an output of all the metrics
collected (metrics output is line-wrapped and shortened for convenience):

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

## What next?

For more:

- Run this example with another [exporter][] for telemetry data.
- Try [automatic instrumentation](../automatic/) on one of your own apps.
- For light-weight customized telemetry, try [annotations][].
- Learn about [manual instrumentation][] and try out more
  [examples](/docs/instrumentation/java/examples/).

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[annotations]: ../automatic/annotations/
[configure the java agent]: ../automatic/#configuring-the-agent
[console exporter]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#logging-exporter
[exporter]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#exporters
[manual instrumentation]: ../manual
[opentelemetry-javaagent.jar]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
