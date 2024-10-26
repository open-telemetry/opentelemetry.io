# Component Types Help

This page provides an overview of the different types of components in the OpenTelemetry ecosystem, including examples and explanations.

## Component Types

### Application Integration
- **Description**: Components that help integrate OpenTelemetry into existing applications or services.
- **Example**: Libraries that enable the export of telemetry data in OpenTelemetry formats.

### Core
- **Description**: Fundamental components that are essential for OpenTelemetry's core functionality.
- **Example**: Core SDKs and libraries that provide basic tracing and metrics support.

### Exporter
- **Description**: Components that handle exporting telemetry data to various backends.
- **Example**: Exporters that send telemetry data to cloud platforms or monitoring services.

### Extension
- **Description**: Additional features that extend the capabilities of the OpenTelemetry Collector.
- **Example**: Plugins or modules that add specific functionalities to the Collector.

### Instrumentation
- **Description**: Libraries for specific programming languages that automatically capture telemetry data from applications.
- **Example**: Java Util Logging Instrumentation for capturing logs in Java applications.

### Log Bridge
- **Description**: Bridges between OpenTelemetry and logging systems, allowing logs to be processed with telemetry data.
- **Example**: Adapters that connect application logs with OpenTelemetry systems.

### Processor
- **Description**: Components that modify or enrich telemetry data before it's exported.
- **Example**: Processors that filter or add metadata to spans before exporting.

### Receiver
- **Description**: Components responsible for receiving telemetry data in various formats.
- **Example**: Receivers that support multiple telemetry protocols, like OTLP or Jaeger.

### Resource Detector
- **Description**: Automatically detects resource information, such as cloud environment metadata.
- **Example**: Components that identify and add resource tags to telemetry data.

### Utilities
- **Description**: Miscellaneous helper tools and libraries that aid in the management and processing of telemetry data.
- **Example**: Utility libraries for handling common data transformations or protocol conversions.

## Additional Resources
- For more information on licenses, visit [Open Source Licenses](https://opensource.org/licenses).
