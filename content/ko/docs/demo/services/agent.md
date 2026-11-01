---
title: 에이전트 서비스
linkTitle: 에이전트
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
cSpell:ignore: fastapi httpx langchain langgraph openai
---

이 서비스는 데모용 AI 어시스턴트를 제공한다. 사용자 프롬프트를 받아
랭그래프(LangGraph) ReAct 에이전트를 통해 라우팅하고, 내장 도구 또는
[MCP 서비스](../mcp/)에서 불러온 도구를 통해 쇼핑몰 API를 호출하는 FastAPI
엔드포인트를 노출한다.

[에이전트 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)

## LLM 설정 {#llm-configuration}

기본적으로 이 서비스는 기록된 LLM 응답을 재생하여 실제 모델 없이도 데모가
실행되도록 한다. 실제 OpenAI 호환 LLM을 사용하려면 `.env.override` 파일에 다음
환경 변수 값을 입력한다.

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
API_KEY=<replace with API key>
USE_VCR=False
```

## 계측 라이브러리 {#instrumentation-libraries}

이 서비스는 `opentelemetry-instrument` 래퍼를 통해 시작되지 않는다.
`Dockerfile`은 스크립트를 직접 실행하며, 계측은 코드에서 설정한다.

```dockerfile
CMD ["python", "run.py"]
```

`run.py`에서 [Traceloop SDK](https://www.traceloop.com/)는
오픈텔레메트리(OpenTelemetry) SDK를 초기화하고 함께 제공되는 생성형 AI 계측
라이브러리를 활성화한다. 그런 다음 HTTPX 계측을 명시적으로 활성화한다.

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "agent"),
)

HTTPXClientInstrumentor().instrument()
```

FastAPI 계측은 애플리케이션 객체가 생성된 후 `start_servers`에서 적용된다.

```python
FastAPIInstrumentor.instrument_app(agent.app)
```

이들을 함께 사용하면 스팬을 수동으로 생성하지 않아도 자동으로 생성한다.

- `opentelemetry-instrumentation-fastapi` — `POST /prompt` 요청에 대한 서버
  스팬.
- `opentelemetry-instrumentation-httpx` — LLM API와 쇼핑 도구에서 사용하는
  프론트엔드 API로 나가는 호출에 대한 클라이언트 스팬.
- Traceloop에 포함된 라이브러리, 특히 `opentelemetry-instrumentation-langchain`,
  `opentelemetry-instrumentation-openai`, `opentelemetry-instrumentation-mcp` —
  랭체인(LangChain)과 랭그래프의 각 단계, LLM 호출 및 `MCP_ENABLED=True`일 때의
  MCP 도구 호출에 대한 스팬.

## 트레이스 {#traces}

### 트레이싱 초기화하기 {#initializing-tracing}

`Traceloop.init()`은 배치 스팬 프로세서와 OTLP 익스포터가 포함된 트레이서
프로바이더를 생성하고 전역 트레이서 프로바이더로 등록한다. 따라서 위의 계측
라이브러리는 하나의 내보내기 파이프라인을 공유한다.

내보내기 엔드포인트는 `OTEL_EXPORTER_OTLP_ENDPOINT` 대신
`TRACELOOP_BASE_URL`에서 가져오며, Traceloop는 여기에 `/v1/traces`를 덧붙인다.
도커 컴포즈(Docker Compose)에서 이 엔드포인트는 오픈텔레메트리 컬렉터의
OTLP/HTTP 포트를 가리킨다. `app_name` 인수는 `service.name` 리소스 속성이 되며,
추가 리소스 속성은 `OTEL_RESOURCE_ATTRIBUTES`에서 읽어 온다.

### 새 스팬 생성하기 {#create-new-spans}

`run_agent` 메서드는 Traceloop의 `@workflow` 데코레이터로 감싸져 있으며, 전체
에이전트 실행에 대한 스팬을 시작한다. 계측 라이브러리가 생성하는 LLM 및 도구
스팬은 이 스팬의 자식이 된다.

```python
@workflow(name="astronomy_shop_agent_workflow")
async def run_agent(self, input_prompt, history: List[Dict] | None = None):
```

이렇게 하면 `astronomy_shop_agent_workflow`라는 이름의 스팬이 생성된다. 하나의
프롬프트가 여러 차례의 추론과 도구 호출을 유발할 수 있으므로, 이 스팬은
에이전트의 한 번의 전체 실행을 하나로 묶는 역할을 한다.

이 데코레이터 외에 서비스는 오픈텔레메트리 트레이싱 API를 직접 사용하지 않는다.
`start_as_current_span`으로 스팬을 생성하지 않으며, `set_attribute`로 스팬에
정보를 추가하지도 않는다.

### 프롬프트와 응답 내용 {#prompt-and-completion-content}

함께 제공되는 생성형 AI 계측은 오픈텔레메트리
[생성형 AI 시맨틱 컨벤션](/docs/specs/semconv/gen-ai/)을 따르며, 프롬프트와
응답을 스팬 속성인 `gen_ai.input.messages`와 `gen_ai.output.messages`에
기록한다. 내보내는 스팬에 프롬프트와 응답 내용을 포함하지 않으려면
`TRACELOOP_TRACE_CONTENT=false`로 설정한다.

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

`TRACELOOP_METRICS_ENABLED=false`로 설정하지 않는 한, `Traceloop.init()`은
메트릭도 설정한다. 주기적으로 메트릭을 내보내는 메트릭 리더가 포함된 미터
프로바이더를 생성하고 전역으로 등록하여, FastAPI와 HTTPX 계측 라이브러리가
생성하는 메트릭을 내보낸다.

### 커스텀 메트릭 {#custom-metrics}

이 서비스는 커스텀 메트릭을 정의하지 않는다. 미터를 가져오거나 자체 계측을
생성하지도 않는다.

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
[서비스 README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/agent#readme)를
참고한다.
