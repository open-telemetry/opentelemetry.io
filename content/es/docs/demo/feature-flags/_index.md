---
title: Feature Flags
aliases:
  - feature_flags
  - scenarios
  - services/feature-flag
  - services/featureflagservice
default_lang_commit: cb6352e01bcdbf8cc400aa663fa82d2835718e6e
cSpell:ignore: fraccional L9ECAV7KIM loadgenerator OLJCESPC7Z
---

La demo proporciona varios feature flags que puedes usar para simular diferentes
escenarios. Estos flags son gestionados por [`flagd`](https://flagd.dev), un
servicio simple de feature flags que soporta
[OpenFeature](https://openfeature.dev).

Los valores de los flags pueden cambiarse a través de la interfaz de usuario
proporcionada en <http://localhost:8080/feature> cuando ejecutas la demo.
Cambiar los valores a través de esta interfaz de usuario se reflejará en el
servicio flagd.

Hay dos opciones para cambiar los feature flags a través de la interfaz de
usuario:

- **Vista Básica**: Una vista amigable en la que las variantes predeterminadas
  (las mismas opciones que necesitan cambiarse al configurar a través del
  archivo raw) pueden seleccionarse y guardarse para cada feature flag.
  Actualmente, la vista básica no soporta targeting fraccional.

- **Vista Avanzada**: Una vista en la que se carga el archivo JSON de
  configuración raw y puede editarse dentro del navegador. La vista proporciona
  la flexibilidad que viene con editar un archivo JSON raw, sin embargo también
  proporciona verificación de esquema para asegurar que el JSON es válido y que
  los valores de configuración proporcionados son correctos.

## Feature flags implementados

| Feature Flag                        | Servicio(s)     | Descripción                                                                                                          |
| ----------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`                  | Ad              | Genera un error para `GetAds` 1/10 de las veces                                                                      |
| `adServiceManualGc`                 | Ad              | Dispara recolecciones de basura manuales completas en el servicio ad                                                 |
| `adServiceHighCpu`                  | Ad              | Dispara alta carga de CPU en el servicio ad. Si quieres demostrar throttling de CPU, establece límites de CPU        |
| `cartServiceFailure`                | Cart            | Genera un error cada vez que se llama a `EmptyCart`                                                                  |
| `emailMemoryLeak`                   | Email           | Simula una fuga de memoria en el servicio `email`                                                                    |
| `llmInaccurateResponse`             | LLM             | El servicio mock LLM devuelve un resumen de reseña de producto inexacto para el ID de producto `L9ECAV7KIM`          |
| `llmRateLimitError`                 | LLM             | El servicio mock LLM devuelve intermitentemente un RateLimitError con código de estado HTTP 429                      |
| `productCatalogFailure`             | Product Catalog | Genera un error para solicitudes `GetProduct` con ID de producto: `OLJCESPC7Z`                                       |
| `recommendationServiceCacheFailure` | Recommendation  | Crea una fuga de memoria debido a una caché que crece exponencialmente. Crecimiento 1.4x, 50% de solicitudes         |
| `paymentServiceFailure`             | Payment         | Genera un error al llamar al método `charge`                                                                         |
| `paymentServiceUnreachable`         | Checkout        | Usa una dirección incorrecta al llamar al PaymentService para que parezca que el PaymentService no está disponible   |
| `loadgeneratorFloodHomepage`        | Load Generator  | Comienza a inundar la página de inicio con una gran cantidad de solicitudes, configurable cambiando el JSON de flagd |
| `kafkaQueueProblems`                | Kafka           | Sobrecarga la cola de Kafka mientras simultáneamente introduce un retraso del lado del consumidor                    |
| `imageSlowLoad`                     | Frontend        | Utiliza inyección de fallos de envoy, produce un retraso en la carga de imágenes de productos en el frontend         |

## Escenario de Depuración Guiado

El escenario `recommendationServiceCacheFailure` tiene un
[documento de guía dedicado](recommendation-cache/) para ayudar a entender cómo
puedes depurar fugas de memoria con OpenTelemetry.

## Arquitectura de Feature Flags

Por favor consulta la [documentación de flagd](https://flagd.dev) para más
información sobre cómo funciona flagd, y el sitio web de
[OpenFeature](https://openfeature.dev) para más información sobre cómo funciona
OpenFeature, junto con documentación para la API de OpenFeature.
