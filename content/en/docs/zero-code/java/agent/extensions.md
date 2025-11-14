---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
weight: 300
cSpell:ignore: Customizer Dotel myextension uber
---

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

### Sample Use Cases

Extensions are designed to override or customize the instrumentation provided by
the upstream agent without modifying the agent code. Consider an instrumented
database client that creates a span per database call and extracts data from the
database connection and adds it to a span. Here are some sample use cases that
can be solved using extensions:

- _"I want to customize instrumentation without modifying the instrumentation"_:

  The (experimental) `InstrumenterCustomizerProvider` extension point allows you
  to customize instrumentation behavior without modifying core instrumentation:
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

## Loading an Extension at Runtime

There are two ways to use extensions with the Java agent:

1. **Load as a separate jar file** using the `-Dotel.javaagent.extensions` option (described
   in this section)
2. **Embed in the agent** to create a single JAR file (described in the
   [next section](#embedding-extensions-in-the-agent))

### Basic Usage

Extensions can be loaded at runtime using the `otel.javaagent.extensions` system
property or `OTEL_JAVAAGENT_EXTENSIONS` environment variable. This configuration option
accepts comma-separated paths to extension JAR files or directories containing extension JARs.

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

### How Extension Loading Works

When you load extensions at runtime, the agent:

1. Makes OpenTelemetry APIs available to your extension (without needing to
   package them in your extension JAR)
2. Discovers your extension's components using Java's ServiceLoader mechanism
   (via `@AutoService` annotations in your code, for example)

### Important Notes

- **Single JAR requirement**: Extensions must be packaged as shadow/uber JARs
  containing all their dependencies. You cannot specify extension dependencies
  as separate JARs; they must be merged into a single JAR.
- **Isolation**: Each extension gets its own class loader, isolating extensions
  from each other and preventing conflicts.

## Embedding Extensions in the Agent

Another deployment option is to create a single JAR file that contains both the
OpenTelemetry Java agent and your extension(s). This approach simplifies
deployment (just one JAR file to manage) and eliminates the need for the
`-Dotel.javaagent.extensions` command line option, which makes it harder to
accidentally forget to load your extension.

### How It Works

The agent automatically looks for extensions in a special `extensions/`
directory inside the agent JAR file, so we can use a Gradle build task to:

1. Download the official OpenTelemetry Java agent
2. Extract its contents
3. Add your extension JAR(s) into the `extensions/` directory
4. Repackage everything into a single JAR

### The `extendedAgent` Gradle Task

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

repositories {
    mavenCentral()
}

configurations {
    // Create a temporary configuration to download the agent JAR
    // Think of this as a "download slot" that's separate from your extension's dependencies
    create("otel")
}

dependencies {
    // Download the official OpenTelemetry Java agent into the 'otel' configuration
    "otel"("io.opentelemetry.javaagent:opentelemetry-javaagent:2.21.0")

    /*
      Interfaces and SPIs that we implement. We use `compileOnly` dependency because during
      runtime all necessary classes are provided by javaagent itself.
     */
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:1.44.1")
    compileOnly("io.opentelemetry:opentelemetry-sdk:1.44.1")
    compileOnly("io.opentelemetry:opentelemetry-api:1.44.1")

    // Required for custom instrumentation
    compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:2.21.0-alpha")
    compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:2.21.0-alpha")
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

### Building and Using the Extended Agent

Once you've added the `extendedAgent` task to your `build.gradle.kts`:

```bash
# 1. Build your extension and create the extended agent
./gradlew extendedAgent

# 2. Find the output in build/libs/
ls build/libs/opentelemetry-javaagent.jar

# 3. Use it with your application (no -Dotel.javaagent.extensions needed)
java -javaagent:build/libs/opentelemetry-javaagent.jar -jar myapp.jar
```

### Understanding the Output

The `extendedAgent` task creates a JAR file structured like this:

```bash
opentelemetry-javaagent.jar
├── inst/                          (agent's internal classes)
├── extensions/                    (your extensions go here)
│   └── my-extension-1.0-all.jar   (your extension)
├── META-INF/
│   └── MANIFEST.MF                (agent startup configuration)
└── ... (other agent files)
```

When the agent starts, it automatically finds and loads all JAR files from the
`extensions/` directory.

### Embedding Multiple Extensions

To embed multiple extensions, modify the `extendedAgent` task to include
multiple extension JARs:

```kotlin
task extendedAgent(type: Jar) {
  dependsOn(configurations.otel)
  archiveFileName = "opentelemetry-javaagent.jar"

  from zipTree(configurations.otel.singleFile)

  // Add multiple extensions
  from(tasks.shadowJar.archiveFile) {
    into "extensions"
  }
  from(file("../other-extension/build/libs/other-extension-all.jar")) {
    into "extensions"
  }

  doFirst {
    manifest.from(
      zipTree(configurations.otel.singleFile).matching {
        include 'META-INF/MANIFEST.MF'
      }.singleFile
    )
  }
}
```

## Writing an Extension

Creating an extension involves implementing one or more Service Provider
Interface (SPI) classes and packaging them as a JAR file.

### Quick Start

Here's a minimal extension that adds a custom span processor:

**1. Create a Gradle project:**

```kotlin
plugins {
    id("java")
    id("com.gradleup.shadow")
}

repositories {
    mavenCentral()
}

dependencies {
    // Use BOM to manage OpenTelemetry dependency versions
    compileOnly(platform("io.opentelemetry:opentelemetry-bom:1.44.1"))

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

**2. Create the SpanProcessor:**

```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.ReadWriteSpan;
import io.opentelemetry.sdk.trace.ReadableSpan;
import io.opentelemetry.sdk.trace.SpanProcessor;

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

**3. Create an extension class that uses the `AutoConfigurationCustomizerProvider` SPI:**

```java
package otel;

import com.google.auto.service.AutoService;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.trace.SdkTracerProviderBuilder;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtensionProvider implements AutoConfigurationCustomizerProvider {

    @Override
    public void customize(AutoConfigurationCustomizer config) {
        config.addTracerProviderCustomizer(this::configureTracer);
    }

    private SdkTracerProviderBuilder configureTracer(
            SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {
        return tracerProvider.addSpanProcessor(new MySpanProcessor());
    }
}
```

**4. Build the extension:**

```bash
./gradlew shadowJar
```

**5. Use the extension:**

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=build/libs/my-extension-all.jar \
     -jar myapp.jar
```

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

### Dependency Management

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

**Critical:** Extensions cannot load dependencies from separate JAR files. All
dependencies must be merged into a single shadow JAR.

### Using @AutoService

The `@AutoService` annotation automatically generates the required `META-INF/services/` files for SPI registration.
To use it:

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

{{% alert title="Note" %}}
This will not work for situations where [declarative configuration](declarative-configuration.md) is in use.
{{% /alert %}}

The main entry point for customizing SDK configuration. This allows you to:

- Customize the tracer provider
- Add span processors and exporters
- Provide default configuration properties
- Customize other SDK components

**Example:**

```java
import com.google.auto.service.AutoService;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.trace.SdkTracerProviderBuilder;
import io.opentelemetry.sdk.trace.SpanLimits;
import java.util.HashMap;
import java.util.Map;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer config) {
    config
        .addTracerProviderCustomizer(this::configureTracer)
        .addPropertiesSupplier(this::getDefaultProperties);
  }

  private SdkTracerProviderBuilder configureTracer(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {
    return tracerProvider
        .setIdGenerator(new MyIdGenerator())
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new MySpanProcessor());
  }

  private Map<String, String> getDefaultProperties() {
    Map<String, String> properties = new HashMap<>();
    properties.put("otel.exporter.otlp.endpoint", "http://my-backend:8080");
    properties.put("otel.service.name", "my-service");
    return properties;
  }
}
```

### InstrumenterCustomizerProvider

Customize existing instrumentations without modifying their code. This is the
recommended way to add attributes, metrics, or modify behavior of built-in
instrumentations.

**Example:**

```java
import com.google.auto.service.AutoService;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import io.opentelemetry.context.Context;
import io.opentelemetry.instrumentation.api.incubator.instrumenter.InstrumenterCustomizer;
import io.opentelemetry.instrumentation.api.incubator.instrumenter.InstrumenterCustomizerProvider;
import io.opentelemetry.instrumentation.api.instrumenter.AttributesExtractor;

@AutoService(InstrumenterCustomizerProvider.class)
public class MyInstrumenterCustomizer implements InstrumenterCustomizerProvider {

  @Override
  public void customize(InstrumenterCustomizer customizer) {
    String instrumentationName = customizer.getInstrumentationName();

    // Target specific instrumentation
    if (instrumentationName.contains("http-server")) {
      customizer.addAttributesExtractor(new MyAttributesExtractor());
    }
  }

  private static class MyAttributesExtractor implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CUSTOM_ATTR =
        AttributeKey.stringKey("custom.attribute");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CUSTOM_ATTR, "custom-value");
    }

    @Override
    public void onEnd(AttributesBuilder attributes, Context context,
                     Object request, Object response, Throwable error) {
      if (error != null) {
        attributes.put(AttributeKey.stringKey("error.type"),
                      error.getClass().getSimpleName());
      }
    }
  }
}
```

### ConfigurablePropagatorProvider

Register custom propagators that can be referenced by name in the
`otel.propagators` configuration.

**Example:**

```java
import com.google.auto.service.AutoService;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

