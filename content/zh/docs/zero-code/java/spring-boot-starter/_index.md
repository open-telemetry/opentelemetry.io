---
title: Spring Boot 启动器
default_lang_commit: 8c61967612481a3b8d48926cfaa3c92ce7c46906
drifted_from_default: true
aliases:
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
---

你可以通过两种方式为 [Spring Boot](https://spring.io/projects/spring-boot) 应用程序配置 OpenTelemetry 插桩。

1. 为 Spring Boot 应用程序配置插桩的默认选择是使用带有字节码插桩的 [**OpenTelemetry Java 代理**](../agent)：
   - 提供比 OpenTelemetry 启动器更多的开箱即用的插桩
2. **OpenTelemetry Spring Boot 启动器**可以帮助你：
   - 适用于 **Spring Boot Native image** 应用程序，这类应用中 OpenTelemetry Java 代理无法正常工作
   - 当 OpenTelemetry Java 代理的**启动开销**超出您的需求时
   - 已在使用其他 Java 监控代理的场景，因为 OpenTelemetry Java 代理可能与其他代理存在兼容性问题
   - 可通过 **Spring Boot 配置文件**（`application.properties`、`application.yml`）进行配置，
     这种配置方式与 OpenTelemetry Java 代理不兼容
