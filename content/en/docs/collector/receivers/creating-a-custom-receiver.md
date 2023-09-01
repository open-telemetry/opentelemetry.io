---
title: Creating a custom receiver
---
# Requirements Gathering
### Push or pull

Decide if you want a `Scraper` or a `Listener` style receiver. Some current
examples of such for metric receivers are

- `Scraper`:
  [redisreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/redisreceiver)
- `Listener`:
  [statsd](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/statsdreceiver)

### Default metrics and attributes

It's common for any given product to have optional features. It's also common
for end users of your product to only care about a subset of your metrics. As it
costs more in both computational -- and often financial -- resources to track
metrics, thought should be given to what you're consuming and producing by
default. This is one reason why it's common practice to provide a configuration
which allows overrides of any default setting in `metadata.yaml`. We'll look
into this more when it comes time to code your `config.go` and `scraper.go` or
`listener.go`

While we encourage contributions from everyone, getting a receiver upstreamed
into `opentelemetry-collector-contrib` can have a wide effect on our customers.
As such, the standards for ongoing maintenance are non-negligible, and we
encourage you to find a sponsor for your code should you not have the capacity
to maintain it for yourself. We can and do remove "orphaned" receivers from the
`-contrib` distribution if no new maintainer volunteers.



# Testing

### Factories
[`scraperhelper`](https://github.com/open-telemetry/opentelemetry-collector/blob/6542100317582afe3f730471244ccc9a8c331908/receiver/scraperhelper/doc.go#L13)


### Boilerplate
Since we're doing a listener, our `metadata.yaml` will be fairly simple


```yaml
type: "myawesomereceiver"
status:
	
    # TODO they're completing this revisit once stable
```

### Near-standard conventions
- `factory.go`
- `client.go`

### Other common conventions
- `scraper.go` is used for scraping receivers
- `reporter.go` augments the receiver with obsreporter (basically, observability on the otel collector itself)
- `receiver.go` is used for
  - `trace_receiver.go` is a variant of this for some trace receivers
  - `metrics_receiver.go` is a variant of this for some metrics receivers
  - `logs.go` is used for some of the services which use logs


### Example of a Listener
We're going to create a simple prometheus write receiver.  As with any receiver, you should do your best to be a subject matter expert in the domain of your receiver's data model and networking.  I'm not, but here it goes!


## Using your receiver
### Caching/singletons
This is most commonly done in the case of a receiver which either supports more than one class (say, `trace`  and `metrics`), or in the case of a listening receiver which may be configured to listen on multiple endpoints.

Simply put, if you need this functionality, create a map in your receiver to implement a registry of your configuration (instance of `Config` from `config.go`) and access such via  `NewFactory` (in `factory.go`)

### Configuration
The  `configschema` command is super useful here.   `confighttp` is useful for listening servers, while `scraperhelper.ScraperControllerSettings` and `MetricsBuilderConfig` (as created by `mdatagen`) are useful for scraping receivers.
```go
scraperhelper.NewScraperControllerReceiver(
		&cfg.ScraperControllerSettings, params, nextConsumer,
		scraperhelper.AddScraper(scraper),
	)

```
## Testing your receiver
When to use build end-to-end/other suites?

To find many test suites,
```bash
❯ grep -Rh "opentelemetry\.io.*test" **/*.go  | sort | uniq
        "go.opentelemetry.io/collector/component/componenttest"
        "go.opentelemetry.io/collector/confmap/confmaptest"
        "go.opentelemetry.io/collector/consumer/consumertest"
        "go.opentelemetry.io/collector/exporter/exportertest"
        "go.opentelemetry.io/collector/extension/extensiontest"
        "go.opentelemetry.io/collector/receiver/receivertest"
```

Also, `grep -Rh "//go:build" **/*.go | sort | uniq`

`testcontainer.GenericContainerRequest`
#### `consumertest`
- `consumertest.MetricsSink`
- `consumertest.TracesSink`
- `consumertest.LogsSink`
#### `receivertest`
- `receivertest.NewNoopCreateSettings`