@AutoService(ConfigurablePropagatorProvider.class)
public class MyPropagatorProvider implements ConfigurablePropagatorProvider {

  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    return new MyCustomPropagator();
  }

  @Override
  public String getName() {
    // Use with: -Dotel.propagators=my-propagator
    return "my-propagator";
  }
}
```

### ConfigurableSamplerProvider

Register custom samplers that can be referenced in the `otel.traces.sampler`
configuration.

**Example:**

```java
import com.google.auto.service.AutoService;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

@AutoService(ConfigurableSamplerProvider.class)
public class MySamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // Access configuration
    double samplingRate = config.getDouble("otel.traces.sampler.arg", 1.0);
    return new MyCustomSampler(samplingRate);
  }

  @Override
  public String getName() {
    // Use with: -Dotel.traces.sampler=my-sampler
    return "my-sampler";
  }
}
```

### ResourceProvider

Add custom resource attributes that will be automatically merged with other
resource providers.

**Example:**

```java
import com.google.auto.service.AutoService;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

@AutoService(ResourceProvider.class)
public class MyResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    return Resource.create(
        Attributes.builder()
            .put("deployment.environment", "production")
            .put("service.version", getVersion())
            .put("custom.attribute", "value")
            .build()
    );
  }

  private String getVersion() {
    // Retrieve version from environment, file, etc.
    return System.getenv().getOrDefault("APP_VERSION", "unknown");
  }
}
```

## Application-Agent Communication

### Accessing the Current Span

In instrumentation advice classes, use `Java8BytecodeBridge` to access the
current span:

```java
import io.opentelemetry.javaagent.bootstrap.Java8BytecodeBridge;
import io.opentelemetry.api.trace.Span;
import net.bytebuddy.asm.Advice;

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

