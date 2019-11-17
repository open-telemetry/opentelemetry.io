---
title: "Tracing"
---

This page contains documentation for OpenTelemetry Java.

# Quick Start

**Please note** that this library is currently in *alpha*, and shouldn't be used in production environments.

First, you'll need to import the OpenTelemetry API and/or SDK into your project.

**Maven**

```xml
  <repositories>
    <repository>
      <id>oss.sonatype.org-snapshot</id>
      <url>https://oss.jfrog.org/artifactory/oss-snapshot-local</url>
    </repository>
  </repositories>

  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
      <version>0.2.0-SNAPSHOT</version>
    </dependency>
  </dependencies>
```

**Gradle**

```groovy
repositories {
	maven { url 'https://oss.jfrog.org/artifactory/oss-snapshot-local' }
}

dependencies {
	compile('io.opentelemetry:opentelemetry-api:0.2.0-SNAPSHOT')
}
```

Libraries will usually only need `opentelemetry-api`, while applications
may want to use `opentelemetry-sdk`.

Next, import the necessary classes in your code.

```java
import io.opentelemetry.trace.Tracer;
import io.opentelemetry.exporters.inmemory.InMemorySpanExporter;
```

Finally, create a tracer and exporter, then start creating spans.

```java
private final InMemorySpanExporter exporter = InMemorySpanExporter.create();
private final Tracer tracer = createTracer("tracer", exporter);

Span span = tracer.spanBuilder("test").startSpan();
// do work
span.end();
```

# API Reference
