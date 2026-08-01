---
title: 安装 Collector
linkTitle: 安装
aliases: [installation]
weight: 2
default_lang_commit: 4f007739e0f0fc0b178b8dae457ef06c1c9a5757
---

你可以在多种操作系统和架构上部署 OpenTelemetry Collector。以下说明展示了如何为你的环境下载并安装最新的稳定版本。

在开始之前，请确保你已经了解 Collector 的基础概念，
包括[部署模式](/docs/collector/deploy/)、[组件](/docs/collector/components/)以及[配置](/docs/collector/configuration/)。

## 从源码构建 {#build-from-source}

你可以使用以下命令，在本地操作系统环境中构建最新版本的 Collector：

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```
