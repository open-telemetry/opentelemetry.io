---
title: Introducing OTel Blueprints and Reference Implementations
linkTitle: Blueprints and Reference Implementations
date: 2026-05-05
author: '[Dan Gomez Blanco](https://github.com/danielgblanco) (New Relic)'
---

Most end users adopting OpenTelemetry at any scale past the [Getting Started][1]
ask themselves the same question at some point: _"Why is this stuff so
complex?"_. One needs to care about SDK config (and multiple ways of
implementing it), multiple Collector deployments, data pipelines,
instrumentation libraries, semantic convention registries, APIs for manual
instrumentation across many different programming languages, and many, many
other moving pieces.

To make matters worse, these moving pieces don't operate in isolation. They need
to work well together as integral parts of a consolidated solution to describe
an organization's software systems using standard, high-quality telemetry.
Failing to do so risks ending up with the very problem that OpenTelemetry was
designed to solve: disjointed telemetry with disparate semantic conventions in
use across the stack, lack of context propagated between services and signals,
unnecessarily high data volumes... In general, poor quality telemetry, the
opposite of what we want.

As the project evolved and stabilized, and as more end users adopted
OpenTelemetry in large-scale production environments, we kept hearing the same
feedback: end users want a prescriptive, opinionated way of "deploying
OpenTelemetry" (whatever that means), as recommended by the project and its
maintainers. They want to follow a set of steps to configure the components
_they_ need to solve _their_ observability challenges in the _simplest_ way, and
not more.

You spoke, and we listened. I'm pleased to announce a new initiative driven by
the End User SIG in collaboration with the Developer Experience SIG: [Blueprints
and Reference Implementations][2].

### What are blueprints, and why do we need them?

Let's go back to that first question we asked: _"Why is this stuff so complex?_.
Using the terms described by Fred Brooks in his paper titled [_No Silver
Bullet—Essence and Accident in Software Engineering_][3], written back in 1986,
the complexity of adopting OTel is two-fold: _essential_ and, sometimes,
_accidental_.

#### Essential complexity

The _essential_ part of OTel's complexity, the one inherent in its design,
mostly comes down to its breadth. OpenTelemetry touches nearly all parts of the
stack, from client-side (i.e. browser and mobile), to applications, Kubernetes,
infrastructure, databases, etc. Our documentation is great at explaining how
each of these individual components work, and new developments like [Declarative
Configuration][4] and the [Injector][5], or the long-existing [OpenTelemetry
Operator][6], have made it easier to apply a consolidated set of configuration
across all these components. However, the fact remains that this is still a very
large deployment surface and, in most cases, not handled by a single team.

OpenTelemetry is also designed to work with any backend, not limited to a single
solution. The old model of dropping a pre-built agent into your stack and seeing
data flow may be appealing to some, but it lacks the flexibility needed in
modern systems that need to remain data sovereign. OpenTelemetry's flexibility
puts end users in control of their own data, regardless of where that data is
generated and ultimately stored. However, this flexibility also brings with it
extra complexity. Resources like [Helm Charts][7] and [Distributions][8] can
facilitate having base configs that one can extend to cater to a given
environment, however the more flexible these become, the more complex, and we're
back to step one.

OTel can be _essentially_ complex when applied at scale, but normally for good
reasons.

#### Accidental complexity

The _accidental_ part of OTel adoption complexity comes from (you may have
guessed it) humans. When multiple teams start to organically adopt OpenTelemetry
across different parts of an organization, without a shared strategy and vision,
and with no communication between groups, standards suffer. Some team may be
configuring their SDKs with a configuration that's incompatible with the
Collector Gateway deployed by another team, or they may be propagating context
in a different way than the dependencies they call, breaking context propagation
for both.

And then, of course, there's AI, which generally does not help much in these
situations. We have all read stories of systems where entropy and complexity has
_accidentally_ grown uncontrolled as AI-assisted development adds a new file
here, a duplicated method there, or, in the case of OTel, a new way of
configuring and deploying a component. The result is a system that's neither
effective nor efficient at describing itself with high-quality telemetry.

