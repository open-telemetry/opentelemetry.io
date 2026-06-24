---
title: OpenTelemetry デモのトレースベーステスト
linkTitle: OTel デモのテスト
date: 2023-07-27
author: '[Daniel Dias](https://github.com/danielbdias) (Tracetest)'
body_class: otel-with-contributions-from
default_lang_commit: b291d077d4c7aba2b43ec5a1648c02bb5c43f870
cSpell:ignore: Adnan Hamric kube nanos oteldemo Rahić tracetest tracetesting
---

[Adnan Rahić](https://github.com/adnanrahic) と [Ken Hamric](https://github.com/kdhamric) の協力を得て執筆。

[OpenTelemetry デモ](/ecosystem/demo/)は、Telescope Shop をシミュレートするシステムであり、異なるプログラミング言語で書かれた複数のマイクロサービスで構成されています。
各マイクロサービスは、この分散システムの特定の機能を担当しています。
デモの目的は、[OpenTelemetry](/) のツールと SDK をアプリケーションで使用して、監視結果のためのテレメトリーを取得し、さらには複数のサービスにまたがる[問題の追跡](/docs/demo/#scenarios)にも活用できることを示すことです。

デモをメンテナンスする際の課題の1つは、エコシステムに新しい機能を追加しつつ、既存の機能とテレメトリーが意図通りに動作することを保証することです。
この問題を数か月前に考え始めた OpenTelemetry デモチームは、将来のシステム変更がマイクロサービスの結果やテレメトリーに意図しない影響を与えることを防ぐために[議論を開始しました](https://github.com/open-telemetry/opentelemetry-demo/issues/873)。
その結果、[デモにトレースベースのテストが追加されました](https://github.com/open-telemetry/opentelemetry-demo/pull/877)。

この記事では、OpenTelemetry デモにトレースベースのテストがどのように追加されたかを説明します。
テストの構築中に直面した課題、その成果、そして OpenTelemetry コミュニティがデモのテストや機能追加をより高い信頼性のもとで行えるようになる方法について議論します。

## トレースベーステストとは {#what-is-a-trace-based-test}

トレースベーステストとは、システムに対してオペレーションをトリガーし、そのオペレーション中にシステムが生成した[トレース](/docs/concepts/signals/traces/)を使ってシステム出力を検証することで、システムの動作を確認するテストの一種です。

この用語は、KubeCon North America 2018 での Ted Young による講演 [Trace Driven Development: Unifying Testing and Observability](https://www.youtube.com/watch?v=NU-fTr-udZg) で広まりました。

トレースベーステストを実行するには、システムに対してオペレーションを実行し、トレースを生成します。
以下の手順に従います。

1. システムに対してオペレーションをトリガーし、その出力とオペレーションから生成されたトレース ID を収集します。
2. システムがテレメトリーデータストアにトレース全体を報告するのを待ちます。
3. オペレーション中にシステムが生成したトレースデータを収集します。
   このデータには、タイミング情報、およびエラーや例外が含まれます。
4. オペレーションの出力とトレースデータを期待される結果と照合して検証します。
   これには、トレースデータを分析してシステムが期待通りに動作し、出力が正しかったことを確認する作業が含まれます。
5. トレースデータが期待される結果と一致しない場合、テストは失敗します。
   トレースデータを手元に持つことで、開発者は問題を調査し、システムまたはテストに必要な変更を加えることができます。

![分散システムに対して実行されるトレースベーステストの例](./trace-based-testing-diagram.png)

この種のテストにより、分散システムの複数のコンポーネントを同時にテストし、それらが正しく連携して動作することを確認できます。
また、外部サービスからの障害や遅延レスポンスなど、実際の環境条件に対するシステムの動作をテストする方法も提供します。

## OpenTelemetry デモのトレースベーステストの作成 {#creating-trace-based-tests-for-the-opentelemetry-demo}

OpenTelemetry デモでは、システムの変更が結果とテレメトリーの両方に意図しない影響を与えないことを検証するために、トレースベーステストを導入しました。
テストは主に、システムのメインワークフローに関与するサービスに焦点を当てました。
このワークフローには以下が含まれます。

1. ユーザーがショップにアクセスする
2. 商品を選択する
3. 購入を決定する
4. チェックアウトプロセスを完了する

[デモに現在存在するテスト](/docs/demo/tests/)に基づいて、2種類のテストを構成しました。

- インテグレーションテスト
- エンドツーエンドテスト

テストは [10 個のサービスに対する 26 個のトレースベーステスト](https://github.com/open-telemetry/opentelemetry-demo/tree/5f83ad187000e861c6bfd6ee392d2de6be7c8702/test/tracetesting?from_branch=main)として整理されています。
`tracetesting` ディレクトリのこれらのトレースベーステストは、AVA と Cypress から移植されたもので、オペレーションの結果とトレースの両方をテストします。

### インテグレーションテスト {#integration-tests}

インテグレーションテストは [AVA](https://avajs.dev/) テストに基づいています。
これらのテストでは、システム内の各マイクロサービスのエンドポイントをトリガーし、そのレスポンスを検証し、結果として得られるオブザーバビリティのトレースが期待される動作と一致することを確認します。

1つの例として、通貨変換オペレーションが正しく返却されているかを確認する [Currency Service](https://github.com/open-telemetry/opentelemetry-demo/tree/e3548c621744514f48e71d7ada96632edd345545/src/currencyservice?from_branch=main) に対して作成された[インテグレーションテスト](https://github.com/open-telemetry/opentelemetry-demo/blob/62d1d9be11e63e824605d349cfeda37f0a0479b7/test/tracetesting/currency-service/convert.yaml?from_branch=main)があります。
以下は、このトレースベーステストの簡略化された YAML 定義です。

```yaml
type: Test
spec:
  name: 'Currency: Convert'
  description: Convert a currency
  trigger:
    type: grpc
    grpc:
      protobufFile: { { protobuf file with CurrencyService definition } }
      address: { { currency service address } }
      method: oteldemo.CurrencyService.Convert
      request: |-
        {
          "from": {
            "currencyCode": "USD",
            "units": 330,
            "nanos": 750000000
          },
          "toCode": "CAD"
        }
  specs:
    - name: It converts from USD to CAD
      selector: span[name="CurrencyService/Convert" rpc.system="grpc"
        rpc.method="Convert" rpc.service="CurrencyService"]
      assertions:
        - attr:app.currency.conversion.from = "USD"
        - attr:app.currency.conversion.to = "CAD"
    - name: It has more nanos than expected
      selector: span[name="Test trigger"]
      assertions:
        - attr:response.body | json_path '$.nanos' >= 599380800
```

`trigger` セクションでは、どのオペレーションをトリガーするかを定義します。
この場合、メソッド `oteldemo.CurrencyService.Convert` と指定のペイロードを使った gRPC サービスへの呼び出しです。

その後、`specs` セクションでは、トレースとオペレーション結果に対してどのアサーションを行うかを定義します。

2種類のアサーションがあります。

- 最初のアサーションは、`CurrencyService` が出力したトレースの[スパン](/docs/concepts/signals/traces/#spans)に対するものです。
  [スパンの属性](/docs/concepts/signals/traces/#attributes) `app.currency.conversion.from` と `app.currency.conversion.to` が正しい値を持つかどうかを確認することで、サービスが USD から CAD への変換オペレーションを受け取ったかを検証します。
- 2番目のアサーションは、オペレーション出力を表すトレースのスパンに対して行われ、レスポンスボディの属性 `nanos` の値が `599380800` 以下であるかを確認します。

### エンドツーエンドテスト {#end-to-end-tests}

エンドツーエンドテストは、[Cypress](https://www.cypress.io/) を使ったフロントエンドテストに基づいています。
フロントエンドが使用する API を通じてサービスを呼び出し、サービス間のインタラクションが正しいかを確認します。
また、トレースがサービスを通じて正しく[伝搬](/docs/concepts/signals/traces/#context-propagation)されているかも検証します。

これらのテストでは、デモの主要なユースケースに基づくシナリオを想定しました。
「_ユーザーが商品を購入する_」シナリオは、[Front-end service](https://github.com/open-telemetry/opentelemetry-demo/tree/79227c47898b0d4e1b96d0fff205d48faba11551/src/frontend?from_branch=main) の API に対して以下のオペレーションを実行します。

- ショップに入ると、ユーザーには以下が表示されます。
  - ショップの商品の広告。
  - ユーザーに適した商品のレコメンデーション。
- ユーザーが商品を閲覧します。
- 商品をショッピングカートに追加します。
- カートの内容が正しいか確認します。
- 最後に、ショッピングカートのチェックアウト機能を使って注文を完了します。
  これにより注文が確定され、ユーザーのクレジットカードに課金され、商品が発送され、ショッピングカートがクリアされます。

このテストは小さなテストの連続であるため、実行されるテストを定義する[トランザクション](https://github.com/open-telemetry/opentelemetry-demo/blob/62d1d9be11e63e824605d349cfeda37f0a0479b7/test/tracetesting/frontend-service/all.yaml?from_branch=main)を作成しました。

```yaml
type: Transaction
spec:
  name: 'Frontend Service'
  description:
    Run all Frontend tests enabled in sequence, simulating a process of a user
    purchasing products on the Astronomy store
  steps:
    - ./01-see-ads.yaml
    - ./02-get-product-recommendation.yaml
    - ./03-browse-product.yaml
    - ./04-add-product-to-cart.yaml
    - ./05-view-cart.yaml
    - ./06-checking-out-cart.yaml
```

このテストシーケンスの最後のステップでは、ユーザーがチェックアウトを行います。
このステップはオペレーションの複雑さからトリガーされるため興味深いです。
ほぼすべてのシステムサービスの呼び出しを調整しトリガーします。
このオペレーションのトレースの Jaeger スクリーンショットを以下に示します。

![checkout service formatted](./checkout-formatted.png)

このオペレーションでは、[Frontend](https://github.com/open-telemetry/opentelemetry-demo/tree/79227c47898b0d4e1b96d0fff205d48faba11551/src/frontend?from_branch=main)、[CheckoutService](https://github.com/open-telemetry/opentelemetry-demo/tree/0a39d4446596318ede4248c9442c690244e6501c/src/checkoutservice?from_branch=main)、[CartService](https://github.com/open-telemetry/opentelemetry-demo/tree/193eaa36824403f24e3fdb744a9a746e17a0b3c2/src/cart?from_branch=main)、[ProductCatalogService](https://github.com/open-telemetry/opentelemetry-demo/tree/8cb101d461f737beff7d3b804e97c78a7f47f6fa/src/productcatalogservice?from_branch=main)、[CurrencyService](https://github.com/open-telemetry/opentelemetry-demo/tree/e3548c621744514f48e71d7ada96632edd345545/src/currencyservice?from_branch=main) など、複数のサービスへの内部呼び出しを確認できます。

これはトレースベーステストの良いシナリオであり、出力が正しいこと、およびこのプロセスで呼び出されたサービスが正しく連携して動作していることを確認できます。
チェックアウト中にトリガーされる主要な機能を検証する、5つのアサーショングループを作成しました。

- _「フロントエンドが正常に呼び出された」_、テストトリガーの出力を確認します。
- _「注文が確定された」_、[CheckoutService](https://github.com/open-telemetry/opentelemetry-demo/tree/0a39d4446596318ede4248c9442c690244e6501c/src/checkoutservice?from_branch=main) が呼び出され、スパンが正しく出力されたかを確認します。
- _「ユーザーに課金された」_、[PaymentService](https://github.com/open-telemetry/opentelemetry-demo/tree/4c8e43f219ae8d2c302fb9d6c78164017c3314bc/src/paymentservice?from_branch=main) が呼び出され、スパンが正しく出力されたかを確認します。
- _「商品が発送された」_、[ShippingService](https://github.com/open-telemetry/opentelemetry-demo/tree/fca8fd1374081a3df2699f08cf5784dab16919a3/src/shippingservice?from_branch=main) が呼び出され、スパンが正しく出力されたかを確認します。
- _「カートが空になった」_、[CartService](https://github.com/open-telemetry/opentelemetry-demo/tree/193eaa36824403f24e3fdb744a9a746e17a0b3c2/src/cart?from_branch=main) が呼び出され、スパンが正しく出力されたかを確認します。

最終的なテスト YAML は以下の通りです。
チェックアウトオペレーションをトリガーし、これら5つのアサーショングループを検証します。

```yaml
type: Test
spec:
  name: 'Frontend: Checking out shopping cart'
  description: Simulate user checking out shopping cart
  trigger:
    type: http
    httpRequest:
      url: http://{{frontend address}}/api/checkout
      method: POST
      headers:
        - key: Content-Type
          value: application/json
      body: |
        {
          "userId": "2491f868-88f1-4345-8836-d5d8511a9f83",
          "email": "someone@example.com",
          "address": {
            "streetAddress": "1600 Amphitheatre Parkway",
            "state": "CA",
            "country": "United States",
            "city": "Mountain View",
            "zipCode": "94043"
          },
          "userCurrency": "USD",
          "creditCard": {
            "creditCardCvv": 672,
            "creditCardExpirationMonth": 1,
            "creditCardExpirationYear": 2030,
            "creditCardNumber": "4432-8015-6152-0454"
          }
        }
  specs:
    - name: 'The frontend has been called with success'
      selector: span[name="Test trigger"]
      assertions:
        - attr:response.status = 200
    - selector:
        span[name="oteldemo.CheckoutService/PlaceOrder" rpc.system="grpc"
        rpc.method="PlaceOrder" rpc.service="oteldemo.CheckoutService"]
      name: 'The order was placed'
      assertions:
        - attr:app.user.id = "2491f868-88f1-4345-8836-d5d8511a9f83"
        - attr:app.order.items.count = 1
    - selector: span[name="oteldemo.PaymentService/Charge" rpc.system="grpc"
        rpc.method="Charge" rpc.service="oteldemo.PaymentService"]
      name: 'The user was charged'
      assertions:
        - attr:rpc.grpc.status_code  =  0
        - attr:selected_spans.count >= 1
    - selector: span[name="oteldemo.ShippingService/ShipOrder" rpc.system="grpc"
        rpc.method="ShipOrder" rpc.service="oteldemo.ShippingService"]
      name: 'The product was shipped'
      assertions:
        - attr:rpc.grpc.status_code = 0
        - attr:selected_spans.count >= 1
    - selector: span[name="oteldemo.CartService/EmptyCart" rpc.system="grpc"
        rpc.method="EmptyCart" rpc.service="oteldemo.CartService"]
      name: 'The cart was emptied'
      assertions:
        - attr:rpc.grpc.status_code = 0
        - attr:selected_spans.count >= 1
```

最後に、これらのテストを実行すると以下のレポートが得られます。
トランザクション内で実行された各テストファイルと、上記で説明した「チェックアウト」ステップが表示されます。

```text
✔  Frontend Service (http://tracetest-server:11633/transaction/frontend-all/run/1)
  ✔  Frontend: See Ads (http://tracetest-server: 11633/test/frontend-see-adds/run/1/test)
    ✔  It called the frontend with success and got a valid redirectUrl for each ads
    ✔  It returns two ads
  ✔  Frontend: Get recommendations (http://tracetest-server: 11633/test/frontend-get-recommendation/run/1/test)
    ✔  It called the frontend with success
    ✔  It called ListRecommendations correctly and got 5 products
  ✔  Frontend: Browse products (http://tracetest-server:11633/test/frontend-browse-product/run/1/test)
    ✔  It called the frontend with success and got a product with valid attributes
    ✔  It queried the product catalog correctly for a specific product
  ✔  Frontend: Add product to the cart (http://tracetest-server:11633/test/frontend-add-product/run/1/test)
    ✔  It called the frontend with success
    ✔  It added an item correctly into the shopping cart
    ✔  It set the cart item correctly on the database
  ✔  Frontend: View cart (http://tracetest-server:11633/test/frontend-view-cart/run/1/test)
    ✔  It called the frontend with success
    ✔  It retrieved the cart items correctly
  ✔  Frontend: Checking out shopping cart (http://tracetest-server: 11633/test/frontend-checkout-shopping-cart/run/1/test)
    ✔  It called the frontend with success
    ✔  The order was placed
    ✔  The user was charged
    ✔  The product was shipped
    ✔  The cart was emptied
```

## テストの実行と OpenTelemetry デモの評価 {#running-the-tests-and-evaluating-the-opentelemetry-demo}

テストスイートが完成したら、デモで `make run-tracetesting` を実行してテストを実行します。
これにより、OpenTelemetry デモのすべてのサービスが評価されます。

テストの開発中に、テスト結果にいくつかの差異が見つかりました。
たとえば、Cypress テストにいくつかの軽微な修正が加えられ、バックエンド API でいくつかの動作が観察されました。
これらは後でテストおよび調査できます。
詳細は[このプルリクエスト](https://github.com/open-telemetry/opentelemetry-demo/pull/950)と[このディスカッション](https://github.com/open-telemetry/opentelemetry-demo/pull/905#discussion_r1207101535)で確認できます。

興味深い事例の1つは、[EmailService](https://github.com/open-telemetry/opentelemetry-demo/tree/969fe3bb0165a6f9e4684a0c69abb7d156fef230/src/emailservice?from_branch=main) の動作でした。
初めてテストを構築し、AVA テストで提供されたペイロードを使って直接呼び出したところ、サービスに対してトレースが生成され成功を示していましたが、Jaeger で確認すると HTTP `500` エラーが発生していました。

![single-email-formatted.png](./single-email-formatted.png)

しかし、チェックアウトプロセスの一部として実行した場合は、この Jaeger スクリーンショットに示されるように、期待通りに実行されました。

![email-under-checkout-formatted.png](./email-under-checkout-formatted.png)

何が起こったのでしょうか。
テレメトリーとコードを詳しく調べたところ、Email サービスはメールテンプレートの処理の性質上、Ruby で書かれており `snake_case` 標準を使用しているため、`JSON` で注文の詳細を `pascalCase` で送信するかわりに、

```json
{
  "email": "google@example.com",
  "order": {
    "orderId": "505",
    "shippingCost": {
      "currencyCode": "USD"
    }
    // ...
  }
}
```

`snake_case` で渡す必要があることがわかりました。
Checkout サービスはこれを正しく行っています。

```json
{
  "email": "google@example.com",
  "order": {
    "order_id": "505",
    "shipping_cost": {
      "currency_code": "USD"
    }
    // ...
  }
}
```

そうすることで、サービスへの呼び出しが成功し、以下に示すように正しく評価されます。

![email-success-formatted.png](./email-success-formatted-2.png)

この種の事例は、他の実際のシナリオでも発生する可能性があるため興味深いです。
テストとテレメトリーデータの助けを借りて、問題を特定し解決することができました。
[このテスト](https://github.com/open-telemetry/opentelemetry-demo/blob/62d1d9be11e63e824605d349cfeda37f0a0479b7/test/tracetesting/email-service/confirmation.yaml?from_branch=main)の場合は、Checkout サービスと同じパターンを使用しない選択をしました。

## まとめ {#conclusion}

この記事では、システムへの変更がマイクロサービスの結果やテレメトリーに意図しない影響を与えないことを確認するために、OpenTelemetry デモにトレースベーステストがどのように追加されたかを議論しました。

これらのテストにより、OpenTelemetry コミュニティはデモに新しい機能を追加し、他のコンポーネントに意図しない副作用が発生していないかを簡単に検証でき、テレメトリーが正しく報告されていることを確認できます。

オープンソースのオブザーバビリティツールを構築するチームとして、OpenTelemetry コミュニティ全体に貢献する機会を大切にしています。
そのため、2か月前に[このイシュー](https://github.com/open-telemetry/opentelemetry-demo/issues/873)が作成されてすぐに対応を開始しました。
