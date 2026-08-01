---
title: Como Nomear Suas Métricas
linkTitle: Como Nomear Suas Métricas
date: 2025-09-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-metrics
default_lang_commit: 710cf5e9afcb8a9bc14366a65d242687f917c893
# prettier-ignore
cSpell:ignore: apiserver ecommerce jpkrohling kubelet mebibytes OllyGarden opentelemetrys postgres scheduler UCUM
---

Métricas são a espinha dorsal quantitativa da observabilidade — os números que
nos dizem como nossos sistemas estão se comportando. Esta é a terceira
publicação em nossa série sobre nomenclatura do OpenTelemetry, onde já
exploramos [como nomear trechos](/blog/2025/how-to-name-your-spans/) e
[como enriquecê-los com atributos significativos](/blog/2025/how-to-name-your-span-attributes/).
Agora, vamos abordar a arte de nomear as medições que realmente importam.

Ao contrário dos trechos _(spans)_ que contam histórias sobre o que aconteceu,
as métricas nos falam sobre quantidades: quais, quantos e quão rápido. Mas aqui
está a questão — nomeá-las bem é tão crucial quanto nomear trechos, e os
princípios que aprendemos também se aplicam aqui. O "quem" ainda pertence aos
atributos, não aos nomes.

## Aprendendo com sistemas tradicionais {#learning-from-traditional-systems}

Antes de mergulhar nas boas práticas do OpenTelemetry, vamos examinar como
sistemas tradicionais de monitoramento lidam com a nomenclatura de métricas.
Veja o Kubernetes, por exemplo. Suas métricas seguem padrões como:

- `apiserver_request_total`
- `scheduler_schedule_attempts_total`
- `container_cpu_usage_seconds_total`
- `kubelet_volume_stats_used_bytes`

Percebeu o padrão? **Nome do componente + recurso + ação + unidade**. O nome do
serviço ou componente está embutido diretamente no nome da métrica. Essa
abordagem fazia sentido em modelos de dados mais simples, onde havia opções
limitadas para armazenar contexto.

Mas isso cria vários problemas:

- **_Backend_ de observabilidade desordenado**: Cada componente recebe seu
  próprio _namespace_ de métricas, dificultando encontrar a métrica certa entre
  dezenas ou centenas de métricas com nomes semelhantes.
- **Agregação inflexível**: Não é fácil somar métricas entre diferentes
  componentes.
- **Dependência de fornecedor**: Os nomes das métricas ficam vinculados a
  implementações específicas.
- **Sobrecarga de manutenção**: Adicionar novos serviços requer novos nomes de
  métricas.

## O anti-padrão principal: Nomes de serviços em nomes de métricas {#the-core-anti-pattern-service-name-in-metric-names}

Aqui está o princípio mais importante para métricas no OpenTelemetry: **Não
inclua o nome do seu serviço no nome da métrica**.

Digamos que você tenha um serviço de pagamentos. Pode ser tentador criar
métricas como:

- `payment.transaction.count`
- `payment.latency.p95`
- `payment.error.rate`

Não faça isso. O nome do serviço já está disponível como contexto através do
atributo de recurso `service.name`. Em vez disso, use:

- `transaction.count` com `service.name=payment`
- `http.server.request.duration` com `service.name=payment`
- `error.rate` com `service.name=payment`

Por que isso é melhor? Porque agora você pode facilmente agregar entre todos os
serviços:

```promql
sum(transaction.count)  // Todas as transações em todos os serviços
sum(transaction.count{service.name="payment"})  // Apenas transações de pagamento
```

Se cada serviço tivesse seu próprio nome de métrica, você precisaria conhecer
todos os nomes de serviços para construir _dashboards_ significativos. Com nomes
limpos, uma única consulta funciona para tudo.

## O modelo de contexto rico do OpenTelemetry {#opentelemetrys-rich-context-model}

