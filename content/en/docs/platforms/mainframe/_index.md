---
title: OpenTelemetry with Mainframes
linkTitle: Mainframes
weight: 420
description: Use OpenTelemetry to gain observability into mainframe workloads alongside your cloud and distributed systems.
---

Mainframes continue to run a large share of the world’s most critical workloads—especially in banking, insurance, government, retail, and airlines.  
They often sit at the **core of a hybrid architecture**, with web and mobile frontends, microservices, and cloud platforms all depending on mainframe systems of record.

This section explains how mainframes fit into an OpenTelemetry-based observability strategy and points to guidance on integrating them with your existing telemetry pipelines.

## Who this guide is for

This content is aimed at people who:

- Are already familiar with **OpenTelemetry concepts** (traces, metrics, logs, OTLP, the Collector).
- Work primarily in **distributed / cloud-native** environments (Kubernetes, VMs, serverless, etc.).
- Need to understand **what a mainframe is**, why it matters, and how to bring mainframe workloads into an end-to-end observability story.

You do *not* need prior mainframe experience, and you do not need to be a COBOL or z/OS expert to benefit from this section.

## What we mean by “mainframe”

In this documentation, “mainframe” generally refers to:

- Large, highly reliable enterprise systems used for **high-volume transaction processing** and **batch workloads**.
- Platforms such as **IBM z/OS® mainframes** and compatible environments that host:
  - Transaction processing (e.g., CICS®, IMS™ and similar subsystems),
  - Batch processing (JCL-driven jobs, schedulers),
  - High-value systems of record (databases and files that are the “source of truth”).

While the details vary by vendor and product, most mainframe environments share characteristics that affect observability:

- Very high throughput and strict latency/availability requirements.
- Long-lived applications and data formats.
- Strong security and compliance constraints.

## How mainframes show up in OpenTelemetry architectures

From an OpenTelemetry perspective, mainframes are usually part of a **larger, hybrid system**:

- **Frontends and APIs** run in browsers, mobile apps, or API gateways.
- **Microservices and middleware** run in containers, VMs, or managed cloud services.
- **Core business logic and data** live on the mainframe and are accessed via MQ, HTTP(S), gRPC, message buses, or proprietary protocols.

In a typical architecture, telemetry flows might look like:

- Distributed services emit **traces, metrics, and logs** via OpenTelemetry SDKs and the Collector.
- Integration tiers (API gateways, ESBs, MQ bridges, data streaming platforms) act as **choke points** where you can correlate cloud requests with mainframe activity.
- Mainframe-resident components emit **events, SMF records, logs, or metrics** that must be transformed or exported into OpenTelemetry formats (often via a Collector or gateway running off-platform).

The goal of this section is to help you **connect those dots** so you can see a single, coherent picture across mainframe and non-mainframe systems.

## What’s different about mainframes (from an observability point of view)

When you bring OpenTelemetry into a mainframe context, you will often encounter:

- **Different mental models**  
  - Jobs, steps, regions, and transactions instead of pods and services.  
  - Datasets and VSAM files instead of object storage buckets.
- **Existing telemetry formats**  
  - System Management Facilities (SMF) records, subsystem logs, job logs, performance monitors.  
  - These need parsing and mapping into **traces, metrics, and logs** as defined by OpenTelemetry.
- **Access and change constraints**  
  - Production mainframes often have strict change control and limited ability to modify application code.  
  - This drives demand for **side-band** or **agent-style** approaches (e.g., using existing records and interfaces) in addition to in-process instrumentation.
- **Scale and reliability expectations**  
  - Telemetry solutions must keep up with **very high transaction rates** without impacting SLAs.  
  - Data pipelines must be robust and secure enough to meet regulatory requirements.

These characteristics don’t prevent the use of OpenTelemetry, but they influence **where and how** you collect, transform, and export telemetry.

## How OpenTelemetry can help

OpenTelemetry provides building blocks that can be applied to mainframe environments, including:

- **Vendor-neutral data model** for traces, metrics, and logs.
- **OTLP** as a standard, interoperable transport.
- The **OpenTelemetry Collector**, which can:
  - Ingest data from multiple protocols and formats,
  - Transform and enrich it,
  - Export it to your chosen backends.

In a mainframe context, the Collector often runs **off-platform** (for example, on Linux servers or containers) and acts as a **bridge** between:

- Mainframe-specific telemetry sources, and  
- Your enterprise observability backends (metrics/logs platforms, tracing backends, APM tools, SIEMs, and data lakes).

Future pages in this section will describe patterns and examples for:

- Mapping existing mainframe telemetry (such as SMF records, logs, and subsystem metrics) into OpenTelemetry signals.
- Correlating mainframe operations with upstream and downstream services using traces.
- Designing pipelines that respect mainframe performance and security constraints.

## Working group and community

The **OpenTelemetry on Mainframes Special Interest Group (SIG)** focuses on:

- Defining common terminology and use cases.
- Describing integration patterns for bringing mainframe telemetry into OpenTelemetry.
- Identifying gaps in specs, SDKs, and Collector components related to mainframe use cases.

If you are interested in contributing, see the community and SIG information in the OpenTelemetry repositories and website for meeting times and communication channels.
