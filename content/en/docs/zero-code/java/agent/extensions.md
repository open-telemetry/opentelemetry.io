---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
weight: 300
cSpell:ignore: Customizer Dotel instrumenters myextension javax
---

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

1. **Load as a separate jar file** - Flexible for development and testing
2. **Embed in the agent** - Single JAR deployment for production

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

1. Makes OpenTelemetry APIs available to your extension (without needing to
   package them in your extension JAR)
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
[extension example](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/build.gradle).

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

{{% alert title="Important" %}} Extensions cannot load dependencies from
separate JAR files. All dependencies must be merged into a single shadow JAR.
{{% /alert %}}

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

{{% alert title="Note" %}} This will not work for situations where
[declarative configuration](../declarative-configuration) is in use.
{{% /alert %}}

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

## Writing Custom Instrumentation

Custom instrumentation allows you to inject bytecode into specific methods to
add observability to libraries not currently supported by the agent, or to
augment existing instrumentation.

### When to Use Custom Instrumentation

Use custom instrumentation when you need to:

- Add tracing or metrics to a library or framework not supported by the agent
- Run your code before or after specific methods execute
- Modify the behavior of existing instrumentation using the `order()` method

For simpler use cases (modifying span attributes, custom samplers, etc.), use
SDK customizations (`SpanProcessor`, `Sampler`) as shown earlier in this guide.

### Components of Custom Instrumentation

Custom instrumentation is usually comprised of the following components:

1. **InstrumentationModule** - Defines what to instrument and when
2. **TypeInstrumentation** - Specifies which classes and methods to target
3. **Advice** - Contains the code to inject (runs before/after target methods)
4. **Instrumenter** - Manages span creation, context propagation, and attributes

### Required Dependencies

Custom instrumentation requires **all** the dependencies for writing extensions,
plus additional dependencies for bytecode manipulation.

