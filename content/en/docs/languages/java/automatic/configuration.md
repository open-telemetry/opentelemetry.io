---
title: Agent Configuration
linkTitle: Configuration
weight: 10
aliases: [agent-config]
# prettier-ignore
cSpell:ignore: akka armeria authservice classloaders couchbase Customizer datasource dbcp Dotel dropwizard dubbo enduser finatra hikari hikaricp HSET httpasyncclient httpclient hystrix jaxrs jaxws jedis jodd kotlinx logback logmanager LOWMEMORY mojarra myfaces myservice okhttp oshi ottrace pekko PKCS rabbitmq ratpack rediscala redisson restlet retryable rocketmq serverlessapis spymemcached twilio vaadin vertx vibur webflux webmvc
---

## SDK Autoconfiguration

The SDK's autoconfiguration module is used for basic configuration of the agent.
Read the
[docs](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure)
to find settings such as configuring export or sampling.

Here are some quick links into those docs for the configuration options for
specific portions of the SDK & agent:

- [Batch span processor](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#batch-span-processor)
- [Span limits](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#span-limits)
- [Using SPI to further configure the SDK](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#customizing-the-opentelemetry-sdk)

{{% alert title="Important" color="warning" %}}

Unlike the SDK autoconfiguration, versions 2.0+ of the Java agent and
OpenTelemetry Spring Boot starter use `http/protobuf` as the default protocol,
not `grpc`.

{{% /alert %}}

### Enable Resource Providers that are disabled by default

In addition to the resource configuration from the SDK autoconfiguration, you
can enable additional resource providers that are disabled by default:

{{% config_option
  name="otel.resource.providers.aws.enabled"
  default=false
%}} Enables the [AWS Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources).
{{% /config_option %}}

{{% config_option
  name="otel.resource.providers.gcp.enabled"
  default=false
%}} Enables the [GCP Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources).
{{% /config_option %}}

## Configuring the agent

The agent can consume configuration from one or more of the following sources
(ordered from highest to lowest priority):

- system properties
- [environment variables](#configuring-with-environment-variables)
- the [configuration file](#configuration-file)
- properties provided by the
  [`AutoConfigurationCustomizer#addPropertiesSupplier()`](https://github.com/open-telemetry/opentelemetry-java/blob/f92e02e4caffab0d964c02a32fe305d6d6ba372e/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizer.java#L73)
  function; using the
  [`AutoConfigurationCustomizerProvider`](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.java)
  SPI

### Configuring with Environment Variables

In some environments, configuring via Environment Variables is more preferred.
Any setting configurable with a System Property can also be configured with an
Environment Variable. Many settings below include both options, but where they
don't apply the following steps to determine the correct name mapping of the
desired System Property:

- Convert the System Property to uppercase.
- Replace all `.` and `-` characters with `_`.

For example `otel.instrumentation.common.default-enabled` would convert to
`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`.

### Configuration file

You can provide a path to agent configuration file by setting the following
property:

{{% config_option name="otel.javaagent.configuration-file" %}} Path to valid
Java properties file which contains the agent configuration.
{{% /config_option %}}

### Extensions

You can enable [extensions][] by setting the following property:

{{% config_option name="otel.javaagent.extensions" %}}

Path to an extension jar file or folder, containing jar files. If pointing to a
folder, every jar file in that folder will be treated as separate, independent
extension.

{{% /config_option %}}

### Java agent logging output

The agent's logging output can be configured by setting the following property:

{{% config_option name="otel.javaagent.logging" %}}

The Java agent logging mode. The following 3 modes are supported:

- `simple`: The agent will print out its logs using the standard error stream.
  Only `INFO` or higher logs will be printed. This is the default Java agent
  logging mode.
- `none`: The agent will not log anything - not even its own version.
- `application`: The agent will attempt to redirect its own logs to the
  instrumented application's slf4j logger. This works the best for simple
  one-jar applications that do not use multiple classloaders; Spring Boot apps
  are supported as well. The Java agent output logs can be further configured
  using the instrumented application's logging configuration (e.g. `logback.xml`
  or `log4j2.xml`). **Make sure to test that this mode works for your
  application before running it in a production environment.**

{{% /config_option %}}

## Resources

A resource is the immutable representation of the entity producing the
telemetry. See [Resource semantic conventions](/docs/specs/semconv/resource/)
for more details.

| Environment variable                       | Description                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `OTEL_RESOURCE_ATTRIBUTES`                 | Specify resource attributes in the following format: key1=val1,key2=val2,key3=val3                         |
| `OTEL_SERVICE_NAME`                        | Specify logical service name. Takes precedence over `service.name` defined with `otel.resource.attributes` |
| `OTEL_EXPERIMENTAL_RESOURCE_DISABLED_KEYS` | Specify resource attribute keys that are filtered.                                                         |

You almost always want to specify the
[`service.name`](/docs/specs/semconv/resource/#service) for your application. It
corresponds to how you describe the application, for example `authservice` could
be an application that authenticates requests. If not specified, SDK defaults
the service name to `unknown_service:java`.

### Resource Provider SPI

The
[autoconfigure-spi](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure-spi)
SDK extension provides a ResourceProvider SPI that allows libraries to
automatically provide Resources, which are merged into a single Resource by the
autoconfiguration module. You can create your own ResourceProvider, or
optionally use an artifact that includes built-in ResourceProviders:

- [io.opentelemetry.instrumentation:opentelemetry-resources](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources)
  includes providers for a
  [predefined set of common resources](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources)
- [io.opentelemetry.contrib:opentelemetry-aws-resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources)
  includes providers for
  [common AWS resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources/src/main/java/io/opentelemetry/contrib/aws/resource)
- [io.opentelemetry.contrib:opentelemetry-gcp-resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources)
  includes providers for
  [common GCP resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources/src/main/java/io/opentelemetry/contrib/gcp/resource)

### Disabling Automatic ResourceProviders

If you are using the `ResourceProvider` SPI (many instrumentation agent
distributions include this automatically), you can enable / disable one or more
of them by using the following configuration items:

| Environment variable                    | Description                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `OTEL_JAVA_ENABLED_RESOURCE_PROVIDERS`  | Enables one or more `ResourceProvider` types. If unset, all resource providers are enabled. |
| `OTEL_JAVA_DISABLED_RESOURCE_PROVIDERS` | Disables one or more `ResourceProvider` types                                               |

The value for these properties must be a comma separated list of fully qualified
`ResourceProvider` classnames. For example, if you don't want to expose the name
of the operating system through the resource, you can pass the following JVM
argument:

`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`

## Propagators

The propagators determine which distributed tracing header formats are used, and
which baggage propagation header formats are used.

| Environment variable | Description                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PROPAGATORS`   | The propagators to be used. Use a comma-separated list for multiple propagators. Default is `tracecontext,baggage` (W3C). |

Supported values are

- `tracecontext`: [W3C Trace Context](https://www.w3.org/TR/trace-context/) (add
  `baggage` as well to include W3C baggage)
- `baggage`: [W3C Baggage](https://www.w3.org/TR/baggage/)
- `b3`: [B3 Single](https://github.com/openzipkin/b3-propagation#single-header)
- `b3multi`:
  [B3 Multi](https://github.com/openzipkin/b3-propagation#multiple-headers)
- `jaeger`:
  [Jaeger](https://www.jaegertracing.io/docs/1.21/client-libraries/#propagation-format)
  (includes Jaeger baggage)
- `xray`:
  [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader)
- `ottrace`: [OT Trace](https://github.com/opentracing?q=basic&type=&language=)

## Samplers

The sampler configures whether spans will be recorded for any call to
`SpanBuilder.startSpan`.

| Environment variable      | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `OTEL_TRACES_SAMPLER`     | The sampler to use for tracing. Defaults to `parentbased_always_on`     |
| `OTEL_TRACES_SAMPLER_ARG` | An argument to the configured tracer if supported, for example a ratio. |

Supported values for `OTEL_TRACES_SAMPLER` are

- "always_on": AlwaysOnSampler
- "always_off": AlwaysOffSampler
- "traceidratio": TraceIdRatioBased. `OTEL_TRACES_SAMPLER_ARG` sets the ratio.
- "parentbased_always_on": ParentBased(root=AlwaysOnSampler)
- "parentbased_always_off": ParentBased(root=AlwaysOffSampler)
- "parentbased_traceidratio": ParentBased(root=TraceIdRatioBased).
  `OTEL_TRACES_SAMPLER_ARG` sets the ratio.

## Exporters

Exporters output the telemetry. The following configuration properties are
common to all exporters:

| Environment variable                          | Purpose                                                                                                                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_TRACES_EXPORTER`                        | List of exporters to be used for tracing, separated by commas. Default is `otlp`. `none` means no auto-configured exporter.                                                                              |
| `OTEL_METRICS_EXPORTER`                       | List of exporters to be used for metrics, separated by commas. Default is `otlp`. `none` means no auto-configured exporter.                                                                              |
| `OTEL_LOGS_EXPORTER`                          | List of exporters to be used for logging, separated by commas. Default is `otlp`. `none` means no auto-configured exporter.                                                                              |
| `OTEL_JAVA_EXPERIMENTAL_EXPORTER_MEMORY_MODE` | If `reusable_data`, enable reusable memory mode (on exporters which support it) to reduce allocations. Default is `immutable_data`. This option is experimental and subject to change or removal.**[1]** |

**[1]**: NOTE: The exporters which adhere to
`OTEL_JAVA_EXPERIMENTAL_EXPORTER_MEMORY_MODE=reusable_data` are
`OtlpGrpcMetricExporter`, `OtlpHttpMetricExporter`, and `PrometheusHttpServer`.
Support for additional exporters may be added in the future.

### OTLP exporter (span, metric, and log exporters)

The [OpenTelemetry Protocol (OTLP)](/docs/specs/otlp) span, metric, and log
exporters

| Environment variable                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_TRACES_EXPORTER=otlp`                                | Select the OpenTelemetry exporter for tracing (default)                                                                                                                                                                                                                                                                                                                                                                                                       |
| `OTEL_METRICS_EXPORTER=otlp`                               | Select the OpenTelemetry exporter for metrics (default)                                                                                                                                                                                                                                                                                                                                                                                                       |
| `OTEL_LOGS_EXPORTER=otlp`                                  | Select the OpenTelemetry exporter for logs (default)                                                                                                                                                                                                                                                                                                                                                                                                          |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                              | The OTLP traces, metrics, and logs endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal will be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`). Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`.                                          |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`                       | The OTLP traces endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/traces` when protocol is `http/protobuf`.                                                                                                                                                                                                  |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`                      | The OTLP metrics endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/metrics` when protocol is `http/protobuf`.                                                                                                                                                                                                |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`                         | The OTLP logs endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/logs` when protocol is `http/protobuf`.                                                                                                                                                                                                      |
| `OTEL_EXPORTER_OTLP_CERTIFICATE`                           | The path to the file containing trusted certificates to use when verifying an OTLP trace, metric, or log server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default the host platform's trusted root certificates are used.                                                                                                                                                                                   |
| `OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE`                    | The path to the file containing trusted certificates to use when verifying an OTLP trace server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default the host platform's trusted root certificates are used.                                                                                                                                                                                                   |
| `OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE`                   | The path to the file containing trusted certificates to use when verifying an OTLP metric server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default the host platform's trusted root certificates are used.                                                                                                                                                                                                  |
| `OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE`                      | The path to the file containing trusted certificates to use when verifying an OTLP log server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default the host platform's trusted root certificates are used.                                                                                                                                                                                                     |
| `OTEL_EXPORTER_OTLP_CLIENT_KEY`                            | The path to the file containing private client key to use when verifying an OTLP trace, metric, or log client's TLS credentials. The file should contain one private key PKCS8 PEM format. By default no client key is used.                                                                                                                                                                                                                                  |
| `OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY`                     | The path to the file containing private client key to use when verifying an OTLP trace client's TLS credentials. The file should contain one private key PKCS8 PEM format. By default no client key file is used.                                                                                                                                                                                                                                             |
| `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY`                    | The path to the file containing private client key to use when verifying an OTLP metric client's TLS credentials. The file should contain one private key PKCS8 PEM format. By default no client key file is used.                                                                                                                                                                                                                                            |
| `OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY`                       | The path to the file containing private client key to use when verifying an OTLP log client's TLS credentials. The file should contain one private key PKCS8 PEM format. By default no client key file is used.                                                                                                                                                                                                                                               |
| `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`                    | The path to the file containing trusted certificates to use when verifying an OTLP trace, metric, or log client's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default no chain file is used.                                                                                                                                                                                                                    |
| `OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE`             | The path to the file containing trusted certificates to use when verifying an OTLP trace server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default no chain file is used.                                                                                                                                                                                                                                    |
| `OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE`            | The path to the file containing trusted certificates to use when verifying an OTLP metric server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default no chain file is used.                                                                                                                                                                                                                                   |
| `OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE`               | The path to the file containing trusted certificates to use when verifying an OTLP log server's TLS credentials. The file should contain one or more X.509 certificates in PEM format. By default no chain file is used.                                                                                                                                                                                                                                      |
| `OTEL_EXPORTER_OTLP_HEADERS`                               | Key-value pairs separated by commas to pass as request headers on OTLP trace, metric, and log requests.                                                                                                                                                                                                                                                                                                                                                       |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS`                        | Key-value pairs separated by commas to pass as request headers on OTLP trace requests.                                                                                                                                                                                                                                                                                                                                                                        |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS`                       | Key-value pairs separated by commas to pass as request headers on OTLP metrics requests.                                                                                                                                                                                                                                                                                                                                                                      |
| `OTEL_EXPORTER_OTLP_LOGS_HEADERS`                          | Key-value pairs separated by commas to pass as request headers on OTLP logs requests.                                                                                                                                                                                                                                                                                                                                                                         |
| `OTEL_EXPORTER_OTLP_COMPRESSION`                           | The compression type to use on OTLP trace, metric, and log requests. Options include `gzip`. By default no compression will be used.                                                                                                                                                                                                                                                                                                                          |
| `OTEL_EXPORTER_OTLP_TRACES_COMPRESSION`                    | The compression type to use on OTLP trace requests. Options include `gzip`. By default no compression will be used.                                                                                                                                                                                                                                                                                                                                           |
| `OTEL_EXPORTER_OTLP_METRICS_COMPRESSION`                   | The compression type to use on OTLP metric requests. Options include `gzip`. By default no compression will be used.                                                                                                                                                                                                                                                                                                                                          |
| `OTEL_EXPORTER_OTLP_LOGS_COMPRESSION`                      | The compression type to use on OTLP log requests. Options include `gzip`. By default no compression will be used.                                                                                                                                                                                                                                                                                                                                             |
| `OTEL_EXPORTER_OTLP_TIMEOUT`                               | The maximum waiting time, in milliseconds, allowed to send each OTLP trace, metric, and log batch. Default is `10000`.                                                                                                                                                                                                                                                                                                                                        |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`                        | The maximum waiting time, in milliseconds, allowed to send each OTLP trace batch. Default is `10000`.                                                                                                                                                                                                                                                                                                                                                         |
| `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`                       | The maximum waiting time, in milliseconds, allowed to send each OTLP metric batch. Default is `10000`.                                                                                                                                                                                                                                                                                                                                                        |
| `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`                          | The maximum waiting time, in milliseconds, allowed to send each OTLP log batch. Default is `10000`.                                                                                                                                                                                                                                                                                                                                                           |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                              | The transport protocol to use on OTLP trace, metric, and log requests. Options include `grpc` and `http/protobuf`. Default is `grpc`.                                                                                                                                                                                                                                                                                                                         |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`                       | The transport protocol to use on OTLP trace requests. Options include `grpc` and `http/protobuf`. Default is `grpc`.                                                                                                                                                                                                                                                                                                                                          |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`                      | The transport protocol to use on OTLP metric requests. Options include `grpc` and `http/protobuf`. Default is `grpc`.                                                                                                                                                                                                                                                                                                                                         |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`                         | The transport protocol to use on OTLP log requests. Options include `grpc` and `http/protobuf`. Default is `grpc`.                                                                                                                                                                                                                                                                                                                                            |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`        | The preferred output aggregation temporality. Options include `DELTA`, `LOWMEMORY`, and `CUMULATIVE`. If `CUMULATIVE`, all instruments will have cumulative temporality. If `DELTA`, counter (sync and async) and histograms will be delta, up down counters (sync and async) will be cumulative. If `LOWMEMORY`, sync counter and histograms will be delta, async counter and up down counters (sync and async) will be cumulative. Default is `CUMULATIVE`. |
| `OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION` | The preferred default histogram aggregation. Options include `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM` and `EXPLICIT_BUCKET_HISTOGRAM`. Default is `EXPLICIT_BUCKET_HISTOGRAM`.                                                                                                                                                                                                                                                                                    |
| `OTEL_EXPERIMENTAL_EXPORTER_OTLP_RETRY_ENABLED`            | If `true`, enable [experimental retry support](#otlp-exporter-retry). Default is `false`.                                                                                                                                                                                                                                                                                                                                                                     |

To configure the service name for the OTLP exporter, add the `service.name` key
to the OpenTelemetry Resource, e.g.
`OTEL_RESOURCE_ATTRIBUTES=service.name=myservice`.

#### OTLP exporter retry

[OTLP](/docs/specs/otlp/#otlpgrpc-response) requires that
[transient](/docs/specs/otel/protocol/exporter/#retry) errors be handled with a
retry strategy. When retry is enabled, retryable gRPC status codes will be
retried using an exponential backoff with jitter algorithm as described in the
[gRPC Retry Design](https://github.com/grpc/proposal/blob/master/A6-client-retries.md#exponential-backoff).

The policy has the following configuration, which there is currently no way to
customize.

- `maxAttempts`: The maximum number of attempts, including the original request.
  Defaults to `5`.
- `initialBackoff`: The initial backoff duration. Defaults to `1s`
- `maxBackoff`: The maximum backoff duration. Defaults to `5s`.
- `backoffMultiplier` THe backoff multiplier. Defaults to `1.5`.

### Jaeger exporter

The Jaeger exporters (artifacts `opentelemetry-exporter-jaeger` and
`opentelemetry-exporter-jaeger-thrift`) were removed in the
[1.35.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.35.0)
release (last published in `1.34.0`) and are no longer available in later
versions of autoconfigure.

Jaeger now has [native support for OTLP](/blog/2022/jaeger-native-otlp/), and
users should export to Jaeger using [OTLP](/docs/languages/java/exporters/#otlp)
instead.

### Zipkin exporter

The [Zipkin](https://zipkin.io/zipkin-api/) exporter. It sends JSON in
[Zipkin format](https://zipkin.io/zipkin-api/#/default/post_spans) to a
specified HTTP URL.

| Environment variable            | Description                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `OTEL_TRACES_EXPORTER=zipkin`   | Select the Zipkin exporter                                                                                            |
| `OTEL_EXPORTER_ZIPKIN_ENDPOINT` | The Zipkin endpoint to connect to. Default is `http://localhost:9411/api/v2/spans`. Currently only HTTP is supported. |

### Prometheus exporter

The
[Prometheus](https://github.com/prometheus/docs/blob/master/content/docs/instrumenting/exposition_formats.md)
exporter is only available for the metric signal.

| Environment variable               | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `OTEL_METRICS_EXPORTER=prometheus` | Select the Prometheus exporter                                                     |
| `OTEL_EXPORTER_PROMETHEUS_PORT`    | The local port used to bind the prometheus metric server. Default is `9464`.       |
| `OTEL_EXPORTER_PROMETHEUS_HOST`    | The local address used to bind the prometheus metric server. Default is `0.0.0.0`. |

Note that this is a pull exporter - it opens up a server on the local process
listening on the specified host and port, which a Prometheus server scrapes
from.

### Logging exporter

The logging exporter prints the name of the span along with its attributes to
stdout. It's mainly used for testing and debugging.

| Environment variable            | Description                             |
| ------------------------------- | --------------------------------------- |
| `OTEL_TRACES_EXPORTER=console`  | Select the logging exporter for tracing |
| `OTEL_METRICS_EXPORTER=console` | Select the logging exporter for metrics |
| `OTEL_LOGS_EXPORTER=console`    | Select the logging exporter for logs    |

The logging exporter is also set when `OTEL_TRACES_EXPORTER`,
`OTEL_METRICS_EXPORTER`, or `OTEL_LOGS_EXPORTER` is set to `logging`. `logging`
is a deprecated alias for `console`, the preferred value as
[defined in the specification](/docs/specs/otel/configuration/sdk-environment-variables/#exporter-selection).

### Logging OTLP JSON exporter

The logging-otlp exporter writes the telemetry data to the JUL logger in OTLP
JSON form. It's a more verbose output mainly used for testing and debugging.

| Environment variable                 | Description                                       |
| ------------------------------------ | ------------------------------------------------- |
| `OTEL_TRACES_EXPORTER=logging-otlp`  | Select the logging OTLP JSON exporter for tracing |
| `OTEL_METRICS_EXPORTER=logging-otlp` | Select the logging OTLP JSON exporter for metrics |
| `OTEL_LOGS_EXPORTER=logging-otlp`    | Select the logging OTLP JSON exporter for logs    |

**NOTE:** While the `OtlpJsonLogging{Signal}Exporters` are stable, specifying
their use via `OTEL_{signal}_EXPORTER=logging-otlp` is experimental and subject
to change or removal.

## Common instrumentation configuration

Common settings that apply to multiple instrumentations at once.

### Peer service name

The
[peer service name](/docs/specs/semconv/general/attributes/#general-remote-service-attributes)
is the name of a remote service to which a connection is made. It corresponds to
`service.name` in the [resource](/docs/specs/semconv/resource/#service) for the
local service.

{{% config_option name="otel.instrumentation.common.peer-service-mapping" %}}

Used to specify a mapping from host names or IP addresses to peer services, as a
comma-separated list of `<host_or_ip>=<user_assigned_name>` pairs. The peer
service is added as an attribute to a span whose host or IP address match the
mapping.

For example, if set to the following:

    1.2.3.4=cats-service,dogs-abcdef123.serverlessapis.com=dogs-api

Then, requests to `1.2.3.4` will have a `peer.service` attribute of
`cats-service` and requests to `dogs-abcdef123.serverlessapis.com` will have an
attribute of `dogs-api`.

Since Java agent version `1.31.0`, it is possible to provide a port and a path
to define a `peer.service`.

For example, if set to the following:

    1.2.3.4:443=cats-service,dogs-abcdef123.serverlessapis.com:80/api=dogs-api

Then, requests to `1.2.3.4` will have no override for `peer.service` attribute,
while `1.2.3.4:443` will have have `peer.service` of `cats-service` and requests
to `dogs-abcdef123.serverlessapis.com:80/api/v1` will have an attribute of
`dogs-api`.

{{% /config_option %}}

### DB statement sanitization

The agent sanitizes all database queries/statements before setting the
`db.statement` semantic attribute. All values (strings, numbers) in the query
string are replaced with a question mark (`?`).

Note: JDBC bind parameters are not captured in `db.statement`. See
[the corresponding issue](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/7413)
if you are looking to capture bind parameters.

Examples:

- SQL query `SELECT a from b where password="secret"` will appear as
  `SELECT a from b where password=?` in the exported span;
- Redis command `HSET map password "secret"` will appear as
  `HSET map password ?` in the exported span.

This behavior is turned on by default for all database instrumentations. Use the
following property to disable it:

{{% config_option
  name="otel.instrumentation.common.db-statement-sanitizer.enabled"
  default=true
%}} Enables the DB statement sanitization. {{% /config_option %}}

### Capturing HTTP request and response headers

You can configure the agent to capture predefined HTTP headers as span
attributes, according to the
[semantic convention](/docs/specs/semconv/http/http-spans/#common-attributes).
Use the following properties to define which HTTP headers you want to capture:

{{% config_option name="otel.instrumentation.http.client.capture-request-headers" %}}
A comma-separated list of HTTP header names. HTTP client instrumentations will
capture HTTP request header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.client.capture-response-headers" %}}
A comma-separated list of HTTP header names. HTTP client instrumentations will
capture HTTP response header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-request-headers" %}}
A comma-separated list of HTTP header names. HTTP server instrumentations will
capture HTTP request header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-response-headers" %}}
A comma-separated list of HTTP header names. HTTP server instrumentations will
capture HTTP response header values for all configured header names.
{{% /config_option %}}

These configuration options are supported by all HTTP client and server
instrumentations.

> **Note**: The property/environment variable names listed in the table are
> still experimental, and thus are subject to change.

### Capturing servlet request parameters

You can configure the agent to capture predefined HTTP request parameter as span
attributes for requests that are handled by Servlet API. Use the following
property to define which servlet request parameters you want to capture:

{{% config_option name="otel.instrumentation.servlet.experimental.capture-request-parameters" %}}
A comma-separated list of request parameter names. {{% /config_option %}}

> **Note**: The property/environment variable names listed in the table are
> still experimental, and thus are subject to change.

### Capturing consumer message receive telemetry in messaging instrumentations

You can configure the agent to capture the consumer message receive telemetry in
messaging instrumentation. Use the following property to enable it:

{{% config_option
  name="otel.instrumentation.messaging.experimental.receive-telemetry.enabled"
  default=false
%}} Enables the consumer message receive telemetry. {{% /config_option %}}

Note that this will cause the consumer side to start a new trace, with only a
span link connecting it to the producer trace.

> **Note**: The property/environment variable names listed in the table are
> still experimental, and thus are subject to change.

### Capturing enduser attributes

You can configure the agent to capture
[general identity attributes](/docs/specs/semconv/general/attributes/#general-identity-attributes)
(`enduser.id`, `enduser.role`, `enduser.scope`) from instrumentation libraries
like
[JavaEE/JakartaEE Servlet](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/servlet)
and
[Spring Security](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-security-config-6.0).

> **Note**: Given the sensitive nature of the data involved, this feature is
> turned off by default while allowing selective activation for particular
> attributes. You must carefully evaluate each attribute's privacy implications
> before enabling the collection of the data.

{{% config_option
name="otel.instrumentation.common.enduser.enabled"
default=false
%}} Common flag for enabling/disabling enduser attributes. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.id.enabled"
default=false
%}} Determines whether to capture `enduser.id` semantic attribute. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.role.enabled"
default=false
%}} Determines whether to capture `enduser.role` semantic attribute. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.scope.enabled"
default=false
%}} Determines whether to capture `enduser.scope` semantic attribute. {{% /config_option %}}

#### Spring Security

For users of Spring Security who use custom
[granted authority prefixes](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities),
you can use the following properties to strip those prefixes from the
`enduser.*` attribute values to better represent the actual role and scope
names:

{{% config_option
name="otel.instrumentation.spring-security.enduser.role.granted-authority-prefix"
default=ROLE_
%}} Prefix of granted authorities identifying roles to capture in the `enduser.role`
semantic attribute. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.spring-security.enduser.scope.granted-authority-prefix"
default=SCOPE_
%}} Prefix of granted authorities identifying scopes to capture in the `enduser.scopes`
semantic attribute. {{% /config_option %}}

## Suppressing specific auto-instrumentation

### Disabling the agent entirely

{{% config_option name="otel.javaagent.enabled" %}}

Set the value to `false` to disable the agent entirely.

{{% /config_option %}}

### Enable only specific instrumentation

You can disable all default auto instrumentation and selectively re-enable
individual instrumentation. This may be desirable to reduce startup overhead or
to have more control of which instrumentation is applied.

{{% config_option name="otel.instrumentation.common.default-enabled" %}} Set to
`false` to disable all instrumentation in the agent. {{% /config_option %}}

{{% config_option name="otel.instrumentation.[name].enabled" %}} Set to `true`
to enable each desired instrumentation individually. {{% /config_option %}}

> **Note**: Some instrumentation relies on other instrumentation to function
> properly. When selectively enabling instrumentation, be sure to enable the
> transitive dependencies too. Determining this dependency relationship is left
> as an exercise to the user.

### Enable manual instrumentation only

You can suppress all auto instrumentations but have support for manual
instrumentation with `@WithSpan` and normal API interactions by using
`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`

### Suppressing specific agent instrumentation

You can suppress agent instrumentation of specific libraries.

{{% config_option name="otel.instrumentation.[name].enabled" %}} Set to `false`
to suppress agent instrumentation of specific libraries, where [name] is the
corresponding instrumentation name: {{% /config_option %}}

| Library/Framework                                | Instrumentation name                        |
| ------------------------------------------------ | ------------------------------------------- |
| Additional methods tracing                       | `methods`                                   |
| Additional tracing annotations                   | `external-annotations`                      |
| Akka Actor                                       | `akka-actor`                                |
| Akka HTTP                                        | `akka-http`                                 |
| Apache Axis2                                     | `axis2`                                     |
| Apache Camel                                     | `camel`                                     |
| Apache Cassandra                                 | `cassandra`                                 |
| Apache CXF                                       | `cxf`                                       |
| Apache DBCP                                      | `apache-dbcp`                               |
| Apache Dubbo                                     | `apache-dubbo`                              |
| Apache Geode                                     | `geode`                                     |
| Apache HttpAsyncClient                           | `apache-httpasyncclient`                    |
| Apache HttpClient                                | `apache-httpclient`                         |
| Apache Kafka                                     | `kafka`                                     |
| Apache MyFaces                                   | `jsf-myfaces`                               |
| Apache Pekko Actor                               | `pekko-actor`                               |
| Apache Pekko HTTP                                | `pekko-http`                                |
| Apache Pulsar                                    | `pulsar`                                    |
| Apache RocketMQ                                  | `rocketmq-client`                           |
| Apache Struts 2                                  | `struts`                                    |
| Apache Tapestry                                  | `tapestry`                                  |
| Apache Tomcat                                    | `tomcat`                                    |
| Apache Wicket                                    | `wicket`                                    |
| Armeria                                          | `armeria`                                   |
| AsyncHttpClient (AHC)                            | `async-http-client`                         |
| AWS Lambda                                       | `aws-lambda`                                |
| AWS SDK                                          | `aws-sdk`                                   |
| Azure SDK                                        | `azure-core`                                |
| Couchbase                                        | `couchbase`                                 |
| C3P0                                             | `c3p0`                                      |
| Dropwizard Views                                 | `dropwizard-views`                          |
| Dropwizard Metrics                               | `dropwizard-metrics`                        |
| Eclipse Grizzly                                  | `grizzly`                                   |
| Eclipse Jersey                                   | `jersey`                                    |
| Eclipse Jetty                                    | `jetty`                                     |
| Eclipse Jetty HTTP Client                        | `jetty-httpclient`                          |
| Eclipse Metro                                    | `metro`                                     |
| Eclipse Mojarra                                  | `jsf-mojarra`                               |
| Eclipse Vert.x HttpClient                        | `vertx-http-client`                         |
| Eclipse Vert.x Kafka Client                      | `vertx-kafka-client`                        |
| Eclipse Vert.x RxJava                            | `vertx-rx-java`                             |
| Eclipse Vert.x Web                               | `vertx-web`                                 |
| Elasticsearch client                             | `elasticsearch-transport`                   |
| Elasticsearch REST client                        | `elasticsearch-rest`                        |
| Google Guava                                     | `guava`                                     |
| Google HTTP client                               | `google-http-client`                        |
| Google Web Toolkit                               | `gwt`                                       |
| Grails                                           | `grails`                                    |
| GraphQL Java                                     | `graphql-java`                              |
| GRPC                                             | `grpc`                                      |
| Hibernate                                        | `hibernate`                                 |
| HikariCP                                         | `hikaricp`                                  |
| Java HTTP Client                                 | `java-http-client`                          |
| Java `HttpURLConnection`                         | `http-url-connection`                       |
| Java JDBC                                        | `jdbc`                                      |
| Java JDBC `DataSource`                           | `jdbc-datasource`                           |
| Java RMI                                         | `rmi`                                       |
| Java Runtime                                     | `runtime-telemetry`                         |
| Java Servlet                                     | `servlet`                                   |
| java.util.concurrent                             | `executors`                                 |
| java.util.logging                                | `java-util-logging`                         |
| JAX-RS (Client)                                  | `jaxrs-client`                              |
| JAX-RS (Server)                                  | `jaxrs`                                     |
| JAX-WS                                           | `jaxws`                                     |
| JBoss Logging Appender                           | `jboss-logmanager-appender`                 |
| JBoss Logging MDC                                | `jboss-logmanager-mdc`                      |
| JMS                                              | `jms`                                       |
| Jodd HTTP                                        | `jodd-http`                                 |
| JSP                                              | `jsp`                                       |
| K8s Client                                       | `kubernetes-client`                         |
| kotlinx.coroutines                               | `kotlinx-coroutines`                        |
| Log4j Appender                                   | `log4j-appender`                            |
| Log4j MDC (1.x)                                  | `log4j-mdc`                                 |
| Log4j Context Data (2.x)                         | `log4j-context-data`                        |
| Logback Appender                                 | `logback-appender`                          |
| Logback MDC                                      | `logback-mdc`                               |
| Micrometer                                       | `micrometer`                                |
| MongoDB                                          | `mongo`                                     |
| Netflix Hystrix                                  | `hystrix`                                   |
| Netty                                            | `netty`                                     |
| OkHttp                                           | `okhttp`                                    |
| OpenLiberty                                      | `liberty`                                   |
| OpenTelemetry Extension Annotations              | `opentelemetry-extension-annotations`       |
| OpenTelemetry Instrumentation Annotations        | `opentelemetry-instrumentation-annotations` |
| OpenTelemetry API                                | `opentelemetry-api`                         |
| Oracle UCP                                       | `oracle-ucp`                                |
| OSHI (Operating System and Hardware Information) | `oshi`                                      |
| Play Framework                                   | `play`                                      |
| Play WS HTTP Client                              | `play-ws`                                   |
| Quartz                                           | `quartz`                                    |
| R2DBC                                            | `r2dbc`                                     |
| RabbitMQ Client                                  | `rabbitmq`                                  |
| Ratpack                                          | `ratpack`                                   |
| ReactiveX RxJava                                 | `rxjava`                                    |
| Reactor                                          | `reactor`                                   |
| Reactor Netty                                    | `reactor-netty`                             |
| Redis Jedis                                      | `jedis`                                     |
| Redis Lettuce                                    | `lettuce`                                   |
| Rediscala                                        | `rediscala`                                 |
| Redisson                                         | `redisson`                                  |
| Restlet                                          | `restlet`                                   |
| Scala ForkJoinPool                               | `scala-fork-join`                           |
| Spark Web Framework                              | `spark`                                     |
| Spring Batch                                     | `spring-batch`                              |
| Spring Core                                      | `spring-core`                               |
| Spring Data                                      | `spring-data`                               |
| Spring JMS                                       | `spring-jms`                                |
| Spring Integration                               | `spring-integration`                        |
| Spring Kafka                                     | `spring-kafka`                              |
| Spring RabbitMQ                                  | `spring-rabbit`                             |
| Spring RMI                                       | `spring-rmi`                                |
| Spring Scheduling                                | `spring-scheduling`                         |
| Spring Web                                       | `spring-web`                                |
| Spring WebFlux                                   | `spring-webflux`                            |
| Spring Web MVC                                   | `spring-webmvc`                             |
| Spring Web Services                              | `spring-ws`                                 |
| Spymemcached                                     | `spymemcached`                              |
| Tomcat JDBC                                      | `tomcat-jdbc`                               |
| Twilio SDK                                       | `twilio`                                    |
| Twitter Finatra                                  | `finatra`                                   |
| Undertow                                         | `undertow`                                  |
| Vaadin                                           | `vaadin`                                    |
| Vibur DBCP                                       | `vibur-dbcp`                                |
| ZIO                                              | `zio`                                       |

**Note:** When using environment variables, dashes (`-`) should be converted to
underscores (`_`). For example, to suppress traces from `akka-actor` library,
set `OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` to `false`.

### Suppressing controller and/or view spans

Some instrumentations (e.g. Spring Web MVC instrumentation) produce
[SpanKind.Internal](/docs/specs/otel/trace/api/#spankind) spans to capture the
controller and/or view execution. These spans can be suppressed using the
configuration settings below, without suppressing the entire instrumentation
which would also disable the instrumentation's capturing of `http.route` and
associated span name on the parent
[SpanKind.Server](/docs/specs/otel/trace/api/#spankind) span.

{{% config_option
  name="otel.instrumentation.common.experimental.controller-telemetry.enabled"
  default=false
%}} Set to `true` to enable controller telemetry. {{% /config_option %}}

{{% config_option
  name="otel.instrumentation.common.experimental.view-telemetry.enabled"
  default=false
%}} Set to `true` to enable view telemetry. {{% /config_option %}}

### Instrumentation span suppression behavior

Some libraries that this agent instruments in turn use lower-level libraries,
that are also instrumented. This would normally result in nested spans
containing duplicate telemetry data. For example:

- Spans produced by the Reactor Netty HTTP client instrumentation would have
  duplicate HTTP client spans produced by the Netty instrumentation;
- Dynamo DB spans produced by the AWS SDK instrumentation would have children
  HTTP client spans produced by its internal HTTP client library (which is also
  instrumented);
- Spans produced by the Tomcat instrumentation would have duplicate HTTP server
  spans produced by the generic Servlet API instrumentation.

The Java agent prevents these situations by detecting and suppressing nested
spans that duplicate telemetry data. The suppression behavior can be configured
using the following configuration option:

{{% config_option name="otel.instrumentation.experimental.span-suppression-strategy" %}}

The Java agent span suppression strategy. The following 3 strategies are
supported:

- `semconv`: The agent will suppress duplicate semantic conventions. This is the
  default behavior of the Java agent.
- `span-kind`: The agent will suppress spans with the same kind (except
  `INTERNAL`).
- `none`: The agent will not suppress anything at all. **We do not recommend
  using this option for anything other than debug purposes, as it generates lots
  of duplicate telemetry data**.

{{% /config_option %}}

For example, suppose we instrument a database client which internally uses the
Reactor Netty HTTP client; which in turn uses Netty.

Using the default `semconv` suppression strategy would result in 2 nested
`CLIENT` spans:

- `CLIENT` span with database client semantic attributes emitted by the database
  client instrumentation;
- `CLIENT` span with HTTP client semantic attributes emitted by the Reactor
  Netty instrumentation.

The Netty instrumentation would be suppressed, as it duplicates the Reactor
Netty HTTP client instrumentation.

Using the suppression strategy `span-kind` would result in just one span:

- `CLIENT` span with database client semantic attributes emitted by the database
  client instrumentation.

Both Reactor Netty and Netty instrumentations would be suppressed, as they also
emit `CLIENT` spans.

Finally, using the suppression strategy `none` would result in 3 spans:

- `CLIENT` span with database client semantic attributes emitted by the database
  client instrumentation;
- `CLIENT` span with HTTP client semantic attributes emitted by the Reactor
  Netty instrumentation;
- `CLIENT` span with HTTP client semantic attributes emitted by the Netty
  instrumentation.

[extensions]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension#readme
