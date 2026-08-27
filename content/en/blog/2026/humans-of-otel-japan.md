---
title: The Humans of OpenTelemetry - KubeCon Japan 2026
linkTitle: Humans of OTel Japan 2026
date: 2026-08-26
author: >-
  [Yoshi Yamaguchi](https://github.com/ymotongpoo) (Grafana Labs)
sig: End User SIG
# prettier-ignore
cSpell:ignore: chikahisa fujikane kohei loglass mikata mixi ohira okamoto sugimoto yoshi yoshiki yuzuru
---

We're back with our fifth edition of
[Humans of OpenTelemetry](/blog/2025/humans-of-otel-eu/), and for the first
time, from Japan! At KubeCon + CloudNativeCon Japan 2026 in Yokohama, I
interviewed OpenTelemetry end users and practitioners from the Japanese cloud
native community, and learned how they got involved with OTel:

- [Yuzuru Ohira](https://github.com/yuzujoe) (LayerX)
- [Mikata Chikahisa](https://github.com/chmikata) (Loglass)
- [Yoshiki Fujikane](https://github.com/ffjlabo) (CyberAgent)
- [Takashi Okamoto](https://github.com/okamototk) (NTT DATA)
- [Kohei Sugimoto](https://github.com/kohbis) (MIXI)

The interviews were conducted in Japanese, and the transcript below is an
English translation.

<!-- TODO: Embed the YouTube recording once the edited footage is published. -->

Thanks to everyone who has contributed to OpenTelemetry to date. We look forward
to your continued contributions in 2026 and beyond! 🎉

## Transcript

If reading is more your thing, check out the following transcript of our
conversations.

### 1- Meet the Humans of OTel

**YUZURU OHIRA:** I'm Yuzuru Ohira. I work as an engineering manager at LayerX.

**MIKATA CHIKAHISA:** My name is Mikata, and I'm an SRE at Loglass.

**YOSHIKI FUJIKANE:** My name is Yoshiki Fujikane, and I work as a platform
engineer.

**TAKASHI OKAMOTO:** I'm Takashi Okamoto, an AI strategist at NTT DATA.

**KOHEI SUGIMOTO:** My name is Kohei Sugimoto, and I'm an SRE at MIXI.

### 2- How did you get involved in OpenTelemetry?

**YUZURU OHIRA:** I used to work at an observability company, where I worked on
OpenTelemetry, and I've stayed involved by actually using OpenTelemetry at my
current company.

**MIKATA CHIKAHISA:** We had a project to introduce the Grafana stack, and that
was my first encounter with OpenTelemetry.

**YOSHIKI FUJIKANE:** To improve observability on the platform we run
internally, we use SaaS tools like Datadog, and we're now at the stage where we
want to adopt the OpenTelemetry Collector in particular. We're currently in the
evaluation phase, and starting to use it for that evaluation is what got me
involved.

**TAKASHI OKAMOTO:** When we first started with observability, every vendor was
doing things differently, but then it got standardized with OpenTelemetry. I
thought that was great, and that's what got me involved.

**KOHEI SUGIMOTO:** While using observability SaaS products, I was looking for
something that would fit us better, and that's when I came across OpenTelemetry.

### 3- What is the meaning of observability?

**YUZURU OHIRA:** To me, it's part of the system architecture — something you
design as part of the architecture of the code you write.

**MIKATA CHIKAHISA:** I think of it as essential information for showing the
health status of a system.

**YOSHIKI FUJIKANE:** Observability is one of the essential keys to operating a
system. As you develop services of all sizes, years go by and knowledge about
those services fades away. Even so, you can continuously collect signals from
the system and use them to understand the system as a black box, which I find
valuable from an operations standpoint. In that sense, I feel observability is
something we truly need.

**TAKASHI OKAMOTO:** Observability is like a peephole that lets you see
everything in the system — the bad parts and the good parts.

**KOHEI SUGIMOTO:** I think it's a means to correctly understand your system and
improve it in the right direction.

### 4- What is OpenTelemetry to you?

**YUZURU OHIRA:** OpenTelemetry is the most fundamental way of thinking when
designing observability, so for me it's like a textbook — I refer to what
OpenTelemetry implements when building my own implementations.

**MIKATA CHIKAHISA:** I think of it as the standard rules and specifications for
expressing the health status of a system.

**YOSHIKI FUJIKANE:** What is OpenTelemetry to me? That's a really hard one. For
me, at this point, it's a fascinating thing to experiment with.

**TAKASHI OKAMOTO:** OpenTelemetry is what feeds that peephole — it carries all
kinds of data: metrics, logs, and traces. So it's a pipe. Well, calling it a
"hole" would be rude — it's a pipe.

**KOHEI SUGIMOTO:** Observability comes with a lot of difficulties, and I think
OpenTelemetry is something that gives us a guiding principle amid all that.

### 5- What is your favorite telemetry signal?

**YUZURU OHIRA:** I love tracing.

**MIKATA CHIKAHISA:** Traces. I believe traces are the foundation of everything
— the first, most important core part — so I really love traces.

**YOSHIKI FUJIKANE:** My favorite signal would be traces. Personally, I really
enjoy learning how systems work, so a signal that tells me what behavior
occurred inside the system and what happened as a result fits me best. That's
why I chose traces.

**TAKASHI OKAMOTO:** Rather than a signal per se — I've been working on
observability for AI agents lately, so I like the
[Generative AI semantic conventions](/docs/specs/semconv/gen-ai/).

**KOHEI SUGIMOTO:** Metrics. Among the many kinds of telemetry data, metrics can
nicely absorb the others and contribute to things like cost optimization and
summarization. That's why.

## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we'd love to hear from you! Ways to share:

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
