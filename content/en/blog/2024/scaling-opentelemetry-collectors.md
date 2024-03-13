---
title: 
  Manage OpenTelemetry Collectors at Scale with Ansible
linkTitle: OTel Collector with Ansible
date: 2024-03-12
author: '[Ishan Jain](https://github.com/ishanjainn) (Grafana)'
# canonical_url: http://somewhere.else/ # This will be added in future
---

This guide is focused on scaling the [OpenTelemetry Collector deployment](/docs/collector/deployment/) across various Linux hosts by leveraging [Ansible](https://www.ansible.com/), to function both as [gateways](/docs/collector/deployment/gateway/) and [agents](/docs/collector/deployment/agent/) within your observability architecture. Utilizing the OpenTelemetry Collector in this dual capacity enables a robust collection and forwarding of metrics, traces, and logs to analysis and visualization platforms.

Here, we outline a strategy for deploying and managing the OpenTelemetry Collector's scalable instances throughout your infrastructure with Ansible, enhancing your overall monitoring strategy and data visualization capabilities in Grafana.

## Before you begin

To follow this guide, ensure you have:

- Ansible Installed in your system
- Linux hosts.
- SSH access to each of these Linux hosts.
- Account permissions to install and configure the OpenTelemetry Collector on these hosts.

## Install the Grafana Ansible collection

A [OpenTelemetry Collector role](https://github.com/grafana/grafana-ansible-collection/tree/main/roles/opentelemetry_collector) is provided through the [Grafana Ansible collection](https://docs.ansible.com/ansible/latest/collections/grafana/grafana/) as of the 1.1.0 release.

To install the Grafana Ansible collection, run this command:

```
ansible-galaxy collection install grafana.grafana
```

## Create an Ansible inventory file

Next, you will set up your hosts and create an inventory file.

1. Create your hosts and add public SSH keys to them.

    This example uses eight Linux hosts: two Ubuntu hosts, two CentOS hosts, two Fedora hosts, and two Debian hosts.

2. Create an Ansible inventory file.

    The Ansible inventory, which resides in a file named `inventory`, looks similar to this:

    ```
    146.190.208.216    # hostname = ubuntu-01
    146.190.208.190    # hostname = ubuntu-02
    137.184.155.128    # hostname = centos-01
    146.190.216.129    # hostname = centos-02
    198.199.82.174     # hostname = debian-01
    198.199.77.93      # hostname = debian-02
    143.198.182.156    # hostname = fedora-01
    143.244.174.246    # hostname = fedora-02
    ```

    > **Note**: If you are copying the above file, remove the comments (#).

3. Create an `ansible.cfg` file within the same directory as `inventory`, with the following values:

    ```
    [defaults]
    inventory = inventory  # Path to the inventory file
    private_key_file = ~/.ssh/id_rsa   # Path to my private SSH Key
    remote_user=root
    ```

## Use the OpenTelemetry Collector Ansible role

Next, you'll define an Ansible playbook to apply your chosen or created OpenTelemetry Collector role across your hosts.

Create a file named `deploy-opentelemetry.yml` in the same directory as your `ansible.cfg` and `inventory`. 

```yaml
- name: Install OpenTelemetry Collector
  hosts: all
  become: true

  tasks:
    - name: Install OpenTelemetry Collector
      ansible.builtin.include_role:
        name: grafana.grafana.opentelemetry_collector
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
                  - set(attributes["deployment.environment"], resource.attributes["deployment.environment"])
                  - set(attributes["service.version"], resource.attributes["service.version"])

        otel_collector_exporters:
          prometheusremotewrite:
            endpoint: <your-prometheus-push-endpoint>

        otel_collector_service:
          pipelines:
            metrics:
              receivers: [hostmetrics]
              processors: [resourcedetection, transform/add_resource_attributes_as_metric_attributes, batch]
              exporters: [prometheusremotewrite]
```

{{% alert title="Note" %}}

You'll need to adjust the configuration to match the specific telemetry you intend to collect and where you plan to forward it. This configuration snippet is a basic example designed for collecting host metrics and forwarded to Prometheus. 

{{% /alert %}}

The previous configuration would provision the OpenTelemetry Collector to collect host metrics from the Linux host.

## Running the Ansible playbook

Deploy the OpenTelemetry Collector across your hosts by executing:

```sh
ansible-playbook deploy-opentelemetry.yml
```

## Visualizing metrics in Grafana

With data successfully ingested into Prometheus, you can use Grafana to create custom dashboards to visualize the metrics received from your OpenTelemetry Collector's. Utilize Grafana's powerful query builder and visualization tools to derive insights from your data effectively.

- Consider creating dashboards that offer a comprehensive overview of your infrastructure's health and performance.
- Utilize Grafana's alerting features to proactively manage and respond to issues identified through the OpenTelemetry data.

This guide simplifies the deployment of the OpenTelemetry Collector across multiple Linux hosts using Ansible and illustrates how to visualize collected telemetry in Grafana. Tailor the OpenTelemetry Collector Ansible roles configurations, and Grafana dashboards to suit your specific monitoring and observability requirements.
