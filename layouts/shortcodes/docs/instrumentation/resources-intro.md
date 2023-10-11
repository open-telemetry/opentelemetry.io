{{ $lang := .Get 0 -}} {{ $processWord := "a process" -}}
{{ $resourceHRef := "/docs/concepts/resources/" }}

{{ if eq $lang "erlang" -}} {{ $processWord = "an OTP Release" }} {{ end -}}

{{ if eq .Page.RelPermalink $resourceHRef }}
{{ $resourceHRef = "/docs/specs/otel/resource/sdk/" }} {{ end -}}

A [resource]({{ $resourceHRef }}) represents the entity producing telemetry as
resource attributes. For example, {{ $processWord }} producing telemetry that is
running in a container on Kubernetes has {{ $processWord }} name, a pod name, a
namespace, and possibly a deployment name. All four of these attributes can be
included in the resource.

In your observability backend, you can use resource information to better
investigate interesting behavior. For example, if your trace or metrics data
indicate latency in your system, you can narrow it down to a specific container,
pod, or Kubernetes deployment.
