---
title: Cómo nombrar tus atributos de span
linkTitle: Cómo nombrar tus atributos de span
date: 2025-08-27
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-span-attributes
default_lang_commit: 421fe301e49dbcec3202d0aaaf939da4a499f020
cSpell:ignore: interoperabilidad jpkrohling OllyGarden shopify
---

Bienvenidos a la segunda entrega de nuestra serie sobre buenas prácticas de
nomenclatura en OpenTelemetry. En nuestra
[publicación anterior](/blog/2025/how-to-name-your-spans/), exploramos cómo
nombrar spans usando el patrón `{verbo} {objeto}`. Hoy, profundizamos en los
atributos de span — los datos contextuales enriquecidos que transforman tus
trazas de simples registros de operación en potentes herramientas de depuración
y análisis.

Esta guía está dirigida a desarrolladores que están:

- **Instrumentando sus propias aplicaciones** con spans y atributos
  personalizados
- **Enriqueciendo la telemetría** más allá de lo que ofrece la
  auto-instrumentación
- **Creando bibliotecas** que otros instrumentarán

Las decisiones que tomas sobre la nomenclatura de atributos impactan
directamente en la usabilidad y el mantenimiento de tus datos de observabilidad.
Es importante hacerlo bien.

## Empieza con las convenciones semánticas {#start-with-semantic-conventions}

Esta es la regla más importante que te ahorrará tiempo y mejorará la
interoperabilidad: **si existe una
[convención semántica](/docs/specs/semconv/registry/attributes/) de
OpenTelemetry y la semántica coincide con tu caso de uso, úsala**.

No se trata solo de conveniencia, sino de crear telemetría que se integre sin
problemas con el ecosistema más amplio de OpenTelemetry. Al usar nombres de
atributos estandarizados, tus datos funcionan automáticamente con los
_dashboards_, reglas de alertas y herramientas de análisis existentes.

### Cuando la semántica coincide, usa la convención {#when-semantics-match-use-the-convention}

| Lo que necesitas                      | Usa esta convención semántica | Por qué                                                        |
| :------------------------------------ | :---------------------------- | :------------------------------------------------------------- |
| Método de petición HTTP               | `http.request.method`         | Estandarizado en toda instrumentación HTTP                     |
| Nombre de colección de bases de datos | `db.collection.name`          | Compatible con herramientas de monitoreo de bases de datos     |
| Identificación del servicio           | `service.name`                | Atributo de recurso principal para la correlación de servicios |
| Dirección de _peer_ de red            | `network.peer.address`        | Estándar para depuración a nivel de red                        |
| Clasificación de errores              | `error.type`                  | Habilita un análisis consistente de errores                    |

El principio clave es **coincidencia semántica sobre preferencia de nombre**.
Incluso si prefieres `database_table` sobre `db.collection.name`, usa la
convención semántica cuando describa con precisión tus datos.

### Cuando la semántica no coincide, no la fuerces {#when-semantics-dont-match-dont-force-it}

Resista la tentación de hacer un mal uso de las convenciones semánticas:

| No hagas esto                                       | Por qué está incorrecto                              |
| :-------------------------------------------------- | :--------------------------------------------------- |
| Usar `db.collection.name` para un nombre de archivo | Archivos y colecciones de DB son conceptos distintos |
| Usar `http.request.method` para acciones de negocio | "approve_payment" no es un método HTTP               |
| Usar `user.id` para un ID de transacción            | Usuarios y transacciones son entidades diferentes    |

El mal uso de convenciones semánticas es peor que crear atributos
personalizados: genera confusión y rompe herramientas que esperan la semántica
estándar.

## La regla de oro: primero el dominio, nunca la empresa {#the-golden-rule-domain-first-never-company-first}

Cuando necesites atributos personalizados más allá de las convenciones
semánticas, el principio más crítico es: **empieza con el dominio o la
tecnología, nunca con el nombre de tu empresa o aplicación**.

Este principio parece obvio, pero se viola constantemente en la industria. Aquí
te mostramos por qué importa y cómo hacerlo bien.

### Por qué falla la nomenclatura empresa-primero {#why-company-first-naming-fails}

| Nombre de atributo incorrecto | Problemas                                            |
| :---------------------------- | :--------------------------------------------------- |
| `og.user.id`                  | El prefijo de empresa contamina el espacio global    |
| `myapp.request.size`          | Específico de aplicación, no reutilizable            |
| `acme.inventory.count`        | Dificulta correlación con atributos estándar         |
| `shopify_store.product.sku`   | Ata innecesariamente un concepto a un solo proveedor |

