---
default_lang_commit: 1ececa0615b64c5dfd93fd6393f3e4052e0cc496
---

[계측](/docs/concepts/instrumentation/)은 앱에 옵저버빌리티 코드를 직접 추가하는
작업이다.

앱을 계측한다면 해당 언어의 오픈텔레메트리(OpenTelemetry) SDK를 사용해야 한다.
SDK로 오픈텔레메트리를 초기화하고 API로 코드를 계측한다. 그러면 앱과 설치한
라이브러리 중 계측이 포함된 라이브러리에서 텔레메트리를 내보낸다.

라이브러리를 계측한다면 해당 언어의 오픈텔레메트리 API 패키지만 설치한다.
라이브러리는 자체적으로 텔레메트리를 내보내지 않는다. 오픈텔레메트리 SDK를
사용하는 앱의 일부일 때만 텔레메트리를 내보낸다. 라이브러리 계측에 대한 자세한
내용은 [라이브러리](/docs/concepts/instrumentation/libraries/)를 참고한다.

오픈텔레메트리 API와 SDK에 대한 자세한 내용은 [명세](/docs/specs/otel/)를
참고한다.
