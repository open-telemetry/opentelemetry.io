---
title: Декларативна конфігурація Java-агента
linkTitle: Декларативна конфігурація
weight: 11
default_lang_commit: 4a179f9723936afce996e0ae71b305f15064e4d8
cSpell:ignore: genai
---

Декларативна конфігурація використовує файл YAML замість змінних середовища або системних властивостей.

Цей підхід корисний, коли:

- У вас є багато параметрів конфігурації для налаштування
- Ви хочете використовувати параметри конфігурації, які недоступні як змінні середовища або системні властивості

Так само, як і змінні середовища, синтаксис конфігурації є незалежним від мови і працює для всіх OpenTelemetry Java SDK, які підтримують декларативну конфігурацію, включаючи OpenTelemetry Java agent.

## Підтримувані версії {#supported-versions}

Декларативна конфігурація підтримується в **OpenTelemetry Java agent версії 2.20.0 і пізніших**.

## Початок роботи {#getting-started}

1. Збережіть файл конфігурації нижче як `otel-config.yaml`.
2. Додайте наступне до аргументів запуску JVM:

   ```shell
   -Dotel.experimental.config.file=/path/to/otel-config.yaml
   ```

Більш загальний посібник з початку роботи з декларативною конфігурацією дивись в документації [Декларативне конфігурування SDK][SDK Declarative configuration].

