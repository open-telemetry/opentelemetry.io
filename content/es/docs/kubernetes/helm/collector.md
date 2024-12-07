---
title: Gráfico de coleccionista de OpenTelemetry
linkTitle: Gráfico de recopiladores
default_lang_commit: f9893e13ba9ea10f1b5bcecb52cdd3d907bf0fd9
# prettier-ignore
cSpell:ignore: debugexporter filelogio filelogreceiver hostmetricsreceiver kubelet kubeletstats kubeletstatsreceiver otlphttp sattributesprocessor sclusterreceiver sobjectsreceiver statefulset
---

## Introducción

El [OpenTelemetry Collector](/docs/collector) es una herramienta importante para
supervisar un clúster de Kubernetes y todos los servicios que se encuentran en
él. Para facilitar la instalación y la gestión de una implementación de
recopiladores en una red Kubernetes la comunidad OpenTelemetry creó el
[OpenTelemetry Collector Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).
Este gráfico de timón se puede utilizar para instalar un recopilador como
Deployment, Daemonset, o Statefulset.

### Instalación del gráfico

Para instalar el gráfico con el nombre de la versión
`my-opentelemetry-collector`, ejecute el comandos siguientes:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector \
   --set image.repository="otel/opentelemetry-collector-k8s" \
   --set mode=<daemonset|deployment|statefulset> \
```

### Configuración

El gráfico de recopiladores de OpenTelemetry requiere que mode esté establecido. mode puede ser daemonset, deployment o statefulset dependiendo de qué tipo de La implementación de Kubernetes requiere su caso de uso.

Cuando se instala, el gráfico proporciona algunos componentes de recopilador predeterminados para obtener Empezó. De forma predeterminada, la configuración del recopilador tendrá el siguiente aspecto:

```yaml
exporters:
  # NOTA: Antes de v0.86.0, use el registro(login) en lugar de la depuración(debug).
  debug: {}
extensions:
  health_check: {}
processors:
  batch: {}
  memory_limiter:
    check_interval: 5s
    limit_percentage: 80
    spike_limit_percentage: 25
receivers:
  jaeger:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:14250
      thrift_compact:
        endpoint: ${env:MY_POD_IP}:6831
      thrift_http:
        endpoint: ${env:MY_POD_IP}:14268
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: opentelemetry-collector
          scrape_interval: 10s
          static_configs:
            - targets:
                - ${env:MY_POD_IP}:8888
  zipkin:
    endpoint: ${env:MY_POD_IP}:9411
service:
  extensions:
    - health_check
  pipelines:
    logs:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
    metrics:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - prometheus
    traces:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - jaeger
        - zipkin
  telemetry:
    metrics:
      address: ${env:MY_POD_IP}:8888
```

El gráfico también habilitará puertos basados en los receptores predeterminados. Predeterminado La configuración se puede eliminar estableciendo el valor en
`null` en su `values.yaml`. Los puertos también se pueden deshabilitar en
`values.yaml`.

Puede agregar/modificar cualquier parte de la configuración utilizando la sección  `config` en Tus `values.yaml`. Al cambiar una canalización, debe enumerar explícitamente todas las componentes que están en la canalización, incluidos los componentes predeterminados.

Por ejemplo, para deshabilitar las métricas y las canalizaciones de registro y los receptores no superiores:

```yaml
config:
  receivers:
    jaeger: null
    prometheus: null
    zipkin: null
  service:
    pipelines:
      traces:
        receivers:
          - otlp
      metrics: null
      logs: null
ports:
  jaeger-compact:
    enabled: false
  jaeger-thrift:
    enabled: false
  jaeger-grpc:
    enabled: false
  zipkin:
    enabled: false
