---
title:
  'The Declarative configuration journey: Why it took 5 years to ignore health
  check endpoints in tracing'
linkTitle: Declarative configuration journey
date: 2025-10-20
author: >-
  [Gregor Zeitlinger](https://github.com/zeitlinger)(Grafana Labs), [Jay
  DeLuca](https://github.com/jaydeluca) (Grafana Labs), [Marylia
  Gutierrez](https://github.com/maryliag) (Grafana Labs)
cSpell:ignore: Dotel marylia otelconf zeitlinger
---

One of the most persistent and popular feature requests for Java OpenTelemetry
over the past couple of years has been the ability to efficiently [drop spans
for health check endpoints][drop-spans-issue] – or any other low-value,
cost-driving endpoints. This issue was first raised in August 2020, yet a
comprehensive solution remained elusive for a surprisingly long time. Why did it
take us five years to address this seemingly straightforward problem? The answer
lies in the fundamental principles of OpenTelemetry's configuration system and
the journey towards a more robust, flexible approach: declarative configuration.

From the outset, OpenTelemetry relied on environment variables for
configuration, a choice driven by their universal availability across languages
and ease of parsing. However, as the need for more complex configuration use
cases grew, the limitations of simple string-based environment variables became
increasingly apparent, making advanced configurations cumbersome and difficult
to manage.

Enter declarative configuration, a powerful evolution that leverages YAML files
to define OpenTelemetry settings. This shift allows for reading data from any
tree-shaped source, fundamentally transforming how we approach complex
configurations. Throughout this post, we'll explore how declarative
configuration provides an elegant solution to the challenges of the past, and
demonstrate its immediate impact with practical use cases like health check
exclusion in Java.

## Getting started

The configuration file is language agnostic, so once you create one file, you
can use it for all your SDKs. The only exceptions are the parameters with the
specific language name that are only relevant to that language (for example,
`instrumentation/development.java.spring_batch` parameter). Keep in mind that
declarative configuration is **experimental**, so things might still change.

The following example is a basic configuration file you can use to get started:

```yaml
file_format: '1.0-rc.1'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # will add "service.instance.id" and "service.name" from OTEL_SERVICE_NAME

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

All you have to do is pass
`OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/otel-config.yaml` to the application to
activate the experimental declarative configuration option. This variable only
works in the Java agent and JavaScript at the time of writing.

## Declarative configuration in Java

Let's now look at the broader implementation of declarative configuration within
the Java ecosystem. As the pioneering language in this area, Java agent 2.21+
now fully supports declarative configuration, with most instrumentations and
features already functional. We are working to incorporate the remaining
features throughout 2026, and you can track our progress on the [project
board][java-project] and see the [list of features not yet
supported][list-not-supported].

Depending on whether you are starting fresh or migrating from using environment
variables, there’s a few resources you can leverage:

- The basic (language agnostic) configuration file example from the previous
  section is the quickest way to get started when you don’t need any further
  customizations.
- The [migration configuration file][migration-file] maps the old environment
  variables into the YAML schema, allowing for a drop in replacement for users
  using workloads already configured with environment variables.
- The [full configuration file][full-file] (“kitchen sink”) shows the entire
  schema, annotated with documentation as comments. This is useful for users who
  want to see all available options and their defaults.

All of the above files work for any language that supports declarative
configuration.

In addition, there are many settings specific to Java agent that go into the
instrumentation section of your configuration file. For example, if you have the
system property `otel.instrumentation.spring-batch.experimental.chunk.new-trace`
in your application, you can create the declarative configuration file by
removing the `otel.instrumentation` prefix, splitting at . and converting - to
\_.

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

With this configuration in place, developers can continue to use their Java
instrumentation as they normally would, sending telemetry data to their chosen
observability backend. Furthermore, the declarative configuration file provides
the flexibility to expand and add more parameters as needed, allowing for highly
customized and nuanced control over the observability setup.

## Health check exclusion

As mentioned in the introduction, one of the most popular feature requests in
the Java community was to be able to exclude health checks (or other unimportant
or noisy resources) from generating traces.

To achieve this, you need to add a new `sampler` block within your
`tracer_provider` configuration, as shown below:

```yaml
file_format: '1.0-rc.1'

# ... the rest of the configuration ....

tracer_provider:
  # Configure sampling to exclude health check endpoints.
  sampler:
    rule_based_routing:
      fallback_sampler:
        always_on:
      span_kind: SERVER
      rules:
        # Action to take when the rule matches. Must be DROP or RECORD_AND_SAMPLE.
        - action: DROP
          # The span attribute to match against.
          attribute: url.path
          # The pattern to compare the span attribute to.
          pattern: /actuator.*
# ... the rest of the tracer_provider configuration ...
```

See the [Java sampler documentation][java-sampler] for more details on the
available options.

Try it for yourself:

1. Save [the complete configuration][complete-config]
2. Run the Java agent with
   `-Dotel.experimental.config.file=/path/to/otel-config.yaml`

## Availability

After reading about declarative configuration, you might be wondering where it
is available and how you can start using it. You can find guidance on how to get
started and which languages are supported in the
[documentation][declarative-docs]. As of the time of writing of this post, Java
is fully compliant and PHP, JavaScript and Go are partially compliant. To see
the latest status, check the [compliance matrix][compliance-matrix] or the
[language implementations tracking issue][tracking-issue].

### Java

As described previously, declarative configuration in
[Java][java-declarative-config] is experimental but ready to use. Use the
example we discussed earlier to set up your new configuration. If you have
questions or feedback reach out in [`#otel-java`][slack-java] on the CNCF Slack.

_Note to other language maintainers: It is useful to create a bridge module that
adapts declarative config settings and environment variables to a common
interface. For Java, this is the [Declarative Config Bridge][java-bridge]._

### JavaScript

The implementation in the JavaScript SDK is currently under development. A new
package called [opentelemetry-configuration][js-package] has been created, and
it handles both environment variables and declarative configuration. With this
approach, the user doesn't need to change their instrumentation when they switch
between environment variables and configuration file, since the new package
handles it and returns the same configuration model for both cases. Currently,
this configuration package is being added to other instrumentation packages, so
they can take advantage of the declarative configuration. If you have questions,
reach out in [`#otel-js`][slack-js] on the CNCF Slack.

### PHP

The PHP implementation is partially compliant, and you can start using it by
[initializing from your config file][php-docs]. For help or feedback, reach out
in [`#otel-php`][slack-php] on the CNCF Slack.

### Go

Go has a [partial implementation][go-package] of declarative configuration. Each
supported schema version has its own corresponding package directory. For
example, importing `go.opentelemetry.io/contrib/otelconf/v0.3.0` gives you the
code that supports version 0.3.0 of the configuration schema. You can find all
available versions in the [package index][go-package-index]. If you have
questions on how to use it, reach out in [`#otel-go`][slack-go] on the CNCF
Slack.

## The journey

So why did it actually take us five years to ignore health check endpoints in
tracing?

The journey to declarative configuration, and consecutively, the solution for
health check exclusion, highlights a core tenet of OpenTelemetry: building
sustainable solutions through rigorous specifications.

From the outset, OpenTelemetry's reliance on environment variables, while
universally available, proved increasingly complex for advanced configurations.
New environment variables were eventually disallowed, creating a void that a
more robust solution needed to fill.

The replacement, as we’ve presented in this blog post, is declarative
configuration. Crafting and agreeing upon the precise syntax and semantics was a
time-consuming, and sometimes exhausting, process. For example, we discussed
several proposals on how environment variables could be embedded until we came
up with the current solution of using
`${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}`.

This process serves as a powerful case study for how the OpenTelemetry community
operates. It's a testament to establishing consensus, fostering collaboration,
and the collective effort required to introduce significant new features and
drive their implementation across diverse projects.

## What's next for declarative configuration?

The journey of declarative configuration is far from over. Our current focus
involves a substantial effort to expand language support, which is crucial for
ensuring that developers, regardless of their preferred tools, can leverage the
benefits of a declarative approach.

We are keenly interested in user feedback as we continue to develop and refine
these features. We encourage you to begin experimenting with the current
implementations and to actively communicate any missing functionalities, pain
points, or areas for improvement. This collaborative approach will help us
prioritize development efforts and ensure that the solutions we build truly meet
the needs of the community. You share your feedback or questions using the
channel [`#otel-config-file`][slack-config] from CNCF Slack.

Beyond providing feedback, there are other ways to get involved and contribute
to the growth of declarative configuration. Each OpenTelemetry SDK has a
[Special Interest Groups (SIGs)][sigs] dedicated to its implementation. Joining
these SIGs offers a direct avenue to understand the current status of
development, participate in discussions, and identify opportunities to
contribute. Whether it's through code contributions, documentation enhancements,
or simply sharing your experiences, every contribution helps to advance the
declarative configuration ecosystem. Your active participation is key to
fostering a robust and versatile set of tools for modern application
development.

We hope to hear from you!

## Additional resources

To learn more about the work going on for declarative configuration, here are
some additional resources to explore:

- [Simplifying OpenTelemetry with Configuration - Alex Boten, Honeycomb & Jack
  Berg, New Relic][yt-config]
- [Declarative configuration documentation](/docs/languages/sdk-configuration/declarative-configuration/)
- [Declarative configuration repository][declarative-repo]

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
