---
title: Solución de problemas de instrumentación automática de .NET
linkTitle: Solución de problemas
weight: 50
cSpell:ignore: corehost netfx pjanotti's TRACEFILE
---

## Pasos generales {#general-steps}

Si encuentras algún problema con OpenTelemetry .NET Automatic Instrumentation,
hay varios pasos que pueden ayudarte a comprenderlo.

### Habilitar el registro detallado {#enable-detailed-logging}

Los registros de depuración detallados pueden ayudarte a solucionar problemas de
instrumentación y adjuntarse a las incidencias de este proyecto para facilitar
la investigación.

Para obtener los registros detallados de OpenTelemetry .NET Automatic Instrumentation,
establece la variable de entorno [`OTEL_LOG_LEVEL`](../configuration#internal-logs)
en `debug` antes de que se inicie el proceso instrumentado.

De forma predeterminada, la librería escribe los archivos de registro en
[ubicaciones](../configuration#internal-logs) predefinidas. Si es necesario,
cambia la ubicación predeterminada actualizando la variable de entorno
`OTEL_DOTNET_AUTO_LOG_DIRECTORY`.

Después de obtener los registros, elimina la variable de entorno
`OTEL_LOG_LEVEL` o establécela en un nivel menos detallado para evitar una
sobrecarga innecesaria.

### Habilitar el seguimiento del host {#enable-host-tracing}

El [seguimiento del host](https://github.com/dotnet/runtime/blob/edd23fcb1b350cb1a53fa409200da55e9c33e99e/docs/design/features/host-tracing.md#host-tracing)
puede utilizarse para recopilar la información necesaria para investigar
problemas relacionados con diversos casos, como ensamblados que no se
encuentran. Establece las siguientes variables de entorno:

```terminal
COREHOST_TRACE=1
COREHOST_TRACEFILE=corehost_verbose_tracing.log
```

A continuación, reinicia la aplicación para recopilar los registros.

## Problemas comunes {#common-issues}

### No se genera telemetría {#no-telemetry-is-produced}

No se genera telemetría. No hay registros en la
[ubicación](../configuration#internal-logs) de los registros internos de
OpenTelemetry .NET Automatic Instrumentation.

Puede ocurrir que .NET Profiler no pueda conectarse y, por tanto, no se emitan
registros.

La razón más común es que la aplicación instrumentada no tiene permisos para
cargar los ensamblados de OpenTelemetry .NET Automatic Instrumentation.

### No se pudo instalar el paquete 'OpenTelemetry.AutoInstrumentation.Runtime.Native' {#could-not-install-package-opentelemetryautoinstrumentationruntimenative}

Al añadir los paquetes NuGet al proyecto, aparece un mensaje de error similar
a este:

```txt
Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native 1.6.0'. You are trying to install this package into a project that targets '.NETFramework,Version=v4.7.2', but the package does not contain any assembly references or content files that are compatible with that framework. For more information, contact the package author.
```

Los paquetes NuGet no admiten proyectos `csproj` de estilo antiguo. Implementa
la instrumentación automática en la máquina en lugar de utilizar paquetes NuGet
o migra el proyecto al estilo SDK `csproj`.

### Problemas de rendimiento {#performance-issues}

Si se produce un uso elevado de CPU, asegúrate de no haber habilitado la
instrumentación automática de forma global mediante el establecimiento de las
variables de entorno en el ámbito del sistema o del usuario.

Si el uso del ámbito del sistema o del usuario es intencionado, utiliza las
variables de entorno
[`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`](../configuration#global-settings) para
excluir aplicaciones de la instrumentación automática.

### La herramienta CLI `dotnet` se bloquea {#dotnet-cli-tool-is-crashing}

Al ejecutar una aplicación, por ejemplo con `dotnet run`, aparecen mensajes de
error similares al siguiente:

```txt
PS C:\Users\Administrator\Desktop\OTelConsole-NET6.0> dotnet run My.Simple.Console
Unhandled exception. System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.TypeInitializationException: The type initializer for 'OpenTelemetry.AutoInstrumentation.Loader.Startup' threw an exception.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.Configuration.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.
```

Con la versión `v0.6.0-beta.1` e inferiores, se producían problemas al
instrumentar la herramienta CLI `dotnet`.

Por lo tanto, si utilizas una de estas versiones, te recomendamos ejecutar
`dotnet build` antes de instrumentar la sesión de terminal o llamarlo en una
sesión de terminal independiente.

Consulta [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
para obtener más información.

### Conflictos de versiones de ensamblados {#assembly-version-conflicts}

Mensaje de error similar al siguiente:

```txt
Unhandled exception. System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.

File name: 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
   at Microsoft.AspNetCore.Builder.WebApplicationBuilder..ctor(WebApplicationOptions options, Action`1 configureDefaults)
   at Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(String[] args)
   at Program.<Main>$(String[] args) in /Blog.Core/Blog.Core.Api/Program.cs:line 26
```

Los paquetes NuGet de OpenTelemetry .NET y sus dependencias se implementan con
OpenTelemetry .NET Automatic Instrumentation.

Para gestionar los conflictos entre versiones de dependencias, actualiza las
referencias del proyecto de la aplicación instrumentada para que utilicen las
mismas versiones que OpenTelemetry .NET Automatic Instrumentation.

Una forma sencilla de asegurarte de que no se produzcan estos conflictos es
añadir el paquete `OpenTelemetry.AutoInstrumentation` a la aplicación. Para
obtener instrucciones sobre cómo añadirlo a la aplicación, consulta
[Uso de los paquetes NuGet de OpenTelemetry.AutoInstrumentation](../nuget-packages).

Como alternativa, añade únicamente los paquetes en conflicto al proyecto. Las
siguientes dependencias son utilizadas por OpenTelemetry .NET Automatic Instrumentation:

- [OpenTelemetry.AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation/OpenTelemetry.AutoInstrumentation.csproj)
- [OpenTelemetry.AutoInstrumentation.AdditionalDeps](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/c27acd9bd0f82de47217fba660d9f979e0a0cc2d/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Build.props)

Busca sus versiones en las siguientes ubicaciones:

- [Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/Directory.Packages.props)
- [src/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/Directory.Packages.props)
- [src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/f2d70bd0f095852bf0270aad61b60dfe1ea7834f/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props)

De forma predeterminada, las referencias a ensamblados de las aplicaciones de
.NET Framework se redirigen durante el tiempo de ejecución a las versiones
utilizadas por la instrumentación automática. Este comportamiento se puede
controlar mediante la configuración
[`OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`](../configuration).

Si la aplicación ya incluye redirecciones de enlace para ensamblados utilizados
por la instrumentación automática, esta redirección automática puede fallar;
consulta [#2833](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2833).
Comprueba si alguna redirección de enlace existente impide la redirección a las
versiones enumeradas en
[netfx_assembly_redirection.h](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/62b4a6a855608a925caeea95752167df5a0960a0/src/OpenTelemetry.AutoInstrumentation.Native/netfx_assembly_redirection.h).

Para que funcione la redirección automática anterior, hay dos situaciones
específicas que requieren que los ensamblados utilizados para instrumentar
aplicaciones de .NET Framework —los que se encuentran en la carpeta `netfx` del
directorio de instalación— también se instalen en la Global Assembly Cache (GAC):

1. [**Instrumentación mediante monkey patch**](https://en.wikipedia.org/wiki/Monkey_patch)
   de ensamblados cargados como independientes del dominio.
2. Redirección de ensamblados para aplicaciones con nombres seguros si la
   aplicación también incluye versiones diferentes de algunos ensamblados que
   se distribuyen en la carpeta `netfx`.

Si tienes problemas en una de las situaciones anteriores, vuelve a ejecutar el
comando `Install-OpenTelemetryCore` desde el módulo de instalación de PowerShell
para asegurarte de que las instalaciones necesarias en la GAC estén actualizadas.

Para obtener más información sobre el uso de la GAC por parte de la
instrumentación automática, consulta el
[comentario de pjanotti](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1906#issuecomment-1376292814).

Consulta [#2269](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2269)
y [#2296](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2296)
para obtener más información.

### No se encontró un ensamblado en AdditionalDeps {#assembly-in-additionaldeps-was-not-found}

#### Síntomas {#symptoms}

Aparece un mensaje de error similar al siguiente:

```txt
An assembly specified in the application dependencies manifest (OpenTelemetry.AutoInstrumentation.AdditionalDeps.deps.json) was not found
```

Esto podría estar relacionado con los siguientes problemas:

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
- [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)

## Otros problemas {#other-issues}

Si encuentras un problema que no aparece en esta página, consulta los
[Pasos generales](#general-steps) para recopilar información de diagnóstico
adicional.
Esto puede ayudar a facilitar la solución del problema.
