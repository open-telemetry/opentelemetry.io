---
title: Implementar OBI en Kubernetes
linkTitle: Kubernetes
description: Aprende a implementar OBI en Kubernetes.
weight: 3
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
# prettier-ignore
cSpell:ignore: cap_perfmon containerd goblog kubeadm microk8s replicaset statefulset
---

{{% alert type="note" %}}

Este documento explica cómo implementar OBI manualmente en Kubernetes,
configurando todas las entidades necesarias por su cuenta.

<!-- Quizás prefieras seguir la documentación
[Implementar OBI en Kubernetes con Helm](../kubernetes-helm/) en su lugar. -->

{{% /alert %}}

## Configuración de la decoración de metadatos de Kubernetes {#configuring-kubernetes-metadata-decoration}

OBI puede decorar sus trazas con las siguientes etiquetas de Kubernetes:

- `k8s.namespace.name`
- `k8s.deployment.name`
- `k8s.statefulset.name`
- `k8s.replicaset.name`
- `k8s.daemonset.name`
- `k8s.node.name`
- `k8s.pod.name`
- `k8s.container.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.cluster.name`

Para habilitar la decoración de metadatos, debe hacer lo siguiente:

- Crear una ServiceAccount y vincular una lista de concesión de ClusterRole y
  permisos de observación tanto para Pods como para ReplicaSets. Puedes hacerlo
  implementando este archivo de ejemplo:

  ```yaml
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: obi
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
    name: obi
  rules:
    - apiGroups: ['apps']
      resources: ['replicasets']
      verbs: ['list', 'watch']
    - apiGroups: ['']
      resources: ['pods', 'services', 'nodes']
      verbs: ['list', 'watch']
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
    name: obi
  subjects:
    - kind: ServiceAccount
      name: obi
      namespace: default
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: obi
  ```

  (Debes cambiar el valor «namespace: default» si va a implementar OBI en otro
  espacio de nombres).

- Configura OBI con la variable de entorno `OTEL_EBPF_KUBE_METADATA_ENABLE=true`
  o la configuración YAML `attributes.kubernetes.enable: true`.

- No olvides especificar la propiedad `serviceAccountName: obi` en su pod
- OBI (como se muestra en los ejemplos de implementación posteriores).

