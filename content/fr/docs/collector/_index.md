---
title: Collector
description:
  Une solution indépendante des fournisseurs pour recevoir, traiter et exporter
  des données de télémétrie.
aliases: [collector/about]
sidebar_root_for: children
cascade:
  vers: 0.162.0
weight: 270
default_lang_commit: 4e709d709b7c134c993c0cf61c011192f7e62856
---

![Schéma du Collector OpenTelemetry et de ses intégrations avec Jaeger, OTLP et Prometheus](img/otel-collector.svg)

## Introduction {#introduction}

Le Collector OpenTelemetry fournit une implémentation indépendante des
fournisseurs pour recevoir, traiter et exporter des données de télémétrie. Il
vous dispense d'exécuter, d'exploiter et de maintenir plusieurs agents ou
collecteurs. Il améliore la scalabilité, prend en charge les formats de données
d'observabilité open source (comme Jaeger, Prometheus ou Fluent Bit) et transmet
ces données à un ou plusieurs backends open source ou commerciaux.

## Objectifs {#objectives}

- _Facilité d'utilisation_ : une configuration par défaut raisonnable, la prise
  en charge des protocoles les plus répandus, un fonctionnement et une collecte
  prêts à l'emploi.
- _Performance_ : très stable et performant sous des charges et des
  configurations variées.
- _Observabilité_ : un service observable exemplaire.
- _Extensibilité_ : personnalisable sans modifier le cœur du code.
- _Unification_ : une base de code unique, déployable comme agent ou comme
  collecteur, qui prend en charge les traces, les métriques et les logs.

## Quand utiliser un Collector {#when-to-use-a-collector}

La plupart des bibliothèques d'instrumentation propres à un langage fournissent
des exportateurs pour OTLP et pour les backends les plus courants. Vous vous
demandez peut-être :

> dans quels cas faut-il passer par un Collector pour envoyer les données,
> plutôt que de laisser chaque service les envoyer directement au backend ?

Pour découvrir OpenTelemetry et faire vos premiers pas, envoyer directement vos
données à un backend est un excellent moyen d'en tirer rapidement profit. De
même, en développement ou à petite échelle, un Collector n'est pas indispensable
pour obtenir des résultats satisfaisants.

Cependant, nous recommandons en général d'utiliser un Collector aux côtés de
votre service : votre service peut ainsi se délester rapidement de ses données,
et le Collector se charge des traitements supplémentaires, comme les nouvelles
tentatives, la mise en lots, le chiffrement, voire le filtrage des données
sensibles.

[Mettre en place un Collector](quick-start) est par ailleurs plus simple qu'il
n'y paraît : dans chaque langage, les exportateurs OTLP ciblent par défaut un
point de terminaison local du Collector. Dès que vous lancez un Collector, il
commence donc automatiquement à recevoir la télémétrie.

## Sécurité du Collector {#collector-security}

Appliquez les bonnes pratiques pour que vos instances du Collector soient
[hébergées][hosted] et [configurées][configured] de manière sécurisée.

## Statut {#status}

Le statut du **Collector** est [mixte][mixed], car les composants centraux du
Collector n'ont pas tous le même [niveau de stabilité][stability levels] pour le
moment.

Le niveau de maturité varie d'un **composant du Collector** à l'autre. La
stabilité de chaque composant est documentée dans son `README.md`. La liste
complète des composants du Collector disponibles figure dans le
[registre][registry].

Les artefacts logiciels du Collector bénéficient d'un support garanti pendant
une durée qui dépend de leur public cible. Ce support inclut au minimum la
correction des bogues critiques et des problèmes de sécurité. Pour plus de
détails, consultez les
[politiques de support](https://github.com/open-telemetry/opentelemetry-collector/blob/main/VERSIONING.md).

## Distributions et versions {#releases}

Pour en savoir plus sur les distributions et les versions du Collector, y
compris la [dernière version][latest release], consultez la page
[Distributions](distributions/).

[configured]: /docs/security/config-best-practices/
[hosted]: /docs/security/hosting-best-practices/
[latest release]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest
[mixed]: /docs/specs/otel/document-status/#mixed
[registry]: /ecosystem/registry/?language=collector
[stability levels]:
  https://github.com/open-telemetry/opentelemetry-collector#stability-levels
