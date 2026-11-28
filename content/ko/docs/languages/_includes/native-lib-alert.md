---
default_lang_commit: 3c96d90486204d2ebebb2d88f146fb650a0b5fab
---

{{ if $noIntegrations }}

> [!IMPORTANT] 도움이 필요하다
>
> 현재 오픈텔레메트리가 자체적으로 통합된 {{ $name }} 라이브러리는 알려진 것이
> 없다. 이러한 라이브러리를 알고 있다면 [알려 주기 바란다][new-issue].

{{ end }}

{{ if not $noIntegrations }}

> [!IMPORTANT] 도움이 필요하다
>
> 오픈텔레메트리가 자체적으로 통합된 {{ $name }} 라이브러리를 알고 있다면 [알려
> 주기 바란다][new-issue].

{{ end }}

[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
