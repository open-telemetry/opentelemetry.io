---
title: Cómo nombrar tus métricas
linkTitle: Cómo nombrar tus métricas
date: 2025-09-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-metrics
default_lang_commit: 710cf5e9afcb8a9bc14366a65d242687f917c893
# prettier-ignore
cSpell:ignore: apiserver descubribilidad jpkrohling kubelet mantenlas mebibytes OllyGarden scheduler UCUM
---

Las métricas son la columna vertebral cuantitativa de la observabilidad: los
números que nos dicen cómo están funcionando nuestros sistemas. Este es el
tercer artículo de nuestra serie sobre nombres en OpenTelemetry, donde ya hemos
explorado [cómo nombrar spans](/blog/2025/how-to-name-your-spans/) y
[cómo enriquecerlos con atributos significativos](/blog/2025/how-to-name-your-span-attributes/).
Ahora abordemos el arte de nombrar las mediciones que importan.

A diferencia de los spans, que cuentan historias sobre lo que ocurrió, las
métricas nos hablan de cantidades: cuántos, qué tan rápido, cuánto. Pero aquí
está el detalle: nombrarlas bien es tan crucial como nombrar spans, y los
principios que ya aprendimos se aplican aquí también. El “quién” sigue
perteneciendo a los atributos, no a los nombres.

## Aprendiendo de los sistemas tradicionales {#learning-from-traditional-systems}

Antes de adentrarnos en las buenas prácticas de OpenTelemetry, veamos cómo los
sistemas de monitoreo tradicionales manejan el nombrado de métricas. Tomemos
Kubernetes, por ejemplo. Sus métricas siguen patrones como:

- `apiserver_request_total`
- `scheduler_schedule_attempts_total`
- `container_cpu_usage_seconds_total`
- `kubelet_volume_stats_used_bytes`

¿Notas el patrón? **Nombre del componente + recurso + acción + unidad**. El
nombre del servicio o componente está incrustado directamente en el nombre de la
métrica. Este enfoque tenía sentido en modelos de datos más simples, donde las
opciones para almacenar contexto eran limitadas.

Pero esto genera varios problemas:

- **Backend de observabilidad saturado**: Cada componente obtiene su propio
  espacio de nombres de métricas, lo que dificulta encontrar la métrica correcta
  entre docenas o cientos de nombres similares.
- **Agregación inflexible**: No se pueden sumar fácilmente métricas entre
  diferentes componentes.
- **Dependencia del proveedor**: Los nombres de las métricas quedan ligados a
  implementaciones específicas.
- **Sobrecarga de mantenimiento**: Agregar nuevos servicios requiere nuevos
  nombres de métricas.

## El anti-patrón principal: Nombres de servicio en las métricas {#the-core-anti-pattern-service-name-in-metric-names}

Aquí está el principio más importante para las métricas en OpenTelemetry: **No
incluyas el nombre de tu servicio en el nombre de la métrica**.

Supongamos que tienes un servicio de pagos. Podrías sentir la tentación de crear
métricas como:

- `payment.transaction.count`
- `payment.latency.p95`
- `payment.error.rate`

No lo hagas. El nombre del servicio ya está disponible como contexto a través
del atributo de recurso `service.name`. En su lugar, usa:

- `transaction.count` con `service.name=payment`
- `http.server.request.duration` con `service.name=payment`
- `error.rate` con `service.name=payment`

¿Por qué es mejor? Porque ahora puedes agregar fácilmente entre todos los
servicios:

```promql
sum(transaction.count)  // Todas las transacciones en todos los servicios
sum(transaction.count{service.name="payment"})  // Solo transacciones del servicio de pagos
```

Si cada servicio tuviera su propio nombre de métrica, necesitarías conocer cada
nombre de servicio para construir dashboards significativos. Con nombres
limpios, una sola consulta funciona para todo.

## El modelo de contexto enriquecido de OpenTelemetry {#the-enriched-context-model-of-opentelemetry}

