---
title: 개발
default_lang_commit: 7c112ea4147756b8234012f9316132a65a77593c
cSpell:ignore: grpcio intellij libcurl libprotobuf nlohmann openssl protoc
---

[오픈텔레메트리(OpenTelemetry) 데모 GitHub 저장소](https://github.com/open-telemetry/opentelemetry-demo)

이 데모를 개발하려면 여러 프로그래밍 언어의 도구가 필요하다. 가능한 경우 필요한
최소 버전을 명시하지만, 모든 도구를 최신 버전으로 업데이트하는 것을 권장한다.
오픈텔레메트리 데모 팀은 가능한 한 이 저장소의 서비스에서 사용하는 의존성과 개발
도구를 최신 상태로 유지하려고 한다.

## 프로토콜 버퍼(protobuf) 파일 생성 {#generate-protobuf-files}

`make generate-protobuf` 명령어는 모든 서비스의 프로토콜 버퍼 파일을 생성하는 데
사용한다. 이 명령어를 사용하면 도커 없이 로컬에서 코드를 컴파일하고 IntelliJ
또는 VS Code와 같은 통합 개발 환경(IDE)에서 코드 힌트를 받을 수 있다. 파일을
생성하기 전에 프론트엔드 소스 디렉터리에서 `npm install`을 실행해야 할 수도
있다.

## 개발 도구 요구 사항 {#development-tooling-requirements}

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
