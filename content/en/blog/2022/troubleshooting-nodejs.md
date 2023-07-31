---
title: Checklist for TroublesShooting OpenTelemetry Node.js Tracing Issues
linkTitle: TroublesShooting Node.js Tracing Issues
date: 2022-02-22
canonical_url: https://www.aspecto.io/blog/checklist-for-troubleshooting-opentelemetry-nodejs-tracing-issues
author: '[Amir Blum](https://github.com/blumamir) (Aspecto)'
cSpell:ignore: bootcamp Parentfor Preconfigured
---

I’ll try to make this one short and to the point. You are probably here because
you installed OpenTelemetry in your Node.js application and did not see any
traces or some expected spans were missing.

There can be many reasons for that, but some are more common than others. In
this post, I will try to enumerate the common ones, along with some diagnostic
methods and tips.

## Requirements

I assume that you already have basic knowledge of what OpenTelemetry is and how
it works and that you tried to set it up in your Node.js application.

### Enable Logging

OpenTelemetry JS will by default not log anything to its diagnostic logger. Most
of the SDK issues below are easily detected when a logger is enabled.

You can log everything to the console by adding the following code as early as
possible in your service:

```js
// tracing.ts or main index.ts
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
// rest of your otel initialization code
```

This is useful for debugging. Logging everything to the console in production is
not a good idea, so remember to remove or disable it when your issues are
resolved.

Pro tip: You can use the `OTEL_LOG_LEVEL` environment variable to set
`DiagLogLevel` so we can easily turn it off and on.

## Auto Instrumentation Libraries

Many users choose to use auto Instrumentation libraries, which automatically
create spans for interesting operations in popular and widely used packages (DB
drivers, HTTP frameworks, cloud services SDKs, etc)

Some initialization patterns and configuration options can cause your service to
fail to create spans, to begin with.

To rule out auto instrumentation libraries issues, try to create a manual span
first. If you see manual spans but not spans from the installed auto
instrumentation libraries, continue reading this section.

```js
import { trace } from '@opentelemetry/api';
trace
  .getTracerProvider()
  .getTracer('debug')
  .startSpan('test manual span')
  .end();
```

### Install and Enable

To use an auto instrumentation library in your service, you’ll need to:

1. Install it: `npm install @opentelemetry/instrumentation-foo`. You can search
   the OpenTelemetry Registry to find available instrumentations
2. Create the instrumentation object: `new FooInstrumentation(config)`
3. Make sure instrumentation is enabled: call `registerInstrumentations(...)`
4. Verify you are using the right TracerProvider

For most users, the following should cover it:

```js
// First run: npm install @opentelemetry/instrumentation-foo @opentelemetry/instrumentation-bar
// Replace foo and bar with the actual packages you need to instrument (HTTP/mySQL/Redis etc)
import { FooInstrumentation } from '@opentelemetry/instrumentation-foo';
import { BarInstrumentation } from '@opentelemetry/instrumentation-bar';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
// create TracerProvider, SpanProcessors and SpanExporters
registerInstrumentations({
  instrumentations: [new FooInstrumentation(), new BarInstrumentation()],
});
```

For advanced users who choose to use the low-level API instead of calling
`registerInstrumentations`, make sure your instrumentation is set to use the
right tracer provider and that you call `enable()` if appropriate.

### Enable Before Require

All instrumentations are designed such that you first need to enable them and
only then require the instrumented package. **A common mistake is to require
packages before enabling the instrumentation libraries for them**.

