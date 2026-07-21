---
title: Початок роботи
weight: 1
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: Dotel jvms
---

## Налаштування {#setup}

1.  Завантажте [opentelemetry-javaagent.jar][] з [Releases][] репозиторію `opentelemetry-java-instrumentation` і розмістіть JAR у вашій улюбленій теці. Файл JAR містить агент та бібліотеки інструментування.
2.  Додайте `-javaagent:path/to/opentelemetry-javaagent.jar` та інші налаштування до аргументів запуску JVM і запустіть ваш застосунок:
    - Безпосередньо командою запуску:

      ```shell
      java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
      ```

    - Через `JAVA_TOOL_OPTIONS` та інші змінні середовища:

      ```shell
      export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
      export OTEL_SERVICE_NAME="your-service-name"
      java -jar myapp.jar
      ```

## Декларативна конфігурація {#declarative-configuration}

Декларативна конфігурація використовує файл YAML замість змінних середовища або властивостей системи. Це корисно, коли потрібно встановити багато параметрів конфігурації або якщо ви хочете використовувати параметри конфігурації, які недоступні як змінні середовища або властивості системи.

Докладнішу інформацію дивіться на сторінці [Декларативна конфігурація](../declarative-configuration).

## Налаштування агента {#configuring-the-agent}

Агент має широкі можливості для налаштування.

Один з варіантів — передати властивості конфігурації через прапорець `-D`. У цьому прикладі налаштовано імʼя сервісу та експортер Zipkin для трейсів:

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.service.name=your-service-name \
     -Dotel.traces.exporter=zipkin \
     -jar myapp.jar
```

Ви також можете використовувати змінні середовища для налаштування агента:

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=zipkin \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

Ви також можете використовувати файл властивостей Java і завантажувати значення конфігурації звідти:

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

або

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

Щоб побачити повний спектр параметрів конфігурації, дивіться [Конфігурація агента](../configuration).

## Підтримувані бібліотеки, фреймворки, сервіси додатків та JVM {#supported-libraries-frameworks-application-services-and-jvms}

Java-агент постачається з бібліотеками інструментування для багатьох популярних компонентів. Для повного списку дивіться [Підтримувані бібліотеки, фреймворки, сервіси додатків та JVM][support].

## Розвʼязання проблем {#troubleshooting}

{{% config_option name="otel.javaagent.debug" %}}

Встановіть значення `true`, щоб побачити журнали налагодження. Зверніть увагу, що вони досить докладні.

{{% /config_option %}}

## Наступні кроки {#next-steps}

Після того, як ви налаштували автоматичне інструментування для вашого застосунку або сервісу, ви можете захотіти [анотувати](../annotations) вибрані методи або додати [ручне інструментування](/docs/languages/java/instrumentation/) для збору власних даних телеметрії.

[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md
