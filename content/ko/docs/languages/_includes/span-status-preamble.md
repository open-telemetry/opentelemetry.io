---
default_lang_commit: c651bbf2a61f1ea643ae1d2ae89d496c58dbb56d
---

[스팬](/docs/concepts/signals/traces/#spans)에
[상태](/docs/concepts/signals/traces/#span-status)를 설정할 수 있으며,
일반적으로 스팬이 성공적으로 완료되지 않았음을 나타내는 `Error`를 지정하는 데
사용한다. 기본적으로 모든 스팬의 상태는 `Unset`이며, 이는 오류 없이 완료되었음을
의미한다. `Ok` 상태는 기본값인 `Unset`(즉, "오류 없음")을 유지하는 대신 스팬이
성공했음을 명시적으로 표시해야 할 때 사용한다.

상태는 스팬이 종료되기 전 언제든지 설정할 수 있다.
