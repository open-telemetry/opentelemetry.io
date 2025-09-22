---
title: Aplicativo React Native
---

O aplicativo React Native fornece uma interface móvel para usuários em dispositivos Android e iOS
interagirem com os serviços do demo. Ele é construído com
[Expo](https://docs.expo.dev/get-started/introduction/) e usa o roteamento baseado em arquivos do Expo
para layout das telas do aplicativo.

[Código fonte do aplicativo React Native](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/react-native-app/)

## Instrumentação

A aplicação usa os pacotes OpenTelemetry para instrumentar a aplicação na
camada JS.

{{% alert title="Importante" color="warning" %}}

Os pacotes JS OTel são suportados para ambientes node e web. Embora eles
funcionem para React Native também, eles não são explicitamente suportados para esse
ambiente, onde podem quebrar compatibilidade com atualizações de versão menor ou
requerer soluções alternativas. Construir suporte de pacotes JS OTel para React Native é uma
área de desenvolvimento ativo.

{{% /alert %}}

O ponto de entrada principal para a aplicação é `app/_layout.tsx` onde um hook é
usado para inicializar a instrumentação e garantir que ela seja carregada antes de
exibir a interface:

```typescript
import { useTracer } from '@/hooks/useTracer';

const { loaded: tracerLoaded } = useTracer();
```

`hooks/useTracer.ts` contém todo o código para configurar instrumentação
incluindo inicializar um TracerProvider, estabelecer uma exportação OTLP,
registrar propagadores de contexto de trace, e registrar auto-instrumentação de
requisições de rede.

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
import { resourceFromAttributes } from '@opentelemetry/resources';
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

  const resource = resourceFromAttributes({
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
