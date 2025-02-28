---
title: The Humans of OpenTelemetry
linkTitle: Humans of OTel
date: 2023-12-22
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
# prettier-ignore
cSpell:ignore: alex aronoff bogdan boten caramanolis constance dapr drutu jacob juraci kanal kröhling paixāo purvi tyler utopic villela yahn youtube
---

What a year it has been for OpenTelemetry!
[The OTel Demo turned 1](/blog/2023/demo-birthday/),
[the OpenTelemetry project announced general availability of the OpenTelemetry specification](https://youtu.be/OEGgmTNfYsU?si=ZdjNwLbGTrWIVs1D&t=288),
[Trace-Based Testing was added to the OTel Demo](/blog/2023/testing-otel-demo/),
we saw some [exciting](/blog/2023/tyk-api-gateway/)
[OTel](/blog/2023/cloud-foundry/) [integrations](/blog/2023/otterize-otel/), and
let's not forget how we had not one, but TWO Observability Days in 2023 - one
for [KubeCon Europe in Amsterdam](https://shorturl.at/osHRX), and one for
[KubeCon North America in Chicago](https://shorturl.at/kAEQX). Those are only a
few of the highlights! Many more were featured in past releases of
[OpenTelemetry in Focus](/blog/2023/otel-in-focus-break/).

None of this would've been possible without the awesome humans behind
OpenTelemetry. Whether you're a maintainer, contributor, or practitioner, we
want y'all to know that what you do matters!

And so, to wrap up 2023, I interviewed some of the folks who have been involved
with OTel, both past and present:

- [Tyler Yahn](https://github.com/MrAlias/)
- [Amy Tobey](https://github.com/tobert)
- [Ted Young](https://github.com/tedsuo)
- [Carter Socha](https://github.com/cartersocha)
- [Bogdan Drutu](https://github.com/bogdandrutu)
- [Constance Caramanolis](https://github.com/ccaraman)
- [Juraci Paixāo Kröhling](https://github.com/jpkrohling)
- [Jacob Aronoff](https://github.com/jaronoff97)
- [Alex Boten](https://github.com/codeboten)
- [Purvi Kanal](https://github.com/pkanal)

Special thanks to [Reese Lee](https://github.com/reese-lee) for the camera work!

You can watch the full recording here:

{{%youtube coPrhP_7lVU%}}

<br/>Thanks to everyone who has contributed to OpenTelemetry to date, and we
look forward to your contributions in 2024! 🎉

## Transcript

If reading is more your jam, check out the transcript of our conversations
below.

### 1- Meet the Humans of OTel

**TYLER YAHN:** I'm Tyler Yahn. I am a maintainer for the
[OpenTelemetry Go SIG](https://github.com/open-telemetry/opentelemetry-go).
We're working on some
[auto-instrumentation](https://github.com/open-telemetry/opentelemetry-go-instrumentation/)
there, and
[specification](https://github.com/open-telemetry/opentelemetry-specification/).

**AMY TOBEY:** I'm Amy Tobey. I am senior principal engineer for digital
interconnection at Equinix. I maintain a tool called
[OTel CLI](https://github.com/equinix-labs/otel-cli).

**ADRIANA VILLELA:** Oh, you maintain the OTel CLI!

**AMY TOBEY:** Yeah, that's my project. Yeah. So that mostly just has Traces
right now. And I've been meaning to implement Logs and Metrics for a while and I
think like Logs just went GA recently, so it's time to do it. But Traces have
been so effective and people really like it that I haven't really had a lot of
demand for them.

**ADRIANA VILLELA:** Is the OTel CLI part of OpenTelemetry?

**AMY TOBEY:** It's not yet. I maintain it on our Equinix Labs GitHub account.
It's not a lot of process. Mostly it's just me with a few folks like Alex and
others that throw me a PR every now and then. But I've thought about bringing it
back to the community. But I'd have to maybe be not as so far away from the
standards as I am right now because doing it in the command line, a lot of the
standards don't really translate very well. So I've strayed a little bit away
from the standards in a few places. It would make sense. And I've talked to
Austin about it.

**ADRIANA VILLELA:** Hey, I've got Ted Young with me! Hello!

**TED YOUNG:** Hello!

**CARTER SOCHA:** I'm Carter Socha. I work on a couple different things. I'm one
of the few product managers floating around, but I helped start the
[OpenTelemetry Demo](/docs/demo/), which I'm a maintainer of. I also work in the
[SIG security](https://github.com/open-telemetry/sig-security), which helps the
project improve their security response process.

**BOGDAN DRUTU:** My name is Bogdan. I took a break for parental leave so I'm
just jumping back. Okay, what were you doing before? I done a lot of things,
including member of
[TC](https://github.com/open-telemetry/community/blob/main/tech-committee-charter.md),
member of
[GC](https://github.com/open-telemetry/community/blob/main/governance-charter.md),
maintainer of
[Collector](https://github.com/open-telemetry/opentelemetry-collector). I was a
former maintainer of
[Java](https://github.com/open-telemetry/opentelemetry-java), so I've done a
lot.

**CONSTANCE CARAMANOLIS:** Hi. I'm Constance Caramanolis.

**ADRIANA VILLELA:** I know that you were involved in OpenTelemetry and you are
one of the OG contributors. Tell us about that involvement.

**CONSTANCE CARAMANOLIS:** Yeah, so I worked on the OpenTelemetry Collector. I
contributed to that. I did a lot of config things. I was also on the
OpenTelemetry Governance Committee. So I did a lot of the start, we were doing
the incubation process, starting a whole gathering process, a POC, a lot of
putting processes in place, getting adoption. Quite a few talks. KubeCon
talks...

**JURACI PAIXĀO KRÖHLING:** My name is Juraci. I'm a software engineer and I've
been working with OpenTelemetry systems or Observability for a few years now. I
come from a Tracing background, so I was a maintainer on
[Jaeger](https://www.jaegertracing.io/). I was part of OpenTracing back in the
day and I helped choose the name of the project that we have. And right now I'm
a Collector developer. I help out on some components for OpenTelemetry
Collector. And I'm also part of the Governing Committee for OpenTelemetry.

**ADRIANA VILLELA:** And newly re-elected, right?

**JURACI PAIXĀO KRÖHLING:** I was just re-elected, yes.

**JACOB ARONOFF:** My name is Jacob Aronoff. I am a maintainer for the
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
project.

**ALEX BOTEN:** Hi, I'm Alex and I'm a contributor and maintainer in
OpenTelemetry. I wrote a book about OpenTelemetry. I don't know what else. I do
stuff with OTel. Cool. I am a contributor and maintainer of the OpenTelemetry
Collector and the
[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)
repository and I have been spending a lot of time in various SIGs and specialty
working groups around
[configuration](https://github.com/open-telemetry/opentelemetry-configuration)
and security. And previously I spent a bunch of time maintaining and
contributing to
[Python](https://github.com/open-telemetry/opentelemetry-python).

**PURVI KANAL:** Hey, my name is Purvi. I am a senior software engineer. I
worked over my career a lot with browsers and JavaScript.

### 2- What does Observability mean to you?

**TYLER YAHN:** Yeah, that's a great question. Personally, I think Observability
means that when you woke up at 2:00am to go fix a problem, you can fix it. And
ideally, the next day you're able to look at that code again and find out a way
to never have that problem exist. I think that's really what it means to me.

**AMY TOBEY:** It means being able to look at things coming out of the box and
tell what's going on inside parts. Very convenient.

**TED YOUNG:** First of all, it's monitoring… But really, Observability is this
nebulous term, but it did show up as part of a sort of shift in how we are
thinking about monitoring our system. And I would say that shift is the way we
used to do it was you had these different signals, you needed logs, so you had a
logging system, you needed metrics, you made a metric system, you needed
tracing, but you didn't know what that was, so you didn't do it. And instead of
having these three separate, totally siloed systems, what we've been doing over
the past couple of years, especially in the OpenTelemetry project, is trying to
say it's really bad for these three things to be separate. Or the four things,
if you include profiling.

When you're using these tools, you use them together, you're moving back and
forth between them, right? Like you get an alert based off of a metric that you
set up. But when that alert goes off because errors or something spiked, the
next thing you want, is to look at the logs that are in the transactions that
are causing these alerts. You want to look at the logs that are in a particular
transaction. You really want to have a trace ID stapled to all those logs, so
you can actually look them up. So we want to actually use all these tools
together.

And in order to use all of these tools together, you need to have the data
coming in, the telemetry actually be integrated, so you can't have three
separate streams of telemetry. And then on the backend, be like, I want to
cross-reference. All of that telemetry has to be organized into an actual graph.
You need a graphical data structure that all these individual signals are a part
of. For me, that is what modern Observability is all about.

It's about having all this data connected into a graph in such a way that we can
leverage the machine to do what they're good at, to reduce the amount of time we
need to spend investigating issues. Instead of being like, I wonder if this is
the problem. Therefore I am going to collect all the logs and grep through them,
try to whittle it down to something. I'm going to look at all the config files
myself, try to figure out what's going on. You can just quickly get an answer to
a lot of those questions and then move on to the next hypothesis.

The amount of time you save with modern Observability, I think, changes how we
actually practice, and that's an ongoing trend. But with OpenTelemetry going,
effectively going GA this year, with tracing, metrics and logs now stable, yes,
finally, only like two years late anyway. But the fact that we have that now,
the fact that we now have telemetry that has all of these correlations baked
into it, you're going to start seeing a new wave of analysis tools, all the
existing ones out there, but also new ones being built, that leverage the fact
that this data is available and that it's like a standard data format, kind of
proprietary data format, stable data format. You can rely on it.

So it's like okay to build your giant platform on top of this data or build some
kind of like boutique analysis tool that just does one thing and does it really
well. That's where I see it all going. And that's what Observability means to
me.

**CARTER SOCHA:** What does Observability mean to me… It means like, an
application owner can see what's going on in their environment, and answer
pertinent questions to them about their business and how they can improve their
service.

**BOGDAN DRUTU:** Observability is an overloaded term in our days, but it means
the capability of monitoring and determining when something goes wrong in your
production environment.

**CONSTANCE CARAMANOLIS:** Observability means… what does it mean to me? I use
it as a tool to kind of making sure that things are working the way you want.
It's getting insight into black boxes or even white boxes. I view it more as you
kind of see things, but you have a lot more questions from it, and then you use
Observability to actually figure out what's going on. So I like to call it
murder mystery, usually.

**JURACI PAIXĀO KRÖHLING:** That's a good question. I think… not going to be
strict on a definition, I think what this really means is it is a way for us to
understand what a problem… we have a problem in our system… we should be able to
answer or to determine what is going wrong or what's happening. And it doesn't
matter if it comes from logs or metrics or training, as long as we can tell and
understand what's going on. I think that's when we can say we have
Observability. And it's not a yes or no. It is a spectrum. I don't expect to
have Observability, perfect Observability from day one, but I am expected to
have some sort of telemetry that helps me understand what's going on. So I think
telemetry is like a path to getting perhaps utopic place where we understand
everything about our systems.

**JACOB ARONOFF:** What does Observability mean to me… I think Observability is
understanding what's happening inside of your applications. Maybe what's
happening in the code you care about. Yeah.

**ALEX BOTEN:** Oh my goodness. It means everything. Observability is life. I
think Observability means that when something goes wrong, I can ask a question
about my system and get a sense of what is happening without having to know
ahead of time what to expect. Like I can just go and dig into my data and my
services are instrumented well enough. Not like not perfectly, but well enough
that I can just figure out what happened. And can I reproduce this thing that
happened in probably production off in my own environment so that I can improve
my code to manage it better next time.

**ADRIANA VILLELA:** I like what you said about not instrumented perfectly.
There is no such thing as perfect instrumentation. That's a lie. Just like
there's no such thing as done code, right?

**ALEX BOTEN:** That's also a lie. Or that the network will never break. That's
a lie.

**PURVI KANAL:** Oh, that's such a good question. To me, Observability it's
really about being able to get curious with your data and be able to have a lot
more confidence about your production system. So being able to kind of squash
things before they arrive. Testing in production is the best way to test your
system because no matter what people say, Prod is always its own different
animal. And if you have really good Observability, you can test in Prod. It's a
much better experience for your users and for your developers too.

### 3- When did you get involved with OTel?

**TYLER YAHN:** I got involved in 2019, I think.

**ADRIANA VILLELA:** Oh, so like early?

**TYLER YAHN:** Early, yeah, I was not at the original meeting, but yeah, I got
in really early. I really love writing Go, and so that's where I started. But I
was pretty quick into the specification and started working in that space and I
think it was just coming from the pain point of using have to run systems. And
being that person who has woke up at 2:00am. I wanted a better software solution
for this and I think that I saw the value in it and I jumped in.

**ADRIANA VILLELA:** We work in pain and trauma, right?

**TYLER YAHN:** Yeah, exactly.

**AMY TOBEY:** When I was hired into Equinix, they hired me to instrument their
entire stack for the Equinix Metal product. So that's what I worked on for my
first year. This was like three years ago, before all the fancy
auto-instrumentation stuff was complete, adding instrumentation to all of our
systems.

**ADRIANA VILLELA:** So you are an OG user of OpenTelemetry.

**AMY TOBEY:** A little bit.

**CARTER SOCHA:** The team I was working on at Microsoft, at least my org at
least, was already doing a lot in the OpenTelemetry space, and that seemed to be
where all the cool things were happening. And so that kind of got my interest.
And then I got switched to working with a development team that was focused
solely on OpenTelemetry, both for external purposes and internal purposes,
because Microsoft uses OpenTelemetry really heavily internally. And so that's
what got me introduced. And when I started looking around, wondering where I
could start, I realized there was no real good example of how to use
OpenTelemetry in the wild. And so that was a problem that I thought every vendor
might have. And something we could solve together as a community, and we have.

**ADRIANA VILLELA:** How long have you been working on OpenTelemetry?

**BOGDAN DRUTU:** Since the beginning.

**ADRIANA VILLELA:** So like 2019 or like, pre?

**BOGDAN DRUTU:** Even pre.

**ADRIANA VILLELA:** Did you start out with Ted in the… pre days?

**BOGDAN DRUTU:** No. Actually, there were two competing projects that merged
into OpenTelemetry.

**ADRIANA VILLELA:** Right.

**BOGDAN DRUTU:** So I was on the other project.

**ADRIANA VILLELA:** Which one, OpenCensus?

**BOGDAN DRUTU:** Yeah.

**PURVI KANAL:** I got involved with OpenTelemetry through working at Honeycomb.
So I got involved with it, and I have a particular interest in
[OpenTelemetry JavaScript](https://github.com/open-telemetry/opentelemetry-js),
and especially the browser side of OpenTelemetry JavaScript. It's really great
to be involved with it.

### 4- What does OTel mean to you?

**TYLER YAHN:** I think OpenTelemetry is, I mean, it's a standard, I think it's
a collaboration across the entire Observability space. And it is, I think, a
path forward for all of instrumentation. The idea that you don't have any vendor
lock-in, the idea that you can just take one code base and always have some way
to look into a system, I think the future of how we're going to make software
better in the long term.

**AMY TOBEY:** OpenTelemetry makes my life easier, because I can integrate it
with open source components that I'm using, or proprietary components. And at
the end of the day, all of the OpenTelemetry flows through to my Observability
vendor, and I can see traces across all of my products that I use in one space.

**BOGDAN DRUTU:** It is my project… of soul.

**CONSTANCE CARAMANOLIS:** I think OpenTelemetry gets really biased, but I feel
like it's a really good combination of a lot of different views finally coming
together, actually making the previously hard advancements easier, like
gathering the data. The hard part is actually making sense out of it. And so
they're finally coming together. It's worked out pretty well. in terms of
collaboration to get metrics, traces, and logs.

**JURACI PAIXĀO KRÖHLING:** Oh, that's a deep question… On a technical side, it
means OpenTelemetry for me is a set of tools that would help me get telemetry
data out of my typical application. Sometimes also infra. But OpenTelemetry
really is the tool that I can use in a vendor neutral way, get data out of my
application so that I can get into that into that utopic thing. If I had perfect
instrumentation, then I can get into a utopic place. But OpenTelemetry provides
me the tools that I need to gradually get into that. Now, it does stop at a very
specific place, in a sense, which is as soon as you send data out, that's where
OpenTelemetry stops. That's where you get to the vendor or to the open source
tools that provide the database, visualization tools, and so on. But a more
deeper aspect, OpenTelemetry is where I have my colleagues, people that I work
on a daily basis for a few years. Yeah. That's what OpenTelemetry is for me.

**JACOB ARONOFF:** OpenTelemetry is Observability backed by everybody. It's not
a single vendor. It's letting you do the thing that is agnostic to where you
send the data. In the same way that you don't have to relearn how to drive a car
every time you step into a new car. You don't have to learn how to ride a bike
based on the vendor of the bike that you buy from. You should be able to
instrument your code no matter where you send that data. So that's how I sell
it. That's how I think about it.

**JACOB ARONOFF:** The other benefit is we as the maintainers, we have a lot of
our maintainers here and approvers here, so we can collaborate and work together
to figure out what's really needed in the next coming months. I described it
almost like summer camp. There are some people where, oh, I haven't seen you in
a few months. How you been? It's catching up.

**ALEX BOTEN:** Like, I mean, OTel has been amazing. The project itself has been
wonderful. It's one of the first projects to take a bunch of standards and
condense them down into less standards. We took OpenCensus, OpenTracing, we
brought [Prometheus](https://prometheus.io/) to the table. The
[Elastic Cache format](/blog/2023/ecs-otel-semconv-convergence/) is there.
OpenTelemetry just is a wonderful community, that's all. Trying to make things
better in the Observability landscape by working across vendor boundaries, which
has just been something that I've never done in the past. I've never worked in
an open source project where so many vendors are involved and so many end user
communities are involved, and it's been great.

**ADRIANA VILLELA**: Yeah. And that's what I like personally about
OpenTelemetry, because everyone plays nice and I feel like it's a very
deliberate, "No, we are not going to favor one vendor over another." And if a
vendor tried to showboat, then it's pretty much shut down, which I think is
great.

**ALEX BOTEN:** We've just had a lot of really good folks at all the levels of
the project trying to push everybody in the right direction, which I really
appreciate. I'm going to give a shout out to Ted Young for, especially being one
of those people that always just, he's over there somewhere. I can see him just
like looking around. He has no idea we're talking about him.

**PURVI KANAL:** OpenTelemetry to me is really all about the community. Like
communities being able to take ownership of their own telemetry data, because
vendors should not be determining the type of telemetry data that gets sent to
your systems. Because Observability about your system is so personal to your
system. And when you have vendor lock in or lock in through, like, the
instrumentation of vendors, it can be very limiting.

### 5- What's your favorite telemetry signal?

**TYLER YAHN:** That's a good question. I wish I had a good, nuanced answer
there. Like, I don't know… metrics, I've known for the longest, I guess. But I
think traces are probably a little closer because you get a lot more depth into
operational behavior. So, yeah, I think I'd probably go with traces. It's also a
little bit more automatic for you. You really have to understand what those
metrics are and build them into something. Versus tracing, can show you based on
just the structures they come with. So, yeah, I'll go traces.

**AMY TOBEY:** Oh, it's traces, of course.

**TED YOUNG:** My favorite signal… Probably be the
[Bat-Signal](https://en.wikipedia.org/wiki/Bat-Signal). If that thing could go
on every time a system goes down, I would be happy.

**CARTER SOCHA:** So I think I've heard this reference around… and I truly
believe it. Traces are just the cooler version of logs. Like, it's like logs
with a mustache, and maybe a top hat. Because essentially a span is just a log,
but a trace-correlated log. So I'd probably say traces, but my backup answer is
log.

**BOGDAN DRUTU:** Signal? I think the most… I like metrics. I think we did try
to change the way how metrics were done before, and we may not have been the
most successful yet, but we are getting there. But it was a necessary change,
and I feel like it changed something in the way how things were done. For
tracing, I mean, we didn't change too much from other Dapr paper or other
things, but for metrics, I think we changed.

**CONSTANCE CARAMANOLIS:** I love traces, especially because you could… My
favorite example is when I used to do… when I was at Lyft and I would get paged
in the middle of the night… One service, four deep… everything was going…
Everything between that and the front was getting paged. You were able to
actually figure out, like, okay, this one's the cause. Instead of overly
thinking about it. That's what I love about it. It's very different paradigm
than what we're used to talking about.

**JURACI PAIXĀO KRÖHLING:** Trace. Come on. They're beautiful. No, it is.
Traces.

**JACOB ARONOFF:** Traces. Number one. They are the easiest to work with. They
are so simple to get started, and they're just so much more useful than anything
else. So traces all the way.

**ALEX BOTEN:** Traces, because it's clearly the elegant log, but also you can
just get metrics out of it. It has, like, everything you need in a signal. It's
metrics and logs correlated with context. It's beautiful. They're magic.

**PURVI KANAL:** Oh, that's easy. It's tracing.

## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End-User Discussion Group calls](/community/end-user/discussion-group/)
- Join our [OTel in Practice](/community/end-user/otel-in-practice/) sessions
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)
- Contact us on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
  for any other types of sessions you'd like to see!

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[LinkedIn](https://www.linkedin.com/company/opentelemetry/), and share your
stories using the **#OpenTelemetry** hashtag!

And don't forget to subscribe to our
[YouTube channel](https://youtube.com/@otel-official) for more great
OpenTelemetry content!
