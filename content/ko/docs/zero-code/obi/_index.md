---
title: 오픈텔레메트리 eBPF 계측
linkTitle: OBI
description:
  자동 계측을 위해 오픈텔레메트리 eBPF 계측을 사용하는 방법을 알아본다.
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
cSpell:ignore: Aerospike Ollama Qwen rerank SunRPC
default_lang_commit: 8199ade1531c1ba2227224eb6d328fd54c934e92
---

오픈텔레메트리 라이브러리는 널리 쓰이는 프로그래밍 언어와 프레임워크에서
텔레메트리를 수집하는 기능을 제공한다. 하지만 분산 트레이싱을 시작하는 일은
복잡할 수 있다. Go나 Rust 같은 일부 컴파일 언어에서는 코드에 트레이스포인트를
직접 추가해야 한다.

오픈텔레메트리 eBPF 계측(OpenTelemetry eBPF Instrumentation, OBI)은 애플리케이션
옵저버빌리티를 손쉽게 시작할 수 있게 해 주는 자동 계측 도구다. OBI는 eBPF를
사용해 애플리케이션 실행 파일과 OS 네트워킹 계층을 자동으로 검사하고, 지원되는
리눅스 워크로드에 대해 트레이스 스팬, RED(Rate, Errors, Duration) 메트릭, 런타임
메트릭, 애플리케이션 및 네트워크 관계를 수집한다. 모든 데이터 수집은
애플리케이션 코드나 구성을 수정하지 않고 이루어진다.

OBI는 다음 기능을 제공한다.

- **폭넓은 언어 지원**: Java(JDK 8+), .NET, Go, Python, Ruby, Node.js, C, C++,
  Rust
- **경량**: 코드 변경, 라이브러리 설치, 재시작이 필요 없다
- **효율적인 계측**: eBPF 프로브로 트레이스와 메트릭을 수집하며 오버헤드가
  최소화된다
- **분산 트레이싱**: 분산 트레이스 스팬을 수집해 컬렉터로 보고한다
- **로그 보강**: JSON 및 일반 텍스트 로그에 트레이스 컨텍스트를 추가해
  상관관계를 파악할 수 있다
- **쿠버네티스 네이티브**: 쿠버네티스 애플리케이션에 설정 없이 자동 계측을
  제공한다
- **암호화된 통신 가시성**: 복호화 없이 TLS/SSL 트랜잭션을 수집한다
- **컨텍스트 전파**: 서비스 간에 트레이스 컨텍스트를 자동으로 전파한다
- **프로토콜 지원(클라이언트와 서버)**: HTTP/S, HTTP/2, gRPC, Kafka, NATS, MQTT,
  Memcached, SunRPC(NFS 포함), JSON-RPC
- **프로토콜 지원(클라이언트만)**: AMQP 1.0, DNS 쿼리
- **데이터베이스 계측(클라이언트와 서버)**: PostgreSQL(pgx 드라이버 포함),
  MySQL, MSSQL, Redis
- **데이터베이스 계측(클라이언트만)**: MongoDB, Couchbase(N1QL/SQL++ 및 KV
  프로토콜), Aerospike, Elasticsearch, OpenSearch
- **HTTP 페이로드 계측**: 서버 측 GraphQL, 클라이언트 측 Elasticsearch,
  OpenSearch, AWS S3·SQS·SNS, 그리고 클라이언트와 서버 양쪽의 JSON-RPC 기반 MCP
- **GenAI 계측**: OpenAI, OpenAI 호환 게이트웨이, Ollama, Anthropic Claude,
  Google AI Studio(Gemini), AWS Bedrock, Qwen(DashScope), JSON-RPC 기반 MCP,
  임베딩 및 리랭크 API, 벡터 검색 시스템에 대한 트레이스와 메트릭
- **런타임 메트릭**: SDK를 변경하지 않고 Go, JVM, .NET, Node.js, Python 런타임
  메트릭을 수집한다
- **GPU 계측**: 리눅스에서 지원되는 CUDA 런타임 작업을 수집한다
- **스팬 및 서비스 그래프 메트릭**: 애플리케이션 스팬 메트릭과 서비스 간 관계를
  내보낸다
- **낮은 카디널리티 메트릭**: 비용 절감을 위해 카디널리티가 낮은 Prometheus 호환
  메트릭을 제공한다
- **네트워크 옵저버빌리티**: 서비스 간 네트워크 플로우를 바이트 및 패킷 카운터,
  TCP RTT, 재전송, 연결, 소켓 I/O 메트릭과 함께 수집한다
