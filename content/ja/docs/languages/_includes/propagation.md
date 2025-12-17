---
default_lang_commit: f9a0439ac56dba1515283e1a1cb6d6a90634a20f
---

コンテキスト伝搬により、[シグナル](/docs/concepts/signals/)は、生成される場所に関係なく、相互に関連付けることができます。
トレーシングに限定されませんが、コンテキスト伝搬により、[トレース](/docs/concepts/signals/traces/)は、プロセスとネットワークの境界を越えて任意に分散されたサービス間で、システムに関する因果関係の情報を構築できます。

大多数のユースケースでは、OpenTelemetryをネイティブにサポートするライブラリまたは[計装ライブラリ](../libraries/)が、自動的にサービス間でトレースコンテキストを伝搬します。
手動でコンテキストを伝搬する必要があるのは、まれなケースのみです。

{{ if $lang }}

詳細については、[コンテキスト伝搬](/docs/concepts/context-propagation)を参照してください。

{{ end }}

{{ if not $lang }}

<!-- prettier-ignore-start -->

コンテキスト伝搬を理解するには、コンテキストと伝搬（プロパゲーション）という2つの独立した概念を理解する必要があります。

<!-- prettier-ignore-end -->

{{ end }}
