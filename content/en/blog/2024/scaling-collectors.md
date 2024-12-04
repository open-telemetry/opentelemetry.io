---
title: Manage OpenTelemetry Collectors at scale with Ansible
linkTitle: Collectors at scale with Ansible
date: 2024-04-15
author: '[Ishan Jain](https://github.com/ishanjainn) (Grafana)'
cSpell:ignore: ansible associated Ishan ishanjainn Jain
---

You can scale the deployment of
[OpenTelemetry Collector](/docs/collector/deployment/) across multiple Linux
hosts through [Ansible](https://www.ansible.com/), to function both as
[gateways](/docs/collector/deployment/gateway/) and
[agents](/docs/collector/deployment/agent/) within your observability
architecture. Using the OpenTelemetry Collector in this dual capacity enables a
robust collection and forwarding of metrics, traces, and logs to analysis and
visualization platforms.

We outline a strategy for deploying and managing the OpenTelemetry Collector's
scalable instances throughout your infrastructure using Ansible. In the
following example, we'll use [Grafana](https://grafana.com/) as the target
backend for metrics.

## Prerequisites

Before we begin, make sure you meet the following requirements:

- Ansible installed on your base system
- SSH access to two or more Linux hosts
- Prometheus configured to gather your metrics

## Install the Grafana Ansible collection

The
[OpenTelemetry Collector role](https://github.com/grafana/grafana-ansible-collection/tree/main/roles/opentelemetry_collector)
is provided through the
[Grafana Ansible collection](https://docs.ansible.com/ansible/latest/collections/grafana/grafana/)
as of release 4.0.

To install the Grafana Ansible collection, run this command:

```sh
ansible-galaxy collection install grafana.grafana
```

## Create an Ansible inventory file

Next, gather the IP addresses and URLs associated with your Linux hosts and
create an inventory file.

1. Create an Ansible inventory file.

   An Ansible inventory, which resides in a file named `inventory`, lists each
   host IP on a separate line, like this (8 hosts shown):

   ```properties
   10.0.0.1    # hostname = ubuntu-01
   10.0.0.2    # hostname = ubuntu-02
   10.0.0.3    # hostname = centos-01
   10.0.0.4    # hostname = centos-02
   10.0.0.5    # hostname = debian-01
   10.0.0.6    # hostname = debian-02
   10.0.0.7    # hostname = fedora-01
   10.0.0.8    # hostname = fedora-02
   ```

2. Create an `ansible.cfg` file within the same directory as `inventory`, with
   the following values:

   ```toml
   [defaults]
   inventory = inventory  # Path to the inventory file
   private_key_file = ~/.ssh/id_rsa   # Path to private SSH Key
   remote_user=root
   ```

## Use the OpenTelemetry Collector Ansible role

Next, define an Ansible playbook to apply your chosen or created OpenTelemetry
Collector role across your hosts.

Create a file named `deploy-opentelemetry.yml` in the same directory as your
`ansible.cfg` and `inventory` files:

```yaml
- name: Install OpenTelemetry Collector
  hosts: all
  become: true

  tasks:
    - name: Install OpenTelemetry Collector
      ansible.builtin.include_role:
        name: opentelemetry_collector
      vars:
        otel_collector_receivers:
          hostmetrics:
            collection_interval: 60s
            scrapers:
              cpu: {}
              disk: {}
              load: {}
              filesystem: {}
              memory: {}
              network: {}
              paging: {}
              process:
                mute_process_name_error: true
                mute_process_exe_error: true
                mute_process_io_error: true
              processes: {}

        otel_collector_processors:
          batch:
          resourcedetection:
            detectors: [env, system]
            timeout: 2s
            system:
              hostname_sources: [os]
          transform/add_resource_attributes_as_metric_attributes:
            error_mode: ignore
            metric_statements:
              - context: datapoint
                statements:
                  - set(attributes["deployment.environment"],
                    resource.attributes["deployment.environment"])
                  - set(attributes["service.version"],
                    resource.attributes["service.version"])

        otel_collector_exporters:
          prometheusremotewrite:
            endpoint: https://<prometheus-url>/api/prom/push
            headers:
              Authorization: 'Basic <base64-encoded-username:password>'

        otel_collector_service:
          pipelines:
            metrics:
              receivers: [hostmetrics]
              processors:
                [
                  resourcedetection,
                  transform/add_resource_attributes_as_metric_attributes,
                  batch,
                ]
              exporters: [prometheusremotewrite]
```

{{% alert title="Note" %}}

Adjust the configuration to match the specific telemetry you intend to collect
as well as where you plan to forward it to. This configuration snippet is a
basic example designed for collecting host metrics that get forwarded to
Prometheus.

{{% /alert %}}

The previous configuration would provision the OpenTelemetry Collector to
collect metrics from the Linux host.

## Running the Ansible playbook

Deploy the OpenTelemetry Collector across your hosts by running the following
command:

```sh
ansible-playbook deploy-opentelemetry.yml
```

## Check your metrics in the backend

After your OpenTelemetry Collectors start sending metrics to Prometheus, follow
these steps to visualize them in Grafana:

### Set up Grafana

1. **Install Docker**: Make sure Docker is installed on your system.

2. **Run Grafana Docker Container**: Start a Grafana server with the following
   command, which fetches the latest Grafana image:

   ```sh
   docker run -d -p 3000:3000 --name=grafana grafana/grafana
   ```

3. **Access Grafana**: Open <http://localhost:3000> in your web browser. The
   default login username and password are both `admin`.

4. **Change passwords** when prompted on first login -- pick a secure one!

For other installation methods and more detailed instructions, refer to the
[official Grafana documentation](https://grafana.com/docs/grafana/latest/#installing-grafana).

### Add Prometheus as a data source

1. In Grafana, navigate to **Connections** > **Data Sources**.
2. Click **Add data source** and select **Prometheus**.
3. In the settings, enter your Prometheus URL, for example,
   `http://<your_prometheus_host>`, along with any other necessary details.
4. Select **Save & Test**.

### Explore your metrics

1. Go to the **Explore** page
2. In the Query editor, select your data source and enter the following query

   ```PromQL
   100 - (avg by (cpu) (irate(system_cpu_time{state="idle"}[5m])) * 100)
   ```

   This query calculates the average percentage of CPU time not spent in the
   "idle" state, across each CPU core, over the last 5 minutes.

3. Explore other metrics and create dashboards to gain insights into your
   system's performance.

This blog post illustrated how you can configure and deploy multiple
OpenTelemetry Collectors across various Linux hosts with the help of Ansible, as
well as visualize collected telemetry in Grafana. Incase you find this useful,
GitHub repository for
[OpenTelemetry Collector role](https://github.com/grafana/grafana-ansible-collection/tree/main/roles/opentelemetry_collector)
for detailed configuration options. If you have questions, You can connect with
me using my contact details at my GitHub profile
[@ishanjainn](https://github.com/ishanjainn).
