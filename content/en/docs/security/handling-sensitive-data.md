---
title: Handling sensitive data
description:
  Best practices and guidance for handling sensitive data in OpenTelemetry
weight: 100
cSpell:ignore: anonymization
---

When implementing OpenTelemetry, it's crucial to be mindful of sensitive data
handling. The collection of telemetry data always carries the risk of
inadvertently capturing sensitive or personal information that may be subject to
various privacy regulations and compliance requirements.

## Your responsibility

OpenTelemetry collects telemetry data, but it can't determine what data is
sensitive in your specific context on its own. As the implementer, you are
responsible for:

- Ensuring compliance with applicable privacy laws and regulations.
- Protecting sensitive information in your telemetry data.
- Obtaining necessary consents for data collection.
- Implementing appropriate data handling and storage practices.

Additionally, you are responsible for understanding and reviewing the telemetry
data emitted by any instrumentation libraries you use, as these libraries may
collect and expose sensitive information as well.

## Sensitive data considerations

What data is sensitive varies from situation to situation. Examples include:

- Personal Identifiable Information (PII)
- Authentication credentials
- Session tokens
- Financial information
- Health-related data
- User behavior data

## Data minimization

When collecting potentially sensitive data through telemetry, follow the
principle of
[data minimization](https://en.wikipedia.org/wiki/Data_minimization). This
means:

- Only collect data that serves an observability purpose.
- Avoid collecting personal information unless absolutely necessary.
- Consider whether aggregated or anonymized data could serve the same purpose.
- Regularly review collected attributes to ensure they remain necessary.

## Protecting sensitive data

As outlined in the previous section, the best way to prevent the collection of
sensitive data is not to collect data that might be sensitive. However, you
might want to collect this data under certain circumstances, or perhaps have no
full control over the data being collected, and need ways to scrape the data in
post processing. The following suggestions can help you with that.

The [OpenTelemetry Collector](/docs/collector) provides several processors that
can help manage sensitive data:

- [`attribute` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor):
  Remove or modify specific attributes.
- [`filter` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor):
  Filter out entire spans or metrics containing sensitive data.
- [`redaction` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor):
  Delete span, log, and metric datapoint attributes that don’t match a list of
  allowed attributes.
- [`transform` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor):
  Transform data using regular expressions.

### Deleting and hashing user information

The following configuration for the `attribute` processor is hashing the
`user.email` and deleting `user.full_name` from sensitive
[`user`](/docs/specs/semconv/registry/attributes/user/#user-hash) information:

```yaml
processors:
  attributes/example:
    actions:
      - key: user.email
        action: hash
      - key: user.full_name
        action: delete
```

### Replacing `user.id` with `user.hash`

The following configuration for the `transform` processor can be used to remove
the `user.id` and replace it with a `user.hash`:

```yaml
transform:
  trace_statements:
    - context: span
      statements:
        - set(attributes["user.hash"], SHA256(attributes["user.id"]))
        - delete_key(attributes, "user.id")
```

{{% alert title="Risk and limitations of hashing for anonymization" color="warning" %}}

Hashing the ID or name of a user may not provide the level of anonymization you
need, since hashes are reversible in practice if the input space is small and
predictable (e.g. numeric user IDs).

{{% /alert %}}

### Truncating IP addresses

As an alternative to hashing you can truncate data, or group it by a common
prefix or suffix. This for example applies to

- dates, where you keep only the year or the year and the month, but drop the
  day.
- email addresses, where you drop the local part and only keep the domain.
- IP addresses, where you drop drop the last octet of IPv4 or the last 80 bits
  of IPv6.

The following configuration for the `transform` processor drops the last octet
of a `client.address` attribute:

```yaml
transform:
  trace_statements:
    - context: span
      statements:
        - replace_pattern(attributes["client.address"], "\\.\\d+$", ".0")
```

### Delete attributes with redaction processor

Finally, an example for the `redaction` processor to delete certain attributes
can be found in the section
["Scrub sensitive data"](/docs/security/config-best-practices/#scrub-sensitive-data)
of the security best practices page for Collector configurations.
