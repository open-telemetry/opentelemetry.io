---
title: OpenTelemetry Collector サーベイから得られたインサイト
linkTitle: OpenTelemetry Collector サーベイ
date: 2024-05-08
author: '[Hope Oluwalolope](https://github.com/iamebonyhope) (Microsoft)'
default_lang_commit: f3fa43aa2ebbc57007932002477e379ffa9da287
# prettier-ignore
cSpell:ignore: attributesprocessor basicauthextension batchprocessor bearertokenauthextension clientauthextension countconnector datadogconnector debugexporter filelogreceiver filterprocessor healthcheckextension hostmetricsreceiver k8sattributesprocessor lokiexporter memorylimiterprocessor Oluwalolope otlpexporter otlpreceiver Pprof pprofextension prometheusexporter prometheusreceiver prometheusremotewriteexporter routingconnector sclusterreceiver Servicegraph servicegraphconnector spanmetricsconnector
---

[OpenTelemetry（OTel）Collector](/docs/collector/) は、現代のソフトウェアアプリケーションの監視とオブザーバビリティにおける基盤ツールとなっています。
最近、End User SIG は OTel Collector に関するユーザーからのフィードバックを収集するためにサーベイを実施しました。
受け取った186件の回答が統計的に有意であるとは限りませんが、良いスタートであり、貴重なインサイトを提供してくれています。
これらのインサイトには、ユーザーのデプロイの実践や実装上の課題に関する詳細が含まれており、OTel Collector の今後の方向性を推進するうえで役立ちます。

## 主なポイント {#key-takeaways}

- 企業は一般的に、中規模から大規模な Collector のデプロイを行っています。
  - 5台以上の Collector: 125/186
  - 10台以上の Collector: 100/186
