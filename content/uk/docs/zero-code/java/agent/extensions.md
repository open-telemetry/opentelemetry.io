---
title: Розширення
aliases: [/docs/instrumentation/java/extensions]
description:
  Розширення додають можливості агенту без необхідності створювати окремий
  дистрибутив.
weight: 300
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
cSpell:ignore: Customizer Dotel
---

## Вступ {#introduction}

Розширення додають нові функції та можливості агенту OpenTelemetry Java без необхідності створювати окремий дистрибутив (власну версію всього агента). Думайте про розширення як про втулки, які налаштовують поведінку агента.

Розширення дозволяють:

- Додавати нові інструментальні засоби для бібліотек, які наразі не підтримуються
- Налаштовувати поведінку наявних інструментувань
- Реалізовувати власні компоненти SDK (семплери, експортери, поширювачі)
- Модифікувати збір та обробку телеметричних даних

## Швидкий старт {#quick-start}

Ось мінімальне розширення, яке додає користувацький обробник відрізків, щоб почати роботу:

Створіть проєкт Gradle (build.gradle.kts):

<!-- prettier-ignore-start -->
<?code-excerpt "build.gradle.kts"?>

```kotlin
plugins {
    id("java")
    id("com.gradleup.shadow")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(8))
    }
}

dependencies {
    // Використовуйте BOM для керування версіями залежностей OpenTelemetry
    compileOnly(platform("io.opentelemetry:opentelemetry-bom:1.61.0"))

    // OpenTelemetry SDK autoconfiguration SPI (надається агентом)
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")

    // OpenTelemetry SDK (потрібно для SpanProcessor та класів трасування)
    compileOnly("io.opentelemetry:opentelemetry-sdk")

    // Процесор анотацій для автоматичної реєстрації SPI
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")

    // Додайте будь-які зовнішні залежності з областю 'implementation'
    // implementation("org.apache.commons:commons-lang3:3.19.0")
}

tasks.assemble {
    dependsOn(tasks.shadowJar)
}
```
<!-- prettier-ignore-end -->

Створіть реалізацію `SpanProcessor`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MySpanProcessor.java" from="public"?>

```java
public class MySpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // Додайте власні атрибути, коли span починається
    span.setAttribute("custom.processor", "active");
  }

  @Override
  public boolean isStartRequired() {
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Обробіть span, коли він закінчується (необов'язково)
  }

  @Override
  public boolean isEndRequired() {
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

Створіть клас розширення, який використовує SPI `AutoConfigurationCustomizerProvider`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MyExtensionProvider.java" from="@AutoService"?>

```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtensionProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer config) {
    config.addTracerProviderCustomizer(this::configureTracer);
  }

  private SdkTracerProviderBuilder configureTracer(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {
    return tracerProvider
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new MySpanProcessor());
  }
}
```
<!-- prettier-ignore-end -->

Збірка розширення:

```bash
./gradlew shadowJar
```

Використання розширення:

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=build/libs/my-extension-all.jar \
     -jar myapp.jar
```

## Використання розширень {#using-extensions}

Існує два способи використання розширень з Java агентом:

- **Завантаження як окремий JAR файл** - Гнучко для розробки та тестування
- **Вбудування в агент** - Один JAR для розгортання для робочого середовища

| Підхід              | Переваги                                                    | Недоліки                                      | Найкраще для                      |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| **Runtime Loading** | Легко змінювати розширення, не потрібно перебудовувати      | Потрібен додатковий параметр командного рядка | Розробка, тестування              |
| **Embedding**       | Один JAR, простіше розгортання, не можна забути завантажити | Потрібна перебудова для зміни розширень       | Робоче середовище, розповсюдження |

### Завантаження розширень під час виконання {#loading-extensions-at-runtime}

Розширення можна завантажувати під час виконання, використовуючи системну властивість `otel.javaagent.extensions` або змінну середовища `OTEL_JAVAAGENT_EXTENSIONS`. Ця опція конфігурації приймає шляхи до JAR-файлів розширень або теки, що містять JAR-файли розширень, розділені комами.

#### Одне розширення {#single-extension}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/my-extension.jar \
     -jar myapp.jar
```

#### Кілька розширень {#multiple-extensions}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/path/to/extension2.jar \
     -jar myapp.jar
```

#### Тека розширень {#extension-directory}

Ви можете вказати теку, що містить кілька JAR-файлів розширень, і всі JAR-файли в цій теці будуть завантажені:

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extensions-directory \
     -jar myapp.jar
```

#### Змішані шляхи {#mixed-paths}

Ви можете комбінувати окремі JAR-файли та теки:

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/opt/extensions,/tmp/custom.jar \
     -jar myapp.jar
```

#### Як працює завантаження розширень {#how-extension-loading-works}

Коли ви завантажуєте розширення під час виконання, агент:

1. Робить OpenTelemetry API доступними для вашого розширення без необхідності пакувати їх у ваш JAR-файл розширення
2. Виявляє компоненти вашого розширення за допомогою механізму [ServiceLoader](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ServiceLoader.html) Java (наприклад, через анотації `@AutoService` у вашому коді)

