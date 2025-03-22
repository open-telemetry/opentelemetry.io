---
title: OTel Sucks (But Also Rocks!)
date: 2025-04-03
author: '[Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)'
cSpell:ignore: Kovalenko Liatrio Moessis Olly Pismo
---

OpenTelemetry (OTel) is often touted as the future of observability, promising
vendor neutrality and comprehensive data collection. But what's the reality for
those who use it daily? We sat down with several engineers and SREs to get their
unfiltered thoughts on OTel. The result? A candid conversation about the good,
the bad, and the sometimes frustrating aspects of working with OTel.

In preparation for the KubeCon talk
[OTel Sucks (But Also Rocks!)](https://sched.co/1txHm), Juraci spoke with
community members and gathered a wealth of valuable insights. Due to time
constraints, not all the material could be included in the presentation, so this
is an attempt to do justice to the community's contributions.

## Where OTel Falls Short

In their unfiltered thoughts on OTel, engineers and SREs shared common
challenges they faced. Elena from Delivery Hero highlighted the "absence of a
stable collector version" and the "quick pace of change" as significant pain
points. These frequent updates necessitate tedious checks and testing to
maintain production stability.

James from Atlassian and Alexandre from Pismo expressed frustrations caused by
changes to semantic conventions. These changes can break existing dashboards and
require significant effort to update instrumentation across large systems.
Alexandre particularly mentioned the difficulty of directing the entire company
to change attributes, which developers were not pleased about.

Adriel from Liatrio pointed out that "instrumentation is hard" and that getting
started can be overwhelming due to the sheer volume of information and options.
He also mentioned the challenge of moving people past the initial hurdle of
manual instrumentation. James also discussed the "magic" of the Java agent,
which while powerful, can sometimes lead to unexpected issues that are difficult
to debug.

All interviewees agreed that there is a learning curve associated with OTel,
especially when it comes to understanding the collector, configurations, and
semantic conventions. Adriel noted that "it took me a lot of conceptual overhead
to understand it." Alexandre also mentioned that the documentation, while
improving, could still benefit from more examples.

## Why OTel Rocks

Despite the challenges, our interviewees also acknowledged OTel's significant
benefits.

For instance, Alexandre from Pismo emphasized the importance of vendor
neutrality. OTel allows them to consolidate all their data and switch to any
vendor they want, without being locked into a specific ecosystem.

James from Atlassian praised OTel's modular design, which allows users to
replace small modular bits if something isn't working. This flexibility is
especially crucial for power users who need to customize their setups.

Elena from Delivery Hero shared how transformative it was to move from logs to
distributed tracing with OTel. She described the experience of going back to
logs as "inefficient." James also highlighted how the Java agent provides an
"incredibly never-seen-before picture" of monolithic applications.

Adriel, who is deeply involved in the OTel community, emphasized the value of
open source and the ability to contribute. He noted that "once you push people
past the point of it being hard and getting started with it the first time, it's
like it's a breeze after that and it's super powerful."

Alexandre from Pismo shared a compelling story of how implementing tail sampling
with OTel drastically reduced their observability costs. They were able to
optimize resource allocation and avoid over-scaling their collectors.

Finally, Alexandre highlighted the role of OTel in bringing standardization to
their observability practices. Before OTel, they had a mix of vendor-specific
libraries and internal collectors, leading to inconsistencies and broken traces.
OTel provided a "single library, a single standard" that significantly improved
data quality.

### It’s about the Community!

The OpenTelemetry community is highly regarded by its members, with Adriel
Perkins describing it as his first experience of being actively involved in open
source, largely due to the enjoyable interactions with the people. He highlights
the presence of many bright, kind, and helpful individuals who are always
willing to offer guidance. The community members are also noted for their
experience, which Adriel believes has personally helped him develop as an
engineer. Furthermore, the community is characterized by being super helpful,
passionate, and excited about the future of the project. While members may be
direct at times, they are generally cordial and kind.

James Moessis also points out that contributors can expect their code to be
reviewed by dedicated individuals within the community, and that the developers
are receptive to contributions. The existence of a contributor experience survey
indicates the community's commitment to understanding and improving the
contributor experience. Overall, the community fosters a supportive and
collaborative environment where members can learn and grow.

## The Verdict

Our interviews revealed a complex relationship with OTel. It's not a perfect
solution, and it comes with its fair share of challenges. However, for those
willing to navigate the complexities, OTel offers powerful capabilities and
significant benefits. As James from Atlassian put it, "When OTel does suck, the
good thing is that it's designed in a way that doesn't suck so that you can
replace little modular bits here and there."

Ultimately, OTel's value lies in its flexibility, vendor neutrality, and the
deep insights it provides into complex systems. While there are growing pains
and areas for improvement, OTel is undoubtedly a powerful tool for
observability.

We'd like to thank Elena Kovalenko, James Moessis, Adriel Perkins, and Alexandre
Magno for sharing their honest and insightful experiences with OpenTelemetry.
Their stories provide valuable perspectives for anyone considering or currently
using OTel.
