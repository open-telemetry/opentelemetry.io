---
title: サードパーティディストリビューション
linkTitle: ディストリビューション
description: サードパーティが保守するオープンソースの OpenTelemetry ディストリビューションの一覧。
default_lang_commit: 5ccd63611a43a8c3b4a243dc995fb3755d46eafa
---

{{% include freeze-notice.md %}}

OpenTelemetry の[ディストリビューション][distributions]は、特定のオブザーバビリティバックエンドでのデプロイや使用を容易にするために OpenTelemetry の[コンポーネント][components]をカスタマイズする方法です。

サードパーティは誰でも、バックエンド、[ベンダー][vendor]、またはエンドユーザー固有の変更を加えて OpenTelemetry コンポーネントをカスタマイズできます。
ディストリビューションなしで OpenTelemetry コンポーネントを使用することもできますが、ベンダーが特定の要件を持っている場合など、ディストリビューションを使うことで簡単になるケースもあります。

以下のリストには、Collector 以外の OpenTelemetry ディストリビューションと、それらがカスタマイズするコンポーネントのサンプルが含まれています。
[OpenTelemetry Collector](/docs/collector/) のディストリビューションについては、[Collector ディストリビューション](/docs/collector/distributions/)を参照してください。

{{% ecosystem/distributions-table filter="non-collector" %}}

## ディストリビューションの追加 {#how-to-add}

ディストリビューションをリストに追加するには、[ディストリビューションリスト][distributions list]にエントリを追加した [PR を提出][submit a PR]してください。
エントリには以下を含める必要があります。

- ディストリビューションのメインページへのリンク
- ディストリビューションの使用方法を説明するドキュメントへのリンク
- ディストリビューションに含まれるコンポーネントの一覧
- 質問がある場合に連絡できるよう、連絡先としての GitHub ハンドルまたはメールアドレス

> [!NOTE]
>
> - OpenTelemetry のあらゆる種類のライブラリ、サービス、またはアプリに対する外部インテグレーションを提供する場合は、[レジストリへの追加](/ecosystem/registry/adding)を検討してください。
> - エンドユーザーとしてオブザーバビリティのために OpenTelemetry を採用しており、OpenTelemetry に関するいかなるサービスも提供していない場合は、[採用企業・団体](/ecosystem/adopters)を参照してください。
> - エンドユーザーにオブザーバビリティを提供するために OpenTelemetry を利用するソリューションを提供している場合は、[ベンダー](/ecosystem/vendors)を参照してください。

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md distribution %}}

[components]: /docs/concepts/components/
[distributions]: /docs/concepts/distributions/
[distributions list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
[vendor]: ../vendors/
