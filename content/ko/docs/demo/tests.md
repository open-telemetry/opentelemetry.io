---
title: 테스트
default_lang_commit: df7ca870f2ec59453948ced42ca0d76bfd5e53d5
cSpell:ignore: pytest
---

데모 저장소에는 두 가지 엔드 투 엔드 테스트 스위트(suite)가 포함되어 있으며, 둘
다 루트 디렉터리에서 `make`를 통해 실행한다.

## 프론트엔드 테스트 {#frontend-tests}

프론트엔드 테스트는 [Cypress](https://www.cypress.io/)를 사용하여 홈 페이지
탐색, 상품 페이지 열기, 결제 완료와 같은 웹 스토어의 주요 흐름을 테스트한다.
이미 실행 중인 데모를 대상으로 다음과 같이 실행한다.

```shell
make run-frontend-tests
```

## 텔레메트리 테스트 {#telemetry-tests}

텔레메트리 테스트는 각 서비스가 기대한 시그널을 실제로 전달하는지 확인하는,
컨테이너화된 [pytest](https://docs.pytest.org/) 테스트 스위트(suite)다. 서비스를
직접 검사하는 대신, 데모에서 제공하는 백엔드인 Jaeger(트레이스),
Prometheus(메트릭), OpenSearch(로그)를 통해 질의한다. 각 서비스가 생성해야 하는
시그널은
[`test/telemetry/services.py`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/services.py)에
선언되어 있다.

각 타깃은 데모를 시작하고 테스트 스위트를 실행한 뒤 데모를 다시 중지하므로,
데모가 중지된 상태에서 실행한다.

```shell
make run-telemetry-tests           # 모든 서비스
make run-telemetry-tests-minimal   # minimal 모드만
make run-telemetry-tests-agentic   # 에이전트, mcp, 챗봇 서비스
```

자세한 내용은
[텔레메트리 기본 동작 테스트(Telemetry Sanity Tests)](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test/telemetry)를
참고한다.
