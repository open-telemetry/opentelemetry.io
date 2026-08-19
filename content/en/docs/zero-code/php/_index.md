---
title: PHP zero-code instrumentation
linkTitle: PHP
weight: 30
cSpell:ignore: PECL
---

OpenTelemetry provides two zero-code instrumentation approaches for PHP:

|              | [Auto-instrumentation](auto/)        | [PHP Distro](distro/)            |
| ------------ | ------------------------------------ | -------------------------------- |
| **Install**  | Composer + PECL extension            | OS package (`deb`, `rpm`, `apk`) |
| **Platform** | Linux, macOS, Windows                | Linux only                       |
| **Setup**    | Composer autoloading                 | Install package, restart PHP     |
| **Control**  | Full manual control                  | Opinionated defaults             |
| **Best for** | Flexible environments, custom config | Production Linux deployments     |

## Choose auto-instrumentation

Use [PHP zero-code auto-instrumentation](auto/) when you:

- Already use Composer
- Need to run on macOS or Windows
- Want maximum control over instrumentation and configuration

## Choose PHP Distro

Use [OpenTelemetry PHP Distro](distro/) when you:

- Deploy to Linux and want a package-managed install (`deb`, `rpm`, `apk`)
- Need zero-code onboarding without touching application code or Composer
- Want production-tuned defaults (background export, inferred spans, OpAMP)
