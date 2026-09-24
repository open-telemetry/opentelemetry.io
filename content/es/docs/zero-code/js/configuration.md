---
title: Configuración de la instrumentación sin código
linkTitle: Configuración
description: Aprende a configurar la instrumentación sin código para Node.js
aliases:
  - /docs/languages/js/automatic/configuration
  - /docs/languages/js/automatic/module-config
weight: 10
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
cSpell:ignore: serviceinstance
---

Este módulo es altamente configurable mediante
[variables de entorno](/docs/specs/otel/configuration/sdk-environment-variables/).
Puedes configurar muchos aspectos del comportamiento de la instrumentación
automática según tus necesidades, como los detectores de recursos, los
exportadores, las cabeceras de propagación del contexto de traza y más.

## Configuración del SDK y del exportador {#sdk-and-exporter-configuration}

La [configuración del SDK y del exportador](/docs/languages/sdk-configuration/)
se puede establecer mediante variables de entorno.

## Configuración de los detectores de recursos del SDK {#sdk-resource-detector-configuration}

De forma predeterminada, el módulo habilita todos los detectores de recursos del
SDK. Puedes usar la variable de entorno `OTEL_NODE_RESOURCE_DETECTORS` para
habilitar solo algunos detectores o deshabilitar la detección por completo:

- `env`
- `host`
- `os`
- `process`
- `serviceinstance`
- `container`
- `alibaba`
- `aws`
- `azure`
- `gcp`
- `all`: habilita todos los detectores de recursos
- `none`: deshabilita la detección de recursos

Por ejemplo, para habilitar solo los detectores `env` y `host`, puedes
establecer:

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

## Excluir librerías de instrumentación {#excluding-instrumentation-libraries}

De forma predeterminada, todas las
[librerías de instrumentación compatibles](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/auto-instrumentations-node/README.md#supported-instrumentations)
están habilitadas, pero puedes usar variables de entorno para habilitar o
deshabilitar instrumentaciones específicas.

### Habilitar instrumentaciones específicas {#enable-specific-instrumentations}

Usa la variable de entorno `OTEL_NODE_ENABLED_INSTRUMENTATIONS` para habilitar
solo ciertas instrumentaciones, indicando una lista separada por comas con los
nombres de las librerías de instrumentación sin el prefijo
`@opentelemetry/instrumentation-`.

Por ejemplo, para habilitar solo las instrumentaciones
[@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http)
y
[@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express):

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

### Deshabilitar instrumentaciones específicas {#disable-specific-instrumentations}

Usa la variable de entorno `OTEL_NODE_DISABLED_INSTRUMENTATIONS` para mantener
habilitada la lista completa y deshabilitar solo ciertas instrumentaciones,
indicando una lista separada por comas con los nombres de las librerías de
instrumentación sin el prefijo `@opentelemetry/instrumentation-`.

Por ejemplo, para deshabilitar solo las instrumentaciones
[@opentelemetry/instrumentation-fs](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-fs)
y
[@opentelemetry/instrumentation-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc):

```shell
OTEL_NODE_DISABLED_INSTRUMENTATIONS="fs,grpc"
```

> [!NOTE]
>
> Si se establecen ambas variables de entorno, primero se aplica
> `OTEL_NODE_ENABLED_INSTRUMENTATIONS` y luego se aplica
> `OTEL_NODE_DISABLED_INSTRUMENTATIONS` sobre esa lista. Por lo tanto, si la
> misma instrumentación aparece en ambas listas, esa instrumentación quedará
> deshabilitada.
