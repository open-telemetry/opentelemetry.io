---
title: Resources
weight: 70
---

{{% docs/instrumentation/resources-intro %}}

## Resource Detection

The PHP SDK detects resources from a variety of sources, and by default will use
all available resource detectors:

- environment (`OTEL_RESOURCE_ATTRIBUTES`, `OTEL_SERVICE_NAME`)
- host information
- host operating system
- current process
- runtime

## Disabling resource detection

By default, all SDK resource detectors are used, but you can use the environment
variable `OTEL_PHP_RESOURCE_DETECTORS` to enable only certain detectors, or
completely disable them:

- `env`
- `host`
- `os`
- `process`
- `process_runtime`
- `sdk`
- `sdk_provided`
- `all` - enable all resource detectors
- `none` - disable resource detection

For example, to enable only the `env`, `host` and `sdk` detectors:

```shell
env OTEL_PHP_RESOURCE_DETECTORS=env,host,sdk \
php example.php
```

## Custom resource detectors

Resource detectors for generic platforms or vendor-specific environments can be
installed as composer packages.

For example, to install and enable the `container` resource detector:

```shell
composer require open-telemetry/detector-container
env OTEL_PHP_RESOURCE_DETECTORS=container \
php example.php
```

Note that installed detectors are automatically included in the default `all`
resource detector list.

## Adding resources with environment variables

If there is not an SDK detector for the resource you need, you can add arbitrary
resources via the `OTEL_RESOURCE_ATTRIBUTES` environment variable, which is
interpreted by the `env` detector. This variable takes a comma-separated list of
key=value pairs, for example:

```shell
env OTEL_RESOURCE_ATTRIBUTES="service.name=my_service,service.namespace=demo,service.version=1.0,deployment.environment=development" \
php example.php
```

## Adding resources in code

Custom resources can also be configured in your code. Here, the default
resources (detected as described above) are merged with custom resources. The
resources are then passed to the tracer provider, where they will be associated
with all generated spans.

```php
$resource = ResourceInfoFactory::defaultResource()->merge(ResourceInfo::create(Attributes::create([
    ResourceAttributes::SERVICE_NAMESPACE => 'foo',
    ResourceAttributes::SERVICE_NAME => 'bar',
    ResourceAttributes::SERVICE_INSTANCE_ID => 1,
    ResourceAttributes::SERVICE_VERSION => '0.1',
    ResourceAttributes::DEPLOYMENT_ENVIRONMENT => 'development',
])));

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        (new ConsoleSpanExporterFactory())->create()
    ),
    null,
    $resource
);
```
