---
title: Lambda Collector Configuration
linkTitle: Lambda Collector Config
weight: 11
description: Add and configure the Collector Lambda layer to your Lambda
---

The OpenTelemetry community offers the Collector in a separate Lambda layer from
the instrumentation layers to give users maximum flexibility. This is different
than the current AWS Distribution of OpenTelemetry (ADOT) implementation which
bundles instrumentation and the Collector together.

### Add the ARN of the OTel Collector Lambda layer

Once you've instrumented your application you should add the Collector Lambda
layer to collect and submit your data to your chosen backend.

Note: Lambda layers are a regionalized resource, meaning that they can only be
used in the Region in which they are published. Make sure to use the layer in
the same region as your Lambda functions.

Find the supported regions and amd64(x86_64)/arm64 layer ARN in the table below
for the ARNs to consume.

### Configure the OTel Collector

The configuration of the OTel Collector Lambda layer follows the OpenTelemetry
standard.

By default, the OTel Collector Lambda layer uses the config.yaml.

#### Set the Environment Variable for your Preferred Backend

In the Lambda environment variable settings create a new variable that holds
your authorization token.

#### Update the Default Exporters

In your `config.yaml` file add your preferred exporter(s) if they are not
already present. Configure your exporter(s) using the environment variables you
set for your access tokens in the previous step.

**Without an environment variable being set the default configuration only
supports emitting data using the logging exporter.** Here is the default
configuration:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
    loglevel: debug

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging]
    metrics:
      receivers: [otlp]
      exporters: [logging]
  telemetry:
    metrics:
      address: localhost:8888
```

### Publish your Lambda

Publish a new version of your Lambda to enable the changes you made.

### Advanced OTel Collector Configuration

Please find the list of available components supported for custom configuration
here. To enable debugging, you can use the configuration file to set log level
to debug. See the example below.

The OTel Lambda Layers supports the following types of confmap providers:
`file`, `env`, `yaml`, `http`, `https`, and `s3`. To customize the OTel
collector configuration using different Confmap providers, Please refer to
[Amazon Distribution of OpenTelemetry Confmap providers document](https://aws-otel.github.io/docs/components/confmap-providers#confmap-providers-supported-by-the-adot-collector)
for more information.

#### Create a Custom Configuration File

Once your collector configuration is set through a confmap providers. Create an
environment variable on your Lambda function
`OPENTELEMETRY_COLLECTOR_CONFIG_FILE` and set the path of configuration w.r.t to
the confmap provider as its value. for e.g, if you are using a file configmap
provider, set its value to `/var/task/*<path>/<to>/<filename>\_`. This will tell
the extension where to find the collector configuration.

Here is a sample configuration file of `collector.yaml` in the root directory:

```yaml
#collector.yaml in the root directory
#Set an environemnt variable 'OPENTELEMETRY_COLLECTOR_CONFIG_FILE' to '/var/task/collector.yaml'

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
  awsxray:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [awsxray]
    metrics:
      receivers: [otlp]
      exporters: [logging]
  telemetry:
    metrics:
      address: localhost:8888
```

#### Custom Collector Configuration Using the CLI

You can set this via the Lambda console, or via the AWS CLI.

```bash
aws lambda update-function-configuration --function-name Function --environment Variables={OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml}
```

#### Set Configuration Environment Variables from CloudFormation

You can configure environment variables via **CloudFormation** template as well:

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_FILE: /var/task/collector.yaml
```

#### Load Configuration from an S3 Object

Loading configuration from S3 will require that the IAM role attached to your
function includes read access to the relevant bucket.

```yaml
  Function:
    Type: AWS::Serverless::Function
    Properties:
      ...
      Environment:
        Variables:
          OPENTELEMETRY_COLLECTOR_CONFIG_FILE: s3://<bucket_name>.s3.<region>.amazonaws.com/collector_config.yaml
```