- **향상된 서비스 디스커버리**: DNS 확인(resolution)으로 서비스 이름 조회를
  개선한다
- **컬렉터 통합**: OBI를 오픈텔레메트리 컬렉터 리시버 컴포넌트로 실행한다

## 최근 주요 변경 사항(v0.15.2) {#recent-highlights-v0152}

OBI v0.15.2는 공개되지 않은 v0.15.0과 v0.15.1 릴리스를 대체한다. 의도했던
v0.15.0의 변경 사항, BPF 베리파이어 수정, 릴리스 아티팩트 빌드 수정이 포함되어
있다. v0.14.0에서 업그레이드한다면 v0.15.2를 설치한다.

- **Go 수동 스팬**: 별도의 Auto SDK 모듈 없이, Go Trace API에 내장된 Auto SDK를
  통해 스팬을 수집한다
- **.NET 계측**: 라우트 수집을 확장하고 CPU 및 마지막 수집 시점의 힙 크기
  메트릭을 추가한다
- **엔드포인트 이름**: AWS Route53 호스티드 존 이름 확인 기능을
  선택적으로(opt-in) 추가한다
- **Config v2**: 메트릭 패밀리를 명시적으로 선택하고, 프로토콜 메트릭 스위치를
  스팬 메트릭과 서비스 그래프에도 적용한다
- **컬렉터 통합**: 임포트 경로는 유지한 채 리시버를 별도의 Go 모듈로 게시한다
- **정확성 수정**: 잘못 분류된 소켓에 HTTP/2 컨텍스트가 주입되는 문제를
  방지하고, 충돌하는 메트릭 레이블 튜플을 분리하며, 중복된 `target.info` 개수를
  바로잡고, OTLP/HTTP JSON 트레이스 인코딩을 수정한다

