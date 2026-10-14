---
title: >-
  Diseño Nativo con OTel - Construyendo Productos que Exporten a Cualquier
  Stack
linkTitle: Diseño Nativo con OTel
date: 2026-10-08
author: >-
  [Nityananda Gohain](https://github.com/nityanandagohain) (SigNoz), [Dhruv
  Ahuja](https://github.com/dhruv-ahuja) (SigNoz)
body_class: otel-with-contributions-from
issue: 10300
sig: SIG End User
cSpell:ignore: Ahuja Dhruv Gohain Nityananda
---
Con contribuciones de [Dan Gomez Blanco](https://github.com/danielgblanco) (New Relic).

Si estás construyendo un producto self-hosted o SaaS, tus usuarios eventualmente van a pedir mandar **logs, trazas y métricas** a su stack de observabilidad, ya sea para satisfacer algún requisito, manejo de costos o centralizar toda su observabilidad en un solo lugar.

Encerrar a los usuarios en tus dashboards prefabricados o limitar a dónde se exportan los datos crea fricción innecesaria. Al contrario, dar el soporte para poder exportar a cualquier backend compatible con OpenTelemetry (OTel) que sea agnóstico al proveedor, diseñado para adaptarse al futuro le permite al usuario la libertad de escoger su stack de observabilidad.

Esta publicación describe cómo puedes diseñar tu producto para que los usuarios puedan exportar sus logs, trazas y métricas a un backend OTel cuando quieran.

![Enabling telemetry export via the OTLP standard allows users to own and
analyze their data on the platforms of their
choosing.](cover.png)

## Las cuatro señales de observabilidad {#four-signals}

OpenTelemetry define cuatro tipos de señales, todas usan el estándar [OpenTelemetry Protocol (OTLP)](/docs/specs/otlp/):

- **[Logs](/docs/concepts/signals/logs/):** Registros de eventos, logs de solicitudes/accesos, y aplicaciones con timestamp y metadatos.
- **[Traces](/docs/concepts/signals/traces/):** Trazas distribuidas con spans permitiendo a los usuarios ver los flujos entre servicios para correlacionar con logs.
- **[Metrics](/docs/concepts/signals/metrics/):** Contadores, medidores e histogramas (ej. tasa de solicitudes, latencia, tasa de errores).
- **[Profiles](/docs/concepts/signals/profiles/):**  Muestras que demuestran dónde las aplicaciones consumen recursos durante su ejecución.

> [!NOTE] Profiles están en public alpha
>
> Profiles entraron a [public alpha](/blog/2026/profiles-alpha/) en Marzo 26, 2026.
> Como señal, OpenTelemetry pretende que los perfiles se encuentren junto a las tres señales mayores de observabilidad, ayudando a los usuarios a solucionar incidentes de producción capturando los patrones de uso en su código.

> Aunque exclusivamente nos enfocaremos en logs, trazas, y métricas en esta publicación, estamos emocionados de ver cómo los profiles toman forma, y cómo la comunidad los utiliza en sus sistemas de observabilidad.

La misma historia de exportar aplica a las tres (logs, trazas, y métricas): Permitiendo a los usuarios configurar su OTLP endpoint y **enviando** telemetría. Puedes añadir soporte a una, dos, o las tres señales dependiendo de tu producto.

Muchas plataformas que soportan exportar vía OTel incluyen al menos trazas y logs, y con un gran número en aumento incluyendo métricas. Diseñando con las tres señales desde un inicio evita adaptar más tarde.
## Como un "buen" sistema de telemetria se ve

Una historia solida para exportar cada senal tiene pocas propiedades que debes de considerar:

- **Proovedor Agnóstico:** Los usuarios pueden cambiar a cualquier endpoint compatible con OTel, un [Collector instance](/docs/collector/), uno de los muchos
  [backends que soportal OTLP directamente](/ecosystem/vendors/) — sin construir integraciones personalizandas.
