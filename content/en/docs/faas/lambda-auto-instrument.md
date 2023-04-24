---
title: Lambda Auto-Instrumentation
linkTitle: Lambda Auto-Instrumentation
weight: 11
description:
  Automatically instrument your Lambdas with OpenTelemetry 
---

The OpenTelemetry community provides standalone instrumentation Lambda layers for the following languages:

* Java
* JavaScript
* Python

These can be added to your Lambda using the AWS portal to automatically instrument your application. These layers do not include the Collector which is an optional but recommended standalone Lambda layer.

### Language Requirements

<!-- prettier-ignore -->
{{< tabpane text=true >}}
{{% tab Java %}}

The Lambda layer supports the Java 11 (Corretto) Lambda runtime. It does not support the Java 8 Lambda runtimes. For more information about supported Java versions, see the OpenTelemetry Java documentation.

Note: ADOT Lambda Layer for Java Auto-instrumentation Agent - Automatic instrumentation has a notable impact on startup time on AWS Lambda and you will generally need to use this along with provisioned concurrency and warmup requests to serve production requests without causing timeouts on initial requests while it initializes.

<!-- prettier-ignore -->
{{% /tab %}}
{{% tab Python %}}

...

<!-- prettier-ignore -->
{{% /tab %}}
{{< /tabpane >}}

### Add the ARN of Instrumentation Lambda Layer

To enable the OTel auto-instrumentation in your Lambda function, you need to add and configure the layer, and then enable tracing.

1. Open the Lambda function you intend to instrument in the AWS console.
2. In the Layers in Designer section, choose Add a layer.
3. Under specify an ARN, paste the layer ARN, and then choose Add.
4. Add the environment variable AWS_LAMBDA_EXEC_WRAPPER and set it to one of the following options:
    * /opt/otel-handler - for wrapping regular handlers (implementing RequestHandler)
5. Enable active tracing for your AWS Lambda function.

Tips:

* By default, the layer is configured to export traces to AWS X-Ray. Make sure your Lambda role has the required AWS X-Ray permissions. For more on AWS X-Ray permissions for AWS Lambda, see the AWS Lambda documentation.

* By default, the ADOT Java Agent in the Layer will try to auto-instrument all the code in your application. This can have a negative impact on the Lambda cold startup time.

    We recommend that you only enable auto-instrumentation for the libraries/frameworks that are used by your application.

    To enable only specific instrumentations you can use the following environment variables:

        * OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED - When set to false, disables auto-instrumentation in the Layer, requiring each instrumentation to be enabled individually.
        * OTEL_INSTRUMENTATION_[NAME]_ENABLED - Set to true to enable auto-instrumentation for a specific library or framework. [NAME] should be replaced by the instrumentation that you want to enable. The full list of available instrumentations can be found in this link.

    For example, to only enable auto-instrumentation for Lambda and the AWS SDK, you would have to set the following environment variables:

    ```bash
    Copy
    OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false
    OTEL_INSTRUMENTATION_AWS_LAMBDA_ENABLED=true
    OTEL_INSTRUMENTATION_AWS_SDK_ENABLED=true
    ```

### Add the ARN of the OTel Collector Lambda layer

See the [Collector Lambda layer guidance](lambda-manual-instrument) to add the layer to your application and configure the Collector.
