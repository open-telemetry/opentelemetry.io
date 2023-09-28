---
title: Configuration
weight: 3
---
Currently, this is defined in a `config.go` file which lives in your `receiver/foobar` directory

`config.go` will read from the provided `otel-config.yaml`.  [Receiver configuration](https://github.com/open-telemetry/opentelemetry-collector/blob/589488839f582632f53d84526207e733475ccc21/otelcol/config.go#L22) accepts any valid yaml document, and the parsing is defined via the [otel collector config interface](https://github.com/open-telemetry/opentelemetry-collector/blob/main/component/config.go).  Maintainers are encouraged to implement their own `ValidateConfig` function specific to their component.

For receivers specifically, there exist community and [core](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config) contributed standards for common options.

While you are encouraged to check out the latest released version of said collector provided offerings, at the time of writing these are the available common utilities.

For scraping receivers, [`scraperhelper`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/scraperhelper) is [all but](https://github.com/search?q=repo%3Aopen-telemetry%2Fopentelemetry-collector-contrib+scraperhelper.NewScraper&type=code) a requirement.

Note that it is possible to use a non-local provider via [`confmap`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/confmap)

For all receivers, below exist at time of writing this doc.
- [`configcompression`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config/configcompression) defined some common compression options
- [`httpconfig`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config/confighttp) defines some common http configuration options
- [`configtls`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config/configtls)
- [`configrpc`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config/configgrpc) defines some common rpc configuration options
- [`configauth`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config/configauth) defines some common authentication/authorization configuration options
- [`configopaque`](https://github.com/open-telemetry/opentelemetry-collector/tree/589488839f582632f53d84526207e733475ccc21/config/configopaque) allows for opaque strings (credentials, secrets, etc) to be loaded



*talk about the various configuration you may need*
*talk about the commands this is used in*

