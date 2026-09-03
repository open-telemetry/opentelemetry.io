---
title: インテグレーション
description: OpenTelemetry をファーストパーティでサポートするライブラリ、サービス、アプリケーション。
aliases: [/integrations]
default_lang_commit: 301a68c0bc3a170adfc8f1384f6788c8cebbf322
---

{{% include freeze-notice.md %}}

OpenTelemetry のミッションは、[高品質でポータブルなテレメトリーをユビキタスにすることで、効果的なオブザーバビリティを実現する](/community/mission/)ことです。
つまり、開発するソフトウェアにオブザーバビリティが組み込まれているべきです。

[ゼロコード計装ソリューション](/docs/concepts/instrumentation/zero-code)や[計装ライブラリ](/docs/specs/otel/overview/#instrumentation-libraries)を使った外部からの計装は、アプリケーションをオブザーバブルにする便利な方法です。
しかし、最終的にはすべてのアプリケーションが、ネイティブテレメトリーのために OpenTelemetry API と SDK を直接統合するか、そのソフトウェアのエコシステムに適合するファーストパーティプラグインを提供するべきだと私たちは考えています。

このページには、ネイティブ計装またはファーストパーティプラグインを提供するライブラリ、サービス、アプリケーションのサンプルが掲載されています。

## ライブラリ {#libraries}

OpenTelemetry によるネイティブライブラリ計装は、ユーザーにとってより優れたオブザーバビリティと開発者体験を提供し、ライブラリがフックを公開してドキュメント化する必要をなくします。
以下は、OpenTelemetry API を使用してすぐに利用可能なオブザーバビリティを提供するライブラリのリストです。

{{% ecosystem/integrations-table "native libraries" %}}

## アプリケーションとサービス {#applications-and-services}

以下のリストには、ネイティブテレメトリーのために OpenTelemetry API と SDK を直接統合したか、独自の拡張エコシステムに適合するファーストパーティプラグインを提供するライブラリ、サービス、アプリケーションのサンプルが含まれています。

オープンソースプロジェクト（OSS）がリストの先頭にあり、商用プロジェクトがそれに続きます。
[CNCF](https://www.cncf.io/) に所属するプロジェクトには、名前の横に CNCF のロゴが付いています。

{{% ecosystem/integrations-table "application integrations" %}}

## インテグレーションの追加 {#how-to-add}

ライブラリ、サービス、またはアプリケーションをリストに掲載するには、[レジストリ](/ecosystem/registry/adding)にエントリを追加した [PR を提出][submit a PR]してください。
エントリには以下を含める必要があります。

- ライブラリ、サービス、またはアプリケーションのメインページへのリンク
- OpenTelemetry を使用してオブザーバビリティを有効にする方法を説明するドキュメントへのリンク

> [!NOTE]
>
> ライブラリ、サービス、またはアプリケーションに対して OpenTelemetry の外部インテグレーションを提供している場合は、[レジストリへの追加を検討してください](/ecosystem/registry/adding)。
>
> エンドユーザーとしてオブザーバビリティのために OpenTelemetry を採用しており、OpenTelemetry に関連するサービスを提供していない場合は、[採用企業](/ecosystem/adopters)を参照してください。
>
> エンドユーザーにオブザーバビリティを提供するために OpenTelemetry を利用するソリューションを提供している場合は、[ベンダー](/ecosystem/vendors)を参照してください。

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md integration %}}
