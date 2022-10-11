---
title: "Using OpenTelemetry OpAMP to modify service telemetry on the go"
linkTitle: OpAMP service usage
date: 2022-10-12
author: "[Nimrod Shlagman](https://github.com/nemoshlag) (Cisco)",
draft: true # TODO: remove this line once your post is ready to be published
---

How verbose should your service telemetry be? Should a service output all
traces, metrics, and logs 100% of the time? How much of the service traffic
should be sampled? I would like to suggest the answer of “it depends”. Desired
telemetry data differs in a service lifecycle from development to continuous
deployment. It changes when a client faces an error or our service has been
thrown into major scale. In an ideal world, we would modify the entire service’s
telemetry without the need for code changes or deployment. Thanks to Otel
[OpAMP](https://github.com/open-telemetry/opamp-go) service and the people
behind it, I believe the time has arrived.

OpenTelemtry, also known as Otel, is a vendor-neutral open-source observability
framework for instrumenting, generating, collecting, and exporting telemetry
data such as traces, metrics, and logs. It’s a fast growing Cloud Native
Computing Foundation (CNCF) project. Otel is made of several components
including per-language SDKs and a collector. The collector is a centralized
pipeline made to collect, transform and export telemetry data. The SDK is a
specific language Otel API implementation, running with a service. It is used as
an input to the collector telemetry receiver.

OpAMP stands for Open Agent Management Protocol. It aims at managing large
fleets of data collection agents, and its GoLang implementation is at the Beta
stage. It allows configuration changes as well as package downloads. It defines
the communication between the OpAMP server and OpAMP client but does not assume
any particular client-agent relationship giving it a lot of flexibility.

In the following example, we’ll create a simple GoLang server, instrument it,
and then control it with an OpAMP server and supervisor. We won’t dive into
OpAMP implementation itself, but rather focus on its implications using these
examples.

####First, consider this basic go server:

```Go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func httpHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi! This action could create a trace!")
}

func main() {
	handler := http.HandlerFunc(httpHandler)
	http.Handle("/", handler)
	fmt.Println("Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Next, add a basic named “effective.yaml” configuration file. Place it in the
same folder as our main.go file with this configuration:

```yaml
instrument: false
```

Let’s add a basic configuration handler to our server:

```go
package main

import (
   "fmt"
   "gopkg.in/yaml.v3"
   "io/ioutil"
   "log"
   "net/http"
   "path/filepath"
)

type configurations struct {
   Instrument bool
}

func httpHandler(w http.ResponseWriter, r *http.Request) {
   fmt.Fprintf(w, "Hi! This action could create a trace!")
}

func main() {
   filename, _ := filepath.Abs("./effective.yaml")
   yamlFile, _ := ioutil.ReadFile(filename)

   var config configurations
   yaml.Unmarshal(yamlFile, &config)

   handler := http.HandlerFunc(httpHandler)
   http.Handle("/", handler)
   fmt.Println("Starting server on port 8080")
   log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Sorry, no error handling here. Next, let's wrap our handler with instrumentation
and condition it with our configuration file. Something like this:

```go
package main

import (
   "context"
   "fmt"
   "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
   "go.opentelemetry.io/otel"
   "go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
   sdktrace "go.opentelemetry.io/otel/sdk/trace"
   "go.opentelemetry.io/otel/trace"
   "gopkg.in/yaml.v3"
   "io/ioutil"
   "log"
   "net/http"
   "os"
   "path/filepath"
)

type configurations struct {
   Instrument bool
}

var tracer trace.Tracer

func newConsoleExporter() (sdktrace.SpanExporter, error) {
   return stdouttrace.New(
      stdouttrace.WithWriter(os.Stdout),
      stdouttrace.WithPrettyPrint(),
   )
}

func httpHandler(w http.ResponseWriter, r *http.Request) {
   fmt.Fprintf(w, "Hi! This action could create a trace!")
}

func setHandler(handler http.Handler, config configurations) http.Handler {
   if config.Instrument {
      return otelhttp.NewHandler(handler, "instrumentation activated by OpAMP")
   }
   return http.HandlerFunc(httpHandler)
}

func main() {
   filename, _ := filepath.Abs("./effective.yaml")
   yamlFile, _ := ioutil.ReadFile(filename)

   var config configurations
   yaml.Unmarshal(yamlFile, &config)

   exp, _ := newConsoleExporter()
   tp := sdktrace.NewTracerProvider(sdktrace.WithBatcher(exp))
   defer func() { _ = tp.Shutdown(context.Background()) }()

   otel.SetTracerProvider(tp)

   tracer = tp.Tracer("ControlledOpAMPAgentDemo")
   handler := http.HandlerFunc(httpHandler)
   http.Handle("/", setHandler(handler, config))
   fmt.Println("Starting server on port 8080")
   log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Build it with `go build .` Now if we run it and open http://localhost:8080/ on a
browser, nothing special will be shown. It’s time to add some opamp. Git clone
[opamp-go](https://github.com/open-telemetry/opamp-go) and run the server with:

```
cd internal/examples/server
go run .
```

Go to http://localhost:4321/ to verify it running, notice no agent displayed:

![No agents display on opamp server demo UI](opamp_server_no_agents.png)

Next, open a new terminal and on internal/examples/supervisor/bin edit
supervisor.yaml agent executable to point to our previous build. On
internal/examples/supervisor run `go build -o bin/supervisor main.go` and on on
internal/examples/supervisor/bin run `./supervisor`

Great, we have now a system consisting of OpAMP server supervisor and our server

![OpAMP server, supervisor and agent relations](opamp_server_supervisor_agent_relations.png)

We can see now our agent running at http://localhost:4321/. Select it and pass
`instrument: true` to its configurations.

![Our service configurations over opamp server](opamp_server_agent_config.png)

We can see the change take place on the supervisor console log:

```
Received remote config from server, hash=0008886301f3ccb3520216823cfa09a.
Effective config changed.
Config is changed. Signal to restart the agent.
Restarting the agent with the new config.
Stopping agent process, PID=19206
Agent process PID=19206 successfully stopped.
Starting agent <agent path>
Agent process started, PID=19506
```

Finally, visiting http://localhost:8080/ should result with traces appear on
agent.log in internal/examples/supervisor/bin:

```go
Starting server on port8080
{
   "Name": "instrumentation activated by OpAMP server",
   "SpanContext": {
      "TraceID": "d2f76958023624d4c1def3f44899b6d4",
      "SpanID": "085510f551dc31a1",
      "TraceFlags": "01",
      "TraceState": "",
      "Remote":false
   ...
```

The green lines are the trace itself! Ok, so what do we have here? A server that
controls whether or not our service will generate traces. Try setting it off
using the `instrument: false` configuration.

Ok, so what’s next? This is the very basic implementation, wrapping a system
above OpAMP we can achieve some sort of the “instrumentation orchestrator”
vision. It starts with being able to externally add and match tailor-made
dynamic telemetry for your system. Just imagine what can AI achieve over such a
system. Collecting metrics over the entire system, automatically and dynamically
adding trace/log collections over any spotted bottlenecks for example. This
protocol enables many new exciting possibilities, I believe it has the potential
to change the way we think about telemetry.
