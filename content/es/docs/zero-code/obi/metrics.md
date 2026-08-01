---
title: Métricas exportadas por OBI
linkTitle: Métricas exportadas
description:
  Obtener información sobre las métricas HTTP/gRPC que OBI puede exportar.
weight: 21
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
cSpell:ignore: replicaset statefulset
---

La siguiente tabla describe las métricas exportadas tanto en formato
OpenTelemetry como en formato Prometheus.

| Family      | Name (OTel)                      | Name (Prometheus)                      | Type      | Unit    | Description                                                                                                           |
| ----------- | -------------------------------- | -------------------------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| Application | `http.client.request.duration`   | `http_client_request_duration_seconds` | Histogram | seconds | Duration of HTTP service calls from the client side                                                                   |
| Application | `http.client.request.body.size`  | `http_client_request_body_size_bytes`  | Histogram | bytes   | Size of the HTTP request body as sent by the client                                                                   |
| Application | `http.client.response.body.size` | `http_client_response_body_size_bytes` | Histogram | bytes   | Size of the HTTP response body as sent by the client                                                                  |
| Application | `http.server.request.duration`   | `http_server_request_duration_seconds` | Histogram | seconds | Duration of HTTP service calls from the server side                                                                   |
| Application | `http.server.request.body.size`  | `http_server_request_body_size_bytes`  | Histogram | bytes   | Size of the HTTP request body as received at the server side                                                          |
| Application | `http.server.response.body.size` | `http_server_response_body_size_bytes` | Histogram | bytes   | Size of the HTTP response body as received at the server side                                                         |
| Application | `rpc.client.duration`            | `rpc_client_duration_seconds`          | Histogram | seconds | Duration of gRPC service calls from the client side                                                                   |
| Application | `rpc.server.duration`            | `rpc_server_duration_seconds`          | Histogram | seconds | Duration of RPC service calls from the server side                                                                    |
| Application | `sql.client.duration`            | `sql_client_duration_seconds`          | Histogram | seconds | Duration of SQL client operations (Experimental)                                                                      |
| Application | `redis.client.duration`          | `redis_client_duration_seconds`        | Histogram | seconds | Duration of Redis client operations (Experimental)                                                                    |
| Application | `messaging.publish.duration`     | `messaging_publish_duration`           | Histogram | seconds | Duration of Messaging (Kafka) publish operations (Experimental)                                                       |
| Application | `messaging.process.duration`     | `messaging_process_duration`           | Histogram | seconds | Duration of Messaging (Kafka) process operations (Experimental)                                                       |
| Network     | `obi.network.flow.bytes`         | `obi_network_flow_bytes`               | Counter   | bytes   | Bytes submitted from a source network endpoint to a destination network endpoint                                      |
| Network     | `obi.network.inter.zone.bytes`   | `obi_network_inter_zone_bytes`         | Counter   | bytes   | Bytes flowing between cloud availability zones in your cluster (Experimental, currently only available in Kubernetes) |

OBI también puede exportar
[métricas de Span](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)
y
[métricas de gráficos de servicio](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector),
que se pueden habilitar mediante la opción de configuración
[features](../configure/options/).

## Atributos de las métricas OBI {#attributes-of-obi-metrics}

En pro de la brevedad, las métricas y los atributos de esta lista utilizan la
notación OTel «dot.notation». Cuando se utiliza el exportador Prometheus, las
métricas utilizan la notación «underscore_notation».

Para configurar qué atributos mostrar u ocultar, consulta la sección
`attributes`->`select` en la
[documentación de configuración](../configure/options/).

