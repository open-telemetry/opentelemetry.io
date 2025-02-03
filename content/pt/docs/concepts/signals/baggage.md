---
title: Bagagem
weight: 4
description: Informações contextuais que são propagadas entre sinais
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
---

No OpenTelemetry, Bagagem é uma informação contextual que acompanha o contexto.
Bagagem é uma estrutura de armazenamento chave-valor, que te permite
[propagar](../../context-propagation/#propagation) quaisquer dados junto com o
[contexto](../../context-propagation/#context).

A Bagagem permite a transferência de dados entre serviços e processos,
tornando-os acessíveis para serem adicionados a [rastros](../traces/),
[métricas](../metrics/) ou [logs](../logs/) ao longo desses serviços.

## Exemplo {#example}

Bagagem é frequentemente usada em rastreamento para propagar dados adicionais
entre serviços.

Por exemplo, imagine que você tem um `clientId` no início de uma requisição, mas
deseja que esse ID esteja disponível em todos os trechos de um rastro, em
algumas métricas de outro serviço, e em alguns logs ao longo do caminho. Como o
rastro pode abranger vários serviços, você precisa de uma maneira de propagar
esses dados sem copiar o `clientId` em diversos pontos do seu código.

Usando a [Propagação de Contexto](../traces/#context-propagation) para passar a
bagagem entre esses serviços, o `clientId` estará disponível para ser adicionado
a quaisquer trechos, métricas ou logs. Além disso, as instrumentações
automaticamente propagam a Bagagem para você.

![OTel Baggage](../otel-baggage.svg)

## Para que a Bagagem do OTel deve ser usada? {#what-should-otel-baggage-be-used-for}

A Bagagem é mais adequada para incluir informações que normalmente estão
disponíveis apenas no início de uma requisição e que precisam ser propagadas
para estágios posteriores. Isso pode incluir, por exemplo, coisas como
identificação de conta, IDs de usuários, IDs de produtos e IPs de origem.

Propagar essas informações usando Bagagem permite uma análise mais profunda da
telemetria em um sistema de backend. Por exemplo, se você incluir uma informação
como o ID do usuário em um trecho que rastreia uma chamada de banco de dados,
fica muito mais fácil responder a perguntas como "quais usuários estão
enfrentando as chamadas de banco de dados mais lentas?". Você também pode
registrar informações sobre uma operação posterior e incluir esse mesmo ID de
usuário nos dados do log.

![OTel Baggage](../otel-baggage-2.svg)

## Considerações de segurança da Bagagem {#baggage-security-considerations}

Itens sensíveis da Bagagem podem ser compartilhados com recursos não
intencionais, como APIs de terceiros. Isso ocorre porque a instrumentação
automática inclui a Bagagem na maioria das requisições de rede do seu serviço.
Especificamente, a Bagagem e outras partes do contexto do rastro são enviadas
nos cabeçalhos HTTP, tornando-os visíveis para qualquer pessoa que esteja
inspecionando o tráfego de rede. Se o tráfego estiver restrito dentro da sua
rede, esse risco pode não se aplicar, mas lembre-se de que serviços _downstream_
podem propagar a Bagagem fora da sua rede.

Além disso, não há verificações de integridade automáticas para garantir que os
itens de Bagagem sejam legítimos, portanto, tenha cautela ao acessá-los.

## Bagagem não é o mesmo que atributos {#baggage-is-not-the-same-as-attributes}

É importante destacar que a Bagagem é um armazenamento de chave-valor separado e
não está ligada aos atributos de trechos, métricas ou logs sem que seja
adicionada de forma explícita.

Para adicionar valores da Bagagem como atributos, é necessário ler
explicitamente os dados da Bagagem e adicioná-los como atributos aos seus
trechos, métricas ou logs.

Como um dos casos de uso comum da Bagagem é adicionar dados aos
[Atributos de Trecho](../traces/#attributes) ao longo de todo um rastro, várias
linguagens possuem Processadores de Trecho de Bagagem que adicionam dados da
Bagagem como atributos na criação de trechos.

Para mais informações, consulte a [especificação da Bagagem].

[especificação da Bagagem]: /docs/specs/otel/overview/#baggage-signal
