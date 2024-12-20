---
title: OpenTelemetry Collector Completes Fuzzing Audit
linkTitle: Fuzzing Audit Results
date: 2024-12-19
author: '[Adam Korczynski](https://github.com/AdamKorcz)'
issue:
sig: GC
---

OpenTelemetry is happy to announce the completion of the Collector's fuzzing audit sponsored by [the CNCF](https://www.cncf.io/) and carried out by [Ada Logics](https://adalogics.com/). The audit marks a significant step in the OpenTelemetry project, ensuring the security and reliability of the Collector for its users. 

Fuzzing is a testing technique that involves executing an API with a high amount of pseudo random inputs and observing the APIs behaviour. The technique has increased in popularity due to its empirical success in finding security vulnerabilities and reliability issues. Fuzzing initially developed with a focus on testing software implemented in memory-unsafe languages for which fuzzing has been most productive. However, in recent years, fuzzing has expanded to memory-safe languages alike for which the outcome has also been rewarding. 

Over several years, the CNCF has invested in fuzzing for its ecosystem which has resulted in finding numerous security vulnerabilities in widely used projects such as Helm (CVE-2022-36055, CVE-2022-23524, CVE-2022-23526, CVE-2022-23525), the Notary project (CVE-2023-25656), containerd (CVE-2023-25153), Crossplane (CVE-2023-28494, CVE-2023-27483) and Flux (CVE-2022-36049). 

The audit consisted of three main efforts: First, the Ada Logics auditors first integrated the Opentelemetry Collector into [OSS-Fuzz](https://github.com/google/oss-fuzz). OSS-Fuzz is a service offered by Google free of charge for critical open-source projects. Essentially, critical projects can integrate into OSS-Fuzz after which OSS-Fuzz will run the project's fuzzers with excess resources in a continuous manner multiple times per week. If OSS-Fuzz finds a crash, it notifies the project and checks if the project has fixed the crash upstream which will lead OSS-Fuzz to mark issues as fixed. The whole workflow happens continuously on Google's fuzzing infrastructure which is supported by thousands of CPU cores thereby outperforming what developers and malicious threat actors can muster. With Opentelemetry integrated into OSS-Fuzz, the fuzz tests continue to test the Collector after the audit has finished to ensure continued reliability. The second effort after the Ada Logics team integrated Opentelemetry into OSS-Fuzz was to write a series of fuzz tests for the Opentelemetry Collector. The auditors wrote 49 fuzz tests for core components of the Collector and several receivers and processors in the opentelemetry-collector-contrib repository. The third effort was to let the fuzz tests run while the audit team observed their health in production. At the completion of the fuzzing audit, the 49 fuzz tests run in a healthy manner on the OSS-Fuzz platform.

A summary of the audit has been published [here](https://github.com/open-telemetry/community/blob/main/reports/ADA_Logics-collector-fuzzing-audit-2024.pdf).

