import { context, propagation, trace } from '@opentelemetry/api';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep';

const collectorOptions = {
  url: 'https://otelwebtelemetry.com/v1/traces',
};
const exporter = new OTLPTraceExporter(collectorOptions);

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'opentelemetry.io',
  'browser.language': navigator.language,
});

const tracerProvider = new TracerProvider({
  resource,
  spanProcessors: [
    new SimpleSpanProcessor({ exporter }),
    new SimpleSpanProcessor({ exporter: new ConsoleSpanExporter() }),
  ],
});
trace.setGlobalTracerProvider(tracerProvider);

context.setGlobalContextManager(new ZoneContextManager().enable());

const propagator = new CompositePropagator({
  propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
});
propagation.setGlobalPropagator(propagator);

registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations({})],
  tracerProvider: provider,
});

module.export = provider.getTracer('otel-web');
