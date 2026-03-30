---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
description:
  Extensions add capabilities to the agent without having to create a separate
  distribution.
weight: 300
cSpell:ignore: Customizer Dotel
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/extensions-minimal"?>

## Introduction

Extensions add new features and capabilities to the OpenTelemetry Java agent
without requiring you to create a separate distribution (a custom version of the
entire agent). Think of extensions as plugins that customize how the agent
behaves.

Extensions allow you to:

- Add new instrumentations for libraries not currently supported
- Customize existing instrumentation behavior
- Implement custom SDK components (samplers, exporters, propagators)
- Modify telemetry data collection and processing

## Quick Start

Here's a minimal extension that adds a custom span processor to get you started:

Create a Gradle project (build.gradle.kts):

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
    // Use BOM to manage OpenTelemetry dependency versions
    compileOnly(platform("io.opentelemetry:opentelemetry-bom:1.57.0"))

    // OpenTelemetry SDK autoconfiguration SPI (provided by agent)
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")

    // OpenTelemetry SDK (needed for SpanProcessor and trace classes)
    compileOnly("io.opentelemetry:opentelemetry-sdk")

    // Annotation processor for automatic SPI registration
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")

    // Add any external dependencies with 'implementation' scope
    // implementation("org.apache.commons:commons-lang3:3.19.0")
}

tasks.assemble {
    dependsOn(tasks.shadowJar)
}
```
<!-- prettier-ignore-end -->

Create a `SpanProcessor` implementation:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MySpanProcessor.java" from="public"?>
```java
public class MySpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // Add custom attributes when span starts
    span.setAttribute("custom.processor", "active");
  }

  @Override
  public boolean isStartRequired() {
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Process span when it ends (optional)
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

Create an extension class that uses the `AutoConfigurationCustomizerProvider`
SPI:

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

Build the extension:

```bash
./gradlew shadowJar
```

Use the extension:

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=build/libs/my-extension-all.jar \
     -jar myapp.jar
```

## Using Extensions

There are two ways to use extensions with the Java agent:

- **Load as a separate JAR file** - Flexible for development and testing
- **Embed in the agent** - Single JAR deployment for production

| Approach            | Pros                                                 | Cons                                  | Best For                 |
| ------------------- | ---------------------------------------------------- | ------------------------------------- | ------------------------ |
| **Runtime Loading** | Easy to swap extensions, no rebuild needed           | Extra command-line flag required      | Development, testing     |
| **Embedding**       | Single JAR, simpler deployment, can't forget to load | Requires rebuild to change extensions | Production, distribution |

### Loading Extensions at Runtime

Extensions can be loaded at runtime using the `otel.javaagent.extensions` system
property or `OTEL_JAVAAGENT_EXTENSIONS` environment variable. This configuration
option accepts comma-separated paths to extension JAR files or directories
containing extension JARs.

#### Single Extension

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/my-extension.jar \
     -jar myapp.jar
```

#### Multiple Extensions

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/path/to/extension2.jar \
     -jar myapp.jar
```

#### Extension Directory

You can specify a directory containing multiple extension JARs, and all JARs in
that directory will be loaded:

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extensions-directory \
     -jar myapp.jar
```

#### Mixed Paths

You can combine individual JAR files and directories:

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/opt/extensions,/tmp/custom.jar \
     -jar myapp.jar
```

#### How Extension Loading Works

When you load extensions at runtime, the agent:

1. Makes OpenTelemetry APIs available to your extension without needing to
   package them in your extension JAR
2. Discovers your extension's components using Java's
   [ServiceLoader](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ServiceLoader.html)
   mechanism (via `@AutoService` annotations in your code, for example)

### Embedding Extensions in the Agent

Another deployment option is to create a single JAR file that contains both the
OpenTelemetry Java agent and your extension(s). This approach simplifies
deployment (just one JAR file to manage) and eliminates the need for the
`-Dotel.javaagent.extensions` command line option, which makes it harder to
accidentally forget to load your extension.

#### How It Works

The agent automatically looks for extensions in a special `extensions/`
directory inside the agent JAR file, so we can use a Gradle build task to:

1. Download the OpenTelemetry Java agent JAR
2. Extract its contents
3. Add your extension JAR(s) into the `extensions/` directory
4. Repackage everything into a single JAR

#### The `extendedAgent` Gradle Task

Add the following to your extension project's `build.gradle.kts` file:

```kotlin
plugins {
    id("java")

    // Shadow plugin: Combines all your extension's code and dependencies into one JAR
    // This is required because extensions must be packaged as a single JAR file
    id("com.gradleup.shadow") version "9.2.2"
}

group = "com.example"
version = "1.0"

configurations {
    // Create a temporary configuration to download the agent JAR
    // Think of this as a "download slot" that's separate from your extension's dependencies
    create("otel")
}

dependencies {
    // Download the official OpenTelemetry Java agent into the 'otel' configuration
    "otel"("io.opentelemetry.javaagent:opentelemetry-javaagent:{{% param vers.instrumentation %}}")

    /*
      Interfaces and SPIs that we implement. We use `compileOnly` dependency because during
      runtime all necessary classes are provided by javaagent itself.
     */
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}")

    // Required for custom instrumentation
    compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
    compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:{{% param vers.instrumentation %}}-alpha")
    compileOnly("net.bytebuddy:byte-buddy:1.15.10")

    // Provides @AutoService annotation that makes registration of our SPI implementations much easier
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")
}

