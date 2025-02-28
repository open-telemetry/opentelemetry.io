---
title: The Humans OpenTelemetry - KubeCon EU 2024
linkTitle: Humans of OTel EU 2024
date: 2024-06-15
author: >-
  [Adriana Villela](https://github.com/avillela) (ServiceNow),
issue: 4660
sig: End User SIG
# prettier-ignore
cSpell:ignore: adnan blanco bsfMECwmsm0 centralizations dyrmishi fintech jiekun mclean observability odegaard rahić reopelle sheeran skyscanner stackdriver tracetest vijay youtube
---

We're back with our second edition of
[Humans of OpenTelemetry](/blog/2023/humans-of-otel/), this time from KubeCon EU
in Paris. Once again, [Reese Lee](https://github.com/reese-lee) and I
interviewed OpenTelemetry contributors and end users, and learned how they got
involved with OTel:

- [Iris Dyrmishi (Miro)](https://www.linkedin.com/in/iris-dyrmishi-b15a9a164/)
- [Severin Neumann (Cisco)](https://github.com/svrnm)
- [Kayla Reopelle (New Relic)](https://github.com/kaylareopelle)
- [Morgan McLean (Splunk)](https://github.com/mtwo)
- [Henrik Rexed (Dynatrace)](https://github.com/henrikrexed)
- [Vijay Samuel (eBay)](https://github.com/ccaraman)
- [Daniel Gomez Blanco (Skyscanner)](https://github.com/danielgblanco)
- [Doug Odegaard (ServiceNow)](https://github.com/dodegaard)
- [Adnan Rahić (Tracetest)](https://github.com/adnanrahic)
- [Rynn Mancuso (Honeycomb)](https://github.com/musingvirtual)

Also, special thanks to:

- [Reese Lee](https://github.com/reese-lee), my co-interviewer
- [Henrik Rexed](https://github.com/henrikrexed) for providing the audio and
  video recording equipment, and doing the initial edits of the raw footage
- [Zhu Jiekun](https://github.com/jiekun) for assisting with his own camera

You can watch the full recording here:

{{%youtube bsfMECwmsm0%}}

<br/>Thanks to everyone who has contributed to OpenTelemetry to date, and we
look forward to your continued contributions in 2024 and beyond! 🎉

## Transcript

If reading is more your thing, check out the transcript of our conversations
below.

### 1- Meet the Humans of OTel

**IRIS DYRMISHI:** Well, I'm Iris Dyrmishi. I'm a senior observability engineer
at Miro and my life, my professional life is all about observability. I build an
observability platform that provides the tools for engineering teams at Miro to
monitor, to observe and get the best of their applications.

**SEVERIN NEUMANN:** My name is Severin Neumann. I'm working at Cisco at the
open source program office and I'm a member of the OpenTelemetry governance
committee and I'm one of the co-maintainers of the OpenTelemetry documentation.

**KAYLA REOPELLE:** My name is Kayla Reopelle. I work for New Relic and I am
contributing to the OpenTelemetry Ruby project.

**MORGAN MCLEAN:** My name is Morgan McLean,I'm a director of product management
at Splunk.I've been with OpenTelemetry since day one. I'm one of the co-founders
of the project. I'm on the governance committee. Wow. What do I work on within
OTel?A bit of everything. I mean early on it was literally everything. Myself
and Ted and various others were doing many, many jobs. More recently I was
involved in the release of traces, metrics 1.0. Logs 1.0 last year. Right now
I'm working on profiling as well as OpenTelemetry's expansion into mainframe
computing.

**HENRIK REXED:** My name is Henrik Rexed. I am a cloud native advocate at
Dynatrace and I'm passionate about observability, performance, and I'm trying to
help the community by providing content on getting started on any solutions out
there.

**VIJAY SAMUEL:** My name is Vijay Samuel and I help do architecture for the
observability platform at eBay.

**DANIEL GOMEZ BLANCO:** I'm Daniel Gomez Blanco. I'm a principal engineer at
Skyscanner and also member of the OpenTelemetry governance committee.

**DOUG ODEGAARD:** My name is Doug Odegaard. I'm a senior solutions architect
with ServiceNow Cloud Observability, which is also formerly Lightstep. I'm also
a previous customer of using OpenTelemetry for several years prior to that.

**ADNAN RAHIĆ:** Hey, I am Adnan. I work at Tracetest as a developer advocate
which is...you can guess better than me what that is. Pretty much do a bunch of
everything regarding OpenTelemetry. I'm one of the contributors for the
documentation, for the blog, and the demo.

**RYNN MANCUSO:** My name is Rynn Mancuso. I work for Honeycomb.io and I am one
of the maintainers of the End User SIG.

### 2- What does observability mean to you?

**IRIS DYRMISHI:** What does observability mean to me? observability to me is
the biggest passion of my life and also my professional career. It is one of
those areas that you are not very interested when you start your career because
you don't know anything about it. It's not taught in school, it's not preached
by the tech communities a lot, but then you discover it and say, "Wow, this is
amazing!" We're actually making a change and we're helping the teams make the
best of their product. So yeah, that's all.

**SEVERIN NEUMANN:** I think observability is a big game changer, right? So it's
evolution from what we have done, especially APM, over the last few years. So I
worked for a very long time at AppDynamics and we sold APM agents to customers
and we gave them a lot of the things that observability is promising today as
well. But the big change I see with observability that it's coming down, let's
say to everybody, right? So this is making the things that we did there
available for everybody. And even more, we're moving away from this... Hey,
let's add a post compilation agent into your application to like, yeah, let's
make native observability. Let's make this a thing that developers, that
operation teams are using across all the organizations.

**KAYLA REOPELLE:** So to me observability means having peace of mind. It means
having something that you can rely on in order to see what happened and what
went wrong. I think observability is also a way to feel more technically
connected to your customers and your users, so that you can see the ways that
they're interacting with your software instead of just the ways that you might
interact with it.

**MORGAN MCLEAN:** I mean, observability to me transcends just the computing
industry. It's the ability to peer into something and understand how it works,
what it's doing right now, and thus if it breaks, how to fix it more quickly.
Certainly when we think about telemetry in this industry, what observability
classically has meant is visibility to backend infrastructure and applications
kind of excitingly, I think it's expanding right now, right? With OpenTelemetry
we're pushing into client applications, we're pushing into mainframes, as I
mentioned earlier. And so it's really visibility into any systems that impact
your business, any technical system observability.

**HENRIK REXED:** Usually when people mention of observability they say it's a
replacement of the old name monitoring. But in fact for me it's more than
monitoring, because monitoring is like, you just look at something and
observability is like having enough information to understand a given situation.
So if you just look at metrics then, okay, you have a guess that something is
going on, but you don't understand. So having the options to get more
information like logs, events, exceptions, traces, compiling, then at the end
combine all those dimensions together, then you say, okay, I got it, this is my
problem and I can resolve it.

**VIJAY SAMUEL:** What does observability mean to me? I belong to what is called
the site engineering organization inside of eBay, and our goal is to make sure
that we can observe everything that's going on in the site and ensure that we
have high availability. So basically, observability means knowing if the site is
running fine or not, because that's why I'm there.

**DANIEL GOMEZ BLANCO:** What does observability mean to me? It's a way for us
to understand what's happening within our systems, because we run quite a
complex system, so we need to understand what goes on inside of them so we can
deliver a good experience for our end users at the end of the day.

**DOUG ODEGAARD:** So observability is, to me, I've been a full stack developer
for years, and so as we observe...actually I ended up on an incident response
team doing tracking of incidents, but also trying to figure out what was wrong.
And it pointed out to me how much we need this, how hard it was to look at so
many different screens and so forth.

**ADNAN RAHIĆ:** So observability is, to me, I've been a full stack developer
for years, and so as we observe...actually I ended up on an incident response
team doing tracking of incidents, but also trying to figure out what was wrong.
And it pointed out to me how much we need this, how hard it was to look at so
many different screens and so forth.observability for me is the way to actually
see what's happening in your system. It's the pinnacle of not being up the whole
night trying to figure out what went wrong. And with OpenTelemetry and with the
rise of tracing the last couple of years, it has hit an all time high with
regards to the possibilities that we have right now. So I'm just really, really
happy to be part of the project. I'm also really happy that it's growing at that
pace, that it's growing right now, and I can't see how that's going to evolve
within the next couple of years.

**RYNN MANCUSO:** For me, observability is about being able to ask deeper
questions of our systems, being able to demand, I think more than just alerting
on things that are emergencies, things we've seen before, but actually being
able to go out into the unknown and understand how complex systems are
performing.

### 3- What does OpenTelemetry mean to you?

**IRIS DYRMISHI:** OpenTelemetry is the tool that is making observability great
again. I would say that observability is seeing the surge, now that
OpenTelemetry is becoming so popular, it's allowing centralization of telemetry
signals, it's allowing semantic conventions, and it's generally helping
observability teams and engineering teams take more attention to the
observability and building it and making it better.

**SEVERIN NEUMANN:** What does OpenTelemetry mean to me? I think it's the
vehicle for observability. It's enabling that. And I joined OpenTelemetry
community a few years back because I was curious about this idea to bring
observability to everybody. And I think we are doing a really good job. And what
it also means to me now is that it's an amazing community. Right? So we're at
KubeCon here, and I meet so many people I just know from those conversations,
and now I can talk to them in person. And we talk a lot about OpenTelemetry, but
we also talk a lot about other things than OpenTelemetry. We talk about
observability, of course, about what we think about is going to happen in a few
years and all those other things, and that's what OpenTelemetry means to me.

**KAYLA REOPELLE:** So OpenTelemetry to me seems like it's a community effort to
take the best of what's already been out there for instrumentation and collect
it in one group so that everyone can benefit from it. I think that we've learned
so much as different agent engineers, but there's also so much to learn from
users of the products themselves. And OpenTelemetry does a great job of bringing
both people who are, you know, experts in observability, and experts in
languages to make something that's really great and meaningful for everyone.

**MORGAN MCLEAN:** I mean, OpenTelemetry is my baby. Put so much effort into
creating this project. What does it mean to me? I mean, there's the boring
answer, which is it extracts signals: metrics, traces, logs, profiles,
everything else from your infrastructure, from your services, from your clients,
makes those observable, processable on the backend. But I think to a lot of us
who've been in this community so long, and a lot of us like yourself and Henrik
here and others who participate in the community so much, I mean, OTel is also
just a really nice open source community to participate in. It's a thing I just
enjoy working on. I know that's abstract and kind of like a sort of squishy
thing to say, but I don't know. OTel has a lot of meaning to me in many
different ways. All very positive.

**HENRIK REXED:** OpenTelemetry for me, means the future. Because at the end, by
having an open standard, we have the luxury to have a common standard for common
format, for all the solution of the market and having that common format for all
the industry and all the vendors and all the solutions, it will just open use
cases. I think testing used to rely on, I don't know, feedback from users. And
now with observability data, we could be so much efficient in the way we're
testing, we could be so much efficient in replacing marketing tools, business
analytics tools. I think it's the future. And one thing that also a lot of
people talk about, AI everywhere, machine learning, blah, blah, blah, but I
think it's the same thing as a Tesla. I mean, Tesla, when you drive your car, it
takes decisions based on the sensors that it measures. And if you don't have
those sensors and those measurements, then you cannot have a smart... you can
have the smartest systems, but without the data, you cannot take the right
decisions. I think it's an enabler also for the future implementations of modern
applications.

**VIJAY SAMUEL:** OpenTelemetry is the standard for observability going forward,
and it's very important because as we have gone through the journey of
observability over the past few years, we have had to hunt for open standards in
Prometheus and few others. Now, at least with ingestion and collection, it's a
single standard for everyone to adopt. And I think that's pretty powerful for
the long run.

**DANIEL GOMEZ BLANCO:** What does OpenTelemetry mean to me? That, I think is
bringing people together, bringing everyone together under one single language
and the ones that way of thinking about telemetry. I think human languages are
difficult enough for us to understand each other. And I think, you know,
OpenTelemetry is bringing the technology together and one single way of like,
thinking about telemetry, thinking about how we observe our systems.

**DOUG ODEGAARD:** To me, OpenTelemetry is bringing the ability to have product
teams, infrastructure teams, helping their jobs make it easier and also just
improve the customer experience and just make it overall a better experience to
do our jobs.

**ADNAN RAHIĆ:** OpenTelemetry is the, I'm going to say, the future of
observability. We've seen so many companies, many vendors move to an
OpenTelemetry-first mindset, and the way that you can use OpenTelemetry to
generate them, to actually gather all telemetry signals with one set of
libraries, with one tool. It's just the way it was supposed to be. You're not
locked into one tool, one vendor, one cloud provider anymore. You can do
basically whatever you want, and you can use both the metrics, logs, and traces
for basically anything you want to do. Really happy to see it.

**RYNN MANCUSO:** OpenTelemetry is an instrumentation protocol that helps us ask
more detailed questions about observability because it collects multiple signals
from many flexible types of systems. Folks monitor everything from the control
plane in Kubernetes all the way up to physical on-prem systems. It's a really
flexible language and it's beautiful community of humans that came together over
the pandemic to build something really special.

### 4- How did you get involved with OpenTelemetry?

**IRIS DYRMISHI:** I was working in a very fast-pacing observability team, and
we were maintaining a lot of tools and we really did not have conventions there,
we did not have centralizations and we really were not flexible when it came to
backends and vendor agnostic in general. So we discovered this amazing tool
called OpenTelemetry. We said okay, let's give it a try. It worked great for us.
And here I am today, one year later, more than one year later, and let's say
pushing the migration to OpenTelemetry in my second project.

**SEVERIN NEUMANN:** How did I get involved into OpenTelemetry? So yeah, I
mentioned that... so I got curious a few years ago. So I was... I was at
AppDynamics working as a so-called domain architect, and I was an expert for
Node.js, Python and a lot of those other languages. And there was always this
conversation around like, hey, there's this thing now called OpenTelemetry and
should we not integrate this into our product? And I was like, okay, I want to
learn more. Then I was like, what is a good way to learn something new about an
open source technology? Yeah, get involved into that. So I was involved in
JavaScript at some point, and then at some point I realized like, yeah, but if I
really want to get a good view into OpenTelemetry, doing documentation is a good
way into that. And that's how I ended up being a maintainer for the
documentation.

**KAYLA REOPELLE:** I got involved in OpenTelemetry last spring when New Relic
asked me to take a look at what the current status was of the OpenTelemetry Ruby
project. I also work as an engineer on the New Relic Ruby agent team, and that
gave me an opportunity to start to contribute to the project. And I noticed that
a lot of the signals for Ruby weren't yet stable. So a lot of my work so far has
been going into trying to bring logs and metrics to stability in Ruby.

**MORGAN MCLEAN:** I was working at Google on Google's observability products
like tracing, profiling, debugging, that sort of thing. And one of the
challenges we had in tracing was getting data from people's applications. It's
really, really hard. You need integrations of hundreds of thousands of pieces of
software. No one team, no one company is going to maintain that. It's just
infeasible. And so we want to do something open source. There were other open
source standards. There was one that had started, I think, roughly around the
same time we were doing this, called OpenTracing. We started OpenCensus.

At some point, especially amongst the more social media savvy members, the team,
which I am not one of, there was some contention between those projects about
where people who maintain databases and language runtime things should actually
spend their integration efforts, and it was limiting the success of both
projects. So I was leading OpenCensus. Ted and Dan and others were leading
OpenTracing. And in late 2018, early 2019, we finally sort of brought things to
a head and decided to merge those into what is now called OpenTelemetry. So
that's sort of, you know, I've been involved since then, I've been...now I work
at Splunk. Different company, but still on the same types of things. But that's
how my involvement started, and it's just grown and grown and snowballed from
there.

**HENRIK REXED:** When I started the adventure in observability, of course, I
joined Dynatrace, and Dynatrace has their vendor agent, the OneAgent, and I saw
this movement of OpenTelemetry, and coming from the performance background, I
looked at it and I said, "Whoa, an open standard." "That sounds quite exciting"
because I had a performance, a gig for a customer, where I implemented like a
collecting logs and processing it and putting machine learning. And I told
myself at that time, it would be so wonderful to have one common standard. So
then instead of doing a custom implementation, I could have something for
everyone. And when I looked at the, just the definition of the project and the
things behind the project, I was so excited. I said, oh, gosh, I want to be
involved in the project. And that's where I started to build content to help the
community get started.

I used to be a developer, but I'm a bad developer for sure. So that's why I'm
trying to help the project in other ways, in all the directions. And yeah, my
goal is increase the adoption of the open standards, making sure that it's been
adopted everywhere, so then we can move forward by implementing even more
exciting implementations.

**VIJAY SAMUEL:** I started a few years ago for two reasons. One, we were
looking to introduce tracing inside the company, and at that time, OpenTracing
and OpenCensus was converging into OpenTelemetry. We started evaluating
OpenTelemetry for that. And given that we were moving into OpenTelemetry for
tracing, I also went through the journey of migrating our metrics collection
into OpenTelemetry. That's basically how I got involved.

**DANIEL GOMEZ BLANCO:** How did I get involved in OpenTelemetry? I got involved
through my work at Skyscanner, as an end user. I was driving adoption and open
standards for telemetry. During COVID there was a need for simplification and
how we approach infrastructure, how we approach, how we collect, how we process,
and how we export telemetry data, and also basically... to basically lead the
adoption of open standards and their simplification effort. So as an
observability lead, I got more involved in the community aspect of
OpenTelemetry, decided to interact with all their end users and meeting people
that want to solve the same problems and want to find a solution that works for
everyone.

**DOUG ODEGAARD:** So, OpenTelemetry, I actually, for several years, in my
previous position, I was hired to actually develop observability software. I was
writing my own thing, we were doing a lot of alert management and various
things. It was so much work and I thought, this has got to be easier. Plus I
wanted to make sure that it could be future, future proof, dare I use that term?
But also extensible.

And when I discovered OpenTelemetry, I was just like, oh, thank you. Because
it's something that the company could carry forward. And also we didn't have to
worry about storing the data as much. And so it's really provided a really
excellent platform so that we can focus on the task at hand versus how to do the
job. So how I got involved in the project was actually first as a customer. It
was about three, close to four years ago, kind of the infancy of OpenTelemetry.
And I would go online, I would look at the documentation, or I would be in the
code a lot, but I wanted to learn more. So I would go to a SIG call and there
would be someone from Google and Microsoft and other companies, and then there
was this guy from this small fintech in the US. And at first it was a little
awkward, but they were so excited to have me in the call because I was an end
user. And so it really was, it was a wonderful experience to begin that way, to
realize that I could contribute to this rather than simply be a consumer of it.
So it was great. And then I transitioned my career into working for a vendor,
and we implement these systems now for customers like myself that I was years
ago. So it's kind of a pay it forward, give back type of thing.

**ADNAN RAHIĆ:** How did we get involved into the OpenTelemetry project? We
started contributing more to the blog with you guys started contributing a bit
to the docs as well. And yeah, it's just been a whole-hearted effort in the team
to always kind of dedicate a few, a few minutes of each day to check out the
OpenTelemetry project, find a way to contribute.

**RYNN MANCUSO:** I got involved in the OpenTelemetry project...honestly, I was
working at one observability company in marketing, and they didn't see the
point. They didn't want me to get involved. And I really believed in open
source. I'd worked in Mozilla and Wikimedia and really believed that, like, this
was the way forward from a strategic perspective. So the second I could switch
to a company that did let me get involved, that's what I did. And now I'm at
Honeycomb. And I'm glad to say within the first three months, I made project
member and started working with the End User Working Group and worked to grow it
into a SIG, into all the programs that it has today, together with others.

### 5- What's your favorite telemetry signal?

**IRIS DYRMISHI:** Tracing is my favorite signal.

**SEVERIN NEUMANN:** My favorite signal now is profiling, because I think this
is really closing a big gap that was missing in observability, right? So I
mentioned before, right, I come from the APM space, and now for me, APM,
observability, it's very hard to make, like, a difference here. But one thing
that when I talk with people using APM products right now is they're like, hey,
where's code level visibility with OpenTelemetry, right? My commercial agent is
giving me that line of code that is breaking something. And this is what we get
with profiling. And that's why I'm really, really excited about it.

**KAYLA REOPELLE:** To decide a favorite signal is kind of difficult for me. I
really love the power of traces. I think that traces can tell stories in ways
that are very meaningful. But on the same, like, on the other hand, I've been so
immersed in logs and trying to allow logs to have more connections to spans and
traces, I definitely have a soft spot for logs as well.

**MORGAN MCLEAN:** I mean, I'm partial to distributed traces because that's
where this project got its start. And I think early on, that's where a lot of
the value was. No one else was really doing standardized distributed trace
collection right? There were some open source examples of it attached to, like,
Zipkin and Jaeger. But I think the reason OpenTelemetry got so much traction so
quickly is that it was providing that.

I'm also partial to logs, which we launched last year, just because that's one
where, like, I've been involved in a lot of parts of OTel... But that's one
where like, I was involved in a lot of the core specification early on in
driving that. And so it was really exciting to see that ship. Also, logs are
just a thing that throughout my career before working on any of this, I just get
frustrated with, because they're never standardized, slow to process, they're
expensive. OTel going to bring a lot of changes there for the better for
everyone who uses logs.

And finally, I guess profiles, because I work on that now. When I was at Google
many years ago, I launched what I think was the world's first distributed
continuous profiling product, at least publicly available one, which was Google
cloud profiling, Stackdriver profiling, they still support it, I still think
it's free, it's very powerful. But profiling has always been a bit of a niche
thing. Like, I know, like at Splunk and other companies, we support it, but it's
not as well known as metrics, and traces, and logs. I think with OTel, starting
later this year, we're gonna launch like full support for profiles. That's
really gonna change. Like, we had customers at Google who would spend an hour of
our profiler and save like 20, 30% of their aggregate compute because they found
some really poorly optimized code really quickly. For more people to have that
ability and speed things up and for developers actually to get insight into how
things work, that's super exciting. Like, the tech has been there a long time
and OTel bringing this mainstream is huge.

**HENRIK REXED:** When people ask me, who is your favorite kid? Usually I say, I
don't have a favorite kid, you know. All my kids are wonderful. They all have, I
don't know, a great thing, you know, out of it. So I think I love traces because
sometimes it helps you to understand where it slowed down. I love metrics
because as a performance engineer, I used to use metrics a lot. And I love logs
because logs at the end, there's no sampling. So if you just do analytics on
logs, wow, you are so much precise.

So I don't think I have a favorite signal. I'll just say that depending on what
I need and pick and choose, there's clearly one signal that will help me more.
There's one thing that I'm very eager and waiting since Valencia is continuous
profiling, because I love profiling and I think traces is great, but if there is
a problem somewhere, profiling would be so much helpful. So I think, yeah, I
don't answer your questions, but I say, yeah, I love all the signals provided by
OpenTelemetry.

**VIJAY SAMUEL:** I am thoroughly biased towards metrics. I feel metrics are the
most powerful signal. As long as you are thinking through your instrumentation
and making sure that you have the right granularity cardinality being sent in,
to the platform, you can do powerful, powerful things with regards to anomaly
detection, machine learning and many other things. So I love metrics.

**DANIEL GOMEZ BLANCO:** I mean, I have to say traces, because they give you the
context. Traces give you the backbone correlation for all the other signals,
right? But I do think that the current design of the API design of metrics is so
powerful that I'm like falling in love again with metrics because of that way
that we decouple instrumentation and measurement from aggregation of metrics is
so powerful and so much richness to basically give us a way to describe our
systems, that I'm falling back again in love with metrics.

**DOUG ODEGAARD:** My favorite signal, I have to say, I'm partial to traces
because I've been doing software development for so long that that was the first
thing that really turned me on to it was the ability to see that, especially
because I know what it's like, like to debug. But it's also, I also know what
it's like in an incident to have to focus in very quickly. So yes, traces are my
favorite, but I do also like to send that trace ID and span ID into the logs
now. It's kind of becoming my next favorite.

**ADNAN RAHIĆ:** My favorite signal is traces. I'm going to say traces,
definitely. My favorite singer is Ed Sheeran.

**RYNN MANCUSO:** What is my favorite signal? I mean, I work for Honeycomb, so I
am constitutionally obliged to say traces are my favorite signal.

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
[Mastodon](https://fosstodon.org/@opentelemetry) and
[LinkedIn](https://www.linkedin.com/company/opentelemetry/), and share your
stories using the **#OpenTelemetry** hashtag!

And don't forget to subscribe to our
[YouTube channel](https://youtube.com/@otel-official) for more great
OpenTelemetry content!
