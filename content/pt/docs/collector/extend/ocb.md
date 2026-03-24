---
title: Compilar um Collector personalizado com o OpenTelemetry Collector Builder
linkTitle: Compilar um Collector personalizado
description: Monte sua própria distribuição do OpenTelemetry Collector
weight: 200
params:
  providers-vers: v1.48.0
# prettier-ignore
cSpell:ignore: chipset darwin debugexporter gomod otlpexporter otlpreceiver wyrtw
---

O OpenTelemetry Collector possui cinco
[distribuições](/docs/collector/distributions/) oficiais que vêm
pré-configuradas com certos componentes. Se você precisar de mais flexibilidade,
pode usar o [OpenTelemetry Collector Builder][ocb] (ou `ocb`) para gerar um
binário personalizado da sua própria distribuição que inclua componentes
personalizados, componentes upstream e outros componentes disponíveis
publicamente.

O guia a seguir mostra como começar a usar o `ocb` para compilar seu próprio
Collector. Neste exemplo, você criará uma distribuição do Collector para
suportar o desenvolvimento e teste de componentes personalizados. Você poderá
iniciar e depurar (debug) os componentes do seu Collector diretamente no seu
ambiente de desenvolvimento integrado (IDE) preferido para Golang. Use todos os
recursos de depuração da sua IDE (stack traces são ótimos professores!) para
entender como o Collector interage com o código do seu componente.

## Pré-requisitos

