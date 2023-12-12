---
title: Resources
weight: 70
cSpell:ignore: myhost SIGINT uuidgen WORKDIR
description: Add details about your applications' environment to your telemetry
---

{{% docs/instrumentation/resources-intro %}}

Below you will find introductions on how to set up resource detection with the
Node.js SDK.

## Setup

Follow the instructions in the [Getting Started - Node.js][], so that you have
the files `package.json`, `app.js` and `tracing.js`.

## Process & Environment Resource Detection

Out of the box, the Node.js SDK detects [process and process runtime
resources][] and takes attributes from the environment variable
`OTEL_RESOURCE_ATTRIBUTES`. You can verify what it detects by turning on
diagnostic logging in `tracing.js`:

```javascript
// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

Run the application with some values set to `OTEL_RESOURCE_ATTRIBUTES`, e.g. we
set the `host.name` to identify the [Host][]:

```console
$ env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" \
  node --require ./tracing.js app.js
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: { 'host.name': 'localhost' } }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 12345,
    'process.executable.name': 'node',
    'process.command': '/app.js',
    'process.command_line': '/bin/node /app.js',
    'process.runtime.version': '16.17.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
...
```

## Adding resources with environment variables

In the above example, the SDK detected the process and also added the
`host.name=localhost` attribute set via the environment variable automatically.

Below you will find instructions to get resources detected automatically for
you. However, you might run into the situation that no detector exists for the
resource you need. In that case, use the environment variable
`OTEL_RESOURCE_ATTRIBUTES` to inject whatever you need. Additionally, you can
use the environment variable `OTEL_SERVICE_NAME` to set value of the
`service.name` resource attribute. For example, the following script adds
[Service][], [Host][] and [OS][] resource attributes:

```console
$ env OTEL_SERVICE_NAME="app.js" OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=${HOSTNAME},host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" \
  node --require ./tracing.js app.js
...
EnvDetector found resource. Resource {
  attributes: {
    'service.name': 'app.js',
    'service.namespace': 'tutorial',
    'service.version': '1.0',
    'service.instance.id': '46D99F44-27AB-4006-9F57-3B7C9032827B',
    'host.name': 'myhost',
    'host.type': 'arm64',
    'os.name': 'linux',
    'os.version': '6.0'
  }
}
...
```

## Adding resources in code

Custom resources can also be configured in your code. The `NodeSDK` provides a
configuration option, where you can set them. For example you can update the
`tracing.js` like the following to have `service.*` attributes set:

```javascript
...
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
...
const sdk = new opentelemetry.NodeSDK({
  ...
  resource: new Resource({
    [ SemanticResourceAttributes.SERVICE_NAME ]: "yourServiceName",
    [ SemanticResourceAttributes.SERVICE_NAMESPACE ]: "yourNameSpace",
    [ SemanticResourceAttributes.SERVICE_VERSION ]: "1.0",
    [ SemanticResourceAttributes.SERVICE_INSTANCE_ID ]: "my-instance-id-1",
  })
  ...
});
...
```

{{% alert title="Note" class="info" %}}

If you set your resource attributes via environment variable and code, the
values set via the environment variable take precedence.

{{% /alert %}}

## Container Resource Detection

Use the same setup (`package.json`, `app.js` and `tracing.js` with debugging
turned on) and `Dockerfile` with the following content in the same directory:

```Dockerfile
FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--require", "./tracing.js", "app.js" ]
```

To make sure that you can stop your docker container with <kbd>Ctrl + C</kbd>
(`SIGINT`) add the following to the bottom of `app.js`:

```javascript
process.on('SIGINT', function () {
  process.exit();
});
```

To get the ID of your container detected automatically for you, install the
following additional dependency:

```sh
npm install @opentelemetry/resource-detector-docker
```

Next, update your `tracing.js` like the following:

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  dockerCGroupV1Detector,
} = require('@opentelemetry/resource-detector-docker');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [dockerCGroupV1Detector],
});

sdk.start();
```

Build your docker image:

```sh
docker build . -t nodejs-otel-getting-started
```

Run your docker container:

```sh
$ docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': 'fffbeaf682f32ef86916f306ff9a7f88cc58048ab78f7de464da3c320ldb5c54'
  }
}
```

The detector has extracted the `container.id` for you. However you might
recognize that in this example, the process attributes and the attributes set
via an environment variable are missing! To resolve this, when you set the
`resourceDetectors` list you also need to specify the `envDetector` and
`processDetector` detectors:

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  dockerCGroupV1Detector,
} = require('@opentelemetry/resource-detector-docker');
const { envDetector, processDetector } = require('@opentelemetry/resources');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // Make sure to add all detectors you need here!
  resourceDetectors: [envDetector, processDetector, dockerCGroupV1Detector],
});

sdk.start();
```

Rebuild your image and run your container once again:

```shell
docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: {} }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 1,
    'process.executable.name': 'node',
    'process.command': '/usr/src/app/app.js',
    'process.command_line': '/usr/local/bin/node /usr/src/app/app.js',
    'process.runtime.version': '18.9.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': '654d0670317b9a2d3fc70cbe021c80ea15339c4711fb8e8b3aa674143148d84e'
  }
}
...
```

## Next steps

There are more resource detectors you can add to your configuration, for example
to get details about your [Cloud] environment or [Deployment][]. You will find a
list
[here](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/detectors/node).

[getting started - node.js]: /docs/instrumentation/js/getting-started/nodejs/
[process and process runtime resources]: /docs/specs/semconv/resource/process/
[host]: /docs/specs/semconv/resource/host/
[cloud]: /docs/specs/semconv/resource/cloud/
[deployment]: /docs/specs/semconv/resource/deployment-environment/
[service]: /docs/specs/semconv/resource/#service
[os]: /docs/specs/semconv/resource/os/
