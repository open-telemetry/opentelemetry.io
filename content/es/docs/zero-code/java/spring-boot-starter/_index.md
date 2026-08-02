---
title: Spring Boot starter
aliases:
  - /docs/languages/java/spring-boot
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
default_lang_commit: 2d89b60b2e09d42ba96757b0afdbc31f54a2b0e7
---

Existen dos opciones para instrumentar aplicaciones de
[Spring Boot](https://spring.io/projects/spring-boot) con OpenTelemetry.

1. La opción predeterminada para instrumentar aplicaciones de Spring Boot es el
   [**agente de Java de OpenTelemetry**](../agent) con instrumentación de
   bytecode:
   - **Más instrumentación de fábrica** que el starter de OpenTelemetry
2. El **starter de OpenTelemetry para Spring Boot** puede ayudarte con:
   - Aplicaciones con **imagen nativa de Spring Boot** para las que el agente de
     Java de OpenTelemetry no funciona
   - La **sobrecarga de arranque** del agente de Java de OpenTelemetry cuando
     supera tus requisitos
   - Un agente de monitorización de Java que ya se utiliza, porque el agente de
     Java de OpenTelemetry podría no funcionar con el otro agente
   - **Archivos de configuración de Spring Boot** (`application.properties`,
     `application.yml`) para configurar el starter de OpenTelemetry para Spring
     Boot, que no funcionan con el agente de Java de OpenTelemetry
   - **[Configuración declarativa](declarative-configuration/)** utilizando un
     formato YAML estructurado dentro de `application.yaml`
