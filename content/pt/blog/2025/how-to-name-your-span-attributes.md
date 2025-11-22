---
title: Como Nomear seus Atributos de Span
linkTitle: Como Nomear seus Atributos de Span
date: 2025-08-27
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-span-attributes
default_lang_commit: 421fe301e49dbcec3202d0aaaf939da4a499f020
cSpell:ignore: jpkrohling OllyGarden shopify
---

Sejam bem-vindos à segunda parte da nossa série sobre boas práticas de
nomenclatura no OpenTelemetry. Em nossa
[publicação anterior](/blog/2025/how-to-name-your-spans/), exploramos como
nomear trechos utilizando o padrão `{verbo} {objeto}`. Hoje, vamos mergulhar nos
atributos de trecho _(span)_ — os dados contextuais ricos que transformam seus
rastros _(traces)_ de simples registros de operação em poderosas ferramentas de
depuração _(debugging)_ e análise.

Este guia é direcionado para desenvolvedores que estão:

- **Instrumentando suas próprias aplicações** com trechos e atributos
  personalizados
- **Enriquecendo a telemetria** além do que a auto-instrumentação fornece
- **Criando bibliotecas** que outros irão instrumentar

As decisões de nomenclatura que você tomar para os atributos impactam
diretamente a usabilidade e manutenibilidade dos seus dados de observabilidade.
Vamos acertar isso desde o início.

## Comece com as convenções semânticas {#start-with-semantic-conventions}

Aqui está a regra mais importante, que vai economizar seu tempo e melhorar a
interoperabilidade: **se existir uma
[convenção semântica](/docs/specs/semconv/registry/attributes/) do OpenTelemetry
e a semântica corresponder ao seu caso de uso, use-a**.

Não se trata apenas de conveniência — é sobre construir telemetria que se
integra perfeitamente ao ecossistema mais amplo do OpenTelemetry. Quando você
usa nomes de atributos padronizados, seus dados funcionam automaticamente com
dashboards existentes, regras de alerta e ferramentas de análise.

### Quando a semântica corresponde, use a convenção {#when-semantics-match-use-the-convention}

| Necessidade                       | Convenção semântica    | Por quê                                                     |
| :-------------------------------- | :--------------------- | :---------------------------------------------------------- |
| Método de requisição HTTP         | `http.request.method`  | Padronizado em toda instrumentação HTTP                     |
| Nome da coleção do banco de dados | `db.collection.name`   | Funciona com ferramentas de monitoramento de banco de dados |
| Identificação do serviço          | `service.name`         | Atributo essencial para correlação de serviços              |
| Endereço do par da rede           | `network.peer.address` | Padrão para depuração em nível de rede                      |
| Classificação de erro             | `error.type`           | Permite análise de erros consistente                        |

O princípio fundamental **correspondência semântica em vez de preferência de
nomenclatura**. Mesmo que você prefira `database_table` em vez de
`db.collection.name`, utilize a convenção semântica quando ela descrever seus
dados com precisão.

### Quando a semântica não corresponde, não force {#when-semantics-dont-match-dont-force}

Resista à tentação de usar as convenções semânticas incorretamente:

| Não faça isso                                    | Por que está errado                                            |
| :----------------------------------------------- | :------------------------------------------------------------- |
| Usar `db.collection.name` para nome de arquivo   | Arquivos e coleções de banco de dados são conceitos diferentes |
| Usar `http.request.method` para ações de negócio | "approve_payment" não é um método HTTP                         |
| Usar `user.id` para ID de transação              | Usuários e transações são entidades diferentes                 |

Usar convenções semânticas incorretamente é pior do que criar atributos
personalizados — isso gera confusão e quebra ferramentas que esperam a semântica
padrão.

## A regra de ouro: domínio primeiro, nunca empresa primeiro {#the-golden-rule-domain-first-never-company-first}

Quando precisar de atributos personalizados além das convenções semânticas, o
princípio mais crítico é: **comece com o domínio ou tecnologia, nunca com o nome
da sua empresa ou aplicação**.

Esse princípio parece óbvio, mas é constantemente violado na indústria. Veja por
que ele é importante e como aplicá-lo corretamente.

### Por que nomes baseados em empresa falham {#why-company-first-naming-fails}

| Nome de atributo incorreto  | Problemas                                               |
| :-------------------------- | :------------------------------------------------------ |
| `og.user.id`                | Prefixo da empresa polui o _namespace_ global           |
| `myapp.request.size`        | Específico da aplicação, não reutilizável               |
| `acme.inventory.count`      | Dificulta a correlação com atributos padrão             |
| `shopify_store.product.sku` | Vincula de forma desnecessária o conceito a um vendedor |

