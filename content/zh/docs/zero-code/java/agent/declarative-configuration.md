---
title: Java 代理声明式配置
linkTitle: 声明式配置
default_lang_commit: 9958669fbbc5664acded963fedb51c7cbf63c6a3
weight: 11
cSpell:ignore: genai
---

声明式配置使用 YAML 文件，而非环境变量或系统属性。

这种方法在以下情况下非常有用：

- 你需要设置许多配置选项。
- 你想使用环境变量或系统属性中不可用的配置选项。

与环境变量一样，配置语法与语言无关，适用于所有支持声明式配置的 OpenTelemetry Java SDK，包括 OpenTelemetry Java 代理。

{{% alert title="警告" %}} 声明式配置是实验性功能。
{{% /alert %}}

## 支持版本 {#supported-versions}

声明式配置在 **OpenTelemetry Java 代理版本 2.20.0 及更高版本**中受支持。

## 快速开始 {#getting-started}

1. 将下面的配置文件保存为 `otel-config.yaml`。
2. 将以下内容添加到你的 JVM 启动参数中：

   ```shell
   -Dotel.experimental.config.file=/path/to/otel-config.yaml
   ```

参考 [SDK 声明式配置][SDK Declarative configuration]文档，获取更通用的声明式配置入门指南。

本页重点介绍 [OpenTelemetry Java 代理](https://github.com/open-telemetry/opentelemetry-java-instrumentation) 的声明式配置。

## 配置选项的映射 {#mapping-of-configuration-options}

当你希望将现有的有的环境变量或系统属性配置映射为声明式配置时，请遵循以下规则：

1. 如果配置选项以 `otel.javaagent.` 开头（例如 `otel.javaagent.logging`），那么它很可能是只能通过环境变量或系统属性设置的属性（有关详细信息，请参阅下面的[仅限环境变量和系统属性的选项](#environment-variables-and-system-properties-only-options)部分）。
   否则，移除 `otel.javaagent.` 前缀，并将其放置在下方的 `agent` 配置段中。
2. 如果配置选项以 `otel.instrumentation.` 开头（例如 `otel.instrumentation.spring-batch.experimental.chunk.new-trace`），那么去掉 `otel.instrumentation.` 前缀，并将其放在下面的 `instrumentation` 部分下。
3. 否则，该选项很可能属于 SDK 配置。在[迁移配置](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml)中查找对应的环境变量或系统属性。
   如果有一个系统属性像 `otel.bsp.schedule.delay`，那么在迁移配置中查找对应的环境变量 `OTEL_BSP_SCHEDULE_DELAY`。
4. 使用 `.` 创建缩进级别。
5. 将 `-` 转换为 `_`。
6. 根据需要使用 YAML 布尔值和整数类型（例如 `true` 而不是 `"true"`，`5000` 而不是 `"5000"`）。
7. 下面列出了一些特殊映射的选项。

```yaml
instrumentation/development:
  general:
    peer:
      service_mapping: # 原配置项为 "otel.instrumentation.common.peer-service-mapping"
        - peer: 1.2.3.4
          service: FooService
        - peer: 2.3.4.5
          service: BarService
    http:
      client:
        request_captured_headers: # 原配置项为 otel.instrumentation.http.client.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # 原配置项为 otel.instrumentation.http.client.capture-response-headers
          - Content-Type
          - Content-Encoding
      server:
        request_captured_headers: # 原配置项为 otel.instrumentation.http.server.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # 原配置项为 otel.instrumentation.http.server.capture-response-headers
          - Content-Type
          - Content-Encoding
  java:
    agent:
      # 原配置项为 otel.instrumentation.common.default-enabled
      # instrumentation_mode: none  # 原为 false
      instrumentation_mode: default # 原为 true
    spring_batch:
      experimental:
        chunk:
          new_trace: true
```

## 仅适用于环境变量和系统属性的选项 {#environment-variables-and-system-properties-only-options}

以下配置选项虽受声明式配置支持，但仅能通过环境变量或系统属性进行设置：

- `otel.javaagent.configuration-file`（但使用声明式配置时不需要设置该选项）
- `otel.javaagent.debug`
- `otel.javaagent.enabled`
- `otel.javaagent.experimental.field-injection.enabled`
- `otel.javaagent.experimental.security-manager-support.enabled`
- `otel.javaagent.extensions`
- `otel.javaagent.logging.application.logs-buffer-max-records`
- `otel.javaagent.logging`

这些选项在代理启动时需要在读取声明式配置文件之前设置。

## 时长格式 {#duration-format}

- 声明式配置**仅支持以毫秒为单位的时长**（例如，5 秒表示为 `5000`）。
- 如果你使用 `OTEL_BSP_SCHEDULE_DELAY=5s`，将会出现错误（该格式对环境变量有效，但对声明式配置无效）。

示例：

```yaml
tracer_provider:
  processors:
    - batch:
        schedule_delay: ${OTEL_BSP_SCHEDULE_DELAY:-5000}
```

## 行为差异 {#behavior-differences}

- 资源属性 `telemetry.distro.name`（默认由 Java 代理添加）的值为 `opentelemetry-javaagent`，
  而不是 `opentelemetry-java-instrumentation`（将在 3.0 版本中与 Java 代理保持一致）。

## 未支持的功能 {#not-yet-supported-features}

一些通过环境变量和系统属性支持的功能尚未被声明式配置支持：

以下设置仍需通过环境变量或系统属性进行设置：

- `otel.experimental.javascript-snippet`
- `otel.instrumentation.aws-sdk.experimental-record-individual-http-error`
- `otel.instrumentation.aws-sdk.experimental-span-attributes`
- `otel.instrumentation.aws-sdk.experimental-use-propagator-for-messaging`
- `otel.instrumentation.common.db-statement-sanitizer.enabled`
- `otel.instrumentation.common.logging.span-id`
- `otel.instrumentation.common.logging.trace-flags`
- `otel.instrumentation.common.logging.trace-id`
- `otel.instrumentation.experimental.span-suppression-strategy`
- `otel.instrumentation.genai.capture-message-content`
- `otel.instrumentation.jdbc.experimental.capture-query-parameters`
- `otel.instrumentation.jdbc.experimental.transaction.enabled`
- `otel.instrumentation.log4j-context-data.add-baggage`
- `otel.instrumentation.messaging.experimental.capture-headers`
- `otel.instrumentation.messaging.experimental.receive-telemetry.enabled`
- `otel.javaagent.experimental.thread-propagation-debugger.enabled`
- `otel.semconv-stability.opt-in`

Java 代理中尚未被声明式配置支持的功能：

- `otel.instrumentation.common.mdc.resource-attributes`
- `otel.javaagent.add-thread-details`
- 当 `otel.javaagent.debug=true` 时，为 Span 添加控制台日志记录器
  - 可以通过在配置文件中添加用于输出 Span 信息的控制台日志记录器。
- 使用 `GlobalConfigProvider` 在自定义代码中访问声明式配置值

Java SDK 中尚未被声明式配置支持的功能：

- 在 `AutoConfiguredOpenTelemetrySdk` 中调用 `AutoConfigureListener`

Contrib 中尚未被声明式配置支持的功能：

- [AWS X-Ray](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-xray)
- [GCP 认证](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-auth-extension)

最后，[Spring Boot 启动器](/docs/zero-code/java/spring-boot-starter)尚不支持声明式配置：

- 但是，你已经可以使用 `application.yaml` 来配置 OpenTelemetry Spring Boot 启动器

[SDK Declarative configuration]: /docs/languages/sdk-configuration/declarative-configuration
