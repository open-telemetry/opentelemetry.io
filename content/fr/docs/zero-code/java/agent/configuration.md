---
title: Configuration
weight: 10
aliases: [agent-config]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: customizer logback
---

{{% alert title="Pour plus d'informations" %}} Cette page décrit les différentes
manières dont la configuration peut être fournie à l'agent Java. Pour des
informations sur les options de configuration elles-mêmes, consultez
[Configurer le SDK](/docs/languages/java/configuration). {{% /alert %}}

## Configuration de l'agent {#agent-configuration}

L'agent peut trouver sa configuration d'une ou plusieurs des sources suivantes
(classées de la plus haute à la plus basse priorité) :

- Propriétés système
- [Variables d'environnement](#configuring-with-environment-variables)
- [Fichier de configuration](#configuration-file)
- Propriétés fournies par la fonction
  [`AutoConfigurationCustomizer#addPropertiesSupplier()`](https://github.com/open-telemetry/opentelemetry-java/blob/f92e02e4caffab0d964c02a32fe305d6d6ba372e/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizer.java#L73)
  ; en utilisant l'interface de prestation de service (SPI)
  [`AutoConfigurationCustomizerProvider`](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.java)

## Configurer avec des variables d'environnement {#configuring-with-environment-variables}

Dans certains environnements, la configuration des paramètres via des variables
d'environnement est souvent préférée. Tout paramètre qui peut être configuré en
utilisant une propriété système peut également être défini en utilisant une
variable d'environnement. Bien que de nombreux paramètres ci-dessous fournissent
des exemples pour les deux formats, pour ceux qui ne le font pas, utilisez les
étapes suivantes pour déterminer le mappage de nom correct pour la propriété
système souhaitée :

- Convertissez le nom de la propriété système en majuscules.
- Remplacez tous les caractères `.` et `-` par `_`.

Par exemple, `otel.instrumentation.common.default-enabled` se convertirait en
`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`.

## Fichier de configuration {#configuration-file}

Vous pouvez fournir un chemin vers un fichier de configuration d'agent en
définissant la propriété suivante :

{{% config_option name="otel.javaagent.configuration-file" %}} Chemin vers un
fichier de propriétés Java valide qui contient la configuration de l'agent.
{{% /config_option %}}

## Extensions {#extensions}

Vous pouvez activer les [extensions][] en définissant la propriété suivante :

{{% config_option name="otel.javaagent.extensions" %}}

Chemin vers un fichier jar d'extension ou un dossier contenant des fichiers jar.
Si vous pointez vers un dossier, chaque fichier jar dans ce dossier sera traité
comme une extension distincte et indépendante.

{{% /config_option %}}

## Sortie de journalisation de l'agent Java {#java-agent-logging-output}

La sortie de journalisation de l'agent peut être configurée en définissant la
propriété suivante :

{{% config_option name="otel.javaagent.logging" %}}

L'agent Java supporte ces 3 modes de journalisation :

- `simple` : L'agent imprimera ses journaux en utilisant le flux d'erreur
  standard. Seuls les journaux de niveau `INFO` ou supérieur seront imprimés.
  C'est le mode de journalisation par défaut de l'agent Java.
- `none` : L'agent ne journalisera rien - pas même sa propre version.
- `application` : L'agent tentera de rediriger ses propres journaux vers le
  logger slf4j de l'application instrumentée. Cela fonctionne le mieux pour les
  applications simples à un seul jar qui n'utilisent pas plusieurs chargeurs de
  classe (Classloader) ; les applications Spring Boot sont également supportées.
  La sortie des journaux de l'agent Java peut être configurée davantage en
  utilisant la configuration de journalisation de l'application instrumentée
  (par exemple `logback.xml` ou `log4j2.xml`). **Assurez-vous de tester que ce
  mode fonctionne pour votre application avant de l'exécuter dans un
  environnement de production.**

{{% /config_option %}}

## Configuration du SDK {#sdk-configuration}

Le module d'autoconfiguration du SDK est utilisé pour la configuration de base
de l'agent. Lisez la [documentation](/docs/languages/java/configuration) pour
trouver des paramètres tels que la configuration de l'exportation ou de
l'échantillonnage.

{{% alert title="Important" color="warning" %}}

Contrairement à l'autoconfiguration du SDK, les versions 2.0+ de l'agent Java et
du Spring Boot Starter OpenTelemetry utilisent `http/protobuf` comme protocole
par défaut, et non `grpc`.

{{% /alert %}}

## Activer les fournisseurs de ressources qui sont désactivés par défaut {#enable-resource-providers-that-are-disabled-by-default}

En plus de la configuration des ressources de l'autoconfiguration du SDK, vous
pouvez activer des fournisseurs de ressources supplémentaires qui sont
désactivés par défaut :

{{% config_option
name="otel.resource.providers.aws.enabled"
default=false
%}} Active le
[fournisseur de ressources AWS](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources).
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.gcp.enabled"
default=false
%}} Active le
[fournisseur de ressources GCP](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources).
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.azure.enabled"
default=false
%}} Active le
[fournisseur de ressources Azure](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/azure-resources).
{{% /config_option %}}

[extensions]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension#readme
