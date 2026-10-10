---
title: Spring Boot starter
default_lang_commit: 2d89b60b2e09d42ba96757b0afdbc31f54a2b0e7
aliases:
  - /docs/languages/java/spring-boot
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
---

Você pode usar duas opções para instrumentar aplicações
[Spring Boot](https://spring.io/projects/spring-boot) com o OpenTelemetry.

1. A opção padrão para instrumentar aplicações Spring Boot é o
   [**OpenTelemetry Java agent**](../agent) com instrumentação de _bytecode_:
   - **Mais instrumentação pronta para uso** do que o starter do OpenTelemetry
2. O **OpenTelemetry Spring Boot starter** pode ajudar você com:
   - Aplicações **Spring Boot Native image** para as quais o OpenTelemetry Java
     agent não funciona
   - Quando o **_overhead_ de inicialização** do OpenTelemetry Java agent excede
     seus requisitos
   - Um agente de monitoramento Java já em uso, pois o OpenTelemetry Java agent
     pode não funcionar com o outro agente
   - **Arquivos de configuração do Spring Boot** (`application.properties`,
     `application.yml`) para configurar o OpenTelemetry Spring Boot starter, o
     que não funciona com o OpenTelemetry Java agent
   - **[Configuração declarativa](declarative-configuration/)** usando um
     formato YAML estruturado dentro de `application.yaml`
