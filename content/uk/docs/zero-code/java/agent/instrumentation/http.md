---
title: Конфігурація інструментування HTTP
linkTitle: HTTP
weight: 110
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

## Захоплення заголовків HTTP запитів та відповідей {#capturing-http-request-and-response-headers}

Ви можете налаштувати агент для захоплення попередньо визначених заголовків HTTP як атрибутів відрізка, відповідно до [семантичної домовленості](/docs/specs/semconv/http/http-spans/). Використовуйте наступні властивості для визначення, які заголовки HTTP ви хочете захопити:

{{% config_option name="otel.instrumentation.http.client.capture-request-headers" %}}
Список імен заголовків HTTP, розділених комами. Інструментування HTTP клієнта буде захоплювати значення заголовків HTTP запитів для всіх налаштованих імен заголовків.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.client.capture-response-headers" %}}
Список імен заголовків HTTP, розділених комами. Інструментування HTTP клієнта буде захоплювати значення заголовків HTTP відповідей для всіх налаштованих імен заголовків.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-request-headers" %}}
Список імен заголовків HTTP, розділених комами. Інструментування HTTP сервера буде захоплювати значення заголовків HTTP запитів для всіх налаштованих імен заголовків.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-response-headers" %}}
Список імен заголовків HTTP, розділених комами. Інструментування HTTP сервера буде захоплювати значення заголовків HTTP відповідей для всіх налаштованих імен заголовків.
{{% /config_option %}}

Ці параметри конфігурації підтримуються всіма інструментуваннями HTTP клієнта та сервера.

> **Примітка**: Імена властивостей/змінних середовища, наведені в таблиці, все ще є експериментальними та можуть змінюватися.

## Захоплення параметрів запиту сервлета {#capturing-servlet-request-parameters}

Ви можете налаштувати агента для захоплення попередньо визначених параметрів HTTP запиту як атрибутів відрізка для запитів, які обробляються Servlet API. Використовуйте наступну властивість для визначення, які параметри запиту сервлета ви хочете захопити:

{{% config_option name="otel.instrumentation.servlet.experimental.capture-request-parameters" %}}
Список імен параметрів запиту, розділених комами. {{% /config_option %}}

> **Примітка**: Імена властивостей/змінних середовища, наведені в таблиці, все ще є експериментальними та можуть змінюватися.

## Налаштування відомих методів HTTP {#configuring-known-http-methods}

Налаштовує інструментування для розпізнавання альтернативного набору методів HTTP запиту. Всі інші методи будуть оброблятися як `_OTHER`.

{{% config_option
name="otel.instrumentation.http.known-methods"
default="CONNECT,DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT,TRACE"
%}} Список відомих методів HTTP, розділених комами. {{% /config_option %}}

## Увімкнення експериментальної телеметрії HTTP {#enabling-experimental-http-telemetry}

Ви можете налаштувати агент для захоплення додаткових експериментальних даних телеметрії HTTP.

{{% config_option
name="otel.instrumentation.http.client.emit-experimental-telemetry"
default=false
%}} Увімкнення експериментальної телеметрії HTTP клієнта. {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.emit-experimental-telemetry"
default=false
%}}
Увімкнення експериментальної телеметрії HTTP сервера. {{% /config_option %}}

Для відрізків клієнта та сервера додаються наступні атрибути:

- `http.request.body.size` та `http.response.body.size`: Розмір тіла запиту та відповіді відповідно.

Для метрик клієнта створюються наступні метрики:

- [http.client.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientrequestbodysize)
- [http.client.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientresponsebodysize)

Для метрик сервера створюються наступні метрики:

- [http.server.active_requests](/docs/specs/semconv/http/http-metrics/#metric-httpserveractive_requests)
- [http.server.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestbodysize)
- [http.server.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverresponsebodysize)
