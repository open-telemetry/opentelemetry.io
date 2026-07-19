---
title: サンプルによる入門
description: 5分以内にアプリのテレメトリーを取得しましょう！
weight: 10
default_lang_commit: 153b29255cbd81f4f3d8abe1841d0763074aad9d
cSpell:ignore: oatpp rolldice
---

このページでは、C++ で OpenTelemetry を始める方法を紹介します。

シンプルな C++ アプリケーションを計装する方法を学び、[トレース](/docs/concepts/signals/traces/)がターミナルに出力されるようにします。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- Git
- C++ バージョン14以上をサポートする C++ コンパイラー
- Make
- CMake バージョン3.25以上

## アプリケーション例 {#example-application}

次の例では、基本的な [Oat++](https://oatpp.io/) アプリケーションを使用します。
Oat++ を使用していなくても問題ありません。OpenTelemetry C++ は他のどのウェブフレームワークでも使用できます。

## セットアップ {#setup}

- `otel-cpp-starter` という名前のフォルダーを作成します。
- 新しく作成したフォルダーに移動します。
  ここが作業ディレクトリになります。
- 依存関係のセットアップ後、ディレクトリ構造は次のようになります。

  ```plaintext
  otel-cpp-starter
  │
  ├── oatpp
  ├── opentelemetry-cpp
  └── roll-dice
  ```

## 依存関係 {#dependencies}

まず、[ソースコード](https://github.com/oatpp)と `make` を使用して、次の手順で Oat++ をローカルにインストールします。

1. [oatpp/oatpp](https://github.com/oatpp/oatpp) GitHub リポジトリからクローンして、Oat++ のソースコードを取得します。

   ```bash
   git clone https://github.com/oatpp/oatpp.git
   ```

2. `oatpp` ディレクトリに移動し、当面は1.3.0バージョンに切り替えます。

   ```bash
   cd oatpp
   git checkout 1.3.0-latest
   ```

3. `build` サブディレクトリを作成し、その中に移動します。

   ```bash
   mkdir build
   cd build
   ```

4. `cmake` と `make` コマンドを使用して oatpp をビルドします。
   このコマンドは、oatpp のソースコードに含まれる `CMakeLists.txt` で指定されたビルドプロセスを実行します。

   ```bash
   cmake ..
   make
   ```

5. oatpp をローカル接頭辞にインストールします。
   このコマンドは、ビルドした oatpp ライブラリ、ヘッダー、CMake パッケージ設定を `install` ディレクトリにインストールし、開発で利用できるようにします。

   ```bash
   cmake --install . --prefix ../../install
   ```

次に、CMake を使用して [OpenTelemetry C++](https://github.com/open-telemetry/opentelemetry-cpp) をローカルにインストールしてビルドします。
手順は以下のとおりです。

1. ターミナルで `otel-cpp-starter` ディレクトリに戻ります。
   次に、OpenTelemetry C++ の GitHub リポジトリをローカルマシンにクローンします。

   ```bash
   git clone https://github.com/open-telemetry/opentelemetry-cpp.git
   ```

2. 作業ディレクトリを OpenTelemetry C++ SDK のディレクトリに変更します。

   ```bash
   cd opentelemetry-cpp
   ```

3. ビルドディレクトリを作成し、その中に移動します。

   ```bash
   mkdir build
   cd build
   ```

4. `build` ディレクトリで CMake を実行し、テストを無効にしてビルドシステムを構成・生成します。

   ```bash
   cmake -DBUILD_TESTING=OFF ..
   ```

   または、`cmake --build` が失敗した場合は、次のコマンドも試せます。

   ```bash
   cmake -DBUILD_TESTING=OFF -DWITH_ABSEIL=ON ..
   ```

5. ビルドプロセスを実行します。

   ```bash
   cmake --build .
   ```

6. OpenTelemetry C++ を oatpp と同じローカル接頭辞にインストールします。

   ```bash
   cmake --install . --prefix ../../install
   ```

Oat++ と OpenTelemetry C++ の準備ができたら、最終的に計装する HTTP サーバーの作成に進みます。

## HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

`otel-cpp-starter` フォルダー内に `roll-dice` サブフォルダーを作成します。
ここで Oat++ ライブラリを使用するために、oatpp のヘッダーを参照し、プロジェクトのコンパイル時にリンクします。

`roll-dice` 内に `CMakeLists.txt` というファイルを作成して、Oat++ ライブラリのディレクトリ、インクルードパス、コンパイル時のリンクを定義します。

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# C++ 標準を設定する（例: C++17）
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# プロジェクトのソースファイルを定義する
set(SOURCES
    main.cpp  # ここにソースファイルを追加する
)

# 実行可能ターゲットを作成する
add_executable(dice-server ${SOURCES})

find_package(oatpp REQUIRED)

target_link_libraries(dice-server PRIVATE oatpp::oatpp)
```

次に、サンプル HTTP サーバーのソースコードが必要です。
このコードは以下を行います。

- HTTP ルーターを初期化し、`/rolldice` エンドポイントへの GET リクエストに対してランダムな数値をレスポンスとして生成するリクエストハンドラーを設定します。
- 次に、コネクションハンドラー、コネクションプロバイダーを作成し、<http://localhost:8080> でサーバーを起動します。
- 最後に、main 関数内でアプリケーションを初期化して実行します。

`roll-dice` フォルダー内に `main.cpp` というファイルを作成し、次のコードを追加します。

```cpp
#include "oatpp/web/server/HttpConnectionHandler.hpp"
#include "oatpp/network/Server.hpp"
#include "oatpp/network/tcp/server/ConnectionProvider.hpp"
#include <cstdlib>
#include <ctime>
#include <string>

using namespace std;

class Handler : public oatpp::web::server::HttpRequestHandler {
public:
  shared_ptr<OutgoingResponse> handle(const shared_ptr<IncomingRequest>& request) override {
    int low = 1;
    int high = 7;
    int random = rand() % (high - low) + low;
    // std::string を oatpp::String に変換する
    const string response = to_string(random);
    return ResponseFactory::createResponse(Status::CODE_200, response.c_str());
  }
};

void run() {
  auto router = oatpp::web::server::HttpRouter::createShared();
  router->route("GET", "/rolldice", std::make_shared<Handler>());
  auto connectionHandler = oatpp::web::server::HttpConnectionHandler::createShared(router);
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared({"localhost", 8080, oatpp::network::Address::IP_4});
  oatpp::network::Server server(connectionProvider, connectionHandler);
  OATPP_LOGI("Dice Server", "Server running on port %s", static_cast<const char*>(connectionProvider->getProperty("port").getData()));
  server.run();
}

int main() {
  oatpp::base::Environment::init();
  srand((int)time(0));
  run();
  oatpp::base::Environment::destroy();
  return 0;
}
```

以下の CMake コマンドでアプリケーションをビルドして実行します。

```bash
mkdir build
cd build
cmake .. -DCMAKE_PREFIX_PATH=$(pwd)/../../install
cmake --build .
```

プロジェクトのビルドが成功したら、生成された実行ファイルを実行できます。

```bash
./dice-server
```

次に、ブラウザーで <http://localhost:8080/rolldice> を開いて、正常に動作していることを確認します。

## 計装 {#instrumentation}

アプリケーションに OpenTelemetry を追加するために、`CMakeLists.txt` ファイルを以下の追加の依存関係で更新します。

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# C++ 標準を設定する（例: C++17）
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# プロジェクトのソースファイルを定義する
set(SOURCES
    main.cpp  # ここにソースファイルを追加する
)

# 実行可能ターゲットを作成する
add_executable(dice-server ${SOURCES})

find_package(oatpp REQUIRED)
find_package(opentelemetry-cpp CONFIG REQUIRED)

target_link_libraries(dice-server PRIVATE
                      oatpp::oatpp
                      ${OPENTELEMETRY_CPP_LIBRARIES})
```

`main.cpp` ファイルを次のコードで更新して、トレーサーを初期化し、`/rolldice` リクエストハンドラーが呼ばれたときにスパンを出力するようにします。

```cpp
#include "oatpp/web/server/HttpConnectionHandler.hpp"
#include "oatpp/network/Server.hpp"
#include "oatpp/network/tcp/server/ConnectionProvider.hpp"

#include "opentelemetry/exporters/ostream/span_exporter_factory.h"
#include "opentelemetry/sdk/trace/exporter.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/simple_processor_factory.h"
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"
#include "opentelemetry/trace/provider.h"

#include <cstdlib>
#include <ctime>
#include <string>

using namespace std;
namespace trace_api = opentelemetry::trace;
namespace trace_sdk = opentelemetry::sdk::trace;
namespace trace_exporter = opentelemetry::exporter::trace;

namespace {
  void InitTracer() {
    auto exporter  = trace_exporter::OStreamSpanExporterFactory::Create();
    auto processor = trace_sdk::SimpleSpanProcessorFactory::Create(std::move(exporter));
    std::shared_ptr<opentelemetry::trace::TracerProvider> provider =
      trace_sdk::TracerProviderFactory::Create(std::move(processor));
    // グローバルトレースプロバイダーを設定する
    trace_api::Provider::SetTracerProvider(provider);
  }
  void CleanupTracer() {
    std::shared_ptr<opentelemetry::trace::TracerProvider> none;
    trace_api::Provider::SetTracerProvider(none);
  }

}

class Handler : public oatpp::web::server::HttpRequestHandler {
public:
  shared_ptr<OutgoingResponse> handle(const shared_ptr<IncomingRequest>& request) override {
    auto tracer = opentelemetry::trace::Provider::GetTracerProvider()->GetTracer("my-app-tracer");
    auto span = tracer->StartSpan("RollDiceServer");
    int low = 1;
    int high = 7;
    int random = rand() % (high - low) + low;
    // std::string を oatpp::String に変換する
    const string response = to_string(random);
    span->End();
    return ResponseFactory::createResponse(Status::CODE_200, response.c_str());
  }
};

void run() {
  auto router = oatpp::web::server::HttpRouter::createShared();
  router->route("GET", "/rolldice", std::make_shared<Handler>());
  auto connectionHandler = oatpp::web::server::HttpConnectionHandler::createShared(router);
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared({"localhost", 8080, oatpp::network::Address::IP_4});
  oatpp::network::Server server(connectionProvider, connectionHandler);
  OATPP_LOGI("Dice Server", "Server running on port %s", static_cast<const char*>(connectionProvider->getProperty("port").getData()));
  server.run();
}

int main() {
  oatpp::base::Environment::init();
  InitTracer();
  srand((int)time(0));
  run();
  oatpp::base::Environment::destroy();
  CleanupTracer();
  return 0;
}
```

プロジェクトを再びビルドします。

```bash
cd build
cmake .. -DCMAKE_PREFIX_PATH=$(pwd)/../../install
cmake --build .
```

プロジェクトのビルドが成功したら、生成された実行ファイルを実行できます。

```bash
./dice-server
```

<http://localhost:8080/rolldice> にリクエストを送ると、ターミナルにスパンが出力されます。

```json
{
  "name" : "RollDiceServer",
  "trace_id": "f47bea385dc55e4d17470d51f9d3130b",
  "span_id": "deed994b51f970fa",
  "tracestate" : ,
  "parent_span_id": "0000000000000000",
  "start": 1698991818716461000,
  "duration": 64697,
  "span kind": "Internal",
  "status": "Unset",
  "service.name": "unknown_service",
  "telemetry.sdk.language": "cpp",
  "telemetry.sdk.name": "opentelemetry",
  "telemetry.sdk.version": "1.11.0",
  "instr-lib": "my-app-tracer"
}
```

## 次のステップ {#next-steps}

コードの計装についての詳細は、[計装](/docs/languages/cpp/instrumentation)のドキュメントを参照してください。

また、テレメトリーデータを1つまたは複数のテレメトリーバックエンドに[エクスポート](/docs/languages/cpp/exporters/)するために、適切なエクスポーターを設定することも必要です。
