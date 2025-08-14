---
title: Como Nomear Seus Spans
linkTitle: Como Nomear Seus Spans
date: 2025-08-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-spans
cSpell:ignore: aggregability Aggregable jpkrohling OllyGarden SemConv
---

Um dos aspectos mais fundamentais, porém frequentemente negligenciados, de uma
boa instrumentação é a nomenclatura. Esta publicação é a primeira de uma série
dedicada à arte e ciência de nomear elementos no OpenTelemetry. Começaremos
com os trechos _(spans)_, os blocos de construção de um rastro _(trace)_ distribuído, 
e apresentaremos a você o ponto mais importante logo no início: como nomear os trechos que
descrevem sua lógica de negócio única.

## Nomeando seus trechos de negócio {#naming-your-business-spans}

Embora a instrumentação automática do OpenTelemetry seja fantástica para
cobrir operações padrão (como requisições HTTP de entrada ou chamadas de
banco de dados), os _insights_ mais valiosos frequentemente vêm dos trechos
customizados que você adiciona à sua própria lógica de negócio. Estas são
as operações únicas do domínio da sua aplicação.

Para estes spans customizados, recomendamos um padrão que toma emprestado
da gramática básica. Sentenças simples e claras frequentemente seguem uma
estrutura sujeito -> verbo -> objeto direto. O "sujeito" (o serviço que
executa o trabalho) já faz parte do contexto do trace. Podemos usar o
restante dessa estrutura para o nome do nosso span:

## {verbo} {objeto}

Este padrão é descritivo, fácil de entender e ajuda a manter baixa
[cardinalidade](/docs/concepts/glossary/#cardinality)—um conceito crucial
que abordaremos mais adiante.

- **{verbo}**: Um verbo descrevendo o trabalho sendo executado (por exemplo:
  processar, enviar, calcular, renderizar).
- **{objeto}**: Um substantivo descrevendo o que está sendo operado (por
  exemplo: pagamento, fatura, carrinho_compras, anúncio).

Vejamos alguns exemplos:

| Nome Ruim                          | Nome de Span Bom      | Por Que É Melhor                                                                                |
| :--------------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------- |
| process_payment_for_user_jane_doe  | process payment       | O verbo e objeto são claros. O ID do usuário pertence a um atributo.                          |
| send*invoice*#98765                | send invoice          | Agregável. Você pode facilmente encontrar a latência P95 para envio de todas as faturas.     |
| render_ad_for_campaign_summer_sale | render ad             | A campanha específica é um detalhe, não a operação principal. Coloque-a em um atributo.      |
| calculate_shipping_for_zip_90210   | calculate shipping    | A operação é consistente. O CEP é um parâmetro, não parte do nome.                           |
| validation_failed                  | validate user_input   | Foque na operação, não no resultado. O resultado pertence ao status do span.                  |

Aderindo ao formato `{verbo} {objeto}`, você cria um vocabulário claro e
consistente para suas operações de negócio. Isso torna seus traces
incrivelmente poderosos. Um gerente de produto poderia perguntar: "Quanto
tempo leva para processar pagamentos?" e um engenheiro pode imediatamente
filtrar por esses spans e obter uma resposta.

## Por que este padrão funciona

Então, por que `process payment` é bom e `process*invoice*#98765` é ruim?
O motivo é a **cardinalidade**.

Cardinalidade refere-se ao número de valores únicos que uma parte dos dados
pode ter. Um nome de span deve ter **baixa cardinalidade**. Se você incluir
identificadores únicos como um ID de usuário ou número de fatura no nome do
span, criará um nome único para cada operação individual. Isso inunda seu
backend de observabilidade, torna impossível agrupar e analisar operações
similares, e pode aumentar significativamente os custos.

O padrão `{verbo} {objeto}` naturalmente produz nomes de baixa cardinalidade.
Os detalhes únicos e de alta cardinalidade (`invoice\_#98765, user_jane_doe`)
pertencem aos **atributos do span**, que cobriremos em um futuro post do blog.

## Aprendendo com as Convenções Semânticas

Esta abordagem `{verbo} {objeto}` não é arbitrária. É uma melhor prática que
reflete os princípios por trás das **Convenções Semânticas oficiais do
OpenTelemetry (SemConv)**. SemConv fornece um conjunto padronizado de nomes
para operações comuns, garantindo que um span para uma requisição HTTP seja
nomeado consistentemente, independentemente da linguagem ou framework.

Quando você observa atentamente, verá esse mesmo padrão de descrever uma
operação em um recurso ecoado por todas as convenções. Seguindo-o para seus
spans customizados, você está se alinhando com a filosofia estabelecida de
todo o ecossistema OpenTelemetry.

Vejamos alguns exemplos do SemConv.

### Spans HTTP

Para spans HTTP do lado do servidor, a convenção é `{method} {route}`.

- **Exemplo:** `GET /api/users/:ID`
- **Análise:** Este é um verbo (`GET`) agindo sobre um objeto (`/api/users/:id`).
  O uso de um template de rota ao invés do caminho atual (`/api/users/123`) é
  um exemplo perfeito de manter baixa cardinalidade.

### Spans de banco de dados

Spans de banco de dados são frequentemente nomeados `{db.operation} {db.name}.{db.sql.table}`.

- **Exemplo:** `INSERT my_database.users`
- **Análise:** Este é um verbo (`INSERT`) agindo sobre um objeto
  (`my_database.users`). Os valores específicos sendo inseridos são de alta
  cardinalidade e são corretamente excluídos do nome.

### Spans RPC

Para Chamadas de Procedimento Remoto, a convenção é `{rpc.service}/{rpc.method}`.

- **Exemplo:** `com.example.UserService/GetUser`
- **Análise:** Embora o formato seja diferente, o princípio é o mesmo. Descreve
  um método (`GetUser`), que é um verbo, dentro de um serviço
  (`com.example.UserService`), que é o objeto ou recurso.

O ponto principal é que ao usar `{verbo} {objeto}`, você está falando a mesma
linguagem do restante da sua instrumentação.

## Cultivando um sistema saudável

Nomear spans não é uma tarefa trivial. É uma prática fundamental para construir
uma estratégia de observabilidade robusta e eficaz. Adotando um padrão claro e
consistente como `{verbo} {objeto}` para seus spans específicos de negócio,
você pode transformar seus dados de telemetria de uma bagunça emaranhada em
um jardim bem cuidado.

Um span bem nomeado é um presente para seu futuro eu e sua equipe. Proporciona
clareza durante interrupções estressantes, habilita análises poderosas de
performance e, em última instância, ajuda você a construir software melhor
e mais confiável.

Em nosso próximo post desta série, vamos mergulhar na próxima camada de
detalhe: **atributos de span**. Exploraremos como adicionar o contexto rico
e de alta cardinalidade aos seus spans que é necessário para depuração
profunda, sem comprometer a agregabilidade dos nomes dos seus spans.