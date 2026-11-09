---
title: Community incident response guidelines
weight: 102
---

This security policy applies to all projects under the [OpenTelemetry
organization][gh-organization] on GitHub.

Security vulnerabilities should be handled quickly and sometimes privately. The
primary goal of this process is to reduce the total time users are vulnerable to
publicly known exploits.

The relevant OpenTelemetry repository maintainers, supported by the Security SIG
and OpenTelemetry Technical Committee (TC), are responsible for responding to
the incident including internal communication and external disclosure.

## Security model

<!--
    This section is mirrored from the authoritative source at:
    https://github.com/open-telemetry/sig-security/blob/main/security-response.md#security-model

    Any changes should be made there first, then synced back here.
-->

Repositories may document artifact-specific threat models in `THREAT_MODEL.md`.

If an artifact's `THREAT_MODEL.md` explicitly specifies otherwise, it takes
precedence over this section for that artifact. This section applies wherever
the threat model does not specify otherwise.

When assessing the urgency and importance of a security fix, confidentiality and
integrity are our topmost concerns for all OpenTelemetry software artifacts.

In contrast, we do not consider the default settings of OpenTelemetry software
artifacts to be secure against availability attacks. We highly recommend not
using insecure defaults where feasible. To ensure availability, users must
require authentication for their endpoint communication following the guidance
on the [Security section of our website](/docs/security/).

Additionally, the OpenTelemetry project does not consider the following to be
security vulnerabilities:

- a denial of service attack by properly authenticated clients
- availability-related attack to endpoints by properly authenticated clients

These may still be considered bugs, and users can report them as such. When
assessing availability-related impact, maintainers will also take into account
the security policies of other projects (e.g. Prometheus) when assessing
vulnerabilities against components that provide compatibility with those
projects, as well as the level of asymmetry in terms of resource usage leveraged
by the attack.

### Availability assessment

Within the availability scope above, assess impact on the affected OTel artifact
and, for SDKs and instrumentation, the application using it.

- **Software vulnerabilities** let attacker-controlled input degrade or deny
  availability through a design or implementation weakness. Examples include
  crashes caused by faulty input handling, resource leaks, unsafe decompression
  or other asymmetric resource consumption, and bypassed or ineffective resource
  limits.
- **Capacity and deployment issues** occur when telemetry volume or downstream
  failures exceed processing capacity, buffering, or retry budgets without
  exploiting a software weakness. Expected backpressure or telemetry drops under
  these conditions do not, by themselves, establish a vulnerability.

Assess claimed failures of resource limits or tenant isolation against the
artifact's supported use, configuration, and intended protections. Shared
resources, unbounded fields, missing resource limits, linear resource growth
with input size or volume, or missing per-tenant quotas alone do not establish a
vulnerability.

