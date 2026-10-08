---
title: 컬렉터 데이터 흐름 대시보드
default_lang_commit: 8eeaf1352f3cc745b86c46204bfa4689bcea6615
---

오픈텔레메트리 (OpenTelemetry) 컬렉터를 통과하는 데이터 흐름을 모니터링하는 것은
여러 이유로 중요하다. 컬렉터의 내부 동작을 이해하려면 샘플 수와 카디널리티
(Cardinality)처럼 유입되는 데이터를 거시적인 관점에서 파악하는 것이 필수적이다.
그러나 세부 사항을 살펴보면 상호 연결 관계가 복잡해질 수 있다. 컬렉터 데이터
흐름 대시보드는 오픈텔레메트리 데모 애플리케이션의 기능을 보여주고, 사용자가
이를 바탕으로 확장할 수 있는 탄탄한 기반을 제공하는 것을 목표로 한다. 컬렉터
데이터 흐름 대시보드는 어떤 메트릭을 모니터링해야 하는지에 대한 유용한 지침을
제공한다. 사용자는 memory_limiter 프로세서나 다른 데이터 흐름 지표처럼 자신의
사용 사례에 필요한 메트릭을 추가하여 대시보드를 맞춤 구성할 수 있다. 이 데모
대시보드는 출발점이 되어, 사용자가 다양한 사용 시나리오를 탐색하고 각자의
모니터링 요구에 맞게 도구를 조정할 수 있도록 한다.

## 데이터 흐름 개요 {#data-flow-overview}

아래 다이어그램은 시스템 컴포넌트의 개요를 제공하며, 오픈텔레메트리 데모
애플리케이션에서 사용하는 오픈텔레메트리 컬렉터(otelcol) 설정 파일을 기반으로 한
구성을 보여준다. 또한 시스템 내에서 옵저버빌리티 (Observability)
데이터(트레이스와 메트릭)가 흐르는 경로를 보여준다.

![오픈텔레메트리 컬렉터 개요](otelcol-data-flow-overview.png)

## 수신/송신 메트릭 (Ingress/Egress Metrics) {#ingressegress-metrics}

아래 다이어그램에 표시된 메트릭은 송신 및 수신 데이터 흐름을 모니터링하는 데
사용된다. 이 메트릭은 otelcol 프로세스에서 생성되어 포트 8888로 내보내지고, 이후
프로메테우스 (Prometheus)가 메트릭 수집 (Scraping)을 수행한다. 이 메트릭에
연결된 네임스페이스 (Namespace)는 "otelcol"이며, 잡 (Job) 이름은 `otel.`로
표시된다.

![오픈텔레메트리 컬렉터 수신 및 송신 메트릭](otelcol-data-flow-metrics.png)

레이블 (Label)은 특정 메트릭 집합(예: 익스포터 (Exporter), 리시버 (Receiver)
또는 잡)을 식별하는 유용한 도구로, 전체 네임스페이스 내에서 메트릭 집합을 구분할
수 있게 한다. 거부된 메트릭 (Refused Metrics)은 memory_limiter 프로세서에 정의된
메모리 제한을 초과한 경우에만 나타난다는 점에 유의해야 한다.

### 수신 트레이스 파이프라인 (Ingress Traces Pipeline) {#ingress-traces-pipeline}

- `otelcol_receiver_accepted_spans`
- `otelcol_receiver_refused_spans`
- `by (receiver,transport)`

### 수신 메트릭 파이프라인 (Ingress Metrics Pipeline) {#ingress-metrics-pipeline}

- `otelcol_receiver_accepted_metric_points`
- `otelcol_receiver_refused_metric_points`
- `by (receiver,transport)`

### 프로세서 (Processor) {#processor}

현재 데모 애플리케이션에 있는 유일한 프로세서는 배치 프로세서 (Batch
Processor)이며, 트레이스와 메트릭 파이프라인에서 모두 사용된다.

- `otelcol_processor_batch_batch_send_size_sum`

### 송신 트레이스 파이프라인 (Egress Traces Pipeline) {#egress-traces-pipeline}

- `otelcol_exporter_sent_spans`
- `otelcol_exporter_send_failed_spans`
- `by (exporter)`

### 송신 메트릭 파이프라인 (Egress Metrics Pipeline) {#egress-metrics-pipeline}

- `otelcol_exporter_sent_metric_points`
- `otelcol_exporter_send_failed_metric_points`
- `by (exporter)`

### 프로메테우스 메트릭 수집 (Prometheus Scraping) {#prometheus-scraping}

- `scrape_samples_scraped`
- `by (job)`

## 대시보드 {#dashboard}

그라파나 (Grafana) UI로 이동하여 화면 왼쪽의 탐색 아이콘 아래에 있는
**OpenTelemetry Collector** 대시보드를 선택하면 대시보드에 접근할 수 있다.

![오픈텔레메트리 컬렉터 대시보드](otelcol-data-flow-dashboard.png)

대시보드에는 네 가지 주요 섹션이 있다.

1. 프로세스 메트릭 (Process Metrics)
2. 트레이스 파이프라인 (Traces Pipeline)
3. 메트릭 파이프라인 (Metrics Pipeline)
4. 프로메테우스 메트릭 수집 (Prometheus Scraping)

섹션 2, 3, 4는 앞서 언급한 메트릭을 사용하여 전체 데이터 흐름을 나타낸다. 또한
데이터 흐름을 이해하기 위해 각 파이프라인의 내보내기 비율 (Export Ratio)을
계산한다.

### 내보내기 비율 (Export Ratio) {#export-ratio}

내보내기 비율은 기본적으로 리시버와 익스포터 메트릭 간의 비율이다. 위 대시보드
스크린샷에서 메트릭의 내보내기 비율이 수신된 메트릭에 비해 매우 높다는 것을
확인할 수 있다. 이는 개요 다이어그램에 표시된 것처럼, 데모 애플리케이션이 컬렉터
내부의 스팬으로부터 메트릭을 생성하는 프로세서인 스팬 메트릭 (Span Metrics)을
생성하도록 구성되어 있기 때문이다.

### 프로세스 메트릭 (Process Metrics) {#process-metrics}

대시보드에는 종류는 매우 제한적이지만 유용한 정보를 제공하는 프로세스 메트릭이
추가되어 있다. 예를 들어, 재시작 등의 상황에서 시스템에 둘 이상의 otelcol
인스턴스가 실행 중인 것을 관찰할 수 있다. 이는 데이터 흐름의 급증을 이해하는 데
유용할 수 있다.

![오픈텔레메트리 컬렉터 프로세스 메트릭](otelcol-dashboard-process-metrics.png)
