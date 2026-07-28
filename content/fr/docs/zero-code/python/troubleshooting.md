---
title: Dépannage des problèmes d'instrumentation automatique de Python
linkTitle: Dépannage
weight: 40
default_lang_commit: 182bcc0bb62c5359157142153804d22f0ee60242
cSpell:ignore: ASGI gunicorn uvicorn
---

## Problèmes d'installation {#installation-issues}

### Échec de l'installation du paquet Python {#python-package-installation-failure}

Les installations de paquets Python nécessitent `gcc` et `gcc-c++`, que vous
devrez peut-être installer si vous utilisez une version allégée de Linux, telle
que CentOS.

<!-- markdownlint-disable blanks-around-fences -->

{{< tabpane text=true >}} {{% tab "CentOS" %}}

```sh
yum -y install python3-devel
yum -y install gcc-c++
```

{{% /tab %}} {{% tab "Debian/Ubuntu" %}}

```sh
apt install -y python3-dev
apt install -y build-essential
```

{{% /tab %}} {{% tab "Alpine" %}}

```sh
apk add python3-dev
apk add build-base
```

{{% /tab %}} {{< /tabpane >}}

{#bootstrap-using-uv}

### Bootstrap avec uv {#bootstrap-using-uv}

L'exécution de `opentelemetry-bootstrap -a install` lors de l'utilisation du
gestionnaire de paquets [uv](https://docs.astral.sh/uv/) peut entraîner des
configurations de dépendances erronées ou inattendues.

Au lieu de cela, vous pouvez générer dynamiquement les exigences OpenTelemetry
et les installer en utilisant `uv`.

Tout d'abord, installez les paquets appropriés (ou ajoutez-les à votre fichier
de projet et exécutez `uv sync`) :

```sh
uv add opentelemetry-distro opentelemetry-exporter-otlp
```

Maintenant, vous pouvez installer l'auto-instrumentation :

```sh
uv run opentelemetry-bootstrap -a requirements | uv add --requirement -
```

Enfin, utilisez `uv run` pour démarrer votre application (voir
[Configuration de l'agent](/docs/zero-code/python/#configuring-the-agent)) :

```sh
uv run opentelemetry-instrument python myapp.py
```

Veuillez noter que vous devez réinstaller l'auto-instrumentation chaque fois que
vous exécutez `uv sync` ou mettez à jour des paquets existants. Il est donc
recommandé de faire de l'installation une partie de votre pipeline de
construction.

## Problèmes d'instrumentation {#instrumentation-issues}

### Le mode de débogage de Flask avec le rechargeur casse l'instrumentation {#flask-debug-mode-with-reloader-breaks-instrumentation}

Le mode de débogage peut être activé dans l'application Flask comme ceci :

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True)
```

Le mode de débogage peut empêcher l'instrumentation de se produire car il active
un rechargeur. Pour exécuter l'instrumentation lorsque le mode de débogage est
activé, définissez l'option `use_reloader` sur `False` :

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

### Problèmes avec les serveurs pre-fork {#pre-fork-server-issues}

Un serveur pre-fork, comme Gunicorn avec plusieurs workers, peut être lancé
ainsi :

```sh
gunicorn myapp.main:app --workers 4
```

Cependant, indiquer plus d'un `--workers` peut casser la génération des
métriques lorsque l'auto-instrumentation est appliquée. En effet, le fork — la
création des processus worker/enfants — introduit des incohérences dans chaque
enfant au niveau des threads d'arrière-plan et des verrous que présupposent des
composants clés du SDK OpenTelemetry. En particulier, le
`PeriodicExportingMetricReader` crée son propre thread pour transmettre
périodiquement les données à l'exporter. Voir aussi les tickets
[#2767](https://github.com/open-telemetry/opentelemetry-python/issues/2767) et
[#3307](https://github.com/open-telemetry/opentelemetry-python/issues/3307#issuecomment-1579101152).
Après le fork, chaque enfant cherche en mémoire un objet thread qui n'est en
réalité pas exécuté, et les verrous d'origine peuvent ne jamais se libérer pour
chaque enfant. Voir également les forks et interblocages décrits dans le
[ticket Python 6721](https://bugs.python.org/issue6721).

#### Contournements {#workarounds}

Il existe des contournements pour les serveurs pre-fork avec OpenTelemetry. Le
tableau suivant résume la prise en charge actuelle de l'export des signaux par
les différentes piles de passerelle web auto-instrumentées et pre-forkées avec
plusieurs workers. Voir ci-dessous pour plus de détails et d'options :

| Pile avec plusieurs workers | Traces | Métriques | Journaux |
| --------------------------- | ------ | --------- | -------- |
| Uvicorn                     | x      |           | x        |
| Gunicorn                    | x      |           | x        |
| Gunicorn + UvicornWorker    | x      | x         | x        |

##### Déployer avec Gunicorn et UvicornWorker {#deploy-with-gunicorn-and-uvicornworker}

Pour auto-instrumenter un serveur comportant plusieurs workers, il est
recommandé de déployer avec Gunicorn et `uvicorn.workers.UvicornWorker` s'il
s'agit d'une application ASGI (Asynchronous Server Gateway Interface) — FastAPI,
Starlette, etc. La classe UvicornWorker est spécifiquement conçue pour gérer les
forks en préservant les processus et threads d'arrière-plan. Par exemple :

```sh
opentelemetry-instrument gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  myapp.main:app
```

##### Utiliser l'auto-instrumentation programmatique {#use-programmatic-auto-instrumentation}

Initialisez OpenTelemetry à l'intérieur du processus worker avec
l'[auto-instrumentation programmatique](https://github.com/open-telemetry/opentelemetry-python-contrib/blob/main/opentelemetry-instrumentation/README.rst#programmatic-auto-instrumentation)
après le fork du serveur, plutôt qu'avec `opentelemetry-instrument`. Par
exemple :

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from your_app import app
```

Si vous utilisez FastAPI, notez qu'`initialize()` doit être appelé avant
d'importer `FastAPI`, en raison de la façon dont l'instrumentation est appliquée
par patch. Par exemple :

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Ensuite, lancez le serveur avec :

```sh
uvicorn main:app --workers 2
```

##### Utiliser Prometheus avec OTLP direct {#use-prometheus-with-direct-otlp}

Envisagez d'utiliser une version récente de
[Prometheus](/docs/languages/python/exporters/#prometheus-setup) pour recevoir
directement les métriques OTLP. Mettez en place un
`PeriodicExportingMetricReader` et un worker OTLP par processus pour pousser les
données vers le serveur Prometheus. Nous recommandons de _ne pas_ utiliser
`PrometheusMetricReader` avec le fork — voir le ticket
[#3747](https://github.com/open-telemetry/opentelemetry-python/issues/3747).

##### Utiliser un seul worker {#use-a-single-worker}

Une autre solution consiste à n'utiliser qu'un seul worker en pre-fork avec
l'instrumentation sans code :

```sh
opentelemetry-instrument gunicorn your_app:app --workers 1
```

## Problèmes de connectivité {#connectivity-issues}

### Connectivité gRPC {#grpc-connectivity}

Pour déboguer les problèmes de connectivité gRPC de Python, définissez les
variables d'environnement de débogage gRPC suivantes :

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python VOTRE_APP.py
```
