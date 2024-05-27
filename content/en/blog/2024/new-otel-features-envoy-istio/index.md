---
title: 'Observability on the Edge: Enhancing OTel support in Envoy and Istio'
linkTitle: New OTel features in Envoy and Istio
date: 2024-05-27 # Put the current date, we will keep the date updated until your PR is merged
author: '[Joao Grassi](https://github.com/joaopgrassi) (Dynatrace)'
draft: true # TODO: remove this line once your post is ready to be published
issue: 4534
sig: OpenTelemetry Specification
---

In the current landscape of distributed cloud-native applications, there are two
well-known projects that serve as a foundation and play an important role in
such architectures: Istio and Envoy.

[Istio](https://istio.io/) is a service mesh, that orchestrates communication
between microservices, providing features such as traffic management, security
and, of course observability. Istio uses the Envoy proxy as its data plane.
[Envoy](https://www.envoyproxy.io/) is a high-performance proxy, designed for
single applications/services as well as a communication bus and "universal data
plane" for service meshs.

Both [Envoy](https://www.cncf.io/projects/envoy/) and
[Istio](https://www.cncf.io/projects/istio/) projects are open-source and part
of the Cloud Native Computing Foundation.

## Observability in Istio and Envoy

Envoy, acting as the proxy in the service mesh, is the perfect candidate to
ensure that incoming and outgoing requests are properly traced. The benefit of
this approach is that you obtain distributed traces of the entire service mesh,
providing an overview of communication between services — even when the
applications themselves are not instrumented.

Envoy offers several _tracers_ that do the job of tracing the requests,
including the OpenTelemetry tracer. Tracers can be configured either directly
within Envoy (when using it as a standalone component) or via Istio.

Here is an example of how Istio and Envoy work together to trace requests:

![Distributed trace with Istio and Envoy](envoy-tracing.png)

## Introducing new OpenTelemetry tracing features in Envoy and Istio

Although Envoy already had support for exporting OpenTelemetry traces via gRPC,
it lacked support for exporting via HTTP. Other areas that needed enhacements
were around resource attributes and sampling.

Starting from Envoy 1.29+ and Istio 1.21+, users now have access to the
following new features:

### OTLP HTTP exporter

The
[OpenTelemetry tracer](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/config/trace/v3/opentelemetry.proto)
in Envoy can now be configured to export OTLP traces via HTTP. This allows
sending telemetry to observability back-ends that only support the OTLP/HTTP,
directly from Envoy proxies.

> Note: The OpenTelemetry tracer in Envoy can only be configured with a single
> exporter. If multiplexing is desired, exporting to a OpenTelemetry collector
> is the only option.

### Resource detectors

Envoy now ships with the
[Environment Resource Detector](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/extensions/tracers/opentelemetry/resource_detectors/v3/environment_resource_detector.proto).
The environment resource detector in Envoy follows the
[resource OTel specification](https://opentelemetry.io/docs/specs/otel/resource/sdk/#specifying-resource-information-via-an-environment-variable)
and allow users to further enrich the spans produced by Envoy proxies.

The [resource detector feature](https://github.com/envoyproxy/envoy/pull/29547)
not only added the environment detector, but also made it possible for any other
resource detector to be easily added, via Envoy's built-in extensions feature.

### Custom samplers

The next exciting feature added to Envoy, is the possibility to implement and
configure custom Samplers. Envoy follows the
[OTel Sampler interface](https://opentelemetry.io/docs/specs/otel/trace/sdk/#sampler)
which makes it easy for anyone to contribute their own samplers.

Envoy ships with the
[Always On Sampler](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/extensions/tracers/opentelemetry/samplers/v3/always_on_sampler.proto)
that can be used as a reference implementation for more robust and smart
samplers.

## Demo

Time to see the new features in action! For this, we will be using the
[Istio Bookinfo application](https://istio.io/latest/docs/examples/bookinfo/).
We will deploy the bookinfo app in k8s and use Istio as our service mesh. Traces
will be exported to Jaeger via HTTP.

### Install Jaeger

First, start by installing the Jaeger operator:

```shell
kubectl create namespace observability
kubectl create -f https://github.com/jaegertracing/jaeger-operator/releases/download/v1.57.0/jaeger-operator.yaml -n observability
```

Then deploy Jaeger `all-in-one`:

```shell
kubectl apply -f - <<EOF
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: simplest
EOF
```

### Install and configure Istio

Now, let's install Istio using
[`istioctl`](https://istio.io/latest/docs/setup/install/istioctl/)

```shell
cat <<EOF | istioctl install -y -f -
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  meshConfig:
    enableTracing: true
    extensionProviders:
    - name: otel-tracing
      opentelemetry:
        port: 4318
        service: simplest-collector.default.svc.cluster.local
        http:
          path: "/v1/traces"
          timeout: 5s
        resource_detectors:
          environment: {}
EOF
```

This will install Istio and configure the OpenTelemetry tracing provider. We are
using the `http` exporter, targeting the OTLP/HTTP endpoint in the Jaeger
collector. We are also enabling the environment resource detector in
`resource_detectors`.

Next, we need to enable the tracer via Istio's
[Telemetry API](https://istio.io/latest/docs/tasks/observability/telemetry/):

```shell
kubectl apply -f - <<EOF
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: otel-demo
spec:
  tracing:
  - providers:
    - name: otel-tracing
    randomSamplingPercentage: 100
EOF
```

And finally, we configure the `OTEL_RESOURCE_ATTRIBUTES` environment variable
for the Envoy proxies:

```shell
cat <<EOF | k apply -f -
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: my-proxyconfig
  namespace: istio-system
spec:
  concurrency: 0
  environmentVariables:
    OTEL_RESOURCE_ATTRIBUTES: "host-name=abc-123"
EOF
```

### Deploy the application

The final step is to deploy the bookinfo application
([bookinfo.yaml](https://raw.githubusercontent.com/istio/istio/release-1.22/samples/bookinfo/platform/kube/bookinfo.yaml)):

```shell
kubectl label namespace default istio-injection=enabled
kubectl apply -f bookinfo.yaml
```

### Test it out

Let's make some requests to one of the services:

```shell
k exec "$(k get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}')" -c ratings -- curl -sS productpage:9080/productpage | grep -o "<title>.*</title>"
```

Then we can check it out on the Jaeger UI and we should see some nice traces
there!

![Distributed trace viewing in Jaeger](jaeger.png)

Let's analyse a bit the spans produced by Envoy:

1. First, we see the outgoing (egress) call from the `ratings` service to the
   `productpage` service
2. Then the incoming (ingress) call in the `productpage` service
3. And we also see the `host-name` resource attribute we applied via the
   `OTEL_RESOURCE_ATTRIBUTES` That was picked up by the environment resource
   detector, and added to all spans Envoy created.

Apart from this, we can see all the other downstream calls made, as all services
have the Envoy sidecar injected by Istio. We have full observability of the
calls between services, just by enabling the OTel tracer in Envoy!

## Next steps and closing.

With these new additions, users gain more flexibility in exporting their traces.
They can enrich their data with resource attributes and establish the groundwork
for more intelligent sampling techniques to be added in the future.

The new features also unlock interesting use cases for other parties in the
observability space, including cloud providers and observability vendors. With
the resource detector and sampler APIs now available in Envoy, anyone can build
support for custom samplers and detectors, enhancing the usefulness of the
telemetry data generated by Envoy.

Another exciting next step for Envoy and OpenTelemetry is the adoption of the
now stable
[HTTP semantic conventions in Envoy](https://github.com/envoyproxy/envoy/issues/30821).
This will make Envoy aligned with all OTel SDKs that are also producing the
spans following the stable HTTP semantic conventions.

Collaborating with the Envoy and Istio community to bring more OTel features to
these projects has been a great experience. The eagerness to adopt and the
strong collaboration between OpenTelemetry and relevant CNCF projects, such as
Istio and Envoy, helps solidify OpenTelemetry's position as the de facto
standard for observability.
