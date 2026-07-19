---
title: OpenTelemetry Collector フォローアップサーベイ
linkTitle: OTel Collector サーベイ
date: 2026-01-28
author: >-
  "[Ernest Owojori](https://github.com/E-STAT), [Victoria
  Nduka](https://github.com/nwanduka), [Pablo
  Baeyens](https://github.com/mx-psi) (DataDog), [Andrej
  Kiripolsky](https://github.com/andrejkiri) (Grafana Labs)"
issue: 8985
sig: End User
default_lang_commit: 153b29255cbd81f4f3d8abe1841d0763074aad9d
# prettier-ignore
cSpell:ignore: Attributesprocessor awscloudwatchmetricsreceiver Baeyens datadogconnector datadogexporter filelogreceiver filereceiver filestorage k8sclusterreceiver Kiripolsky lokiexporter Memorylimiterprocessor Nduka Otlphttpexporter Owojori Routingconnector spanmetrics statefulset Storage transformprocessor zpages
---

2024年、End User SIG は [Collector サーベイ](/blog/2024/otel-collector-survey/)を実施し、[OpenTelemetry Collector](/docs/collector/) が実際にどのように使われているか、そしてユーザーエクスペリエンスについてフィードバックを収集しました。
そのサーベイから得られた知見は、コミュニティ内のいくつかの開発および優先順位付けの意思決定に活かされました。

フォローアップとして、2025年にもう一つのサーベイを実施し、デプロイの実践、利用パターン、実装上の課題がどのように変化したかを把握しました。
このブログ記事では、前年との主な変化を取り上げながら、結果の分析を紹介します。

## 主な要点 {#key-takeaways}

- Collector のデプロイは引き続き拡大しており（65% が10台以上の Collector を運用）、Kubernetes が依然として主流（81%）である一方、仮想マシン（VM）の利用は33%から51%へと大幅に増加しました。
- 比較的小規模なデプロイのユーザーの4分の1、および大規模なデプロイのユーザーの約半数が、Kubernetes と VM の両方を使用しています。
- 独自の Collector をビルドするユーザーがさらに13%増加し、OTel ユーザーの61%は [OpenTelemetry Collector Builder](/docs/collector/extend/ocb/) が使いやすいとは認められませんでした。
- 大規模な組織（100台超の Collector）はより多くのメトリクスとログを収集しています。
  一方、小規模な組織（100台未満の Collector）はより多くのトレースを収集しています。
- otlphttpexporter、datadogexporter、filelogreceiver、k8sclusterreceiver、k8sclusterreceiver、filereceiver、attributesprocessor、transformprocessor、routingconnector、datadogconnector、storage、zpages、filestorage の利用が増加し、memorylimiterprocessor は減少しました。
- 設定管理と解決、安定性、Collector のオブザーバビリティが、改善要望の上位を占めています。

## 詳細な分析 {#detailed-insights}

### デプロイの規模と環境 {#deployment-scale-and-environment}

昨年は、ユーザーが本番環境で運用している Collector の台数に関する質問のカテゴリ分けが今年とは異なっていました。
これは、2024年のサーベイで多くの人が10台以上の Collector を本番環境で運用していると報告したため、2025年のサーベイではカテゴリをより細かい段階に分けたことによるものです。
比較のために、2025年のカテゴリを縮小したところ、65%（+10%）が10台以上の Collector を持ち、15%（-7%）が2台から5台の Collector を持ち、1台の Collector と6〜10台の Collector を持つユーザーの数には変化がないことがわかりました。

デプロイ先について、OTel ユーザーは依然として Kubernetes を強く好んでおり（81%、前年と同じ）、51%（+18%）が VM を使用していると報告し、18%（+7%）がベアメタルを使用しています。
2025年のサーベイでは、デプロイ先として HashiCorp Nomad を選択した回答者はいませんでした。

VM の利用が18%増加したことから、VM ユーザーのうち Kubernetes も使用しているのは何パーセントか、デプロイ規模はどの程度かという疑問が生じました。
比較的小規模なデプロイ（100台未満の Collector）のユーザーの4分の1、および大規模なデプロイ（100台超の Collector）のユーザーの約半数が、Kubernetes と VM の両方を使用していることがわかりました。

![image1](collectors-in-production-2024-2025.png)

![image2](collectors-in-prod-2025.png)
![image3](collector-deployment-location.png)

\* 付きのデプロイ先は90%信頼水準で有意であることを示す

![image4](k8s-vm-deployment-2025.png)

### 利用シナリオとデプロイシナリオ {#usage-and-deployment-scenarios}

Kubernetes の利用シナリオは昨年のサーベイと同様の傾向を示しています。
58%（-7%）がゲートウェイ、50%（-2%）が daemonset、23%（-1%）がサイドカー、14%（+1%）が statefulset です。
これらの差分はわずかです。

![image5](K8s-scenarios.png)

### カスタマイズと設定 {#customization-and-configuration}

独自の Collector をビルドする OTel ユーザーの割合は46%（+13%）に増加しました。
独自の Collector をビルドしている55人のうち、47人（86%）が OpenTelemetry Collector Builder を使用しており（昨年の80%と比較して増加）、21人（約25%）のユーザーが Collector Builder は使いにくいと報告しており、昨年のわずか2人から増加しました。

Collector Builder が使いやすいと確信を持って同意した回答者はわずか39%であり、61%がどちらでもないか使いにくいと回答していることも重要です（改善の余地が大きいことを示しています）。

![image6](build-own-collector.png) ![image7](otel-use-collector-builder-n55.png)
![image8](use-otel-collector-builder.png)

### モニタリングとオブザーバビリティ {#monitoring-and-observability}

Collector のモニタリングについて、約23%（昨年から-6%）が Collector をモニタリングしていないと報告しました。
ただし、2024年のサーベイでは82%が内部メトリクスとログを収集していると報告しており、2025年のサーベイでは83%がメトリクスを、61%がログを、25%がトレースを収集していることが明らかになりました。
これは、メトリクスが最も一般的に収集される内部テレメトリーであることを示しています。
さらに、Collector の台数がモニタリングするテレメトリーの種類に影響するかどうかを確認しました。
100台以上の Collector を運用しているユーザーはメトリクスを確実に収集していますが、トレースはほとんど収集していないことがわかりました。

![image9](monitor-collector-using-internals.png)
![image10](collector-telemetry-types.png)
![image11](collectors-vs-telemetry-types.png)

### OTel コンポーネントの利用状況 {#otel-component-usage}

2025年と前年の間でコンポーネントの採用がどのように変化したかを比較するため、上位10コンポーネント（2025年のサーベイを使用）の割合の差分を計算しました。
以下のコンポーネントの利用が90%信頼水準で有意に変化しました。

- **レシーバー**: filelogreceiver、k8sclusterreceiver、filereceiver が増加
- **プロセッサー**: attributesprocessor と transformprocessor が増加し、memorylimiterprocessor が減少
- **エクスポーター**: otlphttpexporter と datadogexporter が増加し、lokiexporter が減少
- **コネクター**: routingconnector と datadogconnector が増加
- **エクステンション**: storage、zpages、filestorage が増加

![image13](receivers.png) ![image14](processors.png) ![image12](exporters.png)
![image15](connectors.png) ![image16](extensions.png)

## 改善が求められる領域 {#areas-for-improvement}

OTel ユーザーは、改善を望む領域を複数回答で表明しました。
約63%が設定管理と解決、52%が安定性、43%が Collector のオブザーバビリティの改善を望み、29%がより多くのレシーバーやエクスポーターのサポートを望んでいます。

> [!NOTE]
>
> この質問は異なる形式で尋ねられたため、2024年の結果と2025年の結果を直接比較することはできません。

![image17](collector-improvment-request.png)

より詳細には、ユーザーは改善すべき点についての提案を自由記述で述べています。

### 設定、再設定、運用の柔軟性 {#configuration-reconfiguration-and-operational-flexibility}

ユーザーは、動的な本番環境で Collector を運用する際の困難さを一貫して指摘しており、特に設定変更時に完全な再起動が必要になることが問題です。
個々のパイプラインを独立して変更または再起動できる、よりきめ細かな再設定機能への強い要望があり、大規模環境でのより安全で柔軟な運用を可能にすることが求められています。

> _"単一のパイプラインの再設定と再起動を、他の接続やパイプラインを壊すことなく行いたい。
> 単一のパイプラインを変更する必要がある場合に、Collector 全体を再起動すべきではない。"_

### パフォーマンス、スケーラビリティ、リソース効率 {#performance-scalability-and-resource-efficiency}

Collector のデプロイが拡大するにつれて、パフォーマンスとリソース使用量がより顕著なボトルネックになりつつあります。
回答者は、起動時のレイテンシーや特定のコンポーネントにおけるリソース消費の高さが、大規模環境やリソースの制約がある環境で Collector を効率的に運用する能力に直接影響していると指摘しました。

> _"spanmetrics コネクターは多くのリソースを必要とし、起動時間の高速化は大規模な Collector の運用を大幅に改善するだろう。"_

### ドキュメントの品質、アクセシビリティ、シグナルの一貫性 {#documentation-quality-accessibility-and-signal-consistency}

ドキュメントが繰り返し挙がる課題として浮上しており、特に高度な設定、シグナル間の一貫性、実用的な利用ガイダンスに関するものが目立ちます。
ユーザーはまた、異なるシグナル間でのより明確なドキュメントと、英語以外のコミュニティへのより良いアクセシビリティの必要性を強調しました。

> _"ドキュメントの改善が必要であり、より一貫性のあるシグナルのサポートとより良いガイダンスが求められている。
> 英語以外の言語でのリソースも含めて。"_

### 開発者体験と拡張性 {#developer-experience-and-extensibility}

カスタムコンポーネントの構築は強力ですが困難であり、ユーザーは急な学習曲線と明確で最新のガイダンスの不足を報告しています。
多くのユーザーが、ベストプラクティスを理解するために公式ドキュメントではなく GitHub のイシューに頼っていると報告しており、拡張性が必要以上に困難になっています。

> _"カスタムエクスポーターを書くための最適かつ最新のパターンを学ぶことは非常に苦痛だった。
> コミュニティが進んでいる方向を理解するために、GitHub のイシューに頼らざるを得なかった。"_

### エコシステムのギャップとコンポーネントのカバレッジ {#ecosystem-gaps-and-component-coverage}

回答者は、メンテナンスが不十分または欠落しているコンポーネントが、より広範な採用を阻む障壁であると指摘しており、特に特定のプラットフォーム、エクスポーター、レシーバーに関するものが目立ちます。
場合によっては、ユーザーはこれらのギャップを埋めるためにスタンドアロンのコンポーネントを実行したり、カスタムエクスポーターをビルドしたりしていました。

> _"awscloudwatchmetricsreceiver にメンテナーがいないため、スタンドアロンの CloudWatch エクスポーターを使用している。"_

### 信頼性、ヘルスチェック、後方互換性 {#reliability-health-and-backward-compatibility}

本番環境で Collector を安定して運用することは依然として重要な課題であり、ユーザーは運用リスクを軽減するために、より堅牢なヘルスチェック、より安全なアップグレード、より明確な後方互換性の保証を求めています。

> _"より堅牢なヘルスエクステンションとより強力な後方互換性の保証が、本番環境で Collector を安全に運用するために不可欠である。"_

## まとめ {#conclusion}

2025年のフォローアップサーベイは、OpenTelemetry ユーザーがすでに実感していることを裏付けています。
OpenTelemetry Collector は本番インフラストラクチャとして確固たる地位を確立していますが、大規模な運用は依然として困難です。
デプロイはより大規模かつハイブリッドになり、カスタマイズは増加し、コンポーネントの利用は進化し続けていますが、設定管理、安定性、オブザーバビリティ、ドキュメントは依然としてユーザーにとって大きな摩擦となっています。
これらの結果は、コミュニティが継続的に投資することで最も大きなインパクトを生み出せる領域を明確にしています。
新しい機能の追加だけでなく、実際の環境で Collector をより簡単に運用、拡張、安全に進化させることが重要です。
これらの知見は、Collector がユーザーとともに成長し続ける中で、プロジェクト全体の議論と優先順位付けに役立つでしょう。
