---
title: Distributions
description: >-
  Une distribution, à ne pas confondre avec un fork, est une version
  personnalisée d'un composant OpenTelemetry.
weight: 190
default_lang_commit: 55f9c9d07
---

Le projet OpenTelemetry se compose de plusieurs [composants](../components) qui
prennent en charge plusieurs [signaux](../signals). L'implémentation de
référence d'OpenTelemetry est disponible sous la forme :

- [Bibliothèques d'instrumentation spécifiques à chaque langage](../instrumentation)
- Un [binaire Collector](/docs/concepts/components/#collector)

Toute implémentation de référence peut être personnalisée sous forme de
distribution.

## Qu'est-ce qu'une distribution ? {#what-is-a-distribution}

Une distribution est une version personnalisée d'un composant OpenTelemetry.
Il s'agit d'une enveloppe (_wrapper_) autour d'un dépôt OpenTelemetry en amont,
avec quelques personnalisations. Les distributions ne sont pas à confondre avec
des forks.

Les personnalisations d'une distribution peuvent inclure :

- Des scripts pour faciliter l'utilisation ou l'adapter à un backend ou un
  fournisseur spécifique
- Des modifications des paramètres par défaut requis par un backend, un
  fournisseur ou un utilisateur final
- Des options de packaging supplémentaires pouvant être spécifiques à un
  fournisseur ou à un utilisateur final
- Une couverture de tests, de performance et de sécurité allant au-delà de ce
  qu'OpenTelemetry fournit
- Des capacités supplémentaires au-delà de ce qu'OpenTelemetry fournit
- Moins de capacités que ce qu'OpenTelemetry fournit

Les distributions se répartissent globalement en trois catégories :

- **« Pure » (_Pure_):** Ces distributions offrent les mêmes fonctionnalités
  que la version en amont et sont compatibles à 100 %. Les personnalisations
  améliorent généralement la facilité d'utilisation ou le packaging. Ces
  personnalisations peuvent être spécifiques à un backend, un fournisseur ou un
  utilisateur final.
- **« Plus » (_Plus_):** Ces distributions apportent des fonctionnalités
  supplémentaires par rapport à la version en amont, via des composants
  additionnels. On peut citer par exemple des bibliothèques d'instrumentation ou
  des exporteurs vendeur non intégrés au projet OpenTelemetry.
- **« Moins » (_Minus_):** Ces distributions fournissent un sous-ensemble des
  fonctionnalités de la version en amont. Cela peut inclure la suppression de
  bibliothèques d'instrumentation, ou de récepteurs, processeurs, exporteurs ou
  extensions présents dans le projet OpenTelemetry Collector. Ces distributions
  peuvent être proposées pour améliorer la maintenabilité et les considérations
  de sécurité.

## Qui peut créer une distribution ? {#who-can-create-a-distribution}

N'importe qui peut créer une distribution. Aujourd'hui, plusieurs
[fournisseurs](/ecosystem/vendors/) proposent des
[distributions](/ecosystem/distributions/). De plus, les utilisateurs finaux
peuvent envisager de créer une distribution s'ils souhaitent utiliser des
composants du [Registre](/ecosystem/registry/) qui n'ont pas été intégrés au
projet OpenTelemetry.

## Contribution ou distribution ? {#contribution-or-distribution}

Avant de poursuivre et d'apprendre comment créer votre propre distribution,
demandez-vous si vos ajouts sur un composant OpenTelemetry seraient bénéfiques
pour tout le monde et devraient donc être inclus dans les implémentations de
référence :

- Vos scripts de « facilité d'utilisation » peuvent-ils être généralisés ?
- Vos modifications des paramètres par défaut seraient-elles la meilleure
  option pour tout le monde ?
- Vos options de packaging supplémentaires sont-elles vraiment spécifiques ?
- Votre couverture de tests, de performance et de sécurité pourrait-elle
  fonctionner avec l'implémentation de référence ?
- Avez-vous vérifié avec la communauté si vos capacités supplémentaires
  pourraient faire partie du standard ?

## Créer sa propre distribution {#creating-your-own-distribution}

### Collector {#collector}

Un guide pour créer votre propre distribution est disponible dans cet article de
blog :
[« Building your own OpenTelemetry Collector distribution »](https://medium.com/p/42337e994b63)

Si vous créez votre propre distribution, l'
[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
peut être un bon point de départ.

### Bibliothèques d'instrumentation spécifiques à chaque langage {#language-specific-instrumentation-libraries}

Il existe des mécanismes d'extensibilité propres à chaque langage pour
personnaliser les bibliothèques d'instrumentation :

- [Agent Java](/docs/zero-code/java/agent/extensions)

## Respecter les directives {#follow-the-guidelines}

Lors de l'utilisation des éléments du projet OpenTelemetry, tels que le logo et
le nom, pour votre distribution, assurez-vous d'être en conformité avec les
[Directives Marketing OpenTelemetry pour les Organisations
Contributrices][guidelines].

Le projet OpenTelemetry ne certifie pas les distributions pour le moment. À
l'avenir, OpenTelemetry pourra certifier des distributions et des partenaires,
à l'image du projet Kubernetes. Lors de l'évaluation d'une distribution,
assurez-vous que son utilisation n'entraîne pas de dépendance envers un
fournisseur (_vendor lock-in_).

> Tout support pour une distribution provient des auteurs de la distribution et
> non des auteurs d'OpenTelemetry.

[guidelines]:
  https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md
