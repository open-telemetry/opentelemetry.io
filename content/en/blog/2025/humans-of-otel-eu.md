---
title: The Humans of OpenTelemetry - KubeCon EU 2025
linkTitle: Humans of OTel EU 2025
date: 2025-05-07
author: >-
  [Adriana Villela](https://github.com/avillela) (Dynatrace)
sig: End User SIG
# prettier-ignore
cSpell:ignore: adriel aiml alolita aronoff damien danielson eZ3OrhxUAmU gutierrez hanson ho horvitz jacob liatrio marylia mathieu mikko omlet perkins sdlc sharma telecom viitanen youtube
---

We're back with our fourth edition of
[Humans of OpenTelemetry](/blog/2024/humans-of-otel-na-2024/), this time from
KubeCon EU in London, UK. Once again, [Reese Lee](https://github.com/reese-lee)
and I interviewed OpenTelemetry contributors and end users, and learned how they
got involved with OTel:

- [Marylia Gutierrez](https://github.com/maryliag) (Grafana Labs)
- [Adriel Perkins](https://github.com/adrielp) (Liatrio)
- [Hanson Ho](https://github.com/bidetofevil) (Embrace)
- [Jamie Danielson](https://github.com/JamieDanielson) (Honeycomb.io)
- [Mikko Viitanen](https://github.com/mviitane) (Dynatrace)
- [Damien Mathieu](https://github.com/dmathieu) (Elastic)
- [Jacob Aronoff](https://github.com/jaronoff97) (Omlet)
- [Alolita Sharma](https://github.com/alolita) (Apple)

Also, special thanks to:

- [Reese Lee](https://github.com/reese-lee), my co-interviewer
- [Henrik Rexed](https://github.com/henrikrexed) for providing the audio and
  video recording equipment, and doing the initial edits of the raw footage

You can watch the full recording here:

{{<youtube eZ3OrhxUAmU>}}

<br/>Thanks to everyone who has contributed to OpenTelemetry to date. We look
forward to your continued contributions in 2025 and beyond! 🎉

## Transcript

If reading is more your thing, check out the following transcript of our
conversations.

### 1- Meet the Humans of OTel

**MARYLIA GUTIERREZ:** My name is Marylia Gutierrez. I'm a staff software
engineer at Grafana Labs. And I also work on a few different groups on
OpenTelemetry.

**ADRIEL PERKINS:** My name is Adriel Perkins. I'm a principal engineer at a
consulting company in the United States called Liatrio. We're both an end user,
but I'm also a contributor in the OpenTelemetry project. I'm co-lead of the
CI/CD SIG., with Dotan Horvitz, a CNCF Ambassador. And we work in the Collector
as well as well as the specification repository.

**HANSON HO:** My name is Hanson Ho and I do Android stuff. Specifically
observability Android stuff, at Embrace.

**JAMIE DANIELSON:** My name is Jamie Danielson. I'm an engineer Honeycomb, and
I work on instrumentation libraries and OpenTelemetry.

**MIKKO VIITANEN:** I’m Mikko Viitanen. I work as a product manager for
Dynatrace. Then I'm also a maintainer in the OTel Demo App.

**DAMIEN MATHIEU:** I am Damien Mathieu, and I do many things at OpenTelemetry.
I am a maintainer for OpenTelemetry Go. I'm also a code owner for everything
profiling on the Collector. And I'm an approver, for the eBPF profiler.

**JACOB ARONOFF:** My name is Jacob Aronoff. I am the CTO at Omelet. We're a new
startup that does observability, telemetry pipelines, and OpenTelemetry very
generally.

**ALOLITA SHARMA:** Hi, everyone. I'm Alolita Sharma, and I lead, AIML at Apple,
for observability engineering, and observability infrastructure.

### 2- How did you get involved in OpenTelemetry?

**MARYLIA GUTIERREZ:** I started in OpenTelemetry I had actually been working on
the observability world for a little while, and eventually you end up finding
out about OpenTelemetry, and you find that this is, like, a really cool way to
work and do not have dependency.

**ADRIEL PERKINS:** My first involvement with in OpenTelemetry was actually, I
got asked to look at an observability enterprise solution, and that was when I
discovered OpenTelemetry, and specifically the Collector. This discovery was
because we had a lot of different data sources from different places, and we
wanted to centralize them so that you could get a holistic view. So that was my
like, first introduction when I was finding OpenTelemetry and its Collector. And
I said, this stuff is really, really, really cool.

**HANSON HO:** Embrace looked to see how it could better serve the community. So
OpenTelemetry was an obvious thing to look at being an open framework folks
contribute to Common Standard. So when I saw it, I was like, this is great. This
is kind of what we need. So we had a proprietary SDK collecting proprietary
signals sending to our own servers. With OpenTelemetry were able to expand where
we send this data to open source open Collectors, without changing, you know, a
ton of stuff in the, the guts of the SDK. So when I started looking at it, I was
like, hey, look at mobile. Mobile's great. And at that point, not a lot of
people were looking at mobile world of OpenTelemetry with few exceptions. And I
think now even like since a year or so that I've been involved, things have
grown a lot, and a lot more interest. So, I'm really happy to get involved.

**JAMIE DANIELSON:** When I started at Honeycomb in 2021, the team that I was on
started working on OpenTelemetry more, and working through observability and
instrumentation libraries. So I started working on the Collector and a little
bit of Java before sort of settling into OpenTelemetry JavaScript. And so I've
been there, you know the last three years, becoming an approver and more
recently a maintainer of the project.

**MIKKO VIITANEN:** I started with OpenTelemetry around three years ago, and I
started, doing small contributions to the OTel Demo App. And I found that’s a
great place to learn the basics of instrumentation and a little bit of the
Collector, configuration and, and kind of I found the Demo App actually provides
a little bit of everything around code and hands on. So I find it well.

**DAMIEN MATHIEU:** I was working at a different company in an observability
team, and, I was rather frustrated because I had a hard time. I was convinced
already that we should not just be using logs, but we should also do tracing and
therefore use OpenTelemetry. And it was very hard to convince some of our folks
in engineering there at the time. And so kind of as a New Year resolution in
2022, I decided that I would start watching the OpenTelemetry Go repository and
start contributing. And one thing led to another. And, a year later, I got a
full time job working on OpenTelemetry.

**JACOB ARONOFF:** I started my OTel journey at Lightstep, my former employer. I
started on the telemetry pipelines team, working with, some amazing contributors
to the OTel ecosystem. I started on the Kubernetes side of things with the
OpenTelemetry Operator, working on upgrading the target allocator, which does
horizontally sharding of, scrape targets for Prometheus, for the Collector. Very
technical, but very important part of the ecosystem.

**ALOLITA SHARMA:** I got started, with OpenTelemetry more than six years ago
now. And I was at the AWS at that time, and I've been always very involved in
open source projects all the way from the beginning Linux. And, in my journey in
the cloud native world, as I was building, platform services at AWS, we decided,
you know, to build out a new generation of Kubernetes native, services. And, it
was really exciting that we took the opportunity to get involved, as a team in
all the, new shiny of open source observability projects. And, of course,
OpenTelemetry was at the forefront. This is, right after OpenTracing and
OpenCensus got together and combined to form OpenTelemetry, and, it was an
exciting you know, change to now see this beautiful brand new project with all
contributors from both two projects combining together and, getting new
contributors like me involved.

### 3- What does observability mean to you?

**MARYLIA GUTIERREZ:** Observability, to me, means that you are able to find the
things that you didn't even know that you wanted to know, because you have a lot
of information. But just having information doesn't mean anything, if you don't
know how to interpret. So is a as like they say that it actually comes from like
mechanic engineering. That was just trying to understand like the system where
you can just extrapolate this for everything. So finding a way to understand
everything from your system can even bring to your life observability,
understand what is going on.

**ADRIEL PERKINS:** What does observability means to me personally? It enables
me to find things out that I didn't know and improve. And I've always been
someone who loves continuously learning and continuous improvement and
observability is the thing that helps me do that, because there's a lot of
things that I don't know. I think the more that I find out that I do now, the
more I realize there's more things I don't know. So observability has really
helped me to, like, discover that. Both the technical level of like various
different applications and services. But it's also helped me do that in the
socio technical aspect. Right. So, the, the telemetry that I've been able to
find and discover as part of, just like software development lifecycle has
enabled me to be a better engineer. And so it's just help for discovery in
general for myself.

**HANSON HO:** Observability. I mean, to to boil Hazel Weekly's definition, it's
about asking questions and getting answers, specifically ones that you didn't
really think needed to ask initially, then doing something with that. Being able
to act and learn from your data. It's not just telemetry. It's about. It's about
understanding, your system through data.

**JAMIE DANIELSON:** Observability means having insights into your system. It's
about understanding how your applications work, how your systems are working,
and having visibility into things you don't even know necessarily are important
until something comes up. So being able to find, you know, those unknown
unknowns in your services and be able to make sense of things that maybe don't
make sense otherwise.

**MIKKO VIITANEN:** I actually associated that many years back... I was working
with the telecom networks and yeah, observability was was really, really
crucial. So consider you make a phone call from here or for example for US. And
the call goes through the ends of nodes and even multiple operators. So so
without observability you couldn't pinpoint the problems. So the customer calls,
hey, why why are my calls dropped? So definitely you have to you have to have a
really strong observability in order to find out what's happening and, and
pinpoint pinpoint the issues.

**DAMIEN MATHIEU:** Before working on observability, I worked for many years on,
I guess, SRE roles or equivalents. I've also done like incident management and,
like, yeah, I've been an incidents commander as well. So I've been in many
incidents trying to figure out its root causes. Very hard to figure out because
it's on a Sunday morning and things like that. And yeah, I don't want to have to
go through that again. And, working on observability ensures that, if, if I go
back to being an SRE and like, operations role, things should be better. And if,
if [...], they should be better for others.

**JACOB ARONOFF:** For me personally, it is understanding what is going on in
your system at any given time. I think of observability generally as, you know,
knowing the health of your running servers. The analogy that I use is when
you're driving a car, you have a dashboard in front of you that has, you know,
lots of instruments, lots of measurements that are telling you if you're
operating the car effectively. Observability is the same thing. But for servers
at a much, much larger scale than a single car.

**ALOLITA SHARMA:** Observability, means a lot because I think that, you know,
Observability as a discipline, especially for cloud native infrastructure and
applications, is a very essential part of guaranteeing that your applications
and your infrastructure observable they work. And in the, you know, as a
software engineer, especially as a distributed systems engineer, if you are
looking in building applications, and using cloud native infrastructure, whether
that is public cloud or, you know, non-public cloud on prem, Kubernetes based
infrastructure, you are, inevitably, dealing with and working with a lot of
complex microservices, which is absolutely essential for you to have
observability baked into your application as well as your infrastructure day
one. And, in the case of observability, as it stands today, it’s not, only
collection of telemetry, which we have, you know, literally trillions and
trillions of petabytes of data being generated by not only applications but
models now as well as infra and but also, looking at how the whole solution
works, in terms of storage, performance, analysis, as well as visualization.

### 4- What does OpenTelemetry mean to you?

**MARYLIA GUTIERREZ:** To me, OpenTelemetry means that is you don't have to have
the dependency on anyone and is also about the community. So it's a way for
everybody to work together that you normally find your competitor, but actually
you work together. You go to a meeting or do pair programming, and you just want
to see the... that community to grow. You want to see people be able to solve
their problems just by working all together.

**ADRIEL PERKINS:** What does OpenTelemetry mean? So many things, because it
does so much. And having been able to touch all the different parts has, has
really given this this huge meaning to me, but it's really like it to me, it
means that it's the central thing in any observability stack. If I have
OpenTelemetry, then I can go figure out exactly the things I need to do. No
matter what vendor I'm using as a backend.

**HANSON HO:** I think OpenTelemetry is, an opportunity for everybody to kind of
work together, in, you know, maybe slightly different goals, but working, on the
same thing that will achieve it for everyone. I believe it's it it is important
to have an open standard so we speak the same language. We need a lingua franca,
for a for observability. Instead of using proprietary things that really don't
add a ton of value. [...] Talk the same language. Maybe you will use the
different ways to put things together. Let's agree on the vocabulary. Let's
agree on the letters. And I believe OpenTelemetry gives us an opportunity so we
can all understand each. other without having to literally be behind the same,
you know, platform wall.

**JAMIE DANIELSON:** OpenTelemetry is sort of special to me. Obviously I've been
involved in OpenTelemetry for a few years, but I love this idea of this vendor
neutral standard that people can use, that everyone sort of benefits from the
standard being there and everyone is contributing from all over the place. From
vendors, from end users to different people in the community who are passionate
about it. And it's sort of like being around a lot of friends and people who
work really hard and hold each other accountable and just try to make the best
of this project. And I love the idea of, vendors are competing on their
baguettes and competing on the features that they have in their products, and
it's less difficult for end users to just instrument their applications just to
get, visibility into their system without having to deal with a different agent
if they decide they want to switch to another vendor. It's just very open and a
lot easier for people to use.

**MIKKO VIITANEN:** OpenTelemetry, personally, I feel it's it's such a great
example of an open source project, but we are in a competitive industry and, and
having so many companies, like +100 companies contributing to OTel and solving
common problems and collaborating every day. So it's it's it feels really
amazing. I feel it's, it's it's about community and collaboration.

**DAMIEN MATHIEU:** To me. I think it's, not just about like, solving
engineering problems, but, I think really, like the global community is
extremely nice and welcoming. I think it's extremely impressive what we have
been able to succeed doing. Like having a common and shared understanding of how
things should work across over 15 languages with very different, different needs
and problems and ways of solving problems depending on the languages and the
fact that as human beings, we have been able to solve that is extremely,
encouraging, I think. And I would also add that's, it's, I think it's extremely
rare in the current environments to see like multiple companies, competitors
aligned together to build something so that they can all be more, like, provide
better value together rather than just, like, stick to their own little corner.
And so that's, that's kind of, the huge things are great things I find about
OpenTelemetry.

**JACOB ARONOFF:** OpenTelemetry to me is the way that we get all of that data.
Right? It's, it's this really vast ecosystem of people who have agreed that
there should be one way to do something, you know, that is new, generic to the
field. Back to that car analogy. You know, you don't learn how to drive a Nissan
or a Volvo. You learn how to drive a car. Right. And so in the same way that
when you're learning how to engineer, it's important for there to be standards
so that you don't have to relearn everything. Every time you go to a different
company. And to me that is what OpenTelemetry means.

**ALOLITA SHARMA:** So OpenTelemetry, has almost 80 repositories today on the
project. And, as many of you may know, OpenTelemetry is a very large project. It
is, not only a collection of components, but also an amazing community in terms
of the, partnerships and the collaboration that, vendors and end users work
together on, in terms of solving technical challenges and building the best
components in OpenTelemetry. So to me, OpenTelemetry is not only an integral
part of building collection architectures for cloud native applications, but it
is also an amazing community where you actually see the use of interoperability,
across the different components in the project, as well as open standards such
as the OpenTelemetry protocol being, implemented end to end, which really is a
game changer for the industry. OpenTelemetry protocol. The reason I call that
out is because, it really enables end users to be able to build solutions for
observability, end to end and use observability out of the box without having to
think about, oh, what's my protocol going to be for metrics or logs or traces or
profiles at all of the data that we collect? Right. But open. I love
OpenTelemetry as a project and as a community. And, love working on all the
different pieces I worked on. I focused on working on the Collector. Collector
contrib components, where we have added integrations, improving the operators
for OpenTelemetry Collector, adding more metrics, performance features such as
the targets allocator improvements in the operator, and also working on
improving tracing, and logging.

### 5- What's your favorite OpenTelemetry signal?

**MARYLIA GUTIERREZ:** My favorite telemetry signal... I still like metrics. I
know that you will start to find out a little bit about traces, but I find that
metrics is still almost like the gateway for the signals, because it's very
simple to explain to people. It’s a number. Then on top of the number you can
add, for example, attributes and get more data on top of it. So this way people
don't get scared with like a big trace or big span as soon as you start, but
it's a way to at least get more people into this area. And then from that, you
can kind of grow on top of that.

**ADRIEL PERKINS:** Favorite telemetry signal. That's such a hard things that to
pick one because you can combine them so well. I think I started off as having
metrics as my favorite because they were the thing that I looked at first when
it came to the SDLC. But as I've gotten more into traces and tracing pipelines
and all that stuff, I just realized how powerful it was. And then I can just
derive, like any of the signals from those, those traces, and I can embed them
directly in there. So I think I have to say right now, tracing is my favorite.

**HANSON HO:** Well, traces really is the most powerful. So I would now pick
that because you can. Yeah. Let's go spans. Yeah let’s go spans.. Love spans.
Span Man.

**JAMIE DANIELSON:** My favorite OpenTelemetry signal is probably going to be,
traces. I really like traces. I like the idea of starting in one place in your
application, starting in one service, and seeing a request go from end to end
service to service, and get an understanding of how that is flowing, that you
might not otherwise have visibility into because it's a full connected trace.
So, yeah, traces. Traces would be my favorite signal I think.

**MIKKO VIITANEN:** My favorite, telemetry signal. It's, they are all the all
important, but I mostly I, I would select distributed traces. I find it special
because with the single view, single waterfall view, you can easily get the
overview. You can pinpoint problems. So if your if your request gets rejected,
you can quite often see it's already promising. The view. That what was the
service causing the reject. Or if your if your request is returned really
slowly. Or the system is running really slowly. You can see how each service is
adding up, just from the distributed trace. So that's lots of insight.

**DAMIEN MATHIEU:** Oh, my colleagues are going to hate me for. It's, but it's
it's tracing. And I'm saying that because, I work on profiling a lot, and the
people that I work with really live and, yeah, think by profiling, I think both
are very important. But profiling is more like for, whatever you don't,
everything works fine. And you want to improve things. And tracing is for,
things are broken, and you need to figure out why. And, that's kind of how I
came into OpenTelemetry. And that's kind of my own work experience. So that's
why my favorite signal is tracing.

**JACOB ARONOFF:** My favorite telemetry signal by far is tracing. Tracing is,
you know, the best of every world, in my opinion. You can derive metrics, you
can derive logs, you can do lots of really important visualizations that help
you understand both, you know, the high level observability goals that you might
have, as well as the really low level debugging that you might have to do. It is
the most important one, and I think the most misunderstood as well.

**ALOLITA SHARMA:** My favorite telemetry signal, I would say top of my list
today. And that's metrics and traces. And the reason I say that is because when
you're looking at, observability real time, especially for AI applications, you
know, in the new generation of applications coming in, tracing is very valuable,
along with profiling, to be able to understand, you know, model behavior as well
as, software application behavior. And combined with metrics, you know, which
actually are usually the standard way of getting telemetry and understanding of
your infrastructure systems, it provides a very nice way of actually providing
an end to end view of, observability and observable components, all the way up
the stack.

## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the
  [#otel-sig-end-user channel](https://cloud-native.slack.com/archives/C01RT3MSWGZ)
  on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our [OTel in Practice](/community/end-user/otel-in-practice/) sessions
- Share your stories on the [OpenTelemetry blog](/docs/contributing/blog/)
- Contact us on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
  for any other types of sessions you'd like to see!

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry),
[Bluesky](https://bsky.app/profile/opentelemetry.io) and
[LinkedIn](https://www.linkedin.com/company/opentelemetry/), and share your
stories using the **#OpenTelemetry** hashtag!

And don't forget to subscribe to our
[YouTube channel](https://youtube.com/@otel-official) for more great
OpenTelemetry content!