Here is a **bad** example:

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import http from 'http'; // ⇐ BAD - at this point instrumentation is not registered yet
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
registerInstrumentations({ instrumentations: [new HttpInstrumentation()] });
// your application code which uses http
```

In most cases, the instrumentation code resides in a different file or package
than the application code, which makes it tricky to discover. Some frameworks,
such as serverless, can import packages before the instrumentation code has a
chance to run. This can be easily missed.

To diagnose this issue, enable logging and verify you are seeing your
instrumentation package being loaded. For example:

```nocode
@opentelemetry/instrumentation-http Applying patch for https@12.22.9
```

If missing, chances are your auto instrumentation library is not being applied.

### Library Configuration

Some auto instrumentation libraries include a custom configuration that controls
when **instrumentation is skipped**. For example, HTTP instrumentation has
options such as `ignoreIncomingRequestHook` and `requireParentforOutgoingSpans`

In specific cases, some libraries are **not instrumenting by default**, and you
have to specifically opt-in to get spans. For example, `ioredis` instrumentation
should be configured with `requireParentSpan = true` to create spans for
internal operation with no parent span.

If you don’t see spans for a library, maybe you need to tweak the configuration
to make them appear.

### Instrumented Library Version

Auto instrumentation libraries usually don’t support all versions of the library
they instrument. If the version you are using is too old or very recent, it
might not be supported and thus no spans will be created.

Consult the documentation of the library you are using to verify if your version
is compatible. This data is usually found in the README for the instrumentation,
for example see the [Redis README][].

[Redis readme]:
  https://www.npmjs.com/package/@opentelemetry/instrumentation-redis

## No Recording and Non-Sampled Spans

Not all spans that are created in your application are exported. Spans can be
marked as “Not Sampled” or “Non-Recorded” in which case you will not see them in
your backend.

To rule out these issues, you can hook in a “debug span processor” which only
prints the sampled decision. If “span sampled: false” is printed to the console,
continue reading this section.

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { trace, Span, Context, TraceFlags } from '@opentelemetry/api';
const provider = new NodeTracerProvider();
provider.addSpanProcessor({
  forceFlush: async () => {},
  onStart: (_span: Span, _parentContext: Context) => {},
  onEnd: (span: ReadableSpan) => {
    const sampled = !!(span.spanContext().traceFlags & TraceFlags.SAMPLED);
    console.log(`span sampled: ${sampled}`);
  },
  shutdown: async () => {},
});
provider.register();
```

### NoopTracerProvider

If you don’t create and register a valid TracerProvider, your app will run with
the default TracerProvider which starts all the spans in your app as
NonRecordingSpans.

You need to have code similar to this as early as possible in your application:

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
```

### Remote Sampling Decision

The default sampling behavior (and a very popular one) is that each span
inherits the sampling decision from its parent. If the component that invoked
your service is **configured not to sample**, then you will **not see spans**
from your service as well.

Examples include:

- An API Gateway can be configured with sampling logic or have tracing turned
  off, in which case it can affect all downstream tracing (including your
  innocent service, which needs to be sampled).
- External users, which are calling your service, can also be instrumented and
  derive their own sampling decisions (which you have no control of). These
  sampling decisions are then propagated to your service and affect it.
- Other services in your system can derive sampling decisions based on their
  local needs and viewpoint. It can be easy to configure an upstream service
  endpoint to not sample an uninteresting endpoint without realizing that it
  calls a very interesting and important endpoint downstream (which we do want
  to sample).

### Local Sampler

You can configure your local sampler to sample some spans or none. If the
configuration was written by someone else a long time ago, or if it is complex /
non-intuitive — then spans are justifiably not sampled and exported, which can
be easy to miss.

## Exporting Issues

It is possible that the service is generating spans, but they are not exported
correctly to your backend or are being thrown in the collector for some reason.

To rule out exporting issues, try to add "ConsoleExporter". If you see spans
exported to console but not in the backend you export to, continue reading this
section.

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
```

### Configuring an Exporter

Your service should have span exporting code similar to this:

```js
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// Create TracerProvider
const exporter = new OTLPTraceExporter();
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```

In this example, I used `@opentelemetry/exporter-trace-otlp-proto`, but there
are other exporters to choose from, and each one has a few configuration
options. An error in one of these options will fail to export, which is silently
ignored by default.

A a few common configuration errors are covered in the following subsections.

### OTLP exporters

