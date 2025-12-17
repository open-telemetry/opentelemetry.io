---
title: Agent Java
linkTitle: Agent
aliases:
  - /docs/java/automatic_instrumentation
  - /docs/languages/java/automatic_instrumentation
redirects: [{ from: /docs/languages/java/automatic/*, to: ':splat' }]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

L'instrumentation Zero-code avec Java utilise un agent Java sous forme de JAR
attaché à toute application Java 8+. Il injecte dynamiquement du bytecode pour
capturer la télémétrie de nombreuses bibliothèques et frameworks populaires. Il
peut être utilisé pour capturer les données de télémétrie aux "bords" d'une
application ou d'un service, comme les requêtes entrantes, les appels HTTP
sortants, les appels de base de données, et ainsi de suite. Pour apprendre
comment instrumenter manuellement votre application, consultez
[Instrumentation manuelle](/docs/languages/java/instrumentation/).
