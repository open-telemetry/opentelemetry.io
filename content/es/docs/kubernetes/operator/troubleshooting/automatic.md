---
title: Auto-instrumentación
cSpell:ignore: PYTHONPATH
default_lang_commit: f9893e13ba9ea10f1b5bcecb52cdd3d907bf0fd9
---

Si estás utilizando la capacidad del [OpenTelemetry Operator](/docs/kubernetes/operator) para inyectar [auto-instrumentación](/docs/kubernetes/operator/automatic) y no ves ningún rastro o métrica, sigue estos pasos de solución de problemas para entender qué está pasando.

## Pasos de solución de problemas

### Verificar el estado de la instalación

Después de instalar el recurso `Instrumentation`, asegúrate de que esté instalado correctamente ejecutando este comando:

```shell
kubectl describe otelinst -n <namespace>
```

Donde `<namespace>` es el espacio de nombres en el que se despliega el recurso `Instrumentation`.

Tu salida debería verse así:

Your output should look like this:

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

### Verificar los registros del OpenTelemetry Operator

Verifica los registros del OpenTelemetry Operator en busca de errores ejecutando este comando:

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

Los registros no deben mostrar errores relacionados con errores de auto-instrumentación. 

### Verificar el orden de despliegue

 Asegúrate de que el orden de despliegue sea correcto.El recurso `Instrumentation` debe ser desplegado antes de desplegar los recursos `Deployment` correspondientes que son auto-instrumentados. Considera el siguiente fragmento de anotación de auto-instrumentación: 

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Cuando el pod se inicia, la anotación le dice al Operator que busque un recurso `Instrumentation` en el espacio de nombres del pod y que inyecte la auto-instrumentación de Python en el pod. Añade un [init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) llamado `opentelemetry-auto-instrumentation` al pod de la aplicación, que es luego usado para inyectar la auto-instrumentación en el contenedor de la aplicación.

Lo cual puedes ver cuando ejecutas:

```shell
kubectl describe pod <your_pod_name> -n <namespace>
```

Donde `<namespace>` es el espacio de nombres en el que se despliega tu pod. El resultado debería verse como el siguiente ejemplo, que muestra cómo podría verse la especificación del pod después de la inyección de auto-instrumentación:

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

Si el recurso `Instrumentation` no está presente en el momento en que se despliega el `Deployment`, no se puede crear el `init-container`. Esto significa que si el recurso `Deployment` se despliega antes de que despliegues el recurso `Instrumentation`, la auto-instrumentación no se inicializa. 

Verifica que el `init-container` `opentelemetry-auto-instrumentation` se haya iniciado correctamente (o si siquiera se ha iniciado) ejecutando el siguiente comando:

```shell
kubectl get events -n <namespace>
```

Donde `<namespace>` es el espacio de nombres en el que se despliega tu pod. El resultado debería parecerse al siguiente ejemplo:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Si la salida no incluye las entradas `Created` o `Started` para `opentelemetry-auto-instrumentation`, puede haber un problema con tu configuración de auto-instrumentación. Esto puede ser el resultado de cualquiera de las siguientes razones:

- El recurso `Instrumentation` no fue instalado o no fue instalado correctamente.

- El recurso `Instrumentation` se instaló después de que se desplegó la aplicación.

- Hay un error en la anotación de auto-instrumentación o la anotación está en el lugar incorrecto. Consulta la siguiente sección.

También es posible que desees verificar la salida del comando de eventos en busca de errores, ya que estos podrían ayudarte a identificar el problema.

### Verificar la anotación de auto-instrumentación

Considera el siguiente fragmento de anotación de auto-instrumentación:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Si tu recurso `Deployment` se despliega en un espacio de nombres llamado `application` y tienes un recurso `Instrumentation` llamado `my-instrumentation` que se despliega en un espacio de nombres llamado `opentelemetry`, entonces la anotación anterior no funcionará.

En su lugar, la anotación debería ser:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'opentelemetry/my-instrumentation'
```

Donde `opentelemetry` es el espacio de nombres del recurso `Instrumentation`, y `my-instrumentation` es el nombre del recurso `Instrumentation`.

[Los valores posibles para la anotación pueden ser](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md?plain=1#L151-L156)::

"true" - inyectar el recurso `OpenTelemetryCollector` desde el espacio de nombres.

"sidecar-for-my-app" - nombre de la instancia CR de `OpenTelemetryCollector` en el espacio de nombres actual.

"my-other-namespace/my-instrumentation" - nombre y espacio de nombres de la instancia CR de `OpenTelemetryCollector` en otro espacio de nombres.

"false" - no inyectar

### Verificar la configuración de auto-instrumentación

Es posible que la anotación de auto-instrumentación no se haya añadido correctamente. Verifica lo siguiente:

- ¿Estás auto-instrumentando para el lenguaje correcto? Por ejemplo, ¿intentaste auto-instrumentar una aplicación de Python añadiendo una anotación de auto-instrumentación de JavaScript en su lugar?

- ¿Pusiste la anotación de auto-instrumentación en el lugar correcto? Cuando defines un recurso `Deployment`, hay dos ubicaciones donde podrías añadir anotaciones: `spec.metadata.annotations` y `spec.template.metadata.annotations`. La anotación de auto-instrumentación necesita ser añadida a `spec.template.metadata.annotations`, de lo contrario no

### Verificar la configuración del endpoint de auto-instrumentación

La configuración `spec.exporter.endpoint` en el recurso `Instrumentation` te permite definir el destino para tus datos de telemetría. Si la omites, por defecto es `http://localhost:4317`, lo que hace que los datos se pierdan.

Si estás enviando tu telemetría a un [Collector](/docs/collector/), el valor de `spec.exporter.endpoint` debe hacer referencia al nombre de tu [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/) del Collector.

Por ejemplo: `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Donde `otel-collector` es el nombre del [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/) del Collector de OTel en Kubernetes.

Además, si el Collector está funcionando en un espacio de nombres diferente, debes añadir `opentelemetry.svc.cluster.local` al nombre del servicio del Collector, donde `opentelemetry` es el espacio de nombres en el que reside el Collector. Puede ser cualquier espacio de nombres que elijas.

Finalmente, asegúrate de que estás utilizando el puerto correcto del Collector. Normalmente, puedes elegir entre `4317` (gRPC) o `4318` (HTTP); sin embargo, para [auto-instrumentación de Python, solo puedes usar `4318`](/docs/kubernetes/operator/automatic/#python).

### Verificar las fuentes de configuración

La auto-instrumentación actualmente sobrescribe `JAVA_TOOL_OPTIONS` de Java, `PYTHONPATH` de Python y `NODE_OPTIONS` de Node.js cuando se configuran en una imagen de Docker o cuando se definen en un `ConfigMap`. Este es un problema conocido y, como resultado, estos métodos para configurar estas variables de entorno deben evitarse hasta que se resuelva el problema.

Consulta los problemas de referencia para [Java](https://github.com/open-telemetry/opentelemetry-operator/issues/1814), [Python](https://github.com/open-telemetry/opentelemetry-operator/issues/1884) y [Node.js](https://github.com/open-telemetry/opentelemetry-operator/issues/1393).

