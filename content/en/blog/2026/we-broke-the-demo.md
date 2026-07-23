---
title: We broke the demo
linkTitle: We broke the demo
date: 2026-07-27
author: >-
  [Juliano Costa](https://github.com/julianocosta89) (Datadog)
sig: Demo
# prettier-ignore
cSpell:ignore: agentic Bourgey Cijo cijothomas Dónal fali007 fbourgey firepit florianl Kielek Kiełkowicz Lehner martinjt mwimpelberg28 O'Sullivan osullivandonal Pratik ps48 Shenoy Thwaites Wimpelberg
issue: 10921
---

If you've been running the Demo for some time, you may have seen a couple of
structural changes lately, and you may even have gotten mad about things not
working as expected. We feel your pain and we totally understand it.
Unfortunately there was no better way to change things without breaking the
existing flow.

Some of what you knew is gone. New services were added. Attribute names have
changed. If you had dashboards with custom metrics, everything is broken now.

This was no accident.

The OTel Demo has always been a living reference implementation, a place where
the community shows what's possible to be done with OTel. After a while, we
accumulated things that were getting in the way of where we wanted to go. 3.0 is
us clearing that out. Intentionally, with some short-term pain, and very much on
purpose.

Here are the highlights of what has changed.

## What we broke (and why)

Two changes will hit you immediately if you're upgrading: one breaks your
dashboards, the other breaks how you run the Demo locally or in your fork.

### The rename nobody wanted but everyone needed

This one deserves its own section because it touches every service and will
break your existing dashboards and queries: All custom telemetry attributes have
been renamed from `app.*` to `demo.*`.

Every single one. `app.product.id` is now `demo.product.id`. `app.order.id` is
`demo.order.id`. `app.payment.amount` is `demo.payment.amount`. And so on,
across all services. But why?

When we started the OTel Demo back in 2022 `app.*` wasn't a reserved attribute
and we built all our custom attributes and metrics with that namespace. Time has
passed and in 2023 `app.*` was added to the project to
[describe attributes related to client-side applications (e.g., web apps or mobile apps)](/docs/specs/semconv/registry/attributes/app/).

But if that was introduced in 2023, why was the Demo still using it?

Well, we can think of two main reasons:

- We needed the tooling to help us with that.
- We needed more contributors to help on the task.

The first got solved by [Martin Thwaites](https://github.com/martinjt) when he
brought [OpenTelemetry Weaver](https://github.com/open-telemetry/weaver) to the
Demo. The second got solved by the help of
[Florian Bourgey](https://github.com/fbourgey) who became Demo contributor
through the
[Bloomberg mentorship](https://www.cncf.io/blog/2026/03/31/sustaining-opentelemetry-moving-from-dependency-management-to-stewardship/).
That just shows how intertwined the OTel Demo is with the whole OTel ecosystem.

### From `docker-compose.yaml` to `compose.yaml`, and a mode for every use case

Another breaking change: `docker-compose.yaml` is gone. It's now `compose.yaml`,
split across multiple files, and it now supports multiple different ways to run
the Demo, from the full default stack down to leaner combinations that drop
Kafka, the observability stack, or both.

Why go through the trouble? Two reasons: maintainability and making fork owners'
lives easier. The OTel Demo is the most forked project under the OTel org, with
6,859 forks, and that configurability lets those forks' maintainers stop
carrying full copies of our compose files and Collector config, layering their
changes on top instead. It also means vendors deploying their own backend can
run the Demo without our observability stack getting in the way, instead of
ripping it out by hand.

## What we added

With the breaking changes out of the way, here's what's genuinely new in 3.0.

### The big new thing: Agentic Demo

Have you ever tried to trace an agentic AI system and wondered what that's even
supposed to look like? What span represents "the agent decided which tool to
use"? How do you measure LLM latency when there's caching involved? What does
the full trace look like end to end? What were the arguments used by an agent to
invoke a tool? What was the total token usage for a complete workflow?

3.0 finally gives us a real answer to those questions.

It took quite a while to actually get this one merged.

We added three brand-new services that form a complete, observable AI stack:

- A LangGraph ReAct agent that accepts user requests, reasons about them, and
  picks the right tools to call and return the response to the user. This also
  supports multi-turn requests where users can ask a follow-up question on the
  generated responses.
- A Model Context Protocol (MCP) server that exposes the Demo capabilities as
  tools the agent can discover and invoke.
- A Chatbot UI where real users can interact with the agent in real time.

The agent supports both native LangGraph tools and MCP tools, includes LLM
response caching, and (most importantly for us) is fully instrumented with
OpenTelemetry. Every tool call, every LLM interaction, every reasoning step
provides a distributed tracing capability from chatbot to agent, then agent to
MCP, MCP to other microservices via frontend and back to the user. All the
telemetry data produced flow through the OTel Collector pipeline.

Talking about OTel pipeline, as we are the OpenTelemetry Demo, we follow OTel
Semantic Conventions, hence we have also added the
[gen-ai normalizer processor](https://github.com/open-telemetry/opentelemetry-demo/pull/3604)
to the Collector, to convert Traceloop/OpenLLMetry telemetry into official
`gen_ai.*` semconv.

If you're building AI systems and wondering how to observe them properly with
OpenTelemetry, you can now run the Demo and see exactly what that looks like.

### Continuous profiling

Continuous profiling is something we've wanted in the Demo for a long time. We
started that
[discussion](https://github.com/open-telemetry/opentelemetry-demo/issues/1601)
back in 2024. 3.0 finally ships it. We added continuous profiling support using
[firepit](https://github.com/florianl/firepit) as the backend with a web UI for
viewing profiles. The Demo now covers the complete picture: traces, metrics,
logs, and profiles, all flowing through the same pipeline.

### OpAMP server

Everything in the Demo sends signals to a single Collector instance, but real
deployments don't run one Collector. They run tens of them, sometimes thousands,
spread across services, regions, and teams. And once you're at that scale, a new
question shows up: How do you actually know what configuration each of those
Collectors is running, and how do you change it without using SSH to log in to
every box?

That's the problem the Open Agent Management Protocol (OpAMP) exists to solve,
and 3.0 adds an OpAMP server to the Demo so you can see it working end to end.

The mechanics: The Collector already ships an OpAMP extension. When it's
configured, that extension opens a WebSocket connection to the OpAMP server and
starts reporting the Collector's state (version, OS, current configuration, and
health status) on an ongoing basis.

In the Demo, you can watch this happen at `http://localhost:8080/opamp/`. The UI
shows the Collector reporting in, and you can check all Collector's details as
well as the complete active configuration.

This is the backbone for future updates where remote config will be allowed.

## What we improved

3.0 isn't just new things and broken things. It also makes existing pieces of
the Demo better.

### Replicating real production environments

In real production systems, multiple instrumentation standards coexist. You
don't get to start from a blank slate. To reflect that reality, the `Ad` service
now exposes a Prometheus `/metrics` endpoint with a custom
`demo_ad_served_total{category}` counter, scraped by the OTel Collector via a
`prometheus/ad` receiver. This makes the Demo closer to what you'd actually
encounter in production: a system where not every service speaks the same
instrumentation language, and the OTel Collector is what ties it together.

We also added `SQLCommenter` support for the `Product Catalog` service. Database
queries now carry OpenTelemetry trace context embedded in SQL comments, enabling
correlation between distributed traces and PostgreSQL query logs, another
pattern straight out of real-world observability work.

### The new load generator

Locust had done the job since the very first release, but it came with a large
Python dependency tree (over a thousand lines of pinned requirements). 3.0
replaces it with [k6](https://k6.io/), a load testing tool that ships as a
single Go binary, and the load test script was rebuilt from scratch on top of
it.

The centerpiece is a new custom extension, xk6-otel, that bridges the
OpenTelemetry Go SDK straight into k6's JavaScript runtime. Every scenario opens
a real OTel span for each task, injects a `W3C traceparent` into every outgoing
request, and propagates the same baggage the old Locust hooks did, so the load
generator's traffic still looks like the previous one.

There are two main pluses though. K6's own built-in test metrics (Virtual Users
(VUs), request duration, and so on) are shipped out via OTLP, which means that
now both "how the test performed" and "what the test produced" land in the same
pipeline. And the most impressive one is memory consumption. The new load
generator is now shipped with a memory limit of 512 MiB where Locust used to use
1,500 MiB.

### A new test suite

We built a telemetry sanity testing framework that actually validates the
end-to-end observability pipeline. The framework walks traces in Jaeger to
verify service-to-service edges (making sure every span flows correctly through
the system), metrics in Prometheus, and logs in OpenSearch.

This is not the kind of work that makes for exciting release notes, but we can
definitely say that we merge PRs more confidently now that this exists.

### The unglamorous work: Clearing a 62-item vulnerability backlog

Not everything in this release is a new service or a new capability. Some of it
is just debt that had quietly piled up, and this cycle we finally paid a big
chunk of it down.

Earlier this year, [Piotr Kiełkowicz](https://github.com/Kielek) reached out
after checking the Demo's OpenSSF Scorecard results: 62 vulnerabilities flagged,
most of them traceable to a growing pile of stale, unmerged Dependabot PRs. That
backlog existed for a mundane but familiar reason: maintainer bandwidth. With
approvers stretched thin, dependency bumps kept queuing up faster than they
could be reviewed and merged with confidence, and confidence was the real
bottleneck as nobody wants to merge a wave of dependency updates into a project
this size without a way to know if something quietly broke.

Piotr started chipping away at the backlog, and the timing lined up well with
another piece of this release: the new telemetry sanity testing framework we
already mentioned. Once we had automated checks walking traces, metrics, and
logs end to end, merging a dependency bump stopped being a leap of faith. That
confidence is what let the backlog actually move instead of just growing.

The result: from 62 flagged issues down to single digits, with more than 300
CVEs resolved in total along the way as the cleanup gathered momentum across the
whole dependency graph. The project is noticeably healthier because of it.

## What 3.0 sets up

If you step back and look at the shape of this release, the OpenTelemetry Demo
is no longer just a "trace a shopping cart" reference app. It's a comprehensive,
multi-signal reference that now covers:

- Agentic AI systems and how to instrument them
- Continuous profiling alongside traces, metrics, and logs
- A mixed instrumentation setup to demonstrate zero-code instrumentation, as
  well as manual instrumentation
- OpenFeature flag evaluation with telemetry
- Database query correlation via SQLCommenter
- Different standards to replicate real-world production scenarios

And a lot more that wouldn't fit a single blog post.

## Call to action

Between the attribute rename and the move to `compose.yaml`, your fork or your
vendor instructions are broken somewhere. To wrap things up, there is a call to
action to every vendor that has instructions on how to configure the OTel Demo
to send data to their backend (yes, all 45 listed on the main
[README](https://github.com/open-telemetry/opentelemetry-demo#demos-featuring-the-astronomy-shop)).
Please take a look at your current instructions and update them, as they don't
work anymore. We have created an
[issue to track all updates](https://github.com/open-telemetry/opentelemetry-demo/issues/3720)
and we will remove the non-checked entries from the main README after 60 days of
the 3.0 release.

## Thank you

None of this happens without the people who contributed to it. A big thank you
to everyone who opened a PR, reviewed one, reported an issue, or showed up to a
special interest group (SIG) call during this cycle. The cleanup PRs, the
telemetry renames, the new services, all of it was community work, and it shows.

Specific thanks to:

- [Felix George](https://github.com/fali007), for the patience and commitment
  that got the agentic services merged.
- [Dónal O'Sullivan](https://github.com/osullivandonal) and
  [Florian Lehner](https://github.com/florianl), for continuous profiling and
  firepit.
- [Martin Thwaites](https://github.com/martinjt), for bringing OpenTelemetry
  Weaver to the Demo.
- [Florian Bourgey](https://github.com/fbourgey), for driving the attribute
  rename work.
- [Shenoy Pratik](https://github.com/ps48), for building the telemetry sanity
  test suite.
- [Cijo Thomas](https://github.com/cijothomas), for pushing the OpAMP server
  through.
- [Matthew Wimpelberg](https://github.com/mwimpelberg28), for driving the k6
  load generator migration.
- [Piotr Kiełkowicz](https://github.com/Kielek), for chipping away at the
  vulnerability backlog until it was gone.

We broke the Demo to build something better. I hope you find 3.0 worth the
upgrade.

Give it a try, and let us know what you find. Open an issue, drop by the SIG
call, or find us in the
[CNCF Slack](https://cloud-native.slack.com/archives/C03B4CWV4DA). That's how
this works.
