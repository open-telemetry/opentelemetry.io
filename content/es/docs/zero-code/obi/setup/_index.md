---
title: OBI Configuración
linkTitle: Configuración
description: Aprende como configurar y ejecutar OBI.
weight: 10
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
drifted_from_default: true
---

Hay diferentes opciones para configurar y ejecutar OBI:

- [Configurar OBI en Kubernetes](kubernetes/)
<!-- - [Configurar OBI en Kubernetes con Helm](kubernetes-helm/) -->
- [Configurar OBI en Docker](docker/)
- [Configurar OBI como un proceso independiente](standalone/)

Para obtener información sobre las opciones de configuración y los modos de
exportación de datos, consulta la documentación [Configurar OBI](../configure/).

{{% alert title="Nota" %}}

Si vas a utilizar OBI para generar trazas, asegúrate de haber leído nuestra
sección de documentación sobre la configuración del
[Decorador de rutas](../configure/routes-decorator/). Dado que OBI instrumenta
automáticamente su aplicación sin realizar modificaciones en su código, es
posible que los nombres de servicio y las URL que se asignan automáticamente no
sean los que tú esperas.

{{% /alert %}}
