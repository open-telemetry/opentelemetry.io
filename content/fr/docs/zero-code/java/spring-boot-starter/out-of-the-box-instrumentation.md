---
title: Instrumentation prête à l'emploi
weight: 40
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: autoconfigurations logback webflux webmvc
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Une instrumentation prête à l'emploi par défaut est disponible pour plusieurs
frameworks :

| Fonctionnalité        | Propriété                                       | Valeur par défaut |
| --------------------- | ----------------------------------------------- | ----------------- |
| JDBC                  | `otel.instrumentation.jdbc.enabled`             | true              |
| Logback               | `otel.instrumentation.logback-appender.enabled` | true              |
| Logback MDC           | `otel.instrumentation.logback-mdc.enabled`      | true              |
| Spring Web            | `otel.instrumentation.spring-web.enabled`       | true              |
| Spring Web MVC        | `otel.instrumentation.spring-webmvc.enabled`    | true              |
| Spring WebFlux        | `otel.instrumentation.spring-webflux.enabled`   | true              |
| Kafka                 | `otel.instrumentation.kafka.enabled`            | true              |
| MongoDB               | `otel.instrumentation.mongo.enabled`            | true              |
| Micrometer            | `otel.instrumentation.micrometer.enabled`       | false             |
| R2DBC (reactive JDBC) | `otel.instrumentation.r2dbc.enabled`            | true              |

## Activer les instrumentations de manière sélective {#turn-on-instrumentations-selectively}

Pour n'utiliser que des instrumentations spécifiques, désactivez d'abord toutes
les instrumentations en définissant la propriété
`otel.instrumentation.common.default-enabled` à `false`. Ensuite, activez les
instrumentations une par une.

Par exemple, si vous souhaitez uniquement activer l'instrumentation JDBC,
définissez `otel.instrumentation.jdbc.enabled` à `true`.

## Configuration commune de l'instrumentation {#common-instrumentation-configuration}

Propriétés communes à toutes les instrumentations de base de données :

| Propriété système                                            | Type    | Défaut | Description                                              |
| ------------------------------------------------------------ | ------- | ------ | -------------------------------------------------------- |
| `otel.instrumentation.common.db-statement-sanitizer.enabled` | Boolean | true   | Active le nettoyage des instructions de base de données. |

## Instrumentation JDBC {#jdbc-instrumentation}

| Propriété système                                       | Type    | Défaut | Description                                              |
| ------------------------------------------------------- | ------- | ------ | -------------------------------------------------------- |
| `otel.instrumentation.jdbc.statement-sanitizer.enabled` | Boolean | true   | Active le nettoyage des instructions de base de données. |

## Logback {#logback}

Vous pouvez activer des fonctionnalités expérimentales à l'aide des propriétés
système pour capturer des attributs :

| Propriété système                                                                      | Type    | Défaut | Description                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `otel.instrumentation.logback-appender.experimental-log-attributes`                    | Boolean | false  | Active la capture des attributs de log expérimentaux `thread.name` et `thread.id`.                                                                                             |
| `otel.instrumentation.logback-appender.experimental.capture-code-attributes`           | Boolean | false  | Active la capture des [attributs de code source]. Notez que la capture des attributs de code source sur les sites de journalisation peut ajouter une surcharge de performance. |
| `otel.instrumentation.logback-appender.experimental.capture-marker-attribute`          | Boolean | false  | Active la capture des marqueurs Logback comme attributs.                                                                                                                       |
| `otel.instrumentation.logback-appender.experimental.capture-key-value-pair-attributes` | Boolean | false  | Active la capture des paires clé-valeur Logback comme attributs.                                                                                                               |
| `otel.instrumentation.logback-appender.experimental.capture-logger-context-attributes` | Boolean | false  | Active la capture des propriétés de contexte du logger Logback comme attributs.                                                                                                |
| `otel.instrumentation.logback-appender.experimental.capture-mdc-attributes`            | String  |        | Liste séparée par des virgules des attributs MDC à capturer. Utilisez le caractère générique `*` pour capturer tous les attributs.                                             |

[attributs de code source]:
  /docs/specs/semconv/general/attributes/#source-code-attributes

Par ailleurs, vous pouvez activer ces fonctionnalités en ajoutant l'appender
Logback OpenTelemetry dans votre fichier `logback.xml` ou `logback-spring.xml` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>
                %d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
            </pattern>
        </encoder>
    </appender>
    <appender name="OpenTelemetry"
        class="io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender">
        <captureExperimentalAttributes>false</captureExperimentalAttributes>
        <captureCodeAttributes>true</captureCodeAttributes>
        <captureMarkerAttribute>true</captureMarkerAttribute>
        <captureKeyValuePairAttributes>true</captureKeyValuePairAttributes>
        <captureLoggerContext>true</captureLoggerContext>
        <captureMdcAttributes>*</captureMdcAttributes>
    </appender>
    <root level="INFO">
        <appender-ref ref="console"/>
        <appender-ref ref="OpenTelemetry"/>
    </root>
