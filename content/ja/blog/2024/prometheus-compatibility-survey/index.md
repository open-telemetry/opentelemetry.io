---
title: Prometheus 互換性サーベイからの洞察
linkTitle: Prometheus 互換性サーベイ
date: 2024-07-25
author: '[David Ashpole](https://github.com/dashpole) (Google)'
issue: https://github.com/open-telemetry/sig-end-user/issues/24
sig: End-User SIG
default_lang_commit: 153b29255cbd81f4f3d8abe1841d0763074aad9d
cSpell:ignore: Ashpole
---

[Prometheus](https://prometheus.io/) と OpenTelemetry は、[CNCF オブザーバビリティランドスケープ](https://landscape.cncf.io/guide#observability-and-analysis--observability)で最も活発で人気のあるプロジェクトの 2 つです。
両コミュニティは OpenTelemetry の初期から協力し、2 つのプロジェクト間の互換性向上に取り組んできました。
OpenTelemetry Prometheus SIG がこの取り組みを主導しており、OpenTelemetry と Prometheus の両方のメンテナーが積極的に参加しています。

現在、[OpenTelemetry メトリクスデータモデル](/docs/specs/otel/metrics/data-model/#opentelemetry-protocol-data-model)と [Prometheus メトリクス形式](https://github.com/prometheus/docs/blob/aafad80cf0520b646ccfcb39bbe5c4946d0e7922/docs/instrumenting/exposition_formats.md?from_branch=main)間の変換方法を記述した[詳細な実験的仕様](/docs/specs/otel/compatibility/prometheus_and_openmetrics/)があります。
この仕様は、Prometheus の [OpenTelemetry SDK 向け（プル型）エクスポーター](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)、[Prometheus ライブラリからの OTLP エクスポート](https://prometheus.github.io/client_java/otel/otlp/)、[Prometheus サーバーの OTLP インジェスション](https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver)、および OpenTelemetry Collector の [Prometheus レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/dbdb56d285d860849323346d58c83b14c1ed6c62/receiver/prometheusreceiver?from_branch=main)、[Prometheus Remote Write エクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/b7fedfd4c04c78503c0cac618298a044e04d4b07/exporter/prometheusremotewriteexporter?from_branch=main)、[Prometheus（プル型）エクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/exporter/prometheusexporter?from_branch=main)の実装に使用されています。

調整が最も困難な領域の 1 つは、OpenTelemetry のメトリクス名が Prometheus にエクスポートされる際に変更されることです。
現在、OpenTelemetry の `http.server.request.duration` メトリクス（単位 `s`）は、Prometheus では `http_server_request_duration_seconds` に変換されます。
Prometheus の命名規約に慣れているユーザーは、この変換が Prometheus エコシステムの既存メトリクスとの一貫性を提供する点を評価しています。
一方で、元の OpenTelemetry 名でクエリしても結果が返されないことに混乱するユーザーもいます。

Prometheus は [2024年ロードマップ](https://prometheus.io/blog/2024/03/14/commitment-to-opentelemetry/#support-utf-8-metric-and-label-names)の一環として、メトリクス名での UTF-8 文字サポートに取り組んでおり、メトリクス名のドットを保持できる可能性があります。
ユーザーが Prometheus クエリ体験にどのようなことを望んでいるかをより良く理解するために、[OTel x Prometheus ワーキンググループ](https://cloud-native.slack.com/archives/C01LSCJBXDZ)は [OpenTelemetry エンドユーザー SIG](/community/end-user/) の協力を得て[サーベイを実施](https://github.com/open-telemetry/sig-end-user/tree/e834e9da4494b626d1e4a4936fba31563b37b607/end-user-surveys/otel-prom-interoperability?from_branch=main)しました。
デフォルトの変換方式の決定は、互換性仕様の安定化に向けた最後のブロッカーの 1 つです。

[サーベイには 86 件の回答（および 5 件のスパム）が寄せられ](https://github.com/open-telemetry/sig-end-user/blob/b5cb097ca529cea62809d5078ef8e30a54ad86b9/end-user-surveys/otel-prom-interoperability/otel-prom-interoperability-survey.csv?from_branch=main)、多くの有益なフィードバックが含まれていました。
ご参加いただいたすべての方に感謝します！

## 全体的な要点 {#overall-takeaways}

- 過半数（60%）が、アンダースコアに変換するよりもメトリクス名のドットをそのまま残すことを好んでいます。
- わずかに過半数（54%）がメトリクス名に単位を含めることを好んでいますが、必須にすべきだと考えているのは 37% にとどまります。
- メトリクス名に単位を含めることを好む回答者は、ドットをアンダースコアに変換することも好む傾向があります。
- 「単位あり・アンダースコア」グループの最良の予測因子は、Prometheus サーバーの専門家であることと SRE であることです。
- 「単位なし・ドット」グループの最良の予測因子は、OpenTelemetry ライブラリの専門家であることと開発者であることです。

## サーベイの回答者 {#who-took-the-survey}

サーベイの回答者は主に大企業（従業員 1000 人以上）の出身者（52%）で、テクノロジー業界（71%）に属していました。
回答者は OpenTelemetry 関連のトピックよりも Prometheus 関連のトピックで自分を専門家と見なす傾向があり、役割は均等に分布していました。
ほぼすべての回答者（90% 以上）が Prometheus サーバーまたは他のオープンソースの Prometheus バックエンドにメトリクスを保存しており、ほぼ全員が PromQL を使用してメトリクスをクエリしていました。

## 現状に対する印象 {#sentiment-on-the-current-state}

全体として、回答者は OpenTelemetry が Prometheus で使いやすいかどうかについて中立的であり、現在の OpenTelemetry と Prometheus 間の変換はやや混乱すると考えていました。
これは、単位やデリミタに対する意見に関係なく一貫していました。

## ドットとアンダースコア {#dots-and-underscores}

OpenTelemetry は、名前空間デリミタとしてドットを使用し、「複数単語・ドット区切りのコンポーネント」間のデリミタとしてアンダースコアを使用すべきと[規定](/docs/specs/semconv/general/naming/)しています（例: `http.response.status_code`）。
一方、Prometheus はデリミタとして[アンダースコアを使用](https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels)しています。

現在、OpenTelemetry SDK から Prometheus 形式でエクスポートする際、Prometheus の要件に準拠するためにすべてのドットがアンダースコアに変更されます。
これらのエクスポーターを使用している OpenTelemetry ユーザーが、元のメトリクス名のドットを維持することを好むのか、それともアンダースコアに変換して既存の Prometheus メトリクスとの一貫性を好むのかを把握したいと考えました。

メトリクスに OpenTelemetry を使用し、クエリ言語として PromQL を使用していると回答したユーザーのうち、60% がドットを含む元の OpenTelemetry メトリクス名の維持を好み、40% がアンダースコアのみの Prometheus 規約に一致するメトリクス名を望んでいました。

![ドット対アンダースコアの円グラフ](dots-vs-underscores.png)

具体的な PromQL クエリやアラートの例について尋ねたところ、結果は上記の結果とおおむね一致しました。
約 42% のユーザーがドットを含むクエリのみを選択し、約 39% がアンダースコアを含むクエリのみを選択しました。
残りの 19% はドットまたはアンダースコアを含むクエリを混合して選択しており、どちらのアプローチでも問題ないと考えていることを示しています。

## メトリクス名の単位 {#units-in-metric-names}

OpenTelemetry は、単位を一般にメトリクス名に含めるべきではないと[規定](/docs/specs/semconv/general/metrics/#units)しています。
Prometheus の規約では、単位をメトリクス名の接尾辞として含めることを[推奨](https://prometheus.io/docs/practices/naming/#metric-names)しています。
OpenMetrics はさらに進んで、この[単位の接尾辞を必須](https://github.com/prometheus/OpenMetrics/blob/v1.0.0/specification/OpenMetrics.md#unit)としています。
現在、OpenTelemetry SDK から Prometheus 形式でエクスポートする際、単位がメトリクス名の接尾辞として追加されます。

メトリクスに OpenTelemetry を使用し、クエリ言語として PromQL を使用していると回答したユーザーのうち、37% がメトリクス名の必須の接尾辞として単位を含めるべきだと考え、46% がメトリクス名に単位を追加すべきではないと考えていました。
残りの 17% はメトリクス名に単位を含めることを好んでいましたが、必須にすべきではないと考えていました。

![メトリクス名の単位の円グラフ](units-in-metric-name.png)

具体的な PromQL クエリやアラートの例について尋ねたところ、上記の質問と比較して、メトリクス名に単位を含めることにやや好意的な結果となりました。
約 45% のユーザーが単位を含むクエリのみを選択し、約 28% が単位を除外するクエリのみを選択しました。
残りの 27% は単位を含むまたは除外するクエリを混合して選択しており、どちらのアプローチでも問題ないと考えていることを示しています。

## 傾向 {#trends}

### 単位とデリミタの選好の相関 {#correlation-between-unit-and-delimiter-preferences}

選好は一般的に 2 つのグループに分かれました。
ドットを含む元の OpenTelemetry メトリクス名を維持し、単位の接尾辞を付けないことを望むグループと、Prometheus の規約に合わせて名前を変更することを好むグループです。
メトリクス名に単位を必須にすることを望む回答者の 57% は、ドットをアンダースコアに変更することも望んでいました。
メトリクス名に単位を含めることを望まない回答者の 77% は、メトリクス名のドットを好んでいました。

### グループ間の違い {#group-differences}

メトリクス名に単位を必須とし、ドットをアンダースコアに変更することを好む最良の予測因子は、SRE の役割を持つことと、Prometheus サーバー設定の専門家であることでした。
たとえば、SRE の回答者の 88% がドットをアンダースコアに変換することを好んでいました。

ドットを含む OpenTelemetry 名を維持し、単位を含めないことを好む最良の予測因子は、開発者の役割を持つことと、OpenTelemetry ライブラリの専門家であることでした。
たとえば、開発者の 88% がドットをアンダースコアに変換しないことを好んでいました。

## その他のフィードバック {#other-feedback}

すべての回答者にとって最も一般的な課題は、OpenTelemetry 計装の不安定さと変換ロジックに関する混乱でした。
OpenTelemetry の規約を好む回答者は、Prometheus が現在 OpenTelemetry の概念（リソース、スコープ、デルタテンポラリティ、単位メタデータ）をサポートしていないことを最も重要な課題として挙げました。
Prometheus の規約を好む回答者は、OpenTelemetry の新しい概念が混乱を招くと述べ、OpenTelemetry が Prometheus の既存の規約から逸脱したことに不満を示しました。

このフィードバックの大部分は、OpenTelemetry と Prometheus のコミュニティにおける将来の計画と一致しています。
OpenTelemetry セマンティック規約 SIG は、さまざまな計装の規約の安定化に取り組んでいます。
OpenTelemetry Prometheus 相互運用性 SIG は、このサーベイの結果を互換性仕様に組み込む作業を行っています。
Prometheus コミュニティは、OpenTelemetry の概念をサポートする[野心的な計画](https://prometheus.io/blog/2024/03/14/commitment-to-opentelemetry/)を持っています。

## お問い合わせ {#keep-in-touch}

サーベイにご参加いただいたすべての方に改めて感謝します！
OpenTelemetry の今後の開発の方向付けや、進化するニーズへの対応を確実にするため、皆さまのフィードバックに頼っています。
今後のサーベイは以下の場所で告知します。

- [#otel-sig-end-user Slack チャンネル](https://cloud-native.slack.com/archives/C01RT3MSWGZ) – こちらからお問い合わせいただくこともできます！
- [エンドユーザーリソースページ](/community/end-user/)

OpenTelemetry と Prometheus の相互運用性に関するさらなるフィードバックの提供やディスカッションへの参加は、[#otel-prometheus-wg Slack チャンネル](https://cloud-native.slack.com/archives/C01LSCJBXDZ)で行えます。
