---
title: Implantação no Kubernetes
linkTitle: Kubernetes
aliases: [kubernetes_deployment]
cSpell:ignore: loadgen otlphttp spanmetrics
---

Fornecemos um
[chart Helm do OpenTelemetry Demo](/docs/platforms/kubernetes/helm/demo/) para
ajudar a implantar o demo em um cluster Kubernetes existente.

[Helm](https://helm.sh) deve estar instalado para usar os charts. Consulte a
[documentação](https://helm.sh/docs/) do Helm para começar.

## Pré-requisitos

- Kubernetes 1.24+
- 6 GB de RAM livre para a aplicação
- Helm 3.14+ (somente para o método de instalação via Helm)

## Instalar usando Helm (recomendado)

Adicionar o repositório Helm do OpenTelemetry:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Para instalar o chart com o nome de release `my-otel-demo`, execute:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

{{% alert title="Nota" %}}

O chart Helm do OpenTelemetry Demo não suporta upgrade entre versões. Se você
precisar atualizar o chart, primeiro exclua a release existente e depois instale
a nova versão.

{{% /alert %}}

{{% alert title="Nota" %}}

É necessária a versão 0.11.0 ou superior do chart Helm do OpenTelemetry Demo
para realizar todos os métodos de uso mencionados abaixo.

{{% /alert %}}

## Instalar usando kubectl

O comando abaixo instalará a aplicação demo no seu cluster Kubernetes.

```shell
kubectl create --namespace otel-demo -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-demo/main/kubernetes/opentelemetry-demo.yaml
```

{{% alert title="Nota" %}}

Os manifests Kubernetes do OpenTelemetry Demo não suportam upgrade entre
versões. Se você precisar atualizar o demo, primeiro exclua os recursos
existentes e depois instale a nova versão.

{{% /alert %}}

{{% alert title="Nota" %}}

Esses manifests são gerados a partir do chart Helm e são fornecidos por
conveniência. Recomenda-se usar o chart Helm para instalação.

{{% /alert %}}

## Usar o Demo

A aplicação demo precisará que os serviços sejam expostos fora do cluster
Kubernetes para serem utilizados. Você pode expor os serviços para o seu sistema
local usando `kubectl port-forward` ou configurando tipos de serviço (ex.:
LoadBalancer) com recursos de ingress opcionalmente implantados.

### Expor serviços usando kubectl port-forward

Para expor o serviço `frontend-proxy`, use o comando a seguir (substitua
`default` pelo namespace da release do seu chart Helm, conforme apropriado):

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

{{% alert title="Nota" %}}

`kubectl port-forward` faz proxy da porta até o término do processo. Você pode
precisar criar sessões de terminal separadas para cada uso do
`kubectl port-forward` e usar <kbd>Ctrl-C</kbd> para encerrar o processo quando
terminar.

{{% /alert %}}

Com o port-forward do `frontend-proxy` configurado, você pode acessar:

- Loja web: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- UI do Gerador de Carga: <http://localhost:8080/loadgen/>
- UI do Jaeger: <http://localhost:8080/jaeger/ui/>
- UI do configurador do Flagd: <http://localhost:8080/feature>

### Expor componentes do Demo usando configurações de service ou ingress

{{% alert title="Nota" %}} Recomendamos usar um arquivo de valores ao instalar o
chart Helm para especificar opções de configuração adicionais. {{% /alert %}}

#### Configurar recursos de ingress

{{% alert title="Nota" %}}

Clusters Kubernetes podem não possuir os componentes de infraestrutura adequados
para habilitar tipos de serviço LoadBalancer ou recursos de ingress. Verifique se
o seu cluster possui o suporte apropriado antes de usar essas opções.

{{% /alert %}}

Cada componente do demo (ex.: `frontend-proxy`) oferece uma forma de configurar
o tipo de serviço Kubernetes. Por padrão, esses recursos não serão criados, mas
você pode habilitá-los e configurá-los por meio da propriedade `ingress` de cada
componente.

Para configurar o componente `frontend-proxy` para usar um recurso de ingress,
especifique o seguinte no seu arquivo de valores:

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

Alguns controladores de ingress exigem anotações especiais ou tipos de serviço
específicos. Consulte a documentação do seu controlador de ingress para mais
informações.

#### Configurar tipos de serviço

Cada componente do demo (ex.: `frontend-proxy`) oferece uma forma de configurar
o tipo de serviço Kubernetes. Por padrão, eles serão `ClusterIP`, mas você pode
alterar cada um usando a propriedade `service.type` de cada componente.

Para configurar o componente `frontend-proxy` para usar o tipo de serviço
`LoadBalancer`, especifique o seguinte no seu arquivo de valores:

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

#### Configurar telemetria do navegador

Para que os spans do navegador sejam coletados corretamente, você também precisa
especificar o local onde o OpenTelemetry Collector está exposto. O
`frontend-proxy` define uma rota para o collector com o prefixo de caminho
`/otlp-http`. Você pode configurar o endpoint do collector definindo a seguinte
variável de ambiente no componente `frontend`:

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## Traga seu próprio backend

Provavelmente você deseja usar a loja web como aplicação de demonstração para um
backend de observabilidade que você já possui (por exemplo, uma instância
existente do Jaeger, Zipkin, ou um dos [fornecedores à sua escolha](/ecosystem/vendors/)).

A configuração do OpenTelemetry Collector é exposta no chart Helm. Qualquer
adição que você fizer será mesclada à configuração padrão. Você pode usar isso
para adicionar seus próprios exporters e incluí-los nos pipeline(s) desejados:

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

{{% alert title="Nota" %}} Ao mesclar valores YAML com o Helm, objetos são
mesclados e arrays são substituídos. O exporter `spanmetrics` deve ser incluído
no array de exporters do pipeline `traces` se houver substituição. Não incluir
esse exporter resultará em erro. {{% /alert %}}

Backends de fornecedores podem exigir parâmetros adicionais para autenticação;
consulte a documentação deles. Alguns backends exigem exporters diferentes; você
pode encontrá-los e suas documentações em
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

Para instalar o chart Helm com um arquivo de valores personalizado
`my-values-file.yaml`, use:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
