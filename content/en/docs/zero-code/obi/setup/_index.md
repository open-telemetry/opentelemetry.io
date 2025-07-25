---
title: Set up OBI
menuTitle: Setup
description: Learn how to set up and run OBI.
weight: 10
keywords:
  - OBI
  - setup
aliases:
  - /docs/grafana-cloud/monitor-applications/beyla/setup/
---

![OpenTelemetry eBPF Instrumentation Logo](https://grafana.com/media/docs/grafana-cloud/beyla/beyla-logo-2.png)

# Set up OBI

There are different options to set up and run OBI:

- [Set up OBI on Kubernetes](kubernetes/)
- [Set up OBI on Kubernetes with Helm](kubernetes-helm/)
- [Set up OBI on Docker](docker/)
- [Set up OBI as a standalone process](standalone/)

For information on configuration options and data export modes, see the
[Configure OBI](../configure/) documentation.

You can run OBI as a standalone process. This approach is suitable for running
with bare metal installations, in virtual machines, for local development, or
advanced use cases. Consult the documentation in the
[Git repository](https://github.com/grafana/beyla/blob/main/docs/sources/setup/standalone.md)
to learn how to set up OBI as a standalone process.

**Note**: If you will be using OBI to generate traces, please make sure you've
read our documentation section on configuring the
[Routes Decorator](../configure/routes-decorator/). Since OBI is
auto-instrumenting your application without any modifications to your code, the
service names and URLs that are automatically assigned might not be what you
expect.
