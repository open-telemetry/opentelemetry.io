---
title: Otterize ネットワークマッパーへの OpenTelemetry サポートの追加
linkTitle: Otterize ネットワークマッパーの OTel 統合
date: 2023-11-17
author: >-
  [Ori Shoshan](https://github.com/orishoshan) (Otterize), [David G.
  Simmons](https://github.com/davidgs) (Otterize)
default_lang_commit: f1d6481f046978944c738e08097c7682ec966501
cSpell:ignore: brainer Otterize Shoshan
---

{{< blog/integration-badge >}}

## 当然の統合: Otterize ネットワークマッパーへの OpenTelemetry サポートの追加 {#a-no-brainer-integration-adding-opentelemetry-support-to-the-otterize-network-mapper}

[Otterize](https://otterize.com/) は、ゼロトラストのためのワークロードの Identity and Access Management（IAM）を自動化し、Kubernetes ネットワークポリシー、Istio ポリシー、AWS IAM ポリシーなどのポリシーを [オープンソースプロジェクト](https://github.com/otterize) のコレクションを通じて自動化します。
この自動化を実現するために、Otterize は [ネットワークマッパー](https://github.com/otterize/network-mapper) を構築しました。
Otterize ネットワークマッパーは、スタンドアロンの Kubernetes ツールで、インフラストラクチャのライブネットワークマップを構築し、画像ファイルとして可視化したり、Otterize Cloud 上でインタラクティブなグラフとして表示したり、ClientIntents（各ワークロードに必要なアクセス、つまり「インテンション」を記述するカスタム Kubernetes リソース）としてエクスポートしたりできます。
ゼロコンフィグのデプロイメントとして設計されており、即座にネットワークマップを提供するとともに、リソース使用量を抑え、可能な限り最小限の権限で動作します。
その中核では、DNS トラフィックを収集し、分析することで通信の全体像を把握します。

[ServiceNow Cloud Observability](https://www.servicenow.com/products/observability.html)（旧 Lightstep）の素晴らしいメンバーが、[最近ネットワークマッパーに OpenTelemetry エクスポートサポートを提供してくれました](https://github.com/otterize/network-mapper/pull/141)。
これにより、ネットワークマッパーを使用してインフラストラクチャのネットワークマップを生成し、OpenTelemetry データを Grafana Tempo インスタンスにエクスポートして、クラスターにデプロイされたサービスに一切変更を加えることなくサービスグラフを確認できるようになりました。

![Grafana Tempo のサービスグラフを表示するスクリーンショット](otterize-otel.png)

この統合はシンプルでした。OpenTelemetry SDK は使いやすく、既存のネットワークマッパーのコードにぴったりフィットしました。

### OpenTelemetry はネットワークマッパーとどのように連携するのか {#how-does-opentelemetry-work-with-the-network-mapper}

サービスグラフを使えば、どのサービスが互いに通信しているかを確認できます。
そしてその情報を、ダウンタイムやセキュリティインシデントの影響範囲の特定など、運用やセキュリティのニーズに活用できます。
また、サービスグラフを使って OpenTelemetry トレーシングの展開をどこから始めるべきかを判断できます。
トレーシングのデプロイメントはより複雑になりがちで、ソースコードへの OpenTelemetry SDK の統合が必要になるためです。

OTel SDK をネットワークマッパーに使用するのは簡単でしたが、OpenTelemetry を検討する際に鶏と卵の問題が存在する理由がわかります。
トレーシングで大きな価値を得るには、複数のサービスをまとめて確認する必要があり、それを最初のステップとして行うのはかなりの負担になりえます。

ネットワークマッパーは既存のアプリケーションコードの変更を必要としないため、OpenTelemetry を始めるための障壁が大幅に下がります。
これは、インフラストラクチャ内の各サービスに対して OpenTelemetry メトリクスの出力を始め、より大規模な OpenTelemetry の展開にコミットする前にサービス間の相互作用を理解するための素晴らしい方法です。

### オープンソースの力が発揮された瞬間 {#the-strength-of-open-source-in-action}

私たちは当初この機能の追加を考えたこともありませんでした。思いつかなかったからです。
しかし、その価値は否定できません。特にネットワークマッパーをデプロイして Grafana Tempo を利用している方や、OpenTelemetry を検討している方にとっては、なおさらです。

ServiceNow Cloud Observability チームがネットワークマッパーを見つけ、この機能強化を惜しみなく提供してくれたことは素晴らしいことです。
おかげで、ネットワークマッパーが OpenTelemetry と Grafana にシームレスに統合されるようになりました。
これこそがオープンソースコラボレーションの素晴らしさです！

プロジェクトの探索やコントリビューションに興味がある方は、ぜひ [https://github.com/otterize/network-mapper](https://github.com/otterize/network-mapper) をご覧ください。
