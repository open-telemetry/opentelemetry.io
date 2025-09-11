---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

## Prometheus

要将你的指标数据发送到 [Prometheus](https://prometheus.io/)，
你可以选择[启用 Prometheus 的 OTLP 接收器](https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver)并且使用
[OTLP 导出器](#otlp)，或者使用 Prometheus 导出器，这是一种 `MetricReader`，
他启动一个 HTTP 服务器，根据请求收集指标并将数据序列化为 Prometheus 文本格式。

### 后端设置 {#prometheus-setup}

{{% alert title=注意 %}}

如果你已经设置了 Prometheus 或兼容 Prometheus 的后端，可以跳过本节，直接为你的应用设置
[Prometheus](#prometheus-dependencies) 或者 [OTLP](#otlp-dependencies) 导出器依赖。

{{% /alert %}}

你可以按照以下步骤在 Docker 容器中运行 [Prometheus](https://prometheus.io)，并通过端口 9090 访问：

创建一个名为 `prometheus.yml` 的文件，并将以下内容写入文件：

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

使用以下命令在 Docker 容器中运行 Prometheus，UI 可通过端口 `9090` 访问：

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert title=注意 %}}

当使用 Prometheus 的 OTLP 接收器时，确保在应用中设置 OTLP 端点为
`http://localhost:9090/api/v1/otlp`。

并非所有的 Docker 环境都支持 `host.docker.internal`。在某些情况下，你可能需要将
`host.docker.internal` 替换为 `localhost` 或你机器的 IP 地址。

{{% /alert %}}
