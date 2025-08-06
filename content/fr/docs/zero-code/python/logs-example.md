---
title: Exemple d'auto-instrumentation des journaux
linkTitle: Exemple de journaux
weight: 20
aliases: [/docs/languages/python/automatic/logs-example]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: distro mkdir virtualenv
---

Cette page montre comment utiliser l'auto-instrumentation des journaux Python
dans OpenTelemetry.

Contrairement aux traces et aux métriques, il n'y a pas d'API équivalente pour
les journaux. Il n'y a qu'un SDK. Pour Python, vous utiliserez la bibliothèque
`logger` de Python, puis le SDK OTel qui attachera un gestionnaire OTLP au
logger racine, transformant le logger Python en logger OTLP. Une façon
d'accomplir cela est documentée dans l'exemple "logs" du [dépôt OpenTelemetry
Python][].

Une autre façon de le faire est via le support de Python pour
l'auto-instrumentation des journaux. L'exemple ci-dessous est basé sur l'exemple
"logs" du [dépôt OpenTelemetry Python][].

> Il existe une API qui fait le pont pour les journaux ; cependant, elle est
> différente de l'API des traces et des métriques, car elle n'est pas utilisée
> par les développeurs d'applications pour créer des journaux. Au lieu de cela,
> ils peuvent utiliser cette API pour configurer des appenders de journaux dans
> les bibliothèques de journalisation standard spécifiques au langage. Pour plus
> d'informations, voir [API des journaux](/docs/specs/otel/logs/api/).

Commencez par créer le répertoire des exemples et le fichier Python d'exemple :

```sh
mkdir python-logs-example
cd python-logs-example
touch example.py
```

Collez le contenu suivant dans `example.py` :

```python
import logging

from opentelemetry import trace

tracer = trace.get_tracer_provider().get_tracer(__name__)

# Corrélation du contexte de trace {#trace-context-correlation}
with tracer.start_as_current_span("foo"):
    # Faire quelque chose
    current_span = trace.get_current_span()
    current_span.add_event("Ceci est un événement de span")
    logging.getLogger().error("Ceci est un message de journal")
```

Ouvrez et copiez l'exemple
[otel-collector-config.yaml](https://github.com/open-telemetry/opentelemetry-python/blob/main/docs/examples/logs/otel-collector-config.yaml)
, et enregistrez-le dans `python-logs-example/otel-collector-config.yaml`

## Préparation {#prepare}

Exécutez l'exemple suivant, nous vous recommandons d'utiliser un environnement
virtuel pour le faire. Exécutez les commandes suivantes pour vous préparer à
l'auto-instrumentation des journaux :

```sh
mkdir python_logs_example
virtualenv python_logs_example
source python_logs_example/bin/activate
```

## Installation {#install}

Les commandes suivantes installent les paquets appropriés. Le paquet
`opentelemetry-distro` dépend de quelques autres, comme `opentelemetry-sdk` pour
l'instrumentation personnalisée de votre propre code et
`opentelemetry-instrumentation` qui fournit plusieurs commandes qui aident à
instrumenter automatiquement un programme.

```sh
pip install opentelemetry-distro
pip install opentelemetry-exporter-otlp
```

Les exemples qui suivent envoient les résultats de l'instrumentation à la
console. Apprenez-en plus sur l'installation et la configuration de la
[Distribution OpenTelemetry](/docs/languages/python/distro) pour envoyer la
télémétrie à d'autres destinations, comme un Collecteur OpenTelemetry.

> **Note**: Pour utiliser l'instrumentation automatique via
> `opentelemetry-instrument`, vous devez la configurer via des variables
> d'environnement ou la ligne de commande. L'agent crée un pipeline de
> télémétrie qui ne peut être modifié que par ces moyens. Si vous avez besoin de
> plus de personnalisation pour vos pipelines de télémétrie, alors vous devez
> renoncer à l'agent et importer le SDK OpenTelemetry et les bibliothèques
> d'instrumentation dans votre code et les configurer dans votre code. Vous
> pouvez également étendre l'instrumentation automatique en important l'API
> OpenTelemetry. Pour plus de détails, voir la [référence de l'API][].

## Exécution {#execute}

Cette section vous guide à travers le processus d'exécution d'une journalisation
instrumentée automatiquement.

Ouvrez une nouvelle fenêtre de terminal et démarrez le Collecteur OTel :

```sh
docker run -it --rm -p 4317:4317 -p 4318:4318 \
  -v $(pwd)/otel-collector-config.yml:/etc/otelcol-config.yml \
  --name otelcol \
  otel/opentelemetry-collector-contrib:0.76.1 \
  "--config=/etc/otelcol-config.yml"
```

Ouvrez un autre terminal et exécutez le programme Python :

```sh
source python_logs_example/bin/activate

export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
  --traces_exporter console,otlp \
  --metrics_exporter console,otlp \
  --logs_exporter console,otlp \
  --service_name python-logs-example \
  python $(pwd)/example.py
```

Exemple de sortie :

```text
...
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope __main__
Span #0
    Trace ID       : 389d4ac130a390d3d99036f9cd1db75e
    Parent ID      :
    ID             : f318281c4654edc5
    Name           : foo
    Kind           : Internal
    Start time     : 2023-08-18 17:04:05.982564 +0000 UTC
    End time       : 2023-08-18 17:04:05.982667 +0000 UTC
    Status code    : Unset
    Status message :
Events:
SpanEvent #0
     -> Name: This is a span event
     -> Timestamp: 2023-08-18 17:04:05.982586 +0000 UTC

...

ScopeLogs #0
ScopeLogs SchemaURL:
InstrumentationScope opentelemetry.sdk._logs._internal
LogRecord #0
ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-08-18 17:04:05.982605056 +0000 UTC
SeverityText: ERROR
SeverityNumber: Error(17)
Body: Str(This is a log message)
Attributes:
     -> otelSpanID: Str(f318281c4654edc5)
     -> otelTraceID: Str(389d4ac130a390d3d99036f9cd1db75e)
     -> otelTraceSampled: Bool(true)
     -> otelServiceName: Str(python-logs-example)
Trace ID: 389d4ac130a390d3d99036f9cd1db75e
Span ID: f318281c4654edc5
...
```

Notez que l'événement de Span et le journal ont tous deux le même SpanID
(`f318281c4654edc5`). Le SDK de journalisation ajoute le SpanID du Span actuel à
tous les événements journalisés pour améliorer la capacité à corréler la
télémétrie.

[référence de l'API]:
  https://opentelemetry-python.readthedocs.io/en/latest/index.html
[dépôt OpenTelemetry Python]:
  https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/logs
