---
title: Community Incident Response Guidelines
weight: 102
---

Security vulnerabilities should be handled quickly and sometimes privately. The
primary goal of this process is to reduce the total time users are vulnerable to
publicly known exploits.

The OpenTelemetry Technical Committee (OTel TC) and relevant repository maintainers,
supported by tooling provided by the SIG-Security, are responsible for
responding to the incident organizing the entire response including internal
communication and external disclosure.

## Supported Versions

The OTel project provides community support only for the last overall minor
version: bug fixes are released either as part of the next minor version or as
an on-demand patch version. Independent of which version is next, all patch
versions are cumulative, meaning that they represent the state of our `main`
branch at the moment of the release. For instance, if the latest version is
0.10.0, bug fixes are released either as part of 0.11.0 or 0.10.1.

Security fixes are given priority and might be enough to cause a new version to
be released. Each repository is entitled to establish their own complementary
processes. SIG-Security in conjunction with the TC can advise in case
clarifications are required.

## Disclosures

### Private Disclosure Processes

In order for the vulnerability reports to reach maintainers as soon as possible,
the preferred way is to use the `Report a vulnerability` button on the
`Security` tab in the respective GitHub repository. It creates a private
communication channel between the reporter and the maintainers.

If you are absolutely unable to or have strong reasons not to use GitHub
reporting workflow, please reach out to the Technical Committee using
[cncf-opentelemetry-tc@lists.cncf.io](mailto:cncf-opentelemetry-tc@lists.cncf.io)
and we will provide instruction on how to report the vulnerability using an
encrypted message, if desired.

### Public Disclosure Processes

If you know of a publicly disclosed security vulnerability please IMMEDIATELY
email
[cncf-opentelemetry-tc@lists.cncf.io](mailto:cncf-opentelemetry-tc@lists.cncf.io)
to inform the Security Response Committee (SRC) about the vulnerability so they
may start the patch, release, and communication process. Please include any
relevant information about current public exploitations of this vulnerability if
known to help with scoring and prioritization.

The TC should receive the message and re-direct it to the relevant repository
maintainers for ownership. If possible the repository maintainers will engage and ask
the person making the public report if the issue can be handled via a private
disclosure process. If the reporter denies the request, the repository maintainers
will move swiftly with the fix and release process. In extreme cases you can ask
GitHub to delete the issue but this generally isn't necessary and is unlikely to
make a public disclosure less damaging.

## Patch, Release, and Public Communication

### Fix Team Organization

The Fix Team is made up of the relevant repository maintainers.

### TC Role

- A member of the TC will need to review the proposed CVSS score and severity
  from the Fix Team
- Acknowledge when a proposed fix is completed

### Fix Development Process

All of the timelines below are suggestions that assume a Private Disclosure and
that the report is accepted as valid.

#### Initial Incident Response

- The TC is notified of an incident and the relevant repository maintainers are added
  automatically using a Zapier workflow as the Fix Team to the issue.
- The Fix Team acknowledges the incident to the reporter, asks for further
  details if necessary, and begins mitigation planning.
- The Fix Team confirms with the reporter if the incident is valid and requires
  a fix.
- The Fix Team creates a temporary private branch to start work on the fix.
- The Fix Team will create a
  [CVSS](https://www.first.org/cvss/specification-document) Base score using the
  [CVSS Calculator](https://www.first.org/cvss/calculator/3.1) and ping the TC
  GitHub team for confirmation.
- The Fix Team will request a CVE from GitHub and follow up with the reporter.
- The Fix Team publishes the CVE to the GitHub Security Advisory Database for
  user notification.

#### Incident Mitigation

The incident mitigation timeline depends on the severity of the incident and
repository release cadence.

- The Fix Team will ping the TC GitHub team to alert them that work on the fix
  branch is complete once there are LGTMs on all commits in the temporary
  private fork created for the GitHub Security Advisory.
- The updated version is released with the fix.
- The incident is published to the GitHub Security Advisory Database and
  affected users are automatically notified using GitHub security alerts.

### Fix Disclosure Process

OTel relies on GitHub tooling to notify the affected repositories and publish a
security advisory. GitHub will publish the CVE to the CVE List, broadcast the
Security Advisory via the GitHub Advisory Database, and send security alerts to
all repositories that use the package and have alerts on. The CVE will also be
added to the [OTel website's CVE feed](security/cve/).

#### Fix Release Day

The Fix Team as repository owners will release an updated version and optionally
notify their communities via Slack.

## Severity

The Fix Team evaluates vulnerability severity on a case-by-case basis, guided by
CVSS 3.1 and is subject to TC review.

## Retrospective

TBD
