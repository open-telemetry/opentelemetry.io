---
title: Traces
weight: 1
description: Le chemin des requêtes dans votre application.
cSpell:ignore: Guten
---

Les **traces** nous donnent une vue d'ensemble de ce qui se passe quand une
requête est faite à une application. Que l'application soit monolithique avec
une seule base de données ou un maillage de services plus sophistiqués, les
traces sont essentielles a la compréhension du "chemin" complet d'une requête
dans votre application.

Explorons ceci avec trois unités de travail, représentées par des
[Spans](#spans):

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
On peut noter qu'il a un champ `trace_id` indiquant la trace, mais qu'il n'a pas
de `parent_id`. C'est ce qui permet de savoir qu'il s'agit du span racine.

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
le span `hello`. On peut noter qu'il partage la même `trace_id` que le span
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

Ce span represente la troisième operation dans cette trace et, comme la
précédente, c'est un enfant du span `hello`. C'est aussi un frère du span
`hello-greetings`.

Ces trois blocs de JSON partagent la même `trace_id`, et le champ `parent_id`
représente la hiérarchie. C'est ce qui en fait une Trace!

Une autre chose que vous pourrez remarquer, c'est que chaque span a une
structure similaire a celle d'un log. C'est parce que c'en est un peu un! Une
manière de comprendre les traces c'est de les voir comme une collection de logs
structurés avec du contexte, de la hiérarchie et encore plus d'intégrations.
Mais ces "logs structurés peuvent provenir de différents processus, services,
machines virtuelles, data centers, etc. C'est ça qui permet aux traces de
représenter une vue de bout en bout de n'importe quel système.

Pour comprendre comment le tracing fonctionne dans Opentelemetry, regardons une
liste des composants qui vont jouer un rôle dans l'instrumentation de notre
code.

## Fournisseur de traces

un fournisseur de traces (parfois appelé `TracerProvider`) est une usine de
`Tracer`. Dans la plupart des application, un fournisseur de traces est
initialisé une seule fois et son cycle de vie correspond au cycle de vie de
l'application. L'initialisation du fournisseur de traces également inclut
l'initialisation l'initialisation de la Ressource et de l'Exporteur. il est
généralement la premiere étape dans la mise en place du tracing avec
OpenTelemetry. Dans les SDK de certains langages, un fournisseur de traces
global est déjà initialisé pour vous.

## Tracer

Un Traceur créé des spans contenant des informations a propos des opérations en
cours, comme une requête vers un service. les Traceurs sont créés à partir d'un
fournisseur de traces.

## Exporteurs de Traces

Les Exporteurs de traces envoient les traces à un consommateur. Ce consommateur
peut être une sortie standard pour la débogage et le développement, un
Collecteur OpenTelemetry, ou n'importe quel backend open source ou d'un éditeur
de votre choix.

## Propagation du contexte

Le contexte est un des concept fondamentaux qui permet le traçage distribué.
Avec le traçage distribué, les Spans peuvent être corrélés entre eux et
assemblés dans une Trace, quel que soit l'endroit où les Spans sont générés.
Pour en apprendre plus sur ce sujet, consultez la page
[Propagation de contexte](../../context-propagation).

## Spans

un **span** est une unité de travail ou d'opération. Les Spans sont les blocs
qui construisent les Traces. Dans OpenTelemetry, ils incluent les informations
suivantes:

- Nom
- ID du span parent (vide pour les spans racines)
- Horodatage de début et de fin
- [Contexte du span](#span-context)
- [Attributs](#attributes)
- [Événements du span](#span-events)
- [Liens du span](#span-links)
- [Statut du span](#span-status)

Span d'exemple:

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

Les spans peuvent être imbriqués, comme c'est suggéré par la présence d'un ID de
span parent: les spans enfants représentent des sous-opérations. Cela permet aux
spans de capturer plus précisément le travail effectué dans une application.

### Contexte d'un span

Le contexte d'un span est un objet immuable contenant les informations
suivantes:

- L'ID de la trace à laquelle le span appartient
- L'ID du span parent
- Le Trace flags, un encodage binaire contenant des informations sur la trace
- L'état de la trace, une liste de paires clé-valeur pouvant contenir des
  informations de traçage propres au fournisseur

Le contexte des spans fait partie de ce qui est sérialisé et propagé en même
temps que le [Contexte Distribué](#context-propagation) et le
[bagages](../baggage).

C'est parce que le Contexte du Span contient l'ID de la Trace qu'il est utilisé
pour créer les [Liens de spans](#span-links).

### Attributs

Les attributs sont des paires clé-valeur qui contiennent des metadata que vous
pouvez utiliser pour annoter les Span afin de transporter des informations
supplémentaires concernant les operations qu'ils suivent.

Par exemple, si un span suit un opération qui ajoute un article dans panier d'un
utilisateur sur un site d'e-commerce, vous pouvez capturer l'ID de
l'utilisateur, l'ID de l'article ajouté au panier et l'ID du panier.

Vous pouvez ajouter des attributs à un span pendant ou après sa création.
privilégier l'ajout d'attributs à un span lors de sa création afin de rendre
l'attribut disponible pour l'échantillonnage du SDK. Si vous devez ajouter une
valeur apres la création d'un span, mettez à jour le span avec la valeur.

Les attributs suivent les règles suivantes pour chaque implémentation SDK:

- Les clés doivent être des chaînes de caractères non nulles
- Les valeurs doivent être des chaînes de caractères, booléen, une valeur à
  virgule flottante, un entier ou un tableau de ces valeurs qui sont non nulles

De plus, il existe les
[Attributs sémantiques](/docs/specs/semconv/general/trace/), qui sont des
conventions de nommages pour les metadata

Additionally, there are
[Semantic Attributes](/docs/specs/semconv/general/trace/), which are known
naming conventions for metadata that is typically present in common operations.
It's helpful to use semantic attribute naming wherever possible so that common
kinds of metadata are standardized across systems.

### Span Events

A Span Event can be thought of as a structured log message (or annotation) on a
Span, typically used to denote a meaningful, singular point in time during the
Span's duration.

For example, consider two scenarios in a web browser:

1. Tracking a page load
2. Denoting when a page becomes interactive

A Span is best used to track the first scenario because it's an operation with a
start and an end.

A Span Event is best used to track the second scenario because it represents a
meaningful, singular point in time.

#### When to use span events versus span attributes

Since span events also contain attributes, the question of when to use events
instead of attributes might not always have an obvious answer. To inform your
decision, consider whether a specific timestamp is meaningful.

For example, when you're tracking an operation with a span and the operation
completes, you might want to add data from the operation to your telemetry.

- If the timestamp in which the operation completes is meaningful or relevant,
  attach the data to a span event.
- If the timestamp isn't meaningful, attach the data as span attributes.

### Span Links

Links exist so that you can associate one span with one or more spans, implying
a causal relationship. For example, let’s say we have a distributed system where
some operations are tracked by a trace.

In response to some of these operations, an additional operation is queued to be
executed, but its execution is asynchronous. We can track this subsequent
operation with a trace as well.

We would like to associate the trace for the subsequent operations with the
first trace, but we cannot predict when the subsequent operations will start. We
need to associate these two traces, so we will use a span link.

You can link the last span from the first trace to the first span in the second
trace. Now, they are causally associated with one another.

Links are optional but serve as a good way to associate trace spans with one
another.

For more information see [Span Links](/docs/specs/otel/trace/api/#link).

### Span Status

Each span has a status. The three possible values are:

- `Unset`
- `Error`
- `Ok`

The default value is `Unset`. A span status that is `Unset` means that the
operation it tracked successfully completed without an error.

When a span status is `Error`, then that means some error occurred in the
operation it tracks. For example, this could be due to an HTTP 500 error on a
server handling a request.

When a span status is `Ok`, then that means the span was explicitly marked as
error-free by the developer of an application. Although this is unintuitive,
it's not required to set a span status as `Ok` when a span is known to have
completed without error, as this is covered by `Unset`. What `Ok` does is
represent an unambiguous "final call" on the status of a span that has been
explicitly set by a user. This is helpful in any situation where a developer
wishes for there to be no other interpretation of a span other than
"successful".

To reiterate: `Unset` represents a span that completed without an error. `Ok`
represents when a developer explicitly marks a span as successful. In most
cases, it is not necessary to explicitly mark a span as `Ok`.

### Span Kind

When a span is created, it is one of `Client`, `Server`, `Internal`, `Producer`,
or `Consumer`. This span kind provides a hint to the tracing backend as to how
the trace should be assembled. According to the OpenTelemetry specification, the
parent of a server span is often a remote client span, and the child of a client
span is usually a server span. Similarly, the parent of a consumer span is
always a producer and the child of a producer span is always a consumer. If not
provided, the span kind is assumed to be internal.

For more information regarding SpanKind, see
[SpanKind](/docs/specs/otel/trace/api/#spankind).

#### Client

A client span represents a synchronous outgoing remote call such as an outgoing
HTTP request or database call. Note that in this context, "synchronous" does not
refer to `async/await`, but to the fact that it is not queued for later
processing.

#### Server

A server span represents a synchronous incoming remote call such as an incoming
HTTP request or remote procedure call.

#### Internal

Internal spans represent operations which do not cross a process boundary.
Things like instrumenting a function call or an Express middleware may use
internal spans.

#### Producer

Producer spans represent the creation of a job which may be asynchronously
processed later. It may be a remote job such as one inserted into a job queue or
a local job handled by an event listener.

#### Consumer

Consumer spans represent the processing of a job created by a producer and may
start long after the producer span has already ended.

## Specification

For more information, see the
[traces specification](/docs/specs/otel/overview/#tracing-signal).
