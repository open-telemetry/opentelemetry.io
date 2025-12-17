---
title: Recursos
weight: 70
default_lang_commit: 788277e362bc602b72a90aa9191f9c05c403458e
---

## Introducción

{{% docs/languages/resources-intro %}}

Si utilizas [Jaeger](https://www.jaegertracing.io/) como tu backend de
observabilidad, los atributos de recurso se agrupan en la pestaña **Process**:

![Una captura de pantalla de Jaeger que muestra un ejemplo de los atributos de recursos asociados a una traza](screenshot-jaeger-resources.png)

Un recurso se añade al `TracerProvider` o `MetricProvider` cuando son creados
durante la inicialización. Esta asociación no se puede cambiar posteriormente.
Una vez que se añade un recurso, todos los spans y métricas producidos por un
`Tracer` o `Meter` del proveedor tendrán el recurso asociado a ellos.

## Atributos semánticos con valor predeterminado proporcionado por el SDK

Existen atributos proporcionados por el SDK de OpenTelemetry. Uno de ellos es
`service.name`, que representa el nombre lógico del servicio. De forma
predeterminada, los SDK asignarán el valor `unknown_service` para este atributo,
por lo que se recomienda establecerlo explícitamente, ya sea en el código o
configurando la variable de entorno `OTEL_SERVICE_NAME`.

Además, el SDK también proporciona los siguientes atributos de recurso para
identificarse: `telemetry.sdk.name`, `telemetry.sdk.language` y
`telemetry.sdk.version`.

## Detectores de recursos

La mayoría de los SDK específicos de cada lenguaje proporcionan un conjunto de
detectores de recursos que pueden usarse para detectar automáticamente
información de recursos desde el entorno. Algunos detectores de recursos comunes
incluyen:

- [Sistema Operativo](/docs/specs/semconv/resource/os/)
- [Host](/docs/specs/semconv/resource/host/)
- [Proceso y tiempo de ejecución del proceso](/docs/specs/semconv/resource/process/)
- [Contenedor](/docs/specs/semconv/resource/container/)
- [Kubernetes](/docs/specs/semconv/resource/k8s/)
- [Atributos específicos del proveedor de la nube](/docs/specs/semconv/resource/#cloud-provider-specific-attributes)
- [y más](/docs/specs/semconv/resource/)

## Recursos personalizados

También puedes proporcionar tus propios atributos de recurso. Puedes hacerlo en
el código o configurando la variable de entorno `OTEL_RESOURCE_ATTRIBUTES`. Si
corresponde, utiliza las
[convenciones semánticas para tus atributos de recurso](/docs/specs/semconv/resource).
Por ejemplo, puedes proporcionar el nombre de tu
[entorno de despliegue](/docs/specs/semconv/resource/deployment-environment/)
utilizando `deployment.environment.name`:

```shell
env OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=production yourApp
```
