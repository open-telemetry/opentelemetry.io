---
title: Propagation du contexte
weight: 10
description: Présentation du concept permettant le traçage distribué.
default_lang_commit: 71833a5f8b84110dadf1e98604b87a900724ac33
drifted_from_default: true
---

La propagation du contexte permet de mettre en corrélation les
[signaux](../signals), quelle que soit leur origine. Bien qu'elle ne soit pas
limitée au traçage, la propagation du contexte permet aux
[traces](../signals/traces) de créer des informations de causalité sur un
système, même lorsque les services sont distribués de façon arbitraire à travers
des limites de processus et de réseau.

Pour comprendre la propagation du contexte, vous devez maîtriser deux concepts
distincts : le contexte et la propagation.

## Contexte {#context}

Le contexte est un objet contenant les informations nécessaires pour que le
service émetteur et le service récepteur, ou
[unité d'exécution](/docs/specs/otel/glossary/#execution-unit), puissent mettre
en corrélation un signal avec un autre.

Prenons l'exemple d'un service A qui appelle un service B. Un span du service A,
dont l'ID est inclus dans le contexte, sera utilisé comme span parent pour le
prochain span créé par le service B. De plus, l'ID de trace inclus dans le
contexte sera également utilisé pour le prochain span créé dans le service B, ce
qui signifie que ce span fera partie de la même trace que le span du service A.

## Propagation {#propagation}

La propagation est le mécanisme permettant de transmettre le contexte entre
services et processus. Elle sérialise et désérialise le contexte et fournit les
informations nécessaires d'un service à l'autre.

La propagation étant généralement gérée automatiquement par les librairies
d'instrumentation, le mécanisme est transparent pour l'utilisateur. Si pour une
raison ou une autre, vous souhaitez propager le contexte manuellement, vous
pouvez utiliser
l'[API des propagateurs](/docs/specs/otel/context/api-propagators/).

Plusieurs propagateurs officiels sont maintenus par OpenTelemetry. Le
propagateur par défaut utilise les en-têtes définies par la spécification
[W3C TraceContext](https://www.w3.org/TR/trace-context/).

## Spécification {#specification}

Pour plus d'informations, consultez la page
[Spécification du contexte](/docs/specs/otel/context/).
