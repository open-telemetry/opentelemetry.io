---
title: Web
description: >-
  Use OpenTelemetry in apps running on web browsers
---

OpenTelemetry Browser provides an SDK and instrumentation for web applications.
It collects browser events as log records and network requests as spans, so you
can investigate what happens in your application from the browser's perspective.

> [!WARNING]
>
> The Browser SDK and instrumentations are experimental. Releases can include
> breaking changes. The examples below use `@opentelemetry/browser-sdk` 0.5.0
> and `@opentelemetry/browser-instrumentation` 0.8.2.

## Features

- Collect navigation and resource timing, user actions, errors, console events,
  and Web Vitals using individual instrumentation modules.
- Trace fetch and XMLHttpRequest requests.
- Export logs and traces over OTLP/HTTP.
- Correlate telemetry with configurable sessions.

The Browser SDK supports logs and traces. It does not currently provide a
metrics SDK.

## Getting started

Use a bundler that supports ECMAScript modules. Run the initialization code in
the browser, before your application or other libraries modify browser APIs.

### Install packages

```sh
npm install @opentelemetry/browser-sdk@0.5.0 @opentelemetry/browser-instrumentation@0.8.2 @opentelemetry/api@^1.9.1
```

### Initialize the SDK

Create an initialization module and import it from your application's browser
entry point:

```javascript
import { quickStartBrowserSdk } from '@opentelemetry/browser-sdk';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { FetchInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/fetch';

const sdk = quickStartBrowserSdk({
  serviceName: 'my-web-app',
  serviceVersion: '1.0.0',
  exportUrl: 'http://localhost:4318',
  instrumentations: [
    new NavigationTimingInstrumentation(),
    new FetchInstrumentation(),
  ],
});
```

This example collects navigation timing as log records and fetch requests as
spans. The SDK sends them to `/v1/logs` and `/v1/traces` under `exportUrl`.
Replace the local address with your OTLP/HTTP endpoint when deploying.

Configure the receiver to accept requests from your application's origin using
CORS. An HTTPS application also needs an HTTPS telemetry endpoint. See
[Exporter configuration](/docs/languages/js/exporters/#configure-cors-headers). Any
headers configured in browser code are visible to users, so do not include
private credentials in the application bundle.

## Configuration

`quickStartBrowserSdk` configures both logs and traces. Its options include:

| Option             | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `serviceName`      | Name of the application producing telemetry. |
| `serviceVersion`   | Version of the application.                  |
| `exportUrl`        | Base OTLP/HTTP endpoint for logs and traces. |
| `exportHeaders`    | Headers to include with export requests.     |
| `instrumentations` | Instrumentation instances to register.       |
| `disabled`         | Disable SDK initialization.                  |
| `logLevel`         | Diagnostic logging level.                    |

In SDK 0.5.0, setting `logLevel` to `DEBUG` switches the quick-start exporters
to console output instead of OTLP. Leave it unset to use the default `INFO`
level and export to your receiver.

For custom resources, processors, exporters, or configuration per signal, use
`startBrowserSdk`. The package also provides separate entry points for logs and
traces. See the [SDK configuration reference][sdk].

Cross-origin trace propagation is configured separately from exporter CORS. Set
`propagateTraceHeaderCorsUrls` on fetch instrumentation for the destinations
that should receive trace context, and configure those servers to allow the
trace headers. See the [instrumentation reference][instrumentation] for the
available modules and their options.

## Sessions

Sessions correlate spans and log records over a period of activity. Session
support is available through `@opentelemetry/browser-sdk/session`, and requires
configuring a session manager and processors. Calling `quickStartBrowserSdk`
alone does not configure sessions.

The local-storage session store persists the session across page loads and is
shared across tabs on the same origin. The session manager accepts a maximum
duration and an inactivity timeout in seconds. These timeouts have no defaults.
Activity is measured through session processor access, rather than raw clicks or
mouse movement. A session identifier is for correlation, not authentication.

Follow the [session management guide][sessions] to initialize the manager and
register session processors before export processors. When using custom
processors with `startBrowserSdk`, configure export for each signal as shown in
that guide.

## Resources

- [OpenTelemetry Browser repository][browser]
- [Browser SDK configuration][sdk]
- [Browser instrumentation reference][instrumentation]
- [Session management guide][sessions]
- [Browser roadmap][roadmap]

[browser]: https://github.com/open-telemetry/opentelemetry-browser
[sdk]:
  https://github.com/open-telemetry/opentelemetry-browser/blob/main/packages/sdk/README.md
[instrumentation]:
  https://github.com/open-telemetry/opentelemetry-browser/blob/main/packages/instrumentation/README.md
[sessions]:
  https://github.com/open-telemetry/opentelemetry-browser/blob/main/docs/session-management.md
[roadmap]:
  https://github.com/open-telemetry/opentelemetry-browser/blob/main/docs/roadmap.md
