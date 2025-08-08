---
title: Configuration de l'instrumentation
linkTitle: Configuration de l'instrumentation
weight: 100
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: enduser hset serverlessapis
---

Cette page décrit les paramètres courants qui s'appliquent à plusieurs
instrumentations à la fois.

## Nom du service pair {#peer-service-name}

Le
[nom du service pair](/docs/specs/semconv/general/attributes/#general-remote-service-attributes)
(`peer.service`) est le nom d'un service distant auquel une connexion est
établie. Il correspond à `service.name` dans la
[ressource](/docs/specs/semconv/resource/#service) pour le service local.

{{% config_option name="otel.instrumentation.common.peer-service-mapping" %}}

Utilisé pour spécifier une correspondance entre les noms d'hôte ou les adresses
IP avec les services pairs, sous forme de liste séparée par des virgules
`<host_or_ip>=<user_assigned_name>`. Le service pair est ajouté comme attribut à
un span dont l'hôte ou l'adresse IP correspond à cette relation de pairs.

Par exemple, si défini comme suit :

```text
1.2.3.4=cats-service,dogs-abcdef123.serverlessapis.com=dogs-api
```

Alors, les requêtes vers `1.2.3.4` auront un attribut `peer.service` égal à
`cats-service` et les requêtes vers `dogs-abcdef123.serverlessapis.com` auront
un attribut égal à `dogs-api`.

Depuis la version `1.31.0` de l'agent Java, il est possible de fournir un port
et un chemin pour définir un `peer.service`.

Par exemple, si défini comme suit :

```text
1.2.3.4:443=cats-service,dogs-abcdef123.serverlessapis.com:80/api=dogs-api
```

Alors, les requêtes vers `1.2.3.4` n'auront pas de surcharge pour l'attribut
`peer.service`, tandis que `1.2.3.4:443` aura un `peer.service` égal à
`cats-service` et les requêtes vers
`dogs-abcdef123.serverlessapis.com:80/api/v1` auront un attribut égal à
`dogs-api`.

{{% /config_option %}}

## Nettoyage des instructions de base de données {#db-statement-sanitization}

L'agent nettoie toutes les requêtes/instructions de base de données avant de
définir l'attribut sémantique `db.statement`. Toutes les valeurs (chaînes de
caractères, nombres) dans la chaîne de requête sont remplacées par un point
d'interrogation (`?`).

Note : Si vous cherchez à capturer les paramètres de liaison JDBC, ils ne sont
pas capturés dans `db.statement`. Voir
[le problème correspondant](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/7413).

Exemples :

- La requête SQL `SELECT a from b where password="secret"` apparaîtra comme
  `SELECT a from b where password=?` dans le span exporté ;
- La commande Redis `HSET map password "secret"` apparaîtra comme
  `HSET map password ?` dans le span exporté.

Ce comportement est activé par défaut pour toutes les instrumentations de base
de données. Utilisez la propriété suivante pour le désactiver :

{{% config_option
name="otel.instrumentation.common.db-statement-sanitizer.enabled"
default=true
%}} Active le nettoyage des instructions de base de données.
{{% /config_option %}}

## Capture de la télémétrie de réception de messages des consommateurs dans les instrumentations de messagerie {#capturing-consumer-message-receive-telemetry-in-messaging-instrumentations}

Vous pouvez configurer l'agent pour capturer la télémétrie de réception de
messages des consommateurs dans l'instrumentation de messagerie. Utilisez la
propriété suivante pour l'activer :

{{% config_option
name="otel.instrumentation.messaging.experimental.receive-telemetry.enabled"
default=false
%}} Active la télémétrie de réception de messages des consommateurs.
{{% /config_option %}}

Notez que cela amènera le côté consommateur à démarrer une nouvelle trace, avec
seulement un lien de span le connectant à la trace du producteur.

> **Note** : Les noms de propriété/variable d'environnement listés dans le
> tableau sont encore expérimentaux, et sont donc susceptibles de changer.

## Capture des attributs de l'utilisateur final {#capturing-enduser-attributes}

Vous pouvez configurer l'agent pour capturer les
[attributs d'identité généraux](/docs/specs/semconv/registry/attributes/enduser/)
(`enduser.id`, `enduser.role`, `enduser.scope`) des bibliothèques
d'instrumentation comme
[JavaEE/JakartaEE Servlet](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/servlet)
et
[Spring Security](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-security-config-6.0).

> **Note** : Étant donné la nature sensible des données impliquées, cette
> fonctionnalité est désactivée par défaut tout en permettant une activation
> sélective pour des attributs particuliers. Vous devez évaluer attentivement
> les implications de chaque attribut en matière de confidentialité avant
> d'activer la collecte de ces données.

{{% config_option
name="otel.instrumentation.common.enduser.id.enabled"
default=false
%}} Détermine s'il faut capturer l'attribut sémantique `enduser.id`.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.role.enabled"
default=false
%}} Détermine s'il faut capturer l'attribut sémantique `enduser.role`.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.scope.enabled"
default=false
%}} Détermine s'il faut capturer l'attribut sémantique `enduser.scope`.
{{% /config_option %}}

### Spring Security {#spring-security}

Pour les utilisateurs de Spring Security qui utilisent des
[préfixes d'autorité accordée (granted authority prefixes)](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities)
personnalisés, vous pouvez utiliser les propriétés suivantes pour supprimer ces
préfixes des valeurs d'attribut `enduser.*` afin de mieux représenter les noms
de rôle et de portée réels :

{{% config_option
name="otel.instrumentation.spring-security.enduser.role.granted-authority-prefix"
default=ROLE_
%}} Préfixe des autorités accordées identifiant les rôles à capturer dans
l'attribut sémantique `enduser.role`. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.spring-security.enduser.scope.granted-authority-prefix"
default=SCOPE_
%}} Préfixe des autorités accordées identifiant les portées à capturer dans
l'attribut sémantique `enduser.scopes`. {{% /config_option %}}
