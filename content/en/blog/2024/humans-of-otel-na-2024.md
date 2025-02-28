---
title: The Humans of OpenTelemetry - KubeCon NA 2024
linkTitle: Humans of OTel NA 2024
date: 2024-12-19
author: >-
  [Adriana Villela](https://github.com/avillela) (Dynatrace)
issue: 5812
sig: End User SIG
# prettier-ignore
cSpell:ignore: Adriana Akhigbe Bhattacharya Bluesky brainer Braydon Budha causely Christos commoditize Creeden David Endre Eromosele Gohberg google hazel Kains Lee Luna Markou Miguel nivenly Outreachy Reese Sara sematext Sharr TIMgKXCeiyQ traducción traduction transformative tyk weakly youtube
---

We're back with our third edition of
[Humans of OpenTelemetry](/blog/2024/humans-of-otel-eu-2024/), this time from
KubeCon NA in Salt Lake City, Utah, USA. Once again,
[Reese Lee](https://github.com/reese-lee) and I interviewed OpenTelemetry
contributors and end users (and each other!), and learned how they got involved
with OTel:

- [Hazel Weakly (The Nivenly Foundation)](https://github.com/hazelweakly)
- [Eromosele Akhigbe (Sematext)](https://github.com/AkhigbeEromo)
- [Budha Bhattacharya (Tyk)](https://github.com/hellobudha)
- [Miguel Luna (Elastic)](https://github.com/mlunadia)
- [Adriana Villela (Dynatrace)](https://github.com/avillela)
- [David Gohberg (Monday)](https://github.com/dattto)
- [Endre Sara (Causely)](https://github.com/esara)
- [Braydon Kains (Google)](https://github.com/braydonk)
- [Christos Markou (Elastic)](https://github.com/ChrsMark)
- [Reese Lee (New Relic)](https://github.com/reese-lee)

Also, special thanks to:

- [Reese Lee](https://github.com/reese-lee), my co-interviewer
- [Henrik Rexed](https://github.com/henrikrexed) for providing the audio and
  video recording equipment, and doing the initial edits of the raw footage

## Video

You can watch the full recording here:

{{%youtube TIMgKXCeiyQ%}}

<br/>Thanks to everyone who has contributed to OpenTelemetry to date, and we
look forward to your continued contributions in 2025 and beyond! 🎉

## Transcript

If reading is more your thing, the transcript of our conversations are below.

### 1- Meet the Humans of OTel

**Hazel Weakly:** Hey there. My name is Hazel Weakly and I have thoughts, lots
of thoughts. They never stop thinking. And they never stop thinking.

**Eromosele Akhigbe:** My name is Eromosele Akhigbe: and I'm currently a
software engineer at Sematext. Hello everyone.

**Budha Bhattacharya:** I am Budha. I'm a developer advocate at Tyk. Apart from
that I've got a very deep relationship with open standards because I'm also the
board chair for the OpenAPI Initiative and a board member for the GraphQL
Foundation.

**Miguel Luna:** My name is Miguel Luna and I'm a product manager at Elastic
where I'm the product lead for the OpenTelemetry efforts across the company and
what we contribute to the to the community.

**Adriana Villela:** My name is Adriana Villela and I'm a Principal Developer
Advocate at Dynatrace.

**David Gohberg:** My name is David and I work Monday dot com. I'm a software
engineer and I work there on the CRM product.

**Endre Sara:** My name is Endre Sara, I'm the co-founder of a company called
Causely. I started Causely two years ago.

**Braydon Kains:** My name is Braydon Kains. I'm a software developer at Google
in the Google Cloud Org. I work for the Cloud Observability service and I mainly
work on agents that customers install in their environments to collect telemetry
signals and send them to Google Cloud.

**Christos Markou:** My name is Christos. I'm a software engineer at Elastic. I
have been working mainly in observability over the past five years now and since
last year I have been contributing mostly to the OpenTelemetry ecosystem.

**Reese Lee:** Hi, my name is Reese Lee and I am a Senior Developer Relations
Engineer at New Relic.

### 2- How did you get involved in OpenTelemetry?

**Hazel Weakly:** OpenTelemetry. So I got into the project sort of almost
accidentally, although I think at this point that's an answer that I give for
everything. When I mean accidentally, it was I was, looking for answers to
questions that I had and more importantly, how do I teach other people to find
answers to questions better and how do I continue to level up the teams that I
worked with, the organizations that I worked with and in figuring out how to get
people better at asking questions, getting answers, and learning from that? I
finally stumbled onto OpenTelemetry.

**Eromosele Akhigbe:** In March, I entered an internship called Outreachy and in
Outreachy I was privileged to work on OpenTelemetry and I worked on building a
logging bridge in Golang, and by the end of the internship I was able to build a
logging bridge using OTel zerolog.

**Budha Bhattacharya:** How did I get involved with OpenTelemetry? This is a
multi part question or answer, I think in this case, because there were a couple
of, couple of reasons why it caught my attention. Starting off with actually
advocacy from our new group product manager who had recently joined and she was
a big proponent of observability and OpenTelemetry specifically. I kind of had
played around with OpenTracing and OpenCensus for a little while, but I hadn't
really looked into OpenTelemetry. But once she came in I was a huge advocate for
it and that got my attention. That was trigger number one. Trigger number two
was the fact that it was this open standard. So I think anything open standards
to me is a no brainer.

I've got a lot of time to invest in any sort of open standard that makes life
easy. I think from a flexibility standpoint that's the way to go. So that was
trigger number two. Trigger number three was actually when we started using
OpenTelemetry. So we are an API management platform at Tyk. For us,
OpenTelemetry was being used internally as well as externally. So internally we
could already start seeing results in terms of how quickly and efficiently we
were getting to troubleshoot problems and getting to the heart of issues. And
not just limited to rest APIs but actually with GraphQL APIs as well, which you
wouldn't have considered as a possible use case. But we were able to remediate
some of those issues that we were facing with that. So that was sort of trigger
number three. And all of that collectively came together to say, hey,
OpenTelemetry deserves attention.

**Miguel Luna:** Initially I started as a product manager. It was a very
interesting role because I started in a role where it was more about
coordination rather than contributing directly. But I've been recently involved
in the localization of the documentation. So that means translating the
documentation, more specifically in my case among Spanish speakers. So, la
traducción de la telemetria abierta. So, the traduction...the translation into
the Spanish of the OpenTelemetry documentation.

**Adriana Villela:** At my previous role, my manager at the time, as part of it,
he encouraged me to actually join the OpenTelemetry community. And it was
actually my first time ever contributing to open source and I never contributed
to open source. I've been in tech for like over 20 years and my manager
basically said, yeah, just attend a couple meetings. And my first meeting was
for the OTel comms. And so that was kind of my gateway into OpenTelemetry.

**David Gohberg:** I started my career in embedded applications and I was doing
eBPF tracing before that was even a thing. And I then moved into Dropbox where
all our telemetry was in-house before OpenTelemetry was mainstream and now on
Monday I continue doing trace-based testing.

**Endre Sara:** I started to learn about OpenTelemetry. I realized that this is
such an opportunity for the whole industry to actually commoditize and
standardize how instrumentation is being done and to be able to use common
semantic conventions so people can understand what's going on. So I got
instantly excited and I started to work on it. First it was just a few test
applications, then I played with and demoed to people on how to do
instrumentation. But as we started our current company, from day one I said we
have to make sure that we are properly instrumenting our software so that we can
actually operate this as we get more customers for logs, metrics and disability
testing, it has been helping us a lot.

**Braydon Kains:** I got involved in OpenTelemetry because our team uses
OpenTelemetry, namely the OpenTelemetry Collector, to support our customers
collecting data off of their environments. When we had bugs and issues with
OpenTelemetry in the past, there would be some light involvement from the team,
but largely we would open an issue and sort of wait for. Wait for it to get
addressed. And I really wanted to change that within the group. And I wasn't the
only one on our team who wanted to change that. So, you know, we all sort of
started to make a more genuine effort to open issues that came with PRs. And
that has generally moved our whole team forward into being more involved in
OTel. And I've ended up being much more involved in OTel to the point where now
I'm a code owner on the Host Metrics Receiver, which is an important receiver to
us, but I get to dedicate more time to making sure it's good for everyone and
not just fixing our own problem.

**Christos Markou:** I was originally asked to contribute to the OpenTelemetry
by helping with the Elastic Common Schema donation to the OpenTelemetry,
specifically to the specification and the semantic conventions. And since then I
have been more and more involved in other projects like the Collector. And right
now I'm mainly focusing on the semantic conventions and the OpenTelemetry
Collector, specifically the Collector contrib project.

**Reese Lee:** The way I got involved in OpenTelemetry was at New Relic. And at
first my first experience with it was through some support tickets that we
started to get around some of our customers who had adopted OpenTelemetry. And
then I had a great opportunity to join our dedicated OpenTelemetry team at the
time as a developer relations engineer. And this was back in November 2021. And
I was able to integrate within the OpenTelemetry community pretty soon after
that. And actually my previous manager, Sharr Creeden, she kind of spearheaded
the work to build the End User Working Group at the time, and now we are the End
User SIG.

### 3- How has OpenTelemetry helped you?

**Hazel Weakly:** OpenTelemetry has been really useful at my organizations that
I've worked on because it's become something that you can tie into different
vendors, tie into different tools, and into other intermediary ways. And the
huge benefit of it for me is that I can take all these different bits of
knowledge, not necessarily signals, but different bits of context from the
company, tie it all together in a way that I can show people these answers to
their questions, regardless of whether or not they're in engineering. And that
is a new capability because previously engineering was kind of in its own bubble
and increasingly it really can't continue to do that. And so OpenTelemetry has
been super impactful for me for bringing our knowledge outside of engineering
and bringing the outside knowledge into engineering.

**Budha Bhattacharya:** Things have become a lot more efficient internally. When
I talk to our SRE teams, our DevOps teams, they're a lot happier when they're
interacting or working with different elements of our platform stack. It's a lot
easier to manage and handle it. Now when I talk about the end users, they can
truly talk about the value of it. And personally, I think just the advocacy side
of things, I think has been really, really enriching for me to learn more about
it. Being involved with the community in different ways. Earlier this year I had
the privilege of putting together a mini conference called LEAP, which was the
API Observability Conference, where a lot of the folks from the community were
able to scroll, speak to the different areas and elements of OpenTelemetry, not
just limited to, again, the engineering side of things, but also how decision
makers could perceive the value of adopting something like OpenTelemetry within
their organization.

**Miguel Luna:** It all started when Elastic, we decided to donate the Elastic
Common Schema, which was a natural fit to the goals of OpenTelemetry, or
standardizing observability and driving efficiency across getting telemetry data
converged into a single standard.

**David Gohberg:** When I just started my career, there was no OpenTelemetry, so
I had to figure out how to do traces and how to correlate them with metrics and
how to do logs. But now all this effort has already been standardized by the
community, so new engineers that are onboarding into OpenTelemetry have a much
easier time than I have.

**Endre Sara:** In general, I think that the ability to be able to take signals
from your application and to be able to use them to operate the environment to
understand the behavior of the system is significantly easier with OpenTelemetry
than it was with other proprietary instrumentations in the past. What I think is
more interesting is what do you do with this data? Is most of this information
is being exposed to people in dashboards which are amazingly nicely presented,
contextualized based on semantic conventions. But I think that the biggest
advantage is to be able to use software to reasonably data.

**Braydon Kains:** The main way OpenTelemetry has helped me personally is really
learning how to interact with a large community. I already had some experience
with open source communities and there is this sort of general culture of like,
you know, you do the work, you get a say in the project. That's pretty common in
the open source world and I think that's fine. But OpenTelemetry has a very
large structure for getting changes in.

**Christos Markou:** I really like working with the OpenTelemetry ecosystem in
general because I believe that working with people from other companies, other
teams, helps me personally as an engineer a lot because I see how other people
do observability out there. So I keep learning a lot. So that's something that I
really like and I believe in general my team is also really helped by this, by
this fact and also for my job. I mean it's amazing because I really love open
source, I really love working with open source projects. And yeah, I think that
on a personal level it's really helpful.

**Reese Lee:** OpenTelemetry has helped me personally in honestly really big
way, in the sense that working in developer relations with OpenTelemetry, I've
gotten to meet a lot of wonderful people which I talked about earlier. But as
part of my role I get to submit topics to different events and part of that is
being able to learn about all these different topics myself and being able to
talk to people who are using in production or trying it on themselves has been a
really wonderful experience.

### 4- What does Observability mean to you?

**Hazel Weakly:** My definition of observability, it is the process through
which one develops the ability to ask meaningful questions, get useful answers
and then act effectively on when you learn. So what I mean by that is it's not
enough to be able to kind of figure out the answer. There's this process where
you have to actually work on it over and over and over and you're developing a
skill not just on a personal level, but on an organization level, on a group
level, and in even broader an industry level. So as you continue to do that,
continue to get those really, really useful answers and really, really
meaningful questions that you can ask. You start to have this whole process of
group learning that transcends the boundaries that we draw for ourselves and
lets those boundaries become empowering rather than limiting.

**Eromosele Akhigbe:** Observability Engineers are like the doctors of your
system. So if something is going wrong in your system, you need us to be able to
pinpoint where exactly or what exactly is wrong and how to solve whatever is
wrong. So that's what observability means to me.

**Budha Bhattacharya:** What does observability mean to me? There is a technical
answer to this, where it goes into the realm of perhaps monitoring, perhaps
logging, and, you know, getting to the troubleshooting of all things. To me,
it's all about understanding. It is essentially understanding the pulse of your
platform that you have created. I work with APIs quite a lot, so everything
underlying is all to do with API platforms. So understanding the pulse of your
API platform, the different components coming together and knowing exactly
what's functioning, not functioning, the good, bad and ugly of it all, that, to
me, is what observability is all about. So to be able to get to that part of the
problem, to be able to know what's working, what's not working, and making
decisions more effectively.

**Miguel Luna:** Monitoring means knowing answers to questions that you know you
needed to ask. Observability means knowing questions to answers that you didn't
know that you need to ask.

**Adriana Villela:** To me, observability means the ability to get insights into
your system. And for me, like, this was extremely transformative, because, like,
there's so many times in my life where, you know, I was, like, debugging code,
whether it was like my own code, like, as a developer or code in production, and
not understanding, like, just looking through logs and not understanding, like,
okay, but how does this relate to the bigger picture? Like, I have so many
memories of, like, troubleshooting production issues, and it's like, oh, the
system is slow. So you ask the person who's responsible for administering the
app server, hey, can you check the logs? No, not my problem. You ask the DBA,
no, no, it's not my problem. And then you ask whoever else, and you go down the
whole line and, like, it's nobody's problem. And yet you're still seeing
latency. And I feel like observability kind of like it. It uncloaks the whole
thing because all of a sudden it exposes. Like, it exposes where the actual root
cause is. And I think that's the magic and power of observability.

**David Gohberg:** The most important thing in software engineering today is the
user experience. And because our software is getting much more complex, it's
getting harder to answer the question, how are my users experiencing my product?
And OpenTelemetry allows us to answer these difficult questions and provide us
with visibility into our software.

**Endre Sara:** I think that probably the most obvious answer is to be able to
collect signals. But I think that the real point of observability is to
understand and reason about the behavior of the systems. Simply collecting data
doesn't actually accomplish much. I think also with the becomes meaningful and
valuable, and people are able to use this to drive actions, to drive decisions.
Where do I need to improve reliability? Where do I need to improve the
performance of my application? Where do I need to make architectural changes? I
think observability is really serving that. Otherwise it's just a lake of data.

**Braydon Kains:** Observability means to me that you can tell what's going on.
Computers are black boxes that understand what ones and zeros do. And being able
as a human to understand what ones and zeros are doing at any given time, when a
computer is blazing so fast, how would you ever be able to figure out what that
means? So observability to me is the human version of understanding what a
computer is doing.

**Christos Markou:** So for me, observability is something that I. I have been
working on since university, and it's a really important area because I think
that what really matters when we are running systems, it's the way that you can
observe your systems, you can know if your systems are doing good or not. And
specifically, I'm coming from an infrastructure background, as I mentioned
before. So for infrastructure specifically, it's really, really important when
it comes to cost reduction. And this sort of stuff or how the whole system is
working is an important piece that you cannot miss.

**Reese Lee:** Observability to me means that I, as an end user of various
applications and software programs, get to have a better experience because the
companies that build these products, you know, assuming that they're using
observability and being able to stay on top of issues that are happening in
their code, it means I get to have a better experience as an end user.

### 5- What does OpenTelemetry mean to you?

**Hazel Weakly:** OpenTelemetry to me is one really interesting approach towards
building something that takes a very sort of capitalistic notion of companies
need to be profitable, companies wanting to innovate, people wanting to compete,
and people want to develop different solutions to things. And how do you wrap
all that together in a project that's flexible enough to allow that competition,
to allow those ideas to happen, and to allow this Innovation to continue without
limiting what's possible and without burdening the industry with the
intermediate details of the evolution of that complex, the evolution of pursuing
excellence.

**Eromosele Akhigbe:** OpenTelemetry is, I believe, the future of observability.
In March, when I started doing research on OpenTelemetry, I discovered how big
this can be and I decided that I was going to go in fully into OpenTelemetry. So
I believe that it's the future of observability and everyone should take it.

**Budha Bhattacharya:** What does OpenTelemetry mean? To me that's an extension
of that understanding. In a way it's the. Well, again, the technical answer to
this would be, is the open standard that essentially powers distributed tracing.
That's all fine. To me it's the extension of that understanding by creating a
common language or framework, however you want to put it, that the different
components and elements of your platform stack can unite together to speak to
the health of your overall platform. And that could go from the engineering
standpoint all the way to the business standpoint. There are repercussions to
both of those. So to me that's what OpenTelemetry as a technology brings, both
from a business and a technical standpoint. But it's also about the community as
well. It's sort of again the industry coming together and agreeing on a standard
so that the life of SRE, DevOps organizations, tooling providers, end users, all
of their lives are made a lot more easier because by virtue of having an open
standard, it means that your platform is a lot more flexible, you have a lot
more freedom to evolve, to mature and actually be a bit more future ready. So
that to me is the promise of flexibility and freedom that OpenTelemetry brings.

**Miguel Luna:** For me it means a common language. So it's a place where we
all, where users can made and at least understand that everything that we are
going to collect is going to be collect in a similar way, with a similar
mechanism. Also what we call things. So the semantic conventions we, we agree on
common standards of what, what are we going to call things? So the telemetry is
the same and it can be reusable. So yeah, so that's, that's OpenTelemetry for
me.

**Adriana Villela:** What does OpenTelemetry mean to me? To me, you know, it's,
it feels like home actually, because it's been like my home for the last like
two and a half years. So it's been like really transformative in my life because
it's like I said, was my gateway into like open source, into the CNCF community.
And so it takes on like a very personal flavor for me, just beyond like the, you
know, the, the typical definition of OpenTelemetry, which is like this open
standard for instrumenting your code. For me, it's just so much more than that.
It really is like this lovely community where we're working with different
vendors from across the board and we're not enemies, we're all friends because
we're working towards the same goal.

**David Gohberg:** OpenTelemetry is basically a way to standardize all the
efforts, all the engineers that want to ask all the difficult questions about
software.

**Endre Sara:** OpenTelemetry gives a way for multiple vendors to work together,
to collaborate together and take the instrumentation as a given that is not a
function of competition and really focus on adding value on how this information
turns into an actionable insight. And I think that that is really where people,
vendors, end users are expecting to innovate in. So OpenTelemetry is basically
the enabler for vendors to focus on where the real value is.

**Braydon Kains:** OpenTelemetry to me is a representation of the industry
coming together and understanding, you know, what are we competing about really?
Like what are, where are we really as different companies trying to fit in the
market? And I think we all sort of collectively understand that the signals
themselves really aren't worth differentiating on. It's generally a net negative
for everyone for us to not agree on this stuff. And if we can agree on the
signal part, it just leaves everyone, all companies, more time to differentiate
in the ways that, that actually are tangible in terms of how the data works.

**Christos Markou:** Having been involved in OpenTelemetry over the past year, I
think that OpenTelemetry is a great place to learn things and meet other people
that are really passionate about the whole observability area. And I think that
consists of people that really like what they are doing and they are really good
at this. So it's a great place for engineers to come together and work and share
the observability space to evolve.

**Reese Lee:** OpenTelemetry to me means a lot of things, you know, beyond the
project and kind of the way it's helped different organizations, you know, move
into and adopt open source throughout their stack. It's also such a huge,
wonderful community. I really enjoy meeting the maintainers and getting to know
the end users. I have really good relationships with a lot of the OpenTelemetry
community people and that's what it means to me.

### 6- What's your favorite OpenTelemetry signal?

**Hazel Weakly:** My favorite OpenTelemetry signal. I'm going to cheat a little
bit here and I'm going to say my favorite OpenTelemetry signal is the one that
gives people the answer that they find most useful for the question that they
find most use meaningful.

**Eromosele Akhigbe:** Traces. Traces are my favorite signal because, like, they
give a full, you know, a full picture of everything going on in the system and
you can easily spot on errors.

**Budha Bhattacharya:** Favorite OpenTelemetry signal. This is, this is a tough
one. I think traces has to take the win at this point of time because again,
just thinking about how things connect well. I'm also very, very keenly pursuing
profiling. I think that's going to be potentially the winner in the next
conversation we have because I think performance is a big area for a lot of
organizations and especially when, as an API gateway, when we are working with
different components, we have one part of the API platform stack to know if
there are potential bottlenecks. Are we a bottleneck? Are there other elements
that are potential bottlenecks there? How do we improve performance? How do we
actually put our money where the numbers are, essentially? That's what profiling
again, sort of promises to a point?

**Miguel Luna:** Because of the background, Elastic, I gotta say logs. But of
course, you know, it's. The logs are, you know, they. They bring like deep
contextual insights, but at the end of the day, you need them all. Like metrics
are gonna let us know there is a problem. Tracing is gonna help us to understand
where the problem is, and logs are gonna help us understand what the problem is.

**Adriana Villela:** My favorite signal is traces because I fell in love with
observability and OpenTelemetry because of traces.

**David Gohberg:** I would have to say that I got the most value out of tracing.
But recently I started to correlate traces with metrics, and I think that is
like the golden flow.

**Endre Sara:** I have been a huge fan of distributed tracing in general. I
think it gives you the understanding of how big, like, services interact with
each other. But I've been growing to like profiling. I think it gives
interesting, exciting opportunities on how people understand even deeper how
their systems behave, especially how their systems behave under different flow,
different conditions, and to be able to adjust, improve their architectures and
the scale of their systems to cater to future loads.

**Braydon Kains:** My favorite OpenTelemetry signal right now is logs, because
even though I'm fully immersed in OpenTelemetry now and I know what all three of
the signals mean, I started on logs because logs are easy. It just makes so much
sense and I understand where people are coming from, coming from with
observability, second wave, you know, everything should just be trace or lot
wide events. I understand the value of that, but I just feel like logs aren't
ever going away.

**Christos Markou:** My favorite signal coming from an infrastructure and
systems background. I really like metrics, and this is something that actually
is my personal goal for the next months. Coming to help a lot stabilizing
metrics like system metrics in the semantic conventions and Kubernetes metrics
as well, and make the collector providing more confidence to our users because
having the semantic stable, that will help us.

**Reese Lee:** My favorite signal. You know, I want to say traces, because they
were kind of the first thing I learned when I got into the world of
observability to begin with, and I think that was kind of what my mind
understood. And I really like the trace waterfalls, so I'll go with that.

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
[Bluesky](https://bsky.app/profile/opentelemetry.io),
[Mastodon](https://fosstodon.org/@opentelemetry) and
[LinkedIn](https://www.linkedin.com/company/opentelemetry/), and share your
stories using the **#OpenTelemetry** hashtag!

And don't forget to subscribe to our
[YouTube channel](https://youtube.com/@otel-official) for more great
OpenTelemetry content!
