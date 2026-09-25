---
title: 레지스트리에 등록하기
linkTitle: 등록
description: 레지스트리에 항목을 추가하는 방법
default_lang_commit: 42ef3b8c965480f4d58b173ed95fcb05fbc7d429
cSpell:ignore: zpages
---

{{% include freeze-notice.md %}}

오픈텔레메트리(OpenTelemetry) 통합을 유지 관리하거나 이에 기여하고 있나요?
[레지스트리](../)에 여러분의 프로젝트를 소개해 주세요!

프로젝트를 등록하려면 [풀 리퀘스트][pull request]를 제출한다.
[registry-entry.yml][] 템플릿을 사용하여 [data/registry][]에 프로젝트의 데이터
파일을 만들어야 한다.

프로젝트 이름과 설명은 [마케팅 지침][marketing guidelines]을 따르고, 리눅스
재단의 브랜딩 및 [상표 사용 지침][trademark usage guidelines]에 부합해야 한다.

## 레지스트리 유형 {#registry-types}

레지스트리에 프로젝트를 추가할 때는 `registryType`을 지정해야 한다. 이 필드는
오픈텔레메트리와의 관계에 따라 프로젝트를 분류한다. 사용할 수 있는 값과 각 값의
정의는 다음과 같다.

### `application integration`

**용도**: 외부 플러그인이나 계측 라이브러리 없이 오픈텔레메트리를 기본적으로
지원하도록 통합한 애플리케이션 또는 서비스.

**예시**: [통합](/ecosystem/integrations/) 페이지의 내장 애플리케이션 통합
목록을 참고한다.

> [!NOTE]
>
> 상용/독점 라이선스를 허용하는 유일한 레지스트리 유형이다.

### `api`

**용도**: 특정 언어의 오픈텔레메트리 API를 구현하는 패키지. SDK와 독립적으로
계측된 코드와 라이브러리가 의존하는 인터페이스와 아무 동작도 하지 않는(no-op)
구현체를 제공한다.

**예시**: Ruby의 `opentelemetry-api`, `opentelemetry-metrics-api`,
`opentelemetry-logs-api` gem.

### `connector`

**용도**: 한 파이프라인의 익스포터이자 다른 파이프라인의 리시버로 동작하여 두
파이프라인을 연결하는 오픈텔레메트리 컬렉터 커넥터 컴포넌트. 시그널 유형 간
변환을 수행할 수도 있다.

**예시**: 카운트 커넥터, 스팬을 메트릭으로 변환하는 커넥터, 장애 조치 커넥터.

### `core`

**용도**: 오픈텔레메트리 프로젝트의 핵심 컴포넌트 전용. 서드파티 컴포넌트나
오픈텔레메트리 프로젝트에 속하지 않는 컴포넌트에는 적용할 수 없다.

### `exporter`

**용도**: 오픈텔레메트리 컬렉터의 익스포터 컴포넌트 또는 언어별 SDK의 익스포터
라이브러리.

**예시**: OTLP 익스포터, Prometheus 익스포터, 텔레메트리 데이터를 외부 시스템에
전송하는 컴포넌트.

**참고**: 텔레메트리 데이터를 내보내는 서드파티 컴포넌트에는 적용할 수 없다.

### `extension`

**용도**: 오픈텔레메트리 기능을 확장하는 컬렉터 또는 SDK 확장 기능.

**예시**: 인증기, 구성 소스/프로바이더, 서비스 디스커버리, 상태
확인/pprof/zpages, 컬렉터/SDK 동작을 확장하는 기타 컴포넌트.

### `id-generator`

**용도**: 트레이스 ID와 스팬 ID의 생성 방식을 커스터마이징하는 SDK 컴포넌트.

**예시**: AWS X-Ray 호환 ID 생성기.

### `instrumentation`

**용도**: 특정 라이브러리/프레임워크를 위한 계측 라이브러리 또는 내장 계측.

**예시**: HTTP 계측, 데이터베이스 계측, 프레임워크별 계측, 해당하는 경우 자동
계측 에이전트.

### `log-bridge`

**용도**: 기존 로깅 프레임워크/API를 오픈텔레메트리 로깅에 연결하여,
애플리케이션이 익숙한 로깅 API로 OTel 로그를 생성할 수 있게 하는 언어별 어댑터.

**예시**: Java SLF4J/Log4j/Logback, Python logging, JavaScript Winston/Pino, Go
log/slog/zap 등의 프레임워크를 위한 브리지/핸들러/어펜더.

### `metric-producer`

**용도**: 서드파티 소스의 메트릭을 SDK 메트릭 리더에 연결하는 SDK 컴포넌트.

### `processor`

**용도**: 오픈텔레메트리 컬렉터 프로세서 컴포넌트.

**예시**: 배치 프로세서, 속성 프로세서, 샘플링 프로세서, 컬렉터 파이프라인에서
텔레메트리 데이터를 처리하는 컴포넌트.

### `propagator`

**용도**: 특정 전송 형식으로 프로세스 경계를 넘어 트레이스 컨텍스트와 배기지를
전달하는 컨텍스트 전파자.

**예시**: B3, Jaeger, AWS X-Ray 전파자.

### `provider`

**용도**: 오픈텔레메트리 컬렉터 프로바이더 컴포넌트.

**예시**: 구성 프로바이더, 자격 증명 프로바이더, 컬렉터에 리소스나 구성을
제공하는 컴포넌트.

### `receiver`

**용도**: 오픈텔레메트리 컬렉터 리시버 컴포넌트.

**예시**: OTLP 리시버, Prometheus 리시버, 외부 소스에서 텔레메트리 데이터를
수신하는 컴포넌트.

> [!NOTE]
>
> 오픈텔레메트리 텔레메트리를 수신하는 서드파티 컴포넌트에는 적용할 수 없다.

### `resource-detector`

**용도**: 언어별 SDK의 리소스 탐지기.

**예시**: AWS 리소스 탐지기, GCP 리소스 탐지기, 리소스 정보를 자동으로 탐지하여
텔레메트리에 추가하는 컴포넌트.

### `sampler`

**용도**: 어떤 스팬을 기록하고 내보낼지 결정하는 SDK 샘플러.

**예시**: AWS X-Ray 원격 샘플러, 규칙 기반 샘플러.

### `sdk`

**용도**: 특정 언어의 오픈텔레메트리 SDK를 구현하는 패키지.

**예시**: Ruby의 `opentelemetry-sdk`, `opentelemetry-metrics-sdk`,
`opentelemetry-logs-sdk` gem.

### `semantic-convention`

**용도**: 특정 언어의 시맨틱 컨벤션 상수를 제공하는 패키지.

**예시**: Ruby의 `opentelemetry-semantic_conventions` gem.

### `utilities`

**용도**: 오픈텔레메트리 사용에 도움이 되는 기타 도구.

**예시**: 테스트 유틸리티, 디버깅 도구, 마이그레이션 도구, 오픈텔레메트리 사용을
돕는 헬퍼 라이브러리.

[data/registry]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[pull request]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[marketing guidelines]: /community/marketing-guidelines/
[trademark usage guidelines]:
  https://www.linuxfoundation.org/legal/trademark-usage
