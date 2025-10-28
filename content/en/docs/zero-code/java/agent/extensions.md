---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
weight: 300
cSpell:ignore: Dotel uber Sonatype
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
database connection. Here are some sample use cases that can be solved using
extensions:

- _"I don't want this span at all"_:

  Create an extension to disable selected instrumentation by providing new
  default settings.

- _"I want to edit some attributes that don't depend on any db connection
  instance"_:

  Create an extension that provides a custom `SpanProcessor` to modify span
  attributes before export.

- _"I want to edit some attributes and their values depend on a specific db
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

1. **Load at runtime** using the `-Dotel.javaagent.extensions` option (described
   in this section)
2. **Embed in the agent** to create a single JAR file (described in the
   [next section](#embedding-extensions-in-the-agent))

### Basic Usage

Extensions can be loaded at runtime using the `otel.javaagent.extensions` system
property. This property accepts comma-separated paths to extension JAR files or
directories containing extension JARs.

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

1. Creates an
   [isolated class loader](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/contributing/javaagent-structure.md#extension-class-loader)
   for each extension JAR to prevent conflicts between extensions
2. Makes OpenTelemetry APIs available to your extension (without needing to
   package them in your extension JAR)
3. Automatically applies shading to extension classes at runtime (extensions use
   normal OpenTelemetry imports, and the agent handles compatibility
   automatically)
4. Discovers your extension's components using Java's ServiceLoader mechanism
   (via `@AutoService` annotations in your code)

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

Add the following to your extension project's `build.gradle` file:

```groovy
plugins {
  id "java"

  // Shadow plugin: Combines all your extension's code and dependencies into one JAR
  // This is required because extensions must be packaged as a single JAR file
  id "com.gradleup.shadow" version "9.2.2"
}

ext {
  versions = [
    opentelemetryJavaagent: "{{% param vers.instrumentation %}}"
  ]
}

repositories {
  mavenCentral()
}

configurations {
  // Create a temporary configuration to download the agent JAR
  // Think of this as a "download slot" that's separate from your extension's dependencies
  otel
}

dependencies {
  // Download the official OpenTelemetry Java agent into the 'otel' configuration
  otel("io.opentelemetry.javaagent:opentelemetry-javaagent:${versions.opentelemetryJavaagent}")
}

// Task: Create an extended agent JAR (agent + your extension)
task extendedAgent(type: Jar) {
  dependsOn(configurations.otel)
  archiveFileName = "opentelemetry-javaagent.jar"

  // Step 1: Unpack the official agent JAR
  from zipTree(configurations.otel.singleFile)

  // Step 2: Add your extension JAR to the "extensions/" directory
  from(tasks.shadowJar.archiveFile) {
    into "extensions"
  }

  // Step 3: Preserve the agent's startup configuration (MANIFEST.MF)
  doFirst {
    manifest.from(
      zipTree(configurations.otel.singleFile).matching {
        include 'META-INF/MANIFEST.MF'
      }.singleFile
    )
  }
}

tasks {
  // Make sure the shadow JAR is built during the normal build process
  assemble.dependsOn(shadowJar)
}
```

### Building and Using the Extended Agent

Once you've added the `extendedAgent` task to your `build.gradle`:

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

```groovy
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

### Troubleshooting

#### "Task 'shadowJar' not found"

- Make sure the Shadow plugin is added to your `plugins` section

#### "Could not resolve io.opentelemetry.javaagent"

- Verify the version number exists at
  [Maven Central](https://central.sonatype.com/artifact/io.opentelemetry.javaagent/opentelemetry-javaagent)
- If using a SNAPSHOT version, add the Sonatype snapshots repository:

```groovy
repositories {
  mavenCentral()
  maven {
    url = uri("https://oss.sonatype.org/content/repositories/snapshots")
  }
}
```

#### "How do I verify my extension is embedded?"

List the contents of the JAR to see the `extensions/` directory:

```bash
jar tf build/libs/opentelemetry-javaagent.jar | grep extensions/
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

### Using Helper Classes for Debugging

As noted in the [Debugging Advice Classes](#debugging-advice-classes) section,
breakpoints don't work in `@Advice` methods because ByteBuddy inlines them. Use
helper classes to enable debugging:

```java
public class DatabaseClientInstrumentation implements TypeInstrumentation {
  // ... typeMatcher and transform methods ...

  public static class ExecuteQueryAdvice {
    @Advice.OnMethodEnter(suppress = Throwable.class)
    public static void onEnter(@Advice.Argument(0) String query) {
      // Call helper method where breakpoints WILL work
      AdviceHelper.processQuery(query);
    }
  }
}

// Separate helper class - debuggable with breakpoints
class AdviceHelper {
  public static void processQuery(String query) {
    // Set breakpoints here - they will work
    Span span = Java8BytecodeBridge.currentSpan();
    span.setAttribute("db.query", query);
  }
}
```

### Accessing the Current Span

Use `Java8BytecodeBridge` to access OpenTelemetry APIs from advice code:

```java
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.javaagent.bootstrap.Java8BytecodeBridge;

Span span = Java8BytecodeBridge.currentSpan();
span.setAttribute("custom.attribute", "value");

Tracer tracer = Java8BytecodeBridge.getGlobalTracer();
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
