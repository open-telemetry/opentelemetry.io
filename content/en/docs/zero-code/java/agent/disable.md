---
title: Suppressing specific instrumentation
linkTitle: Suppressing instrumentation
weight: 12
# prettier-ignore
cSpell:ignore: activej akka armeria avaje clickhouse couchbase datasource dbcp Dotel dropwizard dubbo finatra helidon hikari hikaricp httpasyncclient httpclient hystrix javalin jaxrs jaxws jedis jodd kotlinx ktor logback logmanager mojarra mybatis myfaces nats okhttp openai oshi payara pekko rabbitmq ratpack rediscala redisson restlet rocketmq shenyu spymemcached twilio vaadin vertx vibur webflux webmvc
---

## Disabling the agent entirely

{{% config_option name="otel.javaagent.enabled" %}}

Set the value to `false` to disable the agent entirely.

{{% /config_option %}}

## Enable only specific instrumentation

You can disable all default auto instrumentation and selectively re-enable
individual instrumentation. This may be desirable to reduce startup overhead or
to have more control of which instrumentation is applied.

{{% config_option name="otel.instrumentation.common.default-enabled" %}} Set to
`false` to disable all instrumentation in the agent. {{% /config_option %}}

{{% config_option name="otel.instrumentation.[name].enabled" %}} Set to `true`
to enable each desired instrumentation individually. {{% /config_option %}}

{{% alert title="Note" color="warning" %}} Some instrumentation relies on other
instrumentation to function properly. When selectively enabling instrumentation,
be sure to enable the transitive dependencies too. Determining this dependency
relationship is left as an exercise to the user. This is considered advanced
usage and is not recommended for most users. {{% /alert %}}

## Enable manual instrumentation only

You can suppress all auto instrumentations but have support for manual
instrumentation with `@WithSpan` and normal API interactions by using
`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`

## Suppressing specific agent instrumentation

You can suppress agent instrumentation of specific libraries.

{{% config_option name="otel.instrumentation.[name].enabled" %}} Set to `false`
to suppress agent instrumentation of specific libraries, where [name] is the
corresponding instrumentation name: {{% /config_option %}}

