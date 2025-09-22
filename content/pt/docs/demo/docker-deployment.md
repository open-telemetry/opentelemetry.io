---
title: Implantação com Docker
linkTitle: Docker
aliases: [docker_deployment]
cSpell:ignore: otlphttp spanmetrics tracetest tracetesting
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## Pré-requisitos

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0.0+
- Make (opcional)
- 6 GB de RAM para a aplicação

## Obter e executar o demo

1.  Clone o repositório do Demo:

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2.  Acesse a pasta do demo:

    ```shell
    cd opentelemetry-demo/
    ```

3.  Inicie o demo[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4.  (Opcional) Habilite testes orientados por observabilidade de API[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-tracetesting
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f docker-compose-tests.yml run traceBasedTests
```

    {{% /tab %}} {{< /tabpane >}}

## Verificar a loja web e Telemetria

Assim que as imagens forem construídas e os contêineres iniciados, você pode acessar:

- Loja web: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- UI do Gerador de Carga: <http://localhost:8080/loadgen/>
- UI do Jaeger: <http://localhost:8080/jaeger/ui/>
- UI do Tracetest: <http://localhost:11633/>, somente quando usar
  `make run-tracetesting`
- UI do configurador do Flagd: <http://localhost:8080/feature>

## Alterando a porta principal do demo

Por padrão, a aplicação do demo inicia um proxy para todo o tráfego do navegador
na porta 8080. Para alterar o número da porta, defina a variável de ambiente
`ENVOY_PORT` antes de iniciar o demo.

- Por exemplo, para usar a porta 8081[^1]:

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## Traga seu próprio backend

Provavelmente você deseja usar a loja web como uma aplicação de demonstração para
um backend de observabilidade que você já possui (por exemplo, uma instância
existente do Jaeger, Zipkin, ou um dos [fornecedores à sua escolha](/ecosystem/vendors/)).

O OpenTelemetry Collector pode ser usado para exportar dados de telemetria para
vários backends. Por padrão, o collector na aplicação de demo mescla a
configuração de dois arquivos:

- `otelcol-config.yml`
- `otelcol-config-extras.yml`

Para adicionar seu backend, abra o arquivo
[src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml)
em um editor.

- Comece adicionando um novo exporter. Por exemplo, se seu backend suporta OTLP
  via HTTP, adicione o seguinte:

  ```yaml
  exporters:
    otlphttp/example:
      endpoint: <your-endpoint-url>
  ```

- Em seguida, substitua os `exporters` para os pipelines de telemetria que você
  deseja usar para o seu backend.

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [spanmetrics, otlphttp/example]
  ```

{{% alert title="Nota" %}} Ao mesclar valores YAML com o Collector, objetos
são mesclados e arrays são substituídos. O exporter `spanmetrics` deve ser
incluído no array de exporters do pipeline `traces` se houver substituição. Não
incluir esse exporter resultará em erro. {{% /alert %}}

Backends de fornecedores podem exigir que você adicione parâmetros adicionais
para autenticação, consulte a documentação deles. Alguns backends exigem
exporters diferentes; você pode encontrá-los e sua documentação em
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

Após atualizar o `otelcol-config-extras.yml`, inicie o demo executando
`make start`. Depois de um tempo, você deverá ver os traces chegando ao seu
backend também.

[^1]: {{% param notes.docker-compose-v2 %}}
