---
title: Adicionar ao registro
linkTitle: Adicionar
description: Como adicionar entradas ao registro.
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
cSpell:ignore: zpages
---

{{% include freeze-notice.md %}}

<!-- Você mantém ou contribui para uma integração do OpenTelemetry? Adoraríamos
destacar o seu projeto no [registro](../)!

Para adicionar o seu projeto, envie um [pull request][]. Será necessário criar
um arquivo de dados em [data/registry][] para o seu projeto, utilizando o
seguinte modelo: [registry-entry.yml][].

Certifique-se de que os nomes e descrições do seu projeto sigam as nossas
[marketing guidelines][] e estejam alinhados com as diretrizes de marca e
[trademark usage guidelines][] da Linux Foundation. -->

## Tipos de registro {#registry-types}

Ao adicionar seu projeto ao registro, você precisa especificar um `registryType`
(tipo de registro). Este campo categoriza seu projeto com base em sua relação
com o OpenTelemetry. Abaixo estão os possíveis valores e suas definições:

### `application integration`

**Use para**: Aplicações ou serviços que possuem OpenTelemetry integrado
nativamente (suporte embutido) sem necessidade de plugins externos ou
bibliotecas de instrumentação.

**Exemplos**: Veja a lista de integrações nativas de aplicações na página
[Integrações](/ecosystem/integrations/).

> [!NOTE]
>
> Este é o único tipo de registro que permite licenças comerciais/proprietárias.

### `api`

**Use para**: Pacotes que implementam a API do OpenTelemetry para uma linguagem:
as interfaces e implementações _no-op_ das quais o código instrumentado e as
bibliotecas dependem, independentemente de qualquer SDK.

**Exemplos**: As _gems_ Ruby `opentelemetry-api`, `opentelemetry-metrics-api` e
`opentelemetry-logs-api`.

### `connector`

**Use para**: Componentes conectores do OpenTelemetry Collector, que unem dois
_pipelines_ atuando como o exportador de um e o recebedor do outro, podendo
converter entre tipos de sinais.

**Exemplos**: Conectores de contagem, conectores de trechos para métricas ou
conectores de _failover_.

### `core`

**Use para**: Somente componentes principais do projeto OpenTelemetry. Isso
nunca se aplica a componentes de terceiros ou componentes que não fazem parte do
projeto OpenTelemetry.

### `exporter`

**Use para**: Componentes exportadores do OpenTelemetry Collector ou bibliotecas
exportadoras dentro dos SDKs específicos de linguagem.

**Exemplos**: Exportadores OTLP, exportadores Prometheus ou qualquer componente
que envie dados de telemetria para sistemas externos.

**Nota**: Não aplicável para componentes de terceiros que exportam dados de
telemetria.

### `extension`

**Use para**: Extensões do Collector ou SDK que ampliam a funcionalidade do
OpenTelemetry.

**Exemplos**: Autenticadores, fontes/provedores de configuração, descoberta de
serviços, _health checks_/pprof/zpages, ou outros componentes que ampliam o
comportamento do Collector/SDK.

### `id-generator`

**Use para**: Componentes do SDK que personalizam como os IDs de rastros e
trechos são gerados.

**Exemplos**: Geradores de IDs compatíveis com o AWS X-Ray.

### `instrumentation`

**Use para**: Bibliotecas de instrumentação ou instrumentações nativas para
bibliotecas/_frameworks_ específicos.

**Exemplos**: Instrumentação HTTP, instrumentação de banco de dados,
instrumentação específica de _framework_, ou agentes de auto-instrumentação
quando aplicável.

### `log-bridge`

**Use para**: Adaptadores específicos de linguagem que conectam
_frameworks_/APIs de _logging_ existentes ao _logging_ do OpenTelemetry,
permitindo que aplicativos emitam logs OTel por meio de APIs de _logging_
familiares.

**Exemplos**: Bridges/handlers/appenders para _frameworks_ como Java
SLF4J/Log4j/Logback, Python _logging_, JavaScript Winston/Pino, e Go
log/slog/zap.

### `metric-producer`

**Use para**: Componentes do SDK que fazem a ponte entre métricas de fontes de
terceiros e um leitor de métricas do SDK.

### `processor`

**Use para**: Componentes processadores do OpenTelemetry Collector.

**Exemplos**: Processadores em lote, processadores de atributos, processadores
de amostragem, ou qualquer componente que processe dados de telemetria dentro do
_pipeline_ do Collector.

### `propagator`

**Use para**: Propagadores de contexto, que transportam o contexto de rastros e
a bagagem entre limites de processos em um formato de transmissão específico.

**Exemplos**: Propagadores B3, Jaeger ou AWS X-Ray.

### `provider`

**Use para**: Componentes provedores do OpenTelemetry Collector.

**Exemplos**: Provedores de configuração, provedores de credenciais, ou qualquer
componente que forneça recursos ou configuração para o Collector.

### `receiver`

**Use para**: Componentes recebedores do OpenTelemetry Collector.

**Exemplos**: Recebedores OTLP, recebedores Prometheus, ou qualquer componente
que receba dados de telemetria de fontes externas.

> [!NOTE]
>
> Não aplicável para componentes de terceiros que recebem telemetria do
> OpenTelemetry.

### `resource-detector`

**Use para**: Detectores de recursos para SDKs específicos de linguagem.

**Exemplos**: Detectores de recursos AWS, detectores de recursos GCP, ou
qualquer componente que detecte automaticamente e adicione informações de
recursos à telemetria.

### `sampler`

**Use para**: Amostradores do SDK, que decidem quais trechos são registrados e
exportados.

**Exemplos**: Amostradores remotos do AWS X-Ray ou amostradores baseados em
regras.

### `sdk`

**Use para**: Pacotes que implementam o SDK do OpenTelemetry para uma linguagem.

**Exemplos**: As _gems_ Ruby `opentelemetry-sdk`, `opentelemetry-metrics-sdk` e
`opentelemetry-logs-sdk`.

### `semantic-convention`

**Use para**: Pacotes que fornecem constantes de convenções semânticas para uma
linguagem.

**Exemplos**: A _gem_ Ruby `opentelemetry-semantic_conventions`.

### `utilities`

**Use para**: Qualquer outra ferramenta que as pessoas possam utilizar para
trabalhar com OpenTelemetry.

**Exemplos**: Utilitários de teste, ferramentas de depuração (_debugging_),
ferramentas de migração, ou qualquer biblioteca auxiliar que facilite o trabalho
com OpenTelemetry.

<!--
[data/registry]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[pull request]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[marketing guidelines]: /community/marketing-guidelines/
[trademark usage guidelines]:
  https://www.linuxfoundation.org/legal/trademark-usage
  -->
