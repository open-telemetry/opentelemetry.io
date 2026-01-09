---
title: 上下文
description: OpenTelemetry JavaScript 上下文 API 文档
default_lang_commit: 2c3d80cad4fa99a5fb46ef550170ea4579fa50ec
drifted_from_default: true
aliases: [api/context]
weight: 60
---

要使 OpenTelemetry 正常工作，它必须对关键遥测数据进行存储与传递。
例如，当系统接收到请求并启动一个追踪 Span 时，该 Span 必须能够被后续创建其子 Span 的组件所访问。
为解决该问题，OpenTelemetry 会将追踪 Span 存储在上下文中。
本文档介绍了适用于 JavaScript 的 OpenTelemetry 上下文 API，以及具体使用方法。

## 上下文管理器 {#context-manager}

上下文 API 依赖于上下文管理器才能工作。
本文档中的示例将假设你已经配置好了一个上下文管理器。
通常上下文管理器由你的 SDK 提供，但是也可以直接注册一个，如下所示：

```typescript
import * as api from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);
```

## Root 上下文 {#root-context}

<!-- The `ROOT_CONTEXT` is the empty context. If no context is active, the
`ROOT_CONTEXT` is active. Active context is explained below
[Active Context](#active-context). -->

`ROOT_CONTEXT` 是一个空上下文。
如果当前没有活跃上下文，`ROOT_CONTEXT` 就会成为活跃上下文。
关于活跃上下文的详细信息，请参考[活跃上下文](#active-context)。

## 上下文键 {#context-keys}

上下文条目是键值对。
键可以通过调用 `api.createContextKey(description)` 来创建。

```typescript
import * as api from '@opentelemetry/api';

const key1 = api.createContextKey('My first key');
const key2 = api.createContextKey('My second key');
```

## 基本操作 {#basic-operations}

### 获取条目 {#get-entry}

条目可以通过 `context.getValue(key)` 方法来访问。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
// ROOT_CONTEXT 是一个空上下文
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
```

### 设置条目 {#set-entry}

条目可以通过 `context.setValue(key, value)` 方法来创建。
设置上下文条目会创建一个新上下文，其中包含前一个上下文的所有条目，但包含新条目。
设置上下文条目不会修改前一个上下文。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
const ctx = api.ROOT_CONTEXT;

// 添加一个新条目
const ctx2 = ctx.setValue(key, 'context 2');

// ctx2 包含新条目
console.log(ctx2.getValue(key)); // "context 2"

// ctx 未被修改
console.log(ctx.getValue(key)); // undefined
```

### 删除条目 {#delete-entry}

条目可以通过调用 `context.deleteValue(key)` 方法来删除。
删除上下文条目会创建一个新上下文，其中包含前一个上下文的所有条目，但不包含被标识为键的条目。
删除上下文条目不会修改前一个上下文。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, 'context 2');

// 删除条目
const ctx3 = ctx2.deleteValue(key);

// ctx3 不包含条目
console.log(ctx3.getValue(key)); // undefined

// ctx2 未被修改
console.log(ctx2.getValue(key)); // "context 2"
// ctx 未被修改
console.log(ctx.getValue(key)); // undefined
```

## 活跃上下文 {#active-context}

**IMPORTANT**: 此假设你已经配置了上下文管理器。如果没有配置，`api.context.active()` 将**始终**返回 `ROOT_CONTEXT`。

活跃上下文是指由 `api.context.active()` 返回的上下文。
上下文对象包含一些条目，这些条目允许追踪组件在追踪单个执行线程时相互通信，并确保追踪成功创建。
例如，当创建一个 Span 时，它可以添加到上下文中。
之后，当创建另一个 Span 时，它可以使用上下文中的 Span 作为其父 Span。
这一能力，是通过各类机制实现的，Node.js 环境下借助
[async_hooks](https://nodejs.org/api/async_hooks.html) 或
[AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)，浏览器环境下则依托
[zone.js](https://github.com/angular/angular/tree/main/packages/zone.js)，以此确保上下文能在单次执行链路中完成传递。
如果没有上下文处于活跃状态，则返回 `ROOT_CONTEXT`，它只是一个空的上下文对象。

### 获取活跃上下文 {#get-active-context}

活跃上下文，是指由 `api.context.active()` 返回的上下文。

```typescript
import * as api from '@opentelemetry/api';

// 返回当前活跃上下文
// 如果没有活跃上下文，返回 ROOT_CONTEXT
const ctx = api.context.active();
```

### 设置活跃上下文 {#set-active-context}

可以使用 `api.context.with(ctx, callback)` 来激活一个上下文。在执行
`callback` 回调期间，传递给 `with` 的上下文将成为 `context.active` 的返回值。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');
const ctx = api.context.active();

api.context.with(ctx.setValue(key, 'context 2'), async () => {
  // "context 2" 是活跃上下文
  console.log(api.context.active().getValue(key)); // "context 2"
});
```

`api.context.with(context, callback)` 的返回值，是回调的返回值。回调总是同步调用。

```typescript
import * as api from '@opentelemetry/api';

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row['name'];
});

console.log(name); // 数据库返回的 name
```

活跃上下文执行可能是嵌套的。

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');
const ctx = api.context.active();

// 没有活跃上下文
console.log(api.context.active().getValue(key)); // undefined

api.context.with(ctx.setValue(key, 'context 2'), () => {
  // "context 2" 是活跃上下文
  console.log(api.context.active().getValue(key)); // "context 2"
  api.context.with(ctx.setValue(key, 'context 3'), () => {
    // "context 3" 是活跃上下文
    console.log(api.context.active().getValue(key)); // "context 3"
  });
  // "context 2" 是活跃上下文
  console.log(api.context.active().getValue(key)); // "context 2"
});

// 没有活跃上下文
console.log(api.context.active().getValue(key)); // undefined
```

### 示例 {#example}

这个更复杂的示例展示了上下文如何不被修改，而是创建新的上下文对象。

```typescript
import * as api from '@opentelemetry/api';

const ctx = api.context.active(); // 当没有活跃上下文时返回 ROOT_CONTEXT
const ctx2 = ctx.setValue(key, 'context 2'); // 不会修改 ctx

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
// 回调返回的值会返回给调用方
console.log(ret); //? "return value"
```
