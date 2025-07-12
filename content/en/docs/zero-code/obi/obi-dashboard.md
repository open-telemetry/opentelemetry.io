---
title: OBI RED metrics dashboard
menuTitle: Dashboard
description: Learn how to use the OBI RED metrics dashboard.
weight: 20
keywords:
  - OBI
  - dashboard
  - RED metrics
---

# OBI RED metrics dashboard

You can import the OBI Dashboard into your Grafana instance. There is a
[public dashboard with some basic information](/grafana/dashboards/19923-beyla-red-metrics/).

## Import dashboard

Import the dashboard to your Grafana instance by navigating to Dashboards >
New > Import and provide the dashboard ID `19923`:

![OBI import dashboard](https://grafana.com/media/docs/grafana-cloud/beyla/tutorial/import-dashboard.png)

The example dashboard used as base for this tutorial is the
[OBI RED Metrics](/grafana/dashboards/19923-beyla-red-metrics/) (ID `19923`)
public dashboard.

## Use dashboard

{{< alert type="note" >}} OBI only reports services that receive HTTP or gRPC
requests. {{< /alert >}}

![OBI RED metrics](https://grafana.com/media/docs/grafana-cloud/beyla/tutorial/beyla-dashboard-screenshot-v1.0.png)

The dashboard displays metrics for each instrumented service. If you only have a
single service, only one entry appears. If you configure OBI to instrument
multiple services, you'll see an entry for each service.
