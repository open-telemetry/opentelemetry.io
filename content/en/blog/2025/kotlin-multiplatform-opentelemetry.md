---
title: 'Call for Contributors: OpenTelemetry for Kotlin'
linkTitle: 'CfC: OTel for Kotlin'
date: 2025-09-30
author: >-
  [Jamie Lynch](https://github.com/fractalwrench) (Embrace)
issue: 2975
sig: Governance Committee
---

## Why launch OpenTelemetry for Kotlin?

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP)
allows running Kotlin code on many different platforms, such as browser, server,
and desktop environments. Traditionally Kotlin has been most popular on Android
and the JVM, but with the advent of KMP the number of folks using it to share
code between different platforms has been steadily growing.

[Embrace](https://embrace.io/) has
[opened a proposal](https://github.com/open-telemetry/community/issues/2975) to
donate a Kotlin implementation of the OpenTelemetry specification that can be
used in KMP projects. This would allow KMP and Kotlin projects to capture
telemetry using one API for many different platforms. The API has been designed
to remain as platform-agnostic an implementation of OpenTelemetry as possible
and attempts to be as mobile-friendly as possible for the important Android/iOS
use-case.

While [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)
does support Kotlin apps that run on the JVM, this relies on Java interop and
doesn't 'feel' like an idiomatic Kotlin API for OpenTelemetry. Furthermore,
opentelemetry-java can only run on a JVM, whereas Kotlin can be deployed on
non-JVM targets.

## Call for contributors

If you're interested in using OpenTelemetry on Kotlin Multiplatform we need your
help! We are looking for contributors who are willing to maintain the codebase,
participate in regular Special Interest Group (SIG) meetings, and generally help
drive the SDK forward.

If you're interested in becoming a contributor or if you know someone who might
be, please comment on the
[donation proposal](https://github.com/open-telemetry/community/issues/2975).

If you don't want to become a contributor but _do_ want to give feedback on the
project so far or try it out, please checkout the
[repository here](https://github.com/embrace-io/opentelemetry-kotlin) and file
an issue with your thoughts.
