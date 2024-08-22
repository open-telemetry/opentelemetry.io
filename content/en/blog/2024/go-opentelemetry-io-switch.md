---
title: Announcing Planned Migration for go.opentelemetry.io
linkTitle: Planned migration for go.opentelemetry.io
date: 2024-08-22
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Mike Dame](https://github.com/damemi) (Google),
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
issue: 5086
sig: Go SIG
---

With contributions from Tyler Yahn and Austin Parker.

## tl;dr

**The app that serves requests to go.opentelemetry.io will be migrating to a new
host on [DATE]. There are no changes required from you. We are making this
announcement because it is possible, but unlikely, that there may be downtime
during this transition.**

The OpenTelemetry Go SIG is planning to migrate the app that serves all requests
for go.opentelemetry.io to a new GCP project on [DATE]. On this date, the
current DNS entries for go.opentelemetry.io will be updated to point to the new
host.

This should be a seamless transition, but there is the possibility of downtime
during this time. The OpenTelemetry Go SIG will be actively monitoring the
transition to minimize the risk.

## What you need to do

**There is no action required from you.** All imports using go.opentelemetry.io
(and submodule paths, for example go.opentelemetry.io/otel, etc) will continue
to work. There are no plans to change this.

## What you may notice

There is the possibility of the go.opentelemtry.io domain experiencing downtime
during this transition. If this happens, you may see projects that import
go.opentelemetry.io modules failing to compile.

This could occur due to several factors, including delays in DNS propagation or
misconfiguration. We will have multiple maintainers working synchronously during
this time to minimize any downtime that occurs.

## Why are we making this change?

The current app that resolves go.opentelemetry.io has not been updated in
several years and is built on outdated dependencies. The app is currently hosted
in a Google Cloud project that is only accessible by Google employees. Due to
the importance of the go.opentelemetry.io domain, Google is transferring
ownership of this app to a community-owned GCP project so that it can be updated
and maintained by the OpenTelemetry community.

For more details, see
[the community GitHub issue proposing this change](https://github.com/open-telemetry/community/issues/2260).

## Future plans

In the future, we are also considering refactoring the go.opentelemetry.io app
(or using a different approach entirely to serve requests). There is more info
about this in the GitHub issue linked above. However, this is not part of the
current transition and any further changes to go.opentelemetry.io will be
communicated similarly to this one.