Las métricas en OpenTelemetry se benefician del mismo
[modelo de contexto enriquecido](/docs/specs/otel/common/#attribute) que
discutimos en nuestro artículo sobre atributos de spans. En lugar de forzar todo
en el nombre de la métrica, tenemos múltiples capas donde puede vivir el
contexto:

### Enfoque tradicional (estilo Prometheus): {#traditional-approach-prometheus-style}

```promql
payment_service_transaction_total{method="credit_card",status="success"}
user_service_auth_latency_milliseconds{endpoint="/login",region="us-east"}
inventory_service_db_query_seconds{table="products",operation="select"}
```

### Enfoque OpenTelemetry: {#opentelemetry-approach}

```yaml
transaction.count
- Resource: service.name=payment, service.version=1.2.3, deployment.environment.name=prod
- Scope: instrumentation.library.name=com.acme.payment, instrumentation.library.version=2.1.0
- Attributes: method=credit_card, status=success

auth.duration
- Resource: service.name=user, service.version=2.0.1, deployment.environment.name=prod
- Scope: instrumentation.library.name=express.middleware
- Attributes: endpoint=/login, region=us-east
- Unit: ms

db.client.operation.duration
- Resource: service.name=inventory, service.version=1.5.2
- Scope: instrumentation.library.name=postgres.client
- Attributes: db.sql.table=products, db.operation=select
- Unit: s
```

Esta separación en tres capas sigue el modelo de especificación de
OpenTelemetry: **Eventos → Flujos de métricas → Series temporales**, donde el
contexto fluye a través de múltiples niveles jerárquicos en lugar de estar
comprimido en los nombres.

## Unidades: mantenlas fuera de los nombres también {#units-keep-them-out-of-names-too}

Al igual que aprendimos que los nombres de servicio no pertenecen a los nombres
de métricas, **las unidades tampoco pertenecen ahí**. Los sistemas tradicionales
suelen incluir unidades en el nombre porque carecen de metadatos de unidad
adecuados:

- `response_time_milliseconds`
- `memory_usage_bytes`
- `throughput_requests_per_second`

OpenTelemetry trata las unidades como metadatos, separados del nombre:

- `http.server.request.duration` con unidad `ms`
- `system.memory.usage` con unidad `By`
- `http.server.request.rate` con unidad `{request}/s`

Este enfoque ofrece varios beneficios:

1. **Nombres limpios**: Sin sufijos feos que saturen tus nombres de métricas.
2. **Unidades estandarizadas**: Sigue el
   [Código Unificado para Unidades de Medida (UCUM)](/docs/specs/semconv/general/metrics/#instrument-units).
3. **Flexibilidad del backend**: Los sistemas pueden manejar la conversión de
   unidades automáticamente.
4. **Convenciones consistentes**: Se alinea con las
   [convenciones semánticas](/docs/specs/semconv/general/metrics/) de
   OpenTelemetry.

La especificación recomienda usar unidades sin prefijos como `By` (bytes) en
lugar de `MiBy` (mebibytes), a menos que haya razones técnicas para lo
contrario.

## Guías prácticas para nombrar métricas {#practical-naming-guidelines}

Al crear nombres de métricas, aplica el mismo principio '{verbo} {objeto}' que
aprendimos para los spans, cuando tenga sentido:

1. **Concéntrate en la operación**: ¿Qué se está midiendo?
2. **No en el operador**: ¿Quién está midiendo?
3. **Sigue las convenciones semánticas**: Usa
   [patrones establecidos](/docs/specs/semconv/general/metrics/) cuando estén
   disponibles.
4. **Mantén las unidades como metadatos**: No añadas sufijos de unidades en los
   nombres.

Aquí algunos ejemplos siguiendo las
[convenciones semánticas](/docs/specs/semconv/general/metrics/) de
OpenTelemetry:

- `http.server.request.duration` (no `payment_http_requests_ms`)
- `db.client.operation.duration` (no `user_service_db_queries_seconds`)
- `messaging.client.sent.messages` (no `order_service_messages_sent_total`)
- `transaction.count` (no `payment_transaction_total`)

## Ejemplos reales de migración {#real-world-migration-examples}

| Tradicional (Contexto + Unidades en el nombre) | OpenTelemetry (Separación limpia)                                              | Por qué es mejor                              |
| :--------------------------------------------- | :----------------------------------------------------------------------------- | :-------------------------------------------- |
| `payment_transaction_total`                    | `transaction.count` + `service.name=payment` + unidad `1`                      | Agregable entre servicios                     |
| `user_service_auth_latency_ms`                 | `auth.duration` + `service.name=user` + unidad `ms`                            | Nombre estándar de operación, unidad correcta |
| `inventory_db_query_seconds`                   | `db.client.operation.duration` + `service.name=inventory` + unidad `s`         | Sigue convenciones semánticas                 |
| `api_gateway_requests_per_second`              | `http.server.request.rate` + `service.name=api-gateway` + unidad `{request}/s` | Nombre limpio, unidad de tasa adecuada        |
| `redis_cache_hit_ratio_percent`                | `cache.hit_ratio` + `service.name=redis` + unidad `1`                          | Las razones no tienen unidad                  |

## Beneficios de nombres limpios {#benefits-of-clean-naming}

Separar el contexto de los nombres de métricas proporciona ventajas técnicas que
mejoran tanto el rendimiento de consultas como los flujos operativos. El primer
beneficio es la agregación entre servicios. Una consulta como
`sum(transaction.count)` devuelve datos de todos los servicios sin necesidad de
mantener una lista de nombres de servicio. En un sistema con 50 microservicios,
esto significa una sola consulta en lugar de 50, y esa consulta no se rompe
cuando agregas el servicio número 51.

Esta consistencia hace que los dashboards sean reutilizables entre servicios. Un
dashboard creado para monitorear peticiones HTTP en tu servicio de autenticación
funciona sin modificaciones para tu servicio de pagos, inventario o cualquier
otro componente HTTP. Escribes la consulta una vez —
`http.server.request.duration` filtrado por `service.name` — y la aplicas en
todas partes. Ya no necesitas mantener docenas de dashboards casi idénticos.
Algunos proveedores de observabilidad llevan esto aún más lejos, generando
dashboards automáticamente basados en los nombres de métricas de las
convenciones semánticas: cuando tus servicios emiten
`http.server.request.duration`, la plataforma sabe exactamente qué
visualizaciones y agregaciones tienen sentido.

Los nombres limpios también reducen el desorden en los espacios de nombres de
métricas. Con docenas de servicios, el enfoque tradicional produce cientos de
variaciones como `apiserver_request_total`, `payment_service_request_total`,
`user_service_request_total`, etc. Encontrar la métrica correcta se vuelve un
ejercicio de búsqueda tediosa. Con nombres limpios, tienes una sola métrica
(`request.count`) con atributos para capturar el contexto. Esto simplifica la
descubribilidad.

El manejo de unidades también se vuelve sistemático cuando las unidades son
metadatos. Las plataformas pueden convertir unidades automáticamente — mostrando
una métrica de duración en milisegundos en un gráfico y en segundos en otro. La
métrica sigue siendo `request.duration` con unidad `ms`, no dos métricas
distintas.

El enfoque garantiza compatibilidad entre instrumentación manual y automática.
Cuando sigues convenciones semánticas como `http.server.request.duration`, tus
métricas personalizadas se alinean con las generadas por librerías de
autoinstrumentación. Esto crea un modelo de datos coherente donde las consultas
funcionan en ambos casos.

## Errores comunes a evitar {#common-pitfalls-to-avoid}

Los ingenieros suelen incrustar información de despliegue en los nombres de
métricas, como `user_service_v2_latency`. Esto se rompe cuando se despliega la
versión 3. Lo mismo ocurre con nombres específicos de instancia como
`node_42_memory_usage`. Con escalado dinámico, terminas con cientos de métricas
distintas que representan la misma medición.

Prefijos específicos de entorno como `prod_payment_errors` y
`staging_auth_count` causan problemas similares: no puedes escribir una consulta
única que funcione en todos los entornos. Lo mismo ocurre al incluir detalles de
tecnología en los nombres, como `nodejs_payment_memory`, que deja de tener
sentido si migras el servicio a Go.

El patrón es claro: el contexto que varía por despliegue, instancia, entorno o
versión pertenece a los atributos, no al nombre de la métrica. El nombre debe
identificar **qué** estás midiendo. Todo lo demás vive en la capa de atributos.

## Cultivando mejores métricas {#cultivating-better-metrics}

Al igual que los spans, las métricas bien nombradas son un regalo para tu futuro
tú y tu equipo. Proporcionan claridad durante incidentes, habilitan análisis
poderoso entre servicios y hacen que tus datos de observabilidad sean realmente
útiles.

La clave es la misma que aprendimos con los spans: **separación de
responsabilidades**. El nombre describe lo que mides. El contexto —quién lo
mide, dónde, cuándo y cómo— vive en la jerarquía de atributos de OpenTelemetry.

En nuestro próximo artículo, profundizaremos en **atributos de métricas**: la
capa de contexto que hace realmente poderosas a las métricas. Exploraremos cómo
estructurar la información contextual y cómo equilibrar la riqueza de datos con
las preocupaciones de cardinalidad.

Hasta entonces, recuerda: un nombre de métrica limpio es como un sendero de
jardín bien cuidado: te lleva exactamente a donde necesitas ir.
