---
title: 属性ベースの計装
description: >-
  OpenTelemetry PHP Distro で PHP 8 属性を使用してスパンを自動作成します。
weight: 4
default_lang_commit: 1fef2df9c49cb4b2192665ef5b1df5746507cecb
cSpell:ignore: SpanAttribute WithSpan
---

OpenTelemetry PHP Distro は、PHP 8 属性を使用したスパンの自動作成をサポートしています。
メソッドや関数に `#[WithSpan]` を付与すると、計装コードを手動で書くことなくスパンを作成できます。

## 前提条件 {#prerequisites}

- PHP 8.0 以降（PHP 属性には PHP 8 以上が必要です）。
- アプリケーションに `open-telemetry/api` パッケージがインストールされていること。
- 環境変数 `OTEL_PHP_ATTR_HOOKS_ENABLED=true` が設定されていること（デフォルトは無効）。

## 有効化 {#enable}

```sh
export OTEL_PHP_ATTR_HOOKS_ENABLED=true
```

または `php.ini` で設定します。

```ini
opentelemetry_distro.attr_hooks_enabled=true
```

## 基本的な使い方 {#basic-usage}

```php
use OpenTelemetry\API\Instrumentation\WithSpan;

class OrderService
{
    #[WithSpan]
    public function processOrder(int $orderId): string
    {
        // "OrderService::processOrder" という名前のスパンが自動的に作成されます。
        return "processed-{$orderId}";
    }
}
```

## `#[WithSpan]` のオプション {#withspan-options}

```php
#[WithSpan(
    span_name: 'custom.span.name',          // デフォルト: "ClassName::methodName"
    span_kind: SpanKind::KIND_SERVER,        // デフォルト: KIND_INTERNAL
    attributes: ['key' => 'value'],          // スパンに追加される静的属性
)]
```

すべての引数はオプションで、位置引数または名前付き引数として渡せます。

```php
// 位置引数
#[WithSpan('payment.charge', SpanKind::KIND_CLIENT, ['db.system' => 'redis'])]

// 名前付き引数 — 任意のサブセット
#[WithSpan(span_kind: SpanKind::KIND_PRODUCER)]
#[WithSpan(span_name: 'message.publish', span_kind: SpanKind::KIND_PRODUCER)]
```

## `#[SpanAttribute]` でパラメーター値をキャプチャする {#capturing-parameter-values-with-spanattribute}

関数のパラメーターに `#[SpanAttribute]` を追加すると、そのランタイム値をスパン属性として含めることができます。

```php
use OpenTelemetry\API\Instrumentation\WithSpan;
use OpenTelemetry\API\Instrumentation\SpanAttribute;

class UserService
{
    #[WithSpan]
    public function createUser(
        #[SpanAttribute] string $username,               // 属性キー = "username"
        string                  $password,               // キャプチャされない
        #[SpanAttribute('user.email')] string $email,   // 属性キー = "user.email"
    ): int {
        // ...
    }
}
```

## `#[SpanAttribute]` でプロパティ値をキャプチャする {#capturing-property-values-with-spanattribute}

クラスプロパティに `#[SpanAttribute]` を適用すると、メソッド呼び出し時点のプロパティ値をキャプチャできます。

```php
class InvoiceService
{
    #[SpanAttribute]
    public string $customerId = '';

    #[SpanAttribute('invoice.currency')]
    public string $currency = 'EUR';

    #[WithSpan('invoice.generate')]
    public function generate(): string
    {
        // スパン属性には customerId と invoice.currency が含まれます
    }
}
```

## 例外の記録 {#exception-recording}

アノテーション付きメソッドが例外をスローすると、スパンは自動的に例外を記録し、ステータスを `ERROR` に設定します。
例外は通常どおり伝搬します。

```php
#[WithSpan]
public function riskyOperation(): void
{
    throw new \RuntimeException('something went wrong');
    // スパンは STATUS_ERROR で終了し、例外イベントが付加されます。
}
```

## ネストされたスパン {#nested-spans}

ある `#[WithSpan]` メソッドから別の `#[WithSpan]` メソッドを呼び出すと、ネストされたスパンが自動的に作成されます。

```php
class Pipeline
{
    #[WithSpan('pipeline.run')]
    public function run(): void
    {
        $this->step1(); // 子スパン: "pipeline.step1"
        $this->step2(); // 子スパン: "pipeline.step2"
    }

    #[WithSpan('pipeline.step1')]
    private function step1(): void {}

    #[WithSpan('pipeline.step2')]
    private function step2(): void {}
}
```

## スタンドアロン関数 {#standalone-functions}

`#[WithSpan]` はメソッドだけでなく、スタンドアロン関数でも使用できます。

```php
#[WithSpan('compute.result')]
function computeResult(#[SpanAttribute] int $input): int
{
    return $input * 2;
}
```

## 標準スパン属性 {#standard-span-attributes}

すべての `#[WithSpan]` スパンには、宣言箇所の以下の属性が含まれます。

| 属性             | 値                                       |
| ---------------- | ---------------------------------------- |
| `code.function`  | 関数名またはメソッド名                   |
| `code.namespace` | クラス名（スタンドアロン関数の場合は空） |
| `code.filepath`  | ソースファイルのパス                     |
| `code.lineno`    | 宣言の行番号                             |

## 互換性 {#compatibility}

`#[WithSpan]` と `#[SpanAttribute]` は、公式の [opentelemetry-php-instrumentation](https://github.com/open-telemetry/opentelemetry-php-instrumentation) エクステンションで使用されているものと同じ属性です。
そのエクステンションをすでに使用しているアプリケーションは、コードを変更せずにこの機能を有効にできます。
