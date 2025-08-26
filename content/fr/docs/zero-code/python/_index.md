---
title: Instrumentation sans code Python
linkTitle: Python
weight: 30
aliases: [/docs/languages/python/automatic]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: distro myapp
---

L'instrumentation automatique avec Python utilise un agent Python qui peut être
attaché à n'importe quelle application Python. Cet agent utilise principalement
le [monkey patching](https://fr.wikipedia.org/wiki/Monkey_patch) (ou
"réouverture des classes") pour modifier les fonctions des bibliothèques à
l'exécution, permettant la capture de données de télémétrie de nombreuses
bibliothèques et frameworks populaires.

## Installation {#setup}

Exécutez les commandes suivantes pour installer les paquets appropriés.

```sh
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

Le paquet `opentelemetry-distro` installe l'API, le SDK, et les outils
`opentelemetry-bootstrap` et `opentelemetry-instrument`.

{{% alert title="Note" %}}

Vous devez installer un paquet de distribution (distro) pour que
l'instrumentation automatique fonctionne. Le paquet `opentelemetry-distro`
contient la distribution par défaut pour configurer automatiquement certaines
des options communes pour les utilisateurs. Pour plus d'informations, voir
[Distribution OpenTelemetry](/docs/languages/python/distro/).

{{% /alert %}}

La commande `opentelemetry-bootstrap -a install` parcourt la liste des paquets
installés dans votre dossier `site-packages` actif, et installe les
bibliothèques d'instrumentation correspondantes pour ces paquets, le cas
échéant. Par exemple, si vous avez déjà installé le paquet `flask`, l'exécution
de `opentelemetry-bootstrap -a install` installera
`opentelemetry-instrumentation-flask` pour vous. L'agent Python OpenTelemetry
utilisera le monkey patching pour modifier les fonctions de ces bibliothèques à
l'exécution.

L'exécution de `opentelemetry-bootstrap` sans arguments liste les bibliothèques
d'instrumentation recommandées à installer. Pour plus d'informations, voir
[`opentelemetry-bootstrap`](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

{{% alert title="Vous utilisez <code>uv</code> ?" color="warning" %}} Si vous
utilisez le gestionnaire de paquets [uv](https://docs.astral.sh/uv/), vous
pourriez rencontrer des difficultés lors de l'exécution de
`opentelemetry-bootstrap -a install`. Pour plus de détails, voir
[Bootstrap avec uv](troubleshooting/#bootstrap-using-uv). {{% /alert %}}

{#configuring-the-agent}

## Configuration de l'agent {#configuring-the-agent}

L'agent est hautement configurable.

Une option est de configurer l'agent via des propriétés de configuration depuis
l'interface de ligne de commande (CLI) :

```sh
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name votre-nom-de-service \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Alternativement, vous pouvez utiliser des variables d'environnement pour
configurer l'agent :

```sh
OTEL_SERVICE_NAME=votre-nom-de-service \
OTEL_TRACES_EXPORTER=console,otlp \
OTEL_METRICS_EXPORTER=console \
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=0.0.0.0:4317
opentelemetry-instrument \
    python myapp.py
```

Pour voir la gamme complète des options de configuration, voir
[Configuration de l'agent](configuration).

## Bibliothèques et frameworks supportés {#supported-libraries-and-frameworks}

Un certain nombre de bibliothèques Python populaires sont auto-instrumentées, y
compris
[Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask)
et
[Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django).
Pour la liste complète, voir le
[Registre](/ecosystem/registry/?language=python&component=instrumentation).

## Dépannage {#troubleshooting}

Pour les étapes de dépannage générales et les solutions à des problèmes
spécifiques, voir [Dépannage](./troubleshooting/).
