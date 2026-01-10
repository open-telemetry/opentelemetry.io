---
title: Contexto
default_lang_commit: 505e2d1d650a80f8a8d72206f2e285430bc6b36a
description: Documentação da API de Contexto do OpenTelemetry JavaScript
aliases: [api/context]
weight: 60
---

Para que o OpenTelemetry funcione, é necessário que dados importantes de
telemetria sejam armazenados e propagados. Por exemplo, quando uma requisição é
recebida e um trecho (_span_) é iniciado, esse trecho deve estar disponível para
um componente que cria seu trecho filho. Para resolver este problema, o
OpenTelemetry armazena o trecho no Contexto. Este documento descreve a API de
contexto do OpenTelemetry para JavaScript e como ela é usada.

Mais informações:

- [Especificação de Contexto](/docs/specs/otel/context/)
- [Referência da API de Contexto](https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.ContextAPI.html)

## Gerenciador de Contexto {#context-manager}

A API de contexto depende de um gerenciador de contexto (_context manager_) para
funcionar. Os exemplos neste documento pressupõem que um gerenciador de contexto
já foi configurado. Geralmente, o gerenciador de contexto é fornecido pelo SDK,
porém também é possível registrar um diretamente da seguinte forma:

```typescript
import * as api from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);
```

## Contexto raiz (_Root Context_) {#root-context}

`ROOT_CONTEXT` é o contexto vazio. Se nenhum contexto estiver ativo, o
`ROOT_CONTEXT` torna-se o contexto ativo. O funcionamento do contexto ativo é
explicado adiante em [Contexto Ativo](#active-context).

## Chaves de Contexto {#context-keys}

Entradas de contexto são pares chave-valor. As chaves podem ser criadas chamando
`api.createContextKey(description)`.

```typescript
import * as api from '@opentelemetry/api';

const key1 = api.createContextKey('Minha primeira chave');
const key2 = api.createContextKey('Minha segunda chave');
```

## Operações básicas {#basic-operations}

### Obter um valor {#get-entry}

Os valores podem ser acessados utilizando o método `context.getValue(key)`.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('alguma chave');
// ROOT_CONTEXT é o contexto vazio
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
```

### Definir um valor {#set-entry}

Entradas são criadas utilizando o método `context.setValue(key, value)`. Definir
uma entrada de contexto cria um novo contexto com todas as entradas do contexto
anterior, mas incluindo a nova entrada. Definir uma entrada de contexto não
modifica o contexto anterior.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('alguma chave');
const ctx = api.ROOT_CONTEXT;

// adiciona uma nova entrada
const ctx2 = ctx.setValue(key, 'contexto 2');

// ctx2 contém a nova entrada
console.log(ctx2.getValue(key)); // "contexto 2"

// ctx não foi modificado
console.log(ctx.getValue(key)); // undefined
```

### Remover um valor {#delete-entry}

Entradas são removidas utilizando o método `context.deleteValue(key)`. Remover
uma entrada de contexto cria um novo contexto com todas as entradas do contexto
anterior, mas sem a entrada identificada pela chave. Remover uma entrada de
contexto não modifica o contexto anterior.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('alguma chave');
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, 'contexto 2');

// remover a entrada
const ctx3 = ctx2.deleteValue(key);

// ctx3 não contém a entrada
console.log(ctx3.getValue(key)); // undefined

// ctx2 não foi modificado
console.log(ctx2.getValue(key)); // "contexto 2"
// ctx não foi modificado
console.log(ctx.getValue(key)); // undefined
```

## Contexto ativo {#active-context}

**IMPORTANTE**: Isso pressupõe que um gerenciador de contexto foi configurado.
Sem um, `api.context.active()` _SEMPRE_ retornará o `ROOT_CONTEXT`.

O contexto ativo é o contexto que é retornado por `api.context.active()`. O
objeto de contexto contém entradas que permitem que os componentes de
rastreamento que acompanham um único fluxo de execução comuniquem-se entre si e
garantam que o rastro seja criado corretamente. Por exemplo, quando um trecho é
criado, ele pode ser adicionado ao contexto. Mais tarde, quando outro trecho for
criado, ele poderá usar o trecho do contexto como seu trecho pai. Isso é
realizado por meio do uso de mecanismos como
[async_hooks](https://nodejs.org/api/async_hooks.html) ou
[AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)
no Node.js, ou
[zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) no
navegador para propagar o contexto através de uma única execução. Se nenhum
contexto estiver ativo, o `ROOT_CONTEXT` é retornado, que é apenas o objeto de
contexto vazio.

### Obter o Contexto ativo {#get-active-context}

O contexto ativo é o contexto que é retornado por `api.context.active()`.

```typescript
import * as api from '@opentelemetry/api';

// Retorna o contexto ativo
// Se nenhum contexto estiver ativo, o ROOT_CONTEXT é retornado
const ctx = api.context.active();
```

### Definir o Contexto ativo {#set-active-context}

Um contexto pode ser tornado ativo usando `api.context.with(ctx, callback)`.
Durante a execução do `callback`, o contexto passado em `with` será retornado
por `context.active`.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Chave para armazenar um valor');
const ctx = api.context.active();

api.context.with(ctx.setValue(key, 'contexto 2'), async () => {
  // "contexto 2" está ativo
  console.log(api.context.active().getValue(key)); // "contexto 2"
});
```

O valor de retorno de `api.context.with(context, callback)` é o valor de retorno
do _callback_. O _callback_ é sempre chamado de forma síncrona.

```typescript
import * as api from '@opentelemetry/api';

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row['name'];
});

console.log(name); // nome retornado pelo banco de dados
```

Execuções de contexto ativo podem ser aninhadas.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Chave para armazenar um valor');
const ctx = api.context.active();

// Nenhum contexto está ativo
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

// Nenhum contexto está ativo
console.log(api.context.active().getValue(key)); // undefined
```

### Exemplo {#example}

Este exemplo mais complexo ilustra como o contexto não é modificado, mas novos
objetos de contexto são criados.

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

  return 'valor de retorno';
});

// O valor retornado pelo callback é retornado ao chamador
console.log(ret); //? "valor de retorno"
```
