---
title: Instrumentation Zero-code JavaScript
linkTitle: JavaScript
description:
  Capturez la télémétrie de votre application sans aucune modification du code source
aliases: [/docs/languages/js/automatic]
---

L'instrumentation Zero-code pour JavaScript fournit un moyen d'instrumenter toute
application Node.js et de capturer les données de télémétrie de nombreuses bibliothèques et
frameworks populaires sans aucune modification de code.

## Configuration

Exécutez les commandes suivantes pour installer les paquets appropriés.

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

Les paquets `@opentelemetry/api` et `@opentelemetry/auto-instrumentations-node`
installent l'API, le SDK et les outils d'instrumentation.

## Configuration du module

Le module est hautement configurable.

Une option consiste à configurer le module en utilisant la commande `env` pour définir les variables
d'environnement depuis la CLI :

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

Alternativement, vous pouvez utiliser `export` pour définir les variables d'environnement :

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

Par défaut, toutes les [ressources détectées](/docs/languages/js/resources/) par le SDK sont
utilisées. Vous pouvez utiliser la variable d'environnement `OTEL_NODE_RESOURCE_DETECTORS` pour
activer seulement certains détecteurs, ou pour les désactiver complètement.

Pour voir la gamme complète des options de configuration, consultez
[Configuration du Module](configuration).

## Bibliothèques et frameworks supportés

Un certain nombre de bibliothèques Node.js populaires sont auto-instrumentées. Pour la liste complète,
consultez la page
[instrumentation supportée](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node#supported-instrumentations).

## Dépannage

Vous pouvez définir le niveau de log en définissant la variable d'environnement `OTEL_LOG_LEVEL`
à l'une des valeurs suivantes :

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`

Le niveau par défaut est `info`.

{{% alert title="Notes" %}}

- Dans un environnement de production, il est recommandé de définir `OTEL_LOG_LEVEL` à
  `info`.
- Les logs sont toujours envoyés vers `console`, quel que soit l'environnement ou le niveau de debug.
- Les logs de debug sont extrêmement verbeux et peuvent impacter négativement les performances de
  votre application. Activez les logs de debug seulement quand c'est nécessaire.

{{% /alert %}}
