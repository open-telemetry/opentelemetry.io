---
title: Exporter configuration guide for Jaeger
draft: true
---

### Installing Jaeger locally 

Download the Jaeger components: https://www.jaegertracing.io/download/

Then get Jaeger up and running : (https://www.jaegertracing.io/docs/1.17/getting-started/)

You can then navigate to http://localhost:16686 to access the Jaeger UI.

### Exporting traces from your application to Jaeger

Import the Jaeger Exporter in your application
```typeScript
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
```
#### Declare the config options
```javascript
const  options = {
  serviceName: string, //example:'basic-service'
  tags: '', //optional
  host : string, //default:'localhost'
  port : number, //default: 6832
  maxPacketSize: number, // default: 65000
  // Force a flush on shutdown 
  forceFlush: boolean; // default: true
  //Time to wait for an onShutdown flush to finish before closing the sender
  flushTimeout: number, // default: 2000
  logger: {
    'error': {
      'message': string,
       'args': any,
     },
    'warn': {
      'message': string,
       'args': any,
     },
    'info': {
      'message': string,
       'args': any,
     },
    'debug': {
      'message': string,
       'args': any,
     },
   }, //default: {}
 };
```
#### Initialize the exporter
```javascript
exporter = new  JaegerExporter(options);
```
