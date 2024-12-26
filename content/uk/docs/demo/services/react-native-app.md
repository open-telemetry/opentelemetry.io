---
title: Застосунок React Native
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Застосунок React Native надає мобільний інтерфейс для користувачів на пристроях Android та iOS для взаємодії з демонстраційними сервісами. Він створений за допомогою [Expo](https://docs.expo.dev/get-started/introduction/) і використовує файлову маршрутизацію Expo для компонування екранів застосунку.

[Сирці застосунку React Native](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/react-native-app/)

## Інструментування {#instrumentation}

Застосунок використовує пакети OpenTelemetry для інструменталізації застосунку на рівні JS.

> [!CAUTION]
>
> Пакети JS OTel підтримуються для середовищ Node та Web. Хоча вони працюють і для React Native, вони не підтримуються явно для цього середовища, де вони можуть порушити сумісність з незначними оновленнями версій або вимагати обхідних шляхів. Створення підтримки пакету JS OTel для React Native знаходиться в стадії активної розробки.

Основною точкою входу для програми є `app/_layout.tsx`, де використовується хук для ініціалізації інструменталізації та перевірки того, що вона завантажена перед показом інтерфейсу користувача:

```typescript
import { useTracer } from '@/hooks/useTracer';

const { loaded: tracerLoaded } = useTracer();
```

Файл `hooks/useTracer.ts` містить весь код для налаштування інструменталізації, включаючи ініціалізацію TracerProvider, створення експорту OTLP, реєстрацію поширювачів контексту трасування та реєстрацію автоінструменталізації мережевих запитів.

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

  const resource = new resourceFromAttributes({
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
      // Тут потрібно трохи походити навшпиньки, propagateTraceHeaderCorsUrls потрібен для того, щоб змусити інструменталізацію
      // працювати в контексті мобільного застосунку, навіть якщо ми не робимо CORS-запитів. `clearTimingResources` має бути
      // бути вимкненим, щоб уникнути використання лише веб-версії Performance API
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: false,
      }),

      // Реалізація fetch у React Native - це просто поліфіл поверх XMLHttpRequest:
      // https://github.com/facebook/react-native/blob/7ccc5934d0f341f9bc8157f18913a7b340f5db2d/packages/react-native/Libraries/Network/fetch.js#L17
      // Через це при виконанні запитів з використанням `fetch` буде створено додатковий відрізок для базового
      // запиту, зробленого за допомогою XMLHttpRequest. Оскільки у цій демонстрації виклики до /api/ виконуються за допомогою fetch, вимкніть
      // інструментарій для цього шляху, щоб уникнути створення зайвих відрізків.
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
