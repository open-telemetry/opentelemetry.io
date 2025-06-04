---
title: Стартер Spring Boot
aliases:
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Ви можете використовувати два варіанти для інструментування застосунків [Spring Boot](https://spring.io/projects/spring-boot) з OpenTelemetry.

1. Стандартно для інструментування застосунків Spring Boot використовується [**Java агент OpenTelemetry**](../agent) з байт-код інструментуванням:
   - **Більше інструментів з коробки** ніж стартер OpenTelemetry
2. **Стартер OpenTelemetry Spring Boot** може допомогти вам з:
   - **Spring Boot Native image** застосунками, для яких Java агент OpenTelemetry не працює
   - **Початкове навантаження** Java агента OpenTelemetry перевищує ваші вимоги
   - Вже використовується Java агент моніторингу, оскільки Java агент OpenTelemetry може не працювати з іншим агентом
   - **Файли конфігурації Spring Boot** (`application.properties`, `application.yml`) для налаштування стартера OpenTelemetry Spring Boot, який не працює з Java агентом OpenTelemetry
