---
title: Lambda Manual Instrumentation
linkTitle: Lambda Manual Instrumentation
weight: 11
description: Manually instrument your Lambdas with OpenTelemetry
---

For languages not covered in the Lambda auto-instrumentation document, the
community does not have a standalone instrumentation layer.

Users will need to follow the generic instrumentation guidance for their chosen
language and add the Collector Lambda layer to submit their data.

### Add the ARN of the OTel Collector Lambda layer

See the [Collector Lambda layer guidance](./lambda-collector) to add the layer
to your application and configure the Collector. We recommend you add this
first.

### Instrument the Lambda with OTel

Review the
[language instrumentation guidance](/docs/instrumentation/)
on how to manually instrument your application.

### Publish your Lambda

Publish a new version of your Lambda to deploy the new changes and
instrumentation.
