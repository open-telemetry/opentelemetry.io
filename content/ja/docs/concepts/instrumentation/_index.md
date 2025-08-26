---
title: 計装
description: OpenTelemetryはどのように計装を促進するか
weight: 15
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
---

システムを[観測可能][observable]にするため、システムが **計装** されなければなりません。
つまり、システムコンポーネントのコードが[トレース][traces]、[メトリクス][metrics]、[ログ][logs]といった[シグナル][signals]を送出しなければなりません。

OpenTelemetry を使えば、主に2つの方法でコードを計装できます。

1. 公式の[各言語向けのAPIとSDK](/docs/languages/)を使った[コードベースソリューション](code-based/)
2. [ゼロコードソリューション](zero-code/)

**コードベース** ソリューションは、より深い洞察とリッチなテレメトリーをアプリケーション自身から得ることを可能にします。
OpenTelemetry APIを使ってアプリケーションからテレメトリーを生成でき、ゼロコードソリューションによって生成されたテレメトリーを補完する重要な役割を果たします。

**ゼロコード** ソリューションは、テレメトリーの取得を初めて行うときや、テレメトリーを取得する必要のあるアプリケーションを修正できない時に最適です。
それらは、あなたが使用しているライブラリや、アプリケーションが動作している環境から、豊富なテレメトリーを提供します。
別の考え方をすれば、アプリケーションの _エッジで_ 何が起こっているかについての情報を提供する、ということです。

両方のソリューションを同時に使うこともできます。

## OpenTelemetryのその他の利点 {#additional-opentelemetry-benefits}

OpenTelemetryが提供するのは、ゼロコードやコードベースのテレメトリーソリューションだけではありません。
以下のものもOpenTelemetryの一部です。

- ライブラリは依存関係として OpenTelemetry API を活用することができ、OpenTelemetry SDK がインポートされない限り、そのライブラリを使用するアプリケーションに影響はありません。
- それぞれの[シグナル][signals](トレース、メトリクス、ログ)に対して、それらを作成、処理、エクスポートするためのいくつかの方法が用意されています。
- [コンテキスト伝播](../context-propagation/)が実装に組み込まれているので、シグナルがどこで生成されたかに関係なく、シグナルを相関させられます。
- [リソース](../resources/)と[計装スコープ](/docs/concepts/instrumentation-scope)は、[ホスト](/docs/specs/semconv/resource/host/)、[オペレーティングシステム](/docs/specs/semconv/resource/os/)、[Kubernetesクラスター](/docs/specs/semconv/resource/k8s/#cluster)のように、異なるエンティティごとにシグナルをグループ化できます。
- APIとSDKの各言語固有の実装は、[OpenTelemetry仕様](/docs/specs/otel/)の要件と期待に従います。
- [セマンティック規約](../semantic-conventions/)は、コードベースやプラットフォーム間で標準化のために使用できる共通の命名スキーマを提供します。

[logs]: ../signals/logs/
[metrics]: ../signals/metrics/
[observable]: ../observability-primer/#what-is-observability
[signals]: ../signals/
[traces]: ../signals/traces/
