---
title: Hacer fork del repositorio de la demo
linkTitle: Forking
default_lang_commit: 5472965d7714ed898b008d41fa97561591320196
cSpell:ignore: forkeado interfacen
---

El [repositorio de la demo][] está diseñado para ser forkeado y usado como una
herramienta para mostrar lo que estás haciendo con OpenTelemetry.

Configurar un fork o una demo generalmente solo requiere sobrescribir algunas
variables de entorno y posiblemente reemplazar algunas imágenes de contenedores.

Las demos en vivo pueden agregarse al
[README](https://github.com/open-telemetry/opentelemetry-demo/blob/main/README.md?plain=1)
de la demo.

## Sugerencias para mantenedores de forks

- Si deseas mejorar los datos de telemetría emitidos o recolectados por la demo,
  te animamos fuertemente a que aportes tus cambios de vuelta a este
  repositorio. Para cambios específicos de proveedores o implementaciones, una
  estrategia de modificar la telemetría en el pipeline mediante configuración es
  preferible a cambios en el código subyacente.
- Extiende en lugar de reemplazar. Agregar servicios completamente nuevos que se
  interfacen con la API existente es una excelente manera de agregar
  características específicas de proveedores o herramientas que no pueden
  lograrse mediante modificación de telemetría.
- Para soportar la extensibilidad, por favor usa patrones de repositorio o
  fachada alrededor de recursos como colas, bases de datos, cachés, etc. Esto
  permitirá que diferentes implementaciones de estos servicios sean integradas
  para diferentes plataformas.
- Por favor, no intentes aportar mejoras específicas de proveedores o
  herramientas a este repositorio.

Si tienes alguna pregunta o te gustaría sugerir formas en las que podemos
facilitarte la vida como mantenedor de un fork, por favor abre un issue.

[repositorio de la demo]: <{{% param repo %}}>
