---
title: OpenTelemetry が卒業しました… さて、次は？
linkTitle: OTel が卒業… 次は？
date: 2026-07-15
author: >-
  [Adriana Villela](https://github.com/avillela) (Dynatrace LLC), [Reese
  Lee](https://github.com/reese-lee) (New Relic)
sig: Governance Committee
issue: 10432
default_lang_commit: f5b3c44e7ed3e98a7307379e8c867750dd2f1dea
cSpell:ignore: Farfetch
---

見逃していたかもしれない方のためにお伝えします。
[OpenTelemetry（OTel）が正式に CNCF graduated ステータスを取得しました](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/)！
いまや [Kubernetes](https://kubernetes.io) や [Prometheus](https://prometheus.io/) などの素晴らしいオープンソースプロジェクトと並ぶ存在です。
長い道のりでしたし、私たちもとても興奮しています… ですが、次はどうなるのでしょうか？
これからの方向性を理解するには、これまでの歩みを振り返ることが重要です。

## 歴史 {#history}

それほど遠くない過去、テレメトリーシグナルは標準化されていませんでした。
つまり、テレメトリーのフォーマットはツールごとに異なり、各テレメトリーベンダーが独自の計装ライブラリを作成・管理していました。
ベンダーロックインは大きな問題でした。
ベンダーを切り替えたい場合、既存のベンダーのライブラリをコードから取り除き、新しいベンダーのライブラリに置き換える必要がありました。
その結果、ベンダーの切り替えは容易な作業ではありませんでした。

さらに、3つのコアテレメトリーシグナル（トレース、ログ、メトリクス）はそれぞれ独立して扱われていたため、相互に関連付ける簡単な方法がありませんでした。
このため、オブザーバビリティの全体像は不完全でした。

標準化に向けた過去の試みとして、[CNCF](https://cncf.io) の [OpenTracing](https://opentracing.io) と Google の [OpenCensus](https://opencensus.io) があり、これらが後の OpenTelemetry の基盤となりました。

![OpenTelemetry のタイムライン](./otel-timeline.png 'OpenTelemetry timeline')

単一の標準を目指し、2019年5月に OpenCensus と OpenTracing が統合されて [OpenTelemetry](https://opentelemetry.io) が誕生しました。
OpenTelemetry は両者の長所を取り入れ、さらにその先へと進み、トレース、メトリクス、ログの仕様、標準化された API セット、それらの API の言語固有の実装、そして [Collector](/docs/collector) を提供しています。

OpenCensus と OpenTracing はいずれも正式にアーカイブされました。
OpenTracing は2022年1月にアーカイブされ、OpenCensus は2023年7月にアーカイブされました。

すべての主要なオブザーバビリティベンダーの支援と、活発な開発者・エンドユーザーコミュニティのもと、OpenTelemetry はテレメトリーのデファクトスタンダードとなりました。

## 成長 {#growth}

[OpenTelemetry は CNCF で2番目に活発なプロジェクト](https://www.cncf.io/blog/2026/02/09/what-cncf-project-velocity-in-2025-reveals-about-cloud-natives-future/)であり、Kubernetes に次ぐ規模です。
[CNCF によると](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/)、OpenTelemetry は「2,800社超の企業からの12,000件超のコントリビューションと、さまざまな言語固有の Special Interest Group（SIG）にまたがる数百人のメンテナー」を擁しています。

設立以来、トレース、ログ、メトリクスは一般提供（GA）に達しました。
[プロファイリング](/blog/2024/profiling)が新しい OTel シグナルとして追加されました。
[OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) は拡張されました。
[OTel Collector](https://github.com/open-telemetry/opentelemetry-collector) も拡張され、新しいコンポーネントが定期的に追加されています。
OTel エコシステムをより使いやすくするための新しいコンポーネントも追加されてきました。
[OpAMP](/docs/specs/opamp/)、[OTel Operator](/docs/platforms/kubernetes/operator/)、[OTel Weaver](https://github.com/open-telemetry/weaver)、[OTel Arrow](https://github.com/open-telemetry/otel-arrow) などです。

OpenTelemetry がわずか7年であることを考えると、これは非常に印象的な成果です。
OpenTelemetry は定着した存在であるという明確なシグナルを発しており、卒業はそれをさらに確固たるものにしています。

## 卒業！ {#graduation}

OpenTelemetry は2025年に卒業への取り組みを開始し、2026年5月に graduated ステータスを達成しました。

CNCF の graduated プロジェクトになるには何が必要なのでしょうか？
プロジェクトは以下の基準を満たす必要があります。

1. **本番環境での採用。**
   [GitHub](https://www.youtube.com/live/vB9_SiTV5CI?si=F3jRi2w83Gp1lp_F) や [Farfetch](https://youtu.be/9iaGG-YZw5I?si=YDjY8N4Z4zI4uKiV) など、[多くの組織](/ecosystem/adopters/)が OpenTelemetry を本番環境で稼働させています。
2. **堅牢なガバナンス。**
   OTel には、選出と退任に関する明確な役割定義を持つ文書化された[ガバナンスモデル](https://github.com/open-telemetry/community/blob/96374af6e5b681664d80402bdc08d9a2d439a966/governance-charter.md)があり、透明性の高いコミュニケーションと意思決定が行われています。
3. **コミュニティの健全性。**
   OpenTelemetry にはプルリクエストのレビューと管理のための確立されたプロセスがあります。
   プロジェクトには[複数の組織にまたがる多数の定期的なコントリビューター](https://www.cncf.io/projects/opentelemetry)がいます。
   レビュアーは迅速に対応し、イシューや修正がタイムリーに処理されることを保証しています。
4. **セキュリティ。**
   OTel は少なくとも1回の独立したセキュリティ監査を受けており、特定されたすべての重大な問題は修正済みです。
5. **API の安定性。**
   API は安定しており、適切にバージョニングされ、定期的なリリースが行われています。
   既存の実装を破壊しないよう、後方互換性が保証されています。
6. **ドキュメント。**
   OTel のドキュメントはアーキテクチャの概要に加え、ユーザー、オペレーター、コントリビューター向けのガイドを提供しています。
7. **TOC への申請とレビュー。**
   [CNCF の Technical Oversight Committee（TOC）](https://www.cncf.io/people/technical-oversight-committee/)によるレビューのために、卒業申請テンプレートが提出されました。
   [OTel の申請内容](https://github.com/cncf/toc/issues/1739)をご覧ください。

ご覧のとおり、OTel メンテナーからエンドユーザー、CNCF TOC メンバーに至るまで、多くの献身的な方々が舞台裏で*多大な*作業を行いました。

OpenTelemetry コミュニティの卒業に貢献してくださったすべての方々に、**大きな**感謝を捧げたいと思います。
特に、OpenTelemetry ガバナンス委員会メンバーで元コミュニティマネージャーの [Austin Parker](https://github.com/austinlparker) 氏に感謝します。
彼は CNCF との卒業に向けた取り組みを主導しました。

## これがあなたにとって意味すること {#what-this-means-for-you}

では、OpenTelemetry の卒業は読者の皆さんにとって何を意味するのでしょうか？

[OTel エンドユーザー SIG](/community/end-user/) のメンテナーの一人である Dan Gomez Blanco 氏が、[最近の LinkedIn の投稿](https://www.linkedin.com/feed/update/urn:li:activity:7459538615640010752/)で的確にまとめています。

> エンドユーザーにとって、この卒業は OTel が「新興の標準」からは程遠い存在であることを示しています。
> そのコントリビューターの健全性、セキュリティと品質の基準、ガバナンスプロセス、そして広範な採用は、あらゆる規模のあらゆる企業が求めるレベルにあると評価されました。
> ですから、OTel を使用していない25%の懐疑的な方にとって、もはや言い訳はできません。
> 今こそ採用する最高のタイミングです！

要するに、OpenTelemetry は本番環境に対応しており、完全にビジネスで利用できる状態です。
もしあなたの組織が OpenTelemetry の使用を見送っていたなら、もう言い訳はできません！

## 次は何が来るのか？ {#whats-next}

ソフトウェアが本当に「完成」することはなく、OpenTelemetry も同じです。
仕様から API & SDK、Collector、そしてその先へと、成長と進化を続けていきます。

今後を見据えると、エージェントワークフローなどの新しい種類のワークロードにおけるオブザーバビリティへの強いニーズがあります。
これは新しい[生成 AI セマンティック規約](/docs/specs/semconv/gen-ai/)がカバーする分野です。
また、ブラウザーやモバイルのオブザーバビリティなど、以前はあまり注力してこなかった分野の課題にも取り組んでいます。

より成熟したチームは、OpenTelemetry を大規模に利用するためのガイダンスを求めています。
そこで活躍するのが [Weaver](https://github.com/open-telemetry/weaver) などのツールです。
Weaver はチームがテレメトリースキーマを定義し管理するのに役立ちます。
また、[OpenTelemetry Packaging](https://github.com/open-telemetry/opentelemetry-packaging) を通じてコンポーネントをインストール可能なモジュールとしてパッケージ化したり、[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) によるゼロコード計装を可能にしたりすることで、OTel の展開をより容易にしています。

OpenTelemetry には長い未来がありますが、それはメンテナーやコントリビューターによる継続的な作業と、もちろんエンドユーザーの皆さんによる継続的なサポートと採用があってこそ可能になることも理解しています。

今後どのような未来が待っているのか楽しみでなりません。
皆さんと一緒にこの旅を続けられることを嬉しく思います。
