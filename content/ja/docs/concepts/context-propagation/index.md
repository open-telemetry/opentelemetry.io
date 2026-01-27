---
title: コンテキスト伝搬
weight: 10
description: 分散トレーシングを可能にするコンセプトについて学びます。
default_lang_commit: 2eff1a357d20c7b9ba6e07f8c5b1ac057ac005c7
---

コンテキスト伝搬を使用すると、[シグナル](../signals/)（[トレース](../signals/traces/)、[メトリクス](../signals/metrics/)、および[ログ](../signals/logs/)）を生成された場所に関係なく相互に関連づけることができます。
トレースに限定されないものの、コンテキスト伝搬により、[トレース](../signals/traces/)はプロセスおよびネットワークの境界を超えて任意に分散されたサービス全体にわたってシステムに関する因果関係の情報を構築できます。

<!-- prettier-ignore-start -->
コンテキスト伝搬を理解するには、コンテキストと伝搬（プロパゲーション）の2つの概念を理解する必要があります。
<!-- prettier-ignore-end -->

## コンテキスト {#context}

コンテキストは、送信サービスと受信サービス、または[実行ユニット](/docs/specs/otel/glossary/#execution-unit)が1つのシグナルを別のシグナルと関連づけるための情報を含むオブジェクトです。

サービスAがサービスBを呼び出すと、サービスAはコンテキストの一部としてトレースIDとスパンIDを含めます。
サービスBはこれらの値を使用して、同じトレースに属する新しいスパンを作成し、サービスAからのスパンを親として設定します。
これにより、サービスの境界を超えたリクエストの完全なフローを追跡できます。

<!-- prettier-ignore-start -->
## 伝搬（プロパゲーション） {#propagation}
<!-- prettier-ignore-end -->

伝搬は、サービスとプロセス間でコンテキストを運ぶメカニズムです。
コンテキストオブジェクトをシリアライズまたはデシリアライズし、あるサービスから別のサービスに伝搬される関連情報を提供します。

伝搬は通常、計装ライブラリによって処理され、ユーザーからは透過的に行われます。
コンテキストを手動で伝搬する必要がある場合は、[Propagators API](/docs/specs/otel/context/api-propagators/)を使用できます。

OpenTelemetryは、いくつかの公式のプロパゲーターをメンテナンスしています。
デフォルトのプロパゲーターは、[W3C TraceContext](https://www.w3.org/TR/trace-context/)仕様で指定されたヘッダーを使用します。

## 例 {#example}

`Frontend`というサービスは、`POST /cart/add`や`GET /checkout/`などのさまざまなHTTPエンドポイントを提供し、`GET /product`というHTTPエンドポイントを介して下流サービスである`Product Catalog`にアクセスしてユーザーがカードに追加したい商品や決済対象の一部である商品の詳細を取得します。
`Frontend`からのリクストのコンテキスト内で`Product Catalog`サービスのアクティビティを把握するために、コンテキスト（ここではトレースIDと「親ID」としてのスパンID）はW3C TraceContext仕様で定義されている`traceparent`ヘッダーを使用して伝搬されます。
これはつまり、IDがヘッダーのフィールドに埋め込まれていることを意味します。

```text
<version>-<trace-id>-<parent-id>-<trace-flags>
```

例

```text
00-a0892f3577b34da6a3ce929d0e0e4736-f03067aa0ba902b7-01
```

### トレース {#traces}

前述のように、コンテキスト伝搬によりトレースはサービス全体にわたって因果関係の情報を構築できます。
この例では、`traceparent`ヘッダーからリモートコンテキストを抽出し、ローカルコンテキストに挿入してトレースIDと親IDを設定することにより、`Product Catalog`サービスのHTTPエンドポイント`GET /product`への2つの呼び出しをサービス`Frontend`内の上流の呼び出しと関連づけることができます。
これにより、[Jaeger](https://jaegertracing.io)などの[バックエンド](/ecosystem/vendors)で、2つのリクエストを1つのトレースのスパンとして表示できます。

![サービスをまたいだトレースの相関関係を示すコンテキスト伝搬の例](context-propagation-example.svg)

### ログ {#logs}

OpenTelemetry SDKは、ログをトレースと自動的に関連づけることができます。
これは、ログレコードにコンテキスト（トレースID、スパンID）を挿入できることを意味します。
これにより、ログが属するトレースとスパンのコンテキストを表示できるだけでなく、サービスまたは実行ユニットの境界を越えて共に属するログを表示することもできます。

### メトリクス {#metrics}

メトリクスの場合、コンテキスト伝搬により、そのコンテキスト内の測定値を集約できます。
たとえば、すべての`GET /product`リクエストのレスポンスタイムを確認するだけでなく、`POST /cart/add > GET /product`および`GET /checkout < GET /product`といった組み合わせのメトリクスも取得できます。

| 名前                            | 毎秒の呼び出し回数 | 平均レスポンスタイム |
| ------------------------------- | ------------------ | -------------------- |
| `* > GET /product`              | 370                | 300ms                |
| `POST /card/add > GET /product` | 330                | 130ms                |
| `GET /checkout > GET /product`  | 40                 | 1703ms               |

## カスタムコンテキスト伝搬 {#custom-context-propagation}

ほとんどのユースケースでは、コンテキスト伝搬を処理する[計装ライブラリまたはネイティブライブラリの計装](/docs/concepts/instrumentation/libraries/)が見つかります。
場合によっては、そのようなサポートが利用できず、自分でサポートを作成したい場合があります。
そのためには、前述のPropagators APIを活用する必要があります。

- 送信側では、コンテキストはキャリアに[注入](/docs/specs/otel/context/api-propagators/#inject)されます。
  たとえば、HTTPリクエストのヘッダーに注入されます。
  それ以外の場合では、リクエストのメタデータを保存できる場所を見つける必要があります。
- 受診側では、コンテキストはキャリアから[抽出](/docs/specs/otel/context/api-propagators/#extract)されます。
  HTTPの場合は、ヘッダーから取得されます。
  それ以外の場合は、送信側でコンテキストを保存するために選択した場所を選択します。

メタデータの専用フィールドがないプロトコルでコンテキストを伝搬することも可能ですが、受信側でデータが処理される前に抽出および削除されることを確認する必要があります。
さもなければ、未定義の動作が発生する可能性があります。

以下の言語については、カスタムコンテキスト伝搬のステップバイステップのチュートリアルがあります。

- [Erlang](/docs/languages/erlang/propagation/#manual-context-propagation)
- [JavaScript](/docs/languages/js/propagation/#manual-context-propagation)
- [PHP](/docs/languages/php/propagation/#manual-context-propagation)
- [Python](/docs/languages/python/propagation/#manual-context-propagation)

## セキュリティのベストプラクティス {#security-best-practices}

伝搬にはサービスの境界を超えてデータを送受信することが含まれるため、セキュリティ上の影響があります。

### 外部サービス {#external-services}

自身のサービスと外部サービス（自身で所有していない、または信頼していないサービス）とやり取りする場合、次の点を考慮してください。

- **受信コンテキスト**: 外部ソースからのコンテキストを受け入れる際は注意してください。
  悪意のある攻撃者は、偽造したトレースヘッダーを送信してトレーシングデータを操作したり、コンテキスト解析の脆弱性を悪用する可能性があります。
  信頼できないソースからのコンテキストを無視またはサニタイズすることを検討してください。
- **送信コンテキスト**: 外部サービスに伝搬する内容に注意してください
  内部のトレースID、スパンID、またはバゲッジアイテムによって、内部アーキテクチャやビジネスロジックに関する機密情報が漏洩する可能性があります。
  プロぱゲーターを構成して、外部またはパブリック向けのエンドポイントにコンテキストを送信しないようにすることを検討してください。

### バゲージ {#baggage

[バゲージ](../signals/baggage/)を使用すると、任意のキーと値のペアを伝搬できます。
このデータはサービスの境界を超えて伝搬されるため、バゲージに機密情報（ユーザー資格情報、APIキー、またはPIIなど）を含めないでください。
ログに記録されたり、信頼できない下流サービスに送信されたりする可能性があります。

## 言語SDKでのサポート {#language-sdk-support}

OpenTelemetry APIおよびSDKの個々の言語特有の実装については、それぞれのドキュメントページでコンテキスト伝搬のsパオートに関する詳細を確認できます。

- [C++](/docs/languages/cpp/instrumentation/#context-propagation)
- .NET
- [Erlang](/docs/languages/erlang/propagation/)
- [Go](/docs/languages/go/instrumentation/#propagators-and-context)
- [Java](/docs/languages/java/api/#context-api)
- [JavaScript](/docs/languages/js/propagation/)
- [PHP](/docs/languages/php/propagation/)
- [Python](/docs/languages/python/propagation/)
- [Ruby](/docs/languages/ruby/instrumentation/#context-propagation)
- Rust
- Swift

{{% alert title="Help wanted" color="secondary" %}}

.NET、Rust、Swift言語の場合、コンテキスト伝搬に関する言語固有のドキュメントが不足しています。
これらの言語のいずれかを知っていて、協力に興味がある場合は、[貢献方法を確認してください](/docs/contributing/)！

{{% /alert %}}

## 仕様 {#specification}

コンテキスト伝搬に関する詳細は、[コンテキスト仕様](/docs/specs/otel/context/)を参照してください。
