---
title: OpenTelemetry Collector Model Context Protocol (MCP) Server
author: >-
  [Pavol Loffay](https://github.com/pavolloffay) (Red Hat)
linkTitle: OpenTelemetry Collector MCP Server
issue: https://github.com/open-telemetry/opentelemetry.io/issues/8330
sig: SIG Collector
date: 2025-03-06
cSpell:ignore: mcp pavolloffay
---

## Managing OpenTelemetry Collector just got easier

OpenTelemetry is a large ecosystem of many components which solve different use-cases.
Therefore managing a production ready OpenTelemetry collector pipeline can be a hard problem. Users
have to deal with multiple components, understand breaking changes and improve stack based on the
new enhancements made in the community.

OpenTelemetry MCP server can significantly help to simplify deployment and day two operations.

## Current functionality

At the moment the MCP server provides tools to simplify collector management. The implementation uses
JSON schema for each collector component. This is quite powerful, the MCP can return the schema of a given component version
and also validate component's config. The MCP can be also used to compare two collector versions and check which configuration fields were added, removed or deprecated.

1. opentelemetry-collector-changelog [version]
2. opentelemetry-collector-component-deprecated-fields [version, type]
3. opentelemetry-collector-component-schema [version, type, name]
4. opentelemetry-collector-component-schema-validation [version, type, name]
5. opentelemetry-collector-components [version, typ]
6. opentelemetry-collector-get-versions
7. opentelemetry-collector-readme [version, type, name]

### Examples

In this section are example prompts with outputs from Claude Code.

#### Compare OpenTelemetry collector version 0.138.0 and 0.139.0. Show which fields were added, removed or deprecated.

```bash
I'll help you compare OpenTelemetry collector versions 0.138.0 and 0.139.0 to identify changes in fields. Let me create a plan for this analysis.
  ⎿  versions: [0.135.0 0.136.0 0.137.0 0.138.0 0.139.0]

● otel - opentelemetry-collector-changelog (MCP)(version: "0.139.0")
  ⎿  ## v0.139.0

     ### 🛑 Breaking changes 🛑
     … +127 lines (ctrl+o to expand)

● otel - opentelemetry-collector-components (MCP)(type: "receiver", version: "0.138.0")
  ⎿ [active_directory_ds aerospike apache apachespark awscloudwatch awscontainerinsightreceiver awsecscontainermetrics awsfirehose awss3 awsxray azureblob azureeventhub azuremonitor bigip carbon chrony cloudflare cloudfoundry collectd couchdb datadog docker_stats elasticsearch envoyals expvar faro f
    ilelog filestats flinkmetrics fluentforward github gitlab googlecloudmonitoring googlecloudpubsub googlecloudspanner haproxy hostmetrics httpcheck iis influxdb jaeger jmx journald k8s_cluster k8s_events k8sobjects kafka kafkametrics kubeletstats libhoney loki memcached mongodb mongodbatlas mysql
     namedpipe netflow nginx nop nsxt ntp oracledb otelarrow otlp otlpjsonfile podman_stats postgresql prometheus prometheus_simple prometheusremotewrite pulsar purefa purefb rabbitmq receiver_creator redis riak saphana signalfx skywalking snmp snowflake solace splunk_hec splunkenterprise sqlquery s
    qlserver sshcheck statsd stef syslog tcpcheck tcplog tlscheck udplog vcenter wavefront webhookevent windowseventlog windowsperfcounters zipkin zookeeper]

● otel - opentelemetry-collector-components (MCP)(type: "receiver", version: "0.139.0")
  ⎿ [active_directory_ds aerospike apache apachespark awscloudwatch awscontainerinsightreceiver awsecscontainermetrics awsfirehose awss3 awsxray azureblob azureeventhub azuremonitor bigip carbon chrony cloudflare cloudfoundry collectd couchdb datadog docker_stats elasticsearch envoyals expvar faro f
    ilelog filestats flinkmetrics fluentforward github gitlab googlecloudmonitoring googlecloudpubsub googlecloudspanner haproxy hostmetrics httpcheck iis influxdb jaeger jmx journald k8s_cluster k8s_events k8sobjects kafka kafkametrics kubeletstats libhoney loki memcached mongodb mongodbatlas mysql
     namedpipe netflow nginx nop nsxt ntp oracledb otelarrow otlp otlpjsonfile podman_stats postgresql prometheus prometheus_simple prometheusremotewrite pulsar purefa purefb rabbitmq receiver_creator redis riak saphana signalfx skywalking snmp snowflake solace splunk_hec splunkenterprise sqlquery s
    qlserver sshcheck statsd stef syslog tcpcheck tcplog tlscheck udplog vcenter wavefront webhookevent windowseventlog windowsperfcounters zipkin zookeeper]


● otel - opentelemetry-collector-components (MCP)(type: "exporter", version: "0.138.0")
  ⎿ [alibabacloud_logservice awscloudwatchlogs awsemf awskinesis awss3 awsxray azureblob azuredataexplorer azuremonitor bmchelix carbon cassandra clickhouse coralogix datadog dataset debug doris elasticsearch faro file googlecloud googlecloudpubsub googlemanagedprometheus honeycombmarker influxdb ka
    fka loadbalancing logicmonitor logzio mezmo nop opensearch otelarrow otlp otlphttp prometheus prometheusremotewrite pulsar rabbitmq sapm sentry signalfx splunk_hec stef sumologic syslog tencentcloud_logservice tinybird zipkin]

...

● OpenTelemetry Collector Version Comparison: 0.138.0 vs 0.139.0

  Based on my analysis, here's a comprehensive comparison of the changes between versions 0.138.0 and 0.139.0:

  Component Changes

  Removed Components:
  - Extension: ecs_task_observer - This extension was removed in v0.139.0

  No Changes:
  - Receivers: Identical set (115 components)
  - Exporters: Identical set (42 components)
  - Processors: Identical set (29 components)
  - Connectors: Identical set (12 components)

  Deprecated Field Changes

  Field Removed (No Longer Deprecated):
  - awslogs_encoding extension:
    - vpc_flow_log field was completely removed in v0.139.0 (was deprecated in v0.138.0 with notice it would be removed)

  No Other Changes:
  All other components maintain identical deprecated field lists between versions, indicating no new deprecations or removals of deprecated fields.

  Major Changes from Changelog

  🛑 Breaking Changes:
  1. receiver/sqlserver: Changed unit interpretation of lookback_time config - now requires 's' suffix for seconds
  2. cmd/mdatagen: Made stability.level a required field for metrics
  3. cmd/mdatagen: Replaced optional boolean field with requirement_level enum (required, conditionally_required, recommended, opt_in)
  4. pdata/pprofile: Removed deprecated PutAttribute and PutLocation helper methods

  💡 Key Enhancements:
  - connector/spanmetrics: New add_resource_attributes config option
  - exporter/azuremonitor: Added authenticator extension support
  - exporter/datadog: Performance improvements and configuration changes
  - pkg/ottl: Multiple new functions added (TrimPrefix, TrimSuffix, XXH128, dynamic delimiter support)
  - processor/filter: New resource-level filtering capability
  - processor/metricstarttime: Graduated to beta stability

  🧰 Notable Bug Fixes:
  - exporter/loadbalancing: Fixed high cardinality metrics issue
  - receiver/prometheusremotewrite: Fixed concurrency bug
  - processor/tail_sampling: Fixed panic with invalid regex

  Summary

  Version 0.139.0 represents a moderate update with:
  - 1 component removal (ecs_task_observer extension)
  - 1 deprecated field removal (awslogs_encoding.vpc_flow_log)
  - 4 breaking changes (mostly affecting development tools and specific receiver configs)
  - Multiple enhancements focused on authentication, OTTL functions, and processor capabilities
  - Several important bug fixes for stability and performance

  The update maintains backward compatibility for most users, with breaking changes primarily affecting advanced configurations and development workflows.
```

#### Check if OpenTelemetry collector (otelcol) custom resources in my cluster are using any deprecated collector configuration. If yes suggest migration.

```bash
> Check if OpenTelemetry collector (otelcol) custom resources in my cluster are using any deprecated collector configuration. If yes suggest migration.

● I'll help you check for deprecated OpenTelemetry collector configurations in your cluster. Let me create a plan for this task.

● Bash(kubectl get crd | grep -i otel)
  ⎿  No matches found

● Bash(kubectl get crd | grep -i opentelemetry)
  ⎿  instrumentations.opentelemetry.io                                 2025-10-22T13:52:35Z
     opampbridges.opentelemetry.io                                     2025-10-23T12:46:36Z
     opentelemetrycollectors.opentelemetry.io                          2025-10-23T12:46:37Z
     targetallocators.opentelemetry.io                                 2025-10-23T12:46:36Z

● Bash(kubectl get opentelemetrycollectors.opentelemetry.io --all-namespaces)
  ⎿  NAMESPACE              NAME   MODE         VERSION   READY   AGE   IMAGE                                                                                                                             MANAGEMENT
     otel-observability     dev    deployment   0.135.0   1/1     12d   registry.redhat.io/rhosdt/opentelemetry-collector-rhel8@sha256:5f31caf1f4a12cf2832ac3e84877f4fb0c856073820498c8a5be13698348c38a   managed
     tutorial-application   otel   deployment   0.135.0   1/1     12d   registry.redhat.io/rhosdt/opentelemetry-collector-rhel8@sha256:5f31caf1f4a12cf2832ac3e84877f4fb0c856073820498c8a5be13698348c38a   managed

● Now I'll check for deprecated configuration fields in all the components used by your collectors. Both collectors are running version 0.135.0, so I'll check against that version.

● otel - opentelemetry-collector-component-deprecated-fields (MCP)(type: "receiver", names: ["jaeger","otlp","zipkin"], version: "0.135.0")
  ⎿  deprecated fields: [{ComponentName:jaeger DeprecatedFields:[]} {ComponentName:otlp DeprecatedFields:[]} {ComponentName:zipkin DeprecatedFields:[]}]

● otel - opentelemetry-collector-component-deprecated-fields (MCP)(type: "processor", names: ["batch","k8sattributes","memory_limiter","resource","transform","tail_sampling"], version: "0.135.0")
  ⎿ deprecated fields: [{ComponentName:batch DeprecatedFields:[]} {ComponentName:k8sattributes DeprecatedFields:[]} {ComponentName:memory_limiter DeprecatedFields:[]} {ComponentName:resource DeprecatedFields:[]} {ComponentName:transform DeprecatedFields:[]} {ComponentName:tail_sampling DeprecatedFie
    lds:[]}]


● otel - opentelemetry-collector-component-deprecated-fields (MCP)(type: "exporter", names: ["debug","otlp","otlphttp","prometheus"], version: "0.135.0")
  ⎿ deprecated fields: [{ComponentName:debug DeprecatedFields:[]} {ComponentName:otlp DeprecatedFields:[]} {ComponentName:otlphttp DeprecatedFields:[]} {ComponentName:prometheus DeprecatedFields:[{Name:add_metric_suffixes Description:AddMetricSuffixes controls whether suffixes are added to metric na
    mes. Defaults to true. Deprecated: Use TranslationStrategy instead. This setting is ignored when TranslationStrategy is explicitly set. Type:boolean}]}]


● otel - opentelemetry-collector-component-deprecated-fields (MCP)(type: "extension", names: ["bearertokenauth"], version: "0.135.0")
  ⎿  deprecated fields: [{ComponentName:bearertokenauth DeprecatedFields:[]}]

● ✅ OpenTelemetry Collector Configuration Analysis Complete

  I've analyzed your OpenTelemetry collector configurations and here are the findings:

  Collectors Found:

  1. dev in otel-observability namespace (version 0.135.0)
  2. otel in tutorial-application namespace (version 0.135.0)

  Deprecated Field Analysis:

  Good news! 🎉 Your OpenTelemetry collector configurations are not using any deprecated fields.

  Here's what I checked:

  | Component Type | Components Checked                                                       | Deprecated Fields Found                   | Status                    |
  |----------------|--------------------------------------------------------------------------|-------------------------------------------|---------------------------|
  | Receivers      | jaeger, otlp, zipkin                                                     | None                                      | ✅ Clean                   |
  | Processors     | batch, k8sattributes, memory_limiter, resource, transform, tail_sampling | None                                      | ✅ Clean                   |
  | Exporters      | debug, otlp, otlphttp, prometheus                                        | 1 deprecated field in prometheus exporter | ✅ Not used in your config |
  | Extensions     | bearertokenauth                                                          | None                                      | ✅ Clean                   |

  Detailed Findings:

  - Prometheus exporter: Has a deprecated field add_metric_suffixes, but your configuration doesn't use this field
  - All other components: No deprecated fields in version 0.135.0

  Recommendations:

  1. No immediate action required - Your configurations are using current, non-deprecated fields
  2. Stay updated - Continue monitoring for deprecated fields when upgrading collector versions
  3. Monitor future upgrades - When upgrading beyond 0.135.0, re-run this check as new deprecations may be introduced

● Your OpenTelemetry collectors are properly configured with no deprecated fields! Both collectors can continue running as-is without any immediate configuration changes needed.

  If you want to check for deprecated fields again in the future (especially after version upgrades), you can run a similar analysis using the same approach I used here.
```

#### Show me OpenTelemetry collector configuration to collect logs from the Kubernetes cluster and validate the config.

```bash
Show me OpenTelemetry collector configuration to collect logs from the Kubernetes cluster and validate the config.

● I'll help you create an OpenTelemetry collector configuration for collecting logs from a Kubernetes cluster and validate it. Let me start by planning this task and checking available components.
  ⎿  versions: [0.135.0 0.136.0 0.137.0 0.138.0 0.139.0]

● otel - opentelemetry-collector-components (MCP)(type: "receiver", version: "0.139.0")
  ⎿ [active_directory_ds aerospike apache apachespark awscloudwatch awscontainerinsightreceiver awsecscontainermetrics awsfirehose awss3 awsxray azureblob azureeventhub azuremonitor bigip carbon chrony cloudflare cloudfoundry collectd couchdb datadog docker_stats elasticsearch envoyals expvar faro f
    ilelog filestats flinkmetrics fluentforward github gitlab googlecloudmonitoring googlecloudpubsub googlecloudspanner haproxy hostmetrics httpcheck iis influxdb jaeger jmx journald k8s_cluster k8s_events k8sobjects kafka kafkametrics kubeletstats libhoney loki memcached mongodb mongodbatlas mysql
     namedpipe netflow nginx nop nsxt ntp oracledb otelarrow otlp otlpjsonfile podman_stats postgresql prometheus prometheus_simple prometheusremotewrite pulsar purefa purefb rabbitmq receiver_creator redis riak saphana signalfx skywalking snmp snowflake solace splunk_hec splunkenterprise sqlquery s
    qlserver sshcheck statsd stef syslog tcpcheck tcplog tlscheck udplog vcenter wavefront webhookevent windowseventlog windowsperfcounters zipkin zookeeper]




● otel - opentelemetry-collector-components (MCP)(type: "exporter", version: "0.139.0")
  ⎿ [alibabacloud_logservice awscloudwatchlogs awsemf awskinesis awss3 awsxray azureblob azuredataexplorer azuremonitor bmchelix carbon cassandra clickhouse coralogix datadog dataset debug doris elasticsearch faro file googlecloud googlecloudpubsub googlemanagedprometheus honeycombmarker influxdb ka
    fka loadbalancing logicmonitor logzio mezmo nop opensearch otelarrow otlp otlphttp prometheus prometheusremotewrite pulsar rabbitmq sapm sentry signalfx splunk_hec stef sumologic syslog tencentcloud_logservice tinybird zipkin]


● Write(otel-collector-k8s-logs.yaml)
  ⎿  Wrote 153 lines to otel-collector-k8s-logs.yaml
     apiVersion: v1
     kind: ConfigMap
     metadata:
       name: otel-collector-config
       namespace: opentelemetry
     data:
       collector.yaml: |
         receivers:
           # Collect container logs from Kubernetes pods
           filelog/pods:
     … +143 lines (ctrl+o to expand)

● otel - opentelemetry-collector-component-schema-validation (MCP)(type: "receiver", name: "filelog", version: "0.139.0", config: "{\n  \"include\": [\"/var/log/pods/*/*/*.log\"],\n  \"exclude\": [\"/var/log/pods/opentelemetry_*/*/*.log\"],\n  \"include_file_name\": false,\n  \"include_file_path\":
                                                                  true,\n  \"operators\": [\n    {\n      \"type\": \"json_parser\",\n      \"id\": \"parser-cri\",\n      \"output\": \"extract_metadata_from_filepath\",\n      \"timestamp\": {\n        \"parse_from\": \"attributes.time\",\n
                                                                  \"layout\": \"%Y-%m-%dT%H:%M:%S.%LZ\"\n      }\n    },\n    {\n      \"type\": \"regex_parser\",\n      \"id\": \"extract_metadata_from_filepath\",\n      \"regex\":
                                                                  \"^.*\\\\/(?P<namespace>[^_]+)_(?P<pod_name>[^_]+)_(?P<uid>[a-f0-9\\\\-]{36})\\\\/(?P<container_name>[^\\\\._]+)\\\\/(?P<restart_count>\\\\d+)\\\\.log$\",\n      \"parse_from\": \"attributes[\\\"log.file.path\\\"]\",\n      \"output\":
                                                                  \"parse_body\"\n    },\n    {\n      \"type\": \"move\",\n      \"id\": \"parse_body\",\n      \"from\": \"attributes.log\",\n      \"to\": \"body\"\n    },\n    {\n      \"type\": \"remove\",\n      \"id\": \"cleanup\",\n      \"field\":
                                                                  \"attributes.time\"\n    }\n  ]\n}")
  ⎿  is valid: true, errors: []

● otel - opentelemetry-collector-component-schema-validation (MCP)(type: "receiver", name: "k8s_events", version: "0.139.0", config: "{\n  \"auth_type\": \"serviceAccount\",\n  \"namespaces\": [\"default\", \"kube-system\", \"opentelemetry\"]\n}")
  ⎿  is valid: true, errors: []

● otel - opentelemetry-collector-component-schema-validation (MCP)(type: "receiver", name: "journald", version: "0.139.0", config: "{\n  \"directory\": \"/var/log/journal\",\n  \"files\": [\"/var/log/journal/*/*.journal\"],\n  \"units\": [\"docker.service\", \"kubelet.service\",
                                                                  \"containerd.service\"],\n  \"priority\": \"info\"\n}")
  ⎿  is valid: true, errors: []

● otel - opentelemetry-collector-component-schema-validation (MCP)(type: "processor", name: "k8sattributes", version: "0.139.0", config: "{\n  \"auth_type\": \"serviceAccount\",\n  \"passthrough\": false,\n  \"filter\": {\n    \"node_from_env_var\": \"KUBE_NODE_NAME\"\n  },\n  \"extract\": {\n
                                                                  \"metadata\": [\n      \"k8s.pod.name\",\n      \"k8s.pod.uid\",\n      \"k8s.deployment.name\",\n      \"k8s.namespace.name\",\n      \"k8s.node.name\",\n      \"k8s.pod.start_time\"\n    ]\n  },\n  \"pod_association\": [\n    {\n
                                                                  \"sources\": [\n        {\n          \"from\": \"resource_attribute\",\n          \"name\": \"k8s.pod.ip\"\n        }\n      ]\n    },\n    {\n      \"sources\": [\n        {\n          \"from\": \"resource_attribute\",\n
                                                                  \"name\": \"k8s.pod.uid\"\n        }\n      ]\n    },\n    {\n      \"sources\": [\n        {\n          \"from\": \"connection\"\n        }\n      ]\n    }\n  ]\n}")
  ⎿  is valid: true, errors: []

● otel - opentelemetry-collector-component-schema-validation (MCP)(type: "processor", name: "transform", version: "0.139.0", config: "{\n  \"log_statements\": [\n    {\n      \"context\": \"log\",\n      \"statements\": [\n        \"set(severity_text, \\\"INFO\\\") where severity_text == nil\",\n
                                                                  \"set(attributes[\\\"source\\\"], \\\"kubernetes\\\") where attributes[\\\"source\\\"] == nil\"\n      ]\n    }\n  ]\n}")
  ⎿  is valid: true, errors: []
```

## Future work

The wast OpenTelemetry ecosystem offers a lot of opportunities to simplify user experience with MCP servers.
Let's break this down into two categories: static configuration and data profiling.

### Static configuration

This category covers use-cases of a static configuration:

* OpenTelemetry Transformation Language (OTTL) validation
* Instrumentation configuration validation and/or helper

### Data profiling

With the data profiling use-cases the MCP is expected to understand the data which is flowing through the collector, curate for the AI agent which should ultimately provide recommendations to the end user:

* Suggest PII configuration based on the organization specific data
* Adjust sampling configuration
* Identify instrumentation issues
  * High cardinality attributes
  * Broken traces / context propagation
  * Single span traces - e.g. health endpoints
* Telemetry data attribution - understand how much telemetry data each workload is emitting

## Conclusion

We have seen that the OpenTelemetry MCP server can help with collector configuration, highlight changes across the OpenTelemetry collector versions,
find deprecated and removed configuration fields. This is not an exclusive list, but rather a start to simplified OpenTelemetry management.
Help us to improve the MCP server by sharing the feedback on the repository.

## References

* OpenTelemetry MCP server - https://github.com/pavolloffay/opentelemetry-mcp-server
* OpenTelemetry collector schema validation library - https://github.com/pavolloffay/opentelemetry-collector-config-schema
