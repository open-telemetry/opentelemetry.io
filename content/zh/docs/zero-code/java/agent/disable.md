---
title: 禁用特定插桩
linkTitle: 禁用插桩
weight: 12
default_lang_commit: 2cb66a7e093114cfe06eb70dbca46abbbee45ef2
drifted_from_default: true
# prettier-ignore
cSpell:ignore: activej akka armeria avaje clickhouse couchbase datasource dbcp Dotel dropwizard dubbo finatra hikari hikaricp httpasyncclient httpclient hystrix javalin jaxrs jaxws jedis jodd kotlinx ktor logback logmanager mojarra mybatis myfaces okhttp openai oshi payara pekko rabbitmq ratpack rediscala redisson restlet rocketmq shenyu spymemcached twilio vaadin vertx vibur webflux webmvc
---

## 完全禁用代理 {#disabling-the-agent-entirely}

{{% config_option name="otel.javaagent.enabled" %}}

将值设置为 `false` 可完全禁用代理。

{{% /config_option %}}

## 仅启用特定插桩 {#enable-only-specific-instrumentation}

你可以禁用所有默认的自动插桩，并有选择地重新启用单个插桩。
这可能有助于减少启动开销，或更好地控制要应用哪些插桩。

{{% config_option name="otel.instrumentation.common.default-enabled" %}}
设置为 `false` 以禁用代理中的所有插桩。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.[name].enabled" %}}
设置为 `true` 以单独启用每个所需的插桩。
{{% /config_option %}}

{{% alert title="注意" color="warning" %}}
某些插桩依赖于其他插桩才能正常工作。
在选择性启用插桩时，务必同时启用其传递依赖项。
确定这种依赖关系需要用户自行研究。
这被视为高级用法，不推荐大多数用户使用。
{{% /alert %}}

## 仅启用手动插桩 {#enable-manual-instrumentation-only}

你可以通过使用
`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`
来禁用所有自动插桩，但保留对带有 `@WithSpan` 的手动插桩和正常 API 交互的支持。

## 禁用特定代理插桩 {#suppressing-specific-agent-instrumentation}

你可以禁用代理对特定库的插桩。

{{% config_option name="otel.instrumentation.[name].enabled" %}}
设置为 `false` 以禁用代理对特定库的插桩，其中 [name] 是相应的插桩名称：
{{% /config_option %}}

| 库 / 框架                                        | 插桩名称                                    |
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
| Finagle                                          | `finagle-http`                              |
| Google Guava                                     | `guava`                                     |
| Google HTTP client                               | `google-http-client`                        |
| Google Web Toolkit                               | `gwt`                                       |
| Grails                                           | `grails`                                    |
| GraphQL Java                                     | `graphql-java`                              |
| GRPC                                             | `grpc`                                      |
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
| Netflix Hystrix                                  | `hystrix`                                   |
| Netty                                            | `netty`                                     |
| OkHttp                                           | `okhttp`                                    |
| OpenLiberty                                      | `liberty`                                   |
| OpenAI                                           | `openai`                                    |
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

**注意：** 使用环境变量时，破折号（`-`）应转换为下划线（`_`）。
例如，要禁用来自 `akka-actor` 库的跟踪，请将 `OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` 设置为 `false`。

## 禁用控制器视图 Span {#suppressing-controller-andor-view-spans}

某些插桩（例如 Spring Web MVC 插桩）会生成 [SpanKind.Internal](/docs/specs/otel/trace/api/#spankind) Span 来捕获控制器、视图的执行情况。
可以使用以下配置设置来禁用这些 Span，而无需禁用整个插桩，
禁用整个插桩还会取消该插桩对父级 [SpanKind.Server](/docs/specs/otel/trace/api/#spankind) Span 上 `http.route` 和相关 Span 名称的捕获。

{{% config_option
name="otel.instrumentation.common.experimental.controller-telemetry.enabled"
default=false
%}} 设置为 `true` 以启用控制器遥测。 {{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.experimental.view-telemetry.enabled"
default=false
%}} 设置为 `true` 以启用视图遥测。 {{% /config_option %}}

## 插桩 Span 禁用行为 {#instrumentation-span-suppression-behavior}

此代理所插桩的某些库会转而使用更低级别的库，而这些更低级别的库也会被插桩。
这通常会导致嵌套的 Span 包含重复的遥测数据。例如：

- Reactor Netty HTTP 客户端插桩产生的 Span 会与 Netty 插桩产生的 HTTP 客户端 Span 重复；
- AWS SDK 插桩产生的 Dynamo DB Span 会包含由其内部 HTTP 客户端库（该库也会被插桩）产生的子 HTTP 客户端 Span；
- Tomcat 插桩产生的 Span 会与通用 Servlet API 插桩产生的 HTTP 服务器 Span 重复。

Java 代理通过检测并禁用包含重复遥测数据的嵌套 Span 来防止这些情况。
可以使用以下配置选项配置禁用行为：

{{% config_option name="otel.instrumentation.experimental.span-suppression-strategy" %}}

Java 代理的 Span 禁用策略。支持以下 3 种策略：

- `semconv`：代理将禁用重复的语义约定。这是 Java 代理的默认行为。
- `span-kind`：代理将禁用相同类型的 Span（除了 `INTERNAL`）。
- `none`：代理将根本不禁用任何内容。**我们不建议使用此选项进行除调试以外的任何其他用途，因为它会生成大量重复的遥测数据**。

{{% /config_option %}}

例如，假设我们对一个数据库客户端进行插桩，该客户端在内部使用 Reactor Netty HTTP 客户端；
而 Reactor Netty HTTP 客户端又会使用 Netty。

使用默认的 `semconv` 禁用策略将导致 2 个嵌套的 `CLIENT` Span：

- 由数据库客户端插桩发出的具有数据库客户端语义属性的 `CLIENT` Span；
- 由 Reactor Netty 插桩发出的具有 HTTP 客户端语义属性的 `CLIENT` Span；

Netty 插桩会被禁用，因为它会重复 Reactor Netty HTTP 客户端插桩。

使用 `span-kind` 禁用策略将仅产生 1 个 `CLIENT` Span：

- 由数据库客户端插桩发出的具有数据库客户端语义属性的 `CLIENT` Span；

Reactor Netty 和 Netty 插桩都会被禁用，因为它们也会发出 `CLIENT` Span。

最后，使用 `none` 禁用策略将产生 3 个 `CLIENT` Span：

- 由数据库客户端插桩发出的具有数据库客户端语义属性的 `CLIENT` Span；
- 由 Reactor Netty 插桩发出的具有 HTTP 客户端语义属性的 `CLIENT` Span；
- 由 Netty 插桩发出的具有 HTTP 客户端语义属性的 `CLIENT` Span；
