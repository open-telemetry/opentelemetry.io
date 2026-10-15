---
title: Implementar OBI en Kubernetes con Helm
linkTitle: Helm chart
description: Aprende a implementar OBI como un gráfico Helm en Kubernetes.
weight: 3
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
build:
  list: never
draft: true
toc_hide: true
---

{{% alert title="Nota" %}}

Para obtener más detalles sobre las diversas opciones de configuración de Helm,
consulta el
documento[Opciones del gráfico Helm de OBI](https://github.com/open-telemetry/opentelemetry-helm-charts/).

{{% /alert %}}

Contenido:

- [Implementación de OBI desde Helm {#deploying-obi-from-helm}](#deploying-obi-from-helm)
- [Configuración de OBI {#configuring-obi}](#configuring-obi)
- [Configuración de los metadatos de OBI {#configuring-obi-metadata}](#configuring-obi-metadata)
- [Proporcionar secretos a la configuración de Helm {#providing-secrets-to-helm-configuration}](#providing-secrets-to-helm-configuration)

## Implementación de OBI desde Helm {#deploying-obi-from-helm}

En primer lugar, debes agregar el repositorio de OpenTelemetry Helm a Helm:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

El siguiente comando implementa un DaemonSet de OBI con una configuración
predeterminada en el namespace `obi`:

```sh
helm install obi -n obi --create-namespace open-telemetry/opentelemetry-ebpf-instrumentation
```

La configuración predeterminada de OBI:

- exporta las métricas como métricas de Prometheus en el puerto HTTP del pod
  `9090`, ruta `/metrics`.
- intenta instrumentar todas las aplicaciones de su clúster.
- solo proporciona métricas a nivel de aplicación y excluye
  [las métricas a nivel de red](../../network/) de forma predeterminada.
- configura OBI para decorar las métricas con etiquetas de metadatos de
  Kubernetes, por ejemplo `k8s.namespace.name` o `k8s.pod.name`

## Configuración de OBI {#configuring-obi}

Es posible que desees anular la configuración predeterminada de OBI. Por
ejemplo, para exportar las métricas y/o los intervalos como OpenTelemetry en
lugar de Prometheus, o para restringir el número de servicios que se van a
instrumentar.

Puedes anular las opciones de configuración predeterminadas de OBI con sus
propios valores.

Por ejemplo, cree un archivo `helm-obi.yml` con una configuración personalizada:

```yaml
config:
  data:
    # Contents of the actual OBI configuration file
    discovery:
      instrument:
        - k8s_namespace: demo
        - k8s_namespace: blog
    routes:
      unmatched: heuristic
```

La sección `config.data` contiene un archivo de configuración OBI, documentado
en la
[documentación de opciones de configuración OBI](../../configure/options/).

A continuación, pasa la configuración sobrescrita al comando `helm` con el
indicador `-f`. Por ejemplo:

```sh
helm install obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

o, si el gráfico OBI fue implementado previamente:

```sh
helm upgrade obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

## Configuración de los metadatos de OBI {#configuring-obi-metadata}

Si OBI exporta los datos utilizando el exportador Prometheus, es posible que
tengas que anular las anotaciones del pod OBI para que su rastreador Prometheus
pueda detectarlo. Puedes añadir la siguiente sección al archivo de ejemplo
`helm-obi.yml`:

```yaml
podAnnotations:
  prometheus.io/scrape: 'true'
  prometheus.io/path: '/metrics'
  prometheus.io/port: '9090'
```

Análogamente, el gráfico Helm permite anular nombres, etiquetas y anotaciones
para múltiples recursos involucrados en la implementación de OBI, tales como
cuentas de servicio, roles de clúster, contextos de seguridad, etc. La
[documentación del gráfico Helm de OBI](https://github.com/open-telemetry/opentelemetry-helm-charts/)
describe las diversas opciones de configuración.

## Proporcionar secretos a la configuración de Helm {#providing-secrets-to-helm-configuration}

Si envías directamente las métricas y los rastros a su backend de observabilidad
a través del punto final de OpenTelemetry, es posible que debas proporcionar
credenciales a través de la variable de entorno `OTEL_EXPORTER_OTLP_HEADERS`.

Lo recomendable es almacenar dicho valor en un Kubernetes Secret y, a
continuación, especificar la variable de entorno que hace referencia a él desde
la configuración de Helm.

Por ejemplo, implementa el siguiente secreto:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: obi-secret
type: Opaque
stringData:
  otlp-headers: 'Authorization=Basic ....'
```

Luego, hacer referencia a él desde el archivo `helm-config.yml` en la sección
`envValueFrom`:

```yaml
env:
  OTEL_EXPORTER_OTLP_ENDPOINT: '<...your OTLP endpoint URL...>'
envValueFrom:
  OTEL_EXPORTER_OTLP_HEADERS:
    secretKeyRef:
      key: otlp-headers
      name: obi-secret
```
