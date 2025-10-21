---
title: Instrumentation Zero-code JavaScript
linkTitle: JavaScript
description:
  Capturez la télémétrie de votre application sans aucune modification du code
  source
aliases: [/docs/languages/js/automatic]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649 # patched
drifted_from_default: true
---

L'instrumentation Zero-code pour JavaScript fournit un moyen d'instrumenter
toute application Node.js et de capturer les données de télémétrie de nombreuses
bibliothèques et frameworks populaires sans aucune modification de code.

## Configuration {#setup}

Exécutez les commandes suivantes pour installer les paquets appropriés.

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

Les paquets `@opentelemetry/api` et `@opentelemetry/auto-instrumentations-node`
installent l'API, le SDK et les outils d'instrumentation.

## Configuration du module {#configuring-the-module}

Le module est hautement configurable.

Une option consiste à configurer le module en utilisant la commande `env` pour
définir les variables d'environnement depuis la CLI :

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

Alternativement, vous pouvez utiliser `export` pour définir les variables
d'environnement :

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

Par défaut, toutes les [ressources détectées](/docs/languages/js/resources/) par
le SDK sont utilisées. Vous pouvez utiliser la variable d'environnement
`OTEL_NODE_RESOURCE_DETECTORS` pour activer seulement certains détecteurs, ou
pour les désactiver complètement.

Pour voir la gamme complète des options de configuration, consultez
[Configuration du Module](configuration).

## Bibliothèques et frameworks supportés {#supported-libraries-and-frameworks}

Un certain nombre de bibliothèques Node.js populaires sont auto-instrumentées.
Pour la liste complète, consultez la page
[instrumentation supportée](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/e8e3cbdadf439c5bd16dfe5d6fc0714fe0e8235a/metapackages/auto-instrumentations-node/#supported-instrumentations).

## Dépannage {#troubleshooting}

Vous pouvez définir le niveau de log en définissant la variable d'environnement
`OTEL_LOG_LEVEL` à l'une des valeurs suivantes :

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`

Le niveau par défaut est `info`.

{{% alert title="Notes" %}}

- Dans un environnement de production, il est recommandé de définir
  `OTEL_LOG_LEVEL` à `info`.
- Les journaux sont toujours envoyés vers `console`, quel que soit
  l'environnement ou le niveau de debug.
- Les journaux de debug sont extrêmement verbeux et peuvent impacter
  négativement les performances de votre application. Activez les journaux de
  debug seulement quand c'est nécessaire.

{{% /alert %}}
