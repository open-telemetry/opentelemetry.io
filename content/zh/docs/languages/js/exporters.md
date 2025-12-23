---
title: 导出器
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
weight: 50
description: 处理并导出你的遥测数据
---

{{% docs/languages/exporters/intro %}}

## 依赖项 {#otlp-dependencies}

若你希望将遥测数据发送至 OTLP 端点（比如 [OpenTelemetry 采集器](#collector-setup)、[Jaeger](#jaeger) 或 [Prometheus](#prometheus)），你可以从三种不同的传输协议中选择一种来传输数据：

- [HTTP/protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)
- [HTTP/JSON](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http)
- [gRPC](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

开始前，先安装相应的导出器包作为项目的依赖项：

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
```

{{% /tab %}} {{% tab "HTTP/JSON" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
```

{{% /tab %}} {{< /tabpane >}}

## Node.js 环境使用指南 {#otlp-usage-nodejs}

接下来，配置导出器以指向 OTLP 端点。
例如，你可以更新[入门指南](/docs/languages/js/getting-started/nodejs/)中的 `instrumentation.ts`（如果使用 JavaScript 则为 `instrumentation.js`）文件，
如下所示，通过 OTLP（`http/protobuf`）导出链路和指标数据：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // 可选 - 默认 URL 为 http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // 可选 - 每个请求要发送的自定义头信息，默认为空
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // URL 是可选项并且可以省略，默认值为 http://localhost:4318/v1/metrics
      headers: {}, // 一个可选对象，包含了要随每个请求一同发送的自定义请求头。
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // 可选 - 默认 URL 为 http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // 可选 - 每个请求要发送的自定义头信息，默认为空
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // URL 是可选项并且可以省略，默认值为 http://localhost:4318/v1/metrics
      headers: {}, // 一个可选对象，包含了要随每个请求一同发送的自定义请求头。
      concurrencyLimit: 1, // 一个用于限制待处理请求数量的可选阈值。
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## 浏览器环境使用指南 {#usage-in-the-browser}

当你在基于浏览器的应用程序中使用 OTLP 导出器时，你需要注意以下几点：

1. 不支持使用 gRPC 进行导出
2. 你的网站的[内容安全策略][Content Security Policies]（CSP）可能会阻止遥测数据的导出操作。
3. [跨域资源共享][Cross-Origin Resource Sharing]（CORS）响应头可能不允许发送导出数据
4. 你可能需要将采集器暴露到公共互联网

你可以在下方找到选用合适导出器的操作指南，去配置内容安全策略（CSP）与跨域资源共享（CORS）响应头，以及暴露采集器时需采取的防范措施。

### 使用 OTLP 导出器结合 HTTP/JSON 或 HTTP/protobuf 协议 {#use-otlp-exporter-with-http-json-or-http-protobuf}

[基于 gRPC 协议的 OpenTelemetry 采集器导出器][OpenTelemetry Collector Exporter with gRPC]仅适用于 Node.js，
因此你只能使用[基于 HTTP/JSON 协议的 OpenTelemetry 采集器导出器][OpenTelemetry Collector Exporter with HTTP/JSON]或[基于 HTTP/protobuf 协议的 OpenTelemetry 采集器导出器][OpenTelemetry Collector Exporter with HTTP/protobuf]。

如果你使用的是[基于 HTTP/JSON 协议的 OpenTelemetry 采集器导出器][OpenTelemetry Collector Exporter with HTTP/JSON]，
请确保导出器的接收端（采集器或可观测性后端）支持 `http/json`，并且你将数据导出到正确的端点，端口设置为 4318。

### 配置 CSP {#configure-csps}

如果你的网站使用了内容安全策略（CSP），请确保包含了 OTLP 端点的域名。
如果你的采集器端点是 `https://collector.example.com:4318/v1/traces`，请添加以下指令：

```text
connect-src collector.example.com:4318/v1/traces
```

如果你的 CSP 未包含 OTLP 端点，你会看到一条错误消息，指出对端点的请求违反了 CSP 指令。

### 配置 CORS 响应头 {#configure-cors-headers}

如果你的网站和采集器托管在不同的域名下，你的浏览器可能会阻止向采集器发送请求。
你需要为[跨域资源共享][Cross-Origin Resource Sharing]（CORS）配置特殊的响应头。

OpenTelemetry 采集器为基于 HTTP 协议的接收器提供了[一项功能][a feature]，
可自动添加所需的请求头，使接收器能够接收来自网页浏览器链路数据：

```yaml
receivers:
  otlp:
    protocols:
      http:
        include_metadata: true
        cors:
          allowed_origins:
            - https://foo.bar.com
            - https://*.test.com
          allowed_headers:
            - Example-Header
          max_age: 7200
```

### 安全地暴露你的采集器 {#securely-expose-your-collector}

若要从 Web 应用接收遥测数据，你需要允许终端用户的浏览器向采集器发送数据。
若你的 Web 应用可从公共互联网访问，那么你也必须将采集器设置为对所有用户开放访问。

建议你不要直接暴露采集器，而是在其前端部署反向代理（如 NGINX、Apache HTTP 服务器等）。
反向代理可负责 SSL 卸载、配置正确的跨域资源共享（CORS）响应头，以及实现诸多针对 Web 应用的专属功能。

下面是流行的 NGINX Web 服务器的配置示例，供你参考使用：

```nginx
server {
    listen 80 default_server;
    server_name _;
    location / {
        # Take care of preflight requests
        if ($request_method = 'OPTIONS') {
             add_header 'Access-Control-Max-Age' 1728000;
             add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
             add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
             add_header 'Access-Control-Allow-Credentials' 'true' always;
             add_header 'Content-Type' 'text/plain charset=UTF-8';
             add_header 'Content-Length' 0;
             return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://collector:4318;
    }
}
```

## 控制台 {#console}

要调试你的插桩代码，或在本地开发环境中查看数值，你可以使用将遥测数据写入控制台（标准输出）的导出器。

如果你遵循了[入门指南](/docs/languages/js/getting-started/nodejs/)或[手动插桩](/docs/languages/js/instrumentation)指南，
你已经安装了控制台导出器。

`ConsoleSpanExporter` 包含在 [`@opentelemetry/sdk-trace-node`](https://www.npmjs.com/package/@opentelemetry/sdk-trace-node)
包中，而 `ConsoleMetricExporter` 包含在 [`@opentelemetry/sdk-metrics`](https://www.npmjs.com/package/@opentelemetry/sdk-metrics)
包中。

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## Prometheus 依赖项 {#prometheus-dependencies}

将[导出器包](https://www.npmjs.com/package/@opentelemetry/exporter-prometheus)作为项目依赖安装到你的应用中：

```shell
npm install --save @opentelemetry/exporter-prometheus
```

将你的 OpenTelemetry 配置更新为使用该导出器，并将数据发送到 Prometheus 后端：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // 可选 - 默认值为 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // 可选 - 默认值为 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

通过上述配置，你可以在 <http://localhost:9464/metrics> 访问你的指标数据。
Prometheus 或 OpenTelemetry 采集器中的 Prometheus 接收器可以从该端点采集指标数据。

{{% include "exporters/zipkin-setup.md" %}}

## Zipkin 依赖项 {#zipkin-dependencies}

若要将链路数据发送至 [Zipkin](https://zipkin.io/)，你可以使用 `ZipkinExporter` 导出器。

安装[导出器包](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)作为项目依赖安装到你的应用中：

```shell
npm install --save @opentelemetry/exporter-zipkin
```

将你的 OpenTelemetry 配置更新为使用该导出器，并将数据发送到 Zipkin 后端：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
```

{{% /tab %}} {{< /tabpane >}}

{{% include "exporters/outro.md" `https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-trace-base.SpanExporter.html` %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const sdk = new opentelemetry.NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

[content security policies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/
[cross-origin resource sharing]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[opentelemetry collector exporter with grpc]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
[opentelemetry collector exporter with http/protobuf]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto
[opentelemetry collector exporter with http/json]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http
[a feature]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/confighttp/README.md
