---
title: Lambda Manual Instrumentation
linkTitle: Lambda Manual Instrumentation
weight: 11
description:
  Manually instrument your Lambdas with OpenTelemetry 
---

For languages not covered in the Lambda auto-instrumentation document, the community does not have a standalone instrumentation layer.

Users will need to follow the generic instrumentation guidance for their chosen language and add the Collector Lambda layer to submit their data.

### Instrument the Lambda with OTel

Review the [language instrumentation guidance](https://opentelemetry.io/docs/instrumentation/) on how to manually instrument your application.

### Add the ARN of the OTel Collector Lambda layer

Once you've instrumented your application you should add the Collector Lambda layer to collect and submit your data to your chosen backend.

Note: Lambda layers are a regionalized resource, meaning that they can only be used in the Region in which they are published. Make sure to use the layer in the same region as your Lambda functions.

Find the supported regions and amd64(x86_64)/arm64 layer ARN in the table below for the ARNs to consume.

### Configure the OTel Collector

The configuration of the OTel Collector Lambda layer follows the OpenTelemetry standard.

By default, the OTel Lambda layer uses the config.yaml. To customize the Collector config, see the main Lambda section for custom configuration instructions.
