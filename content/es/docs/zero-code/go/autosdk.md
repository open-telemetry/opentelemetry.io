---
title: Auto SDK de instrumentación de Go
linkTitle: Auto SDK
description: Integra spans manuales con spans eBPF sin código con el Auto SDK
weight: 16
default_lang_commit: 28d760e734e5b20c9af47efce57484ae691e3975
---

El framework de instrumentación eBPF de OpenTelemetry Go, utilizado por
herramientas como [OBI](/docs/zero-code/obi), permite la integración con spans
de OpenTelemetry instrumentados manualmente a través del Auto SDK.

## ¿Qué es el Auto SDK?

El Auto SDK es un SDK de OpenTelemetry Go totalmente implementado y
personalizado, diseñado para ser compatible con la autoinstrumentación eBPF de
Go. Esto permite que los paquetes instrumentados automáticamente (como
`net/http`, por ejemplo) admitan la propagación de contexto con spans manuales.

## ¿Cuando debo usarlo?

La instrumentación eBPF de OpenTelemetry Go actualmente solo admite un número
limitado de paquetes. Aun así, es posible que desee ampliar esta instrumentación
y crear spans personalizados dentro de su código. El SDK automático permite esto
instrumentando sus spans personalizados con un contexto de seguimiento
compartido que también será utilizado por los spans automáticos.

## ¿Cómo lo uso?

Desde el lanzamiento de
[OpenTelemetry Go v1.36.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.36.0),
el Auto SDK se importa automáticamente como una dependencia indirecta con la API
estándar de Go. Puedes confirmar que tu proyecto tiene el Auto SDK revisando el
archivo `go.mod` para `go.opentelemetry.io/auto/sdk`.

Crear spans manuales con el Auto SDK es básicamente lo mismo que crear spans con
la instrumentación estándar de Go.

Con el Auto SDK disponible, usarlo es tan sencillo como crear tramos manuales
con `tracer.Start()`:

```go
package main

import (
	"log"
	"net/http"

	"go.opentelemetry.io/otel"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Get tracer
		tracer := otel.Tracer("example-server")

		// Start a manual span
		_, span := tracer.Start(r.Context(), "manual-span")
		defer span.End()

		// Add an attribute for demonstration
		span.SetAttributes()
		span.AddEvent("Request handled")
	})

	log.Println("Server running at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

En este ejemplo, el framework eBPF instrumenta automáticamente las solicitudes
HTTP entrantes y luego vincula el intervalo manual al mismo seguimiento
instrumentado desde la librerías HTTP. Tenga en cuenta que no se ha inicializado
ningún TracerProvider en este ejemplo. El Auto SDK registra su propio
TracerProvider, que es crucial para habilitar el SDK.

Básicamente, no es necesario hacer nada para habilitar el Auto SDK, excepto
crear spans manuales en una aplicación instrumentada por un agente sin código de
Go. Mientras no registre manualmente un TracerProvider global, el Auto SDK se
habilitará automáticamente.

{{% alert title="Importante" color="warning" %}}

Configurar manualmente un TracerProvider global entrará en conflicto con el Auto
SDK e impedirá que los spans manuales se correlacionan correctamente con los
intervalos basados en eBPF. Si crea spans manuales en una aplicación Go
instrumentada por eBPF, no inicialice su propio TracerProvider global.

{{% /alert %}}

### TracerProvider del Auto SDK

En la mayoría de los casos, no es necesario interactuar manualmente con el
TracerProvider integrado del Auto SDK. Sin embargo, para ciertos casos
avanzados, puede que desee configurar manualmente el TracerProvider del Auto
SDK. Puede acceder a él con la función
[`auto.TracerProvider()`](https://pkg.go.dev/go.opentelemetry.io/auto/sdk):

```go
import (
	"go.opentelemetry.io/otel"
    autosdk "go.opentelemetry.io/auto/sdk"
)

func main() {
	tp := autosdk.TracerProvider()
	otel.SetTracerProvider(tp)
}
```

## ¿Cómo funciona el Auto SDK?

Cuando una aplicación se instrumenta con eBPF de OpenTelemetry, el programa eBPF
buscará la presencia de la dependencia `go.opentelemetry.io/auto/sdk` en la
aplicación (recuerde que esta dependencia está incluida por defecto en
`go.opentelemetry.io/otel`; no es necesario importarla explícitamente). Si la
encuentra, el programa eBPF habilitará un valor booleano en el SDK global de
OpenTelemetry para indicarle que use el TracerProvider del Auto SDK.

El Auto SDK funciona de forma muy similar a cualquier otro SDK, implementando
todas las funciones requeridas por la especificación. La principal diferencia es
que también está preparado por eBPF para unificar la propagación del contexto
con otras librerías instrumentadas por eBPF.

En esencia, el Auto SDK es la forma en que OpenTelemetry eBPF identifica y
organiza la propagación del contexto con la API estándar de OpenTelemetry,
instrumentando los símbolos de función de OpenTelemetry de forma similar a como
lo hace con cualquier otro paquete.
