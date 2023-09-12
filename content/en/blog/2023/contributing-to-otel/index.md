---
title: Thinking about contributing to OpenTelemetry? Here's how I did it.
linkTitle: Contributing to OTel
date: 2023-09-08
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Adriana Villela](https://github.com/avillela) (Lightstep),
canonical_url: https://medium.com/cloud-native-daily/how-to-contribute-to-opentelemetry-5962e8b2447e
cSpell:ignore: EUWG, nolan, riaan, sayin, servian
---

![Sunset over the water over an orange sky, with long grass in the foreground.](turks-sunset.jpg)

Are you an [OpenTelemetry](/) (OTel) practitioner? Have you ever wanted to
contribute back to OpenTelemetry, but didn't know where to begin? Well, my
friend, you've come to the right place!

Drawing from my own personal journey, I'd like to offer some valuable insights
into effective ways I've discovered for initiating involvement in this thriving
and inclusive open source community.

## Contributing to open source can be SCARY!

Let's face it. Most of us use open source projects in our day-to-day tech jobs
(Or maybe side hustles?). But what about _contributing_ to these open source
projects? I don't know about you, but for me, up until last year, the prospect
of contributing to open source was just plain _scary_!! I mean, when you open up
a
[pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
(PR),
_[you are putting yourself out there](https://oncallmemaybe.com/episodes/adventures-in-open-source-software-with-riaan-nolan-of-servian)_,
to be judged by those little GitHub avatars that make up the approvers list for
the repository you're contributing to. YIKES!

But as scary as the thought of opening a PR might be, it's also SO VERY
SATISFYING to see your contributions merged into a codebase. And most
importantly, your contributions can help others!! How cool is that?

## Ways to contribute to OTel

Okay. Are you feeling pumped now? Awesome. Let's look at some of the ways to
contribute to OTel.

### **Contribute to the OTel Docs**

Are you new to OTel? Are you a bit apprehensive about contributing code to an
open source project? No sweat! One of the best and easiest ways to contribute to
OpenTelemetry (or to any open source project, for that matter) is to contribute
to the docs!

Whenever I need to dig into a new OTel concept, I always turn to the docs for
guidance. Sometimes they have all of the info that I need, and sometimes they
don't. This usually means that I have to do a bit more digging beyond the docs,
by seeking out external blog posts, bugging techie friends, etc. Once I'm able
to fill that knowledge gap, I do two things:

1. I blog about it
2. I contribute to the OTel docs.

> ✨ **NOTE:** ✨ Number two is _especially_ important, because the best way for
> the OTel docs to be the Source of Truth for All Things OTel<sup>TM</sup> is to
> have folks like us contributing to the docs whenever we see a gap.

Learn more about contributing to the OTel docs
[here](https://github.com/open-telemetry/opentelemetry.io/blob/main/CONTRIBUTING.md).

### Write a post on the OTel Blog

Another great way to contribute to OTel is to write blog posts on the
[OpenTelemetry blog](/blog). If you've done something interesting in
OpenTelemetry, or have worked on a complex OTel implementation within your
organization, the OpenTelemetry blog is a great way to share that with the
community at large.

Learn more about submitting a post to the OTel blog
[here](https://github.com/open-telemetry/opentelemetry.io#submitting-a-blog-post).

### **Join the OTel End User Working Group**

Are you just getting started with OTel and want to connect with other OTel
practitioners? Do you have feedback that you wish to share with the greater OTel
community? Or perhaps you're a more advanced OTel practitioner and want to share
your story and/or use cases with the greater community? Then the OTel End User
Working Group (EUWG) might be just the place for you! This group is made up of
OpenTelemetry practitioners who come together a few times a month to:

- Share their feedback and ask questions through
  [OTel End User Discussions](/community/end-user/discussion-group/)
- Share their stories of OpenTelemetry adoption through
  [OTel Q&A](/community/end-user/interviews-feedback/)
- Share their knowledge on specific areas of OpenTelemetry through
  [OTel in Practice (OTiP)](/community/end-user/otel-in-practice/)

As an added bonus, I'm one of the co-chairs. Just sayin'… 😉

Learn more about the OTel EUWG [here](/community/end-user/).

### Contribute to the OpenTelemetry Demo

If you'd like to contribute code, but aren't quite ready to contribute to core
OTel code, then perhaps you might want to check out the
[OTel Demo](/docs/demo/). The OTel Demo includes a distributed online telescope
shop application with services written in multiple languages and is instrumented
with OpenTelemetry. It's a great way to learn about how to instrument code in
your chosen language.

[Per the OTel Demo docs](https://github.com/open-telemetry/opentelemetry-demo#welcome-to-the-opentelemetry-astronomy-shop-demo),
the purpose of the demo is to:

- Provide a realistic example of a distributed system that can be used to
  demonstrate OpenTelemetry instrumentation and Observability.
- Build a base for vendors, tooling authors, and others to extend and
  demonstrate their OpenTelemetry integrations.
- Create a living example for OpenTelemetry contributors to use for testing new
  versions of the API, SDK, and other components or enhancements.

The OTel Demo [just celebrated its first birthday](/blog/2023/demo-birthday/),
and it's come a long way since its first release. As OTel evolves, the OTel Demo
must also evolve alongside it, to ensure that it is utilizing the latest and
greatest versions of things like the [OTel Collector](/docs/collector/) and
language-specific instrumentation. In short, there's always work to be done!

As an example, you can check out one of my own contributions
[here](https://github.com/open-telemetry/opentelemetry-demo/pull/432).

Learn more about how to contribute to the OTel Demo
[here](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CONTRIBUTING.md).

### Join a Special Interest Group

Feeling a little more adventurous? Then why not join one of the other OTel
[special interest groups](https://en.wikipedia.org/wiki/Special_interest_group)
(SIGs)? By joining a SIG, you can contribute to things like (but not limited to)
SDK development, auto-instrumentation of libraries, the
[OTel Collector](/docs/collector/), and the
[OTel Operator](/docs/kubernetes/operator/). You don't even need to be a regular
contributor. Sometimes, contributions come out of necessity. Like maybe you
found a bug in the Collector. Why not take a stab at fixing it? Or maybe there's
a feature that you and your team desperately need. Again, why not take a stab at
implementing it?

Now, before you go off writing code, you should make sure that you:

1. Raise an issue in the
   [appropriate GitHub repository](https://github.com/open-telemetry)
2. Check with folks on
   [Slack](https://communityinviter.com/apps/cloud-native/cncf) to see if this
   feature is needed/wanted
3. Pop into one of the [SIG calls](https://shorturl.at/beJ09) and share your
   specific interests and needs

I'm under no illusion that any contributing code to OTel is is a trivial task.
Far from it. If you do end up contributing code, one way to alleviate the
stress/learning curve of doing it solo would be to pair with a willing OTel
community member to implement these types of code changes. I've found folks
within OTel to be nothing but helpful and welcoming.

Learn more about the OTel SIGs [here](/community/#special-interest-groups).

### Final thoughts

As we've seen, there are many ways to contribute to OpenTelemetry, whether it's
through docs contributions, blogging, joining the End User Working Group,
contributing to the OTel Demo, or joining a SIG. Anything helps!

There's no such thing as a small contribution, because every little bit adds up,
and helps make OpenTelemetry awesome.

As a final thought, I will always encourage folks to blog about the OTel
findings and discoveries. Obviously, I do that too. But please also share these
findings by contributing directly to the OTel docs and blog, to ensure that we
have a single source of truth, and so that everyone, whether they're new to OTel
or advanced practitioners, can benefit.
