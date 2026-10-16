---
title: 伝搬
description: PHP API のコンテキスト伝搬
weight: 60
default_lang_commit: 4c35ec62a6208840d9550aa26dda826ca36fe3a6
---

{{% docs/languages/propagation %}}

伝搬は、サービスやプロセス間でデータを移動させる仕組みです。
トレーシングに限定されませんが、伝搬により、プロセス境界やネットワーク境界をまたいで任意に分散されたサービス間で、システムに関する因果関係の情報をトレースが構築できるようになります。

OpenTelemetry は、[W3C Trace Context](https://www.w3.org/TR/trace-context/) の HTTP ヘッダーを使用して、リモートサービスにコンテキストを伝搬するためのテキストベースの方法を提供します。

## 自動的なコンテキスト伝搬 {#automatic-context-propagation}

一般的なフレームワーク、ライブラリ、PHP エクステンション向けの自動計装が用意されています。
それらの多くは受信および送信のコンテキスト伝搬を行い、[レジストリ](/ecosystem/registry/?language=php&component=instrumentation)または [Packagist](https://packagist.org/packages/open-telemetry/) で見つけることができます。

> [!NOTE]
>
> コンテキストの伝搬には、自動計装または計装ライブラリを使用してください。
> 手動でコンテキストを伝搬することも可能ですが、PHP の自動計装と計装ライブラリは十分にテストされており、より簡単に利用できます。

### 受信リクエスト {#incoming-requests}

コンテキスト伝搬は、以下の方法で自動的に処理できます。

- サポートされている PHP フレームワーク（例: Laravel、Symfony、Slim）を、対応する自動計装パッケージとともに使用する
- コード内で [PSR-15](https://www.php-fig.org/psr/psr-15/) の `RequestHandlerInterface` を実装し、対応する自動計装パッケージとともに使用する
- 実験的な[自動ルートスパン](../sdk/#configuration)機能を使用する

### 送信リクエスト {#outgoing-requests}

HTTP クライアントおよびインターフェイス向けの自動計装パッケージは、送信 HTTP リクエストに W3C tracecontext ヘッダーを自動的に注入します。

## 手動でのコンテキスト伝搬 {#manual-context-propagation}

計装ライブラリを使用してコンテキストを伝搬できないケースもあります。
サービス間通信に使用しているライブラリに合致する計装ライブラリが存在しない場合があります。
あるいは、計装ライブラリが存在していたとしても、それでは満たせない要件がある場合もあります。

コンテキストを手動で伝搬する必要がある場合は、コンテキスト API を使用してください。

次のスニペットは、送信 HTTP リクエストの例を示しています。

```php
$request = new Request('GET', 'http://localhost:8080/resource');
$outgoing = $tracer->spanBuilder('/resource')->setSpanKind(SpanKind::CLIENT)->startSpan();
$outgoing->setAttribute(TraceAttributes::HTTP_METHOD, $request->getMethod());
$outgoing->setAttribute(TraceAttributes::HTTP_URL, (string) $request->getUri());

$carrier = [];
TraceContextPropagator::getInstance()->inject($carrier);
foreach ($carrier as $name => $value) {
    $request = $request->withAddedHeader($name, $value);
}
try {
    $response = $client->send($request);
} finally {
    $outgoing->end();
}
```

同様に、テキストベースのアプローチを使用して、受信リクエストから W3C Trace Context を読み取ります。
次の例は、受信 HTTP リクエストの処理を示しています。

```php
$request = ServerRequestCreator::createFromGlobals();
$context = TraceContextPropagator::getInstance()->extract($request->getHeaders());
$root = $tracer->spanBuilder('HTTP ' . $request->getMethod())
    ->setStartTimestamp((int) ($request->getServerParams()['REQUEST_TIME_FLOAT'] * 1e9))
    ->setParent($context)
    ->setSpanKind(SpanKind::KIND_SERVER)
    ->startSpan();
$scope = $root->activate();
try {
    /* do stuff */
} finally {
    $root->end();
    $scope->detach();
}
```

## 次のステップ {#next-steps}

伝搬についてさらに学ぶには、[Propagators API 仕様](/docs/specs/otel/context/api-propagators/)を参照してください。
