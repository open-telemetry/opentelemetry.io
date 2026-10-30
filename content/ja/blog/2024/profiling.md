---
title: OpenTelemetry がプロファイリングのサポートを発表
linkTitle: プロファイリングのサポート
date: 2024-03-19
author: '[Austin Parker](https://github.com/austinlparker) (Honeycomb)'
aliases: [opentelemetry-announced-support-for-profiling]
default_lang_commit: 8ed9f745d6252000e153fae8c1913dc15a03b5cd
cSpell:ignore: Alexandrov Alexey Dmitry Filimonov Geisendörfer Halliday
---

2023年、OpenTelemetry は[ログ、メトリクス、トレース](https://www.cncf.io/blog/2023/11/07/opentelemetry-at-kubecon-cloudnativecon-north-america-2023-update/)の安定性を達成したことを発表しました。
これはプロジェクト発足時の当初の目標でしたが、クラウドネイティブアプリケーションのための組み込みオブザーバビリティを実現するというビジョンを果たすには、コミュニティとともに進化し続ける必要があります。
今年、Profiling SIG が KubeCon + CloudNativeCon Europe 2022 の Valencia で設立されてからちょうど2年後に、プロファイリングデータモデルの OTEP をマージし、今年中の安定した仕様と実装に向けて取り組むという大きな一歩を踏み出せたことを誇りに思います。

OpenTelemetry プロファイリングシグナルのこのマイルストーンは、Profiling SIG 内での協力的な取り組みを反映しており、多様なプロファイリングベンダーやエンドユーザーからの献身的なインプットが重要な役割を果たしました。
これには以下のコミュニティメンバーからの多大な貢献が含まれます。

- Felix Geisendörfer（Datadog）
- Alexey Alexandrov（Google）
- Dmitry Filimonov（Grafana Labs）
- Ryan Perry（Grafana Labs）
- Jonathan Halliday（Red Hat）

SIG の共同の取り組みは、プロファイリングに最も適したデータ形式を決めることに注力しており、コミュニティ内の活発な議論と提案がそれを示しています。

この時点までに達成された以前のマイルストーンには以下があります。

- [プロファイリングビジョンの方向性統一](https://github.com/open-telemetry/oteps/pull/212)の確立（2022年8月）
- [v1 プロファイリングデータモデル](https://github.com/open-telemetry/oteps/pull/237)の提案（2023年9月）
- [v2 プロファイリングデータモデル](https://github.com/open-telemetry/oteps/pull/239)の提案（2023年11月）

これらはすべて、OpenTelemetry のプロファイリング機能の方向性と進化を形作る上で重要な役割を果たしてきました。
これらのコミュニティ主導の議論と貢献は、プロジェクトが包括的かつ協調的であることへのコミットメントを強調するものであり、OpenTelemetry の開発を推進するために幅広い知見と専門知識を活用していることを示しています。

## プロファイリングとは {#what-is-profiling}

プロファイリングとは、実行時にアプリケーションコードの動作とパフォーマンスを動的に検査する手法です。
継続的プロファイリングは、コードレベルでのリソース使用状況に関するインサイトを提供し、プロファイリングデータを時系列でさまざまな属性にわたって保存、クエリ、分析できるようにします。
これは、開発者やパフォーマンスエンジニアがコードの中で何が起きているかを正確に理解するための重要な手法です。
OpenTelemetry の[プロファイリングシグナル](https://github.com/open-telemetry/opentelemetry-specification/blob/97c826b70e2f89cfdf655d5150791f3f0c2bae19/oteps/profiles/0239-profiles-data-model.md?from_branch=main)は、この分野でなされてきた取り組みを拡張し、業界初の試みとして、プロファイルをアプリケーションやインフラストラクチャからの他のテレメトリーシグナルと接続します。
これにより、開発者やオペレーターは、リソースの枯渇やユーザー体験の低下を、影響を受けている特定のサービスやポッドだけでなく、その原因として最も関与している関数やコード行と関連付けることができます。

業界がこのビジョンを受け入れていることを大変嬉しく思います。
多くの組織が協力してプロファイリングシグナルの定義に取り組んでいます。
具体的には、以下の2つの寄贈が進行中です。

- Elastic が独自の eBPF ベースのプロファイリングエージェントを[寄贈することを表明](https://github.com/open-telemetry/community/issues/1918)しました[^1]
- Splunk が [.NET ベースのプロファイラーの寄贈](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/pull/3196)プロセスを開始しました

これらは OpenTelemetry プロファイリングのデリバリーと実装を加速するためにプロジェクトに寄贈されています。

## ユーザーにとっての意味 {#what-does-this-mean-for-users}

プロファイルは、ログ、メトリクス、トレースなどの他のシグナルとの間で双方向のリンクをサポートします。
リソースのテレメトリーから対応するプロファイルへ簡単にジャンプできるようになります。
たとえば、以下のようなことが可能です。

- メトリクスからプロファイルへ：CPU 使用率やメモリ使用量の急上昇から、そのリソースを消費しているコードの具体的な箇所に移動できます
- トレースからプロファイルへ：サービス全体でのレイテンシの発生場所だけでなく、そのレイテンシがコードの特定部分に起因している場合、トレースやスパンに紐付けられたプロファイルにそれが反映されます
- ログからプロファイルへ：ログは何かが問題であるというコンテキストを提供することが多いですが、プロファイリングを使えば、何か（たとえば Out Of Memory エラー）を単に追跡するだけでなく、どのコード部分がメモリリソースを消費しているかを正確に確認できるようになります

これらはほんの一例であり、リンクは逆方向にも機能しますが、より一般的に言えば、プロファイリングはオブザーバビリティの約束を実現するのに役立ちます。
最小限の追加コードや労力で、ユーザーがアプリケーションに関するまったく新しい次元の情報をクエリし理解することが容易になります。

## 動き続けるコミュニティ {#a-community-in-motion}

この取り組みは、日々 OpenTelemetry に貢献する献身的なコントリビューターなしには実現できませんでした。
最近、毎月1000人超のユニーク開発者がプロジェクトに貢献するという新たなマイルストーンを達成し、180社超の企業を代表しています。
最も人気のあるリポジトリ全体で、OpenTelemetry は月間3000万超のダウンロード[^2]を達成しており、[Apache Kafka](https://cwiki.apache.org/confluence/display/KAFKA/KIP-714%3A+Client+metrics+and+observability) や[数十ものプロジェクト](/ecosystem/integrations)を含む新しいオープンソースプロジェクトが定期的に私たちの標準を採用しています。
また、[OpenFeature](https://openfeature.dev) や [OpenSearch](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/23611) など、CNCF 内外の他のオープンソースプロジェクトとの統合を深めており、Kubernetes、Thanos、Knative などとの既存の統合に加えて取り組んでいます。

2024年は、既存のトレース、メトリクス、ログシグナルの実装と安定化を続けながら、プロファイリング、クライアントサイド RUM などのサポートを追加する、OpenTelemetry にとってまた大きな年になるでしょう。
参加するには絶好のタイミングです！
詳しくは[ウェブサイト](/)の他のページをご覧ください。

[^1]: デューデリジェンスと OpenTelemetry メンテナーによるレビューが待たれています。

[^2]: .NET、Java、Python の API の公開ダウンロード統計に基づきます
