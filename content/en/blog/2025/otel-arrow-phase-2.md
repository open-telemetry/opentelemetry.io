---
title: {{ replaceRE "[-_]" " " .Name | title }}
linkTitle: OpenTelemetry Protocol with Apache Arrow Phase 2
date: {{ dateFormat "2006-01-02" .Date }}
author: >-
  [Joshua MacDonald](https://github.com/jmacd) (Microsoft),
  [Laurent Quérel](https://github.com/lquerel) (F5)
draft: true
issue: 6410
sig: OTel-Arrow
---

## OTel-Arrow project announcement

We are excited to announce the next phase of the OpenTelemetry Protocol with
Apache Arrow project. We began this project several years ago with the goal of
bridging between OpenTelemetry data and the Apache Arrow ecosystem. Apache Arrow
is a framework for zero-copy exchange of structured data between column-oriented
data producers and consumers.

We believe that having OpenTelemetry data accessible to external systems through
Apache Arrow will lead to powerful integrations, with the potential for new
telemetry systems and applications to emerge. For large streams of telemetry, we
know that column-oriented data handling is substantially more efficient, with
improved data compression performance.

We are choosing to investigate this phase of the project in Rust. With the help
of the governance committee, we've defined a project scope that entails studying
the potential for Rust-based OpenTelemtry pipelines without "being" a Collector.
We will investigate the both the performance of Rust pipeline as well as how to
successfully integrate our work with the OpenTelemetry Collector's Golang-based
ecosystem.

This project aims to answer our original hypothesis. We are investigating what
happens and what is possible if we use a zero-copy, column-oriented paradigm
from end to end, starting in the SDK and carried through pipeline.

We couldn't help but notice: the Rust ecosystem around Apache Arrow is large and
vibrant, and we think it would be a missed opportunity not to explore this
space. We are particularly interested in connecting the Apache DataFusion
library with OpenTelemetry pipelines, and we believe that OpenTelemetry users
will benefit from more direct integrations with their data lake.

We are motivated to build an end-to-end OTAP pipeline in Rust, where telemetry
data is placed into Arrow record batches as it is produced. The OTel-Arrow
project expects to align closely with the OpenTelemetry-Rust SDK as we explore
this opportunity. We are interested in making OTAP pipelines safely embeddable,
through strict controls on memory and through support for thread-per-core
runtimes.

In the first phase of the project, we developed the protocol through a Golang
adapter library and a matching pair of Exporter and Receiver components in the
OpenTelemetry Collector Contrib repository. We will continue to maintain these
components, ensuring there are no barriers between Go and Rust pipelines, and we
will continue this commitment. We will ensure that OTAP pipelines can be
executed from the OpenTelemetry Collector. We want to give OTAP pipelines
written in Rust access to Golang Collector components, too.

To kick the project off, Laurent Quérel working at F5 has contributed the work
behind his original OTel-Arrow prototype, a Rust-based pipeline framework
modeled on the OpenTelemetry Collector. Lei Huang working at Greptime has
contributed a Rust implementation for converting the metrics signal from OTAP to
OTLP (link).

The newly formed OTel-Arrow SIG has a meeting slot on the OpenTelemetry
calendar, see you there!
