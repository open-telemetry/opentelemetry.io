---
title: Ecosystem Explorer プロジェクトの紹介
linkTitle: Ecosystem Explorer プロジェクト
date: 2026-04-30
author: '[Jay DeLuca](https://github.com/jaydeluca) (Grafana Labs)'
sig: Comms
cspell:ignore: Cavenaghi lucacavenaghi
default_lang_commit: b51a1db58883aa963c461d34356aa86ac18d94b7
---

OpenTelemetry は広大です。
Java エージェントだけでも、240 を超えるさまざまな自動計装が含まれています。
Collector には数百ものコンポーネントがあります。
Python、JavaScript、Go、.NET には、それぞれ独自の計装ライブラリエコシステムがあり、それぞれに独自のパターンや規約があります。

[2025 Developer Experience Survey](/blog/2025/devex-survey/#key-takeaways) では、ユーザーは「ドキュメントをたどるのが難しく、OpenTelemetry ウェブサイトと GitHub リポジトリを行き来する必要がある」、また「さまざまな情報源から情報をつなぎ合わせなければならない」ことが多いと回答しました。
主要な情報源として [opentelemetry.io](https://opentelemetry.io) を利用しているユーザーは約半数にすぎず、それ以外のユーザーは GitHub、ベンダードキュメント、あるいは答えを見つけられる場所を参照しています。

そして、ドキュメントを見つけられたとしても、それが基本的な疑問に答えてくれるとは限りません。
実際にどのテレメトリーシグナルを受け取ることになるのでしょうか。
[OpenTelemetry Getting Started Survey](/blog/2024/otel-get-started-survey/) では、回答者の 65% が、計装が実際に何を生成するのかを示すリファレンス実装を求めていることがわかりました。
[OpenTelemetry 2025 Year in Review post](/blog/2026/2025-year-in-review/#ecosystem-explorer-unlocking-the-power-of-our-metadata) で述べられているように、既存の [OpenTelemetry Registry](/ecosystem/registry/) はユーザーがコンポーネントを見つける助けになりますが、次のような疑問に答えるために「必要な情報の深さを常に提供しているわけではありません」。
どのライブラリが計装されているのか。
どのスパン、メトリクス、属性を出力するのか。
それはバージョンごとにどのように変わるのか。

OpenTelemetry の導入の中心には、根本的なジレンマがあります。
あるコンポーネントがどのテレメトリーを生成するのか（どのスパン、メトリクス、属性なのか）を理解するには、多くの場合、まずそれをデプロイしなければなりません。
OpenTelemetry が自分たちのニーズに合うか評価している人に、それを求めるのは大きな負担です。

私たちはそれを解決するものを構築しています。
約 1 年にわたってプロトタイプに取り組んだ後、新しいサイトが [explorer.opentelemetry.io](https://explorer.opentelemetry.io/) で公開されましたが、まだまだ開発途上です。

## Java エージェントエコシステム {#the-java-agent-ecosystem}

Java エージェントは、私たちが最初に完全にマッピングしたエコシステムです。
240 を超える計装が[インデックス化され、検索可能](https://explorer.opentelemetry.io/java-agent/instrumentation/latest)になっています。
名前で閲覧したり、計装タイプでフィルタリングしたり、各計装が出力するスパン、メトリクス、属性を正確に示す詳細ページを掘り下げたりできます。
設定オプションはドキュメント化され、それが影響するテレメトリーにマッピングされています。

![テレメトリー概要の例](vertx-telemetry.png)

バージョンサポートも組み込まれています。
Explorer は複数の Java エージェントリリースを追跡するため、特定のバージョンがどのテレメトリーを生成するのか、あるいはバージョン間で何が変わったのかを確認できます。
これは、アップグレードを計画するときや、リリース後にテレメトリーの見え方が変わった理由をデバッグするときに特に役立ちます。

![バージョン比較の例](vertx-comparison.png)

毎晩実行される自動化があります。
新しい Java エージェントバージョンがリリースされると、パイプラインがそれを検出し、メタデータを抽出し、レジストリを更新するため、手動での介入は不要です。

Java で初期アプローチを検証しました。
今度は、新しいエコシステムへ拡張するための助けが必要です。

## 未踏領域: 探索者求む {#the-frontier-explorers-needed}

Java エージェントは、OpenTelemetry エコシステムの一角にすぎません。
マッピングされるのを待っている他のコンポーネントの広大な領域があり、言語ごとにそれぞれ興味深い課題があります。

### Java カバレッジの拡大 {#expanding-java-coverage}

Java についても、まだ始まったばかりです。
Java agent の組み込み計装はマッピングされていますが、さらに多くのものがあります。
[opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib) リポジトリの拡張、コミュニティによるサードパーティ拡張、そして [Apache Camel](https://camel.apache.org/components/4.18.x/others/opentelemetry2.html) のようなライブラリに直接組み込まれたネイティブ計装です。
それぞれの層が、開発者が見つける必要のあるカバレッジを追加します。

また、ユーザーが Java エージェントの宣言的な設定ファイルをインタラクティブに探索し、構築する方法を提供する「Configuration Builder」機能にも取り組んでいます。
この近日公開予定の新機能に素晴らしい貢献を続けているコミュニティメンバー [Luca Cavenaghi (@lucacavenaghi97)](https://github.com/lucacavenaghi97) に、心から感謝します。

少しだけお見せします。

![Configuration builder](configuration-builder.png)

### Collector コンポーネント {#collector-components}

OpenTelemetry Collector には、レシーバー、プロセッサー、エクスポーター、コネクターからなる独自の豊かなエコシステムがあります。
Collector コンポーネントのメタデータを抽出する自動化パイプラインの大部分はすでに構築済みです。
今必要なのは、すべてを発見可能かつ検索可能にするためのウェブインターフェイスを構築することです。
これは完成間近で、完成まで持っていくために手伝ってくれる[コントリビューターを求めています](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/issues?q=sort%3Aupdated-desc%20is%3Aissue%20is%3Aopen%20label%3A%22Collector%20Ecosystem%22)。

### Python 計装 {#python-instrumentation}

Python エコシステムは Java とは異なる仕組みです。
単一の統合エージェントではなく、OpenTelemetry Python は PyPI 経由で配布される多数の個別の計装パッケージ（Flask、Django、FastAPI、requests など）で構成されています。
これらのパッケージは独立して[バージョン管理され、リリース](https://github.com/open-telemetry/opentelemetry-js-contrib/releases)されており、共通の OpenTelemetry 規約には従っていますが、出力されるテレメトリーの実装やドキュメント化に一貫性がない場合があります。

ここには、まだ解明すべきことが多くあります。
これらの分散したパッケージから計装の機能をどのように抽出するのか。
自動計装と明示的な計装の両方に適したメタデータスキーマはどのようなものか。
数十の独立したリリースサイクルにまたがる変更をどのように追跡するのか。

### JavaScript 計装 {#javascript-instrumentation}

JavaScript は Python と似たパターンをたどっており、OpenTelemetry JS は Express、Fastify、そしてより広い Node.js の領域をカバーする計装パッケージのモジュラーエコシステムを維持しています。
ただし、自動計装バンドルのような集約レイヤーも提供しており、Python よりもいくらかまとまりのある体験になっています。
Python 向けに開発するパターンは、JavaScript へのアプローチにも影響する可能性がありますが、それぞれのエコシステムには理解すべき独自のランタイムモデルや癖があります。

### GenAI と LLM の計装 {#genai-and-llm-instrumentation}

これは動きが特に速い領域のひとつですが、まだ手つかずの部分も多い領域です。
OpenTelemetry は生成 AI のためのセマンティック規約に積極的に取り組んでいますが、エコシステムは急速に変化しています。
LangChain、LlamaIndex、OpenAI クライアント、Anthropic クライアントなどのフレームワークはオブザーバビリティの追加を競っていますが、それぞれが実際にどのテレメトリーを出力するのかを示す信頼できるマップはありません。

一般的な LLM フレームワークはどのシグナルを取得するのでしょうか。
セマンティック規約の採用はどれほど完全なのでしょうか。
RAG パイプラインやエージェントのツール呼び出しをトレースするために、どのようなパターンが現れているのでしょうか。
これらは、[コントリビューターが答えを見つける手助けができる](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/issues/154)未解決の問いです。

### 共通言語を定義する {#defining-the-language}

特定のエコシステムをマッピングすることに加えて、コンポーネントの説明方法を定義する基盤的な作業があります。
計装はどのような機能カテゴリを提供するのでしょうか。
テレメトリーを出力するコンポーネント、他のソースからのテレメトリーを補強するコンポーネント、コンテキスト伝搬を扱うコンポーネントを、どのように区別するのでしょうか。
この分類体系の作業は、ユーザーが何を得られるのかを理解する助けになり、エコシステム全体で一貫した体験を構築する助けにもなります。
この考え方の多くは、より統合された自動計装モデルによって、より明確な定義と境界が必要になった Java エコシステムですでに発展してきました。
現在の課題は、それらの概念が他のエコシステムにどのように当てはまるのかを評価し、そのまま対応できる場所、適応が必要な場所、そして根本的に異なるランタイムモデルによってアプローチ全体を考え直す必要がある場所を特定することです。

## 貢献するさまざまな方法 {#many-ways-to-contribute}

手伝うために OpenTelemetry の専門家である必要はありません。
このプロジェクトにはさまざまなスキルが必要で、さまざまなレベルの入口があります。

### プロダクトデザイナーと UX エキスパート {#product-designers-and-ux-experts}

これらのコンポーネントに関連する情報は深く、非常に密になることがあります。
私たちは、私たちのアプローチを評価し、この圧倒的な量の情報をユーザー（そしてエージェント）に提示する方法を提案してくれるデザイナーや UX エキスパートを探しています。

### 調査とドキュメント {#research-and-documentation}

新しいエコシステムの自動化を構築する前に、誰かがそれを理解する必要があります。
どのメタデータが利用可能なのか。
それはどのように構造化されているのか。
どこに存在するのか。
これは探索的な作業です。
リポジトリを調べ、ソースコードを読み、パターンをドキュメント化します。
コードは不要で、価値あるものに貢献しながら OpenTelemetry の内部を学ぶ良い方法です。

### Python 自動化 {#python-automation}

データ抽出パイプラインは Python で書かれています。
新しいエコシステムを追加するには、そのエコシステムのリポジトリからメタデータを引き出す方法を理解する新しいウォッチャーを書く必要があります。
Python に慣れていてデータパイプラインに関心があるなら、新しいエコシステムの構築はここから始まります。

### ウェブ開発 {#web-development}

Explorer のフロントエンドは React、TypeScript、Tailwind CSS です。
UI の作業はたくさんあります。
Collector コンポーネントの新しいページ、検索とフィルタリングの改善、バージョン比較ビュー、アクセシビリティの改善、モバイル対応などです。
フロントエンド開発者であれば、すぐに目に見える影響を与えられます。

## 探索に参加する {#join-the-expedition}

あるコントリビューターは 1 つの領域を深く掘り下げ、別のコントリビューターは複数の領域を横断して手伝うかもしれません。
私たちは新しい参加者を歓迎しており、方向づけを喜んで手伝います。
興味深い issue を見つけたものの、どこから始めればよいかわからない場合は、ぜひ聞いてください。
メンテナーは活発に活動しており、適切な方向を示すことを喜んで手伝います。

プロジェクトの初期段階から貢献してくれているコミュニティメンバーに心から感謝します。

<!-- cspell:disable -->

- [Pratik Jadhav (@pratik50)](https://github.com/pratik50)
- [Luca Cavenaghi (@lucacavenaghi97)](https://github.com/lucacavenaghi97)
- [Adam Silva @adaumsilva](https://github.com/adaumsilva)
- [Manohar Mallipudi (@Vjc5h3nt)](https://github.com/Vjc5h3nt)
- [Erick Ruiz de Chavez (@eruizdechavez)](https://github.com/eruizdechavez)
- [Love Kumar Chauhan (@LoveChauhan-18)](https://github.com/LoveChauhan-18)
- [Pittu Sharma (@Pittu-Sharma)](https://github.com/Pittu-Sharma)

<!-- cspell:enable -->

Ecosystem Explorer は公開され、基盤は動作しており、これから興味深い作業が待っています。
これらのいずれかに魅力を感じたなら、参加する方法は次のとおりです。

- **開発中のサイトを探索する**:
  [explorer.opentelemetry.io](https://explorer.opentelemetry.io/)
- **コードを見る**:
  [github.com/open-telemetry/opentelemetry-ecosystem-explorer](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer)
- **issue を見つける、または作成する**: "[good first issue](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/issues?q=sort%3Aupdated-desc%20is%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22)"
  または
  "[help wanted](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/issues?q=sort%3Aupdated-desc%20is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22)"
  ラベルを探してください。
  かなりたくさんあります。
- **会話に参加する**:
  CNCF Slack の
  [`#otel-ecosystem-explorer`](https://cloud-native.slack.com/archives/C09N6DDGSPQ)
- **ミーティングに参加する**: Communications SIG、隔週火曜日の 9:00 AM PT

エコシステムを一緒にマッピングしましょう。
