---
title: Requisitos de arquitectura
linkTitle: Arquitectura
aliases: [architecture_requirements]
default_lang_commit: ae417344d183999236c22834435e0dfeb109da29
cSpell:ignore: dockerstatsreceiver enrutarse
---

## Resumen

La aplicación de demostración de la Comunidad OpenTelemetry está diseñada para
ser una muestra de la API, SDK y herramientas de OpenTelemetry en una aplicación
cloud native similar a producción. El objetivo general de esta aplicación no es
solo proporcionar una 'demo' canónica de los componentes de OpenTelemetry, sino
también actuar como un marco de trabajo para mayor personalización por parte de
usuarios finales, proveedores y otras partes interesadas.

### Requisitos

- [Requisitos de Aplicación](../application/)
- [Requisitos de OpenTelemetry](../opentelemetry/)
- [Requisitos del Sistema](../system/)

### Objetivos de la aplicación

- Proporcionar a los desarrolladores una aplicación de ejemplo robusta que
  puedan usar para aprender la instrumentación de OpenTelemetry.
- Proporcionar a los proveedores de observabilidad una plataforma de
  demostración única y bien soportada que puedan personalizar aún más (o
  simplemente usar OOB).
- Proporcionar a la comunidad de OpenTelemetry un artefacto vivo que demuestre
  las características y capacidades de las APIs, SDKs y herramientas de OTel.
- Proporcionar a los maintainers y WGs de OpenTelemetry una plataforma para
  demostrar nuevas características/conceptos 'en el mundo real'.

Lo siguiente es una descripción general de los componentes lógicos de la
aplicación de demostración.

## Aplicación principal

La mayor parte de la aplicación de demo es una aplicación autocontenida basada
en microservicios que realiza algún trabajo útil del 'mundo real', como un sitio
de eCommerce. Esta aplicación está compuesta por múltiples servicios que se
comunican entre sí mediante gRPC y HTTP y se ejecuta en Kubernetes (o Docker,
localmente).

Cada servicio debe estar instrumentado con OpenTelemetry para trazas, métricas y
logs (según corresponda/esté disponible).

Cada servicio debe ser intercambiable con un servicio que realice la misma
lógica de negocio, implementando los mismos endpoints gRPC, pero escrito en un
lenguaje/implementación diferente.

Cada servicio debe poder comunicarse con un servicio de feature flags para
habilitar/deshabilitar fallos que se pueden usar para ilustrar cómo la
telemetría ayuda a resolver problemas en aplicaciones distribuidas.

## Componente de feature flags

Los feature flags son una parte crucial del desarrollo de aplicaciones cloud
native. La demo utiliza OpenFeature, un proyecto en incubación de CNCF, para
gestionar feature flags.

Los feature flags se pueden configurar a través de la interfaz de usuario del
configurador de flagd.

## Orquestación y despliegue

Todos los servicios se ejecutan en Kubernetes. El OpenTelemetry Collector debe
desplegarse a través del OpenTelemetry Operator, y ejecutarse en modo sidecar +
gateway. La telemetría de cada pod debe enrutarse desde los agentes hacia un
gateway, y el gateway debe exportar telemetría por defecto a un visualizador de
trazas y métricas de código abierto.

Para despliegue local/sin Kubernetes, el Collector debe desplegarse mediante
archivo compose y monitorear no solo trazas/métricas de las aplicaciones, sino
también los contenedores docker mediante `dockerstatsreceiver`.

Un objetivo de diseño de este proyecto es incluir un pipeline de CI/CD para
auto-despliegue en entornos cloud. Esto podría omitirse para desarrollo local.
