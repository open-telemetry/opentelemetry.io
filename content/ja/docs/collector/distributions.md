---
title: ディストリビューション
weight: 25
default_lang_commit: 8d115a9df96c52dbbb3f96c05a843390d90a9800
---

OpenTelemetryプロジェクトは現在、コレクターの[事前ビルド済みディストリビューション][pre-built distributions]を提供しています。
各[ディストリビューション][distributions]に含まれるコンポーネントは、それぞれのディストリビューションの`manifest.yaml`で確認できます。

[pre-built distributions]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[distributions]: https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% docs/latest-release collector-releases /%}}

## カスタムディストリビューション {#custom-distributions}

さまざまな理由により、OpenTelemetryプロジェクトが提供する既存のディストリビューションは、あなたのニーズに合わない場合があります。
より軽量な構成が必要な場合や、[認証拡張機能](../building/authenticator-extension)、[レシーバー](../building/receiver)、プロセッサー、エクスポーターまたは[コネクター](../building/connector)などのカスタム機能を実装する必要がある場合があります。
ディストリビューションを構築するためのツールである[ocb](../custom-collector)を使用して、独自のディストリビューションを作成できます。
