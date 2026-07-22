---
title: Performance Overhead
description: >-
  Performance benchmark results and guidance for minimizing overhead when using
  OpenTelemetry PHP Distro.
weight: 3
cSpell:ignore: aimeos php-fpm nginx protobuf colocating
---

This page outlines performance implications of using OpenTelemetry PHP Distro
and provides guidance for minimizing overhead.

Like any instrumentation agent, the distro runs in application processes and
adds runtime cost. The exact impact depends on architecture, configuration,
deployment environment, and workload.

The benchmark below compares multiple PHP observability variants in a local
Docker setup (`PHP-FPM 8.2 + NGINX`). In scenarios with a collector, the
collector also runs locally and shares host CPU resources.

## Benchmark setup

- Application: Laravel/Aimeos on PHP-FPM 8.2
- Environment: local Docker with NGINX
- Telemetry destinations: OTLP-compatible endpoints

## Results

| Variant                                                        | Avg. time per request \[ms\] | Overhead \[ms\] |
| -------------------------------------------------------------- | ---------------------------: | --------------: |
| No agent                                                       |                        17.36 |            0.00 |
| Vendor-specific APM agent                                      |                        20.63 |            3.27 |
| OpenTelemetry PHP Distro                                       |                        23.08 |            5.71 |
| OpenTelemetry PHP Distro + local collector                     |                        24.37 |            7.01 |
| Vanilla OpenTelemetry PHP + protobuf (C extension) + collector |                        25.76 |            8.40 |
| Vanilla OpenTelemetry PHP pure-PHP protobuf export + collector |                        49.02 |           31.66 |
| Vanilla OpenTelemetry PHP pure-PHP protobuf export             |                      2158.58 |         2141.22 |

## Key findings

- OpenTelemetry PHP Distro significantly reduces overhead compared to vanilla
  OpenTelemetry PHP with pure-PHP protobuf export.
- Local collector placement can increase overhead when it contends for CPU with
  PHP workers.
- Pure-PHP protobuf export in vanilla OpenTelemetry PHP introduces very high
  overhead under this benchmark.

## Recommendations

- Measure overhead in your own workload and infrastructure.
- Prefer OTLP HTTP/protobuf with asynchronous transport.
- Avoid colocating heavy collector workloads with latency-sensitive application
  workers.
- Tune sampling and exporter settings to meet your SLOs.