This is not just limited to end users either, we have seen this happening within
OpenTelemetry too. We're a large project, with almost 5,000 individual
contributors just last year. There have been cases where we have multiple
workstreams aiming to solve very similar problems. This puts the end user in a
situation where they have to choose between one way or another for doing the
exact same thing.

#### The role of blueprints in taming complexity

The reality is that, as Fred Brooks stated, there's no "silver bullet". We
cannot simply eliminate the _essential_ complexity of modern observability
tooling and just say _"this is the one and only way to deploy OTel"_, as every
environment and organizational structure is different. However, we can certainly
aim to make sense of the breadth of the project to help those navigating OTel
adoption, and together keep that _accidental_ complexity at bay!

This is where OTel Blueprints come in. The structure of these blueprints is
based upon best practices in strategic thinking. The primary focus is on
identifying the most critical challenges to solve in a particular environment,
and scope our solutions to those alone, removing any additional complexity that
does not get us closer to said solutions.

With OTel Blueprints, we aim to categorize the most common observability
challenges that organizations face across different environments, and propose a
set of general guidelines paired with specific steps to implement those
guidelines. For instance, there are many common challenges that end users aim to
solve by providing a consolidated SDK config and Collector Gateways in
Kubernetes environments, instrumenting infrastructure and applications in
non-Kubernetes environments, or monitoring Kubernetes clusters along with
well-known control plane workloads.

For end users (AI-assisted or not), blueprints will provide a set of challenges
with which they can identify, and immediate, actionable guidance on how to
approach them across many components, all working together as part of a
consolidated strategy. Maintainers will also be able to use blueprints as a way
to identify any possible friction in adoption which could be further simplified.

### What can you expect from a blueprint?

OTel Blueprints will not rewrite existing documentation. You will not see a
blueprint that tells you how to configure an SDK, or how to deploy a Collector
in its different deployment patterns. That's already well covered within our
docs.

Blueprints will tie together all the different aspects related to deploying
consolidated OpenTelemetry solutions across different components. Their goal is
to provide a holistic approach that readers can use to inform their
observability strategies, and point to documentation related to specific
components needed to implement it.

We will soon be publishing blueprints under the new [Blueprints][13] section of
our website. However, in the meantime, we can use our standard [blueprint
template][9] to explain what you can expect from the future blueprints that will
follow it.

In essence a blueprint will have the following building blocks:

- **Summary**: As an end user, you will be able to quickly see if you may be the
  target audience for this blueprint, or if it applies to your environment.
- **Common Challenges**: The common challenges that a blueprint aims to solve in
  a particular environment. It scopes the problem. If something is not
  identified as a problem to solve, the blueprint will not propose a solution
  for it (although other blueprints may do so).
- **General Guidelines**: The best practices and design patterns that will solve
  the Common Challenges previously identified. You can expect architecture
  diagrams here, and a clear vision of how it all fits together.
- **Implementation**: The list of actions to implement the General Guidelines,
  pointing to relevant existing documentation.

We don't expect a single blueprint to solve everyone's needs. Instead, we want
to scope the problems to solve in applicable chunks that deliver tangible value
to end users, and connect between each other. Some expected relationships
include:

- **Overlaps**: Some blueprints may contain the same design pattern as needed in
  their guidelines, e.g. deploying a Collector Daemonset.
- **Extends**: A blueprint may clearly call a specific problem to solve as out
  of scope, e.g. audit logging, in which case another blueprint will extend it
  for that use case, and possibly others.
- **Relates to**: In general, blueprints may be related to each other, e.g. a
  blueprint for Kubernetes observability may require a central Collector Gateway
  proposed in another blueprint.

These types of relationships are represented in the diagram below:

```mermaid
flowchart TD
    A[Blueprint A]
    B[Blueprint B]
    C[Blueprint C]
    D[Blueprint D]

    A -.->|Extends| C
    B -.->|Relates to| D

    A <-->|Overlaps| B
```

