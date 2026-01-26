---
title: Requisitos de Aplicación
linkTitle: Aplicación
aliases: [application_requirements]
default_lang_commit: 8cc5285f7294c2e6effe960b63da887ae278e3c6
---

Los siguientes requisitos fueron decididos para definir qué señales de
OpenTelemetry (OTel) producirá la aplicación y cuándo se debe agregar soporte
para futuros SDKs:

1. Cada lenguaje soportado que tenga un SDK en estado GA para Trazas o Métricas
   debe tener al menos 1 ejemplo de servicio.
   - Soporte móvil (Swift) no es una prioridad inicial y no está incluido en el
     requisito anterior.

2. Los procesos de la aplicación deben ser independientes del lenguaje.
   - Se prefiere gRPC donde esté disponible y se debe usar HTTP donde no lo
     esté.

3. Los servicios deben estar diseñados para ser componentes modulares que se
   puedan intercambiar.
   - Los servicios individuales pueden y deben ser incentivados a tener
     múltiples opciones de lenguaje disponibles.

4. La arquitectura debe permitir la posible integración de componentes genéricos
   de plataforma como base de datos, queue o almacenamiento de blobs.
   - No hay un requisito para un tipo de componente particular - al menos 1
     componente genérico debe estar presente en general.

5. Se debe proporcionar un generador de carga para simular la carga de usuarios
   contra la demo.
