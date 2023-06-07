---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
spelling: cSpell:ignore autoinstrumentation metapackage
---

You can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
in order to generate telemetry data for a library or framework.

For example,
[the instrumentation library for Express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
will automatically create [spans](/docs/concepts/signals/traces/#spans) based on
the inbound HTTP requests.

## Setup

Each instrumentation library is an NPM package, and installation is typically
done like so:

```console
npm install <name-of-package>
```

It is typically then registered at application startup time, such as when
creating a [TracerProvider](/docs/concepts/signals/traces/#tracer-provider).

## Node.js

### Node autoinstrumentation package

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

### Using individual instrumentation packages

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

## Configuring instrumentation libraries

Some instrumentation libraries offer additional configuration options.

For example,
[Express instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express#express-instrumentation-options)
offers ways to ignore specified middleware or enrich spans created automatically
with a request hook.

You'll need to refer to each instrumentation library's documentation for
advanced configuration.

## Available instrumentation libraries

A full list of instrumentation libraries produced by OpenTelemetry is available
from the
[opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib)
repository.

You can also find more instrumentations available in the
[registry](/ecosystem/registry/?language=js&component=instrumentation).

## Next steps

After you have set up instrumentation libraries, you may want to add
[manual instrumentation](/docs/instrumentation/js/manual) to collect custom
telemetry data.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/js/exporters) to one or more
telemetry backends.
