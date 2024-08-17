---
title: Documentación de la demo de OpenTelemetry
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
cSpell:ignore: OLJCESPC
---

Bienvenido a la documentación de la [Demo de OpenTelemetry](/ecosystem/demo/), que
cubre cómo instalar y ejecutar la demostración, y algunos escenarios que puede usar para ver
OpenTelemetry en acción.

## Ejecución la Demo

¿Quieres implementar la demo y verla en acción? Comienza aquí.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Referencia de Funciones del Lenguaje de Programación

¿Quieres entender cómo funciona la instrumentación de un lenguaje en particular? Comienza aquí.

| Lenguaje   | Instrumentación Automática                          | Bibliotecas de Instrumentación                                                                    | Instrumentación Manual                                                                       |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| .NET       | [Servicio de Contabilidad](services/accounting/)               | [Servicio de Carrito](services/cart/)                                                             | [Servicio de Carrito](services/cart/)                                                             |
| C++        |                                                                |                                                                                                   | [Servicio de Moneda](services/currency/)                                                           |
| Go         |                                                                | [Servicio de Pago](services/checkout/), [Servicio de Catálogo de Productos](services/product-catalog/) | [Servicio de Pago](services/checkout/), [Servicio de Catálogo de Productos](services/product-catalog/) |
| Java       | [Servicio de Publicidad](services/ad/)                         |                                                                                                   | [Servicio de Publicidad](services/ad/)                                                             |
| JavaScript |                                                                | [Frontend](services/frontend/)                                                                    | [Frontend](services/frontend/), [Servicio de Pagos](services/payment/)                             |
| Kotlin     |                                                                | [Servicio de Detección de Fraude](services/fraud-detection/)                                      |                                                                                                   |
| PHP        |                                                                | [Servicio de Cotizaciones](services/quote/)                                                       | [Servicio de Cotizaciones](services/quote/)                                                       |
| Python     | [Servicio de Recomendaciones](services/recommendation/)        |                                                                                                   | [Servicio de Recomendaciones](services/recommendation/)                                           |
| Ruby       |                                                                | [Servicio de Correo Electrónico](services/email/)                                                 | [Servicio de Correo Electrónico](services/email/)                                                 |
| Rust       |                                                                | [Servicio de Envío](services/shipping/)                                                           | [Servicio de Envío](services/shipping/)                                                           |


## Documentación de los Servicios

Puede encontrar información específica sobre cómo se implementa OpenTelemetry en cada servicio aquí:

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
- [Servicio Proveedor de Imágenes](services/imageprovider/)

## Escenarios

¿Cómo se pueden resolver los problemas con OpenTelemetry? Estos escenarios le muestran
algunos problemas preconfigurados y cómo interpretar los datos de OpenTelemetry para
resolverlos.

Agregaremos más escenarios con el tiempo.

- Generar un [Error de Catálogo de Producto](feature-flags) para solicitudes `GetProduct`
con ID de producto: `OLJCESPC7Z` utilizando el servicio Feature Flag
- Descubra una fuga de memoria y diagnostíquela mediante métricas y seguimientos.
  [Leer más](scenarios/recommendation-cache/)

## Referencia

Documentación de referencia del proyecto, como requisitos y matrices de características.

- [Arquitectura](architecture/)
- [Desarrollo](development/)
- [Referencia de Feature Flags](feature-flags/)
- [Matriz de Características de Métricas](telemetry-features/metric-coverage/)
- [Requisitos](./requirements/)
- [Capturas de Pantalla](screenshots/)
- [Servicios](services/)
- [Referencia de Atributos de Span](telemetry-features/manual-span-attributes/)
- [Pruebas](tests/)
- [Matriz de Características de Trazas](telemetry-features/trace-coverage/)
