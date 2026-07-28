---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
description:
  Les extensions ajoutent des capacités à l'agent sans avoir à créer une
  distribution séparée.
weight: 300
default_lang_commit: cb8364effee3fd3f2dc33c15da7c47bde0432122
cSpell:ignore: Customizer Dotel myextension
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/extensions-minimal"?>

## Introduction {#introduction}

Les extensions ajoutent de nouvelles fonctionnalités et capacités à l'agent Java
OpenTelemetry sans vous obliger à créer une distribution séparée (une version
personnalisée de l'agent entier). Voyez les extensions comme des greffons qui
personnalisent le comportement de l'agent.

Les extensions vous permettent de :

- Ajouter de nouvelles instrumentations pour des bibliothèques qui ne sont pas
  encore prises en charge
- Personnaliser le comportement d'une instrumentation existante
- Implémenter des composants de SDK personnalisés (échantillonneurs,
  exportateurs, propagateurs)
- Personnaliser la configuration par programme, dans les cas que ne couvrent ni
  les variables d'environnement ni la configuration déclarative
- Modifier la collecte et le traitement des données de télémétrie

## Démarrage rapide {#quick-start}

Voici une extension minimale, qui ajoute un processeur de spans personnalisé,
pour vous lancer :

Créez un projet Gradle (build.gradle.kts) :

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
    // Use BOM to manage OpenTelemetry dependency versions
    compileOnly(platform("io.opentelemetry:opentelemetry-bom:1.61.0"))

    // OpenTelemetry SDK autoconfiguration SPI (provided by agent)
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")

    // OpenTelemetry SDK (needed for SpanProcessor and trace classes)
    compileOnly("io.opentelemetry:opentelemetry-sdk")

    // Annotation processor for automatic SPI registration
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")

    // Add any external dependencies with 'implementation' scope
    // implementation("org.apache.commons:commons-lang3:3.19.0")
}

