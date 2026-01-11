---
title: 处理敏感数据
description: 在 OpenTelemetry 中处理敏感数据的最佳实践与指导
weight: 100
default_lang_commit: cd3aec37475c3eb59b6d77d8e726d49cc8ba0e58
---

在实现 OpenTelemetry 时，必须高度关注敏感数据的处理。
遥测数据的采集始终存在无意中捕获敏感或个人信息的风险，而这些信息可能受到各种隐私法规和合规性要求的约束。

## 你的责任 {#your-responsibility}

OpenTelemetry 会收集遥测数据，但无法自行判断在你的具体上下文中哪些数据是敏感的。
作为实现者，你需要承担以下责任：

- 确保遵守适用的隐私法律和法规。
- 保护遥测数据中的敏感信息。
- 获取数据采集所需的必要同意。
- 实施适当的数据处理和存储实践。

此外，你还需要理解并审查你所使用的任何自动插桩库所生成的遥测数据，因为这些库同样可能会收集并暴露敏感信息。

## 敏感数据的考量 {#sensitive-data-considerations}

哪些数据属于敏感数据会因场景不同而有所差异，例如：

- 个人可识别信息（PII）
- 认证凭据
- 会话令牌
- 财务信息
- 与健康相关的数据
- 用户行为数据

## 数据最小化 {#data-minimization}

在通过遥测收集可能包含敏感信息的数据时，
应遵循[数据最小化](https://en.wikipedia.org/wiki/Data_minimization)原则。这意味着：

- 只收集对可观测性有明确用途的数据。
- 除非绝对必要，否则避免收集个人信息。
- 考虑是否可以通过聚合或匿名化的数据来达到相同目的。
- 定期审查已收集的属性，确保它们仍然是必要的。

## 保护敏感数据 {#protecting-sensitive-data}

如前一节所述，防止收集敏感数据的最佳方式是不去收集任何可能是敏感的数据。然而，
在某些情况下你可能确实需要收集这些数据，或者你并不能完全控制所收集的数据，
因此需要在后处理阶段对数据进行清洗。以下建议可以帮助你实现这一点。

[OpenTelemetry Collector](/docs/collector) 提供了多种处理器，可用于管理敏感数据：

- [`attribute` 处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)：
  删除或修改特定属性。
- [`filter` 处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)：
  过滤掉包含敏感数据的整个 span 或指标。
- [`redaction` 处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)：
  删除 span、日志和指标数据点中不在允许属性列表内的属性。
- [`transform` 处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)：
  使用正则表达式对数据进行转换。

### 删除和哈希化用户信息 {#deleting-and-hashing-user-information}

下面是一个 `attribute` 处理器的配置示例，用于对 `user.email` 进行哈希处理，并从敏感的
[`user`](/docs/specs/semconv/registry/attributes/user/#user-hash) 信息中删除 `user.full_name`：

```yaml
processors:
  attributes/example:
    actions:
      - key: user.email
        action: hash
      - key: user.full_name
        action: delete
```

### 使用 `user.hash` 替换 `user.id`

下面是一个 `transform` 处理器的配置示例，用于移除 `user.id`，并将其替换为 `user.hash`：

```yaml
transform:
  trace_statements:
    - context: span
      statements:
        - set(attributes["user.hash"], SHA256(attributes["user.id"]))
        - delete_key(attributes, "user.id")
```

{{% alert title="使用哈希进行匿名化的风险与局限性" color="warning" %}}

对用户的 ID 或姓名进行哈希处理，可能无法提供你所需要的匿名化程度。因为在实践中，
如果输入空间较小且可预测（例如纯数字的用户 ID），哈希是可以被反向推断的。

{{% /alert %}}

### 截断 IP 地址 {#truncating-ip-addresses}

作为哈希处理的替代方案，你也可以对数据进行截断，或按共同的前缀或后缀进行分组。例如：

- 日期：只保留年份，或年份和月份，丢弃具体的日期。
- 电子邮件地址：去掉本地部分，仅保留域名。
- IP 地址：去掉 IPv4 的最后一个八位组，或 IPv6 的最后 80 位。

下面是一个 `transform` 处理器的配置示例，用于删除 `client.address` 属性中 IPv4 地址的最后一个八位组：

```yaml
transform:
  trace_statements:
    - context: span
      statements:
        - replace_pattern(attributes["client.address"], "\\.\\d+$", ".0")
```

### 使用 redaction 处理器删除属性 {#delete-attributes-with-redaction-processor}

最后，关于使用 `redaction` 处理器删除特定属性的示例，可以参考 Collector 配置安全最佳实践页面中的
["清洗敏感数据"](/docs/security/config-best-practices/#scrub-sensitive-data)章节。
