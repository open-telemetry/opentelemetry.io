---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
description: How to instrument libraries an app depends on
spelling: cSpell:ignore autoinstrumentation metapackage metapackages
---

When you develop an app, you make use of 3rd party libraries and frameworks, to
accelerate your work and to not reinvent the wheel. If you now instrument your
app with OpenTelemetry, you don't want to spend additional time on manually
adding traces, logs and metrics to those libraries and frameworks. Gladly, you
don't have to reinvent the wheel for those either: libraries might come with
OpenTelemetry support natively or you can use an
[Instrumentation Library](/docs/concepts/instrumentation/libraries/) in order to
generate telemetry data for a library or framework.

If you are instrumenting an app, you can learn on this page how to make use of
natively instrumented libraries and Instrumentation Libraries for your
dependencies.

If you want to instrument a library, you can learn on this page what you need
to do to natively instrument your own library or how you can create an
Instrumentation Library for a 3rd party library if none is available.

## Use natively instrumented libraries

If a library comes with OpenTelemetry out of the box, you get the traces,
metrics and logs emitted from that library, by adding and setting up the
OpenTelemetry SDK with your app.

The library may provide some additional configuration for the instrumentation.
Go to the documentation of that library to learn more.

{{% alert title="Help wanted" color="warning" %}}

As of today, we don't know about any JavaScript library that has OpenTelemetry
natively integrated. If you know about such a library,
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

Each instrumentation library is an NPM package. For example, here’s how you can
install the
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
your libraries with minimal effort:

<!-- prettier-ignore-start -->
{{< tabpane lang=shell persist=false >}}
{{< tab Node.js >}}
npm install --save @opentelemetry/auto-instrumentations-node
{{< /tab>}}

{{< tab Browser >}}
npm install --save @opentelemetry/auto-instrumentations-web
{{< /tab >}}
{{< /tabpane>}}
<!-- prettier-ignore-end -->

Note, that using those metapackages increases your dependency graph size. Use
individual instrumentation packages, if you know exactly which ones you need.

### Registration

After installing the instrumentation libraries you need, you can register them
with the OpenTelemetry SDK for Node.js. If you followed the
[Getting Started](/docs/instrumentation/js/getting-started/nodejs/) you already
use the metapackages. If you followed the instructions
[to initialize the SDK for manual instrumentation](/docs/instrumentation/js/manual/#initialize-tracing),
update your `instrumentation.ts` (or `instrumentation.js`) as follows:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()

{{< /tab >}}

{{< tab JavaScript >}}
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // This registers all instrumentation packages
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

To only load individual instrumentation libraries, replace
`[getNodeAutoInstrumentations()]` with the list of those you need:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*instrumentation.ts*/
...
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});

sdk.start()

{{< /tab >}}

{{< tab JavaScript >}}
/*instrumentation.js*/
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");

const sdk = new NodeSDK({
  ...
  // This registers all instrumentation packages
  instrumentations: [getNodeAutoInstrumentations()]
});
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

### Configuration

Some instrumentation libraries offer additional configuration options.

For example,
[Express instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express#express-instrumentation-options)
offers ways to ignore specified middleware or enrich spans created automatically
with a request hook:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
import { ExpressInstrumentation, ExpressLayerType } from "@opentelemetry/instrumentation-express"

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (
    span: Span,
    info: ExpressRequestInfo,
  ) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(
        [SemanticAttributes.HTTP_METHOD],
        info.request.method
      );
      span.setAttribute(
        [SemanticAttributes.HTTP_URL],
        info.request.baseUrl
      );
    }
  }
});
{{< /tab >}}

{{< tab JavaScript >}}
/*instrumentation.js*/
const { SemanticAttributes } = require("@opentelemetry/semantic-conventions");
const { ExpressInstrumentation, ExpressLayerType } = require("@opentelemetry/instrumentation-express");

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (
    span,
    info,
  ) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(
        [SemanticAttributes.HTTP_METHOD],
        info.request.method
      );
      span.setAttribute(
        [SemanticAttributes.HTTP_URL],
        info.request.baseUrl
      );
    }
  }
});
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

You'll need to refer to each instrumentation library's documentation for
advanced configuration.

### Available instrumentation libraries

You can find a list of available instrumentation in the
[registry](/ecosystem/registry/?language=js&component=instrumentation).

## Instrument a library natively

If you want to add native instrumentation to your library, you should review the
following documentation:

- The concept page [Libraries](/docs/concepts/instrumentation/libraries/)
  provides you with insights on when to instrument and what to instrument
- The [manual instrumentation](/docs/instrumentation/js/manual/) provides you
  with the required code examples to create traces, metrics and logs for your
  library
- The
  [Instrumentation Implementation Guide](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)
  for Node.js and browser contains JavaScript specific best practices for
  creating library instrumentation.

## Create an instrumentation library

While having out of the box observability for an application is the preferred
way, this is not always possible or desired. In those cases, you can create an
instrumentation library, which would inject instrumentation calls, using
mechanisms such as wrapping interfaces, subscribing to library-specific
callbacks, or translating existing telemetry into the OpenTelemetry model.

To create such a library follow the
[Instrumentation Implementation Guide](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)
for Node.js and browser.
