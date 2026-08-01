---
title: Documentación de la demo de OpenTelemetry
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: 2571ec5a1e17744982e8dc6efe1fdf3115d0ebbc
drifted_from_default: true
cSpell:ignore: preconfigurados
---

Aquí tienes la documentación de la [Demo de OpenTelemetry](/ecosystem/demo/),
que describe cómo instalar y ejecutar la demostración, además de algunos
escenarios que puedes usar para ver OpenTelemetry en acción.

## Ejecución de la demo

¿Quieres implementar la demo y verla en acción? Comienza aquí.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Referencia de funciones del lenguaje de programación

¿Quieres entender cómo funciona la instrumentación de un lenguaje en particular?
Comienza aquí.

| Lenguaje   | Instrumentación automática                              | Bibliotecas de instrumentación                                                                         | Instrumentación manual                                                                                 |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| .NET       | [Servicio de Contabilidad](services/accounting/)        | [Servicio de Carrito](services/cart/)                                                                  | [Servicio de Carrito](services/cart/)                                                                  |
| C++        |                                                         |                                                                                                        | [Servicio de Moneda](services/currency/)                                                               |
| Go         |                                                         | [Servicio de Pago](services/checkout/), [Servicio de Catálogo de Productos](services/product-catalog/) | [Servicio de Pago](services/checkout/), [Servicio de Catálogo de Productos](services/product-catalog/) |
| Java       | [Servicio de Publicidad](services/ad/)                  |                                                                                                        | [Servicio de Publicidad](services/ad/)                                                                 |
| JavaScript |                                                         |                                                                                                        | [Servicio de Pagos](services/payment/)                                                                 |
| TypeScript |                                                         | [Frontend](services/frontend/), [Aplicación React Native](services/react-native-app/)                  | [Frontend](services/frontend/)                                                                         |
| Kotlin     |                                                         | [Servicio de Detección de Fraude](services/fraud-detection/)                                           |                                                                                                        |
| PHP        |                                                         | [Servicio de Cotizaciones](services/quote/)                                                            | [Servicio de Cotizaciones](services/quote/)                                                            |
| Python     | [Servicio de Recomendaciones](services/recommendation/) |                                                                                                        | [Servicio de Recomendaciones](services/recommendation/)                                                |
| Ruby       |                                                         | [Servicio de Correo Electrónico](services/email/)                                                      | [Servicio de Correo Electrónico](services/email/)                                                      |
| Rust       |                                                         | [Servicio de Envío](services/shipping/)                                                                | [Servicio de Envío](services/shipping/)                                                                |

## Documentación de los servicios

Puedes encontrar información específica sobre cómo se implementa OpenTelemetry
en cada servicio aquí:

- [Servicio de Contabilidad](services/accounting/)
- [Servicio de Publicidad](services/ad/)
- [Servicio de Carrito](services/cart/)
- [Servicio de Pago](services/checkout/)
- [Servicio de Correo Electrónico](services/email/)
- [Frontend](services/frontend/)
- [Generador de Carga](services/load-generator/)
- [Servicio de Pagos](services/payment/)
- [Servicio de Catálogo de Productos](services/product-catalog/)
- [Servicio de Cotizaciones](services/quote/)
- [Servicio de Recomendaciones](services/recommendation/)
- [Servicio de Envío](services/shipping/)
- [Servicio Proveedor de Imágenes](services/image-provider/?i18n-patch)
- [Aplicación React Native](services/react-native-app/)

## Escenarios de Feature Flags

¿Cómo puedes resolver problemas con OpenTelemetry? Estos
[escenarios habilitados por `feature flags`](feature-flags/) te guiarán a través
de algunos problemas preconfigurados y te mostrarán cómo interpretar los datos
de OpenTelemetry para resolverlos.

## Referencia

Documentación de referencia del proyecto, como requisitos y matrices de
características.

- [Arquitectura](architecture/)
- [Desarrollo](development/)
- [Referencia de Feature Flags](feature-flags/)
- [Matriz de Características de Métricas](telemetry-features/metric-coverage/)
- [Requisitos](requirements/)
- [Capturas de Pantalla](screenshots/)
- [Servicios](services/)
- [Referencia de Atributos de Span](telemetry-features/manual-span-attributes/)
- [Pruebas](tests/)
- [Matriz de Características de Trazas](telemetry-features/trace-coverage/)
