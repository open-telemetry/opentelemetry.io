---
title: Instrumenting libraries
linkTitle: Libraries
weight: 40
description: How to instrument libraries an app depends on
spelling: cSpell:ignore autoinstrumentation metapackage metapackages
---

When you develop an app, you make use of 3rd party libraries and frameworks, to
accelerate your work and to not reinvent the wheel. If you now instrument your
app with OpenTelemetry, you don't want to spend additional time on manually
adding traces, logs and metrics to those libraries and frameworks. Gladly, you
don't have to reinvent the wheel for those either: libraies might come with
OpenTelemetry support natively or you can use an **Instrumentation Library** in
order to generate telemetry data for a library or framework.

If you are instrumenting an app, you can learn on this page how to make use of
natively instrumented libraries and Instrumentation Libraries for your
dependencies.

If you want to instrument a library, you can learn on this page, what you need
to do to natively instrument your own library or how you can create an
Instrumentation Library for a 3rd party library if none is available.

{{% alert title="Note" color="info" %}}

You can use natively instrumented libraries and Instrumentation Libraries with
automatic and with manual instrumentation.

Opentelemetry

{{% /alert %}}

## Use natively instrumented libraries

If a library comes with OpenTelemetry out of the box, you get the traces,
metrics and logs emitted from that library, by simply adding and setting up the
OpenTelemetry SDK with your app.

The library may provide some additional configuration for the instrumentation.
Go to the documentation of that library to learn more.

{{% alert title="Help wanted" color="warning" %}}

As of today, we don't know about any JavaScript library, that has OpenTelemetry
integrated. If you know about such a library,
[please let us know](https://github.com/open-telemetry/opentelemetry.io/issues/new).

{{% /alert %}}

## Use Instrumentation Libraries

If a library does not come with OpenTelemetry out of the box, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
in order to generate telemetry data for a library or framework.

For example,
[the instrumentation library for Express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
will automatically create [spans](/docs/concepts/signals/traces/#spans) based on
the inbound HTTP requests.

### Setup

Each instrumentation library is an NPM package, and installation is typically
done like so:

```console
npm install <name-of-package>
```

For example, here’s how you can install and the
[instrumentation-express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
and
[instrumentation-http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
instrumentation libraries to instrument inbound and outbound HTTP traffic:

```sh
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

OpenTelemetry JavaScript also defines metapackages
[auto-instrumentation-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
and
[auto-instrumentation-web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web),
that bundle all Node.js- or web-based instrumentation libraries into a single
package. It’s a convenient way to add automatically-generated telemetry for all
your libraries with minimal effort.

### Registration

#### Node autoinstrumentation package

OpenTelemetry also defines the
[auto-instrumentations-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
metapackage that bundles all Node.js-based instrumentation libraries into a
single package. It's a convenient way to add automatically-generated telemetry
for all your libraries with minimal effort.

To use the package, first install it:

```shell
npm install @opentelemetry/auto-instrumentations-node
```

Then in your tracing initialization code, use `registerInstrumentations`:

<!-- textlint-disable -->

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/* tracing.ts */

// Import dependencies
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import opentelemetry from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ConsoleSpanExporter, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

// This registers all instrumentation packages
registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations()
  ],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new NodeTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< tab JavaScript >}}
/* tracing.js */

// Require dependencies
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { ConsoleSpanExporter, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// This registers all instrumentation packages
registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations()
  ],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new NodeTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

<!-- textlint-enable -->

If you don't wish to use a metapackage, perhaps to decrease your dependency
graph size, you can install and register individual instrumentation packages.

For example, here's how you can install and register only the
[instrumentation-express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
and
[instrumentation-http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
packages to instrument inbound and outbound HTTP traffic.

```shell
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

And then register each instrumentation library:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/* tracing.ts */

// Import dependencies
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import opentelemetry from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ConsoleSpanExporter, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

// This registers all instrumentation packages
registerInstrumentations({
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new NodeTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< tab JavaScript >}}
/* tracing.js */

// Require dependencies
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { ConsoleSpanExporter, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// This registers all instrumentation packages
registerInstrumentations({
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new NodeTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Configuation

Some instrumentation libraries offer additional configuration options.

For example,
[Express instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express#express-instrumentation-options)
offers ways to ignore speciied middleware or enrich spans created automatically
with a request hook.

You'll need to refer to each instrumentation library's documentation for
advanced configuration.

### Available instrumentation libraries

You can find a list of available instrumentation in the
[registry](/ecosystem/registry/?language=js&component=instrumentation).

## Instrument a library natively

## Create an instrumetation library