Estos enfoques crean atributos que son:

- Difíciles de correlacionar entre equipos y organizaciones
- Imposibles de reutilizar en contextos diferentes
- Atados a proveedores y poco flexibles
- Inconsistentes con los objetivos de interoperabilidad de OpenTelemetry

### Casos de éxito dominio-primero {#domain-first-success-cases}

| Buen nombre de atributo | Por qué funciona                         |
| :---------------------- | :--------------------------------------- |
| `user.id`               | Concepto universal, neutral              |
| `request.size`          | Reutilizable en múltiples apps           |
| `inventory.count`       | Concepto claro, específico de dominio    |
| `product.sku`           | Terminología estándar de e-commerce      |
| `workflow.step.name`    | Concepto genérico de gestión de procesos |

Este enfoque crea atributos universalmente comprensibles, reutilizables por
otros con problemas similares y preparados para el futuro.

## Entendiendo la estructura: puntos y guiones bajos {#understanding-the-structure-dots-and-underscores}

Los nombres de atributos en OpenTelemetry siguen un patrón estructural que
equilibra legibilidad con consistencia. Entenderlo ayuda a crear atributos que
se sientan naturales junto a las convenciones semánticas estándar.

### Usa puntos para separación jerárquica {#use-dots-for-hierarchical-separation}

Los puntos (`.`) separan componentes jerárquicos, siguiendo el patrón:
`{dominio}.{componente}.{propiedad}`

Ejemplos de convenciones semánticas:

- `http.request.method` - Dominio HTTP, componente petición, propiedad método
- `db.collection.name` - Dominio base de datos, componente colección, propiedad
  nombre
- `service.instance.id` - Dominio servicio, componente instancia, propiedad ID

### Usa guiones bajos para componentes de varias palabras {#use-underscores-for-multi-word-components}

Cuando un solo componente contiene varias palabras, usa guiones bajos (`_`):

- `http.response.status_code` - "status_code" es un solo componente lógico
- `system.memory.usage_percent` - "usage_percent" es un concepto de medición

### Crea jerarquías más profundas cuando sea necesario {#create-deeper-hierarchies-when-needed}

Puedes anidar más si agrega claridad:

- `http.request.body.size`
- `k8s.pod.label.{key}`
- `messaging.kafka.message.key`

Cada nivel debe representar un límite conceptual significativo.

## Espacios de nombres reservados: lo que nunca debes usar

Ciertos espacios de nombres están estrictamente reservados, y violar estas
reglas puede romper tus datos de telemetría.

### El espacio `otel.*` está prohibido {#the-otel-namespace-is-prohibited}

El prefijo `otel.*` está reservado exclusivamente para la propia especificación
de OpenTelemetry. Se usa para expresar conceptos de OpenTelemetry en formatos de
telemetría que no los soportan de forma nativa.

Atributos reservados `otel.*` incluyen:

- `otel.scope.name` - Nombre del alcance de instrumentación
- `otel.status_code` - Código de estado del _span_
- `otel.span.sampling_result` - Decisión de muestreo

**Nunca crees atributos que empiecen con `otel.`**. Cualquier adición a este
espacio de nombres debe aprobarse como parte de la especificación de
OpenTelemetry.

### Otros atributos reservados {#other-reserved-attributes}

La especificación también reserva estos nombres específicos:

- `error.type`
- `exception.message`, `exception.stacktrace`, `exception.type`
- `server.address`, `server.port`
- `service.name`
- `telemetry.sdk.language`, `telemetry.sdk.name`, `telemetry.sdk.version`
- `url.scheme`

## Patrones de convenciones semánticas {#semantic-convention-patterns}

La mejor forma de desarrollar intuición sobre nomenclatura de atributos es
estudiando las convenciones semánticas de OpenTelemetry. Estas representan miles
de horas de trabajo de expertos en observabilidad.

### Patrones de organización por dominio {#domain-organization-patterns}

Observa cómo las convenciones semánticas se organizan alrededor de dominios
claros:

#### Dominios de infraestructura {#infrastructure-domains}

- `service.*` - Identidad y metadatos de servicio
- `host.*` - Información de _host_/máquina
- `container.*` - Información de tiempo de ejecución de contenedor
- `process.*` - Procesos del sistema operativo

#### Dominios de comunicación {#communication-domains}

