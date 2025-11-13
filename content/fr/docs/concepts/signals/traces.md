---
title: Traces
weight: 1
description: Le chemin des requêtes dans votre application.
default_lang_commit: bc9473716003fd99487e16f95dd2c3a5b072bd2a
cSpell:ignore: Guten
---

Les **traces** nous donnent une vue d'ensemble de ce qui se passe quand une
requête est faite à une application. Que l'application soit monolithique avec
une seule base de données ou un maillage de services plus sophistiqué, les
traces sont essentielles à la compréhension du "chemin" complet d'une requête
dans votre application.

Explorons ceci avec trois unités de travail, représentées par des
[spans](#spans):

{{% alert title="Note" %}}

Les exemples JSON suivants ne représentent pas un format spécifique, et en
particulier pas OTLP/JSON, qui est plus verbeux.

{{% /alert %}}

Span `hello`:

```json
{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Il s'agit du span racine, décrivant le début et la fin de l'opération entière.
On peut noter qu'il possède un champ `trace_id` indiquant la trace, mais qu'il
n'a pas de `parent_id`. C'est ce qui permet de savoir qu'il s'agit du span
racine.

Span `hello-greetings` :

```json
{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Ce span encapsule des tâches spécifiques, comme dire bonjour, et son parent est
le span `hello`. On peut noter qu'il partage le même `trace_id` que le span
racine, indiquant qu'il s'agit d'une partie de la même trace. De plus, il a un
`parent_id` qui correspond au `span_id` du span `hello`.

Span `hello-salutations`:

```json
{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Ce span représente la troisième opération dans cette trace et, comme le
précédent, c'est un enfant du span `hello`. C'est aussi un frère du span
`hello-greetings`.

Ces trois blocs de JSON partagent la même `trace_id`, et le champ `parent_id`
représente la hiérarchie. C'est ce qui en fait une Trace !

Une autre chose que vous pourrez remarquer, c'est que chaque span a une
structure similaire à celle d'un log. C'est parce que c'en est un peu un ! Une
manière de comprendre les traces est de les voir comme une collection de logs
structurés avec un contexte, une hiérarchie, des corrélations, et bien plus
encore. Mais ces logs structurés peuvent provenir de différents processus,
services, machines virtuelles, data centers, etc. C'est ça qui permet aux traces
de représenter une vue de bout en bout de n'importe quel système.

Pour comprendre comment le traçage fonctionne dans OpenTelemetry, regardons la
liste des composants qui vont jouer un rôle dans l'instrumentation de notre
code.

## Tracer Provider {#tracer-provider}

Un Tracer Provider ("Fournisseur de traceurs", parfois appelé `TracerProvider`)
est une usine de `Tracer`. Dans la plupart des applications, un fournisseur de
traceurs est initialisé une seule fois et son cycle de vie correspond au cycle
de vie de l'application. L'initialisation du fournisseur de traceurs inclut
également l'initialisation de la Ressource et de l'exportateur. il est
généralement la première étape dans la mise en place du traçage avec
OpenTelemetry. Dans les SDK de certains langages, un fournisseur de traceurs
global est déjà initialisé pour vous.

## Traceur {#tracer}

Un Traceur crée des spans contenant des informations à propos des opérations en
cours, comme une requête vers un service. Les Traceurs sont créés à partir d'un
fournisseur de traceurs.

## Exportateurs de Traces {#trace-exporters}

Les exportateurs de traces envoient les traces à un consommateur. Ce
consommateur peut être la sortie standard pour le débogage et le développement,
un Collecteur OpenTelemetry, ou n'importe quel backend open source ou d'un
éditeur de votre choix.

## Propagation du contexte {#context-propagation}

Le contexte est un des concept fondamentaux qui permet le traçage distribué.
Avec le traçage distribué, les spans peuvent être corrélés entre eux et
assemblés dans une Trace, quel que soit l'endroit où les spans sont générés.
Pour en apprendre plus sur ce sujet, consultez la page
[Propagation de contexte](../../context-propagation).

## Spans {#spans}

Un **span** est une unité de travail ou une opération. Les spans sont les blocs
de base qui constituent les Traces. Dans OpenTelemetry, ils incluent les
informations suivantes:

- Nom
- ID du span parent (vide pour les spans racines)
- Horodatage de début et de fin
- [Contexte du span](#span-context)
- [Attributs](#attributes)
- [Événements du span](#span-events)
- [Liens du span](#span-links)
- [Statut du span](#span-status)

Exemple de span :

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Les spans peuvent être imbriqués, ce qui est impliqué par la présence d'un ID de
span parent: les spans enfants représentent des sous-opérations. Cela permet aux
spans de capturer plus précisément les tâches effectuées dans une application.

### Contexte d'un span {#span-context}

Le contexte d'un span est un objet immuable contenant les informations
suivantes:

- L'ID de la trace à laquelle le span appartient
- L'ID du span parent
- Les Trace flags, un encodage binaire contenant des informations sur la trace
- Le Trace State, une liste de paires clé-valeur pouvant contenir des
  informations de traçage propres au fournisseur

Le contexte des spans est la partie du span qui est sérialisé et propagé en même
temps que le [Contexte Distribué](#context-propagation) et le
[bagage](../baggage).

Puisque le Contexte du span contient l'ID de la Trace, il est utilisé pour créer
les [Liens de spans](#span-links).

### Attributs {#attributes}

Les attributs sont des paires clé-valeur qui contiennent des métadonnées que
vous pouvez utiliser pour annoter les spans afin de transporter des informations
supplémentaires concernant les opérations qu'ils suivent.

Par exemple, si un span suit une opération qui ajoute un article dans le panier
d'un utilisateur sur un site d'e-commerce, vous pouvez capturer l'ID de
l'utilisateur, l'ID de l'article ajouté au panier et l'ID du panier.

Vous pouvez ajouter des attributs à un span pendant ou après sa création.
Privilégiez l'ajout d'attributs à un span lors de sa création afin de rendre
l'attribut disponible pour l'échantillonnage du SDK. Si vous devez ajouter une
valeur après la création d'un span, mettez à jour le span avec la valeur.

Les attributs sont soumis aux règles suivantes, implémentées par les SDK de
chaque langage:

- Les clés doivent être une chaîne de caractères non nulles
- Les valeurs doivent une chaîne de caractères non nulles, un booléen, une
  valeur à virgule flottante, un entier ou un tableau de ces valeurs

De plus, il existe les
[Attributs sémantiques](/docs/specs/semconv/general/trace/), qui sont des
conventions de nommages reconnues pour les métadonnées généralement présentes
dans les opérations courantes. Il est utile d'utiliser le nommage d'attributs
sémantiques dans la mesure du possible afin que les types courants de
métadonnées soient standardisés entre les systèmes.

### Événements de span {#span-events}

Un Événement de span peut être considéré comme un message de log structuré (ou
une annotation) sur un span, généralement utilisé pour signaler un moment
particulier, significatif dans la durée de vie du span.

Par exemple, si on considère deux scénarios dans un navigateur web:

1. Suivre le chargement de la page
2. Signaler quand une page devient interactive

Un span est plus adapté pour suivre le premier scénario parce qu'il s'agit d'une
opération avec un début et une fin.

Un Événement de span est plus adapté pour suivre le second scénario parce qu'il
représente un moment particulier et ponctuel dans le temps.

### Quand utiliser les Événements de spans plutôt que les Attributs de span {#span-events-attributes}

Puisque les événements de spans contiennent aussi des attributs, la question de
savoir quand utiliser les événements de spans plutôt que les attributs n'est pas
toujours évidente. Pour vous aider à décider, demandez-vous si un horodatage
spécifique est pertinent.

Par exemple, si vous suivez une opération avec un span et que l'opération se
termine, vous pourriez vouloir ajouter des données de l'opération à votre
télémétrie.

- Si l'horodatage auquel l'opération se termine est significatif ou pertinent,
  ajoutez les données à un span event.
- Si l'horodatage n'est pas significatif ou pertinent, ajoutez les données comme
  des attributs du span.

### Liens de spans {#span-links}

Les liens existent afin de pouvoir associer un span avec un ou plusieurs autres
impliquant une relation de causalité. Par exemple, supposons que nous avons un
système distribué où des opérations sont suivis par une trace.

En réponse à certaines de ces opérations, une opération supplémentaire est mise
en file d'attente pour être exécutée, mais son exécution est asynchrone. Nous
pouvons suivre cette opération subséquente avec une trace également.

Nous aimerions associer la trace de l'opération subséquente avec la première
trace, mais nous ne pouvons pas prédire quand l'opération subséquente
commencera. Nous devons associer ces deux traces, nous allons donc utiliser un
lien de span.

Vous pouvez lier le dernier span de la première trace avec le premier span de la
seconde trace. Maintenant, ils sont associés mutuellement, de manière causale.

Les liens sont optionnels mais constituent une bonne manière d'associer des
spans entre eux.

Pour plus d'informations, consultez
[Lien de spans](/docs/specs/otel/trace/api/#link).

### Statut de span {#span-status}

Chaque span a un statut. Les trois valeurs possibles sont:

- `Unset`
- `Error`
- `Ok`

La valeur par défaut est `Unset`. Un statut de span qui est `Unset` signifie que
l'opération suivie a réussi sans erreur.

Lorsque le statut est `Error`, cela signifie qu'une erreur s'est produite dans
l'opération suivie. Par exemple, cela peut être dû à une erreur HTTP 500 sur un
serveur gérant une requête.

Quand le statut du span est `Ok`, cela signifie que le span a été explicitement
marqué comme sans erreur par le développeur. Même si c'est contre-intuitif, il
n'est pas nécessaire de définir le statut d'un span comme `Ok` lorsqu'il est
connu que le span s'est achevé sans erreur, car cela est couvert par `Unset`. Ce
que fait `Ok`, c'est représenter un "verdict final" sans ambiguïté sur le statut
d'un span qui a été explicitement défini par un utilisateur. Cela est utile dans
toute situation où un développeur souhaite qu'il n'y ait aucune autre
interprétation d'un span que "réussi".

Pour reformuler: `Unset` représente un span qui s'est achevé sans erreur. `Ok`
représente le cas où un développeur marque explicitement un span comme réussi.
Dans la plupart des cas, il n'est pas nécessaire de marquer explicitement un
span comme `Ok`.

### Types de span {#span-types}

Quand un span est créé, il est de type `Client`, `Server`, `Internal`,
`Producer`, ou `Consumer`. Le type du span fournit une indication au backend de
traçage sur la manière d'assembler la trace. Selon la spécification
OpenTelemetry, le parent d'un span server est souvent un span client distant, et
l'enfant d'un span client est généralement un span server. De la même manière,
le parent d'un span consumer est toujours un producer et l'enfant d'un span
producer est toujours un consumer. Si non spécifié, le type du span est par
défaut `Internal`.

Pour plus d'informations, consultez
[Types de span](/docs/specs/otel/trace/api/#spankind).

#### Client {#client}

Un span client représente un appel distant sortant synchrone comme une requête
HTTP ou un appel vers une base de données. Notez que dans ce contexte,
"synchrone" ne fait pas référence à `async/await`, mais au fait que ce n'est pas
mis en file d'attente pour un traitement ultérieur.

#### Server {#server}

Un span server représente un appel distant entrant synchrone tel qu'une requête
HTTP entrante ou un appel de procédure distant.

#### Internal {#internal}

Les spans internal représentent des opérations qui ne franchissent pas les
limites d'un processus. Des éléments comme l'instrumentation d'un appel de
fonction ou d'un middleware Express peuvent utiliser des spans internal.

#### Producer {#producer}

Les spans producer représentent la création d'une tâche qui peut être traitée de
manière asynchrone plus tard. Il peut s'agir d'une tâche distante comme une
insertion dans une file d'attente de tâches ou d'une tâche gérée localement par
un gestionnaire d'événement.

#### Consumer {#consumer}

Les spans consumer représentent le traitement d'une tâche créée par un producer
et peuvent démarrer longtemps après que le span producer se soit achevé.

## Specification {#specification}

Pour plus d'informations, consultez la
[spécification des traces](/docs/specs/otel/overview/#tracing-signal).
