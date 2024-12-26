---
title: Придушення конкретної інструментації
linkTitle: Придушення інструментації
weight: 12
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: activej akka armeria avaje clickhouse couchbase datasource dbcp Dotel dropwizard dubbo elasticjob finatra helidon hikari hikaricp httpasyncclient httpclient hystrix javalin jaxrs jaxws jedis jfinal jodd kotlinx ktor logmanager mojarra mybatis myfaces nats okhttp openai oshi payara pekko powerjob rabbitmq ratpack rediscala redisson restlet rocketmq shenyu spymemcached twilio vaadin vertx vibur webflux webmvc
---

## Вимкнення агента повністю {#disabling-agent-entirely}

{{% config_option name="otel.javaagent.enabled" %}}

Встановіть значення `false`, щоб повністю вимкнути агента.

{{% /config_option %}}

## Увімкнення лише конкретної інструментації {#enabling-only-specific-instrumentation}

Ви можете вимкнути всю автоматичну стандартну інструментацію і вибірково знову увімкнути окремі інструментації. Це може бути бажано для зменшення часу запуску або для більшого контролю над тим, яка інструментація застосовується.

{{% config_option name="otel.instrumentation.common.default-enabled" %}} Встановіть значення `false`, щоб вимкнути всю інструментацію в агенті. {{% /config_option %}}

{{% config_option name="otel.instrumentation.[name].enabled" %}} Встановіть значення `true`, щоб увімкнути кожну бажану інструментацію окремо. {{% /config_option %}}

> [!WARNING]
>
> Деяка інструментація залежить від іншої інструментації для правильного функціонування. При вибірковому увімкненні інструментації переконайтеся, що також увімкнено транзитивні залежності. Визначення цієї залежності залишено на розсуд користувача. Це вважається розширеним використанням і не рекомендується для більшості користувачів.

## Увімкнення лише ручної інструментації {#enabling-manual-instrumentation-only}

Ви можете придушити всю автоматичну інструментацію, але мати підтримку ручної інструментації з `@WithSpan` та звичайними взаємодіями API, використовуючи `-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`

## Придушення конкретної інструментації агента {#suppressing-specific-agent-instrumentation}

Ви можете придушити інструментацію агента для конкретних бібліотек.

{{% config_option name="otel.instrumentation.[name].enabled" %}} Встановіть значення `false`, щоб придушити інструментацію агента для конкретних бібліотек, де [name] — це відповідна назва інструментації: {{% /config_option %}}

| Бібліотека/Фреймворк                             | Назва інструментації                        |
| ------------------------------------------------ | ------------------------------------------- |
| Додаткове трасування методів                     | `methods`                                   |
| Додаткові анотації трасування                    | `external-annotations`                      |
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

**Примітка:** При використанні змінних середовища, дефіси (`-`) слід замінити на підкреслення (`_`). Наприклад, щоб придушити трасування з бібліотеки `akka-actor`, встановіть `OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` на `false`.

## Придушення відрізків контролера та/або представлення {#suppressing-controller-andor-view-spans}

Деякі інструментації (наприклад, інструментація Spring Web MVC) створюють [SpanKind.Internal](/docs/specs/otel/trace/api/#spankind) відрізки для захоплення виконання контролера та/або представлення. Ці відрізки можна придушити за допомогою наведених нижче налаштувань конфігурації, не придушуючи всю інструментацію, що також вимкне захоплення `http.route` та повʼязаної назви відрізка на батьківському [SpanKind.Server](/docs/specs/otel/trace/api/#spankind) відрізку.

{{% config_option
name="otel.instrumentation.common.experimental.controller-telemetry.enabled"
default=false
%}} Встановіть значення `true`, щоб увімкнути телеметрію контролера. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.experimental.view-telemetry.enabled"
default=false
%}} Встановіть значення `true`, щоб увімкнути телеметрію представлення. {{% /config_option %}}

## Поведінка придушення відрізків інструментації {#instrumentation-span-suppression-behavior}

Деякі бібліотеки, які інструментує цей агент, своєю чергою використовують низькорівневі бібліотеки, які також інструментуються. Це зазвичай призводить до вкладених відрізків, що містять дубльовані телеметричні дані. Наприклад:

- Відрізки, створені інструментацією клієнта HTTP Reactor Netty, матимуть дубльовані відрізки клієнта HTTP, створені інструментацією Netty;
- Відрізки Dynamo DB, створені інструментацією AWS SDK, матимуть дочірні відрізки клієнта HTTP, створені його внутрішньою бібліотекою клієнта HTTP (яка також інструментується);
- Відрізки, створені інструментацією Tomcat, матимуть дубльовані відрізки сервера HTTP, створені загальною інструментацією API сервлета.

Java агент запобігає цим ситуаціям, виявляючи та придушуючи вкладені відрізки, що дублюють телеметричні дані. Поведінку придушення можна налаштувати за допомогою наступної опції конфігурації:

{{% config_option name="otel.instrumentation.experimental.span-suppression-strategy" %}}

Стратегія придушення відрізків Java агента. Підтримуються наступні 3 стратегії:

- `semconv`: Агент придушуватиме дубльовані семантичні домовленості. Це стандартна поведінка Java агента.
- `span-kind`: Агент придушуватиме відрізки з однаковим типом (крім `INTERNAL`).
- `none`: Агент не придушуватиме нічого. **Ми не рекомендуємо використовувати цю опцію для будь-чого, крім налагодження, оскільки вона генерує багато дубльованих телеметричних даних**.

{{% /config_option %}}

Наприклад, припустимо, що ми інструментуємо клієнт бази даних, який внутрішньо використовує клієнт HTTP Reactor Netty; який, своєю чергою, використовує Netty.

Використання стандартної стратегії придушення `semconv` призведе до 2 вкладених `CLIENT` відрізків:

- `CLIENT` відрізок з семантичними атрибутами клієнта бази даних, створений інструментацією клієнта бази даних;
- `CLIENT` відрізок з семантичними атрибутами клієнта HTTP, створений інструментацією Reactor Netty.

Інструментація Netty буде придушена, оскільки вона дублює інструментацію клієнта HTTP Reactor Netty.

Використання стратегії придушення `span-kind` призведе до одного відрізка:

- `CLIENT` відрізок з семантичними атрибутами клієнта бази даних, створений інструментацією клієнта бази даних.

Інструментації як Reactor Netty, так і Netty будуть придушені, оскільки вони також створюють `CLIENT` відрізки.

Нарешті, використання стратегії придушення `none` призведе до 3 відрізків:

- `CLIENT` відрізок з семантичними атрибутами клієнта бази даних, створений інструментацією клієнта бази даних;
- `CLIENT` відрізок з семантичними атрибутами клієнта HTTP, створений інструментацією Reactor Netty;
- `CLIENT` відрізок з семантичними атрибутами клієнта HTTP, створений інструментацією Netty.
