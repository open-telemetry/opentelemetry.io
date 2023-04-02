---
title: Agent Configuration
linkTitle: Configuration
weight: 2
spelling:
  cSpell:ignore akka autoconfiguration Autoconfiguration Dotel HSET javaagent
  cSpell:ignore serverlessapis Servlet servlet
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
- environment variables
- the [configuration file](#configuration-file)
- the
  [`ConfigPropertySource`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/javaagent-extension-api/src/main/java/io/opentelemetry/javaagent/extension/config/ConfigPropertySource.java)
  SPI

## Configuring with Environment Variables

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

## Common instrumentation configuration

Common settings that apply to multiple instrumentations at once.

### Peer service name

The
[peer service name](/docs/reference/specification/trace/semantic_conventions/span-general/#general-remote-service-attributes)
is the name of a remote service to which a connection is made. It corresponds to
`service.name` in the
[resource](/docs/reference/specification/resource/semantic_conventions/#service)
for the local service.

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
[semantic convention](/docs/reference/specification/trace/semantic_conventions/http/#http-request-and-response-headers).
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
individual instrumentation. This may be desireable to reduce startup overhead or
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

| Library/Framework                                | Instrumentation name                      |
| ------------------------------------------------ | ----------------------------------------- |
| Additional methods tracing                       | methods                                   |
| Additional tracing annotations                   | external-annotations                      |
| Akka Actor                                       | akka-actor                                |
| Akka HTTP                                        | akka-http                                 |
| Apache Axis2                                     | axis2                                     |
| Apache Camel                                     | apache-camel                              |
| Apache Cassandra                                 | cassandra                                 |
| Apache CXF                                       | cxf                                       |
| Apache DBCP                                      | apache-dbcp                               |
| Apache Dubbo                                     | apache-dubbo                              |
| Apache Geode                                     | geode                                     |
| Apache HttpAsyncClient                           | apache-httpasyncclient                    |
| Apache HttpClient                                | apache-httpclient                         |
| Apache Kafka                                     | kafka                                     |
| Apache MyFaces                                   | myfaces                                   |
| Apache RocketMQ                                  | rocketmq-client                           |
| Apache Struts 2                                  | struts                                    |
| Apache Tapestry                                  | tapestry                                  |
| Apache Tomcat                                    | tomcat                                    |
| Apache Wicket                                    | wicket                                    |
| Armeria                                          | armeria                                   |
| AsyncHttpClient (AHC)                            | async-http-client                         |
| AWS Lambda                                       | aws-lambda                                |
| AWS SDK                                          | aws-sdk                                   |
| Azure SDK                                        | azure-core                                |
| Couchbase                                        | couchbase                                 |
| C3P0                                             | c3p0                                      |
| Dropwizard Views                                 | dropwizard-views                          |
| Dropwizard Metrics                               | dropwizard-metrics                        |
| Eclipse Grizzly                                  | grizzly                                   |
| Eclipse Jersey                                   | jersey                                    |
| Eclipse Jetty                                    | jetty                                     |
| Eclipse Jetty HTTP Client                        | jetty-httpclient                          |
| Eclipse Metro                                    | metro                                     |
| Eclipse Mojarra                                  | mojarra                                   |
| Eclipse Vert.x HttpClient                        | vertx-http-client                         |
| Eclipse Vert.x Kafka Client                      | vertx-kafka-client                        |
| Eclipse Vert.x RxJava                            | vertx-rx-java                             |
| Eclipse Vert.x Web                               | vertx-web                                 |
| Elasticsearch client                             | elasticsearch-transport                   |
| Elasticsearch REST client                        | elasticsearch-rest                        |
| Google Guava                                     | guava                                     |
| Google HTTP client                               | google-http-client                        |
| Google Web Toolkit                               | gwt                                       |
| Grails                                           | grails                                    |
| GraphQL Java                                     | graphql-java                              |
| GRPC                                             | grpc                                      |
| Hibernate                                        | hibernate                                 |
| HikariCP                                         | hikaricp                                  |
| Java HTTP Client                                 | java-http-client                          |
| Java `HttpURLConnection`                         | http-url-connection                       |
| Java JDBC                                        | jdbc                                      |
| Java JDBC `DataSource`                           | jdbc-datasource                           |
| Java RMI                                         | rmi                                       |
| Java Servlet                                     | servlet                                   |
| java.util.concurrent                             | executor                                  |
| java.util.logging                                | java-util-logging                         |
| JAX-RS (Client)                                  | jaxrs-client                              |
| JAX-RS (Server)                                  | jaxrs                                     |
| JAX-WS                                           | jaxws                                     |
| JBoss Logging Appender                           | jboss-logmanager-appender                 |
| JBoss Logging MDC                                | jboss-logmanager-mdc                      |
| JMS                                              | jms                                       |
| JSP                                              | jsp                                       |
| K8s Client                                       | kubernetes-client                         |
| kotlinx.coroutines                               | kotlinx-coroutines                        |
| Log4j Appender                                   | log4j-appender                            |
| Log4j MDC (1.x)                                  | log4j-mdc                                 |
| Log4j Context Data (2.x)                         | log4j-context-data                        |
| Logback Appender                                 | logback-appender                          |
| Logback MDC                                      | logback-mdc                               |
| Micrometer                                       | micrometer                                |
| MongoDB                                          | mongo                                     |
| Netflix Hystrix                                  | hystrix                                   |
| Netty                                            | netty                                     |
| OkHttp                                           | okhttp                                    |
| OpenLiberty                                      | liberty                                   |
| OpenTelemetry Extension Annotations              | opentelemetry-extension-annotations       |
| OpenTelemetry Instrumentation Annotations        | opentelemetry-instrumentation-annotations |
| OpenTelemetry API                                | opentelemetry-api                         |
| Oracle UCP                                       | oracle-ucp                                |
| OSHI (Operating System and Hardware Information) | oshi                                      |
| Play Framework                                   | play                                      |
| Play WS HTTP Client                              | play-ws                                   |
| Quartz                                           | quartz                                    |
| RabbitMQ Client                                  | rabbitmq                                  |
| Ratpack                                          | ratpack                                   |
| ReactiveX RxJava                                 | rxjava                                    |
| Reactor                                          | reactor                                   |
| Reactor Netty                                    | reactor-netty                             |
| Redis Jedis                                      | jedis                                     |
| Redis Lettuce                                    | lettuce                                   |
| Rediscala                                        | rediscala                                 |
| Redisson                                         | redisson                                  |
| Restlet                                          | restlet                                   |
| Scala ForkJoinPool                               | scala-fork-join                           |
| Spark Web Framework                              | spark                                     |
| Spring Batch                                     | spring-batch                              |
| Spring Core                                      | spring-core                               |
| Spring Data                                      | spring-data                               |
| Spring JMS                                       | spring-jms                                |
| Spring Integration                               | spring-integration                        |
| Spring Kafka                                     | spring-kafka                              |
| Spring RabbitMQ                                  | spring-rabbit                             |
| Spring RMI                                       | spring-rmi                                |
| Spring Scheduling                                | spring-scheduling                         |
| Spring Web                                       | spring-web                                |
| Spring WebFlux                                   | spring-webflux                            |
| Spring Web MVC                                   | spring-webmvc                             |
| Spring Web Services                              | spring-ws                                 |
| Spymemcached                                     | spymemcached                              |
| Tomcat JDBC                                      | tomcat-jdbc                               |
| Twilio SDK                                       | twilio                                    |
| Twitter Finatra                                  | finatra                                   |
| Undertow                                         | undertow                                  |
| Vaadin                                           | vaadin                                    |
| Vibur DBCP                                       | vibur-dbcp                                |

**Note:** When using environment variables, dashes (`-`) should be converted to
underscores (`_`). For example, to suppress traces from `akka-actor` library,
set `OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` to `false`.

### Suppressing controller and/or view spans

Some instrumentations (e.g. Spring Web MVC instrumentation) produce
[SpanKind.Internal](/docs/reference/specification/trace/api/#spankind) spans to
capture the controller and/or view execution. These spans can be suppressed
using the configuration settings below, without suppressing the entire
instrumentation which would also disable the instrumentation's capturing of
`http.route` and associated span name on the parent
[SpanKind.Server](/docs/reference/specification/trace/api/#spankind) span.

{{% config_option
  name="otel.instrumentation.common.experimental.controller-telemetry.enabled"
  default=true
%}} Enables the controller telemetry. {{% /config_option %}}

{{% config_option
  name="otel.instrumentation.common.experimental.view-telemetry.enabled"
  default=true
%}} Enables the view telemetry. {{% /config_option %}}

### Instrumentation span suppression behavior

Some of the libraries that this agent instruments in turn use lower-level
libraries, that are also instrumented. This results in nested `CLIENT` spans (a
span with the kind `CLIENT` has a child span with the same kind `CLIENT`). For
example spans produced by Reactor Netty instrumentation will have children spans
produced by Netty instrumentation. Or Dynamo DB spans produced by AWS SDK
instrumentation will have children spans produced by http protocol library
instrumentation.

By default the agent will suppress nested `CLIENT` spans for the same semantic
convention.

By setting `-Dotel.instrumentation.experimental.span-suppression-strategy` you
can enable a different suppression strategy.

For example, if we have a database client which uses Reactor Netty http client
which uses Netty networking library, then with the default suppression strategy
(`semconv`), we would have 2 nested spans:

- `CLIENT` span with database semantic attributes from the database client
  instrumentation
- `CLIENT` span with http semantic attributes from Reactor Netty instrumentation

With suppression strategy of `span-kind`, we would have 1 span:

- `CLIENT` span with database semantic attributes from the database client
  instrumentation

And with suppression strategy of `none`, we would have 3 nested spans:

- `CLIENT` span with database semantic attributes from the database client
  instrumentation
- `CLIENT` span with http semantic attributes from Reactor Netty instrumentation
- `CLIENT` span with http semantic attributes from Netty instrumentation

[extensions]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension#readme