```

Todas las opciones de configuración (con comentarios) disponibles en el gráfico pueden ser visto en su
[values.yaml file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/values.yaml).

### Ajustes preestablecidos

Muchos de los componentes importantes que el Colector de telemetría OpenTelemetry utiliza para monitorizar Kubernetes requiere una configuración especial en la propia implementación de Kubernetes del Coleccionista. Para facilitar el uso de estos componentes, el Colector de telemetría abierta El gráfico viene con algunos ajustes preestablecidos que, cuando están habilitados, manejan la configuración compleja para estos importantes componentes.

Los ajustes preestablecidos deben utilizarse como punto de partida. Configuran básico, pero rico, funcionalidad para sus componentes relacionados. Si su caso de uso requiere extra configuración de estos componentes se recomienda NO utilizar el ajuste preestablecido y en su lugar, configure manualmente el componente y cualquier cosa que requiera (volúmenes, RBAC, etc.).

#### Configuración preestablecida de la colección de registros

El Colector de telemetría OpenTelemetry se puede utilizar para recopilar los registros enviados a la salida estándar por contenedores Kubernetes.

Esta característica está deshabilitada de forma predeterminada. Tiene los siguientes requisitos en orden Para habilitar de forma segura:

- Requiere el
  [Filelog receiver](/docs/kubernetes/collector/components/#filelog-receiver)
  incluidos en la imagen del Coleccionista, como el
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Aunque no es un requisito estricto, se recomienda que este ajuste preestablecido se utilice con `mode=daemonset`. El `filelogreceiver`  solo podrá recopilar registros en el nodo en el que se ejecuta el recopilador y varios recopiladores configurados en el El mismo nodo producirá datos duplicados

Para habilitar esta característica, establezca la propiedad
`presets.logsCollection.enabled` en `true`. Cuando está habilitado, el gráfico agregará un `filelogreceiver` a los `logs` tubería.  Este receptor está configurado para leer los archivos donde Kubernetes Container Runtime escribe la salida de la consola de todos los contenedores (`/var/log/pods/*/*/*.log`).

Aquí hay un ejemplo `values.yaml`:

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
```

La canalización de registros predeterminada del gráfico utiliza el
`debugexporter`. Emparejado con el `logsCollection` preset `filelogreceiver` es fácil alimentar accidentalmente el exportó registros de nuevo en el recopilador, lo que puede causar una "explosión de registro".

Para evitar el bucle, la configuración predeterminada del receptor excluye el Registros del propio coleccionista. Si desea incluir los registros del recopilador, asegúrese de Reemplace el exportador `debug` por un exportador que
no envíe registros a Salida estándar del colector.

Aquí hay un ejemplo `values.yaml` que reemplaza el exportador `debug`
predeterminado en La canalización `logs` con un exportador `otlphttp` que envía
los registros del contenedor a `https://example.com:55681` punto final. También
utiliza `presets.logsCollection.includeCollectorLogs` para indicar al preset que
habilite Colección de los registros del coleccionista.

```yaml
mode: daemonset

presets:
  logsCollection:
    enabled: true
    includeCollectorLogs: true

config:
  exporters:
    otlphttp:
      endpoint: https://example.com:55681
  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
```

#### Atributos preestablecidos de Kubernetes

El recopilador de OpenTelemetry se puede configurar para agregar metadatos de
Kubernetes, como como `k8s.pod.name`, `k8s.namespace.name` y `k8s.node.name`, a
los registros, métricas y rastros. Se recomienda encarecidamente utilizar el
ajuste preestablecido o habilitar el `k8sattributesprocessor` manualmente.

Debido a consideraciones de RBAC, esta característica está deshabilitada de
forma predeterminada. Tiene el los siguientes requisitos:

- Requiere el
  [Kubernetes Attributes processor](/docs/kubernetes/collector/components/#kubernetes-attributes-processor)
  se incluirán en la imagen del Coleccionista, como el
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).

Para habilitar esta característica, establezca la propiedad
`presets.kubernetesAttributes.enabled` a `true`. Cuando está habilitado, el
gráfico agregará los roles RBAC necesarios al ClusterRole y agregará un
`k8sattributesprocessor` a cada canalización habilitada.

Aquí hay un ejemplo `values.yaml`:

```yaml
mode: daemonset
presets:
  kubernetesAttributes:
    enabled: true
```

#### Métricas de Kubelet preestablecidas

El Colector de telemetría abierta se puede configurar para recopilar nodos, pods y métricas de contenedor del servidor API en un kubelet.

Esta característica está deshabilitada de forma predeterminada. Tiene los siguientes requisitos:

