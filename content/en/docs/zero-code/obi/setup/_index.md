---
title: Set up OBI
linkTitle: Setup
description: Learn how to set up and run OBI.
weight: 10
---

There are different options to set up and run OBI:

- [Set up OBI on Kubernetes](kubernetes/)
<!-- - [Set up OBI on Kubernetes with Helm](kubernetes-helm/) -->
- [Set up OBI on Docker](docker/)
- [Set up OBI as a standalone process](standalone/)

For information on configuration options and data export modes, see the
[Configure OBI](../configure/) documentation.

{{% alert title="Note" %}}

If you will be using OBI to generate traces, please make sure you've read our
documentation section on configuring the
[Routes Decorator](../configure/routes-decorator/). Since OBI is
auto-instrumenting your application without any modifications to your code, the
service names and URLs that are automatically assigned might not be what you
expect.

{{% /alert %}}