Estas abordagens criam atributos que são:

- Difíceis de correlacionar entre equipes e organizações
- Impossível de reutilizar em diferentes contextos
- Vinculados a um vendedor e inflexível
- Inconsistente com os objetivos de interoperabilidade do OpenTelemetry

### Casos de sucesso com domínio primeiro {#domain-first-success-stories}

| Nome de atributo correto | Por que funciona                          |
| :----------------------- | :---------------------------------------- |
| `user.id`                | Conceito universal, neutro a fornecedores |
| `request.size`           | Reutilizável em diferentes aplicações     |
| `inventory.count`        | Conceito claro e específico de domínio    |
| `product.sku`            | Terminologia padrão de e-commerce         |
| `workflow.step.name`     | Conceito genérico de gestão de processos  |

Esta abordagem cria atributos que são universalmente compreensíveis,
reutilizáveis por outros que enfrentam problemas semelhantes e preparados para o
futuro.

## Entendendo a estrutura: pontos e _underscores_ {#understanding-the-structure-dots-and-underscores}

Os nomes de atributos no OpenTelemetry seguem um padrão estrutural específico
que equilibra legibilidade e consistência. Entender esse padrão auxilia na
criação de atributos que pareçam naturais junto às convenções semânticas.

### Use pontos para separação hierárquica {#use-dots-for-hierarchical-separation}

Pontos (`.`) separam componentes hierárquicos, seguindo o padrão:
`{domínio}.{componente}.{propriedade}`

Exemplos de convenções semânticas:

- `http.request.method` - domínio HTTP, componente de requisição, propriedade do
  método
- `db.collection.name` - domínio de banco de dados, componente de coleção,
  propriedade do nome
- `service.instance.id` - domínio de serviço, componente de instância,
  propriedade do ID

### Utilize _underscores_ para componentes com múltiplas palavras {#use-underscores-for-multi-word-components}

Quando um único componente contém múltiplas palavras, utilize _underscores_
(`_`):

- `http.response.status_code` - "status_code" é um componente lógico único
- `system.memory.usage_percent` - "usage_percent" é um conceito de medição

### Crie hierarquias mais profundas quando necessário {#create-deeper-hierarchies-when-needed}

Você pode aninhar ainda mais quando isso acrescenta clareza:

- `http.request.body.size`
- `k8s.pod.label.{key}`
- `messaging.kafka.message.key`

Cada nível deve representar um limite conceitual significativo.

## _Namespaces_ reservados: o que você nunca deve usar {#reserved-namespaces-what-you-must-never-use}

Certos _namespaces_ são estritamente reservados, e violar essas regras pode
comprometer seus dados de telemetria.

### O namespace `otel.*` está fora dos limites {#the-otel-namespace-is-off-limits}

O prefixo `otel.*` é reservado exclusivamente para a especificação do
OpenTelemetry. Este prefixo é utilizado para expressar conceitos do
OpenTelemetry em formatos de telemetria que não os suportam nativamente.

Os atributos reservados `otel.*` incluem:

- `otel.scope.name` - Nome do escopo de instrumentação
- `otel.status_code` - Código de estado do trecho
- `otel.span.sampling_result` - Decisão de amostragem _(sampling)_

**Nunca crie atributos com prefixo `otel.`**. Quaisquer adições a este
_namespace_ devem ser aprovadas como parte da especificação do OpenTelemetry.

### Outros atributos reservados {#other-reserved-attributes}

A especificação também reserva os seguintes nomes de atributos:

- `error.type`
- `exception.message`, `exception.stacktrace`, `exception.type`
- `server.address`, `server.port`
- `service.name`
- `telemetry.sdk.language`, `telemetry.sdk.name`, `telemetry.sdk.version`
- `url.scheme`

## Padrões de convenções semânticas {#semantic-convention-patterns}

A melhor maneira de desenvolver intuição para boas práticas de nomenclatura é
estudando as convenções semânticas do OpenTelemetry. Elas representam milhares
de horas de trabalho de design por especialistas em observabilidade.

### Padrões de organização por domínio {#domain-organization-patterns}

Observe como as convenções semânticas se organizam em torno de domínios claros:

#### Domínios de infraestrutura {#infrastructure-domains}

- `service.*` - Identidade e metadados do serviço
- `host.*` - Informações de _host_/máquina
- `container.*` - Informações de execução do contêiner
- `process.*` - Processos do sistema operacional

#### Domínios de comunicação {#communication-domains}