Use the [report requirements](#report-requirements) below to assess the
available evidence and identify gaps.

[MITRE CWE-400](https://cwe.mitre.org/data/definitions/400.html) explains why
resource consumption as an impact must be distinguished from its underlying
weakness.

## Supported Versions

<!--
    This section is mirrored from the authoritative source at:
    https://github.com/open-telemetry/sig-security/blob/main/security-response.md#supported-versions

    Any changes should be made there first, then synced back here.
-->

The OTel project provides community support only for the last overall minor
version: bug fixes are released either as part of the next minor version or as
an on-demand patch version. Independent of which version is next, all patch
versions are cumulative, meaning that they represent the state of our `main`
branch at the moment of the release. For instance, if the latest version is
0.10.0, bug fixes are released either as part of 0.11.0 or 0.10.1.

Security fixes are given priority and might be enough to cause a new version to
be released. Each repository is entitled to establish their own complementary
processes. The Security SIG in conjunction with the TC can advise in case
clarifications are required.

## Reporting a Vulnerability

<!--
    This section is mirrored from the authoritative source at:
    https://github.com/open-telemetry/sig-security/blob/main/security-response.md#reporting-process---for-vulnerability-reporters

    Any changes should be made there first, then synced back here.
-->

### Report requirements

Assess findings against the [Security model](#security-model). Reports must
include evidence supporting the suspected vulnerability. Provide the following
details to the extent known, and identify any gaps:

1. **Affected component and configuration:** repository, package or artifact,
   affected versions or revisions (including released versions where
   applicable), relevant features, deployment, and required settings.
1. **Attacker capability:** the exact input under attacker control, access and
   privileges required, and any cooperation needed from another party.
1. **Reachable behavior:** the entry point and how that input reaches the
   affected operation. Include relevant code paths, dependency calls, and checks
   where known.
1. **Security consequence:** the missing or ineffective protection and concrete
   confidentiality, integrity, or availability impact. Identify whose data or
   resources are affected and any tenant or privilege boundary crossed.
1. **Evidence and existing protections:** a reproducer or substantiated
   explanation of reachability and impact, supported by code analysis or
   observed behavior. Describe relevant limits and protections and why they do
   not prevent the impact. Include supporting source locations where known.
   State assumptions and unresolved questions.
1. **Severity assessment:** a CVSS v4.0 Base score, `CVSS:4.0` vector, and
   rationale for each Base metric. Follow the [severity guidance](#severity)
   below.

Code references must identify the reviewed revision. Distinguish verified facts
from assumptions.

Do not delay an initial report of a suspected vulnerability while gathering
missing details, especially if it is already public or being actively exploited.
Use the [private reporting methods](#reporting-methods), include the available
evidence, and supplement it during assessment.

Reports without supporting evidence may be closed if the reporter does not
provide it after a request from Maintainers. A closed report may be reopened if
supporting evidence is provided later.

#### Severity

Assess vulnerabilities using only the Base metrics from the
[CVSS v4.0 specification](https://www.first.org/cvss/v4.0/specification-document)
and [calculator](https://www.first.org/cvss/calculator/4.0).

For general-purpose libraries, document reasonable worst-case usage assumptions.
A library flaw reachable through network input is not necessarily a local
attack. A required nondefault configuration alone does not justify `AT:P`.
Assess dependencies through their use in OTel rather than copying their scores.

Define the vulnerable system being scored. An SDK and its host application can
form one vulnerable system; host application impact is not automatically
subsequent-system impact. Distinguish exposure of telemetry from exposure of
credentials or unrelated application data.

### Reporting Methods

In order for the vulnerability reports to reach maintainers as soon as possible,
the preferred way is to use the `Report a vulnerability` button on the
`Security` tab in the respective GitHub repository. It creates a private
communication channel between the reporter and the maintainers.

For reporting security issues against the website, please report them at
<https://github.com/open-telemetry/opentelemetry.io/security/advisories>.

If you are unable to or have strong reasons not to use the GitHub reporting
workflow, please reach out to
[security@opentelemetry.io](mailto:security@opentelemetry.io) and we will
provide instruction on how to report the vulnerability.

Reports should be acknowledged within 3 working days.

**Please avoid reporting any vulnerabilities as a generic public "Issue" in
GitHub.**

Given the public visibility of GitHub issues, reporting a vulnerability as a
GitHub issue would be public disclosure. If this is done accidentally or if you
notice a vulnerability reported this way, please immediately re-report the
vulnerability using "Report a vulnerability" and note the public disclosure as
part of that report. You can ask GitHub to delete the issue but this shouldn't
be considered a sufficient mitigation and the vulnerability should be considered
publicly disclosed.

### Non-Public Vulnerabilities

If a vulnerability appears to be not publicly known or disclosed, the repository
maintainers will engage and the reporter is requested to honor an embargo period
in which the vulnerability is keep private until a fix can be released and
disclosed in an orderly manner. If the reporter has a need to disclose the
vulnerability further, perhaps for a security conference or other obligation,
they are asked to negotiate the disclosure date with the maintainers fixing the
vulnerability. The repository maintainers will in any case do their best to move
swiftly with the fix and release process.

### Publicly Known Vulnerabilities

If you discover an unreported publicly disclosed/known vulnerability please
IMMEDIATELY use the reporting methods above to inform the team about the
vulnerability so they may start the patch, release and communication process.
Please include any relevant information about current public exploitations of
this vulnerability, if known, to help with scoring and prioritization.

## More Information

For more information, please see the
[Security SIG documentation](https://github.com/open-telemetry/sig-security/blob/main/security-response.md)
on GitHub.

[gh-organization]: https://github.com/open-telemetry
