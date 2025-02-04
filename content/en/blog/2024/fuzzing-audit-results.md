---
title: OpenTelemetry Collector Completes Fuzzing Audit
linkTitle: Fuzzing Audit Results
date: 2024-12-20
author: '[Adam Korczynski](https://github.com/AdamKorcz)'
issue: 5798
sig: GC
cSpell:ignore: containerd Korczynski
---

OpenTelemetry is happy to announce the completion of the Collector's fuzzing
audit [sponsored by the CNCF] and carried out by
[Ada Logics](https://adalogics.com/). The audit marks a significant step in the
OpenTelemetry project, ensuring the security and reliability of the Collector
for its users.

[sponsored by the CNCF]:
  https://contribute.cncf.io/resources/project-services/audits/

## What is fuzzing?

Fuzzing is a testing technique that executes an API with a high amount of
pseudo-random inputs and observes the API's behavior. The technique has
increased in popularity due to its empirical success in finding security
vulnerabilities and reliability issues. Fuzzing initially developed with a focus
on testing software implemented in memory-unsafe languages, where it has been
most productive. However, in recent years, fuzzing has expanded to memory-safe
languages as well.

Over several years, the CNCF has invested in fuzzing for its ecosystem. This
testing has found numerous security vulnerabilities in widely used projects such
as Helm (CVE-2022-36055, CVE-2022-23524, CVE-2022-23526, CVE-2022-23525), the
Notary project (CVE-2023-25656), containerd (CVE-2023-25153), Crossplane
(CVE-2023-28494, CVE-2023-27483) and Flux (CVE-2022-36049).

## OSS-Fuzz

To initiate the audit, Ada Logics auditors integrated the OpenTelemetry
Collector into [OSS-Fuzz](https://github.com/google/oss-fuzz). OSS-Fuzz is a
service offered by Google to critical open source projects, free of charge. The
service runs a project's fuzzers with excess resources multiple times per week.
If OSS-Fuzz finds a crash, it notifies the project. It then checks if the
project has fixed the crash upstream and if so, marks the issue(s) as fixed. The
whole workflow happens continuously on Google's fuzzing infrastructure,
supported by thousands of CPU cores. These testing resources outperform what
developers or malicious threat actors can muster.

## The tests

After the Ada Logics team integrated OpenTelemetry into OSS-Fuzz, the next step
was to write a series of fuzz tests for the OpenTelemetry Collector. The
auditors wrote 49 fuzz tests for core components of the Collector, as well as
several receivers and processors in the `opentelemetry-collector-contrib`
repository.

The fuzz tests were left to run while the audit team observed their health in
production. At the completion of the fuzzing audit, the 49 fuzz tests on the
OSS-Fuzz platform were healthy.

To ensure continued reliability, the fuzz testing continues on the Collector
even though the audit is complete.

## The results so far

Fuzz testing for the Collector is ongoing, allowing for changes to the project
to be tested as well. As of the date of this post, no crashes have been
detected.

But the work is not done! The Ada Logics team created the Collector's fuzzing
setup as a reference implementation that other OpenTelemetry subprojects can
rely on to create their own fuzz testing, ensuring greater stability for the
project as a whole.

For more insight into the audit process, see the
[published summary](https://github.com/open-telemetry/community/blob/main/reports/ADA_Logics-collector-fuzzing-audit-2024.pdf).
