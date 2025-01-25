---
title: Les signaux
description: Catégories de télémétrie supportées par OpenTelemetry
weight: 11
default_lang_commit: 71833a5f8b84110dadf1e98604b87a900724ac33
---

L'objectif d'OpenTelemetry est de collecter, traiter et exporter des
**[signaux][signals]**. Les signaux sont des données générées par le système et
décrivant l'activité interne du système d'exploitation et des applications
exécutées sur une plateforme. Un signal peut être quelque chose que vous
souhaitez mesurer à un instant précis, comme par exemple la température ou
l'utilisation mémoire, ou un événement traversant les différents composants de
votre système distribué. Vous avez la possibilité de regrouper plusieurs signaux
ensemble afin d'observer sous différents angles le fonctionnement d'une
technologie.

OpenTelemetry supporte actuellement les [traces](/docs/concepts/signals/traces),
les [métriques](/docs/concepts/signals/metrics), les
[logs](/docs/concepts/signals/logs) et les
[bagages](/docs/concepts/signals/baggage). Les _événements_ sont une catégorie
de log. Un groupe dédié au profilage travaille actuellement sur les
[_profils_](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md).

[signals]: /docs/specs/otel/glossary/#signals
