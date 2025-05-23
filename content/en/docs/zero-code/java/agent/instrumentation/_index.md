---
title: Instrumentation configuration
linkTitle: Instrumentation config
weight: 100
cSpell:ignore: enduser hset serverlessapis
---

This page describes common settings that apply to multiple instrumentations at
once.

## Peer service name

The
[peer service name](/docs/specs/semconv/general/attributes/#general-remote-service-attributes)
is the name of a remote service to which a connection is made. It corresponds to
`service.name` in the [resource](/docs/specs/semconv/resource/#service) for the
local service.

{{% config_option name="otel.instrumentation.common.peer-service-mapping" %}}

Used to specify a mapping from host names or IP addresses to peer services, as a
comma-separated list of `<host_or_ip>=<user_assigned_name>` pairs. The peer
service is added as an attribute to a span whose host or IP address match the
mapping.

For example, if set to the following:

```text
1.2.3.4=cats-service,dogs-abcdef123.serverlessapis.com=dogs-api
```

Then, requests to `1.2.3.4` will have a `peer.service` attribute of
`cats-service` and requests to `dogs-abcdef123.serverlessapis.com` will have an
attribute of `dogs-api`.

Since Java agent version `1.31.0`, it is possible to provide a port and a path
to define a `peer.service`.

For example, if set to the following:

```text
1.2.3.4:443=cats-service,dogs-abcdef123.serverlessapis.com:80/api=dogs-api
```

Then, requests to `1.2.3.4` will have no override for `peer.service` attribute,
while `1.2.3.4:443` will have `peer.service` of `cats-service` and requests to
`dogs-abcdef123.serverlessapis.com:80/api/v1` will have an attribute of
`dogs-api`.

{{% /config_option %}}

## DB statement sanitization

The agent sanitizes all database queries/statements before setting the
`db.statement` semantic attribute. All values (strings, numbers) in the query
string are replaced with a question mark (`?`).

Note: JDBC bind parameters are not captured in `db.statement`. See
[the corresponding issue](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/7413)
if you are looking to capture bind parameters.

Examples:

- SQL query `SELECT a from b where password="secret"` will appear as
  `SELECT a from b where password=?` in the exported span;
- Redis command `HSET map password "secret"` will appear as
  `HSET map password ?` in the exported span.

This behavior is turned on by default for all database instrumentations. Use the
following property to disable it:

{{% config_option
name="otel.instrumentation.common.db-statement-sanitizer.enabled"
default=true
%}} Enables the DB statement sanitization. {{% /config_option %}}

## Capturing consumer message receive telemetry in messaging instrumentations

You can configure the agent to capture the consumer message receive telemetry in
messaging instrumentation. Use the following property to enable it:

{{% config_option
name="otel.instrumentation.messaging.experimental.receive-telemetry.enabled"
default=false
%}} Enables the consumer message receive telemetry. {{% /config_option %}}

Note that this will cause the consumer side to start a new trace, with only a
span link connecting it to the producer trace.

> **Note**: The property/environment variable names listed in the table are
> still experimental, and thus are subject to change.

## Capturing enduser attributes

You can configure the agent to capture
[general identity attributes](/docs/specs/semconv/registry/attributes/enduser/)
(`enduser.id`, `enduser.role`, `enduser.scope`) from instrumentation libraries
like
[JavaEE/JakartaEE Servlet](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/servlet)
and
[Spring Security](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-security-config-6.0).

> **Note**: Given the sensitive nature of the data involved, this feature is
> turned off by default while allowing selective activation for particular
> attributes. You must carefully evaluate each attribute's privacy implications
> before enabling the collection of the data.

{{% config_option
name="otel.instrumentation.common.enduser.id.enabled"
default=false
%}} Determines whether to capture `enduser.id` semantic attribute.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.role.enabled"
default=false
%}} Determines whether to capture `enduser.role` semantic attribute.
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.scope.enabled"
default=false
%}} Determines whether to capture `enduser.scope` semantic attribute.
{{% /config_option %}}

### Spring Security

For users of Spring Security who use custom
[granted authority prefixes](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities),
you can use the following properties to strip those prefixes from the
`enduser.*` attribute values to better represent the actual role and scope
names:

{{% config_option
name="otel.instrumentation.spring-security.enduser.role.granted-authority-prefix"
default=ROLE_
%}} Prefix of granted authorities identifying roles to capture in the
`enduser.role` semantic attribute. {{% /config_option %}}

{{% config_option
name="otel.instrumentation.spring-security.enduser.scope.granted-authority-prefix"
default=SCOPE_
%}} Prefix of granted authorities identifying scopes to capture in the
`enduser.scopes` semantic attribute. {{% /config_option %}}