- Requiere el
  [Kubeletstats receiver](/docs/kubernetes/collector/components/#kubeletstats-receiver)
  se incluirán en la imagen del Coleccionista, como el

- [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Aunque no es un requisito estricto, se recomienda que este ajuste
  preestablecido se utilice con `mode=daemonset`. El `kubeletstatsreceiver` solo
  podrá recoger métricas en el nodo en el que se está ejecutando el recopilador
  y múltiples configuraciones Los recopiladores del mismo nodo producirán datos
  duplicados.

Para habilitar esta característica, establezca la propiedad
`presets.kubeletMetrics.enabled` en `true`. Cuando está habilitado, el gráfico
agregará los roles RBAC necesarios al ClusterRole y agregará un
`kubeletstatsreceiver` a la canalización de métricas.

Aquí hay un ejemplo `values.yaml`:

```yaml
mode: daemonset
presets:
  kubeletMetrics:
    enabled: true
```

#### Métricas de clúster preestablecidas

El recopilador de OpenTelemetry se puede configurar para recopilar métricas de nivel de clúster desde el servidor API de Kubernetes. Estas métricas incluyen muchas de ellas recopilado por Kube State Metrics.

Esta característica está deshabilitada de forma predeterminada. Tiene los siguientes requisitos:

- Requiere el
  [Receptor de clúster de Kubernetes](/docs/kubernetes/collector/components/#kubernetes-cluster-receiver)
  se incluirán en la imagen del Coleccionista, como el
  [Distribución de Contrib del Coleccionista](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Aunque no es un requisito estricto, se recomienda que este ajuste
  preestablecido se utilice con `mode=deployment` o `mode=statefulset` con una
  única réplica. Correr `k8sclusterreceiver` en varios colectores producirá
  datos duplicados.

Para habilitar esta característica, establezca la propiedad
`presets.clusterMetrics.enabled` en `verdadero`. Cuando está habilitado, el
gráfico agregará los roles RBAC necesarios al ClusterRole y agregará un
`k8sclusterreceiver` a la canalización de métricas.

Aquí hay un ejemplo `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```

#### Eventos preestablecidos de Kubernetes

El Colector de telemetría abierta se puede configurar para recopilar eventos de Kubernetes.

Esta característica está deshabilitada de forma predeterminada. Tiene los siguientes requisitos:

- Requiere el
  [Receptor de objetos Kubernetes](/docs/kubernetes/collector/components/#kubernetes-objects-receiver)
  se incluirán en la imagen del Coleccionista, como el
  [Distribución de Contrib del Coleccionista](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Aunque no es un requisito estricto, se recomienda que este ajuste
  preestablecido se utilice con `mode=deployment` o `mode=statefulset` con una
  única réplica. Correr `k8sclusterreceiver` en varios colectores producirá
  datos duplicados.

Para habilitar esta característica, establezca la propiedad
`presets.kubernetesEvents.enabled` en `true`. Cuando está habilitado, el gráfico
agregará los roles RBAC necesarios al ClusterRole y agregará un
`k8sobjectsreceiver` a la configuración de la canalización de registros a solo
eventos de recopilador.

Aquí hay un ejemplo `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  kubernetesEvents:
    enabled: true
```

#### Métricas de host preestablecidas

El recopilador de telemetría abierta se puede configurar para recopilar métricas de host desde Nodos de Kubernetes.

Esta característica está deshabilitada de forma predeterminada. Tiene los siguientes requisitos:

- Requiere el
  [Host Metrics receiver](/docs/kubernetes/collector/components/#host-metrics-receiver)
  se incluirán en la imagen del Coleccionista, como el
  [Distribución de Contrib del Coleccionista](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Aunque no es un requisito estricto, se recomienda que este ajuste
  preestablecido se utilice con `mode=daemonset`. El `hostmetricsreceiver` solo
  podrá recolectar métricas en el nodo en el que se está ejecutando el
  recopilador y múltiples configuraciones Los recopiladores del mismo nodo
  producirán datos duplicados.

Para habilitar esta característica, establezca la propiedad
`presets.hostMetrics.enabled` en `verdadero`. Cuando está habilitado, el gráfico
agregará los volúmenes necesarios y volumeMounts y agregará un
`hostmetricsReceiver` a la canalización de métricas. Métricas predeterminadas se
desguazarán cada 10 segundos y se habilitarán los siguientes desguazadores:

- CPU
- Cargar
- memoria
- disco
- sistema de archivos[^1]
- red

Aquí hay un ejemplo `values.yaml`:

```yaml
mode: daemonset
presets:
  hostMetrics:
    enabled: true
```

[^1] debido a alguna superposición con el preajuste `kubeletMetrics` de algunos
tipos de sistema de archivos y los puntos de montaje se excluyen de forma
predeterminada.
