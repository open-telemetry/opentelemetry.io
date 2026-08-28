---
title: OpenTelemetry デモのフロントエンド刷新（Go から Next.js へ）
linkTitle: フロントエンド刷新デモ
date: 2022-11-16
author: '[Oscar Reyes](https://github.com/xoscar) (Tracetest)'
canonical_url: https://tracetest.io/blog/frontend-overhaul-opentelemetry-demo
default_lang_commit: 867f1ba6a44275ce3bc7d8708765a78baaa0287f
cSpell:ignore: Babiak Olly Tracetest
---

OpenTelemetry プロジェクトには多くの Special Interest Group（SIG）がありますが、その1つが [OpenTelemetry コミュニティデモ SIG](https://github.com/open-telemetry/opentelemetry-demo) です。
この SIG は、分散システムを OpenTelemetry で計装する方法を示すために使用される、計装済みのマイクロサービス群とフロントエンド Web アプリケーションを管理しています。

Web アプリケーションの主な目的は、使用するプログラミング言語、プラットフォーム、OS に関係なく、アプリケーションの計装方法を実演することです。
また、自動計装と手動計装、メトリクス、バゲージなど、さまざまな計装手法も紹介しています。
すべて、公式の OTel ドキュメントで規定されている標準と規約に従っています。
具体的な要件の詳細は[こちら](/docs/demo/requirements/)をご覧ください。

私の会社は OpenTelemetry コミュニティの一員となり、それを受け入れることに注力していました。
この夏の目標の1つは、意味のある貢献ができる OpenTelemetry のコアプロジェクトにもっと関わることでした。
OTel デモは私たちの目標に最適でした。
貢献することでコミュニティの助けになるだけでなく、自社製品のテストやショーケースに使える優れた事例にもなるからです。

最初に行ったのは、OTel デモ SIG のオーガナイザーである [Carter Socha](https://github.com/cartersocha) に連絡を取ることでした。
Carter はとても親切に迎え入れてくれ、私たちの貢献がもっともインパクトのある領域を特定する手助けをしてくれました。
[Austin Parker が作成したイシュー](https://github.com/open-telemetry/opentelemetry-demo/issues/39)を調べ始めました。
そのイシューでは、フロントエンドの全面的な刷新が提案されており、Go のサーバーサイドレンダリング（SSR）からブラウザサイドのクライアント（クライアントサイドレンダリング、CSR）を含むアーキテクチャへの移行、さらに全体的なスタイル、テーマ、ユーザーエクスペリエンスの改善が含まれていました。

楽しかった点の1つは、ストアを「普通の」ストアから天文学ストアに変更するという要望があったことです。
これは OpenTelemetry プロジェクト全体のブランディングに合わせるためでした。

OTel デモ SIG の他のメンバーから承認を得た後、フロントエンドアーキテクチャ刷新に含まれるさまざまな変更に取り組み始めました。

## OpenTelemetry デモアプリケーションの説明と技術スタック {#opentelemetry-demo-application-description-and-tech-stack}

デモアプリは天文学ストアであり、ショッピングカート、通貨セレクター、決済、チェックアウトなどの基本的な EC 機能を備えています。
また、ユーザーのコンテキストに応じたプロモーション（広告）や関連商品の表示機能も含まれています。

デモの技術スタックには、OTel がサポートする以下の各言語をカバーする、さまざまな言語で書かれた複数のマイクロサービスが含まれています。

- [C++](/docs/languages/cpp/)
- [.NET](/docs/languages/dotnet/)
- [Erlang/Elixir](/docs/languages/erlang/)
- [Go](/docs/languages/go/)
- [Node.js](/docs/languages/js/)
- [PHP](/docs/languages/php/)
- [Python](/docs/languages/python/)
- [Ruby](/docs/languages/ruby/)
- [Rust](/docs/languages/rust/)

各マイクロサービスには特定の役割があり、グローバルな gRPC 定義を使用して他のサービスと通信できます。
永続的な情報は PostgreSQL データベースに保存され、サードパーティのサービスに接続してイベント（確認メールなど）をトリガーするアウトバウンドサービスもあります。
フロントエンドを含むすべてのマイクロサービスは、同じ OpenTelemetry Collector インスタンスに接続されており、トレースデータのデータストアの1つとして Jaeger を使用しています。

![OpenTelemetry デモシステム図](diagram.png)
![OpenTelemetry デモテクノロジーリスト](technologies.png)

アーキテクチャの再設計前、フロントエンドは Golang の SSR アプリで構成されており、完全な HTML をブラウザに送信して表示していました。
すべてのリクエストと呼び出しはサーバーにリダイレクトされ、新しい情報が表示されていました。

## Web アプリのスタイル改善、テーマ更新、ユーザーエクスペリエンスの再設計 {#web-app-styling-improvements-theme-updates-and-user-experience-redesign}

開発プロセスの開始前、フロントエンドアプリケーションは色、商品、全体的なユーザーエクスペリエンスの面で OpenTelemetry が使用してきたテーマと一致していませんでした。
さらに、現在の実装が Go アプリケーションであったため、デモには本格的なフロントエンド（ブラウザサイド）アプリケーションがありませんでした。

![OpenTelemetry デモの旧フロントエンド](old-design.png)

最初のタスクは、デザイン、配色、ユーザーエクスペリエンスを更新して、デモを現代的にすることでした。
Olly Babiak がこの取り組みに参加し、アプリケーションのモダン化バージョンを作成してくれました。
商品ランディングページの改善された表示方法、更新された商品詳細ページ、ミニカート、そしてアプリケーションの完全なモバイル対応バージョンが含まれていました。

![OpenTelemetry デモの新フロントエンド](new-design.png)

これで、OpenTelemetry のテーマや配色に合致し、OpenTelemetry.io ウェブサイトにより近い外観のアプリケーションデザインが完成しました。

## フロントエンドアプリケーションのアーキテクチャ刷新 {#front-end-application-architecture-overhaul}

私たちは、以下を含む初期提案を作成しました。

- フレームワークとツール（スキャフォールディング、I/O、スタイリング、UI ライブラリ）
- コードアーキテクチャと構造（ディレクトリ、コーディングパターン）
- 計装
- デプロイと配布
- テスト（E2E、ユニットテスト）

この提案は、毎週月曜日に開催されるミーティングの1つで OpenTelemetry デモ SIG に提示され、進行の承認を得ました。
変更の一環として、[Next.js](https://nextjs.org/) を使用することにしました。
これは、主要なフロントエンドアプリケーションとして機能するだけでなく、フロントエンドと gRPC バックエンドサービス間の集約レイヤーとしても機能します。

![新しいフロントエンドのデータフロー](data-flow.png)

図のように、アプリケーションには2つの主要な接続ポイントがあります。
1つはブラウザサイド（REST）から Next.js の集約レイヤーへの接続、もう1つは集約レイヤーからバックエンドサービス（gRPC）への接続です。

## OpenTelemetry の計装 {#opentelemetry-instrumentation}

次に取り組んだ大きな課題は、Next.js アプリの両サイドを計装する方法でした。
そのために、すべてのマイクロサービスが使用している同じ Collector にアプリを2回接続する必要がありました。

[公式の gRPC エクスポーター](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)と [Node.js SDK](https://www.npmjs.com/package/@opentelemetry/sdk-node) を組み合わせて、シンプルなバックエンドソリューションを設計しました。

完全な[実装はこちら](https://github.com/open-telemetry/opentelemetry-demo/blob/298c93016e9cf03a06b9dbe07d6306c5040e52a0/src/frontend/utils/telemetry/Instrumentation.js?from_branch=main)で確認できます。
基本的な計装には、[Node.js で一般的に使用されるライブラリやツール](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)のほとんどに対する自動計装が含まれています。
ユーザーにより良い事例を提供するため、ルートミドルウェアの形で手動計装も追加されました。
これは受信する HTTP リクエストをキャッチし、コンテキスト伝搬を含むスパンを生成します。
[実装はこちら](https://github.com/open-telemetry/opentelemetry-demo/blob/2596ca097ee4ecda43b2379dd8a2637669d45948/src/frontend/utils/telemetry/InstrumentationMiddleware.ts?from_branch=main)で確認できます。

フロントエンドのほうは少しトリッキーでした。
[初回レンダリングがサーバーサイドで行われる](https://nextjs.org/docs/app/building-your-application/rendering#fundamentals)ためです。
JavaScript コードが実行される際に、ブラウザサイドからトレーサーをロードする必要がありました。

ブラウザサイドを確認するためのバリデーションを追加した後、カスタムのフロントエンドトレーシングモジュールをロードしました。
これには、[Web トレーサープロバイダーと自動 Web 計装](https://github.com/open-telemetry/opentelemetry-demo/blob/6674686ef389791c65f10c9e3dbb4078e0c12b63/src/frontend/utils/telemetry/FrontendTracer.ts?from_branch=main)の作成が含まれていました。

自動フロントエンド計装は、クリック、フェッチリクエスト、ページロードなど、もっとも一般的なユーザーアクションをキャプチャします。
ブラウザサイドが Collector と通信できるようにするには、設定の変更が必要です。
Web アプリからの受信 CORS リクエストを有効にしてください。

セットアップが完了したら、Docker からアプリケーションをロードしてさまざまな機能を操作することで、フロントエンドのユーザーイベントからバックエンドの gRPC サービスまでの完全なトレースを確認できるようになります。

![フロントエンドトレースの Jaeger 可視化](jaeger.png)

## OpenTelemetry への貢献はやりがいがあった {#contributing-to-opentelemetry-was-rewarding}

オブザーバビリティ分野のオープンソースツールを構築するチームとして、OpenTelemetry コミュニティ全体を支援する機会は私たちにとって重要でした。
さらに、複数の異なる言語やテクノロジーを使用した複雑なマイクロサービスベースのアプリケーションがあることは、私たちのチームにとって直接的に有用です。
OpenTelemetry プロジェクトへの貢献のプロセスはとても楽しいものでした。
今後も貢献の機会を積極的に探しています！

_[Oscar Reyes](https://github.com/xoscar) と [Olly Babiak](https://github.com/olha23) は Tracetest にも取り組んでいます。
Tracetest は、OpenTelemetry を使って分散システムの開発とテストを行えるオープンソースツールです。
OTel 互換のあらゆるシステムで動作し、トレースベースのテストを作成できます。
<https://github.com/kubeshop/tracetest> でぜひチェックしてみてください。_
