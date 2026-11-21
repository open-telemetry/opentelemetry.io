---
title: Instrumentação automática
cSpell:ignore: PYTHONPATH
default_lang_commit: 48d3ff356dc39a3b1323637f3163d435dc751228
---

Se você estiver usando o recurso do
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator) para injetar a
[instrumentação automática](/docs/platforms/kubernetes/operator/automatic) e não
estiver vendo rastros (_traces_) nem métricas, siga estas etapas de solução de
problemas para entender o que está acontecendo.

## Etapas de solução de problemas {#troubleshooting-steps}

### Verificar o status da instalação {#check-installation-status}

Depois de instalar o recurso `Instrumentation`, verifique se ele foi instalado
corretamente executando este comando:

```shell
kubectl describe otelinst -n <namespace>
```

Em que `<namespace>` é o namespace no qual o recurso `Instrumentation` está
implantado.

A saída deve ser semelhante a esta:

```yaml
Name:         python-instrumentation
Namespace:    application
Labels:       app.kubernetes.io/managed-by=opentelemetry-operator
Annotations:  instrumentation.opentelemetry.io/default-auto-instrumentation-apache-httpd-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-apache-httpd:1.0.3
             instrumentation.opentelemetry.io/default-auto-instrumentation-dotnet-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-dotnet:0.7.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-go-image:
               ghcr.io/open-telemetry/opentelemetry-go-instrumentation/autoinstrumentation-go:v0.2.1-alpha
             instrumentation.opentelemetry.io/default-auto-instrumentation-java-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:1.26.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-nodejs-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:0.40.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-python-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
API Version:  opentelemetry.io/v1alpha1
Kind:         Instrumentation
Metadata:
 Creation Timestamp:  2023-07-28T03:42:12Z
 Generation:          1
 Resource Version:    3385
 UID:                 646661d5-a8fc-4b64-80b7-8587c9865f53
Spec:
...
 Exporter:
   Endpoint:  http://otel-collector-collector.opentelemetry.svc.cluster.local:4318
...
 Propagators:
   tracecontext
   baggage
 Python:
   Image:  ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
   Resource Requirements:
     Limits:
       Cpu:     500m
       Memory:  32Mi
     Requests:
       Cpu:     50m
       Memory:  32Mi
 Resource:
 Sampler:
Events:  <none>
```

### Verificar os logs do OpenTelemetry Operator {#check-the-opentelemetry-operator-logs}

Verifique se há erros nos logs do OpenTelemetry Operator executando este
comando:

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

Os logs não devem mostrar erros relacionados à instrumentação automática.

### Verificar a ordem de implantação {#check-deployment-order}

Certifique-se de que a ordem de implantação está correta. O recurso
`Instrumentation` deve ser implantado antes dos recursos `Deployment`
correspondentes que recebem instrumentação automática.

Considere o seguinte trecho de anotação de instrumentação automática:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Quando o pod é iniciado, a anotação informa ao OpenTelemetry Operator para
procurar um recurso `Instrumentation` no namespace do pod e injetar
instrumentação automática de Python nele. O OpenTelemetry Operator adiciona um
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
chamado `opentelemetry-auto-instrumentation` ao pod da aplicação, que é usado
para injetar a instrumentação automática no container da aplicação.

Você pode conferir isso executando:

```shell
kubectl describe pod <your_pod_name> -n <namespace>
```

Em que `<namespace>` é o namespace no qual seu pod está implantado. A saída
resultante deve ser semelhante ao exemplo a seguir, que mostra como pode ficar a
especificação do pod após a injeção da instrumentação automática:

