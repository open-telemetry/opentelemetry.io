---
title:
  'Security in OpenTelemetry for Legacy and Industrial Environments: What
  Changes'
linkTitle: Security for Legacy Environments
date: 2026-05-12
author: >-
  [Lukasz Ciukaj (Cisco Splunk)](https://github.com/luke6Lh43)
sig: SIG Security
cSpell:ignore: Ciukaj Lukasz
---

OpenTelemetry is gaining traction in manufacturing and other legacy environments
as organizations explore modern observability approaches. However, applying
these practices in traditional systems introduces a different set of security
challenges. The constraints of legacy infrastructure fundamentally change where
and how security controls must be applied.

Legacy and industrial environments often include:

- systems that cannot be modified or instrumented
- long equipment life cycles and limited patching windows
- flat or weakly segmented networks
- sensitive operational data that is not typical
  [PII](https://en.wikipedia.org/wiki/Personal_data)

This article focuses on what is different about securing OpenTelemetry in these
environments, and how to adapt your approach accordingly.

## Why legacy environments are different

In cloud native systems, security guidance assumes:

- services can be instrumented
- encryption and authentication can be enforced everywhere
- systems can be patched regularly

In legacy and industrial environments, these assumptions often do not hold.

As a result, security is not about applying ideal controls everywhere. It is
about **placing controls at the right points in the telemetry pipeline**, and
balancing visibility with risk.

## Security challenges unique to legacy systems

### Systems cannot be modified

Many industrial systems cannot run agents, support modern libraries, or be
changed at all. This means:

- limited or inconsistent support for modern TLS and authentication at the
  source
- no direct instrumentation using SDKs
- reliance on intermediaries (Collectors, bridges, log pipelines)

When source systems cannot enforce modern controls, more of the security burden
shifts to the Collector, intermediary systems, and network boundaries.

### Weak or non-existent network segmentation

Legacy environments often have network architectures that were not designed with
modern observability in mind. Some operate on flat or shared networks with
minimal segmentation, while others rely on deeply nested networks with a mix of
legacy protocols. In either case, introducing telemetry collection can:

- expose new ingestion endpoints to unintended network segments
- allow unintended lateral access to Collectors or bridges
- create unexpected paths between previously isolated zones

In these environments, Collector placement is as important as Collector
configuration. Carefully evaluate where Collectors sit relative to network
boundaries, firewalls, and protocol gateways.

### Limited patching and long lifecycles

Industrial systems may run for years without upgrades. How you deploy the
Collector determines your patching strategy. Two common models exist:

**Collector as an external bridge (recommended):**

The Collector runs outside the legacy system boundary (on a separate host, VM,
or container) and acts as a bridge between the industrial environment and the
observability backend. In this model:

- The Collector can be patched and updated independently of the legacy system.
- Supply chain security issues can be addressed immediately.
- The legacy system remains untouched and stable.

**Collector embedded within the legacy environment:**

The Collector runs alongside or within the legacy system, subject to the same
change control and maintenance windows. In this model:

- Immediate patching may not be possible.
- Compensating controls become critical.
- Plan for running older Collector versions and monitor CVEs to assess exposure
  during the gap between disclosure and patching.

Where possible, prefer the bridge model. It provides a clear separation of
concerns and allows the telemetry pipeline to be maintained on a modern
lifecycle, even when the source systems cannot be.

When the bridge model is not feasible, shift the focus from patching to
**containment and mitigation**:

- Isolate affected components from the broader network.
- Restrict network access to and from the Collector.
- Disable unnecessary telemetry paths and components.
- Monitor CVE advisories and assess risk exposure continuously.

### Sensitive data looks different in these environments

In manufacturing environments, sensitive data often includes:

- production processes and machine configurations
- asset identifiers and operational states
- plant-level performance data

Telemetry pipelines must be designed to avoid exposing this information outside
controlled boundaries.

## Designing a secure telemetry pipeline under constraints

When source systems cannot be secured directly, the telemetry pipeline becomes
the control point.

Key design principles:

- **Constrain ingestion points**: Avoid exposing Collector endpoints broadly.
  Bind to specific interfaces and restrict network access.

- **Classify data by source trust level**: Distinguish telemetry based on how it
  was ingested. For example, data received over unauthenticated channels (such
  as UDP multicast) should be treated differently from data received over
  authenticated channels (such as mTLS). Use resource attributes or metadata to
  tag telemetry with its ingestion context so that downstream systems can apply
  appropriate trust and access policies.

- **Isolate bridging components**: MQTT bridges, log collectors, or protocol
  adapters should run in controlled segments and not be directly accessible.

- **Minimize exposed components**: Legacy environments may accumulate
  unnecessary components over time as systems evolve. Regularly audit your
  Collector configuration to ensure only the receivers and exporters required
  for your current observability goals are enabled, reducing the attack surface
  in environments where patching and updates are less frequent.

- **Prefer internal processing**: Collect and transform telemetry inside the
  trusted environment before exporting it externally. Use processors to filter,
  redact, or reshape data at the Collector level, minimizing the volume and
  sensitivity of data that crosses network boundaries.

The goal is to treat the OpenTelemetry Collector as a **controlled boundary**,
not just a data router. This approach is consistent with Zero Trust-style
boundary enforcement, where access and data flows are constrained explicitly
rather than assumed to be safe because of network location.

## A pragmatic decision model for securing telemetry

The following model shows how to select telemetry and apply security controls
based on system constraints in legacy and industrial environments.

```mermaid
flowchart TD
    A[Legacy System] --> Q0{Is the system safety-critical or change-restricted?}

    Q0 -- Yes --> S1[Use low impact signals and passive monitoring]
    Q0 -- No --> Q1{Can the system be modified?}

    S1 --> Q1

    Q1 -- Yes --> C1[Use OTel SDK or auto instrumentation if supported]
    C1 --> C2[Apply source controls TLS auth and least privilege]

    Q1 -- No --> Q2{Does the system expose data?}

    Q2 -- Yes --> C3[Use OTel Collector receivers if available]

    Q2 -- No --> Q3{Are logs or files available?}

    Q3 -- Yes --> C4[Use the Collector filelog receiver and derive telemetry]

    Q3 -- No --> C5[Use external monitoring if permitted]
    C5 --> C6[Bridge signals into OTel Collector]

    C2 --> P1
    C3 --> P1
    C4 --> P1
    C6 --> P1

    P1[Apply Collector processors] --> P2{Is the data sensitive?}

    P2 -- Yes --> P3[Use redaction, filter, or transform processors]
    P2 -- No --> P4[Allow controlled telemetry]

    P3 --> E1
    P4 --> E1

    E1[Restrict Collector exposure] --> E2{Is network segmentation available?}

    E2 -- Yes --> E3[Place Collector in controlled network segment]
    E2 -- No --> E4[Bind endpoints narrowly and limit receivers]

    E3 --> X1
    E4 --> X1

    X1[Use Collector exporters]
    X1 --> X2[Export to observability backend]
```

## Handling sensitive operational data

OpenTelemetry tooling cannot determine business sensitivity on its own. That
responsibility sits with the implementer. Two principles are critical:

### Data minimization

Only collect telemetry that serves a clear purpose. In constrained environments:

- avoid capturing full payloads unless necessary
- prefer aggregated signals over raw data
- review collected attributes regularly

### Scrubbing and transformation

For example, depending on Collector distribution and version, processors such as
transform or redaction can be used to hash identifiers, remove sensitive fields,
or enforce allowlists.

```yaml
processors:
  transform/hash_user:
    trace_statements:
      - context: span
        statements:
          - set(attributes["user.hash"], SHA256(attributes["user.id"]))
          - delete_key(attributes, "user.id")
```

Or enforcing strict allowlists:

```yaml
processors:
  redaction/strict:
    allow_all_keys: false
    allowed_keys:
      - id
      - name
      - status
```

In legacy environments, **processing at the Collector is often the only place
where data can be controlled**.

## Reducing attack surface

Every telemetry component introduces potential risk. This is especially
important where systems cannot defend themselves. Focus on:

- reducing the number of active receivers and exporters
- avoiding unnecessary external exposure
- running Collectors with minimal permissions
- limiting inbound traffic to known, trusted sources

In these environments, **minimizing telemetry infrastructure and exposed
endpoints can reduce attack surface**.

## Security as a trade-off

In modern systems, the goal is often complete observability. In legacy
environments, that goal must be balanced against:

- system stability
- safety constraints
- limited control over source systems

This leads to a different mindset: _Security is not about achieving ideal
observability. It is about selecting the safest way to gain useful visibility._

## Conclusion

In operational technology and industrial settings, telemetry changes should also
be evaluated against safety, reliability, and change-control requirements, not
only cybersecurity goals.

OpenTelemetry can bring powerful observability to legacy and industrial
environments, but it changes where and how security controls must be applied.
Instead of relying on source-level protections, teams must:

- secure the telemetry pipeline itself
- carefully manage data exposure
- design for constrained and imperfect systems

With this approach, organizations can gain meaningful visibility while
respecting the realities of traditional environments.

## Further reading and resources

- [OpenTelemetry Security Documentation](/docs/security/)
- [OpenTelemetry CVE List](/docs/security/cve/)
- [Collector Configuration Best Practices](/docs/security/config-best-practices/)
- [Handling Sensitive Data](/docs/security/handling-sensitive-data/)
- [Community Incident Response Guidelines](/docs/security/security-response/)
