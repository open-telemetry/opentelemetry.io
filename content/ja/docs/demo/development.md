---
title: 開発環境
default_lang_commit: a6efef05af7f854d2fcc9ec4b7433cc4ae799a40
cSpell:ignore: grpcio intellij libcurl libprotobuf nlohmann openssl protoc
---

[OpenTelemetry デモ GitHub リポジトリ](https://github.com/open-telemetry/opentelemetry-demo)

このデモの開発には、複数のプログラミング言語のツールが必要です。
最小要件バージョンについては可能な範囲で明示されていますが、最新版の利用を推奨しています。
OpenTelemetryデモチームは、可能な限り依存関係やツールを最新版に保つよう努めています。

## Protocol Buffers ファイルの生成 {#generate-protobuf-files}

すべてのサービスに対応する protobuf ファイルを生成するための `make generate-protobuf` コマンドが提供されています。
このコマンドにより、（Dockerを使用せず）ローカルでのコードのコンパイルを行うことができ、IntelliJやVS CodeなどのIDEからのヒントを確認することができます。
ファイル生成前にフロントエンドのソースフォルダで `npm install` の実行が必要な場合があります。

## 必要な開発ツール {#development-tooling-requirements}

### .NET

- .NET 6.0+

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
