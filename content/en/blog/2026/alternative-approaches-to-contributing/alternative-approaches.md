---
title: Beyond the good first issue - How to make your contributions sustainable
linkTitle: Beyond the good first issue
date: 2026-03-20
author: >-
  [Diana Todea](https://github.com/didiViking) (VictoriaMetrics),
  [Elizabeth Mathew](https://github.com/Elizabeth-Mathew1) (Signoz)
sig: End-User SIG
cSpell:ignore: CLOTributor devex Signoz Todea
---

## Beyond the good first issue: how to make your contributions sustainable

OpenTelemetry provides the tools and standards to collect metrics, logs, and traces
from applications and services. Getting started with contributions can feel overwhelming,
so here are some lessons from hands-on experience.

Most guides explain how to find a “good first issue,” fork a repository, or join a SIG meeting.
That advice is useful, and many resources cover it well. What often receives less attention is
the broader context around contributing: understanding the ecosystem, navigating community dynamics,
and building long-term engagement in a large open-source project.

These aspects are especially important in OpenTelemetry, where development happens across many repositories,
SIGs, and organizations. For newcomers, and particularly contributors from underrepresented backgrounds,
this context can make a meaningful difference. When the unwritten rules of collaboration and decision-making are not visible,
it’s harder to know where to start, participate confidently, or grow from occasional contributor to long-term member.

This guide focuses on that deeper layer: going beyond the “first contribution” checklist to help you
understand how the OpenTelemetry community works and find your place within it.

## Context and community

Before diving into a specific repository, explore the broader cloud native
ecosystem. What observability tools are evolving? Where are the gaps? Which
projects influence OpenTelemetry adoption? Strategic contribution starts with
context. Platforms like [CLOTributor](https://clotributor.dev/) help you
discover "good first issues" across cloud native projects, not just within one
organization. This allows you to position yourself where your skills are most
impactful.

Be aware that "good first issues" are highly competitive and often get claimed
within hours of being posted. If you can’t find one, shift your strategy:
instead of waiting for the perfect issue, become an active part of the community
through SIG calls and Slack discussions, and look for ad hoc tasks where you can
make yourself useful. 

Initiatives like
[Merge Forward](https://community.cncf.io/merge-forward/) support
underrepresented groups in open source, providing mentorship,
visibility, and access that many engineers lack in traditional corporate
environments. OpenTelemetry exists within this larger CNCF ecosystem that
actively works to lower participation barriers.

OpenTelemetry actively supports inclusive participation through mentorship programs,
localization groups, and asynchronous collaboration, helping contributors from diverse backgrounds engage on equal footing.

Contribution becomes more meaningful when you understand how projects and
communities connect.

## Contribution is more than code

![Graph showing the most popular pages in OTel](graph-contributions.webp) Graph
showing the most popular pages from the [OpenTelemetry.io](/docs/) website
starting with January 2026 up to March 2026

A pull request is not just a code change. It is discussion, feedback and
alignment with project direction. Maintainers, approvers, and SIG members guide
priorities. Reading issue threads and PR discussions teaches you how decisions
are made and where real friction exists. That awareness makes your contributions
stronger.

For engineers from underrepresented groups, visibility and sustained
participation matter. OpenTelemetry’s public Slack channels, SIG meetings, and
End User discussions are open entry points into real technical conversations.
These spaces allow contributors from different geographies, languages, and
backgrounds to participate in shaping observability standards.

Participation happens through a mix of synchronous and asynchronous channels.
While SIG meetings are important, many decisions also happen in GitHub issues, pull requests,
and Slack threads, letting contributors engage across time zones.
The project supports localization groups and community-driven documentation improvements,
helping contributors from different language backgrounds participate and extend the reach of observability tooling globally.

Non-native English speakers can actively contribute by improving phrasing, simplifying complex language,
or helping with translations. Localization groups and documentation efforts are powerful ways to make OpenTelemetry more accessible worldwide.

These mechanisms are not perfect, time zone differences and language barriers remain,
but they provide multiple entry points for engagement: joining meetings, contributing
asynchronously on GitHub, or helping improve documentation and translations.

Non-code contributions go beyond documentation and blogs. You can
volunteer for note-taking in SIG meetings, help organise community events like
the OpenTelemetry Community Day at KubeCon, or join the Contributor Experience
SIG, which focuses on making the project better for all contributors. Some
examples of these SIGs are: **otel-sig-end-user**, **otel-devex**,
**opentelemetry-new-contributors**, **otel-contributor-experience**,
**otel-docs-localization**. Your contribution track is also fluid, i.e.,
starting with documentation does not lock you in; you can switch to code
contributions as you learn more, or vice versa. All contributions count and are
welcome.

If you do not see people like you in the room, that is not a signal to withdraw.
It is an opportunity to participate.

## Tips for beginners

Start small. Documentation improvements, examples, test fixes, localization, and
developer experience feedback are valuable. The codebase evolves quickly, and
things change often. Do not be discouraged by that.

Your background is leverage. If you are an SRE, platform engineer, backend
developer, or DevRel professional, you understand production realities. You know
where documentation feels unclear and where automation breaks. That insight is
practical and needed. Community context matters as much as technical skill.

Background also goes beyond technical roles. Non-native English speakers can spot unclear phrasing,
uncommon words, or ambiguous explanations and help simplify or localize them.
Contributors with accessibility needs often identify gaps in documentation, tooling, or processes, improving readability, navigation, and inclusivity.

These contributions, often overlooked, are just as critical as writing code, they shape the experience for everyone in the community.
In large open-source communities, these perspectives matter as much as technical skill.
Improving clarity, accessibility, and usability strengthens the ecosystem and enables broader participation.

Let’s talk about a pain point that’s very common across most of CNCF’s Slack
channels. Not being able to get feedback or PR reviews. If you do not get
reviews right away, be patient. Most maintainers have a day job in addition to
maintaining the project, so delays are normal. You can always post a message in
the corresponding Slack channel with enough context so that anyone can pick up
the review. Use this time to review any other open PRs yourself and gain a
broader understanding of the codebase.

## Who to talk to

Engage with maintainers, SIG members, senior contributors and approvers. They
shape direction and review work. Observing their discussions accelerates
learning.

The End User SIG actively seeks practitioner feedback. Contributing through
interviews and discussions can influence the project beyond code. For many
contributors, especially those outside dominant tech hubs, these channels create
visibility and meaningful participation. Trust grows through consistency.

## Understand the pieces

OpenTelemetry includes SDKs in multiple languages, the Collector,
instrumentation libraries, and protocols such as OTLP, gRPC, and HTTP.
Understanding how these components interact gives you perspective.

Emerging initiatives like
[OTel Injector](https://github.com/open-telemetry/opentelemetry-injector) and
[OTel Weaver](https://github.com/open-telemetry/weaver) focus on automation and
simplifying telemetry configuration. Contributing to newer efforts can be
impactful because you influence adoption patterns early. Another domain is
language SDKs for PHP, Ruby, Erlang, and Rust, which often have only a couple of
maintainers and could use extra hands. The eBPF auto-instrumentation project
(OBI) is a newer frontier that allows capturing telemetry data at the kernel
level without modifying application code. If you are interested in low-level
programming or Linux kernel tech, this is a great place to contribute.

Thinking beyond a single repository strengthens your contribution strategy.

## Official documentation: a starting point

The official documentation provides the foundation. Contributing to clarity,
examples, and localization improves accessibility and adoption. Some specific
areas are currently under-resourced and could use more contributors.

[Documentation](/docs/contributing/localization/) localisation is a major need;
some language communities, like Japanese and Chinese, have been very active in
translating OpenTelemetry docs, but others have barely started. If you are
fluent in any language besides English, you can make a big difference by
contributing to localisation efforts. When documentation exists in more
languages and reflects real-world use cases, it expands who can participate.

Localization contributions have outsized impact: improving examples,
simplifying phrasing and translating documentation allows global contributors to learn and engage more effectively.

## Setting up a local sandbox

Hands-on exploration builds confidence. Clone repositories, run tests, modify
instrumentation, and experiment with telemetry pipelines. Practical
experimentation complements community engagement.

## Expanding your knowledge

Structured learning deepens understanding. CNCF learning resources and courses
offer curated materials that guide learners through these concepts step by step.
In addition, the Linux Foundation
[OpenTelemetry Certification](https://training.linuxfoundation.org/certification/opentelemetry-certified-associate-otca/)
provides a practical way to validate your knowledge while reinforcing core ideas
about telemetry pipelines, instrumentation strategies, and observability
architecture across the ecosystem. Learning, contributing, and teaching
reinforce each other.

## Making contributions sustainable — an example

Starting is simple. Staying engaged is what creates impact.

Sustainable contribution means choosing a focus area, attending SIG meetings, reviewing work,
mentoring newcomers, and sharing knowledge. It is about consistency, not one large code change.
Many contributors drop off after a couple of contributions. Aligning your contributions with what
excites you helps build a realistic routine: weekly or monthly contributions, attending SIG meetings
(even as a listener), tracking GitHub updates, and staying active in Slack. Curiosity and learning drive consistent engagement.

Long-term consistency builds credibility and influence, especially for underrepresented contributors, where visibility matters.

OpenTelemetry offers a visible and structured pathway for growth. For
engineers from underrepresented groups, this matters. It provides credibility,
influence, and community recognition beyond traditional corporate hierarchies.

You do not need to be perfect. You need to participate. Be curious. Think
ecosystem. Use tools like CLOTributor to explore opportunities. Connect with
initiatives like Merge Forward if you need support. Diversify how you contribute
and stay consistent.

The ROI of contributing can also be significant, both personally and
professionally. You will gain a deeper understanding of how instrumentation,
tracing, and metrics work under the hood. You will interact with engineers from
companies across the industry, and these connections can lead to job
opportunities and collaborations. Many contributors also find fulfillment in
paying it forward to the open source community that has benefited them.

OpenTelemetry is a global collaboration. There is space in it for you.

## Resources

1. Diana Todea -
   [The Unofficial Guide to Contributing to OpenTelemetry — where to look and who to talk to!](https://medium.com/@dianatodea/the-unofficial-guide-to-contributing-to-opentelemetry-where-to-look-and-who-to-talk-to-9de04ae75fe0)
2. Elizabeth -
   [6 Things I Learned About OpenTelemetry Contribution (That the Docs Won't Tell You)](https://newsletter.signoz.io/p/6-things-i-learned-about-opentelemetry)
