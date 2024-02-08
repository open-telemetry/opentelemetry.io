## Zipkin

### Backend Setup {#zipkin-setup}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you have Zipkin or a Zipkin-compatible backend already set up, you can skip
this section and setup the [Zipkin exporter dependencies](#zipkin-dependencies)
for your application.

</div>

You can run [Zipkin](https://zipkin.io/) on in a Docker container by executing
the following command:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
