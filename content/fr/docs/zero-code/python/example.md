---
title: Exemple d'auto-instrumentation
linkTitle: Exemple
weight: 20
aliases: [/docs/languages/python/automatic/example]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649 # patched
drifted_from_default: true
cSpell:ignore: distro instrumentor mkdir MSIE Referer Starlette venv
---

Cette page montre comment utiliser l'auto-instrumentation Python dans
OpenTelemetry. L'exemple est basé sur un [exemple OpenTracing][]. Vous pouvez
télécharger ou voir les [fichiers sources][] utilisés dans cette page depuis le
dépôt `opentelemetry-python`.

Cet exemple utilise trois scripts différents. La principale différence entre eux
est la manière dont ils sont instrumentés :

1. `server_manual.py` est instrumenté _manuellement_.
2. `server_automatic.py` est instrumenté _automatiquement_.
3. `server_programmatic.py` est instrumenté _programmatiquement_.

L'instrumentation [_programmatique_](#programmatically-instrumented-server) est
un type d'instrumentation qui nécessite un minimum de code d'instrumentation à
ajouter à l'application. Seules quelques bibliothèques d'instrumentation offrent
des capacités supplémentaires qui vous donnent un plus grand contrôle sur le
processus d'instrumentation lorsqu'elles sont utilisées programmatiquement.

Exécutez le premier script sans l'agent d'instrumentation automatique et le
second avec l'agent. Ils devraient tous deux produire les mêmes résultats,
démontrant que l'agent d'instrumentation automatique fait exactement la même
chose que l'instrumentation manuelle.

L'instrumentation automatique utilise le [monkey-patching][] pour réécrire
dynamiquement les méthodes et les classes à l'exécution via des [bibliothèques
d'instrumentation][instrumentation]. Cela réduit la quantité de travail
nécessaire pour intégrer OpenTelemetry dans le code de votre application.
Ci-dessous, vous verrez la différence entre une route Flask instrumentée
manuellement, automatiquement et programmatiquement.

## Serveur instrumenté manuellement {#manually-instrumented-server}

`server_manual.py`

```python
@app.route("/server_request")
def server_request():
    with tracer.start_as_current_span(
        "server_request",
        context=extract(request.headers),
        kind=trace.SpanKind.SERVER,
        attributes=collect_request_attributes(request.environ),
    ):
        print(request.args.get("param"))
        return "served"
```

## Serveur instrumenté automatiquement {#automatically-instrumented-server}

`server_automatic.py`

```python
@app.route("/server_request")
def server_request():
    print(request.args.get("param"))
    return "served"
```

## Serveur instrumenté programmatiquement {#programmatically-instrumented-server}

`server_programmatic.py`

```python
instrumentor = FlaskInstrumentor()

app = Flask(__name__)

instrumentor.instrument_app(app)
# instrumentor.instrument_app(app, excluded_urls="/server_request") {#instrumentorinstrument_appapp-excluded_urlsserver_request}
@app.route("/server_request")
def server_request():
    print(request.args.get("param"))
    return "served"
```

## Préparation {#prepare}

Exécutez l'exemple suivant dans un environnement virtuel séparé. Exécutez les
commandes suivantes pour préparer l'auto-instrumentation :

```sh
mkdir auto_instrumentation
cd auto_instrumentation
python -m venv venv
source ./venv/bin/activate
```

## Installation {#install}

Exécutez les commandes suivantes pour installer les paquets appropriés. Le
paquet `opentelemetry-distro` dépend de quelques autres, comme
`opentelemetry-sdk` pour l'instrumentation personnalisée de votre propre code et
`opentelemetry-instrumentation` qui fournit plusieurs commandes qui aident à
instrumenter automatiquement un programme.

```sh
pip install opentelemetry-distro
pip install flask requests
```

Exécutez la commande `opentelemetry-bootstrap` :

