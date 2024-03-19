---
title: Resources
weight: 70
---

{{% docs/languages/resources-intro %}}

## Resource Detection

The
[opentelemetry-resource-detectors](https://rubygems.org/gems/opentelemetry-resource_detectors)
gem provides a means of retrieving a resource for supported environments
following the [resource semantic conventions](/docs/specs/semconv/resource/).

## Usage

Install the gem using:

```ruby
gem install opentelemetry-sdk
gem install opentelemetry-resource_detectors
```

Or, if you use Bundler, include the following in your `Gemfile`:

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/resource/detectors'

# For a specific platform
OpenTelemetry::SDK.configure do |c|
  c.resource = OpenTelemetry::Resource::Detectors::GoogleCloudPlatform.detect
end

# Or if you would like for it to run all detectors available
OpenTelemetry::SDK.configure do |c|
  c.resource = OpenTelemetry::Resource::Detectors::AutoDetector.detect
end
```
