---
title: Configuration de l'agent
linkTitle: Configuration
weight: 10
aliases:
  - /docs/languages/python/automatic/configuration
  - /docs/languages/python/automatic/agent-config
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
cSpell:ignore: healthcheck instrumentor myapp pyproject Starlette urllib
---

L'agent est hautement configurable, soit par :

- Le passage de propriétés de configuration depuis l'interface de ligne de
  commande (CLI)
- La définition de
  [variables d'environnement](/docs/specs/otel/configuration/sdk-environment-variables/)

## Propriétés de configuration {#configuration-properties}

Voici un exemple de configuration de l'agent via des propriétés de configuration
:

```sh
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name votre-nom-de-service \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Voici une explication de ce que chaque configuration fait :

- `traces_exporter` spécifie quel exportateur de traces utiliser. Dans ce cas,
  les traces sont exportées vers la `console` (stdout) et avec `otlp`. L'option
  `otlp` indique à `opentelemetry-instrument` d'envoyer les traces à un point de
  terminaison qui accepte OTLP via gRPC. Pour utiliser HTTP au lieu de gRPC,
  ajoutez `--exporter_otlp_protocol http/protobuf`. La liste complète des
  options disponibles pour `traces_exporter`, consulter la contribution Python
  [Instrumentation OpenTelemetry](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
- `metrics_exporter` spécifie quel exportateur de métriques utiliser. Dans ce
  cas, les métriques sont exportées vers la `console` (stdout). Il est
  actuellement nécessaire de spécifier un exportateur de métriques. Si vous
  n'exportez pas de métriques, spécifiez `none` comme valeur à la place.
- `service_name` définit le nom du service associé à votre télémétrie, et est
  envoyé à votre [solution d'observabilité](/ecosystem/vendors/).
- `exporter_otlp_endpoint` définit le point de terminaison où la télémétrie est
  envoyée. Si omis, le point de terminaison par défaut du
  [Collecteur](/docs/collector/) sera utilisé, qui est `0.0.0.0:4317` pour gRPC
  et `0.0.0.0:4318` pour HTTP.
- `exporter_otlp_headers` est requis en fonction de votre solution
  d'observabilité choisi. Pour plus d'informations sur les en-têtes de
  l'exportateur OTLP, voir
  [OTEL_EXPORTER_OTLP_HEADERS](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_headers).

## Variables d'environnement {#environment-variables}

Dans certains cas, la configuration via des
[variables d'environnement](/docs/languages/sdk-configuration/) est préférable.
Tout paramètre configurable avec un argument de ligne de commande peut également
être configuré avec une variable d'environnement.

Vous pouvez appliquer les étapes suivantes pour déterminer le mappage de nom
correct de la propriété de configuration souhaitée :

- Convertissez la propriété de configuration en majuscules.
- Préfixez la variable d'environnement avec `OTEL_`

Par exemple, `exporter_otlp_endpoint` est converti en
`OTEL_EXPORTER_OTLP_ENDPOINT`.

## Configuration spécifique à Python {#python-specific-configuration}

Il existe des options de configuration spécifiques à Python que vous pouvez
définir en préfixant les variables d'environnement avec `OTEL_PYTHON_`.

### URLs à exclure {#excluded-urls}

Utilisez une liste d'expressions régulières séparées par des virgules
représentant les URLs à exclure dans toutes les instrumentations avec:

- `OTEL_PYTHON_EXCLUDED_URLS`

Vous pouvez également exclure des URLs pour des instrumentations spécifiques en
utilisant une variable `OTEL_PYTHON_<library>_EXCLUDED_URLS`, où `library` est
la version majuscule de l'un des noms suivants : Django, Falcon, FastAPI, Flask,
Pyramid, Requests, Starlette, Tornado, urllib, urllib3.

Exemples :

```sh
export OTEL_PYTHON_EXCLUDED_URLS="client/.*/info,healthcheck"
export OTEL_PYTHON_URLLIB3_EXCLUDED_URLS="client/.*/info"
export OTEL_PYTHON_REQUESTS_EXCLUDED_URLS="healthcheck"
```

### Noms d'attributs de requête {#request-attribute-names}

Utilisez une liste de noms séparés par des virgules qui seront extraits de la
requête et définis comme attributs sur les spans.

- `OTEL_PYTHON_DJANGO_TRACED_REQUEST_ATTRS`
- `OTEL_PYTHON_FALCON_TRACED_REQUEST_ATTRS`
- `OTEL_PYTHON_TORNADO_TRACED_REQUEST_ATTRS`

Exemples :

```sh
export OTEL_PYTHON_DJANGO_TRACED_REQUEST_ATTRS='path_info,content_type'
export OTEL_PYTHON_FALCON_TRACED_REQUEST_ATTRS='query_string,uri_template'
export OTEL_PYTHON_TORNADO_TRACED_REQUEST_ATTRS='uri,query'
```

### Journalisation {#logging}

Il existe des options de configuration utilisables pour contrôler les journaux
qui sont générés.

- `OTEL_PYTHON_LOG_CORRELATION` : pour activer l'injection de contexte de trace
  dans les journaux (true, false)
- `OTEL_PYTHON_LOG_FORMAT` : pour indiquer à l'instrumentation d'utiliser un
  format de journalisation personnalisé
- `OTEL_PYTHON_LOG_LEVEL` : pour définir un niveau de journalisation
  personnalisé (info, error, debug, warning)
- `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` : pour activer
  l'auto-instrumentation des journaux. Attache le gestionnaire OTLP au logger
  racine de Python. Pour un exemple, voir
  [Auto-instrumentation des journaux](/docs/zero-code/python/logs-example/).

Exemples :

```sh
export OTEL_PYTHON_LOG_CORRELATION=true
export OTEL_PYTHON_LOG_FORMAT="%(msg)s [span_id=%(span_id)s]"
export OTEL_PYTHON_LOG_LEVEL=debug
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
```

### Autre {#other}

Il existe d'autres options de configuration qui peuvent être définies et qui
n'entrent pas dans une catégorie spécifique.

- `OTEL_PYTHON_DJANGO_INSTRUMENT` : mettre à `false` pour désactiver l'état
  activé par défaut pour l'instrumentation Django
- `OTEL_PYTHON_ELASTICSEARCH_NAME_PREFIX` : modifie les préfixes par défaut pour
  les noms d'opération Elasticsearch de "Elasticsearch" à ce qui est utilisé
  dans cette option
- `OTEL_PYTHON_GRPC_EXCLUDED_SERVICES` : liste de services spécifiques séparés
  par des virgules à exclure pour l'instrumentation gRPC
- `OTEL_PYTHON_ID_GENERATOR` : pour spécifier quel générateur d'ID utiliser pour
  le fournisseur global de traces
- `OTEL_PYTHON_INSTRUMENTATION_SANITIZE_REDIS` : pour activer l'offuscation des
  valeurs dans les requêtes

Exemples :

```sh
export OTEL_PYTHON_DJANGO_INSTRUMENT=false
export OTEL_PYTHON_ELASTICSEARCH_NAME_PREFIX=mon-prefixe-personnalise
export OTEL_PYTHON_GRPC_EXCLUDED_SERVICES="GRPCTestServer,GRPCHealthServer"
export OTEL_PYTHON_ID_GENERATOR=xray
export OTEL_PYTHON_INSTRUMENTATION_SANITIZE_REDIS=true
```

## Désactivation d'instrumentations spécifiques {#disabling-specific-instrumentations}

Par défaut, l'agent Python détectera les paquets d'un programme Python et
instrumentera tous les paquets qu'il peut. Cela facilite l'instrumentation, mais
peut entraîner des données trop nombreuses ou non désirées.

Vous pouvez omettre des paquets spécifiques de l'instrumentation en utilisant la
variable d'environnement `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS`. La variable
d'environnement peut être définie sur une liste de noms de points d'entrée
d'instrumentations séparés par des virgules à exclure de l'instrumentation. La
plupart du temps, le nom du point d'entrée est le même que le nom du paquet et
il est défini dans la table `project.entry-points.opentelemetry_instrumentor` du
fichier `pyproject.toml` du paquet.

Par exemple, si votre programme Python utilise les paquets `redis`,
`kafka-python` et `grpc`, par défaut, l'agent utilisera les paquets
`opentelemetry-instrumentation-redis`,
`opentelemetry-instrumentation-kafka-python` et
`opentelemetry-instrumentation-grpc` pour les instrumenter. Pour désactiver
cela, vous pouvez définir
`OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=redis,kafka,grpc_client`.
