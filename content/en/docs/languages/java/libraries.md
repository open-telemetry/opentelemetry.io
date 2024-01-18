---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
cSpell:ignore: autoconfigure getenv httpclient println
---

When you develop an app, you use third-party libraries and frameworks to
accelerate your work and avoid duplicated efforts. If you instrument your app
with OpenTelemetry, you don't want to spend additional time on manually adding
traces, logs, and metrics to those libraries and frameworks.

Use libraries that come with OpenTelemetry support natively or an
[Instrumentation Library](/docs/concepts/instrumentation/libraries/) to generate
telemetry data for a library or framework.

The Java agent for automatic instrumentation includes instrumentation libraries
for many common Java frameworks. Most are turned on by default. If you need to
turn off certain instrumentation libraries, you can
[suppress them](../automatic/agent-config/#suppressing-specific-auto-instrumentation).

If you use [code-based instrumentation](../instrumentation), you can leverage
some instrumentation libraries for your dependencies standalone. To find out
which standalone instrumentation libraries are available, take a look at
[this list](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
Follow the instructions of each instrumentation library to set them up.

## Example app

The following example instruments an HTTP client application using library
instrumentation which calls an HTTP server.

You can use the dice example app as HTTP server from
[Getting Started](/docs/languages/java/getting-started/) or you can create your
own HTTP server.

### Dependencies

Set up an environment in a new directory named `java-simple-http-client`. Inside
the directory, create a file named `build.gradle.kts` with the following
content:

{{% alert title="Note" color="info" %}} The example is built using Gradle. You
might need to amend the directory structure and `pom.xml` to run using Maven.
{{% /alert %}}

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
plugins {
  id("java")
  id("application")
}

application {
  mainClass.set("otel.SampleHttpClient")
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
    implementation("io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}");
    implementation("io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}");
    implementation("io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}");
    implementation("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}");
    implementation("io.opentelemetry.instrumentation:opentelemetry-java-http-client:{{% param vers.instrumentation %}}-alpha");
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-java-http-client</artifactId>
    <version>{{% param vers.instrumentation %}}-alpha</version>
  </dependency>
</dependencies>
```

{{< /tab >}} {{< /tabpane>}}

### Setup

The following example shows how you can instrument external API calls using
[Java HTTP client library](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/java-http-client/library):

```java
// SampleHttpClient.java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import io.opentelemetry.instrumentation.httpclient.JavaHttpClientTelemetry;
import java.net.http.HttpClient;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public final class SampleHttpClient {
    //Init OpenTelemetry
    private static final OpenTelemetry openTelemetry = AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();

    //Use this HttpClient implementation for making standard http client calls.
    public HttpClient createTracedClient(OpenTelemetry openTelemetry) {
        return JavaHttpClientTelemetry.builder(openTelemetry).build().newHttpClient(createClient());
    }

    //your configuration of the Java HTTP Client goes here:
    private HttpClient createClient() {
        return HttpClient.newBuilder().build();
    }

    public static void main(String[] args) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .GET()
            .uri(URI.create(System.getenv().getOrDefault("EXTERNAL_API_ENDPOINT", "http://localhost:8080/rolldice")))
            //.setHeader("User-Agent", "Java 11 HttpClient Bot") // add request header
            .build();

        SampleHttpClient s = new SampleHttpClient();
        HttpResponse<String> response = s.createTracedClient(openTelemetry).send(request, HttpResponse.BodyHandlers.ofString());
        // print response headers
        HttpHeaders headers = response.headers();
        headers.map().forEach((k, v) -> System.out.println(k + ":" + v));
        // print status code
        System.out.println(response.statusCode());
        // print response body
        System.out.println(response.body());

    }
}
```

### Run

Set the `EXTERNAL_API_ENDPOINT` environment variable to specify the external API
endpoint. By default, it points to `http://localhost:8080/rolldice`, where
[example dice app](/docs/languages/java/getting-started/#example-application) is
running.

To check your code, run the app:

```sh
env \
OTEL_SERVICE_NAME=http-client \
OTEL_TRACES_EXPORTER=logging \
OTEL_METRICS_EXPORTER=logging \
OTEL_LOGS_EXPORTER=logging \
gradle run
```

When you run the app, the instrumentation libraries do the following:

- Start a new trace.
- Generate a span that represents the request made to the external API endpoint.
- If you use an instrumented HTTP server, as in the
  [dice app](/docs/instrumentation/java/getting-started/#example-application),
  more trace spans are generated with the same trace ID.

## Available instrumentation libraries

For a full list of instrumentation libraries, see
[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).

## Next steps

After you've set up instrumentation libraries, you might want to add
[additional instrumentation](/docs/languages/java/instrumentation) to collect
custom telemetry data.

You might also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/java/exporters) to one or more
telemetry backends.

You can also check the
[automatic instrumentation for Java](/docs/languages/java/automatic) for
existing library instrumentations.

[opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)