### Sharing Data via Context

Use the OpenTelemetry `Context` API to share data throughout the request
lifecycle:

```java
import io.opentelemetry.context.Context;
import io.opentelemetry.context.ContextKey;
import io.opentelemetry.instrumentation.api.instrumenter.ContextCustomizer;

public class MyContextCustomizer implements ContextCustomizer<Object> {
  private static final ContextKey<String> REQUEST_ID_KEY =
      ContextKey.named("myext.request.id");

  @Override
  public Context onStart(Context context, Object request, Attributes startAttributes) {
    String requestId = generateRequestId(request);
    return context.with(REQUEST_ID_KEY, requestId);
  }
}

// Later, retrieve the value
String requestId = Context.current().get(REQUEST_ID_KEY);
```

## Configuration

Extensions can read and provide configuration to customize their behavior.

### Accessing Configuration in Extensions

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

### Providing Default Configuration

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

### Configuration Naming Conventions

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

### Example: Configurable Sampler

```java
@AutoService(ConfigurableSamplerProvider.class)
public class MyConfigurableSamplerProvider implements ConfigurableSamplerProvider {
  @Override
  public Sampler createSampler(ConfigProperties config) {
    double ratio = config.getDouble("otel.instrumentation.mysampler.ratio", 1.0);
    boolean debug = config.getBoolean("otel.instrumentation.mysampler.debug", false);
    if (debug) {
      System.out.println("MyConfigurableSampler: ratio=" + ratio + ", debug=" + debug);
    }
    return Sampler.traceIdRatioBased(ratio);
  }
  @Override
  public String getName() {
    return "mysampler";
  }
}
```

Usage:

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.traces.sampler=mysampler \
     -Dotel.instrumentation.mysampler.ratio=0.1 \
     -Dotel.instrumentation.mysampler.debug=true \
     -jar myapp.jar
