---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
cSpell:ignore: Packagist
---

{{% docs/languages/libraries-intro "PHP" %}}

## Use instrumentation libraries

If a library doesn't include OpenTelemetry support, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
to generate telemetry data for a library or framework.

The OpenTelemetry PHP extension includes instrumentation libraries for many
common PHP frameworks. For example,
[the Laravel instrumentation](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/src/Instrumentation/Laravel)
automatically creates [spans](/docs/concepts/signals/traces/#spans) based on the
application activity.

## Setup

Each instrumentation library is a Composer package. To install it, run the
following command:

```sh
php composer.phar install {name-of-instrumentation}:{version-number}
```

Where `{name-of-instrumentation}` is the Packagist reference for the specific
instrumentation you want to use.

You can turn off any instrumentation by adding its identifier to the
`OTEL_PHP_DISABLED_INSTRUMENTATIONS` environment variable.

## Available instrumentation libraries

For a list of available instrumentations, see
[OpenTelemetry instrumentation packages](https://packagist.org/search/?query=open-telemetry&tags=instrumentation)
on Packagist.

## Next steps

After you've set up instrumentation libraries, you might want to add
[additional instrumentation](/docs/languages/php/instrumentation) to collect
custom telemetry data.

You might also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/php/exporters) to one or more
telemetry backends.

You can also check the
[automatic instrumentation for PHP](/docs/languages/php/automatic) for existing
library instrumentations.
