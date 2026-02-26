---
title: 'Declarative Config Stabilized'
linkTitle: Declarative configuration is stable!
date: 2026-02-26
author: >-
  [Jack Berg](https://github.com/jack-berg)(Grafana Labs)
cSpell:ignore: codeboten Anuraag Agrawal anuraaga brettmc carlosalberto Ashpole dashpole Lüchinger Zeitlinger zeitlinger Danielson jaydeluca Liudmila Molkova lmolkova Alff maryliag Baeyens Kiełkowicz Kielek Pellard pellared Bachert Nevay trask Sloughter tsloughter Yahn Yevhenii Solomchenko ysolomchenko
---

## What happened?

Key portions of the
[declarative configuration specification](/docs/specs/otel/configuration/#declarative-configuration)
have been marked stable, including

- The JSON schema for the data model, as defined in
  [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)
  which released a stable `1.0.0` release
- The YAML representation of the data model in files
  ([spec link](/docs/specs/otel/configuration/data-model/#yaml-file-format))
- The in-memory representation of the data model
  ([spec link](/docs/specs/otel/configuration/sdk/#in-memory-configuration-model))
- The generic representation of a YAML mapping node, `ConfigProperties`
  ([spec link](/docs/specs/otel/configuration/api/#configprovider))
- The mechanism for referencing custom plugin components in the data model,
  `PluginComponentProvider`
  ([spec link](/docs/specs/otel/configuration/sdk/#plugincomponentprovider))
- The SDK operations for parsing a YAML file and instantiating SDK components,
  `Parse` and `Create`
  ([spec link](/docs/specs/otel/configuration/sdk/#sdk-operations))
- The standard env var to indicate that declarative config should be used and to
  point to the path of a config file `OTEL_CONFIG_FILE`
  ([spec link](/docs/specs/otel/configuration/sdk-environment-variables/#declarative-configuration))

## What's the status of language implementations?

As of now, there are implementations available in 5 languages:

- C++
- Go
- Java
- JS
- PHP

Development is underway for .NET and Python.

Additionally, the go implementation is leveraged in the collector for
configuring internal telemetry.

Going forward, implementation status can be tracked with the following
resources:

- [Specification Compliance Matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/9a946352ecdec2565520e9c65d635f6e68d6cdfb/spec-compliance-matrix.md#declarative-configuration),
  for language status of specification API and SDK features
- [opentelemetry-configuration Language Support Status](https://github.com/open-telemetry/opentelemetry-configuration/blob/854f201660436d0e66f73785b7b310e4f8d46c6e/language-support-status.md),
  for fine grain details about the status of specific types and properties

## What does this mean for me?

Language implementations stabilize on different timelines than the
specification, but that should be coming soon.

See the docs in your relevant language for details on how to use. If the docs
don't exist yet, please open an issue to request them!

Even without a particular language implementation declared stable, it's possible
the user-facing portions will be stable sooner. Stabilizing the schema is the
most important thing for a stable user experience.

## What's next?

The work doesn't end here, but the focus does shift:

- Continue to model new concepts in the schema and stabilize existing types as
  corresponding specification concepts stabilize.
- Adjust the specification proposal process to be "declarative configuration
  first". What this means is when a feature is proposed for SDKs, the
  corresponding declarative config types and properties should be proposed
  alongside it. The declarative config schema is a key part of the SDK UX, and
  should be considered early in the design process.
- Deprecate environment variables which don't interoperate well. Deprecation
  doesn't mean deletion, but we want to signal that declared configuration is
  the preferred path and where we're investing.
  ([tracking issue](https://github.com/open-telemetry/opentelemetry-specification/issues/3967))
- Even more languages need to implement declarative configuration! With the
  specification and data model stable, there's no reason not to.
- The API portion of declarative configuration for configuring instrumentation
  (i.e. `ConfigProvider`) is out of scope for this initial stabilization. We
  need more languages to build prototypes.
- Dynamic configuration story, or how do I change my telemetry at runtime?
  ([telemetry policy OTEP](https://github.com/open-telemetry/opentelemetry-specification/pull/4738))

## Thanks

A big thank you to all the amazing contributors who made this possible through
years of collaboration. Special shout out to those who have been around since
the beginning - not sure we would have started had we known up front it was
going to take this long and this much effort 😅! Besides those listed below, I
know I've missed others, including those involved in implementing, reviewing,
and contributing in other ways.

- Alex Boten [codeboten](https://github.com/codeboten)
- Anuraag Agrawal [anuraaga](https://github.com/anuraaga)
- Arthur Silva Sens [ArthurSens](https://github.com/ArthurSens)
- Brett McBride [brettmc](https://github.com/brettmc)
- Carlos Alberto Cortez [carlosalberto](https://github.com/carlosalberto)
- David Ashpole [dashpole](https://github.com/dashpole)
- Dominic Lüchinger [dol](https://github.com/dol)
- Gregor Zeitlinger [zeitlinger](https://github.com/zeitlinger)
- Jamie Danielson [JamieDanielson](https://github.com/JamieDanielson)
- Jay DeLuca [jaydeluca](https://github.com/jaydeluca)
- Liudmila Molkova [lmolkova](https://github.com/lmolkova)
- Marc Alff [Marc Alff](https://github.com/marcalff)
- Marylia Gutierrez [maryliag](https://github.com/maryliag)
- Pablo Baeyens [mx-psi](https://github.com/mx-psi)
- Piotr Kiełkowicz [Kielek](https://github.com/Kielek)
- Robert Pellard [pellared](https://github.com/pellared)
- Tobias Bachert [Nevay](https://github.com/Nevay)
- Trask Stalnaker [trask](https://github.com/trask)
- Tristan Sloughter [tsloughter](https://github.com/tsloughter)
- Tyler Yahn [MrAlias](https://github.com/MrAlias)
- Yevhenii Solomchenko [ysolomchenko](https://github.com/ysolomchenko)
