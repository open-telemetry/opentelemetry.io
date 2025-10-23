---
title: Evolving OpenTelemetry’s Stability and Release Practices
linkTitle: Stability Proposal Announcement # Mandatory, make sure that your short title.
date: 2025-10-23 # Put the current date, we will keep the date updated until your PR is merged
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Austin Parker](https://github.com/austinlparker) (honeycomb.io)
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
issue: the issue ID for this blog post # TODO: See https://opentelemetry.io/docs/contributing/blog/ for details
sig: Governance Committee # TODO: add the name of the SIG that sponsors this blog post
---

<!-- If your post doesn't have secondary authors, then delete the following paragraph: -->

With contributions from, and on behalf of, the OpenTelemetry Governance
Committee.

OpenTelemetry is a large, complex, and highly involved project. A quick glance
at the
[specification compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)
should be enough to tell you that supporting tracing, metrics, logs, and
profiles across a dozen languages – not to mention the complexity that comes
from different language runtimes and execution environments – means that there’s
a _lot_ to take in. One thing we’ve heard from you over the past months is that
this complexity makes it difficult to get started, or get going, with
OpenTelemetry as an end user. It also makes life difficult for our maintainers
and contributors. How should they prioritize feature development versus spec
changes versus instrumentation stability?

With this in mind, the OpenTelemetry project would like to announce some
proposed changes that we’d like to institute, with the goal of normalizing our
language around component stability and component offerings.

We believe that these changes need community involvement and discussion to be a
success, so we’re taking this opportunity to announce our intention and open an
[issue for discussion](https://github.com/open-telemetry/community/issues/3086)
in order to get feedback from users, maintainers, and contributors. We do not
anticipate that these changes will be completed overnight, and want to assure
everyone that we will continue to prioritize our existing commitments to users
and maintainers even as we consider necessary changes for the overall wellbeing
and maturity of the project.

## Improving defaults for stable components

The first proposal has to do with how SIGs and the project communicate stability
of components – such as instrumentation libraries, Collector receivers, or tools
like weaver. We will clearly state on the project website which components are
stable. We may list un-stable components as well, but the main goal is to
provide end-users with a single source of truth about what they can expect to be
stable. Stability requirements will also be streamlined and clarified for
contributors, maintainers, and end-users. We plan to expand these stability
requirements to include documentation, examples, implementation scenarios,
performance benchmarks, and other useful information.

In addition, we are proposing a change to the defaults of the SDK and
instrumentation agents. By default, stable components should not automatically
import, include, or enable unstable components. For example, if you install a
stable distribution of OpenTelemetry Java Instrumentation Agent, the default
receivers, processors, samplers, exporters, and libraries should not include
alpha or experimental instrumentations (which is the current behavior).
Similarly, the OpenTelemetry JavaScript Node Automatic Instrumentation
Metapackage would only include stable instrumentations (e.g., those which are at
v1.0 or better). For consistency, we propose a single project-wide way to enable
unstable behavior for end-users. The goal of this proposal is to reduce the
likelihood of end-user adoption of unstable packages, components, config, or API
surface area without an explicit ‘opt-in’ to this behavior.

We do not make this change lightly, and it wasn’t feasible to make it sooner –
end-user feedback has been a crucial aspect of our development process, and
early adoption of unstable instrumentation and features has led to better
outcomes overall. However, given the scope of OpenTelemetry it can be difficult
for users to evaluate individual component stability when installing
dependencies. By moving to a ‘default stable’ approach, we can ensure that users
will not be surprised by unexpected changes.

## Relaxing stability requirements for instrumentation libraries

Second, we are adjusting our overall posture when it comes to instrumentation
and instrumentation stability. Our goal, as a project, has always been to see
other libraries, frameworks, runtimes, and tools
[natively adopt OpenTelemetry](https://www.google.com/url?q=https://www.youtube.com/watch?v%3Dl8xiNOCIdLY&sa=D&source=docs&ust=1761158059548569&usg=AOvVaw3rCMkjmo1CMucSQtkHjDI3).
This is still the goal – we want other developers to embed our APIs into their
software, rather than requiring you to download and install libraries that
inject instrumentation code into third party dependencies. However, many users
have come to see our ‘contrib’ repositories and distributions as generic
replacements for system telemetry agents.

We’re thrilled that we’ve had so many users adopt the Collector as a
vendor-agnostic solution for collecting telemetry data, and we believe that it’s
a strong testament to the long-term viability of the project. What has become
challenging is that our contrib repositories – especially in the Collector –
represent a huge amount of work for maintainers and a constant drag on project
velocity. Even in a world where we had twice as many contributors and
maintainers, it would still be a challenge to accept all desired receivers or
instrumentation libraries and ensure they all met a sufficiently high quality
bar for release.

Our next proposal is designed to address this tension by more tightly scoping
what instrumentation libraries and receivers we’ll consider for inclusion and
stability. In short, instrumentation should be an implementation of a semantic
convention. This has quite a few implications, some of which include:

- Existing instrumentation libraries or Collector receivers that do not follow
  an established semantic convention will be treated as experimental/unstable
  until such time those conventions exist.
- SIGs should no longer accept instrumentation libraries or receivers that do
  not implement a semantic convention.
- The priority for instrumentations should be driven by semantic convention
  stability efforts.

Additionally, we will recommend that instrumentation which depends on a beta
version of a semantic convention may be marked as stable (beta), and included in
default distributions. The goal here is to reduce the dwell time of
instrumentation libraries in experimental maturity phases; We believe that
sufficient tooling exists via schema transformations or processors, as well as
the dual-write convention for updated attributes, as to allow end users to
depend upon beta conventions.

This change is not meant to ‘yank away’ integrations that current users may
depend on, but to more clearly communicate the expected future state of various
components, to provide accurate guidance to end users about the potential for
instrumentation to change, and for contributors and maintainers to have a
significantly more transparent and simplified roadmap of where to focus efforts
around stability work.

## Unified releases across the project

Our final proposal is to normalize release cycles for the project as a whole,
similar to how projects like Kubernetes function. This would **not** be a
mandate for SIGs to change their versioning schemas or release cycles, but to
formalize a ‘project wide’ release for end-users that included a documented,
tested, and validated stable release of all components. Rather than having to
cross-compare an array of version tags or package management files, our goal
here would be to have a simple meta-target that could be rolled out across an
organization with consistent documentation, features, etc.

The goal of this is to improve the ability of external organizations to
interpret OpenTelemetry release cycles and support. It paves the way to official
LTS releases in the future, and ideally serves as a more stable target for
downstream integrations and service providers – rather than potentially having
to keep pace with dozens of releases a month, you can focus on just the ‘major’
releases.

## What's next after this?

Looking forward, our goal with these changes is to not simply change for the
sake of change; These are a recognition of the impact and importance of
OpenTelemetry to the cloud native software community.
[OpenTelemetry has been the second highest velocity project in the CNCF over the past few years](https://www.cncf.io/wp-content/uploads/2025/04/CNCF-Annual-Report-2024_v2.pdf),
and
[nearly 50% of surveyed cloud native end user companies have adopted the project](https://www.cncf.io/wp-content/uploads/2025/04/cncf_annual_survey24_031225a.pdf).
The changes we are proposing here are designed to set us up for even greater
success. A common thread that we’ve identified through discussions with end
users, adopting organizations, and the broader observability community is that
the ‘packaging’ around OpenTelemetry does not meet the standards that users have
for major OSS projects. While we hear plenty of anecdotes around users having
good luck with our current defaults, time after time we run into horror stories
of mysterious bugs or configuration challenges due to the inherent complexity of
the tooling and problem space.

Going forward, we are going to prioritize projects, SIG work, and proposals from
the community to address these packaging, installation, and usage/usability
issues. Proposals for new work that does not align with these priorities may be
rejected, or asked to work outside of the project. We believe that this
prioritization will lead to better outcomes for our core mission, as well as
identifying areas we can improve – for example, it should not be onerous to
extend OpenTelemetry in a way that is broadly compatible with upstream
implementations, APIs, etc. By requesting that new projects work strictly
through the existing spec and APIs, we can identify areas of improvement to the
core. In the future, as ecosystem projects discover fitness and users, we can
discuss adopting those projects into the core distributions.

This is a big, ambitious goal. While we’re making every effort to break it down
into digestible chunks, it’s likely that readers may have questions. Some of
those questions may not have answers right now\! We call upon the community to
discuss these proposals and changes in
[this GitHub issue](https://github.com/open-telemetry/community/issues/3086), at
in-person events, and on Slack. All feedback is welcome – thanks in advance\!
