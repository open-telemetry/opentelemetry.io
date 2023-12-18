---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
cSpell:ignore: oatpp rolldice
weight: 10
---

This page will show you how to get started with OpenTelemetry in C++.

You will learn how to instrument a simple C++ application automatically,
such that [traces](/docs/concepts/signals/traces/), [metrics](/docs/concepts/signals/metrics/) and [logs](/docs/concepts/signals/logs/) are emitted to the terminal.

## Prerequisites 

Ensure that you have the following installed locally:

- Git
- C++ compiler supporting C++ version >= 14
- Make 
- CMake version >= 3.1

## Example Application 

The following example uses a basic [Oat++](https://oatpp.io/) application. If you are 
not using Oat++, that's OK - you can use OpenTelemetry C++ with any other web framework as well.

## Setup 

- Create a folder named `Opentelemetry-Starter-Project`.
- move into the newly created folder. This will serve as your working directory.
- Directory Structure: 
   ```plaintext 
   Opentelemetry-Starter-Project
   │
   ├── oatpp
   ├── opentelemetry-cpp
   └── roll-dice

   ```
  

## Dependencies 

To begin, install  Oat++ locally using the [source code](https://github.com/oatpp) and `make`, following these steps:

1. Obtain the Oat++ source code by cloning from the [oatpp/oatpp](https://github.com/oatpp/oatpp) GitHub repository:

   ```bash 
   git clone https://github.com/oatpp/oatpp.git
   ```

2. Navigate to the `oatpp` directory:

   ```bash 
   cd oatpp
   ```

3. Create a `build` subdirectory and navigate into it:
   ```bash
   mkdir build
   cd build
   ```

4. Build oatpp using the `cmake` and `make` commands. This command will trigger the build process specified in the `CMakeLists.txt` included in the oatpp source code.

   ```bash
   cmake ..
   make

5. Install oatpp:

   This command will install the built oatpp library and headers on your system, making it accessible for development in your project. 

   ```bash
   make install
   ```


Next, install and build [OpenTelemetry C++](https://github.com/open-telemetry/opentelemetry-cpp) locally using CMake, following these steps:

1. In your terminal, navigate back to the `Opentelemetry-Starter-Project` directory. Then, clone the OpenTelemetry C++ GitHub repository to your local machine:

   ```bash
   git clone https://github.com/open-telemetry/opentelemetry-cpp.git
   ```

2. Change your working directory to the OpenTelemetry C++ SDK directory.

   ```bash
   cd openTelemetry-cpp
   ```

3. Create a build directory and navigate into it:

   ```bash
   mkdir build
   cd build 
   ```

4. Configure and generate the build system:

   Run the CMake from the build directory to configure the build.

   ```bash
   cmake ..
   ```
   or 
   ```bash
   cmake -DWITH_ABSEIL=ON ..
   ```

5. Build the project:

   After configuring the build system, execute the build process.

   ```bash
   cmake --build .
   ```

OpenTelemetry C++ SDK directory structure should look something like this:
```scss 
   opentelemetry-cpp/
   │
   ├── CMakeLists.txt
   ├── sdk/
   |   ├── CMakeLists.txt (oatpp root CMake configuration file) 
   |   ├── src/
   |   |   └── ... (SDK source files) 
   |   |    
   |   ├── include/
   |   |   └── opentelemetry/
   |   |       └── sdk/
   |   |           ├── ... (SDK headers)
   |   |
   |   └── ... (other SDK-related files or subsirectories)  
   |   
   ├── build/
   |   ├── Makefile 
   |   ├── CMakeFiles/
   |   |   └── ... (CMake-generated files and configuration) 
   |   └── ... (other build-related files)
   |   
   ├── api/
   |   ├──CMakeLists.txt (CMake configuration file for the API)
   |   ├── include/
   |   |   └── opentelemetry/
   |   |       └── ... (API headers) 
   |   └── ... (other API-related files or subdirectories)
   | 
   └── ...(other opentelemetry-cpp file or subdirectories)

``` 

**Finally, create a new project directory called `roll-dice`.**

## Create and launch an HTTP Server

**Integrate oatpp in your project:**

In your `roll-dice` project, utilize the oatpp library by referencing the oatpp headers and linking them when compiling your project.. 

Create a file called `CMakeLists.txt` to define the oatpp library directories, include paths, and link against oatpp during the compilation process.

Here is what `CMakeLists.txt` might look like:

```cmake
cmake_minimum_required(VERSION 3.1)

# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)

set(project_name my-oatpp-project)

# Define your project's source files
set(SOURCES
    main.cpp  # Add your source files here
)

# Create an executable target
add_executable(myapp ${SOURCES})

set(OATPP_ROOT ../oatpp)
set(OATPP_LIB /path/to/oatpp/lib)

#set the path to the directory containing "oatpp" package configuration files 
include_directories(${OATPP_ROOT}/src)
target_link_libraries(myapp PRIVATE ${OATPP_LIB}/liboatpp.a)

```
Replace `/path/to/oatpp/lib` with the actual path leading to oatpp library header files within your local installation.

**Note:**

`${OATPP_ROOT}/src` should contain header filies with `.hpp` extensions.

You can manually search for the oatpp library using terminal commands. For Instance, on Unix-based systems, the `find` command could be used:
```bash
find / -name 'liboatpp.a' 2>/dev/null
```   

**Create a simple API for rolling a dice:**

Next, the sample HTTP server source code is needed. It will do the following:

* Initialize an HTTP router and set up a request handler to generate a random number as the response when a GET request is made to the `/rolldice` endpoint. 
* Next, create a connection handler, a connection provider, and start the server on <localhost:8000>.
* Lastly, initialize and run the application within the main function.

In that `roll-dice` folder, create a file called `main.cpp` and add the following code to the file:

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
    srand((int)time(0));
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
  OATPP_LOGI("MyApp", "Server running on port %s", connectionProvider->getProperty("port").getData());
  server.run();
}

int main() {
  oatpp::base::Environment::init();
  run();
  oatpp::base::Environment::destroy();
  return 0;
}

```
**Build and run your application:**

Build and run the application with the following CMake commands.

```bash
mkdir build
cd build 
cmake ..
cmake --build .
```

After successfully building your project, you can run the generated executable.

```bash
./myapp
```

Then, open <http://localhost:8080/rolldice> in your browser to ensure it is working.


## Instrumentation 

**Integrate OpenTelemetry in your project:**

To add OpenTelemetry to your application, update the `CMakeLists.txt` file with the
following additional dependencies: 

```cmake
# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)

set(project_name my-oatpp-project)

# Define your project's source files
set(SOURCES
    main.cpp  # Add your source files here
)

# Create an executable target
add_executable(myapp ${SOURCES})

set(OATPP_ROOT ../oatpp)
set(OATPP_LIB /path/to/oatpp/lib)
set(OPENTELEMETRY_ROOT ../opentelemetry-cpp)

#set the path to the directory containing "oatpp" package configuration files 
include_directories(${OATPP_ROOT}/src)
target_link_libraries(myapp PRIVATE ${OATPP_LIB}/liboatpp.a)

#set the path to the directory containing "pentelemetry-cpp" package configuration files 
include_directories(${OPENTELEMETRY_ROOT}/api/include)
include_directories(${OPENTELEMETRY_ROOT}/sdk/include)
include_directories(${OPENTELEMETRY_ROOT}/sdk/src)
include_directories(${OPENTELEMETRY_ROOT}/exporters/ostream/include)
target_link_libraries(myapp PRIVATE ${OPENTELEMETRY_ROOT}/build/sdk/src/trace/libopentelemetry_trace.a
 ${OPENTELEMETRY_ROOT}/build/sdk/src/common/libopentelemetry_common.a
 ${OPENTELEMETRY_ROOT}/build/exporters/ostream/libopentelemetry_exporter_ostream_span.a
 ${OPENTELEMETRY_ROOT}/build/sdk/src/resource/libopentelemetry_resources.a)
```

**OpenTelemetry tracing configuration:**

Update the `main.cpp` file with code to initialize a tracer and to emit spans when the `/rolldice` request handler is called: 

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
    auto span = tracer->StartSpan("RollDice");
    int low = 1;
    int high = 7;
    srand((int)time(0));
    int random = rand() % (high - low) + low;
    // Convert a std::string to oatpp::String
    const string response = to_string(random); 
    return ResponseFactory::createResponse(Status::CODE_200, response.c_str());
    span->End();
  }
};

void run() {
  auto router = oatpp::web::server::HttpRouter::createShared();
  router->route("GET", "/rolldice", std::make_shared<Handler>());
  auto connectionHandler = oatpp::web::server::HttpConnectionHandler::createShared(router);
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared({"localhost", 8000, oatpp::network::Address::IP_4});
  oatpp::network::Server server(connectionProvider, connectionHandler);
  OATPP_LOGI("MyApp", "Server running on port %s", connectionProvider->getProperty("port").getData());
  server.run();
}

int main() {
  oatpp::base::Environment::init();
  InitTracer();
  run();
  oatpp::base::Environment::destroy();
  CleanupTracer();
  return 0;
}

```

**Build your project again:**

```bash
cd build 
cmake ..
cmake --build .
```

**After successfully building your project, you can run the generated executable:**

```bash
./myapp
```

When you send a request to the server at <http://localhost:8080/rolldice>, you will see a span being emitted to the terminal: 

```json
{
  "name" : "RollDice",
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

## Next Steps 

Enrich your instrumentation generated automatically with
[manual instrumentation](/docs/instrumentation/cpp/manual) of your own
codebase. This gets you customized observability data.

Take a look at available
[Exporters](/docs/instrumentation/cpp/exporters/) that
generate telemetry data for popular frameworks and libraries.

[traces]: /docs/concepts/signals/traces/ 