As métricas do OpenTelemetry se beneficiam do mesmo
[modelo de contexto rico](/docs/specs/otel/common/#attribute) que discutimos em
nosso artigo sobre atributos de trechos. Em vez de forçar tudo no nome da
métrica, temos múltiplas camadas onde o contexto pode viver:

### Abordagem tradicional (estilo Prometheus): {#traditional-approach-prometheus-style}

```promql
payment_service_transaction_total{method="credit_card",status="success"}
user_service_auth_latency_milliseconds{endpoint="/login",region="us-east"}
inventory_service_db_query_seconds{table="products",operation="select"}
```

### Abordagem OpenTelemetry: {#opentelemetry-approach}

```yaml
transaction.count
- Recurso: service.name=payment, service.version=1.2.3, deployment.environment.name=prod
- Escopo: instrumentation.library.name=com.acme.payment, instrumentation.library.version=2.1.0
- Atributos: method=credit_card, status=success

auth.duration
- Recurso: service.name=user, service.version=2.0.1, deployment.environment.name=prod
- Escopo: instrumentation.library.name=express.middleware
- Atributos: endpoint=/login, region=us-east
- Unidade: ms

db.client.operation.duration
- Recurso: service.name=inventory, service.version=1.5.2
- Escopo: instrumentation.library.name=postgres.client
- Atributos: db.sql.table=products, db.operation=select
- Unidade: s
```

Essa separação em três camadas segue o modelo da especificação do OpenTelemetry
de **Eventos → Fluxos de Métricas → Séries Temporais**, onde o contexto flui
através de múltiplos níveis hierárquicos em vez de ser amontoado nos nomes.

## Unidades: Mantenha-as fora dos nomes também {#units-keep-them-out-of-names-too}

Assim como aprendemos que nomes de serviços não pertencem a nomes de métricas,
**as unidades também não pertencem**.

Sistemas tradicionais frequentemente incluem unidades no nome porque carecem de
metadados de unidade adequados:

- `response_time_milliseconds`
- `memory_usage_bytes`
- `throughput_requests_per_second`

O OpenTelemetry trata unidades como metadados, separados do nome:

- `http.server.request.duration` com unidade `ms`
- `system.memory.usage` com unidade `By`
- `http.server.request.rate` com unidade `{request}/s`

Esta abordagem tem vários benefícios:

1. **Nomes limpos**: Sem sufixos poluindo os nomes das suas métricas.
2. **Unidades padronizadas**: Seguindo o
   [Código Unificado para Unidades de Medida (UCUM)](/docs/specs/semconv/general/metrics/#instrument-units).
3. **Flexibilidade do _backend_**: Os sistemas podem lidar com conversão de
   unidades automaticamente.
4. **Convenções consistentes**: Alinhado às
   [convenções semânticas](/docs/specs/semconv/general/metrics/) do
   OpenTelemetry.

A especificação recomenda usar unidades não prefixadas como `By` (bytes) em vez
de `MiBy` (mebibytes), a menos que haja razões técnicas para fazer o contrário.

## Diretrizes práticas de nomenclatura {#practical-naming-guidelines}

Ao criar nomes de métricas, aplique o mesmo princípio `{verbo} {objeto}` que
aprendemos para trechos, quando fizer sentido:

1. **Foque na operação**: O que está sendo medido?
2. **Não no operador**: Quem está fazendo a medição?
3. **Siga as convenções semânticas**: Utilize
   [padrões estabelecidos](/docs/specs/semconv/general/metrics/) quando
   disponíveis.
4. **Mantenha unidades como metadados**: Não adicione sufixos de unidades aos
   nomes.

Aqui estão exemplos seguindo as
[convenções semânticas](/docs/specs/semconv/general/metrics/) do OpenTelemetry:

- `http.server.request.duration` (não `payment_http_requests_ms`)
- `db.client.operation.duration` (não `user_service_db_queries_seconds`)
- `messaging.client.sent.messages` (não `order_service_messages_sent_total`)
- `transaction.count` (não `payment_transaction_total`)

## Exemplos reais de migração {#real-world-migration-examples}

| Tradicional (Contexto + unidades no nome) | OpenTelemetry (Separação limpa)                                                 | Por que é melhor                                        |
| :---------------------------------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------ |
| `payment_transaction_total`               | `transaction.count` + `service.name=payment` + unidade `1`                      | Agregável entre serviços                                |
| `user_service_auth_latency_ms`            | `auth.duration` + `service.name=user` + unidade `ms`                            | Nome de operação padrão, metadados de unidade adequados |
| `inventory_db_query_seconds`              | `db.client.operation.duration` + `service.name=inventory` + unidade `s`         | Segue convenções semânticas                             |
| `api_gateway_requests_per_second`         | `http.server.request.rate` + `service.name=api-gateway` + unidade `{request}/s` | Nome limpo, unidade de taxa adequada                    |
| `redis_cache_hit_ratio_percent`           | `cache.hit_ratio` + `service.name=redis` + unidade `1`                          | Proporções são adimensionais                            |

## Benefícios da nomenclatura limpa {#benefits-of-clean-naming}

Separar contexto dos nomes de métricas fornece vantagens técnicas específicas
que melhoram tanto o desempenho de consultas quanto os fluxos de trabalho
operacionais. O primeiro benefício é a agregação entre serviços. Uma consulta
como `sum(transaction.count)` retorna dados de todos os serviços sem exigir que
você conheça ou mantenha uma lista de nomes de serviços. Em um sistema com 50
microsserviços, isso significa uma consulta em vez de 50 — e essa consulta não
quebra quando você adiciona o 51º serviço.

Essa consistência torna os _dashboards_ reutilizáveis entre serviços. Um
_dashboard_ para monitorar requisições HTTP no seu serviço de autenticação
funciona sem modificação para o serviço de pagamentos, serviço de inventário, ou
qualquer outro componente que serve HTTP. Você escreve a consulta uma vez —
`http.server.request.duration` filtrada por `service.name` — e aplica em todos
os lugares. Não há mais manutenção de dezenas de _dashboards_ quase idênticos.
Alguns fornecedores de observabilidade levam isso além, gerando automaticamente
_dashboards_ baseados em nomes de métricas de convenções semânticas — quando
seus serviços emitem `http.server.request.duration`, a plataforma já sabe
exatamente quais visualizações e agregações fazem sentido para essa métrica.

A nomenclatura limpa também reduz a desordem do _namespace_ de métricas.
Considere uma plataforma com dezenas de serviços, cada um definindo suas
próprias métricas. Com nomenclatura tradicional, seu navegador de métricas
mostra centenas de variações específicas de serviços: `apiserver_request_total`,
`payment_service_request_total`, `user_service_request_total`,
`inventory_service_request_total`, e assim por diante. Encontrar a métrica certa
se torna um exercício de rolagem e busca entre variações redundantes. Com
nomenclatura limpa, você tem um nome de métrica (`request.count`) com atributos
capturando o contexto. Isso torna a descoberta de métricas direta — você
encontra a medição que precisa, então filtra pelo serviço que lhe interessa.

O tratamento de unidades torna-se sistemático quando as unidades são metadados
em vez de sufixos. Plataformas de observabilidade podem converter unidades
automaticamente — exibindo a mesma métrica de duração como milissegundos em um
gráfico e segundos em outro, baseado no que faz sentido para a visualização. A
métrica permanece `request.duration` com metadados de unidade `ms`, não duas
métricas separadas `request_duration_ms` e `request_duration_seconds`.

A abordagem também garante compatibilidade entre instrumentação manual e
automática. Quando você segue convenções semânticas como
`http.server.request.duration`, suas métricas customizadas se alinham com
aquelas geradas por bibliotecas de auto-instrumentação. Isso cria um modelo de
dados consistente onde consultas funcionam tanto para serviços instrumentados
manualmente quanto automaticamente, e engenheiros não precisam lembrar quais
métricas vêm de qual fonte.

## Armadilhas comuns a evitar {#common-pitfalls-to-avoid}

Engenheiros frequentemente incorporam informações específicas de _deploy_
diretamente nos nomes de métricas, criando padrões como
`user_service_v2_latency`. Isso quebra quando a versão 3 é implantada — todos os
_dashboards_, alertas e consultas que referenciam esse nome de métrica devem ser
atualizados. O mesmo problema ocorre com nomes específicos de instância, como
`node_42_memory_usage`. Em um _cluster_ com escalonamento dinâmico, você acaba
com centenas de nomes distintos de métricas que representam a mesma medição,
tornando impossível escrever consultas de agregação simples.

Prefixos específicos de ambiente causam problemas de manutenção similares. Com
métricas nomeadas `prod_payment_errors` e `staging_auth_count`, você não pode
escrever uma única consulta que funcione em todos os ambientes. Um _dashboard_
que monitora produção não pode ser utilizado para _staging_ sem modificação.
Quando você precisa comparar métricas entre ambientes — uma tarefa comum de
depuração _(debugging)_ — é necessário escrever consultas complexas que
referenciam explicitamente os nomes de métricas para cada ambiente.

Detalhes de _stack_ tecnológica nos nomes de métricas criam dores de cabeça para
migrações futuras. Uma métrica nomeada `nodejs_payment_memory` torna-se enganosa
quando você reescreve o serviço em Go. Da mesma forma, `postgres_user_queries`
precisa ser renomeada se você migrar para outro banco de dados. Esses nomes
específicos de tecnologia também impedem consultas que funcionem em serviços
usando diferentes _stacks_, mesmo quando eles executam a mesma função de
negócio.

Misturar domínios de negócio com métricas de infraestrutura viola a separação
entre o que um sistema faz e como ele faz. Uma métrica como
`ecommerce_cpu_usage` confunde o propósito de negócio (e-commerce) com a medição
técnica (uso de CPU). Isso torna mais difícil reutilizar monitoramento de
infraestrutura através de diferentes domínios de negócio e complica _deployments
multi-tenant_ onde a mesma infraestrutura serve múltiplas funções.

A prática de incluir unidades nos nomes — `latency_ms`, `memory_bytes`,
`count_total` — cria redundância agora que o OpenTelemetry fornece metadados de
unidade adequados. Também impede conversão automática de unidades. Com
`request_duration_ms` e `request_duration_seconds` como métricas separadas, você
precisa de consultas diferentes para diferentes escalas de tempo. Com uma única
métrica `request.duration` que inclui metadados de unidade, a plataforma de
observabilidade lida com conversão automaticamente.

O padrão é claro: contexto que varia por _deployment_, instância, ambiente ou
versão pertence aos atributos, não ao nome da métrica. O nome da métrica deve
identificar o que você está medindo. Todo o resto — quem está medindo, onde está
executando, qual versão — vai para a camada de atributos, onde pode ser
filtrado, agrupado e agregado conforme necessário.

## Cultivando melhores métricas {#cultivating-better-metrics}

Assim como os trechos que abordamos anteriormente nesta série, métricas bem
nomeadas são um presente para seu eu do futuro e sua equipe. Elas trazem clareza
durante incidentes, permitem análises poderosas entre serviços e tornam seus
dados de observabilidade realmente úteis - e não apenas volumosos.

O _insight_-chave é o mesmo que aprendemos com trechos: **separação de
responsabilidades**. O nome da métrica descreve o que você está medindo. O
contexto — quem está medindo, onde, quando e como — vive na rica hierarquia de
atributos que o OpenTelemetry fornece.

Na próxima publicação, mergulharemos profundamente nos **atributos de métricas**
— a camada de contexto que torna as métricas verdadeiramente poderosas. Vamos
explorar como estruturar a informação contextual rica que não pertence aos
nomes, e como equilibrar informatividade com preocupações de cardinalidade.

Até lá, lembre-se: um nome de métrica limpo é como um caminho de jardim bem
cuidado — ele te leva exatamente onde você precisa ir.