### Вбудовування розширень в агент {#embedding-extensions-in-the-agent}

Інший варіант розгортання — створити один JAR-файл, який містить як OpenTelemetry Java агент, так і ваші розширення. Цей підхід спрощує розгортання (тільки один JAR-файл для керування) і усуває необхідність у параметрі командного рядка `-Dotel.javaagent.extensions`, що зменшує ймовірність випадково забути завантажити ваше розширення.

#### Як це працює {#how-it-works}

Агент автоматично шукає розширення в спеціальній теці `extensions/` всередині JAR-файлу агента, тому ми можемо використовувати завдання Gradle для:

1. Завантаження JAR-файлу OpenTelemetry Java агента
2. Розпакування його вмісту
3. Додавання вашого JAR-файлу(ів) розширень у теку `extensions/`
4. Перепакування всього в один JAR-файл

#### Завдання Gradle `extendedAgent` {#the-extendedagent-gradle-task}

Додайте наступне до файлу `build.gradle.kts` вашого проекту розширення:

```kotlin
plugins {
    id("java")

    // Shadow plugin: обʼєднує весь код розширення та його залежності в один JAR-файл
    // Це необхідно, оскільки розширення мають бути упаковані у вигляді одного JAR-файлу
    id("com.gradleup.shadow") version "9.2.2"
}

group = "com.example"
version = "1.0"

configurations {
    // Створюємо тимчасову конфігурацію для завантаження JAR-файлу агента
    // Подумайте про це як про "слот для завантаження", який відокремлений від залежностей вашого розширення
    create("otel")
}

dependencies {
    // Завантажуємо офіційний JAR-файл OpenTelemetry Java агента в конфігурацію 'otel'
    "otel"("io.opentelemetry.javaagent:opentelemetry-javaagent:{{% param vers.instrumentation %}}")

    /*
      Інтерфейси та SPI, які ми реалізуємо. Ми використовуємо залежність `compileOnly`, оскільки під час
      виконання всі необхідні класи надаються самим javaagent.
     */
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}")

    // Необхідно для власної інструментації
    compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
    compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:{{% param vers.instrumentation %}}-alpha")
    compileOnly("net.bytebuddy:byte-buddy:1.15.10")

    // Надає анотацію @AutoService, яка значно спрощує реєстрацію наших реалізацій SPI
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")
}

// Завдання: Створити розширений JAR-файл агента (агент + ваше розширення)
val extendedAgent by tasks.registering(Jar::class) {
    dependsOn(configurations["otel"])
    archiveFileName.set("opentelemetry-javaagent.jar")

    // Крок 1: Розпакувати JAR-файл офіційного агента
    from(zipTree(configurations["otel"].singleFile))

    // Крок 2: Додати JAR-файл вашого розширення до теки "extensions/"
    from(tasks.shadowJar.get().archiveFile) {
        into("extensions")
    }

    // Крок 3: Зберегти конфігурацію запуску агента (MANIFEST.MF)
    doFirst {
        manifest.from(
            zipTree(configurations["otel"].singleFile).matching {
                include("META-INF/MANIFEST.MF")
            }.singleFile
        )
    }
}

tasks {
    // Переконайтеся, що shadow JAR будується під час звичайного процесу збірки
    assemble {
        dependsOn(shadowJar)
    }
}
```

Для повного прикладу, зверніться до файлу gradle з [прикладу розширення](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/build.gradle.kts).

#### Створення та використання розширеного агента {#building-and-using-the-extended-agent}

Після того як ви додали завдання `extendedAgent` до вашого `build.gradle.kts`:

```bash
# 1. Збірка вашого розширення та створення розширеного агента
./gradlew extendedAgent

# 2. Знайдіть вихідний файл у build/libs/
ls build/libs/opentelemetry-javaagent.jar

# 3. Використовуйте його з вашим додатком (немає потреби у -Dotel.javaagent.extensions)
java -javaagent:build/libs/opentelemetry-javaagent.jar -jar myapp.jar
```

#### Вбудовування кількох розширень {#embedding-multiple-extensions}

Щоб вбудувати кілька розширень, змініть завдання `extendedAgent`, щоб включити кілька JAR-файлів розширень:

```kotlin
val extendedAgent by tasks.registering(Jar::class) {
  dependsOn(configurations["otel"])
  archiveFileName.set("opentelemetry-javaagent.jar")

  from(zipTree(configurations["otel"].singleFile))

  // Додати кілька розширень
  from(tasks.shadowJar.get().archiveFile) {
    into("extensions")
  }
  from(file("../other-extension/build/libs/other-extension-all.jar")) {
    into("extensions")
  }

  doFirst {
    manifest.from(
      zipTree(configurations["otel"].singleFile).matching {
        include("META-INF/MANIFEST.MF")
      }.singleFile
    )
  }
}
```

## Приклади розширень {#extension-examples}

Для отримання додаткових прикладів розширень дивіться [проект розширень](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension) у репозиторії Java інструментування.
