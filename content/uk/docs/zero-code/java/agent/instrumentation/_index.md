---
title: Конфігурація інструментування
linkTitle: Конфігурація інструментування
weight: 100
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: enduser hset serverlessapis
---

Ця сторінка описує загальні налаштування, які застосовуються до кількох інструментів одночасно.

## Імʼя сервісу-партнера {#peer-service-name}

[Імʼя сервісу-партнера](/docs/specs/semconv/general/attributes/#general-remote-service-attributes) це імʼя віддаленого сервісу, до якого здійснюється підключення. Воно відповідає `service.name` у [ресурсі](/docs/specs/semconv/resource/#service) для локального сервісу.

{{% config_option name="otel.instrumentation.common.peer-service-mapping" %}}

Використовується для вказівки відповідності між іменами хостів або IP-адресами та сервісами-партнерами у вигляді списку пар `<host_or_ip>=<user_assigned_name>`, розділених комами. Сервіс-партнер додається як атрибут до відрізка, хост або IP-адреса якого є відповідним.

Наприклад, якщо встановлено наступне:

```text
1.2.3.4=cats-service,dogs-abcdef123.serverlessapis.com=dogs-api
```

Тоді запити до `1.2.3.4` матимуть атрибут `peer.service` зі значенням `cats-service`, а запити до `dogs-abcdef123.serverlessapis.com` матимуть атрибут `dogs-api`.

З версії Java агента `1.31.0` можна вказати порт і шлях для визначення `peer.service`.

Наприклад, якщо встановлено наступне:

```text
1.2.3.4:443=cats-service,dogs-abcdef123.serverlessapis.com:80/api=dogs-api
```

Тоді запити до `1.2.3.4` не матимуть перевизначення для атрибуту `peer.service`, тоді як `1.2.3.4:443` матиме `peer.service` зі значенням `cats-service`, а запити до `dogs-abcdef123.serverlessapis.com:80/api/v1` матимуть атрибут `dogs-api`.

{{% /config_option %}}

## Очищення операторів БД {#db-statement-sanitization}

Агент очищує всі запити/заяви до бази даних перед встановленням семантичного атрибута `db.statement`. Усі значення (рядки, числа) у рядку запиту замінюються знаком питання (`?`).

Примітка: Параметри привʼязки JDBC не захоплюються у `db.statement`. Дивіться [відповідне питання](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/7413) якщо ви хочете захопити параметри привʼязки.

Приклади:

- SQL запит `SELECT a from b where password="secret"` буде виглядати як `SELECT a from b where password=?` в експортованому відрізку;
- Команда Redis `HSET map password "secret"` буде виглядати як `HSET map password ?` у експортованому відрізку.

Ця поведінка стандартно увімкнена для всіх інструментів бази даних. Використовуйте наступну властивість, щоб вимкнути її:

{{% config_option
name="otel.instrumentation.common.db-statement-sanitizer.enabled"
default=true
%}} Увімкнення очищення запитів до бази даних. {{% /config_option %}}

## Захоплення телеметрії отримання повідомлень споживачем в інструментах обміну повідомленнями {#capturing-consumer-message-receive-telemetry-in-messaging-instrumentations}

Ви можете налаштувати агент для захоплення телеметрії отримання повідомлень споживачем в інструментах обміну повідомленнями. Використовуйте наступну властивість, щоб увімкнути її:

{{% config_option
name="otel.instrumentation.messaging.experimental.receive-telemetry.enabled"
default=false
%}} Увімкнення телеметрії отримання повідомлень споживачем. {{% /config_option %}}

Зверніть увагу, що це призведе до того, що на стороні споживача розпочнеться новий трейс, з лише посиланням на відрізок, що зʼєднує його з трейсом продюсера.

> **Примітка**: Імена властивостей/змінних середовища, зазначені в таблиці, все ще є експериментальними, і тому можуть змінюватися.

## Захоплення атрибутів кінцевого користувача {#capturing-enduser-attributes}

Ви можете налаштувати агент для захоплення [загальних атрибутів ідентифікації](/docs/specs/semconv/registry/attributes/enduser/) (`enduser.id`, `enduser.role`, `enduser.scope`) з бібліотек інструментування таких як [JavaEE/JakartaEE Servlet](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/servlet) та [Spring Security](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-security-config-6.0).

> **Примітка**: З огляду на чутливий характер даних, ця функція стандартно вимкнена, дозволяючи вибіркову активацію для конкретних атрибутів. Ви повинні ретельно оцінити наслідки для конфіденційності кожного атрибуту перед увімкненням збору даних.

{{% config_option
name="otel.instrumentation.common.enduser.id.enabled"
default=false
%}} Визначає, чи захоплювати семантичний атрибут `enduser.id`.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.role.enabled"
default=false
%}} Визначає, чи захоплювати семантичний атрибут `enduser.role`.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.scope.enabled"
default=false
%}} Визначає, чи захоплювати семантичний атрибут `enduser.scope`.
{{% /config_option %}}

### Spring Security

Для користувачів Spring Security, які використовують користувацькі [префікси наданих повноважень](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities), ви можете використовувати наступні властивості, щоб видалити ці префікси з значень атрибутів `enduser.*`, щоб краще представляти фактичні імена ролей та обсягів:

{{% config_option
name="otel.instrumentation.spring-security.enduser.role.granted-authority-prefix"
default=ROLE_
%}} Префікс наданих повноважень, що ідентифікують ролі для захоплення у семантичному атрибуті `enduser.role`. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.spring-security.enduser.scope.granted-authority-prefix"
default=SCOPE_
%}} Префікс наданих повноважень, що ідентифікують обсяги для захоплення у семантичному атрибуті `enduser.scopes`. {{% /config_option %}}