Lastly, you can also expect blueprints to evolve over time. As tooling evolves,
the way to approach a specific problem may change, and blueprints will continue
to reflect the simplest and most efficient way of doing it.

### Reference implementations

Blueprints do not come out of the blue (seriously, no pun intended). They are
contributed by experts in the field, end users and solution/observability
architects that have experienced these challenges first hand and can share
design patterns that work at scale.

The nature of blueprints is to be useful to the largest group of individuals and
organizations as possible. As such, there needs to be a certain degree of
generalization, grouping experience from many end users into a single narrative.
However, we think it's crucial that blueprints are grounded on fact, and not
simply theoretical advice. From the start, we wanted to have blueprints backed
by evidence in the form of reference implementations.

Reference implementations are snapshots in time that show how real-world
organizations have approached OpenTelemetry adoption. They will naturally
implement some (or all) of the advice in one (or many) blueprints..

```mermaid
flowchart BT
    %% Define the nodes
    BA[Blueprint A]
    BB[Blueprint B]
    BC[Blueprint C]

    RA[Reference Imp A]
    RB[Reference Imp B]
    RC[Reference Imp C]

    %% Define the relationships
    RA -->|Implements| BA
    RB -->|Implements| BA
    RB -->|Implements| BB
    RC -->|Implements| BB
    RC -->|Implements| BC
```

You may have already seen some of these reference implementations being
published as blogs on our website. [Mastodon][10], [Adobe][11], and
[Skyscanner][12] have already shared how they've approached OpenTelemetry
adoption across their environments. This work has been expertly driven by the
Developer Experience SIG, supporting those end users in sharing their stories,
and has cemented much of the way for OTel Blueprints to be successful. I would
like to personally say thanks to the DevEx SIG for this initiative!

These, and other reference implementations, will soon be published in the new
[Reference implementations][14] section in our website. We have also put
together a standard [template][15] to facilitate end users sharing their stories
in the future. The more, the merrier!

### Now more than ever, we want your input!

As you've seen, all this work would've not been possible without end users
giving their feedback, sharing their adoption journeys, contributing their
expertise to the project, and ultimately helping to shape the future of
observability.

However, end users, we are again calling for your support. Firstly, to give any
feedback you may want to contribute on the three blueprints in progress, which
are the current focus of the End-User SIG: [instrumentation for infrastructure
and processes in non-Kubernetes environments][16], [Kubernetes
observability][17], and [centralized telemetry platform][18].

Secondly, and most importantly, to share your experience! We would like to have
many other reference implementations across different industries and
environments, and proposals for new blueprints helping other end users adopt
best practices in observability. You can see [how to contribute][19] to this
effort in our documentation.

This is your chance to make your end user journey a part of OpenTelemetry!

[1]: /docs/getting-started/
[2]: /docs/guidance/
[3]: https://en.wikipedia.org/wiki/No_Silver_Bullet
[4]: /docs/languages/sdk-configuration/declarative-configuration/
[5]: https://github.com/open-telemetry/opentelemetry-injector
[6]: /docs/platforms/kubernetes/operator/
[7]: /docs/platforms/kubernetes/helm/
[8]: /ecosystem/distributions/
[9]:
  https://github.com/open-telemetry/sig-end-user/blob/887e20c58849d583e2e25bc25ef93ea146ce1d78/architecture/blueprint-template.md?plain=1&from_branch=main
[10]: /blog/2026/devex-mastodon/
[11]: /blog/2026/devex-adobe/
[12]: /blog/2026/devex-skyscanner/
[13]: /docs/guidance/blueprints/
[14]: /docs/guidance/reference-implementations/
[15]:
  https://github.com/open-telemetry/sig-end-user/blob/c483a44b12e95c093e0a8b0d7542d470e82ff7fc/architecture/reference-implementation-template.md?plain=1&from_branch=main
[16]: https://github.com/open-telemetry/sig-end-user/issues/245
[17]: https://github.com/open-telemetry/sig-end-user/issues/247
[18]: https://github.com/open-telemetry/sig-end-user/issues/246
[19]: /docs/guidance/#how-to-contribute
