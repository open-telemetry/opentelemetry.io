---
title: 프론트엔드
default_lang_commit: c0af68cd6d2581f6931827e168820e44c42e222e
cSpell:ignore: typeof
---

프론트엔드는 사용자에게 UI를 제공할 뿐만 아니라, UI나 다른 클라이언트가 사용하는
API를 제공하는 역할을 한다. 이 애플리케이션은 [Next.JS](https://nextjs.org/)를
기반으로 리액트(React) 웹 UI와 API 라우트를 제공한다.

[프론트엔드 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend/)

## 서버 계측 {#server-instrumentation}

Node.js 애플리케이션을 시작할 때 필요 노드 모듈을 미리 불러와 SDK와 자동 계측을
초기화하는 것을 권장한다. 오픈텔레메트리(OpenTelemetry) Node.js SDK를 초기화할
때 사용할 자동 계측 라이브러리를 선택적으로 지정하거나, 널리 사용되는 프레임워크
대부분을 포함하는 `getNodeAutoInstrumentations()` 함수를 사용할 수 있다.
`utils/telemetry/Instrumentation.js` 파일에는 OTLP 내보내기, 리소스 속성, 서비스
이름에 대한 표준
[오픈텔레메트리 환경 변수](/docs/specs/otel/configuration/sdk-environment-variables/)를
기반으로 SDK와 자동 계측을 초기화하는 데 필요한 모든 코드가 포함되어 있다.

```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
// ... other require() calls elided for brevity.

const sdk = new NodeSDK({
  instrumentations: getNodeAutoInstrumentations(),
  spanProcessors: [
    new BatchSpanProcessor({ exporter: new OTLPTraceExporter() }),
  ],
  logRecordProcessors: [
    new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() }),
  ],
  metricReaders: [
    new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
  ],
  resourceDetectors: [
    containerDetector,
    envDetector,
    hostDetector,
    osDetector,
    processDetector,
    alibabaCloudEcsDetector,
    awsEksDetector,
    awsEc2Detector,
    gcpDetector,
  ],
});

sdk.start();
```

Node.js에서 필요한 모듈은 `--require` 명령줄 인수를 사용하여 로드된다.
`package.json`의 `scripts.start` 섹션에 이를 지정하고 `npm start`로
애플리케이션을 시작하면 된다.

```json
"scripts": {
  "start": "node --require ./Instrumentation.js server.js",
},
```

## 트레이스 {#traces}

### 스팬 예외 및 상태 {#span-exceptions-and-status}

스팬 객체의 `recordException` 함수를 사용하여 처리된 오류의 전체 스택 트레이스를
포함하는 스팬 이벤트를 생성할 수 있다. 예외를 기록할 때는 스팬의 상태도 그에
맞게 설정해야 한다. `utils/telemetry/InstrumentationMiddleware.ts` 파일에 있는
`NextApiHandler` 함수의 catch 블록에서 이를 확인할 수 있다.

```typescript
span.recordException(error as Exception);
span.setStatus({ code: SpanStatusCode.ERROR });
```

### 새 스팬 생성하기 {#create-new-spans}

`Tracer.startSpan("spanName", options)`를 사용하여 새 스팬을 생성하고 시작할 수
있다. 여러 옵션으로 스팬 생성 방식을 지정할 수 있다.

- `root: true`는 이 스팬을 루트로 설정하여 새 트레이스를 생성한다.
- `links`는 참조해야 하는 다른 스팬(다른 트레이스에 있는 스팬도 포함)과의 링크를
  지정하는 데 사용된다.
- `attributes`는 스팬에 추가되는 키/값 쌍으로, 일반적으로 애플리케이션
  컨텍스트에 사용된다.

```typescript
span = tracer.startSpan(`${method}`, {
  root: true,
  kind: SpanKind.SERVER,
  links: [{ context: syntheticSpan.spanContext() }],
  attributes: {
    'demo.synthetic_request': true,
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode,
    [ATTR_HTTP_REQUEST_METHOD]: method,
    [ATTR_USER_AGENT_ORIGINAL]: headers['user-agent'] || '',
    [ATTR_URL_PATH]: target,
    [ATTR_URL_FULL]: `${headers.host}${url}`,
    [ATTR_NETWORK_PROTOCOL_VERSION]: httpVersion,
  },
});
```

## 브라우저 계측 {#browser-instrumentation}

프론트엔드가 제공하는 웹 UI도 웹 브라우저용으로 계측된다. 오픈텔레메트리 계측은
`pages/_app.tsx`에 있는 Next.js App 컴포넌트의 일부로 포함된다. 여기서 계측을
임포트하고 초기화한다.

```typescript
import FrontendTracer from '../utils/telemetry/FrontendTracer';

if (typeof window !== 'undefined') FrontendTracer();
```

`utils/telemetry/FrontendTracer.ts` 파일에는 `TracerProvider`를 초기화하고, OTLP
내보내기를 설정하며, `context`, `propagation`, `trace` API를 통해 컨텍스트
매니저와 트레이스 컨텍스트 전파자를 전역으로 등록하고, 웹 전용 자동 계측
라이브러리를 등록하는 코드가 포함되어 있다. 브라우저가 데이터를 보낼
오픈텔레메트리 컬렉터는 별도의 도메인에 있을 가능성이 높으므로, CORS 헤더도 이에
맞게 설정한다.

백엔드 서비스로 `synthetic_request` 속성 플래그를 전달하기 위한 변경의 일환으로,
`instrumentation-fetch` 라이브러리의 사용자 정의 스팬 속성 로직에
`applyCustomAttributesOnSpan` 설정 함수를 추가하여 모든 브라우저 측 스팬이 이
플래그를 포함하도록 했다.

```typescript
import { context, propagation, trace } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { BatchSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import {
  defaultResource,
  resourceFromAttributes,
  detectResources,
} from '@opentelemetry/resources';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SessionIdProcessor } from './SessionIdProcessor';

const {
  NEXT_PUBLIC_OTEL_SERVICE_NAME = '',
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  IS_SYNTHETIC_REQUEST = '',
} = typeof window !== 'undefined' ? window.ENV : {};

const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  let resource = defaultResource()
    .merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
      }),
    )
    .merge(detectResources({ detectors: [browserDetector] }));

  const tracerProvider = new TracerProvider({
    resource,
    spanProcessors: [
      new SessionIdProcessor(),
      new BatchSpanProcessor({
        exporter: new OTLPTraceExporter({
          url:
            NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
            'http://localhost:4318/v1/traces',
        }),
        scheduledDelayMillis: 500,
      }),
    ],
  });

  context.setGlobalContextManager(new ZoneContextManager().enable());
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  );
  trace.setGlobalTracerProvider(tracerProvider);

  registerInstrumentations({
    tracerProvider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('demo.synthetic_request', IS_SYNTHETIC_REQUEST);
          },
        },
      }),
    ],
  });
};

export default FrontendTracer;
```

## 메트릭 {#metrics}

추후 작성 예정

## 로그 {#logs}

추후 작성 예정

## 배기지(Baggage) {#baggage}

프론트엔드에서는 오픈텔레메트리 배기지를 사용하여 요청이 합성 요청(부하
생성기에서 보낸 요청)인지 확인한다. 합성 요청은 새 트레이스를 반드시 생성하도록
한다. 새 트레이스의 루트 스팬에는 HTTP 요청을 계측한 스팬과 동일한 속성이 다수
포함된다.

배기지 항목이 설정되어 있는지 확인하려면 `propagation` API를 사용하여 배기지
헤더를 파싱하고, `baggage` API를 사용하여 항목을 가져오거나 설정할 수 있다.

```typescript
const baggage = propagation.getBaggage(context.active());
if (baggage?.getEntry("synthetic_request")?.value == "true") {...}
```
