---
title: Auto-instrumentação do Lambda
weight: 11
description: Instrumente automaticamente suas funções Lambda com o OpenTelemetry
default_lang_commit: 2930608f29463e76d08a496239c05ed75b20120e
cSpell:ignore: Corretto
---

A comunidade OpenTelemetry oferece camadas Lambda de instrumentação
independentes para as seguintes linguagens:

- Java
- JavaScript
- Python
- Ruby

Elas podem ser adicionadas ao seu Lambda usando o portal da AWS para
instrumentar automaticamente sua aplicação. Essas camadas não incluem o
Collector, que é uma adição obrigatória, a menos que você configure uma
instância externa do Collector para enviar seus dados.

## Adicione o ARN da camada Lambda do Collector OTel {#add-the-arn-of-the-otel-collector-lambda-layer}

Consulte as
[orientações sobre a camada Lambda do Collector](../lambda-collector/) para
adicionar a camada à sua aplicação e configurar o Collector. Recomendamos
adicionar isso primeiro.

## Requisitos de linguagem {#language-requirements}

{{< tabpane text=true >}} {{% tab Java %}}

A camada Lambda oferece suporte aos runtimes Lambda Java 8, 11 e 17 (Corretto).
Para mais informações sobre as versões Java suportadas, consulte a
[documentação do OpenTelemetry Java](/docs/languages/java/).

**Observação:** o agente de auto-instrumentação Java está incluído na camada
Lambda. A instrumentação automática tem um impacto considerável no tempo de
inicialização no AWS Lambda, e geralmente é necessário combiná-la com
concorrência provisionada e requisições de aquecimento para atender requisições
de produção sem causar timeouts durante a inicialização.

Por padrão, o agente OTel Java presente na camada tentará auto-instrumentar todo
o código da sua aplicação. Isso pode ter um impacto negativo no tempo de
inicialização a frio (_cold start_) do Lambda.

Recomendamos habilitar a auto-instrumentação apenas para as
bibliotecas/frameworks realmente usados pela sua aplicação.

Para habilitar apenas instrumentações específicas, você pode usar as seguintes
variáveis de ambiente:

- `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`: quando definida como false,
  desabilita a auto-instrumentação na camada, exigindo que cada instrumentação
  seja habilitada individualmente.
- `OTEL_INSTRUMENTATION_<NAME>_ENABLED`: defina como true para habilitar a
  auto-instrumentação de uma biblioteca ou framework específico. Substitua
  `<NAME>` pela instrumentação que deseja habilitar. Para a lista de
  instrumentações disponíveis, consulte [Suprimindo instrumentação específica do
  agente][1].

  [1]:
    /docs/zero-code/java/agent/disable/#suppressing-specific-agent-instrumentation

Por exemplo, para habilitar a auto-instrumentação apenas para o Lambda e o SDK
da AWS, defina as seguintes variáveis de ambiente:

```sh
OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false
OTEL_INSTRUMENTATION_AWS_LAMBDA_ENABLED=true
OTEL_INSTRUMENTATION_AWS_SDK_ENABLED=true
```

{{% /tab %}} {{% tab JavaScript %}}

A camada Lambda oferece suporte aos runtimes Lambda Node.js v18+. Para mais
informações sobre as versões JavaScript e Node.js suportadas, consulte a
[documentação do OpenTelemetry JavaScript](https://github.com/open-telemetry/opentelemetry-js).

{{% /tab %}} {{% tab Python %}}

A camada Lambda oferece suporte aos runtimes Lambda Python 3.9+. Para mais
informações sobre as versões Python suportadas, consulte a
[documentação do OpenTelemetry Python](https://github.com/open-telemetry/opentelemetry-python/blob/main/README.md#python-version-support)
e o pacote no [PyPi](https://pypi.org/project/opentelemetry-api/).

{{% /tab %}} {{% tab Ruby %}}

A camada Lambda oferece suporte aos runtimes Lambda Ruby 3.2 e 3.3. Para mais
informações sobre as versões do SDK e da API OpenTelemetry Ruby suportadas,
consulte a
[documentação do OpenTelemetry Ruby](https://github.com/open-telemetry/opentelemetry-ruby/blob/main/README.md#compatibility)
e o pacote no [RubyGem](https://rubygems.org/search?query=opentelemetry).

{{% /tab %}} {{< /tabpane >}}

## Configure o `AWS_LAMBDA_EXEC_WRAPPER` {#configure-aws_lambda_exec_wrapper}

Altere o ponto de entrada da sua aplicação definindo
`AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler` para Node.js, Java, Ruby ou Python.
Esse script wrapper invoca sua aplicação Lambda já com a instrumentação
automática aplicada.

## Adicione o ARN da camada Lambda de instrumentação {#add-the-arn-of-instrumentation-lambda-layer}

Para habilitar a auto-instrumentação OTel na sua função Lambda, é necessário
adicionar e configurar as camadas de instrumentação e do Collector, e então
habilitar o tracing.

1. Abra a função Lambda que deseja instrumentar no console da AWS.
2. Na seção Layers do Designer, escolha Add a layer.
3. Em specify an ARN, cole o ARN da camada e escolha Add.

Encontre o
[lançamento mais recente da camada de instrumentação](https://github.com/open-telemetry/opentelemetry-lambda/releases)
para sua linguagem e use o respectivo ARN após substituir a tag `<region>` pela
região onde seu Lambda está localizado.

Observação: as camadas Lambda são um recurso regionalizado, ou seja, só podem
ser usadas na região em que foram publicadas. Certifique-se de usar a camada na
mesma região das suas funções Lambda. A comunidade publica camadas em todas as
regiões disponíveis.

## Configure os exporters do seu SDK {#configure-your-sdk-exporters}

Os exporters padrão usados pelas camadas Lambda funcionam sem qualquer alteração
quando há um Collector embutido com receivers gRPC/HTTP. As variáveis de
ambiente não precisam ser atualizadas. No entanto, há diferentes níveis de
suporte a protocolos e valores padrão por linguagem, documentados abaixo.

{{< tabpane text=true >}} {{% tab Java %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=grpc` oferece suporte a: `grpc`, `http/protobuf` e
`http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`

{{% /tab %}} {{% tab JavaScript %}}

A variável de ambiente `OTEL_EXPORTER_OTLP_PROTOCOL` não é suportada. O exporter
fixo usa o protocolo `http/protobuf`
`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{% tab Python %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` oferece suporte a: `http/protobuf` e
`http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{% tab Ruby %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` oferece suporte a: `http/protobuf`
`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{< /tabpane >}}

## Publique seu Lambda {#publish-your-lambda}

Publique uma nova versão do seu Lambda para implantar as alterações e a
instrumentação.