// Task: Create an extended agent JAR (agent + your extension)
val extendedAgent by tasks.registering(Jar::class) {
    dependsOn(configurations["otel"])
    archiveFileName.set("opentelemetry-javaagent.jar")

    // Step 1: Unpack the official agent JAR
    from(zipTree(configurations["otel"].singleFile))

    // Step 2: Add your extension JAR to the "extensions/" directory
    from(tasks.shadowJar.get().archiveFile) {
        into("extensions")
    }

    // Step 3: Preserve the agent's startup configuration (MANIFEST.MF)
    doFirst {
        manifest.from(
            zipTree(configurations["otel"].singleFile).matching {
                include("META-INF/MANIFEST.MF")
            }.singleFile
        )
    }
}

tasks {
    // Make sure the shadow JAR is built during the normal build process
    assemble {
        dependsOn(shadowJar)
    }
}
```

For a complete example, reference the gradle file from the
[extension example](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/build.gradle.kts).

#### Building and Using the Extended Agent

Once you've added the `extendedAgent` task to your `build.gradle.kts`:

```bash
# 1. Build your extension and create the extended agent
./gradlew extendedAgent

# 2. Find the output in build/libs/
ls build/libs/opentelemetry-javaagent.jar

# 3. Use it with your application (no -Dotel.javaagent.extensions needed)
java -javaagent:build/libs/opentelemetry-javaagent.jar -jar myapp.jar
```

#### Embedding Multiple Extensions

To embed multiple extensions, modify the `extendedAgent` task to include
multiple extension JARs:

```kotlin
val extendedAgent by tasks.registering(Jar::class) {
  dependsOn(configurations["otel"])
  archiveFileName.set("opentelemetry-javaagent.jar")

  from(zipTree(configurations["otel"].singleFile))

  // Add multiple extensions
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

## Writing Extensions

Creating an extension involves implementing one or more Service Provider
Interface (SPI) classes and packaging them as a JAR file.

### Project Setup and Dependencies

Extensions must carefully manage their dependencies to avoid conflicts with the
agent and application.

#### Dependencies Provided by Agent (use `compileOnly`)

These APIs are available at runtime from the agent:

```kotlin
compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator")
compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api")
```

#### Dependencies from Application Classpath (use `compileOnly`)

When creating instrumentation, you need to reference classes from the target
application. These should also be `compileOnly`:

```kotlin
// Only accessible in Advice classes during instrumentation
compileOnly("javax.servlet:javax.servlet-api:3.0.1")
```

#### External Runtime Dependencies (use `implementation`)

Any external libraries your extension needs at runtime must use `implementation`
scope and will be packaged into the shadow JAR:

```kotlin
implementation("org.apache.commons:commons-lang3:3.19.0")
implementation("com.google.guava:guava:33.0.0-jre")
```

> [!IMPORTANT]
>
> Extensions cannot load dependencies from separate JAR files. All dependencies
> must be merged into a single shadow JAR.

### Extension Points Overview

OpenTelemetry Java agent provides multiple extension points through SPI
interfaces, here are the most commonly used ones:

| Extension Point                       | Package                                                       | Purpose                                |
| ------------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| `AutoConfigurationCustomizerProvider` | `io.opentelemetry.sdk.autoconfigure.spi`                      | Main entry point for SDK customization |
| `ConfigurablePropagatorProvider`      | `io.opentelemetry.sdk.autoconfigure.spi`                      | Register custom propagators            |
| `ConfigurableSamplerProvider`         | `io.opentelemetry.sdk.autoconfigure.spi.traces`               | Register custom samplers               |
| `ResourceProvider`                    | `io.opentelemetry.sdk.autoconfigure.spi`                      | Add custom resource attributes         |
| `InstrumenterCustomizerProvider`      | `io.opentelemetry.instrumentation.api.incubator.instrumenter` | Customize existing instrumentations    |
| `InstrumentationModule`               | `io.opentelemetry.javaagent.extension.instrumentation`        | Create new instrumentations            |

### Configuration in Extensions

Extensions can read and provide configuration to customize their behavior.

#### Accessing Configuration in Extensions

Many SPI methods receive a `ConfigProperties` parameter that allows you to read
configuration:

```java
@Override
public Sampler createSampler(ConfigProperties config) {
  // Read configuration with defaults
  String endpoint = config.getString("otel.exporter.otlp.endpoint", "http://localhost:4317");
  int threshold = config.getInt("otel.instrumentation.myext.threshold", 100);
  boolean enabled = config.getBoolean("otel.instrumentation.myext.enabled", true);
  return new MySampler(endpoint, threshold, enabled);
}
```

#### Providing Default Configuration

Extensions can provide default configuration values that will be used if not
overridden:

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

#### Configuration Naming Conventions

Follow these conventions for configuration parameter names:

Standard OpenTelemetry properties use an `otel.*` prefix

- `otel.service.name`
- `otel.traces.sampler`
- `otel.exporter.otlp.endpoint`

Instrumentation-specific properties use `otel.instrumentation.<name>.*`

- `otel.instrumentation.cassandra.enabled`
- `otel.instrumentation.jdbc.statement-sanitizer.enabled`

Extension-specific properties follow the same pattern

- `otel.instrumentation.myextension.enabled`
- `otel.instrumentation.myextension.threshold`
- `otel.instrumentation.myextension.custom-value`

### Using @AutoService

The `@AutoService` annotation automatically generates the required
`META-INF/services/` files for SPI registration. To use it:

Add the dependency:

```kotlin
compileOnly("com.google.auto.service:auto-service:1.1.1")
annotationProcessor("com.google.auto.service:auto-service:1.1.1")
```

And then annotate your SPI implementations like this:

```java
import com.google.auto.service.AutoService;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {
  // Implementation
}
```

This is equivalent to manually creating
`META-INF/services/io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider`
with your class name.

---

## Extension Point Reference

### AutoConfigurationCustomizerProvider

> [!NOTE] This will not work for situations where
> [declarative configuration](../declarative-configuration) is in use.

The main entry point for customizing SDK configuration. This allows you to:

- Customize the tracer provider
- Add span processors and exporters
- Provide default configuration properties
- Customize other SDK components

**Example:**

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

### InstrumenterCustomizerProvider

Customize existing instrumentations without modifying their code. This is the
recommended way to add attributes, metrics, or modify behavior of built-in
instrumentations.

**Example:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoInstrumenterCustomizerProvider.java" from="/**"?>
```java
/**
 * This example demonstrates how to use the InstrumenterCustomizerProvider SPI to customize
 * instrumentation behavior without modifying the core instrumentation code.
 *
 * <p>This customizer adds:
 *
 * <ul>
 *   <li>Custom attributes to HTTP server spans (based on instrumentation name)
 *   <li>Custom attributes to HTTP client spans (based on instrumentation type)
 *   <li>Custom metrics for HTTP operations
 *   <li>Request correlation IDs via context customization
 *   <li>Custom span name transformation
 * </ul>
 *
 * <p>The customizer will be automatically applied to instrumenters that match the specified
 * instrumentation name or type.
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
    // Simple customization for HTTP client instrumentations
    customizer.addAttributesExtractor(new DemoHttpClientAttributesExtractor());
  }

  /** Custom attributes extractor for HTTP client instrumentations. */
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

  /** Custom attributes extractor that adds demo-specific attributes. */
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

  /** Custom metrics that track request counts. */
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
          // Could add duration metrics here if needed
        }
      };
    }
  }

  /** Context customizer that adds request correlation IDs and custom context data. */
  private static class DemoContextCustomizer implements ContextCustomizer<Object> {
    private static final AtomicLong requestIdCounter = new AtomicLong(1);
    private static final ContextKey<String> REQUEST_ID_KEY = ContextKey.named("demo.request.id");

    @Override
    public Context onStart(Context context, Object request, Attributes startAttributes) {
      // Generate a unique request ID for correlation
      String requestId = "req-" + requestIdCounter.getAndIncrement();

      // Add custom context data that can be accessed throughout the request lifecycle
      context = context.with(REQUEST_ID_KEY, requestId);
      return context;
    }
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurablePropagatorProvider

Register custom propagators that can be referenced by name in the
`otel.propagators` configuration.

**Example:**

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

### ConfigurableSamplerProvider

Register custom samplers that can be referenced in the `otel.traces.sampler`
configuration.

**Example (`otel.traces.sampler=demo`):**

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

### ResourceProvider

Add custom resource attributes that will be automatically merged with other
resource providers.

**Example:**

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

## Extension examples

For more extension examples, see the
[extension project](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)
within the Java instrumentation repository.
