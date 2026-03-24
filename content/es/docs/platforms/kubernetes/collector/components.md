---
title: Componentes importantes para Kubernetes
linkTitle: Componentes
# prettier-ignore
cSpell:ignore: alertmanagers filelog horizontalpodautoscalers hostfs hostmetrics k8sattributes kubelet kubeletstats paginación Paginación replicasets replicationcontrollers resourcequotas statefulsets varlibdockercontainers varlogpods
default_lang_commit: 4e426662aa975d6b3d5c2c2fe450f160415d1a3a
---

El [OpenTelemetry Collector](/docs/collector/) admite muchos receptores y
procesadores distintos para facilitar la supervisión de Kubernetes. Esta sección
trata los componentes más importantes para recopilar datos de Kubernetes y
enriquecerlos.

Componentes cubiertos en esta página:

- [Procesador de atributos de Kubernetes](#kubernetes-attributes-processor):
  agrega metadatos de Kubernetes a la telemetría de la aplicación entrante.
- [Receptor de estadísticas de Kubelet](#kubeletstats-receiver): extrae métricas
  de nodos, pods y contenedores del servidor API en un kubelet.
- [Receptor de logs de archivos](#filelog-receiver): recopila logs de Kubernetes
  y logs de aplicaciones escritos en stdout/stderr.
- [Receptor de clúster de Kubernetes](#kubernetes-cluster-receiver): recopila
  métricas a nivel de clúster y eventos de entidad.
- [Receptor de objetos de Kubernetes](#kubernetes-objects-receiver): recopila
  objetos, como eventos, del servidor API de Kubernetes.
- [Receptor Prometheus](#prometheus-receiver): recibe métricas en formato
  [Prometheus](https://prometheus.io/).
- [Receptor de métricas del host](#host-metrics-receiver): extrae métricas del
  host de nodos de Kubernetes.

Para los rastros, las métricas o los logs de aplicaciones, recomendamos el
[receptor OTLP](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver),
pero cualquier receptor que encaje con tus datos es adecuado.

## Procesador de atributos de Kubernetes {#kubernetes-attributes-processor}

| Patrón de implementación | Utilizable |
| ------------------------ | ---------- |
| DaemonSet (agente)       | Sí         |
| Deployment (gateway)     | Sí         |
| Sidecar                  | No         |

El procesador de atributos de Kubernetes descubre automáticamente los pods de
Kubernetes, extrae sus metadatos y añade los metadatos extraídos a spans,
métricas y logs como atributos de recursos.

**El procesador de atributos de Kubernetes es uno de los componentes más
importantes para un Collector que se ejecuta en Kubernetes. Todo Collector que
reciba datos de aplicaciones debería usarlo.** Al añadir contexto de Kubernetes
a tu telemetría, el procesador de atributos de Kubernetes te permite
correlacionar los rastros, las métricas y los logs de tu aplicación con la
telemetría de Kubernetes, como las métricas de pods y los rastros.

El procesador de atributos de Kubernetes utiliza la API de Kubernetes para
descubrir todos los pods que se ejecutan en un clúster y mantiene un registro de
sus direcciones IP, UID de pod y metadatos interesantes. De manera
predeterminada, los datos que pasan por el procesador se asocian a un pod a
través de la dirección IP de la solicitud entrante, pero se pueden configurar
diferentes reglas. Dado que el procesador utiliza la API de Kubernetes, requiere
permisos especiales (consulta el ejemplo más abajo). Si usas el
[chart Helm de OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
puedes usar el
[preset `kubernetesAttributes`](/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset)
para empezar.

Los siguientes atributos se agregan de forma predeterminada:

- `k8s.namespace.name`
- `k8s.pod.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.deployment.name`
- `k8s.node.name`

El procesador de atributos de Kubernetes también puede establecer atributos de
recursos personalizados para rastreos, métricas y logs mediante las etiquetas y
anotaciones de Kubernetes que haya agregado a sus pods y espacios de nombres.

```yaml
k8sattributes:
  auth_type: 'serviceAccount'
  extract:
    metadata: # extraído del pod
      - k8s.namespace.name
      - k8s.pod.name
      - k8s.pod.start_time
      - k8s.pod.uid
      - k8s.deployment.name
      - k8s.node.name
    annotations:
      # Extrae el valor de una anotación del pod con la clave `annotation-one` y lo inserta como un atributo de recurso con la clave `a1`
      - tag_name: a1
        key: annotation-one
        from: pod
      # Extrae el valor de una anotación del namespace con la clave `annotation-two` utilizando una expresión regular y lo inserta como un recurso con la clave `a2`
      - tag_name: a2
        key: annotation-two
        regex: field=(?P<value>.+)
        from: namespace
    labels:
      # Extrae el valor de una etiqueta del namespace con la clave `label1` y lo inserta como un atributo de recurso con la clave `l1`
      - tag_name: l1
        key: label1
        from: namespace
      # Extrae el valor de una etiqueta del pod con la clave `label2` utilizando una expresión regular y lo inserta como un atributo de recurso con la clave `l2`
      - tag_name: l2
        key: label2
        regex: field=(?P<value>.+)
        from: pod
  pod_association: # Cómo asociar los datos a un pod (el orden importa)
    - sources: # Primero intenta usar el valor del atributo de recurso k8s.pod.ip
        - from: resource_attribute
          name: k8s.pod.ip
    - sources: # Luego intenta usar el valor del atributo de recurso k8s.pod.uid
        - from: resource_attribute
          name: k8s.pod.uid
    - sources: # Si ninguno de esos funciona, usa la conexión de la solicitud para obtener la IP del pod.
        - from: connection
```

También hay opciones de configuración especiales cuando el Collector se
despliega como un DaemonSet de Kubernetes (agente) o como un Deployment de
Kubernetes (gateway). Para más detalles, consulta
[Escenarios de implementación](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor#deployment-scenarios)

Para conocer los detalles de configuración del procesador de atributos de
Kubernetes, consulta
[Procesador de atributos de Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor).

Dado que el procesador usa la API de Kubernetes, necesita el permiso adecuado
para funcionar bien. En la mayoría de los casos, debes conceder a la cuenta de
servicio que ejecuta el Collector los siguientes permisos mediante un
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

## Receptor de Kubeletstats {#kubeletstats-receiver}

| Patrón de implementación | Utilizable                                                             |
| ------------------------ | ---------------------------------------------------------------------- |
| DaemonSet (agente)       | Preferido                                                              |
| Deployment (gateway)     | Sí, pero solo recopilará métricas del nodo en el que está implementado |
| Sidecar                  | No                                                                     |

Cada nodo de Kubernetes ejecuta un kubelet que incluye un servidor API. El
receptor Kubeletstats se conecta a ese kubelet a través del servidor API para
recopilar métricas del nodo y de las cargas de trabajo que se ejecutan en él.

Hay varios métodos de autenticación, pero lo habitual es usar una cuenta de
servicio. La cuenta de servicio también necesita los permisos adecuados para
obtener datos del kubelet (ver más abajo). Si usas el
[chart Helm de OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
puedes empezar con el
[preset `kubeletMetrics`](/docs/platforms/kubernetes/helm/collector/#kubelet-metrics-preset).

De forma predeterminada, se recopilan métricas para pods y nodos, pero también
se puede configurar el receptor para recopilar las métricas del contenedor y el
volumen. El receptor también permite configurar con qué frecuencia se recopilan
las métricas:

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

Para obtener detalles específicos sobre qué métricas se recopilan, consulta
[Métricas predeterminadas](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver/documentation.md).
Para obtener detalles de configuración específicos, consulta
[Receptor de Kubeletstats](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver).

Dado que el receptor usa la API de Kubernetes, necesita el permiso adecuado para
funcionar bien. En la mayoría de los casos, debes conceder a la cuenta de
servicio que ejecuta el Collector los siguientes permisos mediante un
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

## Receptor de logs de archivos {#filelog-receiver}

| Patrón de implementación | Utilizable                                                     |
| ------------------------ | -------------------------------------------------------------- |
| DaemonSet (agente)       | Preferido                                                      |
| Deployment (gateway)     | Sí, pero solo recopilará logs del nodo en el que se implementa |
| Sidecar                  | Sí, pero esto se consideraría una configuración avanzada       |

El receptor Filelog sigue la cola de archivos y analiza logs. Aunque no es un
receptor específico de Kubernetes, sigue siendo la solución de facto para
recopilar logs en Kubernetes.

El receptor Filelog está formado por operadores encadenados que procesan cada
log. Cada operador cumple una función sencilla, como analizar una marca de
tiempo o JSON. Configurar un receptor Filelog no es trivial. Si usas el
[chart Helm de OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
puedes usar el
[preset `logsCollection`](/docs/platforms/kubernetes/helm/collector/#logs-collection-preset)
para empezar.

Como los logs de Kubernetes suelen seguir un conjunto de formatos estándar, una
configuración típica del receptor Filelog en Kubernetes es parecida a esta:

```yaml
filelog:
  include:
    - /var/log/pods/*/*/*.log
  exclude:
    # Exclude logs from all containers named otel-collector
    - /var/log/pods/*/otel-collector/*.log
  start_at: end
  include_file_path: true
  include_file_name: false
  operators:
    # parse container logs
    - type: container
      id: container-parser
```

Para los detalles de configuración del receptor Filelog, consulta
[Filelog Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver).

Además de la configuración del receptor Filelog, la instalación del
OpenTelemetry Collector en Kubernetes necesitará acceso a los logs que quieras
recopilar. Lo habitual es añadir volúmenes y `volumeMounts` al manifiesto del
Collector:

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
            # Mount the volumes to the collector container
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            ...
      volumes:
        ...
        # Typically the collector will want access to pod logs and container logs
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        ...
```

## Receptor de clúster de Kubernetes {#kubernetes-cluster-receiver}

| Patrón de implementación | Utilizable                                            |
| ------------------------ | ----------------------------------------------------- |
| DaemonSet (agente)       | Sí, pero generará datos duplicados                    |
| Deployment (gateway)     | Sí, pero más de una réplica generará datos duplicados |
| Sidecar                  | No                                                    |

El receptor de clúster de Kubernetes recopila métricas y eventos de entidad
sobre el clúster en su totalidad mediante el servidor de API de Kubernetes.
Utiliza este receptor para responder preguntas sobre fases de pod, condiciones
de nodo y otras preguntas sobre todo el clúster. Dado que el receptor recopila
telemetría para el clúster en su totalidad, solo se necesita una instancia del
receptor en todo el clúster para recopilar todos los datos.

Hay varios métodos de autenticación, pero lo habitual es usar una cuenta de
servicio. La cuenta de servicio también necesita permisos adecuados para obtener
datos del servidor API de Kubernetes (ver más abajo). Si usas el
[chart Helm de OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
puedes empezar con el
[preset `clusterMetrics`](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset).

Para las condiciones de los nodos, el receptor solo recopila `Ready` de forma
predeterminada, pero puede configurarse para recopilar más. El receptor también
puede informar de un conjunto de recursos asignables, como `cpu` y `memory`:

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

Para saber más sobre las métricas que se recopilan, consulta
[Métricas predeterminadas](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/k8sclusterreceiver/documentation.md).
Para los detalles de configuración, consulta
[Kubernetes Cluster Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver).

Dado que el receptor usa la API de Kubernetes, necesita el permiso adecuado para
funcionar bien. En la mayoría de los casos, debes conceder a la cuenta de
servicio que ejecuta el Collector los siguientes permisos mediante un
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

## Receptor de objetos de Kubernetes {#kubernetes-objects-receiver}

| Patrón de implementación | Utilizable                                            |
| ------------------------ | ----------------------------------------------------- |
| DaemonSet (agente)       | Sí, pero generará datos duplicados                    |
| Deployment (gateway)     | Sí, pero más de una réplica generará datos duplicados |
| Sidecar                  | No                                                    |

El receptor de objetos de Kubernetes recopila, ya sea extrayendo o observando,
objetos del servidor de API de Kubernetes. El caso de uso más común para este
receptor es observar eventos de Kubernetes, pero se puede utilizar para
recopilar cualquier tipo de objeto de Kubernetes. Dado que el receptor recopila
telemetría para el clúster en su totalidad, solo se necesita una instancia del
receptor en todo el clúster para recopilar todos los datos.

Actualmente solo puede usarse una cuenta de servicio para la autenticación. La
cuenta de servicio también necesita permisos adecuados para obtener datos del
servidor API de Kubernetes (ver más abajo). Si usas el
[chart Helm de OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/)
y quieres ingerir eventos, puedes usar el
[preset `kubernetesEvents`](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset)
para empezar.

Para los objetos configurados para extracción (_pull_), el receptor usa la API
de Kubernetes para listar periódicamente todos los objetos del clúster. Cada
objeto se convierte en su propio log. Para los objetos configurados para
observación (_watch_), el receptor abre un flujo con la API de Kubernetes y
recibe actualizaciones cuando los objetos cambian.

Para ver qué objetos están disponibles para recopilar en tu clúster, ejecuta
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

Para obtener detalles de configuración específicos, consulta
[Receptor de objetos de Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver).

Dado que el receptor usa la API de Kubernetes, necesita el permiso adecuado para
funcionar bien. Como las cuentas de servicio son la única opción de
autenticación, debes conceder a la cuenta de servicio el acceso correcto. Para
cada objeto que quieras recopilar, asegúrate de añadir su nombre al ClusterRole.
Por ejemplo, si quieres recopilar pods, el ClusterRole sería parecido a esto:

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

## Receptor Prometheus {#prometheus-receiver}

| Patrón de implementación | Utilizable |
| ------------------------ | ---------- |
| DaemonSet (agente)       | Sí         |
| Deployment (gateway)     | Sí         |
| Sidecar                  | No         |

Prometheus es un formato de métricas habitual tanto en Kubernetes como en los
servicios que se ejecutan en él. El receptor Prometheus es un sustituto mínimo y
casi directo para recopilar esas métricas. Admite el conjunto completo de
opciones
[`scrape_config` de Prometheus](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config).

Hay algunas funciones avanzadas de Prometheus que el receptor no admite. El
receptor devuelve un error si el YAML o el código de configuración incluye
cualquiera de lo siguiente:

- `alert_config.alertmanagers`
- `alert_config.relabel_configs`
- `remote_read`
- `remote_write`
- `rule_files`

Para los detalles de configuración, consulta
[Prometheus Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver).

El receptor Prometheus es
[con estado](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/standard-warnings.md#statefulness);
tenlo en cuenta al usarlo:

- El Collector no puede escalar automáticamente el proceso de _scraping_ cuando
  hay varias réplicas en ejecución.
- Si ejecutas varias réplicas del Collector con la misma configuración, las
  mismas instancias de _scraping_ consultarán los mismos objetivos varias veces.
- Si quieres repartir el _scraping_ a mano, debes dar a cada réplica una
  configuración distinta.

Para simplificar la configuración del receptor Prometheus, el OpenTelemetry
Operator incluye un componente opcional, el
[Target Allocator](/docs/platforms/kubernetes/operator/target-allocator), que
indica al Collector qué endpoints de Prometheus debe recopilar mediante
_scraping_.

Para más información sobre el diseño del receptor, consulta
[Design](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/DESIGN.md).

## Receptor de métricas del host {#host-metrics-receiver}

| Patrón de implementación | Utilizable                                                       |
| ------------------------ | ---------------------------------------------------------------- |
| DaemonSet (agente)       | Preferido                                                        |
| Deployment (gateway)     | Sí, pero solo recopila métricas del nodo en el que se implementa |
| Sidecar                  | No                                                               |

El receptor de métricas del host recopila métricas de un host mediante una
variedad de scrapers. Existe cierta superposición con el
[receptor de Kubeletstats](#kubeletstats-receiver), por lo que si decides usar
ambos, puede que valga la pena deshabilitar estas métricas duplicadas.

En Kubernetes, el receptor necesita acceso al volumen `hostfs` para funcionar
correctamente. Si usas el
[chart Helm de OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/),
puedes usar el
[preset `hostMetrics`](/docs/platforms/kubernetes/helm/collector/#host-metrics-preset)
para empezar.

Los scrapers disponibles son:

| Scraper             | Sistemas operativos compatibles | Descripción                                                        |
| ------------------- | ------------------------------- | ------------------------------------------------------------------ |
| CPU                 | Todos excepto Mac[^1]           | Métricas de utilización de CPU                                     |
| Disco               | Todos excepto Mac[^1]           | Métricas de E/S de disco                                           |
| Carga               | Todos                           | Métricas de carga de CPU                                           |
| Sistema de archivos | Todos                           | Métricas de utilización del sistema de archivos                    |
| Memoria             | Todos                           | Métricas de utilización de memoria                                 |
| Red                 | Todos                           | Métricas de E/S de interfaz de red y métricas de conexión TCP      |
| Paginación          | Todos                           | Métricas de E/S y utilización de espacio de intercambio/paginación |
| Procesos            | Linux, Mac                      | Métricas de conteo de procesos                                     |
| Proceso             | Linux, Windows, Mac             | Métricas de E/S de CPU, memoria y disco por proceso                |

[^1]:

No es compatible con macOS cuando se compila sin cgo, que es lo habitual en las
imágenes publicadas por el SIG del Collector.

Para obtener detalles específicos sobre qué métricas se recopilan y detalles de
configuración específicos, consulta
[Receptor de métricas del host](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver).

Si necesitas configurar el componente usted mismo, asegúrate de montar el
volumen `hostfs` si quieres recopilar las métricas del nodo y no las del
contenedor.

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

y luego configura el receptor de métricas de host para usar `volumeMount`:

```yaml
receivers:
  hostmetrics:
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

Para obtener más detalles sobre el uso del receptor en un contenedor, consulta
[Recopilación de métricas del host desde dentro de un contenedor (solo Linux)](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver#collecting-host-metrics-from-inside-a-container-linux-only)
