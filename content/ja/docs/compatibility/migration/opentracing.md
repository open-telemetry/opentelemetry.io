---
title: OpenTracing からの移行
linkTitle: OpenTracing
aliases: [/docs/migration/opentracing/]
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
---

[OpenTracing][] との後方互換性は、プロジェクト発足当初から OpenTelemetry の優先事項でした。
移行を容易にするために、OpenTelemetry は同じコードベース内で OpenTelemetry と OpenTracing の両方の API を使用することをサポートしています。
これにより、OpenTracing の計装を OpenTelemetry SDK を使用して記録できます。

これを実現するために、各 OpenTelemetry SDK は **OpenTracing シム** を提供しており、OpenTracing API と OpenTelemetry SDK の間のブリッジとして機能します。
OpenTracing シムはデフォルトでは無効になっていることに注意してください。

## 言語バージョンのサポート {#language-version-support}

OpenTracing シムを使用する前に、プロジェクトの言語とランタイムコンポーネントのバージョンを確認し、必要に応じてアップデートしてください。
OpenTracing API と OpenTelemetry API の最低**言語**バージョンは以下の表のとおりです。

| 言語           | OpenTracing API | OpenTelemetry API |
| -------------- | --------------- | ----------------- |
| [Go][]         | 1.13            | 1.16              |
| [Java][]       | 7               | 8                 |
| [Python][]     | 2.7             | 3.6               |
| [JavaScript][] | 6               | 8.5               |
| [.NET][]       | 1.3             | 1.4               |
| [C++][]        | 11              | 11                |

OpenTelemetry の API と SDK は、一般的に OpenTracing の対応するものよりも高い言語バージョンを要求することに注意してください。

## 移行の概要 {#migration-overview}

多くのコードベースでは、現在 OpenTracing を使用して計装されています。
これらのコードベースは、OpenTracing API を使用してアプリケーションコードを計装したり、OpenTracing プラグインをインストールしてライブラリやフレームワークを計装しています。

OpenTelemetry への移行に対する一般的なアプローチは、以下のように要約できます。

1. OpenTelemetry SDK をインストールし、現在の OpenTracing 実装を削除します。
   たとえば Jaeger クライアントなどです。
2. OpenTelemetry の計装ライブラリをインストールし、OpenTracing の同等のものを削除します。
3. 新しい OpenTelemetry データを使用するようにダッシュボード、アラートなどを更新します。
4. 新しいアプリケーションコードを書く際は、すべての新しい計装を OpenTelemetry API を使用して記述します。
5. OpenTelemetry API を使用して段階的にアプリケーションを再計装します。
   既存の OpenTracing API 呼び出しをアプリケーションから削除する厳密な要件はなく、それらは引き続き動作します。

大規模なアプリケーションの移行は大きな労力を必要とする場合がありますが、上記で示したように、OpenTracing ユーザーにはアプリケーションコードを段階的に移行することを推奨します。
これにより移行の負担が軽減され、オブザーバビリティの中断を避けることができます。

以下のステップでは、OpenTelemetry への慎重で段階的な移行アプローチを示します。

### ステップ1：OpenTelemetry SDK のインストール {#step-1-install-the-opentelemetry-sdk}

計装を変更する前に、アプリケーションが現在出力しているテレメトリーを中断させることなく、OpenTelemetry SDK に切り替えられることを確認してください。
このステップを単独で実施し、新しい計装を同時に導入しないことが推奨されます。
これにより、計装に何らかの中断が生じたかどうかをより容易に判断できます。

1. 現在使用している OpenTracing トレーサー実装を OpenTelemetry SDK に置き換えます。
   たとえば Jaeger を使用している場合は、Jaeger クライアントを削除し、同等の OpenTelemetry クライアントをインストールします。
2. OpenTracing シムをインストールします。
   このシムにより、OpenTelemetry SDK が OpenTracing の計装を利用できるようになります。
3. OpenTracing クライアントが使用していたのと同じプロトコルとフォーマットでデータをエクスポートするように OpenTelemetry SDK を設定します。
   たとえば、Zipkin フォーマットでトレースデータをエクスポートする OpenTracing クライアントを使用していた場合は、OpenTelemetry クライアントも同様に設定します。
4. あるいは、OpenTelemetry SDK が OTLP を出力するように設定し、データを Collector に送信します。
   Collector では複数のフォーマットでのデータエクスポートを管理できます。

OpenTelemetry SDK をインストールしたら、アプリケーションをデプロイしても同じ OpenTracing ベースのテレメトリーを引き続き受信できることを確認してください。
つまり、ダッシュボード、アラート、その他のトレースベースの分析ツールが引き続き動作していることを確認してください。

### ステップ2：段階的な計装の置き換え {#step-2-progressively-replace-instrumentation}

