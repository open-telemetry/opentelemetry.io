---
title: コンテキスト
weight: 55
description: 計装されたアプリケーションにおけるコンテキスト API の仕組みを学びましょう。
default_lang_commit: 12862017e85a7b88fbd194241af00f4dbd4ee75c
cSpell:ignore: Swoole
---

OpenTelemetry はテレメトリーデータの保存と伝搬によって動作します。
たとえば、計装されたアプリケーションがリクエストを受信してスパンが開始されると、子スパンを作成するコンポーネントがそのスパンを利用できなければなりません。
このニーズに対応するため、OpenTelemetry はアクティブコンテキストにスパンを保存します。

## PHP 実行コンテキスト {#php-execution-context}

コンテキスト API は単一の PHP 実行コンテキスト内でグローバルに利用可能であり、現在の実行コンテキスト内には1つの[アクティブコンテキスト](#active-context)しか存在できません。

### ストレージ {#storage}

コンテキストは値（たとえば `Span`）を保存でき、保存された値の追跡には `Storage` を使用します。
デフォルトでは、汎用的な `ContextStorage` が使用されます。
OpenTelemetry for PHP は、`fibers` を用いた非同期処理や並行処理のような、一般的でないユースケース向けに他のコンテキストストレージもサポートしています。

## コンテキストキー {#context-keys}

値はキーバリューペアとしてコンテキストに保存されます。
コンテキストキーは、コンテキストから値を保存および取得するために使用されます。

キーは `OpenTelemetry\Context\Context::createKey()` を呼び出すことで作成できます。
たとえば以下のようにします。

```php
use OpenTelemetry\Context\Context;

$key1 = Context::createKey('My first key');
$key2 = Context::createKey('My second key');
```

## アクティブコンテキスト {#active-context}

アクティブコンテキストは、`Context::getCurrent()` によって返されるコンテキストです。
コンテキストオブジェクトには、テレメトリーコンポーネントが互いに通信するためのエントリーが含まれています。
たとえば、スパンが作成されるとそれをアクティベートでき、新しいアクティブコンテキストが作成されてスパンが保存されます。
その後、別のスパンが作成されると、アクティブコンテキストからスパンを取得して親スパンとして使用できます。
アクティブなコンテキストがない場合は、空のコンテキストオブジェクトであるルートコンテキストが返されます。

```php
use OpenTelemetry\Context\Context;

// アクティブコンテキストを返す
// アクティブなコンテキストがない場合は、ルートコンテキストが返される
$context = Context::getCurrent();
```

### コンテキスト値の設定と取得 {#set-and-get-context-values}

値は `$context->with($key, $value)` メソッドを使用してコンテキストに保存されます。
コンテキストエントリーを設定すると、そのストレージに `$value` を含む新しいエントリーを持つ新しいコンテキストが作成されます。

コンテキストは不変です。
コンテキストエントリーを設定すると、そのストレージに新しいエントリーを持つ新しいコンテキストが作成されます。
`$context->with($key, $value)` で値を設定し、`$context->get($key)` で取得します。
たとえば以下のようにします。

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('some key');

// 新しいエントリーを追加する
$ctx2 = Context::getCurrent()->with($key, 'context 2');

// ctx2 は新しいエントリーを含む
var_dump($ctx2->get($key)); // "context 2"

// アクティブコンテキストは変更されていない
var_dump(Context::getCurrent()->get($key)); // NULL
```

現在のコンテキストで値が見つからない場合は、キーが見つかるか、ルートコンテキストに到達するまで、各親が順にチェックされます。

### コンテキストのアクティベート {#activate-a-context}

コンテキストは `$context->activate()` を呼び出すことでアクティブにできます。

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');
$ctx = Context::getCurrent();
$ctx2 = $ctx->with($key, 'context 2');
$ctx2->activate();
assert($ctx2 === Context::getCurrent());
```

#### スコープ {#scope}

`$context->activate()` の戻り値は `Scope` です。
そのコンテキストを非アクティブにするには、スコープの `detach()` を呼び出す必要があります。
これにより、以前アクティブだったコンテキストが再びアクティブになります。

`$scope->detach()` の戻り値は整数です。
戻り値が `0` の場合、スコープが正常にデタッチされたことを意味します。
0 以外の値は、呼び出しが予期しないものだったことを意味します。
これは、スコープに関連付けられたコンテキストが以下のいずれかの状態だった場合に発生する可能性があります。

- すでにデタッチされている
- 現在の実行コンテキストの一部ではない
- アクティブコンテキストではない

#### DebugScope {#debugscope}

コンテキストとスコープに関する問題の特定を支援するために、`DebugScope` が用意されています。
アサーションが有効な PHP ランタイムでは、アクティベートされた `Context` は `DebugScope` でラップされます。
`DebugScope` はスコープがアクティベートされたタイミングを追跡し、スコープがデタッチされなかった場合にエラーを発生させるデストラクターを持っています。
エラー出力には、どのコードがコンテキストをアクティベートしたかのバックトレースが含まれます。

以下のコードはスコープがデタッチされていないことを警告するエラーを発生させ、スコープが作成された場所のバックトレースを表示します。

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');
$scope = Context::getCurrent()->with($key, 'value')->activate();

// $scope をデタッチせずに終了
```

これは一部の状況、特にレガシーアプリケーションが `exit` や `die` を使用する場合に問題となることがあります。
その場合、アクティブなスパンは完了およびエクスポートされず、`DebugScope` がエラーを報告します。

`DebugScope` がエラーを報告する理由を理解し、そのリスクを受け入れる場合は、`OTEL_PHP_DEBUG_SCOPES_DISABLED` を truthy な値に設定することでこの機能を完全に無効にできます。

### ネストされたコンテキスト {#nested-context}

アクティブコンテキストの実行はネストできます。
これが、トレースがネストされたスパンを持てる仕組みです。

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');

var_dump(Context::getCurrent()->get($key)); //NULL
$scope2 = Context::getCurrent()->with($key, 'context 2')->activate();
var_dump(Context::getCurrent()->get($key)); //'context 2'
$scope3 = Context::getCurrent()->with($key, 'context 3')->activate();
var_dump(Context::getCurrent()->get($key)); //'context 3'

$scope3->detach(); //context 2 がアクティブ
$scope2->detach(); //元のコンテキストがアクティブ
var_dump(Context::getCurrent()->get($key)); //NULL
```

### 非同期環境でのコンテキスト {#context-in-asynchronous-environments}

`Swoole` や Fiber ベースの `Revolt` イベントループなど、非同期 PHP プログラミングでは、複数のアクティブコンテキストが存在できますが、実行コンテキストごとにアクティブなコンテキストは1つだけです。

Fiber ベースの実装では、`Context` はアクティブな Fiber に関連付けられ、PHP の Fiber 初期化ハンドラー、フォークハンドラー、破棄ハンドラーにフックすることで、適切にフォーク、切り替え、破棄されます。

その他の非同期実装では、正しく連携するためにカスタムコンテキストストレージが必要になる場合があります。
ストレージの実装については[レジストリ](/ecosystem/registry/?language=php)を確認してください。
