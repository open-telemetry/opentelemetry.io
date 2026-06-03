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
with a discriminator. OpenTelemetry's `process` entity is a good model: a PID can
be recycled, so a process is identified by `process.pid` **and**
`process.creation.time` together — stable for that process's lifetime — while its
changing facts stay descriptive.

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

## Relationships: the edge of the spec — literally

Inventory is half the story; **topology** is the other half — "this process _runs
on_ that host," "this interface _connects to_ that switch." Here's the catch: the
OpenTelemetry Entity Data Model **does not model entity-to-entity relationships
yet**.
[OTEP 0256](https://github.com/open-telemetry/oteps/blob/main/text/entities/0256-entities-data-model.md)
lists relationships as explicit _Future Work_, citing exactly cases like "Process
runs on Host."

A graph consumer needs edges today, so one pragmatic approach is a
**vendor-neutral, non-standard extension** that never pretends to be standard
OTel. It can ride the same log-record convention under an `entity.relation.*`
namespace:

```text
# A relationship — a vendor-neutral entity.relation.* extension
LogRecord
  attributes:
    entity.relation.event.type: state                   # or delete
    entity.relation.type:       runs_on
    entity.relation.from.type:  process
    entity.relation.from.id:    { process.pid: 1287, process.creation.time: "2026-05-26T08:00:00Z" }
    entity.relation.to.type:    host
    entity.relation.to.id:      { host.name: web-server-1 }
```

The namespace is a deliberate choice: _not_ `otel.entity.relationship.*` (that
would squat a reserved OTel namespace before the spec exists), and _not_ a
vendor-specific prefix (a neutral name lets any producer and any consumer speak
it). It is shaped to map 1:1 onto the eventual relationships standard. A relation
record also carries **no `otel.entity.*` attribute at all** — its lifecycle rides
the neutral `entity.relation.event.type`, so a standard OTel entity-events
consumer cleanly ignores it instead of choking on a malformed-looking entity
event.

This is exactly the kind of thing that belongs upstream. If you care about
inventory and topology semantics in OpenTelemetry, relationships are an open
design area — and reference consumers exercising real queries are a good way to
pressure-test proposals.

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
- Relationships aren't in the spec yet — a great place to contribute.

## Get involved

- Read the [Entity Data Model](/docs/specs/otel/entities/data-model/) and
  [OTEP 0256](https://github.com/open-telemetry/oteps/blob/main/text/entities/0256-entities-data-model.md),
  then join the conversation in the OpenTelemetry **Entities SIG** and **Semantic
  Conventions** — relationships are open design space.

_Thanks to the Entities SIG for the spec work this builds on._
