---
default_lang_commit: 58e684763e8dd50a07ef5fbf428303973025428a
---

오픈텔레메트리(OpenTelemetry) {{ $name }} 문서에 온 것을 환영한다. 이 절에서는
오픈텔레메트리 API와 SDK를 사용하여 {{ $name }}에서 메트릭, 로그, 트레이스 등의
텔레메트리 데이터를 생성하고 수집하는 방법을 소개한다.

이 페이지들은 오픈텔레메트리 {{ $name }}를 시작하고 현재 기능과 상태를 이해하는
데 도움을 주기 위한 것이다.

## 상태와 릴리스 {#status-and-releases}

오픈텔레메트리 {{ $name }}의 주요 기능 컴포넌트의 현재 상태는 다음과 같다.

| 트레이스            | 메트릭               | 로그              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

[최신 릴리스][latest release]를 포함한 릴리스 정보는 [릴리스][Releases]를
참고한다. {{ $.Inner }}

[latest release]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
