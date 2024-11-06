---
title: Collector hosting best practices
linkTitle: Collector hosting
weight: 115
---

When setting up hosting for OpenTelemetry (OTel) Collector, consider these best
practices to better secure your hosting instance.

## Store data securely

Your Collector configuration file might contain sensitive data, including
authentication tokens or TLS certificates. See the best practices for
[securing your configuration](../config-best-practices/#create-secure-configurations).

If you are storing telemetry for processing, make sure to restrict access to
those directories to prevent tampering with raw data.

## Keep your secrets safe

Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
are credentials that hold confidential data. They authenticate and authorize
privileged access. If you're using a Kubernetes deployment for your Collector,
make sure to follow these
[recommended practices](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)
to improve security for your clusters.

## Apply the principle of least privilege

The Collector should not require privileged access, except where the data it's
collecting is in a privileged location. For example, in a Kubernetes deployment,
system logs, application logs, and container runtime logs are often stored in a
node volume that requires special permission to access. If your Collector is
running as a daemonset on the node, make sure to grant only the specific volume
mount permissions it needs to access these logs and no more. You can configure
privilege access with role-based access control (RBAC). See
[RBAC good practices](https://kubernetes.io/docs/concepts/security/rbac-good-practices/)
for more information.

## Control access to server-like components

Some Collector components such as receivers and exporters can function like
servers. To limit access to authorized users, you should:

- Enable authentication by using bearer token authentication extensions and
  basic authentication extensions, for example.
- Restrict the IPs that your Collector runs on.

## Safeguard resource utilization

Use the Collector's own
[internal telemetry](/docs/collector/internal-telemetry/) to monitor its
performance. Collect metrics from the Collector about its CPU, memory, and
throughput usage and set alerts for resource exhaustion.

If resource limits are reached, consider horizontally
[scaling the Collector](/docs/collector/scaling/) by deploying multiple
instances in a load-balanced configuration. Scaling your Collector distributes
the resource demands and prevents bottlenecks.

Once you secure resource utilization in your deployment, make sure your
Collector instance also uses
[safeguards in its configuration](../config-best-practices/#safeguard-resource-utilization).
