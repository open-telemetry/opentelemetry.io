---
title: Logs
description: La grabación de un evento.
weight: 3
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
# prettier-ignore
cSpell:ignore: efgh filelogreceiver ijkl KHTML mnop parsea parsean parsear parsearlos preprocesar preprocesarlos semiestructurado semiestructurados semistructured transformprocessor
---

Un **log** es un registro de texto con marca de tiempo, ya sea estructurado
(recomendado) o no estructurado, con metadatos opcionales. De todas las señales
de telemetría, los logs son la señal de telemetría con más historia. La mayoría
de los lenguajes de programación tienen capacidades de logging integradas o
librerías de logging muy conocidas y ampliamente usadas.

## Logs de OpenTelemetry {#opentelemetry-logs}

OpenTelemetry no define una API o SDK a medida para crear logs. En cambio, los
logs de OpenTelemetry son los logs existentes que ya tienes de un framework de
logging o un componente de infraestructura. Los SDKs y la auto-instrumentación
de OpenTelemetry utilizan varios componentes para correlacionar automáticamente
los logs con las [trazas](../traces).

El soporte de OpenTelemetry para los logs está diseñado para ser totalmente
compatible con lo que ya tienes, proporcionando capacidades para envolver esos
logs con contexto adicional y un kit de herramientas común para parsear y
manipular logs en un formato común para muchas fuentes diferentes.

### OpenTelemetry logs in the OpenTelemetry Collector {#opentelemetry-logs-in-the-opentelemetry-collector}

El [OpenTelemetry Collector](/docs/collector/) proporciona varias herramientas
para trabajar con logs:

- Varios receptores (`receivers`) que parsean logs de fuentes de datos de log
  específicas y conocidas.
- El `filelogreceiver`, que lee logs de cualquier fichero y proporciona
  funcionalidades para parsearlos desde diferentes formatos o usar una expresión
  regular.
- Procesadores como el `transformprocessor` que te permite parsear datos
  anidados, aplanar estructuras anidadas, añadir/eliminar/actualizar valores y
  más.
- Exportadores (`exporters`) que te permiten emitir datos de log en un formato
  que no es de OpenTelemetry.

El primer paso en la adopción de OpenTelemetry a menudo implica desplegar un
collector como un agente de logging de propósito general.

### Logs de OpenTelemetry para las aplicaciones {#opentelemetry-logs-for-application}

En las aplicaciones, los logs de OpenTelemetry se crean con cualquier librería
de logging o con las capacidades de logging integradas. Cuando añades
auto-instrumentación o activas un SDK, OpenTelemetry correlacionará
automáticamente tus logs existentes con cualquier traza y span activo,
envolviendo el cuerpo del log con sus IDs. En otras palabras, OpenTelemetry
correlaciona automáticamente tus logs y trazas.

### Soporte para lenguajes {#language-support}

