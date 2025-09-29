---
title: HTTP instrumentation configuration
linkTitle: HTTP
weight: 110
---

## Capturing HTTP request and response headers

You can configure the agent to capture predefined HTTP headers as span
attributes, according to the
[semantic convention](/docs/specs/semconv/http/http-spans/). Use the following
properties to define which HTTP headers you want to capture:

{{% config_option name="otel.instrumentation.http.client.capture-request-headers" %}}
A comma-separated list of HTTP header names. HTTP client instrumentations will
capture HTTP request header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.client.capture-response-headers" %}}
A comma-separated list of HTTP header names. HTTP client instrumentations will
capture HTTP response header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-request-headers" %}}
A comma-separated list of HTTP header names. HTTP server instrumentations will
capture HTTP request header values for all configured header names.
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-response-headers" %}}
A comma-separated list of HTTP header names. HTTP server instrumentations will
capture HTTP response header values for all configured header names.
{{% /config_option %}}

These configuration options are supported by all HTTP client and server
instrumentations.

> **Note**: The property/environment variable names listed in the table are
> still experimental, and thus are subject to change.

## Capturing servlet request parameters

You can configure the agent to capture predefined HTTP request parameters as
span attributes for requests that are handled by the Servlet API. Use the
following property to define which servlet request parameters you want to
capture:

{{% config_option name="otel.instrumentation.servlet.experimental.capture-request-parameters" %}}
A comma-separated list of request parameter names. {{% /config_option %}}

> **Note**: The property/environment variable names listed in the table are
> still experimental, and thus are subject to change.

## Configuring known HTTP methods

Configures the instrumentation to recognize an alternative set of HTTP request
methods. All other methods will be treated as `_OTHER`.

{{% config_option
name="otel.instrumentation.http.known-methods"
default="CONNECT,DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT,TRACE"
%}} A comma-separated list of known HTTP methods. {{% /config_option %}}

## Enabling experimental HTTP telemetry

You can configure the agent to capture additional experimental HTTP telemetry
data.

{{% config_option
name="otel.instrumentation.http.client.emit-experimental-telemetry"
default=false
%}} Enables the experimental HTTP client telemetry. {{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.emit-experimental-telemetry"
default=false
%}}
Enables the experimental HTTP server telemetry. {{% /config_option %}}

For client and server spans, the following attributes are added:

- `http.request.body.size` and `http.response.body.size`: The size of the
  request and response bodies, respectively.

For client metrics, the following metrics are created:

- [http.client.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientrequestbodysize)
- [http.client.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientresponsebodysize)

For server metrics, the following metrics are created:

- [http.server.active_requests](/docs/specs/semconv/http/http-metrics/#metric-httpserveractive_requests)
- [http.server.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestbodysize)
- [http.server.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverresponsebodysize)
