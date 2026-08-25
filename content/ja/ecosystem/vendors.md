---
title: ベンダー
description: OpenTelemetry をネイティブにサポートするベンダー
aliases: [/vendors]
default_lang_commit: 5ccd63611a43a8c3b4a243dc995fb3755d46eafa
---

{{% include freeze-notice.md %}}

[OTLP](/docs/specs/otlp/) を介して OpenTelemetry をネイティブに利用するソリューション（オブザーバビリティバックエンドやオブザーバビリティパイプラインなど）を提供する組織の一覧です（すべてを網羅しているわけではありません）。

一部の組織は、追加機能や使いやすさの向上を目的とした（カスタマイズされた OpenTelemetry コンポーネントの）[ディストリビューション](/ecosystem/distributions/)を提供しています。

オープンソース（OSS）とは、[オープンソース](https://opensource.org/osd)のオブザーバビリティプロダクトを持つベンダーを指します。
そのベンダーが、顧客向けにオープンソースプロダクトをホストする SaaS 提供など、他にクローズドソースのプロダクトを持っている場合もあります。

{{% ecosystem/vendor-table %}}

## 組織の追加 {#how-to-add}

組織をリストに追加するには、[ベンダーリスト][vendors list]にエントリを追加した [PR を提出][submit a PR]してください。
エントリには以下を含める必要があります。

- あなたの製品が [OTLP](/docs/specs/otlp/) を介して OpenTelemetry をネイティブに利用する方法を詳しく説明するドキュメントへのリンク
- 該当する場合、ディストリビューションへのリンク
- 該当する場合、製品がオープンソースであることを証明するリンク。
  オープンソースのディストリビューションだけでは、製品を「オープンソース」としてマークする資格にはなりません。
- 質問がある場合に連絡できるよう、連絡先としての GitHub ハンドルまたはメールアドレス

このリストは、OpenTelemetry を利用し、[エンドユーザー](/community/end-user/)にオブザーバビリティを提供する組織のためのものです。

[エンドユーザー組織](https://www.cncf.io/enduser/)としてオブザーバビリティのために OpenTelemetry を採用しており、OpenTelemetry に関するいかなるサービスも提供していない場合は、[採用企業・団体](/ecosystem/adopters/)を参照してください。

OpenTelemetry を通じてオブザーバブルなライブラリ、サービス、またはアプリを提供する場合は、[インテグレーション](/ecosystem/integrations/)を参照してください。

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md vendor %}}

[vendors list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml
