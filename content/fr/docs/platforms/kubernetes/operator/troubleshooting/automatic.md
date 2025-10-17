---
title: Auto-instrumentation
cSpell:ignore: PYTHONPATH
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

Si vous utilisez la capacité de
l'[opérateur OpenTelemetry](/docs/platforms/kubernetes/operator) à injecter
[l'auto-instrumentation](/docs/platforms/kubernetes/operator/automatic) et que
vous ne voyez aucune trace ou métrique, suivez ces étapes de dépannage pour
comprendre ce qui se passe.

## Étapes de dépannage

### Vérifier l'état d'installation

Après avoir installé la ressource `Instrumentation`, assurez-vous qu'elle est
installée correctement en exécutant cette commande :

```shell
kubectl describe otelinst -n <namespace>
```

Où `<namespace>` est le namespace dans lequel la ressource `Instrumentation` est
déployée.

Votre sortie devrait ressembler à ceci :

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

### Vérifier les logs de l'opérateur OpenTelemetry

Vérifiez les erreurs dans les logs de l'opérateur OpenTelemetry en exécutant
cette commande :

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

Les logs ne devraient montrer aucune erreur liée aux erreurs
d'auto-instrumentation.

### Vérifier l'ordre de déploiement

Assurez-vous que l'ordre de déploiement est correct. La ressource
`Instrumentation` doit être déployée avant de déployer les ressources
`Deployment` correspondantes qui sont auto-instrumentées.

Considérez l'extrait d'annotation d'auto-instrumentation suivant :

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Lorsque le pod démarre, l'annotation indique à l'opérateur de chercher une
ressource `Instrumentation` dans le namespace du pod, et d'injecter
l'auto-instrumentation Python dans le pod. Il ajoute un
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
appelé `opentelemetry-auto-instrumentation` au pod de l'application, qui est
ensuite utilisé pour injecter l'auto-instrumentation dans le conteneur de l'app.

Ce que vous pouvez voir lorsque vous exécutez :

```shell
kubectl describe pod <your_pod_name> -n <namespace>
```

Où `<namespace>` est le namespace dans lequel votre pod est déployé. La sortie
résultante devrait ressembler à l'exemple suivant, qui montre à quoi la
spécification du pod peut ressembler après l'injection d'auto-instrumentation :

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
      OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED:  true
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

Si la ressource `Instrumentation` n'est pas présente au moment où le
`Deployment` est déployé, l'`init-container` ne peut pas être créé. Cela
signifie que si la ressource `Deployment` est déployée avant que vous déployiez
la ressource `Instrumentation`, l'auto-instrumentation échoue à s'initialiser.

Vérifiez que l'`init-container` `opentelemetry-auto-instrumentation` a démarré
correctement (ou a même démarré du tout), en exécutant la commande suivante :

```shell
kubectl get events -n <namespace>
```

Où `<namespace>` est le namespace dans lequel votre pod est déployé. La sortie
résultante devrait ressembler à l'exemple suivant :

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Si la sortie manque les entrées `Created` ou `Started` pour
`opentelemetry-auto-instrumentation`, il pourrait y avoir un problème avec votre
configuration d'auto-instrumentation. Cela peut être le résultat de l'un des
éléments suivants :

- La ressource `Instrumentation` n'a pas été installée ou n'a pas été installée
  correctement.
- La ressource `Instrumentation` a été installée après le déploiement de
  l'application.
- Il y a une erreur dans l'annotation d'auto-instrumentation, ou l'annotation
  est au mauvais endroit. Voir la section suivante.

Vous pourriez également vouloir vérifier la sortie de la commande events pour
toute erreur, car ces pourraient aider à pointer vers votre problème.

### Vérifier l'annotation d'auto-instrumentation

Considérez l'extrait d'annotation d'auto-instrumentation suivant :

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Si votre ressource `Deployment` est déployée dans un namespace appelé
`application` et que vous avez une ressource `Instrumentation` appelée
`my-instrumentation` qui est déployée dans un namespace appelé `opentelemetry`,
alors l'annotation ci-dessus ne fonctionnera pas.

Au lieu de cela, l'annotation devrait être :

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'opentelemetry/my-instrumentation'
```

Où `opentelemetry` est le namespace de la ressource `Instrumentation`, et
`my-instrumentation` est le nom de la ressource `Instrumentation`.

[Les valeurs possibles pour l'annotation peuvent être](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md?plain=1#L151-L156)
:

- "true" - injecter la ressource `OpenTelemetryCollector` du namespace.
- "sidecar-for-my-app" - nom de l'instance d'`OpenTelemetryCollector` dans le
  namespace actuel.
- "my-other-namespace/my-instrumentation" - nom et namespace de l'instance
  d'`OpenTelemetryCollector` dans un autre namespace.
- "false" - ne pas injecter

### Vérifier la configuration de l'auto-instrumentation

L'annotation d'auto-instrumentation pourrait ne pas avoir été ajoutée
correctement. Vérifiez ce qui suit :

- Auto-instrumentez-vous pour le bon langage ? Par exemple, avez-vous essayé d'
  auto-instrumenter une application Python en ajoutant une annotation
  d'auto-instrumentation JavaScript à la place ?
- Avez-vous mis l'annotation d'auto-instrumentation au bon endroit ? Lorsque
  vous définissez une ressource `Deployment`, il y a deux endroits où vous
  pourriez ajouter des annotations : `spec.metadata.annotations`, et
  `spec.template.metadata.annotations`. L'annotation d'auto-instrumentation doit
  être ajoutée à `spec.template.metadata.annotations`, sinon elle ne fonctionne
  pas.

### Vérifier la configuration du point de terminaison de l'auto-instrumentation

La configuration `spec.exporter.endpoint` dans la ressource `Instrumentation`
vous permet de définir la destination pour vos données de télémétrie. Si vous
l'omettez, elle sera par défaut à `http://localhost:4317`, ce qui fait que les
données n'iront nulle part.

Si vous envoyez votre télémétrie vers un [collecteur](/docs/collector/), la
valeur de `spec.exporter.endpoint` doit référencer le nom de votre collecteur
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

Par exemple : `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Où `otel-collector` est le nom du service Kubernetes OTel
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

De plus, si le collecteur fonctionne dans un namespace différent, vous devez
ajouter `opentelemetry.svc.cluster.local` au nom du service du collecteur, où
`opentelemetry` est le namespace dans lequel le collecteur réside. Cela peut
être n'importe quel namespace de votre choix.

Enfin, assurez-vous que vous utilisez le bon port du collecteur. Normalement,
vous pouvez choisir soit `4317` (gRPC) soit `4318` (HTTP) ; cependant, pour
[l'auto-instrumentation Python, vous ne pouvez utiliser que `4318`](/docs/platforms/kubernetes/operator/automatic/#python).

### Vérifier les sources de configuration

L'auto-instrumentation remplace actuellement `JAVA_TOOL_OPTIONS` de Java,
`PYTHONPATH` de Python, et `NODE_OPTIONS` de Node.js lorsqu'ils sont définis
dans une image Docker ou lorsqu'ils sont définis dans un `ConfigMap`. C'est un
problème connu, et par conséquent, ces méthodes de définition de ces variables
d'environnement devraient être évitées jusqu'à ce que le problème soit résolu.

Voir les problèmes de référence pour
[Java](https://github.com/open-telemetry/opentelemetry-operator/issues/1814),
[Python](https://github.com/open-telemetry/opentelemetry-operator/issues/1884),
et
[Node.js](https://github.com/open-telemetry/opentelemetry-operator/issues/1393).
