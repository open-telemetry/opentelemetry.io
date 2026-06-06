---
title: Primeros Pasos con Ejemplos
description:
  ¡Obtén datos de telemetría para tu aplicación en menos de 5 minutos!
weight: 10
cSpell:ignore: oatpp rolldice
default_lang_commit: 1f686d5f7b6bbdfaa30dafdc6ca0214c6f2308db
---

Esta página te muestra cómo dar los primeros pasos con OpenTelemetry en C++.

Aprenderás a instrumentar una aplicación sencilla en C++, de forma que se emitan
[trazas](/docs/concepts/signals/traces/) a la terminal.

## Prerrequisitos

Asegúrate de tener instalado localmente lo siguiente:

- Git
- Compilador de C++ compatible con la versión >= 14 de C++
- Make
- Versión de CMake >= 3.25

## Aplicación de Ejemplo

El siguiente ejemplo utiliza una applicación básica de
[Oat++](https://oatpp.io/). Si no utilizas Oat++, no hay problema; también
puedes usar OpenTelemetry C++ con cualquier otro framework web.

## Configuración

- Crea una carpeta llamada `otel-cpp-starter`.
- Accede a la carpeta recién creada. Esta será tu directorio de trabajo.
- Después de establecer las dependencias, tu estructura de directorios debería
  ser similar a esta:

  ```plaintext
  otel-cpp-starter
  │
  ├── oatpp
  ├── opentelemetry-cpp
  └── roll-dice
  ```

## Dependencias

Para empezar, instala Oat++ localmente usando el
[código fuente](https://github.com/oatpp) y `make`, siguiendo estos pasos:

1. Obtén el código fuente de Oat++ clonándolo desde el repositorio
   [oatpp/oatpp](https://github.com/oatpp/oatpp) de GitHub.

   ```bash
   git clone https://github.com/oatpp/oatpp.git
   ```

2. Navega al directorio `oatpp` y cambia a la versión 1.3.0 por ahora:

   ```bash
   cd oatpp
   git checkout 1.3.0-latest
   ```

3. Crea un subdirectorio `build` y accede a él.

   ```bash
   mkdir build
   cd build
   ```

4. Compila oatpp usando los comandos `cmake` y `make`. Este comando iniciará
   el proceso de compilación especificado en el fichero `CMakeLists.txt`
   incluido en el código fuente de oatpp.

   ```bash
   cmake ..
   make
   ```

5. Instala oatpp en un prefijo o directorio de instalación local. Este comando
   instala la librería oatpp compilada, los archivos de cabecera y la
   configuración del paquete CMake en el directorio `install`, haciéndolo
   accesible para el desarrollo.

   ```bash
   cmake --install . --prefix ../../install
   ```

A continuación, instala y construye
[OpenTelemetry C++](https://github.com/open-telemetry/opentelemetry-cpp)
localmente usando CMake, siguiendo estos pasos:

1. En tu terminal, vuelve al directorio `otel-cpp-starter`. Luego, clona el
   repositorio de GitHub de OpenTelemetry C++ en tu máquina local.

   ```bash
   git clone https://github.com/open-telemetry/opentelemetry-cpp.git
   ```

2. Cambia tu directorio de trabajo al directorio del SDK de OpenTelemetry C++.

   ```bash
   cd opentelemetry-cpp
   ```

3. Crea un directorio de compilación y accede a él.

   ```bash
   mkdir build
   cd build
   ```

4. En el directorio `build`, ejecuta CMake para configurar y generar el sistema
   de compilación sin habilitar los tests:

   ```bash
   cmake -DBUILD_TESTING=OFF ..
   ```

   O bien, si `cmake --build` falla, también puedes probar:

   ```bash
   cmake -DBUILD_TESTING=OFF -DWITH_ABSEIL=ON ..
   ```

5. Ejecuta el proceso de construcción:

   ```bash
   cmake --build .
   ```

6. Instala OpenTelemetry C++ en el mismo prefijo o directorio de instalación
   local:

   ```bash
   cmake --install . --prefix ../../install
   ```

Con Oat++ y OpenTelemetry C++ lists, puedes continuar con la creación del
servidor HTTP, que queremos instrumentar posteriormente.

## Crea y levanta un Servidor HTTP

En tu carpeta `otel-cpp-starter`, crea un subcarpeta `roll-dice`, donde se
utilizará la libería Oat++, incluyendo los archivos de cabecera de oatpp y
enlazándolos durante la compilación de tu proyecto.

Dentro de `roll-dice`, crea un fichero llamado `CMakeLists.txt` para definir los
directorios de la libería de Oatp++, incluir las rutas de directorio, y enlazar
con Oat++ durante el proceso de compilación.

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# Set C++ standard (e.g., C++17)
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# Define los ficheros fuente de tu proyecto
set(SOURCES
    main.cpp  # Añade aquí tus fiecheros fuentes
)

# Crea un objectivo ejectuable
add_executable(dice-server ${SOURCES})

find_package(oatpp REQUIRED)

target_link_libraries(dice-server PRIVATE oatpp::oatpp)
```

A continuación, se necesita el código fuente de ejemplo del servidor HTTP. Este
realizará lo siguiente:

- Inicializará un router HTTP y configurará un gestor de solicitudes para
  generar un número aleatorio como respuesta cuando se realice una solicitud GET
  al endpoint `/rolldice`.
- Luego, creará un gestor de conexiones, un proveedor de conexiones, e iniciará
  el servidor en <http://localhost:8080>.
- Por último, inicializará y ejecutará la aplicación dentro de la función
  principal.

En la carpeta `roll-dice`, crea un fichero llamado `main.cpp` y añade el
siguiente código.

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
    // Convierte un std::string a oatpp::String
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

Construye y ejecuta la aplicación con los siguientes comandos cd CMake:

```bash
mkdir build
cd build
cmake .. -DCMAKE_PREFIX_PATH=$(pwd)/../../install
cmake --build .
```

Tras construir correctamente tu proyecto, puedees ejecutar el ejecutable
generado.

```bash
./dice-server
```

Luego, abre <http://localhost:8080/rolldice> en tu navegador para comprobar que
funciona.

## Instrumentación

Para agregar OpenTelemetry a tu aplicación, actualiza el fichero
`CMakeLists.txt` con las siguientes dependencias adicionales.

```cmake
cmake_minimum_required(VERSION 3.25)
project(RollDiceServer)
# Establece el estándar C++ (p.e., C++17)
set(CMAKE_CXX_STANDARD 17)
set(project_name roll-dice-server)

# Define los ficheros fuente de tu proyecto
set(SOURCES
    main.cpp  # Añade aquí tus ficheros fuente
)

# Crea un objetivo ejecutable
add_executable(dice-server ${SOURCES})

find_package(oatpp REQUIRED)
find_package(opentelemetry-cpp CONFIG REQUIRED)

target_link_libraries(dice-server PRIVATE
                      oatpp::oatpp
                      ${OPENTELEMETRY_CPP_LIBRARIES})
```

Actualiza el fichero `main.cpp` con siguiente código para inicializar un
traceador y emitir spans cuando se llame al controlador de solicitudes
`/rolldice`.

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
    // Convertir un std::string a oatpp::String
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

Construye de nuevo tu proyecto.

```bash
cd build
cmake .. -DCMAKE_PREFIX_PATH=$(pwd)/../../install
cmake --build .
```

Tras construir correctamente tu proyecto, puedes ejectuar el archivo ejecutable
generado.

```bash
./dice-server
```

Cuando envíes una solicitud al servidor en <http://localhost:8080/rolldice>,
verás un span en la terminal.

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

## Siguientes pasos

Para más información sobre cómo instrumentar tu código, consulta la
documentación de [instrumentación](/docs/languages/cpp/instrumentation).

También deberás configurar un exportador adecuado para
[exportar tus datos de telemetría](/docs/languages/cpp/exporters/) a uno o más
sistemas de telemetría.
