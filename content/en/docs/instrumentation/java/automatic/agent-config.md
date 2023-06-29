---
title: Agent Configuration
linkTitle: Configuration
weight: 10
spelling:
  cSpell:ignore akka autoconfiguration Autoconfiguration Dotel HSET javaagent
  cSpell:ignore serverlessapis Servlet servlet Customizer classloaders logback
  cSpell:ignore jdbc cassandra dbcp dubbo httpclient httpasyncclient myfaces
  cSpell:ignore rocketmq armeria couchbase dropwizard mojarra vertx hikari
  cSpell:ignore hikaricp jaxrs logmanager jaxws jboss jodd kotlinx hystrix vibur
  cSpell:ignore okhttp oshi rabbitmq ratpack jedis rediscala redisson restlet
  cSpell:ignore webflux webmvc spymemcached twilio finatra vaadin datasource
---

## SDK Autoconfiguration

The SDK's autoconfiguration module is used for basic configuration of the agent.
Read the
[docs](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure)
to find settings such as configuring export or sampling.

Here are some quick links into those docs for the configuration options for
specific portions of the SDK & agent:

- [Exporters](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#exporters)
  - [OTLP exporter (both span and metric exporters)](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#otlp-exporter-both-span-and-metric-exporters)
  - [Jaeger exporter](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#jaeger-exporter)
  - [Zipkin exporter](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#zipkin-exporter)
  - [Prometheus exporter](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#prometheus-exporter)
  - [Logging exporter](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#logging-exporter)
- [Trace context propagation](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#propagator)
- [OpenTelemetry Resource and service name](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#opentelemetry-resource)
- [Batch span processor](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#batch-span-processor)
- [Sampler](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#sampler)
- [Span limits](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#span-limits)
- [Using SPI to further configure the SDK](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure/README.md#customizing-the-opentelemetry-sdk)

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

### Javaagent logging output

The agent's logging output can be configured by setting the following property:

{{% config_option name="otel.javaagent.logging" %}}

The javaagent logging mode. The following 3 modes are supported:

- `simple`: The agent will print out its logs using the standard error stream.
  Only `INFO` or higher logs will be printed. This is the default javaagent
  logging mode.
- `none`: The agent will not log anything - not even its own version.
- `application`: The agent will attempt to redirect its own logs to the
  instrumented application's slf4j logger. This works the best for simple
  one-jar applications that do not use multiple classloaders; Spring Boot apps
  are supported as well. The javaagent output logs can be further configured
  using the instrumented application's logging configuration (e.g. `logback.xml`
  or `log4j2.xml`). **Make sure to test that this mode works for your
  application before running it in a production environment.**

{{% /config_option %}}

## Common instrumentation configuration

Common settings that apply to multiple instrumentations at once.

### Peer service name

The
[peer service name](/docs/specs/otel/trace/semantic_conventions/span-general/#general-remote-service-attributes)
is the name of a remote service to which a connection is made. It corresponds to
`service.name` in the
[resource](/docs/specs/otel/resource/semantic_conventions/#service) for the
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

{{% /config_option %}}

### DB statement sanitization

The agent sanitizes all database queries/statements before setting the
`db.statement` semantic attribute. All values (strings, numbers) in the query
string are replaced with a question mark (`?`).

Note: JDBC bind parameters are not captured in `db.statement`. See
[the corresponding issue](https://github.com/open-telemetry/opentelemetry-java-instrumentation#7413)
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
[semantic convention](/docs/specs/otel/trace/semantic_conventions/http/#http-request-and-response-headers).
Use the following properties to define which HTTP headers you want to capture:

{{% config_option name="otel.instrumentation.http.capture-headers.client.request" %}}
A comma-separated list of HTTP header names. HTTP client instrumentations will
capture HTTP request header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.capture-headers.client.response" %}}
A comma-separated list of HTTP header names. HTTP client instrumentations will
capture HTTP response header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.capture-headers.server.request" %}}
A comma-separated list of HTTP header names. HTTP server instrumentations will
capture HTTP request header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.capture-headers.server.response" %}}
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

## Suppressing specific auto-instrumentation

### Disabling the agent entirely

You can disable the agent using `-Dotel.javaagent.enabled=false` (or using the
equivalent environment variable `OTEL_JAVAAGENT_ENABLED=false`).

### Enable only specific instrumentation

You can disable all default auto instrumentation and selectively re-enable
individual instrumentation. This may be desirable to reduce startup overhead or
to have more control of which instrumentation is applied.

- Disable all instrumentation in the agent using
  `-Dotel.instrumentation.common.default-enabled=false` (or using the equivalent
  environment variable `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false`).
- Enable each desired instrumentation individually using
  `-Dotel.instrumentation.[name].enabled=true` (or using the equivalent
  environment variable `OTEL_INSTRUMENTATION_[NAME]_ENABLED`) where `[name]`
  (`[NAME]`) is the corresponding instrumentation `name` below.

> **Note**: Some instrumentation relies on other instrumentation to function
> properly. When selectively enabling instrumentation, be sure to enable the
> transitive dependencies too. Determining this dependency relationship is left
> as an exercise to the user.

### Enable manual instrumentation only

You can suppress all auto instrumentations but have support for manual
instrumentation with `@WithSpan` and normal API interactions by using
`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`

### Suppressing specific agent instrumentation

You can suppress agent instrumentation of specific libraries by using
`-Dotel.instrumentation.[name].enabled=false` (or using the equivalent
environment variable `OTEL_INSTRUMENTATION_[NAME]_ENABLED`) where `name`
(`NAME`) is the corresponding instrumentation `name`:

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
| Java Runtime                                     | `runtime-metrics`                           |
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
  default=true
%}} Enables the controller telemetry. {{% /config_option %}}

{{% config_option
  name="otel.instrumentation.common.experimental.view-telemetry.enabled"
  default=true
%}} Enables the view telemetry. {{% /config_option %}}

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

The javaagent prevents these situations by detecting and suppressing nested
spans that duplicate telemetry data. The suppression behavior can be configured
using the following configuration option:

{{% config_option name="otel.instrumentation.experimental.span-suppression-strategy" %}}

The javaagent span suppression strategy. The following 3 strategies are
supported:

- `semconv`: The agent will suppress duplicate semantic conventions. This is the
  default behavior of the javaagent.
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
