---
title: Language Implementation Status
linkTitle: Language Implementation Status
weight: 10
aliases: [general-sdk-configuration]
notoc: true
---

## Language Implementation Status

<!-- BEGIN GENERATED: language-implementation-status SOURCE: opentelemetry-configuration -->
{{< sdk-lang-status-accordion >}}

<div class="language-implementation-status-content" style="display: none;">

### cpp {#cpp}

Latest supported file format: `1.0.0-rc.2`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../types#aggregation) | supported |  | • `base2_exponential_bucket_histogram`: supported<br>• `default`: supported<br>• `drop`: supported<br>• `explicit_bucket_histogram`: supported<br>• `last_value`: supported<br>• `sum`: supported<br> |
| [`AlwaysOffSampler`](../types#alwaysoffsampler) | supported |  |  |
| [`AlwaysOnSampler`](../types#alwaysonsampler) | supported |  |  |
| [`AttributeLimits`](../types#attributelimits) | supported |  | • `attribute_count_limit`: supported<br>• `attribute_value_length_limit`: supported<br> |
| [`AttributeNameValue`](../types#attributenamevalue) | supported |  | • `name`: supported<br>• `type`: supported<br>• `value`: supported<br> |
| [`AttributeType`](../types#attributetype) | supported |  | • `bool`: supported<br>• `bool_array`: supported<br>• `double`: supported<br>• `double_array`: supported<br>• `int`: supported<br>• `int_array`: supported<br>• `string`: supported<br>• `string_array`: supported<br> |
| [`B3MultiPropagator`](../types#b3multipropagator) | supported |  |  |
| [`B3Propagator`](../types#b3propagator) | supported |  |  |
| [`BaggagePropagator`](../types#baggagepropagator) | supported |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../types#base2exponentialbuckethistogramaggregation) | supported |  | • `max_scale`: supported<br>• `max_size`: supported<br>• `record_min_max`: supported<br> |
| [`BatchLogRecordProcessor`](../types#batchlogrecordprocessor) | supported |  | • `export_timeout`: supported<br>• `exporter`: supported<br>• `max_export_batch_size`: supported<br>• `max_queue_size`: supported<br>• `schedule_delay`: supported<br> |
| [`BatchSpanProcessor`](../types#batchspanprocessor) | supported |  | • `export_timeout`: supported<br>• `exporter`: supported<br>• `max_export_batch_size`: supported<br>• `max_queue_size`: supported<br>• `schedule_delay`: supported<br> |
| [`CardinalityLimits`](../types#cardinalitylimits) | not_implemented |  | • `counter`: not_implemented<br>• `default`: not_implemented<br>• `gauge`: not_implemented<br>• `histogram`: not_implemented<br>• `observable_counter`: not_implemented<br>• `observable_gauge`: not_implemented<br>• `observable_up_down_counter`: not_implemented<br>• `up_down_counter`: not_implemented<br> |
| [`ConsoleExporter`](../types#consoleexporter) | supported |  |  |
| [`ConsoleMetricExporter`](../types#consolemetricexporter) | supported |  | • `default_histogram_aggregation`: supported<br>• `temporality_preference`: supported<br> |
| [`DefaultAggregation`](../types#defaultaggregation) | supported |  |  |
| [`Distribution`](../types#distribution) | unknown |  |  |
| [`DropAggregation`](../types#dropaggregation) | supported |  |  |
| [`ExemplarFilter`](../types#exemplarfilter) | not_implemented |  | • `always_off`: not_implemented<br>• `always_on`: not_implemented<br>• `trace_based`: not_implemented<br> |
| [`ExplicitBucketHistogramAggregation`](../types#explicitbuckethistogramaggregation) | supported |  | • `boundaries`: supported<br>• `record_min_max`: supported<br> |
| [`ExporterDefaultHistogramAggregation`](../types#exporterdefaulthistogramaggregation) | supported |  | • `base2_exponential_bucket_histogram`: supported<br>• `explicit_bucket_histogram`: supported<br> |
| [`ExporterTemporalityPreference`](../types#exportertemporalitypreference) | supported |  | • `cumulative`: supported<br>• `delta`: supported<br>• `low_memory`: supported<br> |
| [`GrpcTls`](../types#grpctls) | unknown |  | • `ca_file`: unknown<br>• `cert_file`: unknown<br>• `insecure`: unknown<br>• `key_file`: unknown<br> |
| [`HttpTls`](../types#httptls) | unknown |  | • `ca_file`: unknown<br>• `cert_file`: unknown<br>• `key_file`: unknown<br> |
| [`IncludeExclude`](../types#includeexclude) | supported |  | • `excluded`: supported<br>• `included`: supported<br> |
| [`InstrumentType`](../types#instrumenttype) | supported |  | • `counter`: supported<br>• `gauge`: supported<br>• `histogram`: supported<br>• `observable_counter`: supported<br>• `observable_gauge`: supported<br>• `observable_up_down_counter`: supported<br>• `up_down_counter`: supported<br> |
| [`JaegerPropagator`](../types#jaegerpropagator) | supported |  |  |
| [`LastValueAggregation`](../types#lastvalueaggregation) | supported |  |  |
| [`LoggerProvider`](../types#loggerprovider) | supported |  | • `limits`: supported<br>• `processors`: supported<br>• `logger_configurator/development`: supported<br> |
| [`LogRecordExporter`](../types#logrecordexporter) | supported |  | • `console`: supported<br>• `otlp_grpc`: supported<br>• `otlp_http`: supported<br>• `otlp_file/development`: supported<br> |
| [`LogRecordLimits`](../types#logrecordlimits) | supported |  | • `attribute_count_limit`: supported<br>• `attribute_value_length_limit`: supported<br> |
| [`LogRecordProcessor`](../types#logrecordprocessor) | supported |  | • `batch`: supported<br>• `simple`: supported<br> |
| [`MeterProvider`](../types#meterprovider) | supported |  | • `exemplar_filter`: supported<br>• `readers`: supported<br>• `views`: supported<br>• `meter_configurator/development`: supported<br> |
| [`MetricProducer`](../types#metricproducer) | supported |  | • `opencensus`: supported<br> |
| [`MetricReader`](../types#metricreader) | supported |  | • `periodic`: supported<br>• `pull`: supported<br> |
| [`NameStringValuePair`](../types#namestringvaluepair) | supported |  | • `name`: supported<br>• `value`: supported<br> |
| [`OpenCensusMetricProducer`](../types#opencensusmetricproducer) | supported |  |  |
| [`OpenTelemetryConfiguration`](../types#opentelemetryconfiguration) | supported |  | • `attribute_limits`: supported<br>• `disabled`: supported<br>• `distribution`: supported<br>• `file_format`: supported<br>• `log_level`: supported<br>• `logger_provider`: supported<br>• `meter_provider`: supported<br>• `propagator`: supported<br>• `resource`: supported<br>• `tracer_provider`: supported<br>• `instrumentation/development`: supported<br> |
| [`OpenTracingPropagator`](../types#opentracingpropagator) | not_implemented |  |  |
| [`OtlpGrpcExporter`](../types#otlpgrpcexporter) | supported |  | • `compression`: supported<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `timeout`: supported<br>• `tls`: supported<br> |
| [`OtlpGrpcMetricExporter`](../types#otlpgrpcmetricexporter) | supported |  | • `compression`: supported<br>• `default_histogram_aggregation`: supported<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `temporality_preference`: supported<br>• `timeout`: supported<br>• `tls`: supported<br> |
| [`OtlpHttpEncoding`](../types#otlphttpencoding) | supported |  | • `json`: supported<br>• `protobuf`: supported<br> |
| [`OtlpHttpExporter`](../types#otlphttpexporter) | supported |  | • `compression`: supported<br>• `encoding`: supported<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `timeout`: supported<br>• `tls`: supported<br> |
| [`OtlpHttpMetricExporter`](../types#otlphttpmetricexporter) | supported |  | • `compression`: supported<br>• `default_histogram_aggregation`: supported<br>• `encoding`: supported<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `temporality_preference`: supported<br>• `timeout`: supported<br>• `tls`: supported<br> |
| [`ParentBasedSampler`](../types#parentbasedsampler) | supported |  | • `local_parent_not_sampled`: supported<br>• `local_parent_sampled`: supported<br>• `remote_parent_not_sampled`: supported<br>• `remote_parent_sampled`: supported<br>• `root`: supported<br> |
| [`PeriodicMetricReader`](../types#periodicmetricreader) | supported |  | • `cardinality_limits`: supported<br>• `exporter`: supported<br>• `interval`: supported<br>• `producers`: supported<br>• `timeout`: supported<br> |
| [`Propagator`](../types#propagator) | supported |  | • `composite`: supported<br>• `composite_list`: supported<br> |
| [`PullMetricExporter`](../types#pullmetricexporter) | supported |  | • `prometheus/development`: supported<br> |
| [`PullMetricReader`](../types#pullmetricreader) | supported |  | • `cardinality_limits`: supported<br>• `exporter`: supported<br>• `producers`: supported<br> |
| [`PushMetricExporter`](../types#pushmetricexporter) | supported |  | • `console`: supported<br>• `otlp_grpc`: supported<br>• `otlp_http`: supported<br>• `otlp_file/development`: supported<br> |
| [`Resource`](../types#resource) | supported |  | • `attributes`: supported<br>• `attributes_list`: supported<br>• `schema_url`: supported<br>• `detection/development`: supported<br> |
| [`Sampler`](../types#sampler) | supported |  | • `always_off`: supported<br>• `always_on`: supported<br>• `parent_based`: supported<br>• `trace_id_ratio_based`: supported<br>• `composite/development`: supported<br>• `jaeger_remote/development`: supported<br>• `probability/development`: supported<br> |
| [`SeverityNumber`](../types#severitynumber) | unknown |  | • `debug`: unknown<br>• `debug2`: unknown<br>• `debug3`: unknown<br>• `debug4`: unknown<br>• `error`: unknown<br>• `error2`: unknown<br>• `error3`: unknown<br>• `error4`: unknown<br>• `fatal`: unknown<br>• `fatal2`: unknown<br>• `fatal3`: unknown<br>• `fatal4`: unknown<br>• `info`: unknown<br>• `info2`: unknown<br>• `info3`: unknown<br>• `info4`: unknown<br>• `trace`: unknown<br>• `trace2`: unknown<br>• `trace3`: unknown<br>• `trace4`: unknown<br>• `warn`: unknown<br>• `warn2`: unknown<br>• `warn3`: unknown<br>• `warn4`: unknown<br> |
| [`SimpleLogRecordProcessor`](../types#simplelogrecordprocessor) | supported |  | • `exporter`: supported<br> |
| [`SimpleSpanProcessor`](../types#simplespanprocessor) | supported |  | • `exporter`: supported<br> |
| [`SpanExporter`](../types#spanexporter) | supported |  | • `console`: supported<br>• `otlp_grpc`: supported<br>• `otlp_http`: supported<br>• `otlp_file/development`: supported<br> |
| [`SpanKind`](../types#spankind) | unknown |  | • `client`: unknown<br>• `consumer`: unknown<br>• `internal`: unknown<br>• `producer`: unknown<br>• `server`: unknown<br> |
| [`SpanLimits`](../types#spanlimits) | supported |  | • `attribute_count_limit`: supported<br>• `attribute_value_length_limit`: supported<br>• `event_attribute_count_limit`: supported<br>• `event_count_limit`: supported<br>• `link_attribute_count_limit`: supported<br>• `link_count_limit`: supported<br> |
| [`SpanProcessor`](../types#spanprocessor) | supported |  | • `batch`: supported<br>• `simple`: supported<br> |
| [`SumAggregation`](../types#sumaggregation) | supported |  |  |
| [`TextMapPropagator`](../types#textmappropagator) | supported |  | • `b3`: supported<br>• `b3multi`: supported<br>• `baggage`: supported<br>• `jaeger`: supported<br>• `ottrace`: supported<br>• `tracecontext`: supported<br> |
| [`TraceContextPropagator`](../types#tracecontextpropagator) | supported |  |  |
| [`TraceIdRatioBasedSampler`](../types#traceidratiobasedsampler) | supported |  | • `ratio`: supported<br> |
| [`TracerProvider`](../types#tracerprovider) | supported |  | • `limits`: supported<br>• `processors`: supported<br>• `sampler`: supported<br>• `tracer_configurator/development`: supported<br> |
| [`View`](../types#view) | supported |  | • `selector`: supported<br>• `stream`: supported<br> |
| [`ViewSelector`](../types#viewselector) | supported |  | • `instrument_name`: supported<br>• `instrument_type`: supported<br>• `meter_name`: supported<br>• `meter_schema_url`: supported<br>• `meter_version`: supported<br>• `unit`: supported<br> |
| [`ViewStream`](../types#viewstream) | supported |  | • `aggregation`: supported<br>• `aggregation_cardinality_limit`: supported<br>• `attribute_keys`: supported<br>• `description`: supported<br>• `name`: supported<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../types#experimentalcomposablealwaysoffsampler) | unknown |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../types#experimentalcomposablealwaysonsampler) | unknown |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../types#experimentalcomposableparentthresholdsampler) | unknown |  | • `root`: unknown<br> |
| [`ExperimentalComposableProbabilitySampler`](../types#experimentalcomposableprobabilitysampler) | unknown |  | • `ratio`: unknown<br> |
| [`ExperimentalComposableRuleBasedSampler`](../types#experimentalcomposablerulebasedsampler) | unknown |  | • `rules`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../types#experimentalcomposablerulebasedsamplerrule) | unknown |  | • `attribute_patterns`: unknown<br>• `attribute_values`: unknown<br>• `parent`: unknown<br>• `sampler`: unknown<br>• `span_kinds`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../types#experimentalcomposablerulebasedsamplerruleattributepatterns) | unknown |  | • `excluded`: unknown<br>• `included`: unknown<br>• `key`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../types#experimentalcomposablerulebasedsamplerruleattributevalues) | unknown |  | • `key`: unknown<br>• `values`: unknown<br> |
| [`ExperimentalComposableSampler`](../types#experimentalcomposablesampler) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `parent_threshold`: unknown<br>• `probability`: unknown<br>• `rule_based`: unknown<br> |
| [`ExperimentalContainerResourceDetector`](../types#experimentalcontainerresourcedetector) | not_implemented |  |  |
| [`ExperimentalGeneralInstrumentation`](../types#experimentalgeneralinstrumentation) | not_applicable |  | • `http`: not_applicable<br>• `peer`: not_applicable<br> |
| [`ExperimentalHostResourceDetector`](../types#experimentalhostresourcedetector) | not_implemented |  |  |
| [`ExperimentalHttpClientInstrumentation`](../types#experimentalhttpclientinstrumentation) | not_applicable |  | • `request_captured_headers`: not_applicable<br>• `response_captured_headers`: not_applicable<br> |
| [`ExperimentalHttpInstrumentation`](../types#experimentalhttpinstrumentation) | not_applicable |  | • `client`: not_applicable<br>• `server`: not_applicable<br> |
| [`ExperimentalHttpServerInstrumentation`](../types#experimentalhttpserverinstrumentation) | not_applicable |  | • `request_captured_headers`: not_applicable<br>• `response_captured_headers`: not_applicable<br> |
| [`ExperimentalInstrumentation`](../types#experimentalinstrumentation) | not_applicable |  | • `cpp`: not_applicable<br>• `dotnet`: not_applicable<br>• `erlang`: not_applicable<br>• `general`: not_applicable<br>• `go`: not_applicable<br>• `java`: not_applicable<br>• `js`: not_applicable<br>• `php`: not_applicable<br>• `python`: not_applicable<br>• `ruby`: not_applicable<br>• `rust`: not_applicable<br>• `swift`: not_applicable<br> |
| [`ExperimentalJaegerRemoteSampler`](../types#experimentaljaegerremotesampler) | not_implemented |  | • `endpoint`: not_implemented<br>• `initial_sampler`: not_implemented<br>• `interval`: not_implemented<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../types#experimentallanguagespecificinstrumentation) | not_applicable |  |  |
| [`ExperimentalLoggerConfig`](../types#experimentalloggerconfig) | not_implemented |  | • `disabled`: not_implemented<br>• `minimum_severity`: not_implemented<br>• `trace_based`: not_implemented<br> |
| [`ExperimentalLoggerConfigurator`](../types#experimentalloggerconfigurator) | not_implemented |  | • `default_config`: not_implemented<br>• `loggers`: not_implemented<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../types#experimentalloggermatcherandconfig) | not_implemented |  | • `config`: not_implemented<br>• `name`: not_implemented<br> |
| [`ExperimentalMeterConfig`](../types#experimentalmeterconfig) | not_implemented |  | • `disabled`: not_implemented<br> |
| [`ExperimentalMeterConfigurator`](../types#experimentalmeterconfigurator) | not_implemented |  | • `default_config`: not_implemented<br>• `meters`: not_implemented<br> |
| [`ExperimentalMeterMatcherAndConfig`](../types#experimentalmetermatcherandconfig) | not_implemented |  | • `config`: not_implemented<br>• `name`: not_implemented<br> |
| [`ExperimentalOtlpFileExporter`](../types#experimentalotlpfileexporter) | supported |  | • `output_stream`: supported<br> |
| [`ExperimentalOtlpFileMetricExporter`](../types#experimentalotlpfilemetricexporter) | supported |  | • `default_histogram_aggregation`: supported<br>• `output_stream`: supported<br>• `temporality_preference`: supported<br> |
| [`ExperimentalPeerInstrumentation`](../types#experimentalpeerinstrumentation) | not_implemented |  | • `service_mapping`: not_implemented<br> |
| [`ExperimentalPeerServiceMapping`](../types#experimentalpeerservicemapping) | not_implemented |  | • `peer`: not_implemented<br>• `service`: not_implemented<br> |
| [`ExperimentalProbabilitySampler`](../types#experimentalprobabilitysampler) | not_implemented |  | • `ratio`: not_implemented<br> |
| [`ExperimentalProcessResourceDetector`](../types#experimentalprocessresourcedetector) | not_implemented |  |  |
| [`ExperimentalPrometheusMetricExporter`](../types#experimentalprometheusmetricexporter) | supported |  | • `host`: supported<br>• `port`: supported<br>• `translation_strategy`: supported<br>• `with_resource_constant_labels`: supported<br>• `without_scope_info`: unknown<br>• `without_target_info`: unknown<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../types#experimentalprometheustranslationstrategy) | unknown |  | • `no_translation`: unknown<br>• `no_utf8_escaping_with_suffixes`: unknown<br>• `underscore_escaping_with_suffixes`: unknown<br>• `underscore_escaping_without_suffixes`: unknown<br> |
| [`ExperimentalResourceDetection`](../types#experimentalresourcedetection) | not_implemented |  | • `attributes`: not_implemented<br>• `detectors`: not_implemented<br> |
| [`ExperimentalResourceDetector`](../types#experimentalresourcedetector) | not_implemented |  | • `container`: not_implemented<br>• `host`: not_implemented<br>• `process`: not_implemented<br>• `service`: not_implemented<br> |
| [`ExperimentalServiceResourceDetector`](../types#experimentalserviceresourcedetector) | not_implemented |  |  |
| [`ExperimentalSpanParent`](../types#experimentalspanparent) | unknown |  | • `local`: unknown<br>• `none`: unknown<br>• `remote`: unknown<br> |
| [`ExperimentalTracerConfig`](../types#experimentaltracerconfig) | not_implemented |  | • `disabled`: not_implemented<br> |
| [`ExperimentalTracerConfigurator`](../types#experimentaltracerconfigurator) | not_implemented |  | • `default_config`: not_implemented<br>• `tracers`: not_implemented<br> |
| [`ExperimentalTracerMatcherAndConfig`](../types#experimentaltracermatcherandconfig) | not_implemented |  | • `config`: not_implemented<br>• `name`: not_implemented<br> |

### go {#go}

Latest supported file format: `0.3.0`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../types#aggregation) | unknown |  | • `base2_exponential_bucket_histogram`: unknown<br>• `default`: unknown<br>• `drop`: unknown<br>• `explicit_bucket_histogram`: unknown<br>• `last_value`: unknown<br>• `sum`: unknown<br> |
| [`AlwaysOffSampler`](../types#alwaysoffsampler) | unknown |  |  |
| [`AlwaysOnSampler`](../types#alwaysonsampler) | unknown |  |  |
| [`AttributeLimits`](../types#attributelimits) | unknown |  | • `attribute_count_limit`: unknown<br>• `attribute_value_length_limit`: unknown<br> |
| [`AttributeNameValue`](../types#attributenamevalue) | unknown |  | • `name`: unknown<br>• `type`: unknown<br>• `value`: unknown<br> |
| [`AttributeType`](../types#attributetype) | unknown |  | • `bool`: unknown<br>• `bool_array`: unknown<br>• `double`: unknown<br>• `double_array`: unknown<br>• `int`: unknown<br>• `int_array`: unknown<br>• `string`: unknown<br>• `string_array`: unknown<br> |
| [`B3MultiPropagator`](../types#b3multipropagator) | unknown |  |  |
| [`B3Propagator`](../types#b3propagator) | unknown |  |  |
| [`BaggagePropagator`](../types#baggagepropagator) | unknown |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../types#base2exponentialbuckethistogramaggregation) | unknown |  | • `max_scale`: unknown<br>• `max_size`: unknown<br>• `record_min_max`: unknown<br> |
| [`BatchLogRecordProcessor`](../types#batchlogrecordprocessor) | unknown |  | • `export_timeout`: unknown<br>• `exporter`: unknown<br>• `max_export_batch_size`: unknown<br>• `max_queue_size`: unknown<br>• `schedule_delay`: unknown<br> |
| [`BatchSpanProcessor`](../types#batchspanprocessor) | unknown |  | • `export_timeout`: unknown<br>• `exporter`: unknown<br>• `max_export_batch_size`: unknown<br>• `max_queue_size`: unknown<br>• `schedule_delay`: unknown<br> |
| [`CardinalityLimits`](../types#cardinalitylimits) | unknown |  | • `counter`: unknown<br>• `default`: unknown<br>• `gauge`: unknown<br>• `histogram`: unknown<br>• `observable_counter`: unknown<br>• `observable_gauge`: unknown<br>• `observable_up_down_counter`: unknown<br>• `up_down_counter`: unknown<br> |
| [`ConsoleExporter`](../types#consoleexporter) | unknown |  |  |
| [`ConsoleMetricExporter`](../types#consolemetricexporter) | unknown |  | • `default_histogram_aggregation`: unknown<br>• `temporality_preference`: unknown<br> |
| [`DefaultAggregation`](../types#defaultaggregation) | unknown |  |  |
| [`Distribution`](../types#distribution) | unknown |  |  |
| [`DropAggregation`](../types#dropaggregation) | unknown |  |  |
| [`ExemplarFilter`](../types#exemplarfilter) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `trace_based`: unknown<br> |
| [`ExplicitBucketHistogramAggregation`](../types#explicitbuckethistogramaggregation) | unknown |  | • `boundaries`: unknown<br>• `record_min_max`: unknown<br> |
| [`ExporterDefaultHistogramAggregation`](../types#exporterdefaulthistogramaggregation) | unknown |  | • `base2_exponential_bucket_histogram`: unknown<br>• `explicit_bucket_histogram`: unknown<br> |
| [`ExporterTemporalityPreference`](../types#exportertemporalitypreference) | unknown |  | • `cumulative`: unknown<br>• `delta`: unknown<br>• `low_memory`: unknown<br> |
| [`GrpcTls`](../types#grpctls) | unknown |  | • `ca_file`: unknown<br>• `cert_file`: unknown<br>• `insecure`: unknown<br>• `key_file`: unknown<br> |
| [`HttpTls`](../types#httptls) | unknown |  | • `ca_file`: unknown<br>• `cert_file`: unknown<br>• `key_file`: unknown<br> |
| [`IncludeExclude`](../types#includeexclude) | unknown |  | • `excluded`: unknown<br>• `included`: unknown<br> |
| [`InstrumentType`](../types#instrumenttype) | unknown |  | • `counter`: unknown<br>• `gauge`: unknown<br>• `histogram`: unknown<br>• `observable_counter`: unknown<br>• `observable_gauge`: unknown<br>• `observable_up_down_counter`: unknown<br>• `up_down_counter`: unknown<br> |
| [`JaegerPropagator`](../types#jaegerpropagator) | unknown |  |  |
| [`LastValueAggregation`](../types#lastvalueaggregation) | unknown |  |  |
| [`LoggerProvider`](../types#loggerprovider) | unknown |  | • `limits`: unknown<br>• `processors`: unknown<br>• `logger_configurator/development`: unknown<br> |
| [`LogRecordExporter`](../types#logrecordexporter) | unknown |  | • `console`: unknown<br>• `otlp_grpc`: unknown<br>• `otlp_http`: unknown<br>• `otlp_file/development`: unknown<br> |
| [`LogRecordLimits`](../types#logrecordlimits) | unknown |  | • `attribute_count_limit`: unknown<br>• `attribute_value_length_limit`: unknown<br> |
| [`LogRecordProcessor`](../types#logrecordprocessor) | unknown |  | • `batch`: unknown<br>• `simple`: unknown<br> |
| [`MeterProvider`](../types#meterprovider) | unknown |  | • `exemplar_filter`: unknown<br>• `readers`: unknown<br>• `views`: unknown<br>• `meter_configurator/development`: unknown<br> |
| [`MetricProducer`](../types#metricproducer) | unknown |  | • `opencensus`: unknown<br> |
| [`MetricReader`](../types#metricreader) | unknown |  | • `periodic`: unknown<br>• `pull`: unknown<br> |
| [`NameStringValuePair`](../types#namestringvaluepair) | unknown |  | • `name`: unknown<br>• `value`: unknown<br> |
| [`OpenCensusMetricProducer`](../types#opencensusmetricproducer) | unknown |  |  |
| [`OpenTelemetryConfiguration`](../types#opentelemetryconfiguration) | unknown |  | • `attribute_limits`: unknown<br>• `disabled`: unknown<br>• `distribution`: unknown<br>• `file_format`: unknown<br>• `log_level`: unknown<br>• `logger_provider`: unknown<br>• `meter_provider`: unknown<br>• `propagator`: unknown<br>• `resource`: unknown<br>• `tracer_provider`: unknown<br>• `instrumentation/development`: unknown<br> |
| [`OpenTracingPropagator`](../types#opentracingpropagator) | unknown |  |  |
| [`OtlpGrpcExporter`](../types#otlpgrpcexporter) | unknown |  | • `compression`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`OtlpGrpcMetricExporter`](../types#otlpgrpcmetricexporter) | unknown |  | • `compression`: unknown<br>• `default_histogram_aggregation`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `temporality_preference`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`OtlpHttpEncoding`](../types#otlphttpencoding) | unknown |  | • `json`: unknown<br>• `protobuf`: unknown<br> |
| [`OtlpHttpExporter`](../types#otlphttpexporter) | unknown |  | • `compression`: unknown<br>• `encoding`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`OtlpHttpMetricExporter`](../types#otlphttpmetricexporter) | unknown |  | • `compression`: unknown<br>• `default_histogram_aggregation`: unknown<br>• `encoding`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `temporality_preference`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`ParentBasedSampler`](../types#parentbasedsampler) | unknown |  | • `local_parent_not_sampled`: unknown<br>• `local_parent_sampled`: unknown<br>• `remote_parent_not_sampled`: unknown<br>• `remote_parent_sampled`: unknown<br>• `root`: unknown<br> |
| [`PeriodicMetricReader`](../types#periodicmetricreader) | unknown |  | • `cardinality_limits`: unknown<br>• `exporter`: unknown<br>• `interval`: unknown<br>• `producers`: unknown<br>• `timeout`: unknown<br> |
| [`Propagator`](../types#propagator) | unknown |  | • `composite`: unknown<br>• `composite_list`: unknown<br> |
| [`PullMetricExporter`](../types#pullmetricexporter) | unknown |  | • `prometheus/development`: unknown<br> |
| [`PullMetricReader`](../types#pullmetricreader) | unknown |  | • `cardinality_limits`: unknown<br>• `exporter`: unknown<br>• `producers`: unknown<br> |
| [`PushMetricExporter`](../types#pushmetricexporter) | unknown |  | • `console`: unknown<br>• `otlp_grpc`: unknown<br>• `otlp_http`: unknown<br>• `otlp_file/development`: unknown<br> |
| [`Resource`](../types#resource) | unknown |  | • `attributes`: unknown<br>• `attributes_list`: unknown<br>• `schema_url`: unknown<br>• `detection/development`: unknown<br> |
| [`Sampler`](../types#sampler) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `parent_based`: unknown<br>• `trace_id_ratio_based`: unknown<br>• `composite/development`: unknown<br>• `jaeger_remote/development`: unknown<br>• `probability/development`: unknown<br> |
| [`SeverityNumber`](../types#severitynumber) | unknown |  | • `debug`: unknown<br>• `debug2`: unknown<br>• `debug3`: unknown<br>• `debug4`: unknown<br>• `error`: unknown<br>• `error2`: unknown<br>• `error3`: unknown<br>• `error4`: unknown<br>• `fatal`: unknown<br>• `fatal2`: unknown<br>• `fatal3`: unknown<br>• `fatal4`: unknown<br>• `info`: unknown<br>• `info2`: unknown<br>• `info3`: unknown<br>• `info4`: unknown<br>• `trace`: unknown<br>• `trace2`: unknown<br>• `trace3`: unknown<br>• `trace4`: unknown<br>• `warn`: unknown<br>• `warn2`: unknown<br>• `warn3`: unknown<br>• `warn4`: unknown<br> |
| [`SimpleLogRecordProcessor`](../types#simplelogrecordprocessor) | unknown |  | • `exporter`: unknown<br> |
| [`SimpleSpanProcessor`](../types#simplespanprocessor) | unknown |  | • `exporter`: unknown<br> |
| [`SpanExporter`](../types#spanexporter) | unknown |  | • `console`: unknown<br>• `otlp_grpc`: unknown<br>• `otlp_http`: unknown<br>• `otlp_file/development`: unknown<br> |
| [`SpanKind`](../types#spankind) | unknown |  | • `client`: unknown<br>• `consumer`: unknown<br>• `internal`: unknown<br>• `producer`: unknown<br>• `server`: unknown<br> |
| [`SpanLimits`](../types#spanlimits) | unknown |  | • `attribute_count_limit`: unknown<br>• `attribute_value_length_limit`: unknown<br>• `event_attribute_count_limit`: unknown<br>• `event_count_limit`: unknown<br>• `link_attribute_count_limit`: unknown<br>• `link_count_limit`: unknown<br> |
| [`SpanProcessor`](../types#spanprocessor) | unknown |  | • `batch`: unknown<br>• `simple`: unknown<br> |
| [`SumAggregation`](../types#sumaggregation) | unknown |  |  |
| [`TextMapPropagator`](../types#textmappropagator) | unknown |  | • `b3`: unknown<br>• `b3multi`: unknown<br>• `baggage`: unknown<br>• `jaeger`: unknown<br>• `ottrace`: unknown<br>• `tracecontext`: unknown<br> |
| [`TraceContextPropagator`](../types#tracecontextpropagator) | unknown |  |  |
| [`TraceIdRatioBasedSampler`](../types#traceidratiobasedsampler) | unknown |  | • `ratio`: unknown<br> |
| [`TracerProvider`](../types#tracerprovider) | unknown |  | • `limits`: unknown<br>• `processors`: unknown<br>• `sampler`: unknown<br>• `tracer_configurator/development`: unknown<br> |
| [`View`](../types#view) | unknown |  | • `selector`: unknown<br>• `stream`: unknown<br> |
| [`ViewSelector`](../types#viewselector) | unknown |  | • `instrument_name`: unknown<br>• `instrument_type`: unknown<br>• `meter_name`: unknown<br>• `meter_schema_url`: unknown<br>• `meter_version`: unknown<br>• `unit`: unknown<br> |
| [`ViewStream`](../types#viewstream) | unknown |  | • `aggregation`: unknown<br>• `aggregation_cardinality_limit`: unknown<br>• `attribute_keys`: unknown<br>• `description`: unknown<br>• `name`: unknown<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../types#experimentalcomposablealwaysoffsampler) | unknown |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../types#experimentalcomposablealwaysonsampler) | unknown |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../types#experimentalcomposableparentthresholdsampler) | unknown |  | • `root`: unknown<br> |
| [`ExperimentalComposableProbabilitySampler`](../types#experimentalcomposableprobabilitysampler) | unknown |  | • `ratio`: unknown<br> |
| [`ExperimentalComposableRuleBasedSampler`](../types#experimentalcomposablerulebasedsampler) | unknown |  | • `rules`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../types#experimentalcomposablerulebasedsamplerrule) | unknown |  | • `attribute_patterns`: unknown<br>• `attribute_values`: unknown<br>• `parent`: unknown<br>• `sampler`: unknown<br>• `span_kinds`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../types#experimentalcomposablerulebasedsamplerruleattributepatterns) | unknown |  | • `excluded`: unknown<br>• `included`: unknown<br>• `key`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../types#experimentalcomposablerulebasedsamplerruleattributevalues) | unknown |  | • `key`: unknown<br>• `values`: unknown<br> |
| [`ExperimentalComposableSampler`](../types#experimentalcomposablesampler) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `parent_threshold`: unknown<br>• `probability`: unknown<br>• `rule_based`: unknown<br> |
| [`ExperimentalContainerResourceDetector`](../types#experimentalcontainerresourcedetector) | unknown |  |  |
| [`ExperimentalGeneralInstrumentation`](../types#experimentalgeneralinstrumentation) | unknown |  | • `http`: unknown<br>• `peer`: unknown<br> |
| [`ExperimentalHostResourceDetector`](../types#experimentalhostresourcedetector) | unknown |  |  |
| [`ExperimentalHttpClientInstrumentation`](../types#experimentalhttpclientinstrumentation) | unknown |  | • `request_captured_headers`: unknown<br>• `response_captured_headers`: unknown<br> |
| [`ExperimentalHttpInstrumentation`](../types#experimentalhttpinstrumentation) | unknown |  | • `client`: unknown<br>• `server`: unknown<br> |
| [`ExperimentalHttpServerInstrumentation`](../types#experimentalhttpserverinstrumentation) | unknown |  | • `request_captured_headers`: unknown<br>• `response_captured_headers`: unknown<br> |
| [`ExperimentalInstrumentation`](../types#experimentalinstrumentation) | unknown |  | • `cpp`: unknown<br>• `dotnet`: unknown<br>• `erlang`: unknown<br>• `general`: unknown<br>• `go`: unknown<br>• `java`: unknown<br>• `js`: unknown<br>• `php`: unknown<br>• `python`: unknown<br>• `ruby`: unknown<br>• `rust`: unknown<br>• `swift`: unknown<br> |
| [`ExperimentalJaegerRemoteSampler`](../types#experimentaljaegerremotesampler) | unknown |  | • `endpoint`: unknown<br>• `initial_sampler`: unknown<br>• `interval`: unknown<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../types#experimentallanguagespecificinstrumentation) | unknown |  |  |
| [`ExperimentalLoggerConfig`](../types#experimentalloggerconfig) | unknown |  | • `disabled`: unknown<br>• `minimum_severity`: unknown<br>• `trace_based`: unknown<br> |
| [`ExperimentalLoggerConfigurator`](../types#experimentalloggerconfigurator) | unknown |  | • `default_config`: unknown<br>• `loggers`: unknown<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../types#experimentalloggermatcherandconfig) | unknown |  | • `config`: unknown<br>• `name`: unknown<br> |
| [`ExperimentalMeterConfig`](../types#experimentalmeterconfig) | unknown |  | • `disabled`: unknown<br> |
| [`ExperimentalMeterConfigurator`](../types#experimentalmeterconfigurator) | unknown |  | • `default_config`: unknown<br>• `meters`: unknown<br> |
| [`ExperimentalMeterMatcherAndConfig`](../types#experimentalmetermatcherandconfig) | unknown |  | • `config`: unknown<br>• `name`: unknown<br> |
| [`ExperimentalOtlpFileExporter`](../types#experimentalotlpfileexporter) | unknown |  | • `output_stream`: unknown<br> |
| [`ExperimentalOtlpFileMetricExporter`](../types#experimentalotlpfilemetricexporter) | unknown |  | • `default_histogram_aggregation`: unknown<br>• `output_stream`: unknown<br>• `temporality_preference`: unknown<br> |
| [`ExperimentalPeerInstrumentation`](../types#experimentalpeerinstrumentation) | unknown |  | • `service_mapping`: unknown<br> |
| [`ExperimentalPeerServiceMapping`](../types#experimentalpeerservicemapping) | unknown |  | • `peer`: unknown<br>• `service`: unknown<br> |
| [`ExperimentalProbabilitySampler`](../types#experimentalprobabilitysampler) | unknown |  | • `ratio`: unknown<br> |
| [`ExperimentalProcessResourceDetector`](../types#experimentalprocessresourcedetector) | unknown |  |  |
| [`ExperimentalPrometheusMetricExporter`](../types#experimentalprometheusmetricexporter) | unknown |  | • `host`: unknown<br>• `port`: unknown<br>• `translation_strategy`: unknown<br>• `with_resource_constant_labels`: unknown<br>• `without_scope_info`: unknown<br>• `without_target_info`: unknown<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../types#experimentalprometheustranslationstrategy) | unknown |  | • `no_translation`: unknown<br>• `no_utf8_escaping_with_suffixes`: unknown<br>• `underscore_escaping_with_suffixes`: unknown<br>• `underscore_escaping_without_suffixes`: unknown<br> |
| [`ExperimentalResourceDetection`](../types#experimentalresourcedetection) | unknown |  | • `attributes`: unknown<br>• `detectors`: unknown<br> |
| [`ExperimentalResourceDetector`](../types#experimentalresourcedetector) | unknown |  | • `container`: unknown<br>• `host`: unknown<br>• `process`: unknown<br>• `service`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../types#experimentalserviceresourcedetector) | unknown |  |  |
| [`ExperimentalSpanParent`](../types#experimentalspanparent) | unknown |  | • `local`: unknown<br>• `none`: unknown<br>• `remote`: unknown<br> |
| [`ExperimentalTracerConfig`](../types#experimentaltracerconfig) | unknown |  | • `disabled`: unknown<br> |
| [`ExperimentalTracerConfigurator`](../types#experimentaltracerconfigurator) | unknown |  | • `default_config`: unknown<br>• `tracers`: unknown<br> |
| [`ExperimentalTracerMatcherAndConfig`](../types#experimentaltracermatcherandconfig) | unknown |  | • `config`: unknown<br>• `name`: unknown<br> |

### java {#java}

Latest supported file format: `1.0.0-rc.1`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../types#aggregation) | supported |  | • `base2_exponential_bucket_histogram`: supported<br>• `default`: supported<br>• `drop`: supported<br>• `explicit_bucket_histogram`: supported<br>• `last_value`: supported<br>• `sum`: supported<br> |
| [`AlwaysOffSampler`](../types#alwaysoffsampler) | supported |  |  |
| [`AlwaysOnSampler`](../types#alwaysonsampler) | supported |  |  |
| [`AttributeLimits`](../types#attributelimits) | supported |  | • `attribute_count_limit`: supported<br>• `attribute_value_length_limit`: supported<br> |
| [`AttributeNameValue`](../types#attributenamevalue) | supported |  | • `name`: supported<br>• `type`: supported<br>• `value`: supported<br> |
| [`AttributeType`](../types#attributetype) | supported |  | • `bool`: supported<br>• `bool_array`: supported<br>• `double`: supported<br>• `double_array`: supported<br>• `int`: supported<br>• `int_array`: supported<br>• `string`: supported<br>• `string_array`: supported<br> |
| [`B3MultiPropagator`](../types#b3multipropagator) | supported |  |  |
| [`B3Propagator`](../types#b3propagator) | supported |  |  |
| [`BaggagePropagator`](../types#baggagepropagator) | supported |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../types#base2exponentialbuckethistogramaggregation) | supported |  | • `max_scale`: supported<br>• `max_size`: supported<br>• `record_min_max`: not_implemented<br> |
| [`BatchLogRecordProcessor`](../types#batchlogrecordprocessor) | supported |  | • `export_timeout`: supported<br>• `exporter`: supported<br>• `max_export_batch_size`: supported<br>• `max_queue_size`: supported<br>• `schedule_delay`: supported<br> |
| [`BatchSpanProcessor`](../types#batchspanprocessor) | supported |  | • `export_timeout`: supported<br>• `exporter`: supported<br>• `max_export_batch_size`: supported<br>• `max_queue_size`: supported<br>• `schedule_delay`: supported<br> |
| [`CardinalityLimits`](../types#cardinalitylimits) | supported |  | • `counter`: supported<br>• `default`: supported<br>• `gauge`: supported<br>• `histogram`: supported<br>• `observable_counter`: supported<br>• `observable_gauge`: supported<br>• `observable_up_down_counter`: supported<br>• `up_down_counter`: supported<br> |
| [`ConsoleExporter`](../types#consoleexporter) | supported |  |  |
| [`ConsoleMetricExporter`](../types#consolemetricexporter) | supported |  | • `default_histogram_aggregation`: not_implemented<br>• `temporality_preference`: ignored<br> |
| [`DefaultAggregation`](../types#defaultaggregation) | supported |  |  |
| [`Distribution`](../types#distribution) | unknown |  |  |
| [`DropAggregation`](../types#dropaggregation) | supported |  |  |
| [`ExemplarFilter`](../types#exemplarfilter) | supported |  | • `always_off`: supported<br>• `always_on`: supported<br>• `trace_based`: supported<br> |
| [`ExplicitBucketHistogramAggregation`](../types#explicitbuckethistogramaggregation) | supported |  | • `boundaries`: supported<br>• `record_min_max`: not_implemented<br> |
| [`ExporterDefaultHistogramAggregation`](../types#exporterdefaulthistogramaggregation) | supported |  | • `base2_exponential_bucket_histogram`: supported<br>• `explicit_bucket_histogram`: supported<br> |
| [`ExporterTemporalityPreference`](../types#exportertemporalitypreference) | supported |  | • `cumulative`: supported<br>• `delta`: supported<br>• `low_memory`: supported<br> |
| [`GrpcTls`](../types#grpctls) | not_implemented |  | • `ca_file`: not_implemented<br>• `cert_file`: not_implemented<br>• `insecure`: not_implemented<br>• `key_file`: not_implemented<br> |
| [`HttpTls`](../types#httptls) | not_implemented |  | • `ca_file`: not_implemented<br>• `cert_file`: not_implemented<br>• `key_file`: not_implemented<br> |
| [`IncludeExclude`](../types#includeexclude) | supported |  | • `excluded`: supported<br>• `included`: supported<br> |
| [`InstrumentType`](../types#instrumenttype) | supported |  | • `counter`: supported<br>• `gauge`: supported<br>• `histogram`: supported<br>• `observable_counter`: supported<br>• `observable_gauge`: supported<br>• `observable_up_down_counter`: supported<br>• `up_down_counter`: supported<br> |
| [`JaegerPropagator`](../types#jaegerpropagator) | supported |  |  |
| [`LastValueAggregation`](../types#lastvalueaggregation) | supported |  |  |
| [`LoggerProvider`](../types#loggerprovider) | supported |  | • `limits`: supported<br>• `processors`: supported<br>• `logger_configurator/development`: supported<br> |
| [`LogRecordExporter`](../types#logrecordexporter) | supported |  | • `console`: supported<br>• `otlp_grpc`: supported<br>• `otlp_http`: supported<br>• `otlp_file/development`: supported<br> |
| [`LogRecordLimits`](../types#logrecordlimits) | supported |  | • `attribute_count_limit`: supported<br>• `attribute_value_length_limit`: supported<br> |
| [`LogRecordProcessor`](../types#logrecordprocessor) | supported |  | • `batch`: supported<br>• `simple`: supported<br> |
| [`MeterProvider`](../types#meterprovider) | supported |  | • `exemplar_filter`: supported<br>• `readers`: supported<br>• `views`: supported<br>• `meter_configurator/development`: supported<br> |
| [`MetricProducer`](../types#metricproducer) | ignored |  | • `opencensus`: ignored<br> |
| [`MetricReader`](../types#metricreader) | supported |  | • `periodic`: supported<br>• `pull`: supported<br> |
| [`NameStringValuePair`](../types#namestringvaluepair) | supported |  | • `name`: supported<br>• `value`: supported<br> |
| [`OpenCensusMetricProducer`](../types#opencensusmetricproducer) | ignored |  |  |
| [`OpenTelemetryConfiguration`](../types#opentelemetryconfiguration) | supported |  | • `attribute_limits`: supported<br>• `disabled`: supported<br>• `distribution`: supported<br>• `file_format`: supported<br>• `log_level`: not_implemented<br>• `logger_provider`: supported<br>• `meter_provider`: supported<br>• `propagator`: supported<br>• `resource`: supported<br>• `tracer_provider`: supported<br>• `instrumentation/development`: supported<br> |
| [`OpenTracingPropagator`](../types#opentracingpropagator) | supported |  |  |
| [`OtlpGrpcExporter`](../types#otlpgrpcexporter) | supported |  | • `compression`: supported<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `timeout`: supported<br>• `tls`: ignored<br> |
| [`OtlpGrpcMetricExporter`](../types#otlpgrpcmetricexporter) | supported |  | • `compression`: supported<br>• `default_histogram_aggregation`: supported<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `temporality_preference`: supported<br>• `timeout`: supported<br>• `tls`: ignored<br> |
| [`OtlpHttpEncoding`](../types#otlphttpencoding) | not_implemented |  | • `json`: not_implemented<br>• `protobuf`: not_implemented<br> |
| [`OtlpHttpExporter`](../types#otlphttpexporter) | supported |  | • `compression`: supported<br>• `encoding`: not_implemented<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `timeout`: supported<br>• `tls`: ignored<br> |
| [`OtlpHttpMetricExporter`](../types#otlphttpmetricexporter) | supported |  | • `compression`: supported<br>• `default_histogram_aggregation`: supported<br>• `encoding`: not_implemented<br>• `endpoint`: supported<br>• `headers`: supported<br>• `headers_list`: supported<br>• `temporality_preference`: supported<br>• `timeout`: supported<br>• `tls`: ignored<br> |
| [`ParentBasedSampler`](../types#parentbasedsampler) | supported |  | • `local_parent_not_sampled`: supported<br>• `local_parent_sampled`: supported<br>• `remote_parent_not_sampled`: supported<br>• `remote_parent_sampled`: supported<br>• `root`: supported<br> |
| [`PeriodicMetricReader`](../types#periodicmetricreader) | supported |  | • `cardinality_limits`: supported<br>• `exporter`: supported<br>• `interval`: supported<br>• `producers`: not_implemented<br>• `timeout`: supported<br> |
| [`Propagator`](../types#propagator) | supported |  | • `composite`: supported<br>• `composite_list`: supported<br> |
| [`PullMetricExporter`](../types#pullmetricexporter) | supported |  | • `prometheus/development`: supported<br> |
| [`PullMetricReader`](../types#pullmetricreader) | supported |  | • `cardinality_limits`: supported<br>• `exporter`: supported<br>• `producers`: not_implemented<br> |
| [`PushMetricExporter`](../types#pushmetricexporter) | supported |  | • `console`: supported<br>• `otlp_grpc`: supported<br>• `otlp_http`: supported<br>• `otlp_file/development`: supported<br> |
| [`Resource`](../types#resource) | supported |  | • `attributes`: supported<br>• `attributes_list`: supported<br>• `schema_url`: ignored<br>• `detection/development`: supported<br> |
| [`Sampler`](../types#sampler) | supported |  | • `always_off`: supported<br>• `always_on`: supported<br>• `parent_based`: supported<br>• `trace_id_ratio_based`: supported<br>• `composite/development`: supported<br>• `jaeger_remote/development`: supported<br>• `probability/development`: ignored<br> |
| [`SeverityNumber`](../types#severitynumber) | unknown |  | • `debug`: unknown<br>• `debug2`: unknown<br>• `debug3`: unknown<br>• `debug4`: unknown<br>• `error`: unknown<br>• `error2`: unknown<br>• `error3`: unknown<br>• `error4`: unknown<br>• `fatal`: unknown<br>• `fatal2`: unknown<br>• `fatal3`: unknown<br>• `fatal4`: unknown<br>• `info`: unknown<br>• `info2`: unknown<br>• `info3`: unknown<br>• `info4`: unknown<br>• `trace`: unknown<br>• `trace2`: unknown<br>• `trace3`: unknown<br>• `trace4`: unknown<br>• `warn`: unknown<br>• `warn2`: unknown<br>• `warn3`: unknown<br>• `warn4`: unknown<br> |
| [`SimpleLogRecordProcessor`](../types#simplelogrecordprocessor) | supported |  | • `exporter`: supported<br> |
| [`SimpleSpanProcessor`](../types#simplespanprocessor) | supported |  | • `exporter`: supported<br> |
| [`SpanExporter`](../types#spanexporter) | supported |  | • `console`: supported<br>• `otlp_grpc`: supported<br>• `otlp_http`: supported<br>• `otlp_file/development`: supported<br> |
| [`SpanKind`](../types#spankind) | unknown |  | • `client`: unknown<br>• `consumer`: unknown<br>• `internal`: unknown<br>• `producer`: unknown<br>• `server`: unknown<br> |
| [`SpanLimits`](../types#spanlimits) | supported |  | • `attribute_count_limit`: supported<br>• `attribute_value_length_limit`: supported<br>• `event_attribute_count_limit`: supported<br>• `event_count_limit`: supported<br>• `link_attribute_count_limit`: supported<br>• `link_count_limit`: supported<br> |
| [`SpanProcessor`](../types#spanprocessor) | supported |  | • `batch`: supported<br>• `simple`: supported<br> |
| [`SumAggregation`](../types#sumaggregation) | supported |  |  |
| [`TextMapPropagator`](../types#textmappropagator) | supported |  | • `b3`: supported<br>• `b3multi`: supported<br>• `baggage`: supported<br>• `jaeger`: supported<br>• `ottrace`: supported<br>• `tracecontext`: supported<br> |
| [`TraceContextPropagator`](../types#tracecontextpropagator) | supported |  |  |
| [`TraceIdRatioBasedSampler`](../types#traceidratiobasedsampler) | supported |  | • `ratio`: supported<br> |
| [`TracerProvider`](../types#tracerprovider) | supported |  | • `limits`: supported<br>• `processors`: supported<br>• `sampler`: supported<br>• `tracer_configurator/development`: supported<br> |
| [`View`](../types#view) | supported |  | • `selector`: supported<br>• `stream`: supported<br> |
| [`ViewSelector`](../types#viewselector) | supported |  | • `instrument_name`: supported<br>• `instrument_type`: supported<br>• `meter_name`: supported<br>• `meter_schema_url`: supported<br>• `meter_version`: supported<br>• `unit`: ignored<br> |
| [`ViewStream`](../types#viewstream) | supported |  | • `aggregation`: supported<br>• `aggregation_cardinality_limit`: supported<br>• `attribute_keys`: supported<br>• `description`: supported<br>• `name`: supported<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../types#experimentalcomposablealwaysoffsampler) | unknown |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../types#experimentalcomposablealwaysonsampler) | unknown |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../types#experimentalcomposableparentthresholdsampler) | unknown |  | • `root`: unknown<br> |
| [`ExperimentalComposableProbabilitySampler`](../types#experimentalcomposableprobabilitysampler) | unknown |  | • `ratio`: unknown<br> |
| [`ExperimentalComposableRuleBasedSampler`](../types#experimentalcomposablerulebasedsampler) | unknown |  | • `rules`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../types#experimentalcomposablerulebasedsamplerrule) | unknown |  | • `attribute_patterns`: unknown<br>• `attribute_values`: unknown<br>• `parent`: unknown<br>• `sampler`: unknown<br>• `span_kinds`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../types#experimentalcomposablerulebasedsamplerruleattributepatterns) | unknown |  | • `excluded`: unknown<br>• `included`: unknown<br>• `key`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../types#experimentalcomposablerulebasedsamplerruleattributevalues) | unknown |  | • `key`: unknown<br>• `values`: unknown<br> |
| [`ExperimentalComposableSampler`](../types#experimentalcomposablesampler) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `parent_threshold`: unknown<br>• `probability`: unknown<br>• `rule_based`: unknown<br> |
| [`ExperimentalContainerResourceDetector`](../types#experimentalcontainerresourcedetector) | supported |  |  |
| [`ExperimentalGeneralInstrumentation`](../types#experimentalgeneralinstrumentation) | supported |  | • `http`: supported<br>• `peer`: supported<br> |
| [`ExperimentalHostResourceDetector`](../types#experimentalhostresourcedetector) | supported |  |  |
| [`ExperimentalHttpClientInstrumentation`](../types#experimentalhttpclientinstrumentation) | supported |  | • `request_captured_headers`: supported<br>• `response_captured_headers`: supported<br> |
| [`ExperimentalHttpInstrumentation`](../types#experimentalhttpinstrumentation) | supported |  | • `client`: supported<br>• `server`: supported<br> |
| [`ExperimentalHttpServerInstrumentation`](../types#experimentalhttpserverinstrumentation) | supported |  | • `request_captured_headers`: supported<br>• `response_captured_headers`: supported<br> |
| [`ExperimentalInstrumentation`](../types#experimentalinstrumentation) | supported |  | • `cpp`: not_applicable<br>• `dotnet`: not_applicable<br>• `erlang`: not_applicable<br>• `general`: supported<br>• `go`: not_applicable<br>• `java`: supported<br>• `js`: not_applicable<br>• `php`: not_applicable<br>• `python`: not_applicable<br>• `ruby`: not_applicable<br>• `rust`: not_applicable<br>• `swift`: not_applicable<br> |
| [`ExperimentalJaegerRemoteSampler`](../types#experimentaljaegerremotesampler) | ignored |  | • `endpoint`: ignored<br>• `initial_sampler`: ignored<br>• `interval`: ignored<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../types#experimentallanguagespecificinstrumentation) | supported |  |  |
| [`ExperimentalLoggerConfig`](../types#experimentalloggerconfig) | supported |  | • `disabled`: supported<br>• `minimum_severity`: not_implemented<br>• `trace_based`: not_implemented<br> |
| [`ExperimentalLoggerConfigurator`](../types#experimentalloggerconfigurator) | supported |  | • `default_config`: supported<br>• `loggers`: supported<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../types#experimentalloggermatcherandconfig) | supported |  | • `config`: supported<br>• `name`: supported<br> |
| [`ExperimentalMeterConfig`](../types#experimentalmeterconfig) | supported |  | • `disabled`: supported<br> |
| [`ExperimentalMeterConfigurator`](../types#experimentalmeterconfigurator) | supported |  | • `default_config`: supported<br>• `meters`: supported<br> |
| [`ExperimentalMeterMatcherAndConfig`](../types#experimentalmetermatcherandconfig) | supported |  | • `config`: supported<br>• `name`: supported<br> |
| [`ExperimentalOtlpFileExporter`](../types#experimentalotlpfileexporter) | supported |  | • `output_stream`: not_implemented<br> |
| [`ExperimentalOtlpFileMetricExporter`](../types#experimentalotlpfilemetricexporter) | supported |  | • `default_histogram_aggregation`: supported<br>• `output_stream`: not_implemented<br>• `temporality_preference`: supported<br> |
| [`ExperimentalPeerInstrumentation`](../types#experimentalpeerinstrumentation) | supported |  | • `service_mapping`: supported<br> |
| [`ExperimentalPeerServiceMapping`](../types#experimentalpeerservicemapping) | supported |  | • `peer`: supported<br>• `service`: supported<br> |
| [`ExperimentalProbabilitySampler`](../types#experimentalprobabilitysampler) | ignored |  | • `ratio`: ignored<br> |
| [`ExperimentalProcessResourceDetector`](../types#experimentalprocessresourcedetector) | supported |  |  |
| [`ExperimentalPrometheusMetricExporter`](../types#experimentalprometheusmetricexporter) | supported |  | • `host`: supported<br>• `port`: supported<br>• `translation_strategy`: not_implemented<br>• `with_resource_constant_labels`: supported<br>• `without_scope_info`: ignored<br>• `without_target_info`: ignored<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../types#experimentalprometheustranslationstrategy) | unknown |  | • `no_translation`: unknown<br>• `no_utf8_escaping_with_suffixes`: unknown<br>• `underscore_escaping_with_suffixes`: unknown<br>• `underscore_escaping_without_suffixes`: unknown<br> |
| [`ExperimentalResourceDetection`](../types#experimentalresourcedetection) | supported |  | • `attributes`: supported<br>• `detectors`: supported<br> |
| [`ExperimentalResourceDetector`](../types#experimentalresourcedetector) | supported |  | • `container`: supported<br>• `host`: supported<br>• `process`: supported<br>• `service`: supported<br> |
| [`ExperimentalServiceResourceDetector`](../types#experimentalserviceresourcedetector) | supported |  |  |
| [`ExperimentalSpanParent`](../types#experimentalspanparent) | unknown |  | • `local`: unknown<br>• `none`: unknown<br>• `remote`: unknown<br> |
| [`ExperimentalTracerConfig`](../types#experimentaltracerconfig) | supported |  | • `disabled`: supported<br> |
| [`ExperimentalTracerConfigurator`](../types#experimentaltracerconfigurator) | supported |  | • `default_config`: supported<br>• `tracers`: supported<br> |
| [`ExperimentalTracerMatcherAndConfig`](../types#experimentaltracermatcherandconfig) | supported |  | • `config`: supported<br>• `name`: supported<br> |

### js {#js}

Latest supported file format: `1.0.0-rc.2`

| Type | Status | Notes | Support Status Details |
|---|---|---|---|
| [`Aggregation`](../types#aggregation) | unknown |  | • `base2_exponential_bucket_histogram`: unknown<br>• `default`: unknown<br>• `drop`: unknown<br>• `explicit_bucket_histogram`: unknown<br>• `last_value`: unknown<br>• `sum`: unknown<br> |
| [`AlwaysOffSampler`](../types#alwaysoffsampler) | unknown |  |  |
| [`AlwaysOnSampler`](../types#alwaysonsampler) | unknown |  |  |
| [`AttributeLimits`](../types#attributelimits) | unknown |  | • `attribute_count_limit`: unknown<br>• `attribute_value_length_limit`: unknown<br> |
| [`AttributeNameValue`](../types#attributenamevalue) | unknown |  | • `name`: unknown<br>• `type`: unknown<br>• `value`: unknown<br> |
| [`AttributeType`](../types#attributetype) | unknown |  | • `bool`: unknown<br>• `bool_array`: unknown<br>• `double`: unknown<br>• `double_array`: unknown<br>• `int`: unknown<br>• `int_array`: unknown<br>• `string`: unknown<br>• `string_array`: unknown<br> |
| [`B3MultiPropagator`](../types#b3multipropagator) | unknown |  |  |
| [`B3Propagator`](../types#b3propagator) | unknown |  |  |
| [`BaggagePropagator`](../types#baggagepropagator) | unknown |  |  |
| [`Base2ExponentialBucketHistogramAggregation`](../types#base2exponentialbuckethistogramaggregation) | unknown |  | • `max_scale`: unknown<br>• `max_size`: unknown<br>• `record_min_max`: unknown<br> |
| [`BatchLogRecordProcessor`](../types#batchlogrecordprocessor) | unknown |  | • `export_timeout`: unknown<br>• `exporter`: unknown<br>• `max_export_batch_size`: unknown<br>• `max_queue_size`: unknown<br>• `schedule_delay`: unknown<br> |
| [`BatchSpanProcessor`](../types#batchspanprocessor) | unknown |  | • `export_timeout`: unknown<br>• `exporter`: unknown<br>• `max_export_batch_size`: unknown<br>• `max_queue_size`: unknown<br>• `schedule_delay`: unknown<br> |
| [`CardinalityLimits`](../types#cardinalitylimits) | unknown |  | • `counter`: unknown<br>• `default`: unknown<br>• `gauge`: unknown<br>• `histogram`: unknown<br>• `observable_counter`: unknown<br>• `observable_gauge`: unknown<br>• `observable_up_down_counter`: unknown<br>• `up_down_counter`: unknown<br> |
| [`ConsoleExporter`](../types#consoleexporter) | unknown |  |  |
| [`ConsoleMetricExporter`](../types#consolemetricexporter) | unknown |  | • `default_histogram_aggregation`: unknown<br>• `temporality_preference`: unknown<br> |
| [`DefaultAggregation`](../types#defaultaggregation) | unknown |  |  |
| [`Distribution`](../types#distribution) | unknown |  |  |
| [`DropAggregation`](../types#dropaggregation) | unknown |  |  |
| [`ExemplarFilter`](../types#exemplarfilter) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `trace_based`: unknown<br> |
| [`ExplicitBucketHistogramAggregation`](../types#explicitbuckethistogramaggregation) | unknown |  | • `boundaries`: unknown<br>• `record_min_max`: unknown<br> |
| [`ExporterDefaultHistogramAggregation`](../types#exporterdefaulthistogramaggregation) | unknown |  | • `base2_exponential_bucket_histogram`: unknown<br>• `explicit_bucket_histogram`: unknown<br> |
| [`ExporterTemporalityPreference`](../types#exportertemporalitypreference) | unknown |  | • `cumulative`: unknown<br>• `delta`: unknown<br>• `low_memory`: unknown<br> |
| [`GrpcTls`](../types#grpctls) | unknown |  | • `ca_file`: unknown<br>• `cert_file`: unknown<br>• `insecure`: unknown<br>• `key_file`: unknown<br> |
| [`HttpTls`](../types#httptls) | unknown |  | • `ca_file`: unknown<br>• `cert_file`: unknown<br>• `key_file`: unknown<br> |
| [`IncludeExclude`](../types#includeexclude) | unknown |  | • `excluded`: unknown<br>• `included`: unknown<br> |
| [`InstrumentType`](../types#instrumenttype) | unknown |  | • `counter`: unknown<br>• `gauge`: unknown<br>• `histogram`: unknown<br>• `observable_counter`: unknown<br>• `observable_gauge`: unknown<br>• `observable_up_down_counter`: unknown<br>• `up_down_counter`: unknown<br> |
| [`JaegerPropagator`](../types#jaegerpropagator) | unknown |  |  |
| [`LastValueAggregation`](../types#lastvalueaggregation) | unknown |  |  |
| [`LoggerProvider`](../types#loggerprovider) | unknown |  | • `limits`: unknown<br>• `processors`: unknown<br>• `logger_configurator/development`: unknown<br> |
| [`LogRecordExporter`](../types#logrecordexporter) | unknown |  | • `console`: unknown<br>• `otlp_grpc`: unknown<br>• `otlp_http`: unknown<br>• `otlp_file/development`: unknown<br> |
| [`LogRecordLimits`](../types#logrecordlimits) | unknown |  | • `attribute_count_limit`: unknown<br>• `attribute_value_length_limit`: unknown<br> |
| [`LogRecordProcessor`](../types#logrecordprocessor) | unknown |  | • `batch`: unknown<br>• `simple`: unknown<br> |
| [`MeterProvider`](../types#meterprovider) | unknown |  | • `exemplar_filter`: unknown<br>• `readers`: unknown<br>• `views`: unknown<br>• `meter_configurator/development`: unknown<br> |
| [`MetricProducer`](../types#metricproducer) | unknown |  | • `opencensus`: unknown<br> |
| [`MetricReader`](../types#metricreader) | unknown |  | • `periodic`: unknown<br>• `pull`: unknown<br> |
| [`NameStringValuePair`](../types#namestringvaluepair) | unknown |  | • `name`: unknown<br>• `value`: unknown<br> |
| [`OpenCensusMetricProducer`](../types#opencensusmetricproducer) | unknown |  |  |
| [`OpenTelemetryConfiguration`](../types#opentelemetryconfiguration) | unknown |  | • `attribute_limits`: unknown<br>• `disabled`: unknown<br>• `distribution`: unknown<br>• `file_format`: unknown<br>• `log_level`: unknown<br>• `logger_provider`: unknown<br>• `meter_provider`: unknown<br>• `propagator`: unknown<br>• `resource`: unknown<br>• `tracer_provider`: unknown<br>• `instrumentation/development`: unknown<br> |
| [`OpenTracingPropagator`](../types#opentracingpropagator) | unknown |  |  |
| [`OtlpGrpcExporter`](../types#otlpgrpcexporter) | unknown |  | • `compression`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`OtlpGrpcMetricExporter`](../types#otlpgrpcmetricexporter) | unknown |  | • `compression`: unknown<br>• `default_histogram_aggregation`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `temporality_preference`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`OtlpHttpEncoding`](../types#otlphttpencoding) | unknown |  | • `json`: unknown<br>• `protobuf`: unknown<br> |
| [`OtlpHttpExporter`](../types#otlphttpexporter) | unknown |  | • `compression`: unknown<br>• `encoding`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`OtlpHttpMetricExporter`](../types#otlphttpmetricexporter) | unknown |  | • `compression`: unknown<br>• `default_histogram_aggregation`: unknown<br>• `encoding`: unknown<br>• `endpoint`: unknown<br>• `headers`: unknown<br>• `headers_list`: unknown<br>• `temporality_preference`: unknown<br>• `timeout`: unknown<br>• `tls`: unknown<br> |
| [`ParentBasedSampler`](../types#parentbasedsampler) | unknown |  | • `local_parent_not_sampled`: unknown<br>• `local_parent_sampled`: unknown<br>• `remote_parent_not_sampled`: unknown<br>• `remote_parent_sampled`: unknown<br>• `root`: unknown<br> |
| [`PeriodicMetricReader`](../types#periodicmetricreader) | unknown |  | • `cardinality_limits`: unknown<br>• `exporter`: unknown<br>• `interval`: unknown<br>• `producers`: unknown<br>• `timeout`: unknown<br> |
| [`Propagator`](../types#propagator) | unknown |  | • `composite`: unknown<br>• `composite_list`: unknown<br> |
| [`PullMetricExporter`](../types#pullmetricexporter) | unknown |  | • `prometheus/development`: unknown<br> |
| [`PullMetricReader`](../types#pullmetricreader) | unknown |  | • `cardinality_limits`: unknown<br>• `exporter`: unknown<br>• `producers`: unknown<br> |
| [`PushMetricExporter`](../types#pushmetricexporter) | unknown |  | • `console`: unknown<br>• `otlp_grpc`: unknown<br>• `otlp_http`: unknown<br>• `otlp_file/development`: unknown<br> |
| [`Resource`](../types#resource) | unknown |  | • `attributes`: unknown<br>• `attributes_list`: unknown<br>• `schema_url`: unknown<br>• `detection/development`: unknown<br> |
| [`Sampler`](../types#sampler) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `parent_based`: unknown<br>• `trace_id_ratio_based`: unknown<br>• `composite/development`: unknown<br>• `jaeger_remote/development`: unknown<br>• `probability/development`: unknown<br> |
| [`SeverityNumber`](../types#severitynumber) | unknown |  | • `debug`: unknown<br>• `debug2`: unknown<br>• `debug3`: unknown<br>• `debug4`: unknown<br>• `error`: unknown<br>• `error2`: unknown<br>• `error3`: unknown<br>• `error4`: unknown<br>• `fatal`: unknown<br>• `fatal2`: unknown<br>• `fatal3`: unknown<br>• `fatal4`: unknown<br>• `info`: unknown<br>• `info2`: unknown<br>• `info3`: unknown<br>• `info4`: unknown<br>• `trace`: unknown<br>• `trace2`: unknown<br>• `trace3`: unknown<br>• `trace4`: unknown<br>• `warn`: unknown<br>• `warn2`: unknown<br>• `warn3`: unknown<br>• `warn4`: unknown<br> |
| [`SimpleLogRecordProcessor`](../types#simplelogrecordprocessor) | unknown |  | • `exporter`: unknown<br> |
| [`SimpleSpanProcessor`](../types#simplespanprocessor) | unknown |  | • `exporter`: unknown<br> |
| [`SpanExporter`](../types#spanexporter) | unknown |  | • `console`: unknown<br>• `otlp_grpc`: unknown<br>• `otlp_http`: unknown<br>• `otlp_file/development`: unknown<br> |
| [`SpanKind`](../types#spankind) | unknown |  | • `client`: unknown<br>• `consumer`: unknown<br>• `internal`: unknown<br>• `producer`: unknown<br>• `server`: unknown<br> |
| [`SpanLimits`](../types#spanlimits) | unknown |  | • `attribute_count_limit`: unknown<br>• `attribute_value_length_limit`: unknown<br>• `event_attribute_count_limit`: unknown<br>• `event_count_limit`: unknown<br>• `link_attribute_count_limit`: unknown<br>• `link_count_limit`: unknown<br> |
| [`SpanProcessor`](../types#spanprocessor) | unknown |  | • `batch`: unknown<br>• `simple`: unknown<br> |
| [`SumAggregation`](../types#sumaggregation) | unknown |  |  |
| [`TextMapPropagator`](../types#textmappropagator) | unknown |  | • `b3`: unknown<br>• `b3multi`: unknown<br>• `baggage`: unknown<br>• `jaeger`: unknown<br>• `ottrace`: unknown<br>• `tracecontext`: unknown<br> |
| [`TraceContextPropagator`](../types#tracecontextpropagator) | unknown |  |  |
| [`TraceIdRatioBasedSampler`](../types#traceidratiobasedsampler) | unknown |  | • `ratio`: unknown<br> |
| [`TracerProvider`](../types#tracerprovider) | unknown |  | • `limits`: unknown<br>• `processors`: unknown<br>• `sampler`: unknown<br>• `tracer_configurator/development`: unknown<br> |
| [`View`](../types#view) | unknown |  | • `selector`: unknown<br>• `stream`: unknown<br> |
| [`ViewSelector`](../types#viewselector) | unknown |  | • `instrument_name`: unknown<br>• `instrument_type`: unknown<br>• `meter_name`: unknown<br>• `meter_schema_url`: unknown<br>• `meter_version`: unknown<br>• `unit`: unknown<br> |
| [`ViewStream`](../types#viewstream) | unknown |  | • `aggregation`: unknown<br>• `aggregation_cardinality_limit`: unknown<br>• `attribute_keys`: unknown<br>• `description`: unknown<br>• `name`: unknown<br> |
| [`ExperimentalComposableAlwaysOffSampler`](../types#experimentalcomposablealwaysoffsampler) | unknown |  |  |
| [`ExperimentalComposableAlwaysOnSampler`](../types#experimentalcomposablealwaysonsampler) | unknown |  |  |
| [`ExperimentalComposableParentThresholdSampler`](../types#experimentalcomposableparentthresholdsampler) | unknown |  | • `root`: unknown<br> |
| [`ExperimentalComposableProbabilitySampler`](../types#experimentalcomposableprobabilitysampler) | unknown |  | • `ratio`: unknown<br> |
| [`ExperimentalComposableRuleBasedSampler`](../types#experimentalcomposablerulebasedsampler) | unknown |  | • `rules`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRule`](../types#experimentalcomposablerulebasedsamplerrule) | unknown |  | • `attribute_patterns`: unknown<br>• `attribute_values`: unknown<br>• `parent`: unknown<br>• `sampler`: unknown<br>• `span_kinds`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributePatterns`](../types#experimentalcomposablerulebasedsamplerruleattributepatterns) | unknown |  | • `excluded`: unknown<br>• `included`: unknown<br>• `key`: unknown<br> |
| [`ExperimentalComposableRuleBasedSamplerRuleAttributeValues`](../types#experimentalcomposablerulebasedsamplerruleattributevalues) | unknown |  | • `key`: unknown<br>• `values`: unknown<br> |
| [`ExperimentalComposableSampler`](../types#experimentalcomposablesampler) | unknown |  | • `always_off`: unknown<br>• `always_on`: unknown<br>• `parent_threshold`: unknown<br>• `probability`: unknown<br>• `rule_based`: unknown<br> |
| [`ExperimentalContainerResourceDetector`](../types#experimentalcontainerresourcedetector) | unknown |  |  |
| [`ExperimentalGeneralInstrumentation`](../types#experimentalgeneralinstrumentation) | unknown |  | • `http`: unknown<br>• `peer`: unknown<br> |
| [`ExperimentalHostResourceDetector`](../types#experimentalhostresourcedetector) | unknown |  |  |
| [`ExperimentalHttpClientInstrumentation`](../types#experimentalhttpclientinstrumentation) | unknown |  | • `request_captured_headers`: unknown<br>• `response_captured_headers`: unknown<br> |
| [`ExperimentalHttpInstrumentation`](../types#experimentalhttpinstrumentation) | unknown |  | • `client`: unknown<br>• `server`: unknown<br> |
| [`ExperimentalHttpServerInstrumentation`](../types#experimentalhttpserverinstrumentation) | unknown |  | • `request_captured_headers`: unknown<br>• `response_captured_headers`: unknown<br> |
| [`ExperimentalInstrumentation`](../types#experimentalinstrumentation) | unknown |  | • `cpp`: unknown<br>• `dotnet`: unknown<br>• `erlang`: unknown<br>• `general`: unknown<br>• `go`: unknown<br>• `java`: unknown<br>• `js`: unknown<br>• `php`: unknown<br>• `python`: unknown<br>• `ruby`: unknown<br>• `rust`: unknown<br>• `swift`: unknown<br> |
| [`ExperimentalJaegerRemoteSampler`](../types#experimentaljaegerremotesampler) | unknown |  | • `endpoint`: unknown<br>• `initial_sampler`: unknown<br>• `interval`: unknown<br> |
| [`ExperimentalLanguageSpecificInstrumentation`](../types#experimentallanguagespecificinstrumentation) | unknown |  |  |
| [`ExperimentalLoggerConfig`](../types#experimentalloggerconfig) | unknown |  | • `disabled`: unknown<br>• `minimum_severity`: unknown<br>• `trace_based`: unknown<br> |
| [`ExperimentalLoggerConfigurator`](../types#experimentalloggerconfigurator) | unknown |  | • `default_config`: unknown<br>• `loggers`: unknown<br> |
| [`ExperimentalLoggerMatcherAndConfig`](../types#experimentalloggermatcherandconfig) | unknown |  | • `config`: unknown<br>• `name`: unknown<br> |
| [`ExperimentalMeterConfig`](../types#experimentalmeterconfig) | unknown |  | • `disabled`: unknown<br> |
| [`ExperimentalMeterConfigurator`](../types#experimentalmeterconfigurator) | unknown |  | • `default_config`: unknown<br>• `meters`: unknown<br> |
| [`ExperimentalMeterMatcherAndConfig`](../types#experimentalmetermatcherandconfig) | unknown |  | • `config`: unknown<br>• `name`: unknown<br> |
| [`ExperimentalOtlpFileExporter`](../types#experimentalotlpfileexporter) | unknown |  | • `output_stream`: unknown<br> |
| [`ExperimentalOtlpFileMetricExporter`](../types#experimentalotlpfilemetricexporter) | unknown |  | • `default_histogram_aggregation`: unknown<br>• `output_stream`: unknown<br>• `temporality_preference`: unknown<br> |
| [`ExperimentalPeerInstrumentation`](../types#experimentalpeerinstrumentation) | unknown |  | • `service_mapping`: unknown<br> |
| [`ExperimentalPeerServiceMapping`](../types#experimentalpeerservicemapping) | unknown |  | • `peer`: unknown<br>• `service`: unknown<br> |
| [`ExperimentalProbabilitySampler`](../types#experimentalprobabilitysampler) | unknown |  | • `ratio`: unknown<br> |
| [`ExperimentalProcessResourceDetector`](../types#experimentalprocessresourcedetector) | unknown |  |  |
| [`ExperimentalPrometheusMetricExporter`](../types#experimentalprometheusmetricexporter) | unknown |  | • `host`: unknown<br>• `port`: unknown<br>• `translation_strategy`: unknown<br>• `with_resource_constant_labels`: unknown<br>• `without_scope_info`: unknown<br>• `without_target_info`: unknown<br> |
| [`ExperimentalPrometheusTranslationStrategy`](../types#experimentalprometheustranslationstrategy) | unknown |  | • `no_translation`: unknown<br>• `no_utf8_escaping_with_suffixes`: unknown<br>• `underscore_escaping_with_suffixes`: unknown<br>• `underscore_escaping_without_suffixes`: unknown<br> |
| [`ExperimentalResourceDetection`](../types#experimentalresourcedetection) | unknown |  | • `attributes`: unknown<br>• `detectors`: unknown<br> |
| [`ExperimentalResourceDetector`](../types#experimentalresourcedetector) | unknown |  | • `container`: unknown<br>• `host`: unknown<br>• `process`: unknown<br>• `service`: unknown<br> |
| [`ExperimentalServiceResourceDetector`](../types#experimentalserviceresourcedetector) | unknown |  |  |
| [`ExperimentalSpanParent`](../types#experimentalspanparent) | unknown |  | • `local`: unknown<br>• `none`: unknown<br>• `remote`: unknown<br> |
| [`ExperimentalTracerConfig`](../types#experimentaltracerconfig) | unknown |  | • `disabled`: unknown<br> |
| [`ExperimentalTracerConfigurator`](../types#experimentaltracerconfigurator) | unknown |  | • `default_config`: unknown<br>• `tracers`: unknown<br> |
| [`ExperimentalTracerMatcherAndConfig`](../types#experimentaltracermatcherandconfig) | unknown |  | • `config`: unknown<br>• `name`: unknown<br> |

</div>
<!-- END GENERATED: language-implementation-status SOURCE: opentelemetry-configuration -->
