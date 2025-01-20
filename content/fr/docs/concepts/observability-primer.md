---
title: Introduction à l'observabilité
description: Concepts fondamentaux de l'observabilité
weight: 9
default_lang_commit: 71833a5f8b84110dadf1e98604b87a900724ac33
cSpell:ignore: webshop
---

## Qu'est-ce que l'observabilité ? {#what-is-observability}

L'observabilité est la capacité à comprendre l'état d'un système en examinant
ses données sortantes, sans avoir besoin de connaître son fonctionnement
interne. Elle permet non seulement de résoudre facilement les problèmes et
d'appréhender les nouveaux "inconnus inconnus" mais également de répondre à la
question "Pourquoi cela arrive-t-il ?"

Pour pouvoir poser ce type de questions à votre système, votre application doit
être correctement instrumentée, c'est-à-dire que votre code doit émettre :
[des signaux](/docs/concepts/signals/) tels que
[des traces](/docs/concepts/signals/traces/),
[des métriques](/docs/concepts/signals/metrics/), et
[des logs](/docs/concepts/signals/logs/).

Une application est correctement instrumentée si les développeurs disposent de
toutes les informations nécessaires pour corriger un problème et n'ont pas
besoin d'ajouter une instrumentation supplémentaire.

[OpenTelemetry](/docs/what-is-opentelemetry/) est le mécanisme permettant
d'instrumenter le code des applications afin de rendre le système observable.

## Fiabilité et métriques {#reliability-and-metrics}

Le terme **télémétrie** fait référence aux données émises par un système et son
comportement. Les données peuvent prendre la forme de
[traces](/docs/concepts/signals/traces/), de
[métriques](/docs/concepts/signals/metrics/), et de
[logs](/docs/concepts/signals/logs/).

La **fiabilité** répond à la question : "Est-ce que le service fait ce que les
utilisateurs attendent de lui ?" Un système peut afficher un pourcentage de
disponibilité de 100%, mais s'il ne répond pas à la demande de l'utilisateur
(par exemple : ajouter une paire de chaussettes noires dans le panier à chaque
fois qu'il clique sur "Ajouter au panier"), alors le système pourrait être
considéré comme **peu** fiable.

Les **métriques** sont un ensemble de données numériques collectées pour votre
infrastructure ou votre application sur une période donnée. Le nombre d'erreurs
système, le nombre d'erreurs sur les requêtes ainsi que l'utilisation mémoire
d'un service donné sont quelques exemples de métriques. Pour plus d'informations
sur les métriques et leur rôle dans OpenTelemetry, référez-vous à la page
[Métriques](/docs/concepts/signals/metrics/).

L'indicateur de niveau de service, également connu sous le nom de **SLI**, est
un indicateur de fonctionnement d'un service qui est évalué côté utilisateur. La
vitesse à laquelle une page Web se charge est un exemple de SLI.

Les objectifs de niveau de service, communément appelés **SLO**, permettent de
rendre compte à une organisation ou à d'autres équipes de la fiabilité d'un
système.

## Comprendre le traçage distribué {#understanding-distributed-tracing}

Le traçage distribué vous permet d'observer les requêtes au fur et à mesure
qu'elles se propagent au travers de systèmes distribués complexes. Il vous offre
une meilleure visibilité sur la santé de votre application ou de votre système
et vous permet de debugger un comportement qu'il est difficile de reproduire
localement. Le traçage distribué est indispensable pour les systèmes distribués
pour lesquels nous rencontrons souvent des problèmes aléatoires ou difficiles à
reproduire localement.

Pour comprendre le traçage distribué, vous devez comprendre le rôle de chacun de
ses composants : les logs, les spans et les traces.

### Logs {#logs}

Un **log** est un message horodaté émis par des services ou d'autres composants.
Contrairement aux [traces](#distributed-traces), ils ne sont pas nécessairement
associés à une requête ou une transaction utilisateur en particulier. Presque
tous les logiciels émettent des logs. Par le passé, les développeurs et les
opérateurs se sont largement appuyés sur les logs pour comprendre le
comportement des systèmes.

Exemple de log :

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Les logs, à eux seuls, ne suffisent pas pour suivre précisément l'exécution du
code, car ils manquent souvent de contexte, comme l'origine exacte de leur
déclenchement.

Ils sont nettement plus utiles lorsqu'ils font partie d'un [span](#spans) ou
lorsqu'ils sont mis en corrélation avec une trace ou un span.

Pour plus d'informations sur les logs et leur rôle dans OpenTelemetry,
référez-vous à la page [Logs](/docs/concepts/signals/logs/).

### Spans {#spans}

Un **span** représente une unité de travail ou d'opération. Il retrace les
actions effectuées par une requête, offrant une vue détaillée des événements qui
se sont déroulés pendant l'exécution de l'opération.

Un span contient un nom, des données de temps,
[des messages de log structurés](/docs/concepts/signals/traces/#span-events), et
[autres métadonnées (les attributs)](/docs/concepts/signals/traces/#attributes)
pour fournir des informations sur l'opération qu'il suit.

#### Attributs de span {#span-attributes}

Les attributs de span sont des métadonnées attachées à un span.

La table suivante liste des exemples d'attributs de span :

| Clé                         | Valeur                                                                             |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `http.request.method`       | `"GET"`                                                                            |
| `network.protocol.version`  | `"1.1"`                                                                            |
| `url.path`                  | `"/webshop/articles/4"`                                                            |
| `url.query`                 | `"?s=1"`                                                                           |
| `server.address`            | `"exemple.com"`                                                                    |
| `server.port`               | `8080`                                                                             |
| `url.scheme`                | `"https"`                                                                          |
| `http.route`                | `"/webshop/articles/:article_id"`                                                  |
| `http.response.status_code` | `200`                                                                              |
| `client.address`            | `"192.0.2.4"`                                                                      |
| `client.socket.address`     | `"192.0.2.5"` (le client passe par un proxy)                                       |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

Pour plus d'informations sur les spans et leur rôle dans OpenTelemetry,
référez-vous à la page [Spans](/docs/concepts/signals/traces/#spans).

### Les traces distribuées {#distributed-traces}

Une **trace distribuée**, plus communément connu sous le nom de **trace**,
enregistre les chemins pris par les requêtes (lancées par une application ou un
utilisateur final) au fur et à mesure qu'elles se propagent au travers
d'architectures multiservices, tels que des microservices ou des applications
serverless.

Une trace se compose d'un ou de plusieurs spans. Le premier span représente le
span racine.

Chaque span racine représente une requête, depuis son origine jusqu'à son
aboutissement. Les spans présents sous le parent fournissent plus d'informations
sur ce qui se passe pendant une requête (ou les étapes qui composent une
requête).

Sans traçage, il peut être difficile d'identifier pour un système distribué la
cause première de problèmes de performance. Le traçage simplifie le débogage et
la compréhension des systèmes distribués en décomposant le parcours des requêtes
au fil de leur exécution dans le système.

De nombreuses plateformes d'observabilité représentent les traces sous forme de
diagrammes en cascade comme celui-ci :

![Exemple de trace](/img/waterfall-trace.svg 'Diagramme en cascade de traces')

Les diagrammes en cascade permettent de visualiser la relation parent-enfant
entre un span racine et ses spans enfants. Lorsqu'un span encapsule un autre
span, on parle de relation imbriquée.

Pour plus d'informations sur les traces et leur rôle dans OpenTelemetry,
référez-vous à la page [Traces](/docs/concepts/signals/traces/).
