---
title: 自动插桩
redirects: [{ from: 'net/*', to: 'dotnet/:splat' }]
weight: 265
default_lang_commit: 179f03bf118e1e8a3cc195ab56fc09d85c476394 # patched
---

OpenTelemetry 的[自动插桩][auto instrumentation]已支持下述索引中列出的编程语言。

如果你在使用 Kubernetes，可以借助 [OpenTelemetry Kubernetes Operator][otel-op]
为 .NET、Java、Node.js、Python 或 Go 应用[注入自动插桩][inject auto instrumentation]。

[inject auto instrumentation]: /docs/platforms/kubernetes/operator/automatic/
[auto instrumentation]: /docs/concepts/instrumentation/zero-code/
[otel-op]: /docs/platforms/kubernetes/operator/
