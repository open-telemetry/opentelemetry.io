---
title: Suppression d'instrumentation spécifique
linkTitle: Suppression d'instrumentation
weight: 11
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
# prettier-ignore
cSpell:ignore: akka armeria clickhouse couchbase datasource dbcp Dotel dropwizard dubbo finatra hikari hikaricp httpasyncclient httpclient hystrix javalin jaxrs jaxws jedis jodd kotlinx ktor logback logmanager mojarra mybatis myfaces okhttp oshi pekko rabbitmq ratpack rediscala redisson restlet rocketmq shenyu spymemcached twilio vaadin vertx vibur webflux webmvc
---

## Désactivation complète de l'agent {#disabling-the-agent-entirely}

{{% config_option name="otel.javaagent.enabled" %}}

Définissez la valeur à `false` pour désactiver complètement l'agent.

{{% /config_option %}}

## Activer uniquement une instrumentation spécifique {#enable-only-specific-instrumentation}

Vous pouvez désactiver toute l'instrumentation automatique par défaut et
réactiver sélectivement les instrumentations individuelles. Cela peut être
souhaitable pour réduire la surcharge au démarrage ou pour avoir plus de
contrôle sur l'instrumentation appliquée.

{{% config_option name="otel.instrumentation.common.default-enabled" %}}
Définissez à `false` pour désactiver toute l'instrumentation dans l'agent.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.[name].enabled" %}} Définissez à
`true` pour activer chaque instrumentation souhaitée individuellement.
{{% /config_option %}}

{{% alert title="Note" color="warning" %}} Certaines instrumentations dépendent
d'autres instrumentations pour fonctionner correctement. Lors de l'activation
sélective de l'instrumentation, assurez-vous d'activer également les dépendances
transitives. La détermination de cette relation de dépendance est laissée à
l'utilisateur. Ceci est considéré comme une utilisation avancée et n'est pas
recommandé pour la plupart des utilisateurs. {{% /alert %}}

## Activer uniquement l'instrumentation manuelle {#enable-manual-instrumentation-only}

Vous pouvez supprimer toutes les instrumentations automatiques mais avoir le
support pour l'instrumentation manuelle avec `@WithSpan` et les interactions API
normales en utilisant
`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`

## Suppression de l'instrumentation spécifique de l'agent {#suppressing-specific-agent-instrumentation}

Vous pouvez supprimer l'instrumentation de l'agent pour des bibliothèques
spécifiques.

{{% config_option name="otel.instrumentation.[name].enabled" %}} Définissez à
`false` pour supprimer l'instrumentation de l'agent pour des bibliothèques
spécifiques, où [name] est le nom d'instrumentation correspondant :
{{% /config_option %}}

| Bibliothèque/Framework                           | Nom de l'instrumentation                    |
| ------------------------------------------------ | ------------------------------------------- |
| Traces de méthodes supplémentaires               | `methods`                                   |
| Annotations supplémentaires des traces           | `external-annotations`                      |
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
| Annotations de l'extension OpenTelemetry         | `opentelemetry-extension-annotations`       |
| Annotations de l'instrumentation OpenTelemetry   | `opentelemetry-instrumentation-annotations` |
| OpenTelemetry API                                | `opentelemetry-api`                         |
| Oracle UCP                                       | `oracle-ucp`                                |
| OSHI (Operating System and Hardware Information) | `oshi`                                      |
| Play Framework                                   | `play`                                      |
| Play WS HTTP Client                              | `play-ws`                                   |
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
| XXL-JOB                                          | `xxl-job`                                   |
| ZIO                                              | `zio`                                       |

**Note:** Lors de l'utilisation de variables d'environnement, les tirets (`-`)
doivent être convertis en tirets bas (`_`). Par exemple, pour supprimer les
traces de la bibliothèque `akka-actor`, définissez
`OTEL_INSTRUMENTATION_AKKA_ACTOR_ENABLED` à `false`.

## Suppression des spans de contrôleur et/ou de vue {#suppressing-controller-andor-view-spans}

