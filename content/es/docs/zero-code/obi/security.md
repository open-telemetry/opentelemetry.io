---
title: Seguridad, permisos y capacidades de OBI
linkTitle: Seguridad
description: Privilegios y capacidades requeridos por OBI
weight: 22
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
cSpell:ignore: BPF_PROG_TYPE_KPROBE CAP_PERFMON eksctl
---

OBI necesita acceder a varias interfaces de Linux para instrumentar
aplicaciones, como leer desde el sistema de archivos `/proc`, cargar programas
eBPF y administrar filtros de interfaz de red. Muchas de estas operaciones
requieren permisos elevados. La solución más sencilla es ejecutar OBI como root,
sin embargo, esto podría no funcionar bien en configuraciones en las que el
acceso root completo no es ideal. Para solucionar esto, OBI está diseñado para
utilizar solo las capacidades específicas del kernel de Linux necesarias para su
configuración actual.

## Capacidades del kernel de Linux {#linux-kernel-capabilities}

Las capacidades del kernel de Linux son un sistema detallado para controlar el
acceso a operaciones privilegiadas. Permiten otorgar permisos específicos a los
procesos sin darles acceso completo de super usuario o root, lo que ayuda a
mejorar la seguridad al adherirse al principio del mínimo privilegio. Las
capacidades dividen los privilegios normalmente asociados con root en
operaciones privilegiadas más pequeñas en el kernel.

Las capacidades se asignan a procesos y archivos ejecutables. Mediante el uso de
herramientas como `setcap`, los administradores pueden asignar capacidades
específicas a un binario, lo que le permite realizar solo las operaciones que
necesita sin ejecutarse como root. Por ejemplo:

```shell
sudo setcap cap_net_admin,cap_net_raw+ep myprogram
```

Este ejemplo otorga las capacidades `CAP_NET_ADMIN` y `CAP_NET_RAW` a
`myprogram`, lo que le permite administrar la configuración de red sin necesidad
de privilegios de super usuario completos.

Al elegir y asignar cuidadosamente las capacidades, puede reducir el riesgo de
escalada de privilegios y, al mismo tiempo, permitir que los procesos hagan lo
que necesitan.

