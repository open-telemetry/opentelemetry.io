---
title: Language Status
linkTitle: Language Status
weight: 10
aliases: [declarative-config-language-status]
description:
  Language implementation status for OpenTelemetry SDK declarative configuration
  types
notoc: true
---

**← [Back to Configuration Types](/docs/specs/declarative-configuration/)** |
[Schema Repository](https://github.com/open-telemetry/opentelemetry-configuration)

## Overview

This page shows the implementation status of
[declarative configuration](/docs/specs/declarative-configuration/) types across
OpenTelemetry language SDKs. Each type is listed with its support status in each
language, including property-level implementation details.

**Related Resources:**

- [Configuration Types](../) - Complete reference for all configuration types
- [Configuration Schema Repository](https://github.com/open-telemetry/opentelemetry-configuration) -
  Official schema repository

<!-- BEGIN GENERATED: language-implementation-status SOURCE: opentelemetry-configuration -->

{{< config-lang-status-accordion >}}

<div class="language-implementation-status-content visually-hidden">

## cpp {#cpp}
Latest supported file format: `1.0.0`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../#aggregation) | supported |  | * `base2_exponential_bucket_histogram`: supported<br>* `default`: supported<br>* `drop`: supported<br>* `explicit_bucket_histogram`: supported<br>* `last_value`: supported<br>* `sum`: supported<br> |
| [`AlwaysOffSampler`](../#alwaysoffsampler) | supported |  |  |
| [`AlwaysOnSampler`](../#alwaysonsampler) | supported |  |  |
| [`AttributeLimits`](../#attributelimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`AttributeNameValue`](../#attributenamevalue) | supported |  | * `name`: supported<br>* `type`: supported<br>* `value`: supported<br> |
| [`AttributeType`](../#attributetype) | supported |  | * `bool`: supported<br>* `bool_array`: supported<br>* `double`: supported<br>* `double_array`: supported<br>* `int`: supported<br>* `int_array`: supported<br>* `string`: supported<br>* `string_array`: supported<br> |
| [`B3MultiPropagator`](../#b3multipropagator) | supported |  |  |
| [`B3Propagator`](../#b3propagator) | supported |  |  |
| [`BaggagePropagator`](../#baggagepropagator) | supported |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../#base2exponentialbuckethistogramaggregation) | supported |  | * `max_scale`: supported<br>* `max_size`: supported<br>* `record_min_max`: supported<br> |
| [`BatchLogRecordProcessor`](../#batchlogrecordprocessor) | supported |  | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`BatchSpanProcessor`](../#batchspanprocessor) | supported |  | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`CardinalityLimits`](../#cardinalitylimits) | ignored |  | * `counter`: ignored<br>* `default`: ignored<br>* `gauge`: ignored<br>* `histogram`: ignored<br>* `observable_counter`: ignored<br>* `observable_gauge`: ignored<br>* `observable_up_down_counter`: ignored<br>* `up_down_counter`: ignored<br> |
| [`ConsoleExporter`](../#consoleexporter) | supported |  |  |
| [`ConsoleMetricExporter`](../#consolemetricexporter) | supported |  | * `default_histogram_aggregation`: supported<br>* `temporality_preference`: supported<br> |
| [`DefaultAggregation`](../#defaultaggregation) | supported |  |  |
| [`Distribution`](../#distribution) | supported |  |  |
| [`DropAggregation`](../#dropaggregation) | supported |  |  |
| [`ExemplarFilter`](../#exemplarfilter) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `trace_based`: supported<br> |
| [`ExplicitBucketHistogramAggregation`](../#explicitbuckethistogramaggregation) | supported |  | * `boundaries`: supported<br>* `record_min_max`: supported<br> |
| [`ExporterDefaultHistogramAggregation`](../#exporterdefaulthistogramaggregation) | supported |  | * `base2_exponential_bucket_histogram`: supported<br>* `explicit_bucket_histogram`: supported<br> |
| [`ExporterTemporalityPreference`](../#exportertemporalitypreference) | supported |  | * `cumulative`: supported<br>* `delta`: supported<br>* `low_memory`: supported<br> |
| [`GrpcTls`](../#grpctls) | supported |  | * `ca_file`: supported<br>* `cert_file`: supported<br>* `insecure`: supported<br>* `key_file`: supported<br> |
| [`HttpTls`](../#httptls) | supported |  | * `ca_file`: supported<br>* `cert_file`: supported<br>* `key_file`: supported<br> |
| [`IncludeExclude`](../#includeexclude) | supported |  | * `excluded`: supported<br>* `included`: supported<br> |
| [`InstrumentType`](../#instrumenttype) | supported |  | * `counter`: supported<br>* `gauge`: supported<br>* `histogram`: supported<br>* `observable_counter`: supported<br>* `observable_gauge`: supported<br>* `observable_up_down_counter`: supported<br>* `up_down_counter`: supported<br> |
| [`LastValueAggregation`](../#lastvalueaggregation) | supported |  |  |
| [`LoggerProvider`](../#loggerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `logger_configurator/development`: supported<br> |
| [`LogRecordExporter`](../#logrecordexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`LogRecordLimits`](../#logrecordlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`LogRecordProcessor`](../#logrecordprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`MeterProvider`](../#meterprovider) | supported |  | * `exemplar_filter`: supported<br>* `readers`: supported<br>* `views`: supported<br>* `meter_configurator/development`: supported<br> |
| [`MetricProducer`](../#metricproducer) | supported |  | * `opencensus`: supported<br> |
| [`MetricReader`](../#metricreader) | supported |  | * `periodic`: supported<br>* `pull`: supported<br> |
| [`NameStringValuePair`](../#namestringvaluepair) | supported |  | * `name`: supported<br>* `value`: supported<br> |
| [`OpenCensusMetricProducer`](../#opencensusmetricproducer) | supported |  |  |
| [`OpenTelemetryConfiguration`](../#opentelemetryconfiguration) | supported |  | * `attribute_limits`: supported<br>* `disabled`: supported<br>* `distribution`: supported<br>* `file_format`: supported<br>* `log_level`: supported<br>* `logger_provider`: supported<br>* `meter_provider`: supported<br>* `propagator`: supported<br>* `resource`: supported<br>* `tracer_provider`: supported<br>* `instrumentation/development`: supported<br> |
| [`OtlpGrpcExporter`](../#otlpgrpcexporter) | supported |  | * `compression`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpGrpcMetricExporter`](../#otlpgrpcmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpHttpEncoding`](../#otlphttpencoding) | supported |  | * `json`: supported<br>* `protobuf`: supported<br> |
| [`OtlpHttpExporter`](../#otlphttpexporter) | supported |  | * `compression`: supported<br>* `encoding`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpHttpMetricExporter`](../#otlphttpmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: supported<br>* `encoding`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`ParentBasedSampler`](../#parentbasedsampler) | supported |  | * `local_parent_not_sampled`: supported<br>* `local_parent_sampled`: supported<br>* `remote_parent_not_sampled`: supported<br>* `remote_parent_sampled`: supported<br>* `root`: supported<br> |
| [`PeriodicMetricReader`](../#periodicmetricreader) | supported |  | * `cardinality_limits`: supported<br>* `exporter`: supported<br>* `interval`: supported<br>* `producers`: supported<br>* `timeout`: supported<br> |
| [`Propagator`](../#propagator) | supported |  | * `composite`: supported<br>* `composite_list`: supported<br> |
| [`PullMetricExporter`](../#pullmetricexporter) | supported |  | * `prometheus/development`: supported<br> |
| [`PullMetricReader`](../#pullmetricreader) | supported |  | * `cardinality_limits`: supported<br>* `exporter`: supported<br>* `producers`: supported<br> |
| [`PushMetricExporter`](../#pushmetricexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`Resource`](../#resource) | supported |  | * `attributes`: supported<br>* `attributes_list`: supported<br>* `schema_url`: supported<br>* `detection/development`: supported<br> |
| [`Sampler`](../#sampler) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `parent_based`: supported<br>* `trace_id_ratio_based`: supported<br>* `composite/development`: supported<br>* `jaeger_remote/development`: supported<br>* `probability/development`: supported<br> |
| [`SeverityNumber`](../#severitynumber) | supported |  | * `debug`: supported<br>* `debug2`: supported<br>* `debug3`: supported<br>* `debug4`: supported<br>* `error`: supported<br>* `error2`: supported<br>* `error3`: supported<br>* `error4`: supported<br>* `fatal`: supported<br>* `fatal2`: supported<br>* `fatal3`: supported<br>* `fatal4`: supported<br>* `info`: supported<br>* `info2`: supported<br>* `info3`: supported<br>* `info4`: supported<br>* `trace`: supported<br>* `trace2`: supported<br>* `trace3`: supported<br>* `trace4`: supported<br>* `warn`: supported<br>* `warn2`: supported<br>* `warn3`: supported<br>* `warn4`: supported<br> |
| [`SimpleLogRecordProcessor`](../#simplelogrecordprocessor) | supported |  | * `exporter`: supported<br> |
| [`SimpleSpanProcessor`](../#simplespanprocessor) | supported |  | * `exporter`: supported<br> |
| [`SpanExporter`](../#spanexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`SpanKind`](../#spankind) | not_implemented |  | * `client`: not_implemented<br>* `consumer`: not_implemented<br>* `internal`: not_implemented<br>* `producer`: not_implemented<br>* `server`: not_implemented<br> |
| [`SpanLimits`](../#spanlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br>* `event_attribute_count_limit`: supported<br>* `event_count_limit`: supported<br>* `link_attribute_count_limit`: supported<br>* `link_count_limit`: supported<br> |
| [`SpanProcessor`](../#spanprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`SumAggregation`](../#sumaggregation) | supported |  |  |
| [`TextMapPropagator`](../#textmappropagator) | supported |  | * `b3`: supported<br>* `b3multi`: supported<br>* `baggage`: supported<br>* `tracecontext`: supported<br> |
| [`TraceContextPropagator`](../#tracecontextpropagator) | supported |  |  |
| [`TraceIdRatioBasedSampler`](../#traceidratiobasedsampler) | supported |  | * `ratio`: supported<br> |
| [`TracerProvider`](../#tracerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `sampler`: supported<br>* `tracer_configurator/development`: supported<br> |
| [`View`](../#view) | supported |  | * `selector`: supported<br>* `stream`: supported<br> |
| [`ViewSelector`](../#viewselector) | supported |  | * `instrument_name`: supported<br>* `instrument_type`: supported<br>* `meter_name`: supported<br>* `meter_schema_url`: supported<br>* `meter_version`: supported<br>* `unit`: supported<br> |
| [`ViewStream`](../#viewstream) | supported |  | * `aggregation`: supported<br>* `aggregation_cardinality_limit`: supported<br>* `attribute_keys`: supported<br>* `description`: supported<br>* `name`: supported<br> |
| [`ExperimentalCodeInstrumentation`](../#experimentalcodeinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../#experimentalcomposablealwaysoffsampler) | not_implemented |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../#experimentalcomposablealwaysonsampler) | not_implemented |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../#experimentalcomposableparentthresholdsampler) | not_implemented |  | * `root`: not_implemented<br> |
| [`ExperimentalComposableProbabilitySampler`](../#experimentalcomposableprobabilitysampler) | not_implemented |  | * `ratio`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSampler`](../#experimentalcomposablerulebasedsampler) | not_implemented |  | * `rules`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../#experimentalcomposablerulebasedsamplerrule) | not_implemented |  | * `attribute_patterns`: not_implemented<br>* `attribute_values`: not_implemented<br>* `parent`: not_implemented<br>* `sampler`: not_implemented<br>* `span_kinds`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../#experimentalcomposablerulebasedsamplerruleattributepatterns) | not_implemented |  | * `excluded`: not_implemented<br>* `included`: not_implemented<br>* `key`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../#experimentalcomposablerulebasedsamplerruleattributevalues) | not_implemented |  | * `key`: not_implemented<br>* `values`: not_implemented<br> |
| [`ExperimentalComposableSampler`](../#experimentalcomposablesampler) | not_implemented |  | * `always_off`: not_implemented<br>* `always_on`: not_implemented<br>* `parent_threshold`: not_implemented<br>* `probability`: not_implemented<br>* `rule_based`: not_implemented<br> |
| [`ExperimentalContainerResourceDetector`](../#experimentalcontainerresourcedetector) | not_implemented |  |  |
| [`ExperimentalDbInstrumentation`](../#experimentaldbinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGenAiInstrumentation`](../#experimentalgenaiinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGeneralInstrumentation`](../#experimentalgeneralinstrumentation) | not_applicable |  | * `code`: not_applicable<br>* `db`: not_applicable<br>* `gen_ai`: not_applicable<br>* `http`: not_applicable<br>* `messaging`: not_applicable<br>* `rpc`: not_applicable<br>* `sanitization`: not_applicable<br>* `stability_opt_in_list`: not_applicable<br> |
| [`ExperimentalHostResourceDetector`](../#experimentalhostresourcedetector) | not_implemented |  |  |
| [`ExperimentalHttpClientInstrumentation`](../#experimentalhttpclientinstrumentation) | not_applicable |  | * `known_methods`: not_applicable<br>* `request_captured_headers`: not_applicable<br>* `response_captured_headers`: not_applicable<br> |
| [`ExperimentalHttpInstrumentation`](../#experimentalhttpinstrumentation) | not_applicable |  | * `client`: not_applicable<br>* `semconv`: not_applicable<br>* `server`: not_applicable<br> |
| [`ExperimentalHttpServerInstrumentation`](../#experimentalhttpserverinstrumentation) | not_applicable |  | * `known_methods`: not_applicable<br>* `request_captured_headers`: not_applicable<br>* `response_captured_headers`: not_applicable<br> |
| [`ExperimentalInstrumentation`](../#experimentalinstrumentation) | not_applicable |  | * `cpp`: not_applicable<br>* `dotnet`: not_applicable<br>* `erlang`: not_applicable<br>* `general`: not_applicable<br>* `go`: not_applicable<br>* `java`: not_applicable<br>* `js`: not_applicable<br>* `php`: not_applicable<br>* `python`: not_applicable<br>* `ruby`: not_applicable<br>* `rust`: not_applicable<br>* `swift`: not_applicable<br> |
| [`ExperimentalJaegerRemoteSampler`](../#experimentaljaegerremotesampler) | not_implemented |  | * `endpoint`: not_implemented<br>* `initial_sampler`: not_implemented<br>* `interval`: not_implemented<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../#experimentallanguagespecificinstrumentation) | not_applicable |  |  |
| [`ExperimentalLoggerConfig`](../#experimentalloggerconfig) | not_implemented |  | * `enabled`: not_implemented<br>* `minimum_severity`: not_implemented<br>* `trace_based`: not_implemented<br> |
| [`ExperimentalLoggerConfigurator`](../#experimentalloggerconfigurator) | supported |  | * `default_config`: supported<br>* `loggers`: supported<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../#experimentalloggermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalMessagingInstrumentation`](../#experimentalmessaginginstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalMeterConfig`](../#experimentalmeterconfig) | supported |  | * `enabled`: supported<br> |
| [`ExperimentalMeterConfigurator`](../#experimentalmeterconfigurator) | supported |  | * `default_config`: supported<br>* `meters`: supported<br> |
| [`ExperimentalMeterMatcherAndConfig`](../#experimentalmetermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalOtlpFileExporter`](../#experimentalotlpfileexporter) | supported |  | * `output_stream`: supported<br> |
| [`ExperimentalOtlpFileMetricExporter`](../#experimentalotlpfilemetricexporter) | supported |  | * `default_histogram_aggregation`: supported<br>* `output_stream`: supported<br>* `temporality_preference`: supported<br> |
| [`ExperimentalProbabilitySampler`](../#experimentalprobabilitysampler) | not_implemented |  | * `ratio`: not_implemented<br> |
| [`ExperimentalProcessResourceDetector`](../#experimentalprocessresourcedetector) | not_implemented |  |  |
| [`ExperimentalPrometheusMetricExporter`](../#experimentalprometheusmetricexporter) | supported |  | * `host`: supported<br>* `port`: supported<br>* `translation_strategy`: supported<br>* `with_resource_constant_labels`: supported<br>* `without_scope_info`: supported<br>* `without_target_info/development`: supported<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../#experimentalprometheustranslationstrategy) | supported |  | * `no_translation/development`: not_implemented<br>* `no_utf8_escaping_with_suffixes/development`: not_implemented<br>* `underscore_escaping_with_suffixes`: supported<br>* `underscore_escaping_without_suffixes/development`: supported<br> |
| [`ExperimentalResourceDetection`](../#experimentalresourcedetection) | not_implemented |  | * `attributes`: not_implemented<br>* `detectors`: not_implemented<br> |
| [`ExperimentalResourceDetector`](../#experimentalresourcedetector) | not_implemented |  | * `container`: not_implemented<br>* `host`: not_implemented<br>* `process`: not_implemented<br>* `service`: not_implemented<br> |
| [`ExperimentalRpcInstrumentation`](../#experimentalrpcinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalSanitization`](../#experimentalsanitization) | unknown |  | * `url`: unknown<br> |
| [`ExperimentalSemconvConfig`](../#experimentalsemconvconfig) | unknown |  | * `dual_emit`: unknown<br>* `experimental`: unknown<br>* `version`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../#experimentalserviceresourcedetector) | not_implemented |  |  |
| [`ExperimentalSpanParent`](../#experimentalspanparent) | not_implemented |  | * `local`: not_implemented<br>* `none`: not_implemented<br>* `remote`: not_implemented<br> |
| [`ExperimentalTracerConfig`](../#experimentaltracerconfig) | supported |  | * `enabled`: supported<br> |
| [`ExperimentalTracerConfigurator`](../#experimentaltracerconfigurator) | supported |  | * `default_config`: supported<br>* `tracers`: supported<br> |
| [`ExperimentalTracerMatcherAndConfig`](../#experimentaltracermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalUrlSanitization`](../#experimentalurlsanitization) | unknown |  | * `sensitive_query_parameters`: unknown<br> |


## go {#go}
Latest supported file format: `1.0.0`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../#aggregation) | unknown |  | * `base2_exponential_bucket_histogram`: unknown<br>* `default`: unknown<br>* `drop`: unknown<br>* `explicit_bucket_histogram`: unknown<br>* `last_value`: unknown<br>* `sum`: unknown<br> |
| [`AlwaysOffSampler`](../#alwaysoffsampler) | supported |  |  |
| [`AlwaysOnSampler`](../#alwaysonsampler) | supported |  |  |
| [`AttributeLimits`](../#attributelimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`AttributeNameValue`](../#attributenamevalue) | supported |  | * `name`: supported<br>* `type`: supported<br>* `value`: supported<br> |
| [`AttributeType`](../#attributetype) | supported |  | * `bool`: supported<br>* `bool_array`: supported<br>* `double`: supported<br>* `double_array`: supported<br>* `int`: supported<br>* `int_array`: supported<br>* `string`: supported<br>* `string_array`: supported<br> |
| [`B3MultiPropagator`](../#b3multipropagator) | supported |  |  |
| [`B3Propagator`](../#b3propagator) | supported |  |  |
| [`BaggagePropagator`](../#baggagepropagator) | supported |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../#base2exponentialbuckethistogramaggregation) | unknown |  | * `max_scale`: unknown<br>* `max_size`: unknown<br>* `record_min_max`: unknown<br> |
| [`BatchLogRecordProcessor`](../#batchlogrecordprocessor) | supported |  | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`BatchSpanProcessor`](../#batchspanprocessor) | supported |  | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`CardinalityLimits`](../#cardinalitylimits) | unknown |  | * `counter`: unknown<br>* `default`: unknown<br>* `gauge`: unknown<br>* `histogram`: unknown<br>* `observable_counter`: unknown<br>* `observable_gauge`: unknown<br>* `observable_up_down_counter`: unknown<br>* `up_down_counter`: unknown<br> |
| [`ConsoleExporter`](../#consoleexporter) | supported |  |  |
| [`ConsoleMetricExporter`](../#consolemetricexporter) | supported |  | * `default_histogram_aggregation`: not_implemented<br>* `temporality_preference`: not_implemented<br> |
| [`DefaultAggregation`](../#defaultaggregation) | unknown |  |  |
| [`Distribution`](../#distribution) | unknown |  |  |
| [`DropAggregation`](../#dropaggregation) | unknown |  |  |
| [`ExemplarFilter`](../#exemplarfilter) | unknown |  | * `always_off`: unknown<br>* `always_on`: unknown<br>* `trace_based`: unknown<br> |
| [`ExplicitBucketHistogramAggregation`](../#explicitbuckethistogramaggregation) | unknown |  | * `boundaries`: unknown<br>* `record_min_max`: unknown<br> |
| [`ExporterDefaultHistogramAggregation`](../#exporterdefaulthistogramaggregation) | unknown |  | * `base2_exponential_bucket_histogram`: unknown<br>* `explicit_bucket_histogram`: unknown<br> |
| [`ExporterTemporalityPreference`](../#exportertemporalitypreference) | supported |  | * `cumulative`: supported<br>* `delta`: supported<br>* `low_memory`: supported<br> |
| [`GrpcTls`](../#grpctls) | supported |  | * `ca_file`: supported<br>* `cert_file`: supported<br>* `insecure`: supported<br>* `key_file`: supported<br> |
| [`HttpTls`](../#httptls) | supported |  | * `ca_file`: supported<br>* `cert_file`: supported<br>* `key_file`: supported<br> |
| [`IncludeExclude`](../#includeexclude) | supported |  | * `excluded`: supported<br>* `included`: supported<br> |
| [`InstrumentType`](../#instrumenttype) | supported |  | * `counter`: supported<br>* `gauge`: supported<br>* `histogram`: supported<br>* `observable_counter`: supported<br>* `observable_gauge`: supported<br>* `observable_up_down_counter`: supported<br>* `up_down_counter`: supported<br> |
| [`LastValueAggregation`](../#lastvalueaggregation) | supported |  |  |
| [`LoggerProvider`](../#loggerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `logger_configurator/development`: not_implemented<br> |
| [`LogRecordExporter`](../#logrecordexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: not_implemented<br> |
| [`LogRecordLimits`](../#logrecordlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`LogRecordProcessor`](../#logrecordprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`MeterProvider`](../#meterprovider) | supported |  | * `exemplar_filter`: supported<br>* `readers`: supported<br>* `views`: supported<br>* `meter_configurator/development`: supported<br> |
| [`MetricProducer`](../#metricproducer) | unknown |  | * `opencensus`: unknown<br> |
| [`MetricReader`](../#metricreader) | unknown |  | * `periodic`: unknown<br>* `pull`: unknown<br> |
| [`NameStringValuePair`](../#namestringvaluepair) | supported |  | * `name`: supported<br>* `value`: supported<br> |
| [`OpenCensusMetricProducer`](../#opencensusmetricproducer) | unknown |  |  |
| [`OpenTelemetryConfiguration`](../#opentelemetryconfiguration) | unknown |  | * `attribute_limits`: unknown<br>* `disabled`: unknown<br>* `distribution`: unknown<br>* `file_format`: unknown<br>* `log_level`: unknown<br>* `logger_provider`: unknown<br>* `meter_provider`: unknown<br>* `propagator`: unknown<br>* `resource`: unknown<br>* `tracer_provider`: unknown<br>* `instrumentation/development`: unknown<br> |
| [`OtlpGrpcExporter`](../#otlpgrpcexporter) | supported |  | * `compression`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpGrpcMetricExporter`](../#otlpgrpcmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: not_implemented<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpHttpEncoding`](../#otlphttpencoding) | not_implemented |  | * `json`: not_implemented<br>* `protobuf`: not_implemented<br> |
| [`OtlpHttpExporter`](../#otlphttpexporter) | supported |  | * `compression`: supported<br>* `encoding`: not_implemented<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpHttpMetricExporter`](../#otlphttpmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: not_implemented<br>* `encoding`: not_implemented<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`ParentBasedSampler`](../#parentbasedsampler) | supported |  | * `local_parent_not_sampled`: supported<br>* `local_parent_sampled`: supported<br>* `remote_parent_not_sampled`: supported<br>* `remote_parent_sampled`: supported<br>* `root`: supported<br> |
| [`PeriodicMetricReader`](../#periodicmetricreader) | supported |  | * `cardinality_limits`: not_implemented<br>* `exporter`: supported<br>* `interval`: supported<br>* `producers`: not_implemented<br>* `timeout`: supported<br> |
| [`Propagator`](../#propagator) | supported |  | * `composite`: supported<br>* `composite_list`: supported<br> |
| [`PullMetricExporter`](../#pullmetricexporter) | unknown |  | * `prometheus/development`: unknown<br> |
| [`PullMetricReader`](../#pullmetricreader) | unknown |  | * `cardinality_limits`: unknown<br>* `exporter`: unknown<br>* `producers`: unknown<br> |
| [`PushMetricExporter`](../#pushmetricexporter) | unknown |  | * `console`: unknown<br>* `otlp_grpc`: unknown<br>* `otlp_http`: unknown<br>* `otlp_file/development`: unknown<br> |
| [`Resource`](../#resource) | unknown |  | * `attributes`: unknown<br>* `attributes_list`: unknown<br>* `schema_url`: unknown<br>* `detection/development`: unknown<br> |
| [`Sampler`](../#sampler) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `parent_based`: supported<br>* `trace_id_ratio_based`: supported<br>* `composite/development`: not_implemented<br>* `jaeger_remote/development`: not_implemented<br>* `probability/development`: not_implemented<br> |
| [`SeverityNumber`](../#severitynumber) | unknown |  | * `debug`: unknown<br>* `debug2`: unknown<br>* `debug3`: unknown<br>* `debug4`: unknown<br>* `error`: unknown<br>* `error2`: unknown<br>* `error3`: unknown<br>* `error4`: unknown<br>* `fatal`: unknown<br>* `fatal2`: unknown<br>* `fatal3`: unknown<br>* `fatal4`: unknown<br>* `info`: unknown<br>* `info2`: unknown<br>* `info3`: unknown<br>* `info4`: unknown<br>* `trace`: unknown<br>* `trace2`: unknown<br>* `trace3`: unknown<br>* `trace4`: unknown<br>* `warn`: unknown<br>* `warn2`: unknown<br>* `warn3`: unknown<br>* `warn4`: unknown<br> |
| [`SimpleLogRecordProcessor`](../#simplelogrecordprocessor) | unknown |  | * `exporter`: unknown<br> |
| [`SimpleSpanProcessor`](../#simplespanprocessor) | supported |  | * `exporter`: supported<br> |
| [`SpanExporter`](../#spanexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: not_implemented<br> |
| [`SpanKind`](../#spankind) | unknown |  | * `client`: unknown<br>* `consumer`: unknown<br>* `internal`: unknown<br>* `producer`: unknown<br>* `server`: unknown<br> |
| [`SpanLimits`](../#spanlimits) | unknown |  | * `attribute_count_limit`: unknown<br>* `attribute_value_length_limit`: unknown<br>* `event_attribute_count_limit`: unknown<br>* `event_count_limit`: unknown<br>* `link_attribute_count_limit`: unknown<br>* `link_count_limit`: unknown<br> |
| [`SpanProcessor`](../#spanprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`SumAggregation`](../#sumaggregation) | unknown |  |  |
| [`TextMapPropagator`](../#textmappropagator) | supported |  | * `b3`: supported<br>* `b3multi`: supported<br>* `baggage`: supported<br>* `tracecontext`: supported<br> |
| [`TraceContextPropagator`](../#tracecontextpropagator) | supported |  |  |
| [`TraceIdRatioBasedSampler`](../#traceidratiobasedsampler) | supported |  | * `ratio`: supported<br> |
| [`TracerProvider`](../#tracerprovider) | unknown |  | * `limits`: unknown<br>* `processors`: unknown<br>* `sampler`: unknown<br>* `tracer_configurator/development`: unknown<br> |
| [`View`](../#view) | unknown |  | * `selector`: unknown<br>* `stream`: unknown<br> |
| [`ViewSelector`](../#viewselector) | unknown |  | * `instrument_name`: unknown<br>* `instrument_type`: unknown<br>* `meter_name`: unknown<br>* `meter_schema_url`: unknown<br>* `meter_version`: unknown<br>* `unit`: unknown<br> |
| [`ViewStream`](../#viewstream) | unknown |  | * `aggregation`: unknown<br>* `aggregation_cardinality_limit`: unknown<br>* `attribute_keys`: unknown<br>* `description`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalCodeInstrumentation`](../#experimentalcodeinstrumentation) | not_implemented |  | * `semconv`: not_implemented<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../#experimentalcomposablealwaysoffsampler) | not_implemented |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../#experimentalcomposablealwaysonsampler) | not_implemented |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../#experimentalcomposableparentthresholdsampler) | not_implemented |  | * `root`: not_implemented<br> |
| [`ExperimentalComposableProbabilitySampler`](../#experimentalcomposableprobabilitysampler) | not_implemented |  | * `ratio`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSampler`](../#experimentalcomposablerulebasedsampler) | not_implemented |  | * `rules`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../#experimentalcomposablerulebasedsamplerrule) | not_implemented |  | * `attribute_patterns`: not_implemented<br>* `attribute_values`: not_implemented<br>* `parent`: not_implemented<br>* `sampler`: not_implemented<br>* `span_kinds`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../#experimentalcomposablerulebasedsamplerruleattributepatterns) | not_implemented |  | * `excluded`: not_implemented<br>* `included`: not_implemented<br>* `key`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../#experimentalcomposablerulebasedsamplerruleattributevalues) | not_implemented |  | * `key`: not_implemented<br>* `values`: not_implemented<br> |
| [`ExperimentalComposableSampler`](../#experimentalcomposablesampler) | not_implemented |  | * `always_off`: not_implemented<br>* `always_on`: not_implemented<br>* `parent_threshold`: not_implemented<br>* `probability`: not_implemented<br>* `rule_based`: not_implemented<br> |
| [`ExperimentalContainerResourceDetector`](../#experimentalcontainerresourcedetector) | supported |  |  |
| [`ExperimentalDbInstrumentation`](../#experimentaldbinstrumentation) | not_implemented |  | * `semconv`: not_implemented<br> |
| [`ExperimentalGenAiInstrumentation`](../#experimentalgenaiinstrumentation) | not_implemented |  | * `semconv`: not_implemented<br> |
| [`ExperimentalGeneralInstrumentation`](../#experimentalgeneralinstrumentation) | not_implemented |  | * `code`: not_implemented<br>* `db`: not_implemented<br>* `gen_ai`: not_implemented<br>* `http`: not_implemented<br>* `messaging`: not_implemented<br>* `rpc`: not_implemented<br>* `sanitization`: not_implemented<br>* `stability_opt_in_list`: not_implemented<br> |
| [`ExperimentalHostResourceDetector`](../#experimentalhostresourcedetector) | supported |  |  |
| [`ExperimentalHttpClientInstrumentation`](../#experimentalhttpclientinstrumentation) | not_implemented |  | * `known_methods`: not_implemented<br>* `request_captured_headers`: not_implemented<br>* `response_captured_headers`: not_implemented<br> |
| [`ExperimentalHttpInstrumentation`](../#experimentalhttpinstrumentation) | not_implemented |  | * `client`: not_implemented<br>* `semconv`: not_implemented<br>* `server`: not_implemented<br> |
| [`ExperimentalHttpServerInstrumentation`](../#experimentalhttpserverinstrumentation) | not_implemented |  | * `known_methods`: not_implemented<br>* `request_captured_headers`: not_implemented<br>* `response_captured_headers`: not_implemented<br> |
| [`ExperimentalInstrumentation`](../#experimentalinstrumentation) | not_implemented |  | * `cpp`: not_implemented<br>* `dotnet`: not_implemented<br>* `erlang`: not_implemented<br>* `general`: not_implemented<br>* `go`: not_implemented<br>* `java`: not_implemented<br>* `js`: not_implemented<br>* `php`: not_implemented<br>* `python`: not_implemented<br>* `ruby`: not_implemented<br>* `rust`: not_implemented<br>* `swift`: not_implemented<br> |
| [`ExperimentalJaegerRemoteSampler`](../#experimentaljaegerremotesampler) | not_implemented |  | * `endpoint`: not_implemented<br>* `initial_sampler`: not_implemented<br>* `interval`: not_implemented<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../#experimentallanguagespecificinstrumentation) | not_implemented |  |  |
| [`ExperimentalLoggerConfig`](../#experimentalloggerconfig) | unknown |  | * `enabled`: unknown<br>* `minimum_severity`: unknown<br>* `trace_based`: unknown<br> |
| [`ExperimentalLoggerConfigurator`](../#experimentalloggerconfigurator) | not_implemented |  | * `default_config`: not_implemented<br>* `loggers`: not_implemented<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../#experimentalloggermatcherandconfig) | unknown |  | * `config`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalMessagingInstrumentation`](../#experimentalmessaginginstrumentation) | not_implemented |  | * `semconv`: not_implemented<br> |
| [`ExperimentalMeterConfig`](../#experimentalmeterconfig) | unknown |  | * `enabled`: unknown<br> |
| [`ExperimentalMeterConfigurator`](../#experimentalmeterconfigurator) | not_implemented |  | * `default_config`: not_implemented<br>* `meters`: not_implemented<br> |
| [`ExperimentalMeterMatcherAndConfig`](../#experimentalmetermatcherandconfig) | unknown |  | * `config`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalOtlpFileExporter`](../#experimentalotlpfileexporter) | not_implemented |  | * `output_stream`: not_implemented<br> |
| [`ExperimentalOtlpFileMetricExporter`](../#experimentalotlpfilemetricexporter) | not_implemented |  | * `default_histogram_aggregation`: not_implemented<br>* `output_stream`: not_implemented<br>* `temporality_preference`: not_implemented<br> |
| [`ExperimentalProbabilitySampler`](../#experimentalprobabilitysampler) | not_implemented |  | * `ratio`: not_implemented<br> |
| [`ExperimentalProcessResourceDetector`](../#experimentalprocessresourcedetector) | supported |  |  |
| [`ExperimentalPrometheusMetricExporter`](../#experimentalprometheusmetricexporter) | supported |  | * `host`: supported<br>* `port`: supported<br>* `translation_strategy`: supported<br>* `with_resource_constant_labels`: supported<br>* `without_scope_info`: supported<br>* `without_target_info/development`: supported<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../#experimentalprometheustranslationstrategy) | supported |  | * `no_translation/development`: supported<br>* `no_utf8_escaping_with_suffixes/development`: supported<br>* `underscore_escaping_with_suffixes`: supported<br>* `underscore_escaping_without_suffixes/development`: supported<br> |
| [`ExperimentalResourceDetection`](../#experimentalresourcedetection) | supported |  | * `attributes`: supported<br>* `detectors`: supported<br> |
| [`ExperimentalResourceDetector`](../#experimentalresourcedetector) | supported |  | * `container`: supported<br>* `host`: supported<br>* `process`: supported<br>* `service`: supported<br> |
| [`ExperimentalRpcInstrumentation`](../#experimentalrpcinstrumentation) | not_implemented |  | * `semconv`: not_implemented<br> |
| [`ExperimentalSanitization`](../#experimentalsanitization) | unknown |  | * `url`: unknown<br> |
| [`ExperimentalSemconvConfig`](../#experimentalsemconvconfig) | unknown |  | * `dual_emit`: unknown<br>* `experimental`: unknown<br>* `version`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../#experimentalserviceresourcedetector) | supported |  |  |
| [`ExperimentalSpanParent`](../#experimentalspanparent) | unknown |  | * `local`: unknown<br>* `none`: unknown<br>* `remote`: unknown<br> |
| [`ExperimentalTracerConfig`](../#experimentaltracerconfig) | unknown |  | * `enabled`: unknown<br> |
| [`ExperimentalTracerConfigurator`](../#experimentaltracerconfigurator) | not_implemented |  | * `default_config`: not_implemented<br>* `tracers`: not_implemented<br> |
| [`ExperimentalTracerMatcherAndConfig`](../#experimentaltracermatcherandconfig) | unknown |  | * `config`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalUrlSanitization`](../#experimentalurlsanitization) | unknown |  | * `sensitive_query_parameters`: unknown<br> |


## java {#java}
Latest supported file format: `1.0.0-rc.3`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../#aggregation) | supported |  | * `base2_exponential_bucket_histogram`: supported<br>* `default`: supported<br>* `drop`: supported<br>* `explicit_bucket_histogram`: supported<br>* `last_value`: supported<br>* `sum`: supported<br> |
| [`AlwaysOffSampler`](../#alwaysoffsampler) | supported |  |  |
| [`AlwaysOnSampler`](../#alwaysonsampler) | supported |  |  |
| [`AttributeLimits`](../#attributelimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`AttributeNameValue`](../#attributenamevalue) | supported |  | * `name`: supported<br>* `type`: supported<br>* `value`: supported<br> |
| [`AttributeType`](../#attributetype) | supported |  | * `bool`: supported<br>* `bool_array`: supported<br>* `double`: supported<br>* `double_array`: supported<br>* `int`: supported<br>* `int_array`: supported<br>* `string`: supported<br>* `string_array`: supported<br> |
| [`B3MultiPropagator`](../#b3multipropagator) | supported |  |  |
| [`B3Propagator`](../#b3propagator) | supported |  |  |
| [`BaggagePropagator`](../#baggagepropagator) | supported |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../#base2exponentialbuckethistogramaggregation) | supported |  | * `max_scale`: supported<br>* `max_size`: supported<br>* `record_min_max`: supported<br> |
| [`BatchLogRecordProcessor`](../#batchlogrecordprocessor) | supported |  | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`BatchSpanProcessor`](../#batchspanprocessor) | supported |  | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`CardinalityLimits`](../#cardinalitylimits) | supported |  | * `counter`: supported<br>* `default`: supported<br>* `gauge`: supported<br>* `histogram`: supported<br>* `observable_counter`: supported<br>* `observable_gauge`: supported<br>* `observable_up_down_counter`: supported<br>* `up_down_counter`: supported<br> |
| [`ConsoleExporter`](../#consoleexporter) | supported |  |  |
| [`ConsoleMetricExporter`](../#consolemetricexporter) | supported |  | * `default_histogram_aggregation`: not_implemented<br>* `temporality_preference`: ignored<br> |
| [`DefaultAggregation`](../#defaultaggregation) | supported |  |  |
| [`Distribution`](../#distribution) | supported |  |  |
| [`DropAggregation`](../#dropaggregation) | supported |  |  |
| [`ExemplarFilter`](../#exemplarfilter) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `trace_based`: supported<br> |
| [`ExplicitBucketHistogramAggregation`](../#explicitbuckethistogramaggregation) | supported |  | * `boundaries`: supported<br>* `record_min_max`: supported<br> |
| [`ExporterDefaultHistogramAggregation`](../#exporterdefaulthistogramaggregation) | supported |  | * `base2_exponential_bucket_histogram`: supported<br>* `explicit_bucket_histogram`: supported<br> |
| [`ExporterTemporalityPreference`](../#exportertemporalitypreference) | supported |  | * `cumulative`: supported<br>* `delta`: supported<br>* `low_memory`: supported<br> |
| [`GrpcTls`](../#grpctls) | supported |  | * `ca_file`: supported<br>* `cert_file`: supported<br>* `insecure`: not_implemented<br>* `key_file`: supported<br> |
| [`HttpTls`](../#httptls) | supported |  | * `ca_file`: supported<br>* `cert_file`: supported<br>* `key_file`: supported<br> |
| [`IncludeExclude`](../#includeexclude) | supported |  | * `excluded`: supported<br>* `included`: supported<br> |
| [`InstrumentType`](../#instrumenttype) | supported |  | * `counter`: supported<br>* `gauge`: supported<br>* `histogram`: supported<br>* `observable_counter`: supported<br>* `observable_gauge`: supported<br>* `observable_up_down_counter`: supported<br>* `up_down_counter`: supported<br> |
| [`LastValueAggregation`](../#lastvalueaggregation) | supported |  |  |
| [`LoggerProvider`](../#loggerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `logger_configurator/development`: supported<br> |
| [`LogRecordExporter`](../#logrecordexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`LogRecordLimits`](../#logrecordlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`LogRecordProcessor`](../#logrecordprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`MeterProvider`](../#meterprovider) | supported |  | * `exemplar_filter`: supported<br>* `readers`: supported<br>* `views`: supported<br>* `meter_configurator/development`: supported<br> |
| [`MetricProducer`](../#metricproducer) | ignored |  | * `opencensus`: ignored<br> |
| [`MetricReader`](../#metricreader) | supported |  | * `periodic`: supported<br>* `pull`: supported<br> |
| [`NameStringValuePair`](../#namestringvaluepair) | supported |  | * `name`: supported<br>* `value`: supported<br> |
| [`OpenCensusMetricProducer`](../#opencensusmetricproducer) | ignored |  |  |
| [`OpenTelemetryConfiguration`](../#opentelemetryconfiguration) | supported |  | * `attribute_limits`: supported<br>* `disabled`: supported<br>* `distribution`: supported<br>* `file_format`: supported<br>* `log_level`: not_implemented<br>* `logger_provider`: supported<br>* `meter_provider`: supported<br>* `propagator`: supported<br>* `resource`: supported<br>* `tracer_provider`: supported<br>* `instrumentation/development`: supported<br> |
| [`OtlpGrpcExporter`](../#otlpgrpcexporter) | supported |  | * `compression`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpGrpcMetricExporter`](../#otlpgrpcmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpHttpEncoding`](../#otlphttpencoding) | not_implemented |  | * `json`: not_implemented<br>* `protobuf`: not_implemented<br> |
| [`OtlpHttpExporter`](../#otlphttpexporter) | supported |  | * `compression`: supported<br>* `encoding`: not_implemented<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`OtlpHttpMetricExporter`](../#otlphttpmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: supported<br>* `encoding`: not_implemented<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: supported<br> |
| [`ParentBasedSampler`](../#parentbasedsampler) | supported |  | * `local_parent_not_sampled`: supported<br>* `local_parent_sampled`: supported<br>* `remote_parent_not_sampled`: supported<br>* `remote_parent_sampled`: supported<br>* `root`: supported<br> |
| [`PeriodicMetricReader`](../#periodicmetricreader) | supported |  | * `cardinality_limits`: supported<br>* `exporter`: supported<br>* `interval`: supported<br>* `producers`: not_implemented<br>* `timeout`: supported<br> |
| [`Propagator`](../#propagator) | supported |  | * `composite`: supported<br>* `composite_list`: supported<br> |
| [`PullMetricExporter`](../#pullmetricexporter) | supported |  | * `prometheus/development`: supported<br> |
| [`PullMetricReader`](../#pullmetricreader) | supported |  | * `cardinality_limits`: supported<br>* `exporter`: supported<br>* `producers`: not_implemented<br> |
| [`PushMetricExporter`](../#pushmetricexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`Resource`](../#resource) | supported |  | * `attributes`: supported<br>* `attributes_list`: supported<br>* `schema_url`: supported<br>* `detection/development`: supported<br> |
| [`Sampler`](../#sampler) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `parent_based`: supported<br>* `trace_id_ratio_based`: supported<br>* `composite/development`: supported<br>* `jaeger_remote/development`: supported<br>* `probability/development`: supported<br> |
| [`SeverityNumber`](../#severitynumber) | supported |  | * `debug`: supported<br>* `debug2`: supported<br>* `debug3`: supported<br>* `debug4`: supported<br>* `error`: supported<br>* `error2`: supported<br>* `error3`: supported<br>* `error4`: supported<br>* `fatal`: supported<br>* `fatal2`: supported<br>* `fatal3`: supported<br>* `fatal4`: supported<br>* `info`: supported<br>* `info2`: supported<br>* `info3`: supported<br>* `info4`: supported<br>* `trace`: supported<br>* `trace2`: supported<br>* `trace3`: supported<br>* `trace4`: supported<br>* `warn`: supported<br>* `warn2`: supported<br>* `warn3`: supported<br>* `warn4`: supported<br> |
| [`SimpleLogRecordProcessor`](../#simplelogrecordprocessor) | supported |  | * `exporter`: supported<br> |
| [`SimpleSpanProcessor`](../#simplespanprocessor) | supported |  | * `exporter`: supported<br> |
| [`SpanExporter`](../#spanexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`SpanKind`](../#spankind) | supported |  | * `client`: supported<br>* `consumer`: supported<br>* `internal`: supported<br>* `producer`: supported<br>* `server`: supported<br> |
| [`SpanLimits`](../#spanlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br>* `event_attribute_count_limit`: supported<br>* `event_count_limit`: supported<br>* `link_attribute_count_limit`: supported<br>* `link_count_limit`: supported<br> |
| [`SpanProcessor`](../#spanprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`SumAggregation`](../#sumaggregation) | supported |  |  |
| [`TextMapPropagator`](../#textmappropagator) | supported |  | * `b3`: supported<br>* `b3multi`: supported<br>* `baggage`: supported<br>* `tracecontext`: supported<br> |
| [`TraceContextPropagator`](../#tracecontextpropagator) | supported |  |  |
| [`TraceIdRatioBasedSampler`](../#traceidratiobasedsampler) | supported |  | * `ratio`: supported<br> |
| [`TracerProvider`](../#tracerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `sampler`: supported<br>* `tracer_configurator/development`: supported<br> |
| [`View`](../#view) | supported |  | * `selector`: supported<br>* `stream`: supported<br> |
| [`ViewSelector`](../#viewselector) | supported |  | * `instrument_name`: supported<br>* `instrument_type`: supported<br>* `meter_name`: supported<br>* `meter_schema_url`: supported<br>* `meter_version`: supported<br>* `unit`: supported<br> |
| [`ViewStream`](../#viewstream) | supported |  | * `aggregation`: supported<br>* `aggregation_cardinality_limit`: supported<br>* `attribute_keys`: supported<br>* `description`: supported<br>* `name`: supported<br> |
| [`ExperimentalCodeInstrumentation`](../#experimentalcodeinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../#experimentalcomposablealwaysoffsampler) | supported |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../#experimentalcomposablealwaysonsampler) | supported |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../#experimentalcomposableparentthresholdsampler) | supported |  | * `root`: supported<br> |
| [`ExperimentalComposableProbabilitySampler`](../#experimentalcomposableprobabilitysampler) | supported |  | * `ratio`: supported<br> |
| [`ExperimentalComposableRuleBasedSampler`](../#experimentalcomposablerulebasedsampler) | supported |  | * `rules`: supported<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../#experimentalcomposablerulebasedsamplerrule) | supported |  | * `attribute_patterns`: supported<br>* `attribute_values`: supported<br>* `parent`: supported<br>* `sampler`: supported<br>* `span_kinds`: supported<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../#experimentalcomposablerulebasedsamplerruleattributepatterns) | supported |  | * `excluded`: supported<br>* `included`: supported<br>* `key`: supported<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../#experimentalcomposablerulebasedsamplerruleattributevalues) | supported |  | * `key`: supported<br>* `values`: supported<br> |
| [`ExperimentalComposableSampler`](../#experimentalcomposablesampler) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `parent_threshold`: supported<br>* `probability`: supported<br>* `rule_based`: supported<br> |
| [`ExperimentalContainerResourceDetector`](../#experimentalcontainerresourcedetector) | supported |  |  |
| [`ExperimentalDbInstrumentation`](../#experimentaldbinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGenAiInstrumentation`](../#experimentalgenaiinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGeneralInstrumentation`](../#experimentalgeneralinstrumentation) | supported |  | * `code`: supported<br>* `db`: supported<br>* `gen_ai`: supported<br>* `http`: supported<br>* `messaging`: supported<br>* `rpc`: supported<br>* `sanitization`: supported<br>* `stability_opt_in_list`: supported<br> |
| [`ExperimentalHostResourceDetector`](../#experimentalhostresourcedetector) | supported |  |  |
| [`ExperimentalHttpClientInstrumentation`](../#experimentalhttpclientinstrumentation) | supported |  | * `known_methods`: supported<br>* `request_captured_headers`: supported<br>* `response_captured_headers`: supported<br> |
| [`ExperimentalHttpInstrumentation`](../#experimentalhttpinstrumentation) | supported |  | * `client`: supported<br>* `semconv`: supported<br>* `server`: supported<br> |
| [`ExperimentalHttpServerInstrumentation`](../#experimentalhttpserverinstrumentation) | supported |  | * `known_methods`: supported<br>* `request_captured_headers`: supported<br>* `response_captured_headers`: supported<br> |
| [`ExperimentalInstrumentation`](../#experimentalinstrumentation) | supported |  | * `cpp`: not_applicable<br>* `dotnet`: not_applicable<br>* `erlang`: not_applicable<br>* `general`: supported<br>* `go`: not_applicable<br>* `java`: supported<br>* `js`: not_applicable<br>* `php`: not_applicable<br>* `python`: not_applicable<br>* `ruby`: not_applicable<br>* `rust`: not_applicable<br>* `swift`: not_applicable<br> |
| [`ExperimentalJaegerRemoteSampler`](../#experimentaljaegerremotesampler) | supported |  | * `endpoint`: supported<br>* `initial_sampler`: supported<br>* `interval`: supported<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../#experimentallanguagespecificinstrumentation) | supported |  |  |
| [`ExperimentalLoggerConfig`](../#experimentalloggerconfig) | supported |  | * `enabled`: supported<br>* `minimum_severity`: supported<br>* `trace_based`: supported<br> |
| [`ExperimentalLoggerConfigurator`](../#experimentalloggerconfigurator) | supported |  | * `default_config`: supported<br>* `loggers`: supported<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../#experimentalloggermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalMessagingInstrumentation`](../#experimentalmessaginginstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalMeterConfig`](../#experimentalmeterconfig) | supported |  | * `enabled`: supported<br> |
| [`ExperimentalMeterConfigurator`](../#experimentalmeterconfigurator) | supported |  | * `default_config`: supported<br>* `meters`: supported<br> |
| [`ExperimentalMeterMatcherAndConfig`](../#experimentalmetermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalOtlpFileExporter`](../#experimentalotlpfileexporter) | supported |  | * `output_stream`: not_implemented<br> |
| [`ExperimentalOtlpFileMetricExporter`](../#experimentalotlpfilemetricexporter) | supported |  | * `default_histogram_aggregation`: supported<br>* `output_stream`: not_implemented<br>* `temporality_preference`: supported<br> |
| [`ExperimentalProbabilitySampler`](../#experimentalprobabilitysampler) | supported |  | * `ratio`: supported<br> |
| [`ExperimentalProcessResourceDetector`](../#experimentalprocessresourcedetector) | supported |  |  |
| [`ExperimentalPrometheusMetricExporter`](../#experimentalprometheusmetricexporter) | supported |  | * `host`: supported<br>* `port`: supported<br>* `translation_strategy`: not_implemented<br>* `with_resource_constant_labels`: supported<br>* `without_scope_info`: supported<br>* `without_target_info/development`: supported<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../#experimentalprometheustranslationstrategy) | not_implemented |  | * `no_translation/development`: not_implemented<br>* `no_utf8_escaping_with_suffixes/development`: not_implemented<br>* `underscore_escaping_with_suffixes`: not_implemented<br>* `underscore_escaping_without_suffixes/development`: not_implemented<br> |
| [`ExperimentalResourceDetection`](../#experimentalresourcedetection) | supported |  | * `attributes`: supported<br>* `detectors`: supported<br> |
| [`ExperimentalResourceDetector`](../#experimentalresourcedetector) | supported |  | * `container`: supported<br>* `host`: supported<br>* `process`: supported<br>* `service`: supported<br> |
| [`ExperimentalRpcInstrumentation`](../#experimentalrpcinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalSanitization`](../#experimentalsanitization) | unknown |  | * `url`: unknown<br> |
| [`ExperimentalSemconvConfig`](../#experimentalsemconvconfig) | unknown |  | * `dual_emit`: unknown<br>* `experimental`: unknown<br>* `version`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../#experimentalserviceresourcedetector) | supported |  |  |
| [`ExperimentalSpanParent`](../#experimentalspanparent) | supported |  | * `local`: supported<br>* `none`: supported<br>* `remote`: supported<br> |
| [`ExperimentalTracerConfig`](../#experimentaltracerconfig) | supported |  | * `enabled`: supported<br> |
| [`ExperimentalTracerConfigurator`](../#experimentaltracerconfigurator) | supported |  | * `default_config`: supported<br>* `tracers`: supported<br> |
| [`ExperimentalTracerMatcherAndConfig`](../#experimentaltracermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalUrlSanitization`](../#experimentalurlsanitization) | unknown |  | * `sensitive_query_parameters`: unknown<br> |


## js {#js}
Latest supported file format: `1.0.0-rc.3`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../#aggregation) | unknown |  | * `base2_exponential_bucket_histogram`: unknown<br>* `default`: unknown<br>* `drop`: unknown<br>* `explicit_bucket_histogram`: unknown<br>* `last_value`: unknown<br>* `sum`: unknown<br> |
| [`AlwaysOffSampler`](../#alwaysoffsampler) | unknown |  |  |
| [`AlwaysOnSampler`](../#alwaysonsampler) | unknown |  |  |
| [`AttributeLimits`](../#attributelimits) | unknown |  | * `attribute_count_limit`: unknown<br>* `attribute_value_length_limit`: unknown<br> |
| [`AttributeNameValue`](../#attributenamevalue) | unknown |  | * `name`: unknown<br>* `type`: unknown<br>* `value`: unknown<br> |
| [`AttributeType`](../#attributetype) | unknown |  | * `bool`: unknown<br>* `bool_array`: unknown<br>* `double`: unknown<br>* `double_array`: unknown<br>* `int`: unknown<br>* `int_array`: unknown<br>* `string`: unknown<br>* `string_array`: unknown<br> |
| [`B3MultiPropagator`](../#b3multipropagator) | unknown |  |  |
| [`B3Propagator`](../#b3propagator) | unknown |  |  |
| [`BaggagePropagator`](../#baggagepropagator) | unknown |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../#base2exponentialbuckethistogramaggregation) | unknown |  | * `max_scale`: unknown<br>* `max_size`: unknown<br>* `record_min_max`: unknown<br> |
| [`BatchLogRecordProcessor`](../#batchlogrecordprocessor) | unknown |  | * `export_timeout`: unknown<br>* `exporter`: unknown<br>* `max_export_batch_size`: unknown<br>* `max_queue_size`: unknown<br>* `schedule_delay`: unknown<br> |
| [`BatchSpanProcessor`](../#batchspanprocessor) | unknown |  | * `export_timeout`: unknown<br>* `exporter`: unknown<br>* `max_export_batch_size`: unknown<br>* `max_queue_size`: unknown<br>* `schedule_delay`: unknown<br> |
| [`CardinalityLimits`](../#cardinalitylimits) | unknown |  | * `counter`: unknown<br>* `default`: unknown<br>* `gauge`: unknown<br>* `histogram`: unknown<br>* `observable_counter`: unknown<br>* `observable_gauge`: unknown<br>* `observable_up_down_counter`: unknown<br>* `up_down_counter`: unknown<br> |
| [`ConsoleExporter`](../#consoleexporter) | unknown |  |  |
| [`ConsoleMetricExporter`](../#consolemetricexporter) | unknown |  | * `default_histogram_aggregation`: unknown<br>* `temporality_preference`: unknown<br> |
| [`DefaultAggregation`](../#defaultaggregation) | unknown |  |  |
| [`Distribution`](../#distribution) | unknown |  |  |
| [`DropAggregation`](../#dropaggregation) | unknown |  |  |
| [`ExemplarFilter`](../#exemplarfilter) | unknown |  | * `always_off`: unknown<br>* `always_on`: unknown<br>* `trace_based`: unknown<br> |
| [`ExplicitBucketHistogramAggregation`](../#explicitbuckethistogramaggregation) | unknown |  | * `boundaries`: unknown<br>* `record_min_max`: unknown<br> |
| [`ExporterDefaultHistogramAggregation`](../#exporterdefaulthistogramaggregation) | unknown |  | * `base2_exponential_bucket_histogram`: unknown<br>* `explicit_bucket_histogram`: unknown<br> |
| [`ExporterTemporalityPreference`](../#exportertemporalitypreference) | unknown |  | * `cumulative`: unknown<br>* `delta`: unknown<br>* `low_memory`: unknown<br> |
| [`GrpcTls`](../#grpctls) | unknown |  | * `ca_file`: unknown<br>* `cert_file`: unknown<br>* `insecure`: unknown<br>* `key_file`: unknown<br> |
| [`HttpTls`](../#httptls) | unknown |  | * `ca_file`: unknown<br>* `cert_file`: unknown<br>* `key_file`: unknown<br> |
| [`IncludeExclude`](../#includeexclude) | unknown |  | * `excluded`: unknown<br>* `included`: unknown<br> |
| [`InstrumentType`](../#instrumenttype) | unknown |  | * `counter`: unknown<br>* `gauge`: unknown<br>* `histogram`: unknown<br>* `observable_counter`: unknown<br>* `observable_gauge`: unknown<br>* `observable_up_down_counter`: unknown<br>* `up_down_counter`: unknown<br> |
| [`LastValueAggregation`](../#lastvalueaggregation) | unknown |  |  |
| [`LoggerProvider`](../#loggerprovider) | unknown |  | * `limits`: unknown<br>* `processors`: unknown<br>* `logger_configurator/development`: unknown<br> |
| [`LogRecordExporter`](../#logrecordexporter) | unknown |  | * `console`: unknown<br>* `otlp_grpc`: unknown<br>* `otlp_http`: unknown<br>* `otlp_file/development`: unknown<br> |
| [`LogRecordLimits`](../#logrecordlimits) | unknown |  | * `attribute_count_limit`: unknown<br>* `attribute_value_length_limit`: unknown<br> |
| [`LogRecordProcessor`](../#logrecordprocessor) | unknown |  | * `batch`: unknown<br>* `simple`: unknown<br> |
| [`MeterProvider`](../#meterprovider) | unknown |  | * `exemplar_filter`: unknown<br>* `readers`: unknown<br>* `views`: unknown<br>* `meter_configurator/development`: unknown<br> |
| [`MetricProducer`](../#metricproducer) | unknown |  | * `opencensus`: unknown<br> |
| [`MetricReader`](../#metricreader) | unknown |  | * `periodic`: unknown<br>* `pull`: unknown<br> |
| [`NameStringValuePair`](../#namestringvaluepair) | unknown |  | * `name`: unknown<br>* `value`: unknown<br> |
| [`OpenCensusMetricProducer`](../#opencensusmetricproducer) | unknown |  |  |
| [`OpenTelemetryConfiguration`](../#opentelemetryconfiguration) | unknown |  | * `attribute_limits`: unknown<br>* `disabled`: unknown<br>* `distribution`: unknown<br>* `file_format`: unknown<br>* `log_level`: unknown<br>* `logger_provider`: unknown<br>* `meter_provider`: unknown<br>* `propagator`: unknown<br>* `resource`: unknown<br>* `tracer_provider`: unknown<br>* `instrumentation/development`: unknown<br> |
| [`OtlpGrpcExporter`](../#otlpgrpcexporter) | unknown |  | * `compression`: unknown<br>* `endpoint`: unknown<br>* `headers`: unknown<br>* `headers_list`: unknown<br>* `timeout`: unknown<br>* `tls`: unknown<br> |
| [`OtlpGrpcMetricExporter`](../#otlpgrpcmetricexporter) | unknown |  | * `compression`: unknown<br>* `default_histogram_aggregation`: unknown<br>* `endpoint`: unknown<br>* `headers`: unknown<br>* `headers_list`: unknown<br>* `temporality_preference`: unknown<br>* `timeout`: unknown<br>* `tls`: unknown<br> |
| [`OtlpHttpEncoding`](../#otlphttpencoding) | unknown |  | * `json`: unknown<br>* `protobuf`: unknown<br> |
| [`OtlpHttpExporter`](../#otlphttpexporter) | unknown |  | * `compression`: unknown<br>* `encoding`: unknown<br>* `endpoint`: unknown<br>* `headers`: unknown<br>* `headers_list`: unknown<br>* `timeout`: unknown<br>* `tls`: unknown<br> |
| [`OtlpHttpMetricExporter`](../#otlphttpmetricexporter) | unknown |  | * `compression`: unknown<br>* `default_histogram_aggregation`: unknown<br>* `encoding`: unknown<br>* `endpoint`: unknown<br>* `headers`: unknown<br>* `headers_list`: unknown<br>* `temporality_preference`: unknown<br>* `timeout`: unknown<br>* `tls`: unknown<br> |
| [`ParentBasedSampler`](../#parentbasedsampler) | unknown |  | * `local_parent_not_sampled`: unknown<br>* `local_parent_sampled`: unknown<br>* `remote_parent_not_sampled`: unknown<br>* `remote_parent_sampled`: unknown<br>* `root`: unknown<br> |
| [`PeriodicMetricReader`](../#periodicmetricreader) | unknown |  | * `cardinality_limits`: unknown<br>* `exporter`: unknown<br>* `interval`: unknown<br>* `producers`: unknown<br>* `timeout`: unknown<br> |
| [`Propagator`](../#propagator) | unknown |  | * `composite`: unknown<br>* `composite_list`: unknown<br> |
| [`PullMetricExporter`](../#pullmetricexporter) | unknown |  | * `prometheus/development`: unknown<br> |
| [`PullMetricReader`](../#pullmetricreader) | unknown |  | * `cardinality_limits`: unknown<br>* `exporter`: unknown<br>* `producers`: unknown<br> |
| [`PushMetricExporter`](../#pushmetricexporter) | unknown |  | * `console`: unknown<br>* `otlp_grpc`: unknown<br>* `otlp_http`: unknown<br>* `otlp_file/development`: unknown<br> |
| [`Resource`](../#resource) | unknown |  | * `attributes`: unknown<br>* `attributes_list`: unknown<br>* `schema_url`: unknown<br>* `detection/development`: unknown<br> |
| [`Sampler`](../#sampler) | unknown |  | * `always_off`: unknown<br>* `always_on`: unknown<br>* `parent_based`: unknown<br>* `trace_id_ratio_based`: unknown<br>* `composite/development`: unknown<br>* `jaeger_remote/development`: unknown<br>* `probability/development`: unknown<br> |
| [`SeverityNumber`](../#severitynumber) | unknown |  | * `debug`: unknown<br>* `debug2`: unknown<br>* `debug3`: unknown<br>* `debug4`: unknown<br>* `error`: unknown<br>* `error2`: unknown<br>* `error3`: unknown<br>* `error4`: unknown<br>* `fatal`: unknown<br>* `fatal2`: unknown<br>* `fatal3`: unknown<br>* `fatal4`: unknown<br>* `info`: unknown<br>* `info2`: unknown<br>* `info3`: unknown<br>* `info4`: unknown<br>* `trace`: unknown<br>* `trace2`: unknown<br>* `trace3`: unknown<br>* `trace4`: unknown<br>* `warn`: unknown<br>* `warn2`: unknown<br>* `warn3`: unknown<br>* `warn4`: unknown<br> |
| [`SimpleLogRecordProcessor`](../#simplelogrecordprocessor) | unknown |  | * `exporter`: unknown<br> |
| [`SimpleSpanProcessor`](../#simplespanprocessor) | unknown |  | * `exporter`: unknown<br> |
| [`SpanExporter`](../#spanexporter) | unknown |  | * `console`: unknown<br>* `otlp_grpc`: unknown<br>* `otlp_http`: unknown<br>* `otlp_file/development`: unknown<br> |
| [`SpanKind`](../#spankind) | unknown |  | * `client`: unknown<br>* `consumer`: unknown<br>* `internal`: unknown<br>* `producer`: unknown<br>* `server`: unknown<br> |
| [`SpanLimits`](../#spanlimits) | unknown |  | * `attribute_count_limit`: unknown<br>* `attribute_value_length_limit`: unknown<br>* `event_attribute_count_limit`: unknown<br>* `event_count_limit`: unknown<br>* `link_attribute_count_limit`: unknown<br>* `link_count_limit`: unknown<br> |
| [`SpanProcessor`](../#spanprocessor) | unknown |  | * `batch`: unknown<br>* `simple`: unknown<br> |
| [`SumAggregation`](../#sumaggregation) | unknown |  |  |
| [`TextMapPropagator`](../#textmappropagator) | unknown |  | * `b3`: unknown<br>* `b3multi`: unknown<br>* `baggage`: unknown<br>* `tracecontext`: unknown<br> |
| [`TraceContextPropagator`](../#tracecontextpropagator) | unknown |  |  |
| [`TraceIdRatioBasedSampler`](../#traceidratiobasedsampler) | unknown |  | * `ratio`: unknown<br> |
| [`TracerProvider`](../#tracerprovider) | unknown |  | * `limits`: unknown<br>* `processors`: unknown<br>* `sampler`: unknown<br>* `tracer_configurator/development`: unknown<br> |
| [`View`](../#view) | unknown |  | * `selector`: unknown<br>* `stream`: unknown<br> |
| [`ViewSelector`](../#viewselector) | unknown |  | * `instrument_name`: unknown<br>* `instrument_type`: unknown<br>* `meter_name`: unknown<br>* `meter_schema_url`: unknown<br>* `meter_version`: unknown<br>* `unit`: unknown<br> |
| [`ViewStream`](../#viewstream) | unknown |  | * `aggregation`: unknown<br>* `aggregation_cardinality_limit`: unknown<br>* `attribute_keys`: unknown<br>* `description`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalCodeInstrumentation`](../#experimentalcodeinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../#experimentalcomposablealwaysoffsampler) | unknown |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../#experimentalcomposablealwaysonsampler) | unknown |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../#experimentalcomposableparentthresholdsampler) | unknown |  | * `root`: unknown<br> |
| [`ExperimentalComposableProbabilitySampler`](../#experimentalcomposableprobabilitysampler) | unknown |  | * `ratio`: unknown<br> |
| [`ExperimentalComposableRuleBasedSampler`](../#experimentalcomposablerulebasedsampler) | unknown |  | * `rules`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../#experimentalcomposablerulebasedsamplerrule) | unknown |  | * `attribute_patterns`: unknown<br>* `attribute_values`: unknown<br>* `parent`: unknown<br>* `sampler`: unknown<br>* `span_kinds`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../#experimentalcomposablerulebasedsamplerruleattributepatterns) | unknown |  | * `excluded`: unknown<br>* `included`: unknown<br>* `key`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../#experimentalcomposablerulebasedsamplerruleattributevalues) | unknown |  | * `key`: unknown<br>* `values`: unknown<br> |
| [`ExperimentalComposableSampler`](../#experimentalcomposablesampler) | unknown |  | * `always_off`: unknown<br>* `always_on`: unknown<br>* `parent_threshold`: unknown<br>* `probability`: unknown<br>* `rule_based`: unknown<br> |
| [`ExperimentalContainerResourceDetector`](../#experimentalcontainerresourcedetector) | unknown |  |  |
| [`ExperimentalDbInstrumentation`](../#experimentaldbinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGenAiInstrumentation`](../#experimentalgenaiinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGeneralInstrumentation`](../#experimentalgeneralinstrumentation) | unknown |  | * `code`: unknown<br>* `db`: unknown<br>* `gen_ai`: unknown<br>* `http`: unknown<br>* `messaging`: unknown<br>* `rpc`: unknown<br>* `sanitization`: unknown<br>* `stability_opt_in_list`: unknown<br> |
| [`ExperimentalHostResourceDetector`](../#experimentalhostresourcedetector) | unknown |  |  |
| [`ExperimentalHttpClientInstrumentation`](../#experimentalhttpclientinstrumentation) | unknown |  | * `known_methods`: unknown<br>* `request_captured_headers`: unknown<br>* `response_captured_headers`: unknown<br> |
| [`ExperimentalHttpInstrumentation`](../#experimentalhttpinstrumentation) | unknown |  | * `client`: unknown<br>* `semconv`: unknown<br>* `server`: unknown<br> |
| [`ExperimentalHttpServerInstrumentation`](../#experimentalhttpserverinstrumentation) | unknown |  | * `known_methods`: unknown<br>* `request_captured_headers`: unknown<br>* `response_captured_headers`: unknown<br> |
| [`ExperimentalInstrumentation`](../#experimentalinstrumentation) | unknown |  | * `cpp`: unknown<br>* `dotnet`: unknown<br>* `erlang`: unknown<br>* `general`: unknown<br>* `go`: unknown<br>* `java`: unknown<br>* `js`: unknown<br>* `php`: unknown<br>* `python`: unknown<br>* `ruby`: unknown<br>* `rust`: unknown<br>* `swift`: unknown<br> |
| [`ExperimentalJaegerRemoteSampler`](../#experimentaljaegerremotesampler) | unknown |  | * `endpoint`: unknown<br>* `initial_sampler`: unknown<br>* `interval`: unknown<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../#experimentallanguagespecificinstrumentation) | unknown |  |  |
| [`ExperimentalLoggerConfig`](../#experimentalloggerconfig) | unknown |  | * `enabled`: unknown<br>* `minimum_severity`: unknown<br>* `trace_based`: unknown<br> |
| [`ExperimentalLoggerConfigurator`](../#experimentalloggerconfigurator) | unknown |  | * `default_config`: unknown<br>* `loggers`: unknown<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../#experimentalloggermatcherandconfig) | unknown |  | * `config`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalMessagingInstrumentation`](../#experimentalmessaginginstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalMeterConfig`](../#experimentalmeterconfig) | unknown |  | * `enabled`: unknown<br> |
| [`ExperimentalMeterConfigurator`](../#experimentalmeterconfigurator) | unknown |  | * `default_config`: unknown<br>* `meters`: unknown<br> |
| [`ExperimentalMeterMatcherAndConfig`](../#experimentalmetermatcherandconfig) | unknown |  | * `config`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalOtlpFileExporter`](../#experimentalotlpfileexporter) | unknown |  | * `output_stream`: unknown<br> |
| [`ExperimentalOtlpFileMetricExporter`](../#experimentalotlpfilemetricexporter) | unknown |  | * `default_histogram_aggregation`: unknown<br>* `output_stream`: unknown<br>* `temporality_preference`: unknown<br> |
| [`ExperimentalProbabilitySampler`](../#experimentalprobabilitysampler) | unknown |  | * `ratio`: unknown<br> |
| [`ExperimentalProcessResourceDetector`](../#experimentalprocessresourcedetector) | unknown |  |  |
| [`ExperimentalPrometheusMetricExporter`](../#experimentalprometheusmetricexporter) | unknown |  | * `host`: unknown<br>* `port`: unknown<br>* `translation_strategy`: unknown<br>* `with_resource_constant_labels`: unknown<br>* `without_scope_info`: unknown<br>* `without_target_info/development`: unknown<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../#experimentalprometheustranslationstrategy) | unknown |  | * `no_translation/development`: unknown<br>* `no_utf8_escaping_with_suffixes/development`: unknown<br>* `underscore_escaping_with_suffixes`: unknown<br>* `underscore_escaping_without_suffixes/development`: unknown<br> |
| [`ExperimentalResourceDetection`](../#experimentalresourcedetection) | unknown |  | * `attributes`: unknown<br>* `detectors`: unknown<br> |
| [`ExperimentalResourceDetector`](../#experimentalresourcedetector) | unknown |  | * `container`: unknown<br>* `host`: unknown<br>* `process`: unknown<br>* `service`: unknown<br> |
| [`ExperimentalRpcInstrumentation`](../#experimentalrpcinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalSanitization`](../#experimentalsanitization) | unknown |  | * `url`: unknown<br> |
| [`ExperimentalSemconvConfig`](../#experimentalsemconvconfig) | unknown |  | * `dual_emit`: unknown<br>* `experimental`: unknown<br>* `version`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../#experimentalserviceresourcedetector) | unknown |  |  |
| [`ExperimentalSpanParent`](../#experimentalspanparent) | unknown |  | * `local`: unknown<br>* `none`: unknown<br>* `remote`: unknown<br> |
| [`ExperimentalTracerConfig`](../#experimentaltracerconfig) | unknown |  | * `enabled`: unknown<br> |
| [`ExperimentalTracerConfigurator`](../#experimentaltracerconfigurator) | unknown |  | * `default_config`: unknown<br>* `tracers`: unknown<br> |
| [`ExperimentalTracerMatcherAndConfig`](../#experimentaltracermatcherandconfig) | unknown |  | * `config`: unknown<br>* `name`: unknown<br> |
| [`ExperimentalUrlSanitization`](../#experimentalurlsanitization) | unknown |  | * `sensitive_query_parameters`: unknown<br> |


## php {#php}
Latest supported file format: `1.0.0-rc.2`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../#aggregation) | ignored |  | * `base2_exponential_bucket_histogram`: ignored<br>* `default`: ignored<br>* `drop`: ignored<br>* `explicit_bucket_histogram`: ignored<br>* `last_value`: ignored<br>* `sum`: ignored<br> |
| [`AlwaysOffSampler`](../#alwaysoffsampler) | supported |  |  |
| [`AlwaysOnSampler`](../#alwaysonsampler) | supported |  |  |
| [`AttributeLimits`](../#attributelimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`AttributeNameValue`](../#attributenamevalue) | supported |  | * `name`: supported<br>* `type`: not_implemented<br>* `value`: supported<br> |
| [`AttributeType`](../#attributetype) | not_implemented |  | * `bool`: not_implemented<br>* `bool_array`: not_implemented<br>* `double`: not_implemented<br>* `double_array`: not_implemented<br>* `int`: not_implemented<br>* `int_array`: not_implemented<br>* `string`: not_implemented<br>* `string_array`: not_implemented<br> |
| [`B3MultiPropagator`](../#b3multipropagator) | supported |  |  |
| [`B3Propagator`](../#b3propagator) | supported |  |  |
| [`BaggagePropagator`](../#baggagepropagator) | supported |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../#base2exponentialbuckethistogramaggregation) | not_implemented |  | * `max_scale`: not_implemented<br>* `max_size`: not_implemented<br>* `record_min_max`: not_implemented<br> |
| [`BatchLogRecordProcessor`](../#batchlogrecordprocessor) | supported | `schedule_delay` is only checked on `::onEmit()`. | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`BatchSpanProcessor`](../#batchspanprocessor) | supported | `schedule_delay` is only checked on `::onEnd()`. | * `export_timeout`: supported<br>* `exporter`: supported<br>* `max_export_batch_size`: supported<br>* `max_queue_size`: supported<br>* `schedule_delay`: supported<br> |
| [`CardinalityLimits`](../#cardinalitylimits) | not_implemented |  | * `counter`: not_implemented<br>* `default`: not_implemented<br>* `gauge`: not_implemented<br>* `histogram`: not_implemented<br>* `observable_counter`: not_implemented<br>* `observable_gauge`: not_implemented<br>* `observable_up_down_counter`: not_implemented<br>* `up_down_counter`: not_implemented<br> |
| [`ConsoleExporter`](../#consoleexporter) | supported |  |  |
| [`ConsoleMetricExporter`](../#consolemetricexporter) | supported |  | * `default_histogram_aggregation`: not_implemented<br>* `temporality_preference`: ignored<br> |
| [`DefaultAggregation`](../#defaultaggregation) | ignored |  |  |
| [`Distribution`](../#distribution) | not_implemented |  |  |
| [`DropAggregation`](../#dropaggregation) | ignored |  |  |
| [`ExemplarFilter`](../#exemplarfilter) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `trace_based`: supported<br> |
| [`ExplicitBucketHistogramAggregation`](../#explicitbuckethistogramaggregation) | ignored |  | * `boundaries`: ignored<br>* `record_min_max`: ignored<br> |
| [`ExporterDefaultHistogramAggregation`](../#exporterdefaulthistogramaggregation) | ignored |  | * `base2_exponential_bucket_histogram`: ignored<br>* `explicit_bucket_histogram`: ignored<br> |
| [`ExporterTemporalityPreference`](../#exportertemporalitypreference) | supported |  | * `cumulative`: supported<br>* `delta`: supported<br>* `low_memory`: supported<br> |
| [`GrpcTls`](../#grpctls) | ignored |  | * `ca_file`: ignored<br>* `cert_file`: ignored<br>* `insecure`: ignored<br>* `key_file`: ignored<br> |
| [`HttpTls`](../#httptls) | ignored |  | * `ca_file`: ignored<br>* `cert_file`: ignored<br>* `key_file`: ignored<br> |
| [`IncludeExclude`](../#includeexclude) | supported |  | * `excluded`: supported<br>* `included`: supported<br> |
| [`InstrumentType`](../#instrumenttype) | supported |  | * `counter`: supported<br>* `gauge`: supported<br>* `histogram`: supported<br>* `observable_counter`: supported<br>* `observable_gauge`: supported<br>* `observable_up_down_counter`: supported<br>* `up_down_counter`: supported<br> |
| [`LastValueAggregation`](../#lastvalueaggregation) | ignored |  |  |
| [`LoggerProvider`](../#loggerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `logger_configurator/development`: supported<br> |
| [`LogRecordExporter`](../#logrecordexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`LogRecordLimits`](../#logrecordlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br> |
| [`LogRecordProcessor`](../#logrecordprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`MeterProvider`](../#meterprovider) | supported |  | * `exemplar_filter`: supported<br>* `readers`: supported<br>* `views`: supported<br>* `meter_configurator/development`: supported<br> |
| [`MetricProducer`](../#metricproducer) | not_implemented |  | * `opencensus`: not_implemented<br> |
| [`MetricReader`](../#metricreader) | supported |  | * `periodic`: supported<br>* `pull`: not_implemented<br> |
| [`NameStringValuePair`](../#namestringvaluepair) | supported |  | * `name`: supported<br>* `value`: supported<br> |
| [`OpenCensusMetricProducer`](../#opencensusmetricproducer) | not_implemented |  |  |
| [`OpenTelemetryConfiguration`](../#opentelemetryconfiguration) | supported |  | * `attribute_limits`: supported<br>* `disabled`: supported<br>* `distribution`: not_implemented<br>* `file_format`: supported<br>* `log_level`: not_implemented<br>* `logger_provider`: supported<br>* `meter_provider`: supported<br>* `propagator`: supported<br>* `resource`: supported<br>* `tracer_provider`: supported<br>* `instrumentation/development`: supported<br> |
| [`OtlpGrpcExporter`](../#otlpgrpcexporter) | supported |  | * `compression`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: ignored<br> |
| [`OtlpGrpcMetricExporter`](../#otlpgrpcmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: not_implemented<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: ignored<br> |
| [`OtlpHttpEncoding`](../#otlphttpencoding) | supported |  | * `json`: supported<br>* `protobuf`: supported<br> |
| [`OtlpHttpExporter`](../#otlphttpexporter) | supported |  | * `compression`: supported<br>* `encoding`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `timeout`: supported<br>* `tls`: ignored<br> |
| [`OtlpHttpMetricExporter`](../#otlphttpmetricexporter) | supported |  | * `compression`: supported<br>* `default_histogram_aggregation`: not_implemented<br>* `encoding`: supported<br>* `endpoint`: supported<br>* `headers`: supported<br>* `headers_list`: supported<br>* `temporality_preference`: supported<br>* `timeout`: supported<br>* `tls`: ignored<br> |
| [`ParentBasedSampler`](../#parentbasedsampler) | supported |  | * `local_parent_not_sampled`: supported<br>* `local_parent_sampled`: supported<br>* `remote_parent_not_sampled`: supported<br>* `remote_parent_sampled`: supported<br>* `root`: supported<br> |
| [`PeriodicMetricReader`](../#periodicmetricreader) | supported |  | * `cardinality_limits`: supported<br>* `exporter`: supported<br>* `interval`: not_implemented<br>* `producers`: not_implemented<br>* `timeout`: supported<br> |
| [`Propagator`](../#propagator) | supported |  | * `composite`: supported<br>* `composite_list`: supported<br> |
| [`PullMetricExporter`](../#pullmetricexporter) | not_implemented |  | * `prometheus/development`: not_implemented<br> |
| [`PullMetricReader`](../#pullmetricreader) | not_implemented |  | * `cardinality_limits`: not_implemented<br>* `exporter`: not_implemented<br>* `producers`: not_implemented<br> |
| [`PushMetricExporter`](../#pushmetricexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`Resource`](../#resource) | supported |  | * `attributes`: supported<br>* `attributes_list`: supported<br>* `schema_url`: supported<br>* `detection/development`: supported<br> |
| [`Sampler`](../#sampler) | supported |  | * `always_off`: supported<br>* `always_on`: supported<br>* `parent_based`: supported<br>* `trace_id_ratio_based`: supported<br>* `composite/development`: not_implemented<br>* `jaeger_remote/development`: not_implemented<br>* `probability/development`: not_implemented<br> |
| [`SeverityNumber`](../#severitynumber) | supported |  | * `debug`: supported<br>* `debug2`: supported<br>* `debug3`: supported<br>* `debug4`: supported<br>* `error`: supported<br>* `error2`: supported<br>* `error3`: supported<br>* `error4`: supported<br>* `fatal`: supported<br>* `fatal2`: supported<br>* `fatal3`: supported<br>* `fatal4`: supported<br>* `info`: supported<br>* `info2`: supported<br>* `info3`: supported<br>* `info4`: supported<br>* `trace`: supported<br>* `trace2`: supported<br>* `trace3`: supported<br>* `trace4`: supported<br>* `warn`: supported<br>* `warn2`: supported<br>* `warn3`: supported<br>* `warn4`: supported<br> |
| [`SimpleLogRecordProcessor`](../#simplelogrecordprocessor) | supported |  | * `exporter`: supported<br> |
| [`SimpleSpanProcessor`](../#simplespanprocessor) | supported |  | * `exporter`: supported<br> |
| [`SpanExporter`](../#spanexporter) | supported |  | * `console`: supported<br>* `otlp_grpc`: supported<br>* `otlp_http`: supported<br>* `otlp_file/development`: supported<br> |
| [`SpanKind`](../#spankind) | not_implemented |  | * `client`: not_implemented<br>* `consumer`: not_implemented<br>* `internal`: not_implemented<br>* `producer`: not_implemented<br>* `server`: not_implemented<br> |
| [`SpanLimits`](../#spanlimits) | supported |  | * `attribute_count_limit`: supported<br>* `attribute_value_length_limit`: supported<br>* `event_attribute_count_limit`: supported<br>* `event_count_limit`: supported<br>* `link_attribute_count_limit`: supported<br>* `link_count_limit`: supported<br> |
| [`SpanProcessor`](../#spanprocessor) | supported |  | * `batch`: supported<br>* `simple`: supported<br> |
| [`SumAggregation`](../#sumaggregation) | ignored |  |  |
| [`TextMapPropagator`](../#textmappropagator) | supported |  | * `b3`: supported<br>* `b3multi`: supported<br>* `baggage`: supported<br>* `tracecontext`: supported<br> |
| [`TraceContextPropagator`](../#tracecontextpropagator) | supported |  |  |
| [`TraceIdRatioBasedSampler`](../#traceidratiobasedsampler) | supported |  | * `ratio`: supported<br> |
| [`TracerProvider`](../#tracerprovider) | supported |  | * `limits`: supported<br>* `processors`: supported<br>* `sampler`: supported<br>* `tracer_configurator/development`: supported<br> |
| [`View`](../#view) | supported |  | * `selector`: supported<br>* `stream`: supported<br> |
| [`ViewSelector`](../#viewselector) | supported |  | * `instrument_name`: supported<br>* `instrument_type`: supported<br>* `meter_name`: supported<br>* `meter_schema_url`: supported<br>* `meter_version`: supported<br>* `unit`: not_implemented<br> |
| [`ViewStream`](../#viewstream) | supported | `attribute_keys.excluded` is not implemented, only `attribute_keys.included` is supported. | * `aggregation`: ignored<br>* `aggregation_cardinality_limit`: not_implemented<br>* `attribute_keys`: supported<br>* `description`: supported<br>* `name`: supported<br> |
| [`ExperimentalCodeInstrumentation`](../#experimentalcodeinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../#experimentalcomposablealwaysoffsampler) | not_implemented |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../#experimentalcomposablealwaysonsampler) | not_implemented |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../#experimentalcomposableparentthresholdsampler) | not_implemented |  | * `root`: not_implemented<br> |
| [`ExperimentalComposableProbabilitySampler`](../#experimentalcomposableprobabilitysampler) | not_implemented |  | * `ratio`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSampler`](../#experimentalcomposablerulebasedsampler) | not_implemented |  | * `rules`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../#experimentalcomposablerulebasedsamplerrule) | not_implemented |  | * `attribute_patterns`: not_implemented<br>* `attribute_values`: not_implemented<br>* `parent`: not_implemented<br>* `sampler`: not_implemented<br>* `span_kinds`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../#experimentalcomposablerulebasedsamplerruleattributepatterns) | not_implemented |  | * `excluded`: not_implemented<br>* `included`: not_implemented<br>* `key`: not_implemented<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../#experimentalcomposablerulebasedsamplerruleattributevalues) | not_implemented |  | * `key`: not_implemented<br>* `values`: not_implemented<br> |
| [`ExperimentalComposableSampler`](../#experimentalcomposablesampler) | not_implemented |  | * `always_off`: not_implemented<br>* `always_on`: not_implemented<br>* `parent_threshold`: not_implemented<br>* `probability`: not_implemented<br>* `rule_based`: not_implemented<br> |
| [`ExperimentalContainerResourceDetector`](../#experimentalcontainerresourcedetector) | ignored |  |  |
| [`ExperimentalDbInstrumentation`](../#experimentaldbinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGenAiInstrumentation`](../#experimentalgenaiinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalGeneralInstrumentation`](../#experimentalgeneralinstrumentation) | supported |  | * `code`: supported<br>* `db`: supported<br>* `gen_ai`: supported<br>* `http`: supported<br>* `messaging`: supported<br>* `rpc`: supported<br>* `sanitization`: supported<br>* `stability_opt_in_list`: supported<br> |
| [`ExperimentalHostResourceDetector`](../#experimentalhostresourcedetector) | supported |  |  |
| [`ExperimentalHttpClientInstrumentation`](../#experimentalhttpclientinstrumentation) | supported |  | * `known_methods`: supported<br>* `request_captured_headers`: supported<br>* `response_captured_headers`: supported<br> |
| [`ExperimentalHttpInstrumentation`](../#experimentalhttpinstrumentation) | supported |  | * `client`: supported<br>* `semconv`: supported<br>* `server`: supported<br> |
| [`ExperimentalHttpServerInstrumentation`](../#experimentalhttpserverinstrumentation) | supported |  | * `known_methods`: supported<br>* `request_captured_headers`: supported<br>* `response_captured_headers`: supported<br> |
| [`ExperimentalInstrumentation`](../#experimentalinstrumentation) | supported |  | * `cpp`: not_applicable<br>* `dotnet`: not_applicable<br>* `erlang`: not_applicable<br>* `general`: supported<br>* `go`: not_applicable<br>* `java`: not_applicable<br>* `js`: not_applicable<br>* `php`: supported<br>* `python`: not_applicable<br>* `ruby`: not_applicable<br>* `rust`: not_applicable<br>* `swift`: not_applicable<br> |
| [`ExperimentalJaegerRemoteSampler`](../#experimentaljaegerremotesampler) | not_implemented |  | * `endpoint`: not_implemented<br>* `initial_sampler`: not_implemented<br>* `interval`: not_implemented<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../#experimentallanguagespecificinstrumentation) | supported |  |  |
| [`ExperimentalLoggerConfig`](../#experimentalloggerconfig) | supported |  | * `enabled`: supported<br>* `minimum_severity`: not_implemented<br>* `trace_based`: not_implemented<br> |
| [`ExperimentalLoggerConfigurator`](../#experimentalloggerconfigurator) | supported |  | * `default_config`: supported<br>* `loggers`: supported<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../#experimentalloggermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalMessagingInstrumentation`](../#experimentalmessaginginstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalMeterConfig`](../#experimentalmeterconfig) | supported |  | * `enabled`: supported<br> |
| [`ExperimentalMeterConfigurator`](../#experimentalmeterconfigurator) | supported |  | * `default_config`: supported<br>* `meters`: supported<br> |
| [`ExperimentalMeterMatcherAndConfig`](../#experimentalmetermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalOtlpFileExporter`](../#experimentalotlpfileexporter) | supported |  | * `output_stream`: supported<br> |
| [`ExperimentalOtlpFileMetricExporter`](../#experimentalotlpfilemetricexporter) | supported |  | * `default_histogram_aggregation`: not_implemented<br>* `output_stream`: supported<br>* `temporality_preference`: supported<br> |
| [`ExperimentalProbabilitySampler`](../#experimentalprobabilitysampler) | not_implemented |  | * `ratio`: not_implemented<br> |
| [`ExperimentalProcessResourceDetector`](../#experimentalprocessresourcedetector) | supported |  |  |
| [`ExperimentalPrometheusMetricExporter`](../#experimentalprometheusmetricexporter) | not_implemented |  | * `host`: not_implemented<br>* `port`: not_implemented<br>* `translation_strategy`: not_implemented<br>* `with_resource_constant_labels`: not_implemented<br>* `without_scope_info`: not_implemented<br>* `without_target_info/development`: not_implemented<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../#experimentalprometheustranslationstrategy) | not_implemented |  | * `no_translation/development`: not_implemented<br>* `no_utf8_escaping_with_suffixes/development`: not_implemented<br>* `underscore_escaping_with_suffixes`: not_implemented<br>* `underscore_escaping_without_suffixes/development`: not_implemented<br> |
| [`ExperimentalResourceDetection`](../#experimentalresourcedetection) | supported |  | * `attributes`: supported<br>* `detectors`: supported<br> |
| [`ExperimentalResourceDetector`](../#experimentalresourcedetector) | supported |  | * `container`: ignored<br>* `host`: supported<br>* `process`: supported<br>* `service`: supported<br> |
| [`ExperimentalRpcInstrumentation`](../#experimentalrpcinstrumentation) | unknown |  | * `semconv`: unknown<br> |
| [`ExperimentalSanitization`](../#experimentalsanitization) | unknown |  | * `url`: unknown<br> |
| [`ExperimentalSemconvConfig`](../#experimentalsemconvconfig) | unknown |  | * `dual_emit`: unknown<br>* `experimental`: unknown<br>* `version`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../#experimentalserviceresourcedetector) | supported |  |  |
| [`ExperimentalSpanParent`](../#experimentalspanparent) | not_implemented |  | * `local`: not_implemented<br>* `none`: not_implemented<br>* `remote`: not_implemented<br> |
| [`ExperimentalTracerConfig`](../#experimentaltracerconfig) | supported |  | * `enabled`: supported<br> |
| [`ExperimentalTracerConfigurator`](../#experimentaltracerconfigurator) | supported |  | * `default_config`: supported<br>* `tracers`: supported<br> |
| [`ExperimentalTracerMatcherAndConfig`](../#experimentaltracermatcherandconfig) | supported |  | * `config`: supported<br>* `name`: supported<br> |
| [`ExperimentalUrlSanitization`](../#experimentalurlsanitization) | unknown |  | * `sensitive_query_parameters`: unknown<br> |

</div>

<!-- END GENERATED: language-implementation-status SOURCE: opentelemetry-configuration -->
