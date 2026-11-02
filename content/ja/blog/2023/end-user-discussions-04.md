---
title: 2023年4月の OpenTelemetry エンドユーザーディスカッションまとめ
linkTitle: エンドユーザーディスカッション 2023年4月
date: 2023-05-11
author: '[Pranay Prateek](https://github.com/pranay01) (SigNoz)'
default_lang_commit: 8199ade1531c1ba2227224eb6d328fd54c934e92
---

2023年4月、OpenTelemetry のエンドユーザーグループミーティングは、アジア太平洋（APAC）地域のユーザーを対象に開催されました。
KubeCon EU の開催に伴い、AMER および EMEA のセッションは実施されませんでしたが、5月には全3地域でミーティングを再開する予定です。

ディスカッションは [Lean Coffee 形式](https://agilecoffee.com/leancoffee/)で行われ、参加者は[このような Agile Coffee ボード](http://agile.coffee/?http_ok#2f83c1c1-918c-4c78-8671-194b2e9d8e54)にトピックを投稿し、出席者全員が話したいテーマに投票します。

## 話し合ったこと {#what-we-talked-about}

大規模な組織における OpenTelemetry 導入の普及について話し合い、スケールに応じたオブザーバビリティデータの最適化についても議論しました。

## ディスカッションのハイライト {#discussion-highlights}

以下は今月のディスカッションのまとめです。

<i>注: 回答は OTel コミュニティメンバーとエンドユーザーがそれぞれの知見に基づいて提供したものです。
これらの回答は OpenTelemetry による公式な推奨事項ではありません。</i>

### 大規模な組織における OpenTelemetry 導入の普及 {#evangelizing-adoption-of-opentelemetry-in-a-big-organization}

**Q:** 大規模な組織で OpenTelemetry の導入をどのように普及させますか？

**A:** 大規模な組織では、最初のステップとして、現在のオブザーバビリティの課題をリーダーシップに提示することが重要です。
オブザーバビリティのオープンソース標準を持つことには利点があります。
標準がなければ、異なるチーム間でのコミュニケーションが非常に困難になります。
OpenTelemetry を使用すれば、ベンダーのエージェントに依存する必要がなく、データを複数のバックエンドに送信する柔軟性が得られます。

### スケールに応じたオブザーバビリティデータの最適化 {#how-to-optimize-observability-data-at-scale}

**Q:** 大規模な組織では、オブザーバビリティデータは1日あたり TB 規模になることがあり、それに伴うコストが発生します。
しかし、キャプチャされたデータの 80% は使用不可能であるという感覚が常にあります。
どのベンダーも、どのデータがアクセスされているかを理解し、データを送信しているエンジニアリングチームにその可視性をもたらす方法を提供してくれません。

**A:** スケールに応じてオブザーバビリティを最適化する方法の1つはサンプリングです。
[OpenTelemetry でのテイルサンプリング](/blog/2022/tail-sampling/)に関する記事をご覧ください。
SDK レベルおよび Collector レベルでデータ量を削減するためのさまざまなオプションがあります。

また、OpenTelemetry Collector 側では、大規模なデータをより効率的に処理するための作業が進行中です。
たとえば、ネットワークコストを最適化するためにシリアライゼーションに [Apache Arrow](https://github.com/open-telemetry/oteps/pull/171) を使用する取り組みが行われています。

スケールに応じてオブザーバビリティデータを最適化するもう1つの方法は、将来の使用のためにどれだけのデータを保存するかを決めることです。
コストを抑えるために、データストレージを最適化すべきです。

## その他の重要なディスカッションポイント {#other-important-discussion-points}

### OpenTelemetry の成熟度モデル {#maturity-model-for-opentelemetry}

**Q:** 組織における OTel 導入の成熟度レベルに到達するためのステップを理解するための文献はありますか？
たとえば、チームに対して「まず X から始めて、次に Y を行って前進する」と伝えられるようなものです。
大規模な企業では、OpenTelemetry の成熟度を理解するための指針を提供する必要があります。

**A:** OpenTelemetry を導入するチームにとって、最小限の変更から始めるのがよいアイデアです。
たとえば、自動計装をサポートしている言語から始めることができます。
小さな変更から価値を実感することで、チームが OpenTelemetry の導入をより深く進める自信を構築できます。

OpenTelemetry には多数のレシーバーが[利用可能](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/944d4a82c408d58f9d8ba1a1d4783094301af0de/receiver?from_branch=main)です。
これらのレシーバーは、エンドユーザーがすでに持っているテレメトリーを収集するのに役立ちます。
たとえば、[Prometheus レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/c9585747e97d1ba5a0aae3bee72eaf76438951f4/receiver/prometheusreceiver/README.md?from_branch=main)を使用すると、Prometheus 形式のメトリクスデータを受信できます。
これらのレシーバーを使用すると、アプリケーションのさまざまなコンポーネントからテレメトリーデータの送信を開始できます。

## ミーティングノートと録画 {#meeting-notes--recordings}

上記のトピックをさらに詳しく知るには、以下をご確認ください。

- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4)
  ミーティングノート

## 参加しませんか {#join-us}

OpenTelemetry を組織でどのように活用しているかのストーリーを共有したい方は、ぜひお聞かせください！
共有方法:

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-endusers チャンネル](/community/end-user/#slack)に参加する
- 毎月開催の[エンドユーザーディスカッショングループ](/community/end-user/#podcast)に参加する
- [OTel in Practice](/community/end-user/otel-in-practice/) セッションに参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)でストーリーを共有する

OpenTelemetry を [Mastodon](https://fosstodon.org/@opentelemetry) や [Twitter](https://twitter.com/opentelemetry) でフォローし、**#OpenTelemetry** ハッシュタグを使ってストーリーを共有してください！
