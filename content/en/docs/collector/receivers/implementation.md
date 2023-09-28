---
title: Implementation
weight: 40
---

From here, the implementation will differ depending on if you need a metrics or tracing receiver.


### `config.go`
Before you start, you should know that there exist common utilities for configuration which you may want to reuse.
both scraping and serving receivers have their own reccomended utlities, which are scraperhelper and httphelper

### `factory.go`

If you wish to include this upstream, please delete the explanatory comments

```go
package foobar // replace "foobar" with whatever your receiver is named
// Always include this at the top of your module, see 
// https://github.com/open-telemetry/opentelemetry-collector/tree/main/internal/sharedcomponent
var receivers = sharedcomponent.NewSharedComponents()

// this will be called regardless.  Remove any signal consumers your receiver does not need.
// This is the otel instantiation entrypoint into your new component, and
// will be later called with foobar.NewFactory() in the component registry
func NewFactory() receiver.Factory {
  return receiver.NewFactory(
    metadata.Type,
    createDefaultConfig,
    receiver.WithTraces(
		        createTracesReceiver,
				    metadata.TracesStability,
				).WithMetrics(
					  createMetricsReceiver,
					  metadata.MetricsStability,
        ).WithLogs(
			      createLogsReceiver,
				    metadata.LogsStability,
			  )
    )
}

func createLogsReceiver(
  _ context.Context,
  set receiver.CreateSettings,
  cfg component.Config,
  nextConsumer consumer.Metrics,
) (receiver.Traces, error) {
  cfg = cfg.(*Config) // cast the general interface of config to our particular type
  r, err := newReceiver(_, set, cfg)
  if err = r.Unwrap().(*fooBarReceiver).registerLogsConsumer(nextConsumer); err != nil {
    return nil, err
  }
  return r
}

func createMetricsReceiver(
  _ context.Context,
  set receiver.CreateSettings,
  cfg component.Config,
  nextConsumer consumer.Metrics,
) (receiver.Traces, error) {
  cfg = cfg.(*Config) // cast the general interface of config to our particular type
  r, err := newReceiver(_, set, cfg)
  if err = r.Unwrap().(*fooBarReceiver).registerMetricsConsumer(nextConsumer); err != nil {
    return nil, err
  }
  return r
}

func createTracesReceiver(
  _ context.Context,
  set receiver.CreateSettings,
  cfg component.Config,
  nextConsumer consumer.Traces,
) (receiver.Traces, error) {
  cfg = cfg.(*Config) // cast the general interface of config to our particular type
  r, err := newReceiver(_, set, cfg)
  if err = r.Unwrap().(*fooBarReceiver).registerTraceConsumer(nextConsumer); err != nil {
    return nil, err
  }
  return r
}

func newReceiver(_ context.Context, set receiver.CreateSettings, cfg component.Config) (component.Component, error) {
  rcv := recievers.getOrAdd(cfg, func() { // func will be called iff it doesn't exist
    rCfg := cfg.(*Config)
    obsrecv, err := obsreport.NewReceiver(
      obsreport.ReceiverSettings{
        ReceiverID:             set.ID,
        Transport:              transport,
        ReceiverCreateSettings: set,
      },
    )
    return &fooBarReceiver{}
  })
  return rcv
}

func createDefaultConfig() component.Config {
  return &Config{
    // default configuration here
    // often used in ex tests
  }
}
```
