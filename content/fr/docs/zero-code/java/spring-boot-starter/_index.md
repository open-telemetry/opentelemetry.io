---
title: Spring Boot starter
aliases:
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
---

Vous pouvez utiliser deux options pour instrumenter les applications
[Spring Boot](https://spring.io/projects/spring-boot) avec OpenTelemetry.

1. Le choix par défaut pour instrumenter les applications Spring Boot est l'
   [**agent Java OpenTelemetry**](../agent) avec l'instrumentation bytecode car
   :
   - **Plus d'instrumentation prête à l'emploi** que le Spring Boot starter
     OpenTelemetry
2. Le **Spring Boot starter OpenTelemetry** peut vous aider à résoudre des
   problèmes avec :
   - Les applications **image native Spring Boot** pour lesquelles l'agent Java
     OpenTelemetry ne fonctionne pas
   - Un **impact au démarrage** de l'agent Java OpenTelemetry dépassant vos
     exigences de performance ou de ressources
   - L'utilisation d'un autre agent de surveillance Java avec lequel l'agent
     Java OpenTelemetry pourrait ne pas fonctionner
   - Les **fichiers de configuration Spring Boot** pour configurer le Spring
     Boot starter OpenTelemetry (`application.properties`, `application.yml`)
     qui ne fonctionne pas avec l'agent Java OpenTelemetry
