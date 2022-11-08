---
title: Serverless
weight: 8
---

This guide will show you how to get started with tracing serverless functions using OpenTelemetry instrumentation libraries.

## AWS Lambda

Following the next steps will allow your AWS Lambda functions to use OpenTelemetry to send traces to the configured backend.

### Dependencies

Create an empty package.json:

```sh
npm init -y
```

Install dependencies used by the example.

```sh
npm install \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/sdk-trace-node
```

### AWS Lambda wrapper code

This file will contain all the OpenTelemetry logic, which will enable tracing.
Please save the following code as `lambda-wrapper.js`.

```javascript
/* lambda-wrapper.js */

const api = require("@opentelemetry/api");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const provider = new NodeTracerProvider();
const collectorOptions = {
  url: "<backend_url>",
};

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter(collectorOptions)
);

provider.addSpanProcessor(spanProcessor);
provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-aws-lambda": {
        disableAwsContextPropagation: true,
      },
    }),
  ],
});
```

Replace `<backend_url>` with the URL of your favorite backend to export all
traces to it. If you don't have one setup already, you can check out [Jaeger](https://www.jaegertracing.io/) or [Zipkin](https://zipkin.io/).

Note that `disableAwsContextPropagation` is set to true. The reason for this is
that the Lambda instrumentation tries to use the X-Ray context headers by
default, this results in a non-sampled context, which creates a
`NonRecordingSpan`.

More details can be found in the instrumentation
[documentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-aws-lambda).

### AWS Lambda function handler

Now that you have a Lambda wrapper, you can create a simple handler that will
serve as a Lambda function. Save the following code as `handler.js`.

```javascript
/* handler.js */

"use strict";

const http = require("http");

module.exports.hello = async (event) => {
  http.get("https://opentelemetry.io/");

  return {
    statusCode: 200,
    body: "Success!",
  };
};
```

## Deployment

There are multiple ways of deploying, but we will be using [Serverless Framework](https://github.com/serverless/serverless)
for ease of use. Create a file called `serverless.yml`:

```yaml
service: lambda-otel-native
frameworkVersion: "3"
provider:
  name: aws
  runtime: nodejs14.x
  region: "<your-region>"
  environment:
    NODE_OPTIONS: --require lambda-wrapper
functions:
  lambda-otel-test:
    handler: handler.hello
```

For OpenTelemetry to work properly, `lambda-wrapper.js` must be included before
any other file. That's why we have added the environment variable
`NODE_OPTIONS:--require lambda-wrapper` which preloads the wrapper at startup.

Note if you are not using Serverless Framework to deploy your Lambda function,
you must manually add this environment variable using the AWS Console UI.

Finally, run the following command to deploy the project to AWS:

```shell
serverless deploy
```

You can now invoke the newly deployed Lambda function by using the AWS Console
UI. You should expect to see spans related to the invocation of the Lambda
function.

### Visiting the backend

You should now be able to view traces produced by OpenTelemetry from your Lambda
function in the backend!
