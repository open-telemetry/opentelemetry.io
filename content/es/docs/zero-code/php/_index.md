---
title: Instrumentación sin código para PHP
linkTitle: PHP
weight: 30
default_lang_commit: be35d47dc1ad8f2c4d3607927a14e9c4cb2d2102
cSpell:ignore: PECL
---

OpenTelemetry proporciona dos enfoques de instrumentación sin código para PHP:

|                   | [Autoinstrumentación](auto/)                    | [PHP Distro](distro/)                       |
| ----------------- | ----------------------------------------------- | ------------------------------------------- |
| **Instalación**   | Composer + extensión PECL                       | Paquete del SO (`deb`, `rpm`, `apk`)        |
| **Plataforma**    | Linux, macOS, Windows                           | Solo Linux                                  |
| **Configuración** | Autoloading de Composer                         | Instalar paquete, reiniciar PHP             |
| **Control**       | Control manual completo                         | Valores predeterminados con criterio propio |
| **Ideal para**    | Entornos flexibles, configuración personalizada | Despliegues de producción en Linux          |

## Elegir la autoinstrumentación {#choose-auto-instrumentation}

Usa la [autoinstrumentación sin código para PHP](auto/) cuando:

- Ya utilices Composer
- Necesites ejecutar en macOS o Windows
- Quieras el máximo control sobre la instrumentación y la configuración

## Elegir PHP Distro {#choose-php-distro}

Usa [OpenTelemetry PHP Distro](distro/) cuando:

- Despliegues en Linux y quieras una instalación gestionada por paquetes (`deb`,
  `rpm`, `apk`)
- Necesites una incorporación sin código sin modificar el código de la
  aplicación ni Composer
- Quieras valores predeterminados optimizados para producción (exportación en
  segundo plano, spans inferidos, OpAMP)
