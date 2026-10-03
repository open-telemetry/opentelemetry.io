---
title: 쿠버네티스 배포
linkTitle: 쿠버네티스
aliases: [kubernetes_deployment]
cSpell:ignore: loadgen otlphttp spanmetrics
default_lang_commit: 4309389695c38fee3cb6e68bf1186e4a99d5da4c
---

기존 쿠버네티스 클러스터에 데모를 배포하는 데 도움이 되도록
[오픈텔레메트리 데모 Helm 차트](/docs/platforms/kubernetes/helm/demo/)를
제공한다.

차트를 사용하려면 [Helm](https://helm.sh)을 설치해야 한다. 시작하려면 Helm
[문서](https://helm.sh/docs/)를 참고한다.

## 사전 요구 사항 {#prerequisites}

- 쿠버네티스 1.24 이상
- 애플리케이션을 위한 6GB의 여유 RAM
- Helm 3.14 이상(Helm 설치 방식에만 해당)

## Helm을 사용하여 설치하기 {#install-using-helm}

오픈텔레메트리 Helm 저장소를 추가한다.

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

차트를 my-otel-demo라는 릴리스 이름으로 설치하려면 다음 명령어를 실행한다.

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

<!-- markdownlint-disable no-blanks-blockquote -->

> [!NOTE]
>
> 오픈텔레메트리 데모 Helm 차트는 한 버전에서 다른 버전으로 업그레이드하는
> 기능을 지원하지 않는다. 차트를 업그레이드해야 하는 경우 먼저 기존 릴리스를
> 삭제한 후 새 버전을 설치해야 한다.

> [!NOTE]
>
> 아래에 설명된 모든 사용 방법을 실행하려면 오픈텔레메트리 데모 Helm 차트 버전
> 0.11.0 이상이 필요하다.

### Helm을 사용하여 쿠버네티스 매니페스트 생성하기 {#use-helm-to-generate-a-kubernetes-manifests}

다음 명령어는 필요한 모든 리소스의 정의가 포함된 단일 쿠버네티스 매니페스트
파일을 생성한다. 생성 후 `kubectl apply -f opentelemetry-demo.yaml`을 사용하여
이 매니페스트를 적용할 수 있다.

```shell
helm template opentelemetry-demo open-telemetry/opentelemetry-demo --namespace otel-demo > opentelemetry-demo.yaml
```

> [!NOTE]
>
> 오픈텔레메트리 데모 쿠버네티스 매니페스트는 한 버전에서 다른 버전으로
> 업그레이드하는 기능을 지원하지 않는다. 데모를 업그레이드해야 하는 경우 먼저
> 기존 리소스를 삭제한 후 새 버전을 설치해야 한다.

## 데모 사용하기 {#use-the-demo}

데모 애플리케이션을 사용하려면 서비스를 쿠버네티스 클러스터 외부에 노출해야
한다. `kubectl port-forward` 명령어를 사용하거나, 필요에 따라 배포한
인그레스 리소스와 함께 서비스 유형(예: 로드밸런서)을 구성하여 서비스를
로컬 시스템에 노출할 수 있다.

### kubectl port-forward를 사용하여 서비스 노출하기 {#expose-services-using-kubectl-port-forward}

frontend-proxy 서비스를 노출하려면 다음 명령어를 사용한다(`default`를 Helm
차트가 릴리스된 네임스페이스에 맞게 변경한다).

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

> [!NOTE]
>
> 프로세스가 종료될 때까지 `kubectl port-forward`가 포트를 프록시한다.
> `kubectl port-forward`를 사용할 때마다 별도의 터미널 세션을 만들어야 할 수
> 있으며, 작업이 끝나면 <kbd>Ctrl-C</kbd>를 사용하여 프로세스를 종료한다.

frontend-proxy 포트 포워딩을 설정하면 다음 항목에 접근할 수 있다.

- 웹 스토어: <http://localhost:8080/>
- 그라파나(Grafana): <http://localhost:8080/grafana/>
- 부하 생성기 UI(Load Generator UI): <http://localhost:8080/loadgen/>
- 예거(Jaeger) UI: <http://localhost:8080/jaeger/ui/>
- Flagd 구성기 UI(Flagd configurator UI): <http://localhost:8080/feature>

### 서비스 또는 인그레스 구성으로 데모 컴포넌트 노출하기 {#expose-demo-components-using-service-or-ingress-configurations}

> [!NOTE]
>
> 추가 구성 옵션을 지정할 수 있도록 Helm 차트를 설치할 때 values 파일을 사용하는
> 것을 권장한다.

#### 인그레스(Ingress) 리소스 구성하기 {#configure-ingress-resources}

> [!NOTE]
>
> 쿠버네티스 클러스터에는 로드밸런서 서비스 유형 또는 인그레스(Ingress) 리소스를
> 활성화하는 데 필요한 인프라 컴포넌트가 없을 수 있다. 이러한 구성 옵션을
> 사용하기 전에 클러스터가 필요한 기능을 지원하는지 확인한다.

각 데모 컴포넌트(예: frontend-proxy)는 쿠버네티스 서비스 유형을 구성하는 방법을
제공한다. 기본적으로 인그레스 리소스는 생성되지 않지만 각 컴포넌트의
`ingress` 속성을 통해 활성화하고 구성할 수 있다.

frontend-proxy 컴포넌트가 인그레스 리소스를 사용하도록 구성하려면
values 파일에 다음 내용을 지정한다.

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

일부 인그레스 컨트롤러에는 특별한 어노테이션 또는 서비스 유형이 필요하다. 자세한
내용은 사용하는 인그레스 컨트롤러의 문서를 참고한다.

#### 서비스 유형 구성하기 {#configure-service-types}

각 데모 컴포넌트(예: frontend-proxy)는 쿠버네티스 서비스 유형을 구성하는 방법을
제공한다. 기본값은 `ClusterIP`이지만 각 컴포넌트의 `service.type` 속성을
사용하여 변경할 수 있다.

frontend-proxy 컴포넌트가 로드밸런서 서비스 유형을 사용하도록 구성하려면 values
파일에 다음 내용을 지정한다.

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

#### 브라우저 텔레메트리 구성하기 {#configure-browser-telemetry}

브라우저의 스팬을 올바르게 수집하려면 오픈텔레메트리(OpenTelemetry) 컬렉터가
노출된 위치도 지정해야 한다. frontend-proxy는 `/otlp-http` 경로 접두사를
사용하여 컬렉터로 연결되는 경로를 정의한다. frontend 컴포넌트에 다음 환경 변수를
설정하여 컬렉터 엔드포인트를 구성할 수 있다.

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## 자체 백엔드 사용하기 {#bring-your-own-backend}

웹 스토어를 이미 사용 중인 옵저버빌리티 백엔드(예: 기존 Jaeger나 Zipkin 인스턴스
또는 [원하는 벤더](/ecosystem/vendors/))를 위한 데모 애플리케이션으로 활용하려는
경우가 많다.

Helm 차트는 오픈텔레메트리(OpenTelemetry) 컬렉터 구성을 제공한다. 추가한 모든
내용은 기본 구성에 병합된다.

사용자 정의 파일(예: `my-values-file.yaml`)을 만들고 원하는 파이프라인에 자체
익스포터를 추가할 수 있다.

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

> [!NOTE]
>
> Helm으로 YAML 값을 병합할 때 객체는 병합되고 배열은 대체된다. `traces`
> 파이프라인의 익스포터 배열을 재정의하는 경우 `spanmetrics` 익스포터를 배열에
> 포함해야 한다. 이 익스포터를 포함하지 않으면 오류가 발생한다.

벤더 백엔드에 인증을 위한 추가 매개변수를 추가해야 할 수 있으므로 해당 문서를
확인한다. 일부 백엔드에는 다른 익스포터가 필요하다. 필요한 익스포터와 관련
문서는
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter)를
참고한다.

사용자 정의 `my-values-file.yaml` values 파일과 함께 Helm 차트를 설치하려면 다음
명령어를 사용한다.

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
