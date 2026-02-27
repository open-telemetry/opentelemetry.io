---
title: 'New OpenTelemetry Kotlin SDK'
linkTitle: 'New OpenTelemetry Kotlin SDK'
date: 2026-03-23
author: >-
  [Jamie Lynch](https://github.com/fractalwrench) (Embrace)
sig: Kotlin
---

## New OpenTelemetry Kotlin SDK

Following a [donation](https://github.com/open-telemetry/community/issues/2975)
from Embrace and a
[call for contributors](/blog/2025/kotlin-multiplatform-opentelemetry.md),
OpenTelemetry now has
[a Kotlin SDK](https://github.com/open-telemetry/opentelemetry-kotlin) in active
development.

The project is looking for contributors and folks who are interested in using
the library in their application.

## Why launch OpenTelemetry for Kotlin?

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP)
allows running Kotlin code on many different platforms, such as browser, server,
and desktop environments. Traditionally Kotlin has been most popular on Android
and the JVM, but with the advent of KMP the number of folks using it to share
code between different platforms has been steadily growing.

Having a Kotlin Multiplatform implementation of OpenTelemetry allows KMP and
Kotlin projects to capture telemetry using one API for many different platforms.
The API has been designed to remain as platform-agnostic as possible whilst
staying mobile-friendly for the common Android/iOS use-case.

## Current state of the project

The Kotlin Special Interest Group (SIG) has started meeting weekly at 9am PST on
Mondays. Come join the meeting if you're interested in discussing the project or
have questions that you'd like to discuss synchronously!

The Kotlin SDK currently supports the Android, JVM, iOS, and JS targets.
Android/JVM are the most extensively battle-tested at this time.

Initial implementations are available for the Logging and Tracing APIs. These
APIs are not considered stable yet, primarily as we'd like to receive further
feedback from real-users on the API's semantics and usability.

## Where is the project going?

The project has several long-term goals. Firstly, we plan on stabilizing the
Logging and Tracing APIs after receiving sufficient feedback on their usability.
Part of this will involve checking that the project
[complies with the OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.54.0/spec-compliance-matrix.md)
whilst offering a fluent Kotlin API.

Secondly, a key goal is to attract new folks to the OpenTelemetry ecosystem from
mobile development environments. We hope to achieve this with a mobile-friendly
API and by fixing some current rough edges that affect client/mobile, such as
how process terminations are handled.

Finally, we hope to attract a healthy community of Kotlin developers who are
actively contributing and giving feedback to the project.

## Call for contributors

If you're interested in using OpenTelemetry on Kotlin Multiplatform we need your
help! We are looking for contributors who are willing to maintain the codebase,
participate in regular Special Interest Group (SIG) meetings, and generally help
drive the SDK forward.

If you're interested in contributing please check out how you can help via the
[repository guidelines](https://github.com/open-telemetry/opentelemetry-kotlin?tab=readme-ov-file#contributing)
and join the [#otel-kotlin](https://cloud-native.slack.com/archives/C08NRCD4R4G)
channel in the [CNCF Slack](https://slack.cncf.io/).

If you're using the project in your application or have any feedback, please do
[open an issue](https://github.com/open-telemetry/opentelemetry-kotlin/issues)
on the repository with your thoughts. _All_ feedback is incredibly helpful at
this early stage and is invaluable for helping the maintainers learn how folks
use the project.