Ця сторінка присвячена особливостям роботи
[Java-агента OpenTelemetry](https://github.com/open-telemetry/opentelemetry-java-instrumentation).

## Зіставлення параметрів конфігурації {#mapping-of-configuration-options}

Якщо ви хочете перетворити наявні змінні середовища або конфігурацію властивостей системи на декларативну конфігурацію, використовуйте такі правила:

1. Якщо параметр конфігурації починається з `otel.javaagent.` (наприклад, `otel.javaagent.logging`), то, найімовірніше, це властивість, яку можна встановити лише за допомогою змінної середовища або системної властивості (докладнішу інформацію дивіться у розділі [Параметри, доступні лише для змінних середовища та системних властивостей](#environment-variables-and-system-properties-only-options) нижче). В іншому випадку видаліть префікс `otel.javaagent.` і розмістіть його в розділі `agent` нижче.
2. Якщо опція конфігурації починається з `otel.instrumentation.` (наприклад, `otel.instrumentation.spring-batch.experimental.chunk.new-trace`), видаліть префікс `otel.instrumentation.` і розмістіть її в розділі `instrumentation` нижче.
3. В іншому випадку опція, швидше за все, належить до конфігурації SDK. Знайдіть відповідний розділ у [конфігурації міграції](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml). Якщо у вас є системна властивість, така як `otel.bsp.schedule.delay`, знайдіть відповідну змінну середовища `OTEL_BSP_SCHEDULE_DELAY` у конфігурації міграції.
4. Використовуйте `.` для створення рівня відступу.
5. Перетворіть `-` на `_`.
6. Використовуйте типи YAML boolean та integer, де це доречно (наприклад, `true` замість `"true"`, `5000` замість `"5000"`).
7. Опції, що мають спеціальне зіставлення, наведене нижче.

```yaml
instrumentation/development:
  general:
    peer:
      service_mapping: # було "otel.instrumentation.common.peer-service-mapping"
        - peer: 1.2.3.4
          service: FooService
        - peer: 2.3.4.5
          service: BarService
    http:
      client:
        request_captured_headers: # було otel.instrumentation.http.client.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # було otel.instrumentation.http.client.capture-response-headers
          - Content-Type
          - Content-Encoding
      server:
        request_captured_headers: # було otel.instrumentation.http.server.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # було otel.instrumentation.http.server.capture-response-headers
          - Content-Type
          - Content-Encoding
    java:
      agent:
        # було otel.instrumentation.common.default-enabled
        # instrumentation_mode: none  # було false
        instrumentation_mode: default # було true
      spring_batch:
        experimental:
          chunk:
            new_trace: true
```

## Тільки параметри змінних середовища та властивостей системи {#environment-variables-and-system-properties-only-options}

Наступні параметри конфігурації підтримуються декларативною конфігурацією, але доступні тільки через змінні середовища або властивості системи:

- `otel.javaagent.configuration-file` (але це не повинно бути необхідним при декларативній конфігурації)
- `otel.javaagent.debug`
- `otel.javaagent.enabled`
- `otel.javaagent.experimental.field-injection.enabled`
- `otel.javaagent.experimental.security-manager-support.enabled`
- `otel.javaagent.extensions`
- `otel.javaagent.logging.application.logs-buffer-max-records`
- `otel.javaagent.logging`

Ці опції потрібні під час запуску агента, перед читанням файлу декларативної конфігурації.

## Формат тривалості {#duration-format}

- Декларативна конфігурація **підтримує тільки тривалість у мілісекундах** (наприклад, `5000` для 5 секунд).
- Ви отримаєте помилку, якщо використаєте `OTEL_BSP_SCHEDULE_DELAY=5s` (дійсне для змінних середовища, але не для декларативної конфігурації).

Приклад:

```yaml
tracer_provider:
  processors:
    - batch:
        schedule_delay: ${OTEL_BSP_SCHEDULE_DELAY:-5000}
```

## Відмінності в поведінці {#behavior-differences}

- Атрибут ресурсу `telemetry.distro.name` (який стандартно додається агентом Java) має значення `opentelemetry-javaagent` замість `opentelemetry-java-instrumentation` (буде знову узгоджено з версією 3.0).

## Функції, які ще не підтримуються {#not-yet-supported-features}

Деякі функції, що підтримуються змінними середовища та властивостями системи, ще не підтримуються декларативною конфігурацією:

Наступні налаштування все ще потрібно встановлювати за допомогою змінних середовища або властивостей системи:

- `otel.experimental.javascript-snippet`
- `otel.instrumentation.aws-sdk.experimental-record-individual-http-error`
- `otel.instrumentation.aws-sdk.experimental-span-attributes`
- `otel.instrumentation.aws-sdk.experimental-use-propagator-for-messaging`
- `otel.instrumentation.common.db-statement-sanitizer.enabled`
- `otel.instrumentation.common.logging.span-id`
- `otel.instrumentation.common.logging.trace-flags`
- `otel.instrumentation.common.logging.trace-id`
- `otel.instrumentation.experimental.span-suppression-strategy`
- `otel.instrumentation.genai.capture-message-content`
- `otel.instrumentation.jdbc.experimental.capture-query-parameters`
- `otel.instrumentation.jdbc.experimental.transaction.enabled`
- `otel.instrumentation.log4j-context-data.add-baggage`
- `otel.instrumentation.messaging.experimental.capture-headers`
- `otel.instrumentation.messaging.experimental.receive-telemetry.enabled`
- `otel.javaagent.experimental.thread-propagation-debugger.enabled`
- `otel.semconv-stability.opt-in`

Функції Java-агента, які ще не підтримуються декларативною конфігурацією:

- `otel.instrumentation.common.mdc.resource-attributes`
- `otel.javaagent.add-thread-details`
- додавання консольного логера для відрізків, коли `otel.javaagent.debug=true`
  - можна обійти, додавши консольний експортер відрізків у файл конфігурації
- використання `GlobalConfigProvider` для доступу до декларативних значень конфігурації у власному коді

Функції Java SDK, які ще не підтримуються декларативною конфігурацією:

- виклик `AutoConfigureListener` в `AutoConfiguredOpenTelemetrySdk`

Функції Contrib, які ще не підтримуються декларативною конфігурацією:

- [AWS X-Ray](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-xray)
- [GCP authentication](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-auth-extension)

Нарешті, [Spring Boot starter](/docs/zero-code/java/spring-boot-starter) ще не підтримує декларативну конфігурацію:

- проте ви вже можете використовувати `application.yaml` для конфігурації OpenTelemetry Spring Boot starter.

[SDK Declarative configuration]: /docs/languages/sdk-configuration/declarative-configuration