A ferramenta `ocb` requer o Go para compilar a distribuição do Collector.
Certifique-se de [instalar](https://go.dev/doc/install) uma
[versão compatível](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md#compatibility)
do Go em sua máquina antes de começar.

## Instalar o OpenTelemetry Collector Builder {#install-the-opentelemetry-collector-builder}

O binário `ocb` está disponível como um recurso (asset) para download nas
versões do OpenTelemetry Collector com as [tags `cmd/builder`][tags]. Encontre e
baixe o recurso que corresponda ao seu sistema operacional e arquitetura
(chipset):

{{< tabpane text=true >}}

{{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ppc64le) "%}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_ppc64le
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Windows (AMD 64)" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_windows_amd64.exe" -OutFile "ocb.exe"
Unblock-File -Path "ocb.exe"
```

{{% /tab %}} {{< /tabpane >}}

Para garantir que o `ocb` foi instalado corretamente, digite `./ocb help` no seu
terminal. Você deverá ver a saída do comando `help` no seu console.

## Configurar o OpenTelemetry Collector Builder {#configure-the-opentelemetry-collector-builder}

Configure o `ocb` com um arquivo de manifesto YAML. O manifesto possui duas
seções principais. A primeira seção, `dist`, contém opções para configurar a
geração de código e o processo de compilação. A segunda seção contém os tipos de
módulos de nível superior, como `extensions`, `exporters`, `receivers` ou
`processors`. Cada tipo de módulo aceita uma lista de componentes.

A seção `dist` do manifesto contém tags que são equivalentes às `flags` de linha
de comando do `ocb`. A tabela a seguir lista as opções para configurar a seção
`dist`.

| Tag                | Descrição                                                                   | Opcional             | Valor Padrão                                                                      |
| ------------------ | --------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| module:            | O nome do módulo para a nova distribuição, seguindo as convenções do Go mod | Sim, mas recomendado | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:              | O nome do binário para a sua distribuição                                   | Sim                  | `otelcol-custom`                                                                  |
| description:       | Um nome longo para a aplicação                                              | Sim                  | `Custom OpenTelemetry Collector distribution`                                     |
| output_path:       | O caminho para gravar a saída (fontes e binário)                            | Sim                  | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:           | A versão para o seu OpenTelemetry Collector personalizado                   | Sim                  | `1.0.0`                                                                           |
| go:                | O binário Go a ser usado para compilar as fontes geradas                    | Sim                  | O binário go definido na variável de ambiente PATH                                |
| debug_compilation: | Manter os símbolos de depuração (debug) no binário resultante               | Sim                  | False                                                                             |

Todas as tags de `dist` são opcionais. Você pode adicionar valores
personalizados para elas, dependendo se pretende disponibilizar sua distribuição
personalizada do Collector para outros usuários ou se está usando o `ocb` para
inicializar seu ambiente de desenvolvimento e teste de componentes.

Para configurar o `ocb`, siga estas etapas:

1. Crie um arquivo de manifesto chamado `builder-config.yaml` com o seguinte
   conteúdo:

   ```yaml
   dist:
     name: otelcol-dev
     description: Distribuição básica do OTel Collector para desenvolvedores
     output_path: ./otelcol-dev
   ```

1. Adicione módulos para os componentes que você deseja incluir nesta
   distribuição personalizada do Collector. Consulte a
   [documentação de configuração do `ocb`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)
   para entender os diferentes módulos e como adicionar componentes.

   Para esta distribuição de exemplo, adicione os seguintes componentes:
   - Exporters: OTLP e Debug
   - Receivers: OTLP
   - Processors: Batch

   O arquivo de manifesto `builder-config.yaml` deve ficar assim:

   ```yaml
   dist:
     name: otelcol-dev
     description: Distribuição básica do OTel Collector para desenvolvedores
     output_path: ./otelcol-dev

   exporters:
     - gomod:
         go.opentelemetry.io/collector/exporter/debugexporter {{%
         version-from-registry collector-exporter-debug %}}
     - gomod:
         go.opentelemetry.io/collector/exporter/otlpexporter {{%
         version-from-registry collector-exporter-otlp %}}

   processors:
     - gomod:
         go.opentelemetry.io/collector/processor/batchprocessor {{%
         version-from-registry collector-processor-batch %}}

   receivers:
     - gomod:
         go.opentelemetry.io/collector/receiver/otlpreceiver {{%
         version-from-registry collector-receiver-otlp %}}

   providers:
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/envprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/fileprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpsprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/yamlprovider {{% param
         providers-vers %}}
   ```

> [!TIP]
>
> Para uma lista de componentes que você pode adicionar ao seu Collector
> personalizado, consulte o
> [OpenTelemetry Registry](/ecosystem/registry/?language=collector). Cada
> entrada do registro contém o nome completo e a versão que você precisa
> adicionar ao seu `builder-config.yaml`.

## Gerar o código e compilar sua distribuição do Collector {#generate-the-code-and-build-your-collector-distribution}

> [!NOTE]
>
> Esta seção instrui você a compilar sua distribuição personalizada do Collector
> usando o binário `ocb`. Se você deseja compilar e implantar sua distribuição
> em um orquestrador de containers, como o Kubernetes, pule esta seção e
> consulte
> [Containerize sua Distribuição do Collector](#containerize-your-collector-distribution).

Com o `ocb` instalado e configurado, você está pronto para compilar sua
distribuição.

No seu terminal, digite o seguinte comando para iniciar o `ocb`:

```sh
./ocb --config builder-config.yaml
```

A saída do comando deve ser semelhante a esta:

```text
2025-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2025-06-03T15:05:37Z"}
2025-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2025-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2025-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2025-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2025-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2025-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

Conforme definido na seção `dist` do seu manifesto, você agora tem uma pasta
chamada `otelcol-dev` contendo todo o código-fonte e o binário da sua
distribuição do Collector.

A estrutura da pasta será semelhante a esta:

```text
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

Você pode usar o código gerado para inicializar seus projetos de desenvolvimento
de componentes e, em seguida, compilar e distribuir sua própria distribuição do
Collector com esses componentes.

## Gerar container da sua distribuição do Collector {#containerize-your-collector-distribution}

> [!NOTE]
>
> Esta seção ensina você a compilar sua distribuição do Collector dentro de um
> `Dockerfile`. Siga estas instruções se precisar implantar sua distribuição do
> Collector em um orquestrador de containers, como o Kubernetes. Se você deseja
> compilar sua distribuição do Collector sem a etapa de container, consulte
> [Gerar o código e compilar sua distribuição do Collector](#generate-the-code-and-build-your-collector-distribution).

Siga estas etapas para gerar o container do seu Collector personalizado.

1. Adicione dois novos arquivos ao seu projeto:
   - `Dockerfile` - Definição da imagem de container da sua distribuição do
     Collector
   - `collector-config.yaml` - YAML de configuração mínima do Collector para
     testar sua distribuição

   Após adicionar esses arquivos, sua estrutura de arquivos ficará assim:

   ```text
   .
   ├── builder-config.yaml
   ├── collector-config.yaml
   └── Dockerfile
   ```

1. Adicione o seguinte conteúdo ao `Dockerfile`. Esta definição compila sua
   distribuição do Collector localmente (_in-place_) e garante que o binário
   resultante da distribuição do Collector corresponda à arquitetura do
   container de destino (por exemplo, `linux/arm64`, `linux/amd64`):

   ```dockerfile
   FROM alpine:3.19 AS certs
   RUN apk --update add ca-certificates

   FROM golang:1.25.0 AS build-stage
   WORKDIR /build

   COPY ./builder-config.yaml builder-config.yaml

   RUN --mount=type=cache,target=/root/.cache/go-build GO111MODULE=on go install go.opentelemetry.io/collector/cmd/builder@{{% version-from-registry collector-builder %}}
   RUN --mount=type=cache,target=/root/.cache/go-build builder --config builder-config.yaml

   FROM gcr.io/distroless/base:latest

   ARG USER_UID=10001
   USER ${USER_UID}

   COPY ./collector-config.yaml /otelcol/collector-config.yaml
   COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
   COPY --chmod=755 --from=build-stage /build/otelcol-dev /otelcol

   ENTRYPOINT ["/otelcol/otelcol-dev"]
   CMD ["--config", "/otelcol/collector-config.yaml"]

   EXPOSE 4317 4318 12001
   ```

> [!NOTE]
>
> O Dockerfile faz referência ao nome da distribuição `otelcol-dev` do
> `builder-config.yaml` nas instruções `COPY` e `ENTRYPOINT`. Caso altere o
> `name` ou o `output_path` na seção `dist` do `builder-config.yaml`,
> certifique-se de atualizar as seguintes linhas no Dockerfile para que
> correspondam:
>
> - `COPY --chmod=755 --from=build-stage /build/<dist_name> /otelcol`
> - `ENTRYPOINT ["/otelcol/<dist_name>"]`

1. Adicione a seguinte definição ao seu arquivo `collector-config.yaml`:

   ```yaml
   receivers:
     otlp:
       protocols:
         grpc:
           endpoint: 0.0.0.0:4317
         http:
           endpoint: 0.0.0.0:4318

   exporters:
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
       logs:
         receivers: [otlp]
         exporters: [debug]
   ```

1. Use os seguintes comandos para compilar uma imagem Docker multi-arquitetura
   do `ocb` usando `linux/amd64` e `linux/arm64` como as arquiteturas de
   compilação de destino. Para saber mais, consulte este
   [post no blog](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/)
   sobre compilações multi-arquitetura.

   ```sh
   # Habilitar compilações multi-arquitetura no Docker
   docker run --rm --privileged tonistiigi/binfmt --install all
   docker buildx create --name mybuilder --use

   # Compilar a imagem Docker como Linux AMD e ARM
   # e carregar o resultado para o "docker images" local
   docker buildx build --load \
     -t <collector_distribution_image_name>:<version> \
     --platform=linux/amd64,linux/arm64 .

   # Testar a imagem recém-compilada
   docker run -it --rm -p 4317:4317 -p 4318:4318 \
       --name otelcol <collector_distribution_image_name>:<version>
   ```

## Leituras complementares

- [Criar um receiver](/docs/collector/extend/custom-component/receiver)
- [Criar um connector](/docs/collector/extend/custom-component/connector)

[ocb]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags
