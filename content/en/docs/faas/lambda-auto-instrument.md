---
title: Lambda Auto-Instrumentation
weight: 11
description: Automatically instrument your Lambdas with OpenTelemetry
spelling: cSpell:ignore Corretto regionalized
---

The OpenTelemetry community provides standalone instrumentation Lambda layers
for the following languages:

- Java
- JavaScript
- Python

These can be added to your Lambda using the AWS portal to automatically
instrument your application. These layers do not include the Collector which is
a required addition unless you configure an external Collector instance to send
your data.

### Add the ARN of the OTel Collector Lambda layer

See the [Collector Lambda layer guidance](../lambda-collector/) to add the layer
to your application and configure the Collector. We recommend you add this
first.

### Language Requirements

<!-- prettier-ignore -->
{{< tabpane text=true >}}
{{% tab Java %}}

The Lambda layer supports the Java 11 (Corretto) Lambda runtime. It does not
support the Java 8 Lambda runtimes. For more information about supported Java
versions, see the
[OpenTelemetry Java documentation](/docs/instrumentation/java/).

**Note:** The Java Auto-instrumentation Agent is in the Lambda layer - Automatic
instrumentation has a notable impact on startup time on AWS Lambda and you will
generally need to use this along with provisioned concurrency and warmup
requests to serve production requests without causing timeouts on initial
requests while it initializes.

By default, the OTel Java Agent in the Layer will try to auto-instrument all the
code in your application. This can have a negative impact on the Lambda cold
startup time.

We recommend that you only enable auto-instrumentation for the
libraries/frameworks that are used by your application.

To enable only specific instrumentations you can use the following environment
variables:

    * OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED - When set to false, disables auto-instrumentation in the Layer, requiring each instrumentation to be enabled individually.
    * OTEL_INSTRUMENTATION_[NAME]_ENABLED - Set to true to enable auto-instrumentation for a specific library or framework. [NAME] should be replaced by the instrumentation that you want to enable. The full list of available instrumentations can be found in this link.

For example, to only enable auto-instrumentation for Lambda and the AWS SDK, you
would have to set the following environment variables:

    ```bash
    Copy
    OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false
    OTEL_INSTRUMENTATION_AWS_LAMBDA_ENABLED=true
    OTEL_INSTRUMENTATION_AWS_SDK_ENABLED=true
    ```

<!-- prettier-ignore -->
{{% /tab %}}
{{% tab JavaScript %}}

The Lambda layer supports Node.js v14+ Lambda runtimes. For more information
about supported JavaScript and Node.js versions, see the
[OpenTelemetry JavaScript documentation](https://github.com/open-telemetry/opentelemetry-js).

<!-- prettier-ignore -->
{{% /tab %}}
{{% tab Python %}}

The Lambda layer supports Python 3.8 and Python 3.9 Lambda runtimes. For more
information about supported Python versions, see the
[OpenTelemetry Python documentation](https://github.com/open-telemetry/opentelemetry-python/blob/main/README.md#supported-runtimes)
and the package on [PyPi](https://pypi.org/project/opentelemetry-api/).

<!-- prettier-ignore -->
{{% /tab %}}
{{< /tabpane >}}

### Add the ARN of Instrumentation Lambda Layer

To enable the OTel auto-instrumentation in your Lambda function, you need to add
and configure the instrumentation and Collector layers, and then enable tracing.

1. Open the Lambda function you intend to instrument in the AWS console.
2. In the Layers in Designer section, choose Add a layer.
3. Under specify an ARN, paste the layer ARN, and then choose Add.

Find the
[most recent instrumentation layer release](https://github.com/open-telemetry/opentelemetry-lambda/releases)
for your language and use it's ARN after changing the `<region>` tag to the
region your Lambda is in.

Note: Lambda layers are a regionalized resource, meaning that they can only be
used in the Region in which they are published. Make sure to use the layer in
the same region as your Lambda functions. The community publishes layers in all
available regions.

### Configure your SDK exporters

The default exporters used by the Lambda layers will work without any changes if
there is an embedded Collector with gRPC / HTTP receivers. The environment
variables do not need to be updated. However, there are varying levels of
protocol support and default values by language which are documented below.

<!-- prettier-ignore -->
{{< tabpane text=true >}}
{{% tab Java %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=grpc` Supports: `grpc`, `http/protobuf` and
`http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`

<!-- prettier-ignore -->
{{% /tab %}}
{{% tab Python %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` Supports: `http/protobuf` and
`http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

<!-- prettier-ignore -->
{{% /tab %}}
{{% tab JavaScript %}}

`OTEL_EXPORTER_OTLP_PROTOCOL` env var is not supported The hard coded exporter
uses the protocol `http/protobuf`
`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

<!-- prettier-ignore -->
{{% /tab %}}
{{< /tabpane >}}

### Publish your Lambda

Publish a new version of your Lambda to deploy the new changes and
instrumentation.
