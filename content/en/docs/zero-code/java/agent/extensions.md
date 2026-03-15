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

## Extension examples

For more extension examples, see the
[extension project](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)
within the Java instrumentation repository.
