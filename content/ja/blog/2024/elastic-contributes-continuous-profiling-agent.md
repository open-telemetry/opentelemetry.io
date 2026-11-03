---
title: Elastic が継続的プロファイリングエージェントを OpenTelemetry に寄贈
linkTitle: Elastic がプロファイリングエージェントを寄贈
date: 2024-06-07
author: >
  [Bahubali Shetti](https://github.com/bshetti) (Elastic), [Alexander
  Wert](https://github.com/AlexanderWert) (Elastic), [Morgan
  McLean](https://github.com/mtwo) (Splunk), [Ryan
  Perry](https://github.com/Rperry2174) (Grafana)
issue: https://github.com/open-telemetry/community/issues/1918
sig: Profiling SIG
default_lang_commit: 123db37a9707afc95344ffcbb0081eb118cda85d
# prettier-ignore
cSpell:ignore: Bahubali Christos Dmitry Filimonov Geisendörfer Halliday Kalkanis Shetti
---

[Elastic](https://www.elastic.co/observability-labs/blog/elastic-donation-proposal-to-contribute-profiling-agent-to-opentelemetry) と [OpenTelemetry のプロファイリングコミュニティ](/blog/2024/profiling/)の間で重要なコラボレーションが行われ、徹底したレビュープロセスを経て、OpenTelemetry プロジェクトが [Elastic の継続的プロファイリングエージェントの寄贈](https://github.com/open-telemetry/community/issues/1918)を受け入れたことをお知らせします。

これは、プロファイリングを OpenTelemetry のコアテレメトリーシグナルとして確立する上での重要なマイルストーンです。
Elastic の [eBPF ベース](https://ebpf.io/)のプロファイリングエージェントは、さまざまなプログラミング言語やランタイム、サードパーティライブラリ、カーネル操作、システムリソースにわたるコードを、本番環境での低い CPU およびメモリオーバーヘッドで観測します。
SRE と開発者の双方が、パフォーマンスのボトルネックの迅速な特定、リソース利用率の最大化、カーボンフットプリントの削減、クラウドコストの最適化といった恩恵を受けられるようになります。

Elastic がこのプロジェクトを OpenTelemetry に寄贈する決定を下したのは、OpenTelemetry のミッションを加速させ、高品質でポータブルなテレメトリーを通じた効果的なオブザーバビリティを実現するためです。
このコラボレーションは、ベンダー中立性とコミュニティ主導の開発に対するコミットメントを示すものでもあり、プロファイリングおよびオブザーバビリティのエコシステム全体を強化します。

寄贈は、Elastic と OpenTelemetry コミュニティの間の素晴らしく建設的な協力を通じて実現しました。
継続的プロファイリングを OpenTelemetry の不可欠な一部として確立するために、共同で取り組んでいくことを楽しみにしています。

本日の受け入れにより、Elastic の継続的プロファイリングエージェントが OpenTelemetry に寄贈されます。
このエージェントは、Elastic のチームに加え、さまざまな企業からの多様な公式メンテナーによって共同でサポートされます。

- Dmitry Filimonov (Grafana Labs)
- Felix Geisendörfer (Datadog)
- Jonathan Halliday (Red Hat)
- Christos Kalkanis (Elastic)

## 継続的プロファイリングとは {#what-is-continuous-profiling}

[継続的プロファイリング](https://www.cncf.io/blog/2022/05/31/what-is-continuous-profiling/)とは、ソフトウェアアプリケーションの実行に関する情報を時間の経過とともに収集することで、その動作を理解するための手法です。
これには、関数呼び出しの所要時間、メモリ使用量、CPU 使用量、その他のシステムリソースの追跡と、関連するメタデータが含まれます。

## 継続的プロファイリングの利点 {#benefits-of-continuous-profiling}

従来のプロファイリングソリューションは、通常は一度限りの開発時の最適化に使用されるものであり、本番環境での導入を制限する大きな欠点があります。

- コード計装によるコストとパフォーマンスの大きなオーバーヘッド
- サービスの中断を伴う再起動
- サードパーティライブラリの内部を可視化できないこと

一方、継続的プロファイリングは最小限のオーバーヘッドでバックグラウンドで実行され、別の環境で問題を再現する必要なく、リアルタイムで実用的なインサイトを提供します。

これにより、SRE、DevOps、開発者は、コードがパフォーマンスとコストにどのように影響するかを把握でき、コードとインフラストラクチャの改善が容易になります。

## 包括的なプロファイリング機能の寄贈 {#contribution-of-comprehensive-profiling-abilities}

Elastic が寄贈する継続的プロファイリングエージェントは [eBPF ベース](https://ebpf.io/)であり、それゆえにシステム全体を常時監視するソリューションです。
コードやサードパーティライブラリ、カーネル操作、自身が所有していないその他のコードを観測します。
コード計装（ランタイム/バイトコード）、再コンパイル、サービスの再起動を不要にし、オーバーヘッドを抑えつつ、本番環境で低い CPU 使用率（約1%）と低いメモリ使用量で動作します。

寄贈されたプロファイリングエージェントは、最適でないコードパスの特定や「未知の未知」の発見を容易にし、すべてのアプリケーションのランタイム動作に対する包括的な可視性を提供します。
継続的プロファイリングエージェントは、以下のような幅広いランタイムと言語をサポートしています。

- C/C++
- Rust
- Zig
- Go
- Java
- Python
- Ruby
- PHP
- Node.js / V8
- Perl
- .NET

## OpenTelemetry への利点 {#benefits-to-opentelemetry}

この寄贈は、オブザーバビリティにおける継続的プロファイリングの標準化を促進するだけでなく、OpenTelemetry における重要なシグナルとしての採用を加速させます。
ユーザーは、プロファイリングデータを収集するためのベンダー非依存の方法を得て、トレース、メトリクス、ログなどの既存のシグナルと相関させることで、オブザーバビリティのインサイトと効率的なトラブルシューティング体験の新たな可能性が開かれます。

### OpenTelemetry プロファイリングのユーザーにとっての利点 {#user-benefits-of-opentelemetry-profiling}

OpenTelemetry ベースの継続的プロファイリングは、ユーザーに以下の可能性をもたらします。

- 継続的プロファイリングデータは、サービスの動作に関する詳細なコードレベルのインサイトを提供することで、既存のシグナル（トレース、メトリクス、ログ）を補完します。

- トレースなどの他の OpenTelemetry シグナルとのシームレスな相関により、忠実度と調査の深度が向上します。

- 環境への影響の推定：プロファイリングデータを OpenTelemetry のリソース情報（リソース属性など）と組み合わせることで、サービスのカーボンフットプリントに関するインサイトを導き出せます。

- サービスのリソース利用状況の詳細な内訳を通じて、プロファイリングデータはパフォーマンス最適化の機会に関する実用的な情報を提供します。

- ベンダー中立性の向上：ベンダー非依存の eBPF ベースのプロファイリングエージェントにより、プロファイリングテレメトリーの収集にプロプライエタリなエージェントに依存する必要がなくなります。

これらの利点により、SRE、開発者、DevOps は、クラウド上のアプリケーション全体の効率性を管理しながら、エンジニアリングチームがアプリケーションを最適化することを確実にできるようになります。

次のステップとして、Elastic が参加している OpenTelemetry プロファイリング SIG は、寄贈されたエージェントを OpenTelemetry のコンポーネントエコシステムに統合する作業を共同で進めていきます。
完全に統合され、利用可能な新しい OpenTelemetry eBPF プロファイリングエージェントを、近いうちにユーザーに提供できることを楽しみにしています。
