---
title: SDK configuration
linkTitle: SDK
weight: 30
---

The SDK's autoconfiguration module is used for basic configuration of the agent.
Read the [docs](/docs/languages/java/configuration) to find settings such as
configuring export or sampling.

{{% alert title="Important" color="warning" %}}

Unlike the SDK autoconfiguration, versions 2.0+ of the Java agent and
OpenTelemetry Spring Boot starter use `http/protobuf` as the default protocol,
not `grpc`.

{{% /alert %}}

## Enable Resource Providers that are disabled by default

In addition to the resource configuration from the SDK autoconfiguration, you
can enable additional resource providers that are disabled by default:

{{% config_option
name="otel.resource.providers.aws.enabled"
default=false
%}} Enables the
[AWS Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources).
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.gcp.enabled"
default=false
%}} Enables the
[GCP Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources).
{{% /config_option %}}
                      
