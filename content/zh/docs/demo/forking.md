---
title: Fork 演示仓库
linkTitle: 派生
default_lang_commit: 82eee93552827dde1e716a5e711935e876803914
---

[演示仓库][demo repository]旨在被 Fork 使用，作为展示你如何使用 OpenTelemetry 的工具。

设置一个 Fork 或演示环境通常只需要覆盖一些环境变量，并可能替换一些容器镜像。

你可以将在线演示添加到该演示项目的
[README](https://github.com/open-telemetry/opentelemetry-demo/blob/main/README.md?plain=1)
中。

## 给 Fork 维护者的建议 {#suggestions-for-fork-maintainers}

- 如果你希望增强演示项目所生成或收集的遥测数据，我们强烈建议你将相关更改反向合并到此主仓库中。
  对于厂商或实现特定的更改，建议采用通过配置文件在数据处理管道中修改遥测的方式，而不是更改底层代码。
- 拓展而非替换。新增与现有 API 交互的新服务，是添加特定厂商或工具功能的良好方式，
  尤其是在无法通过修改遥测实现目标的情况下。
- 为了支持可拓展性，请使用仓库（Repository）或门面（Facade）模式来封装诸如队列、数据库、缓存等资源。
  这样可以便于为不同平台替换或接入不同的实现。
- 请不要尝试将特定厂商或工具的增强功能反向合并到主仓库中。

如果你有任何问题，或者希望提出建议帮助我们更好地支持 Fork 维护者的工作，请提交一个 Issue。

[demo repository]: <{{% param repo %}}>
