---
title: Security in OpenTelemetry for Legacy Traditional Environments
linkTitle: Security Legacy Environments
date: 2026-04-22
author: >-
  [Lukasz Ciukaj (Cisco Splunk)](https://github.com/luke6Lh43)
sig: SIG Security
cSpell:ignore: anonymization CCPA Ciukaj Lukasz myuser
---

As the manufacturing sector embraces digital transformation, OpenTelemetry is
emerging as a key observability solution, even in environments with legacy
systems and industrial controls. However, these environments present unique
security challenges: older operating systems, long equipment life cycles, and
often, a lack of modern network segmentation. This article provides high-level
security guidance for using OpenTelemetry in traditional environments, mapping
core security concepts to practical steps and including configuration examples
inspired by OpenTelemetry's own documentation.

---

## Understanding the security risks

Legacy manufacturing environments often deal with sensitive operational data,
authentication credentials, and sometimes personal information. The risks from
insecure telemetry collection include accidental data leaks, unauthorized
access, and the possibility of introducing new vectors for denial-of-service
attacks.

With strict regulatory and operational requirements, manufacturing organizations
must ensure that their observability solutions, such as OpenTelemetry, are
deployed with security in mind. Unlike cloud native environments, legacy systems
may lack built-in encryption, modern authentication mechanisms, or easy-to-apply
security patches. This makes it all the more important to approach OpenTelemetry
deployments with a security-first mindset.

Key risks to consider include:

- **Data leakage**: Telemetry data may inadvertently capture sensitive
  operational details, proprietary process information, or personal data.
- **Unauthorized access**: Without proper authentication and network controls,
  telemetry endpoints may be exposed to unauthorized users or systems.
- **Data tampering**: If telemetry data is altered in transit, it can undermine
  incident response and operational decision-making.
- **Denial of service**: Unprotected Collector endpoints may be vulnerable to
  resource exhaustion attacks.
- **Compliance violations**: Failure to properly handle sensitive data can
  result in violations of privacy regulations and industry standards.

---

## Monitoring vulnerabilities and incident response

The OpenTelemetry community maintains a regularly updated list of
[Common Vulnerabilities and Exposures (CVEs)](/docs/security/cve/) across all
repositories. These advisories cover vulnerabilities in collectors, exporters,
instrumentation libraries, and other components. In legacy environments, where
patching and upgrades may be slower or more complex, monitoring these advisories
is critical.

Establish a routine process for reviewing CVEs and assessing their impact on
your deployment. If a vulnerability is discovered, follow the OpenTelemetry
community's incident response guidelines, which recommend reporting through
GitHub's "Report a vulnerability" feature or contacting the Security SIG
directly.

Key steps for incident response readiness:

- Subscribe to OpenTelemetry security advisories and CVE feeds.
- Integrate OpenTelemetry vulnerability monitoring into your existing security
  operations workflows.
- Establish internal escalation procedures for OpenTelemetry-related security
  incidents.
- Document interim mitigations (such as disabling affected components or
  tightening network controls) for situations where immediate patching is not
  possible.

---

## Securing the OpenTelemetry Collector

The Collector is the heart of most OpenTelemetry deployments, responsible for
receiving, processing, and exporting telemetry data. Its configuration and
hosting deserve special attention, especially in traditional environments where
network boundaries may be less well-defined.

### Secure configuration storage

OpenTelemetry Collector configuration files often contain sensitive data such as
API tokens, TLS certificates, and private keys. In manufacturing environments,
these files may reside on systems with limited access controls.

Best practices:

- Store configuration files on encrypted filesystems or in dedicated secret
  stores.
- Use environment variables for sensitive values, leveraging the Collector's
  built-in support for environment variable expansion.
- Restrict file system permissions so that only the Collector process and
  authorized administrators can read the configuration.

### Enable encryption and authentication

All communications between the OpenTelemetry Collector, its data sources (such
as applications, sensors, or industrial control systems), and its backends
should be encrypted using TLS. In addition, authentication should be required on
all receiver and exporter endpoints.

The following example demonstrates how to enable TLS and basic authentication
for an OTLP gRPC receiver:

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 127.0.0.1:4317
            tls_settings:
              cert_file: /etc/otel/certs/server.crt
              key_file: /etc/otel/certs/server.key

    extensions:
      basicauth/server:
        client_auth: true
        username: myuser
        password: ${BASIC_AUTH_PASSWORD}

    service:
      extensions: [basicauth/server]
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [otlp]

This configuration binds the receiver to localhost, enables TLS using
certificate files, and requires basic authentication with a password sourced
from an environment variable.

### Minimize attack surface

Every enabled component in the Collector represents a potential attack vector.
In legacy environments, where the consequences of a breach may be especially
severe, it is important to minimize the number of active components.

Best practices:

- Only enable receivers, exporters, and processors that are necessary for your
  observability goals.
- Use the [Collector Builder](/docs/collector/extend/ocb/) to create a custom
  Collector distribution containing only the components you need.
- Regularly review your configuration and remove any components that are no
  longer in use.

### Principle of least privilege

The Collector should run with the minimum permissions necessary to perform its
function. Avoid running the Collector as a root or administrator user unless
absolutely required (for example, to access system-level logs stored in a
protected location).

In orchestrated environments such as Kubernetes or Docker, use role-based access
control (RBAC) to limit the Collector's permissions. Grant only the specific
volume mounts, network access, and API permissions that the Collector needs.

---

## Handling sensitive data: Data minimization and scrubbing

OpenTelemetry collects telemetry data, but it cannot automatically determine
what data is sensitive in your specific context. As the implementer, you are
responsible for reviewing what is collected and ensuring that sensitive
information is handled appropriately.

### Data minimization

Follow the principle of data minimization: only collect telemetry data that
serves a clear observability purpose. In manufacturing environments, this means
carefully evaluating whether operational details, user identifiers, credentials,
or proprietary process information need to be included in your telemetry.

Consider:

- Whether aggregated or anonymized data could serve the same monitoring purpose.
- Whether any instrumentation libraries you use might inadvertently collect
  sensitive attributes.
- Establishing a regular review process to ensure that collected attributes
  remain necessary and appropriate.

### Scrubbing sensitive data with processors

The OpenTelemetry Collector provides several processors that can help manage
sensitive data before it leaves your environment. These processors allow you to
hash, delete, truncate, or redact sensitive fields.

#### Hashing and deleting sensitive attributes

The attribute processor can hash or delete specific span, log, or metric
attributes. For example, the following configuration hashes the `user.email`
attribute and deletes `user.full_name` from all spans before exporting:

    processors:
      attributes/scrub:
        actions:
          - key: user.email
            action: hash
          - key: user.full_name
            action: delete

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [attributes/scrub]
          exporters: [otlp]

Keep in mind that hashing alone may not provide sufficient anonymization if the
input space is small or predictable (for example, numeric user IDs). Consider
combining hashing with other techniques for stronger protection.

#### Replacing user IDs with hashed values

The transform processor can be used to replace a `user.id` attribute with a
hashed `user.hash`, removing the original identifier:

    processors:
      transform/hash_user:
        trace_statements:
          - context: span
            statements:
              - set(attributes["user.hash"], SHA256(attributes["user.id"]))
              - delete_key(attributes, "user.id")

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [transform/hash_user]
          exporters: [otlp]

#### Truncating IP addresses

In many manufacturing environments, IP addresses may be considered sensitive or
subject to privacy regulations. The transform processor can truncate the last
octet of IPv4 addresses to reduce identifiability:

    processors:
      transform/truncate_ip:
        trace_statements:
          - context: span
            statements:
              - replace_pattern(attributes["client.address"], "\\.\\d+$", ".0")

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [transform/truncate_ip]
          exporters: [otlp]

This approach can also be applied to other data types, such as dates (keeping
only the year or month) or email addresses (keeping only the domain).

#### Redacting sensitive attributes

The redaction processor deletes span, log, and metric datapoint attributes that
do not match a list of allowed attributes. This is useful when you want to
ensure that only explicitly approved data leaves your environment:

    processors:
      redaction/strict:
        allow_all_keys: false
        allowed_keys:
          - description
          - group
          - id
          - name
        ignored_keys:
          - safe_attribute

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [redaction/strict]
          exporters: [otlp]

With this configuration, any attribute not on the allowed list is removed before
export, providing a strong safeguard against unintentional data exposure.

---

## Protecting against Denial of Service (DoS) and Resource Exhaustion

In traditional environments, Collectors may be exposed to broader network
segments than intended, or may receive unexpectedly high volumes of telemetry
from legacy systems. Protecting against resource exhaustion is essential for
maintaining both Collector stability and the reliability of your observability
data.

### Bind endpoints to specific addresses

Avoid binding Collector endpoints to `0.0.0.0`, which exposes them to all
network interfaces. Instead, bind to `localhost` or a specific internal IP
address:

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 127.0.0.1:4317

In environments with nonstandard networking (such as Docker or Kubernetes), use
the appropriate hostname or Pod IP as described in the OpenTelemetry
documentation.

### Limit queue size and enable compression

Configure exporters with sensible queue size limits and enable compression to
reduce memory usage and network load:

    exporters:
      otlp:
        endpoint: <ENDPOINT>
        sending_queue:
          queue_size: 800
        compression: gzip

### Filter unnecessary telemetry

Use the filter processor to drop telemetry that is not needed for your
observability goals. This reduces load on both the Collector and the backend:

    processors:
      filter/only_http:
        error_mode: ignore
        traces:
          span:
            - attributes["http.request.method"] == nil

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [filter/only_http]
          exporters: [otlp]

This configuration drops any span that does not include an HTTP request method,
filtering out telemetry that may not be relevant to your monitoring use case.

### Monitor collector health

Use the Collector's internal telemetry to monitor its own performance. Collect
and alert on metrics such as CPU usage, memory consumption, and throughput. If
resource limits are reached, consider horizontally scaling the Collector by
deploying multiple instances behind a load balancer.

---

## Compliance and ongoing governance

Manufacturing environments are subject to a wide range of regulatory
requirements, from privacy laws such as GDPR and CCPA to industry-specific
standards. Ensuring compliance requires ongoing attention to how telemetry data
is collected, processed, stored, and exported.

Key governance practices:

- **Review collected attributes regularly** to ensure that no unnecessary or
  sensitive data is being captured.
- **Document your data flows**, including what data is collected, how it is
  processed, and where it is sent.
- **Manage data retention** appropriately, deleting telemetry data that is no
  longer needed.
- **Obtain necessary consents** for data collection, especially where personal
  information may be involved.
- **Stay current with OpenTelemetry CVE announcements** and update your
  deployment as needed.
- **Periodically audit your Collector configuration** and hosting environment
  against current best practices.

---

## Conclusion

OpenTelemetry brings powerful observability to legacy and manufacturing
environments, but security must be a core consideration throughout deployment.
By following best practices for Collector configuration—including encryption,
authentication, and least privilege—handling sensitive data with purpose-built
processors, and staying vigilant with vulnerability management and compliance,
you can reap the benefits of modern observability while minimizing risk—even in
the most traditional settings.

Security is not a one-time exercise. Regularly revisit your OpenTelemetry
deployment, monitor for new threats, and adapt your configuration to meet
evolving requirements. With the right approach, OpenTelemetry can be a safe and
effective foundation for observability in any environment.

---

## Further reading and resources

- [OpenTelemetry Security Documentation](/docs/security/)
- [OpenTelemetry CVE List](/docs/security/cve/)
- [Collector Configuration Best Practices](/docs/security/config-best-practices/)
- [Collector Hosting Best Practices](/docs/security/hosting-best-practices/)
- [Handling Sensitive Data](/docs/security/handling-sensitive-data/)
- [Community Incident Response Guidelines](/docs/security/security-response/)