[v0.15.2 업그레이드 노트](#upgrade-notes-for-v0152)와
[릴리스 노트](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.15.2)에서
대시보드, 메트릭 카디널리티, 트레이스 처리에 영향을 주는 변경 사항을 확인한다.

업스트림 예제를 살펴보려면
[NGINX 워크스루](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.15.2/examples/nginx)와
[Apache 워크스루](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.15.2/examples/apache)를
참고한다.

## v0.15.2 업그레이드 노트 {#upgrade-notes-for-v0152}

- `go.opentelemetry.io/obi/collector` 모듈 `v0.15.2`로 컬렉터 배포판을 빌드한다.
  루트 모듈에는 더 이상 리시버 패키지가 없다. 업데이트된 모듈 교체(replace)와
  컴포넌트 버전은 [컬렉터 리시버 설정](configure/collector-receiver/)을
  참고한다. Go 임베더는 제거된 `PrometheusConfig.Registry` 필드도 Prometheus
  HTTP 포트 설정으로 교체해야 한다.
- Config v2 프로토콜의 `enabled.metrics: false`는 이제 해당 프로토콜의 스팬
  메트릭과 서비스 그래프도 함께 억제한다. 트레이스는 독립적으로 구성할 수 있다.
  Config v1의 계측 목록과 파생 메트릭 범위가 다를 때는 마이그레이션 보고서를
  검토한다. [메트릭 기능 선택](configure/config-v2/#metric-feature-selection)을
  참고한다.
- HTTP 클라이언트의 `server.address` 값에서는 Host 헤더의 포트를 제외한다.
  `server.port`와 `url.full`에는 포트가 유지된다. 포트가 포함된 쿠버네티스
  Service 호스트는 이제 서비스와 네임스페이스로 확인되며, 이로 인해 서비스
  그래프 이름이 바뀔 수 있다.
- gRPC 스팬 이름과 `rpc.method` 값에서 맨 앞의 슬래시를 제거한다. 유효하지
  않거나 읽지 못한 경로는 스팬 이름 `grpc`와 메서드 `_OTHER`를 사용하며,
  `rpc.method_original`에 캡처된 원본 경로가 보존된다. ONC RPC는 CALL이 캡처된
  경우에만 `{program}/{procedure}` 메서드를 사용하고, REPLY가 있을 때만 응답
  상태를 보고한다.
- GenAI, 데이터베이스, GraphQL, AWS S3/SQS, ONC RPC의 스팬 이름이 시맨틱
  컨벤션을 따르도록 바뀐다. 예를 들어 Anthropic의 `message`는 `chat`이 되고,
  GraphQL 서버 이름에서는 `GraphQL`이 빠지며, S3/SQS 이름에는 `S3.`/`SQS.`
  접두사가 붙는다. 스팬 이름 필터와 스팬 메트릭 쿼리를 업데이트한다.
- 데이터베이스 소요 시간(duration) 메트릭에 기본적으로 `db.collection.name`이
  포함된다. RPC 클라이언트 소요 시간에는 `server.port`가, 실패한 RPC 서버 소요
  시간에는 `error.type`이 추가된다. 메시징 클라이언트 소요 시간에는
  `messaging.operation.type`이 추가되고, 클라이언트 및 프로세스 소요 시간에는
  구독 이름이 있으면 포함된다. 이 기본값 때문에 메트릭 시리즈가 분리될 수 있다.
  [메트릭 속성](metrics/#attributes-of-obi-metrics)을 참고한다.
- MQTT SUBSCRIBE 텔레메트리는 대상(destination) 이름 대신
  `messaging.destination.subscription.name`을 사용하고 스팬 이름에서 필터를
  생략한다. 공유 구독은 `messaging.consumer.group.name`도 보고한다. AWS SNS
  스팬에는 더 이상 `rpc.system.name`이나 `rpc.method`가 포함되지 않는다.
- GraphQL, MCP, JSON-RPC 서버 스팬은 더 이상 HTTP 메서드, 상태, 라우트, URL,
  본문 크기, user-agent, OBI 응답 관측 속성을 가지지 않는다. 캡처되는 HTTP
  헤더는 일반 HTTP와 GraphQL 스팬으로 제한된다. OTLP GenAI 메트릭은 없는 요청
  모델을 생략하고, AMQP 메트릭은 빈 대상을 생략한다.
- 텔레메트리 스키마가 `0.15.2`로 올라가며 이전 변환은 유지된다. 텔레메트리
  레지스트리는 Weaver `definition/2`를 사용한다. 스팬 참조 ID에서 `span.`
  접두사가 사라지므로, 이전 카탈로그 앵커로 연결되는 링크를 업데이트한다.

v0.14.0보다 오래된 릴리스에서 업그레이드한다면 아래의 이전 변경 사항도 함께
검토한다. 릴리스 노트에는 프로토콜별 이름 및 속성 변경 사항이 추가로 설명되어
있다.

## v0.14.0 업그레이드 노트 {#upgrade-notes-for-v0140}

- HTTP 소요 시간 및 본문 크기 메트릭이 이제 실패한 요청에 기본적으로
  `error.type`을 포함한다. 이 메트릭의 Prometheus 시리즈에는 `error_type`
  레이블이 추가되며, 성공한 요청에서는 값이 비어 있다. 기존 시리즈에 의존하는
  대시보드와 알림 쿼리를 검토한다.
- OTLP 스팬 메트릭은 더 이상 `host.id`를 각 데이터 포인트에 복사하지 않는다. 이
  값은 리소스 속성과 `target_info`에 그대로 남으며, OBI의 Prometheus 익스포터는
  바뀌지 않는다. OTLP 리소스를 Prometheus 레이블로 평탄화하는 소비자는 `host_id`
  쿼리를 확인한다.
- `service.peer.name`, `http.request.body.size`, `http.response.body.size`,
  `obi.http.response.observed`는 이제 선택(opt-in) 스팬 속성이다. 필요하면
  [`attributes.select.traces.include`](configure/metrics-traces-attributes/)로
  선택한다. 서비스 그래프 프로세서에는 `service.peer.name`이 필요할 수 있다.
- 고정(pinned)된 `traces_ctx_v1` 맵은 기본적으로 더 이상 채워지지 않는다. 외부
  트레이스-프로파일 상관관계와 Go 채널 핸드오프 폴백은
  [`ebpf.populate_trace_context: true`](configure/metrics-traces-attributes/)로
  복원할 수 있다.
- 타깃 선언은 여전히 리소스 메타데이터보다 우선한다. 이제 확인된 타깃
  메타데이터가 에이전트 자신의 `OTEL_RESOURCE_ATTRIBUTES`보다 우선하며, 값은 키
  단위로 병합된다.
- Elastic Cloud 클라이언트 스팬과 데이터베이스 작업 메트릭에 이제
  `X-Found-Handling-Cluster`에서 가져온 `db.namespace`가 포함된다. 기존 메트릭
  시리즈가 클러스터별로 분리될 수 있다. AWS SQS 스팬에는 더 이상
  `aws.extended_request_id`가 포함되지 않는다.

## OBI의 동작 방식 {#how-obi-works}

다음 다이어그램은 OBI의 상위 수준 아키텍처와, 텔레메트리 파이프라인에서 eBPF
계측이 차지하는 위치를 보여 준다.

![OBI eBPF 아키텍처](./ebpf-arch.svg)

## 호환성 {#compatibility}

OBI는 다음 요구 사항을 충족하는 리눅스 환경을 지원한다.

| 요구 사항    | 지원 범위                                                             |
| :----------- | :-------------------------------------------------------------------- |
| CPU 아키텍처 | `amd64`, `arm64`                                                      |
| 리눅스 커널  | `5.8+`, 또는 필요한 eBPF 백포트가 적용된 RHEL 계열 리눅스 `4.18+`     |
| 커널 기능    | BTF                                                                   |
| 권한         | root, 또는 활성화한 OBI 기능에 필요한 리눅스 케이퍼빌리티(capability) |

OBI는 다음 릴리스 아티팩트를 공식으로 게시한다.

| 아티팩트                                            | 지원 플랫폼                    |
| :-------------------------------------------------- | :----------------------------- |
| `obi` 바이너리 아카이브                             | 리눅스 `amd64`, 리눅스 `arm64` |
| `otel/ebpf-instrument` 컨테이너 이미지              | 리눅스 `amd64`, 리눅스 `arm64` |
| `otel/opentelemetry-ebpf-k8s-cache` 컨테이너 이미지 | 리눅스 `amd64`, 리눅스 `arm64` |

OBI는 위 요구 사항을 충족하는 환경이라면 독립 실행형 리눅스 호스트, 컨테이너,
쿠버네티스에 배포할 수 있다.

OBI는 리눅스 이외의 운영 체제, `amd64`와 `arm64` 이외의 리눅스 아키텍처, BTF가
없는 리눅스 환경, 그리고 문서화된 RHEL 계열 `4.18+` 예외를 제외한 리눅스 `5.8`
미만 커널 버전을 지원하지 않는다.

기능별 지원 세부 사항은 다음 가이드에 문서화되어 있다.

- [분산 트레이스](distributed-traces/): 컨텍스트 전파 지원, 런타임별 요구 사항,
  분산 트레이싱의 제약 사항
- [트레이스 컨텍스트 연결](context-propagation/): 비동기 및 스레드 기반 요청
  처리에서의 부모-자식 연결 지원
- [데이터 내보내기](configure/export-data/): 프로토콜, 데이터베이스, 메시징,
  GenAI, GPU, Go 라이브러리 계측 지원

## 제약 사항 {#limitations}

OBI는 코드를 변경하지 않고도 애플리케이션과 프로토콜 수준의 옵저버빌리티를
제공하지만, 모든 상황에서 언어 수준의 계측을 대체하지는 않는다. 사용자 정의
스팬, 애플리케이션별 속성, 비즈니스 이벤트처럼 eBPF 기반 계측이 자동으로 도출할
수 없는 프로세스 내부 텔레메트리가 필요하다면 언어별 에이전트나 수동 계측을
사용한다.

OBI는 네트워크 및 프로토콜 활동을 자동으로 수집할 수 있지만, eBPF 관측 지점에서
보이지 않는 애플리케이션별 세부 정보까지 항상 복원할 수는 없다.

일부 기능에는 핵심 플랫폼 요구 사항 외에 추가 주의 사항이 있거나 지원 범위가 더
좁다. 자세한 내용은 [분산 트레이스](distributed-traces/)와
[내보내는 계측](configure/export-data/)의 기능별 문서를 참고한다.

OBI에 필요한 전체 권한(capability) 목록은
[보안, 권한, 케이퍼빌리티](security/)를 참고한다.

## OBI 시작하기 {#get-started-with-obi}

- [설정](setup/) 문서를 따라 Docker나 쿠버네티스에서 OBI를 시작한다.
- [트레이스-로그 상관관계](./trace-log-correlation/)를 알아보고, 트레이스를
  애플리케이션 로그와 연결하며 JSON 로그에 트레이스 컨텍스트를 추가한다.
- 중앙 집중식 텔레메트리 처리를 위해
  [OBI를 컬렉터 리시버로](./configure/collector-receiver/) 실행하는 방법을
  알아본다.

## 문제 해결 {#troubleshooting}

- 흔한 문제에 대한 도움이 필요하면 [문제 해결](./troubleshooting) 가이드를
  참고한다.
