---
title: 定制 Collector
weight: 29
default_lang_commit: 9a1f7271288a46049ae28785f04a67fb77f677f7
drifted_from_default: true
# prettier-ignore
cSpell:ignore: batchprocessor darwin debugexporter gomod loggingexporter otlpexporter otlpreceiver
---

如果你打算构建和调试定制的 Collector 接收器、处理器、插件或导出器，你需要有自己的 Collector 实例。
这样就可以在你喜欢的 Golang IDE 中直接启动和调试 OpenTelemetry Collector 组件。

采用这种方式进行组件开发的另一个有趣方面是，你可以利用 IDE 的所有调试功能（堆栈跟踪是非常好的老师！）来了解
Collector 本身是如何与你的组件代码交互的。

OpenTelemetry 社区开发了一个名为 [OpenTelemetry Collector builder][ocb] 的工具（简称 `ocb`），
帮助开发者组装自己的 Collector 发行版，便于构建包含定制组件和公开组件的 Collector。

在此过程中，`ocb` 将生成 Collector 的源代码，你可以利用这些源代码来构建和调试你自己的定制组件。现在我们开始吧。

## 第 1 步 - 安装构建器 {#step-1---install-the-builder}

{{% alert color="primary" title="注意" %}}

`ocb` 工具需要 Go 语言来构建 Collector 发行版。
如果你尚未安装，请在本机上[安装 Go](https://go.dev/doc/install)。

{{% /alert %}}

`ocb` 可执行文件可以从 OpenTelemetry Collector 的[带有 `cmd/builder` 标签的版本][tags]中下载。
你会看到一系列按操作系统和芯片架构命名的资产，下载与你的配置相符的那一个：

{{< tabpane text=true >}}

{{% tab "Linux（AMD 64）" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux（ARM 64）" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux（ppc64le）" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_ppc64le
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS（AMD 64）" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS（ARM 64）" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Windows（AMD 64）" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_windows_amd64.exe" -OutFile "ocb.exe"
Unblock-File -Path "ocb.exe"
```

{{% /tab %}} {{< /tabpane >}}

为了确认 `ocb` 可以使用，在终端中输入 `./ocb help`，按回车后应会显示出帮助命令的输出内容。

## 第 2 步 - 创建构建器清单文件 {#step-2---create-a-builder-manifest-file}

构建器的 `manifest` 文件是一个 `yaml` 文件，你可以在其中传入代码生成、编译过程以及你希望加入
Collector 发行版的组件信息。

`manifest` 以名为 `dist` 的映射开始，它包含帮助你配置代码生成和编译过程的标签。事实上，所有
`dist` 标签都等价于 `ocb` 命令行参数。

以下是 `dist` 映射支持的标签：

| 标签         | 描述                                                     | 可选 | 默认值                                        |
| ------------ | -------------------------------------------------------- | ---- | --------------------------------------------- |
| module:      | 新发行版的模块名称，遵循 Go mod 的命名规范。可选但推荐。 | 是   | `go.opentelemetry.io/collector/cmd/builder`   |
| name:        | 发行版的可执行文件名                                     | 是   | `otelcol-custom`                              |
| description: | 应用的完整描述                                           | 是   | `Custom OpenTelemetry Collector distribution` |
| output_path: | 输出路径（包括源代码和可执行）                           | 是   | `/var/folders/.../otelcol-distribution...`    |
| version:     | 定制 OpenTelemetry Collector 的版本                      | 是   | `1.0.0`                                       |
| go:          | 用于编译生成源代码的 Go 可执行路径                       | 是   | 默认使用 PATH 中的 Go                         |

如表中所示，所有 `dist` 标签都是可选的，你可以根据是否希望将 Collector 发布给他人使用，
或只是用于组件开发与测试，来决定是否添加它们。

本教程将构建一个用于开发与测试组件的 Collector 发行版。

请创建名为 `builder-config.yaml` 的文件，并填入以下内容：

```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
```

接下来你需要添加希望纳入该发行版的组件模块。查看
[ocb 配置文档](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)了解不同模块及其添加方式。

本教程将在 Collector 发行版中添加以下组件：

- 导出器：OTLP 和 Debug[^1]
- 接收器：OTLP
- 处理器：Batch

在添加组件后，`builder-config.yaml` 将如下所示：

<!-- prettier-ignore -->
```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev

exporters:
  - gomod:
      # 注意：对于 v0.86.0 之前的版本，使用 `loggingexporter` 替代 `debugexporter`
      go.opentelemetry.io/collector/exporter/debugexporter {{% version-from-registry collector-exporter-debug %}}
  - gomod:
      go.opentelemetry.io/collector/exporter/otlpexporter {{% version-from-registry collector-exporter-otlp %}}

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor {{% version-from-registry collector-processor-batch %}}

receivers:
  - gomod:
      go.opentelemetry.io/collector/receiver/otlpreceiver {{% version-from-registry collector-receiver-otlp %}}

providers:
  - gomod: go.opentelemetry.io/collector/confmap/provider/envprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/fileprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpsprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/yamlprovider v1.18.0
```

{{% alert color="primary" title="提示" %}}

要查看可以添加到定制 Collector 中的组件列表，请参见
[OpenTelemetry 注册表](/ecosystem/registry/?language=collector)。
请注意，注册表条目会提供你需要添加到 `builder-config.yaml` 文件中的完整名称和版本号。

{{% /alert %}}

## 第 3a 步 - 生成代码并构建 Collector 发行版 {#step-3a---generate-the-code-and-build-your-collectors-distribution}

{{% alert color="primary" title="注意" %}}

这一步使用 `ocb` 可执行文件构建你的定制 Collector 发行版。如果你希望将其部署到容器编排系统（例如 Kubernetes），
请跳过这一步，转到[第 3b 步](#step-3b---containerize-your-collectors-distribution)。

{{% /alert %}}

现在你只需让 `ocb` 完成它的工作，在终端中输入以下命令：

```cmd
./ocb --config builder-config.yaml
```

如果一切顺利，命令的输出应如下所示：

```nocode
2022-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2023-01-03T15:05:37Z"}
2022-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2022-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2022-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2022-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2022-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2022-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

根据你配置文件中的 `dist` 部分定义，现在你会得到一个名为 `otelcol-dev` 的文件夹，其中包含了
Collector 发行版的所有源代码和可执行文件。

该文件夹的结构如下：

```console
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

你现在可以使用生成的代码来启动你的组件开发项目，并轻松构建和分发包含定制组件的 Collector 发行版。

## 第 3b 步 - 将 Collector 发行版容器化 {#step-3b---containerize-your-collectors-distribution}

{{% alert color="primary" title="注意" %}}

这一步将使用 `Dockerfile` 在容器中构建你的 Collector 发行版。如果你需要将 Collector
发行版部署到容器编排系统（如 Kubernetes），请按照本步骤操作。如果你只需要构建而不需要容器化，
请回到[第 3a 步](#step-3a---generate-the-code-and-build-your-collectors-distribution)。

{{% /alert %}}

你需要向项目中添加两个新文件：

- `Dockerfile` —— Collector 发行版的容器镜像定义
- `collector-config.yaml` —— 用于测试发行版的最小 Collector 配置文件

添加这些文件后，文件结构如下：

```console
.
├── builder-config.yaml
├── collector-config.yaml
└── Dockerfile
```

下面这个 `Dockerfile` 将在原地构建 Collector 发行版，确保生成的可执行文件符合目标容器架构
（例如 `linux/arm64`、`linux/amd64`）：

<!-- prettier-ignore-start -->

```yaml
FROM alpine:3.19 AS certs
RUN apk --update add ca-certificates

FROM golang:1.23.6 AS build-stage
WORKDIR /build

COPY ./builder-config.yaml builder-config.yaml

RUN --mount=type=cache,target=/root/.cache/go-build GO111MODULE=on go install go.opentelemetry.io/collector/cmd/builder@{{% version-from-registry collector-builder %}}
RUN --mount=type=cache,target=/root/.cache/go-build builder --config builder-config.yaml

FROM gcr.io/distroless/base:latest

ARG USER_UID=10001
USER ${USER_UID}

COPY ./collector-config.yaml /otelcol/collector-config.yaml
COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --chmod=755 --from=build-stage /build/otelcol-dev /otelcol

ENTRYPOINT ["/otelcol/otelcol-dev"]
CMD ["--config", "/otelcol/collector-config.yaml"]

EXPOSE 4317 4318 12001
```

<!-- prettier-ignore-end -->

下面是最小化的 `collector-config.yaml` 配置定义：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
processors:
  batch:

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
```

使用以下命令构建支持多架构的 OCB Docker 镜像，支持的目标架构包括 `linux/amd64` 和 `linux/arm64`。
如需了解更多，参见这篇关于多架构构建的[博客文章](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/)。

```bash
# 启用 Docker 多架构构建支持
docker run --rm --privileged tonistiigi/binfmt --install all
docker buildx create --name mybuilder --use

# 构建适用于 Linux AMD 和 ARM 的镜像，
# 并将构建结果加载到本地 "docker images"
docker buildx build --load \
  -t <collector_distribution_image_name>:<version> \
  --platform=linux/amd64,linux/arm64 .

# 测试新构建的镜像
docker run -it --rm -p 4317:4317 -p 4318:4318 \
    --name otelcol <collector_distribution_image_name>:<version>
```

## 延伸阅读 {#further-reading}

- [构建链路接收器](/docs/collector/building/receiver)
- [构建 Connector](/docs/collector/building/connector)

[ocb]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags

[^1]: 对于 v0.86.0 之前的版本，可以使用 `loggingexporter` 替代 `debugexporter`。
