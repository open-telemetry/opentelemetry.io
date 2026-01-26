---
title: Despliegue con Docker
linkTitle: Docker
aliases: [docker_deployment]
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
cSpell:ignore: otlphttp spanmetrics tracetest tracetesting
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## Prerrequisitos

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0.0+
- Make (opcional)
- 6 GB de RAM para la aplicación
- 14 GB de espacio en disco

## Obtener y ejecutar la demo

1.  Clona el repositorio de la Demo:

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2.  Cambia a la carpeta de la demo:

    ```shell
    cd opentelemetry-demo/
    ```

3.  Inicia la demo[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4.  (Opcional) Habilita las pruebas basadas en observabilidad de API[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-tracetesting
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f docker-compose-tests.yml run traceBasedTests
```

    {{% /tab %}} {{< /tabpane >}}

## Verificar la tienda web y la Telemetría

Una vez que las imágenes estén construidas y los contenedores iniciados, puedes
acceder a:

- Tienda web: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- UI del Generador de Carga: <http://localhost:8080/loadgen/>
- UI de Jaeger: <http://localhost:8080/jaeger/ui/>
- UI de Tracetest: <http://localhost:11633/>, solo cuando se usa
  `make run-tracetesting`
- UI del configurador de Flagd: <http://localhost:8080/feature>

## Cambiar el número de puerto principal de la demo

Por defecto, la aplicación de demostración iniciará un proxy para todo el
tráfico del navegador enlazado al puerto 8080. Para cambiar el número de puerto,
establece la variable de entorno `ENVOY_PORT` antes de iniciar la demo.

- Por ejemplo, para usar el puerto 8081[^1]:

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## Trae tu propio backend

Probablemente quieras usar la tienda web como aplicación de demostración para un
backend de observabilidad que ya tienes (por ejemplo, una instancia existente de
Jaeger, Zipkin, o uno de los [proveedores de tu elección](/ecosystem/vendors/)).

El OpenTelemetry Collector puede usarse para exportar datos de telemetría a
múltiples backends. Por defecto, el collector en la aplicación de demostración
fusionará la configuración de dos archivos:

- `otelcol-config.yml`
- `otelcol-config-extras.yml`

Para agregar tu backend, abre el archivo
[src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml)
con un editor.

- Comienza agregando un nuevo exporter. Por ejemplo, si tu backend soporta OTLP
  sobre HTTP, agrega lo siguiente:

  ```yaml
  exporters:
    otlphttp/example:
      endpoint: <your-endpoint-url>
  ```

- Luego sobrescribe los `exporters` para los pipelines de telemetría que quieras
  usar para tu backend.

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [spanmetrics, otlphttp/example]
  ```

> [!NOTE]
>
> Al fusionar valores YAML con el Collector, los objetos se fusionan y los
> arrays se reemplazan. El exporter `spanmetrics` debe incluirse en el array de
> exporters para el pipeline de `traces` si se sobrescribe. No incluir este
> exporter resultará en un error.

Los backends de proveedores pueden requerir que agregues parámetros adicionales
para autenticación, por favor revisa su documentación. Algunos backends
requieren diferentes exporters, puedes encontrarlos y su documentación
disponible en
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

Después de actualizar el `otelcol-config-extras.yml`, inicia la demo ejecutando
`make start`. Después de un momento, deberías ver las trazas fluyendo hacia tu
backend también.

[^1]: {{% param notes.docker-compose-v2 %}}
