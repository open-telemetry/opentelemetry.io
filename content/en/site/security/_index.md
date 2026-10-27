---
title: Security
description: >-
  Security posture of the website and its repository: vulnerability reporting,
  credential scoping, and supply-chain safeguards
weight: 50
---

This section is for maintainers who handle the security side of the website and
its repository. It explains how to act on a security notification, and it points
at the controls and procedures that already live elsewhere in the site docs:

- [Handling security advisories](./advisories/): what a notification means, how
  to triage it, and when to escalate. Start here when an alert, a bot PR, or a
  report arrives.
- The supply-chain controls on the site's npm dependencies: threat model and
  rationale in [Supply-chain security][], the controls and update recipes in
  [Dependency management][], and the test that verifies them in [Supply-chain
  audit design][].
- Workflow triggers, token privileges, and untrusted inputs in CI: [CI
  workflows][].
- How to report a vulnerability in the website: the repository's [security
  policy][].

<!-- prettier-ignore-start -->
[CI workflows]: ../build/ci-workflows/#security-model
[Dependency management]: ../build/dependencies/#controls
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
[Supply-chain audit design]: ../design/supply-chain-audit/
[Supply-chain security]: ../design/supply-chain-security/
<!-- prettier-ignore-end -->