tasks.assemble {
    dependsOn(tasks.shadowJar)
}
```
<!-- prettier-ignore-end -->

Créez une implémentation de `SpanProcessor` :

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MySpanProcessor.java" from="public"?>
```java
public class MySpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // Add custom attributes when span starts
    span.setAttribute("custom.processor", "active");
  }

  @Override
  public boolean isStartRequired() {
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Process span when it ends (optional)
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

Créez une classe d'extension qui utilise le SPI
`AutoConfigurationCustomizerProvider` :

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

Compilez l'extension :

```bash
./gradlew shadowJar
```

Utilisez l'extension :

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=build/libs/my-extension-all.jar \
     -jar myapp.jar
```

## Utiliser des extensions {#using-extensions}

Il existe deux façons d'utiliser des extensions avec l'agent Java :

- **Charger un fichier JAR séparé** — souple pour le développement et les tests
- **Intégrer dans l'agent** — un seul JAR à déployer, pour la production

| Approche                     | Avantages                                                                | Inconvénients                                              | Recommandé pour          |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------ |
| **Chargement à l'exécution** | Extensions faciles à remplacer, aucune recompilation nécessaire          | Une option de ligne de commande supplémentaire est requise | Développement, tests     |
| **Intégration**              | Un seul JAR, déploiement plus simple, impossible d'oublier de la charger | Nécessite une recompilation pour changer d'extension       | Production, distribution |

### Charger des extensions à l'exécution {#loading-extensions-at-runtime}

Les extensions peuvent être chargées à l'exécution via la propriété système
`otel.javaagent.extensions` ou la variable d'environnement
`OTEL_JAVAAGENT_EXTENSIONS`. Cette option de configuration accepte des chemins,
séparés par des virgules, vers des fichiers JAR d'extension ou vers des
répertoires contenant de tels JAR.

#### Extension unique {#single-extension}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/my-extension.jar \
     -jar myapp.jar
```

#### Extensions multiples {#multiple-extensions}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/path/to/extension2.jar \
     -jar myapp.jar
```

#### Répertoire d'extensions {#extension-directory}

Vous pouvez indiquer un répertoire contenant plusieurs JAR d'extension : tous
les JAR de ce répertoire seront chargés.

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extensions-directory \
     -jar myapp.jar
```

#### Chemins mixtes {#mixed-paths}

Vous pouvez combiner des fichiers JAR individuels et des répertoires :

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/opt/extensions,/tmp/custom.jar \
     -jar myapp.jar
```

#### Fonctionnement du chargement des extensions {#how-extension-loading-works}

Lorsque vous chargez des extensions à l'exécution, l'agent :

1. Met les API OpenTelemetry à la disposition de votre extension, sans que vous
   ayez à les empaqueter dans le JAR de celle-ci
2. Découvre les composants de votre extension via le mécanisme
   [ServiceLoader](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ServiceLoader.html)
   de Java (par exemple grâce aux annotations `@AutoService` dans votre code)

### Intégrer des extensions dans l'agent {#embedding-extensions-in-the-agent}

Une autre option de déploiement consiste à créer un fichier JAR unique
contenant à la fois l'agent Java OpenTelemetry et votre ou vos extensions. Cette
approche simplifie le déploiement (un seul JAR à gérer) et supprime le besoin de
l'option de ligne de commande `-Dotel.javaagent.extensions`, ce qui rend plus
difficile d'oublier accidentellement de charger votre extension.

#### Fonctionnement {#how-it-works}

L'agent cherche automatiquement les extensions dans un répertoire spécial
`extensions/` à l'intérieur du JAR de l'agent. Nous pouvons donc utiliser une
tâche de compilation Gradle pour :

1. Télécharger le JAR de l'agent Java OpenTelemetry
2. Extraire son contenu
3. Ajouter le ou les JAR de votre extension dans le répertoire `extensions/`
4. Réempaqueter le tout dans un JAR unique

#### La tâche Gradle `extendedAgent` {#the-extendedagent-gradle-task}

Ajoutez ce qui suit au fichier `build.gradle.kts` de votre projet d'extension :

```kotlin
plugins {
    id("java")

    // Plugin Shadow : réunit le code de votre extension et ses dépendances dans un seul JAR
    // C'est nécessaire, car une extension doit être empaquetée en un JAR unique
    id("com.gradleup.shadow") version "9.2.2"
}

group = "com.example"
version = "1.0"

configurations {
    // Crée une configuration temporaire pour télécharger le JAR de l'agent
    // Voyez-la comme un « emplacement de téléchargement », distinct des dépendances de l'extension
    create("otel")
}

dependencies {
    // Télécharge l'agent Java OpenTelemetry officiel dans la configuration « otel »
    "otel"("io.opentelemetry.javaagent:opentelemetry-javaagent:{{% param vers.instrumentation %}}")

    /*
      Interfaces et SPI que nous implémentons. Nous utilisons une dépendance `compileOnly`
      car, à l'exécution, toutes les classes nécessaires sont fournies par l'agent lui-même.
     */
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}")

    // Requis pour une instrumentation personnalisée
    compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
    compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:{{% param vers.instrumentation %}}-alpha")
    compileOnly("net.bytebuddy:byte-buddy:1.15.10")

    // Fournit l'annotation @AutoService, qui simplifie beaucoup l'enregistrement de nos implémentations de SPI
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")
}

// Tâche : créer un JAR d'agent étendu (agent + votre extension)
val extendedAgent by tasks.registering(Jar::class) {
    dependsOn(configurations["otel"])
    archiveFileName.set("opentelemetry-javaagent.jar")

    // Étape 1 : décompresser le JAR officiel de l'agent
    from(zipTree(configurations["otel"].singleFile))

    // Étape 2 : ajouter le JAR de votre extension dans le répertoire « extensions/ »
    from(tasks.shadowJar.get().archiveFile) {
        into("extensions")
    }

    // Étape 3 : préserver la configuration de démarrage de l'agent (MANIFEST.MF)
    doFirst {
        manifest.from(
            zipTree(configurations["otel"].singleFile).matching {
                include("META-INF/MANIFEST.MF")
            }.singleFile
        )
    }
}

