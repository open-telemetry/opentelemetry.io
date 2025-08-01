---
title: Sin código
description:
  Aprende a añadir observabilidad a una aplicación sin necesidad de escribir
  código
aliases: [automatic]
weight: 10
default_lang_commit: d1ef521ee4a777881fb99c3ec2b506e068cdec4c
---

Como parte del equipo de [operaciones](/docs/getting-started/ops/), es posible
que necesites añadir observabilidad a una o más aplicaciones sin tener que
editar el código fuente. OpenTelemetry te permite obtener rápidamente cierta
observabilidad para un servicio sin tener que usar la API y el SDK de
OpenTelemetry para la
[instrumentación basada en código](/docs/concepts/instrumentation/code-based).

![Sin código](./zero-code.svg)

La instrumentación sin código añade las capacidades de la API y el SDK de
OpenTelemetry a tu aplicación, normalmente como un agente o una instalación
similar a un agente. Los mecanismos específicos involucrados pueden variar según
el lenguaje, abarcando desde la manipulación de bytecode, monkey patching o eBPF
para inyectar llamadas a la API y el SDK de OpenTelemetry en tu aplicación.

Habitualmente, la instrumentación sin código añade instrumentación para las
librerías que estás utilizando. Esto significa que lo que se instrumenta son las
solicitudes y respuestas, las llamadas a bases de datos, las llamadas a colas de
mensajes, etc. Sin embargo, el código de tu aplicación no suele estar
instrumentado. Para instrumentar tu código, tendrás que usar la
[instrumentación basada en código](/docs/concepts/instrumentation/code-based).

Además, la instrumentación sin código te permite configurar las
[librerías de instrumentación](/docs/concepts/instrumentation/libraries) y los
[exportadores](/docs/concepts/components/#exporters) cargados.

Puedes configurar la instrumentación sin código a través de variables de entorno
y otros mecanismos específicos del lenguaje, como propiedades del sistema o
argumentos pasados a los métodos de inicialización. Para empezar, solo necesitas
configurar un nombre de servicio para poder identificarlo en el backend de
observabilidad de tu elección.

Hay otras opciones de configuración disponibles, que incluyen:

- Configuración específica de la fuente de datos
- Configuración del exportador
- Configuración del propagador
- Configuración de recursos

La instrumentación automática está disponible para los siguientes lenguajes:

- [.NET](/docs/zero-code/dotnet/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
