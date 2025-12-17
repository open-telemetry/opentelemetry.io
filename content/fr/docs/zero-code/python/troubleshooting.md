---
title: Dépannage des problèmes d'instrumentation automatique de Python
linkTitle: Dépannage
weight: 40
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
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
uv pip install opentelemetry-distro opentelemetry-exporter-otlp
```

Maintenant, vous pouvez installer l'auto-instrumentation :

```sh
uv run opentelemetry-bootstrap -a requirements | uv pip install --requirement -
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

## Problèmes de connectivité {#connectivity-issues}

### Connectivité gRPC {#grpc-connectivity}

Pour déboguer les problèmes de connectivité gRPC de Python, définissez les
variables d'environnement de débogage gRPC suivantes :

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python VOTRE_APP.py
```
