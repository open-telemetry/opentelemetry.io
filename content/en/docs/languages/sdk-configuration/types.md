---
linkTitle: Types
weight: 10
aliases: [general-sdk-configuration]
---

<style>

.types-table {
  td:first-child {
    max-width: 200px;
  }
}

</style>

# Configuration Types

This page documents all configuration types for the OpenTelemetry SDK declarative configuration.

{{% alert title="Note" %}}
* Properties marked with <sup>*</sup> are required.
* Default behavior will also apply if a property is explicitly set to `null`.
{{% /alert %}}


<!-- BEGIN GENERATED: types SOURCE: opentelemetry-configuration -->
## Stable Types

### Aggregation {#aggregation}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `base2_exponential_bucket_histogram` | [`Base2ExponentialBucketHistogramAggregation`](#base2exponentialbuckethistogramaggregation) | If omitted, ignore. | Configures the stream to collect data for the exponential histogram metric point, which uses a base-2 exponential formula to determine bucket boundaries and an integer scale parameter to control resolution. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#base2-exponential-bucket-histogram-aggregation)). |
| `default` | [`DefaultAggregation`](#defaultaggregation) | If omitted, ignore. | Configures the stream to use the instrument kind to select an aggregation and advisory parameters to influence aggregation configuration parameters. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#default-aggregation)). |
| `drop` | [`DropAggregation`](#dropaggregation) | If omitted, ignore. | Configures the stream to ignore/drop all instrument measurements. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#drop-aggregation)). |
| `explicit_bucket_histogram` | [`ExplicitBucketHistogramAggregation`](#explicitbuckethistogramaggregation) | If omitted, ignore. | Configures the stream to collect data for the histogram metric point using a set of explicit boundary values for histogram bucketing. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#explicit-bucket-histogram-aggregation)) |
| `last_value` | [`LastValueAggregation`](#lastvalueaggregation) | If omitted, ignore. | Configures the stream to collect data using the last measurement. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#last-value-aggregation)). |
| `sum` | [`SumAggregation`](#sumaggregation) | If omitted, ignore. | Configures the stream to collect the arithmetic sum of measurement values. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#sum-aggregation)). |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### AlwaysOffSampler {#alwaysoffsampler}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### AlwaysOnSampler {#alwaysonsampler}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### AttributeLimits {#attributelimits}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `attribute_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max attribute count. <br>Value must be non-negative.<br> |
| `attribute_value_length_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, there is no limit. | `minimum`: `0` | Configure max attribute value size. <br>Value must be non-negative.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### AttributeNameValue {#attributenamevalue}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `name`<sup>*</sup> | `string` | Property is required and must be non-null. | The attribute name.<br> |
| `type` | [`AttributeType`](#attributetype) | If omitted, string is used. | The attribute type.<br> |
| `value`<sup>*</sup> | `oneOf` | Property is required and must be non-null. | The attribute value.<br>The type of value must match .type.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["name","value"]`<br>
### AttributeType {#attributetype}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `bool` | Boolean attribute value. |
| `bool_array` | Boolean array attribute value. |
| `double` | Double attribute value. |
| `double_array` | Double array attribute value. |
| `int` | Integer attribute value. |
| `int_array` | Integer array attribute value. |
| `string` | String attribute value. |
| `string_array` | String array attribute value. |

</div>

### B3MultiPropagator {#b3multipropagator}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### B3Propagator {#b3propagator}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### BaggagePropagator {#baggagepropagator}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### Base2ExponentialBucketHistogramAggregation {#base2exponentialbuckethistogramaggregation}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `max_scale` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 20 is used. | • `minimum`: `-10`<br>• `maximum`: `20`<br> | Configure the max scale factor. |
| `max_size` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 160 is used. | `minimum`: `2` | Configure the maximum number of buckets in each of the positive and negative ranges, not counting the special zero bucket. |
| `record_min_max` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, true is used. | None. | Configure whether or not to record min and max. |

</div>

**Constraints:**

`additionalProperties`: `false`
### BatchLogRecordProcessor {#batchlogrecordprocessor}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `export_timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 30000 is used. | `minimum`: `0` | Configure maximum allowed time (in milliseconds) to export data. <br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |
| `exporter`<sup>*</sup> | [`LogRecordExporter`](#logrecordexporter) | Property is required and must be non-null. | None. | Configure exporter. |
| `max_export_batch_size` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 512 is used. | `exclusiveMinimum`: `0` | Configure maximum batch size. Value must be positive.<br> |
| `max_queue_size` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 2048 is used. | `exclusiveMinimum`: `0` | Configure maximum queue size. Value must be positive.<br> |
| `schedule_delay` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 1000 is used. | `minimum`: `0` | Configure delay interval (in milliseconds) between two consecutive exports. <br>Value must be non-negative.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["exporter"]`<br>
### BatchSpanProcessor {#batchspanprocessor}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `export_timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 30000 is used. | `minimum`: `0` | Configure maximum allowed time (in milliseconds) to export data. <br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |
| `exporter`<sup>*</sup> | [`SpanExporter`](#spanexporter) | Property is required and must be non-null. | None. | Configure exporter. |
| `max_export_batch_size` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 512 is used. | `exclusiveMinimum`: `0` | Configure maximum batch size. Value must be positive.<br> |
| `max_queue_size` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 2048 is used. | `exclusiveMinimum`: `0` | Configure maximum queue size. Value must be positive.<br> |
| `schedule_delay` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 5000 is used. | `minimum`: `0` | Configure delay interval (in milliseconds) between two consecutive exports. <br>Value must be non-negative.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["exporter"]`<br>
### CardinalityLimits {#cardinalitylimits}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `counter` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for counter instruments.<br> |
| `default` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 2000 is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for all instrument types.<br>Instrument-specific cardinality limits take priority. <br> |
| `gauge` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for gauge instruments.<br> |
| `histogram` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for histogram instruments.<br> |
| `observable_counter` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for observable_counter instruments.<br> |
| `observable_gauge` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for observable_gauge instruments.<br> |
| `observable_up_down_counter` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for observable_up_down_counter instruments.<br> |
| `up_down_counter` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the value from .default is used. | `exclusiveMinimum`: `0` | Configure default cardinality limit for up_down_counter instruments.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ConsoleExporter {#consoleexporter}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ConsoleMetricExporter {#consolemetricexporter}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `default_histogram_aggregation` | [`ExporterDefaultHistogramAggregation`](#exporterdefaulthistogramaggregation) | If omitted, explicit_bucket_histogram is used. | Configure default histogram aggregation.<br> |
| `temporality_preference` | [`ExporterTemporalityPreference`](#exportertemporalitypreference) | If omitted, cumulative is used. | Configure temporality preference.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### DefaultAggregation {#defaultaggregation}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### Distribution {#distribution}

**No properties.**

**Constraints:**

• `additionalProperties`: `{"type":"object"}`<br>• `minProperties`: `1`<br>
### DropAggregation {#dropaggregation}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExemplarFilter {#exemplarfilter}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `always_off` | ExemplarFilter which makes no measurements eligible for being an Exemplar. |
| `always_on` | ExemplarFilter which makes all measurements eligible for being an Exemplar. |
| `trace_based` | ExemplarFilter which makes measurements recorded in the context of a sampled parent span eligible for being an Exemplar. |

</div>

### ExplicitBucketHistogramAggregation {#explicitbuckethistogramaggregation}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `boundaries` | `array` of `number` | If omitted, [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000] is used. | `minItems`: `0` | Configure bucket boundaries.<br> |
| `record_min_max` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, true is used. | None. | Configure record min and max.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExporterDefaultHistogramAggregation {#exporterdefaulthistogramaggregation}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `base2_exponential_bucket_histogram` | Use base2 exponential histogram as the default aggregation for histogram instruments. |
| `explicit_bucket_histogram` | Use explicit bucket histogram as the default aggregation for histogram instruments. |

</div>

### ExporterTemporalityPreference {#exportertemporalitypreference}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `cumulative` | Use cumulative aggregation temporality for all instrument types. |
| `delta` | Use delta aggregation for all instrument types except up down counter and asynchronous up down counter. |
| `low_memory` | Use delta aggregation temporality for counter and histogram instrument types. Use cumulative aggregation temporality for all other instrument types. |

</div>

### GrpcTls {#grpctls}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `ca_file` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, system default certificate verification is used for secure connections. | Configure certificate used to verify a server's TLS credentials. <br>Absolute path to certificate file in PEM format.<br> |
| `cert_file` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, mTLS is not used. | Configure mTLS client certificate. <br>Absolute path to client certificate file in PEM format. If set, .client_key must also be set.<br> |
| `insecure` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, false is used. | Configure client transport security for the exporter's connection. <br>Only applicable when .endpoint is provided without http or https scheme. Implementations may choose to ignore .insecure.<br> |
| `key_file` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, mTLS is not used. | Configure mTLS private client key. <br>Absolute path to client key file in PEM format. If set, .client_certificate must also be set.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### HttpTls {#httptls}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `ca_file` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, system default certificate verification is used for secure connections. | Configure certificate used to verify a server's TLS credentials. <br>Absolute path to certificate file in PEM format.<br> |
| `cert_file` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, mTLS is not used. | Configure mTLS client certificate. <br>Absolute path to client certificate file in PEM format. If set, .client_key must also be set.<br> |
| `key_file` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, mTLS is not used. | Configure mTLS private client key. <br>Absolute path to client key file in PEM format. If set, .client_certificate must also be set.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### IncludeExclude {#includeexclude}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `excluded` | `array` of `string` | If omitted, .included attributes are included. | `minItems`: `1` | Configure list of value patterns to exclude. Applies after .included (i.e. excluded has higher priority than included).<br>Values are evaluated to match as follows:<br> * If the value exactly matches.<br> * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |
| `included` | `array` of `string` | If omitted, all values are included. | `minItems`: `1` | Configure list of value patterns to include.<br>Values are evaluated to match as follows:<br> * If the value exactly matches.<br> * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### InstrumentType {#instrumenttype}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `counter` | Synchronous counter instruments. |
| `gauge` | Synchronous gauge instruments. |
| `histogram` | Synchronous histogram instruments. |
| `observable_counter` | Asynchronous counter instruments. |
| `observable_gauge` | Asynchronous gauge instruments. |
| `observable_up_down_counter` | Asynchronous up down counter instruments. |
| `up_down_counter` | Synchronous up down counter instruments. |

</div>

### JaegerPropagator {#jaegerpropagator}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### LastValueAggregation {#lastvalueaggregation}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### LoggerProvider {#loggerprovider}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `limits` | [`LogRecordLimits`](#logrecordlimits) | If omitted, default values as described in LogRecordLimits are used. | None. | Configure log record limits. See also attribute_limits. |
| `processors`<sup>*</sup> | `array` of [`LogRecordProcessor`](#logrecordprocessor) | Property is required and must be non-null. | `minItems`: `1` | Configure log record processors. |
| `logger_configurator/development`<br>**⚠ Experimental** | [`ExperimentalLoggerConfigurator`](#experimentalloggerconfigurator) | If omitted, all loggers use default values as described in ExperimentalLoggerConfig. | None. | Configure loggers.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["processors"]`<br>
### LogRecordExporter {#logrecordexporter}

`LogRecordExporter` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `console` | [`ConsoleExporter`](#consoleexporter) | If omitted, ignore. | Configure exporter to be console. |
| `otlp_grpc` | [`OtlpGrpcExporter`](#otlpgrpcexporter) | If omitted, ignore. | Configure exporter to be OTLP with gRPC transport. |
| `otlp_http` | [`OtlpHttpExporter`](#otlphttpexporter) | If omitted, ignore. | Configure exporter to be OTLP with HTTP transport. |
| `otlp_file/development`<br>**⚠ Experimental** | [`ExperimentalOtlpFileExporter`](#experimentalotlpfileexporter) | If omitted, ignore. | Configure exporter to be OTLP with file transport.<br> |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### LogRecordLimits {#logrecordlimits}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `attribute_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max attribute count. Overrides .attribute_limits.attribute_count_limit. <br>Value must be non-negative.<br> |
| `attribute_value_length_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, there is no limit. | `minimum`: `0` | Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit. <br>Value must be non-negative.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### LogRecordProcessor {#logrecordprocessor}

`LogRecordProcessor` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `batch` | [`BatchLogRecordProcessor`](#batchlogrecordprocessor) | If omitted, ignore. | Configure a batch log record processor. |
| `simple` | [`SimpleLogRecordProcessor`](#simplelogrecordprocessor) | If omitted, ignore. | Configure a simple log record processor. |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### MeterProvider {#meterprovider}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `exemplar_filter` | [`ExemplarFilter`](#exemplarfilter) | If omitted, trace_based is used. | None. | Configure the exemplar filter. <br> |
| `readers`<sup>*</sup> | `array` of [`MetricReader`](#metricreader) | Property is required and must be non-null. | `minItems`: `1` | Configure metric readers. |
| `views` | `array` of [`View`](#view) | If omitted, no views are registered. | `minItems`: `1` | Configure views. <br>Each view has a selector which determines the instrument(s) it applies to, and a configuration for the resulting stream(s).<br> |
| `meter_configurator/development`<br>**⚠ Experimental** | [`ExperimentalMeterConfigurator`](#experimentalmeterconfigurator) | If omitted, all meters use default values as described in ExperimentalMeterConfig. | None. | Configure meters.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["readers"]`<br>
### MetricProducer {#metricproducer}

`MetricProducer` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `opencensus` | [`OpenCensusMetricProducer`](#opencensusmetricproducer) | If omitted, ignore. | Configure metric producer to be opencensus. |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### MetricReader {#metricreader}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `periodic` | [`PeriodicMetricReader`](#periodicmetricreader) | If omitted, ignore. | Configure a periodic metric reader. |
| `pull` | [`PullMetricReader`](#pullmetricreader) | If omitted, ignore. | Configure a pull based metric reader. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### NameStringValuePair {#namestringvaluepair}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `name`<sup>*</sup> | `string` | Property is required and must be non-null. | The name of the pair. |
| `value`<sup>*</sup> | one of:<br>• `string`<br>• `null`<br> | Property must be present, but if null the behavior is dependent on usage context. | The value of the pair. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["name","value"]`<br>
### OpenCensusMetricProducer {#opencensusmetricproducer}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### OpenTelemetryConfiguration {#opentelemetryconfiguration}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `attribute_limits` | [`AttributeLimits`](#attributelimits) | If omitted, default values as described in AttributeLimits are used. | Configure general attribute limits. See also tracer_provider.limits, logger_provider.limits.<br> |
| `disabled` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, false is used. | Configure if the SDK is disabled or not.<br> |
| `distribution` | [`Distribution`](#distribution) | If omitted, distribution defaults are used. | Defines configuration parameters specific to a particular OpenTelemetry distribution or vendor.<br>This section provides a standardized location for distribution-specific settings<br>that are not part of the OpenTelemetry configuration model.<br>It allows vendors to expose their own extensions and general configuration options.<br> |
| `file_format`<sup>*</sup> | `string` | Property is required and must be non-null. | The file format version.<br>Represented as a string including the semver major, minor version numbers (and optionally the meta tag). For example: "0.4", "1.0-rc.2", "1.0" (after stable release).<br>([See here for more details](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/VERSIONING.md)).<br>The yaml format is documented at https://github.com/open-telemetry/opentelemetry-configuration/tree/main/schema<br> |
| `log_level` | [`SeverityNumber`](#severitynumber) | If omitted, INFO is used. | Configure the log level of the internal logger used by the SDK.<br> |
| `logger_provider` | [`LoggerProvider`](#loggerprovider) | If omitted, a noop logger provider is used. | Configure logger provider.<br> |
| `meter_provider` | [`MeterProvider`](#meterprovider) | If omitted, a noop meter provider is used. | Configure meter provider.<br> |
| `propagator` | [`Propagator`](#propagator) | If omitted, a noop propagator is used. | Configure text map context propagators.<br> |
| `resource` | [`Resource`](#resource) | If omitted, the default resource is used. | Configure resource for all signals.<br> |
| `tracer_provider` | [`TracerProvider`](#tracerprovider) | If omitted, a noop tracer provider is used. | Configure tracer provider.<br> |
| `instrumentation/development`<br>**⚠ Experimental** | [`ExperimentalInstrumentation`](#experimentalinstrumentation) | If omitted, instrumentation defaults are used. | Configure instrumentation.<br> |

</div>

**Constraints:**

• `additionalProperties`: `true`<br>• `required`: `["file_format"]`<br>
### OpenTracingPropagator {#opentracingpropagator}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### OtlpGrpcExporter {#otlpgrpcexporter}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `compression` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, none is used. | None. | Configure compression.<br>Known values include: gzip, none. Implementations may support other compression algorithms.<br> |
| `endpoint` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, http://localhost:4317 is used. | None. | Configure endpoint.<br> |
| `headers` | `array` of [`NameStringValuePair`](#namestringvaluepair) | If omitted, no headers are added. | `minItems`: `1` | Configure headers. Entries have higher priority than entries from .headers_list.<br>If an entry's .value is null, the entry is ignored.<br> |
| `headers_list` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, no headers are added. | None. | Configure headers. Entries have lower priority than entries from .headers.<br>The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)).<br> |
| `timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 10000 is used. | `minimum`: `0` | Configure max time (in milliseconds) to wait for each export.<br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |
| `tls` | [`GrpcTls`](#grpctls) | If omitted, system default TLS settings are used. | None. | Configure TLS settings for the exporter. |

</div>

**Constraints:**

`additionalProperties`: `false`
### OtlpGrpcMetricExporter {#otlpgrpcmetricexporter}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `compression` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, none is used. | None. | Configure compression.<br>Known values include: gzip, none. Implementations may support other compression algorithms.<br> |
| `default_histogram_aggregation` | [`ExporterDefaultHistogramAggregation`](#exporterdefaulthistogramaggregation) | If omitted, explicit_bucket_histogram is used. | None. | Configure default histogram aggregation.<br> |
| `endpoint` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, http://localhost:4317 is used. | None. | Configure endpoint.<br> |
| `headers` | `array` of [`NameStringValuePair`](#namestringvaluepair) | If omitted, no headers are added. | `minItems`: `1` | Configure headers. Entries have higher priority than entries from .headers_list.<br>If an entry's .value is null, the entry is ignored.<br> |
| `headers_list` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, no headers are added. | None. | Configure headers. Entries have lower priority than entries from .headers.<br>The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)).<br> |
| `temporality_preference` | [`ExporterTemporalityPreference`](#exportertemporalitypreference) | If omitted, cumulative is used. | None. | Configure temporality preference.<br> |
| `timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 10000 is used. | `minimum`: `0` | Configure max time (in milliseconds) to wait for each export.<br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |
| `tls` | [`GrpcTls`](#grpctls) | If omitted, system default TLS settings are used. | None. | Configure TLS settings for the exporter. |

</div>

**Constraints:**

`additionalProperties`: `false`
### OtlpHttpEncoding {#otlphttpencoding}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `json` | Protobuf JSON encoding. |
| `protobuf` | Protobuf binary encoding. |

</div>

### OtlpHttpExporter {#otlphttpexporter}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `compression` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, none is used. | None. | Configure compression.<br>Known values include: gzip, none. Implementations may support other compression algorithms.<br> |
| `encoding` | [`OtlpHttpEncoding`](#otlphttpencoding) | If omitted, protobuf is used. | None. | Configure the encoding used for messages. <br>Implementations may not support json.<br> |
| `endpoint` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, the http://localhost:4318/v1/{signal} (where signal is 'traces', 'logs', or 'metrics') is used. | None. | Configure endpoint, including the signal specific path.<br> |
| `headers` | `array` of [`NameStringValuePair`](#namestringvaluepair) | If omitted, no headers are added. | `minItems`: `1` | Configure headers. Entries have higher priority than entries from .headers_list.<br>If an entry's .value is null, the entry is ignored.<br> |
| `headers_list` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, no headers are added. | None. | Configure headers. Entries have lower priority than entries from .headers.<br>The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)).<br> |
| `timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 10000 is used. | `minimum`: `0` | Configure max time (in milliseconds) to wait for each export.<br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |
| `tls` | [`HttpTls`](#httptls) | If omitted, system default TLS settings are used. | None. | Configure TLS settings for the exporter. |

</div>

**Constraints:**

`additionalProperties`: `false`
### OtlpHttpMetricExporter {#otlphttpmetricexporter}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `compression` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, none is used. | None. | Configure compression.<br>Known values include: gzip, none. Implementations may support other compression algorithms.<br> |
| `default_histogram_aggregation` | [`ExporterDefaultHistogramAggregation`](#exporterdefaulthistogramaggregation) | If omitted, explicit_bucket_histogram is used. | None. | Configure default histogram aggregation.<br> |
| `encoding` | [`OtlpHttpEncoding`](#otlphttpencoding) | If omitted, protobuf is used. | None. | Configure the encoding used for messages. <br>Implementations may not support json.<br> |
| `endpoint` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, http://localhost:4318/v1/metrics is used. | None. | Configure endpoint.<br> |
| `headers` | `array` of [`NameStringValuePair`](#namestringvaluepair) | If omitted, no headers are added. | `minItems`: `1` | Configure headers. Entries have higher priority than entries from .headers_list.<br>If an entry's .value is null, the entry is ignored.<br> |
| `headers_list` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, no headers are added. | None. | Configure headers. Entries have lower priority than entries from .headers.<br>The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)).<br> |
| `temporality_preference` | [`ExporterTemporalityPreference`](#exportertemporalitypreference) | If omitted, cumulative is used. | None. | Configure temporality preference.<br> |
| `timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 10000 is used. | `minimum`: `0` | Configure max time (in milliseconds) to wait for each export.<br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |
| `tls` | [`HttpTls`](#httptls) | If omitted, system default TLS settings are used. | None. | Configure TLS settings for the exporter. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ParentBasedSampler {#parentbasedsampler}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `local_parent_not_sampled` | [`Sampler`](#sampler) | If omitted, always_off is used. | Configure local_parent_not_sampled sampler.<br> |
| `local_parent_sampled` | [`Sampler`](#sampler) | If omitted, always_on is used. | Configure local_parent_sampled sampler.<br> |
| `remote_parent_not_sampled` | [`Sampler`](#sampler) | If omitted, always_off is used. | Configure remote_parent_not_sampled sampler.<br> |
| `remote_parent_sampled` | [`Sampler`](#sampler) | If omitted, always_on is used. | Configure remote_parent_sampled sampler.<br> |
| `root` | [`Sampler`](#sampler) | If omitted, always_on is used. | Configure root sampler.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### PeriodicMetricReader {#periodicmetricreader}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `cardinality_limits` | [`CardinalityLimits`](#cardinalitylimits) | If omitted, default values as described in CardinalityLimits are used. | None. | Configure cardinality limits. |
| `exporter`<sup>*</sup> | [`PushMetricExporter`](#pushmetricexporter) | Property is required and must be non-null. | None. | Configure exporter. |
| `interval` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 60000 is used. | `minimum`: `0` | Configure delay interval (in milliseconds) between start of two consecutive exports. <br>Value must be non-negative.<br> |
| `producers` | `array` of [`MetricProducer`](#metricproducer) | If omitted, no metric producers are added. | `minItems`: `1` | Configure metric producers. |
| `timeout` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 30000 is used. | `minimum`: `0` | Configure maximum allowed time (in milliseconds) to export data. <br>Value must be non-negative. A value of 0 indicates no limit (infinity).<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["exporter"]`<br>
### Propagator {#propagator}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `composite` | `array` of [`TextMapPropagator`](#textmappropagator) | If omitted, and .composite_list is omitted or null, a noop propagator is used. | `minItems`: `1` | Configure the propagators in the composite text map propagator. Entries from .composite_list are appended to the list here with duplicates filtered out.<br>Built-in propagator keys include: tracecontext, baggage, b3, b3multi, jaeger, ottrace. Known third party keys include: xray. <br> |
| `composite_list` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, and .composite is omitted or null, a noop propagator is used. | None. | Configure the propagators in the composite text map propagator. Entries are appended to .composite with duplicates filtered out.<br>The value is a comma separated list of propagator identifiers matching the format of OTEL_PROPAGATORS. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#general-sdk-configuration)).<br>Built-in propagator identifiers include: tracecontext, baggage, b3, b3multi, jaeger, ottrace. Known third party identifiers include: xray. <br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### PullMetricExporter {#pullmetricexporter}

`PullMetricExporter` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `prometheus/development`<br>**⚠ Experimental** | [`ExperimentalPrometheusMetricExporter`](#experimentalprometheusmetricexporter) | If omitted, ignore. | Configure exporter to be prometheus.<br> |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### PullMetricReader {#pullmetricreader}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `cardinality_limits` | [`CardinalityLimits`](#cardinalitylimits) | If omitted, default values as described in CardinalityLimits are used. | None. | Configure cardinality limits. |
| `exporter`<sup>*</sup> | [`PullMetricExporter`](#pullmetricexporter) | Property is required and must be non-null. | None. | Configure exporter. |
| `producers` | `array` of [`MetricProducer`](#metricproducer) | If omitted, no metric producers are added. | `minItems`: `1` | Configure metric producers. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["exporter"]`<br>
### PushMetricExporter {#pushmetricexporter}

`PushMetricExporter` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `console` | [`ConsoleMetricExporter`](#consolemetricexporter) | If omitted, ignore. | Configure exporter to be console.<br> |
| `otlp_grpc` | [`OtlpGrpcMetricExporter`](#otlpgrpcmetricexporter) | If omitted, ignore. | Configure exporter to be OTLP with gRPC transport.<br> |
| `otlp_http` | [`OtlpHttpMetricExporter`](#otlphttpmetricexporter) | If omitted, ignore. | Configure exporter to be OTLP with HTTP transport.<br> |
| `otlp_file/development`<br>**⚠ Experimental** | [`ExperimentalOtlpFileMetricExporter`](#experimentalotlpfilemetricexporter) | If omitted, ignore. | Configure exporter to be OTLP with file transport.<br> |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### Resource {#resource}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `attributes` | `array` of [`AttributeNameValue`](#attributenamevalue) | If omitted, no resource attributes are added. | `minItems`: `1` | Configure resource attributes. Entries have higher priority than entries from .resource.attributes_list.<br> |
| `attributes_list` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, no resource attributes are added. | None. | Configure resource attributes. Entries have lower priority than entries from .resource.attributes.<br>The value is a list of comma separated key-value pairs matching the format of OTEL_RESOURCE_ATTRIBUTES. ([See here for more details](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#general-sdk-configuration)).<br> |
| `schema_url` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, no schema URL is used. | None. | Configure resource schema URL.<br> |
| `detection/development`<br>**⚠ Experimental** | [`ExperimentalResourceDetection`](#experimentalresourcedetection) | If omitted, resource detection is disabled. | None. | Configure resource detection.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### Sampler {#sampler}

`Sampler` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `always_off` | [`AlwaysOffSampler`](#alwaysoffsampler) | If omitted, ignore. | Configure sampler to be always_off. |
| `always_on` | [`AlwaysOnSampler`](#alwaysonsampler) | If omitted, ignore. | Configure sampler to be always_on. |
| `parent_based` | [`ParentBasedSampler`](#parentbasedsampler) | If omitted, ignore. | Configure sampler to be parent_based. |
| `trace_id_ratio_based` | [`TraceIdRatioBasedSampler`](#traceidratiobasedsampler) | If omitted, ignore. | Configure sampler to be trace_id_ratio_based. |
| `composite/development`<br>**⚠ Experimental** | [`ExperimentalComposableSampler`](#experimentalcomposablesampler) | If omitted, ignore. | Configure sampler to be composite. |
| `jaeger_remote/development`<br>**⚠ Experimental** | [`ExperimentalJaegerRemoteSampler`](#experimentaljaegerremotesampler) | If omitted, ignore. | Configure sampler to be jaeger_remote. |
| `probability/development`<br>**⚠ Experimental** | [`ExperimentalProbabilitySampler`](#experimentalprobabilitysampler) | If omitted, ignore. | Configure sampler to be probability. |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### SeverityNumber {#severitynumber}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `debug` | debug, severity number 5. |
| `debug2` | debug2, severity number 6. |
| `debug3` | debug3, severity number 7. |
| `debug4` | debug4, severity number 8. |
| `error` | error, severity number 17. |
| `error2` | error2, severity number 18. |
| `error3` | error3, severity number 19. |
| `error4` | error4, severity number 20. |
| `fatal` | fatal, severity number 21. |
| `fatal2` | fatal2, severity number 22. |
| `fatal3` | fatal3, severity number 23. |
| `fatal4` | fatal4, severity number 24. |
| `info` | info, severity number 9. |
| `info2` | info2, severity number 10. |
| `info3` | info3, severity number 11. |
| `info4` | info4, severity number 12. |
| `trace` | trace, severity number 1. |
| `trace2` | trace2, severity number 2. |
| `trace3` | trace3, severity number 3. |
| `trace4` | trace4, severity number 4. |
| `warn` | warn, severity number 13. |
| `warn2` | warn2, severity number 14. |
| `warn3` | warn3, severity number 15. |
| `warn4` | warn4, severity number 16. |

</div>

### SimpleLogRecordProcessor {#simplelogrecordprocessor}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `exporter`<sup>*</sup> | [`LogRecordExporter`](#logrecordexporter) | Property is required and must be non-null. | Configure exporter. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["exporter"]`<br>
### SimpleSpanProcessor {#simplespanprocessor}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `exporter`<sup>*</sup> | [`SpanExporter`](#spanexporter) | Property is required and must be non-null. | Configure exporter. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["exporter"]`<br>
### SpanExporter {#spanexporter}

`SpanExporter` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `console` | [`ConsoleExporter`](#consoleexporter) | If omitted, ignore. | Configure exporter to be console. |
| `otlp_grpc` | [`OtlpGrpcExporter`](#otlpgrpcexporter) | If omitted, ignore. | Configure exporter to be OTLP with gRPC transport. |
| `otlp_http` | [`OtlpHttpExporter`](#otlphttpexporter) | If omitted, ignore. | Configure exporter to be OTLP with HTTP transport. |
| `otlp_file/development`<br>**⚠ Experimental** | [`ExperimentalOtlpFileExporter`](#experimentalotlpfileexporter) | If omitted, ignore. | Configure exporter to be OTLP with file transport.<br> |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### SpanKind {#spankind}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `client` | client, a client span. |
| `consumer` | consumer, a consumer span. |
| `internal` | internal, an internal span. |
| `producer` | producer, a producer span. |
| `server` | server, a server span. |

</div>

### SpanLimits {#spanlimits}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `attribute_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max attribute count. Overrides .attribute_limits.attribute_count_limit. <br>Value must be non-negative.<br> |
| `attribute_value_length_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, there is no limit. | `minimum`: `0` | Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit. <br>Value must be non-negative.<br> |
| `event_attribute_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max attributes per span event. <br>Value must be non-negative.<br> |
| `event_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max span event count. <br>Value must be non-negative.<br> |
| `link_attribute_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max attributes per span link. <br>Value must be non-negative.<br> |
| `link_count_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 128 is used. | `minimum`: `0` | Configure max span link count. <br>Value must be non-negative.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### SpanProcessor {#spanprocessor}

`SpanProcessor` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `batch` | [`BatchSpanProcessor`](#batchspanprocessor) | If omitted, ignore. | Configure a batch span processor. |
| `simple` | [`SimpleSpanProcessor`](#simplespanprocessor) | If omitted, ignore. | Configure a simple span processor. |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### SumAggregation {#sumaggregation}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### TextMapPropagator {#textmappropagator}

`TextMapPropagator` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `b3` | [`B3Propagator`](#b3propagator) | If omitted, ignore. | Include the zipkin b3 propagator. |
| `b3multi` | [`B3MultiPropagator`](#b3multipropagator) | If omitted, ignore. | Include the zipkin b3 multi propagator. |
| `baggage` | [`BaggagePropagator`](#baggagepropagator) | If omitted, ignore. | Include the w3c baggage propagator. |
| `jaeger` | [`JaegerPropagator`](#jaegerpropagator) | If omitted, ignore. | Include the jaeger propagator. |
| `ottrace` | [`OpenTracingPropagator`](#opentracingpropagator) | If omitted, ignore. | Include the opentracing propagator. |
| `tracecontext` | [`TraceContextPropagator`](#tracecontextpropagator) | If omitted, ignore. | Include the w3c trace context propagator. |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### TraceContextPropagator {#tracecontextpropagator}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### TraceIdRatioBasedSampler {#traceidratiobasedsampler}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `ratio` | one of:<br>• `number`<br>• `null`<br> | If omitted or null, 1.0 is used. | • `minimum`: `0`<br>• `maximum`: `1`<br> | Configure trace_id_ratio.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### TracerProvider {#tracerprovider}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `limits` | [`SpanLimits`](#spanlimits) | If omitted, default values as described in SpanLimits are used. | None. | Configure span limits. See also attribute_limits. |
| `processors`<sup>*</sup> | `array` of [`SpanProcessor`](#spanprocessor) | Property is required and must be non-null. | `minItems`: `1` | Configure span processors. |
| `sampler` | [`Sampler`](#sampler) | If omitted, parent based sampler with a root of always_on is used. | None. | Configure the sampler.<br> |
| `tracer_configurator/development`<br>**⚠ Experimental** | [`ExperimentalTracerConfigurator`](#experimentaltracerconfigurator) | If omitted, all tracers use default values as described in ExperimentalTracerConfig. | None. | Configure tracers.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["processors"]`<br>
### View {#view}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `selector`<sup>*</sup> | [`ViewSelector`](#viewselector) | Property is required and must be non-null. | Configure view selector. <br>Selection criteria is additive as described in https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#instrument-selection-criteria.<br> |
| `stream`<sup>*</sup> | [`ViewStream`](#viewstream) | Property is required and must be non-null. | Configure view stream. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["selector","stream"]`<br>
### ViewSelector {#viewselector}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `instrument_name` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, all instrument names match. | Configure instrument name selection criteria.<br> |
| `instrument_type` | [`InstrumentType`](#instrumenttype) | If omitted, all instrument types match. | Configure instrument type selection criteria.<br> |
| `meter_name` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, all meter names match. | Configure meter name selection criteria.<br> |
| `meter_schema_url` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, all meter schema URLs match. | Configure meter schema url selection criteria.<br> |
| `meter_version` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, all meter versions match. | Configure meter version selection criteria.<br> |
| `unit` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, all instrument units match. | Configure the instrument unit selection criteria.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ViewStream {#viewstream}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `aggregation` | [`Aggregation`](#aggregation) | If omitted, default is used. | None. | Configure aggregation of the resulting stream(s). <br> |
| `aggregation_cardinality_limit` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, the metric reader's default cardinality limit is used. | `exclusiveMinimum`: `0` | Configure the aggregation cardinality limit.<br> |
| `attribute_keys` | [`IncludeExclude`](#includeexclude) | If omitted, all attribute keys are retained. | None. | Configure attribute keys retained in the resulting stream(s).<br> |
| `description` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, the instrument's origin description is used. | None. | Configure metric description of the resulting stream(s).<br> |
| `name` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, the instrument's original name is used. | None. | Configure metric name of the resulting stream(s).<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
## Experimental Types

> **Warning:** Experimental types are subject to breaking changes.

### ExperimentalComposableAlwaysOffSampler {#experimentalcomposablealwaysoffsampler}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExperimentalComposableAlwaysOnSampler {#experimentalcomposablealwaysonsampler}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExperimentalComposableParentThresholdSampler {#experimentalcomposableparentthresholdsampler}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `root`<sup>*</sup> | [`ExperimentalComposableSampler`](#experimentalcomposablesampler) | Property is required and must be non-null. | Sampler to use when there is no parent. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["root"]`<br>
### ExperimentalComposableProbabilitySampler {#experimentalcomposableprobabilitysampler}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `ratio` | one of:<br>• `number`<br>• `null`<br> | If omitted or null, 1.0 is used. | • `minimum`: `0`<br>• `maximum`: `1`<br> | Configure ratio.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalComposableRuleBasedSampler {#experimentalcomposablerulebasedsampler}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `rules` | one of:<br>• `array`<br>• `null`<br> | If omitted or null, no span is sampled. | The rules for the sampler, matched in order. If no rules match, the span is not sampled.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalComposableRuleBasedSamplerRule {#experimentalcomposablerulebasedsamplerrule}

A rule for ExperimentalComposableRuleBasedSampler. A rule can have multiple match conditions - the sampler will be applied if all match.
If no conditions are specified, the rule matches all spans that reach it.


<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `attribute_patterns` | [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](#experimentalcomposablerulebasedsamplerruleattributepatterns) | If omitted, ignore. | None. | Patterns to match against a single attribute. Non-string attributes are matched using their string representation:<br>for example, a pattern of "4*" would match any http.response.status_code in 400-499. For array attributes, if any<br>item matches, it is considered a match.<br> |
| `attribute_values` | [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](#experimentalcomposablerulebasedsamplerruleattributevalues) | If omitted, ignore. | None. | Values to match against a single attribute. Non-string attributes are matched using their string representation:<br>for example, a value of "404" would match the http.response.status_code 404. For array attributes, if any<br>item matches, it is considered a match.<br> |
| `parent` | `array` of [`ExperimentalSpanParent`](#experimentalspanparent) | If omitted, ignore. | `minItems`: `1` | The parent span types to match. |
| `sampler`<sup>*</sup> | [`ExperimentalComposableSampler`](#experimentalcomposablesampler) | Property is required and must be non-null. | None. | The sampler to use for matching spans. |
| `span_kinds` | `array` of [`SpanKind`](#spankind) | If omitted, ignore. | `minItems`: `1` | The span kinds to match. If the span's kind matches any of these, it matches. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["sampler"]`<br>
### ExperimentalComposableRuleBasedSamplerRuleAttributePatterns {#experimentalcomposablerulebasedsamplerruleattributepatterns}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `excluded` | `array` of `string` | If omitted, .included attributes are included. | `minItems`: `1` | Configure list of value patterns to exclude. Applies after .included (i.e. excluded has higher priority than included).<br>Values are evaluated to match as follows:<br> * If the value exactly matches.<br> * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |
| `included` | `array` of `string` | If omitted, all values are included. | `minItems`: `1` | Configure list of value patterns to include.<br>Values are evaluated to match as follows:<br> * If the value exactly matches.<br> * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |
| `key`<sup>*</sup> | `string` | Property is required and must be non-null. | None. | The attribute key to match against. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["key"]`<br>
### ExperimentalComposableRuleBasedSamplerRuleAttributeValues {#experimentalcomposablerulebasedsamplerruleattributevalues}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `key`<sup>*</sup> | `string` | Property is required and must be non-null. | None. | The attribute key to match against. |
| `values`<sup>*</sup> | `array` of `string` | Property is required and must be non-null. | `minItems`: `1` | The attribute values to match against. If the attribute's value matches any of these, it matches. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["key","values"]`<br>
### ExperimentalComposableSampler {#experimentalcomposablesampler}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `always_off` | [`ExperimentalComposableAlwaysOffSampler`](#experimentalcomposablealwaysoffsampler) | If omitted, ignore. | Configure sampler to be always_off. |
| `always_on` | [`ExperimentalComposableAlwaysOnSampler`](#experimentalcomposablealwaysonsampler) | If omitted, ignore. | Configure sampler to be always_on. |
| `parent_threshold` | [`ExperimentalComposableParentThresholdSampler`](#experimentalcomposableparentthresholdsampler) | If omitted, ignore. | Configure sampler to be parent_threshold.<br> |
| `probability` | [`ExperimentalComposableProbabilitySampler`](#experimentalcomposableprobabilitysampler) | If omitted, ignore. | Configure sampler to be probability. |
| `rule_based` | [`ExperimentalComposableRuleBasedSampler`](#experimentalcomposablerulebasedsampler) | If omitted, ignore. | Configure sampler to be rule_based. |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### ExperimentalContainerResourceDetector {#experimentalcontainerresourcedetector}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExperimentalGeneralInstrumentation {#experimentalgeneralinstrumentation}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `http` | [`ExperimentalHttpInstrumentation`](#experimentalhttpinstrumentation) | If omitted, defaults as described in ExperimentalHttpInstrumentation are used. | Configure instrumentations following the http semantic conventions.<br>See http semantic conventions: https://opentelemetry.io/docs/specs/semconv/http/<br> |
| `peer` | [`ExperimentalPeerInstrumentation`](#experimentalpeerinstrumentation) | If omitted, defaults as described in ExperimentalPeerInstrumentation are used. | Configure instrumentations following the peer semantic conventions.<br>See peer semantic conventions: https://opentelemetry.io/docs/specs/semconv/attributes-registry/peer/<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalHostResourceDetector {#experimentalhostresourcedetector}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExperimentalHttpClientInstrumentation {#experimentalhttpclientinstrumentation}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `request_captured_headers` | `array` of `string` | If omitted, no outbound request headers are captured. | `minItems`: `1` | Configure headers to capture for outbound http requests.<br> |
| `response_captured_headers` | `array` of `string` | If omitted, no inbound response headers are captured. | `minItems`: `1` | Configure headers to capture for inbound http responses.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalHttpInstrumentation {#experimentalhttpinstrumentation}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `client` | [`ExperimentalHttpClientInstrumentation`](#experimentalhttpclientinstrumentation) | If omitted, defaults as described in ExperimentalHttpClientInstrumentation are used. | Configure instrumentations following the http client semantic conventions. |
| `server` | [`ExperimentalHttpServerInstrumentation`](#experimentalhttpserverinstrumentation) | If omitted, defaults as described in ExperimentalHttpServerInstrumentation are used. | Configure instrumentations following the http server semantic conventions. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalHttpServerInstrumentation {#experimentalhttpserverinstrumentation}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `request_captured_headers` | `array` of `string` | If omitted, no request headers are captured. | `minItems`: `1` | Configure headers to capture for inbound http requests.<br> |
| `response_captured_headers` | `array` of `string` | If omitted, no response headers are captures. | `minItems`: `1` | Configure headers to capture for outbound http responses.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalInstrumentation {#experimentalinstrumentation}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `cpp` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure C++ language-specific instrumentation libraries. |
| `dotnet` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure .NET language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `erlang` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Erlang language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `general` | [`ExperimentalGeneralInstrumentation`](#experimentalgeneralinstrumentation) | If omitted, default values as described in ExperimentalGeneralInstrumentation are used. | Configure general SemConv options that may apply to multiple languages and instrumentations.<br>Instrumenation may merge general config options with the language specific configuration at .instrumentation.<language>.<br> |
| `go` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Go language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `java` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Java language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `js` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure JavaScript language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `php` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure PHP language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `python` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Python language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `ruby` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Ruby language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `rust` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Rust language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |
| `swift` | [`ExperimentalLanguageSpecificInstrumentation`](#experimentallanguagespecificinstrumentation) | If omitted, instrumentation defaults are used. | Configure Swift language-specific instrumentation libraries.<br>Each entry's key identifies a particular instrumentation library. The corresponding value configures it.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalJaegerRemoteSampler {#experimentaljaegerremotesampler}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `endpoint`<sup>*</sup> | `string` | Property is required and must be non-null. | None. | Configure the endpoint of the jaeger remote sampling service. |
| `initial_sampler`<sup>*</sup> | [`Sampler`](#sampler) | Property is required and must be non-null. | None. | Configure the initial sampler used before first configuration is fetched. |
| `interval` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 60000 is used. | `minimum`: `0` | Configure the polling interval (in milliseconds) to fetch from the remote sampling service. |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["endpoint","initial_sampler"]`<br>
### ExperimentalLanguageSpecificInstrumentation {#experimentallanguagespecificinstrumentation}

**No properties.**

**Constraints:**

`additionalProperties`: `{"type":"object"}`
### ExperimentalLoggerConfig {#experimentalloggerconfig}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `disabled` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, false is used. | Configure if the logger is enabled or not.<br> |
| `minimum_severity` | [`SeverityNumber`](#severitynumber) | If omitted, severity filtering is not applied. | Configure severity filtering.<br>Log records with an non-zero (i.e. unspecified) severity number which is less than minimum_severity are not processed.<br> |
| `trace_based` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, trace based filtering is not applied. | Configure trace based filtering.<br>If true, log records associated with unsampled trace contexts traces are not processed. If false, or if a log record is not associated with a trace context, trace based filtering is not applied.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalLoggerConfigurator {#experimentalloggerconfigurator}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `default_config` | [`ExperimentalLoggerConfig`](#experimentalloggerconfig) | If omitted, unmatched .loggers use default values as described in ExperimentalLoggerConfig. | None. | Configure the default logger config used there is no matching entry in .logger_configurator/development.loggers. |
| `loggers` | `array` of [`ExperimentalLoggerMatcherAndConfig`](#experimentalloggermatcherandconfig) | If omitted, all loggers use .default_config. | `minItems`: `1` | Configure loggers. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalLoggerMatcherAndConfig {#experimentalloggermatcherandconfig}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `config`<sup>*</sup> | [`ExperimentalLoggerConfig`](#experimentalloggerconfig) | Property is required and must be non-null. | The logger config. |
| `name`<sup>*</sup> | `string` | Property is required and must be non-null. | Configure logger names to match, evaluated as follows:<br><br> * If the logger name exactly matches.<br> * If the logger name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["name","config"]`<br>
### ExperimentalMeterConfig {#experimentalmeterconfig}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `disabled` | `boolean` | If omitted, false is used. | Configure if the meter is enabled or not. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalMeterConfigurator {#experimentalmeterconfigurator}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `default_config` | [`ExperimentalMeterConfig`](#experimentalmeterconfig) | If omitted, unmatched .meters use default values as described in ExperimentalMeterConfig. | None. | Configure the default meter config used there is no matching entry in .meter_configurator/development.meters. |
| `meters` | `array` of [`ExperimentalMeterMatcherAndConfig`](#experimentalmetermatcherandconfig) | If omitted, all meters used .default_config. | `minItems`: `1` | Configure meters. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalMeterMatcherAndConfig {#experimentalmetermatcherandconfig}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `config`<sup>*</sup> | [`ExperimentalMeterConfig`](#experimentalmeterconfig) | Property is required and must be non-null. | The meter config. |
| `name`<sup>*</sup> | `string` | Property is required and must be non-null. | Configure meter names to match, evaluated as follows:<br><br> * If the meter name exactly matches.<br> * If the meter name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["name","config"]`<br>
### ExperimentalOtlpFileExporter {#experimentalotlpfileexporter}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `output_stream` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, stdout is used. | Configure output stream. <br>Values include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalOtlpFileMetricExporter {#experimentalotlpfilemetricexporter}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `default_histogram_aggregation` | [`ExporterDefaultHistogramAggregation`](#exporterdefaulthistogramaggregation) | If omitted, explicit_bucket_histogram is used. | Configure default histogram aggregation.<br> |
| `output_stream` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, stdout is used. | Configure output stream. <br>Values include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.<br> |
| `temporality_preference` | [`ExporterTemporalityPreference`](#exportertemporalitypreference) | If omitted, cumulative is used. | Configure temporality preference.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalPeerInstrumentation {#experimentalpeerinstrumentation}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `service_mapping` | `array` of [`ExperimentalPeerServiceMapping`](#experimentalpeerservicemapping) | If omitted, no peer service mappings are used. | `minItems`: `1` | Configure the service mapping for instrumentations following peer.service semantic conventions.<br>See peer.service semantic conventions: https://opentelemetry.io/docs/specs/semconv/general/attributes/#general-remote-service-attributes<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalPeerServiceMapping {#experimentalpeerservicemapping}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `peer`<sup>*</sup> | `string` | Property is required and must be non-null. | The IP address to map.<br> |
| `service`<sup>*</sup> | `string` | Property is required and must be non-null. | The logical name corresponding to the IP address of .peer.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["peer","service"]`<br>
### ExperimentalProbabilitySampler {#experimentalprobabilitysampler}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `ratio` | one of:<br>• `number`<br>• `null`<br> | If omitted or null, 1.0 is used. | • `minimum`: `0`<br>• `maximum`: `1`<br> | Configure ratio.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalProcessResourceDetector {#experimentalprocessresourcedetector}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExperimentalPrometheusMetricExporter {#experimentalprometheusmetricexporter}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `host` | one of:<br>• `string`<br>• `null`<br> | If omitted or null, localhost is used. | Configure host.<br> |
| `port` | one of:<br>• `integer`<br>• `null`<br> | If omitted or null, 9464 is used. | Configure port.<br> |
| `translation_strategy` | [`ExperimentalPrometheusTranslationStrategy`](#experimentalprometheustranslationstrategy) | If omitted, underscore_escaping_with_suffixes is used. | Configure how metric names are translated to Prometheus metric names. |
| `with_resource_constant_labels` | [`IncludeExclude`](#includeexclude) | If omitted, no resource attributes are added. | Configure Prometheus Exporter to add resource attributes as metrics attributes, where the resource attribute keys match the patterns. |
| `without_scope_info` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, false is used. | Configure Prometheus Exporter to produce metrics without a scope info metric.<br> |
| `without_target_info` | one of:<br>• `boolean`<br>• `null`<br> | If omitted or null, false is used. | Configure Prometheus Exporter to produce metrics without a target info metric for the resource.<br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalPrometheusTranslationStrategy {#experimentalprometheustranslationstrategy}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `no_translation` | Special character escaping is disabled. Type and unit suffixes are disabled. Metric names are unaltered. |
| `no_utf8_escaping_with_suffixes` | Special character escaping is disabled. Type and unit suffixes are enabled. |
| `underscore_escaping_with_suffixes` | Special character escaping is enabled. Type and unit suffixes are enabled. |
| `underscore_escaping_without_suffixes` | Special character escaping is enabled. Type and unit suffixes are disabled. This represents classic Prometheus metric name compatibility. |

</div>

### ExperimentalResourceDetection {#experimentalresourcedetection}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `attributes` | [`IncludeExclude`](#includeexclude) | If omitted, all attributes from resource detectors are added. | None. | Configure attributes provided by resource detectors. |
| `detectors` | `array` of [`ExperimentalResourceDetector`](#experimentalresourcedetector) | If omitted, no resource detectors are enabled. | `minItems`: `1` | Configure resource detectors.<br>Resource detector names are dependent on the SDK language ecosystem. Please consult documentation for each respective language. <br> |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalResourceDetector {#experimentalresourcedetector}

`ExperimentalResourceDetector` is an SDK extension plugin point.

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `container` | [`ExperimentalContainerResourceDetector`](#experimentalcontainerresourcedetector) | If omitted, ignore. | Enable the container resource detector, which populates container.* attributes.<br> |
| `host` | [`ExperimentalHostResourceDetector`](#experimentalhostresourcedetector) | If omitted, ignore. | Enable the host resource detector, which populates host.* and os.* attributes.<br> |
| `process` | [`ExperimentalProcessResourceDetector`](#experimentalprocessresourcedetector) | If omitted, ignore. | Enable the process resource detector, which populates process.* attributes.<br> |
| `service` | [`ExperimentalServiceResourceDetector`](#experimentalserviceresourcedetector) | If omitted, ignore. | Enable the service detector, which populates service.name based on the OTEL_SERVICE_NAME environment variable and service.instance.id.<br> |

</div>

**Constraints:**

• `additionalProperties`: `{"type":["object","null"]}`<br>• `minProperties`: `1`<br>• `maxProperties`: `1`<br>
### ExperimentalServiceResourceDetector {#experimentalserviceresourcedetector}

**No properties.**

**Constraints:**

`additionalProperties`: `false`
### ExperimentalSpanParent {#experimentalspanparent}

**This is an enum type.**

<div class="types-table">

| Value | Description |
|---|---|
| `local` | local, a local parent. |
| `none` | none, no parent, i.e., the trace root. |
| `remote` | remote, a remote parent. |

</div>

### ExperimentalTracerConfig {#experimentaltracerconfig}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `disabled` | `boolean` | If omitted, false is used. | Configure if the tracer is enabled or not. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalTracerConfigurator {#experimentaltracerconfigurator}

<div class="types-table">

| Property | Type | Default Behavior | Constraints | Description |
|---|---|---|---|---|
| `default_config` | [`ExperimentalTracerConfig`](#experimentaltracerconfig) | If omitted, unmatched .tracers use default values as described in ExperimentalTracerConfig. | None. | Configure the default tracer config used there is no matching entry in .tracer_configurator/development.tracers. |
| `tracers` | `array` of [`ExperimentalTracerMatcherAndConfig`](#experimentaltracermatcherandconfig) | If omitted, all tracers use .default_config. | `minItems`: `1` | Configure tracers. |

</div>

**Constraints:**

`additionalProperties`: `false`
### ExperimentalTracerMatcherAndConfig {#experimentaltracermatcherandconfig}

<div class="types-table">

| Property | Type | Default Behavior | Description |
|---|---|---|---|
| `config`<sup>*</sup> | [`ExperimentalTracerConfig`](#experimentaltracerconfig) | Property is required and must be non-null. | The tracer config. |
| `name`<sup>*</sup> | `string` | Property is required and must be non-null. | Configure tracer names to match, evaluated as follows:<br><br> * If the tracer name exactly matches.<br> * If the tracer name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.<br> |

</div>

**Constraints:**

• `additionalProperties`: `false`<br>• `required`: `["name","config"]`<br>
<!-- END GENERATED: types SOURCE: opentelemetry-configuration -->