```text
Name:             py-otel-server-f89fdbc4f-mtsps
Namespace:        opentelemetry
Priority:         0
Service Account:  default
Node:             otel-target-allocator-talk-control-plane/172.24.0.2
Start Time:       Mon, 15 Jul 2024 17:23:45 -0400
Labels:           app=my-app
                  app.kubernetes.io/name=py-otel-server
                  pod-template-hash=f89fdbc4f
Annotations:      instrumentation.opentelemetry.io/inject-python: true
Status:           Running
IP:               10.244.0.10
IPs:
  IP:           10.244.0.10
Controlled By:  ReplicaSet/py-otel-server-f89fdbc4f
Init Containers:
  opentelemetry-auto-instrumentation-python:
    Container ID:  containerd://20ecf8766247e6043fcad46544dba08c3ef534ee29783ca552d2cf758a5e3868
    Image:         ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0
    Image ID:      ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python@sha256:3ed1122e10375d527d84c826728f75322d614dfeed7c3a8d2edd0d391d0e7973
    Port:          <none>
    Host Port:     <none>
    Command:
      cp
      -r
      /autoinstrumentation/.
      /otel-auto-instrumentation-python
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Mon, 15 Jul 2024 17:23:51 -0400
      Finished:     Mon, 15 Jul 2024 17:23:51 -0400
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  32Mi
    Requests:
      cpu:        50m
      memory:     32Mi
    Environment:  <none>
    Mounts:
      /otel-auto-instrumentation-python from opentelemetry-auto-instrumentation-python (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-x2nmj (ro)
Containers:
  py-otel-server:
    Container ID:   containerd://95fb6d06b08ead768f380be2539a93955251be6191fa74fa2e6e5616036a8f25
    Image:          otel-target-allocator-talk:0.1.0-py-otel-server
    Image ID:       docker.io/library/import-2024-07-15@sha256:a2ed39e9a39ca090fedbcbd474c43bac4f8c854336a8500e874bd5b577e37c25
    Port:           8082/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Mon, 15 Jul 2024 17:23:52 -0400
    Ready:          True
    Restart Count:  0
    Environment:
      OTEL_NODE_IP:                                       (v1:status.hostIP)
      OTEL_POD_IP:                                        (v1:status.podIP)
      OTEL_METRICS_EXPORTER:                             console,otlp_proto_http
      OTEL_LOGS_EXPORTER:                                otlp_proto_http
      PYTHONPATH:                                        /otel-auto-instrumentation-python/opentelemetry/instrumentation/auto_instrumentation:/otel-auto-instrumentation-python
      OTEL_TRACES_EXPORTER:                              otlp
      OTEL_EXPORTER_OTLP_TRACES_PROTOCOL:                http/protobuf
      OTEL_EXPORTER_OTLP_METRICS_PROTOCOL:               http/protobuf
      OTEL_SERVICE_NAME:                                 py-otel-server
      OTEL_EXPORTER_OTLP_ENDPOINT:                       http://otelcol-collector.opentelemetry.svc.cluster.local:4318
      OTEL_RESOURCE_ATTRIBUTES_POD_NAME:                 py-otel-server-f89fdbc4f-mtsps (v1:metadata.name)
      OTEL_RESOURCE_ATTRIBUTES_NODE_NAME:                 (v1:spec.nodeName)
      OTEL_PROPAGATORS:                                  tracecontext,baggage
      OTEL_RESOURCE_ATTRIBUTES:                          service.name=py-otel-server,service.version=0.1.0,k8s.container.name=py-otel-server,k8s.deployment.name=py-otel-server,k8s.namespace.name=opentelemetry,k8s.node.name=$(OTEL_RESOURCE_ATTRIBUTES_NODE_NAME),k8s.pod.name=$(OTEL_RESOURCE_ATTRIBUTES_POD_NAME),k8s.replicaset.name=py-otel-server-f89fdbc4f,service.instance.id=opentelemetry.$(OTEL_RESOURCE_ATTRIBUTES_POD_NAME).py-otel-server
    Mounts:
      /otel-auto-instrumentation-python from opentelemetry-auto-instrumentation-python (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-x2nmj (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  kube-api-access-x2nmj:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
  opentelemetry-auto-instrumentation-python:
    Type:        EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:   200Mi
QoS Class:       Burstable
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  99s   default-scheduler  Successfully assigned opentelemetry/py-otel-server-f89fdbc4f-mtsps to otel-target-allocator-talk-control-plane
  Normal  Pulling    99s   kubelet            Pulling image "ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0"
  Normal  Pulled     93s   kubelet            Successfully pulled image "ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0" in 288.756166ms (5.603779501s including waiting)
  Normal  Created    93s   kubelet            Created container opentelemetry-auto-instrumentation-python
  Normal  Started    93s   kubelet            Started container opentelemetry-auto-instrumentation-python
  Normal  Pulled     92s   kubelet            Container image "otel-target-allocator-talk:0.1.0-py-otel-server" already present on machine
  Normal  Created    92s   kubelet            Created container py-otel-server
  Normal  Started    92s   kubelet            Started container py-otel-server
```

Se o recurso `Instrumentation` não estiver presente quando o recurso
`Deployment` for implantado, o init-container não poderá ser criado. Isso
significa que, se o recurso `Deployment` for implantado antes do recurso
`Instrumentation`, a instrumentação automática não será inicializada.

Verifique se o `init-container` `opentelemetry-auto-instrumentation` foi
iniciado corretamente (ou se chegou a ser iniciado) executando:

```shell
kubectl get events -n <namespace>
```

