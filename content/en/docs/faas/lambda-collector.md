---
title: Lambda Collector Configuration
linkTitle: Lambda Collector Configuration
weight: 11
description:
  Add and configure the Collector Lambda layer to your Lambda
---

The community offers the Collector in a separate Lambda layer from the instrumentation layers to give users maximum flexibility. This is different than the current ADOT implementation which bundles instrumentation and the Collector together.

### Add the ARN of the OTel Collector Lambda layer

Once you've instrumented your application you should add the Collector Lambda layer to collect and submit your data to your chosen backend.

Note: Lambda layers are a regionalized resource, meaning that they can only be used in the Region in which they are published. Make sure to use the layer in the same region as your Lambda functions.

Find the supported regions and amd64(x86_64)/arm64 layer ARN in the table below for the ARNs to consume.

### Configure the OTel Collector

The configuration of the OTel Collector Lambda layer follows the OpenTelemetry standard.

By default, the OTel Lambda layer uses the config.yaml. To customize the Collector config, see the main Lambda section for custom configuration instructions.

Please find the list of available components supported for custom configuration here. To enable debugging, you can use the configuration file to set log level to debug. See the example below.

The OTel Lambda Layers supports the following types of confmap providers: file, env, yaml, http, https and s3. To customize the OTel collector configuration using different Confmap providers, Please refer to Confmap providers section for more information.

Once your collector configuration is set through a confmap providers. Create an environment variable on your Lambda function OPENTELEMETRY_COLLECTOR_CONFIG_FILE and set the path of configuration w.r.t to the confmap provider as its value. for e.g, if you are using a file configmap provider, set its value to /var/task/*<path/<to>/<filename>*. This will tell the extension where to find the collector configuration.

Here is a sample configuration file of collector.yaml in the root directory:
