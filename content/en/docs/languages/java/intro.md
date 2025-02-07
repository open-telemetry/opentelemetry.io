---
title: Intro to OpenTelemetry Java
description: Intro to the OpenTelemetry Java ecosystem
weight: 9
---

OpenTelemetry Java is the set of OpenTelemetry observability tools for the Java
ecosystem. At a high level, it consists of the API, the SDK, and
instrumentation.

This page introduces the ecosystem, with a conceptual [overview](#overview), a
guide to [navigating the docs](#navigating-the-docs), a list of
[repositories](#repositories) with key details about releases and artifacts.

## Overview

The API is a set of classes and interfaces for recording telemetry across key
observability signals. It supports multiple implementations, with a low-overhead
minimalist Noop (i.e. pronounced "no-op") and SDK reference implementation
provided out of the box. It is designed to be taken as a direct dependency by
libraries, frameworks, and application owners looking to add instrumentation. It
comes with strong backwards compatibility guarantees, zero transitive
dependencies, and supports Java 8+.

The SDK is the built-in reference implementation of the API, processing and
exporting telemetry produced by instrumentation API calls. Configuring the SDK
to process and export appropriately is an essential step to integrating
OpenTelemetry into an application. The SDK has autoconfiguration and
programmatic configuration options.

Instrumentation records telemetry using the API. There are a variety of
categories of instrumentation, including: zero-code Java agent, zero-code Spring
Boot starter, library, native, manual, and shims.

For a language-agnostic overview, see [OpenTelemetry concepts](/docs/concepts/).

## Navigating the docs

The OpenTelemetry Java documentation is organized as follows:

- [Getting Started by Example](../getting-started/): A quick example to get off
  the ground running with OpenTelemetry Java, demonstrating integration of the
  OpenTelemetry Java agent into a simple web application.
- [Instrumentation ecosystem](../instrumentation/): A guide to the OpenTelemetry
  Java instrumentation ecosystem. This is a key resource for application authors
  looking to integrate OpenTelemetry Java into applications. Learn about the
  different categories of instrumentation, and decide which is right for you.
- [Record Telemetry with API](../api/): A technical reference for the
  OpenTelemetry API, exploring all key aspects of the API with working code
  examples. Most users will use this page like an encyclopedia, consulting the
  index of sections as needed, rather than reading front to back.
- [Manage Telemetry with SDK](../sdk/) A technical reference for the
  OpenTelemetry SDK, exploring all SDK plugin extension points and the
  programmatic configuration API with working code examples. Most users will use
  this page like an encyclopedia, consulting the index of sections as needed,
  rather than reading front to back.
- [Configure the SDK](../configuration/): A technical reference for configuring
  the SDK, focussing on zero-code autoconfiguration. Includes a reference of all
  supported environment variables and system properties for configuring the SDK.
  Explores all programmatic customization points with working code examples.
  Most users will use this page like an encyclopedia, consulting the index of
  sections as needed, rather than reading front to back.
- **Learn More**: Supplementary resources, including end-to-end
  [examples](../examples/), [Javadoc](../api/), component
  [registry](../registry/), and a
  [performance reference](/docs/zero-code/java/agent/performance/).

## Repositories

OpenTelemetry Java source code is organized into several repositories:

| Repository                                                                                                 | Description                                                                                          | Group ID                           | Current Version                      | Release cadence                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)                                 | Core API and SDK components                                                                          | `io.opentelemetry`                 | `{{% param vers.otel %}}`            | [Friday after first Monday of the month](https://github.com/open-telemetry/opentelemetry-java/blob/main/RELEASING.md#release-cadence)                     |
| [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) | Instrumentation maintained by OpenTelemetry, including OpenTelemetry Java agent                      | `io.opentelemetry.instrumentation` | `{{% param vers.instrumentation %}}` | [Wednesday after second Monday of the month](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/RELEASING.md#release-cadence) |
| [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)                 | Community maintained components that don't fit the express scope of other repositories               | `io.opentelemetry.contrib`         | `{{% param vers.contrib %}}`         | [Friday after second Monday of the month](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/RELEASING.md#release-cadence)            |
| [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)                   | Generated code for semantic conventions                                                              | `io.opentelemetry.semconv`         | `{{% param vers.semconv %}}`         | Following releases of [semantic-conventions](https://github.com/open-telemetry/semantic-conventions)                                                      |
| [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)                     | Generated bindings for OTLP                                                                          | `io.opentelemetry.proto`           | `1.3.2-alpha`                        | Following releases of [opentelemetry-proto](https://github.com/open-telemetry/opentelemetry-proto)                                                        |
| [opentelemetry-java-examples](https://github.com/open-telemetry/opentelemetry-java-examples)               | End-to-end code examples demonstrating a variety of patterns using the API, SDK, and instrumentation | n/a                                | n/a                                  | n/a                                                                                                                                                       |

`opentelemetry-java`, `opentelemetry-java-instrumentation`, and
`opentelemetry-java-contrib` each publish large catalogs of artifacts. Please
consult repositories for details, or see the "Managed Dependencies" column in
the [Bill of Materials](#dependencies-and-boms) table to see a full list of
managed dependencies.

As a general rule, artifacts published from the same repository have the same
version. The exception to this is `opentelemetry-java-contrib`, which can be
thought of as a group of independent projects that are co-located in the same
repository to take advantage of shared tooling. For now, the artifacts of
`opentelemetry-java-contrib` are aligned but this is a coincidence and will
change in the future.

The repositories have a release cadence which mirrors their high level
dependency structure:

- `opentelemetry-java` is the core and releases first each month.
- `opentelemetry-java-instrumentation` depends on `opentelemetry-java` and is
  next to publish.
- `opentelemetry-java-contrib` depends on `opentelemetry-java-instrumentation`
  and `opentelemetry-java` and is last to publish.
- Although `semantic-conventions-java` is a dependency of
  `opentelemetry-java-instrumentation`, it is an independent artifact with an
  independent release schedule.

## Dependencies and BOMs

A
[bill of materials](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Bill_of_Materials_.28BOM.29_POMs),
or BOM for short, is an artifact that helps keep the versions of related
dependencies aligned. OpenTelemetry Java publishes several BOMs catering to
different use cases, listed below in order of increasing scope. We highly
recommend using a BOM.

{{% alert %}} Because the BOMs are hierarchical, adding dependencies on multiple
BOMs is not recommended, as it is redundant and can lead unintuitive dependency
version resolution. {{% /alert %}}

Click the link in the "Managed Dependencies" column to see a list of the
artifacts managed by the BOM.

| Description                                                                                  | Repository                           | Group ID                           | Artifact ID                               | Current Version                            | Managed Dependencies                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Stable core API and SDK artifacts                                                            | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom`                       | `{{% param vers.otel %}}`                  | [latest pom.xml][opentelemetry-bom]                       |
| Experimental core API and SDK artifacts, including all of `opentelemetry-bom`                | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom-alpha`                 | `{{% param vers.otel %}}-alpha`            | [latest pom.xml][opentelemetry-bom-alpha]                 |
| Stable instrumentation artifacts, including all of `opentelemetry-bom`                       | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom`       | `{{% param vers.instrumentation %}}`       | [latest pom.xml][opentelemetry-instrumentation-bom]       |
| Experimental instrumentation artifacts, including all of `opentelemetry-instrumentation-bom` | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom-alpha` | `{{% param vers.instrumentation %}}-alpha` | [latest pom.xml][opentelemetry-instrumentation-alpha-bom] |

The following code snippet demonstrates adding a BOM dependency,
with`{{bomGroupId}}`, `{{bomArtifactId}}`, and `{{bomVersion}}` referring to the
"Group ID", "Artifact ID", and "Current Version" table columns, respectively.

{{< tabpane text=true >}} {{% tab "Gradle" %}}

```kotlin
dependencies {
  implementation(platform("{{bomGroupId}}:{{bomArtifactId}}:{{bomVersion}}"))
  // Add a dependency on an artifact whose version is managed by the bom
  implementation("io.opentelemetry:opentelemetry-api")
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>{{bomGroupId}}</groupId>
        <artifactId>{{bomArtifactId}}</artifactId>
        <version>{{bomVersion}}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <!-- Add a dependency on an artifact whose version is managed by the bom -->
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
    </dependency>
  </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane >}}

[opentelemetry-bom]:
https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom/{{% param
vers.otel %}}/opentelemetry-bom-{{% param vers.otel %}}.pom
[opentelemetry-bom-alpha]:
https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom-alpha/{{%
param vers.otel
%}}-alpha/opentelemetry-bom-alpha-{{% param vers.otel %}}-alpha.pom
[opentelemetry-instrumentation-bom]:
https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom/{{%
param vers.instrumentation
%}}/opentelemetry-instrumentation-bom-{{% param vers.instrumentation %}}.pom
[opentelemetry-instrumentation-alpha-bom]:
https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom-alpha/{{%
param vers.instrumentation
%}}-alpha/opentelemetry-instrumentation-bom-alpha-{{% param vers.instrumentation %}}-alpha.pom
