---
title: HTTP 插桩配置
linkTitle: HTTP
default_lang_commit: 4dda37feaa73c216918aab12f16de959d1977766
weight: 110
---

## 捕获 HTTP 请求头和响应头 {#capturing-http-request-and-response-headers}

你可以配置代理，将预定义的 HTTP 头作为 Span 属性进行采集，
符合[语义规范](/docs/specs/semconv/http/http-spans/)。
使用以下属性来定义要采集的 HTTP 头：

{{% config_option name="otel.instrumentation.http.client.capture-request-headers" %}}
以逗号分隔的 HTTP 头名称列表。
HTTP 客户端插桩将采集所有配置的头名称的 HTTP 请求头值。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.client.capture-response-headers" %}}
以逗号分隔的 HTTP 头名称列表。
HTTP 客户端插桩将采集所有配置的头名称的 HTTP 响应头值。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-request-headers" %}}
以逗号分隔的 HTTP 头名称列表。
HTTP 服务器插桩将采集所有配置的头名称的 HTTP 请求头值。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-response-headers" %}}
以逗号分隔的 HTTP 头名称列表。
HTTP 服务器插桩将采集所有配置的头名称的 HTTP 响应头值。
{{% /config_option %}}

这些配置选项受所有 HTTP 客户端和服务器插桩支持。

> **注意**：表中列出的属性、环境变量名称仍处于实验阶段，可能会发生变化。

## 采集 Servlet 请求参数 {#capturing-servlet-request-parameters}

你可以配置代理，使其为 Servlet API 处理的请求采集预定义的 HTTP 请求参数，并将这些参数作为 Span 属性。
使用以下属性来定义要采集的 Servlet 请求参数：

{{% config_option name="otel.instrumentation.servlet.experimental.capture-request-parameters" %}}
以逗号分隔的请求参数名称列表。
{{% /config_option %}}

> **注意**：表中列出的属性、环境变量名称仍处于实验阶段，可能会发生变化。

## 配置已知 HTTP 方法 {#configuring-known-http-methods}

配置插桩以识别一组替代的 HTTP 请求方法。
所有其他方法将被视为 `_OTHER`。

{{% config_option name="otel.instrumentation.http.known-methods"
default="CONNECT,DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT,TRACE"
%}} 以逗号分隔的已知 HTTP 方法列表。 {{% /config_option %}} -->

## 启用实验性 HTTP 遥测功能 {#enabling-experimental-http-telemetry}

你可以配置代理，采集额外的实验性 HTTP 遥测数据。

{{% config_option
name="otel.instrumentation.http.client.emit-experimental-telemetry"
default=false
%}} 启用实验性 HTTP 客户端遥测功能。 {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.emit-experimental-telemetry"
default=false
%}}
启用实验性 HTTP 服务器遥测功能。 {{% /config_option %}}

对于客户端和服务器 Span，添加以下属性：

- `http.request.body.size` 和 `http.response.body.size`：分别表示请求和响应体的大小。

对于客户端指标，创建以下指标：

- [http.client.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientrequestbodysize)
- [http.client.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientresponsebodysize)

对于服务器指标，创建以下指标：

- [http.server.active_requests](/docs/specs/semconv/http/http-metrics/#metric-httpserveractive_requests)
- [http.server.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestbodysize)
- [http.server.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverresponsebodysize)
