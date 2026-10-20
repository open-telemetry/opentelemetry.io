---
title: Strengthening OpenTelemetry security while preserving API stability
linkTitle: Versioning and security fixes
date: 2026-10-22
author: '[Robert Pająk](https://github.com/pellared) (Splunk)'
issue: 12105
sig: Specification
cSpell:ignore: Pająk
---

OpenTelemetry has updated its [client versioning policy][policy-pr] to make
room for security fixes that need to change behavior. Stable SDKs and Contrib
components, such as instrumentation libraries and exporters, can now make
narrowly scoped, necessary security changes in minor or patch releases, even
when those changes affect existing users. Public API compatibility remains
protected.

The intent is to help users receive security improvements within the major
version they already use. Some upgrades may require configuration or operational
changes. In such cases, release notes must explain the impact and what to do.

## Why stability needs a path for security fixes

Our engineering values say
["we value stability"](/community/mission/#we-value-stability). That commitment
matters: applications and libraries depend on OpenTelemetry, and upgrading
observability tools should be predictable.

But an unchanged behavior can become a security liability. For example,
accepting unbounded telemetry may let an attacker turn application input into
excessive memory use. A safeguard that rejects previously accepted input changes
behavior, even if every application still compiles.

Without an explicit exception, such a mitigation can require a new major
version. That creates a difficult choice: keep risky behavior on an existing
release line, or ask users to undertake a major upgrade to get the protection.
The new policy provides a path to deliver the mitigation within the current
major version, with clear boundaries and migration information.

AI makes timely security improvements more urgent. The UK National Cyber
Security Centre's [assessment of AI and cyber threats][ncsc] expects AI to
improve vulnerability research and exploitation, and to shorten the time
defenders have to respond. Even subtle weaknesses deserve attention when tools
can help attackers find and exploit them faster. For OpenTelemetry, that
reinforces the need to make security updates practical to adopt.

## What can change in a security release?

When necessary to address a security risk, stable SDK and Contrib components may
change behavior, configuration defaults, or supported configuration values
without a major version bump. This includes previously documented behavior. A
qualifying fix can ship in a patch release.

Examples include tightening certificate validation, disabling an unsafe
protocol, preventing credentials from appearing in telemetry, or introducing
resource limits to reduce denial-of-service risk. Depending on the mitigation,
previously accepted data or settings might be rejected, and telemetry might be
truncated or dropped. Invalid configuration can also cause application
initialization to fail.

Consider a hypothetical SDK limit on attribute values to reduce the risk of
memory exhaustion. An application could continue to compile while oversized
values are truncated, reducing memory pressure but also changing what reaches a
dashboard. That impact matters during an incident. A change like this must
follow the specification and explain its security benefit, telemetry impact, and
migration options.

## The exception has firm boundaries

Every change must be limited to what is necessary to mitigate the security risk.
It must preserve existing source and binary compatibility guarantees, including
SDK plugin interfaces, and comply with OpenTelemetry's error-handling
requirements.

The exception cannot be used to rename or remove public APIs, change their
signatures, rename or remove configuration parameters, redefine semantic
conventions, or bypass signal deprecation and removal rules. It cannot carry
unrelated incompatible changes. Stable API packages retain their compatibility
guarantees within the same major version.

## What to check when upgrading

Release notes are part of the security change. They must describe the risk and
mitigation, affected behavior and settings, before-and-after behavior, newly
rejected inputs, any truncated or dropped telemetry, and required user actions.
They must also describe available migration paths and their security
implications.

Where safe and feasible, implementations should offer an override or another
migration path.

For teams adopting an SDK or Contrib update:

1. **Read the security release notes, including for patch updates.** Check
   whether the affected settings or behavior apply to your application.
2. **Validate startup and telemetry in a representative environment.** Check
   configuration acceptance, telemetry volume, important attributes, dashboards,
   and alerts for the documented effects before rolling out more widely.
3. **Plan any required migration with the service owner.** Allow time for
   testing and rollout. If a temporary override is available and necessary,
   understand its security implications and plan to remove it.

Protecting the application that produces telemetry is part of providing
observability people can depend on.

[policy-pr]:
  https://github.com/open-telemetry/opentelemetry-specification/pull/5357
[ncsc]: https://www.ncsc.gov.uk/report/impact-ai-cyber-threat-now-2027
