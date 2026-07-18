---
title:
  'Mastodon: ejecución de Collectors de OpenTelemetry en producción con un
  equipo pequeño'
linkTitle: Mastodon
default_lang_commit: 11753c0e99bbc1b62606d4c819736c777dfb0e98
cSpell:ignore: Fediverse otelbin Sidekiq Sloughter Öjeling
---

Por [Juliano Costa](https://github.com/julianocosta89) (Datadog),
[Tristan Sloughter](https://github.com/tsloughter) (community),
[Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs),
[Damien Mathieu](https://github.com/dmathieu) (Elastic),
[Tim Campbell](https://github.com/timetinytim) (Mastodon) | 18 de marzo de 2026

Esta implementación de referencia describe cómo Mastodon, una organización sin
ánimo de lucro que opera a escala global con un equipo notablemente pequeño,
ejecuta el OpenTelemetry Collector en producción.

## Mastodon de un vistazo {#mastodon-at-a-glance}

[Mastodon](https://joinmastodon.org) es una plataforma de redes sociales
descentralizada, gratuita y de código abierto, operada por una organización sin
ánimo de lucro.

La descentralización no es aquí un término de marketing, sino un principio
arquitectónico central. Cualquiera puede
[ejecutar su propio servidor de Mastodon](https://docs.joinmastodon.org/user/run-your-own/),
y esos servidores operados de forma independiente interoperan mediante
protocolos abiertos como parte de lo que se conoce como el _Fediverse_: una red
federada de plataformas sociales independientes que se comunican entre sí
usando protocolos estandarizados como ActivityPub. Al igual que ocurre con el
correo electrónico, los usuarios pueden comunicarse entre instancias
independientemente de quién las opere.

Esta filosofía condiciona no solo las decisiones de funcionalidades de
Mastodon, sino también su enfoque de la observabilidad.

### Estructura organizativa {#organizational-structure}

Toda la organización Mastodon está formada por unas 20 personas, y la
infraestructura de observabilidad (incluido el OpenTelemetry Collector) la
gestiona un único ingeniero.

A pesar del reducido tamaño del equipo, Mastodon opera dos grandes instancias
de Mastodon en producción:

- [mastodon.social](https://mastodon.social)

  Se ejecuta en Kubernetes con autoescalado entre 9 y 15 nodos (16 núcleos, 64
  GB de RAM cada uno). El frontend web escala entre 5 y 20 pods, mientras que
  los distintos pools de workers de Sidekiq escalan entre 10 y 40 pods. De
  media, mastodon.social tiene entre 70 y 80 pods en ejecución en un momento
  dado. Esta plataforma gestiona hasta **300 000 usuarios activos** al día y
  aproximadamente 10 millones de solicitudes por minuto.

- [mastodon.online](https://mastodon.online)

  Se ejecuta en Kubernetes con autoescalado entre 3 y 6 nodos (8 núcleos, 32 GB
  de RAM cada uno). El frontend web escala entre 3 y 10 pods, y los pools de
  Sidekiq escalan entre 5 y 15 pods, lo que da un promedio total de 20 a 30
  pods. Esta instancia opera a una escala menor, pero aun así considerable.

Con un ancho de banda operativo tan limitado, la simplicidad y la fiabilidad no
son negociables.

### Adopción de OpenTelemetry: la libertad de elección por diseño {#opentelemetry-adoption-freedom-of-choice-by-design}

Dado que Mastodon es de código abierto y está diseñado para que otros lo
ejecuten, el equipo quería una solución de telemetría que preservara la
libertad del operador.

OpenTelemetry se convirtió en la opción predeterminada porque permite que cada
operador de un servidor Mastodon decida cómo —o si— se recopila la telemetría.

Mediante una sencilla
[configuración por variables de entorno](https://docs.joinmastodon.org/admin/config/#otel),
los operadores pueden elegir:

- Enviar la telemetría directamente a un backend de observabilidad (usando
  únicamente la configuración del SDK de Ruby)
- Enrutar la telemetría a través de un OpenTelemetry Collector
- Deshabilitar la telemetría por completo

La organización central de Mastodon no realiza seguimiento de cómo gestionan
la observabilidad las instancias externas. Lo que importa es que la telemetría
emitida se ajuste estrictamente a las
**[convenciones semánticas de OpenTelemetry](/docs/specs/semconv/)**, lo que la
hace utilizable en cualquier lugar.

Este enfoque evita los modelos de datos específicos de proveedor y garantiza
la compatibilidad con el ecosistema más amplio de OpenTelemetry, sin que
Mastodon tenga que mantener sus propias convenciones.

## Arquitectura del Collector: uno por namespace, y no más {#collector-architecture-one-per-namespace-no-more}

La arquitectura de Collector de Mastodon es intencionadamente minimalista.

Un único OpenTelemetry Collector por namespace de Kubernetes gestiona todas las
señales de telemetría: trazas, métricas y logs. No hay niveles separados de
gateway y agente, ni capas de enrutamiento complejas, ni herramientas de
despliegue personalizadas.

![Diagrama de arquitectura de los nodos de Mastodon](mastodon-nodes.png)

Dada la escala y el tráfico, esto ha demostrado ser más que suficiente.

[Tim Campbell](https://github.com/timetinytim), ingeniero de software en
Mastodon, comentó que en los aproximadamente 2 años que llevan ejecutando el
Collector, _nunca han tenido un solo problema_ con él.

> «Para mi sorpresa, mi muy grata sorpresa, no he tenido ni un solo problema.
> Como usamos un operador de Kubernetes para esto, si alguna vez surge algún
> problema, simplemente se reinicia automáticamente. Al menos en lo que
> respecta a las trazas y los logs reales que llegan a Datadog, no he visto
> ninguna interrupción. En cuanto a memoria y procesos, se ha mantenido
> perfectamente estable dentro de los límites que hemos establecido.»

## Despliegue y gestión del ciclo de vida {#deployment-and-lifecycle-management}

Para mantener la sobrecarga operativa lo más baja posible, Mastodon se apoya
en:

- El [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) para
  Kubernetes
- Argo CD para despliegues y promociones basados en Git

Cada Collector se define como un recurso personalizado `OpenTelemetryCollector`.
A partir de ahí, Kubernetes se encarga automáticamente de la reconciliación,
los reinicios y la gestión del ciclo de vida.

> «Básicamente, solo necesitamos crear un archivo yaml para cada objeto
> `OpenTelemetryCollector` que necesitemos crear, y Argo se encarga de
> desplegar/actualizar automáticamente lo que necesitamos.»

Este modelo proporciona:

- Configuración declarativa
- Recuperación automática ante fallos
- Auditabilidad clara a través del historial de Git

Cabe destacar que Mastodon no impone límites estrictos de CPU o memoria a los
pods del Collector. En la práctica, el consumo de recursos se ha mantenido
insignificante en comparación con el resto de la plataforma.

## Gestión del tráfico mediante el muestreo {#traffic-management-through-sampling}

En lugar de basarse en límites de recursos, Mastodon controla la sobrecarga de
observabilidad principalmente mediante el muestreo basado en la cola
(tail-based sampling).

- En mastodon.social, las trazas exitosas se muestrean aproximadamente al
  0,1 %, lo que da como resultado solo unas pocas docenas de trazas por minuto
  a pesar del tráfico extremadamente alto.
- En mastodon.online, el muestreo es ligeramente más permisivo, pero sigue los
  mismos principios.
- Todas las trazas de error se recopilan siempre, lo que garantiza una
  visibilidad completa de los fallos.

Este enfoque mantiene el volumen de datos predecible al tiempo que conserva
los datos de diagnóstico de alto valor.

## Configuración: con criterio propio, pero mínima {#configuration-opinionated-but-minimal}

Mastodon usa la distribución OpenTelemetry Collector Contrib, principalmente
por conveniencia: incluye todo lo que necesitan sin requerir compilaciones
personalizadas.

La configuración se centra en:

- Ingesta de OTLP para todas las señales
- Enriquecimiento de metadatos de Kubernetes
- Detección de recursos
- Muestreo basado en la cola (tail-based sampling)
- Transformación para la compatibilidad con el backend

A continuación se incluye una configuración completa de producción, a modo de
referencia (también puedes verla en [otelbin][otelbin-mastodon]):

<details><summary>Configuración del Collector de Mastodon</summary>

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: mastodon-social
  namespace: mastodon-social
spec:
  nodeSelector:
    joinmastodon.org/property: mastodon.social
  env:
    - name: DD_API_KEY
      valueFrom:
        secretKeyRef:
          name: datadog-secret
          key: api-key
    - name: DD_SITE
      valueFrom:
        secretKeyRef:
          name: datadog-secret
          key: site
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
            cors:
              allowed_origins:
                - 'http://*'
                - 'https://*'

    processors:
      batch: {}
      resource:
        attributes:
          - key: deployment.environment.name
            value: 'production'
            action: upsert
          - key: property
            value: 'mastodon.social'
            action: upsert
          - key: git.commit.sha
            from_attribute: vcs.repository.ref.revision
            action: insert
          - key: git.repository_url
            from_attribute: vcs.repository.url.full
            action: insert
      k8sattributes:
        auth_type: 'serviceAccount'
        passthrough: false
        extract:
          metadata:
            - k8s.namespace.name
            - k8s.pod.name
            - k8s.pod.start_time
            - k8s.pod.uid
            - k8s.deployment.name
            - k8s.node.name
          labels:
            - tag_name: app.label.component
              key: app.kubernetes.io/component
              from: pod
        pod_association:
          - sources:
              - from: resource_attribute
                name: k8s.pod.ip
          - sources:
              - from: resource_attribute
                name: k8s.pod.uid
          - sources:
              - from: connection
      resourcedetection:
        detectors: [system]
        system:
          resource_attributes:
            os.description:
              enabled: true
            host.arch:
              enabled: true
            host.cpu.vendor.id:
              enabled: true
            host.cpu.family:
              enabled: true
            host.cpu.model.id:
              enabled: true
            host.cpu.model.name:
              enabled: true
            host.cpu.stepping:
              enabled: true
            host.cpu.cache.l2.size:
              enabled: true
      transform:
        error_mode: ignore

        # Nomenclatura correcta de la función de código
        trace_statements:
          - context: span
            conditions:
              - attributes["code.namespace"] != nil
            statements:
              - set(attributes["resource.name"],
                Concat([attributes["code.namespace"],
                attributes["code.function"]], "#"))

          # Nombre de host de Kubernetes correcto
          - context: resource
            conditions:
              - attributes["k8s.node.name"] != nil
            statements:
              - set (attributes["k8s.node.name"],
                Concat([attributes["k8s.node.name"], "k8s-1"], "-"))
        metric_statements:
          - context: resource
            conditions:
              - attributes["k8s.node.name"] != nil
            statements:
              - set (attributes["k8s.node.name"],
                Concat([attributes["k8s.node.name"], "k8s-1"], "-"))
        log_statements:
          - context: resource
            conditions:
              - attributes["k8s.node.name"] != nil
            statements:
              - set (attributes["k8s.node.name"],
                Concat([attributes["k8s.node.name"], "k8s-1"], "-"))
      attributes/sidekiq:
        include:
          match_type: strict
          attributes:
            - key: messaging.sidekiq.job_class
        actions:
          - key: resource.name
            from_attribute: messaging.sidekiq.job_class
            action: upsert
      tail_sampling:
        policies:
          [
            {
              name: errors-policy,
              type: status_code,
              status_code: { status_codes: [ERROR] },
            },
            {
              name: randomized-policy,
              type: probabilistic,
              probabilistic: { sampling_percentage: 0.1 },
            },
          ]

    connectors:
      datadog/connector:
        traces:
          compute_stats_by_span_kind: true

    exporters:
      datadog:
        api:
          site: ${DD_SITE}
          key: ${DD_API_KEY}
        traces:
          compute_stats_by_span_kind: true
          trace_buffer: 500

    service:
      pipelines:
        traces/all:
          receivers: [otlp]
          processors:
            [
              resource,
              k8sattributes,
              resourcedetection,
              transform,
              attributes/sidekiq,
              batch,
            ]
          exporters: [datadog/connector]
        traces/sample:
          receivers: [datadog/connector]
          processors: [tail_sampling, batch]
          exporters: [datadog]
        metrics:
          receivers: [datadog/connector, otlp]
          processors:
            [resource, k8sattributes, resourcedetection, transform, batch]
          exporters: [datadog]
        logs:
          receivers: [otlp]
          processors:
            [
              resource,
              k8sattributes,
              resourcedetection,
              transform,
              attributes/sidekiq,
              batch,
            ]
          exporters: [datadog]
```

</details>

### Mantenerse actualizado {#staying-up-to-date}

Mastodon normalmente actualiza el OpenTelemetry Collector en el plazo de uno o
dos días tras cada versión.

> «Todo está documentado, y todos los cambios incompatibles están
> correctamente detallados», señaló Tim, elogiando la claridad de las notas de
> la versión.

Aunque las versiones frecuentes a veces introducen cambios incompatibles, el
equipo lo considera una señal de un desarrollo saludable y activo, siempre que
te mantengas al día.

### Lecciones y puntos de dolor {#lessons-and-pain-points}

La parte más difícil del recorrido fue, simplemente, empezar. Entender cómo
encajan entre sí los componentes del Collector llevó tiempo, especialmente
para un equipo sin especialistas dedicados a la observabilidad. Más
recientemente, la mayor complejidad ha surgido del uso avanzado del procesador
transform, en particular al adaptar los atributos de span a los requisitos de
nomenclatura específicos del backend.

```yaml
transform:
  error_mode: ignore

  # Nomenclatura correcta de la función de código
  trace_statements:
    - context: span
      conditions:
        - attributes["code.namespace"] != nil
      statements:
        - set(attributes["resource.name"], Concat([attributes["code.namespace"],
          attributes["code.function"]], "#"))
```

En la regla del procesador transform anterior, han configurado una condición
para establecer `resource.name` (un atributo específico de Datadog) con el
valor de `code.namespace#code.function`. Con esa configuración, cada vez que
el span llegaba al backend, podía asignarse al nombre que habían definido. A
pesar de esa curva de aprendizaje, la experiencia general ha superado las
expectativas.

> «Básicamente puedes hacer lo que quieras. Superó mis expectativas. Todo
> funciona bastante bien.»

Esa fiabilidad y flexibilidad son las razones por las que Mastodon sigue
usando el OpenTelemetry Collector en producción.

## Consejos para equipos pequeños {#advice-for-small-teams}

A partir de la experiencia de Mastodon, destacan algunas lecciones:

- **Mantén la arquitectura simple**: un único Collector puede llegar muy lejos
- **Confía en los operadores de Kubernetes** para la gestión del ciclo de vida
- **Usa el muestreo** para controlar los costes
- **Cíñete a las convenciones semánticas** para evitar el bloqueo (lock-in) a
  largo plazo
- **Actualiza con frecuencia** para reducir el impacto de los cambios
  incompatibles

## Conclusiones {#takeaways}

La historia de Mastodon demuestra que incluso un equipo muy pequeño puede
operar con éxito OpenTelemetry Collectors en producción —a escala global— sin
una carga operativa significativa.

[otelbin-mastodon]:
  https://www.otelbin.io/?#config=receivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N______http%3A*N________endpoint%3A_0.0.0.0%3A4318*N________cors%3A*N__________allowed*_origins%3A*N____________-_*%22http%3A%2F%2F***%22*N____________-_*%22https%3A%2F%2F***%22*N*Nprocessors%3A*N__batch%3A_%7B%7D*N__resource%3A*N____attributes%3A*N______-_key%3A_deployment.environment.name*N________value%3A_*%22production*%22*N________action%3A_upsert*N______-_key%3A_property*N________value%3A_*%22mastodon.social*%22*N________action%3A_upsert*N______-_key%3A_git.commit.sha*N________from*_attribute%3A_vcs.repository.ref.revision*N________action%3A_insert*N______-_key%3A_git.repository*_url*N________from*_attribute%3A_vcs.repository.url.full*N________action%3A_insert*N__k8sattributes%3A*N____auth*_type%3A_*%22serviceAccount*%22*N____passthrough%3A_false*N____extract%3A*N______metadata%3A*N________-_k8s.namespace.name*N________-_k8s.pod.name*N________-_k8s.pod.start*_time*N________-_k8s.pod.uid*N________-_k8s.deployment.name*N________-_k8s.node.name*N______labels%3A*N________-_tag*_name%3A_app.label.component*N__________key%3A_app.kubernetes.io%2Fcomponent*N__________from%3A_pod*N____pod*_association%3A*N______-_sources%3A*N__________-_from%3A_resource*_attribute*N____________name%3A_k8s.pod.ip*N______-_sources%3A*N__________-_from%3A_resource*_attribute*N____________name%3A_k8s.pod.uid*N______-_sources%3A*N__________-_from%3A_connection*N__resourcedetection%3A*N____detectors%3A_%5Bsystem%5D*N____system%3A*N______resource*_attributes%3A*N________os.description%3A*N__________enabled%3A_true*N________host.arch%3A*N__________enabled%3A_true*N________host.cpu.vendor.id%3A*N__________enabled%3A_true*N________host.cpu.family%3A*N__________enabled%3A_true*N________host.cpu.model.id%3A*N__________enabled%3A_true*N________host.cpu.model.name%3A*N__________enabled%3A_true*N________host.cpu.stepping%3A*N__________enabled%3A_true*N________host.cpu.cache.l2.size%3A*N__________enabled%3A_true*N__transform%3A*N____error*_mode%3A_ignore*N*N____*H_Proper_code_function_naming*N____trace*_statements%3A*N______-_context%3A_span*N________conditions%3A*N__________-_attributes%5B%22code.namespace%22%5D_%21*E_nil*N________statements%3A*N__________-_set*Cattributes%5B%22resource.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22code.namespace%22%5D%2C*N____________attributes%5B%22code.function%22%5D%5D%2C_%22*H%22*D*D*N*N______*H_Proper_kubernetes_hostname*N______-_context%3A_resource*N________conditions%3A*N__________-_attributes%5B%22k8s.node.name%22%5D_%21*E_nil*N________statements%3A*N__________-_set_*Cattributes%5B%22k8s.node.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22k8s.node.name%22%5D%2C_%22k8s-1%22%5D%2C_%22-%22*D*D*N____metric*_statements%3A*N______-_context%3A_resource*N________conditions%3A*N__________-_attributes%5B%22k8s.node.name%22%5D_%21*E_nil*N________statements%3A*N__________-_set_*Cattributes%5B%22k8s.node.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22k8s.node.name%22%5D%2C_%22k8s-1%22%5D%2C_%22-%22*D*D*N____log*_statements%3A*N______-_context%3A_resource*N________conditions%3A*N__________-_attributes%5B%22k8s.node.name%22%5D_%21*E_nil*N________statements%3A*N__________-_set_*Cattributes%5B%22k8s.node.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22k8s.node.name%22%5D%2C_%22k8s-1%22%5D%2C_%22-%22*D*D*N__attributes%2Fsidekiq%3A*N____include%3A*N______match*_type%3A_strict*N______attributes%3A*N________-_key%3A_messaging.sidekiq.job*_class*N____actions%3A*N______-_key%3A_resource.name*N________from*_attribute%3A_messaging.sidekiq.job*_class*N________action%3A_upsert*N__tail*_sampling%3A*N____policies%3A*N______%5B*N________%7B*N__________name%3A_errors-policy%2C*N__________type%3A_status*_code%2C*N__________status*_code%3A_%7B_status*_codes%3A_%5BERROR%5D_%7D%2C*N________%7D%2C*N________%7B*N__________name%3A_randomized-policy%2C*N__________type%3A_probabilistic%2C*N__________probabilistic%3A_%7B_sampling*_percentage%3A_0.1_%7D%2C*N________%7D%2C*N______%5D*N*Nconnectors%3A*N__datadog%2Fconnector%3A*N____traces%3A*N______compute*_stats*_by*_span*_kind%3A_true*N*Nexporters%3A*N__datadog%3A*N____api%3A*N______site%3A_*S%7BDD*_SITE%7D*N______key%3A_*S%7BDD*_API*_KEY%7D*N____traces%3A*N______compute*_stats*_by*_span*_kind%3A_true*N______trace*_buffer%3A_500*N*Nservice%3A*N__pipelines%3A*N____traces%2Fall%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A*N________%5B*N__________resource%2C*N__________k8sattributes%2C*N__________resourcedetection%2C*N__________transform%2C*N__________attributes%2Fsidekiq%2C*N__________batch%2C*N________%5D*N______exporters%3A_%5Bdatadog%2Fconnector%5D*N____traces%2Fsample%3A*N______receivers%3A_%5Bdatadog%2Fconnector%5D*N______processors%3A_%5Btail*_sampling%2C_batch%5D*N______exporters%3A_%5Bdatadog%5D*N____metrics%3A*N______receivers%3A_%5Bdatadog%2Fconnector%2C_otlp%5D*N______processors%3A*N________%5Bresource%2C_k8sattributes%2C_resourcedetection%2C_transform%2C_batch%5D*N______exporters%3A_%5Bdatadog%5D*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A*N________%5B*N__________resource%2C*N__________k8sattributes%2C*N__________resourcedetection%2C*N__________transform%2C*N__________attributes%2Fsidekiq%2C*N__________batch%2C*N________%5D*N______exporters%3A_%5Bdatadog%5D%7E
