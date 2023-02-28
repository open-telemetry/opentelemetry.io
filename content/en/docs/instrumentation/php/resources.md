---
title: Resources
weight: 6
---

A [resource][] represents the entity producing telemetry as resource attributes.
For example, a process producing telemetry that is running in a container on
Kubernetes has a Pod name, a namespace, and possibly a deployment name. All
three of these attributes can be included in the resource.

In your observability backend, you can use resource information to better
investigate interesting behavior. For example, if your trace or metrics data
indicate latency in your system, you can narrow it down to a specific container,
pod, or Kubernetes deployment.

Below you will find some introductions on how to set up resource detection with
the PHP SDK.

## Setup

Follow the instructions in [Getting Started - PHP][], so that you have the files
`composer.json` and `GettingStarted.php`.

## Resource Detection

The PHP SDK detects resources from a variety of sources:

- environment (`OTEL_RESOURCE_ATTRIBUTES`, `OTEL_SERVICE_NAME`)
- host information
- host operating system
- current process
- runtime

Run the application with some values set to `OTEL_RESOURCE_ATTRIBUTES`, e.g. we
set the `host.name` to identify the [Host][]:

## Disabling resource detection

By default, all SDK resource detectors are used to detect as many resources as
possible.

You can use the environment variable `OTEL_PHP_RESOURCE_DETECTORS` to enable
only certain detectors:

- `env`
- `host`
- `os`
- `process`
- `process_runtime`
- `sdk`
- `sdk_provided`
- `all` - enable all resource detectors
- `none` - disable resource detection

## Adding resources with environment variables

If there is not an SDK detector for the resource you need, you can add arbitrary
resources via the `OTEL_RESOURCE_ATTRIBUTES` environment variable. This variable
takes a comma-separated list of key=value pairs, for example:

```shell
$ env OTEL_RESOURCE_ATTRIBUTES="service.name=my_service,service.namespace=demo,service.version=1.0,deployment.environment=development" example.php
```

## Adding resources in code

Custom resources can also be configured in your code. Here, the default
resources (detected as described above) are merged with custom resources. The
resources are then passed to the tracer provider, where they will be associated
with all generated spans.

```php
$resource = ResourceInfoFactory::merge(ResourceInfo::create(Attributes::create([
    ResourceAttributes::SERVICE_NAMESPACE => 'foo',
    ResourceAttributes::SERVICE_NAME => 'bar',
    ResourceAttributes::SERVICE_INSTANCE_ID => 1,
    ResourceAttributes::SERVICE_VERSION => '0.1',
    ResourceAttributes::DEPLOYMENT_ENVIRONMENT => 'development',
])), ResourceInfoFactory::defaultResource());

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        (new ConsoleSpanExporterFactory())->create()
    ),
    null,
    $resource
);
```
