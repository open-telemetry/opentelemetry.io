---
title:
  Utilisation de l'Opérateur OpenTelemetry pour injecter l'auto-instrumentation
linkTitle: Opérateur
aliases: [/docs/languages/python/automatic/operator]
weight: 30
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649 # patched
drifted_from_default: true
cSpell:ignore: django-applications grpcio myapp psutil PYTHONPATH
---

Si vous exécutez votre service Python dans Kubernetes, vous pouvez tirer parti
de
l'[Opérateur OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator)
pour injecter l'auto-instrumentation sans avoir à modifier directement chacun de
vos services.
[Consultez la documentation sur l'auto-instrumentation de l'Opérateur OpenTelemetry pour plus de détails.](/docs/platforms/kubernetes/operator/automatic/)

## Sujets spécifiques à Python {#python-specific-topics}

### Bibliothèques avec des roues binaires {#libraries-with-binary-wheels}

Certains paquets Python que nous instrumentons ou dont nous avons besoin dans
nos bibliothèques d'instrumentation, peuvent être livrés avec du code binaire.
C'est le cas, par exemple, de `grpcio` et `psutil` (utilisé dans
`opentelemetry-instrumentation-system-metrics`).

Le code binaire est lié à une version spécifique de la bibliothèque C (glibc ou
musl) et à une version spécifique de Python. L'
[Opérateur OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator)
fournit des images pour une seule version de Python basée sur la bibliothèque C
glibc. Si vous voulez l'utiliser, vous devrez peut-être construire votre propre
image Docker d'opérateur d'image pour l'auto-instrumentation Python.

Depuis la version v0.113.0 de l'opérateur, il est possible de construire une
image avec une auto-instrumentation basée à la fois sur glibc et musl et de
[la configurer à l'exécution](/docs/platforms/kubernetes/operator/automatic/#annotations-python-musl).

### Applications Django {#django-applications}

Les applications qui s'exécutent à partir de leur propre exécutable comme Django
nécessitent de définir dans votre fichier de déploiement deux variables
d'environnement :

- `PYTHONPATH`, avec le chemin vers le répertoire racine de l'application
  Django, par exemple "/app"
- `DJANGO_SETTINGS_MODULE`, avec le nom du module de paramètres Django, par
  exemple "myapp.settings"
