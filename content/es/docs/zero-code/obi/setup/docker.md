---
title: Ejecutar OBI como un contenedor Docker
linkTitle: Docker
description:
  Aprende a configurar y ejecutar OBI como un contenedor Docker independiente
  que instrumenta otro contenedor.
weight: 2
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
cSpell:ignore: goblog
---

OBI puedes ejecutar un contenedor Docker independiente que puede instrumentar un
proceso que se ejecuta en otro contenedor.

Encuentra la última imagen de OBI en
[Docker Hub](https://hub.docker.com/r/otel/ebpf-instrument) con el siguiente
nombre:

```text
ebpf-instrument:main
```

El contenedor OBI debe configurarse de la siguiente manera:

- Ejecutarse como un contenedor **privilegiado** o como un contenedor con la
  capacidad `SYS_ADMIN` (pero esta última opción podría no funcionar en algunos
  entornos de contenedores).
- Utilizar el espacio de nombres PID `host` para permitir el acceso a los
  procesos de otros contenedores.

## Ejemplo de CLI de Docker {#docker-cli-example}

Para este ejemplo, se necesita un contenedor que ejecute un servicio HTTP/S o
gRPC. Si no tiene uno, puedes utilizar este
[sencillo servicio de motor de blog escrito en Go](https://macias.info):

```sh
docker run -p 18443:8443 --name goblog mariomac/goblog:dev
```

El comando anterior ejecuta una aplicación HTTPS sencilla. El proceso abre el
puerto interno del contenedor `8443`, que luego se expone en el nivel del host
como el puerto `18443`. Establece las variables de entorno para configurar OBI
para que imprima en stdout y escuche un puerto (contenedor) para inspeccionar el
ejecutable:

```sh
export OTEL_EBPF_TRACE_PRINTER=text
export OTEL_EBPF_OPEN_PORT=8443
```

OBI debe ejecutarse con la siguiente configuración:

- en modo `--privileged`, o con la capacidad `SYS_ADMIN` (a pesar de que
  `SYS_ADMIN` puede no ser suficiente en algunos entornos de contenedores)
- el espacio de nombres PID del host, con la opción `--pid=host`.

```sh
docker run --rm \
  -e OTEL_EBPF_OPEN_PORT=8443 \
  -e OTEL_EBPF_TRACE_PRINTER=text \
  --pid=host \
  --privileged \
  docker.io/otel/ebpf-instrument:main
```

Una vez que OBI esté en funcionamiento, abre `https://localhost:18443` en tu
navegador, utiliza la aplicación para generar datos de prueba y comprueba que
OBI imprime solicitudes de trazado en stdout similares a:

```sh
time=2023-05-22T14:03:42.402Z level=INFO msg="creating instrumentation pipeline"
time=2023-05-22T14:03:42.526Z level=INFO msg="Starting main node"
2023-05-22 14:03:53.5222353 (19.066625ms[942.583µs]) 200 GET / [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (355.792µs[321.75µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (170.958µs[142.916µs]) 200 GET /static/img.png [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (7.243667ms[295.292µs]) 200 GET /entry/201710281345_instructions.md [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (115µs[75.625µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
```

Ahora que OBI está rastreando el servicio HTTP de destino, puedes configurarlo
para enviar métricas y trazas a un endpoint de OpenTelemetry, o haz que
Prometheus recopile las métricas.

Para obtener información sobre cómo exportar trazas y métricas, consulta la
documentación de [opciones de configuración](../../configure/options/).

## Ejemplo de Docker Compose {#docker-compose-example}

El siguiente archivo Docker Compose reproduce la misma funcionalidad del ejemplo
de la CLI de Docker:

```yaml
version: '3.8'

services:
  # Servicio a instrumentar. Cambiar por cualquier otro contenedor
  # que desee instrumentar.
  goblog:
    image: mariomac/goblog:dev
    ports:
      # Expone el puerto 18843 y lo reenvía al puerto 8443 del contenedor
      - '18443:8443'

  autoinstrumenter:
    image: docker.io/otel/ebpf-instrument:main
    pid: 'host'
    privileged: true
    environment:
      OTEL_EBPF_TRACE_PRINTER: text
      OTEL_EBPF_OPEN_PORT: 8443
```

Ejecuta el archivo Docker Compose con el siguiente comando y utiliza la
aplicación para generar trazas:

```sh
docker compose -f compose-example.yml up
```
