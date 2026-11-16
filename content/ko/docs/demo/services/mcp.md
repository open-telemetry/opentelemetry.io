---
title: MCP 서비스
linkTitle: MCP
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
cSpell:ignore: fastmcp httpx
---

이 서비스는 [모델 컨텍스트 프로토콜](https://modelcontextprotocol.io/)을 통해
쇼핑몰의 기능을 도구로 노출하여, [에이전트 서비스](../agent/)와 다른 MCP 호환
클라이언트가 호출할 수 있도록 한다. 각 도구는 HTTP를 통해 프론트엔드 API를
호출하는 간단한 래퍼이다.

[MCP 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/mcp/)

## 계측 라이브러리 {#instrumentation-libraries}

이 서비스는 `opentelemetry-instrument` 래퍼를 통해 시작되지 않는다.
`Dockerfile`은 스크립트를 직접 실행하며, 계측은 코드에서 설정한다.

```dockerfile
CMD ["python", "run.py"]
```

`run.py`에서 [Traceloop SDK](https://www.traceloop.com/)는
오픈텔레메트리(OpenTelemetry) SDK를 초기화하고,
`opentelemetry-instrumentation-mcp`를 포함하여 함께 제공되는 계측 라이브러리를
활성화한다. 그런 다음 HTTPX 계측을 명시적으로 활성화한다.

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "mcp"),
)

HTTPXClientInstrumentor().instrument()
```

이들을 함께 사용하면 스팬을 수동으로 생성하지 않아도 서비스의 양방향 호출을
계측한다.

- `opentelemetry-instrumentation-mcp` — FastMCP 서버가 처리하는 인바운드 MCP
  도구 호출에 대한 스팬.
- `opentelemetry-instrumentation-httpx` — 각 도구가 프론트엔드 API로 보내는
  아웃바운드 HTTP 호출에 대한 클라이언트 스팬.

에이전트와 이 서비스는 동일한 MCP 계측으로 계측되므로, MCP 전송을 통해
컨텍스트가 전파되고 에이전트의 도구 호출은 이 서비스가 수행하는 작업과 동일한
트레이스에 나타난다.

## 트레이스 {#traces}

### 트레이싱 초기화하기 {#initializing-tracing}

`Traceloop.init()`은 배치 스팬 프로세서와 OTLP 익스포터가 포함된 트레이서
프로바이더를 생성하고 전역 트레이서 프로바이더로 등록하므로, 위의 계측
라이브러리는 하나의 내보내기 파이프라인을 공유한다.

내보내기 엔드포인트는 `OTEL_EXPORTER_OTLP_ENDPOINT` 대신
`TRACELOOP_BASE_URL`에서 가져오며, Traceloop는 여기에 `/v1/traces`를 덧붙인다.
도커 컴포즈(Docker Compose)에서 이 엔드포인트는 오픈텔레메트리 컬렉터의
OTLP/HTTP 포트를 가리킨다. `app_name` 인수는 `service.name` 리소스 속성이 되며,
추가 리소스 속성은 `OTEL_RESOURCE_ATTRIBUTES`에서 읽어 온다.

### 새 스팬 생성하기 {#create-new-spans}

이 서비스는 자체적으로 스팬을 생성하지 않는다. 도구는 FastMCP 서버에 등록되며
래퍼로 감싸지 않으므로, 모든 스팬은 계측 라이브러리에서 생성된다.

```python
self.mcp.tool("add_to_cart")(tools.add_to_cart)
```

이 서비스는 오픈텔레메트리 트레이싱 API를 직접 사용하지 않는다.
`start_as_current_span`을 호출하지 않으며, `set_attribute`로 스팬에 정보를
추가하지도 않는다.

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

`TRACELOOP_METRICS_ENABLED=false`로 설정하지 않는 한, `Traceloop.init()`은
메트릭도 설정한다. 주기적으로 메트릭을 내보내는 메트릭 리더가 포함된 미터
프로바이더를 생성하고 전역으로 등록하여, HTTPX 계측 라이브러리가 생성하는
메트릭을 내보낸다.

### 커스텀 메트릭 {#custom-metrics}

이 서비스는 커스텀 메트릭을 정의하지 않는다. 미터를 가져오거나 자체 메트릭
인스트루먼트를 생성하지 않는다.

## 로그 {#logs}

이 서비스는 Python 표준 라이브러리의 로거만 설정한다.

```python
logging.basicConfig(level=logging.INFO)
```

Traceloop의 로그 내보내기는 기본적으로 비활성화되어 있으며, 서비스는
`LoggerProvider`나 `LoggingHandler`를 설정하지 않는다. 로그 레코드는 OTLP로
내보내는 대신 표준 출력에 기록되어 컨테이너 런타임이 수집하므로, 트레이스와
연관되지 않는다. [로그 지원 현황 표](../../telemetry-features/log-coverage/)를
참고한다.

전체 환경 변수 목록과 문제 해결 단계는
[서비스 README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/mcp#readme)를
참고한다.
