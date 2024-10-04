---
title: Primeros pasos
weight: 1
# prettier-ignore
cSpell:gnore: filelog filelogreceiver kubeletstats kubeletstatsreceiver loggingexporter otlpexporter sattributes sattributesprocessor sclusterreceiver sobjectsreceiver
---

Esta página te guiará a través de la forma más rápida de comenzar a monitorear tu clúster de Kubernetes usando OpenTelemetry. Se centrará en recopilar métricas y registros para clústeres, nodos, pods y contenedores de Kubernetes, además de habilitar el clúster para admitir servicios que emiten datos OTLP.

Si buscas ver OpenTelemetry en acción con Kubernetes, el mejor lugar
para iniciar es [OpenTelemetry Demo](/docs/demo/kubernetes-deployment/). El
La demo pretende ilustrar la implementación de OpenTelemetry, pero es
no pretende ser un ejemplo de cómo monitorear Kubernetes en sí. Una vez que
Terminar con este tutorial, puede ser un experimento divertido para instalar la demo y Vea cómo toda la supervisión responde a una carga de trabajo activa.

Si está buscando comenzar a migrar de Prometheus a OpenTelemetry, o si
Estás interesado en usar el Coleccionista de telemetría abierta para recopilar Prometheus Métricas, véase
[Prometheus Receiver](../coleccionista/componentes/#prometheus-receiver).

## Descripción general

Kubernetes expone una gran cantidad de telemetría importante de muchas maneras diferentes. Tiene
registros, eventos, métricas para muchos objetos diferentes y los datos generados por sus cargas de trabajo.

Para recopilar todos estos datos, utilizaremos la
[OpenTelemetry Collector](/docs/collector/). El coleccionista tiene muchos diferentes
herramientas a su disposición que le permitan recoger eficazmente todos estos datos y mejorarlo de manera significativa.

Para recopilar todos los datos, necesitaremos dos instalaciones del recopilador, una como
[Daemonset](/docs/collector/deployment/agent/) y uno como
[Deployment](/docs/collector/deployment/gateway/). La instalación de Daemonset de
El colector se utilizará para recolectar telemetría emitida por los servicios, registros y
Métricas para nodos, pods y contenedores. La instalación del
El recopilador se usará para recopilar métricas para el clúster y los eventos.

Para instalar el recopilador, usaremos el
[OpenTelemetry Collector Helm chart](../helm/collector/), que viene con algunos
Opciones de configuración que facilitarán la configuración del recopilador. Si eres
no familiarizado con Helm, visite [the Helm project site](https://helm.sh/). Si
Si está interesado en utilizar un operador de Kubernetes, consulte
[OpenTelemetry Operator](../operator/), pero esta guía se centrará en el timón
gráfico.

## Preparación

Esta guía supondrá el uso de un [Kind cluster](https://kind.sigs.k8s.io/),
pero eres libre de usar cualquier clúster de Kubernetes que consideres adecuado.

Suponiendo que ya lo has hecho
[Kind installed](https://kind.sigs.k8s.io/#installation-and-usage), crear un nuevo
Clúster de tipo:

```sh
kind create cluster
```

Suponiendo que ya tiene [Helm instalado](https://helm.sh/docs/intro/install/),
Agregue el gráfico de timón de OpenTelemetry Collector para que pueda instalarse más tarde.

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

## Daemonset Collector

El primer paso para recopilar la telemetría de Kubernetes es implementar un daemonset
instancia del Colector de telemetría OpenTelemetry para recopilar telemetría relacionada con nodos y
cargas de trabajo que se ejecutan en esos nodos. Se utiliza un daemonset para garantizar que esto
La instancia del recopilador está instalada en todos los nodos. Cada instancia del
El recopilador en el daemonset recopilará datos solo del nodo en el que se encuentra
corriendo.

Esta instancia del recopilador utilizará los siguientes componentes:

- [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver):
para recopilar trazas, métricas y registros de aplicaciones.
- [Kubernetes Attributes Processor](../collector/components/#kubernetes-attributes-processor):
para agregar metadatos de Kubernetes a la telemetría de la aplicación entrante.
- [Kubeletstats Receiver](../collector/components/#kubeletstats-receiver): a
extrae métricas de nodo, pod y contenedor del servidor API en un kubelet.
- [Filelog Receiver](../collector/components/#filelog-receiver): para recopilar
Registros de Kubernetes y registros de aplicaciones escritos en stdout/stderr.

Vamos a descomponerlos.

### Receptor OTLP

El
[OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
es la mejor solución para recopilar trazas, métricas y registros en el
[OTLP format](/docs/specs/otel/protocol/). Si usted está emitiendo la aplicación
La telemetría en otro formato, hay una buena posibilidad de que
[the Collector has a receiver for it](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver),
pero para este tutorial asumiremos que la telemetría está formateada en OTLP.

Aunque no es un requisito, es una práctica común para las aplicaciones que se ejecutan en
Un nodo para emitir sus trazas, métricas y registros a un recopilador que se ejecuta en el
el mismo nodo. Esto mantiene las interacciones de red simples y permite una fácil correlación de
Metadatos de Kubernetes usando el atributo `k8sattribute`

El [Kubeletstats Receiver](../collector/components/#kubeletstats-receiver) es
El receptor que reúne métricas sobre el nodo. Recopilará métricas como
Uso de la memoria del contenedor, uso de la CPU del pod y errores de red de nodos. Todos los
La telemetría incluye metadatos de Kubernetes como el nombre del pod o el nombre del nodo. Ya que estamos
mediante el procesador de atributos de Kubernetes, podremos correlacionar nuestros
rastreos, métricas y registros de aplicaciones con las métricas producidas por el
Receptor Kubeletstats.

### Receptor de registro de archivos

El [Filelog Receiver](../collector/components/#filelog-receiver) recogerá
registros escritos en stdout/stderr siguiendo los registros en los que Kubernetes escribe `/var/log/pods/*/*/*.log`. Al igual que la mayoría de los registros de seguimiento, el receptor de registro de archivos proporciona
Un conjunto robusto de acciones que le permiten analizar el archivo como lo necesite.

Es posible que algún día necesite configurar un receptor de registro de archivos por su cuenta, pero para esto
Un recorrido por el gráfico de timón de OpenTelemetry se encargará de todo el complejo
configuración para usted. Además, extraerá metadatos útiles de Kubernetes
Basado en el nombre del archivo. Ya que estamos usando el procesador de atributos de Kubernetes,
Podremos correlacionar las trazas, métricas y registros de la aplicación con el
registros producidos por el receptor Filelog.

---

El gráfico del timón del colector de OpenTelemetry hace que se configuren todos estos componentes
En un daemonset la instalación del colector es fácil. También se encargará de todo
de los detalles específicos de Kubernetes, como RBAC, montajes y puertos host.

Una advertencia: el gráfico no envía los datos a ningún back-end de forma predeterminada. Si usted
Si realmente quieres usar tus datos en tu backend favorito, tendrás que configurarlo
un exportador.

Lo que usaremos es el siguiente `values.yaml`

```yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-k8s

presets:

# Habilita el procesador K8Sattributes y lo agrega a las tuberías de rastreo, métricas y registros

kubernetesAttributes:
    enabled: true

# Habilita el receptor KubeletstatsReceiver y lo agrega a las canalizaciones de métricas

kubeletMetrics:
    enabled: true

# Habilita el receptor de archivos y lo agrega a las canalizaciones de registros

logsCollection:
    enabled: true

# El gráfico solo incluye el exportador de tala por defecto

# Si desea enviar sus datos a algún lugar, debe

# Configurar un exportador, como el otlexportador 

# configuración:
# exportadores:
# Ayuda:
# Punto final: "<SOME BACKEND>"
# servicio:
# tuberías:
# trazas:
# Exportadores: [ otlp ]
# Métricas:
# Exportadores: [ otlp ]
# registros:
# Exportadores: [ otlp ]
```

Para usar este `values.yaml` con el gráfico, guárdelo en su archivo preferido
y, a continuación, ejecute el siguiente comando para instalar el gráfico

```sh
helm install otel-collector open-telemetry/opentelemetry-collector --values <ruta donde guardó el gráfico>
```

Ahora debería tener una instalación de daemonset del Colector de telemetría abierta
Ejecutándose en el clúster recopilando telemetría de cada nodo.



## Deployment Collector

El siguiente paso para recopilar la telemetría de Kubernetes es implementar una implementación
instancia del Coleccionista para reunir telemetría relacionada con el cúmulo en su conjunto.

Una implementación con exactamente una réplica garantiza que no se produzcan duplicados
datos.

Esta instancia del Recopilador utilizará los siguientes componentes:

- [Kubernetes Cluster Receiver](../collector/components/#kubernetes-cluster-receiver):para recopilar métricas de nivel de clúster y eventos de entidad.

- [Kubernetes Objects Receiver](../collector/components/#kubernetes-objects-receiver):para recopilar objetos, como eventos, del servidor API de Kubernetes.

Vamos a descomponerlos.

### Kubernetes Cluster Receiver

El [Kubernetes Cluster Receiver](../collector/components/#kubernetes-cluster-receiver) es la solución del Coleccionista para recopilar métricas sobre el estado del
grupo en conjunto. Este receptor puede recopilar métricas sobre las condiciones del nodo, pod
fases, reinicios de contenedores, implementaciones disponibles y deseadas, y más.

### Kubernetes Objects Receiver

El [Kubernetes Objects Receiver](../collector/components/#kubernetes-objects-receiver) es la solución del Coleccionista para recolectar objetos de Kubernetes como registros. Aunque
Cualquier objeto puede ser recogido, un caso de uso común e importante es recoger
Eventos de Kubernetes.

---

El gráfico de timón de OpenTelemetry Collector optimiza la configuración de todos los
estos componentes en una instalación de implementación del Collector. También
Cuide todos los detalles específicos de Kubernetes, como RBAC y montajes.

Una advertencia: el gráfico no envía los datos a ningún back-end de forma predeterminada. Si usted
Si realmente quieres usar tus datos en tu backend preferido, tendrás que
Configure un exportador usted mismo.

Lo que usaremos es el siguiente `values.yaml`:

```yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-k8s
  
  # Solo queremos uno de estos recolectores - más y produciríamos datos duplicados
replicaCount: 1

presets:
# Habilita K8Sclusterreceiver y lo agrega a las canalizaciones de métricas

clusterMetrics:
    enabled: true
    # Permite que K8sobjectsreceiver recopile eventos únicamente y los agregue a las canalizaciones de logs
kubernetesEvents:
    enabled: true
## El gráfico solo incluye el exportador de registro de forma predeterminada
## Si desea enviar sus datos a algún lugar, debe
## Configurar un exportador, como el otlexportador

# configuración:
# exportadores:
# Ayuda:
# Punto final: "<SOME BACKEND>"
# servicio:
# tuberías:
# trazas:
# Exportadores: [ otlp ]
# Métricas:
# Exportadores: [ otlp ]
# registros:
# Exportadores: [ otlp ]
```

Para usar este `values.yaml` con el gráfico, guárdelo en su archivo preferido
y, a continuación, ejecute el siguiente comando para instalar el gráfico:

```sh
helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <ruta donde guardó el gráfico>
```

Ahora debería tener una instalación de implementación del recopilador ejecutándose en su
clúster que recopila métricas y eventos de clúster
