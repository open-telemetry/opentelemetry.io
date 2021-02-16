import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';

const exporter = new CollectorTraceExporter({
  serviceName: 'opentelemetry.io',
  url: 'https://otelwebtelemetry.com/v1/trace'
})


const locale = {
  "browser.language": navigator.language,
  "browser.path": location.pathname
}

const provider = new WebTracerProvider({
  resource: locale
});

registerInstrumentations({
  instrumentations: [
    new DocumentLoad()
  ],
  tracerProvider: provider
})

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

module.export = provider.getTracer('otel-web');


