---
title: Evolving OpenTelemetry's Stabilization and Release Practices
linkTitle: Stability Proposal Announcement
date: 2025-11-07
author: OpenTelemetry Governance Committee
sig: Governance Committee
cSpell:ignore: deprioritize incentivized rollouts
---

## Summary

OpenTelemetry is, by any metric, one of the largest and most exciting projects
in the cloud native space. Over the past five years, this community has come
together to build one of the most essential observability projects in history.
We're not resting on our laurels, though. The project consistently seeks out,
and listens to, feedback from a wide array of stakeholders. What we're hearing
from you is that in order to move to the next level, we need to adjust our
priorities and focus on stability, reliability, and organization of project
releases and artifacts like documentation and examples.

Over the past year, we've run a variety of user interviews, surveys, and had
open discussions across a range of venues. These discussions have demonstrated
that the complexity and lack of stability in OpenTelemetry creates impediments
to production deployments.

This blog post lays out the objectives and goals that the Governance Committee
believes are crucial to addressing this feedback. We're starting with this post
in order to have these discussions in public.

### Our Goals

- Ensure that all OpenTelemetry distributions are 'stable by default' and
  provide standardized mechanisms for users to opt-in to experimental or
  unstable features.
- Have a single, clear, and consistent set of criteria for stability that
  includes documentation, performance testing, benchmarks, etc.
- Make it easier for instrumentation libraries to stabilize and encourage
  federation of semantic conventions.
- Introduce 'epoch releases' that are easier for end-user organizations to
  consume.

**We'd appreciate your feedback!**

From maintainers and contributors, we'd appreciate your feedback on this
proposal in general and on specifics, such as implementation timelines, the
requirements for moving stability levels, and how to handle telemetry output
migrations.

From end-users, we'd appreciate your feedback on how you'd prefer to adopt
releases of OpenTelemetry, and how you currently do so. As we evaluate different
versioning and release strategies, it would be helpful to understand how you're
currently rolling out changes -- especially in polyglot environments. We also
would appreciate your feedback on documentation and performance benchmarking for
components such as instrumentation libraries, the Collector, etc.

From integrators, vendors, and the wider ecosystem, we would appreciate feedback
and constructive proposals on instrumentation and semantic convention metadata
and discovery. For integrators that are building on top of, or alongside,
OpenTelemetry we would love to know how we can make it easier for you and your
users to consume OpenTelemetry, as well as how we can make it easier for you to
publish and maintain your own instrumentation.

Further sections of this blog have other specific asks that we'd appreciate your
feedback on. Please remember that the specific ways we accomplish these goals
are not set in stone -- that's why we want your feedback on the proposals! If
you think there's a better way to accomplish these goals, please use the
discussion to let us know.

