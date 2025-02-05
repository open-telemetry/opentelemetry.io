---
title: Behind the scenes of the OpenTelemetry Governance Committee
date: 2024-08-15
author: '[Juraci Paixão Kröhling](https://github.com/jpkrohling) (Grafana Labs)'
issue: 5033
cSpell:ignore: triagers triaging
---

As a principal engineer at Grafana Labs, my focus is on OpenTelemetry: writing
code or maintaining OTel Collector components and tooling, helping out with our
recent security audit, and building bridges between people with similar ideas —
all with the ultimate goal of helping the OTel community, as a whole, succeed.

For nearly three years now, I’ve also been a member of the
[OpenTelemetry Governance Committee (GC)](https://github.com/open-telemetry/community/blob/main/community-members.md#governance-committee).
I was first elected in October 2021, and then re-elected in October 2023 for
another two-year term. OpenTelemetry’s GC members, along with the
[Technical Committee (TC)](https://github.com/open-telemetry/community/blob/main/community-members.md#technical-committee),
serve as the official maintainers of the project from the perspective of the
CNCF.

While the TC
[focuses on technical matters](https://github.com/open-telemetry/community/blob/main/tech-committee-charter.md)
— such as determining acceptable changes to the specifications, deciding on code
donations, and resolving technical disagreements — the GC
[takes on a more strategic role](https://github.com/open-telemetry/community/blob/main/governance-charter.md).
This involves defining the project’s overall roadmap and ensuring its continued
success from all perspectives, including our original goal of providing a
vendor-neutral instrumentation and collection framework.

I thought it would be useful to share a glimpse into the role and
responsibilities of a GC member, based on my personal experience. My hope is
this can help serve as a guide to select candidates in upcoming elections — and
to provide prospective candidates with more insight into the role. That said,
it's important to note that other GC members have different experiences and
responsibilities. While not every task or responsibility listed here happens
daily, each has occurred at least once over the past three years for me.

## Representing the OpenTelemetry project

I frequently attend and
[speak at conferences](https://github.com/jpkrohling/talks), participate in
podcasts, review blog posts, and engage with individuals from various companies.
This helps me understand OpenTelemetry from different perspectives — users,
library developers, potential contributors, and proponents of new project areas.
Representing the project requires a good grasp of its direction and helping
others while considering the project's best interests.

Being a representative is a multifaceted role. It involves not just public
speaking and writing, but also engaging in one-on-one conversations to
understand the needs and concerns of our community. This role has given me the
opportunity to network with industry leaders, learn about emerging trends, and
advocate for the adoption and advancement of OpenTelemetry.

There have been moments where I need to pause and reflect on the interests I
could be representing on a specific matter. I must make it clear in
conversations whether I am speaking as a Grafana Labs employee, an OpenTelemetry
Collector leader, a representative of the wider open source observability
ecosystem, or a GC member. It’s natural to have different perspectives depending
on the role I’m embodying, but it’s crucial to identify which "hat" I am wearing
during any given discussion, and to ensure that my opinions are appropriately
aligned with that role.

## Reviewing project policies

The OpenTelemetry project is like a living being, growing every day. As a GC
member, one of my responsibilities is to review and update our project policies
to ensure they remain relevant and effective. This involves identifying gaps in
our current policies, drafting new ones when necessary, and updating existing
ones to reflect the evolving needs of the project.

Two key areas I’ve worked on are our
[community values](https://github.com/open-telemetry/community/blob/main/mission-vision-values.md)
and naming policy recommendations for external projects and components.
Reviewing our values ensures we promote desired behaviors and discourage
negative ones, fostering a collaborative and respectful environment.
Additionally, we establish naming policy recommendations for projects and
components in our ecosystem to prevent confusion among our end users and ensure
our terminology is clear and distinct. This helps maintain the integrity and
coherence of the OpenTelemetry project.

## Sponsoring SIGs

[Anyone can propose](https://github.com/open-telemetry/community/blob/main/project-management.md)
a new
[SIG (Special Interest Group)](https://github.com/open-telemetry/community/blob/main/README.md#special-interest-groups)
in OpenTelemetry. These groups are dedicated to advancing a specific part of the
OTel project, such as new signals, language SDKs/APIs, or semantic conventions.
Proposals need two sponsors: one from the TC and one from the GC. Being a GC
member means staying informed about current and proposed SIGs and sponsoring
initiatives that are essential to the project's future. Sponsorship isn’t just a
formality; it involves active participation in SIG meetings and discussions,
and, ideally, contributing through coding, documentation, or issue triaging.

Sponsoring a SIG is a rewarding experience. It has allowed me to nurture
innovative ideas and help them grow into integral parts of the OTel project.
Being involved from the inception of SIGs like Profiling, Security, and
Contributor Experience has also given me a unique perspective on the challenges
and triumphs of new initiatives. Some SIGs need only a few reviews and ideas
about how to best navigate the community, while others require more active work
in recruiting team members or implementation.

## Check-ins with SIG maintainers

A relatively new process in the OpenTelemetry community is the
[GC monthly check-in](https://github.com/open-telemetry/community/blob/main/gc-check-ins.md)
with SIG maintainers. Each GC member was asked to pick about 4 SIGs, and then
act as a liaison between those SIGs and the GC. Once a month, I ask SIG
maintainers from Collector, Operator, Security, and Go Autoinstrumentation
questions, such as:

1. Do you have any specific issues within your SIG that would require GC
   intervention?
2. Are you happy with the current balance of
   contributors/triagers/approvers/maintainers?
3. What’s one thing the GC can help with to make your life easier?

These responses are confidential, and maintainers know they can approach me with
any problems, like when there’s a conflict between community members. While I
can’t promise to solve every issue, I am committed to working towards
resolutions. These check-ins provide a structured way to ensure every SIG is
heard and supported. They also help identify patterns or recurring issues that
might need broader GC attention.

## GC meetings

GC members attend a
[weekly call](https://docs.google.com/document/d/1-23Sf7-xZK3OL5Ogv2pK0NP9YotlSa0PKU9bvvtQwp8),
and also have the option to attend an annual in-person leadership summit. We
hold specification and project triage sessions at different times to accommodate
various time zones.

These meetings are essential to align our efforts and make strategic decisions.
Despite the challenges posed by time zones, the dedication of GC members ensures
we maintain a cohesive and effective governance structure. The annual leadership
summit, though optional, provides a valuable opportunity for in-depth
discussions and team building.

## Conflict mediation

Every community has its challenges, and OpenTelemetry is no exception. With
people from diverse backgrounds and varying personal and professional interests
working together, conflicts are inevitable. As a GC member, I actively mediate
community conflicts, listen to multiple perspectives, take notes during
meetings, and draft documents summarizing my understanding of the situations.

While conflict mediation isn’t my favorite task, addressing these issues is
crucial for the project's future. Ignoring conflicts in the hope they will
disappear is not an option. Mediation involves not only resolving disputes, but
fostering a culture of open communication and mutual respect. By doing so, we
ensure that our community remains a welcoming and productive environment for all
contributors.

## Reflections on the role

Over the past three years, I’ve had the privilege of serving on the
OpenTelemetry GC. I’m fortunate to work for a company that supports this role
allowing me to dedicate my full-time efforts to OpenTelemetry. This enables me
to carry out these tasks as part of my regular workday.

I have had some personal conflicts, however. A few times, I considered not
running for re-election so I could focus more on my engineering contributions to
the project. I have to admit that I still struggle to find the right balance
between my GC responsibilities and my engineering work. However, one thing has
become very clear to me over these past three years: more important than my
individual contributions is ensuring that my efforts can scale. This means
mentoring the next generation of potential leaders in the OpenTelemetry
community, and thoroughly documenting my activities so others can take over
those tasks.

By sharing my experience, I hope prospective candidates will better understand
the GC role and be able to answer a crucial question posed by a former GC
colleague: "What do you expect to do on the GC that you can’t do as a regular
contributor?" While this role might seem demanding, we need individuals from
diverse areas of the ecosystem who are committed to the success of the project,
even if they can only dedicate a few hours per week. I do believe that being
part of the GC should be part of your day job, but it certainly doesn’t need to
be your full-time job.

I also hope this post provides voters with insights into which qualities to look
for in candidates during the next GC elections. Choosing the right candidates is
vital for the continued success and growth of OpenTelemetry. Look for
individuals who are not only technically competent, but demonstrate leadership,
empathy, and a commitment to the community.
