---
title: Características de telemetría
linkTitle: Características de telemetría
aliases: [demo_features, features]
default_lang_commit: 5b243d6b471ea2b384fa931e7ebfece074b1f2e5
---

## OpenTelemetry

- **[Trazas de OpenTelemetry](/docs/concepts/signals/traces/)**: todos los
  servicios están instrumentados usando las bibliotecas de instrumentación
  disponibles de OpenTelemetry.
- **[Métricas de OpenTelemetry](/docs/concepts/signals/metrics/)**: servicios
  seleccionados están instrumentados usando las bibliotecas de instrumentación
  disponibles de OpenTelemetry. Se añadirán más a medida que se publiquen los
  SDKs relevantes.
- **[Logs de OpenTelemetry](/docs/concepts/signals/logs/)**: servicios
  seleccionados están instrumentados usando las bibliotecas de instrumentación
  disponibles de OpenTelemetry. Se añadirán más a medida que se publiquen los
  SDKs relevantes.
- **[OpenTelemetry Collector](/docs/collector/)**: todos los servicios están
  instrumentados y envían las trazas y métricas generadas al OpenTelemetry
  Collector vía gRPC. Las trazas recibidas se exportan a los logs y a Jaeger;
  las métricas y exemplars recibidos se exportan a logs y Prometheus.

## Soluciones de observabilidad

- **[Grafana](https://grafana.com/)**: todos los dashboards de métricas se
  almacenan en Grafana.
- **[Jaeger](https://www.jaegertracing.io/)**: todas las trazas generadas se
  envían a Jaeger.
- **[OpenSearch](https://opensearch.org/)**: todos los logs generados se envían
  a Data Prepper. OpenSearch se utiliza para centralizar los datos de logging de
  los servicios.
- **[Prometheus](https://prometheus.io/)**: todas las métricas y exemplars
  generados son recolectados por Prometheus.

## Entornos

- **[Docker](https://docs.docker.com)**: este ejemplo puede ejecutarse con
  Docker.
- **[Kubernetes](https://kubernetes.io/)**: la aplicación está diseñada para
  ejecutarse en Kubernetes (tanto localmente como en la nube) usando un chart de
  Helm.

## Protocolos

- **[gRPC](https://grpc.io/)**: los microservicios utilizan un alto volumen de
  llamadas gRPC para comunicarse entre sí.
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**: los microservicios
  utilizan HTTP donde gRPC no está disponible o no está bien soportado.

## Otros componentes

- **[Envoy](https://www.envoyproxy.io/)**: Envoy se utiliza como proxy inverso
  para las interfaces web orientadas al usuario, como el frontend, el generador
  de carga y el servicio de feature flags.
- **[Locust](https://locust.io)**: un trabajo en segundo plano que crea patrones
  de uso realistas en el sitio web usando un generador de carga sintético.
- **[OpenFeature](https://openfeature.dev)**: una API y SDK de feature flagging
  que permite habilitar y deshabilitar características en la aplicación.
- **[flagd](https://flagd.dev)**: un daemon de feature flagging que se utiliza
  para gestionar feature flags en la aplicación de demostración.
- **[llm](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/llm/)**:
  un Large Language Model (LLM) simulado que sigue el formato de la
  [API de Chat Completions de OpenAI](https://platform.openai.com/docs/api-reference/chat/create)
  y responde preguntas sobre un producto.
