---
title: 基准测试
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57 # patched
drifted_from_default: true
weight: 101
cSpell:ignore: Elems rrggbbaa
---

OpenTelemetry JavaScript SDK 会对 [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js/) 仓库的每个提交运行基准测试。
这些测试的目的是跟踪关键操作随时间的性能趋势。
这些测试不能替代端到端性能测试。

{{< js-benchmarks >}}