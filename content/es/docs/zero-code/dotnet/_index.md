---
title: Instrumentación sin código para .NET
description: Enviar trazas y métricas desde aplicaciones y servicios .NET.
linkTitle: .NET
aliases: [net]
redirects: [{ from: /docs/languages/net/automatic/*, to: ':splat' }]
weight: 30
default_lang_commit: 45e813cfc5606299598eb068cf1e7adc2a957108
drifted_from_default: true
# prettier-ignore
cSpell:ignore: coreutils desarollada desinstalación HKLM iisreset multilínea myapp
---

Usa la instrumentación automática de OpenTelemetry .NET para enviar trazas y
métricas desde aplicaciones y servicios .NET a backends de observabilidad sin
tener que modificar su código fuente.

Para aprender a instrumentar el código de su servicio o aplicación, lee el
[Manual de instrumentación](/docs/languages/dotnet/instrumentation).

## Compatibilidad

La instrumentación automática de OpenTelemetry .NET debería funcionar con todos
los sistemas operativos y versiones oficialmente compatibles de
[.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)).

La versión mínima compatible de
[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) es
`4.6.2`.

Las arquitecturas de procesador compatibles son:

- x86
- AMD64 (x86-64)
- ARM64 ([Experimental](/docs/specs/otel/versioning-and-stability))

{{% alert title="Nota" %}} La compilación ARM64 no admite imágenes basadas en
CentOS. {{% /alert %}}

Pruebas de integración continua (CI) en los siguientes sistemas operativos:

- [Alpine x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Alpine ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Debian x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian.dockerfile)
- [Debian ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian-arm64.dockerfile)
- [CentOS Stream 9 x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-stream9.dockerfile)
- [macOS Ventura 13 x64](https://github.com/actions/runner-images/blob/main/images/macos/macos-13-Readme.md)
- [Microsoft Windows Server 2022 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)
- [Microsoft Windows Server 2025 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md)
- [Ubuntu 22.04 LTS x64](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2204-Readme.md)
- [Ubuntu 22.04 LTS ARM64](https://github.com/actions/partner-runner-images/blob/main/images/arm-ubuntu-22-image.md)

## Configuración

Para instrumentar una aplicación .NET automáticamente, descargue y ejecute el
script de instalación para su sistema operativo.

### Linux y macOS

Descarga y ejecuta el script `.sh`:

```shell
# Descargar el script de bash
curl -sSfL https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh -O

# Instalar archivos principales
sh ./otel-dotnet-auto-install.sh

# Habilitar la ejecución del script de instrumentación
chmod +x $HOME/.otel-dotnet-auto/instrument.sh

# Configurar la instrumentación para la sesión de shell actual
. $HOME/.otel-dotnet-auto/instrument.sh

# Ejecute su aplicación con instrumentación
OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment=staging,service.version=1.0.0 ./MyNetApp
```

{{% alert title="Nota" color="Advertencia" %}} En macOS
[`coreutils`](https://formulae.brew.sh/formula/coreutils) es requerido. Si
tienes [homebrew](https://brew.sh/) instalado, puedes obtenerlo simplemente
ejecutando

```shell
brew install coreutils
```

{{% /alert %}}

### Windows (PowerShell)

En Windows, usa el módulo PowerShell como administrador.

{{% alert title="Version note" color="warning" %}}

Windows
[PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
(v5.1) es requerido. Otras
[versiones](https://learn.microsoft.com/previous-versions/powershell/scripting/overview),
incluido PowerShell Core (v6.0+) no son compatibles en este momento.

{{% /alert %}}

```powershell
# PowerShell 5.1 es requerido
#Requires -PSEdition Desktop

# Descargar el módulo
$module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
$download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing

# Importar el módulo para utilizar sus funciones
Import-Module $download_path

# Instalar archivos principales (online vs offline)
Install-OpenTelemetryCore
Install-OpenTelemetryCore -LocalPath "C:\Path\To\OpenTelemetry.zip"

# Configurar la instrumentación para la sesión actual de PowerShell
Register-OpenTelemetryForCurrentSession -OTelServiceName "MyServiceDisplayName"

# Ejecute su aplicación con instrumentación
.\MyNetApp.exe

# Puede obtener información sobre su uso ejecutando los siguientes comandos

# Listar todos los comandos disponibles
Get-Command -Module OpenTelemetry.DotNet.Auto

# Obtener información de uso del comando
Get-Help Install-OpenTelemetryCore -Detailed
```

## Instrumentar un servicio de Windows que ejecuta una aplicación .NET

Usa el módulo de PowerShell `OpenTelemetry.DotNet.Auto.psm1` para configurar la
instrumentación automática de un servicio de Windows:

```powershell
# Importar el módulo
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Instalar archivos principales
Install-OpenTelemetryCore

# Configurar la instrumentación del servicio de Windows
Register-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName" -OTelServiceName "MyServiceDisplayName"
```

{{% alert title="Nota" color="warning" %}}
`Register-OpenTelemetryForWindowsService` realiza un reinicio del servicio.
{{% /alert %}}

### Configuración para el servicio de Windows

{{% alert title="Nota" color="warning" %}} Recuerde reiniciar el servicio de
Windows después de realizar cambios en la configuración. Puede hacerlo
ejecutando `Restart-Service -Name $WindowsServiceName -Force` en PowerShell.
{{% /alert %}}

Para las aplicaciones .NET Framework puedes configurar
[las configuraciones más comunes de `OTEL_`](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
(como `OTEL_RESOURCE_ATTRIBUTES`) via `appSettings` en `App.config`.

La alternativa es establecer variables de entorno para el servicio de Windows en
el Registro de Windows.

La clave de registro de un servicio de Windows determinado (llamado `$svcName`)
se encuentra en:

```powershell
HKLM\SYSTEM\CurrentControlSet\Services\$svcName
```

Las variables de entorno se definen en un `REG_MULTI_SZ` (valor de registro
multilínea) llamado `Environment` en el siguiente formato:

```env
Var1=Value1
Var2=Value2
```

## Instrumentar una aplicación ASP.NET desarollada en IIS

{{% alert title="Nota" color="warning" %}} Las siguientes instrucciones se
aplican a las aplicaciones .NET Framework. {{% /alert %}}

Usa el módulo de PowerShell `OpenTelemetry.DotNet.Auto.psm1` para configurar la
instrumentación automática para IIS:

```powershell
# Importar el módulo
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Instalar archivos principales
Install-OpenTelemetryCore

# Configurar la instrumentación de IIS
Register-OpenTelemetryForIIS
```

{{% alert title="Nota" color="warning" %}} `Register-OpenTelemetryForIIS`
realiza un reinicio de IIS. {{% /alert %}}

### Configuración para aplicaciones ASP.NET

{{% alert title="Nota" color="warning" %}} Las siguientes instrucciones se
aplican a las aplicaciones del Framework .NET Framework. {{% /alert %}}

Para las aplicaciones ASP.NET, puede configurar
[las configuraciones `OTEL_` más comunes](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
(como `OTEL_SERVICE_NAME`) a través de `appSettings` en `Web.config`.

Si no se configura explícitamente un nombre de servicio, se generará uno para
usted. Si la aplicación está alojada en IIS en el Framework de .NET, se usará
`SiteName\VirtualDirectoryPath`, por ejemplo: `MySite\MyApp`.

Para las aplicaciones ASP.NET Core, puede usar los elementos
[`<environmentVariable>`](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config#set-environment-variables)
dentro del bloque `<aspNetCore>` del archivo `Web.config` para establecer la
configuración mediante variables de entorno.

{{% alert title="Nota" color="warning" %}} Recuerde reiniciar IIS después de
realizar cambios de configuración. Puede hacerlo ejecutando `iisreset.exe`.
{{% /alert %}}

### Configuración avanzada

Puede agregar las
[`<environmentVariables>`](https://docs.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/environmentvariables/)
en `applicationHost.config` para establecer variables de entorno para grupos de
aplicaciones determinados.

Considere establecer variables de entorno comunes para todas las aplicaciones
implementadas en IIS configurando las variables de entorno para los servicios de
Windows `W3SVC` y `WAS`.

{{% alert title="Nota" color="warning" %}} Para versiones de IIS anteriores a
10.0, puede considerar crear un usuario distinto, configurar sus variables de
entorno y usarlo como usuario del grupo de aplicaciones. {{% /alert %}}

## Paquete NuGet

Puede instrumentar aplicaciones
[`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
mediante los paquetes NuGet. Consulte [`Paquetes NuGet`](./nuget-packages) para
obtener más información.

## Instrumentar un contenedor

Para ver un ejemplo de instrumentación de contenedores Docker, consulte el
[ejemplo](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples/demo)
en GitHub.

También puedes usar el
[Operador OpenTelemetry para Kubernetes](/docs/platforms/kubernetes/operator/).

## Configurando el agente

Para ver la todas las opciones de configuración, consulte
[Configuración y ajustes](./configuration).

## Correlación de registro a traza

{{% alert title="Nota" color="warning" %}} La correlación automática entre
registros y trazas proporcionada por la instrumentación automática de
OpenTelemetry .NET actualmente solo funciona para aplicaciones .NET que utilizan
`Microsoft.Extensions.Logging`. Consulte
[#2310](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310)
para obtener más detalles. {{% /alert %}}

El SDK de OpenTelemetry .NET correlaciona automáticamente los registros con los
datos de traza. Cuando se emiten registros en el contexto de una traza activo,
los campos de contexto de traza
[filed](/docs/specs/otel/logs/data-model#trace-context-fields) `TraceId`,
`SpanId` y `TraceState` son completados automáticamente.

Los siguientes son registros producidos por la aplicación de consola de muestra:

```json
"logRecords": [
    {
        "timeUnixNano": "1679392614538226700",
        "severityNumber": 9,
        "severityText": "Information",
        "body": {
            "stringValue": "Success! Today is: {Date:MMMM dd, yyyy}"
        },
        "flags": 1,
        "traceId": "21df288eada1ce4ace6c40f39a6d7ce1",
        "spanId": "a80119e5a05fed5a"
    }
]
```

Para obtener más información, consulte:

- [SDK de OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/correlation)
- [Especificación de OpenTelemetry](/docs/specs/otel/logs/data-model#trace-context-fields)

## Especificación de OpenTelemetry

La instrumentación automática de OpenTelemetry .NET admite una amplia variedad
de librerías. Para obtener una lista completa, consulte
[Instrumentaciones](./instrumentations).

## Solución de problemas

Para ver la telemetría de su aplicación directamente en la salida estándar,
agregue `console` al siguiente valor de la variable de entorno antes de iniciar
su aplicación:

- `OTEL_TRACES_EXPORTER`
- `OTEL_METRICS_EXPORTER`
- `OTEL_LOGS_EXPORTER`

Para conocer los pasos generales de resolución de problemas y soluciones a
problemas específicos, consulte [Solución de problemas](./troubleshooting).

## Próximos pasos

Una vez configurada la instrumentación automática para su aplicación o servicio,
es posible que desee [enviar trazas y métricas personalizados](./custom) o
agregar [instrumentación manual](/docs/languages/dotnet/instrumentation) para
recopilar datos de telemetría personalizados.

## Desinstalar

### Linux y macOS { #uninstall-unix }

En Linux y macOS, los pasos de instalación solo afectan a la sesión de shell
actual, por lo que no se requiere una desinstalación explícita.

### Windows (PowerShell) { #uninstall-windows }

En Windows, usa el módulo PowerShell como administrador.

{{% alert title="Nota de versión" color="warning" %}}

Windows Se requiere
[PowerShell Desktop (v5.1)](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions).
Otras
[versiones](https://learn.microsoft.com/previous-versions/powershell/scripting/overview),
incluido PowerShell Core (v6.0+), no son compatibles actualmente.

{{% /alert %}}

```powershell
# PowerShell 5.1 es requerido
# Requiere PSEdition Desktop

# Importar el módulo previamente instalado
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Si IIS ya estaba registrado, puedes cancelar el registro con
Unregister-OpenTelemetryForIIS

# Si los servicios de Windows se registraron previamente, cancele su registro
Unregister-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName"

# Por último, desinstale la instrumentación OpenTelemetry
Uninstall-OpenTelemetryCore
```
