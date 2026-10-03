---
title: Вступ до OpenTelemetry Java
description: Вступ до екосистеми OpenTelemetry Java
weight: 9
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: boms
---

OpenTelemetry Java — це набір інструментів спостереження OpenTelemetry для екосистеми Java. На високому рівні він складається з API, SDK та інструментів.

Ця сторінка представляє екосистему, з концептуальним [оглядом](#overview), керівництвом по [навігації по документації](#navigating-the-docs), списком [репозиторіїв](#repositories) з ключовими деталями про випуски та артефакти.

## Огляд {#overview}

API — це набір класів та інтерфейсів для запису телеметрії через ключові сигнали спостереження. Він підтримує кілька реалізацій, з невибагливим мінімалістичним no-op та SDK референсною реалізацією, що надається з коробки. Він призначений бути прямою залежністю для бібліотек, фреймворків та власників застосунків, які хочуть додати інструментування. Він має сильні гарантії зворотної сумісності, нульові транзитивні залежності та підтримує Java 8+.

SDK — це вбудована референсна реалізація API, яка обробляє та експортує телеметрію, створену викликами API інструментування. Налаштування SDK для належної обробки та експорту є важливим кроком для інтеграції OpenTelemetry у застосунок. SDK має автоконфігурацію та програмні опції конфігурації.

Інструментування записує телеметрію за допомогою API. Існує кілька категорій інструментування, включаючи: агент Java без коду, стартер Spring Boot без коду, бібліотеку, native, керівництво shim.

Для огляду, незалежного від мови, дивіться [концепції OpenTelemetry](/docs/concepts/).

## Навігація по документації {#navigating-the-docs}

Документація OpenTelemetry Java організована наступним чином:

- [Початок роботи на прикладі](../getting-started/): Приклад для швидкого старту з OpenTelemetry Java, демонструючи інтеграцію агента OpenTelemetry Java у простий вебзастосунок.
- [Екосистема інструментування](../instrumentation/): Керівництво по екосистемі інструментування OpenTelemetry Java. Це ключовий ресурс для авторів застосунків, які хочуть інтегрувати OpenTelemetry Java у свої застосунки. Дізнайтеся про різні категорії інструментування та виберіть, яка підходить вам.
- [Запис телеметрії за допомогою API](../api/): Технічний довідник по API OpenTelemetry, що досліджує всі ключові аспекти API з робочими прикладами коду. Більшість користувачів використовуватимуть цю сторінку як енциклопедію, звертаючись до індексу розділів за потреби, а не читаючи від початку до кінця.
- [Управління телеметрією за допомогою SDK](../sdk/): Технічний довідник по SDK OpenTelemetry, що досліджує всі точки розширення втулків SDK та програмний API конфігурації з робочими прикладами коду. Більшість користувачів використовуватимуть цю сторінку як енциклопедію, звертаючись до індексу розділів за потреби, а не читаючи від початку до кінця.
- [Налаштування SDK](../configuration/): Технічний довідник по налаштуванню SDK, зосереджуючись на автоконфігурації без коду. Включає довідник по всіх підтримуваних змінних середовища та системних властивостях для налаштування SDK. Досліджує всі програмні точки налаштування з робочими прикладами коду. Більшість користувачів використовуватимуть цю сторінку як енциклопедію, звертаючись до індексу розділів за потреби, а не читаючи від початку до кінця.
- **Дізнатися більше**: Додаткові ресурси, включаючи [приклади](../examples/), [Javadoc](../api/), компонент [реєстр](../registry/) та [довідник по продуктивності](/docs/zero-code/java/agent/performance/).

## Репозиторії {#repositories}

Вихідний код OpenTelemetry Java організований у кілька репозиторіїв:

| Репозиторій                                                                                                | Опис                                                                                           | Group ID                           | Поточна версія                       | Частота випусків                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)                                 | Основні компоненти API та SDK                                                                  | `io.opentelemetry`                 | `{{% param vers.otel %}}`            | [Пʼятниця після першого понеділка місяця](https://github.com/open-telemetry/opentelemetry-java/blob/main/RELEASING.md#release-cadence)               |
| [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) | Інструментування, підтримуване OpenTelemetry, включаючи агента OpenTelemetry Java              | `io.opentelemetry.instrumentation` | `{{% param vers.instrumentation %}}` | [Середа після другого понеділка місяця](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/RELEASING.md#release-cadence) |
| [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)                 | Компоненти, підтримувані спільнотою, які не входять до явного обсягу інших репозиторіїв        | `io.opentelemetry.contrib`         | `{{% param vers.contrib %}}`         | [Пʼятниця після другого понеділка місяця](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/RELEASING.md#release-cadence)       |
| [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)                   | Згенерований код для семантичних конвенцій                                                     | `io.opentelemetry.semconv`         | `{{% param vers.semconv %}}`         | Слідом за випусками [semantic-conventions](https://github.com/open-telemetry/semantic-conventions)                                                   |
| [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)                     | Згенеровані привʼязки для OTLP                                                                 | `io.opentelemetry.proto`           | `1.3.2-alpha`                        | Слідом за випусками [opentelemetry-proto](https://github.com/open-telemetry/opentelemetry-proto)                                                     |
| [opentelemetry-java-examples](https://github.com/open-telemetry/opentelemetry-java-examples)               | Кінцеві приклади коду, що демонструють різні шаблони використання API, SDK та інструментування | н/д                                | н/д                                  | н/д                                                                                                                                                  |

`opentelemetry-java`, `opentelemetry-java-instrumentation` та `opentelemetry-java-contrib` кожен публікує великі каталоги артефактів. Будь ласка, зверніться до репозиторіїв для деталей, або дивіться колонку "Керовані залежності" у таблиці [Bill of Materials](#dependencies-and-boms) для повного списку керованих залежностей.

Як загальне правило, артефакти, опубліковані з одного репозиторію, мають однакову версію. Винятком є `opentelemetry-java-contrib`, який можна вважати групою незалежних проєктів, що співіснують в одному репозиторії для використання спільних інструментів. Наразі артефакти `opentelemetry-java-contrib` узгоджені, але це збіг і зміниться в майбутньому.

Репозиторії мають частоту випусків, яка відображає їхню високорівневу структуру залежностей:

- `opentelemetry-java` є ядром і випускається першим кожного місяця.
- `opentelemetry-java-instrumentation` залежить від `opentelemetry-java` і випускається наступним.
- `opentelemetry-java-contrib` залежить від `opentelemetry-java-instrumentation` та `opentelemetry-java` і випускається останнім.
- Хоча `semantic-conventions-java` є залежністю `opentelemetry-java-instrumentation`, це незалежний артефакт з незалежним графіком випусків.

## Залежності та BOMs {#dependencies-and-boms}

[Bill of materials](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Bill_of_Materials_.28BOM.29_POMs), або BOM скорочено, це артефакт, який допомагає підтримувати версії повʼязаних залежностей узгодженими. OpenTelemetry Java публікує кілька BOMs, що відповідають різним випадкам використання, перелічених нижче в порядку зростання обсягу. Ми наполегливо рекомендуємо використовувати BOM.

> [!NOTE]
>
> Оскільки BOMs є ієрархічними, додавання залежностей до кількох BOMs не рекомендується, оскільки це є надлишковим і може призвести до неінтуїтивного вирішення версій залежностей.

Натисніть на посилання в колонці "Керовані залежності", щоб побачити список артефактів, керованих BOM.

| Опис                                                                                           | Репозиторій                          | Group ID                           | Artifact ID                               | Поточна версія                             | Керовані залежності                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Стабільні артефакти ядра API та SDK                                                            | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom`                       | `{{% param vers.otel %}}`                  | [latest pom.xml][opentelemetry-bom]                       |
| Експериментальні артефакти ядра API та SDK, включаючи всі `opentelemetry-bom`                  | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom-alpha`                 | `{{% param vers.otel %}}-alpha`            | [latest pom.xml][opentelemetry-bom-alpha]                 |
| Стабільні артефакти інструментування, включаючи всі `opentelemetry-bom`                        | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom`       | `{{% param vers.instrumentation %}}`       | [latest pom.xml][opentelemetry-instrumentation-bom]       |
| Експериментальні артефакти інструментування, включаючи всі `opentelemetry-instrumentation-bom` | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom-alpha` | `{{% param vers.instrumentation %}}-alpha` | [latest pom.xml][opentelemetry-instrumentation-alpha-bom] |

Наступний фрагмент коду демонструє додавання залежності BOM, з`{{bomGroupId}}`, `{{bomArtifactId}}` та `{{bomVersion}}`, що відносяться до колонок таблиці "Group ID", "Artifact ID" та "Current Version", відповідно.

{{< tabpane text=true >}} {{% tab "Gradle" %}}

```kotlin
dependencies {
  implementation(platform("{{bomGroupId}}:{{bomArtifactId}}:{{bomVersion}}"))
  // Додайте залежність від артефакту, версія якого керується BOM
  implementation("io.opentelemetry:opentelemetry-api")
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>{{bomGroupId}}</groupId>
        <artifactId>{{bomArtifactId}}</artifactId>
        <version>{{bomVersion}}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <!-- Додайте залежність від артефакту, версія якого керується BOM -->
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
    </dependency>
  </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane >}}

[opentelemetry-bom]: <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom/{{% param vers.otel %}}/opentelemetry-bom-{{% param vers.otel %}}.pom>
[opentelemetry-bom-alpha]: <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom-alpha/{{% param vers.otel %}}-alpha/opentelemetry-bom-alpha-{{% param vers.otel %}}-alpha.pom>
[opentelemetry-instrumentation-bom]: <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom/{{% param vers.instrumentation %}}/opentelemetry-instrumentation-bom-{{% param vers.instrumentation %}}.pom>
[opentelemetry-instrumentation-alpha-bom]: <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom-alpha/{{% param vers.instrumentation %}}-alpha/opentelemetry-instrumentation-bom-alpha-{{% param vers.instrumentation %}}-alpha.pom>
