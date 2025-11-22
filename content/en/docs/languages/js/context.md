
---
title: Contexto
description: Documentação da API de Contexto do OpenTelemetry para JavaScript
aliases: [api/context]
weight: 60
---

Para que o OpenTelemetry funcione, ele precisa armazenar e propagar dados de telemetria importantes. Por exemplo, quando uma requisição é recebida e um span é iniciado, ele deve estar disponível para um componente que cria seu span filho. Para resolver esse problema, o OpenTelemetry armazena o span no Contexto. Este documento descreve a API de contexto do OpenTelemetry para JavaScript e como ela é usada.

Mais informações:

- [Especificação do Contexto](/docs/specs/otel/context/)
- [Referência da API de Contexto](https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.ContextAPI.html)

## Gerenciador de Contexto

A API de contexto depende de um gerenciador de contexto para funcionar. Os exemplos neste documento assumem que você já configurou um gerenciador de contexto. Normalmente, o gerenciador de contexto é fornecido pelo seu SDK, mas é possível registrar um diretamente assim:

```typescript
import * as api from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);
````

## Contexto Raiz

O `ROOT_CONTEXT` é o contexto vazio. Se nenhum contexto estiver ativo, o `ROOT_CONTEXT` estará ativo. O contexto ativo é explicado abaixo em [Contexto Ativo](#active-context).

## Chaves de Contexto

Entradas de contexto são pares chave-valor. As chaves podem ser criadas chamando `api.createContextKey(description)`.

```typescript
import * as api from '@opentelemetry/api';

const key1 = api.createContextKey('Minha primeira chave');
const key2 = api.createContextKey('Minha segunda chave');
```

## Operações Básicas

### Obter Entrada

As entradas são acessadas usando o método `context.getValue(key)`.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('alguma chave');
// ROOT_CONTEXT é o contexto vazio
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
```

### Definir Entrada

As entradas são criadas usando o método `context.setValue(key, value)`. Definir uma entrada de contexto cria um novo contexto com todas as entradas do contexto anterior, mas com a nova entrada. Definir uma entrada não modifica o contexto anterior.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('alguma chave');
const ctx = api.ROOT_CONTEXT;

// adicionar uma nova entrada
const ctx2 = ctx.setValue(key, 'contexto 2');

// ctx2 contém a nova entrada
console.log(ctx2.getValue(key)); // "contexto 2"

// ctx permanece inalterado
console.log(ctx.getValue(key)); // undefined
```

### Remover Entrada

As entradas são removidas chamando `context.deleteValue(key)`. Remover uma entrada cria um novo contexto com todas as entradas do contexto anterior, mas sem a entrada identificada pela chave. Deletar uma entrada não modifica o contexto anterior.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('alguma chave');
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, 'contexto 2');

// remover a entrada
const ctx3 = ctx.deleteValue(key);

// ctx3 não contém a entrada
console.log(ctx3.getValue(key)); // undefined

// ctx2 permanece inalterado
console.log(ctx2.getValue(key)); // "contexto 2"
// ctx permanece inalterado
console.log(ctx.getValue(key)); // undefined
```

## Contexto Ativo

**IMPORTANTE**: Isso assume que você configurou um Gerenciador de Contexto. Sem ele, `api.context.active()` *SEMPRE* retornará o `ROOT_CONTEXT`.

O contexto ativo é o contexto retornado por `api.context.active()`. O objeto de contexto contém entradas que permitem que componentes de rastreamento que estão monitorando um único fluxo de execução se comuniquem entre si e garantam que o trace seja criado corretamente. Por exemplo, quando um span é criado, ele pode ser adicionado ao contexto. Mais tarde, quando outro span é criado, ele pode usar o span do contexto como seu span pai. Isso é realizado usando mecanismos como [async_hooks](https://nodejs.org/api/async_hooks.html) ou [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context-class_asynclocalstorage) no Node, ou [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) na web, para propagar o contexto durante uma única execução. Se nenhum contexto estiver ativo, `ROOT_CONTEXT` é retornado, que é apenas o objeto de contexto vazio.

### Obter Contexto Ativo

O contexto ativo é retornado por `api.context.active()`.

```typescript
import * as api from '@opentelemetry/api';

// Retorna o contexto ativo
// Se nenhum contexto estiver ativo, retorna ROOT_CONTEXT
const ctx = api.context.active();
```

### Definir Contexto Ativo

Um contexto pode ser definido como ativo usando `api.context.with(ctx, callback)`. Durante a execução do `callback`, o contexto passado será retornado por `context.active`.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Chave para armazenar um valor');
const ctx = api.context.active();

api.context.with(ctx.setValue(key, 'contexto 2'), async () => {
  // "contexto 2" está ativo
  console.log(api.context.active().getValue(key)); // "contexto 2"
});
```

O valor retornado de `api.context.with(context, callback)` é o valor retornado pelo callback. O callback é sempre chamado de forma síncrona.

```typescript
import * as api from '@opentelemetry/api';

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row['name'];
});

console.log(name); // nome retornado pelo db
```

Execuções de contexto ativo podem ser aninhadas.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Chave para armazenar um valor');
const ctx = api.context.active();

// Nenhum contexto ativo
console.log(api.context.active().getValue(key)); // undefined

api.context.with(ctx.setValue(key, 'contexto 2'), () => {
  // "contexto 2" está ativo
  console.log(api.context.active().getValue(key)); // "contexto 2"
  api.context.with(ctx.setValue(key, 'contexto 3'), () => {
    // "contexto 3" está ativo
    console.log(api.context.active().getValue(key)); // "contexto 3"
  });
  // "contexto 2" está ativo
  console.log(api.context.active().getValue(key)); // "contexto 2"
});

// Nenhum contexto ativo
console.log(api.context.active().getValue(key)); // undefined
```

### Exemplo

Este exemplo mais complexo ilustra como o contexto não é modificado, mas novos objetos de contexto são criados.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Chave para armazenar um valor');

const ctx = api.context.active(); // Retorna ROOT_CONTEXT quando nenhum contexto está ativo
const ctx2 = ctx.setValue(key, 'contexto 2'); // não modifica ctx

console.log(ctx.getValue(key)); //? undefined
console.log(ctx2.getValue(key)); //? "contexto 2"

const ret = api.context.with(ctx2, () => {
  const ctx3 = api.context.active().setValue(key, 'contexto 3');

  console.log(api.context.active().getValue(key)); //? "contexto 2"
  console.log(ctx.getValue(key)); //? undefined
  console.log(ctx2.getValue(key)); //? "contexto 2"
  console.log(ctx3.getValue(key)); //? "contexto 3"

  api.context.with(ctx3, () => {
    console.log(api.context.active().getValue(key)); //? "contexto 3"
  });
  console.log(api.context.active().getValue(key)); //? "contexto 2"

  return 'valor retornado';
});

// O valor retornado pelo callback é retornado ao chamador
console.log(ret); //? "valor retornado"
```

