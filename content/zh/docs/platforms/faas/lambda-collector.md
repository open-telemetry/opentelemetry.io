---
title: Lambda Collector 配置
linkTitle: Lambda Collector 配置
weight: 11
description: 向你的 Lambda 添加并配置 Collector Lambda 层
default_lang_commit: f35b3300574b428f94dfeeca970d93c5a6ddbf35 # patched
drifted_from_default: true
cSpell:ignore: ADOT awsxray confmap
---

OpenTelemetry 社区将 Collector 作为独立的 Lambda 层提供，与插桩层分开，
为用户提供了最大的灵活性。这与当前的 AWS OpenTelemetry 发行版（ADOT）不同，
后者将插桩和 Collector 打包在一起。

## 添加 OTel Collector Lambda 层的 ARN {#add-the-arn-of-the-otel-collector-lambda-layer}

完成应用的自动插桩后，你应添加 Collector Lambda 层来收集并提交数据至所选后端。

请查找[最新的 Collector 层发布版本](https://github.com/open-telemetry/opentelemetry-lambda/releases)，
将其中的 ARN 中的 `<region>` 标签替换为你的 Lambda 所在区域。

注意：Lambda 层是区域性资源，仅能在其发布所在的 AWS 区域中使用。请确保使用与你的
Lambda 功能相同区域的层。社区会在所有可用区域中发布这些层。

## 配置 OTel Collector {#configure-the-otel-collector}

OTel Collector Lambda 层的配置遵循 OpenTelemetry 标准。

默认情况下，OTel Collector Lambda 层使用 `config.yaml` 文件进行配置。

### 设置目标后端的环境变量 {#set-the-environment-variable-for-your-preferred-backend}

在 Lambda 的环境变量设置中，创建一个新的变量，用于存放你的认证 token。

### 更新默认的导出器配置 {#update-the-default-exporters}

在你的 `config.yaml` 文件中添加所需的导出器，如果默认中尚未包含。
使用前一步中设置的环境变量来配置导出器。

**如果没有为导出器设置环境变量，默认配置仅支持使用 debug 导出器输出数据。**
默认配置如下所示：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'

exporters:
  # 注意：v0.86.0 之前请使用 `logging` 而非 `debug`
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

## 发布你的 Lambda {#publish-your-lambda}

发布 Lambda 的新版本以使配置更改生效。

## 高级 OTel Collector 配置 {#advanced-otel-collector-configuration}

你可以通过自定义配置启用更多组件。若需调试 Collector，
可在配置文件中设置日志级别为 debug。如下所示。

### 选择所用的 Confmap 提供程序 {#choose-your-preferred-confmap-provider}

OTel Lambda 层支持以下类型的配置映射提供程序：
`file`、`env`、`yaml`、`http`、`https` 和 `s3`。
要使用不同的 Confmap 提供程序来自定义 Collector 配置，请参考
[Amazon OpenTelemetry 发行版的 Confmap 提供程序文档](https://aws-otel.github.io/docs/components/confmap-providers#confmap-providers-supported-by-the-adot-collector)。

### 创建自定义配置文件 {#create-a-custom-configuration-file}

以下为根目录下 `collector.yaml` 的示例配置文件：

```yaml
# collector.yaml 放在根目录中
# 设置环境变量 'OPENTELEMETRY_COLLECTOR_CONFIG_URI' 为 '/var/task/collector.yaml'

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  # 注意：v0.86.0 之前请使用 `logging` 而非 `debug`
  debug:
  awsxray:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [awsxray]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

### 通过环境变量映射自定义配置文件 {#map-your-custom-configuration-file-using-environment-variables}

配置完成后，在 Lambda 功能上设置环境变量 `OPENTELEMETRY_COLLECTOR_CONFIG_URI`，
值为配置文件的路径（取决于 Confmap 提供程序）。例如，若使用文件 Confmap 提供程序，
应将其值设置为 `/var/task/<路径>/<文件名>`。该变量告知扩展从哪里加载 Collector 配置。

#### 通过 CLI 设置自定义配置路径 {#custom-collector-configuration-using-the-cli}

你可以在 Lambda 控制台中设置，也可以使用 AWS CLI：

```bash
aws lambda update-function-configuration --function-name Function --environment Variables={OPENTELEMETRY_COLLECTOR_CONFIG_URI=/var/task/collector.yaml}
```

#### 通过 CloudFormation 设置配置环境变量 {#set-configuration-environment-variables-from-cloudformation}

也可在 **CloudFormation** 模板中配置环境变量：

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: /var/task/collector.yaml
```

#### 从 S3 加载配置 {#load-configuration-from-an-s3-object}

若从 S3 加载配置，需确保绑定至功能的 IAM 角色具有读取相应 S3 桶的权限。

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: s3://<bucket_name>.s3.<region>.amazonaws.com/collector_config.yaml
```
