---
title: Despliegue en Kubernetes
linkTitle: Kubernetes
aliases: [kubernetes_deployment]
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
cSpell:ignore: configurarlos loadgen otlphttp spanmetrics
---

Proporcionamos un
[chart de Helm de la Demo de OpenTelemetry](/docs/platforms/kubernetes/helm/demo/)
para ayudar a desplegar la demo en un clúster de Kubernetes existente.

[Helm](https://helm.sh) debe estar instalado para usar los charts. Por favor
consulta la [documentación](https://helm.sh/docs/) de Helm para comenzar.

## Prerrequisitos

- Kubernetes 1.24+
- 6 GB de RAM libre para la aplicación
- Helm 3.14+ (solo para el método de instalación con Helm)

## Instalar usando Helm (recomendado)

Agrega el repositorio de Helm de OpenTelemetry:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Para instalar el chart con el nombre de release my-otel-demo, ejecuta el
siguiente comando:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

<!-- markdownlint-disable no-blanks-blockquote -->

> [!NOTE]
>
> El chart de Helm de la Demo de OpenTelemetry no soporta ser actualizado de una
> versión a otra. Si necesitas actualizar el chart, primero debes eliminar el
> release existente y luego instalar la nueva versión.

> [!NOTE]
>
> Se requiere la versión 0.11.0 o superior del chart de Helm de la Demo de
> OpenTelemetry para realizar todos los métodos de uso mencionados a
> continuación.

## Instalar usando kubectl

El siguiente comando instalará la aplicación de demostración en tu clúster de
Kubernetes.

```shell
kubectl create --namespace otel-demo -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-demo/main/kubernetes/opentelemetry-demo.yaml
```

> [!NOTE]
>
> Los manifiestos de Kubernetes de la Demo de OpenTelemetry no soportan ser
> actualizados de una versión a otra. Si necesitas actualizar la demo, primero
> debes eliminar los recursos existentes y luego instalar la nueva versión.

> [!NOTE]
>
> Estos manifiestos se generan a partir del chart de Helm y se proporcionan por
> conveniencia. Se recomienda usar el chart de Helm para la instalación.

## Usar la demo

La aplicación de demostración necesitará que los servicios estén expuestos fuera
del clúster de Kubernetes para poder usarlos. Puedes exponer los servicios a tu
sistema local usando el comando `kubectl port-forward` o configurando tipos de
servicio (ej: LoadBalancer) con recursos de ingress opcionalmente desplegados.

### Exponer servicios usando kubectl port-forward

Para exponer el servicio frontend-proxy usa el siguiente comando (reemplaza
`default` con el namespace de tu release de Helm según corresponda):

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

> [!NOTE]
>
> `kubectl port-forward` hace proxy del puerto hasta que el proceso termina.
> Puede que necesites crear sesiones de terminal separadas para cada uso de
> `kubectl port-forward`, y usar <kbd>Ctrl-C</kbd> para terminar el proceso
> cuando hayas terminado.

Con el port-forward de frontend-proxy configurado, puedes acceder a:

- Tienda web: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- UI del Generador de Carga: <http://localhost:8080/loadgen/>
- UI de Jaeger: <http://localhost:8080/jaeger/ui/>
- UI del configurador de Flagd: <http://localhost:8080/feature>

### Exponer componentes de la demo usando configuraciones de servicio o ingress

> [!NOTE]
>
> Recomendamos que uses un archivo de valores cuando instales el chart de Helm
> para especificar opciones de configuración adicionales.

#### Configurar recursos de ingress

> [!NOTE]
>
> Los clústeres de Kubernetes pueden no tener los componentes de infraestructura
> adecuados para habilitar tipos de servicio LoadBalancer o recursos de ingress.
> Verifica que tu clúster tenga el soporte apropiado antes de usar estas
> opciones de configuración.

Cada componente de la demo (ej: frontend-proxy) ofrece una forma de configurar
su tipo de servicio de Kubernetes. Por defecto, estos no se crearán, pero puedes
habilitarlos y configurarlos a través de la propiedad `ingress` de cada
componente.

Para configurar el componente frontend-proxy para usar un recurso de ingress,
especificarías lo siguiente en tu archivo de valores:

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

Algunos controladores de ingress requieren anotaciones especiales o tipos de
servicio. Consulta la documentación de tu controlador de ingress para más
información.

#### Configurar tipos de servicio

Cada componente de la demo (ej: frontend-proxy) ofrece una forma de configurar
su tipo de servicio de Kubernetes. Por defecto, estos serán `ClusterIP` pero
puedes cambiar cada uno usando la propiedad `service.type` de cada componente.

Para configurar el componente frontend-proxy para usar un tipo de servicio
LoadBalancer, especificarías lo siguiente en tu archivo de valores:

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

#### Configurar telemetría del navegador

Para que los spans del navegador sean recolectados correctamente, también
necesitarás especificar la ubicación donde está expuesto el OpenTelemetry
Collector. El frontend-proxy define una ruta para el collector con un prefijo de
path de `/otlp-http`. Puedes configurar el endpoint del collector estableciendo
la siguiente variable de entorno en el componente frontend:

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## Trae tu propio backend

Probablemente quieras usar la tienda web como aplicación de demostración para un
backend de observabilidad que ya tienes (por ejemplo, una instancia existente de
Jaeger, Zipkin, o uno de los [proveedores de tu elección](/ecosystem/vendors/)).

La configuración del OpenTelemetry Collector está expuesta en el chart de Helm.
Cualquier adición que hagas se fusionará con la configuración predeterminada.

Puedes crear un archivo personalizado (ej., `my-values-file.yaml`) y usarlo para
agregar tus propios exporters a los pipeline(s) deseados:

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

> [!NOTE]
>
> Al fusionar valores YAML con Helm, los objetos se fusionan y los arrays se
> reemplazan. El exporter `spanmetrics` debe incluirse en el array de exporters
> para el pipeline de `traces` si se sobrescribe. No incluir este exporter
> resultará en un error.

Los backends de proveedores pueden requerir que agregues parámetros adicionales
para autenticación, por favor revisa su documentación. Algunos backends
requieren diferentes exporters, puedes encontrarlos y su documentación
disponible en
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

Para instalar el chart de Helm con un archivo de valores personalizado
`my-values-file.yaml` usa:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
