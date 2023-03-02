---
title: Serverless
weight: 8
---

This guide shows how to get started with tracing serverless functions using
OpenTelemetry instrumentation libraries.

## AWS Lambda

The following show how to use Lambda wrappers with OpenTelemetry to instrument
AWS Lambda functions and send traces to a configured backend.

If you are interested in a plug and play user experience, see
[OpenTelemetry Lambda Layers](https://github.com/open-telemetry/opentelemetry-lambda).

### Dependencies

First, create an empty package.json:

```sh
npm init -y
```

Then install the required dependencies:

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

This file contains all the OpenTelemetry logic, which enables tracing. Save the
following code as `lambda-wrapper.js`.

```javascript
/* lambda-wrapper.js */

const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const provider = new NodeTracerProvider();
const collectorOptions = {
  url: '<backend_url>',
};

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter(collectorOptions)
);

provider.addSpanProcessor(spanProcessor);
provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true,
      },
    }),
  ],
});
```

Replace `<backend_url>` with the URL of your favorite backend to export all
traces to it. If you don't have one setup already, you can check out
[Jaeger](https://www.jaegertracing.io/) or [Zipkin](https://zipkin.io/).

Note that `disableAwsContextPropagation` is set to true. The reason for this is
that the Lambda instrumentation tries to use the X-Ray context headers by
default, unless active tracing is enabled for this function, this results in a
non-sampled context, which creates a `NonRecordingSpan`.

More details can be found in the instrumentation
[documentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-aws-lambda).

### AWS Lambda function handler

Now that you have a Lambda wrapper, create a simple handler that serves as a
Lambda function. Save the following code as `handler.js`.

```javascript
/* handler.js */

'use strict';

const https = require('https');

function getRequest() {
  const url = 'https://opentelemetry.io/';

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
  try {
    const result = await getRequest();
    return {
      statusCode: result,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }
};
```

### Deployment

There are multiple ways of deploying your Lambda function:

- [AWS Console](https://aws.amazon.com/console/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Serverless Framework](https://github.com/serverless/serverless)
- [Terraform](https://github.com/hashicorp/terraform)

Here we will be using Serverless Framework, more details can be found in the
[Setting Up Serverless Framework guide](https://www.serverless.com/framework/docs/getting-started).

Create a file called `serverless.yml`:

```yaml
service: lambda-otel-native
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
  region: '<your-region>'
  environment:
    NODE_OPTIONS: --require lambda-wrapper
functions:
  lambda-otel-test:
    handler: handler.hello
```

For OpenTelemetry to work properly, `lambda-wrapper.js` must be included before
any other file: the `NODE_OPTIONS` setting ensures this.

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

## GCP function

The following shows how to instrument
[http triggered function](https://cloud.google.com/functions/docs/writing/write-http-functions)
using the Google Cloud Platform (GCP) UI.

### Creating function

Login to GCP and create or select a project where your function should be
placed. In the side menu go to _Serverless_ and select _Cloud Functions_. Next,
click on _Create Function_, and select
[2nd generation](https://cloud.google.com/blog/products/serverless/cloud-functions-2nd-generation-now-generally-available)
for your environment, provide a function name and select your region.

### Setup environment variable for otelwrapper

If closed, open the _Runtime, build, connections and security settings_ menu and
scroll down and add the environment variable `NODE_OPTIONS` with the following
value:

```shell
--require ./otelwrapper.js
```

### Select runtime

On the next screen (_Code_), select Node.js version 16 for your runtime.

### Establish otel wrapper

Create a new file called `otelwrapper.js`, that will be used to instrument your
service. Please make sure that you provide a `SERVICE_NAME` and that you set the
`<address for your backend>`.

```javascript
/* otelwrapper.js */

const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const providerConfig = {
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: '<your function name>',
  }),
};

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const provider = new NodeTracerProvider(providerConfig);
const collectorOptions = {
  url: '<address for your backend>',
};

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter(collectorOptions)
);

provider.addSpanProcessor(spanProcessor);
provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});
```

### Establish package.json

Add the following content to your package.json:

```json
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@opentelemetry/api": "^1.3.0",
    "@opentelemetry/auto-instrumentations-node": "^0.35.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.34.0",
    "@opentelemetry/instrumentation": "^0.34.0",
    "@opentelemetry/sdk-node": "^0.34.0",
    "@opentelemetry/sdk-trace-base": "^1.8.0",
    "@opentelemetry/sdk-trace-node": "^1.8.0",
    "@opentelemetry/resources": "^1.8.0",
    "@opentelemetry/semantic-conventions": "^1.8.0"
  }
}
```

### Add HTTP call to function

The following code makes a call to the OpenTelemetry web site to demonstrate
an outbound call.

```javascript
/* index.js */
const functions = require('@google-cloud/functions-framework');
const https = require('https');

functions.http('helloHttp', (req, res) => {
  let url = 'https://opentelemetry.io/';
  https
    .get(url, (response) => {
      res.send(`Response ${response.body}!`);
    })
    .on('error', (e) => {
      res.send(`Error ${e}!`);
    });
});
```

### Backend

If you run OTel collector in GCP VM you are likely to need to
[create VPC access connector](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access)
to be able to send traces.

### Deploy

Select Deploy in UI and await deployment to be ready.

### Testing

You can test the function using cloud shell from test tab.