tasks {
    // S'assurer que le shadow JAR est construit pendant le processus de build normal
    assemble {
        dependsOn(shadowJar)
    }
}
```

Pour un exemple complet, référez-vous au fichier gradle de
l'[exemple d'extension](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/build.gradle.kts).

#### Compiler et utiliser l'agent étendu {#building-and-using-the-extended-agent}

Une fois la tâche `extendedAgent` ajoutée à votre `build.gradle.kts` :

```bash
# 1. Compiler votre extension et créer l'agent étendu
./gradlew extendedAgent

# 2. Récupérer le résultat dans build/libs/
ls build/libs/opentelemetry-javaagent.jar

# 3. L'utiliser avec votre application (pas besoin de -Dotel.javaagent.extensions)
java -javaagent:build/libs/opentelemetry-javaagent.jar -jar myapp.jar
```

#### Intégrer plusieurs extensions {#embedding-multiple-extensions}

Pour intégrer plusieurs extensions, modifiez la tâche `extendedAgent` afin
d'inclure plusieurs JAR d'extension :

```kotlin
val extendedAgent by tasks.registering(Jar::class) {
  dependsOn(configurations["otel"])
  archiveFileName.set("opentelemetry-javaagent.jar")

  from(zipTree(configurations["otel"].singleFile))

  // Ajouter plusieurs extensions
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

## Écrire des extensions {#writing-extensions}

Créer une extension consiste à implémenter une ou plusieurs classes de SPI
(Service Provider Interface), à les empaqueter dans un fichier JAR, puis à
indiquer ce JAR à l'agent au lancement de votre application (voir
[Utiliser des extensions](#using-extensions)).

> [!TIP]
>
> Pour une référence complète et exécutable couvrant chacun des SPI décrits
> ci-dessous, voir le
> [projet d'exemple d'extension](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)
> dans le dépôt d'instrumentation Java.

### Mise en place du projet et dépendances {#project-setup-and-dependencies}

Les extensions doivent gérer leurs dépendances avec soin, afin d'éviter les
conflits avec l'agent et avec l'application. Pour comprendre comment l'agent
isole les extensions entre chargeurs de classes, voir
[Structure de l'agent Java](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/contributing/javaagent-structure.md).

#### Dépendances fournies par l'agent (utilisez `compileOnly`) {#dependencies-provided-by-agent-use-compileonly}

Ces API sont disponibles à l'exécution, fournies par l'agent :

```kotlin
compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator")
compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api")
```

#### Dépendances du classpath de l'application (utilisez `compileOnly`) {#dependencies-from-application-classpath-use-compileonly}

Lorsque vous créez une instrumentation, vous devez référencer des classes de
l'application cible. Elles doivent également être en `compileOnly` :

```kotlin
// Accessibles uniquement dans les classes Advice, pendant l'instrumentation
compileOnly("javax.servlet:javax.servlet-api:3.0.1")
```

#### Dépendances externes à l'exécution (utilisez `implementation`) {#external-runtime-dependencies-use-implementation}

Toute bibliothèque externe dont votre extension a besoin à l'exécution doit
utiliser la portée `implementation` ; elle sera empaquetée dans le shadow JAR :

```kotlin
implementation("org.apache.commons:commons-lang3:3.19.0")
implementation("com.google.guava:guava:33.0.0-jre")
```

> [!IMPORTANT]
>
> Les extensions ne peuvent pas charger de dépendances depuis des fichiers JAR
> séparés. Toutes les dépendances doivent être fusionnées dans un shadow JAR
> unique.

### Panorama des points d'extension {#extension-points-overview}

L'agent Java OpenTelemetry fournit plusieurs points d'extension via des
interfaces SPI. Voici les plus couramment utilisés :

> [!NOTE]
>
> Les SPI liés à la configuration ci-dessous (comme
> `AutoConfigurationCustomizerProvider`) s'appliquent lorsque le SDK est
> configuré par variables d'environnement ou propriétés système. Ils se
> comportent différemment, ou ne s'appliquent pas, lorsque la
> [configuration déclarative](../declarative-configuration) est utilisée.
> Consultez la référence de chaque point d'extension ci-dessous pour les
> détails.

| Point d'extension                     | Paquet                                                        | Rôle                                             |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `AutoConfigurationCustomizerProvider` | `io.opentelemetry.sdk.autoconfigure.spi`                      | Point d'entrée principal pour adapter le SDK     |
| `ConfigurablePropagatorProvider`      | `io.opentelemetry.sdk.autoconfigure.spi`                      | Enregistrer des propagateurs personnalisés       |
| `ConfigurableSamplerProvider`         | `io.opentelemetry.sdk.autoconfigure.spi.traces`               | Enregistrer des échantillonneurs personnalisés   |
| `ResourceProvider`                    | `io.opentelemetry.sdk.autoconfigure.spi`                      | Ajouter des attributs de ressource personnalisés |
| `InstrumenterCustomizerProvider`      | `io.opentelemetry.instrumentation.api.incubator.instrumenter` | Adapter des instrumentations existantes          |
| `InstrumentationModule`               | `io.opentelemetry.javaagent.extension.instrumentation`        | Créer de nouvelles instrumentations              |

Pour une référence complète des SPI d'autoconfiguration, y compris les
implémentations intégrées et communautaires, voir
[SPI (Service provider interface)](/docs/languages/java/configuration/#spi-service-provider-interface).

### Configuration dans les extensions {#configuration-in-extensions}

Les extensions peuvent lire et fournir de la configuration pour adapter leur
comportement.

#### Accéder à la configuration dans une extension {#accessing-configuration-in-extensions}

De nombreuses méthodes de SPI reçoivent un paramètre `ConfigProperties` qui vous
permet de lire la configuration :

```java
@Override
public Sampler createSampler(ConfigProperties config) {
  // Lire la configuration, avec des valeurs par défaut
  String endpoint = config.getString("otel.exporter.otlp.endpoint", "http://localhost:4317");
  int threshold = config.getInt("otel.instrumentation.myext.threshold", 100);
  boolean enabled = config.getBoolean("otel.instrumentation.myext.enabled", true);
  return new MySampler(endpoint, threshold, enabled);
}
```

#### Fournir une configuration par défaut {#providing-default-configuration}

Les extensions peuvent fournir des valeurs de configuration par défaut, qui
seront utilisées si elles ne sont pas surchargées :

```java
@Override
public void customize(AutoConfigurationCustomizer config) {
  config.addPropertiesSupplier(() -> {
    Map<String, String> props = new HashMap<>();
    props.put("otel.exporter.otlp.endpoint", "http://my-backend:8080");
    props.put("otel.service.name", "my-service");
    props.put("otel.instrumentation.myext.enabled", "true");
    return props;
  });
}
```

#### Conventions de nommage de la configuration {#configuration-naming-conventions}

Respectez ces conventions pour les noms des paramètres de configuration :

Les propriétés standard d'OpenTelemetry utilisent le préfixe `otel.*`.

- `otel.service.name`
- `otel.traces.sampler`
- `otel.exporter.otlp.endpoint`

Les propriétés propres à une instrumentation utilisent
`otel.instrumentation.<name>.*`.

- `otel.instrumentation.cassandra.enabled`
- `otel.instrumentation.jdbc.statement-sanitizer.enabled`

Les propriétés propres à une extension suivent le même schéma.

- `otel.instrumentation.myextension.enabled`
- `otel.instrumentation.myextension.threshold`
- `otel.instrumentation.myextension.custom-value`

### Utiliser @AutoService {#using-autoservice}

L'annotation `@AutoService` génère automatiquement les fichiers
`META-INF/services/` requis pour l'enregistrement des SPI. Pour l'utiliser :

Ajoutez la dépendance :

```kotlin
compileOnly("com.google.auto.service:auto-service:1.1.1")
annotationProcessor("com.google.auto.service:auto-service:1.1.1")
```

Puis annotez vos implémentations de SPI de cette façon :

```java
import com.google.auto.service.AutoService;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {
  // Implémentation
}
```

Cela équivaut à créer manuellement le fichier
`META-INF/services/io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider`
contenant le nom de votre classe.

## Référence des points d'extension {#extension-point-reference}

### AutoConfigurationCustomizerProvider {#autoconfigurationcustomizerprovider}

> [!NOTE]
>
> Ceci ne fonctionnera pas dans les situations où la
> [configuration déclarative](../declarative-configuration) est utilisée.

C'est le point d'entrée principal pour personnaliser la configuration du SDK. Il
vous permet de :

- Personnaliser le fournisseur de traces (tracer provider)
- Ajouter des processeurs de spans et des exportateurs
- Fournir des propriétés de configuration par défaut
- Personnaliser d'autres composants du SDK

**Exemple :**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoAutoConfigurationCustomizerProvider.java" from="@AutoService"?>
```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class DemoAutoConfigurationCustomizerProvider
    implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer autoConfiguration) {
    autoConfiguration
        .addTracerProviderCustomizer(this::configureSdkTracerProvider)
        .addPropertiesSupplier(this::getDefaultProperties);
  }

  private SdkTracerProviderBuilder configureSdkTracerProvider(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {

    return tracerProvider
        .setIdGenerator(new DemoIdGenerator())
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new DemoSpanProcessor())
        .addSpanProcessor(SimpleSpanProcessor.create(new DemoSpanExporter()));
  }

  private Map<String, String> getDefaultProperties() {
    Map<String, String> properties = new HashMap<>();
    properties.put("otel.exporter.otlp.endpoint", "http://backend:8080");
    properties.put("otel.exporter.otlp.insecure", "true");
    properties.put("otel.config.max.attrs", "16");
    properties.put("otel.traces.sampler", "demo");
    return properties;
  }
}
```
<!-- prettier-ignore-end -->

### InstrumenterCustomizerProvider {#instrumentercustomizerprovider}

Adaptez des instrumentations existantes sans modifier leur code. C'est la façon
recommandée d'ajouter des attributs, des métriques, ou de modifier le
comportement des instrumentations intégrées.

**Exemple :**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoInstrumenterCustomizerProvider.java" from="/**"?>
```java
/**
 * This example demonstrates how to use the InstrumenterCustomizerProvider SPI to customize
 * instrumentation behavior without modifying the core instrumentation code.
 *
 * <p>This customizer adds:
 *
 * <ul>
 *   <li>Custom attributes to HTTP server spans (based on instrumentation name)
 *   <li>Custom attributes to HTTP client spans (based on instrumentation type)
 *   <li>Custom metrics for HTTP operations
 *   <li>Request correlation IDs via context customization
 *   <li>Custom span name transformation
 * </ul>
 *
 * <p>The customizer will be automatically applied to instrumenters that match the specified
 * instrumentation name or type.
 *
 * @see InstrumenterCustomizerProvider
 * @see InstrumenterCustomizer
 */
@AutoService(InstrumenterCustomizerProvider.class)
public class DemoInstrumenterCustomizerProvider implements InstrumenterCustomizerProvider {

  @Override
  public void customize(InstrumenterCustomizer customizer) {
    String instrumentationName = customizer.getInstrumentationName();
    if (isHttpServerInstrumentation(instrumentationName)) {
      customizeHttpServer(customizer);
    }

    if (customizer.hasType(InstrumenterCustomizer.InstrumentationType.HTTP_CLIENT)) {
      customizeHttpClient(customizer);
    }
  }

  private boolean isHttpServerInstrumentation(String instrumentationName) {
    return instrumentationName.contains("servlet")
        || instrumentationName.contains("jetty")
        || instrumentationName.contains("tomcat")
        || instrumentationName.contains("undertow")
        || instrumentationName.contains("spring-webmvc");
  }

  private void customizeHttpServer(InstrumenterCustomizer customizer) {
    customizer.addAttributesExtractor(new DemoAttributesExtractor());
    customizer.addOperationMetrics(new DemoMetrics());
    customizer.addContextCustomizer(new DemoContextCustomizer());
    customizer.setSpanNameExtractorCustomizer(
        unused -> (SpanNameExtractor<Object>) object -> "CustomHTTP/" + object.toString());
  }

  private void customizeHttpClient(InstrumenterCustomizer customizer) {
    // Simple customization for HTTP client instrumentations
    customizer.addAttributesExtractor(new DemoHttpClientAttributesExtractor());
  }

  /** Custom attributes extractor for HTTP client instrumentations. */
  private static class DemoHttpClientAttributesExtractor
      implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CLIENT_ATTR =
        AttributeKey.stringKey("demo.client.type");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CLIENT_ATTR, "demo-http-client");
    }

    @Override
    public void onEnd(
        AttributesBuilder attributes,
        Context context,
        Object request,
        Object response,
        Throwable error) {}
  }

  /** Custom attributes extractor that adds demo-specific attributes. */
  private static class DemoAttributesExtractor implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CUSTOM_ATTR = AttributeKey.stringKey("demo.custom");
    private static final AttributeKey<String> ERROR_ATTR = AttributeKey.stringKey("demo.error");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CUSTOM_ATTR, "demo-extension");
    }

    @Override
    public void onEnd(
        AttributesBuilder attributes,
        Context context,
        Object request,
        Object response,
        Throwable error) {
      if (error != null) {
        attributes.put(ERROR_ATTR, error.getClass().getSimpleName());
      }
    }
  }

  /** Custom metrics that track request counts. */
  private static class DemoMetrics implements OperationMetrics {
    @Override
    public OperationListener create(Meter meter) {
      LongCounter requestCounter =
          meter
              .counterBuilder("demo.requests")
              .setDescription("Number of requests")
              .setUnit("requests")
              .build();

      return new OperationListener() {
        @Override
        public Context onStart(Context context, Attributes attributes, long startNanos) {
          requestCounter.add(1, attributes);
          return context;
        }

        @Override
        public void onEnd(Context context, Attributes attributes, long endNanos) {
          // Could add duration metrics here if needed
        }
      };
    }
  }

  /** Context customizer that adds request correlation IDs and custom context data. */
  private static class DemoContextCustomizer implements ContextCustomizer<Object> {
    private static final AtomicLong requestIdCounter = new AtomicLong(1);
    private static final ContextKey<String> REQUEST_ID_KEY = ContextKey.named("demo.request.id");

    @Override
    public Context onStart(Context context, Object request, Attributes startAttributes) {
      // Generate a unique request ID for correlation
      String requestId = "req-" + requestIdCounter.getAndIncrement();

      // Add custom context data that can be accessed throughout the request lifecycle
      context = context.with(REQUEST_ID_KEY, requestId);
      return context;
    }
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurablePropagatorProvider {#configurablepropagatorprovider}

Enregistrez des propagateurs personnalisés, référençables par leur nom dans la
configuration `otel.propagators`.

**Exemple :**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoPropagatorProvider.java" from="@AutoService"?>
```java
@AutoService(ConfigurablePropagatorProvider.class)
public class DemoPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    return new DemoPropagator();
  }

  @Override
  public String getName() {
    return "demo";
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurableSamplerProvider {#configurablesamplerprovider}

Enregistrez des échantillonneurs personnalisés, référençables dans la
configuration `otel.traces.sampler`.

**Exemple (`otel.traces.sampler=demo`) :**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoConfigurableSamplerProvider.java" from="@AutoService"?>
```java
@AutoService(ConfigurableSamplerProvider.class)
public class DemoConfigurableSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    return new DemoSampler();
  }

  @Override
  public String getName() {
    return "demo";
  }
}
```
<!-- prettier-ignore-end -->

### ResourceProvider {#resourceprovider}

Ajoutez des attributs de ressource personnalisés, qui seront automatiquement
fusionnés avec ceux des autres fournisseurs de ressources.

**Exemple :**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoResourceProvider.java" from="@AutoService"?>
```java
@AutoService(ResourceProvider.class)
public class DemoResourceProvider implements ResourceProvider {
  @Override
  public Resource createResource(ConfigProperties config) {
    Attributes attributes = Attributes.builder().put("custom.resource", "demo").build();
    return Resource.create(attributes);
  }
}
```
<!-- prettier-ignore-end -->

## Exemples d'extensions {#extension-examples}

Pour d'autres exemples d'extensions, voir le
[projet d'extension](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)
dans le dépôt d'instrumentation Java.
