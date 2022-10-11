# OpenTelemetry Environment Variable Specification

**Status**: [Mixed](document-status.md)

The goal of this specification is to unify the environment variable names between different OpenTelemetry SDK implementations. SDKs MAY choose to allow configuration via the environment variables in this specification, but are not required to. If they do, they SHOULD use the names listed in this document.

## Parsing empty value

**Status**: [Stable](document-status.md)

The SDK MUST interpret an empty value of an environment variable the same way as when the variable is unset.

## Special configuration types

**Status**: [Stable](document-status.md)

### Boolean value

Any value that represents a Boolean MUST be set to true only by the case-insensitive string `"true"`, meaning `"True"` or `"TRUE"` are also accepted, as true.
An SDK MUST NOT extend this definition and define additional values that are interpreted as true.
Any value not explicitly defined here as a true value, including unset and empty values, MUST be interpreted as false.
If any value other than a true value, case-insensitive string `"false"`, empty, or unset is used, a warning SHOULD be logged to inform users about the fallback to false being applied.
All Boolean environment variables SHOULD be named and defined such that false is the expected safe default behavior.
Renaming or changing the default value MUST NOT happen without a major version upgrade.

### Numeric value

If an SDK chooses to support an integer-valued environment variable, it SHOULD support nonnegative values between 0 and 2³¹ − 1 (inclusive). Individual SDKs MAY choose to support a larger range of values.

### Enum value

For variables which accept a known value out of a set, i.e., an enum value, SDK implementations MAY support additional values not listed here.
For variables accepting an enum value, if the user provides a value the SDK does not recognize, the SDK MUST generate a warning and gracefully ignore the setting.

If a null object (empty, no-op) value is acceptable, then the enum value representing it MUST be `"none"`.

### Duration

Any value that represents a duration, for example a timeout, MUST be an integer representing a number of
milliseconds. The value is non-negative - if a negative value is provided, the SDK MUST generate a warning,
gracefully ignore the setting and use the default value if it is defined.

For example, the value `12000` indicates 12000 milliseconds, i.e., 12 seconds.



# Jaeger Exporter

**Status**: [Stable](document-status.md)

The `OTEL_EXPORTER_JAEGER_PROTOCOL` environment variable
MAY by used to specify the transport protocol.
The value MUST be one of:

- `http/thrift.binary` - [Thrift over HTTP][jaeger_http]
- `grpc` - [gRPC][jaeger_grpc]
- `udp/thrift.compact` - [Thrift with compact encoding over UDP][jaeger_udp]
- `udp/thrift.binary` - [Thrift with binary encoding over UDP][jaeger_udp]

[jaeger_http]: https://www.jaegertracing.io/docs/latest/apis/#thrift-over-http-stable
[jaeger_grpc]: https://www.jaegertracing.io/docs/latest/apis/#protobuf-via-grpc-stable
[jaeger_udp]: https://www.jaegertracing.io/docs/latest/apis/#thrift-over-udp-stable

The default transport protocol SHOULD be `http/thrift.binary` unless
SDKs have good reasons to choose other as the default
(e.g. for backward compatibility reasons).

Environment variables specific for the `http/thrift.binary` transport protocol:


## `OTEL_EXPORTER_JAEGER_ENDPOINT` 

 Full URL of the [Jaeger HTTP endpoint][jaeger_collector] 
example: `http://localhost:14268/api/traces`

## `OTEL_EXPORTER_JAEGER_TIMEOUT` 

Maximum time (in milliseconds) the Jaeger exporter will wait for each batch export 
 example: 10000

## `OTEL_EXPORTER_JAEGER_USER`

Username to be used for HTTP basic authentication 

## `OTEL_EXPORTER_JAEGER_PASSWORD` 

 Password to be used for HTTP basic authentication
 
 
Environment variables specific for the `grpc` transport protocol:


## `OTEL_EXPORTER_JAEGER_ENDPOINT` 

 URL of the [Jaeger gRPC endpoint][jaeger_collector]
 example: `http://localhost:14250` 

## `OTEL_EXPORTER_JAEGER_TIMEOUT`  

 Maximum time (in milliseconds) the Jaeger exporter will wait for each batch export 
 example: 10000

## `OTEL_EXPORTER_JAEGER_USER`    

 Username to be used for HTTP basic authentication 

## `OTEL_EXPORTER_JAEGER_PASSWORD` 

 Password to be used for HTTP basic authentication 


Environment variables specific for the `udp/thrift.compact` transport protocol:

##  `OTEL_EXPORTER_JAEGER_AGENT_HOST`  

 Hostname of the [Jaeger agent][jaeger_agent]
 example: `localhost` 
 
##  `OTEL_EXPORTER_JAEGER_AGENT_PORT` 

 `udp/thrift.compact` port of the [Jaeger agent][jaeger_agent] 
  example: `6831`


Environment variables specific for the `udp/thrift.binary` transport protocol:


## `OTEL_EXPORTER_JAEGER_AGENT_HOST` 

 Hostname of the [Jaeger agent][jaeger_agent]
 example: `localhost` 

## `OTEL_EXPORTER_JAEGER_AGENT_PORT`

 `udp/thrift.binary` port of the [Jaeger agent][jaeger_agent] 
 example: `6832` 

[jaeger_collector]: https://www.jaegertracing.io/docs/latest/deployment/#collector
[jaeger_agent]: https://www.jaegertracing.io/docs/latest/deployment/#agent

# Zipkin Exporter

**Status**: [Stable](document-status.md)


## `OTEL_EXPORTER_ZIPKIN_ENDPOINT`

  Endpoint for Zipkin traces
  example: `http://localhost:9411/api/v2/spans` 

## `OTEL_EXPORTER_ZIPKIN_TIMEOUT`

  Maximum time (in milliseconds) the Zipkin exporter will wait for each batch export 
  example: 10000

Additionally, the following environment variables are reserved for future
usage in Zipkin Exporter configuration:

## `OTEL_EXPORTER_ZIPKIN_PROTOCOL`

This will be used to specify whether or not the exporter uses v1 or v2, json,
thrift or protobuf.  As of 1.0 of the specification, there
_is no specified default, or configuration via environment variables_.

