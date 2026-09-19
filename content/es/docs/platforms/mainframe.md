---
title: OpenTelemetry con mainframes
linkTitle: Mainframes
description: >-
  Usa OpenTelemetry para obtener información sobre las cargas de trabajo de
  mainframe junto con tus sistemas en la nube y distribuidos.
default_lang_commit: 42341743ad69d34f1824c05978760eeb0e2b6130
cSpell:ignore: CICS frontends intercepción LOGREC VSAM
---

Los mainframes siguen ejecutando una gran parte de las cargas de trabajo más
críticas del mundo, especialmente en la banca, los seguros, el gobierno, el
comercio minorista y las aerolíneas.

A menudo se encuentran en el **núcleo de una arquitectura híbrida**, con
frontends web y móviles, microservicios y plataformas en la nube que dependen de
los sistemas de registro del mainframe.

Esta sección explica cómo se integran los mainframes en una estrategia de
observabilidad basada en OpenTelemetry y señala orientación sobre cómo
integrarlos con tus pipelines de telemetría existentes.

## Audiencia {#audience}

Este contenido está dirigido a personas que:

- Trabajan principalmente en entornos **distribuidos / nativos de la nube**
  (Kubernetes, VMs, serverless, etc.).
- Necesitan entender **qué es un mainframe**, por qué es importante y cómo
  incorporar las cargas de trabajo de mainframe a una estrategia de
  observabilidad de extremo a extremo.

## Suposiciones {#assumptions}

_No_ necesitas experiencia previa con mainframes, ni tienes que ser un experto
en COBOL o z/OS para beneficiarte de esta sección. Pero debes estar
familiarizado con los [conceptos de OpenTelemetry](/docs/concepts/), como las
trazas, las métricas, los logs, OTLP y el Collector.

## Qué entendemos por mainframe {#what-we-mean-by-mainframe}

