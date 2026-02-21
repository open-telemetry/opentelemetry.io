---
title: OpenTelemetry with Mainframes
linkTitle: Mainframes
weight: 420
description:
  Use OpenTelemetry to gain observability into mainframe workloads alongside
  your cloud and distributed systems.
---

Mainframes continue to run a large share of the world’s most critical
workloads—especially in banking, insurance, government, retail, and airlines.

They often sit at the **core of a hybrid architecture**, with web and mobile
frontends, microservices, and cloud platforms all depending on mainframe systems
of record.

This section explains how mainframes fit into an OpenTelemetry-based
observability strategy and points to guidance on integrating them with your
existing telemetry pipelines.

## Who this guide is for

This content is aimed at people who:

- Are already familiar with [OpenTelemetry concepts](/docs/concepts/) (traces, metrics, logs,
  OTLP, the Collector).
- Work primarily in **distributed / cloud native** environments (Kubernetes,
  VMs, serverless, etc.).
- Need to understand **what a mainframe is**, why it matters, and how to bring
  mainframe workloads into an end-to-end observability story.

You do _not_ need prior mainframe experience, and you do not need to be a COBOL
or z/OS expert to benefit from this section.

## What we mean by “mainframe”

In this documentation, “mainframe” generally refers to:

- Platforms such as **IBM z/OS® mainframes** and compatible environments that
  host:
  - Transaction processing (e.g., CICS®, IMS™ and similar subsystems)
  - Batch processing (JCL-driven jobs, schedulers)
  - High-value systems of record (databases and files that are the “source of
    truth”)
  - Large **high-volume transaction processing** and **batch workloads**.

While the details vary by vendor and product, most mainframe environments share
characteristics that affect observability:

- Very high throughput and strict latency/availability requirements
- Long-lived applications and data formats
- Strong security and compliance constraints

## How mainframes show up in OpenTelemetry architectures

From an OpenTelemetry perspective, mainframes are usually part of a **larger,
hybrid system**:

- **Frontends and APIs** run in browsers, mobile apps, or API gateways.
- **Microservices and middleware** run in containers, VMs, or managed cloud
  services.
- **Core business logic and data** live on the mainframe and are accessed via
  MQ, HTTP(S), gRPC, message buses, or proprietary protocols.

In a typical architecture, telemetry flows might look like:

- Distributed services emit **traces, metrics, and logs** via OpenTelemetry SDKs
  and the Collector.
- Integration tiers (API gateways, ESBs, MQ bridges, data streaming platforms)
  act as **interception points** where you can correlate cloud requests with
  mainframe activity.
- Mainframe-resident components emit **events,
  [SMF records](https://www.ibm.com/docs/en/zos/3.2.0?topic=smf-introduction),
  logs, or metrics** that must be transformed or exported into OpenTelemetry
  formats (often via a Collector or gateway running off-platform).

The goal of this section is to help you **connect those dots** so you can see a
single, coherent picture across mainframe and non-mainframe systems.

## What’s different about mainframes (from an observability point of view)

When you bring OpenTelemetry into a mainframe context, you will often encounter:

- **Different mental models**
  - LPARs, address spaces and jobs instead of hosts, pods and services
  - Datasets and VSAM files instead of object storage buckets
- **Pre-existing telemetry and formats**
  - System Management Facilities (SMF) records
  - SYSLOG
  - LOGREC
  - subsystem logs
  - job logs
  - performance monitors
  - (The above need parsing and mapping into **traces, metrics, and logs** as
    defined by OpenTelemetry)
- **Access and change constraints**
  - Production mainframes often have strict change control and limited ability
    to modify application code.
- **Scale and reliability expectations**
  - Telemetry solutions must keep up with **very high transaction rates**
    without impacting SLAs.
  - Data pipelines must be robust and secure enough to meet regulatory
    requirements.

These characteristics don’t prevent the use of OpenTelemetry, but they influence
**where and how** you collect, transform, and export telemetry.

## How OpenTelemetry can help

OpenTelemetry provides building blocks that can be applied to mainframe
environments, including:

- **Vendor-neutral data model** for traces, metrics, and logs.
- **OTLP** as a standard, interoperable transport protocol.
- The **OpenTelemetry Collector**, which can:
  - Ingest data from multiple protocols and formats
  - Transform and enrich data
  - Export transformed data to your chosen observability backends

In a mainframe context, the Collector often runs **off-platform** (for example,
on Linux servers or containers) and acts as a **bridge** between:

- Mainframe-specific telemetry sources, and
- Your enterprise observability backends (metrics/logs platforms, tracing
  backends, APM tools, SIEMs, and data lakes).

## Current status

Some limited OpenTelemetry instrumentation already exists for mainframes, but
this continues to be a work in progress.

Historically, much of this mainframe-specific instrumentation has been vendor
supplied. Many observability backend vendors provide vendor-specific extensions
or agents to package and ship mainframe telemetry to their observability
backend.

However, as more and more mainframe customers are requesting OpenTelemetry
support, this landscape is quickly changing -- with customers preferring more
vendor-neutral approaches. Vendors are responding in kind.

IBM, which supplies the operating system and subsystem software for the most
pervasively used mainframe systems, is currently in the process of including
native OpenTelemetry support into its operating systems and subsystems.

Many Independent [Mainframe] Software Vendors (ISVs) are also transitioning
their observability support to favor the OpenTelemetry vendor-neutral approach.

Of course, this successful transition depends upon common terminology and
semantics.

## Working group and community

The **OpenTelemetry on Mainframes Special Interest Group (SIG)** is currently
focused on:

- Defining common terminology and use cases
- Identifying gaps in specifications (OpenTelemetry Semantic Conventions), SDKs,
  and Collector components related to mainframe use cases

The SIG currently has representation from IBM, Broadcom and other ISVs,
observability backend vendors, and some customers. But we are always in need of
more help!

If you are interested in contributing, see the 
[Community](https://opentelemetry.io/community/) and 
[SIG information](https://github.com/open-telemetry/community#special-interest-groups) 
in the OpenTelemetry repositories and website for 
[meeting times](https://groups.google.com/a/opentelemetry.io/g/calendar-mainframe), 
[meeting minutes](https://docs.google.com/document/d/14p-bpofozTL4n3jy6HZH_TKjoOXvog18G1HBRqq6liE), 
and communication channels 
([#otel-mainframes](https://cloud-native.slack.com/archives/C05PXDFTCPJ)).
