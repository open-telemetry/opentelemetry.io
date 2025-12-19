---
title: コンテキスト
description: OpenTelemetry JavaScript Context API ドキュメント
aliases: [api/context]
weight: 60
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

OpenTelemetryが動作するためには、重要なテレメトリーデータを保存し、伝搬する必要があります。
たとえば、リクエストを受信してスパンが開始されるとき、その子スパンを作成するコンポーネントでそのスパンが利用可能である必要があります。
この問題を解決するため、OpenTelemetryはスパンをContextに保存します。
このドキュメントでは、JavaScript用のOpenTelemetry context APIとその使用方法について説明します。

詳細は以下を確認してください。

- [Context仕様](/docs/specs/otel/context/)
- [Context APIリファレンス](https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.ContextAPI.html)

## コンテキストマネージャー {#context-manager}

コンテキストAPIが動作するためには、コンテキストマネージャーに依存します。
このドキュメントの例では、すでにコンテキストマネージャーが設定されていることを前提としています。
通常、コンテキストマネージャーはSDKによって提供されますが、以下のように直接登録することも可能です。

```typescript
import * as api from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);
```

## ルートコンテキスト {#root-context}

`ROOT_CONTEXT`は空のコンテキストです。
アクティブなコンテキストがない場合、`ROOT_CONTEXT`がアクティブになります。
アクティブコンテキストについては、以下の[アクティブコンテキスト](#active-context)で説明します。

## コンテキストキー {#context-keys}

コンテキストエントリはキーと値のペアです。
キーは`api.createContextKey(description)`を呼び出すことで作成できます。

```typescript
import * as api from '@opentelemetry/api';

const key1 = api.createContextKey('My first key');
const key2 = api.createContextKey('My second key');
```

## 基本操作 {#basic-operations}

### エントリの取得 {#get-entry}

エントリは`context.getValue(key)`メソッドを使用してアクセスします。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
// ROOT_CONTEXTは空のコンテキスト
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
```

### エントリの設定 {#set-entry}

エントリは`context.setValue(key, value)`メソッドを使用して作成します。
コンテキストエントリを設定すると、前のコンテキストのすべてのエントリを持つ新しいコンテキストが作成されますが、新しいエントリも含まれます。
コンテキストエントリの設定は、前のコンテキストを変更しません。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
const ctx = api.ROOT_CONTEXT;

// 新しいエントリを追加
const ctx2 = ctx.setValue(key, 'context 2');

// ctx2には新しいエントリが含まれる
console.log(ctx2.getValue(key)); // "context 2"

// ctxは変更されない
console.log(ctx.getValue(key)); // undefined
```

### エントリの削除 {#delete-entry}

エントリは`context.deleteValue(key)`を呼び出すことで削除されます。
コンテキストエントリを削除すると、前のコンテキストのすべてのエントリを含む新しいコンテキストが作成されますが、キーで識別されるエントリは除外されます。
コンテキストエントリの削除は、前のコンテキストを変更しません。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, 'context 2');

// エントリを削除
const ctx3 = ctx.deleteValue(key);

// ctx3にはエントリが含まれない
console.log(ctx3.getValue(key)); // undefined

// ctx2は変更されない
console.log(ctx2.getValue(key)); // "context 2"
// ctxは変更されない
console.log(ctx.getValue(key)); // undefined
```

## アクティブコンテキスト {#active-context}

**重要**: これはコンテキストマネージャーが設定されていることを前提としています。コンテキストマネージャーがないと、`api.context.active()`は**常に**`ROOT_CONTEXT`を返します。

アクティブコンテキストは、`api.context.active()`によって返されるコンテキストです。
コンテキストオブジェクトには、単一の実行スレッドをトレースするトレーシングコンポーネントが相互に通信し、トレースが正常に作成されることを保証するエントリが含まれています。
たとえば、スパンが作成されるとき、そのスパンがコンテキストに追加される場合があります。
後で別のスパンが作成されるとき、コンテキストからのスパンを親スパンとして使用する場合があります。
これは、Node.jsでは[async_hooks](https://nodejs.org/api/async_hooks.html)や[AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)、Webでは[zone.js](https://github.com/angular/angular/tree/main/packages/zone.js)などのメカニズムを使用して、単一の実行を通じてコンテキストを伝搬することで実現されます。
アクティブなコンテキストがない場合、空のコンテキストオブジェクトである`ROOT_CONTEXT`が返されます。

### アクティブコンテキストの取得 {#get-active-context}

アクティブコンテキストは、`api.context.active()`によって返されるコンテキストです。

```typescript
import * as api from '@opentelemetry/api';

// アクティブコンテキストを返す
// アクティブなコンテキストがない場合、ROOT_CONTEXTが返される
const ctx = api.context.active();
```

### アクティブコンテキストの設定 {#set-active-context}

`api.context.with(ctx, callback)`を使用してコンテキストをアクティブにできます。
`callback`の実行中、`with`に渡されたコンテキストが`context.active`によって返されます。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');
const ctx = api.context.active();

api.context.with(ctx.setValue(key, 'context 2'), async () => {
  // "context 2"がアクティブ
  console.log(api.context.active().getValue(key)); // "context 2"
});
```

`api.context.with(context, callback)`の戻り値は、コールバックの戻り値です。
コールバックは常に同期的に呼び出されます。

```typescript
import * as api from '@opentelemetry/api';

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row['name'];
});

console.log(name); // dbによって返された名前
```

アクティブコンテキストの実行はネストできます。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');
const ctx = api.context.active();

// アクティブなコンテキストなし
console.log(api.context.active().getValue(key)); // undefined

api.context.with(ctx.setValue(key, 'context 2'), () => {
  // "context 2"がアクティブ
  console.log(api.context.active().getValue(key)); // "context 2"
  api.context.with(ctx.setValue(key, 'context 3'), () => {
    // "context 3"がアクティブ
    console.log(api.context.active().getValue(key)); // "context 3"
  });
  // "context 2"がアクティブ
  console.log(api.context.active().getValue(key)); // "context 2"
});

// アクティブなコンテキストなし
console.log(api.context.active().getValue(key)); // undefined
```

### 例 {#example}

以下のより複雑な例では、コンテキストが変更されるのではなく、新しいコンテキストオブジェクトが作成されることを示しています。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');

const ctx = api.context.active(); // アクティブコンテキストがない場合ROOT_CONTEXTを返す
const ctx2 = ctx.setValue(key, 'context 2'); // ctxを変更しない

console.log(ctx.getValue(key)); //? undefined
console.log(ctx2.getValue(key)); //? "context 2"

const ret = api.context.with(ctx2, () => {
  const ctx3 = api.context.active().setValue(key, 'context 3');

  console.log(api.context.active().getValue(key)); //? "context 2"
  console.log(ctx.getValue(key)); //? undefined
  console.log(ctx2.getValue(key)); //? "context 2"
  console.log(ctx3.getValue(key)); //? "context 3"

  api.context.with(ctx3, () => {
    console.log(api.context.active().getValue(key)); //? "context 3"
  });
  console.log(api.context.active().getValue(key)); //? "context 2"

  return 'return value';
});

// コールバックによって返された値が呼び出し元に返される
console.log(ret); //? "return value"
```