```

## Writing Custom Instrumentation

Custom instrumentation allows you to inject bytecode into specific methods to
add observability to libraries not currently supported by the agent, or to
augment existing instrumentation.

### When to Use Custom Instrumentation

Use custom instrumentation when you need to:

- Add tracing to a library or framework not supported by the agent
- Access instance-specific data from the target class (like connection
  properties)
- Run your code before or after specific methods execute
- Modify the behavior of existing instrumentation using the `order()` method

For simpler use cases (modifying span attributes, custom samplers, etc.), use
SDK customizations (SpanProcessor, Sampler) as shown earlier in this guide.

### Components of Custom Instrumentation

Custom instrumentation requires three components:

1. **InstrumentationModule** - Defines what to instrument and when
2. **TypeInstrumentation** - Specifies which classes and methods to target
3. **Advice** - Contains the code to inject (runs before/after target methods)

### Required Dependencies

Add these dependencies to your extension's `build.gradle`:

```groovy
dependencies {
  compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
  compileOnly("net.bytebuddy:byte-buddy:1.15.10")
}
```

### Step-by-Step Example

Let's instrument a hypothetical database client to add custom span attributes.

#### Create the InstrumentationModule

```java
package com.example.extension.instrumentation;

import com.google.auto.service.AutoService;
import io.opentelemetry.javaagent.extension.instrumentation.InstrumentationModule;
import io.opentelemetry.javaagent.extension.instrumentation.TypeInstrumentation;
import java.util.Collections;
import java.util.List;

@AutoService(InstrumentationModule.class)
public class DatabaseClientInstrumentationModule extends InstrumentationModule {

  public DatabaseClientInstrumentationModule() {
    // First arg: instrumentation name (for enabling/disabling)
    // Additional args: aliases for this instrumentation
    super("database-client-custom");
  }

  @Override
  public List<TypeInstrumentation> typeInstrumentations() {
    return Collections.singletonList(new DatabaseClientInstrumentation());
  }

  // Optional: Control execution order relative to other instrumentations
  // Higher numbers run later. Use this to run after upstream instrumentation.
  @Override
  public int order() {
    return 1; // Run after default instrumentation (which uses order 0)
  }
}
```

#### Create the TypeInstrumentation

```java
package com.example.extension.instrumentation;

import io.opentelemetry.javaagent.extension.instrumentation.TypeInstrumentation;
import io.opentelemetry.javaagent.extension.instrumentation.TypeTransformer;
import net.bytebuddy.description.type.TypeDescription;
import net.bytebuddy.matcher.ElementMatcher;
import static net.bytebuddy.matcher.ElementMatchers.*;

public class DatabaseClientInstrumentation implements TypeInstrumentation {

  @Override
  public ElementMatcher<TypeDescription> typeMatcher() {
    // Match the target class(es) to instrument
    return named("com.example.db.DatabaseClient");
  }

  @Override
  public void transform(TypeTransformer transformer) {
    // Apply advice to specific method(s)
    transformer.applyAdviceToMethod(
      named("executeQuery")                    // Method name
        .and(takesArgument(0, String.class))   // First parameter is String
        .and(isPublic()),                      // Only public methods
      this.getClass().getName() + "$ExecuteQueryAdvice"
    );
  }

  // Advice class defined as inner static class
  public static class ExecuteQueryAdvice {

    @Advice.OnMethodEnter(suppress = Throwable.class)
    public static void onEnter(
        @Advice.Argument(0) String query,
        @Advice.This Object dbClient) {

      // Access the current span and add attributes
      Span span = Java8BytecodeBridge.currentSpan();
      span.setAttribute("db.query.custom", query);
      span.setAttribute("db.client.class", dbClient.getClass().getName());

      System.out.println("Instrumented query: " + query);
    }

    @Advice.OnMethodExit(suppress = Throwable.class, onThrowable = Throwable.class)
    public static void onExit(@Advice.Thrown Throwable throwable) {
      if (throwable != null) {
        Span span = Java8BytecodeBridge.currentSpan();
        span.setAttribute("db.query.failed", true);
      }
    }
  }
}
```

### Important Considerations

- **Always use `suppress = Throwable.class`** - Prevents your advice from
  breaking the instrumented application
- **Advice methods must be static** - They're inlined into the target class
- **Keep advice methods small** - Move complex logic to helper classes
- **Test thoroughly** - Bytecode instrumentation can cause subtle issues
- **Use `order()`** to control execution order relative to existing
  instrumentation

### Testing Your Instrumentation

For a complete working example with tests, see the
[DemoServlet3InstrumentationModule](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/src/main/java/com/example/javaagent/instrumentation/DemoServlet3InstrumentationModule.java)
in the example extension.

## Troubleshooting Extension Development

When developing and debugging extensions, you may encounter some common issues.

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

**Checklist:**

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

   ```groovy
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

- Complete `build.gradle` with all necessary configuration
- Sample implementations of various extension points
- Integration tests showing how to test your extension
- Documentation explaining each component
