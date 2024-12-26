---
title: Стартер Spring Boot
aliases:
  - /docs/languages/java/spring-boot
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
default_lang_commit: edc67aafea1ead97b94ed4054d2c3248a34b0389
---

Ви можете використовувати два варіанти для інструментування застосунків [Spring Boot](https://spring.io/projects/spring-boot) з OpenTelemetry.

1. Стандартно для інструментування застосунків Spring Boot використовується [**Java агент OpenTelemetry**](../agent) з байт-код інструментуванням:
   - **Більше інструментів з коробки** ніж стартер OpenTelemetry
2. **Стартер OpenTelemetry Spring Boot** може допомогти вам з:
   - **Spring Boot Native image** застосунками, для яких Java агент OpenTelemetry не працює
   - **Початкове навантаження** Java агента OpenTelemetry перевищує ваші вимоги
   - Вже використовується Java агент моніторингу, оскільки Java агент OpenTelemetry може не працювати з іншим агентом
   - **Файли конфігурації Spring Boot** (`application.properties`, `application.yml`) для налаштування стартера OpenTelemetry Spring Boot, який не працює з Java агентом OpenTelemetry