```shell
opentelemetry-bootstrap -a install
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

Cette section vous guide à travers le processus manuel d'instrumentation d'un
serveur ainsi que le processus d'exécution d'un serveur instrumenté
automatiquement.

## Exécuter le serveur instrumenté manuellement {#execute-the-manually-instrumented-server}

Exécutez le serveur dans deux consoles séparées, une pour chacun des scripts à
exécuter qui composent cet exemple :

```sh
source ./venv/bin/activate
python server_manual.py
```

```sh
source ./venv/bin/activate
python client.py testing
```

La console exécutant `server_manual.py` affichera les spans générés par
l'instrumentation au format JSON. Les spans devraient ressembler à l'exemple
suivant :

```json
{
  "name": "server_request",
  "context": {
    "trace_id": "0xfa002aad260b5f7110db674a9ddfcd23",
    "span_id": "0x8b8bbaf3ca9c5131",
    "trace_state": "{}"
  },
  "kind": "SpanKind.SERVER",
  "parent_id": null,
  "start_time": "2020-04-30T17:28:57.886397Z",
  "end_time": "2020-04-30T17:28:57.886490Z",
  "status": {
    "status_code": "OK"
  },
  "attributes": {
    "http.method": "GET",
    "http.server_name": "127.0.0.1",
    "http.scheme": "http",
    "host.port": 8082,
    "http.host": "localhost:8082",
    "http.target": "/server_request?param=testing",
    "net.peer.ip": "127.0.0.1",
    "net.peer.port": 52872,
    "http.flavor": "1.1"
  },
  "events": [],
  "links": [],
  "resource": {
    "telemetry.sdk.language": "python",
    "telemetry.sdk.name": "opentelemetry",
    "telemetry.sdk.version": "0.16b1"
  }
}
```

## Exécuter le serveur instrumenté automatiquement {#execute-the-automatically-instrumented-server}

Arrêtez l'exécution de `server_manual.py` en appuyant sur <kbd>Control+C</kbd>
et exécutez la commande suivante à la place :

```sh
opentelemetry-instrument --traces_exporter console --metrics_exporter none --logs_exporter none python server_automatic.py
```

Dans la console où vous avez précédemment exécuté `client.py`, exécutez à
nouveau la commande suivante :

```sh
python client.py testing
```

La console exécutant `server_automatic.py` affichera les spans générés par
l'instrumentation au format JSON. Les spans devraient ressembler à l'exemple
suivant :

```json
{
  "name": "server_request",
  "context": {
    "trace_id": "0x9f528e0b76189f539d9c21b1a7a2fc24",
    "span_id": "0xd79760685cd4c269",
    "trace_state": "{}"
  },
  "kind": "SpanKind.SERVER",
  "parent_id": "0xb4fb7eee22ef78e4",
  "start_time": "2020-04-30T17:10:02.400604Z",
  "end_time": "2020-04-30T17:10:02.401858Z",
  "status": {
    "status_code": "OK"
  },
  "attributes": {
    "http.method": "GET",
    "http.server_name": "127.0.0.1",
    "http.scheme": "http",
    "host.port": 8082,
    "http.host": "localhost:8082",
    "http.target": "/server_request?param=testing",
    "net.peer.ip": "127.0.0.1",
    "net.peer.port": 48240,
    "http.flavor": "1.1",
    "http.route": "/server_request",
    "http.status_text": "OK",
    "http.status_code": 200
  },
  "events": [],
  "links": [],
  "resource": {
    "telemetry.sdk.language": "python",
    "telemetry.sdk.name": "opentelemetry",
    "telemetry.sdk.version": "0.16b1",
    "service.name": ""
  }
}
```

Vous pouvez voir que les deux sorties sont les mêmes car l'instrumentation
automatique fait exactement ce que fait l'instrumentation manuelle.

## Exécuter le serveur instrumenté programmatiquement {#execute-the-programmatically-instrumented-server}

Il est également possible d'utiliser les bibliothèques d'instrumentation (telles
que `opentelemetry-instrumentation-flask`) par elles-mêmes, ce qui peut avoir
l'avantage de personnaliser les options. Cependant, en choisissant de le faire,
vous renoncez à utiliser l'auto-instrumentation en démarrant votre application
avec `opentelemetry-instrument` car elles sont mutuellement exclusives.

Exécutez le serveur comme vous le feriez pour l'instrumentation manuelle, dans
deux consoles séparées, une pour exécuter chacun des scripts qui composent cet
exemple :

```sh
source ./venv/bin/activate
python server_programmatic.py
```

```sh
source ./venv/bin/activate
python client.py testing
```

Les résultats devraient être les mêmes que lors de l'exécution avec
l'instrumentation manuelle.

### Utilisation des fonctionnalités d'instrumentation programmatique {#using-programmatic-instrumentation-features}

Certaines bibliothèques d'instrumentation incluent des fonctionnalités qui
permettent un contrôle plus précis lors de l'instrumentation programmatique, la
bibliothèque d'instrumentation pour Flask en est une.

Cet exemple a une ligne commentée, changez-la comme ceci :

```python
# instrumentor.instrument_app(app) {#instrumentorinstrument_appapp}
instrumentor.instrument_app(app, excluded_urls="/server_request")
```

Après avoir réexécuté l'exemple, aucune instrumentation ne devrait apparaître
côté serveur. Ceci est dû à l'option `excluded_urls` passée à `instrument_app`
qui empêche effectivement la fonction `server_request` d'être instrumentée car
son URL correspond à l'expression régulière passée à `excluded_urls`.

## Instrumentation pendant le débogage {#instrumentation-while-debugging}

Le mode de débogage peut être activé dans l'application Flask comme ceci :

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True)
```