Opcionalmente, selecciona qué servicios de Kubernetes deseas instrumentar en la
sección `discovery -> instrument` del archivo de configuración YAML. Para
obtener más información, consulta la sección _Detección de servicios_ en el
[documento de configuración](../../configure/options/), así como la sección
[Proporcionar un archivo de configuración externo](#providing-an-external-configuration-file)
de esta página.

## Implementación de OBI {#deploying-obi}

Puedes implementar OBI en Kubernetes de dos maneras diferentes:

- Como contenedor auxiliar
- Como DaemonSet

### Implementar OBI como contenedor auxiliar {#deploying-obi-as-a-sidecar-container}

Esta es la forma en que puedes implementar OBI si deseas supervisar un servicio
determinado que puede que no esté implementado en todos los hosts, por lo que
solo tienes que implementar una instancia de OBI por cada instancia de servicio.

La implementación de OBI como contenedor auxiliar tiene los siguientes
requisitos de configuración:

- El namespace del proceso debe compartirse entre todos los contenedores del pod
  (variable del pod `shareProcessNamespace: true`).
- El contenedor de autoinstrumentación debe ejecutarse en modo privilegiado
  (propiedad `securityContext.privileged: true` de la configuración del
  contenedor).
- Algunas instalaciones de Kubernetes permiten la siguiente configuración de
  `securityContext`, pero es posible que no funcione con todas las
  configuraciones de tiempo de ejecución de contenedores, ya que algunas de
  ellas confinan los contenedores y eliminan algunos permisos:

  ```yaml
  securityContext:
    runAsUser: 0
    capabilities:
      add:
        - SYS_ADMIN
        - SYS_RESOURCE # no requerido para kernels 5.11+
  ```

El siguiente ejemplo instrumenta el pod `goblog` adjuntando OBI como contenedor
(imagen disponible en `otel/ebpf-instrument:latest`). La herramienta de
autoinstrumentación está configurada para reenviar métricas y trazas a
OpenTelemetry Collector, al que se puede acceder desde el servicio `otelcol` en
el mismo namespace:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goblog
  labels:
    app: goblog
spec:
  replicas: 2
  selector:
    matchLabels:
      app: goblog
  template:
    metadata:
      labels:
        app: goblog
    spec:
      # Necesario para que la herramienta de instrumentos sidecar (auxiliar) pueda acceder al proceso de servicio.
      shareProcessNamespace: true
      serviceAccountName: obi # necesario si desea la decoración de metadatos de Kubernetes
      containers:
        # Contenedor para el servicio instrumentado
        - name: goblog
          image: mariomac/goblog:dev
          imagePullPolicy: IfNotPresent
          command: ['/goblog']
          ports:
            - containerPort: 8443
              name: https
        # Contenedor Sidecar (auxiliar) con OBI: la herramienta de autoinstrumentación eBPF
        - name: obi
          image: otel/ebpf-instrument:latest
          securityContext: # Se requieren privilegios para instalar las sondas eBPF
            privileged: true
          env:
            # El puerto interno del contenedor de la aplicación goblog
            - name: OTEL_EBPF_OPEN_PORT
              value: '8443'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # necesario si desea la decoración de metadatos de Kubernetes
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

Para obtener más información sobre las diferentes opciones de configuración,
consulta la sección [Configuración](../../configure/options/) de este sitio de
documentación.

### Implementar OBI como un Daemonset {#deploying-obi-as-a-daemonset}

También puedes implementar OBI como un Daemonset. Esta es la forma preferida si:

- Deseas instrumentar un Daemonset
- Deseas instrumentar varios procesos desde una única instancia de OBI, o
  incluso todos los procesos de su clúster.

Utilizando el ejemplo anterior (el pod `goblog`), no podemos seleccionar el
proceso que se va a instrumentar utilizando su puerto abierto, ya que el puerto
es interno al pod. Al mismo tiempo, varias instancias del servicio tendrían
diferentes puertos abiertos. En este caso, tendremos que instrumentar utilizando
el nombre ejecutable del servicio de la aplicación (véase el ejemplo posterior).

Además de los requisitos de privilegios del escenario auxiliar (sidecar),
deberás configurar la plantilla de pod de autoinstrumentación con la opción
`hostPID: true` habilitada, para que pueda acceder a todos los procesos que se
ejecutan en el mismo host.

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
  labels:
    app: obi
spec:
  selector:
    matchLabels:
      app: obi
  template:
    metadata:
      labels:
        app: obi
    spec:
      hostPID: true # Necesario para el acceso de los procesos en el host
      serviceAccountName: obi # Requerido si desea la decoración de metadatos de Kubernetes
      containers:
        - name: autoinstrument
          image: otel/ebpf-instrument:latest
          securityContext:
            privileged: true
          env:
            # Seleccione el ejecutable por su nombre en lugar de OTEL_EBPF_OPEN_PORT.
            - name: OTEL_EBPF_AUTO_TARGET_EXE
              value: '*/goblog'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # Requerido si desea la decoración de metadatos de Kubernetes
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

### Implementar OBI sin privilegios {#deploying-obi-unprivileged}

En todos los ejemplos anteriores, se utilizó `privileged:true` o la capacidad
Linux `SYS_ADMIN` en la sección `securityContext` de la implementación de OBI.
Aunque esto funciona en todas las circunstancias, existen formas de implementar
OBI en Kubernetes con privilegios reducidos si su configuración de seguridad así
lo requiere. Que esto sea posible depende de la versión de Kubernetes que tenga
y del tiempo de ejecución del contenedor subyacente utilizado (por ejemplo,
**Containerd**, **CRI-O** o **Docker**).

La siguiente guía se basa en pruebas realizadas principalmente ejecutando
`containerd` con `GKE`, `kubeadm`, `k3s`, `microk8s` y `kind`.

Para ejecutar OBI sin privilegios, debe sustituir la configuración
`privileged:true` por un conjunto de capacidades de Linux
[capabilities](https://www.man7.org/linux/man-pages/man7/capabilities.7.html).
Puede encontrar una lista completa de las capacidades que requiere OBI en
[Seguridad, permisos y capacidades](../../security/).

**Nota** Para cargar programas BPF es necesario que OBI pueda leer los eventos
de rendimiento de Linux o, al menos, que pueda ejecutar la API del kernel de
Linux `perf_event_open()`.

**Nota** Para cargar programas BPF es necesario que OBI pueda leer los eventos
de rendimiento de Linux o, al menos, que pueda ejecutar la API del kernel de
Linux `perf_event_open()`.

Este permiso lo concede `CAP_PERFMON` o, de forma más liberal, `CAP_SYS_ADMIN`.
Dado que tanto `CAP_PERFMON` como `CAP_SYS_ADMIN` conceden a OBI el permiso para
leer eventos de rendimiento, se debe utilizar `CAP_PERFMON`, ya que concede
menos permisos. Sin embargo, a nivel del sistema, el acceso a los eventos de
rendimiento se controla a través de la configuración kernel.perf_event_paranoid,
que puede leer o escribir utilizando sysctl o modificando el archivo
/proc/sys/kernel/perf_event_paranoid. La configuración predeterminada para
`kernel.perf_event_paranoid` suele ser `2`, tal y como se documenta en la
sección `perf_event_paranoid` de la
[documentación del kernel](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt).
Algunas distribuciones de Linux definen niveles más altos para
`kernel.perf_event_paranoid`, por ejemplo, las distribuciones basadas en Debian
[también utilizan](https://lwn.net/Articles/696216/)
`kernel.perf_event_paranoid=3`, lo que impide el acceso a `perf_event_open()`
sin `CAP_SYS_ADMIN`. Si está ejecutando una distribución con la configuración de
`kernel.perf_event_paranoid` superior a `2`, puede modificar su configuración
para reducirla a `2` o utilizar `CAP_SYS_ADMIN` en lugar de `CAP_PERFMON`.

A continuación se muestra un ejemplo de configuración de contenedor sin
privilegios OBI:

```yaml
...
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
  namespace: obi-demo
  labels:
    k8s-app: obi
spec:
  selector:
    matchLabels:
      k8s-app: obi
  template:
    metadata:
      labels:
        k8s-app: obi
    spec:
      serviceAccount: obi
      hostPID: true           # <-- Importante. Se requiere en modo Daemonset para que OBI pueda detectar todos los procesos monitoreados.
      containers:
      - name: obi
        terminationMessagePolicy: FallbackToLogsOnError
        image: otel/ebpf-instrument:latest
        env:
          - name: OTEL_EBPF_TRACE_PRINTER
            value: "text"
          - name: OTEL_EBPF_KUBE_METADATA_ENABLE
            value: "autodetect"
          - name: KUBE_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          ...
        securityContext:
          runAsUser: 0
          readOnlyRootFilesystem: true
          capabilities:
            add:
              - BPF                 # <-- Importante. Necesario para que la mayoría de las sondas (probes) eBPF funcionen correctamente.
              - SYS_PTRACE          # <-- Importante. Permite a OBI acceder a los namespaces del contenedor e inspeccionar los ejecutables.
              - NET_RAW             # <-- Importante. Permite a OBI utilizar filtros de socket para solicitudes HTTP.
              - CHECKPOINT_RESTORE  # <-- Importante. Permite a OBI abrir archivos ELF.
              - DAC_READ_SEARCH     # <-- Importante. Permite a OBI abrir archivos ELF.
              - PERFMON             # <-- Importante. Permite a OBI cargar programas BPF.
              #- SYS_RESOURCE       # <-- solo anterior a 5.11. Permite a OBI aumentar la cantidad de memoria bloqueada.
              #- SYS_ADMIN          # <-- Necesario para la propagación del contexto de trazado de la aplicación Go, o si kernel.perf_event_paranoid >= 3 en distribuciones Debian.
            drop:
              - ALL
        volumeMounts:
        - name: var-run-obi
          mountPath: /var/run/obi
        - name: cgroup
          mountPath: /sys/fs/cgroup
      tolerations:
      - effect: NoSchedule
        operator: Exists
      - effect: NoExecute
        operator: Exists
      volumes:
      - name: var-run-obi
        emptyDir: {}
      - name: cgroup
        hostPath:
          path: /sys/fs/cgroup
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: some-service
  namespace: obi-demo
  ...
---
```

## Proporcionar un archivo de configuración externo {#providing-an-external-configuration-file}

En los ejemplos anteriores, OBI se configuró mediante variables de entorno. Sin
embargo, también se puede configurar mediante un archivo YAML externo (tal y
como se documenta en la sección [Configuración](../../configure/options/) de
este sitio).

Para proporcionar la configuración como un archivo, lo recomendable es
implementar un ConfigMap con la configuración deseada, montarlo en el pod de OBI
y hacer referencia a él con la variable de entorno `OTEL_EBPF_CONFIG_PATH`.

Ejemplo de ConfigMap con la documentación YAML de OBI:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: obi-config
data:
  obi-config.yml: |
    trace_printer: text
    otel_traces_export:
      endpoint: http://otelcol:4317
      sampler:
        name: parentbased_traceidratio
        arg: "0.01"
    routes:
      patterns:
        - /factorial/{num}
```

Ejemplo de configuración de OBI DaemonSet, montaje y acceso al anterior
ConfigMap:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
spec:
  selector:
    matchLabels:
      instrumentation: obi
  template:
    metadata:
      labels:
        instrumentation: obi
    spec:
      serviceAccountName: obi
      hostPID: true #importante!
      containers:
        - name: obi
          image: otel/ebpf-instrument:latest
          imagePullPolicy: IfNotPresent
          securityContext:
            privileged: true
            readOnlyRootFilesystem: true
          # montar el ConfigMap anterior como una carpeta
          volumeMounts:
            - mountPath: /config
              name: obi-config
            - mountPath: /var/run/obi
              name: var-run-obi
          env:
            # indique a OBI dónde encontrar el archivo de configuración
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
        - name: var-run-obi
          emptyDir: {}
```

## Proporcionar configuración secreta {#providing-secret-configuration}

El ejemplo anterior es válido para la configuración normal, pero no debe
utilizarse para transmitir información secreta, como contraseñas o claves API.

Para proporcionar información secreta, se recomienda implementar un secreto de
Kubernetes. Por ejemplo, este secreto contiene algunas credenciales ficticias de
OpenTelemetry Collector:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: otelcol-secret
type: Opaque
stringData:
  headers: 'Authorization=Bearer Z2hwX0l4Y29QOWhr....ScQo='
```

A continuación, puedes acceder a los valores secretos como variables de entorno.
Siguiendo el ejemplo anterior de DaemonSet, esto se lograría añadiendo la
siguiente sección `env` al contenedor OBI:

```yaml
env:
  - name: OTEL_EXPORTER_OTLP_HEADERS
    valueFrom:
      secretKeyRef:
        key: otelcol-secret
        name: headers
```
