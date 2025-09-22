---
title: Desenvolvimento
cSpell:ignore: grpcio intellij libcurl libprotobuf nlohmann openssl protoc
---

[Repositório do OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo)

O desenvolvimento deste demo requer ferramentas em várias linguagens de
programação. As versões mínimas necessárias serão informadas quando possível,
mas é recomendado atualizar para a versão mais recente de todas as ferramentas.
A equipe do demo do OpenTelemetry tentará manter os serviços neste repositório
atualizados com as versões mais recentes de dependências e ferramentas quando
possível.

## Gerar arquivos protobuf

O comando `make generate-protobuf` é fornecido para gerar arquivos protobuf para
todos os serviços. Isso pode ser usado para compilar código localmente (sem
Docker) e receber dicas de IDEs como IntelliJ ou VS Code. Pode ser necessário
executar `npm install` dentro da pasta do frontend antes de gerar os arquivos.

## Requisitos de ferramentas de desenvolvimento

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
