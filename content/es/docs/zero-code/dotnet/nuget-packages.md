---
title: Uso de los paquetes NuGet OpenTelemetry.AutoInstrumentation
linkTitle: Paquetes NuGet
weight: 40
default_lang_commit: d1ef521ee4a777881fb99c3ec2b506e068cdec4c
cSpell:ignore: buildtasks
---

Usa los paquetes NuGet en los siguientes casos:

1. Simplifica la implementación. Por ejemplo, un contenedor que ejecuta una sola
   aplicación.
2. Admite la instrumentación de aplicaciones
   [`independientes`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained).
3. Facilita la experimentación de los desarrolladores con la instrumentación
   automática usando paquetes NuGet.
4. Resuelve los conflictos de versiones entre las dependencias utilizadas por la
   aplicación y la instrumentación automática.

## Limitaciones

Aunque los paquetes NuGet son una forma cómoda de implementar la instrumentación
automática, no se pueden utilizar en todos los casos. Las razones más comunes
para no utilizar paquetes NuGet son las siguientes:

1. No se puede agregar el paquete al proyecto de la aplicación. Por ejemplo, la
   aplicación es de un tercero que no puede agregar el paquete.
2. Reduce el uso del disco o el tamaño de una máquina virtual cuando haya varias
   aplicaciones que se vayan a instrumentar instaladas en una sola máquina. En
   este caso, puedes utilizar una única implementación para todas las
   aplicaciones .NET que se ejecuten en la máquina.
3. Una aplicación antigua que no se puede migrar al
   [proyecto de estilo SDK](https://learn.microsoft.com/en-us/nuget/resources/check-project-format#check-the-project-format).

## Uso de los paquetes NuGet

Para instrumentar automáticamente tu aplicación con OpenTelemetry .NET, añade el
paquete `OpenTelemetry.AutoInstrumentation` a su proyecto:

```terminal
dotnet add [<PROYECTO>] package OpenTelemetry.AutoInstrumentation
```

Si la aplicación hace referencia a paquetes que pueden instrumentarse, pero que
requieren otros paquetes para que la instrumentación funcione, la compilación
fallará y te pedirá que añada la biblioteca de instrumentación que falta o que
omita la instrumentación del paquete correspondiente:

```terminal
~packages/opentelemetry.autoinstrumentation.buildtasks/1.6.0/build/OpenTelemetry.AutoInstrumentation.BuildTasks.targets(29,5): error : OpenTelemetry.AutoInstrumentation: add a reference to the instrumentation package 'MongoDB.Driver.Core.Extensions.DiagnosticSources' version 1.4.0 or add 'MongoDB.Driver.Core' to the property 'SkippedInstrumentations' to suppress this error.
```

Para resolver el error, añade la biblioteca de instrumentación recomendada u
omita la instrumentación del paquete indicado añadiéndolo a la propiedad
`SkippedInstrumentation`, por ejemplo:

```csproj
<PropertyGroup>
   <SkippedInstrumentations>MongoDB.Driver.Core;StackExchange.Redis</SkippedInstrumentations>
</PropertyGroup>
```

También puedes especificar la misma propiedad directamente usando la CLI. Ten en
cuenta que necesitas escapar correctamente el separador `;` como '%3B':

```powershell
dotnet build -p:SkippedInstrumentations=StackExchange.Redis%3BMongoDB.Driver.Core
```

Para distribuir los componentes de tiempo de ejecución nativos adecuados con su
aplicación .NET, especifique un
[Identificador de tiempo de ejecución (RID)](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog)
para compilar la aplicación utilizando `dotnet build` o `dotnet publish`. Esto
puede requerir elegir entre distribuir una
[_self-contained_ o a _framework-dependent_](https://learn.microsoft.com/en-us/dotnet/core/deploying/).
Ambos tipos son compatibles con la instrumentación automática.

Usa el script en la carpeta de salida de la compilación para iniciar la
aplicación con la instrumentación automática activada.

- En Windows, usa `instrument.cmd <application_executable>`.
- En Linux o Unix, usa `instrument.sh <application_executable>`.

Si inicias la aplicación usando la CLI de `dotnet`, agrega `dotnet` después del
script.

- En Windows, usa `instrument.cmd dotnet <application>`.
- En Linux o Unix, usa `instrument.sh dotnet <application>`.

El script pasa a la aplicación todos los parámetros de línea de comandos que
proporciones.