- `http.*` - Específicos del protocolo HTTP
- `network.*` - Información de la capa de red
- `rpc.*` - Atributos de llamadas a procedimiento remoto (RPC)
- `messaging.*` - Sistemas de colas de mensajes

#### Dominios de datos {#data-domains}

- `db.*` - Operaciones de bases de datos
- `url.*` - Componentes de URL

### Patrones de propiedades universales {#universal-property-patterns}

En todos los dominios, emergen patrones consistentes para propiedades comunes:

#### Propiedades de identidad {#identity-properties}

- `.name` - Identificadores legibles por humanos (`service.name`,
  `container.name`)
- `.id` - Identificadores de sistema (`container.id`, `process.pid`)
- `.version` - Información de versión (`service.version`)
- `.type` - Clasificación (`messaging.operation.type`, `error.type`)

#### Propiedades de red {#network-properties}

- `.address` - Direcciones de red (`server.address`, `client.address`)
- `.port` - Números de puerto (`server.port`, `client.port`)

#### Propiedades de medición {#measurement-properties}

- `.size` - Medidas en bytes (`http.request.body.size`)
- `.count` - Cantidades (`messaging.batch.message_count`)
- `.duration` - Medidas de tiempo (`http.server.request.duration`)

Al crear dominios personalizados, sigue estos mismos patrones. Para gestión de
inventario, considera:

- `inventory.item.name`
- `inventory.item.id`
- `inventory.location.address`
- `inventory.batch.count`

## Crear dominios personalizados de forma segura {#safe-custom-domain-practices}

A veces tu lógica de negocio requiere atributos fuera de las convenciones
semánticas existentes. Esto es normal — OpenTelemetry no puede cubrir todos los
dominios de negocio posibles.

### Pautas para dominios personalizados seguros {#safe-custom-domain-practices}

1. **Elige nombres descriptivos y genéricos** que otros puedan reutilizar.
2. **Evita terminología específica de empresa** en el nombre del dominio.
3. **Sigue patrones jerárquicos** establecidos por las convenciones semánticas.
4. **Considera si tu dominio podría convertirse en una futura convención
   semántica**.

### Ejemplos de atributos personalizados bien diseñados {#examples-of-well-designed-custom-attributes}

| Dominio   | Buenos atributos                         | Por qué funcionan                         |
| :-------- | :--------------------------------------- | :---------------------------------------- |
| Negocio   | `payment.method`, `order.status`         | Conceptos claros y reutilizables          |
| Logística | `inventory.location`, `shipment.carrier` | Específicos de dominio pero transferibles |
| Proceso   | `workflow.step.name`, `approval.status`  | Gestión genérica de procesos              |
| Contenido | `document.format`, `media.codec`         | Conceptos universales de contenido        |

## La rara excepción: cuándo los prefijos tienen sentido {#when-prefixes-make-sense}

En casos poco comunes, podrías necesitar utilizar prefijos de empresa o
aplicación. Esto ocurre típicamente cuando tu atributo podría entrar en
conflicto con atributos de otras fuentes en un sistema distribuido.

**Considera prefijos cuando:**

- Tu atributo podría entrar en conflicto con atributos de proveedores en un
  sistema distribuido.
- Estás instrumentando tecnología propietaria verdaderamente específica de la
  empresa.
- Estás capturando detalles internos de implementación que no deberían
  generalizarse.

Para la mayoría de atributos de lógica de negocio, mantén la nomenclatura
dominio-primero.

## Tu plan de acción {#your-action-plan}

Nombrar bien los atributos de span genera datos de telemetría fáciles de
mantener, interoperables y valiosos en toda tu organización. Aquí tu hoja de
ruta:

1. **Revisa siempre primero las convenciones semánticas** - Úsalas cuando
   coincidan.
2. **Lidera con el dominio, nunca con la empresa** - Crea atributos neutrales.
3. **Respeta los espacios reservados** - Evita especialmente `otel.*`.
4. **Sigue patrones jerárquicos** - Usa puntos y guiones bajos consistentemente.
5. **Construye para la reutilización** - Piensa más allá de tus necesidades
   actuales.

Al seguir estos principios, no solo estarás resolviendo los retos de
instrumentación de hoy, sino que contribuirás a un ecosistema de observabilidad
más coherente e interoperable que beneficia a todos.

En nuestra próxima publicación de esta serie, cambiaremos el enfoque de los
spans a las métricas — explorando cómo nombrar las mediciones cuantitativas que
nos dicen cómo están funcionando nuestros sistemas, y por qué los mismos
principios de separación y enfoque en el dominio aplican a los números que más
importan.