If you haven't already reviewed the
[Project Setup and Dependencies](#project-setup-and-dependencies) section, start
there to understand dependency scopes (`compileOnly` vs `implementation`).

For custom instrumentation specifically, ensure your `build.gradle.kts`
includes:

```kotlin
plugins {
  id("java")
  id("com.gradleup.shadow") version "9.2.2"

  // Muzzle plugins - required for all custom instrumentation
  id("io.opentelemetry.instrumentation.muzzle-generation")
  id("io.opentelemetry.instrumentation.muzzle-check")
}

dependencies {
  // Use BOM to manage versions (recommended)
  compileOnly(platform("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}"))

  // Core extension dependencies (provided by agent at runtime)
  compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")
  compileOnly("io.opentelemetry:opentelemetry-sdk")
  compileOnly("io.opentelemetry:opentelemetry-api")

  // Additional dependencies for custom instrumentation
  compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
  compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:{{% param vers.instrumentation %}}-alpha")
  compileOnly("net.bytebuddy:byte-buddy:1.15.10")

  // Auto-service for @AutoService annotation
  compileOnly("com.google.auto.service:auto-service:1.1.1")
  annotationProcessor("com.google.auto.service:auto-service:1.1.1")

  // Target library you're instrumenting (example)
  compileOnly("javax.servlet:javax.servlet-api:3.0.1")
}

// Muzzle configuration - specify compatible library versions
// See "Understanding Muzzle" section below for detailed explanation
muzzle {
  pass {
    group.set("javax.servlet")
    module.set("javax.servlet-api")
    versions.set("[3.0,)")
    assertInverse.set(true)
  }
}
```

### The Instrumenter API

The OpenTelemetry Java Instrumentation project provides an `Instrumenter` API
that simplifies creating custom instrumentation. The `Instrumenter` encapsulates
the logic for:

- Creating and managing spans
- Extracting and applying span attributes
- Propagating context (for distributed tracing)
- Recording operation metrics
- Handling span status and error conditions

#### Creating Multiple Instrumenters

A single instrumentation module may create multiple `Instrumenter` instances
when different operations require different telemetry handling. Common patterns
include:

- **Different operations**: For example, JDBC creates separate instrumenters for
  statement execution and transaction management
- **Different messaging patterns**: For example, many messaging instrumentations
  use separate instrumenters for producing messages, receiving messages, and
  processing messages
- **Different span kinds**: Use `buildClientInstrumenter()`,
  `buildServerInstrumenter()`, `buildProducerInstrumenter()`, or
  `buildConsumerInstrumenter()` to create instrumenters that generate CLIENT,
  SERVER, PRODUCER, or CONSUMER spans respectively

### Custom Instrumentation Basic Structure

#### Create an InstrumentationModule

An `InstrumentationModule` groups related `TypeInstrumentation` implementations
together. It must be registered using `@AutoService`:

```java
@AutoService(InstrumentationModule.class)
public class MyCustomInstrumentationModule extends InstrumentationModule {

  public MyCustomInstrumentationModule() {
    super("my-custom-library");
  }

  @Override
  public List<TypeInstrumentation> typeInstrumentations() {
    return Collections.singletonList(new MyTypeInstrumentation());
  }
}
```

#### Create a TypeInstrumentation

A `TypeInstrumentation` defines which classes to instrument and what
transformations to apply:

```java
public class MyTypeInstrumentation implements TypeInstrumentation {

  @Override
  public ElementMatcher<TypeDescription> typeMatcher() {
    return named("com.example.MyClass");
  }

  @Override
  public void transform(TypeTransformer transformer) {
    transformer.applyAdviceToMethod(
      named("myMethod")
        .and(isPublic())
        .and(takesArguments(1)),
      this.getClass().getName() + "$MyMethodAdvice");
  }
}
```

#### Create an Instrumenter

Create a singleton `Instrumenter` instance. The `Instrumenter` is parameterized
with `REQUEST` and `RESPONSE` types.

- `REQUEST` - Represents the operation input (e.g., HTTP request, database
  query)
- `RESPONSE` - Represents the operation output (e.g., HTTP response, query
  result). Use `Void` when there is no meaningful response object to capture

```java
public final class MySingletons {

  private static final Instrumenter<MyRequest, MyResponse> INSTRUMENTER;

  static {
    INSTRUMENTER = Instrumenter.<MyRequest, MyResponse>builder(
        GlobalOpenTelemetry.get(),
        "io.opentelemetry.my-custom-library",
        request -> request.getOperationName())
      .addAttributesExtractor(new MyAttributesExtractor())
      .buildInstrumenter(); // Creates INTERNAL spans
  }

  public static Instrumenter<MyRequest, MyResponse> instrumenter() {
    return INSTRUMENTER;
  }

  private MySingletons() {}
}
```

### Examples

#### Creating Client Spans

Client spans represent outbound requests to external services. They inject
context into outgoing requests for distributed tracing.

##### Create a TextMapSetter

A `TextMapSetter` defines how to inject context into your request object:

```java
enum MyRequestSetter implements TextMapSetter<MyRequest> {
  INSTANCE;

  @Override
  public void set(@Nullable MyRequest carrier, String key, String value) {
    if (carrier != null) {
      carrier.setHeader(key, value);
    }
  }
}
```

##### Build a Client Instrumenter

Use `buildClientInstrumenter()` to create an instrumenter that creates CLIENT
spans and injects context:

```java
INSTRUMENTER = Instrumenter.<MyRequest, MyResponse>builder(
    GlobalOpenTelemetry.get(),
    "io.opentelemetry.my-custom-library",
    request -> request.getOperationName())
  .addAttributesExtractor(new MyAttributesExtractor())
  .buildClientInstrumenter(MyRequestSetter.INSTANCE);
```

##### Use in Client Advice

In your advice class, the instrumenter automatically injects context when you
call `start()`:

```java
@Advice.OnMethodEnter(suppress = Throwable.class)
public static void onEnter(
    @Advice.Argument(0) MyRequest request,
    @Advice.Local("otelContext") Context context,
    @Advice.Local("otelScope") Scope scope) {

  Context parentContext = Java8BytecodeBridge.currentContext();

  if (!instrumenter().shouldStart(parentContext, request)) {
    return;
  }

  context = instrumenter().start(parentContext, request);
  scope = context.makeCurrent();
  // Context is now injected into the request automatically
}

@Advice.OnMethodExit(suppress = Throwable.class, onThrowable = Throwable.class)
public static void onExit(
    @Advice.Argument(0) MyRequest request,
    @Advice.Return MyResponse response,
    @Advice.Thrown Throwable exception,
    @Advice.Local("otelContext") Context context,
    @Advice.Local("otelScope") Scope scope) {

  if (scope == null) {
    return;
  }

  scope.close();
  instrumenter().end(context, request, response, exception);
}
```

#### Creating Server Spans

Server spans represent inbound requests. They extract context from incoming
requests to continue distributed traces.

##### Create a TextMapGetter

A `TextMapGetter` defines how to extract context from your request object:

```java
enum MyRequestGetter implements TextMapGetter<MyRequest> {
  INSTANCE;

  @Override
  public Iterable<String> keys(@Nullable MyRequest carrier) {
    if (carrier == null) {
      return Collections.emptyList();
    }
    return carrier.getHeaderNames();
  }

  @Override
  @Nullable
  public String get(@Nullable MyRequest carrier, String key) {
    if (carrier == null) {
      return null;
    }
    return carrier.getHeader(key);
  }
}
```

##### Build a Server Instrumenter

Use `buildServerInstrumenter()` to create an instrumenter that creates SERVER
spans and extracts context:

```java
INSTRUMENTER = Instrumenter.<MyRequest, MyResponse>builder(
    GlobalOpenTelemetry.get(),
    "io.opentelemetry.my-custom-library",
    request -> request.getPath())
  .addAttributesExtractor(new MyAttributesExtractor())
  .buildServerInstrumenter(MyRequestGetter.INSTANCE);
```

##### Use in Server Advice

The instrumenter automatically extracts context when you call `start()`:

```java
@Advice.OnMethodEnter(suppress = Throwable.class)
public static void onEnter(
    @Advice.Argument(0) MyRequest request,
    @Advice.Local("otelContext") Context context,
    @Advice.Local("otelScope") Scope scope) {

  Context parentContext = Java8BytecodeBridge.currentContext();

  if (!instrumenter().shouldStart(parentContext, request)) {
    return;
  }

  // Context is extracted from request automatically
  context = instrumenter().start(parentContext, request);
  scope = context.makeCurrent();
}
```

### Customizing Instrumentation

#### Adding Attributes

Create an `AttributesExtractor` to add custom attributes to spans:

```java
class MyAttributesExtractor implements AttributesExtractor<MyRequest, MyResponse> {

  private static final AttributeKey<String> CUSTOM_ATTR =
    stringKey("my.custom.attribute");

  @Override
  public void onStart(AttributesBuilder attributes, MyRequest request) {
    set(attributes, CUSTOM_ATTR, request.getCustomValue());
  }

  @Override
  public void onEnd(
      AttributesBuilder attributes,
      MyRequest request,
      @Nullable MyResponse response,
      @Nullable Throwable error) {
    if (response != null) {
      set(attributes, stringKey("my.response.code"),
        String.valueOf(response.getStatusCode()));
    }
  }
}
```

#### Customizing Span Status

Create a `SpanStatusExtractor` to customize span status:

```java
class MySpanStatusExtractor implements SpanStatusExtractor<MyRequest, MyResponse> {

  @Override
  public StatusCode extract(
      MyRequest request,
      @Nullable MyResponse response,
      @Nullable Throwable error) {
    if (error != null) {
      return StatusCode.ERROR;
    }
    if (response != null && response.isSuccess()) {
      return StatusCode.OK;
    }
    return StatusCode.UNSET;
  }
}
```

Then add it to your instrumenter builder:

```java
.setSpanStatusExtractor(new MySpanStatusExtractor())
```

### Accessing Spans and Context in Advice Code

The recommended way to access the current span or context is via
`Context.current()` and `Span.current()`. The only exception is instrumentation
advice code that must remain compatible with pre–Java 8 class files.

Advice code is inlined directly into the instrumented method, and calling
`Context.current()`, which is a static interface method, can cause bytecode
verification errors when instrumenting classes compiled for Java versions
earlier than 8.

In those cases, use `Java8BytecodeBridge`, which provides equivalent static
class methods that are safe to use across all class file versions.

```java
...
import io.opentelemetry.javaagent.bootstrap.Java8BytecodeBridge;

public static class MyAdvice {

  @Advice.OnMethodEnter(suppress = Throwable.class)
  public static void onEnter(@Advice.Argument(0) Object request) {
    Span span = Java8BytecodeBridge.currentSpan();

    // Get trace context
    String traceId = span.getSpanContext().getTraceId();
    String spanId = span.getSpanContext().getSpanId();

    // Add attributes
    span.setAttribute("custom.attribute", "value");

    // Add events
    span.addEvent("custom.event");
  }
}
```

### Understanding Muzzle

Muzzle is a safety feature that prevents applying instrumentation when there's a
mismatch between the instrumentation code and the instrumented application code.
It ensures API compatibility by verifying that the classes, methods, and fields
referenced by your instrumentation advice actually exist on the application's
classpath.

#### Why Muzzle is Important

When writing custom instrumentation, your advice code references classes and
methods from the target library (e.g., `javax.servlet.ServletResponse`). If the
application uses a different version of that library where those symbols don't
exist or have changed, applying the instrumentation could cause runtime errors.
Muzzle prevents this by checking compatibility before applying instrumentation.

#### How Muzzle Works

Muzzle operates in two phases:

1. At compile-time, it collects all references to third-party library symbols
   (classes, methods, fields) used by your instrumentation advice and helper
   classes.

2. At runtime, it compares the collected references against the actual symbols
   available on the application's classpath before applying instrumentation. If
   any mismatch is detected, the instrumentation is skipped entirely.

#### Configuring Muzzle in Your Extension

Muzzle is required for all custom instrumentation modules. The muzzle plugins
(included in the Required Dependencies section above) automatically collect
references at compile-time. To specify which library versions your
instrumentation supports, configure the `muzzle` block in your
`build.gradle.kts`:

The `pass` directive specifies library versions where muzzle should pass (i.e.,
the instrumentation is compatible). The `assertInverse.set(true)` option ensures
that all other versions will fail the muzzle check, preventing accidental
instrumentation of incompatible versions.

#### Example Configuration

Here's an example showing muzzle version configuration for servlet
instrumentation:

```kotlin
muzzle {
  // These versions are compatible with our instrumentation
  pass {
    group.set("javax.servlet")
    module.set("javax.servlet-api")
    versions.set("[3.0,)")
    assertInverse.set(true) // All other versions should fail
  }

  // Support for older servlet API versions
  pass {
    group.set("javax.servlet")
    module.set("servlet-api")
    versions.set("[2.2, 3.0)")
    assertInverse.set(true)
  }
}
```

#### What Happens When Muzzle Fails

If muzzle detects a mismatch at runtime:

- The instrumentation is **not applied** (it's skipped entirely)
- A log message is emitted indicating why the instrumentation was skipped
- Your application continues running normally without the instrumentation

#### Disabling Muzzle

In rare cases, you may need to disable muzzle checks for specific methods. You
can use the `@NoMuzzle` annotation, but this should be avoided unless absolutely
necessary:

```java
import io.opentelemetry.javaagent.tooling.muzzle.NoMuzzle;

public static class MyAdvice {
  @NoMuzzle
  @Advice.OnMethodEnter(suppress = Throwable.class)
  public static void onEnter() {
    // Muzzle checks are skipped for this method
  }
}
```

#### Best Practices

- Always configure muzzle checks for your instrumentation modules
- Use `assertInverse.set(true)` to ensure incompatible versions are explicitly
  rejected
- Avoid using `@NoMuzzle` unless you have a specific, well-justified reason

### Specifying Helper Classes

Helper classes are utility classes used by your instrumentation advice that need
to be available in the application's classloader.

When using the `muzzle-generation` Gradle plugin, helper classes are
automatically detected by scanning the class graph starting from your advice
classes. Classes in instrumentation packages (typically packages containing
`instrumentation` in their name) are automatically treated as helper classes and
injected into the application classloader.

#### When Manual Specification is Required

You need to manually specify helper classes in these scenarios:

1. **Not using the muzzle-generation plugin**: If you're not using the
   `muzzle-generation` plugin, helper classes won't be automatically detected.

2. **Using ASM instead of ByteBuddy**: If your instrumentation uses ASM for
   bytecode manipulation (rather than ByteBuddy), muzzle can't automatically
   detect helper classes.

3. **Helper classes in non-standard packages**: If your helper classes are in
   packages that don't match the default helper class detection patterns.

4. **Classes referenced via reflection or SPI**: If helper classes are loaded
   dynamically or through service providers that muzzle can't statically
   analyze.

**Using `isHelperClass()` Method**

Override `isHelperClass()` to mark entire packages or specific classes as helper
classes. This tells muzzle to scan these classes for references and
automatically inject them:

```java
@Override
public boolean isHelperClass(String className) {
  // Mark all classes in a specific package as helper classes
  return className.startsWith("com.example.instrumentation.helpers.");

  // Or mark specific classes
  // return "com.example.MyHelperClass".equals(className);
}
```

**Using `getAdditionalHelperClassNames()` Method**

Override `getAdditionalHelperClassNames()` to explicitly list helper classes
that weren't automatically detected. This is useful when:

- Muzzle can't automatically detect the classes
- You need to ensure specific classes are injected
- You're not using the muzzle-generation plugin

```java
@Override
public List<String> getAdditionalHelperClassNames() {
  return Arrays.asList(
      "com.example.instrumentation.MyHelperClass",
      "com.example.instrumentation.AnotherHelper");
}
```

**Important**: The order of class names matters. If helper classes extend one
another, list the base class first. For example, if `B extends A`, return `A`
first, then `B`:

```java
@Override
public List<String> getAdditionalHelperClassNames() {
  return Arrays.asList(
      "com.example.BaseHelper",      // Base class first
      "com.example.DerivedHelper"); // Derived class second
}
```

Troubleshooting Helper Classes:

If your instrumentation isn't working, and you suspect helper class issues:

1. **Check logs**: Look for warnings about missing classes or failed class
   injection.

2. **Verify muzzle detection**: Run `printMuzzleReferences` to see which helper
   classes muzzle detected automatically.

3. **Add explicit specification**: If a helper class isn't being detected, add
   it to `getAdditionalHelperClassNames()` or mark its package in
   `isHelperClass()`.

4. **Check classloader isolation**: Remember that helper classes are injected
   into the application classloader, so they can't directly reference agent
   classes. Use the bootstrap API for cross-classloader communication.

### Testing Your Instrumentation

For a complete working example with tests, see the
[DemoServlet3InstrumentationModule](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/src/main/java/com/example/javaagent/instrumentation/DemoServlet3InstrumentationModule.java)
in the example extension.

## Use Cases & Patterns

Extensions are designed to override or customize the instrumentation provided by
the upstream agent without modifying the agent code. Consider an instrumented
database client that creates a span per database call and extracts data from the
database connection and adds it to a span. Here are some common patterns and use
cases:

- _"I want to customize existing instrumentation without actually modifying the
  instrumentation"_:

  The (experimental) `InstrumenterCustomizerProvider` extension point allows you
  to customize instrumentation behavior without modifying core instrumentation,
  you can:
  - Add custom attributes and metrics to existing instrumentations
  - Customize context and correlation IDs
  - Transform span names to match your naming conventions
  - Apply customizations conditionally based on instrumentation name

- _"I don't want this span at all"_:

  Create an extension to disable selected instrumentation by providing new
  default settings.

- _"I want to edit some attributes that don't depend on any db connection
  instance"_:

  Create an extension that provides a custom `SpanProcessor` to modify span
  attributes before export.

- _"I want to edit some attributes, and their values depend on a specific db
  connection instance"_:

  Create an extension with new instrumentation which injects its own advice into
  the same method as the original one. You can use the `order` method to ensure
  it runs after the original instrumentation and augment the current span with
  new information.

- _"I want to remove some attributes"_:

  Create an extension with a custom exporter or use the attribute filtering
  functionality in the OpenTelemetry Collector.

- _"I don't like the OTel spans. I want to modify them and their lifecycle"_:

  Create an extension that disables existing instrumentation and replace it with
  new one that injects `Advice` into the same (or a better) method as the
  original instrumentation. You can write your `Advice` for this and use the
  existing `Tracer` directly or extend it. As you have your own `Advice`, you
  can control which `Tracer` you use.

## Troubleshooting Extension Development

### Logging in Extensions

**Recommended Approach:** Use the `java.util.logging` API in your extensions.

The agent uses `java.util.logging` internally and automatically rewrites all
usages of this API (both in the agent and in extensions) to redirect logging
output to a bundled, shaded version of `slf4j-simple`. This means
`java.util.logging` will work correctly in your extension without any additional
configuration:

```java
import java.util.logging.Logger;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {
  private static final Logger logger = Logger.getLogger(MyExtension.class.getName());

  @Override
  public void customize(AutoConfigurationCustomizer config) {
    logger.info("MyExtension: customize() called");
    config.addTracerProviderCustomizer(this::configureTracer);
  }

  private SdkTracerProviderBuilder configureTracer(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {
    logger.info("MyExtension: configuring tracer provider");
    return tracerProvider.addSpanProcessor(new MySpanProcessor());
  }
}
```

**For Debugging During Development:**

For quick debugging during extension development, `System.out.println()` or
`System.err.println()` are still useful:

```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {
  @Override
  public void customize(AutoConfigurationCustomizer config) {
    System.out.println("DEBUG: MyExtension initializing");  // Quick debug output
    config.addTracerProviderCustomizer(this::configureTracer);
  }
}
```

### Debugging Advice Classes

**Problem:** Breakpoints don't work in `@Advice` methods because ByteBuddy
inlines the code into the target class.

**Solution 1:** Use print statements and stack traces:

```java
import net.bytebuddy.asm.Advice;

public static class MyAdvice {
  @Advice.OnMethodEnter(suppress = Throwable.class)
  public static void onEnter(@Advice.Argument(0) Object arg) {
    System.out.println("Method entered with arg: " + arg);
    Thread.dumpStack();  // Print the call stack
  }
}
```

**Solution 2:** Move logic to helper methods (where breakpoints DO work):

```java
public static class MyAdvice {
  @Advice.OnMethodEnter(suppress = Throwable.class)
  public static void onEnter(@Advice.Argument(0) Object arg) {
    DebugHelper.logEntry(arg);  // Set breakpoint in DebugHelper
  }
}

// Separate class where you can debug normally
public class DebugHelper {
  public static void logEntry(Object arg) {
    System.out.println("Entry: " + arg);  // Breakpoint works here
  }
}
```

### Viewing Bytecode Transformations

To see exactly what bytecode changes your instrumentation is making, use the
ByteBuddy dump property:

```bash
java -Dnet.bytebuddy.dump=/tmp/bytecode-dump \
     -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=my-extension.jar \
     -jar myapp.jar
```

This creates `.class` files in `/tmp/bytecode-dump` showing the transformed
bytecode. You can decompile these files to see the actual changes.

```bash
# Check that your target class was transformed
find /tmp/bytecode-dump -name "DatabaseClient*.class"
```

### Extension Not Being Discovered

**Problem:** Your extension class isn't being loaded or called.

1. **Verify `@AutoService` annotation is present:**

   ```java
   @AutoService(AutoConfigurationCustomizerProvider.class)  // Must be here
   public class MyExtension implements AutoConfigurationCustomizerProvider {
   ```

2. **Check `META-INF/services/` files exist in your JAR:**

   ```bash
   jar tf build/libs/my-extension-all.jar | grep META-INF/services/
   ```

   Should show files like:

   ```bash
   META-INF/services/io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider
   ```

3. **Verify the annotation processor is configured:**

   ```kotlin
   dependencies {
     compileOnly("com.google.auto.service:auto-service:1.1.1")
     annotationProcessor("com.google.auto.service:auto-service:1.1.1")  // Required
   }
   ```

4. **Add debug output to verify loading:**

   ```java
   @Override
   public void customize(AutoConfigurationCustomizer config) {
     System.out.println("=== MyExtension loaded ===");
     // ...
   }
   ```

## Extension Examples

To see a complete, working example of an extension:

- [Example extension project](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension) -
  Demonstrates all major extension points including custom instrumentation,
  samplers, exporters, and more
- Build and run it:

  ```bash
  cd examples/extension
  ./gradlew build
  ./gradlew extendedAgent
  ```

The example includes:

- Complete gradle build file with all necessary configuration
- Sample implementations of various extension points
- Integration tests showing how to test your extension
- Documentation explaining each component
