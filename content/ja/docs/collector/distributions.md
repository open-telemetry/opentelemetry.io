---
title: ディストリビューション
weight: 25
default_lang_commit: dcd079d98e749febcefd4d7bb1da361770ec8ed3
---

OpenTelemetryプロジェクトは現在、コレクターの事前ビルド済み[ディストリビューション][distributions]を提供しています。
ディストリビューションに含まれるコンポーネントは、それぞれのディストリビューションの`manifest.yaml`で確認できます。

[distributions]: https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% ecosystem/distributions-table filter="first-party-collector" %}}

## カスタムディストリビューション {#custom-distributions}

OpenTelemetryプロジェクトが提供する既存のディストリビューションは、あなたのニーズに合わない場合があります。
たとえば、より軽量なバイナリを必要とする場合や、[認証拡張機能](../building/authenticator-extension)、[レシーバー](../building/receiver)、プロセッサー、エクスポーターまたは[コネクター](../building/connector)などのカスタム機能を実装する必要がある場合があります。
ディストリビューションを構築するためのツールである[ocb](../custom-collector)（OpenTelemetry Collector Builder）を使用して、独自のディストリビューションを作成できます。

## サードパーティディストリビューション {#third-party-distributions}

一部の組織は、追加機能を持つコレクターディストリビューションや、使いやすさを向上させたコレクターディストリビューションを提供しています。
以下は、サードパーティが保守するコレクターディストリビューションのリストです。

{{% ecosystem/distributions-table filter="third-party-collector" %}}

## コレクターディストリビューションの追加 {#how-to-add}

あなたのコレクターディストリビューションをリストに追加するには、[ディストリビューションリスト][distributions list]にエントリを追加した[PRを提出][submit a PR]してください。
エントリには以下を含める必要があります。

- ディストリビューションのメインページへのリンク
- ディストリビューションの使用方法を説明するドキュメントへのリンク
- 質問がある場合に連絡できるよう、連絡先としてのGitHubハンドルまたはメールアドレス

[submit a PR]: /docs/contributing/pull-requests/
[distributions list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
