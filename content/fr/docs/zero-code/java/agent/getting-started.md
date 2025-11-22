---
title: Démarrage rapide
weight: 1
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
cSpell:ignore: Dotel myapp
---

## Configuration {#setup}

1.  Téléchargez [opentelemetry-javaagent.jar][] depuis les [Releases][] du dépôt
    `opentelemetry-java-instrumentation` et placez le JAR dans le répertoire de
    votre choix. Le fichier JAR contient l'agent et les bibliothèques
    d'instrumentation.
2.  Ajoutez `-javaagent:path/to/opentelemetry-javaagent.jar` et d'autres
    configurations à vos arguments de démarrage de la JVM et lancez votre
    application :
    - Directement sur la commande de démarrage :

      ```shell
      java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
      ```

    - Via les variables d'environnement `JAVA_TOOL_OPTIONS` et autres :

      ```shell
      export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
      export OTEL_SERVICE_NAME="your-service-name"
      java -jar myapp.jar
      ```

## Configuration de l'agent {#configuring-the-agent}

L'agent est hautement configurable.

Une option consiste à passer les propriétés de configuration via le drapeau
`-D`. Dans cet exemple, un nom de service et un exportateur Zipkin pour les
traces sont configurés :

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.service.name=your-service-name \
     -Dotel.traces.exporter=zipkin \
     -jar myapp.jar
```

Vous pouvez également utiliser des variables d'environnement pour configurer
l'agent :

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=zipkin \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

Vous pouvez également fournir un fichier de propriétés Java et charger les
valeurs de configuration à partir de là :

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

ou

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

Pour voir toutes les options de configuration, consultez
[Configuration de l'agent](../configuration).

## Bibliothèques, frameworks, services d'application et JVM supportés {#supported-libraries-frameworks-application-services-and-jvms}

L'agent Java est livré avec des bibliothèques d'instrumentation pour de nombreux
composants populaires. Pour la liste complète, consultez [Bibliothèques,
frameworks, services d'application et JVM supportés][support].

## Dépannage {#troubleshooting}

{{% config_option name="otel.javaagent.debug" %}}

Définissez à `true` pour voir les journaux de débogage. Notez qu'ils sont assez
verbeux.

{{% /config_option %}}

## Prochaines étapes {#next-steps}

Après avoir configuré l'instrumentation automatique pour votre application ou
service, vous pourriez [annoter](../annotations) des méthodes sélectionnées ou
ajouter une [instrumentation manuelle](/docs/languages/java/instrumentation/)
pour collecter des données de télémétrie personnalisées.

[opentelemetry-javaagent.jar]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md
