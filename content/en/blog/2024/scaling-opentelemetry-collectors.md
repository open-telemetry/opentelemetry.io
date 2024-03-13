---
title: 
  Manage OpenTelemetry Collectors at Scale with Ansible
linkTitle: OTel Collector with Ansible
date: 2024-03-12
author: '[Ishan Jain](https://github.com/ishanjainn) (Grafana)'
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # This will be added in future
---

This guide is focused on scaling the OpenTelemetry Collector deployment across various Linux hosts by leveraging Ansible, to function both as gateways and agents within your observability architecture. Utilizing the OpenTelemetry Collector in this dual capacity enables a robust collection and forwarding of metrics, traces, and logs to analysis and visualization platforms, such as Grafana Cloud. 

Here, we outline a strategy for deploying and managing the OpenTelemetry Collector's scalable instances throughout your infrastructure with Ansible, enhancing your overall monitoring strategy and data visualization capabilities in Grafana Cloud.

## Before you begin

To follow this guide, ensure you have:

- Linux hosts.
- SSH access to each of these Linux hosts.
- Account permissions to install and configure the OpenTelemetry Collector on these hosts.

## Install the Grafana Ansible collection

The [Grafana Agent role](https://github.com/grafana/grafana-ansible-collection/tree/main/roles/grafana_agent) is available in the Grafana Ansible collection as of the 1.1.0 release.

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

  vars:
    grafana_cloud_api_key: <Your Grafana.com API Key>        # Example - eyxxxxxxxx
    metrics_username: <prometheus-username>                  # Example - 825019
    logs_username: <loki-username>                           # Example - 411478
    prometheus_url: <prometheus-push-url>                    # Example - https://prometheus-us-central1.grafana.net/api/prom/push
    loki_url: <loki-push-url>                                # Example - https://logs-prod-017.grafana.net/loki/api/v1/push
    tempo_url: <tempo-push-url>                              # Example - tempo-prod-04-prod-us-east-0.grafana.net:443
    traces_username: <tempo-username>                        # Example - 411478

  tasks:
    - name: Install OpenTelemetry Collector
      ansible.builtin.include_role:
        name: grafana.grafana.opentelemetry_collector
      vars:
        otel_collector_extensions:
          basicauth/grafana_cloud_tempo:
            # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/basicauthextension
            client_auth:
              username: "{{ traces_username }}"
              password: "{{ grafana_cloud_api_key }}"
          basicauth/grafana_cloud_prometheus:
            client_auth:
              username: "{{ prometheus_url }}"
              password: "{{ grafana_cloud_api_key }}"
          basicauth/grafana_cloud_loki:
            client_auth:
              username: "{{ logs_username }}"
              password: "{{ grafana_cloud_api_key }}"


        otel_collector_receivers:
          otlp:
            # https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver
            protocols:
              grpc:
              http:
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
            # https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor
          resourcedetection:
            detectors: [env, system] # Before system detector, include ec2 for AWS, gcp for GCP and azure for Azure.
            # Using OTEL_RESOURCE_ATTRIBUTES envvar, env detector adds custom labels.
            timeout: 2s
            system:
                hostname_sources: [os] # alternatively, use [dns,os] for setting FQDN as host.name and os as fallback
          transform/add_resource_attributes_as_metric_attributes:
            # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor
            error_mode: ignore
            metric_statements:
              - context: datapoint
                statements:
                  - set(attributes["deployment.environment"], resource.attributes["deployment.environment"])
                  - set(attributes["service.version"], resource.attributes["service.version"])

        otel_collector_exporters:
          otlp/grafana_cloud_traces:
            # https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter
            endpoint: "{{ tempo_url }}"
            auth:
              authenticator: basicauth/grafana_cloud_tempo

          loki/grafana_cloud_logs:
            # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter
            endpoint: "{{ loki_url }}"
            auth:
              authenticator: basicauth/grafana_cloud_loki

          prometheusremotewrite/grafana_cloud_metrics:
            # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusremotewriteexporter
            endpoint: "{{ prometheus_url }}"
            add_metric_suffixes: false
            auth:
              authenticator: basicauth/grafana_cloud_prometheus


        otel_collector_service:
          extensions: [basicauth/grafana_cloud_tempo, basicauth/grafana_cloud_prometheus, basicauth/grafana_cloud_loki]
          pipelines:
            traces:
              receivers: [otlp]
              processors: [resourcedetection, batch]
              exporters: [otlp/grafana_cloud_traces]
            metrics:
              receivers: [otlp, hostmetrics]
              processors: [resourcedetection, transform/add_resource_attributes_as_metric_attributes, batch]
              exporters: [prometheusremotewrite/grafana_cloud_metrics]
            logs:
              receivers: [otlp]
              processors: [resourcedetection, batch]
              exporters: [loki/grafana_cloud_logs]
```

> **Note:** You'll need to adjust the configuration to match the specific telemetry you intend to collect and where you plan to forward it. This configuration snippet is a basic example designed for traces, logs, and metrics collected using OTLP and forwarded to Grafana Cloud. 

The previous configuration would provision the OpenTelemetry Collector to collect host metrics from the Linux host.

## Running the Ansible playbook

Deploy the OpenTelemetry Collector across your hosts by executing:

```sh
ansible-playbook deploy-opentelemetry.yml
```

## Verifying data ingestion into Grafana Cloud

Once you've deployed the OpenTelemetry Collector and configured it to forward data to Grafana Cloud, you can verify the ingestion:

- Log into your Grafana Cloud instance.
- Navigate to the **Explore** section.
- Select your Grafana Cloud Prometheus data source from the dropdown menu.
- Execute a query to confirm the reception of metrics, for example, `{instance="ubuntu-01"}` for a specific host's metrics.

## Visualizing metrics and logs in Grafana

With data successfully ingested into Grafana Cloud, you can create custom dashboards to visualize the metrics, logs, and traces received from your OpenTelemetry Collector. Utilize Grafana's powerful query builder and visualization tools to derive insights from your data effectively.

- Consider creating dashboards that offer a comprehensive overview of your infrastructure's health and performance.
- Utilize Grafana's alerting features to proactively manage and respond to issues identified through the OpenTelemetry data.

This guide simplifies the deployment of the OpenTelemetry Collector across multiple Linux hosts using Ansible and illustrates how to visualize collected telemetry in Grafana Cloud. Tailor the Ansible roles, OpenTelemetry Collector configurations, and Grafana dashboards to suit your specific monitoring and observability requirements.
