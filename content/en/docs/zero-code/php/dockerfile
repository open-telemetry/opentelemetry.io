FROM --platform=linux/amd64 php:8.3.13-alpine3.20
RUN apk add unzip git curl autoconf gcc g++ make linux-headers zlib-dev file
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN pecl install excimer
RUN pecl install opentelemetry && docker-php-ext-enable opentelemetry
RUN pecl install grpc && docker-php-ext-enable grpc
RUN composer require slim/slim:4.14 slim/psr7 nyholm/psr7 nyholm/psr7-server laminas/laminas-diactoros open-telemetry/sdk open-telemetry/opentelemetry-auto-slim open-telemetry/opentelemetry-auto-psr18 open-telemetry/exporter-otlp  open-telemetry/transport-grpc
