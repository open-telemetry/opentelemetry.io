import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction';
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
    new DocumentLoad(),
    new UserInteractionPlugin(),
  ],
  tracerProvider: provider
})

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

module.export = provider.getTracer('otel-web');