| Library/Framework                                | Instrumentation name                        |
| ------------------------------------------------ | ------------------------------------------- |
| Additional methods tracing                       | `methods`                                   |
| Additional tracing annotations                   | `external-annotations`                      |
| Activej HTTP                                     | `activej-http`                              |
| Avaje Jex                                        | `avaje-jex`                                 |
| Akka Actor                                       | `akka-actor`                                |
| Akka HTTP                                        | `akka-http`                                 |
| Alibaba Druid                                    | `alibaba-druid`                             |
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
| Apache Shenyu                                    | `apache-shenyu`                             |
| Apache Struts 2                                  | `struts`                                    |
| Apache Tapestry                                  | `tapestry`                                  |
| Apache Tomcat                                    | `tomcat`                                    |
| Apache Wicket                                    | `wicket`                                    |
| Armeria                                          | `armeria`                                   |
| AsyncHttpClient (AHC)                            | `async-http-client`                         |
| AWS Lambda                                       | `aws-lambda`                                |
| AWS SDK                                          | `aws-sdk`                                   |
| Azure SDK                                        | `azure-core`                                |
| Clickhouse Client                                | `clickhouse`                                |
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
| Eclipse Vert.x Redis Client                      | `vertx-redis-client`                        |
| Eclipse Vert.x RxJava                            | `vertx-rx-java`                             |
| Eclipse Vert.x SQL Client                        | `vertx-sql-client`                          |
| Eclipse Vert.x Web                               | `vertx-web`                                 |
| Elasticsearch API client                         | `elasticsearch-api-client`                  |
| Elasticsearch client                             | `elasticsearch-transport`                   |
| Elasticsearch REST client                        | `elasticsearch-rest`                        |
| Failsafe                                         | `failsafe`                                  |
| Finagle                                          | `finagle-http`                              |
| Google Guava                                     | `guava`                                     |
| Google HTTP client                               | `google-http-client`                        |
| Google Web Toolkit                               | `gwt`                                       |
| Grails                                           | `grails`                                    |
| GraphQL Java                                     | `graphql-java`                              |
| GRPC                                             | `grpc`                                      |
| Helidon                                          | `helidon`                                   |
| Hibernate                                        | `hibernate`                                 |
| Hibernate Reactive                               | `hibernate-reactive`                        |
| HikariCP                                         | `hikaricp`                                  |
| InfluxDB                                         | `influxdb`                                  |
| Java HTTP Client                                 | `java-http-client`                          |
| Java HTTP Server                                 | `java-http-server`                          |
| Java `HttpURLConnection`                         | `http-url-connection`                       |
| Java JDBC                                        | `jdbc`                                      |
| Java JDBC `DataSource`                           | `jdbc-datasource`                           |
| Java RMI                                         | `rmi`                                       |
| Java Runtime                                     | `runtime-telemetry`                         |
| Java Servlet                                     | `servlet`                                   |
| java.util.concurrent                             | `executors`                                 |
| java.util.logging                                | `java-util-logging`                         |
| Javalin                                          | `javalin`                                   |
| JAX-RS (Client)                                  | `jaxrs-client`                              |
| JAX-RS (Server)                                  | `jaxrs`                                     |
| JAX-WS                                           | `jaxws`                                     |
| JBoss Logging Appender                           | `jboss-logmanager-appender`                 |
| JBoss Logging MDC                                | `jboss-logmanager-mdc`                      |
| JMS                                              | `jms`                                       |
| Jodd HTTP                                        | `jodd-http`                                 |
| JSP                                              | `jsp`                                       |
| K8s Client                                       | `kubernetes-client`                         |
| Ktor                                             | `ktor`                                      |
| kotlinx.coroutines                               | `kotlinx-coroutines`                        |
| Log4j Appender                                   | `log4j-appender`                            |
| Log4j MDC (1.x)                                  | `log4j-mdc`                                 |
| Log4j Context Data (2.x)                         | `log4j-context-data`                        |
| Logback Appender                                 | `logback-appender`                          |
| Logback MDC                                      | `logback-mdc`                               |
| Micrometer                                       | `micrometer`                                |
| MongoDB                                          | `mongo`                                     |
| MyBatis                                          | `mybatis`                                   |
| NATS Client                                      | `nats`                                      |
| Netflix Hystrix                                  | `hystrix`                                   |
| Netty                                            | `netty`                                     |
| OkHttp                                           | `okhttp`                                    |
| OpenLiberty                                      | `liberty`                                   |
| OpenAI                                           | `openai`                                    |
| OpenSearch Java                                  | `opensearch-java`                           |
| OpenSearch REST                                  | `opensearch-rest`                           |
| OpenTelemetry Extension Annotations              | `opentelemetry-extension-annotations`       |
| OpenTelemetry Instrumentation Annotations        | `opentelemetry-instrumentation-annotations` |
| OpenTelemetry API                                | `opentelemetry-api`                         |
| Oracle UCP                                       | `oracle-ucp`                                |
| OSHI (Operating System and Hardware Information) | `oshi`                                      |
| Payara                                           | `payara`                                    |
| Play Framework                                   | `play`                                      |
| Play WS HTTP Client                              | `play-ws`                                   |
| Powerjob                                         | `powerjob`                                  |
| Quarkus                                          | `quarkus`                                   |
| Quartz                                           | `quartz`                                    |
| R2DBC                                            | `r2dbc`                                     |
| RabbitMQ Client                                  | `rabbitmq`                                  |
| Ratpack                                          | `ratpack`                                   |
| ReactiveX RxJava                                 | `rxjava`                                    |
| Reactor                                          | `reactor`                                   |
| Reactor Kafka                                    | `reactor-kafka`                             |
| Reactor Netty                                    | `reactor-netty`                             |
| Redis Jedis                                      | `jedis`                                     |
| Redis Lettuce                                    | `lettuce`                                   |
| Rediscala                                        | `rediscala`                                 |
| Redisson                                         | `redisson`                                  |
| Restlet                                          | `restlet`                                   |
| Scala ForkJoinPool                               | `scala-fork-join`                           |
| Spark Web Framework                              | `spark`                                     |
| Spring Batch                                     | `spring-batch`                              |
| Spring Boot Actuator Autoconfigure               | `spring-boot-actuator-autoconfigure`        |
| Spring Cloud AWS                                 | `spring-cloud-aws`                          |
| Spring Cloud Gateway                             | `spring-cloud-gateway`                      |
| Spring Core                                      | `spring-core`                               |
| Spring Data                                      | `spring-data`                               |
| Spring JMS                                       | `spring-jms`                                |
| Spring Integration                               | `spring-integration`                        |
| Spring Kafka                                     | `spring-kafka`                              |
| Spring Pulsar                                    | `spring-pulsar`                             |
| Spring RabbitMQ                                  | `spring-rabbit`                             |
| Spring RMI                                       | `spring-rmi`                                |
| Spring Scheduling                                | `spring-scheduling`                         |
| Spring Security Config                           | `spring-security-config`                    |
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
| XXL-JOB                                          | `xxl-job`                                   |
| ZIO                                              | `zio`                                       |

**Note:** When using environment variables, dashes (`-`) should be converted to
underscores (`_`). For example, to suppress traces from `akka-actor` library,
set `OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` to `false`.

## Suppressing controller and/or view spans

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

## Instrumentation span suppression behavior

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
