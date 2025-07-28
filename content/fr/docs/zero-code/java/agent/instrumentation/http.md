---
title: Configuration de l'instrumentation HTTP
linkTitle: HTTP
weight: 110
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

## Capture des en-têtes de requête et de réponse HTTP {#capturing-http-request-and-response-headers}

Suivant la [convention sémantique](/docs/specs/semconv/http/http-spans/), vous
pouvez configurer l'agent pour capturer les en-têtes HTTP prédéfinis comme
attributs de span. Utilisez les propriétés suivantes pour définir les en-têtes
HTTP que vous souhaitez capturer :

{{% config_option name="otel.instrumentation.http.client.capture-request-headers" %}}
Une liste de noms d'en-têtes HTTP séparés par des virgules. Les instrumentations
du client HTTP captureront les valeurs des en-têtes de requête HTTP pour tous
les noms d'en-têtes configurés. {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.client.capture-response-headers" %}}
Une liste de noms d'en-têtes HTTP séparés par des virgules. Les instrumentations
du client HTTP captureront les valeurs des en-têtes de réponse HTTP pour tous
les noms d'en-têtes configurés. {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-request-headers" %}}
Une liste de noms d'en-têtes HTTP séparés par des virgules. Les instrumentations
du serveur HTTP captureront les valeurs des en-têtes de requête HTTP pour tous
les noms d'en-têtes configurés. {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-response-headers" %}}
Une liste de noms d'en-têtes HTTP séparés par des virgules. Les instrumentations
du serveur HTTP captureront les valeurs des en-têtes de réponse HTTP pour tous
les noms d'en-têtes configurés. {{% /config_option %}}

Ces options de configuration sont supportées par toutes les instrumentations de
client et de serveur HTTP.

> **Note** : Les noms de propriété/variable d'environnement listés dans le
> tableau sont encore expérimentaux, et sont donc susceptibles de changer.

## Capture des paramètres de requête de servlet {#capturing-servlet-request-parameters}

Vous pouvez configurer l'agent pour capturer les paramètres de requête HTTP
prédéfinis comme attributs de span pour les requêtes qui sont gérées par l'API
Servlet. Utilisez la propriété suivante pour définir les paramètres de requête
de servlet que vous souhaitez capturer :

{{% config_option name="otel.instrumentation.servlet.experimental.capture-request-parameters" %}}
Une liste de noms de paramètres de requête séparés par des virgules.
{{% /config_option %}}

> **Note** : Les noms de propriété/variable d'environnement listés dans le
> tableau sont encore expérimentaux, et sont donc susceptibles de changer.

## Configuration des méthodes HTTP connues {#configuring-known-http-methods}

Configure l'instrumentation pour reconnaître un ensemble alternatif de méthodes
de requête HTTP. Toutes les autres méthodes seront traitées comme `_OTHER`.

{{% config_option
name="otel.instrumentation.http.known-methods"
default="CONNECT,DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT,TRACE"
%}} Une liste de méthodes HTTP connues séparées par des virgules.
{{% /config_option %}}

## Activation de la télémétrie HTTP expérimentale {#enabling-experimental-http-telemetry}

Vous pouvez configurer l'agent pour capturer des données de télémétrie HTTP
expérimentales supplémentaires.

{{% config_option
name="otel.instrumentation.http.client.emit-experimental-telemetry"
default=false
%}} Active la télémétrie expérimentale du client HTTP. {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.emit-experimental-telemetry"
default=false
%}}
Active la télémétrie expérimentale du serveur HTTP. {{% /config_option %}}

Pour les spans client et serveur, les attributs suivants sont ajoutés :

- `http.request.body.size` et `http.response.body.size` : La taille des corps de
  requête et de réponse, respectivement.

Pour les métriques client, les métriques suivantes sont créées :

- [http.client.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientrequestbodysize)
- [http.client.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientresponsebodysize)

Pour les métriques serveur, les métriques suivantes sont créées :

- [http.server.active_requests](/docs/specs/semconv/http/http-metrics/#metric-httpserveractive_requests)
- [http.server.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestbodysize)
- [http.server.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverresponsebodysize)
