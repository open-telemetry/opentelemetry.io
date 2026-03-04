---
title: Requisitos de OpenTelemetry
linkTitle: Requisitos de OTel
aliases: [opentelemetry_requirements]
default_lang_commit: 7f46ec2d7d04170d9aeaa8e2f5ec93408aee2ea5
---

Los siguientes requisitos fueron decididos para definir qué señales de
OpenTelemetry (OTel) producirá la aplicación y cuándo se debe agregar soporte
para futuros SDKs:

1. La demo debe producir logs, trazas y métricas de OTel de forma predeterminada
   para los lenguajes que tienen un SDK en estado GA.
2. Los lenguajes que tienen un SDK en estado Beta disponible pueden incluirse
   pero no son requeridos como los SDKs GA.
3. Se deben producir métricas nativas de OTel donde sea posible.
4. Tanto la instrumentación manual como las bibliotecas de instrumentación
   (auto-instrumentación) deben demostrarse en cada lenguaje.
5. Todos los datos deben exportarse primero al Collector.
6. El Collector debe ser configurable para permitir una variedad de experiencias
   de consumo, pero se deben seleccionar herramientas por defecto para cada
   señal.
7. La arquitectura de la aplicación de demo que utiliza el Collector debe estar
   diseñada para ser una arquitectura de referencia de mejores prácticas.
