---
title: Instrumentación eBPF con OpenTelemetry
linkTitle: OBI
description: Aprende a usar OpenTelemetry eBPF para instrumentación automática.
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
default_lang_commit: c6df1ca98613ce886d3ea5ecb7ea50d02a31f18a
cSpell:ignore: CAP_PERFMON compílalos reinicios
---

Las librerías de OpenTelemetry proporcionan la recolección de telemetría para
lenguajes de programación y frameworks populares. Sin embargo, comenzar con
trazas distribuidas puede ser complejo. En algunos lenguajes compilados como Go
o Rust, debes agregar manualmente _tracepoints_ en el código.

OpenTelemetry eBPF Instrumentation (OBI) es una herramienta de
auto-instrumentación para empezar fácilmente con la observabilidad de
aplicaciones. OBI usa eBPF para inspeccionar automáticamente los ejecutables de
las aplicaciones y la capa de red del sistema operativo, y capturar _spans de
traza_ relacionados con transacciones web y métricas RED (_Rate, Errors,
Duration_) para servicios HTTP/S y gRPC en Linux. Toda la captura de datos
ocurre sin modificaciones al código o configuración de la aplicación.

OBI ofrece las siguientes características:

- **Amplio soporte de lenguajes**: Java, .NET, Go, Python, Ruby, Node.js, C, C++
  y Rust
- **Ligero**: No requiere cambios en el código, ni instalar librerías, ni
  reinicios
- **Instrumentación eficiente**: Las trazas y métricas son capturadas por
  _probes_ eBPF con mínima sobrecarga
- **Trazas distribuidas**: Los _spans de traza_ se capturan y reportan a un
  Collector
- **Kubernetes-nativo**: Auto-instrumentación sin configuración para
  aplicaciones en Kubernetes
- **Visibilidad en comunicaciones cifradas**: Captura transacciones sobre
  TLS/SSL sin descifrado
- **Propagación de contexto**: Propaga el contexto de trazas entre servicios
  automáticamente
- **Soporte de protocolos**: HTTP/S, gRPC y gRPC-Web
- **Métricas de baja cardinalidad**: Métricas compatibles con Prometheus de baja
  cardinalidad
- **Observabilidad de red**: Captura flujos de red entre servicios
- **Trazas de base de datos**: Captura consultas y conexiones de bases de datos

## Requisitos {#requirements}

OBI requiere lo siguiente para ejecutarse:

- Kernel de Linux versión 5.8 o posterior (o 4.18 en RHEL)
- Procesador x86_64 o arm64
- Soporte en tiempo de ejecución para eBPF (la mayoría de las distribuciones
  modernas de Linux lo incluyen)
- Privilegios administrativos (acceso root) o capacidades específicas listadas
  en la [referencia de configuración](security/)

![Arquitectura eBPF de OBI](./ebpf-arch.svg)

## Compatibilidad {#compatibility}

OBI ha sido probado en:

- Ubuntu 20.04 LTS, 21.04, 22.04 LTS y 23.04
- CentOS 7, 8 y 9
- AlmaLinux 8, 9
- Rocky Linux 8, 9
- Red Hat Enterprise Linux 8, 9
- Debian 11, 12
- openSUSE Leap 15.3, 15.4
- SUSE Linux Enterprise Server 15 SP4

- Para instrumentar programas en Go, compílalos con al menos Go 1.17. OBI
  soporta aplicaciones Go construidas con una versión no anterior a 3 versiones
  detrás de la estable actual.
- Derechos de acceso administrativo para ejecutar OBI.

## Limitaciones {#limitations}

OBI también tiene limitaciones. Solo proporciona métricas genéricas e
información de _spans de traza_ a nivel de transacción. Aún se recomienda usar
agentes de lenguaje e instrumentación manual para atributos y eventos
personalizados.

Aunque la mayoría de los programas eBPF requieren privilegios elevados, OBI
permite especificar permisos más finos como `CAP_DAC_READ_SEARCH`,
`CAP_SYS_PTRACE`, `CAP_PERFMON`, `CAP_BPF`, `CAP_CHECKPOINT_RESTORE`. Algunas
funciones (por ejemplo _network observability probes_ con Linux Traffic Control)
requieren `CAP_NET_ADMIN`.

Para una lista completa de capacidades requeridas por OBI, consulta
[Seguridad, permisos y capacidades](security/).

## Primeros pasos con OBI {#get-started-with-obi}

- Sigue la documentación de [configuración](setup/) para comenzar con OBI ya sea
  con Docker o Kubernetes.