- `http.*` - Especificidades do protocolo HTTP
- `network.*` - Informações da camada de rede
- `rpc.*` - Atributos de chamadas remotas (RPC)
- `messaging.*` - Sistemas de fila de mensagens

#### Domínios de dados {#data-domains}

- `db.*` - Operações de banco de dados
- `url.*` - Componentes de URL

### Padrões universais de propriedades {#universal-property-patterns}

Em todos os domínios, surgem padrões consistentes para propriedades comuns:

#### Propriedades de identidade {#identity-properties}

- `.name` - Identificadores legíveis para humanos (`service.name`,
  `container.name`)
- `.id` - Identificadores do sistema (`container.id`, `process.pid`)
- `.version` - Informações de versão (`service.version`)
- `.type` - Classificação (`messaging.operation.type`, `error.type`)

#### Propriedades de rede {#network-properties}

- `.address` - Endereços de rede (`server.address`, `client.address`)
- `.port` - Números de porta (`server.port`, `client.port`)

#### Propriedades de medição {#measurement-properties}

- `.size` - Medições em bytes (`http.request.body.size`)
- `.count` - Quantidades (`messaging.batch.message_count`)
- `.duration` - Medições de tempo (`http.server.request.duration`)

Ao criar domínios personalizados, siga estes mesmos padrões. Para gestão de
estoque, considere:

- `inventory.item.name`
- `inventory.item.id`
- `inventory.location.address`
- `inventory.batch.count`

### Criando domínios personalizados com segurança {#creating-custom-domains-safely}

Às vezes, sua lógica de negócio exige atributos fora das convenções semânticas
existentes. Isso é normal — o OpenTelemetry não pode cobrir todos os domínios de
negócios possíveis.

### Diretrizes para domínios personalizados seguros {#guidelines-for-safe-custom-domains}

1. **Escolha nomes descritivos e genéricos** que outros possam reutilizar.
2. **Evite terminologia específica da empresa** no nome do domínio.
3. **Siga os padrões hierárquicos** estabelecidos pelas convenções semânticas.
4. **Considere se seu domínio pode se tornar uma convenção semântica no
   futuro**.

### Exemplos de atributos personalizados bem projetados {#examples-of-well-designed-custom-attributes}

| Domínio   | Atributos bons                           | Por que funcionam                           |
| :-------- | :--------------------------------------- | :------------------------------------------ |
| Negócio   | `payment.method`, `order.status`         | Conceitos de negócio claros e reutilizáveis |
| Logística | `inventory.location`, `shipment.carrier` | Específicos de domínio, mas transferíveis   |
| Processo  | `workflow.step.name`, `approval.status`  | Gestão de processos genérica                |
| Conteúdo  | `document.format`, `media.codec`         | Conceitos de conteúdo universais            |

### A exceção rara: Quando prefixos fazem sentido {#the-rare-exception-when-prefixes-make-sense}

Em casos raros, você pode precisar utilizar prefixos de empresa ou aplicação.
Isso geralmente acontece quando seu atributo personalizado pode conflitar com
atributos de outras fontes em um sistema distribuído.

**Considere prefixos quando:**

- Seu atributo pode conflitar com atributos de fornecedores em um sistema
  distribuído.
- Você está instrumentando tecnologia proprietária, específica da sua empresa.
- Você está capturando detalhes de implementação interna que não devem ser
  generalizados.

Para a maioria dos atributos de lógica de negócio, mantenha o padrão "domínio
primeiro" _(domain-first)_.

## Seu plano de ação {#your-action-plan}

Nomear bem os atributos de trechos cria dados de telemetria que são
manuteníveis, interoperáveis e valiosos em toda a sua organização. Aqui está seu
roteiro:

1. **Sempre verifique as convenções semânticas primeiro** - Use-as quando a
   semântica corresponder.
2. **Comece pelo domínio, nunca pela empresa** - Crie atributos neutros a
   fornecedores.
3. **Respeite os _namespaces_ reservados** - Evite `otel.*`, especialmente.
4. **Siga os padrões hierárquicos** - Utilize pontos e _underscores_ de forma
   consistente.
5. **Construa pensando em reutilização** - Vá além das suas necessidades atuais.

Seguindo estes princípios, você não estará apenas resolvendo os desafios de
instrumentação hoje — estará contribuindo para um ecossistema de observabilidade
mais coerente e interoperável, que beneficia a todos.

Na próxima publicação desta série, mudaremos o foco de trechos para métricas —
explorando como nomear as medições quantitativas que nos dizem como nossos
sistemas estão performando, e por que os mesmos princípios de separação e
"domínio primeiro" se aplicam aos números que mais importam.
