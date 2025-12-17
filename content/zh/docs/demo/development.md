---
title: 开发
default_lang_commit: 82eee93552827dde1e716a5e711935e876803914
cSpell:ignore: grpcio intellij libcurl libprotobuf nlohmann openssl protoc
---

[OpenTelemetry Demo GitHub 仓库](https://github.com/open-telemetry/opentelemetry-demo)

开发本演示项目需要使用多种编程语言的工具链。
尽可能会注明所需的最低版本，但推荐为所有工具更新至最新版本。
OpenTelemetry 演示团队将尽力使本仓库中的服务在可能的情况下始终使用依赖项和工具的最新版本。

## 生成 protobuf 文件 {#generate-protobuf-files}

提供了 `make generate-protobuf` 命令用于为所有服务生成 protobuf 文件。
这个命令可以在本地编译代码（无需 Docker），并在 IntelliJ 或 VS Code 等 IDE 中获得代码提示。
生成文件前，可能需要先在 frontend 源代码目录中运行 `npm install`。

## 开发工具要求 {#development-tooling-requirements}

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
