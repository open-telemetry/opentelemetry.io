---
title:
  'El recorrido hacia la configuración declarativa: por qué tomó 5 años ignorar
  los endpoints de health check en las trazas'
linkTitle: Recorrido de configuración declarativa
date: 2025-10-20
author: >-
  [Gregor Zeitlinger](https://github.com/zeitlinger) (Grafana Labs), [Jay
  DeLuca](https://github.com/jaydeluca) (Grafana Labs), [Marylia
  Gutierrez](https://github.com/maryliag) (Grafana Labs)
default_lang_commit: 2e0c4fbe87eeefebb416874d28b8d332ab91b4a6
cSpell:ignore: Dotel marylia otelconf Pruébalo zeitlinger
---

Una de las solicitudes de funcionalidades más persistentes y populares para
OpenTelemetry Java durante los últimos años ha sido la posibilidad de [descartar
spans para los endpoints de _health check_][drop-spans-issue], o de cualquier
otro endpoint de bajo valor que incremente costos. Este _issue_ se planteó por
primera vez en agosto de 2020, pero una solución integral tardó
sorprendentemente mucho tiempo en llegar. ¿Por qué nos tomó cinco años abordar
un problema aparentemente sencillo? La respuesta está en los principios
fundamentales del sistema de configuración de OpenTelemetry y en el recorrido
hacia un enfoque más robusto y flexible: la configuración declarativa.

Desde el inicio, OpenTelemetry se basó en variables de entorno para la
configuración, una elección impulsada por su disponibilidad universal entre
lenguajes y su facilidad de análisis. Sin embargo, a medida que crecían los
casos de uso con configuraciones más complejas, las limitaciones de las
variables de entorno basadas en texto se volvieron cada vez más evidentes,
haciendo que las configuraciones avanzadas fueran complicadas y difíciles de
mantener.

Aquí entra la configuración declarativa, una poderosa evolución que utiliza
archivos YAML para definir los ajustes de OpenTelemetry. Este cambio permite
leer datos desde cualquier fuente estructurada en forma de árbol, transformando
fundamentalmente la manera en que abordamos configuraciones complejas. A lo
largo de este artículo, exploraremos cómo la configuración declarativa ofrece
una solución elegante a los desafíos del pasado y cómo tiene un impacto
inmediato con casos prácticos como la exclusión de _health checks_ en Java.

## Primeros pasos {#getting-started}

El archivo de configuración es independiente del lenguaje, por lo que una vez
creado, puedes usarlo con todos tus SDKs. Las únicas excepciones son los
parámetros con el nombre del lenguaje, que solo son relevantes para ese lenguaje
(por ejemplo, el parámetro `instrumentation/development.java.spring_batch`). Ten
en cuenta que la configuración declarativa es **experimental**, por lo que aún
puede haber cambios.

El siguiente ejemplo muestra un archivo de configuración básico para comenzar:

```yaml
file_format: '1.0-rc.1'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # agregará "service.instance.id" y "service.name" desde OTEL_SERVICE_NAME

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}
```

Todo lo que necesitas es pasar
`OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/otel-config.yaml` a la aplicación para
activar la opción experimental de configuración declarativa. Esta variable solo
funciona en el agente de Java y en JavaScript al momento de escribir este texto.

## Configuración declarativa en Java {#declarative-configuration-in-java}

Veamos ahora la implementación más amplia de la configuración declarativa dentro
del ecosistema Java. Como lenguaje pionero en esta área, el agente de Java en la
versión 2.21+ ya admite completamente la configuración declarativa, con la
mayoría de las instrumentaciones y funcionalidades operativas. Estamos
trabajando para incorporar las funcionalidades restantes durante 2026, y puedes
seguir el progreso en el [panel del proyecto][java-project] y ver la [lista de
funcionalidades aún no soportadas][list-not-supported].

Dependiendo de si comienzas desde cero o migras desde variables de entorno,
puedes aprovechar varios recursos:

- El archivo básico (independiente del lenguaje) del ejemplo anterior es la
  forma más rápida de empezar si no necesitas personalizaciones adicionales.
- El [archivo de migración][migration-file] mapea las variables de entorno
  antiguas al esquema YAML, permitiendo una sustitución directa para usuarios
  con cargas configuradas mediante variables de entorno.
- El [archivo completo][full-file] (“cocina completa”) muestra todo el esquema,
  con documentación como comentarios. Es útil para quienes desean ver todas las
  opciones disponibles y sus valores predeterminados.

Todos los archivos anteriores funcionan para cualquier lenguaje que admita
configuración declarativa.

Además, existen ajustes específicos del agente Java que deben incluirse en la
sección `instrumentation` del archivo de configuración. Por ejemplo, si tienes
la propiedad del sistema
`otel.instrumentation.spring-batch.experimental.chunk.new-trace` en tu
aplicación, puedes crear la configuración declarativa eliminando el prefijo
`otel.instrumentation`, dividiendo por puntos y reemplazando `-` por `_`.

```yaml
file_format: '1.0-rc.1'

# ...

instrumentation/development:
  java:
    spring_batch:
      experimental:
        chunk:
          new_trace: true
```

Con esta configuración, los desarrolladores pueden continuar usando la
instrumentación de Java como siempre, enviando datos de telemetría a su
_backend_ de observabilidad preferido. Además, el archivo de configuración
declarativa ofrece flexibilidad para ampliar y agregar más parámetros según sea
necesario, permitiendo un control altamente personalizado y detallado sobre la
configuración de observabilidad.

## Exclusión de health checks {#health-check-exclusion}

Como se mencionó en la introducción, una de las solicitudes más comunes en la
comunidad de Java fue poder excluir los _health checks_ (u otros recursos poco
relevantes o ruidosos) de la generación de trazas.

Para lograrlo, debes agregar un bloque `sampler` dentro de tu configuración de
`tracer_provider`, como se muestra a continuación:

```yaml
file_format: '1.0-rc.1'

# ... el resto de la configuración ...

tracer_provider:
  # Configura el muestreo para excluir endpoints de health check.
  sampler:
    rule_based_routing:
      fallback_sampler:
        always_on:
      span_kind: SERVER
      rules:
        # Acción a tomar cuando la regla coincide. Debe ser DROP o RECORD_AND_SAMPLE.
        - action: DROP
          # El atributo del span con el que se comparará.
          attribute: url.path
          # El patrón a comparar con el atributo del span.
          pattern: /actuator.*
# ... el resto de la configuración de tracer_provider ...
```

Consulta la [documentación del _sampler_ de Java][java-sampler] para más
detalles sobre las opciones disponibles.

Pruébalo tú mismo:

1. Guarda [la configuración completa][complete-config]
2. Ejecuta el agente de Java con
   `-Dotel.experimental.config.file=/path/to/otel-config.yaml`

## Disponibilidad {#availability}

Luego de leer sobre la configuración declarativa, quizás te preguntes dónde está
disponible y cómo puedes empezar a usarla. Puedes encontrar orientación y los
lenguajes soportados en la [documentación][declarative-docs]. Al momento de esta
publicación, Java es totalmente compatible, mientras que PHP, JavaScript y Go
tienen compatibilidad parcial. Para ver el estado más reciente, consulta la
[matriz de compatibilidad][compliance-matrix] o el [_issue_ de seguimiento de
implementaciones por lenguaje][tracking-issue].

### Java

Como se describió antes, la configuración declarativa en
[Java][java-declarative-config] es experimental, pero lista para usarse. Usa el
ejemplo mencionado para configurar tu entorno. Si tienes preguntas o
comentarios, comunícate en [`#otel-java`][slack-java] en Slack de la CNCF.

_Nota para mantenedores de otros lenguajes:_ Es útil crear un módulo puente que
adapte los ajustes de configuración declarativa y las variables de entorno a una
interfaz común. En Java, este módulo es el [Declarative Config
Bridge][java-bridge].

### JavaScript

La implementación en el SDK de JavaScript está actualmente en desarrollo. Se ha
creado un nuevo paquete llamado [opentelemetry-configuration][js-package], que
maneja tanto variables de entorno como configuración declarativa. Con este
enfoque, el usuario no necesita modificar su instrumentación al cambiar entre
variables de entorno y archivo de configuración, ya que el nuevo paquete maneja
ambos y devuelve el mismo modelo de configuración. Actualmente, este paquete se
está integrando en otros paquetes de instrumentación para aprovechar la
configuración declarativa. Si tienes dudas, únete a [`#otel-js`][slack-js] en
Slack de la CNCF.

### PHP

La implementación de PHP es parcialmente compatible, y puedes empezar a usarla
[inicializando desde tu archivo de configuración][php-docs]. Para soporte o
comentarios, comunícate en [`#otel-php`][slack-php].

### Go

Go tiene una [implementación parcial][go-package] de la configuración
declarativa. Cada versión del esquema soportada tiene su propio directorio de
paquete. Por ejemplo, al importar `go.opentelemetry.io/contrib/otelconf/v0.3.0`
obtienes el código compatible con la versión 0.3.0 del esquema. Puedes encontrar
todas las versiones disponibles en el [índice de paquetes][go-package-index]. Si
tienes dudas sobre cómo usarlo, únete a [`#otel-go`][slack-go].

## El recorrido {#the-journey}

Entonces, ¿por qué nos tomó realmente cinco años ignorar los endpoints de
_health check_ en las trazas?

El recorrido hacia la configuración declarativa —y en consecuencia, hacia la
solución de exclusión de _health checks—_ refleja un principio central de
OpenTelemetry: construir soluciones sostenibles a través de especificaciones
rigurosas.

Desde el inicio, la dependencia de OpenTelemetry en las variables de entorno,
aunque universal, se volvió cada vez más compleja para configuraciones
avanzadas. Finalmente, se prohibió la creación de nuevas variables de entorno,
dejando un vacío que debía llenarse con una solución más robusta.

La sustitución, como presentamos en este artículo, es la configuración
declarativa. Definir y acordar la sintaxis y semántica precisas fue un proceso
largo y, a veces, agotador. Por ejemplo, se debatieron varias propuestas sobre
cómo incrustar variables de entorno hasta llegar a la solución actual de usar
`${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}`.

Este proceso sirve como un poderoso caso de estudio sobre cómo opera la
comunidad de OpenTelemetry: es un testimonio del consenso, la colaboración y el
esfuerzo colectivo necesarios para introducir nuevas funcionalidades y llevarlas
a cabo a través de diversos proyectos.

## ¿Qué sigue para la configuración declarativa? {#whats-next-for-declarative-configuration}

El recorrido de la configuración declarativa está lejos de terminar. Nuestro
enfoque actual implica un gran esfuerzo para ampliar el soporte entre lenguajes,
lo cual es crucial para garantizar que los desarrolladores, sin importar sus
herramientas preferidas, puedan aprovechar los beneficios del enfoque
declarativo.

Nos interesa profundamente los comentarios de los usuarios a medida que seguimos
desarrollando y mejorando estas funcionalidades. Te invitamos a experimentar con
las implementaciones actuales y comunicar activamente cualquier funcionalidad
que falte, los puntos problemáticos o las áreas de mejora. Este enfoque
colaborativo nos ayudará a priorizar esfuerzos y a garantizar que las soluciones
que construimos realmente respondan a las necesidades de la comunidad. Puedes
compartir tus comentarios o preguntas en el canal
[`#otel-config-file`][slack-config] de Slack de la CNCF.

Además de brindar comentarios, hay otras maneras de participar y contribuir al
crecimiento de la configuración declarativa. Cada SDK de OpenTelemetry tiene
[Grupos de Interés Especial (SIGs)][sigs] dedicados a su implementación. Unirte
a estos SIGs ofrece una vía directa para entender el estado actual, participar
en discusiones e identificar oportunidades de colaboración. Ya sea a través de
contribuciones de código, mejoras en la documentación o simplemente compartiendo
tu experiencia, cada aporte ayuda a fortalecer el ecosistema de configuración
declarativa. Tu participación activa es clave para fomentar un conjunto sólido y
versátil de herramientas para el desarrollo de aplicaciones modernas.

¡Esperamos escucharte pronto!

## Recursos adicionales {#additional-resources}

Para conocer más sobre el trabajo que se está realizando en torno a la
configuración declarativa, consulta los siguientes recursos:

- [_Simplifying OpenTelemetry with Configuration – Alex Boten (Honeycomb) & Jack
  Berg (New Relic)_][yt-config]
- [Documentación de configuración declarativa](/docs/languages/sdk-configuration/declarative-configuration/)
- [Repositorio de configuración declarativa][declarative-repo]

[drop-spans-issue]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/1060
[java-project]: https://github.com/orgs/open-telemetry/projects/151
[migration-file]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml
[full-file]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml
[java-sampler]:
  https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/samplers
[complete-config]:
  https://gist.github.com/zeitlinger/09585b1ab57c454f87e6dcb9a6f50a5c
[declarative-docs]: /docs/languages/sdk-configuration/declarative-configuration
[compliance-matrix]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration
[java-declarative-config]: /docs/zero-code/java/agent/declarative-configuration/
[slack-java]: https://cloud-native.slack.com/archives/C014L2KCTE3
[slack-js]: https://cloud-native.slack.com/archives/C01NL1GRPQR
[slack-php]: https://cloud-native.slack.com/archives/C01NFPCV44V
[slack-go]: https://cloud-native.slack.com/archives/C01NPAXACKT
[slack-config]: https://cloud-native.slack.com/archives/C0476L7UJT1
[java-bridge]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/declarative-config-bridge
[js-package]:
  https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-configuration
[php-docs]:
  https://github.com/open-telemetry/opentelemetry-php/tree/main/src/Config/SDK#initialization-from-configuration-file
[go-package]:
  https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/otelconf
[go-package-index]: https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf
[sigs]:
  https://github.com/open-telemetry/community?tab=readme-ov-file#implementation-sigs
[yt-config]: https://www.youtube.com/watch?v=u6svjtGpXO4
[declarative-repo]:
  https://github.com/open-telemetry/opentelemetry-configuration
[list-not-supported]:
  /docs/zero-code/java/agent/declarative-configuration/#not-yet-supported-features
[tracking-issue]:
  https://github.com/open-telemetry/opentelemetry-configuration/issues/100
