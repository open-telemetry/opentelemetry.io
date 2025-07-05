---
title: Instrumentation Zero-code
description: >-
  Apprenez comment ajouter l'observabilité à une application sans avoir besoin
  d'écrire du code
weight: 10
aliases: [automatic]
default_lang_commit: 3512b0ae11f72d3a954d86da59ad7f98d064bdad
---

En tant qu'[Ops](/docs/getting-started/ops/) vous pourriez souhaiter ajouter
l'observabilité à une ou plusieurs applications sans avoir à modifier le code
source. OpenTelemetry vous permet d'obtenir rapidement un certain degré
d'observabilité pour un service sans avoir à utiliser l'API et le SDK
d'OpenTelemetry pour
l'[instrumentation avec du code](/docs/concepts/instrumentation/code-based).

![Zero Code](./zero-code.svg)

L'instrumentation Zero-code ajoute les capacités de l'API et du SDK
OpenTelemetry à votre application, généralement à l'aide d'un agent ou d'un
concept similaire. Les mécanismes spécifiques impliqués peuvent différer selon
le langage de programmation, allant de la manipulation de bytecode, au monkey
patching, en passant par eBPF pour injecter des appels à l'API et au SDK
OpenTelemetry dans votre application.

Typiquement, l'instrumentation Zero-code ajoute tout le nécessaire pour les
bibliothèques que vous utilisez. Cela signifie que les requêtes et réponses, les
appels aux bases de données, les appels de file d'attente de messages, et
autres, sont instrumentés. Le code de votre application, cependant, n'est
généralement pas instrumenté. Pour instrumenter votre code, vous devrez utiliser
l'[instrumentation avec du code](/docs/concepts/instrumentation/code-based).

De plus, l'instrumentation Zero-code vous permet de configurer les
[librairies d'instrumentation](/docs/concepts/instrumentation/libraries) et les
[exportateurs](/docs/concepts/components/#exporters) que vous auriez chargés.

Vous pouvez configurer l'instrumentation Zero-code via des variables
d'environnement et d'autres mécanismes spécifiques au langage, tels que les
propriétés système ou les arguments passés aux méthodes d'initialisation. Pour
commencer, vous n'avez besoin que d'un nom de service configuré afin de pouvoir
identifier celui-ci dans la solution d'observabilité de votre choix.

D'autres options de configuration sont disponibles, notamment :

- Configuration spécifique à la source de données
- Configuration de l'exportateur
- Configuration du propagateur
- Configuration des ressources

L'instrumentation automatique est disponible pour les langages suivants :

- [.NET](/docs/zero-code/dotnet/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
