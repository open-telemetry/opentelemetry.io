---
title: Inyectando auto-instrumentación
linkTitle: Auto-instrumentación
weight: 11
description: Una implementación de auto-instrumentación usando el Operador de OpenTelemetry
# prettier-ignore
cSpell:ignore: GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver PTRACE REDISCALA Werkzeug
default_lang_commit: f9893e13ba9ea10f1b5bcecb52cdd3d907bf0fd9 
---

El OpenTelemetry Operator admite la inyección y configuración de
bibliotecas de auto-instrumentación para servicios de .NET, Java, Node.js, Python y Go.

## Instalación

Primero, instala el
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
en tu clúster.

Puedes hacerlo con el
[manifesto de lanzamiento del operador](https://github.com/open-telemetry/opentelemetry-operator#getting-started),
el
[helm chart del operador](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator#opentelemetry-operator-helm-chart),
o con [Operator Hub](https://operatorhub.io/operator/opentelemetry-operator).

En la mayoría de los casos, necesitarás instalar
[cert-manager](https://cert-manager.io/docs/installation/). Si usas el helm
chart, hay una opción para generar un certificado autofirmado en su lugar.

> Si deseas usar la auto-instrumentación de Go, necesitas habilitar la puerta de
> características. Consulta
> [Controlando las capacidades de instrumentación](https://github.com/open-telemetry/opentelemetry-operator#controlling-instrumentation-capabilities)
> para más detalles.

## Crear un OpenTelemetry Collector (Opcional)

Es una buena práctica enviar telemetría desde contenedores a un
[OpenTelemetry Collector](../../collector/) en lugar de directamente a un backend.
El Collector ayuda a simplificar la gestión de secretos, desacopla los problemas de exportación de datos
(como la necesidad de hacer reintentos) de tus aplicaciones, y te permite agregar datos adicionales
a tu telemetría, como con el
[k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)
componente. Si decides no usar un Collector, puedes saltar a la siguiente
sección.

El operador proporciona una
[Definición de Recurso Personalizado (CRD) para el OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector)
que se utiliza para crear una instancia del Collector que el operador gestiona.
El siguiente ejemplo despliega el Collector como un despliegue (el predeterminado), pero
hay otros
[módulos de despliegue](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes)
que se pueden usar.

Al usar el modo `Deployment`, el operador también creará un servicio que
se puede usar para interactuar con el Collector. El nombre del servicio es el nombre
del recurso `OpenTelemetryCollector` precedido por `-collector`. Para nuestro
ejemplo, será `demo-collector`.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: demo
spec:
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
      batch:
        send_batch_size: 10000
        timeout: 10s

    exporters:
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

El comando anterior resulta en un despliegue del Collector que puedes usar como un punto final para la auto-instrumentación en tus pods.

## Configurar la Instrumentación Automática

Para poder gestionar la instrumentación automática, el operador necesita ser configurado para saber qué pods instrumentar y qué instrumentación automática usar para esos pods. Esto se hace a través de la
[CRD de Instrumentación](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentation).

Crear el recurso de Instrumentación correctamente es fundamental para que la auto-instrumentación funcione. Asegurarse de que todos los puntos finales y variables de entorno sean correctos es necesario para que la auto-instrumentación funcione adecuadamente.

### .NET

El siguiente comando creará un recurso de Instrumentación básico que está configurado específicamente para instrumentar servicios de .NET.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Por defecto, el recurso de Instrumentación que auto-instrumenta los servicios de .NET usa  `otlp` con el protocolo `http/protobuf`. Esto significa que el punto final configurado debe ser capaz de recibir OTLP a través de `http/protobuf`. or lo tanto, el ejemplo usa `http://demo-collector:4318`, que se conectará al puerto `http`  del `otlpreceiver` del Collector creado en el paso anterior.

#### Excluyendo la auto-instrumentación {#dotnet-excluding-auto-instrumentation}

Por defecto, la auto-instrumentación de .NET se envía con
[many instrumentation libraries](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#instrumentations).
 Esto facilita la instrumentación, pero podría resultar en demasiados datos o datos no deseados. Si hay bibliotecas que no deseas usar, puedes establecer el
`OTEL_DOTNET_AUTO_[SIGNAL]_[NAME]_INSTRUMENTATION_ENABLED=false` donde
`[SIGNAL]` es el tipo de señal y  `[NAME]` es el nombre sensible a mayúsculas de la biblioteca.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  dotnet:
    env:
      - name: OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_ENABLED
        value: false
      - name: OTEL_DOTNET_AUTO_METRICS_PROCESS_INSTRUMENTATION_ENABLED
        value: false
```

#### Aprende más {#dotnet-learn-more}

Para más detalles, consulta [.NET Auto Instrumentation docs](/docs/zero-code/net/).

### Java

El siguiente comando crea un recurso de Instrumentación básico que está configurado para instrumentar servicios de Java.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Por defecto, el recurso de Instrumentación que auto-instrumenta los servicios de Java usa `otlp` con el protocolo `http/protobuf`. Esto significa que el punto final configurado debe ser capaz de recibir OTLP a través de `http` mediante cargas útiles de `protobuf`. Por lo tanto, el ejemplo usa `http://demo-collector:4318`, que se conecta al puerto `http` del otlpreceiver del Collector creado en el paso anterior.

#### Excluyendo la auto-instrumentación {#java-excluding-auto-instrumentation}

Por defecto, la auto-instrumentación de Java se envía con
[muchas bibliotecas de instrumentación](/docs/zero-code/java/agent/getting-started/#supported-libraries-frameworks-application-services-and-jvms).
 Esto facilita la instrumentación, pero podría resultar en demasiados datos o datos no deseados. Si hay bibliotecas que no deseas usar, puedes establecer el `OTEL_INSTRUMENTATION_[NAME]_ENABLED=false` donde `[NAME]` es el nombre de la biblioteca. Para más detalles, consulta
[Suprimir instrumentación específica](/docs/zero-code/java/agent/disable/).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  java:
    env:
      - name: OTEL_INSTRUMENTATION_KAFKA_ENABLED
        value: false
      - name: OTEL_INSTRUMENTATION_REDISCALA_ENABLED
        value: false
```

#### Aprende más {#java-learn-more}

Para más detalles, consulta
[Configuración del agente de Java](/docs/zero-code/java/agent/configuration/).

### Node.js

El siguiente comando crea un recurso de Instrumentación básico que está configurado para instrumentar servicios de Node.js.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Por defecto, el recurso de Instrumentación que auto-instrumenta los servicios de Node.js usa `otlp` con el protocolo `grpc`. Esto significa que el punto final configurado debe ser capaz de recibir OTLP a través de `grpc`. Por lo tanto, el ejemplo usa
`http://demo-collector:4317`, que se conecta al puerto `grpc` del `otlpreceiver` del Collector creado en el paso anterior.

#### Excluyendo bibliotecas de instrumentación {#js-excluding-instrumentation-libraries}

Por defecto, la instrumentación de cero código de Node.js tiene todas las bibliotecas de instrumentación habilitadas.

Para habilitar solo bibliotecas de instrumentación específicas, puedes usar la variable de entorno `OTEL_NODE_ENABLED_INSTRUMENTATIONS` como se documenta en la
[Documentación de instrumentación de cero código de Node.js](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... other fields skipped from this example
spec:
  # ... other fields skipped from this example
  nodejs:
    env:
      - name: OTEL_NODE_ENABLED_INSTRUMENTATIONS
        value: http,nestjs-core # comma-separated list of the instrumentation package names without the `@opentelemetry/instrumentation-` prefix.
```

Para mantener todas las bibliotecas predeterminadas y deshabilitar solo bibliotecas de instrumentación específicas, puedes usar la variable de entorno `OTEL_NODE_DISABLED_INSTRUMENTATIONS`. Para más detalles, consulta
[Excluyendo bibliotecas de instrumentación](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... other fields skipped from this example
spec:
  # ... other fields skipped from this example
  nodejs:
    env:
      - name: OTEL_NODE_DISABLED_INSTRUMENTATIONS
        value: fs,grpc # comma-separated list of the instrumentation package names without the `@opentelemetry/instrumentation-` prefix.
```

{{% alert title="Nota" color="info" %}}

Si ambas variables de entorno están establecidas, `OTEL_NODE_ENABLED_INSTRUMENTATIONS` se aplica primero, y luego `OTEL_NODE_DISABLED_INSTRUMENTATIONS` se aplica a esa lista. Por lo tanto, si la misma instrumentación está incluida en ambas listas, esa instrumentación será deshabilitada.

{{% /alert %}}

#### Aprende más {#js-learn-more}

Para más detalles, consulta
[Auto-instrumentación de Node.js](/docs/languages/js/libraries/#registration).

### Python

El siguiente comando creará un recurso de Instrumentación básico que está configurado específicamente para instrumentar servicios de Python.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Por defecto, el recurso de `Instrumentation` que auto-instrumenta los servicios de Python usa `otlp` con el protocolo `http/protobuf` (gRPC no es compatible en este momento). Esto significa que el punto final configurado debe ser capaz de recibir OTLP a través de `http/protobuf`. Por lo tanto, el ejemplo usa `http://demo-collector:4318`, que se conectará al puerto http del `otlpreceiver` del Collector creado en el paso anterior.

> A partir de la versión v0.67.0 del operador, el recurso de Instrumentación establece automáticamente
> `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` y `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`
> en `http/protobuf` para los servicios de Python. Si usas una versión anterior del
> O operador, **DEBES** establecer estas variables de entorno en `http/protobuf`,
> o la auto-instrumentación de Python no funcionará.

#### Auto-instrumentando registros de Python

Por defecto, la auto-instrumentación de registros de Python está deshabilitada. Si deseas habilitar esta función, debes establecer las variables de entorno `OTEL_LOGS_EXPORTER` y `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` de la siguiente manera:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: python-instrumentation
  namespace: application
spec:
  exporter:
    endpoint: http://demo-collector:4318
  env:
  propagators:
    - tracecontext
    - baggage
  python:
    env:
      - name: OTEL_LOGS_EXPORTER
        value: otlp_proto_http
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

> Ten en cuenta que `OTEL_LOGS_EXPORTER` debe establecerse explícitamente en `otlp_proto_http`, de lo contrario,
> se predetermina a gRPC.

#### Excluyendo la auto-instrumentación {#python-excluding-auto-instrumentation}

Por defecto, la auto-instrumentación de Python se envía con
[muchas bibliotecas de instrumentación](https://github.com/open-telemetry/opentelemetry-operator/blob/main/autoinstrumentation/python/requirements.txt).
 Esto facilita la instrumentación, pero puede resultar en demasiados datos o datos no deseados. Si hay paquetes que no deseas instrumentar, puedes establecer la variable de entorno `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS`.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  python:
    env:
      - name: OTEL_PYTHON_DISABLED_INSTRUMENTATIONS
        value:
          <comma-separated list of package names to exclude from
          instrumentation>
```

Consulta la
[documentación de configuración del agente de Python](/docs/zero-code/python/configuration/#disabling-specific-instrumentations)
 para más detalles.

#### Aprende más {#python-learn-more}

Para peculiaridades específicas de Python, consulta
[documentación del operador de OpenTelemetry para Python](/docs/zero-code/python/operator/#python-specific-topics)
 y la
[documentación de configuración del agente de Python](/docs/zero-code/python/configuration/).

### Go

El siguiente comando crea un recurso de Instrumentación básico que está configurado específicamente para instrumentar servicios de Go.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Por defecto, el recurso de Instrumentación que auto-instrumenta los servicios de Go usa `otlp` con el protocolo `http/protobuf`. Esto significa que el punto final configurado debe ser capaz de recibir OTLP a través de `http/protobuf`. Por lo tanto, el ejemplo usa `http://demo-collector:4318`, que se conecta al puerto `http/protobuf` del `otlpreceiver` del Collector creado en el paso anterior.

La auto-instrumentación de Go no admite deshabilitar ninguna instrumentación.
[Consulta el repositorio de Auto-Instrumentación de Go para más detalles.](https://github.com/open-telemetry/opentelemetry-go-instrumentation)

---

Ahora que tu objeto de Instrumentación está creado, tu clúster tiene la capacidad de auto-instrumentar servicios y enviar datos a un punto final. Sin embargo, la auto-instrumentación con el OpenTelemetry Operator sigue un modelo de opt-in. Para activar la instrumentación automática, necesitarás agregar una anotación a tu despliegue.

## Agregar anotaciones a despliegues existentes

El paso final es optar por tus servicios a la instrumentación automática. Esto se hace actualizando las `spec.template.metadata.annotations` de tu servicio para incluir una anotación específica del lenguaje:

- .NET: `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Go: `instrumentation.opentelemetry.io/inject-go: "true"`
- Java: `instrumentation.opentelemetry.io/inject-java: "true"`
- Node.js: `instrumentation.opentelemetry.io/inject-nodejs: "true"`
- Python: `instrumentation.opentelemetry.io/inject-python: "true"`

Los valores posibles para la anotación pueden ser

- `"true"` - para inyectar el recurso de `Instrumentation` con el nombre predeterminado del espacio de nombres actual.
- `"my-instrumentation"` - para inyectar la instancia de CR de `Instrumentation` con el nombre `"my-instrumentation"` en el espacio de nombres actual.
- `"my-other-namespace/my-instrumentation"` - para inyectar la instancia de CR de `Instrumentation` con el nombre - - - - `"my-instrumentation"` desde otro espacio de nombres `"my-other-namespace"`.
- `"false"` - no inyectar

Alternativamente, la anotación se puede agregar a un espacio de nombres, lo que resultará en que todos los servicios en ese espacio de nombres opten por la instrumentación automática. Consulta la
[documentación de auto-instrumentación de operadores](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection)
 para más detalles.

### Optar por un Servicio de Go

UA diferencia de la auto-instrumentación de otros lenguajes, Go funciona a través de un agente eBPF que se ejecuta a través de un sidecar. Cuando optas por ello, el operador inyectará este sidecar en tu pod. Además de la anotación `instrumentation.opentelemetry.io/inject-go` mencionada anteriormente, también debes proporcionar un valor para la
[variable de entorno `OTEL_GO_AUTO_TARGET_EXE`](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/how-it-works.md).
 Puedes establecer esta variable de entorno a través de la anotación `instrumentation.opentelemetry.io/otel-go-auto-target-exe` .

```yaml
instrumentation.opentelemetry.io/inject-go: 'true'
instrumentation.opentelemetry.io/otel-go-auto-target-exe: '/path/to/container/executable'
```

Esta variable de entorno también se puede establecer a través del recurso de Instrumentación, con la anotación teniendo prioridad. Dado que la auto-instrumentación de Go requiere que `OTEL_GO_AUTO_TARGET_EXE` esté establecida, debes proporcionar una ruta ejecutable válida a través de la anotación o el recurso de Instrumentación. No establecer este valor provoca que la inyección de instrumentación se aborte, dejando el pod original sin cambios.

Dado que la auto-instrumentación de Go utiliza eBPF, también requiere permisos elevados. Cuando optas por ello, el sidecar que inyecta el operador requerirá los siguientes permisos:

```yaml
securityContext:
  capabilities:
    add:
      - SYS_PTRACE
  privileged: true
  runAsUser: 0
```

## Solución de Problemas

Si encuentras problemas al intentar auto-instrumentar tu código, aquí hay algunas cosas que puedes intentar.

### ¿Se instaló el recurso de Instrumentación?

Después de instalar el recurso de `Instrumentation`, verifica que se haya instalado correctamente ejecutando este comando, donde `<namespace>` es el espacio de nombres en el que se despliega el recurso de `Instrumentation`:

```sh
kubectl describe otelinst -n <namespace>
```

Salida de ejemplo:

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
   Endpoint:  http://demo-collector.opentelemetry.svc.cluster.local:4318
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

### ¿Los registros del OTel Operator muestran algún error de auto-instrumentación?

Verifica los registros del OTel Operator en busca de errores relacionados con la auto-instrumentación ejecutando este comando:

```sh
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

### ¿Se desplegaron los recursos en el orden correcto?

¡El orden importa! El recurso de `Instrumentation` necesita ser desplegado antes de desplegar la aplicación, de lo contrario, la auto-instrumentación no funcionará.

Recuerda la anotación de auto-instrumentación:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

La anotación anterior le dice al OTel Operator que busque un objeto `Instrumentation` en el espacio de nombres del pod. También le dice al operador que inyecte la auto-instrumentación de Python en el pod.

Cuando el pod se inicia, la anotación le dice al operador que busque un objeto de Instrumentación en el espacio de nombres del pod y que inyecte la auto-instrumentación en el pod. Agrega un
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
 al pod de la aplicación, llamado opentelemetry-auto-instrumentation, que se utiliza para inyectar la auto-instrumentación en el contenedor de la aplicación.

Sin embargo, si el recurso de `Instrumentation` no está presente para cuando se despliega la aplicación, el init-container no puede ser creado. Por lo tanto, si la aplicación se despliega antes de desplegar el recurso de `Instrumentation`, la auto-instrumentación fallará.

Para asegurarte de que el init-container `opentelemetry-auto-instrumentation` se haya iniciado correctamente (o incluso se haya iniciado en absoluto), ejecuta el siguiente comando:

```sh
kubectl get events -n <your_app_namespace>
```

Lo que debería producir algo como esto:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Si la salida carece de entradas `Created` y/o `Started` para `opentelemetry-auto-instrumentation`, significa que hay un problema con tu auto-instrumentación. Esto puede ser el resultado de cualquiera de las siguientes razones:

- El recurso de `Instrumentation` no se instaló (o no se instaló correctamente).
- El recurso de `Instrumentation` se instaló después de que se desplegó la aplicación.
- Hay un error en la anotación de auto-instrumentación, o la anotación está en el lugar incorrecto — consulta el punto #4 a continuación.

Asegúrate de verificar la salida de `kubectl get events` en busca de errores, ya que estos podrían ayudar a señalar el problema

### ¿Es correcta la anotación de auto-instrumentación?

A veces, la auto-instrumentación puede fallar debido a errores en la anotación de auto-instrumentación.

Aquí hay algunas cosas que verificar:

- **¿Es la auto-instrumentación para el lenguaje correcto?** Por ejemplo, al instrumentar una aplicación de Python, asegúrate de que la anotación no diga incorrectamente `instrumentation`.`opentelemetry.io/inject-java: "true"` en su lugar.
- **¿Está la anotación de auto-instrumentación en la ubicación correcta?** Al definir un `Deployment`, las anotaciones se pueden agregar en una de dos ubicaciones: `spec.metadata.annotations`, y `spec.template.metadata.annotations`. La anotación de auto-instrumentación debe agregarse a `spec.template.metadata.annotations`, de lo contrario, no funcionará.

### ¿Se configuró correctamente el punto final de auto-instrumentación?

El atributo `spec.exporter.endpoint` del recurso de `Instrumentation` define dónde enviar los datos. Esto puede ser un [OTel Collector](/docs/collector/), o cualquier punto final OTLP. Si este atributo se omite, se predetermina a `http://localhost:4317`, que, lo más probable, no enviará datos de telemetría a ningún lugar.

Al enviar telemetría a un OTel Collector ubicado en el mismo clúster de Kubernetes, `spec.exporter.endpoint` debe hacer referencia al nombre del OTel Collector
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

Por ejemplo:

```yaml
spec:
  exporter:
    endpoint: http://demo-collector.opentelemetry.svc.cluster.local:4317
```

Aquí, el punto final del Collector se establece en
`http://demo-collector.opentelemetry.svc.cluster.local:4317`, donde
`demo-collector` es el nombre del `Service` de Kubernetes del OTel Collector. En el ejemplo anterior, el Collector se está ejecutando en un espacio de nombres diferente al de la aplicación, lo que significa que `opentelemetry.svc.cluster.local` debe ser agregado al nombre del servicio del Collector, donde `opentelemetry` es el espacio de nombres en el que reside el Collector.
