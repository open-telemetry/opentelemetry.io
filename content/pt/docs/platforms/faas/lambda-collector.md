---
title: Configuração da camada Lambda do Collector
linkTitle: Config da camada Lambda do Collector
weight: 11
description:
  Adicione e configure a camada Lambda do Collector à sua função Lambda
cSpell:ignore: ADOT awsxray configmap confmap regionalized
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
---

A comunidade OpenTelemetry disponibiliza o Collector em uma camada Lambda
separada das camadas de instrumentação, dando aos usuários o máximo de
flexibilidade. Isso é diferente da implementação atual do AWS Distribution of
OpenTelemetry (ADOT), que reúne a instrumentação e o Collector em um só pacote.

## Adicione o ARN da camada Lambda do OTel Collector {#add-the-arn-of-the-otel-collector-lambda-layer}

Depois de instrumentar sua aplicação, adicione a camada Lambda do Collector para
coletar e enviar seus dados ao backend escolhido.

Encontre o
[lançamento mais recente da camada do Collector](https://github.com/open-telemetry/opentelemetry-lambda/releases)
e use o respectivo ARN após substituir a tag `<region>` pela região onde seu
Lambda está localizado.

Observação: as camadas Lambda são um recurso regionalizado, ou seja, só podem
ser usadas na região em que foram publicadas. Certifique-se de usar a camada na
mesma região das suas funções Lambda. A comunidade publica camadas em todas as
regiões disponíveis.

## Configure o OTel Collector {#configure-the-otel-collector}

A configuração da camada Lambda do OTel Collector segue o padrão do
OpenTelemetry.

Por padrão, a camada Lambda do OTel Collector usa o arquivo `config.yaml`.

### Configure a variável de ambiente do seu backend preferido {#set-the-environment-variable-for-your-preferred-backend}

Nas configurações de variáveis de ambiente do Lambda, crie uma nova variável
para armazenar seu token de autorização.

### Atualize os exporters padrão {#update-the-default-exporters}

No arquivo `config.yaml`, adicione seu(s) exporter(s) preferido(s), caso ainda
não estejam presentes. Configure o(s) exporter(s) com as variáveis de ambiente
definidas para os tokens de acesso na etapa anterior.

**Sem uma variável de ambiente definida para os exporters, a configuração padrão
só permite emitir dados usando o exporter `debug`.** Veja a configuração padrão:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

## Publique seu Lambda {#publish-your-lambda}

Publique uma nova versão do seu Lambda para habilitar as alterações feitas.

## Configuração avançada do OTel Collector {#advanced-otel-collector-configuration}

Confira a lista de componentes disponíveis com suporte para configuração
personalizada. Para habilitar depuração, defina o nível de log como `debug` no
arquivo de configuração. Veja o exemplo abaixo.

### Escolha seu provedor confmap preferido {#choose-your-preferred-confmap-provider}

As camadas Lambda do OTel oferecem suporte aos seguintes tipos de provedores
confmap: `file`, `env`, `yaml`, `http`, `https` e `s3`. Para personalizar a
configuração do OTel Collector usando diferentes provedores confmap e outras
informações, consulte a
[documentação de provedores confmap do Amazon Distribution of OpenTelemetry](https://aws-otel.github.io/docs/components/confmap-providers#confmap-providers-supported-by-the-adot-collector).

### Crie um arquivo de configuração personalizado {#create-a-custom-configuration-file}

Veja um exemplo de arquivo de configuração `collector.yaml` no diretório raiz:

```yaml
#collector.yaml in the root directory
#Set an environment variable 'OPENTELEMETRY_COLLECTOR_CONFIG_URI' to '/var/task/collector.yaml'

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
  awsxray:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [awsxray]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

### Mapeie seu arquivo de configuração personalizado usando variáveis de ambiente {#map-your-custom-configuration-file-using-environment-variables}

Depois de definir a configuração do Collector por meio de um provedor confmap,
crie uma variável de ambiente na sua função Lambda chamada
`OPENTELEMETRY_COLLECTOR_CONFIG_URI` e defina como valor o caminho da
configuração de acordo com o provedor confmap usado. Por exemplo, se você
estiver usando um provedor confmap do tipo file, defina o valor como
`/var/task/<path>/<to>/<filename>`. Isso indica à extensão onde encontrar a
configuração do Collector.

#### Configuração personalizada do Collector usando a CLI {#custom-collector-configuration-using-the-cli}

Você pode definir isso pelo console da AWS ou pela AWS CLI.

```bash
aws lambda update-function-configuration --function-name Function --environment Variables={OPENTELEMETRY_COLLECTOR_CONFIG_URI=/var/task/collector.yaml}
```

#### Defina variáveis de ambiente de configuração a partir do CloudFormation {#set-configuration-environment-variables-from-cloudformation}

Também é possível configurar variáveis de ambiente por meio de um template do
**CloudFormation**:

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: /var/task/collector.yaml
```

#### Carregue a configuração a partir de um objeto do S3 {#load-configuration-from-an-s3-object}

Para carregar a configuração a partir do S3, a role do IAM associada à sua
função precisa incluir acesso de leitura ao bucket correspondente.

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: s3://<bucket_name>.s3.<region>.amazonaws.com/collector_config.yaml
```
