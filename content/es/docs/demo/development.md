---
title: Desarrollo
cSpell:ignore: grpcio intellij libcurl libprotobuf nlohmann openssl protoc
default_lang_commit: 7c112ea4147756b8234012f9316132a65a77593c
---

[Repositorio GitHub de la Demo de OpenTelemetry](https://github.com/open-telemetry/opentelemetry-demo)

El desarrollo de esta demo requiere herramientas en varios lenguajes de
programación. Se indicarán las versiones mínimas requeridas cuando sea posible,
pero se recomienda actualizar a la última versión para todas las herramientas.
El equipo de la demo de OpenTelemetry intentará mantener los servicios en este
repositorio actualizados con la última versión de dependencias y herramientas
cuando sea posible.

## Generar archivos protobuf

El comando `make generate-protobuf` se proporciona para generar archivos
protobuf para todos los servicios. Esto puede usarse para compilar código
localmente (sin Docker) y recibir sugerencias de IDEs como IntelliJ o VS Code.
Puede ser necesario ejecutar `npm install` dentro de la carpeta del código
fuente del frontend antes de generar los archivos.

## Requisitos de herramientas de desarrollo

### .NET

- .NET 8.0+

### C++

- build-essential
- cmake
- libcurl4-openssl-dev
- libprotobuf-dev
- nlohmann-json3-dev
- pkg-config
- protobuf-compiler

### Go

- Go 1.19+
- protoc-gen-go
- protoc-gen-go-grpc

### Java

- JDK 17+
- Gradle 7+

### JavaScript

- Node.js 16+

### PHP

- PHP 8.1+
- Composer 2.4+

### Python

- Python 3.10
- grpcio-tools 1.48+

### Ruby

- Ruby 3.1+

### Rust

- Rust 1.61+
- protoc 3.21+
- protobuf-dev