Certaines instrumentations (par exemple, l'instrumentation Spring Web MVC)
produisent des spans [SpanKind.Internal](/docs/specs/otel/trace/api/#spankind)
pour capturer l'exécution du contrôleur et/ou de la vue. Ces spans peuvent être
supprimés en utilisant les paramètres de configuration ci-dessous, sans
supprimer l'instrumentation entière ce qui désactiverait également la capture
par l'instrumentation de `http.route` et le nom de span associé sur le span
parent [SpanKind.Server](/docs/specs/otel/trace/api/#spankind).

{{% config_option
name="otel.instrumentation.common.experimental.controller-telemetry.enabled"
default=false
%}} Définissez à `true` pour activer la télémétrie du contrôleur.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.experimental.view-telemetry.enabled"
default=false
%}} Définissez à `true` pour activer la télémétrie de la vue.
{{% /config_option %}}

## Comportement de l'instrumentation dans la suppression de span {#instrumentation-span-suppression-behavior}

Certaines bibliothèques que cet agent instrumente utilisent à leur tour des
bibliothèques de niveau inférieur, qui sont également instrumentées. Cela
entraînerait normalement des spans imbriqués contenant des données de télémétrie
en double. Par exemple :

- Les spans produits par l'instrumentation du client HTTP Reactor Netty auraient
  des spans de client HTTP en double produits par l'instrumentation Netty ;
- Les spans Dynamo DB produits par l'instrumentation du SDK AWS auraient des
  spans de client HTTP enfants produits par sa bibliothèque de client HTTP
  interne (qui est également instrumentée) ;
- Les spans produits par l'instrumentation Tomcat auraient des spans de serveur
  HTTP en double produits par l'instrumentation générique de l'API Servlet.

L'agent Java empêche ces situations en détectant et en supprimant les spans
imbriqués qui dupliquent les données de télémétrie. Le comportement de
suppression peut être configuré en utilisant l'option de configuration suivante
:

{{% config_option name="otel.instrumentation.experimental.span-suppression-strategy" %}}

La stratégie de suppression de span de l'agent Java. Les 3 stratégies suivantes
sont supportées :

- `semconv` : L'agent supprimera les conventions sémantiques en double. C'est le
  comportement par défaut de l'agent Java.
- `span-kind` : L'agent supprimera les spans de même type (sauf `INTERNAL`).
- `none` : L'agent ne supprimera rien du tout. **Nous ne recommandons pas
  d'utiliser cette option pour autre chose que le débogage, car elle génère
  beaucoup de données de télémétrie en double**.

{{% /config_option %}}

Par exemple, supposons que nous instrumentons un client de base de données qui
utilise en interne le client HTTP Reactor Netty ; qui à son tour utilise Netty.

L'utilisation de la stratégie de suppression `semconv` par défaut entraînerait 2
spans `CLIENT` imbriqués :

- Span `CLIENT` avec des attributs sémantiques de client de base de données émis
  par l'instrumentation du client de base de données ;
- Span `CLIENT` avec des attributs sémantiques de client HTTP émis par
  l'instrumentation Reactor Netty.

L'instrumentation Netty serait supprimée, car elle duplique l'instrumentation du
client HTTP Reactor Netty.

L'utilisation de la stratégie de suppression `span-kind` n'entraînerait qu'un
seul span :

- Span `CLIENT` avec des attributs sémantiques de client de base de données émis
  par l'instrumentation du client de base de données.

Les instrumentations Reactor Netty et Netty seraient supprimées, car elles
émettent également des spans `CLIENT`.

Enfin, l'utilisation de la stratégie de suppression `none` entraînerait 3 spans
:

- Span `CLIENT` avec des attributs sémantiques de client de base de données émis
  par l'instrumentation du client de base de données ;
- Span `CLIENT` avec des attributs sémantiques de client HTTP émis par
  l'instrumentation Reactor Netty ;
- Span `CLIENT` avec des attributs sémantiques de client HTTP émis par
  l'instrumentation Netty.
