---
title: Початок роботи
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
weight: 10
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: oatpp rolldice
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у C++.

Ви дізнаєтесь, як інструментувати простий застосунок на C++, щоб [трейси](/docs/concepts/signals/traces/) відображалися в терміналі.

## Передумови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- Git
- Компілятор C++, що підтримує версію C++ >= 14
- Make
- CMake версії >= 3.25

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Oat++](https://oatpp.io/). Якщо ви не використовуєте Oat++, це не проблема — ви можете використовувати OpenTelemetry C++ з будь-яким іншим веб-фреймворком.

## Налаштування {#setup}

- Створіть теку з назвою `otel-cpp-starter`.
- Перейдіть у новостворену теку. Це буде ваша робоча тека.
- Після налаштування залежностей ваша структура тек повинна виглядати так:

  ```plaintext
  otel-cpp-starter
  │
  ├── oatpp
  ├── opentelemetry-cpp
  └── roll-dice
  ```

## Залежності {#dependencies}

Для початку встановіть Oat++ локально, використовуючи [вихідний код](https://github.com/oatpp) та `make`, виконавши наступні кроки:

1. Отримайте вихідний код Oat++, клонуючи з [oatpp/oatpp](https://github.com/oatpp/oatpp) репозиторію GitHub.

   ```bash
   git clone https://github.com/oatpp/oatpp.git
   ```

2. Перейдіть до директорії `oatpp` та переключіться на версію 1.3.0:

   ```bash
   cd oatpp
   git checkout 1.3.0-latest
   ```

3. Створіть вкладену теку `build` та перейдіть у неї.

   ```bash
   mkdir build
   cd build
   ```

4. Зберіть oatpp, використовуючи команди `cmake` та `make`. Ця команда запустить процес збірки, вказаний у `CMakeLists.txt`, що входить до вихідного коду oatpp.

   ```bash
   cmake ..
   make
   ```

5. Встановіть oatpp.

Ця команда встановить зібрану бібліотеку oatpp та заголовки у вашу систему, роблячи їх доступними для розробки у вашому проєкті.

```bash
sudo make install
```

Щоб видалити встановлену бібліотеку oatpp та заголовки з вашої системи.

```bash
sudo make uninstall
```

Далі, встановіть та зберіть [OpenTelemetry C++](https://github.com/open-telemetry/opentelemetry-cpp) локально використовуючи CMake, виконавши наступні кроки:

1. У вашому терміналі поверніться до теки `otel-cpp-starter`. Потім, клонуйте репозиторій OpenTelemetry C++ GitHub на ваш локальний компʼютер.

   ```bash
   git clone https://github.com/open-telemetry/opentelemetry-cpp.git
   ```

2. Змініть вашу робочу теку на теку SDK OpenTelemetry C++.

   ```bash
   cd opentelemetry-cpp
   ```

3. Створіть теку збірки та перейдіть у неї.

   ```bash
   mkdir build
   cd build
   ```

4. У теці `build` запустіть CMake, щоб налаштувати та згенерувати систему збірки без увімкнення тестів:

   ```bash
   cmake -DBUILD_TESTING=OFF ..
   ```

   Або, якщо `cmake --build` не вдається, ви також можете спробувати:

   ```bash
   cmake -DBUILD_TESTING=OFF -DWITH_ABSEIL=ON ..
   ```

5. Виконайте процес збірки:

   ```bash
   cmake --build .
   ```

6. Встановіть OpenTelemetry C++ в otel-cpp-starter/otel-cpp:

   ```bash
   cmake --install . --prefix ../../otel-cpp
   ```

З Oat++ та OpenTelemetry C++ готовими, ви можете продовжити створення HTTP сервера, який ми хочемо інструментувати згодом.

## Створення та запуск HTTP сервера

У вашій теці `otel-cpp-starter` створіть вкладену теку `roll-dice`, де бібліотека Oat++ буде використовуватися шляхом посилання на заголовки oatpp та звʼязування їх під час компіляції вашого проєкту.

Створіть файл з назвою `CMakeLists.txt` всередині `roll-dice`, щоб визначити теці бібліотеки Oat++, шляхи включення та звʼязати їх під час процесу компіляції.

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# Визначте вихідні файли вашого проєкту
set(SOURCES
    main.cpp  # Додайте ваші вихідні файли тут
)

# Створіть цільовий виконуваний файл
add_executable(dice-server ${SOURCES})

set(OATPP_ROOT ../oatpp)
find_library(OATPP_LIB NAMES liboatpp.a HINTS "${OATPP_ROOT}/build/src/" NO_DEFAULT_PATH)

if (NOT OATPP_LIB)
  message(SEND_ERROR "Не знайдено бібліотеку oatpp ${OATPP_ROOT}/build/src")
endif()
# встановіть шлях до теки, що містить файли конфігурації пакунка "oatpp"
include_directories(${OATPP_ROOT}/src)
target_link_libraries(dice-server PRIVATE ${OATPP_LIB})
```

Далі, потрібен зразок коду HTTP сервера. Він буде виконувати наступне:

- Ініціалізувати HTTP маршрутизатор та налаштувати обробник запитів для генерації випадкового числа як відповідь на GET запит до кінцевої точки `/rolldice`.
- Далі, створити обробник зʼєднань, постачальника зʼєднань та запустити сервер на <http://localhost:8080>.
- Нарешті, ініціалізувати та запустити застосунок у головній функції.

У цій теці `roll-dice` створіть файл під назвою `main.cpp` та додайте наступний код до файлу.

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
    // Перетворити std::string на oatpp::String
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
  OATPP_LOGI("Dice Server", "Сервер працює на порту %s", static_cast<const char*>(connectionProvider->getProperty("port").getData()));
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

Зберіть та запустіть застосунок за допомогою наступних команд CMake.

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

Після успішної збірки вашого проєкту ви можете запустити згенерований виконуваний файл.

```bash
./dice-server
```

Потім відкрийте <http://localhost:8080/rolldice> у вашому оглядачі, щоб переконатися, що він працює.

## Інструментування {#instrumentation}

Щоб додати OpenTelemetry до вашого застосунку, оновіть файл `CMakeLists.txt` з наступними додатковими залежностями.

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# Визначте вихідні файли вашого проєкту
set(SOURCES
    main.cpp  # Додайте ваші вихідні файли тут
)
# Створіть цільовий виконуваний файл
add_executable(dice-server ${SOURCES})

set(OATPP_ROOT ../oatpp)
set(opentelemetry-cpp_DIR ../otel-cpp/lib/cmake/opentelemetry-cpp)
find_library(OATPP_LIB NAMES liboatpp.a HINTS "${OATPP_ROOT}/build/src/" NO_DEFAULT_PATH)
if (NOT OATPP_LIB)
  message(SEND_ERROR "Не знайдено бібліотеку oatpp ${OATPP_ROOT}/build/src")
endif()
# встановіть шлях до теки, що містить файли конфігурації пакунка "oatpp"
include_directories(${OATPP_ROOT}/src)

# Використовуйте find_package для включення OpenTelemetry C++
find_package(opentelemetry-cpp CONFIG REQUIRED NO_DEFAULT_PATH)

# Звʼяжіть з кожною бібліотекою OpenTelemetry C++
target_link_libraries(dice-server PRIVATE
                      ${OATPP_LIB}
                      ${OPENTELEMETRY_CPP_LIBRARIES})
```

Оновіть файл `main.cpp` з наступним кодом, щоб ініціалізувати трасувальник та генерувати відрізки, коли викликається обробник запитів `/rolldice`.

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
    //встановити глобального постачальника трасування
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
    // Перетворити std::string на oatpp::String
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
  OATPP_LOGI("Dice Server", "Сервер працює на порту %s", static_cast<const char*>(connectionProvider->getProperty("port").getData()));
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

Зберіть ваш проєкт знову.

```bash
cd build
cmake ..
cmake --build .
```

Після успішної збірки вашого проєкту ви можете запустити згенерований виконуваний файл.

```bash
./dice-server
```

Коли ви надішлете запит на сервер за адресою <http://localhost:8080/rolldice>, ви побачите, як відрізок передається в термінал.

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

## Наступні кроки {#next-steps}

Для отримання додаткової інформації про інструментування вашого коду, зверніться до [документації з інструментування](/docs/languages/cpp/instrumentation).

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/cpp/exporters/) до одного або кількох бекендів телеметрії.