[Join the discussion!](https://github.com/open-telemetry/community/discussions/3098).

## Why are we doing this?

OpenTelemetry has grown into a massive, complex ecosystem. We support four
different telemetry signals (tracing, metrics, logs, and profiles) across more
than a dozen programming languages. Each language has its own runtime
requirements and execution environments. The
[specification compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)
shows just how much we're trying to accomplish – and it's overwhelming.

This complexity creates real barriers to adoption. Organizations ready to deploy
OpenTelemetry in production encounter unexpected roadblocks: configuration that
breaks between minor versions, performance regressions that only appear at
scale, and the challenge of coordinating rollouts across hundreds or thousands
of services. Many teams end up delaying or scaling back their OpenTelemetry
deployments as a result.

For maintainers, this complexity makes their job harder than it needs to be.
There's a lack of clear milestones and guidance about what's 'most important' at
any given time. Stability efforts involve a lot of churn and there's often
conflicting guidance about where you should focus your time.

Addressing these concerns should be a high priority for the project, both for
the health of our maintainers and contributors, but also allowing us to continue
to grow and scale as we mature, especially as we become more deeply integrated
into the cloud native ecosystem.

The Governance Committee believes that these changes need community involvement
and discussion to be a success, so we’re taking this opportunity to announce our
intention and open a
[GitHub discussion](https://github.com/open-telemetry/community/discussions/3098)
in order to get feedback from users, maintainers, and contributors. We do not
anticipate that these changes will be completed overnight, and want to assure
everyone that we will continue to prioritize our existing commitments to users
and maintainers even as we consider necessary changes for the overall wellbeing
and maturity of the project.

## 1. Stable By Default

Stability guarantees have been a long-held principle in OpenTelemetry, with
exceedingly high bars. There is a tension between this and user needs that we'd
like to discuss.

### Background

OpenTelemetry is a specification for how cloud native software -- libraries,
frameworks, infrastructure abstractions, executable code, etc. -- produces and
communicates telemetry data about its operation. This specification is designed
to be exhaustive, comprehensive, and low-level. Many of the elements of the
specification are hard-won knowledge from the combined decades of experience its
authors have with building, operating, or designing telemetry systems at planet
scale.

A specification with no implementation is not a useful thing for end users,
though. Developers and operators approach telemetry through a variety of lenses;
Some organizations have high standards for observability, with entire teams
dedicated to building internal monitoring and instrumentation frameworks. Other
organizations view observability and monitoring as a second or third order
priority -- something that needs to happen, but not something that's
incentivized. OpenTelemetry, as a specification, needs to serve all of these
users and their use cases.

To make OpenTelemetry useful, we need to provide an 'on-ramp' from existing
methods and modes, existing tools and strategies, which means we need to provide
implementations of not just the specification, but _applications_ of it as well.
In practice, this means we need to distribute libraries to add OpenTelemetry
instrumentation to existing HTTP servers and clients, or Collector receivers to
scrape metrics from MySQL and translate them into OTLP.

Most of the value our community derives from OpenTelemetry comes directly from
instrumentation libraries and Collector components – not the core SDKs. While we
organize these as `contrib` repositories to distinguish them from core
components, end users don't see or care about this distinction. They just want
instrumentation that works.

For maintainers and project leadership, our stability goals and the nature of
`contrib` present a significant challenge. Users want stable, well-tested, and
performant releases -- that _also_ perform the same function as commercial
instrumentation agents.

### Goals and Objectives

At a high level, these are the three points in this area:

1. All components across all repositories (including semantic conventions)
   should adhere to a consistent way of communicating stability, through a
   metadata file/information, that can be discovered and parsed in a
   programmatic way. The exact format should be defined through an OTEP and
   incorporated into the specification.
2. Stability requirements should be expanded to include more requirements around
   documentation and where it's hosted, example code, performance benchmarks
   (where applicable), implementation cookbooks, and other artifacts as
   necessary.
3. Stable distributions of OpenTelemetry should only enable stable components by
   default. Users should be able to select a desired minimum stability level
   with a documented and consistent configuration option.

We appreciate that these would be a big change for maintainers, especially those
who have shipped v1+ of their libraries. We would deeply appreciate your
feedback on these objectives in the
[discussion](https://github.com/open-telemetry/community/discussions/3098).

## 2. Instrumentation Stability and Semantic Conventions

In order to achieve our stability goals, we'll need to address semantic
convention stability and processes as well.

### Semantic Convention Challenges

Semantic conventions evolve slowly and deliberately because they must work
across diverse telemetry systems. While OpenTelemetry is designed for
interconnected signals flowing together, users deploy many different storage and
analysis engines to consume this data. Each backend has its own constraints and
capabilities. Maintainers must balance competing concerns – keeping cardinality
manageable, ensuring attributes are useful but not overly specific, and making
conventions that work well regardless of where the data ends up.

The downside of this is that progress on semantic conventions can be slow, and
this slowness impacts all consumers of the conventions. Many instrumentation
libraries are currently stuck on pre-release versions because they depend on
experimental semantic conventions. Outside contributors are stuck between
emitting unspecified telemetry or trying to engage in the process, which
requires a long commitment. Finally, we're internally inconsistent in
instrumentation across the project; some libraries are mapped to conventions,
others exist independently of it.

### Instrumentation and Convention Goals

Our goals here are designed to achieve three outcomes.

1. Instrumentation stability should be decoupled from semantic convention
   stability. We have a lot of stable instrumentation that is safe to run in
   production, but has data that may change in the future. Users have told us
   that conflating these two levels of stability is confusing and limits their
   options.
2. Semantic conventions should be more federated; OpenTelemetry should not be
   the final word on what conventions exist, and instead should focus on
   creating core conventions that can be extended and built upon.
3. Semantic convention development and iteration should not be a blocker on
   distribution maintainers.

To this end, we have a few recommendations we'd like to codify into the
specification. First, our position around instrumentation libraries in
OpenTelemetry is that they exist as concrete implementations of the semantic
conventions. This gives us a concrete target for 'first party' instrumentation
libraries that we wish to support in distributions. In addition, maintainers
should prioritize instrumentations that align to existing conventions and
deprioritize others.

Second, we'd like to make it easier for maintainers to ship stable
instrumentations. If an instrumentation's API surface is stable, then we believe
that semantic convention stability should not block the stabilization of that
instrumentation library. This means that we'll need to be thoughtful in
providing migration pathways for telemetry as operators upgrade to new major
versions of instrumentation libraries.

Finally, we'd like to make it easier for third-parties to publish their own
semantic conventions by formalizing and stabilizing necessary parts of the
semantic conventions in order for other organizations to ship conventions for
their libraries, frameworks, tech stacks, etc.

In order to accomplish this, we're looking for feedback on several areas from
maintainers and end-users -- especially around the maturity/lifecycle of
semantic conventions, as well as what's missing in terms of federating semantic
conventions. We are more flexible on proposals here, but our outcomes aren't.
Remember, a core goal of the project is to encourage other libraries, tools, and
frameworks to
[natively adopt OpenTelemetry](https://www.youtube.com/watch?v=l8xiNOCIdLY) --
semantic conventions are a big part of that.

## 3. Confident and Stable Releases

### The Challenge

OpenTelemetry isn't just a single binary deployed into a Kubernetes cluster.
Subtle differences in everything from configuration to telemetry output between
different versions of instrumentation libraries, Collector receivers, and SDKs
can cause a real headache for adopters. In addition, the rapid release cadence
of many components causes real difficulty for end users, especially around the
Collector. Enterprise deployments and upgrades are slow, deliberate things --
teams simply do not have the bandwidth to validate and roll out changes at the
cadence we ship.

### Release Goals and Strategy

Ultimately, our goal here is to make it easier for large organizations to deploy
OpenTelemetry. Please keep in mind that in many organizations, 'deployment' and
'upgrades' are non-trivial tasks that involve many teams and stakeholders across
different business units or areas of responsibility including security.

Our current proposal is the creation of a Release SIG that will be responsible
for creating a schedule of 'epoch' releases for OpenTelemetry. These epoch
versions would essentially be a manifest pointing to a tested, documented, and
stable set of components that meet project stability requirements.

This is not a trivial undertaking, to be clear. Those efforts will communicate
many of the requirements these epoch releases must follow, after all. To our
maintainers and contributors, this effort is not intended to change how
individual components, SDKs, or APIs are versioned or released. Rather, we want
to provide tested, stable release combinations that work well together for end
users who need that stability.

For end-users, we would appreciate feedback on how you are currently managing
upgrades, what you'd like to see in this area, and your current challenges in
deployment and upgrade of both SDKs and Collectors.

## Looking Forward

These changes are a reflection of the impact and importance of OpenTelemetry to
the cloud native software community.
[OpenTelemetry has been the second highest velocity project in the CNCF over the past few years](https://www.cncf.io/wp-content/uploads/2025/04/CNCF-Annual-Report-2024_v2.pdf),
and
[nearly 50% of surveyed cloud native end user companies have adopted the project](https://www.cncf.io/wp-content/uploads/2025/04/cncf_annual_survey24_031225a.pdf).
These changes are setting up the next chapter of our success, and becoming truly
ubiquitous.

Our mission as a project is not changing, but our priorities are.

1. Stability and usability for all developers and users.
2. Clear packaging, installation, and usage paths.
3. Predictability and consistency.

For contributors and maintainers, what does this mean? We'll fast-track
proposals that align with these priorities. If there's feature work or
instrumentation that doesn't align to this, that's fine -- we'd ask that you
work on it outside the project and discover where our existing integration
points and patterns don't work. That's good feedback, and will help us improve
the specification for everyone.

For maintainers, contributors, and integrators -- we would appreciate your
feedback in
[this GitHub Discussion](https://github.com/open-telemetry/community/discussions/3098)
on the topics and proposals raised here. You can also send feedback on this
proposal to [feedback@opentelemetry.io](mailto:feedback@opentelemetry.io) or on
the CNCF Slack in the #opentelemetry channel. We also look forward to meeting
the cloud native community in person at KubeCon next week -- please join us
there with comments!
