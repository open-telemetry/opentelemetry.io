---
title: Abandoned Go Contrib modules need code owners or will be removed
linkTitle: Go Contrib modules ownership
date: 2024-05-27
author: >-
  [Fabrizio Ferri-Benedetti](https://github.com/theletterf) (Splunk)
issue: 4542
sig: SIG Go
# prettier-ignore
cSpell:ignore: aws Benedetti Fabrizio Ferri gopkg labstack macaron moduled otelaws otelecho otellambda otelmacaron otelmongo otelmux
---

The Go SIG will remove Contrib modules that lack code owners. For each module,
the removal is planned for no sooner than August 21, 2024, unless a code owner
is found. The list includes the following modules:

- `go.opentelemetry.io/otel/detectors/aws/ec2`
- `go.opentelemetry.io/otel/detectors/aws/ecs`
- `go.opentelemetry.io/otel/detectors/aws/eks`
- `go.opentelemetry.io/otel/detectors/aws/lambda`
- `go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-lambda-go/otellambda`
- `go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws`
- `go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux`
- `go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho`
- `go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo`
- `go.opentelemetry.io/contrib/instrumentation/gopkg.in/macaron.v1/otelmacaron`
- `go.opentelemetry.io/contrib/propagators/aws`
- `go.opentelemetry.io/contrib/samplers/aws/xray`

For a full list of modules at risk for removal, see the
[Remove unowned moduled](https://github.com/orgs/open-telemetry/projects/92/views/1)
project board.

## Why are those modules going to be removed?

As described in the Go Contrib
[contributions guidelines](https://github.com/open-telemetry/opentelemetry-go-contrib/blob/main/CONTRIBUTING.md#code-owners),
all Contrib modules require a code owner so that the code is not abandoned. Code
owners have the responsibility of maintaining the component, responding to
issues, and reviewing pull requests.

## I want to become a code owner! What do I do?

To become a code owner, you just need to
[open an issue](https://github.com/open-telemetry/opentelemetry-go-contrib/issues/new?assignees=&labels=&projects=&template=owner.md&title=).

The only requirements is that you're a member of the OpenTelemetry organization
and have a good working knowledge of the code you seek to maintain.

We're looking forward to your requests!
