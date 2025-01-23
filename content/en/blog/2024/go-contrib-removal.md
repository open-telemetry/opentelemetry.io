---
title: Abandoned Go Contrib modules need code owners or will be removed
linkTitle: Go Contrib modules ownership
date: 2024-05-28
author: >-
  [Fabrizio Ferri-Benedetti](https://github.com/theletterf) (Splunk)
issue: 4542
sig: SIG Go
# prettier-ignore
cSpell:ignore: aws Benedetti Fabrizio Ferri gopkg labstack macaron otelaws otelecho otellambda otelmacaron otelmongo otelmux
---

The Go SIG will remove the code of contrib modules that lack code owners
starting August 21, 2024. Published packages and releases will be marked as
deprecated, though they'll remain available for download.

Currently unowned modules include the following:

- [`go.opentelemetry.io/contrib/detectors/aws/ec2`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/ec2)
- [`go.opentelemetry.io/contrib/detectors/aws/ecs`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/ecs)
- [`go.opentelemetry.io/contrib/detectors/aws/eks`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/eks)
- [`go.opentelemetry.io/contrib/detectors/aws/lambda`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/lambda)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-lambda-go/otellambda`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-lambda-go/otellambda)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho)
- [`go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo)
- [`go.opentelemetry.io/contrib/instrumentation/gopkg.in/macaron.v1/otelmacaron`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/gopkg.in/macaron.v1/otelmacaron)
- [`go.opentelemetry.io/contrib/propagators/aws`](https://pkg.go.dev/go.opentelemetry.io/contrib/propagators/aws)
- [`go.opentelemetry.io/contrib/samplers/aws/xray`](https://pkg.go.dev/go.opentelemetry.io/contrib/samplers/aws/xray)

For a full list of modules at risk for removal, see the
[Remove unowned modules](https://github.com/orgs/open-telemetry/projects/92/views/1)
project board.

## Why are those modules going to be removed?

As described in the Go Contrib
[contributions guidelines](https://github.com/open-telemetry/opentelemetry-go-contrib/blob/main/CONTRIBUTING.md#code-owners),
all Contrib modules require a code owner so that the code is not abandoned. Code
owners have the responsibility of maintaining the component, responding to
issues, and reviewing pull requests.

## I want to become a code owner! What do I do?

To become a code owner of one of the modules, you need to be a member of the
OpenTelemetry organization and have a good working knowledge of the code you
seek to maintain. To become a member of OpenTelemetry in GitHub, see the
requirements in
[Community membership](https://github.com/open-telemetry/community/blob/main/community-membership.md#requirements).

If you satisfy all requirements,
[open an issue](https://github.com/open-telemetry/opentelemetry-go-contrib/issues/new?assignees=&labels=&projects=&template=owner.md&title=).

We're looking forward to your request!