Le mode de débogage peut interrompre l'instrumentation car il active un
rechargeur. Pour exécuter l'instrumentation lorsque le mode de débogage est
activé, définissez l'option `use_reloader` sur `False` :

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

## Configuration {#configure}

L'auto-instrumentation peut consommer la configuration à partir des variables
d'environnement.

## Capturer les en-têtes de requête et de réponse HTTP {#capture-http-request-and-response-headers}

Vous pouvez capturer les en-têtes HTTP prédéfinis en tant qu'attributs de span,
conformément à la [convention sémantique][].

Pour définir les en-têtes HTTP que vous souhaitez capturer, fournissez une liste
de noms d'en-têtes HTTP séparés par des virgules via les variables
d'environnement `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST` et
`OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE`, par exemple :

```sh
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="Accept-Encoding,User-Agent,Referer"
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="Last-Modified,Content-Type"
opentelemetry-instrument --traces_exporter console --metrics_exporter none --logs_exporter none python app.py
```

Ces options de configuration sont prises en charge par les instrumentations HTTP
suivantes :

- Django
- Falcon
- FastAPI
- Pyramid
- Starlette
- Tornado
- WSGI

Si ces en-têtes sont disponibles, ils seront inclus dans votre span :

```json
{
  "attributes": {
    "http.request.header.user-agent": [
      "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)"
    ],
    "http.request.header.accept_encoding": ["gzip, deflate, br"],
    "http.response.header.last_modified": ["2022-04-20 17:07:13.075765"],
    "http.response.header.content_type": ["text/html; charset=utf-8"]
  }
}
```

[convention sémantique]: /docs/specs/semconv/http/http-spans/
[référence de l'API]:
  https://opentelemetry-python.readthedocs.io/en/latest/index.html
[instrumentation]:
  https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation
[monkey-patching]:
  https://stackoverflow.com/questions/5626193/what-is-monkey-patching
[exemple opentracing]:
  https://github.com/yurishkuro/opentracing-tutorial/tree/master/python
[fichiers sources]:
  https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/auto-instrumentation
