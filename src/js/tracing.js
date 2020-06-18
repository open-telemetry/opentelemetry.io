import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { CollectorExporter } from '@opentelemetry/exporter-collector';

const exporter = new CollectorExporter({
  serviceName: 'opentelemetry.io',
  url: 'https://otelwebtelemetry.com/v1/trace'
})

const locale = {
  "browser.language": navigator.language,
  "browser.path": location.pathname
}

const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad()
  ],
  defaultAttributes: locale
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

module.export = provider.getTracer('otel-web');


