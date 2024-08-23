---
title: Planned Migration for go.opentelemetry.io
linkTitle: Planned migration for go.opentelemetry.io
date: 2024-08-22
author: >-
  [Mike Dame](https://github.com/damemi) (Google),
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
issue: 5086
sig: Go SIG
---

With contributions from Tyler Yahn and Austin Parker.

## TL;DR

The app that serves requests to [go.opentelemetry.io] will be migrating to a new
host on September 9, 2024. There are no changes required from you. We are making
this announcement because it is possible, but unlikely, that there may be
downtime during this transition.

## Details

OpenTelemetry is planning to migrate the application that serves all requests
for `go.opentelemetry.io` to a new host project on September 9, 2024. On this
date, the current DNS entries for `go.opentelemetry.io` will be updated to point
to the new host.

This should be a seamless transition, but there is the possibility of downtime
during this time. The OpenTelemetry engineers will be actively monitoring the
transition to minimize the risk.

### Affected Resources

In the unlikely event of issues, the scope of these planned changes will affect
Go package downloads for the following domains:

- `go.opentelemetry.io/auto`
- `go.opentelemetry.io/build-tools`
- `go.opentelemetry.io/collector-contrib`
- `go.opentelemetry.io/collector`
- `go.opentelemetry.io/contrib`
- `go.opentelemetry.io/otel`
- `go.opentelemetry.io/proto`
- `go.opentelemetry.io/sdk`

Note that this includes users of any of the following artifacts: the
OpenTelemetry Go language libraries (including Contrib), the OpenTelemetry Go
Auto-Instrumentation libraries, the OpenTelemetry Collector libraries (including
Contrib), and the OpenTelemetry Collector Builder.

## What you need to do

**There is no action required from you.** All imports using
`go.opentelemetry.io` (and submodule paths, for example
`go.opentelemetry.io/otel`) will continue to work. There are no plans to change
this.

## What you may notice

There is the possibility of the [go.opentelemtry.io] domain experiencing
downtime during this transition. If this happens, you may see projects that
import `go.opentelemetry.io` modules failing to compile.

This could occur due to several factors, including delays in DNS propagation or
misconfiguration. We will have multiple maintainers working synchronously during
this time to minimize any downtime that occurs.

If you experience any issues following this transition, please reach out on
[Slack #otel-go](https://cloud-native.slack.com/archives/C01NPAXACKT) or open an
issue on GitHub at
[https://github.com/open-telemetry/opentelemetry-go-vanityurls](https://github.com/open-telemetry/opentelemetry-go-vanityurls).

## Why are we making this change?

This transition both helps modernize the application serving requests and
handles an ownership transfer, ensuring that we are able to continue providing
OpenTelemetry Go packages in a secure and robust manner.

For more details, see
[the community GitHub issue proposing this change](https://github.com/open-telemetry/community/issues/2260).

[go.opentelemetry.io]: https://go.opentelemetry.io
