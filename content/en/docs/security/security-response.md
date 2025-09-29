---
title: Community incident response guidelines
weight: 102
---

Security vulnerabilities should be handled quickly and sometimes privately. The
primary goal of this process is to reduce the total time users are vulnerable to
publicly known exploits.

The relevant OpenTelemetry repository maintainers, supported by the Security SIG
and OpenTelemetry Technical Committee (TC), are responsible for responding to
the incident including internal communication and external disclosure.

## Supported Versions

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

## Reporting Process - For Vulnerability Reporters

### Reporting Methods

In order for the vulnerability reports to reach maintainers as soon as possible,
the preferred way is to use the `Report a vulnerability` button on the
`Security` tab in the respective GitHub repository. It creates a private
communication channel between the reporter and the maintainers.

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
