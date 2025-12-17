---
title: 插桩配置
linkTitle: 插桩配置
default_lang_commit: 5b82e8f9c057d4d4961d41091a4bc75fc9b5b37c
weight: 100
cSpell:ignore: enduser hset serverlessapis
---

本页介绍适用于多个插桩的通用设置。

## 对等服务名称 {#peer-service-name}

[对等服务名称](/docs/specs/semconv/general/attributes/#general-remote-service-attributes)是与之建立连接的远程服务的名称。它对应于本地服务的[资源](/docs/specs/semconv/resource/#service)中的`service.name`。

{{% config_option name="otel.instrumentation.common.peer-service-mapping" %}}

用于将主机名或 IP 地址映射为对等服务，
格式为以逗号分隔的**<主机名或 IP>=<用户指定名称>**键值对列表。
当某个 Span 的主机名或 IP 地址与映射关系匹配时，对等服务会作为一个属性添加到该 Span 中。

例如，如果设置为以下内容：

```text
1.2.3.4=cats-service,dogs-abcdef123.serverlessapis.com=dogs-api
```

然后，发往 `1.2.3.4` 的请求会带有 `peer.service` 属性，其值为 `cats-service`；
而发往 `dogs-abcdef123.serverlessapis.com` 的请求会带有 `peer.service` 属性，其值为 `dogs-api`。

自 Java 代理版本 `1.31.0` 起，可以提供端口和路径来定义 `peer.service`。

例如，如果设置为以下内容：

```text
1.2.3.4:443=cats-service,dogs-abcdef123.serverlessapis.com:80/api=dogs-api
```

那么，发往 `1.2.3.4:443` 的请求会带有 `peer.service` 属性，其值为 `cats-service`；
而发往 `dogs-abcdef123.serverlessapis.com:80/api/v1` 的请求会带有 `peer.service` 属性，其值为 `dogs-api`。

{{% /config_option %}}

## 数据库语句清洗 {#db-statement-sanitization}

代理会在设置 `db.statement` 语义属性之前，对所有数据库查询以及其他语句进行清洗。
查询语句中的所有值（字符串、数字）都会被替换为问号（`?`）。

注意：JDBC 绑定参数不会被捕获到 `db.statement` 中。
如果你希望捕获绑定参数，请参阅[相关问题](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/7413)。

例如：

- SQL 查询 `SELECT a from b where password="secret"` 将在导出的 Span 中显示为 `SELECT a from b where password=?`；
- Redis 命令 `HSET map password "secret"` 将在导出的 Span 中显示为 `HSET map password ?`。

此行为在所有数据库插桩中默认启用。使用以下属性可将其禁用：

{{% config_option
name="otel.instrumentation.common.db-statement-sanitizer.enabled"
default=true
%}} 启用数据库语句清洗功能 {{% /config_option %}}

## 在消息传递插桩中采集消费者消息接收遥测数据 {#capturing-consumer-message-receive-telemetry-in-messaging-instrumentations}

你可以配置代理，在消息传递插桩中采集消费者消息接收遥测数据。使用以下属性来启用该功能：

{{% config_option
name="otel.instrumentation.messaging.experimental.receive-telemetry.enabled"
default=false
%}} 启用消费者消息接收遥测功能 {{% /config_option %}}

需要注意的是，这会导致消费者端启动一个新的链路，仅通过一个 Span 链接将其与生产者的追踪关联起来。

> **注意**：表中列出的属性、环境变量名称仍处于实验阶段，可能会发生变化。

## 采集终端用户属性 {#capturing-enduser-attributes}

你可以配置代理，
从 [JavaEE/JakartaEE Servlet](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/servlet) 和 [Spring Security](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-security-config-6.0) 等插桩库中采集[通用身份属性](/docs/specs/semconv/registry/attributes/enduser/)（`enduser.id`、`enduser.role`、`enduser.scope`）。

> **注意**：鉴于所涉及数据的敏感性，此功能默认关闭，但允许对特定属性进行选择性激活。
> 在开启数据采集前，你必须仔细评估每个属性的隐私影响。

{{% config_option
name="otel.instrumentation.common.enduser.id.enabled"
default=false
%}} 决定是否采集 `enduser.id` 语义属性。
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.role.enabled"
default=false
%}} 决定是否采集 `enduser.role` 语义属性。
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.scope.enabled"
default=false
%}} 决定是否采集 `enduser.scope` 语义属性。
{{% /config_option %}}

### Spring Security {#spring-security}

对于使用自定义[授权前缀](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities)的 Spring Security 用户，
你可以使用以下属性来从 `enduser.*` 属性值中剥离这些前缀，以更好地表示实际的角色和范围名称：

{{% config_option
name="otel.instrumentation.spring-security.enduser.role.granted-authority-prefix"
default=ROLE_
%}} 用于识别要采集到 `enduser.role` 语义属性中的权限的前缀。 {{% /config_option %}}

{{% config_option
name="otel.instrumentation.spring-security.enduser.scope.granted-authority-prefix"
default=SCOPE_
%}} 用于识别要采集到 `enduser.scope` 语义属性中的权限的前缀。 {{% /config_option %}}
