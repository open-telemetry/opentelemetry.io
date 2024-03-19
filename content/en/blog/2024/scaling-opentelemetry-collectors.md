---
title: Manage OpenTelemetry Collectors at scale with Ansible
linkTitle: OTel Collector with Ansible
date: 2024-03-12
author: '[Ishan Jain](https://github.com/ishanjainn) (Grafana)'
cSpell:ignore: ansible Ishan Jain
---

You can scale the deployment of
[OpenTelemetry Collector](/docs/collector/deployment/) across multiple
Linux hosts through [Ansible](https://www.ansible.com/), to function both
as [gateways](/docs/collector/deployment/gateway/) and
[agents](/docs/collector/deployment/agent/) within your observability
architecture. Using the OpenTelemetry Collector in this dual capacity
enables a robust collection and forwarding of metrics, traces, and logs to
analysis and visualization platforms.

We outline a strategy for deploying and managing the OpenTelemetry
Collector's scalable instances throughout your infrastructure using Ansible.
In the following example, we'll use Grafana as the target backend.

## Before you begin

To follow this guide, ensure you have:

- Ansible Installed in your system
- Linux hosts along with SSH access to each of these Linux hosts.
- Prometheus for gathering metrics

## Install the Grafana Ansible collection

The
[OpenTelemetry Collector role](https://github.com/grafana/grafana-ansible-collection/tree/main/roles/opentelemetry_collector)
is provided through the
[Grafana Ansible collection](https://docs.ansible.com/ansible/latest/collections/grafana/grafana/)
as of the 3.0.0 release.

To install the Grafana Ansible collection, run this command:

```shell
ansible-galaxy collection install grafana.grafana
```

## Create an Ansible inventory file

Next, you will set up your hosts and create an inventory file.

1. Create your hosts and add public SSH keys to them.

   This example uses eight Linux hosts: two Ubuntu hosts, two CentOS hosts, two
   Fedora hosts, and two Debian hosts.

2. Create an Ansible inventory file.

   The Ansible inventory, which resides in a file named `inventory`, looks
   similar to this:

   ```ini
   10.0.0.1    # hostname = ubuntu-01
   10.0.0.2    # hostname = ubuntu-02
   10.0.0.3    # hostname = centos-01
   10.0.0.4    # hostname = centos-02
   10.0.0.5    # hostname = debian-01
   10.0.0.6    # hostname = debian-02
   10.0.0.7    # hostname = fedora-01
   10.0.0.8    # hostname = fedora-02
   ```

   > **Note**: If you are copying the above file, remove the comments (#).

3. Create an `ansible.cfg` file within the same directory as `inventory`, with
   the following values:

   ```cfg
   [defaults]
   inventory = inventory  # Path to the inventory file
   private_key_file = ~/.ssh/id_rsa   # Path to my private SSH Key
   remote_user=root
   ```

## Use the OpenTelemetry Collector Ansible role

Next, you'll define an Ansible playbook to apply your chosen or created
OpenTelemetry Collector role across your hosts.

Create a file named `deploy-opentelemetry.yml` in the same directory as your
`ansible.cfg` and `inventory`.

```yaml
- name: Install OpenTelemetry Collector
  hosts: all
  become: true

  tasks:
    - name: Install OpenTelemetry Collector
      ansible.builtin.include_role:
        name: opentelemetry_collectorr
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

You'll need to adjust the configuration to match the specific telemetry you
intend to collect and where you plan to forward it. This configuration snippet
is a basic example designed for collecting host metrics and forwarded to
Prometheus.

{{% /alert %}}

The previous configuration would provision the OpenTelemetry Collector to
collect host metrics from the Linux host.

## Running the Ansible playbook

Deploy the OpenTelemetry Collector across your hosts by executing:

```sh
ansible-playbook deploy-opentelemetry.yml
```

## Visualizing Metrics in Grafana

Once your OpenTelemetry Collector's start sending metrics to Prometheus, follow
these quick steps to visualize them in [Grafana](https://grafana.com/):

### Setup Grafana

1. **Install Docker**: Make sure Docker is installed on your system. If it's
   not, you can find the installation guide at the
   [official Docker website](https://docs.docker.com/get-docker/).

2. **Run Grafana Docker Container**: Start a Grafana server with this Docker
   command, which fetches the latest Grafana image:

   ```sh
   docker run -d -p 3000:3000 --name=grafana grafana/grafana
   ```

3. **Access Grafana**: Navigate to `http://localhost:3000` in your web browser.
   The default login details are `admin` for both the username and password.

4. **Change Password**: Upon your first login, you will be prompted to set a new
   password. Make sure to pick a secure one.

For other installation methods and more detailed instructions, refer to the
[official Grafana documentation](https://grafana.com/docs/grafana/latest/installation/).

### Add Prometheus as a Data Source

1. **Login to Grafana** and navigate to **Connections** > **Data Sources**.
2. Click **Add data source**, and choose **Prometheus**.
3. In the settings, enter your Prometheus URL, for example,
   `http://<your_prometheus_host>`, along with any other necessary details, and
   then click **Save & Test**.

### Explore metrics

1. Go to the **Explore** page
2. In the Query editor, select your Prometheus data source and enter the below
   query

   ```PromQL
   100 - (avg by (cpu) (irate(system_cpu_time{state="idle"}[5m])) * 100)
   ```

   This query calculates the average percentage of CPU time not spent in the
   "idle" state, across each CPU core, over the last 5 minutes.

3. Play around with different metrics and start putting together your dashboards
   to gain insights into your system's performance.

This guide makes it easier for you to set up the OpenTelemetry Collector on
several Linux machines with the help of Ansible and shows you how to see the
data it collects in Grafana. You can adjust the settings for the OpenTelemetry
Collector and design your Grafana dashboards to meet your own monitoring and
tracking needs. This way, you get exactly the insights you want from your
systems, making your job as a developer a bit easier.
