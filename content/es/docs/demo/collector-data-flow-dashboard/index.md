---
title: Dashboard de flujo de datos del Collector
default_lang_commit: b98ab730de1f866d89a065fdac22b0ae123ec10c
cSpell:ignore: reinicios
---

Monitorear el flujo de datos a través del OpenTelemetry Collector es crucial por
varias razones. Obtener una perspectiva a nivel macro de los datos entrantes,
como conteos de muestras y cardinalidad, es esencial para comprender la dinámica
interna del collector. Sin embargo, al profundizar en los detalles, las
interconexiones pueden volverse complejas. El Dashboard de Flujo de Datos del
Collector tiene como objetivo demostrar las capacidades de la aplicación de
demostración de OpenTelemetry, ofreciendo una base sólida para que los usuarios
construyan sobre ella. El Dashboard de Flujo de Datos del Collector proporciona
una guía valiosa sobre qué métricas monitorear. Los usuarios pueden adaptar sus
propias variaciones del dashboard agregando métricas necesarias específicas para
sus casos de uso, como el procesador memory_delimiter u otros indicadores de
flujo de datos. Este dashboard de demostración sirve como punto de partida,
permitiendo a los usuarios explorar diversos escenarios de uso y adaptar la
herramienta a sus necesidades únicas de monitoreo.

## Descripción general del flujo de datos

El siguiente diagrama proporciona una descripción general de los componentes del
sistema, mostrando la configuración derivada del archivo de configuración del
OpenTelemetry Collector (otelcol) utilizado por la aplicación de demostración de
OpenTelemetry. Además, destaca el flujo de datos de observabilidad (trazas y
métricas) dentro del sistema.

![Descripción General del OpenTelemetry Collector](otelcol-data-flow-overview.png)

## Métricas de Ingreso/Egreso

Las métricas representadas en el siguiente diagrama se emplean para monitorear
los flujos de datos tanto de egreso como de ingreso. Estas métricas son
generadas por el proceso otelcol, exportadas en el puerto 8888 y posteriormente
recolectadas por Prometheus. El namespace asociado con estas métricas es
"otelcol", y el nombre del job está etiquetado como `otel.`

![Métricas de Ingreso y Egreso del OpenTelemetry Collector](otelcol-data-flow-metrics.png)

Las etiquetas sirven como una herramienta valiosa para identificar conjuntos de
métricas específicos (como exporter, receiver o job), permitiendo la
diferenciación entre conjuntos de métricas dentro del namespace general. Es
importante notar que solo encontrarás métricas rechazadas si se exceden los
límites de memoria, según lo definido en el procesador memory delimiter.

### Pipeline de ingreso de trazas

- `otelcol_receiver_accepted_spans`
- `otelcol_receiver_refused_spans`
- `by (receiver,transport)`

### Pipeline de ingreso de métricas

- `otelcol_receiver_accepted_metric_points`
- `otelcol_receiver_refused_metric_points`
- `by (receiver,transport)`

### Procesador

Actualmente, el único procesador presente en la aplicación de demostración es un
procesador batch, que es utilizado tanto por los pipelines de trazas como de
métricas.

- `otelcol_processor_batch_batch_send_size_sum`

### Pipeline de egreso de trazas

- `otelcol_exporter_sent_spans`
- `otelcol_exporter_send_failed_spans`
- `by (exporter)`

### Pipeline de egreso de métricas

- `otelcol_exporter_sent_metric_points`
- `otelcol_exporter_send_failed_metric_points`
- `by (exporter)`

### Scraping de Prometheus

- `scrape_samples_scraped`
- `by (job)`

## Dashboard

Puedes acceder al dashboard navegando a la UI de Grafana, seleccionando el
dashboard **OpenTelemetry Collector** bajo el icono de explorar en el lado
izquierdo de la pantalla.

![Dashboard del OpenTelemetry Collector](otelcol-data-flow-dashboard.png)

El dashboard tiene cuatro secciones principales:

1. Métricas de Proceso
2. Pipeline de Trazas
3. Pipeline de Métricas
4. Scraping de Prometheus

Las secciones 2, 3 y 4 representan el flujo de datos general utilizando las
métricas mencionadas anteriormente. Además, se calcula la proporción de
exportación para cada pipeline para entender el flujo de datos.

### Proporción de exportación

La proporción de exportación es básicamente la relación entre las métricas del
receiver y del exporter. Puedes notar en la captura de pantalla del dashboard
anterior que la proporción de exportación en métricas es mucho más alta que las
métricas recibidas. Esto se debe a que la aplicación de demostración está
configurada para generar métricas de spans, que es un procesador que genera
métricas a partir de spans dentro del collector como se ilustra en el diagrama
de descripción general.

### Métricas de proceso

Se han agregado métricas de proceso muy limitadas pero informativas al
dashboard. Por ejemplo, podrías observar más de una instancia de otelcol
ejecutándose en el sistema durante reinicios o situaciones similares. Esto puede
ser útil para entender picos en el flujo de datos.

![Métricas de Proceso del OpenTelemetry Collector](otelcol-dashboard-process-metrics.png)
