---
title: OpenTelemetry Is Expanding Into CI/CD Observability
linkTitle: OpenTelemetry Is Expanding Into CI/CD Observability
date: 2025-02-24
author: >-
  [Dotan Horovits](https://github.com/horovits/) (CNCF Ambassador), [Adriel
  Perkins](https://github.com/adrielp) (Liatrio)
canonical_url: https://www.cncf.io/blog/2024/11/04/opentelemetry-is-expanding-into-ci-cd-observability/
issue: 5546
sig: CI/CD Observability
# prettier-ignore
cSpell:ignore: andrzej bäck bäckmark chacin cicd frittoli grassi helmuth horovits jemmic joao kamphaus keptn kowalski liatrio liudmila molkova robb ruech safyan sarahan shkuro skyscanner slsa stencel suereth tekton voss
---

We’ve been talking about the need for a common “language” for reporting and
observing CI/CD pipelines for years, and finally, we see the first “words” of
this language entering the “dictionary” of observability—the
[OpenTelemetry open specification](/docs/specs/otel/). With the recent release
of OpenTelemetry’s [Semantic Conventions](/docs/specs/semconv/), v1.27.0, you
can find
[designated attributes for reporting CI/CD pipelines](/docs/specs/semconv/registry/attributes/cicd/).

This is the result of the hard work of the
[CI/CD Observability Special Interest Group (SIG) within OpenTelemetry](https://github.com/open-telemetry/community/blob/main/projects/completed-projects/ci-cd.md).
As we accomplish this core milestone for the first phase, we thought it’d be a
good time to share it with the world.

## Engineers need observability into their CI/CD pipelines

[CI/CD observability](https://medium.com/@horovits/fcc6c10c4987) is essential
for ensuring that software is released to production efficiently and reliably.
Well-functioning CI/CD pipelines directly impact business outcomes by shortening
[Lead Time for Changes DORA metric](https://horovits.medium.com/improving-devops-performance-with-dora-metrics-918b9604f8e2)
and enabling fast identification and resolution of broken or flaky processes. By
integrating observability into CI/CD workflows, teams can monitor the health and
performance of their pipelines in real time, gaining insights into bottlenecks
and areas that require improvement.

Leveraging the same well-established tools used for monitoring production
environments, organizations can extend their observability capabilities to
include the release cycle, fostering a holistic approach to software delivery.
Whether open source or proprietary tools, there’s no need to reinvent the wheel
when choosing the observability toolchain for CI/CD pipelines.

## The need for standardization

However, the diverse landscape of CI/CD tools creates challenges in achieving
consistent end-to-end observability. With each tool having its own means,
format, and semantic conventions for reporting the pipeline execution status,
fragmentation within the toolchain can hinder seamless monitoring. Migrating
between tools becomes painful, as it requires reimplementing existing
dashboards, reports, and alerts.

Things become even more challenging when you need to monitor multiple tools
involved in the release pipeline in a uniform manner. This is where
[open standards and specifications become critical](https://horovits.medium.com/the-rise-of-open-standards-in-observability-highlights-from-kubecon-13694e732c97).
They create a common uniform language, one which is tool- and vendor-agnostic,
enabling cohesive observability across different tools and allowing teams to
maintain a clear and comprehensive view of their CI/CD pipeline performance.

The need for standardization is relevant for creating the semantic conventions
mentioned above, the language for reporting what goes on in the pipeline.
Standardization is also needed for the means in which this reporting is
propagated through the system, such as upon spawning processes during the
pipeline execution. This led us to promote standardization for using environment
variables for context and baggage propagation between processes, another
important milestone that was recently approved and merged.

## OpenTelemetry: the natural home for CI/CD observability specification

This realization drove us to look for the right way to approach creating a
specification. OpenTelemetry emerges as the standard for telemetry generation
and collection. The OpenTelemetry specification is tasked with exactly this
problem: creating a common uniform and vendor-agnostic specification for
telemetry. And its support from the Cloud Native Computing Foundation (CNCF)
ensures it remains open and vendor-neutral. As long standing advocates of
OpenTelemetry, it only made sense to extend OpenTelemetry to cover this
important DevOps use case.

We started with an
[OpenTelemetry extension proposal (OTEP #223)](https://github.com/open-telemetry/oteps/pull/223)
a couple of years ago, proposing our idea to extend OpenTelemetry to cover the
CI/CD observability use case. In parallel, we’ve started a Slack channel on the
CNCF Slack to gather fellow enthusiasts behind the idea and start brainstorming
what that should look like. The Slack channel grew and we quickly discovered
that the problem is common across many organizations.

With the feedback from the Technical Oversight Committee and others within the
CNCF, we’ve taken the path of asking the mandate to start a dedicated Working
Group for the topic under OpenTelemetry’s Semantic Conventions SIG (SIG SemConv
in short). With their blessing, we
[launched the formal CI/CD Observability SIG](https://github.com/open-telemetry/community/blob/main/projects/completed-projects/ci-cd.md)
to formalize our previous Slack group discussions and goals.

## OpenTelemetry’s CI/CD Observability SIG

Since November of 2023, the SIG has been actively working to develop the
standard for semantics around CI/CD observability in collaboration with experts
from multiple companies and open source projects. At its inception, we decided
to focus on a few key areas for 2024:

- An initial set of common attributes across CI/CD systems.
- Develop prototype(s) to include both holistic and signal-specific attributes.
- Carry forward the proposal to add environment variables as context propagators
  to the OpenTelemetry specification (OTEP #258).
- A strategy for bridging OpenTelemetry conventions with
  [CDEvents](https://cdevents.dev/docs/) and
  [Eiffel](https://eiffel-community.github.io/).

At first, our SIG met during the larger Semantic Conventions Working Group
meetings every Monday. This provided a good opportunity for us to get our
bearings as we researched and discussed how we would accomplish the goals on our
roadmap. This also enabled us to get to know many members of the larger
OpenTelemetry community, solicit feedback on our designs, and get direction on
how to proceed. The OpenTelemetry Semantic Convention Working Group has been
extraordinarily supportive of the CI/CD initiative.

Upon completion and release of its initial milestone (see below), our SIG was
granted its own
[dedicated meeting slot](https://github.com/open-telemetry/community/pull/2293)
on the
[OpenTelemetry calendar](https://github.com/open-telemetry/community#calendar),
every Thursday at 0600 PT. The group gets together here to discuss current and
future work prior to bringing to the larger Semantic Conventions meetings on
Monday. We greatly look forward to the continued support and participation of
the community as we continue to drive forward this critical area of
standardization.

## CI/CD is part of the latest OpenTelemetry Semantic Conventions

Over the course of months of iteration and feedback, the
[first set of Semantic Conventions was merged](https://github.com/open-telemetry/semantic-conventions/pull/1075)
in for the v1.27.0 release. This change brought forth the first set of
foundational semantics for CI/CD under the `CICD`, `artifacts`, `VCS`, `test`,
and `deployment` namespaces. This was a significant milestone for the CI/CD
Observability SIG and industry as a whole. This creates the foundation for which
all of our group’s other goals can begin to take form, and reach implementation.

But what does that actually mean? What value does it provide? Let’s consider
real world examples for two of the namespaces.

### Tracking release revisions from Version Control Systems (VCS)

[Version Control System (VCS) attributes](/docs/specs/semconv/registry/attributes/vcs/)
cover multiple areas common in a VCS like refs and changes (pull/merge
requests). The `vcs.repository.ref.revision` attribute is a key piece of
metadata. As Version Control Systems like GitHub and GitLab emit events, they
can now have this semantically compliant attribute. That means when integrating
code, releasing it, and deploying it to environments, systems can include this
attribute and trace the code revision across bounds more easily. In the event a
deployment fails, you can quickly look at the revision of code and track it back
to the buggy release. This attribute is actually a key piece of metadata for
[DORA metrics](https://dora.dev/guides/dora-metrics-four-keys/) too, as you
calculate Change lead time and Failed deployment recovery time.

### Artifacts for supply chain security, aligned with the SLSA specification

The
[artifact attribute namespace](/docs/specs/semconv/registry/attributes/artifact/)
had multiple attributes for its first implementation. One key set of attributes
within this namespace cover [attestations](https://slsa.dev/attestation-model)
that closely align with the [SLSA](https://slsa.dev/spec/v1.0/about) model. This
is really the first time a direct connection is being made between observability
and software supply chain security. Consider the following
[supply chain threat model](https://slsa.dev/spec/v1.0/threats) defined by SLSA:
{{< figure class="figure" src="SLSA-supply-chain-model.png" attr="SLSA Community Specification License 1.0" attrlink=`https://github.com/slsa-framework/slsa?tab=License-1-ov-file` >}}

These new attributes for artifacts and attestations help observe the sequence of
events modeled in the above diagram in real time. Really, the conventions that
exist today and those that will be added in the future enable interoperability
between core software delivery capabilities like security and platform
engineering using observability semantics.

## What’s next for CI/CD Observability Working Group

As already mentioned, the first major milestone we reached was the merge of the
OTEP for extending the semantic conventions with the new attributes, which is
now part of the OpenTelemetry Semantic Conventions latest release.

The second important milestone is
[OTEP #258](https://github.com/open-telemetry/oteps/pull/258) for Environment
Variable Context Propagation, which was just approved and merged. This OTEP sets
the foundation for writing the specification.

Since we’ve made progress on our initial milestones, we’ve updated the
[CI/CD Observability SIG milestones for the remainder of 2024](https://github.com/open-telemetry/community/blob/main/projects/completed-projects/ci-cd.md).
Our goal is to finish out as many of the defined milestones as possible by the
end of the year. Notably, we’re focused on:

- Adding
  [metric conventions for version control systems](https://github.com/open-telemetry/semantic-conventions/pull/1383).
- Building tracing prototypes in CICD systems (for example, ArgoCD, GitHub,
  GitLab, Jenkins).
- Getting [OTEP #258](https://github.com/open-telemetry/oteps/pull/258) ready
  for implementation for the addition to the specification.
- Adding additional attributes to the registry covering more domains like:
  - [Software outage incidents](https://github.com/open-telemetry/semantic-conventions/issues/1185)
  - [System attributes around CI/CD runners](https://github.com/open-telemetry/semantic-conventions/issues/1184)
- Beginning work on trace and event (log) signal specifics to build the bridge
  for interoperability between other specifications.
- Adopting the changes from the
  [Entity and Resource OTEP](https://github.com/open-telemetry/oteps/pull/264).
- [Enabling vendor-specific extension(s)](https://github.com/open-telemetry/semantic-conventions/issues/1193).
- Open source community outreach strategy for semantic adoption.

All that has been mentioned thus far is just the beginning! We have lots of work
defined on our
[CICD Project Board](https://github.com/orgs/open-telemetry/projects/79), and we
have work in progress! We’ll continue to iterate on the above milestones that
we’ve set out for the remainder of 2024. Here’s a couple things to look out for.

- Version Control System metrics—leading indicators for DORA
- Traces from GitHub Actions and Audit Logs
  - Special thanks to the following people who are making this component
    possible:
    - Tyler Helmuth – Honeycomb
    - Andrzej Stencel – Elastic
    - Curtis Robert – Splunk
    - Justin Voss
    - Kristof Kowalski – Anz Bank
    - Mike Sarahan – Nvidia
- A corresponding version of the GitHub Receiver Component but implemented in
  GitLab

And much more!

## It takes a village to extend OpenTelemetry

Whoa, that’s a lot to do! Most certainly this SIG will continue beyond 2024 and
through 2025. Standards are hard, but essential. And, we have some amazing folks
that are part of the SIG and contributing to these standards! Who you may ask?

Firstly we’d like to acknowledge key members of OpenTelemetry leadership
committees who have heavily enabled the work we’ve done thus far, and will
continue to do.

From the OpenTelemetry Technical Committee we have two core sponsors, Carlos
Alberto from Lightstep and Josh Suereth from Google. Both Carlos and Josh have
been so supportive of the CICD work, really guiding us through the process and
details we need to be successful.

From the OpenTelemetry Governance Committee we’ve had Trask Stalnaker from
Microsoft act as an exceptional ally, and Daniel Blanco from Skyscanner who now
acts as our current Liaison. Both Trask and Daniel have been instrumental in
supporting the SIG and enabling us to have our own meeting in the OpenTelemetry
community.

In addition to those folks, we’ve had significant feedback, support, and
contributions from the following key folks:

- Yuri Shkuro – Creator of Jaeger, Co-Founder of OpenTelemetry
- Andrea Frittoli – Tekton CD Maintainer, CDEvents Co-creator, IBM
- Emil Bäckmark – CDEvents and Eiffel Maintainer, Ericsson
- Magnus Bäck – Eiffel, Axis Communications
- Liudmila Molkova – Microsoft
- Christopher Kamphaus – Jemmic, Jenkins
- Giordano Ricci – Grafana Labs
- Giovanni Liva – Dynatrace, Keptn
- Ivan Calvo – Elastic, Jenkins
- Armin Ruech – Dynatrace
- Michael Safyan – Google
- Robb Kidd – Honeycomb
- Pablo Chacin – Grafana Labs
- Alexandra Konrad – Elastic
- Alexander Wert – Elastic
- Joao Grassi – Dynatrace
- DJ Gregor – Discover

That was a lot of names to name! We greatly appreciate everyone who has
supported this initiative and helped bring it to fruition! It takes significant
thinking ability and time to build industry wide standards. Hard problems are
hard, but these folks have risen to the challenge to make the world of
observability and CICD systems a better, more interoperable place!

## Join the Working Group discourse and make an impact

Want to learn more? Want to get involved in shaping CI/CD Observability?

We invite developers and practitioners to participate in the discussions,
contribute ideas, and help shape the future of CI/CD observability and the
OpenTelemetry semantic conventions. Discussion takes place in the
[CNCF Slack](https://slack.cncf.io/) workspace under the `#otel-cicd` channel,
and you can chime in on any of the GitHub issues mentioned throughout this
article and join the CICD SIG
[weekly calls](https://github.com/open-telemetry/community/#sig-cicd) every
Thursday at 0600 PT.

_A version of this article also [appears on the CNCF blog][]._

[appears on the CNCF blog]: <{{% param canonical_url %}}>
