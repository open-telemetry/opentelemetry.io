---
title: Componentes importantes para Kubernetes
linkTitle: Componentes
# prettier-ignore
cSpell:ignore: alertmanagers filelog horizontalpodautoscalers hostfs hostmetrics k8sattributes kubelet kubeletstats replicasets replicationcontrollers resourcequotas statefulsets varlibdockercontainers varlogpods
default_lang_commit: 30b7dbbdd94cec0b2a0c99317272b103315518bf
---

O [OpenTelemetry Collector](/docs/collector/) oferece suporte a muitos _receivers_ (receptores)
e _processors_ (processadores) diferentes para facilitar o monitoramento do Kubernetes. Esta seção
aborda os componentes mais importantes para coletar os dados do Kubernetes e enriquecê-los.

Componentes abordados nesta página:

- [Kubernetes Attributes Processor](#kubernetes-attributes-processor): adiciona
  metadados do Kubernetes à telemetria recebida da aplicação.
- [Kubeletstats Receiver](#kubeletstats-receiver): obtém métricas de nós, pods e
  contêineres a partir do servidor de API em um kubelet.
- [Filelog Receiver](#filelog-receiver): coleta logs do Kubernetes e logs de
  aplicação escritos em stdout/stderr.
- [Kubernetes Cluster Receiver](#kubernetes-cluster-receiver): coleta métricas e
  eventos de entidade a nível do cluster.
- [Kubernetes Objects Receiver](#kubernetes-objects-receiver): coleta objetos
  do servidor de API do Kubernetes, como por exemplo eventos.
- [Prometheus Receiver](#prometheus-receiver): recebe métricas no formato
  [Prometheus](https://prometheus.io/).
- [Host Metrics Receiver](#host-metrics-receiver): coleta métricas do _host_ dos
  nós do Kubernetes.

Para rastros, métricas ou logs de aplicação, recomendamos o
[OTLP receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver),
mas qualquer _receiver_ compatível com seus dados é apropriado.

## Kubernetes Attributes Processor

| Padrão de implantação | Utilizável |
| --------------------- | --------- |
| DaemonSet (agente)    | Sim       |
| Deployment (gateway)  | Sim       |
| Sidecar             | Não       |

O Kubernetes Attributes Processor descobre automaticamente os pods do Kubernetes,
extrai seus metadados e adiciona esses metadados aos rastros, métricas e logs como
_resource attributes_ (atributos de recurso).

**O Kubernetes Attributes Processor é um dos componentes mais importantes para
um Collector em execução no Kubernetes. Qualquer Collector que receba dados de
aplicação deve usá-lo.** Ao adicionar contexto do Kubernetes à sua telemetria,
o Kubernetes Attributes Processor permite correlacionar os rastros, métricas e logs 
da sua aplicação com a telemetria do Kubernetes, como métricas e rastros de pods.

O Kubernetes Attributes Processor usa a API do Kubernetes para descobrir todos
os pods em execução em um cluster e mantém um registro de seus endereços IP,
UIDs de pod e outros metadados relevantes. Por padrão, os dados que passam pelo
_processor_ são associados a um pod pelo endereço IP da requisição recebida, mas é
possível configurar outras regras. Como o _processor_ usa a API do Kubernetes,
ele requer permissões especiais (veja o exemplo abaixo). Caso estiver usando o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
é possível usar o
[preset `kubernetesAttributes`](/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset)
para começar.

Os seguintes atributos são adicionados por padrão:

- `k8s.namespace.name`
- `k8s.pod.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.deployment.name`
- `k8s.node.name`

O Kubernetes Attributes Processor também pode definir atributos de recurso
personalizados para rastros, métricas e logs usando as _labels_ e as anotações do
Kubernetes adicionados aos pods e namespaces.

```yaml
k8sattributes:
  auth_type: 'serviceAccount'
  extract:
    metadata: # extraído do pod
      - k8s.namespace.name
      - k8s.pod.name
      - k8s.pod.start_time
      - k8s.pod.uid
      - k8s.deployment.name
      - k8s.node.name
    annotations:
      # Extrai o valor de uma anotação de pod com a chave `annotation-one` e a insere como um atributo de recurso com a chave `a1`
      - tag_name: a1
        key: annotation-one
        from: pod
      # Extrai o valor de uma anotação de namespace com a chave `annotation-two` via regex e a insere como um atributo de recurso com a chave `a2`
      - tag_name: a2
        key: annotation-two
        regex: field=(?P<value>.+)
        from: namespace
    labels:
      # Extrai o valor de um label de namespace com a chave `label1` e o insere como um atributo de recurso com a chave `l1`
      - tag_name: l1
        key: label1
        from: namespace
      # Extrai o valor de um label de pod com a chave `label2` via regex e o insere como um atributo de recurso com a chave `l2`
      - tag_name: l2
        key: label2
        regex: field=(?P<value>.+)
        from: pod
  pod_association: # Como associar os dados a um pod (a ordem importa)
    - sources: # Primeiro, tente usar o valor do atributo de recurso k8s.pod.ip
        - from: resource_attribute
          name: k8s.pod.ip
    - sources: # Depois, tente usar o valor do atributo de recurso k8s.pod.uid
        - from: resource_attribute
          name: k8s.pod.uid
    - sources: # Se nenhum dos dois funcionar, use a conexão da requisição para obter o IP do pod.
        - from: connection
```

Também existem opções de configuração especiais para quando o Collector é
implantado como um DaemonSet (agente) ou como um Deployment (gateway) do
Kubernetes. Para detalhes, veja
[Cenários de Implantação](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor#deployment-scenarios).

Para detalhes de configuração do Kubernetes Attributes Processor, veja
[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor).

Como o _processor_ usa a API do Kubernetes, ele precisa das permissão correta para
funcionar adequadamente. Para a maioria dos casos de uso, é necessário conceder à _service account_ (conta de
serviço) que executa o Collector as seguintes permissões por meio de um
ClusterRole.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: collector
  namespace: <OTEL_COL_NAMESPACE>
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups:
      - ''
    resources:
      - 'pods'
      - 'namespaces'
    verbs:
      - 'get'
      - 'watch'
      - 'list'
  - apiGroups:
      - 'apps'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
  - apiGroups:
      - 'extensions'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: collector
    namespace: <OTEL_COL_NAMESPACE>
roleRef:
  kind: ClusterRole
  name: otel-collector
  apiGroup: rbac.authorization.k8s.io
```

## Kubeletstats Receiver

| Padrão de implantação | Utilizável                                                       |
| --------------------- | --------------------------------------------------------------- |
| DaemonSet (agente)    | Preferível                                                    |
| Deployment (gateway)  | Sim, mas coletará métricas somente do nó em que está implantado |
| Sidecar             | Não                                                             |

Cada nó do Kubernetes executa um kubelet que inclui um servidor de API. O
Kubeletstats Receiver se conecta a esse kubelet por meio do servidor de API para
coletar métricas sobre o nó e as cargas de trabalho em execução nele.

Existem diferentes métodos de autenticação, mas normalmente se usa uma conta de
serviço. A conta de serviço também precisará das permissões adequadas para obter
dados do Kubelet (veja abaixo). Caso estiver usando o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
é possível usar o
[preset `kubeletMetrics`](/docs/platforms/kubernetes/helm/collector/#kubelet-metrics-preset)
para começar.

Por padrão, as métricas são coletadas para pods e nós, mas é possível configurar
o _receiver_ para coletar também métricas de contêiner e de volume. O _receiver_
também permite configurar a frequência de coleta das métricas:

```yaml
receivers:
  kubeletstats:
    collection_interval: 10s
    auth_type: 'serviceAccount'
    endpoint: '${env:K8S_NODE_NAME}:10250'
    insecure_skip_verify: true
    metric_groups:
      - node
      - pod
      - container
```

Para detalhes específicos sobre quais métricas são coletadas, veja
[Métricas padrão](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver/documentation.md).
Para detalhes de configuração específicos, veja
[Kubeletstats Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver).

Como o _processor_ usa a API do Kubernetes, ele precisa da permissão correta para
funcionar. Para a maioria dos casos de uso, é necessário conceder à conta de
serviço que executa o Collector as seguintes permissões por meio de um
ClusterRole.

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups: ['']
    resources: ['nodes/stats']
    verbs: ['get', 'watch', 'list']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector
    namespace: default
```

## Filelog Receiver

| Padrão de implantação | Utilizável                                                   |
| --------------------- | ----------------------------------------------------------- |
| DaemonSet (agente)    | Preferível                                                |
| Deployment (gateway)  | Sim, mas coletará logs somente do nó em que está implantado |
| Sidecar             | Sim, mas isso seria considerado uma configuração avançada   |

O Filelog Receiver acompanha (_tail_) e analisa (_parse_) logs a partir de arquivos. Embora não
seja um receiver específico para Kubernetes, ainda é a solução de fato para
coletar qualquer log do Kubernetes.

O Filelog Receiver é composto por Operadores encadeados entre si para processar
um log. Cada Operador tem uma responsabilidade simples, como analisar um
_timestamp_ ou um JSON. Configurar um Filelog Receiver não é trivial. Caso esteja usando o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
é possível usar o
[preset `logsCollection`](/docs/platforms/kubernetes/helm/collector/#logs-collection-preset)
para começar.

Como os logs do Kubernetes normalmente seguem um conjunto de formatos padrão,
uma configuração típica de Filelog Receiver para Kubernetes se parece com o seguinte:

```yaml
filelog:
  include:
    - /var/log/pods/*/*/*.log
  exclude:
    # Exclui logs de todos os contêineres chamados otel-collector
    - /var/log/pods/*/otel-collector/*.log
  start_at: end
  include_file_path: true
  include_file_name: false
  operators:
    # analisa os logs do contêiner
    - type: container
      id: container-parser
```

Para detalhes de configuração do Filelog Receiver, veja
[Filelog Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver).

Além da configuração do Filelog Receiver, sua instalação do OpenTelemetry
Collector no Kubernetes precisará de acesso aos logs que deseja coletar.
Normalmente isso significa adicionar alguns _volumes_ e _volumeMounts_ ao
manifesto do seu Collector:

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts: 
            ...
            # Monta os volumes no contêiner do Collector
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            ...
      volumes:
        ...
        # Normalmente o Collector precisa de acesso aos logs de pods e de contêineres
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        ...
```

## Kubernetes Cluster Receiver

| Padrão de implantação | Utilizável                                                |
| --------------------- | -------------------------------------------------------- |
| DaemonSet (agente)    | Sim, mas resultará em dados duplicados                   |
| Deployment (gateway)  | Sim, mas mais de uma réplica resulta em dados duplicados |
| Sidecar             | Não                                                      |

O Kubernetes Cluster Receiver coleta métricas e eventos de entidade sobre o
cluster como um todo, usando o servidor de API do Kubernetes. Use esse _receiver_
para responder perguntas sobre fases de pods, condições de nós e outras
questões a nível de cluster. Como o _receiver_ reúne telemetria para o cluster
como um todo, basta uma instância do _receiver_ em todo o cluster para coletar
todos os dados.

Existem diferentes métodos de autenticação, mas normalmente se usa uma conta de
serviço. A conta de serviço também precisa das permissões adequadas para obter
dados do servidor de API do Kubernetes (veja abaixo). Caso esteja usando o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
é possível usar o
[preset `clusterMetrics`](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset)
para começar.

Para condições de nós, o _receiver_ coleta apenas `Ready` por padrão, mas ele pode ser
configurado para coletar mais condições. O _receiver_ também pode ser configurado para
reportar um conjunto de recursos alocáveis, como `cpu` e `memory`:

```yaml
k8s_cluster:
  auth_type: serviceAccount
  node_conditions_to_report:
    - Ready
    - MemoryPressure
  allocatable_types_to_report:
    - cpu
    - memory
```

Para saber mais sobre as métricas coletadas, veja
[Métricas padrão](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/k8sclusterreceiver/documentation.md).
Para detalhes de configuração, veja
[Kubernetes Cluster Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver).

Como o _processor_ usa a API do Kubernetes, ele precisa da permissão correta para
funcionar. Para a maioria dos casos de uso, é necessário conceder à conta de
serviço que executa o Collector as seguintes permissões por meio de um
ClusterRole.

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - events
      - namespaces
      - namespaces/status
      - nodes
      - nodes/spec
      - pods
      - pods/status
      - replicationcontrollers
      - replicationcontrollers/status
      - resourcequotas
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - apps
    resources:
      - daemonsets
      - deployments
      - replicasets
      - statefulsets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - daemonsets
      - deployments
      - replicasets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - batch
    resources:
      - jobs
      - cronjobs
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - autoscaling
    resources:
      - horizontalpodautoscalers
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
```

## Kubernetes Objects Receiver

| Padrão de implantação | Utilizável                                                |
| --------------------- | -------------------------------------------------------- |
| DaemonSet (agente)    | Sim, mas resultará em dados duplicados                   |
| Deployment (gateway)  | Sim, mas mais de uma réplica resulta em dados duplicados |
| Sidecar             | Não                                                      |

O Kubernetes Objects Receiver coleta, por _pulling_ ou por _watching_,
objetos do servidor de API do Kubernetes. O caso de uso mais comum para esse
_receiver_ é observar (_watching_) eventos do Kubernetes, mas ele pode ser usado
para coletar qualquer tipo de objeto do Kubernetes. Como o _receiver_ reúne
telemetria para o cluster como um todo, basta uma instância do _receiver_ em todo
o cluster para coletar todos os dados.

Atualmente, apenas uma conta de serviço pode ser usada para autenticação. A
conta de serviço também precisa das permissões adequadas para obter dados do
servidor de API do Kubernetes (veja abaixo). Caso estiver usando o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/)
para ingerir eventos, é possível usar o
[preset `kubernetesEvents`](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset)
para começar.

Para objetos configurados para _pulling_, o _receiver_ usa a API do Kubernetes
para listar periodicamente todos os objetos no cluster. Cada objeto é convertido
em seu próprio log. Para objetos configurados para _watching_, o _receiver_ cria
um _stream_ com a API do Kubernetes, que recebe atualizações conforme os objetos
mudam.

Para ver quais objetos estão disponíveis para coleta no seu cluster, execute
`kubectl api-resources`:

<!-- cspell:disable -->

```console
kubectl api-resources
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
events                            ev           v1                                     true         Event
limitranges                       limits       v1                                     true         LimitRange
namespaces                        ns           v1                                     false        Namespace
nodes                             no           v1                                     false        Node
persistentvolumeclaims            pvc          v1                                     true         PersistentVolumeClaim
persistentvolumes                 pv           v1                                     false        PersistentVolume
pods                              po           v1                                     true         Pod
podtemplates                                   v1                                     true         PodTemplate
replicationcontrollers            rc           v1                                     true         ReplicationController
resourcequotas                    quota        v1                                     true         ResourceQuota
secrets                                        v1                                     true         Secret
serviceaccounts                   sa           v1                                     true         ServiceAccount
services                          svc          v1                                     true         Service
mutatingwebhookconfigurations                  admissionregistration.k8s.io/v1        false        MutatingWebhookConfiguration
validatingwebhookconfigurations                admissionregistration.k8s.io/v1        false        ValidatingWebhookConfiguration
customresourcedefinitions         crd,crds     apiextensions.k8s.io/v1                false        CustomResourceDefinition
apiservices                                    apiregistration.k8s.io/v1              false        APIService
controllerrevisions                            apps/v1                                true         ControllerRevision
daemonsets                        ds           apps/v1                                true         DaemonSet
deployments                       deploy       apps/v1                                true         Deployment
replicasets                       rs           apps/v1                                true         ReplicaSet
statefulsets                      sts          apps/v1                                true         StatefulSet
tokenreviews                                   authentication.k8s.io/v1               false        TokenReview
localsubjectaccessreviews                      authorization.k8s.io/v1                true         LocalSubjectAccessReview
selfsubjectaccessreviews                       authorization.k8s.io/v1                false        SelfSubjectAccessReview
selfsubjectrulesreviews                        authorization.k8s.io/v1                false        SelfSubjectRulesReview
subjectaccessreviews                           authorization.k8s.io/v1                false        SubjectAccessReview
horizontalpodautoscalers          hpa          autoscaling/v2                         true         HorizontalPodAutoscaler
cronjobs                          cj           batch/v1                               true         CronJob
jobs                                           batch/v1                               true         Job
certificatesigningrequests        csr          certificates.k8s.io/v1                 false        CertificateSigningRequest
leases                                         coordination.k8s.io/v1                 true         Lease
endpointslices                                 discovery.k8s.io/v1                    true         EndpointSlice
events                            ev           events.k8s.io/v1                       true         Event
flowschemas                                    flowcontrol.apiserver.k8s.io/v1beta2   false        FlowSchema
prioritylevelconfigurations                    flowcontrol.apiserver.k8s.io/v1beta2   false        PriorityLevelConfiguration
ingressclasses                                 networking.k8s.io/v1                   false        IngressClass
ingresses                         ing          networking.k8s.io/v1                   true         Ingress
networkpolicies                   netpol       networking.k8s.io/v1                   true         NetworkPolicy
runtimeclasses                                 node.k8s.io/v1                         false        RuntimeClass
poddisruptionbudgets              pdb          policy/v1                              true         PodDisruptionBudget
clusterrolebindings                            rbac.authorization.k8s.io/v1           false        ClusterRoleBinding
clusterroles                                   rbac.authorization.k8s.io/v1           false        ClusterRole
rolebindings                                   rbac.authorization.k8s.io/v1           true         RoleBinding
roles                                          rbac.authorization.k8s.io/v1           true         Role
priorityclasses                   pc           scheduling.k8s.io/v1                   false        PriorityClass
csidrivers                                     storage.k8s.io/v1                      false        CSIDriver
csinodes                                       storage.k8s.io/v1                      false        CSINode
csistoragecapacities                           storage.k8s.io/v1                      true         CSIStorageCapacity
storageclasses                    sc           storage.k8s.io/v1                      false        StorageClass
volumeattachments                              storage.k8s.io/v1                      false        VolumeAttachment
```

<!-- cspell:enable -->

Para detalhes específicos de configuração, veja
[Kubernetes Objects Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver).

Como o _processor_ usa a API do Kubernetes, ele precisa da permissão correta para
funcionar. Como contas de serviço são a única opção de autenticação, é
necessário conceder à conta de serviço o acesso adequado. Para cada objeto que
quiser coletar, é preciso garantir que o nome dele esteja adicionado ao _cluster
role_. Por exemplo, para coletar pods, o _cluster role_ ficaria assim:

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - pods
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
```

## Prometheus Receiver

| Padrão de implantação | Utilizável |
| --------------------- | --------- |
| DaemonSet (agente)    | Sim       |
| Deployment (gateway)  | Sim       |
| Sidecar             | Não       |

O Prometheus é um formato de métricas comum tanto para o Kubernetes quanto para
serviços em execução nele. O _receiver_ do Prometheus é um substituto mínimo para a
coleta dessas métricas. Ele suporta o conjunto completo de
[opções do `scrape_config`](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)
do Prometheus.

Existem alguns recursos avançados do Prometheus que o _receiver_ não suporta. O _receiver_ retorna um erro se o YAML/código de configuração contiver
algum dos seguintes itens:

- `alert_config.alertmanagers`
- `alert_config.relabel_configs`
- `remote_read`
- `remote_write`
- `rule_files`

Para detalhes de configuração específicos, veja
[Prometheus Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver).

O Prometheus _receiver_ é
[_Stateful_](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/standard-warnings.md#statefulness),
o que significa que existem detalhes importantes a considerar ao usá-lo:

- O Collector não consegue escalar automaticamente o processo de _scraping_
  quando múltiplas réplicas do Collector são executadas.
- Ao executar múltiplas réplicas do Collector com a mesma configuração, ele fará o
  _scraping_ dos destinos (_targets_) múltiplas vezes.
- Os usuários precisam configurar cada réplica com uma configuração de _scraping_
  diferente caso queiram fazer o particionamento (_sharding_) manual do processo de
  _scraping_.

Para facilitar a configuração do Prometheus _receiver_, o OpenTelemetry Operator
inclui um componente opcional chamado
[Target Allocator](/docs/platforms/kubernetes/operator/target-allocator). Esse
componente pode ser usado para informar a um Collector quais _endpoints_ do
Prometheus ele deve fazer o _scraping_.

Para mais informações sobre o design do _receiver_, veja
[Design](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/DESIGN.md).

## Host Metrics Receiver

| Padrão de implantação | Utilizável                                                     |
| --------------------- | ------------------------------------------------------------- |
| DaemonSet (agente)    | Preferível                                                  |
| Deployment (gateway)  | Sim, mas coleta métricas somente do nó em que está implantado |
| _Sidecar_             | Não                                                           |

O Host Metrics Receiver coleta métricas de um host usando diversos _scrapers_.
Há alguma sobreposição com o [Kubeletstats Receiver](#kubeletstats-receiver),
então, ao usar os dois, pode valer a pena desabilitar essas métricas duplicadas.

No Kubernetes, o _receiver_ precisa de acesso ao volume `hostfs` para funcionar
corretamente. Caso estiver usando o
[Helm chart do OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
é possível usar o
[preset `hostMetrics`](/docs/platforms/kubernetes/helm/collector/#host-metrics-preset)
para começar.

Os _scrapers_ disponíveis são:

| _Scraper_  | SOs com suporte         | Descrição                                                 |
| ---------- | ----------------------- | --------------------------------------------------------- |
| cpu        | Todos, exceto macOS[^1] | Métricas de utilização de CPU                             |
| disk       | Todos, exceto macOS[^1] | Métricas de E/S de disco                                  |
| load       | Todos                   | Métricas de carga de CPU                                  |
| filesystem | Todos                   | Métricas de utilização do sistema de arquivos             |
| memory     | Todos                   | Métricas de utilização de memória                         |
| network    | Todos                   | Métricas de E/S de interface de rede e de conexão TCP     |
| paging     | Todos                   | Métricas de utilização e E/S de _paging_/espaço de _swap_ |
| processes  | Linux, macOS            | Métricas de contagem de processos                         |
| process    | Linux, macOS, Windows   | Métricas de CPU, memória e E/S de disco por processo      |

[^1]:
    Sem suporte no macOS quando compilado sem cgo, que é o padrão para as
    imagens publicadas pelo Collector SIG.

Para detalhes específicos sobre quais métricas são coletadas e detalhes de
configuração específicos, veja
[Host Metrics Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver).

Caso precisar configurar o componente manualmente, não se esqueça de montar o volume `hostfs` para coletar as métricas do nó, e não do contêiner.

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts:
            ...
            - name: hostfs
              mountPath: /hostfs
              readOnly: true
              mountPropagation: HostToContainer
      volumes:
        ...
        - name: hostfs
          hostPath:
            path: /
      ...
```

e então configure o Host Metrics Receiver para usar o `volumeMount`:

```yaml
receivers:
  host_metrics:
    root_path: /hostfs
    collection_interval: 10s
    scrapers:
      cpu:
      load:
      memory:
      disk:
      filesystem:
      network:
```

Para mais detalhes sobre como usar o _receiver_ dentro de um contêiner, veja
[Coletando métricas de host de dentro de um contêiner (somente Linux)](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver#collecting-host-metrics-from-inside-a-container-linux-only).
