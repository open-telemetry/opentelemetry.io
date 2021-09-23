import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { Resource } from '@opentelemetry/resources';

const exporter = new CollectorTraceExporter({
  serviceName: 'opentelemetry.io',
  url: 'https://otelwebtelemetry.com/v1/trace'
})


const locale = new Resource({
    "browser.language": navigator.language, 
    "browser.path": location.pathname
})


const provider = new WebTracerProvider({
  resource: locale
});

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
  ],
  tracerProvider: provider
})

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

module.export = provider.getTracer('otel-web');