Los mainframes son servidores de datos diseñados para procesar miles de millones
de transacciones diarias con los más altos niveles de seguridad y fiabilidad.
Para obtener una descripción más detallada, consulta
[¿Qué es un mainframe?](https://www.ibm.com/think/topics/mainframe).

Un ejemplo de mainframe es un sistema IBM Z que alberga:

- Procesamiento de transacciones (por ejemplo, CICS®, IMS™ y subsistemas
  similares)
- Procesamiento por lotes (trabajos gestionados por JCL, planificadores)
- Sistemas de registro de alto valor (bases de datos y archivos que son la
  «fuente de verdad»)

Aunque los detalles varían según el proveedor y el producto, la mayoría de los
entornos de mainframe comparten características que afectan a la observabilidad:

- Rendimiento muy alto y requisitos estrictos de latencia y disponibilidad
- Aplicaciones y formatos de datos de larga duración
- Restricciones estrictas de seguridad y cumplimiento normativo

## Cómo aparecen los mainframes en las arquitecturas de OpenTelemetry {#how-mainframes-show-up-in-opentelemetry-architectures}

Desde la perspectiva de OpenTelemetry, los mainframes suelen formar parte de un
**sistema híbrido más amplio**:

- **Frontends y APIs** que se ejecutan en navegadores, aplicaciones móviles o
  API gateways.
- **Microservicios y middleware** que se ejecutan en contenedores, VMs o
  servicios gestionados en la nube.
- **Lógica de negocio principal y datos** que residen en el mainframe y se
  acceden mediante MQ, HTTP(S), gRPC, buses de mensajes o protocolos
  propietarios.

En una arquitectura típica, los flujos de telemetría podrían verse así:

- Los servicios distribuidos emiten **trazas, métricas y logs** mediante los
  SDKs de OpenTelemetry y el Collector.
- Los niveles de integración (API gateways, ESBs, puentes MQ, plataformas de
  streaming de datos) actúan como **puntos de intercepción** donde puedes
  correlacionar las solicitudes en la nube con la actividad del mainframe.
- Los componentes que residen en el mainframe emiten **eventos,
  [registros SMF](https://www.ibm.com/docs/en/zos/3.2.0?topic=smf-introduction),
  logs, spans de traza o métricas** que deben transformarse o exportarse a
  formatos de OpenTelemetry (a menudo mediante un Collector o gateway que se
  ejecuta fuera de la plataforma).

El objetivo de esta sección es ayudarte a **conectar esos puntos** para que
puedas ver una imagen única y coherente de los sistemas de mainframe y de los
que no lo son.

## En qué se diferencian los mainframes {#whats-different-about-mainframes}

Cuando incorporas OpenTelemetry a un contexto de mainframe, a menudo te
encontrarás con:

- **Modelos mentales diferentes**
  - LPARs, espacios de direcciones y jobs en lugar de hosts, pods y servicios
  - Datasets y archivos VSAM en lugar de buckets de almacenamiento de objetos
- **Telemetría y formatos preexistentes**
  - Registros de System Management Facilities (SMF)
  - SYSLOG
  - LOGREC
  - Logs de subsistemas
  - Logs de jobs
  - Monitores de rendimiento
  - Estas fuentes a menudo deben analizarse y mapearse a trazas, métricas y logs
    según los define OpenTelemetry
- **Restricciones de acceso y cambio**
  - Los mainframes de producción suelen tener un control de cambios estricto y
    una capacidad limitada para modificar el código de las aplicaciones.
- **Expectativas de escala y fiabilidad**
  - Las soluciones de telemetría deben seguir el ritmo de **tasas de
    transacciones muy altas** sin afectar a los SLAs.
  - Los pipelines de datos deben ser lo bastante robustos y seguros como para
    cumplir con los requisitos normativos.

Estas características no impiden el uso de OpenTelemetry, pero influyen en
**dónde y cómo** recopilas, transformas y exportas la telemetría.

## Cómo puede ayudar OpenTelemetry {#how-opentelemetry-can-help}

OpenTelemetry proporciona bloques de construcción que se pueden aplicar a
entornos de mainframe, entre ellos:

- Un **modelo de datos independiente de proveedores** para trazas, métricas y
  logs.
- **OTLP** como protocolo de transporte estándar e interoperable.
- El **OpenTelemetry Collector**, que puede:
  - Ingerir datos de múltiples protocolos y formatos
  - Transformar y enriquecer datos
  - Exportar los datos transformados a los backends de observabilidad que elijas

En un contexto de mainframe, el Collector a menudo se ejecuta **fuera de la
plataforma** (por ejemplo, en servidores Linux o contenedores) y actúa como
**puente** entre:

- Las fuentes de telemetría específicas del mainframe, y
- Tus backends de observabilidad empresariales (plataformas de métricas/logs,
  backends de trazas, herramientas de APM, SIEMs y data lakes).

## Estado actual {#current-status}

Ya existe instrumentación fundamental de OpenTelemetry para entornos de
mainframe, y el soporte de la plataforma sigue expandiéndose.

Históricamente, la mayor parte de la instrumentación de mainframe ha sido
proporcionada por los proveedores: muchos proveedores de backends de
observabilidad ofrecen sus propias extensiones o agentes para empaquetar y
enviar la telemetría de mainframe a sus backends.

En respuesta a la demanda de los clientes de telemetría independiente de
proveedores, IBM, que suministra el sistema operativo y el software de
subsistema para los sistemas de mainframe más utilizados, y muchos proveedores
de software independientes (ISV) están añadiendo soporte nativo de OpenTelemetry
a sus productos.

Esta transición depende de una terminología y una semántica comunes, que el
grupo de trabajo descrito en la siguiente sección está ayudando a definir.

## Grupo de trabajo y comunidad {#working-group-and-community}

El **OpenTelemetry on Mainframes Special Interest Group (SIG)** se centra
actualmente en:

- Definir terminología y casos de uso comunes
- Identificar carencias en las especificaciones (convenciones semánticas de
  OpenTelemetry), los SDKs y los componentes del Collector relacionados con los
  casos de uso de mainframe

El SIG cuenta actualmente con representación de IBM, Broadcom y otros ISV,
proveedores de backends de observabilidad y algunos clientes. ¡Únete a nosotros!

Si estás interesado en contribuir, consulta [Comunidad](/community/) y la
[información sobre los SIG](https://github.com/open-telemetry/community#special-interest-groups)
en los repositorios y el sitio web de OpenTelemetry para conocer los
[horarios de las reuniones](https://groups.google.com/a/opentelemetry.io/g/calendar-mainframe),
las
[notas de las reuniones](https://docs.google.com/document/d/14p-bpofozTL4n3jy6HZH_TKjoOXvog18G1HBRqq6liE)
y los canales de comunicación
([#otel-mainframes](https://cloud-native.slack.com/archives/C05PXDFTCPJ)).
