---
title: Configuration de l'instrumentation Zero-Code
linkTitle: Configuration
description:
  Apprenez comment configurer l'instrumentation Zero-Code pour Node.js
aliases:
  - /docs/languages/js/automatic/configuration
  - /docs/languages/js/automatic/module-config
weight: 10
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649 # patched
drifted_from_default: true
cSpell:ignore: serviceinstance
---

Ce module est hautement configurable via des
[variables d'environnement](/docs/specs/otel/configuration/sdk-environment-variables/).
De nombreux aspects du comportement de l'auto-instrumentation peuvent être
configurés selon vos besoins, tels que les détecteurs de ressources, les
exportateurs, les en-têtes de propagation du contexte de trace, et plus encore.

## Configuration du SDK et des exportateurs {#sdk-and-exporter-configuration}

La
[configuration du SDK et des exportateurs](/docs/languages/sdk-configuration/)
peut être définie en utilisant des variables d'environnement.

## Configuration des détecteurs de ressources du SDK {#sdk-resource-detector-configuration}

Par défaut, le module activera tous les détecteurs de ressources du SDK. Vous
pouvez utiliser la variable d'environnement `OTEL_NODE_RESOURCE_DETECTORS` pour
activer seulement certains détecteurs, ou les désactiver complètement :

- `env`
- `host`
- `os`
- `process`
- `serviceinstance`
- `container`
- `alibaba`
- `aws`
- `azure`
- `gcp`
- `all` - active tous les détecteurs de ressources
- `none` - désactive la détection de ressources

Par exemple, pour activer seulement les détecteurs `env` et `host`, vous pouvez
définir :

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

## Exclure des bibliothèques d'instrumentation {#excluding-instrumentation-libraries}

Par défaut, toutes les
[bibliothèques d'instrumentation supportées](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/e8e3cbdadf439c5bd16dfe5d6fc0714fe0e8235a/metapackages/auto-instrumentations-node/#supported-instrumentations)
sont activées, mais vous pouvez utiliser des variables d'environnement pour
activer ou désactiver des instrumentations spécifiques.

### Activer des instrumentations spécifiques {#enable-specific-instrumentations}

Utilisez la variable d'environnement `OTEL_NODE_ENABLED_INSTRUMENTATIONS` pour
activer seulement certaines instrumentations en fournissant une liste séparée
par des virgules des noms de bibliothèques d'instrumentation sans le préfixe
`@opentelemetry/instrumentation-`.

Par exemple, pour activer seulement les instrumentations
[@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http)
et
[@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/52dd28deae0ebfbec43bdaed82f4749fc9803797/plugins/node/opentelemetry-instrumentation-express)
:

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

### Désactiver des instrumentations spécifiques {#disable-specific-instrumentations}

Utilisez la variable d'environnement `OTEL_NODE_DISABLED_INSTRUMENTATIONS` pour
conserver la liste complètement activée et désactiver seulement certaines
instrumentations en fournissant une liste séparée par des virgules des noms de
bibliothèques d'instrumentation sans le préfixe
`@opentelemetry/instrumentation-`.

Par exemple, pour désactiver seulement les instrumentations
[@opentelemetry/instrumentation-fs](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-fs)
et
[@opentelemetry/instrumentation-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc)
:

```shell
OTEL_NODE_DISABLED_INSTRUMENTATIONS="fs,grpc"
```

{{% alert title="Note" %}}

Si les deux variables d'environnement sont définies,
`OTEL_NODE_ENABLED_INSTRUMENTATIONS` est appliquée en premier, puis
`OTEL_NODE_DISABLED_INSTRUMENTATIONS` est appliquée à cette liste. Par
conséquent, si la même instrumentation est incluse dans les deux listes, cette
instrumentation sera désactivée.

{{% /alert %}}
