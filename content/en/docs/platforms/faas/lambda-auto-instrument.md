---
title: Lambda Auto-Instrumentation
weight: 11
description: Automatically instrument your Lambdas with OpenTelemetry
cSpell:ignore: Corretto regionalized
---

The OpenTelemetry community provides standalone instrumentation Lambda layers
for the following languages:

- Java
- JavaScript
- Python
- Ruby

These can be added to your Lambda using the AWS portal to automatically
instrument your application. These layers do not include the Collector which is
a required addition unless you configure an external Collector instance to send
your data.

## Add the ARN of the OTel Collector Lambda layer

See the [Collector Lambda layer guidance](../lambda-collector/) to add the layer
to your application and configure the Collector. We recommend you add this
first.

## Language Requirements

{{< tabpane text=true >}} {{% tab Java %}}

The Lambda layer supports the Java 8, 11, and 17 (Corretto) Lambda runtimes. For
more information about supported Java versions, see the
[OpenTelemetry Java documentation](/docs/languages/java/).

**Note:** The Java Auto-instrumentation agent is in the Lambda layer - Automatic
instrumentation has a notable impact on startup time on AWS Lambda and you will
generally need to use this along with provisioned concurrency and warmup
requests to serve production requests without causing timeouts on initial
requests while it initializes.

By default, the OTel Java agent in the Layer will try to auto-instrument all the
code in your application. This can have a negative impact on the Lambda cold
startup time.

We recommend that you only enable auto-instrumentation for the
libraries/frameworks that are used by your application.

To enable only specific instrumentations, you can use the following environment
variables:

- `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`: when set to false, disables
  auto-instrumentation in the Layer, requiring each instrumentation to be
  enabled individually.
- `OTEL_INSTRUMENTATION_<NAME>_ENABLED`: set to true to enable
  auto-instrumentation for a specific library or framework. Replace `<NAME>` by
  the instrumentation that you want to enable. For the list of available
  instrumentations, see [Suppressing specific agent instrumentation][1].

  [1]:
    /docs/zero-code/java/agent/disable/#suppressing-specific-agent-instrumentation

For example, to only enable auto-instrumentation for Lambda and the AWS SDK, you
would set the following environment variables:

```sh
OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false
OTEL_INSTRUMENTATION_AWS_LAMBDA_ENABLED=true
OTEL_INSTRUMENTATION_AWS_SDK_ENABLED=true
```

{{% /tab %}} {{% tab JavaScript %}}

The Lambda layer supports Node.js v18+ Lambda runtimes. For more information
about supported JavaScript and Node.js versions, see the
[OpenTelemetry JavaScript documentation](https://github.com/open-telemetry/opentelemetry-js).

{{% /tab %}} {{% tab Python %}}

The Lambda layer supports Python 3.9+ Lambda runtimes. For more information
about supported Python versions, see the
[OpenTelemetry Python documentation](https://github.com/open-telemetry/opentelemetry-python/blob/main/README.md#supported-runtimes)
and the package on [PyPi](https://pypi.org/project/opentelemetry-api/).

{{% /tab %}} {{% tab Ruby %}}

The Lambda layer supports Ruby 3.2 and 3.3 Lambda runtimes. For more information
about supported OpenTelemetry Ruby SDK and API versions, see the
[OpenTelemetry Ruby documentation](https://github.com/open-telemetry/opentelemetry-ruby/blob/main/README.md#compatibility)
and the package on [RubyGem](https://rubygems.org/search?query=opentelemetry).

{{% /tab %}} {{< /tabpane >}}

## Configure `AWS_LAMBDA_EXEC_WRAPPER`

Change the entry point of your application by setting
`AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler` for Node.js, Java, Ruby, or Python.
This wrapper script invokes your Lambda application with the automatic
instrumentation applied.

## Add the ARN of Instrumentation Lambda Layer

To enable the OTel auto-instrumentation in your Lambda function, you need to add
and configure the instrumentation and Collector layers, and then enable tracing.

1. Open the Lambda function you intend to instrument in the AWS console.
2. In the Layers in Designer section, choose Add a layer.
3. Under specify an ARN, paste the layer ARN, and then choose Add.

Find the
[most recent instrumentation layer release](https://github.com/open-telemetry/opentelemetry-lambda/releases)
for your language and use its ARN after changing the `<region>` tag to the
region your Lambda is in.

Note: Lambda layers are a regionalized resource, meaning that they can only be
used in the Region in which they are published. Make sure to use the layer in
the same region as your Lambda functions. The community publishes layers in all
available regions.

## Configure your SDK exporters

The default exporters used by the Lambda layers will work without any changes if
there is an embedded Collector with gRPC / HTTP receivers. The environment
variables do not need to be updated. However, there are varying levels of
protocol support and default values by language which are documented below.

{{< tabpane text=true >}} {{% tab Java %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=grpc` supports: `grpc`, `http/protobuf` and
`http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`

{{% /tab %}} {{% tab JavaScript %}}

`OTEL_EXPORTER_OTLP_PROTOCOL` env var is not supported The hard coded exporter
uses the protocol `http/protobuf`
`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{% tab Python %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` supports: `http/protobuf` and
`http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{% tab Ruby %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` supports: `http/protobuf`
`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{< /tabpane >}}

## Publish your Lambda

Publish a new version of your Lambda to deploy the new changes and
instrumentation.
