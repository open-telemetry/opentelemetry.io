---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
cSpell:ignore: rolldice
weight: 10
---

This page will show you how to get started with OpenTelemetry in C++.

You will learn how you can instrument a simple C++ application automatically, in
such a way that [traces](/docs/concepts/signals/traces/), [metrics](/docs/concepts/signals/metrics/) and [logs](/docs/concepts/signals/logs/) are emitted to the console.

## Prerequisites 

Ensure that you have the following installed locally:

- Git
- C++ compiler supporting C++ version >= 11
- Make 
- CMake version >= 3.1
- [Conan](https://conan.io/)

## Example Application 

The following example uses a basic [Oat++](https://oatpp.io/) application. If you are not using 
Oat++, that's OK - you can use OpenTelemetry C++ with other web frameworks 
as well, such as Crow and POCO. For a complete list of 
libraries for supported frameworks, see the [registry](/ecosystem/registry/?language=cpp).  

## Dependencies 

To begin, set up an environment in a new directory called `cpp-simple`. Within
that directory, install the oatpp locally using package manager Conan.

Create a Conan profile for your project 

```bash
conan profile new cpp-simple --detect
```

Install oatpp in your project directory using Conan 

```bash
conan install . --profile=cpp-simple 
```

This will create a `conanfile.txt` file in your project directory, which includes oatpp as a dependency.

Now open the `conanfile.txt` file in a text editor and add oatpp as a dependency:

```plaintext
[requires]
oatpp/1.2.0  # Use the desired version of oatpp

[generators]
cmake
```

Finally run the following command to locally install oatpp the project dependency: 

```bash
conan install . 
```

## Create and launch an HTTP Server

In that same folder, create a file called `main.cpp` and add the following code to the file:

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
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared({"localhost", 8000, oatpp::network::Address::IP_4});
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

Create another file called `CMakeLists.txt` and it is used to define the build process for 
your C++ project, inclduing how to compile and link your oatpp and OpenTelemetry 
application. Here is what `CMakeLists.txt` might look like:

```plaintext
cmake_minimum_required(VERSION 3.1)
set(project_name my-oatpp-project)

# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)

# Find Conan-generated build information
include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup(TARGETS)  # Use TARGETS to link Conan libraries


# Define your project's source files
set(SOURCES
    main.cpp  # Add your source files here
)

# Create an executable target
add_executable(myapp ${SOURCES})

# Link Conan libraries (oatpp and its dependencies)
target_link_libraries(myapp PRIVATE CONAN_PKG::oatpp)

```

Build and run the application with the following CMake commands, then open
<http://localhost:8080/rolldice> in your browser to ensure it is working.

```bash
mkdir build
cd build 
cmake ..
cmake --build .
```

After successfully building your project, you can run the generated executable:

```bash
./myapp
```

## Instrumentation 

To begin, install and build `openTelemetry-cpp` library locally using CMake.
Naviagte outside of your `cpp-simple` directory and run the following commands:

```bash
git clone https://github.com/open-telemetry/opentelemetry-cpp
cd opentelemetry-cpp
mkdir build && cd build
cmake ..
make
make install
```

To add OpenTelemetry to your application, update the `CMakeLists.txt` file with the
following additional dependencies: 

```plaintext
cmake_minimum_required(VERSION 3.1)
set(project_name my-oatpp-project)

# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 14)

# Find Conan-generated build information
include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup(TARGETS)  # Use TARGETS to link Conan libraries


# Define your project's source files
set(SOURCES
    main.cpp  # Add your source files here
)

# Create an executable target
add_executable(myapp ${SOURCES})

# Link Conan libraries (oatpp and its dependencies)
target_link_libraries(myapp PRIVATE CONAN_PKG::oatpp)


#set the path to the directory containing "opentelemetry-cpp" package configuration files 
find_package(opentelemetry-cpp CONFIG REQUIRED)
message(STATUS "Using opentelemetry-cpp at: ${OPENTELEMETRY_CPP_INCLUDE_DIRS}")
message(STATUS "Using opentelemetry-cpp libraries: ${OPENTELEMETRY_CPP_LIBRARIES}")


#first include directories 
target_link_directories(AlcorControlAgent PRIVATE ${OPENTELEMETRY_CPP_INCLUDE_DIRS})
target_link_directories(AlcorControlAgent PRIVATE /Users/q/Desktop/opentelemetry-cpp/)
target_link_directories(AlcorControlAgent PRIVATE /Users/q/Desktop/opentelemetry-cpp//sdk)
```

Update the `main.cpp` file with code to initialize a tracer and to emit spans when the `rolldice` request handler is called: 

```cpp
#include "oatpp/web/server/HttpConnectionHandler.hpp"
#include "oatpp/network/Server.hpp"
#include "oatpp/network/tcp/server/ConnectionProvider.hpp"
#include <cstdlib>
#include <ctime>
#include <string>


// sdk::TracerProvider is just used to call ForceFlush and prevent to cancel running exportings when
// destroy and shutdown exporters.It's optional to users.
#include "sdk/trace/tracer_provider.h"

using namespace std;

opentelemetry::api::trace::Tracer tracer = opentelemetry::api::Provider::GetTracer("your_component");

auto span = tracer.StartSpan("your_operaion");

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
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared({"localhost", 8000, oatpp::network::Address::IP_4});
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

span.End();
```

Build your project again:

```bash
mkdir build
cd build 
cmake ..
cmake --build .
```

After successfully building your project, you can run the generated executable:

```bash
./myapp
```

When you send a request to the server at <http://localhost:8080/rolldice>, you will see a span being emitted to the console (output is pretty printed for convenience): 
```json
json data type goes here 
```

## Next Steps 

Enrich your instrumentation generated automatically with
[manual instrumentation](/docs/instrumentation/cpp/manual) of your own
codebase. This gets you customized observability data.

Take a look at available
[Exporters](/docs/instrumentation/cpp/exporters/) that
generate telemetry data for popular frameworks and libraries.

[traces]: /docs/concepts/signals/traces/