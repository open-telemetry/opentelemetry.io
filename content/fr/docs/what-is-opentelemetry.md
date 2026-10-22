---
title: Qu'est-ce qu'OpenTelemetry ?
description:
  Une brève explication de ce qu'est OpenTelemetry et de ce qu'il n'est pas.
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: 150
default_lang_commit: ee9a3aeb6501bb788a03571f08be856dfdedc4d5
drifted_from_default: true
cSpell:ignore: youtube
---

OpenTelemetry, c'est :

- Un **framework et une boîte à outils d'[observabilité][observability]** conçus
  pour faciliter :
  - la [génération][instr]
  - l'export
  - la [collecte](../concepts/components/#collector)

  de [données de télémétrie][telemetry data] telles que les [traces][], les
  [métriques][metrics] et les [logs][].

- **Open source** et **indépendant de tout fournisseur et de tout outil** : il
  peut donc être utilisé avec une grande variété de backends d'observabilité,
  qu'il s'agisse d'outils open source comme [Jaeger][] et [Prometheus][] ou
  d'offres commerciales. OpenTelemetry n'est **pas** lui-même un backend
  d'observabilité.

L'un des principaux objectifs d'OpenTelemetry est de faciliter l'instrumentation
de vos applications et systèmes, quels que soient le langage de programmation,
l'infrastructure et les environnements d'exécution utilisés.

Le backend (stockage) et le frontend (visualisation) des données de télémétrie
sont volontairement laissés à d'autres outils.

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

Pour d'autres vidéos de cette série et des ressources complémentaires, consultez
la section [Et ensuite ?](#what-next)

## Qu'est-ce que l'observabilité ? {#what-is-observability}

L'[observabilité][observability] est la capacité à comprendre l'état interne
d'un système en examinant ses sorties.

Dans le domaine logiciel, on y parvient généralement en analysant des données de
télémétrie telles que les traces, les métriques et les logs.

Pour rendre un système observable, il faut l'[instrumenter][instr] : le code
doit émettre des [traces][], des [métriques][metrics] ou des [logs][]. Ces
données doivent ensuite être envoyées à un backend d'observabilité.

## Pourquoi OpenTelemetry ? {#why-opentelemetry}

Avec l'essor du cloud computing, des architectures microservices et des
exigences métier de plus en plus complexes, le besoin
d'[observabilité][observability] des logiciels et des infrastructures n'a jamais
été aussi fort.

OpenTelemetry répond à ce besoin d'observabilité en respectant deux principes
clés :

1. Vous êtes propriétaire des données que vous générez. Aucune dépendance à un
   fournisseur.
2. Vous n'avez qu'un seul ensemble d'API et de conventions à apprendre.

Ensemble, ces deux principes offrent aux équipes et aux organisations la
flexibilité dont elles ont besoin dans le paysage informatique actuel.

Pour en savoir plus, consultez
[la mission, la vision et les valeurs](/community/mission/) d'OpenTelemetry.

## Principaux composants d'OpenTelemetry {#main-opentelemetry-components}

OpenTelemetry se compose des principaux éléments suivants :

- Une [spécification](/docs/specs/otel) pour l'ensemble des composants
- Un [protocole](/docs/specs/otlp/) standard qui définit la structure des
  données de télémétrie
- Des [conventions sémantiques](/docs/specs/semconv/) qui définissent un schéma
  de nommage standard pour les types de données de télémétrie courants
- Des API qui définissent comment générer des données de télémétrie
- Des [SDK par langage](../languages) qui implémentent la spécification, les API
  et l'export des données de télémétrie
- Un [écosystème de bibliothèques](/ecosystem/registry) qui fournit
  l'instrumentation des bibliothèques et frameworks courants
- Des composants d'instrumentation automatique qui génèrent des données de
  télémétrie sans modification du code
- Le [Collector OpenTelemetry](../collector), un proxy qui reçoit, traite et
  exporte des données de télémétrie
- Divers autres outils, comme
  l'[opérateur OpenTelemetry pour Kubernetes](../platforms/kubernetes/operator/),
  les [charts Helm OpenTelemetry](../platforms/kubernetes/helm/) et les
  [ressources communautaires pour le FaaS](../platforms/faas/)

OpenTelemetry est utilisé par une grande variété de
[bibliothèques, services et applications](/ecosystem/integrations/) qui
l'intègrent pour offrir l'observabilité par défaut.

OpenTelemetry est pris en charge par de nombreux
[fournisseurs](/ecosystem/vendors/), dont beaucoup proposent un support
commercial et contribuent directement au projet.

## Extensibilité {#extensibility}

OpenTelemetry est conçu pour être extensible. Voici quelques exemples
d'extensions possibles :

- Ajouter un récepteur au Collector OpenTelemetry pour prendre en charge des
  données de télémétrie issues d'une source personnalisée
- Charger des bibliothèques d'instrumentation personnalisées dans un SDK
- Créer une [distribution](../concepts/distributions/) d'un SDK ou du Collector
  adaptée à un cas d'usage spécifique
- Créer un nouvel exportateur pour un backend personnalisé qui ne prend pas
  encore en charge le protocole OpenTelemetry (OTLP)
- Créer un propagateur personnalisé pour un format de propagation de contexte
  non standard

Même si la plupart des utilisateurs n'auront sans doute pas besoin d'étendre
OpenTelemetry, le projet est conçu pour le permettre à presque tous les niveaux.

## Historique {#history}

OpenTelemetry est un projet de la [Cloud Native Computing Foundation][] (CNCF)
issu de la [fusion][merger] de deux projets antérieurs,
[OpenTracing](https://opentracing.io) et [OpenCensus](https://opencensus.io).
Tous deux avaient été créés pour résoudre le même problème : l'absence de
standard pour instrumenter le code et envoyer des données de télémétrie à un
backend d'observabilité. Aucun des deux ne parvenant à résoudre entièrement le
problème seul, ils ont fusionné pour former OpenTelemetry et réunir leurs forces
au sein d'une solution unique.

Si vous utilisez actuellement OpenTracing ou OpenCensus, découvrez comment
migrer vers OpenTelemetry dans le
[guide de migration](../compatibility/migration/).

[merger]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## Et ensuite ? {#what-next}

- [Débuter](../getting-started/) &mdash; lancez-vous !
- Découvrez les [concepts d'OpenTelemetry](../concepts/).
- [Regardez des vidéos][Watch videos] de la série [OTel for beginners][] ou
  d'autres [playlists][].
- Inscrivez-vous à une [formation](/training), notamment au **cours gratuit**
  [Getting started with OpenTelemetry](/training/#courses).

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[logs]: ../concepts/signals/logs/
[metrics]: ../concepts/signals/metrics/
[observability]: ../concepts/observability-primer/#what-is-observability
[OTel for beginners]:
  https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[playlists]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[telemetry data]: ../concepts/signals/
[traces]: ../concepts/signals/traces/
[Watch videos]: https://www.youtube.com/@otel-official
