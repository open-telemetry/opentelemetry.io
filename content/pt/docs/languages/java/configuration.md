---
title: Configure o SDK
linkTitle: Configure o SDK
weight: 13
aliases: [config]
default_lang_commit: 39ecdf683ae1acb8b51388806eedcedc49355bff
# prettier-ignore
cSpell:ignore: autoconfigured blrp Customizer Dotel ignore LOWMEMORY ottrace PKCS retryable
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

O [SDK](../sdk/) é a implementação de referência integrada da [API](../api/),
processando e exportando a telemetria produzida por chamadas da API de
instrumentação. Configurar o SDK para processar e exportar corretamente é um
passo essencial para integrar o OpenTelemetry a uma aplicação.

Todos os componentes do SDK possuem
[APIs de configuração programática](#programmatic-configuration). Essa é a forma
mais flexível e expressiva de configurar o SDK. Contudo, alterar configurações
exige ajustes no código e recompilar a aplicação, e não há interoperabilidade
entre linguagens, já que a API é escrita em java.

O [SDK de autoconfiguração sem código](#zero-code-sdk-autoconfigure) configura
os componentes do SDK através de propriedades do sistema ou variáveis de
ambiente, com diversos pontos de extensão para casos em que as propriedades não
são suficientes.

{{% alert %}} Recomendamos utilizar o módulo do
[SDK de autoconfiguração sem código](#zero-code-sdk-autoconfigure) pois ele
reduz códigos repetitivos, permite reconfiguração sem reescrever código ou
recompilar a aplicação e oferece interoperabilidade entre linguagens.
{{% /alert %}}

{{% alert %}} O [agente Java](/docs/zero-code/java/agent/) e o
[inicializador _Spring_](/docs/zero-code/java/spring-boot-starter/) configuram
automaticamente o SDK utilizando o módulo de
[autoconfiguração sem código](#zero-code-sdk-autoconfigure), e instalam
instrumentação com esse módulo. Todo o conteúdo de autoconfiguração se aplica
aos. usuários do agente Java e do inicializador do Spring. {{% /alert %}}

## Configuração programática {#programmatic-configuration}

A interface de configuração programática é o conjunto de APIs para construir
componentes do [SDK](../sdk/). Todos os componentes do SDK possuem uma API de
configuração programática, e todos os demais mecanismos de configuração são
construídos sobre essa API. Por exemplo, a interface de configuração por
[variáveis de ambiente e propriedades do sistema](#environment-variables-and-system-properties)
interpreta variáveis e propriedades conhecidas e as traduz em chamadas à API de
configuração programática.

Embora outros mecanismos de configuração sejam mais convenientes, nenhum oferece
a mesma flexibilidade de escrever código que expressa exatamente a configuração
necessária. Quando um determinado recurso não é suportado por um mecanismo de
configuração de nível mais alto, talvez não haja outra opção além de usar
configuração programática.

As seções de [componentes do SDK](../sdk/#sdk-components) demonstram uma API de
configuração programática simples para as principais áreas voltadas ao usuário
do SDK. Consulte o código para obter a referência completa da API.

## Autoconfiguração sem código do SDK {#zero-code-sdk-autoconfigure}

O módulo de autoconfiguração (artefato
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`)
é uma interface de configuração construída sobre a
[interface de configuração programática](#programmatic-configuration), que
configura [componentes do SDK](../sdk/#sdk-components) sem escrever código.
Existem dois fluxos distintos de autoconfiguração:

- [Variáveis de ambiente e propriedades do sistema](#environment-variables-and-system-properties)
  interpretam variáveis de ambiente e propriedades do sistema para criar
  componentes do SDK, incluindo pontos de personalização para sobrepor a
  configuração programática.
- [Configuração declarativa](#declarative-configuration) (**em
  desenvolvimento**) interpreta um modelo de configuração para criar componentes
  do SDK, que é tipicamente codificado em um arquivo YAML.

Configure automaticamente componentes do SDK com autoconfiguração da seguinte
maneira:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class AutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

{{% alert %}} O [agente Java](/docs/zero-code/java/agent/) e o
[inicializador _Spring_](/docs/zero-code/java/spring-boot-starter/) configuram
automaticamente o SDK utilizando o módulo de autoconfiguração sem código e
instalam as instrumentações correspondentes. Todo o conteúdo relacionado à
autoconfiguração se aplica a usuários do agente Java e do inicializador do
_Spring_. {{% /alert %}}

{{% alert %}} O módulo de autoconfiguração registra _shutdown hooks_ do Java
para encerrar o SDK quando apropriado. Como o OpenTelemetry Java
[utiliza `java.util.logging` para logs internos](../sdk/#internal-logging),
alguns logs podem ser suprimidos durante a execução dos _shutdown hooks_. Isso é
um _bug_ do próprio JDK, e não algo sob controle do OpenTelemetry Java. Caso
você precise de logs durante a execução dos _shutdown hooks_, considere utilizar
`System.out` ao invés de um _framework_ de _logging_ que pode se encerrar antes
e, assim, suprimir suas mensagens de log. Para mais detalhes, consulte este
[bug do JDK](https://bugs.openjdk.java.net/browse/JDK-8161253). {{% /alert %}}

### Variáveis de ambiente e propriedades do sistema {#environment-variables-and-system-properties}

O módulo de autoconfiguração oferece suporte às propriedades listadas na
[especificação de configuração por variáveis de ambiente](/docs/specs/otel/configuration/sdk-environment-variables/),
com algumas adições experimentais e específicas do Java.

As propriedades a seguir são apresentadas como propriedades do sistema, mas
também podem ser definidas por meio de variáveis de ambiente. Siga os passos
abaixo para converter uma propriedade de sistema em uma variável de ambiente:

- Converta o nome para letras maiúsculas.
- Substitua todos os caracteres `.` e `-` por `_`.

Por exemplo, a propriedade de sistema `otel.sdk.disabled` é equivalente à
variável de ambiente `OTEL_SDK_DISABLED`.

Se uma propriedade for definida tanto como propriedade de sistema quanto como
variável de ambiente, a propriedade de sistema terá prioridade.

#### Propriedades: gerais {#properties-general}

Propriedades para desabilitar o [SDK](../sdk/#opentelemetrysdk):

| Propriedade do sistema | Descrição                                          | Padrão  |
| ---------------------- | -------------------------------------------------- | ------- |
| `otel.sdk.disabled`    | Se `true`, desabilita o OpenTelemetry SDK. **[1]** | `false` |

**[1]**: Se desabilitado, `AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()`
retorna uma instância minimamente configurada (por exemplo,
`OpenTelemetrySdk.builder().build()`).

Propriedades para limites de atributos (veja
[limites de trecho](../sdk/#spanlimits), [limites de log](../sdk/#loglimits)):

| Propriedade do sistema              | Descrição                                                                                                                                                                  | Padrão     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `otel.attribute.value.length.limit` | Tamanho máximo dos valores de atributos. Aplica-se a trechos e logs. Pode ser sobrescrito por `otel.span.attribute.value.length.limit`, `otel.span.attribute.count.limit`. | Sem limite |
| `otel.attribute.count.limit`        | Número máximo de atributos. Aplica-se a trechos, eventos de trecho, links de trecho e logs.                                                                                | `128`      |

Propriedades para [propagação de contexto](../sdk/#textmappropagator):

| Propriedade do sistema | Descrição                                                                                                                                                               | Padrão                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `otel.propagators`     | Lista de propagadores separados por vírgula. Valores conhecidos incluem `tracecontext`, `baggage`, `b3`, `b3multi`, `jaeger`, `ottrace`, `xray`, `xray-lambda`. **[1]** | `tracecontext,baggage` (W3C) |

**[1]**: Propagadores e artefatos conhecidos (veja
[propagador de mapa de texto](../sdk/#textmappropagator) para coordenadas de
artefatos):

- `tracecontext` configura `W3CTraceContextPropagator`.
- `baggage` configura `W3CBaggagePropagator`.
- `b3`, `b3multi` configura `B3Propagator`.
- `jaeger` configura `JaegerPropagator`.
- `ottrace` configura `OtTracePropagator`.
- `xray` configura `AwsXrayPropagator`.
- `xray-lambda` configura `AwsXrayLambdaPropagator`.

#### Propriedades: recurso {#properties-resource}

Propriedades para configurar [recurso](../sdk/#resource):

| Propriedade do sistema                  | Descrição                                                                                                                                                                              | Padrão                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `otel.service.name`                     | Define o nome lógico do serviço. Tem precedência sobre `service.name` definido em `otel.resource.attributes`.                                                                          | `unknown_service:java` |
| `otel.resource.attributes`              | Define atributos de recurso no formato: `key1=val1,key2=val2,key3=val3`.                                                                                                               |                        |
| `otel.resource.disabled.keys`           | Define chaves de atributos de recurso a serem filtradas.                                                                                                                               |                        |
| `otel.java.enabled.resource.providers`  | Lista, separada por vírgulas, dos nomes de classe totalmente qualificados de `ResourceProvider` a habilitar. **[1]** Se não for definida, todos os `ResourceProvider` são habilitados. |                        |
| `otel.java.disabled.resource.providers` | Lista, separada por vírgulas, dos nomes de classe totalmente qualificados de `ResourceProvider` a desabilitar. **[1]**                                                                 |                        |

**[1]**: Por exemplo, para desabilitar o
[provedor de recursos do sistema operacional](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java),
defina
`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`.

**NOTA**: As propriedades de sistema / variáveis de ambiente `otel.service.name`
e `otel.resource.attributes` são interpretadas pelo provedor de recurso
`io.opentelemetry.sdk.autoconfigure.EnvironmentResourceProvider`. Se você optar
por definir provedores de recurso via `otel.java.enabled.resource-providers`, é
recomendável incluir este provedor para evitar comportamentos inesperados.
Consulte [ResourceProvider](#resourceprovider) para as coordenadas dos artefatos
de provedores de recurso.

#### Propriedades: rastros {#properties-traces}

Propriedades para [processadores de rastros em lote](../sdk/#spanprocessor)
usado em conjunto com os exportadores definidos por meio de
`otel.traces.exporter`:

| Propriedade do sistema           | Descrição                                                                           | Padrão  |
| -------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| `otel.bsp.schedule.delay`        | Intervalo, em milissegundos, entre duas exportações consecutivas.                   | `5000`  |
| `otel.bsp.max.queue.size`        | Número máximo de rastros que podem ser enfileirados antes do processamento em lote. | `2048`  |
| `otel.bsp.max.export.batch.size` | Número máximo de trechos exportados em um único lote.                               | `512`   |
| `otel.bsp.export.timeout`        | Tempo máximo permitido, em milissegundos, para exportar os dados.                   | `30000` |

Propriedades para o [amostrador _(sampler)_](../sdk/#sampler):

| Propriedade do sistema    | Descrição                                                                                                                                                                                                      | Padrão                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `otel.traces.sampler`     | Define o amostrador a ser usado. Valores conhecidos incluem `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio`, `jaeger_remote`. **[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | Argumento passado ao amostrador configurado, se suportado (por exemplo, uma taxa de amostragem).                                                                                                               |                         |

**[1]**: Amostradores e artefatos conhecidos (consulte
[amostrador](../sdk/#sampler) para coordenadas de artefatos):

- `always_on` configura `AlwaysOnSampler`.
- `always_off` configura `AlwaysOffSampler`.
- `traceidratio` configura `TraceIdRatioBased`; `otel.traces.sampler.arg` define
  a taxa de amostragem.
- `parentbased_always_on` configura `ParentBased(root=AlwaysOnSampler)`.
- `parentbased_always_off` configura `ParentBased(root=AlwaysOffSampler)`.
- `parentbased_traceidratio` configura `ParentBased(root=TraceIdRatioBased)`;
  `otel.traces.sampler.arg` define a taxa de amostragem.
- `jaeger_remote` configura `JaegerRemoteSampler`; `otel.traces.sampler.arg` é
  uma lista separada por vírgulas, conforme descrito na
  [especificação](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration).

Propriedades para [limites de trechos](../sdk/#spanlimits):

| Propriedade do sistema                   | Descrição                                                                                                     | Padrão     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| `otel.span.attribute.value.length.limit` | Tamanho máximo de valores de atributos de trechos. Tem precedência sobre `otel.attribute.value.length.limit`. | Sem limite |
| `otel.span.attribute.count.limit`        | Número máximo de atributos por trecho. Tem precedência sobre `otel.attribute.count.limit`.                    | `128`      |
| `otel.span.event.count.limit`            | Número máximo de eventos por trecho.                                                                          | `128`      |
| `otel.span.link.count.limit`             | Número máximo de links por trecho.                                                                            | `128`      |

#### Propriedades: métricas {#properties-metrics}

Propriedades para [leitor de métricas periódico](../sdk/#metricreader):

| Propriedade do sistema        | Descrição                                                                     | Padrão  |
| ----------------------------- | ----------------------------------------------------------------------------- | ------- |
| `otel.metric.export.interval` | Intervalo, em milissegundos, entre o início de duas tentativas de exportação. | `60000` |

Propriedades para exemplares:

| Propriedade do sistema         | Descrição                                                                                  | Padrão        |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ------------- |
| `otel.metrics.exemplar.filter` | Filtro para amostragem de exemplares. Pode ser `ALWAYS_OFF`, `ALWAYS_ON` ou `TRACE_BASED`. | `TRACE_BASED` |

Propriedades para limites de cardinalidade:

| Propriedade do sistema                | Descrição                                                                                                            | Padrão |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------ |
| `otel.java.metrics.cardinality.limit` | Se definido, configura o limite de cardinalidade. O valor determina o número máximo de pontos distintos por métrica. | `2000` |

#### Propriedades: logs {#properties-logs}

Propriedades para o
[processador de registros de log](../sdk/#logrecordprocessor) usado junto com os
exportadores definidos via `otel.logs.exporter`:

| Propriedade do sistema            | Descrição                                                                                    | Padrão  |
| --------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| `otel.blrp.schedule.delay`        | Intervalo, em milissegundos, entre duas exportações consecutivas.                            | `1000`  |
| `otel.blrp.max.queue.size`        | Número máximo de registros de log que podem ser enfileirados antes do processamento em lote. | `2048`  |
| `otel.blrp.max.export.batch.size` | Número máximo de registros de log exportados em um único lote.                               | `512`   |
| `otel.blrp.export.timeout`        | Tempo máximo permitido, em milissegundos, para exportar os dados.                            | `30000` |

#### Propriedades: exportadores {#properties-exporters}

Propriedades para configurar exportadores _(exporters)_:

| Propriedade do sistema           | Descrição                                                                                                                                                                                         | Padrão          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `otel.traces.exporter`           | Lista de exportadores de trechos, separados por vírgula. Valores conhecidos: `otlp`, `zipkin`, `console`, `logging-otlp`, `none`. **[1]**                                                         | `otlp`          |
| `otel.metrics.exporter`          | Lista de exportadores de métricas, separados por vírgula. Valores conhecidos: `otlp`, `prometheus`, `none`. **[1]**                                                                               | `otlp`          |
| `otel.logs.exporter`             | Lista de exportadores de registros de log, separados por vírgula. Valores conhecidos: `otlp`, `console`, `logging-otlp`, `none`. **[1]**                                                          | `otlp`          |
| `otel.java.exporter.memory_mode` | Se definido como `reusable_data`, habilita o modo de memória reutilizável (para exportadores que o suportam), reduzindo alocações. Valores conhecidos: `reusable_data`, `immutable_data`. **[2]** | `reusable_data` |

**[1]**: Exportadores e artefatos conhecidos (consulte
[SpanExporter](../sdk/#spanexporter), [MetricExporter](../sdk/#metricexporter),
[LogExporter](../sdk/#logrecordexporter) para coordenadas dos artefatos):

- `otlp` configura `OtlpHttp{Signal}Exporter` / `OtlpGrpc{Signal}Exporter`.
- `zipkin` configura `ZipkinSpanExporter`.
- `console` configura `LoggingSpanExporter`, `LoggingMetricExporter`,
  `SystemOutLogRecordExporter`.
- `logging-otlp` configura `OtlpJsonLogging{Signal}Exporter`.
- `experimental-otlp/stdout` configura `OtlpStdout{Signal}Exporter` ( esta opção
  é experimental e pode mudar ou ser removida).

**[2]**: Os exportadores que suportam
`otel.java.exporter.memory_mode=reusable_data` são `OtlpGrpc{Signal}Exporter`,
`OtlpHttp{Signal}Exporter`, `OtlpStdout{Signal}Exporter`, e
`PrometheusHttpServer`.

Propriedades para exportadores `otlp` de rastros, métricas e logs:

| Propriedade do sistema | Descrição | Padrão | | Propriedade do sistema |
Descrição | Padrão | | -------------------------------- |

---

| --------------- | | `otel.{sinal}.exporter=otlp` | Seleciona o exportador
OpenTelemetry para {sinal}. | | | `otel.exporter.otlp.protocol` | Protocolo de
transporte usado nas requisições OTLP de rastros, métricas e logs. Opções:
`grpc` e `http/protobuf`. | `grpc` **[1]** | |
`otel.exporter.otlp.{sinal}.protocol` | Protocolo de transporte usado nas
requisições OTLP de {sinal}. Opções: `grpc` e `http/protobuf`. | `grpc` **[1]**
| | `otel.exporter.otlp.endpoint` | Rota para envio de rastros, métricas e logs
OTLP. Normalmente o endereço de um Collector OpenTelemetry. Deve ser uma URL com
esquema `http` ou `https`, conforme o uso de TLS. | `http://localhost:4317` para
o protocolo `grpc` ou `http://localhost:4318` para o protocolo `http/protobuf`.
| | `otel.exporter.otlp.{sinal}.endpoint` | Rota para envio de {sinal} via OTLP.
Normalmente o endereço de um Collector OpenTelemetry. Se o protocolo for
`http/protobuf`, o caminho deve incluir a versão e o tipo de sinal (por exemplo,
`v1/traces`, `v1/metrics`, ou `v1/logs`). | `http://localhost:4317` quando o
protocolo for `grpc`, e `http://localhost:4318/v1/{signal}` quando o protocolo
for `http/protobuf`. | | `otel.exporter.otlp.certificate` | O caminho para o
arquivo contendo certificados confiáveis para usar ao verificar as credenciais
TLS do servidor do OTLP de rastros, métricas ou logs. O arquivo deve conter um
ou mais certificados X.509 no formato PEM. | Os certificados raiz confiáveis do
host são usados. | | `otel.exporter.otlp.{signal}.certificate` | O caminho para
o arquivo contendo certificados confiáveis para usar ao verificar as credenciais
TLS do servidor do OTLP de {signal}. O arquivo deve conter um ou mais
certificados X.509 no formato PEM. | Os certificados raiz confiáveis do host são
usados | | `otel.exporter.otlp.client.key` | O caminho para o arquivo contendo a
chave privada do cliente para usar ao verificar as credenciais TLS do cliente do
OTLP de rastros, métricas ou logs. O arquivo deve conter uma chave privada PKCS8
no formato PEM. | Nenhum arquivo de chave privada do cliente é usado. | |
`otel.exporter.otlp.{signal}.client.key` | O caminho para o arquivo contendo a
chave privada do cliente para usar ao verificar as credenciais TLS do cliente do
OTLP de {signal}. O arquivo deve conter uma chave privada PKCS8 no formato PEM.
| Nenhum arquivo de chave privada do cliente é usado. | |
`otel.exporter.otlp.client.certificate` | O caminho para o arquivo contendo
certificados confiáveis para usar ao verificar as credenciais TLS do cliente do
OTLP de rastros, métricas ou logs. O arquivo deve conter um ou mais certificados
X.509 no formato PEM. | Nenhum arquivo de cadeia é usado. | |
`otel.exporter.otlp.{signal}.client.certificate` | O caminho para o arquivo
contendo certificados confiáveis para usar ao verificar as credenciais TLS do
cliente do OTLP de {signal}. O arquivo deve conter um ou mais certificados X.509
no formato PEM. | Nenhum arquivo de cadeia é usado. | |
`otel.exporter.otlp.headers` | Pares de chave-valor separados por vírgula para
passar como cabeçalhos de requisição no envio de rastros, métricas e logs OTLP.
| | | `otel.exporter.otlp.{signal}.headers` | Pares de chave-valor separados por
vírgula para passar como cabeçalhos de requisição no envio de {signal} OTLP. | |
| `otel.exporter.otlp.compression` | O tipo de compressão a ser usado no envio
de rastros, métricas e logs OTLP. Opções incluem `gzip`. | Nenhuma compressão
será usada. | | `otel.exporter.otlp.{signal}.compression` | O tipo de compressão
a ser usado no envio de {signal} OTLP. Opções incluem `gzip`. | Nenhuma
compressão será usada. | | `otel.exporter.otlp.timeout` | O tempo máximo de
espera, em milissegundos, permitido para enviar cada lote de rastros, métricas e
logs OTLP. | `10000` | | `otel.exporter.otlp.{signal}.timeout` | O tempo máximo
de espera, em milissegundos, permitido para enviar cada lote de {signal} OTLP. |
`10000` | | `otel.exporter.otlp.metrics.temporality.preference` | Temporalidade
de agregação preferida na saída. Opções incluem `DELTA`, `LOWMEMORY`, e
`CUMULATIVE`. Quando definido `CUMULATIVE`, todos os instrumentos terão
temporalidade cumulativa. Quando definido `DELTA`, contadores (síncronos e
assíncronos) e histogramas serão delta, contadores _up down_ (síncronos e
assíncronos) serão cumulativos. Quando definido `LOWMEMORY`, contadores
síncronos e histogramas serão delta, contadores assíncronos e contadores _up
down_ (síncronos e assíncronos) serão cumulativos. | `CUMULATIVE` | |
`otel.exporter.otlp.metrics.default.histogram.aggregation` | Agregação padrão
preferida para histogramas. Opções incluem `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM`
e `EXPLICIT_BUCKET_HISTOGRAM`. | `EXPLICIT_BUCKET_HISTOGRAM` | |
`otel.java.exporter.otlp.retry.disabled` | Quando `false`, faz _retry_ quando
ocorrem erros transitórios. **[2]** | `false` |

**NOTA:** O marcador `{sinal}` refere-se aos
[Sinais do OpenTelemetry](/docs/concepts/signals/). Valores válidos incluem
`traces`, `metrics` e `logs`. Configurações específicas do sinal têm prioridade
sobre as genéricas. Por exemplo, se você definir tanto
`otel.exporter.otlp.endpoint` quanto `otel.exporter.otlp.traces.endpoint`, a
segunda definição terá precedência.

**[1]**: O agente OpenTelemetry Java 2.x e o inicializador _Spring Boot (Spring
Boot starter)_ usam `http/protobuf` por padrão.

**[2]**: O [OTLP](/docs/specs/otlp/#otlpgrpc-response) exige que erros
[transitório](/docs/specs/otel/protocol/exporter/#retry) sejam tratados com
estratégias de _retry_. Quando o _retry_ está habilitado, códigos gRPC
_retryable_ são repetidos usando _exponential backoff_ com _jitter_. As opções
específicas de `RetryPolicy` só podem ser personalizadas via
[personalização programática](#programmatic-customization).

Propriedades para exportador de trechos `zipkin`:

| Propriedade do Sistema          | Descrição                                                 | Padrão                               |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| `otel.traces.exporter=zipkin`   | Seleciona o exportador Zipkin.                            |                                      |
| `otel.exporter.zipkin.endpoint` | A rota para conexão com Zipkin. Somente HTTP é suportado. | `http://localhost:9411/api/v2/spans` |

Propriedades para exportador de métricas `prometheus`:

| Propriedade do Sistema             | Descrição                                                  | Padrão    |
| ---------------------------------- | ---------------------------------------------------------- | --------- |
| `otel.metrics.exporter=prometheus` | Seleciona o exportador Prometheus.                         |           |
| `otel.exporter.prometheus.port`    | Porta local usada para vincular o servidor de métricas.    | `9464`    |
| `otel.exporter.prometheus.host`    | Endereço local usado para vincular o servidor de métricas. | `0.0.0.0` |

#### Personalização programática {#programmatic-customization}

A personalização programática fornece _hooks_ para complementar as
[propriedades suportadas](#environment-variables-and-system-properties) com
[configuração programática](#programmatic-configuration).

Se estiver usando o
[inicializador _Spring_](/docs/zero-code/java/spring-boot-starter/), consulte
também a seção de
[configuração programática do inicializador _Spring_](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#programmatic-configuration).

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizedAutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.Collections;

public class CustomizedAutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.builder()
        // Opcionalmente, personaliza o TextMapPropagator.
        .addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator)
        // Opcionalmente, personaliza o Resource.
        .addResourceCustomizer((resource, configProperties) -> resource)
        // Opcionalmente, personaliza o Sampler.
        .addSamplerCustomizer((sampler, configProperties) -> sampler)
        // Opcionalmente, personaliza o SpanExporter.
        .addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter)
        // Opcionalmente, personaliza o SpanProcessor.
        .addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor)
        // Opcionalmente, forneça propriedades adicionais.
        .addPropertiesSupplier(Collections::emptyMap)
        // Opcionalmente, personaliza o ConfigProperties.
        .addPropertiesCustomizer(configProperties -> Collections.emptyMap())
        // Opcionalmente, personaliza o SdkTracerProviderBuilder.
        .addTracerProviderCustomizer((builder, configProperties) -> builder)
        // Opcionalmente, personaliza o SdkMeterProviderBuilder.
        .addMeterProviderCustomizer((builder, configProperties) -> builder)
        // Opcionalmente, personaliza o MetricExporter.
        .addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter)
        // Opcionalmente, personaliza o MetricReader.
        .addMetricReaderCustomizer((metricReader, configProperties) -> metricReader)
        // Opcionalmente, personaliza o SdkLoggerProviderBuilder.
        .addLoggerProviderCustomizer((builder, configProperties) -> builder)
        // Opcionalmente, personaliza o LogRecordExporter.
        .addLogRecordExporterCustomizer((logRecordExporter, configProperties) -> logRecordExporter)
        // Opcionalmente, personaliza o LogRecordProcessor.
        .addLogRecordProcessorCustomizer((processor, configProperties) -> processor)
        .build()
        .getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

#### SPI (Service provider interface) {#spi-service-provider-interface}

[SPIs](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html) (artefato
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}`)
estendem a autoconfiguração do SDK além dos componentes embutidos no próprio
SDK.

As seções a seguir descrevem os SPIs disponíveis. Cada seção inclui:

- Uma breve descrição, com _link_ para o tipo na Javadoc.
- Uma tabela de implementações embutidas e do `opentelemetry-java-contrib`.
- Um exemplo simples de implementação personalizada.

##### ResourceProvider

[ResourceProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ResourceProvider.html)s
contribuem para o [recurso](../sdk/#resource) autoconfigurado.

`ResourceProvider`s embutidos no SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Class                                                                       | Artifact                                                                                            | Description                                                                                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider`   | `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`                | Fornece atributos de recursos com base nas variáveis de ambiente `OTEL_SERVICE_NAME` e `OTEL_RESOURCE_ATTRIBUTES`. |
| `io.opentelemetry.instrumentation.resources.ContainerResourceProvider`      | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de recursos de contêiner.                                                                        |
| `io.opentelemetry.instrumentation.resources.HostResourceProvider`           | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de recursos do _host_.                                                                           |
| `io.opentelemetry.instrumentation.resources.HostIdResourceProvider`         | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de ID do _host_.                                                                                 |
| `io.opentelemetry.instrumentation.resources.ManifestResourceProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de recursos de serviço com base no manifesto do jar.                                             |
| `io.opentelemetry.instrumentation.resources.OsResourceProvider`             | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de recursos do sistema operacional.                                                              |
| `io.opentelemetry.instrumentation.resources.ProcessResourceProvider`        | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de recursos do processo.                                                                         |
| `io.opentelemetry.instrumentation.resources.ProcessRuntimeResourceProvider` | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Fornece atributos de recursos de tempo de execução do processo.                                                    |
| `io.opentelemetry.contrib.gcp.resource.GCPResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-gcp-resources:{{% param vers.contrib %}}-alpha`             | Fornece atributos de recursos do ambiente de tempo de execução do GCP.                                             |
| `io.opentelemetry.contrib.aws.resource.BeanstalkResourceProvider`           | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Fornece atributos de recursos do ambiente de tempo de execução do AWS Beanstalk.                                   |
| `io.opentelemetry.contrib.aws.resource.Ec2ResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Fornece atributos de recursos do ambiente de tempo de execução do AWS EC2.                                         |
| `io.opentelemetry.contrib.aws.resource.EcsResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Fornece atributos de recursos do ambiente de tempo de execução do AWS ECS.                                         |
| `io.opentelemetry.contrib.aws.resource.EksResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Fornece atributos de recursos do ambiente de tempo de execução do AWS EKS.                                         |
| `io.opentelemetry.contrib.aws.resource.LambdaResourceProvider`              | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS lambda tempo de execução environment resource attributes.                                             |

Implemente a interface `ResourceProvider` para participar da autoconfiguração de
recurso. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

public class CustomResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    // Callback invocado para contribuir com o recurso.
    return Resource.builder().put("my.custom.resource.attribute", "abc123").build();
  }

  @Override
  public int order() {
    // Opcionalmente, influencie a ordem de invocação.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### AutoConfigurationCustomizerProvider

Implemente a interface
[AutoConfigurationCustomizerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.html)
para personalizar uma variedade de componentes autoconfigurados do SDK. Por
exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;

public class CustomizerProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer customizer) {
    // Opcionalmente, personalize o TextMapPropagator.
    customizer.addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator);
    // Opcionalmente, personalize o Resource.
    customizer.addResourceCustomizer((resource, configProperties) -> resource);
    // Opcionalmente, personalize o Sampler.
    customizer.addSamplerCustomizer((sampler, configProperties) -> sampler);
    // Opcionalmente, personalize o SpanExporter.
    customizer.addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter);
    // Opcionalmente, personalize o SpanProcessor.
    customizer.addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor);
    // Optionally supply additional properties.
    customizer.addPropertiesSupplier(Collections::emptyMap);
    // Opcionalmente, personalize o ConfigProperties.
    customizer.addPropertiesCustomizer(configProperties -> Collections.emptyMap());
    // Opcionalmente, personalize o SdkTracerProviderBuilder.
    customizer.addTracerProviderCustomizer((builder, configProperties) -> builder);
    // Opcionalmente, personalize o SdkMeterProviderBuilder.
    customizer.addMeterProviderCustomizer((builder, configProperties) -> builder);
    // Opcionalmente, personalize o MetricExporter.
    customizer.addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter);
    // Opcionalmente, personalize o MetricReader.
    customizer.addMetricReaderCustomizer((metricReader, configProperties) -> metricReader);
    // Opcionalmente, personalize o SdkLoggerProviderBuilder.
    customizer.addLoggerProviderCustomizer((builder, configProperties) -> builder);
    // Opcionalmente, personalize o LogRecordExporter.
    customizer.addLogRecordExporterCustomizer((exporter, configProperties) -> exporter);
    // Opcionalmente, personalize o LogRecordProcessor.
    customizer.addLogRecordProcessorCustomizer((processor, configProperties) -> processor);
  }

  @Override
  public int order() {
    // Opcionalmente, influencie a ordem de invocação.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSpanExporterProvider

Implemente a interface
[ConfigurableSpanExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSpanExporterProvider.html)
para permitir que um exportador de trecho personalizado participe da
autoconfiguração. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSpanExporterProvider;
import io.opentelemetry.sdk.trace.export.SpanExporter;

public class CustomSpanExporterProvider implements ConfigurableSpanExporterProvider {

  @Override
  public SpanExporter createExporter(ConfigProperties config) {
    // Callback invocado quando OTEL_TRACES_EXPORTER inclui o valor de getName().
    return new CustomSpanExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableMetricExporterProvider

Implemente a interface
[ConfigurableMetricExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/metrics/ConfigurableMetricExporterProvider.html)
para permitir que um exportador de métrica personalizado participe da
autoconfiguração. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.metrics.ConfigurableMetricExporterProvider;
import io.opentelemetry.sdk.metrics.export.MetricExporter;

public class CustomMetricExporterProvider implements ConfigurableMetricExporterProvider {

  @Override
  public MetricExporter createExporter(ConfigProperties config) {
    // Callback invocado quando OTEL_METRICS_EXPORTER inclui o valor de getName().
    return new CustomMetricExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableLogRecordExporterProvider

Implemente a interface
[ConfigurableLogRecordExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/logs/ConfigurableLogRecordExporterProvider.html)
para permitir que um exportador de registro de log personalizado participe da
autoconfiguração. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.logs.ConfigurableLogRecordExporterProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;

public class CustomLogRecordExporterProvider implements ConfigurableLogRecordExporterProvider {

  @Override
  public LogRecordExporter createExporter(ConfigProperties config) {
    // Callback invocado quando OTEL_LOGS_EXPORTER inclui o valor de getName().
    return new CustomLogRecordExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSamplerProvider

Implemente a interface
[ConfigurableSamplerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSamplerProvider.html)
para permitir que um sampler personalizado participe da autoconfiguração. Por
exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSamplerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

public class CustomSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // Callback invocado quando OTEL_TRACES_SAMPLER é definido para o valor de getName().
    return new CustomSampler();
  }

  @Override
  public String getName() {
    return "custom-sampler";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurablePropagatorProvider

Implemente a interface
[ConfigurablePropagatorProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ConfigurablePropagatorProvider.html)
para permitir que um propagador personalizado participe da autoconfiguração. Por
exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagatorProvider.java"?>
```java
package otel;

import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

public class CustomTextMapPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    // Callback invocado quando OTEL_PROPAGATORS inclui o valor de getName().
    return new CustomTextMapPropagator();
  }

  @Override
  public String getName() {
    return "custom-propagator";
  }
}
```
<!-- prettier-ignore-end -->

### Configuração declarativa {#declarative-configuration}

A configuração declarativa está em desenvolvimento. Ela permite configuração
baseada em arquivo YAML, conforme descrito em
[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)
e em
[configuração declarativa](/docs/specs/otel/configuration/#declarative-configuration).

Para utilizar, inclua
`io.opentelemetry:opentelemetry-sdk-extension-incubator:{{% param vers.otel %}}-alpha`
e especifique o caminho para o arquivo de configuração conforme descrito na
tabela abaixo.

| Propriedade do sistema          | Propósito                                        | Padrão     |
| ------------------------------- | ------------------------------------------------ | ---------- |
| `otel.experimental.config.file` | O caminho para o arquivo de configuração do SDK. | Desativado |

{{% alert title="Nota" color="warning" %}} Quando um arquivo de configuração é
especificado, as
[variáveis de ambiente e propriedades do sistema](#environment-variables-and-system-properties),
[a personalização programática](#programmatic-customization) e os
[SPIs](#spi-service-provider-interface) são ignorados. O conteúdo do arquivo,
por si só, define a configuração do SDK. {{% /alert %}}

Para mais detalhes, consulte os seguintes recursos:

- [Documentação de uso](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#declarative-configuration)
- [Exemplo com agente Java](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#declarative-configuration)
- [Exemplo sem agente Java](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/declarative-configuration)
