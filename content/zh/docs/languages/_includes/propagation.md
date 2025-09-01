---
default_lang_commit: 788277e362bc602b72a90aa9191f9c05c403458e
---

通过上下文传播，[信号](/docs/concepts/signals/)可以彼此关联，而不受其生成位置的限制。尽管上下文传播并不限于链路跟踪，
但它允许[链路](/docs/concepts/signals/traces/)在跨越进程和网络边界的任意分布式服务之间构建系统的因果关系信息。

在绝大多数用例中，原生支持 OpenTelemetry 的库或[插桩库](../libraries/)会自动为你在服务之间传播跟踪上下文。
只有在极少数情况下，你才需要手动传播上下文。

{{ if $lang }}

要了解更多，请参阅[上下文传播](/docs/concepts/context-propagation)。

{{ end }}

{{ if not $lang }}

要理解上下文传播，你需要先理解两个独立的概念：上下文和传播。

{{ end }}
