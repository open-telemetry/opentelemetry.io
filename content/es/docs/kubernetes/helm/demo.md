---
title: OpenTelemetry Demo Chart
linkTitle: Demo Chart
default_lang_commit: 737d66aba66ab76da5edf2573eee225a14bf7579
---

La [OpenTelemetry Demo](/docs/demo/) es un sistema distribuido basado en
microservicios destinado a ilustrar la implementación de OpenTelemetry en un
entorno cercano al real. Como parte de ese esfuerzo, la comunidad de
OpenTelemetry creó el
[OpenTelemetry Demo Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo)
para que pueda ser instalado fácilmente en Kubernetes.

## Configuración

El `values.yaml` predeterminado del chart de Demo está listo para ser instalado.
Todos los componentes han tenido sus límites de memoria ajustados para optimizar
el rendimiento, lo que puede causar problemas si tu clúster no es lo
suficientemente grande. La instalación completa está restringida a ~4 Gigabytes
de memoria, pero puede usar menos.

Todas las opciones de configuración (con comentarios) disponibles en el chart se
pueden ver en su
[`values.yaml` file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/values.yaml),
y las descripciones detalladas se pueden encontrar en el
[README del chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo#chart-parameters).

## Instalación

Para instalar el chart con el nombre de lanzamiento `my-otel-demo`, ejecuta el
siguiente comando:

```sh
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

Una vez instalado, todos los servicios están disponibles a través del proxy
Frontend (http://localhost:8080) ejecutando estos comandos:

```sh
kubectl port-forward svc/my-otel-demo-frontendproxy 8080:8080
```

Una vez que el proxy esté expuesto, también puedes visitar las siguientes rutas

| Componente         | Ruta                              |
| ------------------ | --------------------------------- |
| Tienda web         | <http://localhost:8080>           |
| Grafana            | <http://localhost:8080/grafana>   |
| Interfaz de Flags  | <http://localhost:8080/feature>   |
| Interfaz de Carga  | <http://localhost:8080/loadgen>   |
| Interfaz de Jaeger | <http://localhost:8080/jaeger/ui> |

Para que los spans de la tienda web sean recolectados, debes exponer el receptor
OTLP/HTTP del OpenTelemetry Collector:

```sh
kubectl port-forward svc/my-otel-demo-otelcol 4318:4318
```

Para más detalles sobre el uso de la demo en Kubernetes, consulta
[Kubernetes deployment](/docs/demo/kubernetes-deployment/).
