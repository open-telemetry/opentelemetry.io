---
title: React Native App
cSpell:ignore: typeof
---

The React Native app provides a mobile UI for users on Android and iOS devices
to interact with the demo's services. It is built with Expo and uses Expo's
file-based routing to layout the screens for the app.

[React Native app source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/reactnativeapp/)

## Instrumentation

The application uses the OpenTelemetry packages to instrument the application at
the JS layer

> **NOTE:** The JS OTel packages are supported for node and web environments.
> While they work for React Native as well they are not currently explicitly
> supported for that environment and may break compatibility with minor version
> updates or require workarounds. Building more support for React Native is an
> area of active development.

The main entry point for the application is `app/_layout.tsx` where a hook is
used to initialize the instrumentation and make sure it is loaded before
displaying the UI:

```typescript
import { useTracer } from '@/hooks/useTracer';

const { loaded: tracerLoaded } = useTracer();
```

`hooks/useTracer.ts` contains all the code for setting up instrumentation
including initializing a TracerProvider, establishing an OTLP export,
registering trace context propagators, and registering auto-instrumentation of
network requests.

[Instrumentation source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/reactnativeapp/hooks/useTracer.ts)
