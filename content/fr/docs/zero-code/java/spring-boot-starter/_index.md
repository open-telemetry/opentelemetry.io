---
title: Spring Boot starter
aliases:
  - /docs/languages/java/spring-boot
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
default_lang_commit: 2d89b60b2e09d42ba96757b0afdbc31f54a2b0e7
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
   - La **[configuration déclarative](declarative-configuration/)**, qui utilise
     un format YAML structuré au sein d'`application.yaml`