</configuration>
```

## Autoconfiguration Spring Web {#spring-web-autoconfiguration}

Fournit une autoconfiguration pour l'intercepteur de trace `RestTemplate` défini
dans
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).
Cette autoconfiguration instrumente toutes les requêtes envoyées à l'aide des
beans Spring `RestTemplate` en appliquant un post-processeur de bean
`RestTemplate`. Cette fonctionnalité est supportée pour les versions de spring
web 3.1+. Pour en savoir plus sur l'intercepteur `RestTemplate` OpenTelemetry,
consultez
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).

Les manières suivantes de créer un `RestTemplate` sont supportées :

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/RestTemplateConfig.java"?>
```java
package otel;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
```

<?code-excerpt "src/main/java/otel/RestTemplateController.java"?>
```java
package otel;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class RestTemplateController {

  private final RestTemplate restTemplate;

  public RestTemplateController(RestTemplateBuilder restTemplateBuilder) {
    restTemplate = restTemplateBuilder.rootUri("http://localhost:8080").build();
  }
}
```
<!-- prettier-ignore-end -->

Les manières suivantes de créer un `RestClient` sont supportées :

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/RestClientConfig.java"?>
```java
package otel;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

  @Bean
  public RestClient restClient() {
    return RestClient.create();
  }
}
```

<?code-excerpt "src/main/java/otel/RestClientController.java"?>
```java
package otel;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class RestClientController {

  private final RestClient restClient;

  public RestClientController(RestClient.Builder restClientBuilder) {
    restClient = restClientBuilder.baseUrl("http://localhost:8080").build();
  }
}
```
<!-- prettier-ignore-end -->

Comme il est possible avec l'agent Java, vous pouvez configurer la capture des
entités suivantes :

- [En-têtes de requête et de réponse HTTP](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [Méthodes HTTP connues](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [Télémétrie HTTP expérimentale](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Autoconfiguration Spring Web MVC {#spring-web-mvc-autoconfiguration}

Cette fonctionnalité autoconfigure l'instrumentation pour les contrôleurs Spring
WebMVC en ajoutant un bean
[filtre servlet produisant de la télémétrie](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java)
au contexte de l'application. Le filtre décore l'exécution de la requête avec un
span de serveur, propageant le contexte de traçage entrant s'il est reçu dans la
requête HTTP. Pour en savoir plus sur l'instrumentation Spring WebMVC
OpenTelemetry, consultez la
[bibliothèque d'instrumentation opentelemetry-spring-webmvc-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library).

Comme il est possible avec l'agent Java, vous pouvez configurer la capture des
entités suivantes :

- [En-têtes de requête et de réponse HTTP](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [Méthodes HTTP connues](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [Télémétrie HTTP expérimentale](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Autoconfiguration Spring WebFlux {#spring-webflux-autoconfiguration}

Fournit des autoconfigurations pour le filtre d'échange WebClient OpenTelemetry
défini dans
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).
Cette autoconfiguration instrumente toutes les requêtes HTTP sortantes envoyées
à l'aide des beans WebClient et WebClient Builder de Spring en appliquant un
post-processeur de bean. Cette fonctionnalité est supportée pour les versions de
spring webflux 5.0+. Pour plus de détails, consultez
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).

Les manières suivantes de créer un `WebClient` sont supportées :

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/WebClientConfig.java"?>
```java
package otel;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

  @Bean
  public WebClient webClient() {
    return WebClient.create();
  }
}
```

<?code-excerpt "src/main/java/otel/WebClientController.java"?>
```java
package otel;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
public class WebClientController {

  private final WebClient webClient;

  public WebClientController(WebClient.Builder webClientBuilder) {
    webClient = webClientBuilder.baseUrl("http://localhost:8080").build();
  }
}
```
<!-- prettier-ignore-end -->

## Instrumentation Kafka {#kafka-instrumentation}

Fournit une autoconfiguration pour l'instrumentation du client Kafka.

| Propriété système                                         | Type    | Défaut | Description                                            |
| --------------------------------------------------------- | ------- | ------ | ------------------------------------------------------ |
| `otel.instrumentation.kafka.experimental-span-attributes` | Boolean | false  | Active la capture des attributs de span expérimentaux. |

## Instrumentation Micrometer {#micrometer-instrumentation}

Fournit une autoconfiguration pour le pont Micrometer vers OpenTelemetry.

## Instrumentation MongoDB {#mongodb-instrumentation}

Fournit une autoconfiguration pour l'instrumentation du client MongoDB.

| Propriété système                                        | Type    | Défaut | Description                                              |
| -------------------------------------------------------- | ------- | ------ | -------------------------------------------------------- |
| `otel.instrumentation.mongo.statement-sanitizer.enabled` | Boolean | true   | Active le nettoyage des instructions de base de données. |

## Instrumentation R2DBC {#r2dbc-instrumentation}

Fournit une autoconfiguration pour l'instrumentation R2DBC OpenTelemetry.

| Propriété système                                        | Type    | Défaut | Description                                              |
| -------------------------------------------------------- | ------- | ------ | -------------------------------------------------------- |
| `otel.instrumentation.r2dbc.statement-sanitizer.enabled` | Boolean | true   | Active le nettoyage des instructions de base de données. |
