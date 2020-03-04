# Exporter configuration guide for Jaeger

### Installing Jaeger locally

Download the Jaeger components: https://www.jaegertracing.io/download/(Downloading the docker images should be the better option, (macOS binary wasn’t available (link is broken) when this document was being written))
Commands for installing the docker image:
```docker
$ docker pull jaegertracing/all-in-one:1.17
```
Then get Jaeger up and running : (https://www.jaegertracing.io/docs/1.17/getting-started/)
If you are using Docker, simply use this command:
```docker
$ docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.17
```
This will start Jaeger. Go on to http://localhost:16686/ to access the Jaeger UI. 

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