Em que `<namespace>` é o namespace no qual seu pod está implantado. A saída
resultante deve ser semelhante a este exemplo:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Se a saída não tiver entradas `Created` ou `Started` para
`opentelemetry-auto-instrumentation`, pode haver um problema na sua configuração
da instrumentação automática. Isso pode ocorrer por um dos seguintes motivos:

- O recurso `Instrumentation` não foi instalado ou não foi instalado
  corretamente.
- O recurso `Instrumentation` foi instalado depois que a aplicação foi
  implantada.
- Há um erro na anotação de instrumentação automática ou ela está no local
  errado. Consulte a próxima seção.

Também pode ser útil verificar se há erros na saída do comando de eventos, pois
eles podem ajudar a identificar o problema.

### Verificar a anotação de instrumentação automática {#check-the-auto-instrumentation-annotation}

Considere o seguinte trecho de anotação de instrumentação automática:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Se o seu recurso `Deployment` estiver implantado em um namespace chamado
`application` e se você tiver um recurso `Instrumentation` chamado
`my-instrumentation` implantado em um namespace chamado `opentelemetry`, a
anotação acima não funcionará.

Nesse caso, a anotação deve ser:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'opentelemetry/my-instrumentation'
```

Em que `opentelemetry` é o namespace do recurso `Instrumentation` e
`my-instrumentation` é o nome desse recurso.

[Os valores possíveis para a anotação são](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/collector/sidecar-injection.md?plain=1#L54-L59):

- "true" — injeta o recurso `OpenTelemetryCollector` do namespace.
- "sidecar-for-my-app" — nome da instância do recurso personalizado (CR)
  `OpenTelemetryCollector` no namespace atual.
- "my-other-namespace/my-instrumentation" — nome e namespace da instância do CR
  `OpenTelemetryCollector` em outro namespace.
- "false" — não injeta.

### Verificar a configuração da instrumentação automática {#check-the-auto-instrumentation-configuration}

Talvez a anotação de instrumentação automática não tenha sido adicionada
corretamente. Verifique o seguinte:

- Você está usando a instrumentação automática para a linguagem correta? Por
  exemplo, você tentou instrumentar automaticamente uma aplicação Python
  adicionando uma anotação de instrumentação automática de JavaScript?
- Você colocou a anotação de instrumentação automática no local correto? Ao
  definir um recurso `Deployment`, há dois locais onde você pode adicionar
  anotações: `spec.metadata.annotations` e `spec.template.metadata.annotations`.
  A anotação de instrumentação automática deve ser adicionada a
  `spec.template.metadata.annotations`; caso contrário, ela não funcionará.

### Verificar a configuração do endpoint da instrumentação automática {#check-auto-instrumentation-endpoint-configuration}

A configuração `spec.exporter.endpoint` no recurso `Instrumentation` permite
definir o destino dos dados de telemetria. Se ela for omitida, o valor padrão é
`http://localhost:4317`, o que faz com que os dados sejam descartados.

Se você estiver enviando dados para um [Collector](/docs/collector/), o valor de
`spec.exporter.endpoint` deve fazer referência ao nome do
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/) do
seu Collector.

Por exemplo: `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Nesse exemplo, `otel-collector` é o nome do
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/) do
Collector OTel no Kubernetes.

Além disso, se o Collector estiver em outro namespace, você deve acrescentar
`opentelemetry.svc.cluster.local` ao nome do serviço do Collector, em que
`opentelemetry` é o namespace no qual o Collector está. Você pode escolher
qualquer namespace.

Por fim, certifique-se de usar a porta correta do Collector. Normalmente, você
pode escolher `4317` (gRPC) ou `4318` (HTTP); no entanto, para a
[instrumentação automática de Python, você só pode usar a 4318](/docs/platforms/kubernetes/operator/automatic/#python).

### Verificar as fontes de configuração {#check-configuration-sources}

Atualmente, a instrumentação automática substitui `JAVA_TOOL_OPTIONS` do Java,
`PYTHONPATH` do Python e `NODE_OPTIONS` do Node.js quando essas variáveis são
definidas em uma imagem Docker ou em um `ConfigMap`. Esse é um problema
conhecido. Portanto, evite definir essas variáveis de ambiente dessa forma até
que o problema seja resolvido.

Consulte as issues de referência para
[Java](https://github.com/open-telemetry/opentelemetry-operator/issues/1814),
[Python](https://github.com/open-telemetry/opentelemetry-operator/issues/1884) e
[Node.js](https://github.com/open-telemetry/opentelemetry-operator/issues/1393).
