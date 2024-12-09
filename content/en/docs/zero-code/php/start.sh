docker run --rm -d -p 4317:4317 -p 16686:16686 --network host jaegertracing/all-in-one:latest
docker run --rm -v ".:/app" -w "/app" --network host phpbox sh -c  "composer require  slim/slim:4.14 slim/psr7  nyholm/psr7  nyholm/psr7-server  laminas/laminas-diactoros open-telemetry/sdk  open-telemetry/opentelemetry-auto-slim  open-telemetry/opentelemetry-auto-psr18  open-telemetry/exporter-otlp  open-telemetry/transport-grpc"
docker run --rm -p "8000:8000" -v ".:/app" -w "/app" --network host phpbox sh -c "env OTEL_PHP_AUTOLOAD_ENABLED=true   OTEL_SERVICE_NAME=app   OTEL_TRACES_EXPORTER=otlp   OTEL_EXPORTER_OTLP_PROTOCOL=grpc   OTEL_EXPORTER_OTLP_ENDPOINT=http://0.0.0.0:4317   OTEL_PROPAGATORS=baggage,tracecontext   OTEL_LOGS_LEVEL=debug   php -S 0.0.0.0:8000"

