---
default_lang_commit: 7d0c3f247ee77671d1135b0af535a2aca05fe359
---

## Prometheus

Para enviar dados de métricas para o [Prometheus](https://prometheus.io/), você
pode
[ativar o OTLP Receiver do Prometheus](https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver)
e utilizar o [exportador OTLP](#otlp) ou você pode utilizar o exportador do
Prometheus, um `MetricReader` que inicia um servidor HTTP e coleta métricas,
serializando para o formato de texto do Prometheus sob demanda.

### Configuração do Backend {#prometheus-setup}

{{% alert-md title=Nota color=info %}}

Caso já possua o Prometheus ou um _backend_ compatível com Prometheus
configurado, poderá pular esta seção e configurar as dependências do exportador
[Prometheus](#prometheus-dependencies) ou [OTLP](#otlp-dependencies) para a sua
aplicação.

{{% /alert-md %}}

É possível executar o [Prometheus](https://prometheus.io) em um contêiner Docker
acessível na porta `9090` através das seguintes instruções:

Em uma pasta vazia, crie um arquivo chamado `prometheus.yml` e adicione o
seguinte conteúdo:

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

Em seguida, execute o Prometheus em um contêiner Docker que ficará acessível na
porta `9090` através do seguinte comando:

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert-md title=Nota color=info %}}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Nota</h4>

Ao utilizar o OTLP Receiver do Prometheus, certifique-se de definir o endpoint
OTLP das métricas em sua aplicação para `http://localhost:9090/api/v1/otlp`.

Nem todos os ambientes Docker suportam `host.docker.internal`. Em alguns casos,
será necessário alterar o valor `host.docker.internal` para `localhost` ou o
endereço de IP de sua máquina.

{{% /alert-md %}}
