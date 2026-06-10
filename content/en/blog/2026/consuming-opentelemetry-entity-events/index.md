---
title: What can you do with OpenTelemetry entity events?
linkTitle: Consuming entity events
date: 2026-06-15
author: >-
  [Matthieu Noirbusson](https://github.com/MatthieuNoirbusson) (Sensor
  Factory)
issue: 10115
sig: "Specification: Entities" # verified against open-telemetry/community SIG list
draft: true
# cSpell:ignore Noirbusson Toise Pebble gqlgen bitemporal semconv kvlist
---

Metrics, logs, and traces tell you how your systems _behave_. They are much
quieter about what actually _exists_: which hosts, interfaces, switches,
services, and volumes are out there right now, how they connect, and — crucially
— how that picture changed over the last hour, day, or quarter. That living
inventory and topology has stayed a blind spot in the open observability stack.

OpenTelemetry's **entity events**, coming out of the Entities SIG and described
in the
[Entity Data Model](/docs/specs/otel/entities/data-model/), are the piece that
starts to close it. But entity events are a _stream_. The interesting question
isn't only "how do I emit them?" — it's **"what do I do once they arrive?"**
This post walks through one answer, using an open-source consumer as a worked
example.

> **Disclosure:** I work on [Toise](https://toise.dev), an Apache-2.0 project
> used below as a concrete example. Everything here is about the general shape of
> consuming entity events; the lessons apply to any consumer. The entity data
> model and its conventions are still **in development** (not yet stable) and
> evolving — treat the exact attribute names below as illustrative and check them
> against the current spec.

## A 60-second primer on entity events

An entity is a thing worth tracking on its own: a host, a process, a network
interface, a database. OpenTelemetry carries _entity events_ as **OTLP log
records** annotated with the entity semantic conventions. Each event carries the
entity's type, its identifying attributes, its descriptive attributes, and an
event type describing its lifecycle. A consumer can classify a record purely by
the presence of `otel.entity.event.type`:

```text
# An entity-event log record (illustrative)
LogRecord
  Timestamp: 2026-05-26T08:00:00Z              # the producer-side time
  attributes:
    otel.entity.event.type: entity_state       # observed; or entity_delete
    otel.entity.type:       host
    otel.entity.id:         { host.name: web-server-1 }            # identity (a map)
    otel.entity.attributes: { os.type: linux, host.arch: amd64 }   # descriptive (a map)
```

Producers emit these — a host agent, a network agent, anything that speaks OTLP.
The consumer's job is to turn a sequence of such observations into something you
can _ask questions of_. The shape is a pipeline:

![A pipeline: OpenTelemetry producers emit entity events over OTLP into a durable, event-sourced log; a projection replays the log into a live, bi-temporal entity graph, exposed through a GraphQL API for humans and tools and an MCP server for an AI assistant.](pipeline.svg)

The rest of this post is the four steps in that pipeline.

## Step 1 — Don't store state, store the stream

The instinct is to keep a table of "current entities" and update rows in place.
That throws away exactly what makes infrastructure hard: **time**. The moment you
overwrite `web-server-1`'s address, you lose the fact that it changed and when.

A better default is **event sourcing**: append every entity event to a durable,
ordered log and treat that log as the system of record. The current graph is then
a _projection_ — replay the log into an in-memory model of entities and
relationships. Rebuilding the whole graph from scratch is just a replay.

The payoff: current state is one read away, and **history is never lost**.

## Step 2 — Be bi-temporal on purpose

Two timestamps matter, and they are not the same:

- **Event time** — when something happened in reality. Take it from the
  `LogRecord` timestamp.
- **Recorded time** — when _you_ learned about it. Stamp it yourself at ingest;
  never take it from the producer.

Keeping both lets you answer two genuinely different questions:

- _Reality view:_ "How was `db-07` wired last Tuesday?"
- _Audit view:_ "What did we **know** about `db-07` at 09:00 — not what we know
  now?"

That second question is the one that matters during an incident review, and you
can only answer it if you never collapsed the two timelines. Designing for
bi-temporality from day one is far cheaper than retrofitting it.

## Step 3 — Give entities an immutable identity

OpenTelemetry treats an entity's **Id as immutable**, and that turns out to be
the right discipline for a graph that wants to be a source of truth. Match
identity **exactly**: an observation is either a known entity (same Id) or a
different one.

The trap is putting a value that _changes_ into the identity. If a host's
identity includes its current leased IP, a DHCP renewal forks it into a brand-new
entity. Pick attributes that stay stable for the entity's lifetime, and let
everything that legitimately changes — current address, resource usage, last-seen
state — be a _descriptive_ attribute. Then a re-address is an attribute update on
the _same_ entity, and a genuine identity change is correctly a _new_ entity
rather than a silent merge of two different things.

When a single value is reused over time, the fix isn't to drop it but to pair it
with a discriminator. OpenTelemetry's
[`process` entity](https://opentelemetry.io/docs/specs/semconv/registry/entities/process/#process)
is a good model: a PID can be recycled, so a process is identified by
`process.pid` **and** `process.creation.time` together — stable for that
process's lifetime — while its changing facts stay descriptive.

This is worth getting right early: a "tolerant" match that treats an observation
differing by one identifying value as the same entity quietly merges distinct
entities — two databases on a host differing only by port collapse into one. For
a source of truth, a silent collision is a worse failure than a lost heuristic.

## Step 4 — Make it queryable, including by an LLM

A temporal graph is only useful if people (and machines) can ask it things.
Exposing it twice covers both audiences:

- A **GraphQL API** for humans, dashboards, and tools.
- A **Model Context Protocol (MCP) server** so an AI assistant can query the
  graph on an operator's behalf.

The MCP angle is where entity events get genuinely fun. Because every
type/field/argument carries a rich description, an LLM can _introspect_ the
schema and call typed tools — find entities, get neighbors, entity history,
recent changes, describe schema — to answer questions in plain language:

```text
$ ask "which switches did db-07 depend on last Tuesday — and what changed since?"

→ db-07 dependency path @ 2026-05-26
    core ← leaf-sw-3, spine-sw-1
  Δ since: leaf-sw-3 → leaf-sw-9 (2026-05-28 14:12 UTC)
    spine path unchanged
```

No dashboard pivoting; the assistant reasons over a live, time-aware graph that
came entirely from OTLP entity events.

## Relationships are now in the spec

Inventory is half the story; **topology** is the other half — "this service
_depends on_ that database," "this process _runs on_ that host." When this post
was first drafted, relationships were still future work; since then the
entity-events specification has been **merged** and models them directly — see
[Entity events](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/entities/entity-events.md)
([opentelemetry-specification#4836](https://github.com/open-telemetry/opentelemetry-specification/pull/4836)).

Relationships are **embedded in an entity's state event** as an
`entity.relationships` array. Each descriptor names a relationship `type` and the
target entity (its `entity.type` and `entity.id`); direction is
`source --[type]--> target`, and the types are an open enumeration (`depends_on`,
`contains`, …):

```text
# Relationships ride inside an entity-state event (approved spec, #4836)
LogRecord
  attributes:
    otel.entity.event.type: entity_state
    otel.entity.type:       service.instance
    otel.entity.id:         { service.instance.id: checkout-1 }
    entity.relationships:
      - type:        depends_on
        entity.type: service.instance
        entity.id:   { service.instance.id: payments-1 }
```

The edges travel with the entity that owns them, not as separate events: removing
a relationship is just the source re-emitting its state without that descriptor. A
consumer building a temporal graph reads each state event, upserts the entity, and
reconciles its outgoing edges — gaining and losing relationships as the array
changes over time, which slots into the same change taxonomy as attribute updates.

## Why a graph: it joins your other signals

The point of all this isn't a standalone inventory — it's leverage on the
telemetry you already have. OpenTelemetry carries entities on the
[**Resource**](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/data-model.md),
so the same entities you're tracking are already attached to your metrics, logs,
and traces. The inventory and topology graph becomes the **join key** across
them:

- **Scope, not scrape.** Use the graph to decide _which_ signals to pull — the
  entities and the slice of topology you actually care about — instead of querying
  blindly.
- **Correlate by entity.** Tie a metric spike, a log line, and a trace to the same
  host, process, or service because they share an entity identity, not because you
  hand-matched labels.
- **Follow the edges.** Relationships (`depends_on`, `runs_on`) turn correlation
  into blast-radius reasoning: when `db-07` degrades, the graph points you at the
  upstream services whose traces and metrics to look at first.

A live, time-aware graph of what exists and how it connects is what lets you ask
those questions of the rest of your observability data — and answer them as of any
point in time.

## Keep the producer side generic

A consumer should ingest from **any** OpenTelemetry producer and speak the
standard, not a proprietary protocol — it runs no collectors of its own and polls
no devices directly. Emitting entity events from hosts, network gear, or cloud
APIs is the producers' job. Keeping the producer side generic is what keeps the
ecosystem open.

## A few operational notes

A consumer that wants to be a source of truth has to face some realities:

- **Clock skew.** Event time comes from producers, whose clocks drift relative to
  each other. Don't assume a single global order across producers; reason on
  per-entity timelines, and keep your own recorded time as the tiebreaker for
  "what did we know, and when."
- **Volume and heartbeats.** Producers re-assert entities periodically, so most
  events say "nothing changed." Coalesce consecutive unchanged observations (keep
  the first and last of a run) so steady-state traffic doesn't balloon the log —
  while keeping structural changes, like a relationship appearing or disappearing,
  verbatim.
- **Silent merges.** The flip side of exact identity: if two distinct entities
  accidentally share an identifying key, they collapse into one. Treat identity
  keys as a contract with producers, and prefer failing loudly — a rejected or
  flagged observation — over a quiet merge.

## Takeaways

- Entity events turn "what exists and how it connects" into first-class
  OpenTelemetry data.
- Consume them as an **event-sourced, bi-temporal** stream, not a mutable table.
- Treat the entity **Id as immutable** and match it exactly — put volatile facts
  in descriptive attributes so history survives change.
- Expose the graph for both humans (GraphQL) and assistants (MCP); the
  natural-language query story is a strong reason to care.
- Relationships now have an approved spec — embedded in each entity's state event.
- Entities ride on the Resource, so the graph is a join key for your existing
  metrics, logs, and traces.

## Get involved

- Read the [Entity Data Model](/docs/specs/otel/entities/data-model/) and
  [OTEP 0256](https://github.com/open-telemetry/oteps/blob/main/text/entities/0256-entities-data-model.md),
  then join the conversation in the OpenTelemetry **Entities SIG** and **Semantic
  Conventions** — the entity-events and relationships work is approved and still
  moving (identity scope and more are in flight).

_Thanks to the Entities SIG for the spec work this builds on._