Puede encontrar más información en la
[página del manual de capacidades](https://man7.org/linux/man-pages/man7/capabilities.7.html).

## Modos de funcionamiento de OBI {#obi-operation-modes}

OBI puede funcionar en dos modos distintos: _observabilidad de aplicaciones_ y
_observabilidad de redes_. Estos modos no son mutuamente excluyentes y pueden
utilizarse conjuntamente según sea necesario. Para obtener más detalles sobre
cómo habilitar estos modos, consulte la
[documentación de configuración](../configure/options/).

OBI lee su configuración y comprueba las capacidades necesarias; si falta
alguna, muestra una advertencia, por ejemplo:

```shell
time=2025-01-27T17:21:20.197-06:00 level=WARN msg="Required system capabilities not present, OBI may malfunction" error="the following capabilities are required: CAP_DAC_READ_SEARCH, CAP_BPF, CAP_CHECKPOINT_RESTORE"
```

A continuación, OBI intenta continuar ejecutándose, pero la falta de capacidades
puede provocar errores más adelante.

Puede establecer `OBI_ENFORCE_SYS_CAPS=1`, lo que hace que OBI falle
inmediatamente si no están disponibles las capacidades necesarias.

## Lista de capacidades necesarias para OBI {#list-of-capabilities-required-by-obi}

OBI requiere la siguiente lista de capacidades para su funcionamiento:

| Capacidades              | Uso en OBI                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAP_BPF`                | Habilita la funcionalidad BPF general y los programas de filtro de socket (`BPF_PROG_TYPE_SOCK_FILTER`), utilizados para capturar flujos de red en el modo de observabilidad de red.                                                                                                                                        |
| `CAP_NET_RAW`            | Se utiliza para crear sockets sin procesar `AF_PACKET`, que es el mecanismo utilizado para adjuntar programas de filtrado de sockets que se utilizan para capturar flujos de red en el modo de observabilidad de red.                                                                                                       |
| `CAP_NET_ADMIN`          | Se requiere cargar programas TC `BPF_PROG_TYPE_SCHED_CLS`: estos programas se utilizan para capturar flujos de red y para la propagación del contexto de trazado, tanto para la observabilidad de la red como de las aplicaciones.                                                                                          |
| `CAP_PERFMON`            | Se utiliza para la propagación del contexto de trazado, la _observabilidad general de las aplicaciones_ y la supervisión del flujo de red. Permite el acceso directo a los paquetes por parte de los programas TC, la carga de sondas (probes) eBPF en el núcleo y la aritmética de punteros utilizada por estos programas. |
| `CAP_DAC_READ_SEARCH`    | Acceso a `/proc/self/mem` para determinar la versión del kernel, utilizada por OBI para determinar el conjunto adecuado de funciones compatibles que se deben habilitar.                                                                                                                                                    |
| `CAP_CHECKPOINT_RESTORE` | Acceso a los symlink en el sistema de archivos `/proc`, utilizado por OBI para obtener diversa información sobre los procesos y el sistema.                                                                                                                                                                                 |
| `CAP_SYS_PTRACE`         | Acceso a `/proc/pid/exe` y módulos ejecutables, utilizados por OBI para escanear símbolos ejecutables e instrumentar diferentes partes de un programa.                                                                                                                                                                      |
| `CAP_SYS_RESOURCE`       | Aumentar la cantidad de memoria bloqueada disponible, **kernels < 5.11** solamente                                                                                                                                                                                                                                          |
| `CAP_SYS_ADMIN`          | Propagación del contexto de trazado Go a nivel de biblioteca mediante `bpf_probe_write_user()` y acceso a los datos BTF por parte del exportador de métricas BPF.                                                                                                                                                           |

### Tareas de supervisión del rendimiento {#performance-monitoring-tasks}

El acceso a `CAP_PERFMON` está sujeto a los controles de acceso `perf_events`
regidos por la configuración del kernel `kernel.perf_event_paranoid`, que se
puede ajustar mediante `sysctl` o modificando el archivo
`/proc/sys/kernel/perf_event_paranoid`. La configuración predeterminada para
`kernel.perf_event_paranoid` suele ser `2`, tal y como se documenta en la
sección `perf_event_paranoid` de la
[documentación del kernel](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt)
y de forma más exhaustiva en
[la documentación de perf-security](https://www.kernel.org/doc/Documentation/admin-guide/perf-security.rst).

Algunas distribuciones de Linux definen niveles más altos para kernel.
perf_event_paranoid, por ejemplo, las distribuciones basadas en Debian
[también utilizan](https://lwn.net/Articles/696216/)
kernel.perf_event_paranoid=3, lo que impide el acceso a perf_event_open() sin
CAP_SYS_ADMIN. Si está ejecutando una distribución con la configuración de
`kernel.perf_event_paranoid` superior a `2`, puede modificar su configuración
para reducirla a `2` o utilizar `CAP_SYS_ADMIN` en lugar de `CAP_PERFMON`.

### Implementación en AKS/EKS {#deployment-on-aks-eks}

Tanto los entornos AKS como EKS incluyen kernels que, de forma predeterminada,
establecen `sys.perf_event_paranoid > 1`, lo que significa que OBI necesita
`CAP_SYS_ADMIN` para funcionar. Consulte la sección sobre cómo
[supervisar el rendimiento de las tareas](#performance-monitoring-tasks) para
obtener más información.

Si prefiere utilizar solo `CAP_PERFMON`, puede configurar su nodo para
establecer `kernel.perf_event_paranoid = 1`. Hemos proporcionado algunos
ejemplos de cómo hacerlo, pero tenga en cuenta que los resultados pueden variar
en función de su configuración específica

#### AKS {#aks}

##### Crear archivo de configuración AKS {#create-aks-configuration-file}

```json
{
  "sysctls": {
    "kernel.sys_paranoid": "1"
  }
}
```

##### Crear o actualizar tu cluster AKS {#create-or-update-your-aks-cluster}

```sh
az aks create --name myAKSCluster --resource-group myResourceGroup --linux-os-config ./linuxosconfig.json
```

Para más información, ver
"[Personalizar la configuración de nodos para los grupos de nodos de Azure Kubernetes Service (AKS)](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools)"

#### EKS (utilizando la configuración de EKS Anywhere) {#eks-using-eks-anywhere-configuration}

##### Crear el archivo de configuración de EKS Anywhere {#create-eks-anywhere-configuration-file}

```yaml
apiVersion: anywhere.eks.amazonaws.com/v1alpha1
kind: VSphereMachineConfig
metadata:
  name: machine-config
spec:
  hostOSConfiguration:
    kernel:
      sysctlSettings:
        kernel.sys_paranoid: '1'
```

##### Implementar o actualizar tu cluster EKS Anywhere {#deploy-or-update-your-eks-anywhere-cluster}

```sh
eksctl create cluster --config-file hostosconfig.yaml
```

#### EKS (modificar la configuración del grupo de nodos) {#eks-modify-node-group-settings}

##### Actualizar el grupo de nodos {#update-the-node-group}

```yaml
apiVersion: eks.eks.amazonaws.com/v1beta1
kind: ClusterConfig
...
nodeGroups:
  - ...
    os: Bottlerocket
    eksconfig:
      ...
      sysctls:
        kernel.sys_paranoid: "1"
```

Utilice la consola de administración de AWS, la CLI de AWS o `eksctl` para
aplicar la configuración actualizada a su clúster EKS.

Para obtener más información, consulte la
[documentación sobre la configuración del sistema operativo host de EKS](https://anywhere.eks.amazonaws.com/docs/getting-started/optional/hostosconfig/).

## Ejemplos de escenarios {#example-scenarios}

Los siguientes ejemplos de escenarios muestran cómo ejecutar OBI como usuario no
root:

### Métricas de red a través de un filtro de socket {#network-metrics-via-a-socket-filter}

Capacidades necesarias:

- `CAP_BPF`
- `CAP_NET_RAW`

Configure las capacidades necesarias e inicie OBI:

```shell
sudo setcap cap_bpf,cap_net_raw+ep ./bin/obi
OBI_NETWORK_METRICS=1 OBI_NETWORK_PRINT_FLOWS=1 bin/obi
```

### Métricas de red mediante control de tráfico {#network-metrics-via-traffic-control}

Capacidades necesarias:

- `CAP_BPF`
- `CAP_NET_ADMIN`
- `CAP_PERFMON`

Configure las capacidades necesarias e inicie OBI:

```shell
sudo setcap cap_bpf,cap_net_admin,cap_perfmon+ep ./bin/obi
OBI_NETWORK_METRICS=1 OBI_NETWORK_PRINT_FLOWS=1 OBI_NETWORK_SOURCE=tc bin/obi
```

### Observabilidad de la aplicación {#application-observability}

Capacidades requeridas:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`

Configura las capacidades requeridas e inicie OBI:

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace+ep ./bin/obi
OBI_OPEN_PORT=8080 OBI_TRACE_PRINTER=text bin/obi
```

### Observabilidad de aplicaciones con propagación del contexto de trazado {#application-observability-with-trace-context-propagation}

Capacidades requeridas:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`
- `CAP_NET_ADMIN`

Configura las capacidades requeridas e inicie OBI:

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace,cap_net_admin+ep ./bin/obi
OBI_ENABLE_CONTEXT_PROPAGATION=all OBI_OPEN_PORT=8080 OBI_TRACE_PRINTER=text bin/obi
```

## Referencia de requisitos de capacidad del rastreador eBPF interno {#internal-ebpf-tracer-capability-requirement-reference}

OBI utiliza _rastreadores_, un conjunto de programas eBPF que implementan la
funcionalidad subyacente. Un rastreador puede cargar y utilizar diferentes tipos
de programas eBPF, cada uno de los cuales requiere su propio conjunto de
capacidades.

La siguiente lista asigna a cada rastreador interno las capacidades que
requiere, con el fin de servir de referencia para los desarrolladores,
colaboradores y personas interesadas en el funcionamiento interno de OBI:

**(Observabilidad de la red) obtiene el flujo de socket:**

- `CAP_BPF`: para `BPF_PROG_TYPE_SOCK_FILTER`
- `CAP_NET_RAW`: para crear un socket `AF_PACKET` y adjuntar filtros de socket a
  una interfaz de red

**(Observabilidad de la red) Flow fetcher (tc):**

- CAP_BPF
- CAP_NET_ADMIN: para cargar programas eBPF TC PROG_TYPE_SCHED_CLS, utilizados
  para inspeccionar el tráfico de red
- `CAP_PERFMON`: para acceder directamente a la memoria de paquetes a través de
  `struct __sk_buff::data` y permitir la aritmética de punteros en programas
  eBPF

**(Observabilidad de la aplicación) Observador:**

- `CAP_BPF`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_DAC_READ_SEARCH`: para acceder a `/proc/self/mem` y determinar la versión
  del kernel
- `CAP_PERFMON`: para cargar programas eBPF `BPF_PROG_TYPE_KPROBE` que requieren
  aritmética de punteros

**(Observabilidad de la aplicación) Compatibilidad con otros lenguajes además de
Go:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: para crear el socket `AF_PACKET` utilizado para conectar
  `obi_socket__http_filter` a las interfaces de red
- `CAP_SYS_PTRACE`: para acceder a `/proc/pid/exe` y otros nodos en `/proc`

**(Observabilidad de aplicaciones y redes) Supervisión de redes en modo TC y
propagación de contexto:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_PERFMON`
- `CAP_NET_ADMIN`: permite cargar `BPF_PROG_TYPE_SCHED_CLS`,
  `BPF_PROG_TYPE_SOCK_OPS` y `BPF_PROG_TYPE_SK_MSG`, todos ellos utilizados por
  la propagación del contexto de trazado y la supervisión de la red

**(Observabilidad de la aplicación) Rastreador GO:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: para crear el socket `AF_PACKET` utilizado para conectar
  `obi_socket__http_filter` a las interfaces de red
- `CAP_SYS_PTRACE`: para acceder a `/proc/pid/exe` y otros nodos en `/proc`
- `CAP_SYS_ADMIN`: para la propagación del contexto a nivel de biblioteca basada
  en sondas
- (probes `bpf_probe_write_user()`)