| Métrica                        | Nombre                       | Defecto                                                      |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------ |
| Application (all)              | `http.request.method`        | Visible                                                      |
| Application (all)              | `http.response.status_code`  | se Visible                                                   |
| Application (all)              | `http.route`                 | Se muestra si existe la sección de configuración `routes`    |
| Application (all)              | `k8s.daemonset.name`         | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.deployment.name`        | sSe muestra si los metadatos de Kubernetes están habilitados |
| Application (all)              | `k8s.namespace.name`         | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.node.name`              | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.owner.name`             | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.pod.name`               | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.container.name`         | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.pod.start_time`         | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.pod.uid`                | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.replicaset.name`        | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.statefulset.name`       | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `k8s.cluster.name`           | Se muestra si los metadatos de Kubernetes están habilitados  |
| Application (all)              | `service.name`               | Visible                                                      |
| Application (all)              | `service.namespace`          | Visible                                                      |
| Application (all)              | `target.instance`            | sVisible                                                     |
| Application (all)              | `url.path`                   | Oculto                                                       |
| Application (client)           | `server.address`             | Oculto                                                       |
| Application (client)           | `server.port`                | Oculto                                                       |
| Application `rpc.*`            | `rpc.grpc.status_code`       | Visible                                                      |
| Application `rpc.*`            | `rpc.method`                 | Visible                                                      |
| Application `rpc.*`            | `rpc.system`                 | Visible                                                      |
| Application (server)           | `client.address`             | Oculto                                                       |
| `obi.network.flow.bytes`       | `obi.ip`                     | Oculto                                                       |
| `db.client.operation.duration` | `db.operation.name`          | Visible                                                      |
| `db.client.operation.duration` | `db.collection.name`         | Oculto                                                       |
| `messaging.publish.duration`   | `messaging.system`           | Visible                                                      |
| `messaging.publish.duration`   | `messaging.destination.name` | Visible                                                      |
| `messaging.process.duration`   | `messaging.system`           | Visible                                                      |
| `messaging.process.duration`   | `messaging.destination.name` | Visible                                                      |
| `obi.network.flow.bytes`       | `client.port`                | Oculto                                                       |
| `obi.network.flow.bytes`       | `direction`                  | Oculto                                                       |
| `obi.network.flow.bytes`       | `dst.address`                | Oculto                                                       |
| `obi.network.flow.bytes`       | `dst.cidr`                   | Se muestra si existe la sección de configuración `cidrs`.    |
| `obi.network.flow.bytes`       | `dst.name`                   | Oculto                                                       |
| `obi.network.flow.bytes`       | `dst.port`                   | Oculto                                                       |
| `obi.network.flow.bytes`       | `dst.zone` (solo Kubernetes) | Oculto                                                       |
| `obi.network.flow.bytes`       | `iface`                      | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.cluster.name`           | Se muestra si Kubernetes está habilita                       |
| `obi.network.flow.bytes`       | `k8s.dst.name`               | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.dst.namespace`          | Se muestra si Kubernetes está habilitado                     |
| `obi.network.flow.bytes`       | `k8s.dst.node.ip`            | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.dst.node.name`          | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.dst.owner.type`         | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.dst.type`               | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.dst.owner.name`         | Se muestra si Kubernetes está habilitado.                    |
| `obi.network.flow.bytes`       | `k8s.src.name`               | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.src.namespace`          | Se muestra si Kubernetes está habilitado.                    |
| `obi.network.flow.bytes`       | `k8s.src.node.ip`            | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.src.owner.name`         | Se muestra si Kubernetes está habilitado.                    |
| `obi.network.flow.bytes`       | `k8s.src.owner.type`         | Oculto                                                       |
| `obi.network.flow.bytes`       | `k8s.src.type`               | Oculto                                                       |
| `obi.network.flow.bytes`       | `server.port`                | Oculto                                                       |
| `obi.network.flow.bytes`       | `src.address`                | Oculto                                                       |
| `obi.network.flow.bytes`       | `src.cidr`                   | Se muestra si existe la sección de configuración `cidrs`.    |
| `obi.network.flow.bytes`       | `src.name`                   | Oculto                                                       |
| `obi.network.flow.bytes`       | `src.port`                   | Oculto                                                       |
| `obi.network.flow.bytes`       | `src.zone` (solo Kubernetes) | Oculto                                                       |
| `obi.network.flow.bytes`       | `transport`                  | Oculto                                                       |
| Traces (SQL, Redis)            | `db.query.text`              | Oculto                                                       |

{{< alert type="note" >}} La métrica `obi.network.inter.zone.bytes` admite el
mismo conjunto de atributos que `obi.network.flow.bytes`, pero todos ellos están
ocultos de forma predeterminada, excepto `k8s.cluster.name`, `src.zone` y
`dst.zone`. {{< /alert >}}

## Métricas internas {#internal-metrics}

OBI se puede configurar para informar de métricas internas en formato
Prometheus.

| Nombre                               | Tipo       | Descripción                                                                                               |
| ------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------- |
| `obi_ebpf_tracer_flushes`            | Histograma | Longitud de los grupos de trazas enviadas desde el rastreador eBPF a la siguiente etapa del proceso.      |
| `obi_metric_exports_total`           | Counter    | Longitud de los batches métricos enviados al recolector OTel remoto                                       |
| `obi_metric_export_errors_total`     | CounterVec | Recuento de errores en cada exportación fallida de métricas OTel, por tipo de error                       |
| `obi_trace_exports_total`            | Counter    | Longitud de los lotes de trazado enviados al recolector OTel remoto                                       |
| `obi_trace_export_errors_total`      | CounterVec | Recuento de errores en cada exportación fallida de trazas OTel, por tipo de error                         |
| `obi_prometheus_http_requests_total` | CounterVec | Número de solicitudes al endpoint de Prometheus Scrape, filtradas por puerto HTTP y ruta                  |
| `obi_instrumented_processes`         | GaugeVec   | Procesos instrumentados por OBI, con nombre del proceso                                                   |
| `obi_internal_build_info`            | GaugeVec   | Información sobre la versión del binario OBI, incluyendo la hora de compilación y el hash de confirmación |
