---
title: 텔레메트리 기능
linkTitle: 텔레메트리 기능
aliases: [demo_features, features]
default_lang_commit: 4309389695c38fee3cb6e68bf1186e4a99d5da4c
---

## 오픈텔레메트리(OpenTelemetry) {#opentelemetry}

- **[오픈텔레메트리 트레이스](/docs/concepts/signals/traces/)**: 모든 서비스는
  오픈텔레메트리에서 제공하는 계측 라이브러리를 사용하여 계측된다.
- **[오픈텔레메트리 메트릭](/docs/concepts/signals/metrics/)**: 일부 서비스는
  오픈텔레메트리에서 제공하는 계측 라이브러리를 사용하여 계측된다. 관련 SDK가
  출시됨에 따라 더 많은 서비스가 추가될 예정이다.
- **[오픈텔레메트리 로그](/docs/concepts/signals/logs/)**: 일부 서비스는
  오픈텔레메트리에서 제공하는 계측 라이브러리를 사용하여 계측된다. 관련 SDK가
  출시됨에 따라 더 많은 서비스가 추가될 예정이다.
- **[오픈텔레메트리 컬렉터](/docs/collector/)**: 모든 서비스는 계측되어 있으며,
  생성된 트레이스와 메트릭을 gRPC를 통해 오픈텔레메트리 컬렉터로 전송한다.
  수신한 트레이스는 로그와 예거(Jaeger)로 내보내고, 수신한 메트릭과
  예시(exemplar)는 로그와 프로메테우스(Prometheus)로 내보낸다.
- **[OpAMP](/docs/specs/opamp/)**: 오픈텔레메트리 컬렉터는 상태, 버전, 속성 및
  실제 적용 중인 설정을 데모의 OpAMP 서버에 보고한다.
  <http://localhost:8080/opamp/>의 OpAMP UI에서 보고된 상태를 확인할 수 있다.
- **SDK 자체 옵저버빌리티(self-observability)**: 일부 서비스에서는
  오픈텔레메트리 SDK 자체가 내보내는 실험 단계의 `otel.sdk.*` 내부 메트릭을
  명시적으로 활성화한다. 이러한 메트릭은
  [자체 옵저버빌리티 대시보드](/docs/demo/self-observability-dashboard/)에
  시각화된다.

## 옵저버빌리티 솔루션 {#observability-solutions}

- **[그라파나(Grafana)](https://github.com/grafana/grafana)**: 모든 메트릭
  대시보드는 그라파나에 저장된다.
- **[예거](https://www.jaegertracing.io/)**: 생성된 모든 트레이스는 예거로
  전송된다.
- **[오픈서치(OpenSearch)](https://opensearch.org/)**: 생성된 모든 로그는 Data
  Prepper로 전송된다. 오픈서치는 각 서비스의 로그 데이터를 중앙에서 관리하는 데
  사용될 예정이다.
- **[프로메테우스](https://prometheus.io/)**: 생성된 모든 메트릭과 예시는
  프로메테우스가 수집한다.

## 환경 {#environments}

- **[도커](https://docs.docker.com)**: 포크한 샘플은 도커로 실행할 수 있다.
- **[쿠버네티스](https://kubernetes.io/)**: 애플리케이션은 헬름(Helm) 차트를
  사용하여 로컬과 클라우드의 쿠버네티스에서 실행되도록 설계되었다.

## 프로토콜 {#protocols}

- **[gRPC](https://grpc.io/)**: 마이크로서비스는 대량의 gRPC 호출을 사용하여
  서로 통신한다.
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**: 마이크로서비스는
  gRPC를 사용할 수 없거나 gRPC 지원이 충분하지 않은 경우 HTTP를 사용한다.

## 기타 컴포넌트 {#other-components}

- **[엔보이(Envoy)](https://www.envoyproxy.io/)**: 엔보이는 프론트엔드, 부하
  생성기, 피처 플래그 서비스와 같이 사용자가 접하는 웹 인터페이스의 리버스
  프록시로 사용된다.
- **[Locust](https://locust.io)**: 합성 부하 생성기를 사용하여 웹사이트에 실제와
  유사한 사용 패턴을 만드는 백그라운드 작업이다.
- **[오픈피처(OpenFeature)](https://openfeature.dev)**: 애플리케이션의 기능을
  활성화하거나 비활성화할 수 있는 피처 플래그 API와 SDK이다.
- **[flagd](https://flagd.dev)**: 데모 애플리케이션의 피처 플래그를 관리하는 데
  사용되는 피처 플래그 데몬이다.
