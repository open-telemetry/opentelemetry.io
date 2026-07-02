---
title: Supported libraries
description: Libraries and frameworks instrumented out of the box.
weight: 10
cSpell:ignore: gonic
---

The tool ships instrumentation packages for the following libraries and
frameworks. When your application or its dependencies use one of them, the
matching instrumentation is injected automatically at build time.

| Library or framework    | Import path                         | Instrumented operations    |
| ----------------------- | ----------------------------------- | -------------------------- |
| HTTP (standard library) | `net/http`                          | Client and server requests |
| gRPC                    | `google.golang.org/grpc`            | Client and server calls    |
| SQL databases           | `database/sql`                      | Database calls             |
| Gin                     | `github.com/gin-gonic/gin`          | Server requests            |
| Redis                   | `github.com/redis/go-redis/v9`      | Client commands            |
| MongoDB                 | `go.mongodb.org/mongo-driver/mongo` | Client commands            |
| Kubernetes client       | `k8s.io/client-go/tools/cache`      | Informer cache operations  |

HTTP and gRPC instrumentation produce spans and metrics, including automatic
[context propagation](/docs/concepts/context-propagation/) between services.
Instrumentation follows the OpenTelemetry
[semantic conventions](/docs/specs/semconv/) for each library.

The set of supported library versions is declared by each instrumentation's
rules. For the authoritative, up-to-date list, see the
[instrumentation packages](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/tree/main/pkg/instrumentation)
in the repository.

## Requesting a library

If a library you rely on isn't instrumented yet, open a
[feature request](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues).
You can also add instrumentation yourself: the repository's
[instrumentation guide](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/main/docs/instrument-guide.md)
walks through defining rules and implementing hooks for a new library.
