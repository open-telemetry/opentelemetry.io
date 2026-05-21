---
title: Suppressing specific instrumentation
linkTitle: Suppressing instrumentation
weight: 12
# prettier-ignore
cSpell:ignore: activej akka armeria avaje clickhouse couchbase datasource dbcp Dotel dropwizard dubbo elasticjob finatra helidon hikari hikaricp httpasyncclient httpclient hystrix javalin jaxrs jaxws jedis jfinal jodd kotlinx ktor logmanager mojarra mybatis myfaces nats okhttp openai oshi payara pekko powerjob rabbitmq ratpack rediscala redisson restlet rocketmq shenyu spymemcached thrift twilio vaadin vertx vibur webflux webmvc
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

> [!WARNING]
>
> Some instrumentation relies on other instrumentation to function properly.
> When selectively enabling instrumentation, be sure to enable the transitive
> dependencies too. Determining this dependency relationship is left as an
> exercise to the user. This is considered advanced usage and is not recommended
> for most users.

## Enable manual instrumentation only

You can suppress all auto instrumentations but have support for manual
instrumentation with `@WithSpan` and normal API interactions by using
`-Dotel.instrumentation.common.default-enabled=false -Dotel.instrumentation.opentelemetry-api.enabled=true -Dotel.instrumentation.opentelemetry-instrumentation-annotations.enabled=true`

## Suppressing specific agent instrumentation

You can suppress agent instrumentation of specific libraries.

{{% config_option name="otel.instrumentation.[name].enabled" %}} Set to `false`
to suppress agent instrumentation of specific libraries, where `[name]` is the
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
| Apache Thrift                                    | `thrift`                                    |
| Apache Tomcat                                    | `tomcat`                                    |
| Apache Wicket                                    | `wicket`                                    |