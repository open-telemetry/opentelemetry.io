---
title: Flagd-UI 서비스
linkTitle: Flagd-UI
aliases: [flagd-uiservice]
default_lang_commit: 753d9126150332a7949bbe32683a83b7d215d4b2
cSpell:ignore: uiservice
---

이 서비스는 사용자가 피처 플래그를 활성화·비활성화하고 편집하여 데모 환경의
동작을 변경할 수 있는 프론트엔드 역할을 한다.

[Flagd-UI 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/)

## 트레이싱 초기화하기 {#initializing-tracing}

Phoenix 엔드포인트와 요청의 자동 계측에 필요한 의존성을 설치한 후,
[공식 문서](/docs/languages/erlang/getting-started/)에 따라 `config/runtime.exs`
파일을 편집하여 설정한다.

```elixir
otel_endpoint =
  System.get_env("OTEL_EXPORTER_OTLP_ENDPOINT") ||
    raise """
    environment variable OTEL_EXPORTER_OTLP_ENDPOINT is missing.
    """

config :opentelemetry, :processors,
    otel_batch_processor: %{
      exporter: {:opentelemetry_exporter, %{endpoints: [otel_endpoint]}}
    }
```

또한
[`lib/flagd_ui/application.ex`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/lib/flagd_ui/application.ex)에서
오픈텔레메트리 Bandit 어댑터와 Phoenix 라이브러리를 초기화한다.

```elixir
OpentelemetryBandit.setup()
OpentelemetryPhoenix.setup(adapter: :bandit)
```

## 트레이스 {#traces}

Phoenix와 Bandit은 전용 라이브러리를 통해 자동으로 계측된다.

## 메트릭 {#metrics}

추후 작성 예정

## 로그 {#logs}

추후 작성 예정
