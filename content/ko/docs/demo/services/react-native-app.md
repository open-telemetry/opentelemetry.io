---
title: 리액트 네이티브 앱
default_lang_commit: 20b4338daf3d7360b8446c657d809fb8b25f9a10
---

리액트 네이티브(React Native) 앱은 안드로이드 및 iOS 기기 사용자가 데모 서비스와
상호작용할 수 있는 모바일 UI를 제공한다.
[엑스포(Expo)](https://docs.expo.dev/get-started/create-a-project/)로
만들었으며, 엑스포의 파일 기반 라우팅을 사용하여 앱 화면을 구성한다.

[리액트 네이티브 앱 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/react-native-app/)

## 계측 {#instrumentation}

이 애플리케이션은 오픈텔레메트리(OpenTelemetry) 패키지를 사용하여 JS 계층에서
애플리케이션을 계측한다.

> [!CAUTION]
>
> JS OTel 패키지는 Node 및 웹 환경을 지원한다. 리액트 네이티브에서도 동작하지만,
> 해당 환경을 명시적으로 지원하지는 않으므로 마이너 버전 업데이트로 호환성이
> 깨지거나 우회 방법이 필요할 수 있다. 리액트 네이티브를 위한 JS OTel 패키지
> 지원은 활발히 개발 중에 있다.

애플리케이션의 주 진입점은 `app/_layout.tsx`이며, 여기서는 훅을 사용하여 계측을
초기화하고 UI를 표시하기 전에 계측을 로드했는지 확인한다.

```typescript
import { useTracer } from '@/hooks/useTracer';

const { loaded: tracerLoaded } = useTracer();
```

`hooks/useTracer.ts`에는 트레이서 프로바이더 초기화, OTLP 내보내기 설정,
트레이스 컨텍스트 전파자 등록, 네트워크 요청의 자동 계측 등록을 포함하여 계측을
설정하는 데 필요한 모든 코드가 포함되어 있다.

```typescript
import { trace, context, propagation } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  BatchSpanProcessor,
  TracerProvider,
  StackContextManager,
} from '@opentelemetry/sdk-trace';
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

  const provider = new TracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor({
        exporter: new OTLPTraceExporter({
          url: `http://${localhost}:${process.env.EXPO_PUBLIC_FRONTEND_PROXY_PORT}/otlp-http/v1/traces`,
        }),
        scheduledDelayMillis: 500,
      }),
      new SessionIdProcessor(),
    ],
  });

  context.setGlobalContextManager(new StackContextManager().enable());
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  );
  trace.setGlobalTracerProvider(provider);

  registerInstrumentations({
    instrumentations: [
      // 여기서는 주의가 필요하다. CORS 요청을 보내지 않더라도 모바일 앱 환경에서 계측이
      // 동작하려면 propagateTraceHeaderCorsUrls가 필요하다. 웹 전용 Performance API를
      // 사용하지 않도록 `clearTimingResources`를 비활성화해야 한다.
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: false,
      }),

      // 리액트 네이티브의 fetch 구현은 단순히 XMLHttpRequest를 기반으로 한 폴리필이다.
      // https://github.com/facebook/react-native/blob/7ccc5934d0f341f9bc8157f18913a7b340f5db2d/packages/react-native/Libraries/Network/fetch.js#L17
      // 따라서 `fetch`로 요청을 보내면 내부적으로 XMLHttpRequest로 보내는 요청에 대한
      // 스팬이 추가로 생성된다. 이 데모에서는 fetch로 /api/를 호출하므로, 추가 스팬이
      // 생성되지 않도록 해당 경로의 계측을 비활성화한다.
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
