---
title: 通过示例入门
description: 5 分钟内为你的应用接入遥测数据！
default_lang_commit: 0930994d5be6f01b05d0caca0550c468d2f3e829
weight: 9
---

<?code-excerpt path-base="examples/java/getting-started"?>

本页面将向你展示如何在 Java 中快速开始使用 OpenTelemetry。

你将学习如何为一个简单的 Java 应用实现自动插桩，
通过这样的方式使[链路][traces]、[指标][metrics]和[日志][logs]输出到控制台。

## 前置条件 {#prerequisites}

确保你已在本地安装以下内容：

- Java JDK 17 及以上版本（因使用 Spring Boot 3）；[其他情况下需 Java 8 及以上版本][java-vers]
- [Gradle](https://gradle.org/)

## 示例应用 {#example-application}

以下示例使用一个基础的 [Spring Boot][] 应用。你也可以使用其他 Web 框架，例如 Apache Wicket 或 Play。
若需查看库和受支持框架的完整列表，请参考[注册表](/ecosystem/registry/?component=instrumentation&language=java).

若需更复杂的示例，请参见[示例集](../examples/).

### 依赖项 {#dependencies}

首先，在一个新目录 `java-simple` 中搭建环境。在该目录下，创建一个名为 `build.gradle.kts` 的文件，并填入以下内容：

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

### 创建并启动 HTTP 服务器 {#create-and-launch-an-http-server}

在同一个文件夹中，创建一个名为 `DiceApplication.java` 的文件，并向该文件中添加以下代码：

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

创建另一个名为 `RollController.java` 的文件，并向该文件中添加以下代码：

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
<!-- prettier-ignore-end -->

使用以下命令构建并运行应用程序，然后在网页浏览器中打开 <http://localhost:8080/rolldice> 以确认其正常运行。

```sh
gradle assemble
java -jar ./build/libs/java-simple.jar
```

## 插桩 {#instrumentation}

接下来，你将使用 [Java 代理](/docs/zero-code/java/agent/)在启动时对应用进行自动插桩。
虽然你可以通过多种方式[配置 Java 代理][configure the java agent]，但以下步骤将使用环境变量。

1. 从 `opentelemetry-java-instrumentation` 仓库的 [发布（页面）][Releases] 下载 [opentelemetry-javaagent.jar][]。
   该 JAR 文件包含代理程序及所有自动插桩包：

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

   {{% alert %}}

   <i class="fas fa-edit"></i> 请记录下该 JAR 文件的路径。

   {{% /alert %}}

2. 设置并导出指定 Java 代理 JAR 和 [控制台导出器][console exporter]的变量，
   使用适合你的 Shell 或终端环境的表示法 —— 我们以 Bash 这一类 Shell 的表示法为例：

   ```sh
   export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
     OTEL_TRACES_EXPORTER=logging \
     OTEL_METRICS_EXPORTER=logging \
     OTEL_LOGS_EXPORTER=logging \
     OTEL_METRIC_EXPORT_INTERVAL=15000
   ```

   {{% alert title="重要" color="warning" %}}
   - 将上面的 `PATH/TO` 替换为你实际的 JAR 文件路径。
   - 如上文所示，将 `OTEL_METRIC_EXPORT_INTERVAL` 设置为远低于默认值的值，**仅在测试期间**帮助你更快地确认指标是否已正确生成。

   {{% /alert %}}

3. 再次运行你的**应用**：

   ```console
   $ java -jar ./build/libs/java-simple.jar
   ...
   ```

   留意 `otel.javaagent` 的输出信息。

4. 从**另一个**终端中，使用 `curl` 发送请求：

   ```sh
   curl localhost:8080/rolldice
   ```

5. 停止服务器进程。

在步骤 4 中，你应该已经看到服务器和客户端的链路和日志输出，内容大致如下（为便于阅读，以下链路输出已进行换行处理）：

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

在步骤 5 中，当停止服务器时，你应该会看到已收集的所有指标的输出内容（为便于阅读，指标输出已进行换行和精简处理）：

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

## 接下来做什么？ {#what-next}

更多内容:

- 使用另一个[导出器][exporter]运行此示例以处理遥测数据。
- 在你自己的某个应用上尝试[零代码插桩](/docs/zero-code/java/agent/)。
- 对于轻量级的自定义遥测数据，可尝试使用[注解][annotations]。
- 学习[手动插桩][manual instrumentation]相关知识，并尝试更多[示例](../examples/)。
- 查看 [OpenTelemetry Demo](/docs/demo/)，
  其中包含基于 Java 的[广告服务](/docs/demo/services/ad/)
  和基于 Kotlin 的 [欺诈检测服务](/docs/demo/services/fraud-detection/)。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[annotations]: /docs/zero-code/java/agent/annotations/
[configure the java agent]: /docs/zero-code/java/agent/configuration/
[console exporter]: /docs/languages/java/configuration/#properties-exporters
[exporter]: /docs/languages/java/configuration/#properties-exporters
[java-vers]: https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility
[manual instrumentation]: ../instrumentation
[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[Spring Boot]: https://spring.io/guides/gs/spring-boot/
