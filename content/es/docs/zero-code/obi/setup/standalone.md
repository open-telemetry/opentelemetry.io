---
title: Ejecutar OBI como un proceso independiente
linkTitle: Independiente
description:
  Aprende a configurar y ejecutar OBI como un proceso independiente en Linux.
weight: 4
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
---

OBI puede ejecutarse como un proceso independiente del sistema operativo Linux
con privilegios elevados que pueden inspeccionar otros procesos en ejecución.

## Descargar e instalar {#download-and-install}

Puedes descargar el ejecutable de OBI desde la
[página de versiones de OBI](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases).

## Configurar OBI {#set-up-obi}

1. Crea un archivo de configuración siguiendo la documentación de
   [opciones de configuración](../../configure/options/).

2. Ejecuta OBI como un proceso con privilegios:

```bash
sudo ./obi --config=<path to config file>
```

## Ejemplo de configuración {#example-configuration}

A continuación se muestra un ejemplo de archivo de configuración
(`obi-config.yml`):

```yaml
# Basic configuration
discovery:
  services:
    - name: my-service
      open_ports: [8080, 8090]
      exe_path: /usr/local/bin/my-service

# Traces configuration
traces:
  # Enable tracing
  enabled: true

  # OpenTelemetry endpoint
  otlp_endpoint: http://localhost:4318

  # Trace format
  format: otlp

# Metrics configuration
metrics:
  # Enable metrics
  enabled: true

  # OpenTelemetry endpoint
  otlp_endpoint: http://localhost:4318

  # Metrics format
  format: otlp

# Logging configuration
log_level: info
```

## Ejecutar OBI {#run-obi}

Ejecuta OBI con el archivo de configuración:

```bash
sudo ./obi --config=obi-config.yml
```

## Opciones de configuración {#configuration-options}

Para obtener una lista completa de las opciones de configuración, consulta la
[documentación de configuración](../../configure/options/).

## Permisos {#permissions}

OBI requiere privilegios elevados para funcionar correctamente. Para obtener más
información sobre las capacidades específicas necesarias, consulta la
[documentación de seguridad](../../security/).

## Ejemplo: Instrumentación de Docker {#example-docker-instrumentation}

Para instrumentar un contenedor Docker, puedes ejecutar OBI en el host:

```bash
sudo ./obi --config=obi-config.yml
```

Con una configuración dirigida al contenedor:

```yaml
discovery:
  services:
    - name: my-container-service
      open_ports: [8080]
      exe_path: /proc/*/root/app/my-app
```

## Ejemplo: Instrumentación en todo el sistema {#example-system-wide-instrumentation}

Para instrumentar todos los servicios de un sistema:

```yaml
discovery:
  services:
    - name: all-services
      open_ports: [80, 443, 8080, 8443]

log_level: info
```

Esta configuración instrumentará todos los procesos que escuchen en los puertos
especificados.