OpenTelemetry SDK がインストールされると、すべての新しい計装は OpenTelemetry API を使用して記述できるようになります。
いくつかの例外を除き、OpenTelemetry と OpenTracing の計装はシームレスに連携します（以下の[互換性の制限事項](#limits-on-compatibility)を参照してください）。

既存の計装についてはどうでしょうか。
既存のアプリケーションコードを OpenTelemetry に移行する厳密な要件はありません。
ただし、OpenTracing の計装ライブラリ（Web フレームワーク、HTTP クライアント、データベースクライアントなどを計装するために使用されるライブラリ）から OpenTelemetry の同等のものへの移行を推奨します。
これによりサポートが向上します。
多くの OpenTracing ライブラリは廃止され、今後更新されない可能性があるためです。

OpenTelemetry の計装ライブラリに切り替える際、生成されるデータが変わることに注意してください。
OpenTelemetry には、ソフトウェアの計装方法に関する改善されたモデルがあります（「セマンティック規約」と呼ばれるものです）。
多くの場合、OpenTelemetry はより優れた、より包括的なトレースデータを生成します。
しかし、「より優れた」ということは「異なる」ということでもあります。
つまり、古い OpenTracing 計装ライブラリに基づく既存のダッシュボード、アラートなどは、それらのライブラリが置き換えられると動作しなくなる可能性があります。

既存の計装については、以下のことが推奨されます。

1. OpenTracing の計装の1つを OpenTelemetry の同等のものに置き換えます。
2. これによりアプリケーションが生成するテレメトリーがどのように変化するかを観察します。
3. この新しいテレメトリーを利用する新しいダッシュボード、アラートなどを作成します。
   新しい OpenTelemetry ライブラリを本番環境にデプロイする前に、これらのダッシュボードをセットアップしてください。
4. オプションとして、新しいテレメトリーを古いテレメトリーに変換する処理ルールを Collector に追加します。
   Collector は同じテレメトリーの両方のバージョンを出力するように設定でき、データの重複期間を作ることができます。
   これにより、古いダッシュボードを引き続き使用しながら、新しいダッシュボードにデータを蓄積させることができます。

## 互換性の制限事項 {#limits-on-compatibility}

このセクションでは、前述の[言語バージョンの制約](#language-version-support)以外の互換性の制限事項について説明します。

### セマンティック規約 {#semantic-conventions}

上述のように、OpenTelemetry にはソフトウェアの計装方法に関する改善されたモデルがあります。
つまり、OpenTracing の計装によって設定される「タグ」は、OpenTelemetry によって設定される「属性」とは異なる場合があります。
言い換えると、既存の計装を置き換える際、OpenTelemetry が生成するデータは OpenTracing が生成するデータとは異なる可能性があります。

繰り返しますが、明確にしておくと、計装を変更する際は、古いデータに依存していたダッシュボード、アラートなども必ず更新してください。

### バゲージ {#baggage}

OpenTracing では、バゲージはスパンに関連付けられた SpanContext オブジェクトで運ばれます。
OpenTelemetry では、コンテキストと伝搬はより低レベルの概念です。
スパン、バゲージ、メトリクス計装、その他の要素はコンテキストオブジェクト内で運ばれます。

この変更の結果、OpenTracing API を使用して設定されたバゲージは OpenTelemetry のプロパゲーターからは利用できません。
そのため、バゲージを使用する場合は、OpenTelemetry と OpenTracing の API を混在させることは推奨されません。

具体的には、OpenTracing API を使用してバゲージが設定された場合、以下のようになります。

- OpenTelemetry API からはアクセスできません。
- OpenTelemetry のプロパゲーターによって注入されません。

バゲージを使用している場合は、バゲージ関連のすべての API 呼び出しを同時に OpenTelemetry に切り替えることを推奨します。
これらの変更を本番環境にロールアウトする前に、重要なバゲージ項目がまだ伝搬されていることを必ず確認してください。

### JavaScript でのコンテキスト管理 {#context-management-in-javascript}

JavaScript では、OpenTelemetry API は Node.js の `async_hooks` やブラウザの `Zones.js` など、一般的に利用可能なコンテキストマネージャーを使用します。
これらのコンテキストマネージャーにより、トレースの計装は、トレースが必要なすべてのメソッドにスパンをパラメーターとして追加するのに比べて、はるかに侵入性が低く、負担の少ない作業になります。

しかし、OpenTracing API はこれらのコンテキストマネージャーが一般的に使用される以前に作られたものです。
現在アクティブなスパンをパラメーターとして渡す OpenTracing のコードは、アクティブなスパンをコンテキストマネージャーに格納する OpenTelemetry のコードと組み合わせると問題を引き起こす可能性があります。
同じトレース内で両方の方法を使用すると、壊れたスパンや不整合なスパンが生成される可能性があるため、推奨されません。

同じトレース内で2つの API を混在させるかわりに、コードパス全体を OpenTracing から OpenTelemetry に1つの単位として移行し、一度に1つの API のみを使用することを推奨します。

## 仕様と実装の詳細 {#specification-and-implementation-details}

各 OpenTracing シムの動作の詳細については、該当する言語固有のドキュメントを参照してください。
OpenTracing シムの設計の詳細については、[OpenTracing 互換性][ot_spec]を参照してください。

[.net]: /docs/languages/dotnet/shim/
[go]: https://pkg.go.dev/go.opentelemetry.io/otel/bridge/opentracing
[java]: https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim
[javascript]: https://www.npmjs.com/package/@opentelemetry/shim-opentracing
[opentracing]: https://opentracing.io
[ot_spec]: /docs/specs/otel/compatibility/opentracing/
[python]: https://opentelemetry-python.readthedocs.io/en/stable/shim/opentracing_shim/opentracing_shim.html
[c++]: https://github.com/open-telemetry/opentelemetry-cpp/tree/main/opentracing-shim
