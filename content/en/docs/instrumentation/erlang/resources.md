---
title: Resources
weight: 70
# For the writing of behaviour, see
# https://www.erlang.org/doc/reference_manual/modules.html#behaviour-module-attribute
spelling: cSpell:ignore behaviour
---

A [resource](/docs/specs/otel/overview/#resources) represents an entity
producing telemetry as attributes. For example, an OTP Release producing
telemetry that is running in a container on Kubernetes has an OTP Release name,
a Pod name, a namespace, and possibly a deployment name. All four of these
attributes can be included in the resource.

In your observability backend, you can use resource information to better
investigate interesting behavior. For example, if your trace or metrics data
indicate latency in your system, you can narrow it down to a specific container,
pod, or Kubernetes deployment.

## Using resource detectors

Resource detectors fetch resource attributes from various sources. The default
detectors use the OS environment variable `OTEL_RESOURCE_ATTRIBUTES` and the
`opentelemetry` OTP Application environment variable `resource`.

The detectors to use is a list of module names and can be configured in the
Application configuration:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% sys.config
{resource_detectors, [otel_resource_env_var, otel_resource_app_env]}
{{< /tab >}}

{{< tab Elixir >}}
## runtime.exs
resource_detectors: [:otel_resource_env_var, :otel_resource_app_env]
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

Or through the environment variable `OTEL_RESOURCE_DETECTORS`:

```sh
OTEL_RESOURCE_DETECTORS=otel_resource_env_var,otel_resource_app_env
```

All resources detectors are protected with a timeout, in milliseconds, after
which they return an empty value. This allows for resource detectors to do
things like hit the network without potentially hanging the entire program
indefinitely. The default is 5000 milliseconds and can be set with environment
variable `OTEL_RESOURCE_DETECTOR_TIMEOUT` or Application variable
`otel_resource_detector_timeout`.

## Adding resources with OS and Application environment variables

With the two default resource detectors enabled you can set resource attributes
either with the OS environment variable `OTEL_RESOURCE_ATTRIBUTES`:

```sh
OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development"
```

Alternatively, use the `resource` Application environment under the
`opentelemetry` Application configuration of `sys.config` or `runtime.exs`:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% sys.config
{resource, #{deployment => #{environment => <<"development">>}}
{{< /tab >}}

{{< tab Elixir >}}
## runtime.exs
resource: %{deployment: %{environment: "development" }}
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

Resource attributes in the `resource` Application environment variable are
flattened and combined with `.`, so
`#{deployment => #{environment => <<"development">> }` is the same as
`#{'deployment.environment' => <<"development">>}`.

## Custom resource detectors

Custom resource detectors can be created by implementing the
[`otel_resource_detector behaviour`](https://hexdocs.pm/opentelemetry/1.3.0/otel_resource_detector.html#callbacks)
which contains a single callback `get_resource/1` that returns an
[`otel_resource`](https://hexdocs.pm/opentelemetry/1.3.0/otel_resource.html).

Note that there are
[semantic conventions](/docs/specs/otel/resource/semantic_conventions/) defined
for `resource` that should be followed if they apply when adding new resource
attributes.
