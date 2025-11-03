---
title: Evolving OpenTelemetry’s Stabilization and Release Practices
linkTitle: Stability Proposal Announcement # Mandatory, make sure that your short title.
date: 2025-10-23 # Put the current date, we will keep the date updated until your PR is merged
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Austin Parker](https://github.com/austinlparker) (honeycomb.io)
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
issue: the issue ID for this blog post # TODO: See https://opentelemetry.io/docs/contributing/blog/ for details
sig: Governance Committee # TODO: add the name of the SIG that sponsors this blog post
---

<!-- If your post doesn't have secondary authors, then delete the following paragraph: -->

With contributions from, and on behalf of, the OpenTelemetry Governance
Committee.

## Summary

OpenTelemetry is changing how the project approaches stability and releases,
across all sub-projects and repositories.

**Why?**

- User interviews, surveys, and discussions have demonstrated that the
  complexity of OpenTelemetry creates impediments to production deployments.

**What's Changing?**

- We'll be moving to a simpler, but stricter, definition of what components can
  be present in a stable release and updating stability requirements to include
  new guidance on documentation, performance testing, etc.
- Semantic convention guidelines will be updated to encourage faster iteration,
  greater federation, and to unblock consumers to allow stable instrumentation
  releases.
- To make these releases easier to consume, we'll be introducing 'epoch
  releases' -- similar to the Kubernetes release cycle.

**What we need your input on:**

- Implementation timelines and stability requirements.
- Proposed changes to semantic convention stability.
- How we can make releases better.

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

With this in mind, the OpenTelemetry project would like to announce some
proposed changes that we’d like to institute, with the goal of normalizing our
language around component stability and component offerings.

The Governance Committee believes that these changes need community involvement
and discussion to be a success, so we’re taking this opportunity to announce our
intention and open an
[Github discussion](https://github.com/open-telemetry/community/discussions/3098)
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

### What's Changing?

There's three major changes that the project will be rolling out. Keep in mind
the exact details of some of this may change, but these goals are more or less
fixed.

1. All components across all repositories should adhere to a consistent way of
   communicating stability, through a metadata file, that can be discovered and
   parsed in a programmatic way. The exact format will be defined through an
   OTEP and incorporated into the specification. As part of this, we'll be
   normalizing stability levels across components, including semantic
   conventions by introducing alpha/beta stability to that effort.
2. Stability requirements will be expanded to include more requirements around
   documentation and where it's hosted, example code, performance benchmarks
   (where applicable), implementation cookbooks, and other artifacts as
   necessary.
3. Stable components must only enable other stable components by default. A new
   global configuration option shall be introduced that allows adopters to
   choose a desired minimum stability level, with a default value of
   `[stable, rc, beta]`.

This is a big change for maintainers, especially those who have shipped v1+ of
their libraries. We would deeply appreciate your feedback on this proposal in
the [discussion](https://github.com/open-telemetry/community/discussions/3098).

## 2. Semantic Convention Stability Normalization

As mentioned above, we would like to adjust the semantic convention stability
process in order to provide greater consistency across projects, but also to
better communicate the interplay between telemetry stability and implementation
stability.

### Background

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
instrumentation across the project; Some libraries are mapped to conventions,
others exist independently of it.

### What's Changing?

Our goals here are designed to achieve two outcomes.

1. Semantic conventions should have more nuanced stability levels in order to
   unblock upstream development and gain real world feedback from users.
2. Semantic conventions should be more federated; OpenTelemetry itself shouldn't
   be a constraint on the development and promulgation of the conventions.

To this end, we have a few recommendations we'd like to codify into the
specification. First, our position around instrumentation libraries in
OpenTelemetry is that they exist as concrete implementations of the semantic
conventions. This gives us a concrete target for 'first party' instrumentation
libraries that we wish to support in distributions. In addition, maintainers
should prioritize instrumentations that align to existing conventions and
deprioritize others. Second, we would like to promote more first-party semantic
conventions to 'beta' stability in order to unblock downstream instrumentation
libraries. Many of our conventions have months, or years, of real-world use that
we can rely on as guidance for their fitness. Finally, we'd like to formalize
the semantic convention format specification to the point that third-parties
outside the OpenTelemetry project feel comfortable using it to publish their
own, federated, semantic conventions.

In order to accomplish this, we're looking for feedback on several areas from
maintainers and end-users -- especially around the maturity/lifecycle of
semantic conventions, as well as what's missing in terms of federating semantic
conventions. We are more flexible on proposals here, but our outcomes aren't.
Remember, a core goal of the project is to encourage other libraries, tools, and
frameworks to
[natively adopt OpenTelemetry](https://www.youtube.com/watch?v=l8xiNOCIdLY) --
semantic conventions are a big part of that.

## 3. Confident, Stable, Releases.

## Background

OpenTelemetry isn't just a single binary deployed into a Kubernetes cluster.
Subtle differences in everything from configuration to telemetry output between
different versions of instrumentation libraries, collector receivers, and SDKs
can cause a real headache for adopters. In addition, the rapid release cadence
of many components causes real difficulty for end users, especially around the
Collector. Enterprise deployments and upgrades are slow, deliberate things --
teams simply do not have the bandwidth to validate and roll out changes at the
cadence we ship.

## What's Changing?

We are proposing the creation of a Release SIG that will be responsible for
creating a schedule of 'epoch' releases for OpenTelemetry. These epoch versions
would essentially be a manifest pointing to a tested, documented, and stable set
of components that meet project stability requirements.

This is not a trivial undertaking, to be clear. It is also not as well-defined
as the earlier proposals in this blog -- those efforts will communicate many of
the requirements these epoch releases must follow, after all. To our maintainers
and contributors, though, a _non-goal_ of this effort is to force you to change
your versioning or release cadence.

## Looking Forward

These changes are a reflection of the impact and importance of OpenTelemetry to
the cloud native software community.
[OpenTelemetry has been the second highest velocity project in the CNCF over the past few years](https://www.cncf.io/wp-content/uploads/2025/04/CNCF-Annual-Report-2024_v2.pdf),
and
[nearly 50% of surveyed cloud native end user companies have adopted the project](https://www.cncf.io/wp-content/uploads/2025/04/cncf_annual_survey24_031225a.pdf).
These changes are setting up the next chapter of our success, and becoming truly
ubiquitous.

Our goals as a project are not changing, but our priorities are.

1. Stability and usability for all developers and users.
2. Clear packaging, installation, and usage paths.
3. Predictability and consistency.

For contributors and maintainers, what does this mean? We'll fast-track
proposals that align with these priorities. If there's feature work or
instrumentation that doesn't align to this, that's fine -- we'd ask that you
work on it outside the project and discover where our existing integration
points and patterns don't work; That's good feedback, and will help us improve
the specification for everyone.

For maintainers, contributors, and integrators -- we would appreciate your
feedback in
[this GitHub Discussion](https://github.com/open-telemetry/community/discussions/3098)
on the topics and proposals raised here. You can also send feedback on this
proposal to [feedback@opentelemetry.io](mailto:feedback@opentelemetry.io) or on
the CNCF Slack in the #opentelemetry channel. We also look forward to meeting
the cloud native community in person at KubeCon this fall -- please join us
there with comments!
