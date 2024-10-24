import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep';

const collectorOptions = {
  url: 'https://otelwebtelemetry.com/v1/traces',
};
const exporter = new OTLPTraceExporter(collectorOptions);

const resources = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'opentelemetry.io',
  'browser.language': navigator.language,
});

const provider = new WebTracerProvider({
  resource: resources,
});

registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations({})],
  tracerProvider: provider,
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({
  contextManger: new ZoneContextManager(),
});

module.export = provider.getTracer('otel-web');