Los logs son una señal
[estable](/docs/specs/otel/versioning-and-stability/#stable) en la
especificación de OpenTelemetry. Para las implementaciones específicas de la API
de Logs y el SDK de cada lenguaje, el estado es el siguiente:

{{% signal-support-table "logs" %}}

## Logs estructurados, no estructurados y semiestructurados {#structured-unstructured-and-semistructured-logs}

OpenTelemetry no distingue técnicamente entre logs estructurados y no
estructurados. Puedes usar cualquier log que ya tengas con OpenTelemetry. Sin
embargo, ¡no todos los formatos de log son igualmente útiles! Los logs
estructurados, en particular, son recomendados para la observabilidad en
producción porque son fáciles de parsear y analizar a escala. La siguiente
sección explica las diferencias entre logs estructurados, no estructurados y
semiestructurados.

### Structured logs {#structured-logs}

Un log estructurado es un log cuyo formato de texto sigue un formato consistente
y que las máquinas puedan leer. Para las aplicaciones, uno de los formatos más
comunes es JSON:

```json
{
  "timestamp": "2024-08-04T12:34:56.789Z",
  "level": "INFO",
  "service": "user-authentication",
  "environment": "production",
  "message": "User login successful",
  "context": {
    "userId": "12345",
    "username": "johndoe",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
  },
  "transactionId": "abcd-efgh-ijkl-mnop",
  "duration": 200,
  "request": {
    "method": "POST",
    "url": "/api/v1/login",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "body": {
      "username": "johndoe",
      "password": "******"
    }
  },
  "response": {
    "statusCode": 200,
    "body": {
      "success": true,
      "token": "jwt-token-here"
    }
  }
}
```

y para los componentes de infraestructura, el Common Log Format (CLF) se usa
habitualmente:

```text
127.0.0.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234
```

También es habitual que se mezclen diferentes formatos de logs estructurados.
Por ejemplo, un log en Extended Log Format (ELF) puede mezclar JSON con un log
en formato CLF con datos separados por espacios en blanco.

```text
192.168.1.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36" {"transactionId": "abcd-efgh-ijkl-mnop", "responseTime": 150, "requestBody": {"username": "johndoe"}, "responseHeaders": {"Content-Type": "application/json"}}
```

Para aprovechar al máximo este log, parsea tanto las partes de JSON como las
relacionadas con ELF en un formato compartido para facilitar el análisis en un
backend de observabilidad. El `filelogreceiver` en el
[OpenTelemetry Collector](/docs/collector) contiene formas estandarizadas de
parsear logs como este.

Los logs estructurados son la forma preferida de usar logs. Dado que los logs
estructurados se emiten en un formato consistente, son fáciles de parsear, lo
que los hace más sencillos de preprocesar en un colector de OpenTelemetry, de
correlacionar con otros datos y, en última instancia, de analizar en un backend
de observabilidad.

### Logs no estructurados {#unstructured-logs}

Los logs no estructurados son logs que no siguen una estructura consistente.
Pueden ser más legibles por humanos y se usan a menudo en el desarrollo. Sin
embargo, no es preferible usar logs no estructurados para propósitos de
observabilidad en producción, ya que son mucho más difíciles de parsear y
analizar a escala.

Ejemplos de logs no estructurados:

```text
[ERROR] 2024-08-04 12:45:23 - Failed to connect to database. Exception: java.sql.SQLException: Timeout expired. Attempted reconnect 3 times. Server: db.example.com, Port: 5432

System reboot initiated at 2024-08-04 03:00:00 by user: admin. Reason: Scheduled maintenance. Services stopped: web-server, database, cache. Estimated downtime: 15 minutes.

DEBUG - 2024-08-04 09:30:15 - User johndoe performed action: file_upload. Filename: report_Q3_2024.pdf, Size: 2.3 MB, Duration: 5.2 seconds. Result: Success
```

Es factible almacenar y analizar logs no estructurados en producción, aunque es
posible que necesites hacer un trabajo sustancial para parsearlos o
preprocesarlos de otra forma para que sean interpretables por máquina. Por
ejemplo, los tres logs anteriores requerirán una expresión regular para parsear
sus marcas de tiempo y parsers personalizados para extraer de forma consistente
los cuerpos del mensaje de log. Esto será típicamente necesario para que un
backend de logging sepa cómo ordenar y organizar los logs por su marca de
tiempo. Aunque es posible parsear logs no estructurados para fines de análisis,
hacerlo puede suponer más trabajo que cambiar al logging estructurado, por
ejemplo, a través de un framework de logging estándar en tus aplicaciones.

### Logs semiestructurados {#semistructured-logs}

Un log semiestructurado es un log que utiliza algunos patrones propios y
consistentes para distinguir datos de modo que sean interpretable por máquina,
pero puede que no use el mismo formato y delimitadores entre los datos de
diferentes sistemas.

Ejemplo de un log semiestructurado:

```text
2024-08-04T12:45:23Z level=ERROR service=user-authentication userId=12345 action=login message="Failed login attempt" error="Invalid password" ipAddress=192.168.1.1 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
```

Aunque son interpretables por máquina, los logs semiestructurados pueden
requerir parsers diferentes para permitir el análisis a escala.

## Componentes de logging de OpenTelemetry {#opentelemetry-logging-components}

Las siguientes listas de conceptos y componentes son la clave para el soporte de
logging en OpenTelemetry.

### Log Appender / Bridge {#log-appender--bridge}

Como desarrollador de aplicaciones, la **`Logs Bridge API`** no debe ser llamada
directamente por ti, ya que se proporciona para que los autores de librerías de
logging construyan log appenders / bridges. En su lugar, simplemente usas tu
librería de logging preferida y la configuras para usar un log appender (o log
bridge) que sea capaz de emitir logs en un `LogRecordExporter`de OpenTelemetry.

Los SDKs de lenguaje de OpenTelemetry ofrecen esta funcionalidad.

### Logger Provider {#logger-provider}

> Es parte de la **`Logs Bridge API`** y solo debe usarse si eres el autor de
> una librería de logging.

Un `Logger Provider` (a veces llamado `LoggerProvider`) es una factoría para
`Loggers`. En la mayoría de los casos, el `Logger Provider` se inicializa una
vez y su ciclo de vida coincide con el ciclo de vida de la aplicación. La
inicialización del `Logger Provider` también incluye la inicialización del
`Resource` y del `Exporter`.

### Logger {#logger}

> Es parte de la **Logs Bridge API** y solo debe usarse si eres el autor de una
> librería de logging.

Un `Logger` crea registros de log (`Log Records`). Los Loggers se crean a partir
de los `Log Providers`.

### Log Record Exporter {#log-record-exporter}

Los Exportadores de registros de log envían registros de log a un consumidor.
Este consumidor puede ser la salida estándar para la depuración y el tiempo de
desarrollo, el OpenTelemetry Collector, o cualquier backend de código abierto o
de proveedores de tu elección.

### Log Record {#log-record}

Un registro de log representa la grabación de un evento. En OpenTelemetry, un
registro de log contiene dos tipos de campos:

- Campos de nivel superior con nombre de tipo y significado específicos
- Campos de Recurso y atributos de valor y tipo arbitrarios

Los campos de nivel superior son:

| Field Name           | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| Timestamp            | Momento en el que ocurrió el evento.                           |
| ObservedTimestamp    | Momento en que se observó el evento.                           |
| TraceId              | ID de la traza de la petición.                                 |
| SpanId               | ID del span de la petición.                                    |
| TraceFlags           | `flag` de traza W3C                                            |
| SeverityText         | El texto de la severidad (también conocido como nivel de log). |
| SeverityNumber       | Valor numérico de la severidad.                                |
| Body                 | El cuerpo del registro de log.                                 |
| Resource             | Describe la fuente del log.                                    |
| InstrumentationScope | Describe el ámbito que emitió el log.                          |
| Attributes           | Información adicional sobre el evento.                         |

Para más detalles sobre los registros de log y los campos de log, consulta el
[Modelo de datos de logs](/docs/specs/otel/logs/data-model/).

### Especificación {#specification}

Para saber más sobre logs en OpenTelemetry, consulta la [especificación de
logs][].

[especificación de logs]: /docs/specs/otel/overview/#log-signal
