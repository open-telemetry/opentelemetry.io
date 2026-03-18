---
title: SDK configuration
weight: 30
cSpell:ignore: customizer distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

This spring starter supports
[configuration metadata](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html),
which means that you can see and autocomplete all available properties in your
IDE.

## General configuration

The OpenTelemetry Starter supports all the
[SDK Autoconfiguration](/docs/zero-code/java/agent/configuration/#sdk-configuration)
(since 2.2.0).

You can update the configuration with properties in the `application.properties`
or the `application.yaml` file, or with environment variables.

{{< tabpane text=true >}} {{% tab "not Declarative Configuration" %}}

`application.properties` example:

```properties
otel.propagators=tracecontext,b3
otel.resource.attributes.deployment.environment=dev
otel.resource.attributes.service.name=cart
otel.resource.attributes.service.namespace=shop
```

`application.yaml` example:

```yaml
otel:
  propagators:
    - tracecontext
    - b3
  resource:
    attributes:
      deployment.environment: dev
      service:
        name: cart
        namespace: shop
```

Environment variables example:

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

{{% /tab %}} {{% tab "Declarative Configuration" %}}

SDK-level settings (resources, propagators, exporters) use the standard
[declarative configuration schema](/docs/languages/sdk-configuration/declarative-configuration/)
directly in `application.yaml`. System properties and environment variables
still work to override values — see
[Environment variable overrides](../declarative-configuration/#environment-variable-overrides).

```yaml
otel:
  file_format: '1.0'

  resource:
    attributes:
      - name: deployment.environment
        value: dev
      - name: service.name
        value: cart
      - name: service.namespace
        value: shop

  propagator:
    composite:
      - tracecontext:
      - b3:
```

{{% /tab %}} {{< /tabpane >}}

## Overriding Resource Attributes

As usual in Spring Boot, you can override properties in the
`application.properties` and `application.yaml` files with environment
variables.

For example, you can set or override the `deployment.environment` resource
attribute (not changing `service.name` or `service.namespace`) by setting the
standard `OTEL_RESOURCE_ATTRIBUTES` environment variable:

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

Alternatively, you can use the `OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT`
environment variable to set or override a single resource attribute:

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

The second option supports
[SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html)
expressions.

Note that `DEPLOYMENT_ENVIRONMENT` gets converted to `deployment.environment` by
Spring Boot's
[Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables).

## Disable the OpenTelemetry Starter

{{< tabpane text=true >}} {{% tab "not Declarative Configuration" %}}

{{% config_option name="otel.sdk.disabled" %}}

Set the value to `true` to disable the starter, e.g. for testing purposes.

{{% /config_option %}}

{{% /tab %}} {{% tab "Declarative Configuration" %}}

Set `otel.disabled` to `true` to disable the starter, e.g. for testing purposes.

Note: with [declarative configuration](../declarative-configuration/), the
property name is `otel.disabled`, not `otel.sdk.disabled`.

```yaml
otel:
  file_format: '1.0'
  disabled: true
```

{{% /tab %}} {{< /tabpane >}}

## Programmatic configuration

See [Programmatic configuration](../programmatic-configuration/).

## Resource Providers

{{< tabpane text=true >}} {{% tab "not Declarative Configuration" %}}

The OpenTelemetry Starter includes the same resource providers as the Java
agent:

- [Common resource providers](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [Resource providers that are disabled by default](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

In addition, the OpenTelemetry Starter includes the following Spring Boot
specific resource providers:

### Distribution Resource Provider

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| Attribute                  | Value                               |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | version of the starter              |

### Spring Resource Provider

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| Attribute         | Value                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` or `build.name` from `build-info.properties` (see [Service name](#service-name)) |
| `service.version` | `build.version` from `build-info.properties`                                                               |

{{% /tab %}} {{% tab "Declarative Configuration" %}}

With [declarative configuration](../declarative-configuration/), resource
providers are configured explicitly as detectors under
`resource.detection/development.detectors`. Only listed detectors are active —
nothing is auto-discovered via SPI.

```yaml
otel:
  resource:
    detection/development:
      detectors:
        - container: # container.id
        - host: # host.name, host.arch
        - host_id: # host.id
        - os: # os.type, os.description
        - process: # process.pid, process.executable.path, process.command_line
        - process_runtime: # process.runtime.name/version/description
        - service: # service.name, service.instance.id
        - spring: # service.name (from spring.application.name), service.version (from build-info)
```

The `telemetry.distro.name` and `telemetry.distro.version` attributes are always
added automatically by the starter for troubleshooting purposes.

{{% /tab %}} {{< /tabpane >}}

## Service name

Using these resource providers, the service name is determined by the following
precedence rules, in accordance with the OpenTelemetry
[specification](/docs/languages/sdk-configuration/general/#otel_service_name):

{{< tabpane text=true >}} {{% tab "not Declarative Configuration" %}}

1. `otel.service.name` spring property or `OTEL_SERVICE_NAME` environment
   variable (highest precedence)
2. `service.name` in `otel.resource.attributes` system/spring property or
   `OTEL_RESOURCE_ATTRIBUTES` environment variable
3. `spring.application.name` spring property
4. `build-info.properties`
5. `Implementation-Title` from META-INF/MANIFEST.MF
6. The default value is `unknown_service:java` (lowest precedence)

{{% /tab %}} {{% tab "Declarative Configuration" %}}

The service name depends on which resource detectors you include (see
[Resource Providers](#resource-providers)):

1. `service.name` in `otel.resource.attributes` (highest precedence):

   ```yaml
   otel:
     resource:
       attributes:
         - name: service.name
           value: my-spring-app
   ```

2. The `service` detector — if included, auto-detects from
   `OTEL_SERVICE_NAME`:

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - service:
   ```

3. The `spring` detector — if included, detects from
   `spring.application.name` and `build-info.properties`:

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - spring:
   ```

4. The default value is `unknown_service:java` (lowest precedence)

{{% /tab %}} {{< /tabpane >}}

Use the following snippet in your pom.xml file to generate the
`build-info.properties` file:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<build>
    <finalName>${project.artifactId}</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>build-info</goal>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
springBoot {
  buildInfo {
  }
}
```

{{% /tab %}} {{< /tabpane>}}
