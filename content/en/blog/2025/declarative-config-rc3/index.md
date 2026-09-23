---
title: 'New Configuration Schema release candidate'
linkTitle: New Configuration Schema release candidate
date: 2025-12-12
author: >-
  [Alex Boten](https://github.com/codeboten)(Honeycomb)
cSpell:ignore: configtls severitynumber
---

The [latest release][rc3-release] of the OpenTelemetry Configuration Schema is
out this week. It brings the Configuration working group one step closer to
completion after 3 years of effort, and the schema one step closer to being
marked stable. We might be optimists here, but we think this may be the last
release candidate before a stable release is done.

Many of the changes in the repositories since the previous release involved
improvements to the tooling, to make the schema more consistent, and reduce the
chances for new inconsistencies to be introduced in the future. There are other
changes impacting both end users, contributors to the configuration schema, and
implementers of the schema.

## End user changes

The release notes include information about all the breaking changes. A
noticeable one includes the grouping of `tls` configuration under the various
OTLP exporters, and the renaming of the options it contains to more closely
align with the OpenTelemetry Collector's [`configtls`][configtls] package.

```yaml
# Before
tracer_provider: # or meter_provider, logger_provider
  processors:
    - batch:
        exporter:
          otlp_http:
            certificate_file: /app/cert.pem
            client_key_file: /app/key.pem
            client_certificate_file: /app/client_cert.pem
---
# After
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            tls:
              ca_file: /app/cert.pem
              key_file: /app/key.pem
              cert_file: /app/client_cert.pem
```

The `log_level` used to be a string value, to match the existing specification
for `OTEL_LOG_LEVEL`. In this release, it has been changed to support the same
severity levels already [defined][severity-levels] in the logging specification.
Earlier this month, an announcement about the deprecation of the Zipkin exporter
was made. As a result, this new release of the schema has also removed the
exporter. The validation around various properties has also been improved.

Lastly the schema now populates the `description` field for all properties,
giving users some much needed context when editing configuration files.

{{% figure
  src="schema.gif"
  caption="Screen capture of using the schema from an editor demonstrating the usage of description fields"
%}}

The description field makes it easier for end users to understand the details of
the configuration they're editing, and can also help language implementations.
Many implementations use code generation tools to automatically produce the
in-code representation of the configuration schema. In the tools that support
it, the description field automatically produces documentation for the
properties of the model.

## Contributors

Earlier releases of the JSON schema were split into multiple files under the
[schema][otel-config-schema] directory. This has changed in this release
candidate. That directory now contains the YAML source files used to generate
the single file stored in the root of the repository. The new format for source
files is combined with tooling in the repository to generate the documentation,
examples, and the [resulting JSON schema][schema] more consistently. For anyone
looking to contribute, read more details about the tooling and the process in
the [contributing][contrib-doc] documentation.

## Experimental features

As you look through the schema or some of the example files, you may find
yourself asking why there are configuration options denoted with a `development`
suffix. As with many areas of OpenTelemetry, the Configuration Schema will
continue to evolve as the specification stabilizes. The mechanism used to
identify experimental features in the schema is the suffix
`*/(development|alpha|beta)`. This is documented in the [versioning
documentation][version-docs]. Users of experimental features should be aware
that the options available in experimental sections of the configuration may
change.

Not sure where to start? Head over to the schema’s [documentation][schema-docs]
page to learn more about all the configuration options available. We'd love to
hear your feedback on this latest version of the schema!

[rc3-release]:
  https://github.com/open-telemetry/opentelemetry-configuration/releases/tag/v1.0.0-rc.3
[configtls]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configtls
[severity-levels]: /docs/specs/otel/logs/data-model/#field-severitynumber
[otel-config-schema]:
  https://github.com/open-telemetry/opentelemetry-configuration/tree/6b306495d6285dacfa815b24115f69f0743f9ad1/schema?from_branch=main
[schema]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0-rc.3/opentelemetry_configuration.json
[contrib-doc]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/1905936912045de1cb6ef04d13afe912f462dbe2/CONTRIBUTING.md?from_branch=main#project-tooling
[version-docs]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/0a18b0c19ba656c22aa2a8dab65d03380fcc2802/VERSIONING.md?from_branch=main#experimental-features
[schema-docs]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/28784d4ea2054f95affe3912189ccd51ee6aea3a/schema-docs.md?from_branch=main#opentelemetryconfiguration
