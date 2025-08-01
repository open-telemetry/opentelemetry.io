---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
description:
  Les extensions ajoutent des capacités à l'agent sans avoir à créer une
  distribution séparée.
weight: 300
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

## Introduction {#introduction}

Les extensions sont conçues pour surcharger ou personnaliser l'instrumentation
fournie par l'agent sans avoir à créer une nouvelle distribution OpenTelemetry
ou à modifier le code de l'agent de quelque manière que ce soit.

Considérez un client de base de données instrumenté qui crée un span par appel
de base de données et extrait des données de la connexion à la base de données
pour fournir des attributs de span. Voici des exemples de cas d'utilisation pour
ce scénario qui peuvent être résolus en utilisant des extensions :

- _"Je ne veux pas du tout de ce span"_ :

  Créez une extension pour désactiver l'instrumentation sélectionnée en
  fournissant de nouveaux paramètres par défaut.

- _"Je veux modifier certains attributs qui ne dépendent d'aucune instance de
  connexion à la base de données"_ :

  Créez une extension qui fournit un `SpanProcessor` personnalisé.

- _"Je veux modifier certains attributs et leurs valeurs dépendent d'une
  instance de connexion à la base de données spécifique"_ :

  Créez une extension avec une nouvelle instrumentation qui injecte ses propres
  `Advice` dans la même méthode que l'originale. Vous pouvez utiliser la méthode
  `order` pour vous assurer qu'elle s'exécute après l'instrumentation originale
  et augmenter le span actuel avec de nouvelles informations.

- _"Je veux supprimer certains attributs"_ :

  Créez une extension avec un exportateur personnalisé ou utilisez la
  fonctionnalité de filtrage d'attributs dans le collecteur OpenTelemetry.

- _"Je n'aime pas les spans OTel. Je veux les modifier ainsi que leur cycle de
  vie"_ :

  Créez une extension qui désactive l'instrumentation existante et la remplace
  par une nouvelle qui injecte des `Advice` dans la même méthode (ou une
  meilleure) que l'instrumentation originale. Vous pouvez écrire vos `Advice`
  pour cela et utiliser le `Tracer` existant directement ou l'étendre. Comme
  vous avez vos propres `Advice`, vous pouvez contrôler quel `Tracer` vous
  utilisez.

## Exemples d'extensions {#extension-examples}

Pour obtenir une démonstration de la création d'une extension pour l'agent
d'instrumentation Java OpenTelemetry,
[compilez et exécutez le projet d'extension](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension).
