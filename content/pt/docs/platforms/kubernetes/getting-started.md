---
title: Primeiros Passos
weight: 1
default_lang_commit: 4cb7e22f1e45d17854b309efc730499880aa7197
# prettier-ignore
cSpell:ignore: filelog filelogreceiver kubelet kubeletstats kubeletstatsreceiver sattributes sattributesprocessor sclusterreceiver sobjectsreceiver
---

Esta página apresenta a forma mais rápida para começar a monitorar seu cluster
Kubernetes com o OpenTelemetry. Ela focará na coleta de métricas e logs de
clusters, nós, pods e contêineres Kubernetes, assim como habilitar o cluster
para dar suporte a serviços que emitem dados OTLP.

Para ver o OpenTelemetry em ação com Kubernetes, o melhor lugar para começar é a
[OpenTelemetry Demo](/docs/demo/kubernetes-deployment/). O objetivo da demo é
ilustrar a implementação do OpenTelemetry, mas ela não pretende ser um exemplo
de como monitorar o Kubernetes em si. Depois de terminar este passo a passo,
pode ser um experimento divertido instalar a demo e ver como todo o
monitoramento responde a uma carga de trabalho ativa.

Caso queira migrar do Prometheus para o OpenTelemetry, ou se tiver interesse em
usar o OpenTelemetry Collector para coletar métricas do Prometheus, veja o
[Prometheus Receiver](/docs/platforms/kubernetes/collector/components/#prometheus-receiver).

## Visão geral {#overview}

O Kubernetes expõe muita telemetria importante de diversas formas. Ele tem logs,
eventos, métricas para vários objetos diferentes, e os dados gerados por suas
cargas de trabalho (_workloads_).

Para coletar todos esses dados, vamos usar o
[OpenTelemetry Collector](/docs/collector/). O Collector tem várias ferramentas
que permitem coletar todos esses dados com eficiência e enriquecê-los de
maneiras relevantes.

Para coletar todos os dados, vamos precisar de duas instalações do Collector:
uma como [DaemonSet](/docs/collector/deploy/agent/) e outra como
[Deployment](/docs/collector/deploy/gateway/). A instalação do Collector em
DaemonSet será usada para coletar a telemetria emitida pelos serviços, além de
logs e métricas de nós, pods e contêineres. A instalação do Collector como
Deployment será usada para coletar métricas do cluster e eventos.

Para instalar o Collector, vamos usar o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
que já vem com algumas opções para facilitar essa configuração. Caso não conheça
o Helm, dê uma olhada no [site do projeto Helm](https://helm.sh/). Este guia
focará no Helm chart, mas se preferir usar um operador Kubernetes, confira o
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator/).

## Preparação {#preparation}

Este guia vai usar um [cluster Kind](https://kind.sigs.k8s.io/) como base, mas
se desejar, é possível usar qualquer outro cluster Kubernetes.

Supondo que o Kind já esteja
[instalado](https://kind.sigs.k8s.io/#installation-and-usage), crie um novo
cluster kind:

```sh
kind create cluster
```

Supondo que o Helm já esteja [instalado](https://helm.sh/docs/intro/install/),
adicione o repositório do OpenTelemetry Collector Helm chart, que será usado
para a instalação mais adiante:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

## Collector como DaemonSet {#daemonset-collector}

O primeiro passo para coletar a telemetria do Kubernetes é implantar uma
instância do OpenTelemetry Collector como DaemonSet, para reunir a telemetria
relacionada aos nós e às cargas de trabalho em execução nesses nós. Um DaemonSet
garante que essa instância do Collector seja instalada em todos os nós. Cada
instância do Collector no DaemonSet só coleta dados do nó em que está em
execução.

Esta instância do Collector usa os seguintes componentes:

- [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver):
  para coletar rastros, métricas e logs da aplicação.
- [Kubernetes Attributes Processor](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor):
  para adicionar metadados do Kubernetes à telemetria recebida da aplicação.
- [Kubeletstats Receiver](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver):
  para obter métricas de nós, pods e contêineres a partir do servidor de API em
  um kubelet.
- [Filelog Receiver](/docs/platforms/kubernetes/collector/components/#filelog-receiver):
  para coletar logs do Kubernetes e logs de aplicação escritos em
  _stdout/stderr_.

Vamos detalhar cada um deles.

### OTLP Receiver

O
[OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
é a melhor solução para coletar rastros, métricas e logs no
[formato OTLP](/docs/specs/otel/protocol/). Se sua aplicação emite telemetria em
outro formato, é bem provável que
[o Collector tenha um receiver para isso](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver),
mas para este tutorial, vamos assumir que a telemetria está no formato OTLP.

Embora não seja um requisito, é comum que aplicações em execução em um nó emitam
seus rastros, métricas e logs para um Collector em execução no mesmo nó. Isso
mantém as interações de rede simples e facilita a correlação de metadados do
Kubernetes usando o _processor_ `k8sattributes`.

### Kubernetes Attributes Processor

O
[Kubernetes Attributes Processor](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)
é um componente altamente recomendado para qualquer Collector que receba
telemetria de pods do Kubernetes. Esse _processor_ descobre automaticamente os
pods do Kubernetes, extrai seus metadados, como o nome do pod ou nome do nó, e
adiciona esses metadados a spans, métricas e logs como atributos de recurso
(_resource attributes_). Ao adicionar contexto do Kubernetes à sua telemetria, o
Kubernetes Attributes Processor permite correlacionar rastros, métricas e logs
da sua aplicação com a telemetria do Kubernetes, como as métricas e rastros de
pods.

### Kubeletstats Receiver

O
[Kubeletstats Receiver](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)
é o _receiver_ que coleta métricas sobre o nó, como uso de memória do contêiner,
uso de CPU do pod e erros de rede do nó. Toda essa telemetria inclui metadados
do Kubernetes, como nome do pod ou nome do nó. Como estamos usando o Kubernetes
Attributes Processor, é possível correlacionar os rastros, métricas e logs da
nossa aplicação com as métricas produzidas pelo Kubeletstats Receiver.

### Filelog Receiver

O
[Filelog Receiver](/docs/platforms/kubernetes/collector/components/#filelog-receiver)
coleta logs escritos em stdout/stderr acompanhando (_tailing_) os logs que o
Kubernetes grava em `/var/log/pods/*/*/*.log`. Como a maioria dos leitores de
logs, o Filelog Receiver oferece um conjunto robusto de ações que permitem
analisar o arquivo da forma que desejar.

Pode ser que um dia precise configurar um Filelog Receiver por conta própria,
mas, para este passo a passo, o Helm Chart do OpenTelemetry cuidará de toda a
complexidade da configuração. Além disso, ele extrai metadados úteis do
Kubernetes com base no nome do arquivo. Como estamos usando o Kubernetes
Attributes Processor, será possível correlacionar os rastros, métricas e logs da
aplicação com os logs produzidos pelo Filelog Receiver.

---

O Helm chart do OpenTelemetry Collector facilita a configuração de todos esses
componentes em uma instalação do Collector em DaemonSet. Ele também cuida de
todos os detalhes específicos do Kubernetes, como RBAC, _mounts_ e portas de
host.

Uma ressalva: por padrão, o chart não envia os dados para nenhum _backend_. Para
enviar os dados ao seu _backend_ de preferência, é necessário configurar um
_exporter_ manualmente.

Vamos usar o `values.yaml` a seguir:

```yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-k8s

presets:
  # habilita o k8sattributesprocessor e o adiciona às pipelines dos rastros, métricas e logs
  kubernetesAttributes:
    enabled: true
  # habilita o kubeletstatsreceiver e o adiciona às pipelines de métricas
  kubeletMetrics:
    enabled: true
  # Habilita o filelogreceiver e o adiciona às pipelines de logs
  logsCollection:
    enabled: true
## Por padrão, o chart inclui apenas o debugexporter
## Para enviar os dados para algum lugar, é necessário
## configurar um exporter, como o exporter otlp
# config:
#   exporters:
#     otlp:
#       endpoint: "<ALGUM BACKEND>"
#   service:
#     pipelines:
#       traces:
#         exporters: [ otlp ]
#       metrics:
#         exporters: [ otlp ]
#       logs:
#         exporters: [ otlp ]
```

Para usar este `values.yaml` com o chart, salve-o no local de sua preferência e
execute o seguinte comando para instalar o chart:

```sh
helm install otel-collector open-telemetry/opentelemetry-collector --values <caminho do arquivo salvo>
```

Agora deverá haver uma instalação do OpenTelemetry Collector em DaemonSet em
execução no seu cluster, coletando telemetria de cada nó!

## Collector em Deployment {#deployment-collector}

O próximo passo para coletar telemetria do Kubernetes é implantar uma instância
do Collector em Deployment, para reunir a telemetria relacionada ao cluster como
um todo. Uma implementação com exatamente uma réplica garante que não sejam
produzidos dados duplicados.

Esta instância do Collector usará os seguintes componentes:

- [Kubernetes Cluster Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver):
  para coletar métricas no nível do cluster e eventos de entidade.
- [Kubernetes Objects Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver):
  para coletar objetos, como eventos, do servidor de API do Kubernetes.

Vamos detalhar cada um deles.

### Kubernetes Cluster Receiver

O
[Kubernetes Cluster Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)
é a solução do Collector para coletar métricas sobre o estado do cluster como um
todo. Este _receiver_ pode reunir métricas sobre condições dos nós, fases dos
pods, reinícios de contêineres, número de Deployments disponíveis e desejados,
entre outras.

### Kubernetes Objects Receiver

O
[Kubernetes Objects Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver)
é a solução do Collector para coletar objetos do Kubernetes como logs. Embora
qualquer objeto possa ser coletado, um caso de uso comum e importante é coletar
eventos do Kubernetes.

---

O Helm chart do OpenTelemetry Collector simplifica a configuração de todos esses
componentes em uma instalação do Collector como Deployment. Ele também cuida de
todos os detalhes específicos do Kubernetes, como RBAC e _mounts_.

Uma ressalva: por padrão, o chart não envia os dados para nenhum backend. Para
realmente usar os dados em um backend de sua preferência, é necessário
configurar um _exporter_ manualmente.

Vamos usar o `values.yaml` a seguir:

```yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-k8s

# Queremos apenas um destes coletores - mais que isso produziria dados duplicados
replicaCount: 1

presets:
  # habilita o k8sclusterreceiver e o adiciona às pipelines de métricas
  clusterMetrics:
    enabled: true
  # habilita o k8sobjectsreceiver para coletar somente eventos e o adiciona às pipelines de logs
  kubernetesEvents:
    enabled: true
## Por padrão o chart inclui apenas o debugexporter
## Para enviar os dados para algum lugar, é necessário
## configurar um exporter, como o exporter otlp
# config:
# exporters:
#   otlp:
#     endpoint: "<ALGUM BACKEND>"
# service:
#   pipelines:
#     traces:
#       exporters: [ otlp ]
#     metrics:
#       exporters: [ otlp ]
#     logs:
#       exporters: [ otlp ]
```

Para usar este `values.yaml` com o chart, salve-o no local de sua preferência e
execute o seguinte comando para instalar o chart:

```sh
helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <caminho do arquivo salvo>
```

Agora deverá haver uma instalação do Collector em Deployment em execução no
cluster, coletando métricas e eventos do cluster!
