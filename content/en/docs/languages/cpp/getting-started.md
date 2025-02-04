---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
weight: 10
cSpell:ignore: oatpp rolldice
---

This page will show you how to get started with OpenTelemetry in C++.

You will learn how to instrument a simple C++ application, such that
[traces](/docs/concepts/signals/traces/) are emitted to the terminal.

## Prerequisites

Ensure that you have the following installed locally:

- Git
- C++ compiler supporting C++ version >= 14
- Make
- CMake version >= 3.25

## Example application

The following example uses a basic [Oat++](https://oatpp.io/) application. If
you are not using Oat++, that's OK - you can use OpenTelemetry C++ with any
other web framework as well.

## Setup

- Create a folder named `otel-cpp-starter`.
- move into the newly created folder. This will serve as your working directory.
- After setting up dependencies, your directory structure should resemble this:

  ```plaintext
  otel-cpp-starter
  │
  ├── oatpp
  ├── opentelemetry-cpp
  └── roll-dice
  ```

## Dependencies

To begin, install Oat++ locally using the
[source code](https://github.com/oatpp) and `make`, following these steps:

1. Obtain the Oat++ source code by cloning from the
   [oatpp/oatpp](https://github.com/oatpp/oatpp) GitHub repository.

   ```bash
   git clone https://github.com/oatpp/oatpp.git
   ```

2. Navigate to the `oatpp` directory and switch to 1.3.0 version for now:

   ```bash
   cd oatpp
   git checkout 1.3.0-latest
   ```

3. Create a `build` subdirectory and navigate into it.

   ```bash
   mkdir build
   cd build
   ```

4. Build oatpp using the `cmake` and `make` commands. This command will trigger
   the build process specified in the `CMakeLists.txt` included in the oatpp
   source code.

   ```bash
   cmake ..
   make
   ```

5. Install oatpp.

This command will install the built oatpp library and headers on your system,
making it accessible for development in your project.

```bash
sudo make install
```

To uninstall the built oatpp library and headers from your system.

```bash
sudo make uninstall
```

Next, install and build
[OpenTelemetry C++](https://github.com/open-telemetry/opentelemetry-cpp) locally
using CMake, following these steps:

1. In your terminal, navigate back to the `otel-cpp-starter` directory. Then,
   clone the OpenTelemetry C++ GitHub repository to your local machine.

   ```bash
   git clone https://github.com/open-telemetry/opentelemetry-cpp.git
   ```

2. Change your working directory to the OpenTelemetry C++ SDK directory.

   ```bash
   cd opentelemetry-cpp
   ```

3. Create a build directory and navigate into it.

   ```bash
   mkdir build
   cd build
   ```

4. In the `build` directory run CMake, to configure and generate the build
   system without enabling tests:

   ```bash
   cmake -DBUILD_TESTING=OFF ..
   ```

   Or, if the `cmake --build` fails, you can also try:

   ```bash
   cmake -DBUILD_TESTING=OFF -DWITH_ABSEIL=ON ..
   ```

5. Execute the build process:

   ```bash
   cmake --build .
   ```

6. Install OpenTelemetry C++ in otel-cpp-starter/otel-cpp:

   ```bash
   cmake --install . --prefix ../../otel-cpp
   ```

With Oat++ and OpenTelemetry C++ ready, you can continue with creating the HTTP
Server, that we want to instrument eventually.

## Create and launch an HTTP Server

In your `otel-cpp-starter` folder, create a subfolder `roll-dice`, where the
Oat++ library will be used by referencing the oatpp headers and linking them
when compiling your project.

Create a file called `CMakeLists.txt` inside `roll-dice` to define the Oat++
library directories, include paths, and link against Oat++ during the
compilation process.

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# Define your project's source files
set(SOURCES
    main.cpp  # Add your source files here
)

# Create an executable target
add_executable(dice-server ${SOURCES})

set(OATPP_ROOT ../oatpp)
find_library(OATPP_LIB NAMES liboatpp.a HINTS "${OATPP_ROOT}/build/src/" NO_DEFAULT_PATH)

if (NOT OATPP_LIB)
  message(SEND_ERROR "Did not find oatpp library ${OATPP_ROOT}/build/src")
endif()
#set the path to the directory containing "oatpp" package configuration files
include_directories(${OATPP_ROOT}/src)
target_link_libraries(dice-server PRIVATE ${OATPP_LIB})
```

Next, the sample HTTP server source code is needed. It will do the following:

- Initialize an HTTP router and set up a request handler to generate a random
  number as the response when a GET request is made to the `/rolldice` endpoint.
- Next, create a connection handler, a connection provider, and start the server
  on <localhost:8080>.
- Lastly, initialize and run the application within the main function.

In that `roll-dice` folder, create a file called `main.cpp` and add the
following code to the file.

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
    // Convert a std::string to oatpp::String
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

Build and run the application with the following CMake commands.

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

After successfully building your project, you can run the generated executable.

```bash
./dice-server
```

Then, open <http://localhost:8080/rolldice> in your browser to ensure it is
working.

## Instrumentation

To add OpenTelemetry to your application, update the `CMakeLists.txt` file with
the following additional dependencies.

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# Define your project's source files
set(SOURCES
    main.cpp  # Add your source files here
)
# Create an executable target
add_executable(dice-server ${SOURCES})

set(OATPP_ROOT ../oatpp)
set(opentelemetry-cpp_DIR ../otel-cpp/lib/cmake/opentelemetry-cpp)
find_library(OATPP_LIB NAMES liboatpp.a HINTS "${OATPP_ROOT}/build/src/" NO_DEFAULT_PATH)
if (NOT OATPP_LIB)
  message(SEND_ERROR "Did not find oatpp library ${OATPP_ROOT}/build/src")
endif()
# set the path to the directory containing "oatpp" package configuration files
include_directories(${OATPP_ROOT}/src)

# Use find_package to include OpenTelemetry C++
find_package(opentelemetry-cpp CONFIG REQUIRED NO_DEFAULT_PATH)

# Link against each OpenTelemetry C++ library
target_link_libraries(dice-server PRIVATE
                      ${OATPP_LIB}
                      ${OPENTELEMETRY_CPP_LIBRARIES})
```

Update the `main.cpp` file with the following code to initialize a tracer and to
emit spans when the `/rolldice` request handler is called.

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
    //set the global trace provider
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
    // Convert a std::string to oatpp::String
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

Build your project again.

```bash
cd build
cmake ..
cmake --build .
```

After successfully building your project, you can run the generated executable.

```bash
./dice-server
```

When you send a request to the server at <http://localhost:8080/rolldice>, you
will see a span being emitted to the terminal.

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

## Next steps

For more information about instrumenting your code, refer the
[instrumentation](/docs/languages/cpp/instrumentation) documentation.

You’ll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/cpp/exporters/) to one or more
telemetry backends.
