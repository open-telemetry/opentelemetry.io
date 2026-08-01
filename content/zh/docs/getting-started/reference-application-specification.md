---
title: 参考应用规范
linkTitle: 参考应用规范
description: 本文包含在快速入门指南中使用的参考应用的规范
toc_hide: true
cspell:ignore: uninstrumented rolldice
default_lang_commit: 5d9a9ba46a959435e2b0c22dddb021a7d4152393
---

参考应用的目的是提供一个标准化的示例应用，该应用可以使用所有已提供
OpenTelemetry SDK 的编程语言来实现。

## 通用要求 {#general-requirements}

- 参考应用的实现由各编程语言的 SIG（负责实现 OpenTelemetry API 和 SDK 的小组）维护。
  这可以确保应用遵循该语言生态系统中的最佳实践，并为应用如何进行插桩提供一份蓝图。
- 应用必须同时提供未插桩版本和已插桩版本。
  这将用于 opentelemetry.io 上的快速入门指南，展示如何将一个未使用
  OpenTelemetry 的应用逐步演进为一个完全插桩的应用。
- 必须有语言相关的 CI 流水线，用于验证应用在两种版本下都可以成功构建并运行。
- 应用必须可以通过命令行接口运行。
- 必须提供一个 Dockerfile，用于在容器化环境中运行该应用。
- 应用必须能够独立运行。换句话说，它不能对其所在仓库中的其他内容存在硬依赖。
  这样用户就可以将代码直接拷贝到自己的项目中，而无需处理复杂的依赖关系。

## 服务要求 {#service-requirements}

- 应用默认必须监听 `8080` 端口来接收 HTTP 请求。
  端口应可通过环境变量 `APPLICATION_PORT` 进行配置。
- 在处理 HTTP 请求时，应使用一个已有插桩库的 HTTP 框架或库。
  应用必须通过 `GET`（可选支持 `POST`）方式提供
  `/rolldice?rolls=<n>` 接口，并返回如下 HTTP 状态码和 JSON 结果：
  - 如果未设置 `rolls`，或其值为有效输入（大于 0 的正整数）：
    返回状态码 `200`；
    - 若 `rolls` 未设置或值为 `1`，返回一个介于 1 到 6 之间的单个数字
    - 若 `rolls` 为 `n`，返回一个包含 `n` 个介于 1 到 6 之间数字的数组
  - 如果 `rolls` 为无效输入（非数字）：返回状态码 `400`，并返回
    `{"status": "error", "message": "Parameter rolls must be a positive integer"}`
  - 如果 `rolls` 为 `0` 或负整数：
    返回状态码 `500`，且不返回 JSON 内容。
    这些错误示例将用于演示如何使用 OpenTelemetry 来定位错误。
- `/rolldice` 接口可以支持一个可选参数 `player=name`。
- 应用必须输出以下日志：
  - 对于状态码 `<400` 的每个 HTTP 请求，输出一条 INFO 级别日志
  - 对于状态码在 `400` 到 `499` 之间的每个 HTTP 请求，
    输出一条 WARN 级别日志，并包含将返回在 JSON 中的错误信息
  - 对于状态码大于 `499` 的每个 HTTP 请求，输出一条 ERROR 级别日志
  - 如果设置了可选的 `player` 参数，
    输出一条 DEBUG 级别日志，包含 `player` 的值和掷骰子的结果
  - 如果未设置 `player` 参数，
    输出一条 DEBUG 级别日志，包含固定值 `anonymous player`
    和掷骰子的结果数字。这些日志将用于在插桩时添加日志桥接，
    以展示 OpenTelemetry 如何与现有日志框架集成。
- 应用代码必须拆分为两个文件：
  - `app` 文件：包含 HTTP 请求处理逻辑
  - `library` 文件：包含掷骰子逻辑的实现。
    文件名应符合对应语言的习惯用法，例如 `app.js`、`roll-the-dice.js`。
    关键在于通过这种拆分，体现 `library` 仅依赖 OpenTelemetry API，
    而所有 SDK 的初始化都在 `app` 中完成。
- 针对 `rolls` 参数的错误处理需按如下方式拆分：
  - `app` 负责检查 `rolls` 是否定义，若未定义则将其设为 `1`
  - `app` 只检查 `rolls` 是否为数字：
    - 若是数字，则调用 `library` 中的掷骰子函数
    - 若不是数字，则直接返回 `400` 错误
  - `library` 负责检查 `rolls` 是否为正数：
    - 若不是正数，则抛出异常
    - `app` 捕获该异常并返回 `500` 错误
- `library` 应包含一个外层函数，用于按上述逻辑进行错误处理。
  外层函数根据 `rolls` 的值执行以下操作：
  - `rolls == 1`：调用一次内层函数并返回结果
  - `rolls > 1`：循环调用内层函数 `rolls` 次，并将结果以数组形式返回
- `library` 的内层函数用于生成并返回一个介于 1 到 6 之间的随机数。

## 插桩要求 {#instrumentation-requirements}

- 如果可能，OpenTelemetry SDK 的初始化应放在单独的文件中，
  并在 `app` 文件中引入；否则可以直接放在 `app` 文件中。
- 初始化时应加载常见的资源探测器，例如 `process`、`container`、`os` 等。
- "lib" 文件必须仅依赖 OpenTelemetry API。
- `service.*` 相关属性应通过环境变量配置
  （`OTEL_SERVICE_NAME`、`OTEL_RESOURCE_ATTRIBUTES`）。
- 其他资源探测器也应在 SDK 初始化时启用。
- 遥测数据导出应同时支持 `stdout`/`console` 和 `otlp` 导出器。
- 应提供启用 OpenTelemetry 组件诊断日志的方式，
  理想情况下通过 `OTEL_LOG_LEVEL` 配置。
- 应提供一种方式，为所使用的 HTTP 库添加对应的插桩库。
  该插桩库应使用稳定版的 HTTP 语义约定，
  优先选择同时支持多种信号（理想情况下同时支持链路和指标）的库。
- 仅在没有可用的 HTTP 插桩库时，
  才由用户在 `app` 中对处理 `/rolldice` 的函数手动添加 span 和指标。
- 应为所使用的日志框架提供日志桥接，
  使所有日志都能被自动采集并导出。
- 在 `library` 中应为外层函数创建一个 span：
  - 该 span 用于跟踪函数执行时间
  - 若抛出异常，则记录异常
  - 为 span 添加诸如 `rolls`、`code.*` 等属性
- 在 `library` 中应为内层函数创建一个 span：
  - 该 span 用于跟踪函数执行时间
  - 将生成的随机数作为属性添加到 span 中
- 在 `library` 文件中需要创建以下指标：
  - 一个计数器，用于统计外层函数的调用次数
  - 一个直方图，用于统计掷骰子结果（1–6）的分布
  - 一个仪表，用于记录最近一次 `rolls` 的值
