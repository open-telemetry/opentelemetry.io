import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction';


const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad(),
    new UserInteractionPlugin(),
  ],
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

module.export = provider.getTracer('otel-web');


