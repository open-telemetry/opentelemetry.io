## Zipkin

### Backend Setup {#zipkin-setup}

{{% alert title=Note %}}

If you have Zipkin or a Zipkin-compatible backend already set up, you can skip
this section and setup the [Zipkin exporter dependencies](#zipkin-dependencies)
for your application.

{{% /alert %}}

You can run [Zipkin](https://zipkin.io/) on in a Docker container by executing
the following command:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
