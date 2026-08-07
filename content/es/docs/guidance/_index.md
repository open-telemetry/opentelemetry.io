---
title: Blueprints e implementaciones de referencia
description:
  Blueprints y arquitecturas de ejemplo con buenas prácticas para adoptar e
  implementar OpenTelemetry en entornos comunes
weight: 600
default_lang_commit: f7e86e5d33326b4e2a0f06b81ab25d515c4f54c2
---

Adoptar OpenTelemetry a escala no es solo cuestión de configurar componentes
individuales. Requiere decisiones coordinadas entre equipos y sistemas. La
documentación oficial del proyecto explica cómo funcionan piezas concretas de
OpenTelemetry, pero muchas organizaciones necesitan ayuda para conectar esas
piezas en una arquitectura cohesiva y lista para producción.

Esta sección proporciona guías de alto nivel y patrones arquitectónicos para
diseñar y operar OpenTelemetry en entornos reales. Se centra en los retos a los
que se enfrentan las organizaciones y los relaciona con enfoques probados y
buenas prácticas que puedes aplicar en tu propio entorno.

No hay una única forma «correcta» de desplegar OpenTelemetry, por lo que esta
guía pretende abordar todas las estructuras organizativas, no imponer una en
concreto. Con esta flexibilidad en mente, en esta sección puedes encontrar dos
tipos de documentos de referencia:

- Los **Blueprints** son documentos en constante evolución que resuelven retos
  comunes de adopción e implementación en un entorno determinado. Cada blueprint
  tiene un alcance acotado para abordar retos específicos, por lo que es posible
  que necesites consultar varios blueprints según tu entorno.
- Las **implementaciones de referencia** son instantáneas en el tiempo que
  muestran cómo organizaciones reales usan OpenTelemetry para construir
  pipelines escalables y resilientes que envían telemetría de aplicaciones a
  backends de observabilidad.

## Cómo contribuir {#how-to-contribute}

Si tu organización ha implementado OpenTelemetry y crees que otros podrían
beneficiarse de tu experiencia, o quieres proponer un blueprint para compartir
buenas prácticas de adopción de OpenTelemetry en un nuevo entorno, ¡queremos
saber de ti!

Puedes proponer un nuevo blueprint o una implementación de referencia abriendo
un issue en el
[repositorio del End User SIG](https://github.com/open-telemetry/sig-end-user)
usando las siguientes plantillas de issue:

- [Blueprint](https://github.com/open-telemetry/sig-end-user/issues/new?template=blueprint_proposal.yml)
- [Implementación de referencia](https://github.com/open-telemetry/sig-end-user/issues/new?template=reference_implementation.yml)

Los miembros del End User SIG te guiarán a través del proceso, desde ayudarte a
elaborar un documento de alta calidad siguiendo nuestras
[plantillas estándar](https://github.com/open-telemetry/sig-end-user/tree/main/architecture),
hasta finalmente incorporar tu contribución a la documentación oficial.
