---
title: Primeiros passos com exemplo
description: Obtenha telemetria para sua aplicação em menos de 5 minutos!
weight: 10
default_lang_commit: 0930994d5be6f01b05d0caca0550c468d2f3e829
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/getting-started"?>

Esta página mostrará como começar a utilizar o OpenTelemetry em Java.

Você aprenderá como instrumentalizar automaticamente uma aplicação Java simples,
de modo que [rastros][traces], [métricas][metrics], e [logs][] sejam emitidos
para o console.

## Pré-requisitos {#prerequisites}

Certifique-se de ter instalado localmente:

- Java JDK 17+ devido ao uso do Spring Boot 3; [Java 8+ para outros
  casos][java-vers]
- [Gradle](https://gradle.org/)

## Exemplo de Aplicação {#example-application}

O exemplo a seguir utiliza uma aplicação básica [Spring Boot][]. Você pode usar
outros frameworks web, como Apache Wicket ou Play. Para uma lista completa das
bibliotecas e frameworks suportados, consulte o
[registro](/ecosystem/registry/?component=instrumentation&language=java).

Para exemplos mais elaborados, veja [exemplos](../examples/).

### Dependências {#dependencies}

Para começar, configure um ambiente em um novo diretório chamado `java-simple`.
Dentro dele, crie um arquivo chamado `build.gradle.kts` e adicione o seguinte
conteúdo ao arquivo:

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

### Criando e iniciando um servidor HTTP {#create-and-launch-an-http-server}

No mesmo diretório, crie um arquivo chamado `DiceApplication.java` e adicione o
seguinte código ao arquivo:

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

Crie outro arquivo chamado `RollController.java` e adicione o seguinte código ao
arquivo:

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

Compile e execute a aplicação com o seguinte comando, e então abra
<http://localhost:8080/rolldice> no seu navegador para ter certeza que está
funcionando.

```sh
gradle assemble
java -jar ./build/libs/java-simple.jar
```

## Instrumentação {#instrumentation}

Em seguida, você usará um [agente Java](/docs/zero-code/java/agent/) para
instrumentalizar automaticamente a aplicação durante sua inicialização. Embora
seja possível [configurar o agente Java][configure the java agent] de várias
maneiras, os passos abaixo utilizam variáveis de ambiente.

1. Faça o download do [opentelemetry-javaagent.jar][] na página de [releases][]
   do repositório `opentelemetry-java-instrumentation`. O arquivo JAR contém o
   agente e todos os pacotes de instrumentação automática:

   ```console
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

   {{% alert color="info" %}}<i class="fas fa-edit"></i> Take note of the path
   to the JAR file.{{% /alert %}}

2. Configure e exporte as variáveis que especificam o JAR do agente Java e um
   [exportador de console][console exporter], utilizando a notação adequada para
   seu ambiente &mdash; aqui demonstramos a notação para shells do tipo bash:

   ```sh
   export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
     OTEL_TRACES_EXPORTER=logging \
     OTEL_METRICS_EXPORTER=logging \
     OTEL_LOGS_EXPORTER=logging \
     OTEL_METRIC_EXPORT_INTERVAL=15000
   ```

   {{% alert title="Important" color="warning" %}}
   - Replace `PATH/TO` above, with your path to the JAR.
   - Set `OTEL_METRIC_EXPORT_INTERVAL` to a value well below the default, as we
     illustrate above, **only during testing** to help you more quickly ensure
     that metrics are properly generated.

   {{% /alert %}}

3. Execute a **aplicação** mais uma vez:

   ```console
   $ java -jar ./build/libs/java-simple.jar
   ...
   ```

   Observe a saída do `otel.javaagent`.

4. De _outro_ terminal, envie uma requisição utilizando `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

5. Pare o processo do servidor.

No passo 4, você deve ter visto o rastro e log na saída do console do servidor e
cliente que se parece com algo assim (a saída do rastro está quebrada em linhas
para melhor visualização):

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

No passo 5, ao parar o servidor, você verá uma saída com todas as métricas
coletadas (a saída das métricas está quebrada em linhas e resumida para melhor
visualização):

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

## O que vem depois? {#what-next}

Para mais:

- Execute este exemplo com outro [exportador][exporter] para dados de
  telemetria.
- Experimente a [instrumentação sem código](/docs/zero-code/java/agent/) em uma
  de suas próprias aplicações.
- Para telemetria levemente personalizada, experimente [anotações][annotations].
- Aprenda sobre [instrumentação manual][manual instrumentation] e experimente
  mais [exemplos](../examples/).
- Dê uma olhada no [OpenTelemetry Demo](/docs/demo/), que inclui o
  [Serviço de Anúncios](/docs/demo/services/ad/) baseado em Java e o
  [Serviço de Detecção de Fraude](/docs/demo/services/fraud-detection/) baseado
  em Kotlin

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[annotations]: /docs/zero-code/java/agent/annotations/
[configure the java agent]: /docs/zero-code/java/agent/configuration/
[console exporter]: /docs/languages/java/configuration/#properties-exporters
[exporter]: /docs/languages/java/configuration/#properties-exporters
[java-vers]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility
[manual instrumentation]: ../instrumentation
[opentelemetry-javaagent.jar]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[Spring Boot]: https://spring.io/guides/gs/spring-boot/
