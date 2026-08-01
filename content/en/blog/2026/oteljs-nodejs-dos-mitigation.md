---
title: OpenTelemetry JS Statement on Node.js DOS Mitigation
linkTitle: OTel JS DOS Mitigation
date: 2026-01-15
author: >
  [Jamie Danielson](https://github.com/JamieDanielson) (Honeycomb)
sig: OpenTelemetry JS
cSpell:ignore: Danielson
---

You may have seen a recent Node.js security advisory and related coverage
discussing a potential denial-of-service issue involving `async_hooks`.
OpenTelemetry (and other APM tools) were mentioned because we rely on
`AsyncLocalStorage` for context propagation.

To be clear: **this is not a bug or vulnerability in OpenTelemetry**. The issue
ultimately lies in applications and frameworks that rely on unspecified stack
space exhaustion behavior for availability. In Node.js versions before 24.x,
`AsyncLocalStorage` is implemented on top of `async_hooks`, which - when
combined with this unsafe assumption — made the edge case easier to reproduce.

The Node.js team has fixed this behavior in **Node.js 20.20.0 and newer** to
make the edge case harder to reproduce. This fix is **not being backported to
Node.js 18**, so the recommended mitigation is to upgrade to Node.js 20+ if you
haven’t already. Review
[this table](https://nodejs.org/en/blog/vulnerability/january-2026-dos-mitigation-async-hooks#affected-versions)
for specific affected versions and patches.

There’s nothing OpenTelemetry-specific you need to change — following the
Node.js upgrade guidance is sufficient. As always, we recommend running on
supported and patched Node.js versions.

Thanks to the Node.js security team for the fix, and to the community for
helping share accurate information. This was included in a security release for
visibility, but is not classified as a security issue by V8.

For more details, see the
[Node.js security bulletin](https://nodejs.org/en/blog/vulnerability/january-2026-dos-mitigation-async-hooks).
