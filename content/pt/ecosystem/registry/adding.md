---
title: Adicionar ao registro
linkTitle: Adicionar
description: Como adicionar entradas ao registro.
default_lang_commit: 420ac1ce889c2da720dc8fe273617c5c5441a2b4 # patched
cSpell:ignore: zpages
---

Você mantém ou contribui para uma integração do OpenTelemetry? Adoraríamos
destacar o seu projeto no [registro](../)!

Para adicionar o seu projeto, envie um [pull request][]. Será necessário criar
um arquivo de dados em [data/registry][] para o seu projeto, utilizando o
seguinte modelo: [registry-entry.yml][].

Certifique-se de que os nomes e descrições do seu projeto sigam as nossas
[marketing guidelines][] e estejam alinhados com as diretrizes de marca e
[trademark usage guidelines][] da Linux Foundation.

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

{{% alert title="Nota" %}} Este é o único tipo de registro que permite licenças
comerciais/proprietárias. {{% /alert %}}

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

### `processor`

**Use para**: Componentes processadores do OpenTelemetry Collector.

**Exemplos**: Processadores em lote, processadores de atributos, processadores
de amostragem, ou qualquer componente que processe dados de telemetria dentro do
_pipeline_ do Collector.

### `provider`

**Use para**: Componentes provedores do OpenTelemetry Collector.

**Exemplos**: Provedores de configuração, provedores de credenciais, ou qualquer
componente que forneça recursos ou configuração para o Collector.

### `receiver`

**Use para**: Componentes recebedores do OpenTelemetry Collector.

**Exemplos**: Recebedores OTLP, recebedores Prometheus, ou qualquer componente
que receba dados de telemetria de fontes externas.

{{% alert title="Nota" %}} Não aplicável para componentes de terceiros que
recebem telemetria do OpenTelemetry. {{% /alert %}}

### `resource-detector`

**Use para**: Detectores de recursos para SDKs específicos de linguagem.

**Exemplos**: Detectores de recursos AWS, detectores de recursos GCP, ou
qualquer componente que detecte automaticamente e adicione informações de
recursos à telemetria.

### `utilities`

**Use para**: Qualquer outra ferramenta que as pessoas possam utilizar para
trabalhar com OpenTelemetry.

**Exemplos**: Utilitários de teste, ferramentas de depuração (_debugging_),
ferramentas de migração, ou qualquer biblioteca auxiliar que facilite o trabalho
com OpenTelemetry.

[data/registry]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[pull request]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[marketing guidelines]: /community/marketing-guidelines/
[trademark usage guidelines]:
  https://www.linuxfoundation.org/legal/trademark-usage
