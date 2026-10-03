---
title: Розробка
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: grpcio intellij libcurl libprotobuf nlohmann openssl protoc
---

[Репозиторій GitHub OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo)

Розробка для цього демо вимагає інструментів для кількох мов програмування. Мінімально необхідні версії будуть зазначені, де це можливо, але рекомендується оновлювати до останньої версії всі інструменти. Команда OpenTelemetry Demo буде намагатися підтримувати сервіси в цьому репозиторії в актуальному стані з останніми версіями залежностей та інструментів, коли це можливо.

## Генерація protobuf файлів {#generate-protobuf-files}

Команда `make generate-protobuf` надається для генерації protobuf файлів для всіх сервісів. Її може бути використано для компіляції коду локально (без Docker) та отримання підказок від IDE, таких як IntelliJ або VS Code. Можливо, буде необхідно виконати `npm install` у теці з вихідним кодом фронтенду перед генерацією файлів.

## Вимоги до інструментів розробки {#development-tools-requirements}

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
