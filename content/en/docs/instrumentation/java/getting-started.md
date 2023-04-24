---
title: Getting Started
description: Get telemetry from a client-server app in less than 5 minutes!
spelling: cSpell:ignore helloworld javaagent
weight: 1
---

This page will show you how to get started with OpenTelemetry in Node.js.

You will learn how you can instrument a simple java application automatically,
in such a way that traces, metrics and logs are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

* Java JDK 
* [Gradle](https://gradle.org/)

## Example Application

The following example uses a basic spring boot application.

### Dependencies

Create a folder called `java-simple` and within that folder, create a file called `build.gradle` with the following content:

```gradle
plugins {
  id 'java'
  id 'org.springframework.boot' version '3.0.5'
  id 'io.spring.dependency-management' version '1.1.0'
}


sourceSets {
        main.java.srcDirs = ['.']
}

repositories { 
  mavenCentral()
}

dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web',
                 'org.apache.logging.log4j:log4j-core:2.17.2'
}
```

### Code

In that same folder, create a file called `DiceApplication.java` and add the following code to the file:

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

Create another file called `RollController.java` and add the following code to the file:

```java
package otel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.util.Optional;


@RestController
public class RollController {
  private static final Logger logger = LogManager.getLogger(RollController.class);
  @GetMapping("/rolldice")
  public String index(@RequestParam("player") Optional<String> player) {
    int result = this.getRandomNumber(-1, 6);
    if(player.isPresent()) {
      logger.info(player.get() + " is rolling the dice: " + result);
    } else {
      logger.info("Anonymous player is rolling the dice: " + result);
    }
    return Integer.toString(result);
  }
    public int getRandomNumber(int min, int max) {
        return (int) ((Math.random() * (max - min)) + min);
    }
}
```

To test the application, build and run it:

```console
gradle assemble
java -jar ./java-simple.jar
```

## Instrumentation

Next, you'll use a [Java agent to automatically instrument](../automatic) the
application at launch time. While you can [configure the Java agent][] in
a number of ways, the steps below use environment variables.

1.  Download [opentelemetry-javaagent.jar][] from [Releases][] of the
    `opentelemetry-java-instrumentation` repo. The JAR file contains the agent
    and all automatic instrumentation packages:

    ```console
    curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
    ```

    {{% alert color="info" %}}<i class="fas fa-edit"></i> Take note of the path
    to the JAR file.{{% /alert %}}
2.  Set and export variables that specify the Java agent JAR and a [console
    exporter][], using a notation suitable for your shell/terminal environment
    &mdash; we illustrate a notation for bash-like shells:

    ```console
    $ export JAVA_OPTS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
      OTEL_TRACES_EXPORTER=logging \
      OTEL_METRICS_EXPORTER=logging \
      OTEL_LOGS_EXPORTER=logging
    ```

    {{% alert title="Important" color="warning" %}}Replace `PATH/TO` above, with
    your path to the JAR.{{% /alert %}}

3.  Run your **application** once again:

    ```console
    $ java -jar ./java-simple.jar
    ...
    ```

    Note the output from the `otel.javaagent`.

4.  From the _same_ terminal, run the **client**:

    ```console
    $ ./build/install/examples/bin/hello-world-client
    [otel.javaagent 2022-03-19 13:38:48:462 +0000] [main] INFO io.opentelemetry.javaagent.tooling.VersionLogger - opentelemetry-javaagent - version: 1.12.0
    Mar 19, 2022 1:38:50 PM io.grpc.examples.helloworld.HelloWorldClient greet
    INFO: Will try to greet world ...
    [Trace output elided -- see below for details]
    Mar 19, 2022 1:38:51 PM io.grpc.examples.helloworld.HelloWorldClient greet
    INFO: Greeting: Hello world
    ```

5.  Stop the server process. For example, for bash-like shells run:

    ```console
    $ jobs
    [1]+  Running                 ./build/install/examples/bin/hello-world-server &
    $ kill %1
    ...
    *** server shut down
    ```

At step 4, you should have seen trace output from the server and client that
looks something like this (trace output is line-wrapped for convenience):

```sh
[otel.javaagent 2022-03-19 13:38:51:310 +0000] [grpc-default-executor-0] INFO
io.opentelemetry.exporter.logging.LoggingSpanExporter -
'helloworld.Greeter/SayHello' : 150407692a813ceb4e9f49a02c8b1fd0
ee15310978e6f6d3 SERVER [tracer: io.opentelemetry.grpc-1.6:1.12.0]
AttributesMap{data={net.transport=ip_tcp, rpc.grpc.status_code=0,
rpc.service=helloworld.Greeter, thread.id=16, rpc.method=SayHello,
rpc.system=grpc, net.peer.ip=127.0.0.1, thread.name=grpc-default-executor-0,
net.peer.port=44186}, capacity=128, totalAddedValues=9}

[otel.javaagent 2022-03-19 13:38:51:368 +0000] [main] INFO
io.opentelemetry.exporter.logging.LoggingSpanExporter -
'helloworld.Greeter/SayHello' : 150407692a813ceb4e9f49a02c8b1fd0
6ed56cd008f241c5 CLIENT [tracer: io.opentelemetry.grpc-1.6:1.12.0]
AttributesMap{data={net.transport=ip_tcp, net.peer.name=localhost,
rpc.grpc.status_code=0, rpc.service=helloworld.Greeter, thread.id=1,
rpc.method=SayHello, rpc.system=grpc, thread.name=main, net.peer.port=50051},
capacity=128, totalAddedValues=9}
```

At step 5, when stopping the server, you should see an output of all the metrics
collected (metrics output is line-wrapped and shortened for convenience):

```sh
[otel.javaagent 2022-10-18 10:12:12:650 +0200] [Thread-0] INFO
io.opentelemetry.exporter.logging.LoggingMetricExporter - Received a collection
of 15 metrics for export.
[otel.javaagent 2022-10-18 10:12:12:651 +0200] [Thread-0] INFO
io.opentelemetry.exporter.logging.LoggingMetricExporter - metric:
ImmutableMetricData{resource=Resource{...},
instrumentationScopeInfo=InstrumentationScopeInfo{...},
name=rpc.server.duration, description=The duration of an inbound RPC invocation,
unit=ms, type=HISTOGRAM,
data=ImmutableHistogramData{aggregationTemporality=CUMULATIVE,
points=[ImmutableHistogramPointData{getStartEpochNanos=1666080515038517000,
getEpochNanos=1666080732649264000, getAttributes={net.host.name="localhost",
net.transport="ip_tcp", rpc.grpc.status_code=0, rpc.method="SayHello",
rpc.service="helloworld.Greeter", rpc.system="grpc"}, getSum=20.300248000000003,
getCount=12, hasMin=true, getMin=0.278541, hasMax=true, getMax=16.563833,
getBoundaries=[5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0, 750.0, 1000.0,
2500.0, 5000.0, 7500.0, 10000.0], getCounts=[11, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0], getExemplars=[ImmutableDoubleExemplarData{filteredAttributes={},
epochNanos=1666080530527597000,
spanContext=ImmutableSpanContext{traceId=f60e0940793cb1dc95bcb86e4668a548,
spanId=9737452b2e78e75f, traceFlags=01,
traceState=ArrayBasedTraceState{entries=[]}, remote=false, valid=true},
value=0.278541}, ImmutableDoubleExemplarData{filteredAttributes={},
epochNanos=1666080519431994000,
spanContext=ImmutableSpanContext{traceId=723ace62b22b2db3bc8323be279e0e55,
spanId=44159949946521e7, traceFlags=01,
traceState=ArrayBasedTraceState{entries=[]}, remote=false, valid=true},
value=16.563833}]}]}}
...
```

## What next?

For more:

- Run this example with another [exporter][] for telemetry data.
- Try [automatic instrumentation](../automatic/) on one of your own apps.
- For light-weight customized telemetry, try [annotations][].
- Learn about [manual instrumentation][] and try out more
  [examples]({{% relref examples %}}).

[annotations]: ../automatic/annotations
[configure the java agent]: ../automatic/#configuring-the-agent
[console exporter]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#logging-exporter
[exporter]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#exporters
[get the example code.]:
  https://grpc.io/docs/languages/java/quickstart/#get-the-example-code
[java quick start example]: https://grpc.io/docs/languages/java/quickstart/
[manual instrumentation]: ../manual
[opentelemetry-javaagent.jar]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[run the example:]:
  https://grpc.io/docs/languages/java/quickstart/#run-the-example
