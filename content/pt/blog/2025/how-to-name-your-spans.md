---
title: Como Nomear Seus Spans
linkTitle: Como Nomear Seus Spans
date: 2025-08-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-spans
default_lang_commit: 79619e1eba717a87f893989b5d016c3ddb4fb4e9
cSpell:ignore: jpkrohling OllyGarden SemConv
---

Um dos aspectos mais fundamentais - e muitas vezes negligenciados - de uma boa
instrumentação é a nomenclatura. Esta publicação é a primeira de uma série
dedicada à arte e ciência de nomear coisas no OpenTelemetry. Vamos começar com
os trechos _(spans)_, os blocos de construção de um rastro _(trace)_
distribuído, e logo no início apresentaremos a você o ponto mais importante:
como nomear os trechos que descrevem sua lógica de negócio exclusiva.

## Nomeando seus trechos de negócio {#naming-your-business-spans}

Embora a instrumentação automática do OpenTelemetry seja fantástica para cobrir
operações padrão (como requisições HTTP de entrada ou chamadas a banco de
dados), os _insights_ mais valiosos geralmente vêm dos trechos personalizados
que você adiciona à sua própria lógica de negócio. Estas são as operações únicas
do domínio da sua aplicação.

Para estes trechos personalizados, recomendamos um padrão inspirado na gramática
básica. Frases simples e claras geralmente seguem uma estrutura sujeito -> verbo
-> objeto direto. O "sujeito" (o serviço que está executando o trabalho) já faz
parte do contexto do rastro. Podemos usar o restante dessa estrutura para nomear
o trecho:

## {verbo} {objeto} {#verb-object}

Este padrão é descritivo, fácil de entender e ajuda a manter baixa
[cardinalidade](/docs/concepts/glossary/#cardinality)—um conceito crucial que
abordaremos mais adiante.

- **{verbo}**: Um verbo descrevendo o que está sendo feito (por exemplo:
  processar, enviar, calcular, renderizar).
- **{objeto}**: Um substantivo descrevendo sobre o que se está atuando (por
  exemplo: pagamento, fatura, carrinho_de_compras, anúncio).

Vejamos alguns exemplos:

| Nome ruim                                 | Bom nome de trecho         | Por que é melhor                                                                        |
| :---------------------------------------- | :------------------------- | :-------------------------------------------------------------------------------------- |
| processar_pagamento_para_usuario_jane_doe | processar pagamento        | O verbo e objeto são claros. O ID do usuário deve estar em um atributo.                 |
| enviar*fatura*#98765                      | enviar fatura              | Agregável. É fácil calcular a latência P95 para o envio de todas as faturas.            |
| renderizar_anuncio_para_campanha_de_verão | renderizar anúncio         | A campanha específica é um detalhe, não a operação principal. Coloque-a em um atributo. |
| calcular_frete_para_cep_90210             | calcular frete             | A operação é consistente. O CEP é um parâmetro, não parte do nome.                      |
| validação_falhou                          | validar entrada do usuário | Foque na operação, não no resultado. O resultado pertence ao estado do trecho.          |

Ao seguir o formato `{verbo} {objeto}`, você cria um vocabulário claro e
consistente para suas operações de negócio. Isso torna seus rastros extremamente
poderosos. Um gerente de produto poderia perguntar: "Quanto tempo leva para
processar pagamentos?" e um engenheiro poderia filtrar estes trechos
imediatamente e obter a resposta.

## Por que este padrão funciona {#why-this-pattern-works}

Então, por que `processar pagamento` é bom e `processar fatura #98765` é ruim? O
motivo é a **cardinalidade**.

Cardinalidade refere-se ao número de valores únicos que um dado pode ter. Um
nome de trecho deve ter **baixa cardinalidade**. Se você incluir identificadores
únicos, como um ID de usuário ou número de fatura, no nome do trecho, criará um
nome único para cada operação. Isso inunda seu _backend_ de observabilidade,
dificulta o agrupamento e análise de operações similares, e pode aumentar
significativamente os custos.

O padrão `{verbo} {objeto}` naturalmente gera nomes de baixa cardinalidade. Os
detalhes únicos e de alta cardinalidade (`fatura\_#98765, usuario_jane_doe`)
pertencem aos **atributos do trecho**, que abordaremos em uma próxima
publicação.

## Aprendendo com as Convenções Semânticas {#learning-from-semantic-conventions}

A abordagem `{verbo} {objeto}` não é arbitrária. É uma prática recomendada que
reflete os princípios por trás das **Convenções Semânticas do OpenTelemetry
(SemConv)**. A SemConv fornece um conjunto padronizado de nomes para operações
comuns, garantindo que um trecho para uma requisição HTTP seja nomeado de forma
consistente, independentemente da linguagem ou _framework_.

Ao analisar de perto, você verá esse mesmo padrão de descrever uma operação em
um recurso refletido em todas as convenções. Ao seguir este padrão para seus
trechos personalizados, você estará alinhado com a filosofia estabelecida de
todo o ecossistema OpenTelemetry.

Vamos ver alguns exemplos da SemConv.

### Trechos HTTP {#http-spans}

Para trechos HTTP no lado do servidor, a convenção é `{method} {route}`.

- **Exemplo:** `GET /api/users/:ID`
- **Análise:** Este é um verbo (`GET`) atuando sobre um objeto
  (`/api/users/:id`). O uso de um _template_ de rota no lugar do caminho real
  (`/api/users/123`) é um exemplo perfeito de manutenção de baixa cardinalidade.

### Trechos de banco de dados {#database-spans}

Trechos de banco de dados geralmente seguem
`{db.operation} {db.name}.{db.sql.table}`.

- **Exemplo:** `INSERT my_database.users`
- **Análise:** Este é um verbo (`INSERT`) atuando sobre um objeto
  (`my_database.users`). Os valores específicos sendo inseridos são de alta
  cardinalidade e, corretamente, não fazem parte do nome.

### Trechos RPC {#rpc-spans}

Para _Remote Procedure Calls (RPC)_, a convenção é `{rpc.service}/{rpc.method}`.

- **Exemplo:** `com.example.UserService/GetUser`
- **Análise:** Embora o formato seja diferente, o princípio é o mesmo. Descreve
  um método (`GetUser`), que é um verbo, dentro de um serviço
  (`com.example.UserService`), que é o objeto ou recurso.

A principal lição é: ao usar `{verbo} {objeto}`, você está falando a mesma
"língua" do restante da sua instrumentação.

## Cultivando um sistema saudável {#cultivating-a-healthy-system}

Nomear trechos não é uma tarefa trivial. É uma prática fundamental para
construir uma estratégia de observabilidade robusta e eficaz. Ao adotar um
padrão claro e consistente como `{verbo} {objeto}` para seus trechos específicos
de negócio, você pode transformar seus dados de telemetria de um emaranhado
confuso em um jardim bem cuidado.

Um trecho bem nomeado é um presente para seu eu do futuro e sua equipe.
Proporciona clareza durante incidentes, possibilita análises poderosas de
desempenho e, no fim, ajuda você a construir _software_ melhor e mais confiável.

Na próxima publicação desta série, exploraremos a próxima camada de detalhes:
**atributos de trecho**. Veremos como adicionar contexto rico e de alta
cardinalidade aos seus trechos, necessário para depuração _(debugging)_
profunda, sem comprometer a capacidade de agregação dos nomes dos trechos.