- Collector のカスタムバイナリやディストリビューションのビルドは予想以上に普及しており（61/186）、そのほとんどが
  [OTel Collector Builder](https://github.com/open-telemetry/opentelemetry-collector-builder)
  を使用しています（49/61）。
- 大多数が Kubernetes 上に Collector をデプロイしています（150/186）。
- 新しいコンポーネント（14）よりも、安定性（59）、セルフオブザーバビリティ（53）、設定管理（59）に対する要望が高くなっています。

## 詳細なインサイト {#detailed-insights}

### デプロイ規模と環境 {#deployment-scale-and-environment}

調査結果から、OTel Collector が大規模に利用されていることがわかりました。
回答者の53.8%（100/186）が10台以上の Collector をデプロイしており、13.4%（25/186）が5台から10台、22%（41/186）が2台から5台を運用しています。

![組織内で何台の OTel Collector を実行しているかを示すグラフ](deployment-scale.png)

Kubernetes が Collector のデプロイプラットフォームとして最も多く（80.6%）、次いで仮想マシン（33.3%）、ベアメタル（10.8%）が続きます。

![OTel Collector のデプロイ先を示すグラフ](deployment-environment.png)

### ユースケース {#usage-scenarios}

OTel Collector は主にゲートウェイとして使用されており（64.5%）、さまざまなソースからテレメトリーデータを集約する際の中心的な役割を果たしています。
DaemonSet（51.6%）やサイドカー（23.7%）も人気のあるデプロイモデルであり、OTel Collector がさまざまな運用環境で柔軟に活用されていることを示しています。

![OTel Collector のユースケースを示すグラフ](usage-scenarios.png)

### カスタマイズと設定 {#customization-and-configuration}

予想以上に多くのユーザーが独自のディストリビューションをビルドしており（61/186）、コミュニティにとって構成可能な Collector の提供が重要であることを示しています。
独自の Collector ディストリビューションをビルドしているユーザーのほとんどが
[OTel Collector Builder（OCB）](https://github.com/open-telemetry/opentelemetry-collector-builder)
を使用しています（49/61）。
OCB を活用している49人の回答者のほとんどは使い方を理解できており、使いにくいと回答したのは2人だけでした。

![OTel Collector Builder の使いやすさを示すグラフ](ocb-usage.png)

### 監視とオブザーバビリティ {#monitoring-and-observability}

Collector の監視については、回答者の大多数が Collector のメトリクスとログに依存しており（81.7%）、Collector をまったく監視していないユーザーはわずかでした（16.6%）。
データをさらに詳しく分析すると、5台以上の Collector を運用している125人の回答者のうち、Collector を監視していないのは15人のみであり、10台以上の Collector を運用している100人の回答者のうち監視していないのは9人のみでした。
このことから、Collector のデプロイが一定の成熟度に達すると、ユーザーは Collector の監視を真剣に行うようになることがうかがえます。

![OTel Collector の監視方法を示すグラフ](monitoring.png)

### OTel コンポーネントの利用状況 {#otel-components-usage}

OTel Collector の柔軟性は、さまざまな環境で使用されているエクスポーター、レシーバー、プロセッサー、コネクター、エクステンションの豊富さによって明確に示されています。
これは、Collector が幅広いツールやシステムと統合できる能力を持っていることを示しています。

サーベイ結果によると、上位のコンポーネントは以下のとおりです。

### エクスポーター {#exporters}

1. [otlpexporter](https://github.com/open-telemetry/opentelemetry-collector/tree/f306288b57856f7668e541a49d9945c3c707b7a3/exporter/otlpexporter?from_branch=main)
2. [prometheusremotewriteexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/exporter/prometheusremotewriteexporter/README.md)
3. [prometheusexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/exporter/prometheusexporter/README.md)
4. [lokiexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/exporter/lokiexporter/README.md)
5. [debugexporter](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/exporter/debugexporter?from_branch=main)

### レシーバー {#receivers}

1. [otlpreceiver](https://github.com/open-telemetry/opentelemetry-collector/tree/f306288b57856f7668e541a49d9945c3c707b7a3/receiver/otlpreceiver?from_branch=main)
2. [prometheusreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/receiver/prometheusreceiver/README.md)
3. [filelogreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/72087f655403778da46f4168dca2433fa0775098/receiver/filelogreceiver?from_branch=main)
4. [hostmetricsreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/receiver/hostmetricsreceiver/README.md)
5. [k8sclusterreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/receiver/k8sclusterreceiver/README.md)

### プロセッサー {#processors}

1. [batchprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/811b5147d3ae2da9610f85265305dd46c79de179/processor/batchprocessor?from_branch=main)
2. [attributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/processor/attributesprocessor/README.md)
3. [filterprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/processor/filterprocessor/README.md)
4. [memorylimiterprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/811b5147d3ae2da9610f85265305dd46c79de179/processor/memorylimiterprocessor?from_branch=main)
5. [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/processor/k8sattributesprocessor/README.md)

### コネクター {#connectors}

1. [spanmetricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/connector/spanmetricsconnector/README.md)
2. [servicegraphconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/connector/servicegraphconnector/README.md)
3. [routingconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/processor/routingprocessor/README.md)
4. [countconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/connector/countconnector/README.md)
5. [datadogconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/exporter/datadogexporter/README.md)

### エクステンション {#extensions}

1. [healthcheckextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/extension/healthcheckextension/README.md)
2. [basicauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/extension/basicauthextension/README.md)
3. [pprofextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/extension/pprofextension/README.md)
4. [bearertokenauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/extension/bearertokenauthextension/README.md)
5. [oauth2clientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/extension/oauth2clientauthextension/README.md)

<br/>

使用されている具体的なエクスポーター、レシーバー、プロセッサー、コネクター、エクステンションの詳細については、[生データ](https://github.com/open-telemetry/sig-end-user/blob/684fca78b4f13c8ac5009d7a99638f78b336b8d7/end-user-surveys/otel-collector/otel-collector-survey.csv?from_branch=main)をご覧ください。
このデータは、コミュニティ内で人気のある選択肢と、OTel Collector のカスタマイズ性を示すニッチな設定の両方を明確に把握できます。

### 改善すべき領域 {#areas-for-improvement}

回答者は、新しいコンポーネント（8%未満）よりも、安定性（30.6%）、設定管理と解決（30.1%）、セルフオブザーバビリティ（28%）の改善を望んでいることを明確にしました。

![OTel Collector の改善に関する関心領域を示すグラフ](areas-of-improvement.png)

[OTel Collector サーベイの結果](https://github.com/open-telemetry/sig-end-user/blob/684fca78b4f13c8ac5009d7a99638f78b336b8d7/end-user-surveys/otel-collector/otel-collector-survey.csv?from_branch=main)は、Collector のデプロイと活用の現状のスナップショットを提供します。
OTel Collector が広く採用されカスタマイズ性も高い一方で、よりユーザーフレンドリーで堅牢にする余地もあることがわかります。

## 今後の連絡先 {#keep-in-touch}

サーベイにご参加いただいたすべての方に感謝します！
皆さまのフィードバックは、OpenTelemetry の今後の開発を導き、進化するニーズに引き続き応えられるようにするために欠かせません。

今後のサーベイは以下のチャネルで告知します。
[#otel-sig-end-user Slack チャネル](https://cloud-native.slack.com/archives/C01RT3MSWGZ)
— こちらからお気軽にお問い合わせください！
[エンドユーザーリソースページ](/community/end-user/)
