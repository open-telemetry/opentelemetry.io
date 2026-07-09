---
title: 'CocoaPods Deprecation Notice for OpenTelemetry Swift'
linkTitle: Otel Swift Cocoapods Deprecation # Mandatory, make sure that your short title.
date: 2026-07-02 # Put the current date, we will keep the date updated until your PR is merged
author: '[Ariel Demarco](https://github.com/ArielDemarco)'
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
issue: 10655 # TODO: See https://opentelemetry.io/docs/contributing/blog/ for details (Required)
sig: Swift # TODO: add the name of the SIG that sponsors this blog post (Required)
---

## Summary

As it was announced:
([CocoaPods Support Plan](https://blog.cocoapods.org/CocoaPods-Support-Plans/?ref=jsdelivr-blog.ghost.io)
and [CocoaPods Spec Repo](https://blog.cocoapods.org/CocoaPods-Specs-Repo/)), CocoaPods is
transitioning their project to maintenance mode, and cocoapods trunk is going to
be read-only in a few months.

The OpenTelemetry Swift maintainers are planning to deprecate CocoaPods support
for all the pods published under `opentelemetry-swift` and
`opentelemetry-swift-core`.

Swift Package Manager (SPM) is now the recommended and preferred installation
method for all new integrations.

We encourage existing CocoaPods users to begin planning a migration to SPM.

## Why are we making this change?

Maintaining multiple package distribution systems increases the operational
burden on project maintainers and contributors.

Additionally, the CocoaPods ecosystem itself has announced significant changes
to its infrastructure and maintenance model, making long-term support
increasingly challenging for open source projects. In turn, recently,
maintaining all the podspecs, the intermittent upload issues, and other
CocoaPods related problems have made CocoaPods support anything but a low-effort
commitment on our end.

In recent years, Swift Package Manager has become the standard dependency
management solution in the Apple ecosystem and is the primary package manager
recommended by Apple.

By focusing our efforts on Swift Package Manager, we can:

- Reduce release and maintenance complexity
- Improve release reliability
- Simplify contributor workflows
- Better align with the direction of the Apple development ecosystem
- Spend more contributor and maintainer time on SDK improvements rather than
  distribution tooling and triages

## Timeline

The milestones are still under discussion, but will likely be as follows:

| Milestone                            | Date                               |
| ------------------------------------ | ---------------------------------- |
| Deprecation annoucement              | July                               |
| Recommended migration period begins  | August 31st, 2026                  |
| Final release published to CocoaPods | No later than September 30th, 2026 |
| CocoaPods support ends               | December 2nd, 2026                 |

## What does this mean for existing users?

1. Existing CocoaPods integrations will continue to function.
1. Once CocoaPods support is officially discontinued:
   1. Previously published versions will remain available.
   1. No new SDK releases will be published to CocoaPods.
   1. We’ll leave `.podspec` in the repositories until further notice.
   1. New features, bug fixes, and security updates will only be available
      through Swift Package Manager releases.
   1. Contributors won't invest resources into investigating or resolving issues
      that are specific to CocoaPods integration.

## Recommended Migration Path

We recommend migrating to Swift Package Manager as soon as practical.

Swift Package Manager is fully supported and will be the only distribution
mechanism moving forward.

Migration from CocoaPods to SPM is simple; there’re guides and documentation out
there in the community that can be used.

## Feedback

We understand that some organizations still rely on CocoaPods-based workflows.

Before finalizing the “Recommended migration period”, we would like to gather
feedback from the community regarding migration challenges, tooling gaps, and
operational concerns.

Please share your feedback via
[GitHub Issues](https://github.com/open-telemetry/opentelemetry-swift/issues/new),
the CNCF Slack
[#otel-swift](https://cloud-native.slack.com/archives/C01NCHR19SB) or join us in
our weekly
[SIG Meetings](https://groups.google.com/a/opentelemetry.io/g/calendar-swift).
