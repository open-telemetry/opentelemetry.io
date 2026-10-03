---
title: Docker 배포
linkTitle: Docker
aliases: [docker_deployment]
cSpell:ignore: Firepit span_metrics
default_lang_commit: 944f1dc350e95a68e89edc2407dea0085671dd4c
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## 사전 요구 사항 {#prerequisites}

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0.0 이상
- Make(선택 사항)
- 애플리케이션을 위한 6GB의 RAM([최소 모드](#deployment-modes)를 사용하면 약
  3GB)
- 14GB의 디스크 공간

## 데모 가져와 실행하기 {#get-and-run-the-demo}

1.  데모 저장소를 복제한다.

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2.  데모 폴더로 이동한다.

    ```shell
    cd opentelemetry-demo/
    ```

3.  데모를 시작한다[^1].

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    > [!NOTE]
    >
    > 별도 옵션 없이 `docker compose up`을 실행하면 `compose.yaml`만 로드된다.
    > 웹 스토어는 시작되지만 Kafka와 옵저버빌리티 백엔드가 실행되지 않아
    > 텔레메트리를 확인할 수 없다. 위 예시와 같이 파일을 직접 지정하거나
    > `make start`를 사용한다.

    ### 배포 모드 {#deployment-modes}

    데모는 여러 배포 모드를 지원한다. 기본 `make start`는 모든 서비스와
    옵저버빌리티 스택을 포함한 전체 데모를 실행한다. 다른 모드를 사용하면 리소스
    사용량을 줄이거나 특정 컴포넌트를 제외할 수 있다.

    | 모드 | Make 대상 | 설명 |
    | --- | --- | --- |
    | Full | `make start` | 모든 서비스와 옵저버빌리티 백엔드(기본값) |
    | Minimal | `make start-minimal` | Kafka와 이에 의존하는 서비스(`accounting`, `fraud-detection`, `kafka`)를 제외하여 메모리 사용량을 약 3GB로 줄이는 모드 |
    | No observability | `make start-no-o11y` | 옵저버빌리티 백엔드(Jaeger, Grafana, Prometheus, OpenSearch)를 제외한 모든 서비스 |
    | Minimal, no observability | `make start-minimal-no-o11y` | 옵저버빌리티 백엔드를 제외한 최소 서비스 |
    | Profiling | `make start-profiling` | 프로파일링 데이터를 위한 eBPF 프로파일러와 [Firepit](https://github.com/florianl/firepit) UI를 포함한 전체 모드 |
    | Agentic | `make start-agentic` | 데모와 상호 작용하기 위한 AI 에이전트, MCP 서버, 챗봇을 포함한 전체 모드 |

    예를 들어 데모를 최소 모드로 시작하려면 다음 명령어를 실행한다.

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-minimal
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    ### AI 에이전트와 함께 실행하기 {#run-with-the-ai-agent}

    에이전트, MCP 서버, 챗봇은 기본적으로 시작되지 않는다. 이를 추가하려면 다음
    명령어를 실행한다[^1].

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-agentic
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  -f compose.agent.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    이 명령어는 <http://localhost:8080/chatbot/>에 Chatbot UI를 추가한다. 기본적으로
    에이전트는 기록된 LLM 응답을 재생하므로(`USE_VCR=True`) API 키가 필요하지
    않다. 실제 LLM과 대화하려면 `.env.override`에서 `LLM_BASE_URL`, `LLM_MODEL`,
    `API_KEY`를 설정한다.

    ### 지속적 프로파일링과 함께 실행하기 {#run-with-continuous-profiling}

    eBPF 프로파일러와 Firepit 프로파일링 UI를 추가하려면 다음 명령어를
    실행한다[^1].

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-profiling
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.profiling.yaml \
  -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    프로파일은 <http://localhost:8080/profiles/>에서 확인할 수 있다.

4. (선택 사항) 텔레메트리 정상 동작 테스트를 실행한다.

    데모에는 각 서비스가 트레이스, 메트릭, 로그를 생성하고 해당 데이터가 예상된
    백엔드(Jaeger, Prometheus, OpenSearch)에 도달하는지 확인하는 텔레메트리 정상
    동작 테스트 모음이 포함되어 있다. 자세한 내용은
    [test/telemetry/README.md](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/README.md)를
    참고한다.

    | 테스트 범위 | Make 대상 | 시작 항목 |
    | --- | --- | --- |
    | Full | `make run-telemetry-tests` | 전체 배포(`make start`) |
    | Minimal | `make run-telemetry-tests-minimal` | 최소 배포(`make start-minimal`) |
    | Agentic | `make run-telemetry-tests-agentic` | 에이전틱 배포(에이전트, MCP, 챗봇 포함) |

    각 대상은 `./test/telemetry`에서 테스트 이미지를 빌드하고 해당 배포를 시작한 뒤
    테스트를 실행하고 데모를 종료한다.

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-telemetry-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
# The demo must be running before you start the tests.
docker build -t opentelemetry-demo-telemetry-tests ./test/telemetry
docker run --rm --network opentelemetry-demo \
  --env-file .env --env-file .env.override \
  -e TEST_SCOPE=full \
  opentelemetry-demo-telemetry-tests
```

    {{% /tab %}} {{< /tabpane >}}

5. (선택 사항) 프런트엔드 엔드 투 엔드 테스트를 실행한다[^1].

    Cypress 프런트엔드 테스트는 이미 실행 중인 데모를 대상으로 실행된다.

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-frontend-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  -f compose.tests.yaml \
  run frontendTests
```

    {{% /tab %}} {{< /tabpane >}}

## 웹 스토어와 텔레메트리 확인하기 {#verify-the-web-store-and-telemetry}

이미지가 빌드되고 컨테이너가 시작되면 다음 항목에 접근할 수 있다.

- Web store: <http://localhost:8080/>
- Load Generator UI: <http://localhost:8080/loadgen/>
- Flagd configurator UI: <http://localhost:8080/feature>
- 텔레메트리 문서(Weaver에서 생성): <http://localhost:8080/telemetry/>

옵저버빌리티 스택이 실행 중일 때(즉, `*-no-o11y` 모드가 아닐 때) 다음 항목에
접근할 수 있다.

- Grafana: <http://localhost:8080/grafana/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- OpAMP UI: <http://localhost:8080/opamp/>

다음 항목은 특정 배포 모드에서만 접근할 수 있다.

- Firepit UI(프로파일링 모드): <http://localhost:8080/profiles/>
- Chatbot(에이전틱 모드): <http://localhost:8080/chatbot/>

## 데모의 기본 포트 번호 변경하기 {#changing-the-demos-primary-port-number}

기본적으로 데모 애플리케이션은 8080 포트에 바인딩된 모든 브라우저 트래픽을 위한
프록시를 시작한다. 포트 번호를 변경하려면 데모를 시작하기 전에 `ENVOY_PORT` 환경
변수를 설정한다.

- 예를 들어 8081 포트를 사용하려면 다음 명령어를 실행한다[^1].

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## 자체 백엔드 사용하기 {#bring-your-own-backend}

웹 스토어를 이미 사용 중인 옵저버빌리티 백엔드(예: 기존 Jaeger나 Zipkin 인스턴스
또는 [원하는 벤더](/ecosystem/vendors/))를 위한 데모 애플리케이션으로 활용하려는
경우가 많다.

OpenTelemetry Collector는 텔레메트리 데이터를 여러 백엔드로 내보내는 데 사용할
수 있다. 데모 애플리케이션의 컬렉터 구성은 여러 파일로 나뉘며, 각 파일은 앞서
적용된 구성 위에 순서대로 병합된다. 데모를 시작하는 방식에 따라 로드되는 파일이
달라진다.

- `otelcol-config.yml` — 항상 로드되는 기본 구성
- `otelcol-config-full.yml` — Kafka와 같이 전체 데모에서만 실행되는 서비스의
  리시버 추가
- `otelcol-config-observability.yml` — 함께 제공되는 백엔드(Jaeger, Prometheus,
  OpenSearch) 연결
- `otelcol-config-extras.yml` — 항상 마지막에 로드되는 사용자 정의 추가 구성

`make start`와 `make start-minimal`은 네 파일을 모두 로드한다. 옵저버빌리티 스택
없이 데모를 시작하면 로드하는 파일 수가 줄어들지만 `otelcol-config-extras.yml`은
항상 마지막에 적용되므로 모든 모드에서 사용자 변경 사항이 우선한다.

백엔드를 추가하려면 편집기로
[src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml)
파일을 연다.

- 먼저 새 익스포터를 추가한다. 예를 들어 백엔드가 HTTP를 통한 OTLP를 지원한다면
  다음을 추가한다.

  ```yaml
  exporters:
    otlp_http/example:
      endpoint: <your-endpoint-url>
  ```

- 그런 다음 백엔드에 사용할 텔레메트리 파이프라인의 `exporters`를 재정의한다.

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [debug, otlp_grpc/jaeger, span_metrics, otlp_http/example]
  ```

> [!NOTE]
>
> 컬렉터에서 YAML 값을 병합하면 객체는 서로 병합되지만 배열은 대체된다.
> `span_metrics` 커넥터는 트레이스와 메트릭을 연결하는 역할을 하므로, 해당
> 파이프라인을 재정의할 때도 트레이스 파이프라인의 `exporters`와 메트릭
> 파이프라인의 `receivers`에 반드시 남겨 두어야 한다. 이를 생략하면 컬렉터가
> 비정상 종료된다. `span_metrics` 외의 익스포터는 모두 선택 사항이며, 생략한
> 익스포터에 해당하는 백엔드로는 데이터가 전송되지 않는다. 업스트림 구성에
> 정의된 익스포터 이름은 다음과 같다.
>
> - **traces**: `debug`, `otlp_grpc/jaeger`, `span_metrics` _(필수)_
> - **metrics**: `debug`, `otlp_http/prometheus`
> - **logs**: `debug`, `opensearch`

벤더 백엔드에 인증용 매개변수를 추가해야 할 수도 있으므로 해당 백엔드의 문서를
확인한다. 백엔드에 따라 다른 익스포터가 필요할 수도 있다. 사용 가능한 익스포터와
각 익스포터의 문서는
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter)에서
확인할 수 있다.

`otelcol-config-extras.yml`을 업데이트한 다음 `make start`를 실행하여 데모를
시작한다. 잠시 기다리면 백엔드로 트레이스가 전송되는 것을 확인할 수 있다.

[^1]: {{% param notes.docker-compose-v2 %}}
