---
title: Opentelemetry PHP Release Candidate
linkTitle: PHP Release Candidate
date: 2023-09-13
author: '[Brett McBride](https://github.com/brettmc/) (Deakin University)'
cSpell:ignore: McBride
---

The OpenTelemetry PHP team is pleased to announce that the opentelemetry-php
library has progressed to Release Candidate stability. This release is the
culmination of years of work from the OpenTelemetry PHP team. Thank you to all
of the contributors, testers, and integrators that made this release happen. We
most certainly couldn’t have made this release without the help of the community
at large.

This is the first release candidate we are publishing to garner further input
from the community. This release offers support for tracing, metrics, and logs
for PHP applications, as well as auto-instrumentation via a
[PECL extension](https://pecl.php.net/package/opentelemetry). We will continue to
refine the library as we receive bug reports, as well as moving towards a general
availability release.

## What happens next?

We would love to see people testing the code against production-like workloads.
Once we have confidence at scale with positive feedback from the community, we
will move to general availability with a 1.0.0 release.

We are also looking to promote our Contrib packages to RC and then GA, based on
feedback from the community.

## How can you help?

If you are new to OpenTelemetry for PHP, the best place to start is with the
[getting started documentation](https://opentelemetry.io/docs/instrumentation/php/getting-started/).

We are looking for developers to test this instrumentation in their PHP
codebases. We are happy to triage any issues that might come up - please feel
free to open an issue in our repository’s
[GitHub issues](https://github.com/open-telemetry/opentelemetry-php/issues).
Pull requests are also always welcome in any of our repositories:

- [API/SDK repo](https://github.com/open-telemetry/opentelemetry-php)
- [Contrib repo](https://github.com/open-telemetry/opentelemetry-php-contrib)
- [Instrumentation Repo](https://github.com/open-telemetry/opentelemetry-php-instrumentation)

Thanks!

OpenTelemetry-php maintainers crew: Brett McBride (Deakin University), Przemek
Delewski (SumoLogic), and Bob Strecansky (Mailchimp)
