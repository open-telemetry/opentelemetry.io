---
title: 特定の計装の抑制
linkTitle: 計装の抑制
weight: 12
default_lang_commit: 7b845384b1b55e20b254d452d4dcf45e983e243c
# prettier-ignore
cSpell:ignore: activej akka armeria avaje clickhouse couchbase datasource dbcp Dotel dropwizard dubbo elasticjob finatra helidon hikari hikaricp httpasyncclient httpclient hystrix javalin jaxrs jaxws jedis jfinal jodd kotlinx ktor logmanager mojarra mybatis myfaces nats okhttp openai oshi payara pekko powerjob rabbitmq ratpack rediscala redisson restlet rocketmq shenyu spymemcached twilio vaadin vertx vibur webflux webmvc
---

## エージェントを完全に無効にする {#disabling-the-agent-entirely}

{{% config_option name="otel.javaagent.enabled" %}}

値を `false` に設定すると、エージェントが完全に無効になります。

{{% /config_option %}}

## 特定の計装のみを有効にする {#enable-only-specific-instrumentation}

すべてのデフォルトの自動計装を無効にし、個々の計装を選択的に再有効化できます。
これは、起動時のオーバーヘッドを削減したい場合や、どの計装を適用するかをより細かく制御したい場合に便利です。

{{% config_option name="otel.instrumentation.common.default-enabled" %}} `false` に設定すると、エージェント内のすべての計装が無効になります。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.[name].enabled" %}} `true` に設定すると、目的の計装を個別に有効にできます。
{{% /config_option %}}

> [!WARNING]
>
> 一部の計装は、正しく機能するために他の計装に依存しています。
> 計装を選択的に有効にする場合は、推移的な依存関係も有効にしてください。
> この依存関係の特定はユーザーに委ねられています。
> これは上級者向けの使い方であり、ほとんどのユーザーには推奨されません。

## 手動計装のみを有効にする {#enable-manual-instrumentation-only}

すべての自動計装を抑制しつつ、`@WithSpan` や通常の API 操作による手動計装をサポートするには、`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true` を使用します。

## 特定のエージェント計装の抑制 {#suppressing-specific-agent-instrumentation}

特定のライブラリに対するエージェント計装を抑制できます。

{{% config_option name="otel.instrumentation.[name].enabled" %}} `false` に設定すると、特定のライブラリに対するエージェント計装を抑制できます。
`[name]` は対応する計装名です。
{{% /config_option %}}

| ライブラリ/フレームワーク                        | 計装名                                      |
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
| Apache ElasticJob                                | `apache-elasticjob`                         |
| Apache Geode                                     | `geode`                                     |
| Apache HttpAsyncClient                           | `apache-httpasyncclient`                    |
| Apache HttpClient                                | `apache-httpclient`                         |
| Apache Iceberg                                   | `iceberg`                                   |
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
| JFinal                                           | `jfinal`                                    |
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

**注意:** 環境変数を使用する場合、ダッシュ（`-`）はアンダースコア（`_`）に変換する必要があります。
たとえば、`akka-actor` ライブラリからのトレースを抑制するには、`OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` を `false` に設定します。

## コントローラーやビュースパンの抑制 {#suppressing-controller-andor-view-spans}

一部の計装（たとえば Spring Web MVC 計装）は、コントローラーやビューの実行をキャプチャするために [SpanKind.Internal](/docs/specs/otel/trace/api/#spankind) スパンを生成します。
これらのスパンは、以下の設定を使用して抑制できます。
計装全体を抑制すると、`http.route` のキャプチャや、親の [SpanKind.Server](/docs/specs/otel/trace/api/#spankind) スパンに関連付けられたスパン名も無効になりますが、この設定ではそれらを維持したまま抑制できます。

{{% config_option
name="otel.instrumentation.common.experimental.controller-telemetry.enabled"
default=false
%}} `true` に設定すると、コントローラーテレメトリーが有効になります。
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.experimental.view-telemetry.enabled"
default=false
%}} `true` に設定すると、ビューテレメトリーが有効になります。
{{% /config_option %}}

## 計装のスパン抑制動作 {#instrumentation-span-suppression-behavior}

このエージェントが計装するライブラリの中には、同様に計装される低レベルのライブラリを使用するものがあります。
通常、これにより重複するテレメトリーデータを含むネストされたスパンが生成されます。
たとえば、次のようなケースがあります。

- Reactor Netty HTTP クライアント計装によって生成されたスパンに、Netty 計装によって生成された重複する HTTP クライアントスパンが含まれる。
- AWS SDK 計装によって生成された Dynamo DB スパンに、内部 HTTP クライアントライブラリ（同様に計装されている）によって生成された子 HTTP クライアントスパンが含まれる。
- Tomcat 計装によって生成されたスパンに、汎用の Servlet API 計装によって生成された重複する HTTP サーバースパンが含まれる。

Java エージェントは、テレメトリーデータを重複させるネストされたスパンを検出し抑制することで、これらの状況を防ぎます。
抑制の動作は、以下の設定オプションで構成できます。

{{% config_option name="otel.instrumentation.experimental.span-suppression-strategy" %}}

Java エージェントのスパン抑制戦略です。
以下の 3 つの戦略がサポートされています。

- `semconv`: エージェントは重複するセマンティック規約を抑制します。
  これは Java エージェントのデフォルトの動作です。
- `span-kind`: エージェントは同じ種類のスパン（`INTERNAL` を除く）を抑制します。
- `none`: エージェントは何も抑制しません。
  **このオプションはデバッグ目的以外での使用は推奨しません。大量の重複テレメトリーデータが生成されます**。

{{% /config_option %}}

たとえば、内部で Reactor Netty HTTP クライアントを使用するデータベースクライアントを計装し、さらにその Reactor Netty が Netty を使用しているとします。

デフォルトの `semconv` 抑制戦略を使用すると、2 つのネストされた `CLIENT` スパンが生成されます。

- データベースクライアント計装によって出力された、データベースクライアントのセマンティック属性を持つ `CLIENT` スパン。
- Reactor Netty 計装によって出力された、HTTP クライアントのセマンティック属性を持つ `CLIENT` スパン。

Netty 計装は、Reactor Netty HTTP クライアント計装と重複するため抑制されます。

抑制戦略 `span-kind` を使用すると、スパンは 1 つだけになります。

- データベースクライアント計装によって出力された、データベースクライアントのセマンティック属性を持つ `CLIENT` スパン。

Reactor Netty と Netty の両方の計装は、同じく `CLIENT` スパンを出力するため抑制されます。

最後に、抑制戦略 `none` を使用すると、3 つのスパンが生成されます。

- データベースクライアント計装によって出力された、データベースクライアントのセマンティック属性を持つ `CLIENT` スパン。
- Reactor Netty 計装によって出力された、HTTP クライアントのセマンティック属性を持つ `CLIENT` スパン。
- Netty 計装によって出力された、HTTP クライアントのセマンティック属性を持つ `CLIENT` スパン。
