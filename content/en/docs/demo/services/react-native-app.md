---
title: React Native App
---

The React Native app provides a mobile UI for users on Android and iOS devices
to interact with the demo's services. It is built with
[Expo](https://docs.expo.dev/get-started/introduction/) and uses Expo's
file-based routing to layout the screens for the app.

[React Native app source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/react-native-app/)

## Instrumentation

The application uses the OpenTelemetry packages to instrument the application at
the JS layer.

{{% alert title="Important" color="warning" %}}

The JS OTel packages are supported for node and web environments. While they
work for React Native as well, they are not explicitly supported for that
environment, where they might break compatibility with minor version updates or
require workarounds. Building JS OTel package support for React Native is an
area of active development.

{{% /alert %}}

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

```typescript
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_DEVICE_ID,
  ATTR_OS_NAME,
  ATTR_OS_VERSION,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions/incubating';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import getLocalhost from '@/utils/Localhost';
import { useEffect, useState } from 'react';
import {
  getDeviceId,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info';
import { Platform } from 'react-native';
import { SessionIdProcessor } from '@/utils/SessionIdProcessor';

const Tracer = async () => {
  const localhost = await getLocalhost();

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: 'react-native-app',
    [ATTR_OS_NAME]: Platform.OS,
    [ATTR_OS_VERSION]: getSystemVersion(),
    [ATTR_SERVICE_VERSION]: getVersion(),
    [ATTR_DEVICE_ID]: getDeviceId(),
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `http://${localhost}:${process.env.EXPO_PUBLIC_FRONTEND_PROXY_PORT}/otlp-http/v1/traces`,
        }),
        {
          scheduledDelayMillis: 500,
        },
      ),
      new SessionIdProcessor(),
    ],
  });

  provider.register({
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    instrumentations: [
      // Some tiptoeing required here, propagateTraceHeaderCorsUrls is required to make the instrumentation
      // work in the context of a mobile app even though we are not making CORS requests. `clearTimingResources` must
      // be turned off to avoid using the web-only Performance API
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: false,
      }),

      // The React Native implementation of fetch is simply a polyfill on top of XMLHttpRequest:
      // https://github.com/facebook/react-native/blob/7ccc5934d0f341f9bc8157f18913a7b340f5db2d/packages/react-native/Libraries/Network/fetch.js#L17
      // Because of this when making requests using `fetch` there will an additional span created for the underlying
      // request made with XMLHttpRequest. Since in this demo calls to /api/ are made using fetch, turn off
      // instrumentation for that path to avoid the extra spans.
      new XMLHttpRequestInstrumentation({
        ignoreUrls: [/\/api\/.*/],
      }),
    ],
  });
};

export interface TracerResult {
  loaded: boolean;
}

export const useTracer = (): TracerResult => {
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!loaded) {
      Tracer()
        .catch(() => console.warn('failed to setup tracer'))
        .finally(() => setLoaded(true));
    }
  }, [loaded]);

  return {
    loaded,
  };
};
```
