---
title: React Native アプリ
default_lang_commit: a44df6dd383b504864f60165b21459b7f5e005c5
---

React Native アプリは、Android および iOS デバイスのユーザーがデモのサービスと対話するためのモバイル UI を提供します。
[Expo](https://docs.expo.dev/get-started/create-a-project/) で構築されており、Expo のファイルベースのルーティングを使用してアプリの画面をレイアウトしています。

[React Native アプリのソース](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/react-native-app/)

## 計装 {#instrumentation}

アプリケーションは OpenTelemetry パッケージを使用して、JS レイヤーで計装を行っています。

> [!CAUTION]
>
> JS OTel パッケージは Node およびウェブ環境向けにサポートされています。
> React Native でも動作しますが、その環境は明示的にはサポートされていません。
> マイナーバージョンの更新で互換性が失われたり、ワークアラウンドが必要になったりする可能性があります。
> React Native 向けの JS OTel パッケージサポートの構築は、現在活発に開発が進められている領域です。

アプリケーションのメインエントリーポイントは `app/_layout.tsx` で、フックを使用して計装を初期化し、UI を表示する前にロードが完了していることを確認しています。

```typescript
import { useTracer } from '@/hooks/useTracer';

const { loaded: tracerLoaded } = useTracer();
```

`hooks/useTracer.ts` には、TracerProvider の初期化、OTLP エクスポートの確立、トレースコンテキスト伝搬の登録、ネットワークリクエストの自動計装の登録など、計装のセットアップに必要なすべてのコードが含まれています。

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
      // ここでは少し注意が必要で、propagateTraceHeaderCorsUrls はモバイルアプリのコンテキストで計装を
      // 動作させるために必要です（実際には CORS リクエストを行っていないにもかかわらず）。
      // `clearTimingResources` はウェブ専用の Performance API の使用を避けるためにオフにする必要があります
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: false,
      }),

      // React Native の fetch 実装は単に XMLHttpRequest 上のポリフィルです:
      // https://github.com/facebook/react-native/blob/7ccc5934d0f341f9bc8157f18913a7b340f5db2d/packages/react-native/Libraries/Network/fetch.js#L17
      // このため、`fetch` を使用してリクエストを行うと、基盤となる
      // XMLHttpRequest で行われるリクエストに対して追加のスパンが作成されます。
      // このデモでは /api/ へのリクエストは fetch を使って行われるため、
      // 余分なスパンを避けるためにそのパスの計装をオフにしています。
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
