---
title: Trazas distribuidas con OBI
linkTitle: Trazas distribuidas
description:
  Más información sobre la compatibilidad con trazas distribuidas de OBI.
weight: 22
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
---

## Introducción {#introduction}

OBI admite trazas distribuidas para aplicaciones con algunas limitaciones y
restricciones de versión del kernel

Las trazas distribuidas se implementan mediante la propagación del valor del
encabezado [W3C «traceparent»](https://www.w3.org/TR/trace-context/). La
propagación del contexto «traceparent» es automática y no requiere ninguna
acción ni configuración.

OBI lee los valores de encabezado del contexto de trazas entrantes, rastrea el
flujo de ejecución del programa y propaga el contexto de trazado añadiendo
automáticamente el campo `traceparent` en las solicitudes HTTP/gRPC salientes.
Si una aplicación ya ha añadido el campo `traceparent` en las solicitudes
salientes, OBI utiliza ese valor para el trazado en lugar de su propio contexto
de trazado generado. Si OBI no puede encontrar un valor de contexto
`traceparent` entrante, genera uno de acuerdo con la especificación W3C.

## Implementación {#implementation}

El propagación de contexto de traza es implementado en dos maneras distintas:

1. Escribiendo la información del encabezado saliente a nivel de red.
2. Escribiendo la información del encabezado entrante a nivel de librerías para
   Go.

Dependiendo del lenguaje de programación en el que esté escrito su servicio, OBI
utiliza uno o ambos enfoques de propagación de contexto. Utilizamos estos
múltiples enfoques para implementar la propagación de contexto, ya que escribir
en la memoria con eBPF depende de la configuración del kernel y de las
capacidades del sistema Linux concedidas a OBI. Para obtener más detalles sobre
este tema, consulta nuestra charla en KubeCon NA 2024
[So You Want to Write Memory with eBPF?](https://www.youtube.com/watch?v=TUiVX-44S9s).

El propagación de contexto a **nivel de red** está **deshabilitado** por defecto
y puede ser habilitado configurando la variable de ambiente
`OTEL_EBPF_BPF_CONTEXT_PROPAGATION=all` o modificando el archivo de
configuración de OBI:

```yaml
ebpf:
  context_propagation: 'all'
```

### Propagación de contexto a nivel de red {#context-propagation-at-network-level}

La propagación del contexto a nivel de red se implementa escribiendo la
información del contexto de trazado en los encabezados HTTP salientes, así como
en el nivel de paquetes TCP/IP. La propagación del contexto HTTP es totalmente
compatible con cualquier otra biblioteca de trazado basada en OpenTelemetry.
Esto significa que los servicios instrumentados con OBI propagan correctamente
la información de trazado cuando envían y reciben desde servicios instrumentados
con los SDK de OpenTelemetry. Utilizamos
[Linux Traffic Control (TC)](<https://en.wikipedia.org/wiki/Tc_(Linux)>) para
realizar el ajuste de los paquetes de red, lo que requiere que otros programas
eBPF que utilizan Linux Traffic Control se encadenen correctamente con OBI. Para
consideraciones especiales relacionadas con Cilium CNI, consulta nuestra guía de
[Compatibilidad con Cilium](../cilium-compatibility/).

En el caso del tráfico cifrado con TLS (HTTPS), OBI no puede inyectar la
información de trazado en los encabezados HTTP salientes, sino que la inyecta a
nivel de paquetes TCP/IP. Debido a esta limitación, OBI solo puede enviar la
información de trazado a otros servicios instrumentados con OBI. Los proxies L7
y los equilibradores de carga interrumpen la propagación del contexto TCP/IP, ya
que los paquetes originales se descartan y se reproducen aguas abajo. El
análisis de la información de contexto de trazado entrante de los servicios
instrumentados con OpenTelemetry SDK sigue funcionando.

Por el momento, gRPC y HTTP/2 no son compatibles.

Este tipo de propagación de contexto funciona para cualquier lenguaje de
programación y no requiere que OBI se ejecute en modo `privileged` ni que tenga
concedido `CAP_SYS_ADMIN`. Para obtener más detalles, consulta la sección de
configuración
[Trazas distribuidas y propagación de contexto](../configure/metrics-traces-attributes/).

#### Configuración de Kubernetes {#kubernetes-configuration}

La manera recomendada de implementar OBI en Kubernetes con soporte de trazas
distribuidas a nivel de red es con `DaemonSet`.

Se debe utilizar la siguiente configuración de Kubernetes:

- OBI debe implementarse como un `DaemonSet` con acceso a la red del host
  (`hostNetwork: true`).
- La ruta `/sys/fs/cgroup` del host debe montarse como volumen en la ruta local
  `/sys/fs/cgroup`.
- Se debe conceder la capacidad `CAP_NET_ADMIN` al contenedor OBI.

El siguiente recorte de YAML muestra un ejemplo de la configuración para
implementar OBI:

```yaml
spec:
  serviceAccount: obi
  hostPID: true # <-- Importante! Requerido en modo DaemonSet para que OBI pueda detectar todos los procesos supervisados.
  hostNetwork: true # <-- Importante! Requerido en modo DaemonSetRequired para que OBI pueda ver todos los paquetes de red.
  dnsPolicy: ClusterFirstWithHostNet
  containers:
    - name: obi
      resources:
        limits:
          memory: 120Mi
      terminationMessagePolicy: FallbackToLogsOnError
      image: 'docker.io/otel/ebpf-instrument:latest'
      imagePullPolicy: 'Always'
      env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: 'http://otelcol:4318'
        - name: OTEL_EBPF_KUBE_METADATA_ENABLE
          value: 'autodetect'
        - name: OTEL_EBPF_CONFIG_PATH
          value: '/config/obi-config.yml'
      securityContext:
        runAsUser: 0
        readOnlyRootFilesystem: true
        capabilities:
          add:
            - BPF # <-- Importante! Requerido para el correcto funcionamiento de la mayoría de los probes eBPF.
            - SYS_PTRACE # <-- Importante!. Permite a OBI acceder a los namespaces del container e inspeccionar los ejecutables.
            - NET_RAW # <-- Importante!. Permite a OBI el uso de filtros socket para los HTTP requests.
            - CHECKPOINT_RESTORE # <-- Importante! Permite a OBI abrir los archivos ELF.
            - DAC_READ_SEARCH # <-- Importante! Permite a OBI abrir los archivos ELF.
            - PERFMON # <-- Importante! Permite a OBI cargar los programas BPF.
            - NET_ADMIN # <-- Importante! Permite a OBI inyectar información de propagación de contexto HTTP y TCP.
      volumeMounts:
        - name: cgroup
          mountPath: /sys/fs/cgroup # <-- Importante! Permite a OBI monitorear todos los nuevos sockets para rastrear las solicitudes salientes.
        - mountPath: /config
          name: obi-config
  tolerations:
    - effect: NoSchedule
      operator: Exists
    - effect: NoExecute
      operator: Exists
  volumes:
    - name: obi-config
      configMap:
        name: obi-config
    - name: cgroup
      hostPath:
        path: /sys/fs/cgroup
```

Si `/sys/fs/cgroup` no está montado como una ruta de volumen local para el
`DaemonSet` de OBI, es posible que algunas solicitudes no propaguen su contexto.
Usamos esta ruta de volumen para escuchar los sockets recién creados.

#### Limitaciones de versión Kernel {#kernel-version-limitations}

El análisis de los encabezados entrantes de propagación de contexto a nivel de
red generalmente requiere el kernel 5.17 o posterior para la adición y el uso de
bucles BPF.

Algunos núcleos parcheados, como RHEL 9.2, pueden tener esta funcionalidad
reincorporada. Al configurar OTEL_EBPF_OVERRIDE_BPF_LOOP_ENABLED se omiten las
comprobaciones del núcleo en caso de que este incluya la funcionalidad, pero sea
inferior a 5.17.

### Propagación de contexto en Go para instrumentación a nivel librería {#go-context-propagation-by-instrumenting-at-library-level}

Este tipo de propagación de contexto solo es compatible con aplicaciones Go y
utiliza la compatibilidad con escritura en memoria de usuario eBPF
(`bpf_probe_write_user`). La ventaja de este enfoque es que funciona para
HTTP/HTTP2/HTTPS y gRPC con algunas limitaciones; sin embargo, el uso de
`bpf_probe_write_user` requiere que se le conceda a OBI `CAP_SYS_ADMIN` o que se
configure para ejecutarse como contenedor `privilegiado`.container.

#### Integración con instrumentación manual de Go {#integration-with-go-manual-instrumentation}

OBI integra automáticamente con un intervalo manual usando el
[Auto SDK](/docs/zero-code/go/autosdk). Refiere a los documentos en Auto SDK
para conocer más.

#### Limitaciones del modo de integridad del Kernel {#kernel-integrity-mode-limitations}

Para poder escribir el valor `traceparent` en los encabezados de las solicitudes
HTTP/gRPC salientes, OBI necesita escribir en la memoria del proceso utilizando
el auxiliar eBPF
[**bpf_probe_write_user**](https://www.man7.org/linux/man-pages/man7/bpf-helpers.7.html).
Desde el kernel 5.14 (con correcciones adaptadas a la serie 5.10), este auxiliar
está protegido (y no está disponible para los programas BPF) si el kernel de
Linux se ejecuta en modo de bloqueo de integridad. El modo de integridad del
kernel suele estar habilitado de forma predeterminada si el kernel tiene
habilitado el [**Arranque Seguro**](https://wiki.debian.org/SecureBoot)
habilitado, pero también se puede habilitar manualmente.

OBI revisa automáticamente si puede usar el auxiliar , y habilita la propagación
de contexto solo si está permitido por la configuración del kernel. Verificar el
modo **lockdown** del Kernel Linux ejecutando el siguiente comando:

```shell
cat /sys/kernel/security/lockdown
```

Si ese archivo existe y el modo es distinto a `[none]`, OBI no puede realizar la
propagación del contexto y se desactiva el trazado distribuido.

#### Rastreo distribuido para Go en ambientes en contenedores (incluyendo Kubernetes) {#distributed-tracing-for-go-in-containerized-environments-including-kubernetes}

Debido a la restricciones del modo **lockdown**, los archivos de configuración
de Docker y Kubernetes deben montar el volumen `/sys/kernel/security/` para el
**container docker OBI** del sistema host. De esta manera OBI puede determinar
correctamente el modo **lockdown** del Kernel Linux. Aquí hay un ejemplo de
configuración con Docker compose, el cual se asegura que OBI tenga suficiente
información para determinar el modo **lockdown**:

```yaml
services:
  ...
  obi:
    image: 'docker.io/otel/ebpf-instrument:latest'
    environment:
      OTEL_EBPF_CONFIG_PATH: "/configs/obi-config.yml"
    volumes:
      - /sys/kernel/security:/sys/kernel/security
      - /sys/fs/cgroup:/sys/fs/cgroup
```

Si el volumen `/sys/kernel/security/` no está montado, OBI asume que el Kernel
Linux no esta corriendo en modo de integridad.
