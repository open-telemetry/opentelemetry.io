---
title: Налаштування SDK
weight: 30
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Цей стартер Spring підтримує [метадані конфігурації](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html), що означає, що ви можете бачити та автоматично заповнювати всі доступні властивості у вашому IDE.

## Загальна конфігурація {#general-configuration}

OpenTelemetry Starter підтримує всі [Автоконфігурації SDK](/docs/zero-code/java/agent/configuration/#sdk-configuration) (з версії 2.2.0).

Ви можете оновити конфігурацію за допомогою властивостей у файлі `application.properties` або `application.yaml`, або за допомогою змінних середовища.

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Приклад `application.yaml`:

```yaml
otel:
  propagators:
    - tracecontext
    - b3
  resource:
    attributes:
      deployment.environment: dev
      service:
        name: cart
        namespace: shop
```

Приклад змінних середовища:

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Параметри рівня SDK (ресурси, пропагатори, експортери) використовують стандартну [схему декларативної конфігурації](/docs/languages/sdk-configuration/declarative-configuration/) безпосередньо в `application.yaml`. Системні властивості та змінні середовища все ще працюють для перевизначення значень — див. [Перевизначення змінних середовища](../declarative-configuration/#environment-variable-overrides).

```yaml
otel:
  file_format: '1.0'

  resource:
    attributes:
      - name: deployment.environment
        value: dev
      - name: service.name
        value: cart
      - name: service.namespace
        value: shop

  propagator:
    composite:
      - tracecontext:
      - b3:
```

{{% /tab %}} {{< /tabpane >}}

## Перевизначення атрибутів ресурсу {#overriding-resource-attributes}

Як зазвичай у Spring Boot, ви можете перевизначити властивості у файлах `application.properties` та `application.yaml` за допомогою змінних середовища.

Наприклад, ви можете встановити або перевизначити атрибут ресурсу `deployment.environment` (не змінюючи `service.name` або `service.namespace`) шляхом встановлення стандартної змінної середовища `OTEL_RESOURCE_ATTRIBUTES`:

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

Альтернативно, ви можете використовувати змінну середовища `OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT` для встановлення або перевизначення одного атрибуту ресурсу:

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

Другий варіант підтримує [SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html) вирази.

Зверніть увагу, що `DEPLOYMENT_ENVIRONMENT` перетворюється на `deployment.environment` за допомогою [Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) Spring Boot.

## Вимкнення OpenTelemetry Starter {#disable-the-opentelemetry-starter}

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Встановіть `otel.sdk.disabled` в `true`, щоб вимкнути стартер, наприклад, для тестування:

```yaml
otel:
  sdk:
    disabled: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Встановіть `otel.disabled` в `true`, щоб вимкнути стартер, наприклад, для тестування:

Примітка: з [декларативною конфігурацією](../declarative-configuration/), імʼя властивості `otel.disabled`, а не `otel.sdk.disabled`.

```yaml
otel:
  file_format: '1.0'
  disabled: true
```

{{% /tab %}} {{< /tabpane >}}

## Програмна конфігурація {#programmatic-configuration}

Див. розділ [Програмна конфігурація](../programmatic-configuration/).

## Провайдери ресурсів {#resource-providers}

{{< tabpane text=true >}} {{% tab "Властивості" %}}

OpenTelemetry Starter включає ті ж провайдери ресурсів, що і Java агент:

- [Загальні провайдери ресурсів](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [Провайдери ресурсів, які стандартно вимкнені](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

Крім того, OpenTelemetry Starter включає наступні специфічні для Spring Boot провайдери ресурсів:

### Провайдер ресурсів дистрибуції {#distribution-resource-provider}

FQN: `io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| Атрибут                    | Значення                            |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | версія стартера                     |

### Провайдер ресурсів Spring {#spring-resource-provider}

FQN: `io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| Атрибут           | Значення                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` або `build.name` з `build-info.properties` (див. [Назва сервісу](#service-name)) |
| `service.version` | `build.version` з `build-info.properties`                                                                  |

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

З [декларативною конфігурацією](../declarative-configuration/), провайдери ресурсів налаштовуються явно як детектори під `resource.detection/development.detectors`. Активні лише перелічені детектори — нічого не виявляється автоматично через SPI.

```yaml
otel:
  resource:
    detection/development:
      detectors:
        - container: # container.id
        - host: # host.name, host.arch
        - host_id: # host.id
        - os: # os.type, os.description
        - process: # process.pid, process.executable.path, process.command_line
        - process_runtime: # process.runtime.name/version/description
        - service: # service.name, service.instance.id
        - spring: # service.name (from spring.application.name), service.version (from build-info)
```

Атрибути `telemetry.distro.name` та `telemetry.distro.version` завжди додаються автоматично стартером для цілей налагодження.

{{% /tab %}} {{< /tabpane >}}

## Назва сервісу {#service-name}

Використовуючи ці провайдери ресурсів, назва сервісу визначається за наступними правилами пріоритету, відповідно [специфікації](/docs/languages/sdk-configuration/general/#otel_service_name) OpenTelemetry:

{{< tabpane text=true >}} {{% tab "Властивості" %}}

1. Властивість spring `otel.service.name` або змінна середовища `OTEL_SERVICE_NAME` (найвищий пріоритет)
2. `service.name` у системній/властивості spring `otel.resource.attributes` або змінна середовища `OTEL_RESOURCE_ATTRIBUTES`
3. Властивість spring `spring.application.name`
4. `build-info.properties`
5. `Implementation-Title` з META-INF/MANIFEST.MF
6. Стандартне значення — `unknown_service:java` (найнижчий пріоритет)

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Назва сервісу залежить від того, які детектори ресурсів ви включаєте (див.
[Провайдери ресурсів](#resource-providers)):

1. `service.name` у `otel.resource.attributes` (найвищий пріоритет):

   ```yaml
   otel:
     resource:
       attributes:
         - name: service.name
           value: my-spring-app
   ```

2. Детектор `service` — якщо включено, автоматично визначає з `OTEL_SERVICE_NAME`:

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - service:
   ```

3. Детектор `spring` — якщо включено, визначає з `spring.application.name` та `build-info.properties`:

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - spring:
   ```

4. Стандартне значення — `unknown_service:java` (найнижчий пріоритет)

{{% /tab %}} {{< /tabpane >}}

Використовуйте наступний фрагмент у вашому файлі pom.xml для генерації файлу `build-info.properties`:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<build>
    <finalName>${project.artifactId}</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>build-info</goal>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
springBoot {
  buildInfo {
  }
}
```

{{% /tab %}} {{< /tabpane>}}