- **Format** — OTLP supports `http/json`, `http/proto`, and `grpc` formats. You
  need to choose an exporter package that matches the format your OTLP collector
  support.
- **Path** — If you set HTTP collector endpoint (via config in code or
  environment variables), **you must also set the path**:
  `http://my-collector-host:4318/v1/traces`. If you forget the path, the export
  will fail. In gRPC, you must not add path: “grpc://localhost:4317”. This can
  be a bit confusing to get right at first.
- **Secure Connection** — Check if your collector expects a secure or insecure
  connection. In HTTP, this is determined by the URL scheme (`http:` /
  `https:`). In gRPC, the scheme has no effect and the connection security is
  set exclusively by the credentials parameter: `grpc.credentials.createSsl()`,
  `grpc.credentials.createInsecure()`, etc. The default security for both HTTP
  and gRPC is **Insecure**.

### Jaeger Exporter

Jaeger exporter can work in “Agent” mode (over UDP) and “Collector” mode (over
TCP). The logic to decide which one to use is a bit confusing and lacks
documentation. If you pass the `endpoint` parameter in exporter config or set
`OTEL_EXPORTER_JAEGER_ENDPOINT` environment variable, then the exporter will use
“Collector” HTTP sender. Else, it will export in “Agent” mode with UDP sender to
the `host` configured in the `param`, or, `OTEL_EXPORTER_JAEGER_AGENT_HOST` or
`localhost:6832`.

### Setting Vendor Credentials

If you are using a vendor as your tracing backend, you might need to add
additional info such as authentication headers. For example, if you send traces
to Aspecto, you’ll need to add your Aspecto token as an Authorization header,
like this:

```js
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// Create TracerProvider
const exporter = new OTLPTraceExporter({
  url: 'https://otelcol.aspecto.io/v1/trace',
  headers: {
    Authorization: 'YOUR_API_KEY_HERE',
  },
});
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```

If not applied, you will not be able to see any data in your vendor’s account.

### Flush and Shutdown

When your service goes down or your lambda function ends, it is possible that
not all spans are successfully exported to your collector yet. You need to call
the shutdown function on your tracer provider and await the returned promise to
ensure all data has been sent.

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
const provider = new NodeTracerProvider();
provider.register();
// when your you terminate your service, call shutdown on provider:
provider.shutdown();
```

## Package Versions Compatibility

Some issues can be a result of incompatible or old versions of SDK and
instrumentation packages.

### SDK versions

It is recommended to check that your SDKs and API packages are not old and are
compatible with each other. Make sure you don’t have any peer dependency
warnings when you npm install.

### Other APM libraries

OpenTelemetry is not guaranteed to be compatible with other APM libraries that
use monkey patching to do their magic. If you have such a package installed, try
to remove or disable it and check if the problem goes away.

## What’s Next?

### Where to Get Help

If none of the above solved your problems, you can ask for help on the following
channels:

- [CNCF `#otel-js`](https://cloud-native.slack.com/archives/C01NL1GRPQR) Slack
  channel
- [CNCF `#opentelemetry-bootcamp`](https://cloud-native.slack.com/messages/opentelemetry-bootcamp)
  Slack channel
- GitHub
  [discussions page](https://github.com/open-telemetry/opentelemetry-js/discussions)

### Resources

- [Opentelemetry-js GitHub repository](https://github.com/open-telemetry/opentelemetry-js)
- [The OpenTelemetry Bootcamp](https://www.aspecto.io/opentelemetry-bootcamp/)
- [OpenTelemetry docs](/docs/)

### Should I Use a Vendor?

Another alternative is to use a vendor’s distribution of OpenTelemetry. These
distributions can save you time and effort:

- Technical support
- Preconfigured with popular features for common and advanced users
- Up to date with latest OpenTelemetry versions
- Implementing best practices and avoiding the pitfalls mentioned above

For a list of OpenTelemetry vendors, see [Vendors](/ecosystem/vendors/).

_A version of this article was [originally posted][] on the Aspecto blog._

[originally posted]: {{% param canonical_url %}}
