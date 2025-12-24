---
title: Overview
weight: 1
description: >-
  Use OpenTelemetry on end-user controlled apps running on devices like mobile
  phones, desktop computers, and retail kiosks.
redirects: [{ from: /docs/platforms/android/*, to: ':splat' }] # cSpell:disable-line
---

Client-side applications present unique challenges for observability compared to
server-side workloads. These apps run on devices you don't control, with varying
network conditions, hardware capabilities, and user behaviors.

## Why client-side observability matters

Traditional server-side monitoring gives you visibility into your backend
systems, but misses the complete picture of user experience. Client-side
observability helps you:

- **Understand real user experience**: See actual load times, frame rates, and
  responsiveness as users experience them.
- **Debug issues in context**: Correlate errors with device characteristics,
  network conditions, and user actions.
- **Track end-to-end transactions**: Connect client-side operations with backend
  traces for complete distributed tracing.
- **Monitor app health at scale**: Aggregate telemetry across your user base to
  identify patterns and trends.

## Key differences from server-side instrumentation

When instrumenting client apps, consider these factors:

### Resource constraints

Mobile devices and browsers have limited CPU, memory, and battery. Telemetry
collection must be efficient and avoid impacting app performance.

### Network variability

Users may have slow, intermittent, or no connectivity. Implement offline
buffering and batch exports to handle network unreliability.

### Session management

Track user sessions to group related telemetry and understand user journeys
across multiple app launches.

### Privacy and consent

Client apps often collect data subject to privacy regulations. Plan for data
minimization, consent management, and attribute redaction.

### Data volume

With potentially millions of users, sampling strategies become essential to
manage costs while maintaining representative telemetry.

## Real User Monitoring (RUM)

OpenTelemetry supports Real User Monitoring (RUM) patterns that capture how real
users experience your application:

- **Page/screen load performance**: Time to first byte, first contentful paint,
  and full load completion.
- **User interactions**: Click events, navigation patterns, and form
  submissions.
- **Errors and crashes**: Unhandled exceptions, ANR events, and error rates.
- **Resource loading**: Network request timing, cache hit rates, and resource
  sizes.

## Platform-specific guides

Choose your platform for detailed instrumentation guidance:

- [Android](/docs/platforms/client-apps/android/): Native Android applications
  using Kotlin or Java.
- [iOS](/docs/platforms/client-apps/ios/): Native iOS and iPadOS applications
  using Swift or Objective-C.
- [Web](/docs/platforms/client-apps/web/): Browser-based applications using
  JavaScript or TypeScript.

## Connecting to your backend

Client telemetry becomes most valuable when connected to your backend traces.
Propagate trace context through your HTTP requests to maintain end-to-end
visibility:

```text
Client App → API Gateway → Backend Services → Database
    │              │              │              │
    └──────────────┴──────────────┴──────────────┘
                 Correlated Traces
```

Configure your client SDK to inject trace headers (`traceparent`,
`tracestate`) and ensure your backend services propagate this context through
their operations.

## Exporting telemetry

Client apps typically export telemetry through:

1. **Direct OTLP export**: Send telemetry directly to an OpenTelemetry Collector
   or observability backend.
2. **Proxy endpoints**: Route through your API to avoid CORS issues and add
   server-side processing.
3. **Batched exports**: Accumulate telemetry and send periodically to reduce
   network overhead.

Consider running an [OpenTelemetry Collector](/docs/collector/) to receive,
process, and route your client telemetry to multiple destinations.
